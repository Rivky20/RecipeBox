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
    .map(r => `ID:${r.id} | שם: ${r.name}\nמרכיבים: ${r.ingredients}`)
    .join('\n---\n');

  const prompt = `קלט מהמשתמש: "${userIngredients}"

שלב 1 — קבע סוג קלט:
האם הקלט הוא שם מתכון (כמו "עוגת שוקולד") או רשימת מרכיבים (כמו "ביצים, קמח, סוכר")?
רשום: "סוג: שם" או "סוג: מרכיבים"

שלב 2 — חפש ברשימת המתכונים:

אם סוג: שם —
  מצא מתכון ששמו תואם את הקלט, גם חלקית.
  רשום: "נמצא: [שם] ID:[מספר]" או "לא נמצא"

אם סוג: מרכיבים —
  חומרי המשתמש (התעלם מכמויות, בדוק רק שם הרכיב): "${userIngredients}"
  עבור על כל מתכון ורשום שורה:
  [שם] | חסרים: [שמות רכיבים שאין למשתמש, ללא כמויות] | סה"כ: N
  כלל: התעלם מכמויות — "2 ביצים" ו"ביצה" הם אותו רכיב. "כוס סוכר" ו"1.5 כוס סוכר" הם אותו רכיב.
  מתאים = N ≤ 2.

רשימת המתכונים:
${recipeList}

שלב 3 — לכל מתכון שמתאים, רשום בפירוש:
  יש למשתמש: [רכיבי המתכון שיש למשתמש]
  חסר למשתמש: [רק רכיבים שבאמת אינם ברשימת המשתמש]

שלב 4 — כתוב בדיוק: ===JSON===
ואחריו JSON בלבד, ללא שום טקסט נוסף.

אם מצאת התאמה:
{"found":[{"id":<מספר>,"name":"<שם>","missingIngredients":["<רק מה שחסר באמת>"]}],"generated":null}

אם לא מצאת — צור מתכון חדש בעברית:
- קלט היה שם מתכון → השתמש בשם הזה בדיוק
- קלט היה מרכיבים → המצא שם יצירתי
{"found":[],"generated":{"name":"<שם>","description":"<תיאור קצר>","ingredients":"<מרכיבים, כל אחד בשורה>","instructions":"<הוראות ממוספרות>","shoppingList":["<פריט1>","<פריט2>"]}}`;


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
  const delimIdx = text.indexOf('===JSON===');
  const jsonStr = delimIdx !== -1 ? text.slice(delimIdx + 10) : text;
  const clean = jsonStr.replace(/```json|```/g, '').trim();
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
