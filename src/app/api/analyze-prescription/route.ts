import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SAMPLE_PRESCRIPTIONS } from '@/data/samplePrescriptions';
import { lookupGenericAlternative } from '@/data/genericMedicines';
import { findLocalInteractions } from '@/data/drugInteractions';
import { Medicine, PrescriptionExtractionResult } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, isDemo, mimeType = 'image/jpeg' } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

    // DEMO MODE or Missing API Key fallback: Instant, realistic, robust
    if (isDemo || !apiKey) {
      console.log('Using pre-recorded prescription extraction (Demo Mode / No API key)');
      // Pick first sample by default
      const sample = SAMPLE_PRESCRIPTIONS[0].result;

      // Enrich with generic savings if available
      const enrichedMedicines = sample.medicines.map((m) => {
        const gen = lookupGenericAlternative(m.name);
        return {
          ...m,
          generic_alternative: gen ? `${gen.janAushadhiName} (Jan Aushadhi)` : m.generic_name,
          generic_savings_pct: gen ? gen.savingsPercent : 0,
        };
      });

      const interactions = findLocalInteractions(enrichedMedicines.map((m) => m.name));

      return NextResponse.json({
        success: true,
        isDemo: true,
        data: {
          ...sample,
          medicines: enrichedMedicines,
        },
        interactions,
      });
    }

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'No image provided for prescription analysis' },
        { status: 400 }
      );
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

    const anthropic = new Anthropic({
      apiKey,
    });

    const systemPrompt = `You are a clinical pharmacist and AI medical vision expert specializing in reading doctor prescriptions, especially handwritten Indian prescriptions.
Your task is to analyze the prescription photo and return a STRICT JSON object without any markdown wrapping or explanatory text.
JSON Structure:
{
  "doctor_notes": "Summary of doctor advice, diet instructions, warnings, or follow-up duration",
  "raw_summary": "Short 1-2 sentence overview of the diagnosis or prescription",
  "confidence_overall": 0.85,
  "medicines": [
    {
      "name": "Brand or generic medicine name",
      "generic_name": "Active pharmacological salt name if known",
      "dose": "Dosage e.g. 500mg, 1 tablet, 5ml",
      "frequency": "Frequency format like 1-0-1, 1-0-0, 0-1-0, or Once daily",
      "timing": "Before food, After food, With food, or Bedtime",
      "duration": "Duration e.g. 5 days, 15 days, 1 month, Ongoing",
      "confidence": 0.95,
      "color_shape_hint": "Visual description e.g. Yellow round tablet, White capsule",
      "notes": "Any special remarks e.g. Empty stomach with water"
    }
  ]
}

SAFETY RULES:
1. Handwriting confidence MUST be scored realistically between 0.0 and 1.0 for EACH medicine.
2. If any medicine name, dosage, or frequency is smudged, abbreviated, or difficult to read, give confidence < 0.7 (e.g. 0.55 - 0.65) and note the ambiguity in "notes" so the patient will be prompted to verify with human confirmation. Never silently guess!
3. Return ONLY pure valid JSON.`;

    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: 2000,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please carefully transcribe and analyze all medications in this prescription according to the strict JSON format.',
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: (mimeType as any) || 'image/jpeg',
                data: cleanBase64,
              },
            },
          ],
        },
      ],
    });

    // Extract text from response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Claude returned non-text response');
    }

    const rawText = content.text.trim();
    // Strip markdown code fences if present
    const cleanJson = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsedData: PrescriptionExtractionResult = JSON.parse(cleanJson);

    // Ensure IDs and assign generic lookups
    const medicines: Medicine[] = (parsedData.medicines || []).map((m, idx) => {
      const gen = lookupGenericAlternative(m.name);
      return {
        ...m,
        id: `med-${Date.now()}-${idx}`,
        confidence: typeof m.confidence === 'number' ? m.confidence : 0.85,
        is_verified: typeof m.confidence === 'number' ? m.confidence >= 0.7 : true,
        generic_alternative: gen ? `${gen.janAushadhiName} (Jan Aushadhi)` : m.generic_name,
        generic_savings_pct: gen ? gen.savingsPercent : 0,
      };
    });

    // Run local drug interaction check
    const interactions = findLocalInteractions(medicines.map((m) => m.name));

    return NextResponse.json({
      success: true,
      isDemo: false,
      data: {
        medicines,
        doctor_notes: parsedData.doctor_notes || 'Follow prescribed timing and complete course.',
        raw_summary: parsedData.raw_summary || 'Prescription processed successfully.',
        confidence_overall: parsedData.confidence_overall || 0.88,
      },
      interactions,
    });
  } catch (error: any) {
    console.error('Prescription extraction error:', error);
    // Fall back to sample data gracefully so user experience is never broken
    const fallback = SAMPLE_PRESCRIPTIONS[0].result;
    return NextResponse.json(
      {
        success: true,
        fallbackMode: true,
        error: error.message || 'Error communicating with vision LLM',
        data: fallback,
        interactions: findLocalInteractions(fallback.medicines.map((m) => m.name)),
      },
      { status: 200 }
    );
  }
}
