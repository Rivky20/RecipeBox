import { Recipe } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface FoundRecipe {
  id: number;
  name: string;
  missingIngredients: string[];
}

export interface GeneratedRecipe {
  name: string;
  description: string;
  ingredients: string;
  instructions: string;
  shoppingList: string[];
}

export interface AIResult {
  found: FoundRecipe[];
  generated: GeneratedRecipe | null;
}

export async function findRecipesWithAI(userIngredients: string, allRecipes: Recipe[]): Promise<AIResult> {
  const textRecipes = allRecipes.filter(r => r.recipeType === 'Text' && r.ingredients).slice(0, 30);

  const recipesForAI = textRecipes.map(r => ({
    id: r.id,
    name: r.name,
    ingredients: r.ingredients?.slice(0, 300),
  }));

  const prompt = `
אתה עוזר בישול. המשתמש כתב: "${userIngredients}"

הקלט יכול להיות אחד משניים:
א) שם מתכון (לדוגמה: "פסטה בולונז", "עוגת שוקולד", "חומוס ביתי")
ב) רשימת חומרים (לדוגמה: "עוף, אורז, שום, עגבניות")

להלן רשימת מתכונים קיימים (JSON):
${JSON.stringify(recipesForAI, null, 2)}

המשימה שלך:

אם הקלט נראה כשם מתכון:
- חפש בין המתכונים הקיימים מתכון עם שם דומה או זהה
- אם מצאת → הוסף ל-"found" עם missingIngredients ריק
- אם לא מצאת → הכן מתכון מלא לאותה מנה ב-"generated" (כולל חומרים, הוראות הכנה ורשימת קנייה)

אם הקלט נראה כרשימת חומרים:
- בדוק כל מתכון קיים — אם ניתן להכין אותו עם רוב החומרים (מקסימום 2 חסרים) → הוסף ל-"found"
- אם אין מתאימים → צור מתכון חדש מהחומרים שניתנו ב-"generated"

החזר תמיד JSON בפורמט הזה בלבד, ללא טקסט נוסף:

{
  "found": [
    {
      "id": 1,
      "name": "שם המתכון",
      "missingIngredients": ["חומר חסר 1", "חומר חסר 2"]
    }
  ],
  "generated": {
    "name": "שם מתכון חדש",
    "description": "תיאור קצר",
    "ingredients": "רשימת חומרים מפורטת שורה אחר שורה",
    "instructions": "הוראות הכנה שורה אחר שורה",
    "shoppingList": ["פריט לקנייה 1", "פריט לקנייה 2"]
  }
}

אם נמצאו מתכונים מתאימים, החזר generated כ-null.
אם לא נמצא כלום, החזר found כמערך ריק וצור מתכון ב-generated.
`;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    console.error('Groq error body:', JSON.stringify(errBody, null, 2));
    throw new Error(`API error ${response.status}: ${errBody?.error?.message || 'unknown'}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function groqChat(prompt: string): Promise<string> {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

export async function improveText(text: string, type: 'ingredients' | 'instructions'): Promise<string> {
  const prompt = type === 'ingredients'
    ? `תקן ושפר את רשימת המרכיבים הבאה. הוסף כמויות אם חסרות, כל מרכיב בשורה נפרדת, ניסוח נקי ומסודר. החזר רק את הרשימה המתוקנת:\n${text}`
    : `תקן ושפר את הוראות ההכנה הבאות. מספר כל שלב, הבהר וארגן בצורה ברורה. החזר רק את ההוראות המתוקנות:\n${text}`;
  return groqChat(prompt);
}

export async function suggestNameAndDescription(ingredients: string): Promise<{ name: string; description: string }> {
  const prompt = `בהתבסס על המרכיבים הבאים, הצע שם יפה ותיאור קצר (משפט אחד) למתכון בעברית. החזר JSON בלבד ללא הסברים נוספים:\n{"name":"...","description":"..."}\n\nמרכיבים:\n${ingredients}`;
  const text = await groqChat(prompt);
  const clean = text.replace(/```json|```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid AI response');
  return JSON.parse(match[0]);
}

export async function convertUnits(ingredients: string, to: 'cups' | 'grams'): Promise<string> {
  const prompt = to === 'cups'
    ? `המר את כמויות הגרמים וק"ג לכוסות ומ"ל ברשימת המרכיבים הבאה. שמור על כל שאר הטקסט ללא שינוי. החזר רק את הרשימה המעודכנת:\n${ingredients}`
    : `המר את כמויות הכוסות ומ"ל לגרמים ברשימת המרכיבים הבאה. שמור על כל שאר הטקסט ללא שינוי. החזר רק את הרשימה המעודכנת:\n${ingredients}`;
  return groqChat(prompt);
}

export async function multiplyRecipe(
  ingredients: string,
  instructions: string,
  multiplier: number,
): Promise<{ ingredients: string; instructions: string }> {
  const prompt = `הכפל את כמויות המרכיבים ב-${multiplier}. עדכן גם הוראות הכנה אם יש בהן כמויות. החזר JSON בלבד:\n{"ingredients":"...","instructions":"..."}\n\nמרכיבים:\n${ingredients}\n\nהוראות:\n${instructions}`;
  const text = await groqChat(prompt);
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}
