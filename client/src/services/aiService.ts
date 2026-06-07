import { Recipe } from '../types';

const AI_URL = `${import.meta.env.VITE_API_URL}/api/ai/chat`;
const AI_MODEL = 'openai/gpt-4o-mini';

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
  const textRecipes = allRecipes.filter(r => r.recipeType === 'Text' && r.ingredients).slice(0, 50);

  const recipeList = textRecipes
    .map(r => `ID:${r.id} | שם:${r.name} | מרכיבים:${r.ingredients}`)
    .join('\n');

  const prompt = `המשתמש רוצה לבשל עם: "${userIngredients}"

הנה רשימת המתכונים הקיימים:
${recipeList}

משימה: מצא מתכונים שניתן להכין עם החומרים הנ"ל. מותר עד 2 חומרים חסרים. התייחס למשמעות — "מים" זה מים, לא כל מילה שמכילה את האות מ. התחשב בצורות דקדוקיות (עגבנייה/עגבניות), מילים נרדפות וחומרים שהם אותו דבר.

אם מצאת מתכונים מתאימים, החזר:
{
  "found": [{ "id": <מספר>, "name": "<שם>", "missingIngredients": ["<חסר1>", "<חסר2>"] }],
  "generated": null
}

אם לא מצאת מתכונים מתאימים, צור מתכון חדש בעברית עם החומרים הנ"ל והחזר:
{
  "found": [],
  "generated": {
    "name": "",
    "description": "",
    "ingredients": "",
    "instructions": "",
    "shoppingList": []
  }
}

החזר JSON בלבד, ללא טקסט נוסף.`;

  const response = await fetch(AI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const errorData = Array.isArray(errBody) ? errBody[0]?.error : errBody?.error;
    console.error('AI error body:', JSON.stringify(errBody, null, 2));
    if (response.status === 401 || response.status === 403)
      throw new Error('מפתח ה-API אינו תקין. בדקי את ההגדרות בשרת.');
    if (response.status === 429)
      throw new Error('שירות ה-AI עמוס כרגע, נסי שוב בעוד מספר שניות.');
    throw new Error(`API error ${response.status}: ${errorData?.message || 'unknown'}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('תגובה לא צפויה מה-AI, נסי שוב.');
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function aiChat(prompt: string): Promise<string> {
  const response = await fetch(AI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: AI_MODEL,
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
  return aiChat(prompt);
}

export async function suggestNameAndDescription(ingredients: string): Promise<{ name: string; description: string }> {
  const prompt = `בהתבסס על המרכיבים הבאים, הצע שם יפה ותיאור קצר (משפט אחד) למתכון בעברית. החזר JSON בלבד ללא הסברים נוספים:\n{"name":"...","description":"..."}\n\nמרכיבים:\n${ingredients}`;
  const text = await aiChat(prompt);
  const clean = text.replace(/```json|```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid AI response');
  return JSON.parse(match[0]);
}

export async function convertUnits(ingredients: string, to: 'cups' | 'grams'): Promise<string> {
  const prompt = to === 'cups'
    ? `המר את כמויות הגרמים וק"ג לכוסות ומ"ל ברשימת המרכיבים הבאה. שמור על כל שאר הטקסט ללא שינוי. החזר רק את הרשימה המעודכנת:\n${ingredients}`
    : `המר את כמויות הכוסות ומ"ל לגרמים ברשימת המרכיבים הבאה. שמור על כל שאר הטקסט ללא שינוי. החזר רק את הרשימה המעודכנת:\n${ingredients}`;
  return aiChat(prompt);
}

export async function multiplyRecipe(
  ingredients: string,
  instructions: string,
  multiplier: number,
): Promise<{ ingredients: string; instructions: string }> {
  const prompt = `הכפל את כמויות המרכיבים ב-${multiplier}. עדכן גם הוראות הכנה אם יש בהן כמויות. החזר JSON בלבד:\n{"ingredients":"...","instructions":"..."}\n\nמרכיבים:\n${ingredients}\n\nהוראות:\n${instructions}`;
  const text = await aiChat(prompt);
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}
