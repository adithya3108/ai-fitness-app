// src/app/lib/image-service.ts

// Shared function for both exercise and food images
async function callImageApi(
  prompt: string,
  type: 'exercise' | 'food'
): Promise<string | null> {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, type }),
    });

    // ---------------------------
    // HANDLE ERROR RESPONSES
    // ---------------------------
    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        // Not JSON — ignore
      }

      console.error('❌ Image API failed:', response.status, errorBody);

      // 🔥 Special case: 410 Gone (model deprecated / unavailable)
      if (response.status === 410) {
        console.warn('⚠️ Image model not available (410). Returning null.');
        return null;
      }

      // Other errors → return null safely
      return null;
    }

    // ---------------------------
    // HANDLE SUCCESS RESPONSES
    // ---------------------------
    const data = await response.json();

    if (!data || !data.imageUrl) {
  console.warn('⚠️ No imageUrl in API response:', data);
  return null;
}

console.log('✅ Received imageUrl from API:', data.imageUrl);

return data.imageUrl as string;
  } catch (err) {
    console.error('❌ Image generation exception:', err);
    return null; // Fail-safe fallback
  }
}

// ---------------------------------------
// PUBLIC API FUNCTIONS
// ---------------------------------------

export async function generateExerciseImage(
  exerciseName: string
): Promise<string | null> {
  return callImageApi(exerciseName, 'exercise');
}

export async function generateFoodImage(
  foodName: string
): Promise<string | null> {
  return callImageApi(foodName, 'food');
}
