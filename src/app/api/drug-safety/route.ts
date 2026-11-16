import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { findLocalInteractions, DANGEROUS_INTERACTIONS } from '@/data/drugInteractions';
import { Language } from '@/context/LanguageContext';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { medicines = [], language = 'en', isDemo = false } = body;

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return NextResponse.json({
        success: true,
        interactions: [],
        llmReasoning: 'No medicines provided to check.',
      });
    }

    // 1. Run local deterministic safety check first (Works 100% offline or with zero API key!)
    const localInteractions = findLocalInteractions(medicines);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

    // If Demo or No API key, return local interaction results
    if (isDemo || !apiKey) {
      return NextResponse.json({
        success: true,
        source: 'local_deterministic_rules',
        interactions: localInteractions,
        llmReasoning:
          localInteractions.length > 0
            ? `Identified ${localInteractions.length} interaction(s) via certified pharmacological rules table.`
            : 'No known high-risk drug-drug interactions detected between the given medications in the database.',
      });
    }

    // 2. Perform deep LLM reasoning across the combination
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `You are a clinical pharmacologist. Analyze the provided list of medications for:
1. Direct Drug-Drug Interactions
2. Additive Side Effects (e.g. extreme hypoglycemia, profound hypotension, bleeding)
3. Essential food or timing precautions (e.g. empty stomach vs with food)

Medicines: ${medicines.join(', ')}
Target Language: ${language} (en = English, hi = Hindi, ta = Tamil, te = Telugu)

Output STRICT JSON:
{
  "summary": "1-2 sentence overall safety assessment in simple words",
  "additional_warnings": [
    {
      "severity": "High" | "Medium" | "Low",
      "medicines_involved": ["Med A", "Med B"],
      "plain_language_warning": "Clear warning in the requested target language",
      "medical_rationale": "Clinical pharmacology rationale in English"
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: 800,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `Please analyze this regimen: ${medicines.join(', ')}`,
        },
      ],
      system: systemPrompt,
    });

    const content = response.content[0];
    let llmWarnings: any[] = [];
    let summary = '';

    if (content.type === 'text') {
      try {
        const clean = content.text.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(clean);
        llmWarnings = parsed.additional_warnings || [];
        summary = parsed.summary || '';
      } catch (e) {
        console.warn('Could not parse Claude safety JSON:', e);
      }
    }

    return NextResponse.json({
      success: true,
      source: 'hybrid_local_and_llm',
      localCount: localInteractions.length,
      interactions: localInteractions,
      llmWarnings,
      summary,
    });
  } catch (error: any) {
    console.error('Drug safety check error:', error);
    // Graceful fallback to local table
    const local = findLocalInteractions(req.body ? (req as any).body?.medicines || [] : []);
    return NextResponse.json({
      success: true,
      source: 'local_fallback',
      interactions: local,
      error: error.message,
    });
  }
}
