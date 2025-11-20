import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const GEMINI_IMAGE_MODEL = 'models/gemini-2.5-flash-image';

// Fallback image generator: Pollinations (no auth required)
function sanitizePrompt(prompt: string) {
  return prompt
    .replace(/[()]/g, "")       // remove parentheses
    .replace(/[,]/g, "")        // remove commas
    .replace(/[^a-zA-Z0-9\s]/g, "") // remove weird unicode chars
    .trim();
}

function buildFallbackImageUrl(fullPrompt: string) {
  const safe = sanitizePrompt(fullPrompt);
  const encoded = encodeURIComponent(safe);
  return `https://image.pollinations.ai/prompt/${encoded}`;
}


export async function POST(request: NextRequest) {
  try {
    const { prompt, type } = await request.json();

    if (!prompt || !type) {
      return NextResponse.json(
        { error: 'Missing prompt or type in request body' },
        { status: 400 }
      );
    }

    const baseDescription =
      type === 'exercise'
        ? `realistic professional fitness photo of ${prompt}, clear exercise form, gym setting, high quality fitness photography`
        : `professional food photography of ${prompt}, healthy meal, appetizing, clean eating, natural lighting, high resolution`;

    const fullPrompt = baseDescription;

    // If Gemini key is missing, go straight to fallback provider
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured – using fallback image provider.');
      const fallbackUrl = buildFallbackImageUrl(fullPrompt);
      return NextResponse.json(
        {
          imageUrl: fallbackUrl,
          note: 'Used fallback image provider because Gemini key is missing.',
        },
        { status: 200 }
      );
    }

    // --------------------------
    // 1) Try Gemini image API
    // --------------------------
    const url = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(
        'Gemini image API error:',
        response.status,
        errorText || '<no body>'
      );

      // --------------------------
      // 2) Fallback on ANY Gemini error (429, quota, etc.)
      // --------------------------
      const fallbackUrl = buildFallbackImageUrl(fullPrompt);
      return NextResponse.json(
        {
          imageUrl: fallbackUrl,
          note: `Used fallback image provider because Gemini failed with status ${response.status}.`,
        },
        { status: 200 }
      );
    }

    const data = await response.json();

    const candidates = data.candidates || [];
    const firstCandidate = candidates[0];
    const parts =
      firstCandidate?.content?.parts || firstCandidate?.content?.Parts || [];

    const imagePart = parts.find(
      (p: any) => p.inline_data || p.inlineData
    );

    if (!imagePart) {
      console.error(
        'No inline image data in Gemini response:',
        JSON.stringify(data, null, 2)
      );

      // If Gemini responded but no image data, still fallback
      const fallbackUrl = buildFallbackImageUrl(fullPrompt);
      return NextResponse.json(
        {
          imageUrl: fallbackUrl,
          note: 'Used fallback image provider because Gemini returned no image data.',
        },
        { status: 200 }
      );
    }

    const inlineData = imagePart.inline_data || imagePart.inlineData;
    const mimeType = inlineData.mime_type || inlineData.mimeType || 'image/png';
    const base64 = inlineData.data;

    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ imageUrl: dataUrl });
  } catch (error) {
    console.error('Image generation error (Gemini + fallback):', error);

    // Last-resort fallback on unexpected server error
    const fallbackUrl = buildFallbackImageUrl('generic fitness or food image');
    return NextResponse.json(
      {
        imageUrl: fallbackUrl,
        error: 'Internal server error during image generation. Used fallback provider.',
      },
      { status: 200 }
    );
  }
}
