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

function stripQuantities(line: string): string {
  return line
    .toLowerCase()
    .replace(/^\d+[\.\-\)]\s*/, '')
    .replace(/\d+([\/+]\d+)?\s*/g, '')
    .replace(/\b(כוס|כוסות|כף|כפות|כפית|כפיות|גרם|ק"ג|מ"ל|ליטר|יחידה|יחידות|חבילה|חבילת|פחית|קמצוץ|גדול|קטן|בינוני|מומס|קצוץ|פרוס|מגורר|טרי|יבש|שלם|מרוסק|מעורבב|מסונן|מבושל|אפוי)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stemHebrew(word: string): string {
  if (word.endsWith('ות')) return word.slice(0, -2);
  if (word.endsWith('ים')) return word.slice(0, -2);
  return word;
}

function ingredientMatches(recipeLine: string, userItem: string): boolean {
  const lineStem = stemHebrew(recipeLine);
  const uiStem = stemHebrew(userItem);
  return (
    recipeLine.includes(userItem) ||
    userItem.includes(recipeLine) ||
    lineStem.includes(uiStem) ||
    uiStem.includes(lineStem)
  );
}

function matchByIngredients(recipes: Recipe[], userInput: string): FoundRecipe[] {
  const userItems = userInput
    .split(/[,\n]+/)
    .map(s => stripQuantities(s))
    .filter(s => s.length > 1);

  if (userItems.length === 0) return [];

  const results: FoundRecipe[] = [];

  for (const recipe of recipes) {
    if (!recipe.ingredients) continue;

    const recipeLines = recipe.ingredients
      .split('\n')
      .map(line => line.trim())
      .filter(s => s.length > 1);

    if (recipeLines.length === 0) continue;

    const missing: string[] = [];
    let anyMatch = false;

    for (const line of recipeLines) {
      const stripped = stripQuantities(line);
      if (userItems.some(ui => ingredientMatches(stripped, ui))) {
        anyMatch = true;
      } else {
        missing.push(line); // שומר שורה מקורית עם כמויות
      }
    }

    if (anyMatch && missing.length <= 2) {
      results.push({ id: recipe.id, name: recipe.name, missingIngredients: missing });
    }
  }

  return results;
}

function matchByName(recipes: Recipe[], userInput: string): FoundRecipe[] {
  const userWords = userInput.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);
  if (userWords.length === 0) return [];

  const wordMatch = (a: string, b: string) => a === b || stemHebrew(a) === stemHebrew(b);

  return recipes
    .filter(recipe => {
      const nameWords = recipe.name.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);
      if (nameWords.length === 0) return false;
      const allNameInUser = nameWords.every(nw => userWords.some(uw => wordMatch(uw, nw)));
      const allUserInName = userWords.every(uw => nameWords.some(nw => wordMatch(nw, uw)));
      return allNameInUser || allUserInName;
    })
    .map(recipe => ({ id: recipe.id, name: recipe.name, missingIngredients: [] }));
}

export async function findRecipesWithAI(userIngredients: string, allRecipes: Recipe[]): Promise<AIResult> {
  const textRecipes = allRecipes.filter(r => r.recipeType === 'Text' && r.ingredients).slice(0, 50);
  const allTextRecipes = allRecipes.filter(r => r.recipeType === 'Text');

  const byIngredients = matchByIngredients(textRecipes, userIngredients);
  const byName = matchByName(allTextRecipes, userIngredients);

  const seen = new Set<number>();
  const matched = [...byIngredients, ...byName].filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  if (matched.length > 0) {
    return { found: matched, generated: null };
  }

  const prompt = `צור מתכון חדש בעברית המשתמש בחומרים הבאים: "${userIngredients}"

החזר JSON בלבד, ללא טקסט נוסף:
{
  "found": [],
  "generated": {
    "name": "",
    "description": "",
    "ingredients": "",
    "instructions": "",
    "shoppingList": []
  }
}`;

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
