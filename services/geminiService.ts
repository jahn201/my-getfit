// services/geminiService.ts
// ─────────────────────────────────────────────────────────────────────────────
// All AI / Gemini API logic lives here.
// The UI (home.tsx) should import `analyzeFoodImage` and never call fetch directly.
// ─────────────────────────────────────────────────────────────────────────────

export type ScanResult = {
  food: string;
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  description: string;
  healthTip: string;
};

/** Realistic demo meals used when API quota is exceeded or key is missing. */
const DEMO_MEALS: ScanResult[] = [
  {
    food: 'Grilled Chicken Breast',
    calories: 335,
    protein: '63g',
    carbs: '0g',
    fats: '7g',
    description: '[DEMO] Lean and tender grilled chicken, a classic high-protein meal.',
    healthTip: 'One of the best sources of lean protein to support muscle growth.',
  },
  {
    food: 'Avocado Toast',
    calories: 290,
    protein: '8g',
    carbs: '28g',
    fats: '17g',
    description: '[DEMO] Creamy avocado spread over toasted whole-grain bread.',
    healthTip: 'Rich in healthy monounsaturated fats that support heart health.',
  },
  {
    food: 'Brown Rice & Veggies',
    calories: 350,
    protein: '9g',
    carbs: '68g',
    fats: '4g',
    description: '[DEMO] Wholesome brown rice with a colorful medley of vegetables.',
    healthTip: 'High in fiber which aids digestion and keeps you full longer.',
  },
  {
    food: 'Egg & Spinach Omelette',
    calories: 220,
    protein: '18g',
    carbs: '4g',
    fats: '14g',
    description: '[DEMO] Fluffy omelette packed with fresh spinach and eggs.',
    healthTip: 'Eggs are a complete protein source containing all essential amino acids.',
  },
];

function getRandomDemoMeal(): ScanResult {
  return DEMO_MEALS[Math.floor(Math.random() * DEMO_MEALS.length)];
}

/**
 * Sends a base64-encoded food image to the Gemini API and returns
 * structured nutritional information.
 *
 * Throws an error string on unrecoverable failures so the UI can display it.
 * Falls back to a demo meal on quota / key errors so the app stays usable.
 */
export async function analyzeFoodImage(base64Image: string): Promise<ScanResult> {
  if (!base64Image || base64Image.length < 100) {
    throw new Error('Image data is missing or too small. Please try a different photo.');
  }

  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

  if (!GEMINI_API_KEY) {
    console.warn('geminiService: EXPO_PUBLIC_GEMINI_API_KEY is not set. Returning demo meal.');
    return getRandomDemoMeal();
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are a food nutrition expert. Carefully look at this food image and identify what food it is. Return ONLY a raw JSON object with NO markdown, NO backticks, NO explanation. Exactly this format: {"food":"exact food name","calories":estimated_integer,"protein":"Xg","carbs":"Xg","fats":"Xg","description":"one appetizing sentence describing the food","healthTip":"one specific health benefit of this food"}`,
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message: string = errorData?.error?.message ?? `API error ${response.status}`;

    const isQuotaOrKeyError =
      message.toLowerCase().includes('quota') ||
      message.toLowerCase().includes('rate') ||
      message.toLowerCase().includes('api key') ||
      message.toLowerCase().includes('not found');

    if (isQuotaOrKeyError) {
      console.warn('geminiService: Quota/key error — returning demo meal. Details:', message);
      return getRandomDemoMeal();
    }

    throw new Error(message);
  }

  const data = await response.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!text) {
    throw new Error('AI returned an empty response. Try a clearer photo.');
  }

  const clean = text.replace(/```json|```/g, '').trim();
  const parsed: ScanResult = JSON.parse(clean);

  if (!parsed.food || parsed.calories === undefined) {
    throw new Error('Could not understand the AI response. Please try again.');
  }

  return parsed;
}
