// services/geminiService.ts

export type ScanResult = {
  food: string;
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  description: string;
  healthTip: string;
};

const DEMO_MEALS: ScanResult[] = [
  { food: 'Grilled Chicken Breast', calories: 335, protein: '63g', carbs: '0g', fats: '7g', description: 'Lean grilled chicken breast.', healthTip: 'Great source of lean protein.' },
  { food: 'Avocado Toast', calories: 290, protein: '8g', carbs: '28g', fats: '17g', description: 'Creamy avocado on whole-grain toast.', healthTip: 'Rich in healthy fats.' },
  { food: 'Brown Rice & Veggies', calories: 350, protein: '9g', carbs: '68g', fats: '4g', description: 'Brown rice with mixed vegetables.', healthTip: 'High in fiber.' },
  { food: 'Egg & Spinach Omelette', calories: 220, protein: '18g', carbs: '4g', fats: '14g', description: 'Fluffy omelette with spinach.', healthTip: 'Complete protein source.' },
];

function getRandomDemoMeal(): ScanResult {
  return DEMO_MEALS[Math.floor(Math.random() * DEMO_MEALS.length)];
}

function extractText(parts: any[]): string {
  if (!Array.isArray(parts) || !parts.length) return '';
  // Safely find the first part that has text
  const answer = parts.find((p: any) => p && typeof p.text === 'string' && !p.thought);
  return answer?.text ?? parts[parts.length - 1]?.text ?? '';
}

function parseResult(raw: string): ScanResult {
  if (!raw) throw new Error('AI returned an empty response.');
  const clean = raw.replace(/```json|```/gi, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No valid nutritional data found in AI response.');
  
  try {
    const p = JSON.parse(match[0]);
    
    const toNum = (val: any) => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') return parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
      return 0;
    };

    return {
      food: String(p.food || 'Unknown Food'),
      calories: toNum(p.calories),
      protein: String(p.protein ?? '0g'),
      carbs: String(p.carbs ?? '0g'),
      fats: String(p.fats ?? '0g'),
      description: String(p.description ?? ''),
      healthTip: String(p.healthTip ?? ''),
    };
  } catch (err) {
    throw new Error('Failed to parse nutrition data. Please try again.');
  }
}

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent';

function buildConfig() {
  return {
    generationConfig: {
      temperature: 1,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };
}

export async function analyzeFoodImage(base64Image: string): Promise<ScanResult> {
  if (!base64Image || base64Image.length < 100) {
    throw new Error('Image data is missing or too small.');
  }

  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
  if (!key) { console.warn('[gemini] No key, using demo'); return getRandomDemoMeal(); }

  console.log('[gemini] Image scan start, base64 length:', base64Image.length);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Identify this food. Return ONLY JSON, no markdown, no extra text: {"food":"name","calories":number,"protein":"Xg","carbs":"Xg","fats":"Xg","description":"brief","healthTip":"brief"}' },
            { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
          ],
        }],
        ...buildConfig(),
      }),
    });
  } catch (e: any) {
    throw new Error('Network error: ' + e.message);
  }

  console.log('[gemini] status:', res.status);

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.error('[gemini] error body:', txt.slice(0, 300));
    let msg = `API error ${res.status}`;
    try { msg = JSON.parse(txt)?.error?.message ?? msg; } catch { }
    if (/quota|rate|api key/i.test(msg)) return getRandomDemoMeal();
    throw new Error(msg);
  }

  const data = await res.json();
  console.log('[gemini] response:', JSON.stringify(data).slice(0, 400));

  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = extractText(parts);
  console.log('[gemini] extracted text:', text.slice(0, 200));

  if (!text) throw new Error('AI returned empty response. Try a clearer photo.');
  return parseResult(text);
}

export async function searchFoodNutrition(query: string): Promise<ScanResult> {
  if (!query?.trim() || query.trim().length < 2) throw new Error('Please enter a food name.');

  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
  if (!key) { console.warn('[gemini] No key, using demo'); return getRandomDemoMeal(); }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Nutrition for: "${query}". Return ONLY JSON, no markdown: {"food":"name","calories":number,"protein":"Xg","carbs":"Xg","fats":"Xg","description":"brief","healthTip":"brief"}` }],
        }],
        ...buildConfig(),
      }),
    });
  } catch (e: any) {
    throw new Error('Network error: ' + e.message);
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    let msg = `API error ${res.status}`;
    try { msg = JSON.parse(txt)?.error?.message ?? msg; } catch { }
    if (/quota|api key/i.test(msg)) return getRandomDemoMeal();
    throw new Error(msg);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = extractText(parts);

  if (!text) throw new Error('AI returned empty response.');
  return parseResult(text);
}