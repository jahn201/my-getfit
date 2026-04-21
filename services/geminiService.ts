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

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent';

function buildConfig() {
  return {
    generationConfig: {
      temperature: 0.7,
    },
  };
}

function parseResult(raw: string): ScanResult {
  if (!raw) throw new Error('AI returned an empty response.');
  
  // Clean up markdown code blocks if they exist
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
    console.error('[gemini] Parse error:', err, 'Raw:', raw);
    throw new Error('Failed to interpret nutrition data.');
  }
}

async function fetchWithRetry(url: string, options: any, retries = 2): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if ((res.status === 503 || res.status === 429) && retries > 0) {
      await new Promise(r => setTimeout(r, 1500));
      return fetchWithRetry(url, options, retries - 1);
    }
    return res;
  } catch (e) {
    if (retries > 0) return fetchWithRetry(url, options, retries - 1);
    throw e;
  }
}

export async function analyzeFoodImage(base64Image: string): Promise<ScanResult> {
  if (!base64Image || base64Image.length < 100) throw new Error('Invalid image data.');

  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
  if (!key) { console.warn('[gemini] No key, using demo'); return getRandomDemoMeal(); }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetchWithRetry(`${API_BASE}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Identify the food in this image. Return ONLY JSON: {"food":"name","calories":number,"protein":"Xg","carbs":"Xg","fats":"Xg","description":"brief","healthTip":"brief"}' },
            { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
          ],
        }],
        ...buildConfig(),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('[gemini] API Error:', res.status, txt);
      let msg = `API error ${res.status}`;
      try { msg = JSON.parse(txt)?.error?.message ?? msg; } catch { }
      if (/quota|rate|demand|overloaded/i.test(msg)) return getRandomDemoMeal();
      throw new Error(msg);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('AI could not identify this image.');
    return parseResult(text);
  } catch (e: any) {
    if (e.name === 'AbortError') throw new Error('Request timed out. Try a better connection.');
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchFoodNutrition(query: string): Promise<ScanResult> {
  if (!query?.trim()) throw new Error('Enter a food name.');

  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
  if (!key) {
    console.warn('[gemini] No API key found for search, using demo');
    return getRandomDemoMeal();
  }

  try {
    const res = await fetchWithRetry(`${API_BASE}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Nutritional facts for: "${query}". Return ONLY JSON: {"food":"name","calories":number,"protein":"Xg","carbs":"Xg","fats":"Xg","description":"brief","healthTip":"brief"}` }],
        }],
        ...buildConfig(),
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('[gemini] Search API error:', res.status, txt);
      return getRandomDemoMeal();
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No data found for this food.');
    return parseResult(text);
  } catch (e: any) {
    console.error('[gemini] Search error:', e.message);
    throw new Error('Search failed: ' + e.message);
  }
}