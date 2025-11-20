import { UserData, FitnessPlan } from '../utils/storage';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = 'models/gemini-flash-latest';

export async function generateFitnessPlanWithGemini(userData: UserData): Promise<FitnessPlan> {
  console.log('🔑 Gemini API Key:', GEMINI_API_KEY ? 'Present' : 'Missing');

  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not found. Please check your .env.local file (NEXT_PUBLIC_GEMINI_API_KEY)');
  }

  try {
    const prompt = createPrompt(userData);
    console.log('🔄 Making Gemini API request...');

    const url = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    const content: string =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') || '';

    if (!content) {
      console.error('Gemini raw response (empty content):', JSON.stringify(data, null, 2));
      throw new Error('Gemini returned empty response');
    }

    // Build a FitnessPlan by extracting only the pieces we care about
    const plan = buildPlanFromContent(content);

    return validateAndEnhancePlan(plan, userData);
  } catch (error) {
    console.error('Gemini Error:', error);
    throw error;
  }
}


function createPrompt(userData: UserData): string {
  return `
You are generating a JSON object for a fitness app.

CRITICAL RULES:
- Return ONLY a single valid JSON object.
- Do NOT include markdown, backticks, or any text outside the JSON.
- Keep the total response UNDER 4000 characters.
- Use short, single-sentence descriptions.

User Profile:
- Name: ${userData.name}
- Age: ${userData.age}
- Gender: ${userData.gender}
- Height: ${userData.height} cm
- Weight: ${userData.weight} kg
- Goal: ${userData.fitnessGoal}
- Level: ${userData.fitnessLevel}
- Location: ${userData.workoutLocation}
- Diet: ${userData.dietaryPreferences}
- Medical: ${userData.medicalHistory || 'None'}
- Stress: ${userData.stressLevel || 'Not specified'}

Return JSON in EXACTLY this structure (no extra keys):

{
  "workout": {
    "dailyRoutines": [
      {
        "day": "Day name and focus",
        "exercises": [
          {
            "name": "Exercise Name",
            "sets": "3-4",
            "reps": "10-15",
            "rest": "60s",
            "description": "Very short description (max 15 words)."
          }
        ]
      }
    ]
  },
  "diet": {
    "meals": {
      "breakfast": "Short meal description",
      "lunch": "Short meal description",
      "dinner": "Short meal description",
      "snacks": "Short snack options"
    }
  },
  "tips": ["Short tip 1", "Short tip 2", "Short tip 3"],
  "motivation": "Short motivational quote."
}

Constraints:
- Limit to ONLY 3 days in "dailyRoutines".
- Each day must have at MOST 4 exercises.
- Descriptions MUST be short and concise.
`;
}

function validateAndEnhancePlan(plan: any, userData: UserData): FitnessPlan {
  if (!plan.workout || !plan.diet) {
    console.error('Invalid plan structure from AI:', plan);
    throw new Error('Invalid plan structure from AI');
  }

  return {
    workout: plan.workout,
    diet: plan.diet,
    tips: plan.tips ?? [],
    motivation: plan.motivation ?? 'You’ve got this. One workout at a time.',
  };
}

// --- Helpers to extract parts from Gemini's text ---

function extractBracketBlock(
  source: string,
  fieldName: string,
  openChar: '{' | '[',
  closeChar: '}' | ']'
): string | null {
  const fieldIndex = source.indexOf(`"${fieldName}"`);
  if (fieldIndex === -1) return null;

  const firstOpen = source.indexOf(openChar, fieldIndex);
  if (firstOpen === -1) return null;

  let depth = 1;
  for (let i = firstOpen + 1; i < source.length; i++) {
    const ch = source[i];
    if (ch === openChar) depth++;
    else if (ch === closeChar) depth--;
    if (depth === 0) {
      return source.slice(firstOpen, i + 1); // include the closing bracket
    }
  }
  return null;
}

function extractStringField(source: string, fieldName: string): string | null {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`);
  const match = source.match(regex);
  return match ? match[1] : null;
}

function buildPlanFromContent(content: string): FitnessPlan {
  // 1) Try straight JSON.parse first
  try {
    const maybeJson = JSON.parse(content);
    if (maybeJson && maybeJson.workout && maybeJson.diet) {
      return {
        workout: maybeJson.workout,
        diet: maybeJson.diet,
        tips: maybeJson.tips ?? [],
        motivation: maybeJson.motivation ?? 'Stay consistent – progress compounds.',
      };
    }
  } catch {
    // ignore and fall back to manual extraction
  }

  // 2) Clean possible markdown fences
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/```$/i, '').trim();

  // 3) Extract "dailyRoutines" array
  const dailyRoutinesStr = extractBracketBlock(cleaned, 'dailyRoutines', '[', ']');
  let dailyRoutines: any[] = [];
  if (dailyRoutinesStr) {
    try {
      dailyRoutines = JSON.parse(dailyRoutinesStr);
    } catch {
      console.warn('Could not parse dailyRoutines, got:', dailyRoutinesStr);
    }
  }

  // 4) Extract "meals" object
  const mealsStr = extractBracketBlock(cleaned, 'meals', '{', '}');
  let meals: any = {
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: '',
  };
  if (mealsStr) {
    try {
      const parsed = JSON.parse(mealsStr);
      meals = {
        breakfast: parsed.breakfast ?? '',
        lunch: parsed.lunch ?? '',
        dinner: parsed.dinner ?? '',
        snacks: parsed.snacks ?? '',
      };
    } catch {
      console.warn('Could not parse meals, got:', mealsStr);
    }
  }

  // 5) Extract tips array
  let tips: string[] = [];
  const tipsBlock = extractBracketBlock(cleaned, 'tips', '[', ']');
  if (tipsBlock) {
    try {
      const parsed = JSON.parse(tipsBlock);
      if (Array.isArray(parsed)) tips = parsed.map(String);
    } catch {
      console.warn('Could not parse tips, got:', tipsBlock);
    }
  }

  // 6) Extract motivation string
  const motivation =
    extractStringField(cleaned, 'motivation') ??
    'You’re doing great. Stay consistent and trust the process.';

  // 7) Final FitnessPlan
  return {
    workout: {
      dailyRoutines,
    },
    diet: {
      meals,
    },
    tips,
    motivation,
  };
}
