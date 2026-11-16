import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SAMPLE_PRESCRIPTIONS } from '@/data/samplePrescriptions';
import { lookupGenericAlternative } from '@/data/genericMedicines';
import { findLocalInteractions } from '@/data/drugInteractions';
import { Medicine, PrescriptionExtractionResult } from '@/types';
import { Language } from '@/context/LanguageContext';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOCALIZED_DEMO_SAMPLES: Record<Language, any> = {
  en: {
    doctorNotes: 'Patient advised to walk 30 mins daily, restrict sodium/salt in food, maintain daily blood sugar log, and report immediately if systolic BP crosses 180.',
    rawSummary: '5 prescribed medicines for Type 2 Diabetes and Stage 2 Hypertension management.',
    med1Notes: 'Take 15 minutes before breakfast and dinner',
    med2Notes: 'Take every morning after breakfast for BP control',
    med3Notes: 'Take at bedtime for cholesterol management',
    med4Notes: 'Take early morning on empty stomach with warm water',
    med5Notes: 'Unclear handwriting in prescription: Please verify if Ecosprin 75 or 150',
    genericSuffix: '(Jan Aushadhi Store)',
  },
  hi: {
    doctorNotes: 'मरीज को रोजाना 30 मिनट टहलने, भोजन में नमक कम करने, रोजाना शुगर डायरी लिखने और बीपी 180 से अधिक होने पर तुरंत संपर्क करने की सलाह दी गई।',
    rawSummary: 'टाइप 2 डायबिटीज और स्टेज 2 हाई बीपी के लिए 5 दवाइयां निर्धारित।',
    med1Notes: 'नाश्ते और रात के खाने से 15 मिनट पहले लें',
    med2Notes: 'बीपी के लिए रोज सुबह नाश्ते के बाद लें',
    med3Notes: 'कोलेस्ट्रॉल के लिए रात को सोने से पहले लें',
    med4Notes: 'सुबह खाली पेट गुनगुने पानी के साथ लें',
    med5Notes: 'पर्चे में लिखावट अस्पष्ट है: कृपया जांचें कि यह इकोस्प्रिन 75 है या 150',
    genericSuffix: '(जन औषधि केंद्र)',
  },
  ta: {
    doctorNotes: 'நோயாளி தினமும் 30 நிமிடங்கள் நடக்கவும், உணவில் உப்பைக் குறைக்கவும், இரத்த சர்க்கரை அளவைக் கண்காணிக்கவும், BP 180 ஐத் தாண்டினால் உடனே தெரிவிக்கவும் அறிவுறுத்தப்படுகிறார்.',
    rawSummary: 'வகை 2 நீரிழிவு மற்றும் இரத்த அழுத்த மேலாண்மைக்கான 5 பரிந்துரைக்கப்பட்ட மருந்துகள்.',
    med1Notes: 'காலை மற்றும் இரவு உணவுக்கு 15 நிமிடங்களுக்கு முன் எடுக்கவும்',
    med2Notes: 'BP க்காக தினமும் காலை உணவுக்குப் பின் எடுக்கவும்',
    med3Notes: 'இரவு தூங்குவதற்கு முன் எடுக்கவும்',
    med4Notes: 'காலையில் வெறும் வயிற்றில் வெதுவெதுப்பான நீரில் எடுக்கவும்',
    med5Notes: 'கையெழுத்து தெளிவாக இல்லை: எக்கோஸ்ப்ரின் 75 அல்லது 150 என்பதை சரிபார்க்கவும்',
    genericSuffix: '(ஜன் ஔஷதி மையம்)',
  },
  te: {
    doctorNotes: 'రోగి ప్రతిరోజూ 30 నిమిషాలు నడవాలని, ఉప్పు తగ్గించాలని, రోజూ షుగర్ డైరీని నిర్వహించాలని మరియు బీపీ 180 దాటితే వెంటనే సంప్రదించాలని సూచించబడింది.',
    rawSummary: 'టైప్ 2 డయాబెటిస్ మరియు రక్తపోటు నిర్వహణ కోసం 5 మందులు సూచించబడ్డాయి.',
    med1Notes: 'ఉదయం మరియు రాత్రి భోజనానికి 15 నిమిషాల ముందు తీసుకోండి',
    med2Notes: 'బీపీ కోసం ప్రతిరోజూ ఉదయం టిఫిన్ తర్వాత తీసుకోండి',
    med3Notes: 'కొలెస్ట్రాల్ కోసం రాత్రి పడుకునే ముందు తీసుకోండి',
    med4Notes: 'ఉదయం ఖాళీ కడుపుతో గోరువెచ్చని నీటితో తీసుకోండి',
    med5Notes: 'చేతిరాత అస్పష్టంగా ఉంది: ఎకోస్ప్రిన్ 75 లేదా 150 అనేది నిర్ధారించండి',
    genericSuffix: '(జన ఔషధి కేంద్రం)',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, isDemo, mimeType = 'image/jpeg', language = 'en', sampleIndex = 0 } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
    const langKey: Language = (['en', 'hi', 'ta', 'te'].includes(language) ? language : 'en') as Language;
    const loc = LOCALIZED_DEMO_SAMPLES[langKey];

    // DEMO MODE or Missing API Key fallback: Instant, realistic, localized
    if (isDemo || !apiKey) {
      console.log(`Using pre-recorded prescription extraction (Demo Mode / Language: ${langKey})`);
      const baseSample = SAMPLE_PRESCRIPTIONS[sampleIndex === 1 ? 1 : 0].result;

      // Localize notes and remarks in demo sample
      const localizedMedicines = baseSample.medicines.map((m, idx) => {
        const gen = lookupGenericAlternative(m.name);
        const localizedNote =
          idx === 0 ? loc.med1Notes : idx === 1 ? loc.med2Notes : idx === 2 ? loc.med3Notes : idx === 3 ? loc.med4Notes : loc.med5Notes;

        return {
          ...m,
          notes: localizedNote || m.notes,
          generic_alternative: gen ? `${gen.janAushadhiName} ${loc.genericSuffix}` : m.generic_name,
          generic_savings_pct: gen ? gen.savingsPercent : 0,
        };
      });

      const interactions = findLocalInteractions(localizedMedicines.map((m) => m.name));

      return NextResponse.json({
        success: true,
        isDemo: true,
        data: {
          ...baseSample,
          doctor_notes: loc.doctorNotes,
          raw_summary: loc.rawSummary,
          medicines: localizedMedicines,
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

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `You are a clinical pharmacist and AI medical vision expert specializing in reading doctor prescriptions.
Analyze the prescription photo and return a STRICT JSON object without markdown fences or other text.
TARGET LANGUAGE: ${language} (en = English, hi = Hindi, ta = Tamil, te = Telugu).
All textual explanations, notes, doctor_notes, and raw_summary MUST be written in ${language}.

JSON Structure:
{
  "doctor_notes": "Summary of doctor advice in ${language}",
  "raw_summary": "Short 1-2 sentence overview in ${language}",
  "confidence_overall": 0.85,
  "medicines": [
    {
      "name": "Brand or generic medicine name",
      "generic_name": "Active pharmacological salt name if known",
      "dose": "Dosage e.g. 500mg, 1 tablet",
      "frequency": "Frequency format like 1-0-1, 1-0-0, 0-1-0",
      "timing": "Before food, After food, or Bedtime in ${language}",
      "duration": "Duration in ${language}",
      "confidence": 0.95,
      "color_shape_hint": "Visual description in ${language}",
      "notes": "Any special remarks or handwriting ambiguity remarks in ${language}"
    }
  ]
}

SAFETY RULES:
1. Score handwriting confidence accurately between 0.0 and 1.0.
2. If handwriting is unclear or doubtful, set confidence < 0.7 (e.g. 0.55-0.65) and note the ambiguity in "notes" in ${language}. Never silently guess.`;

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
              text: `Analyze all medications in this prescription and respond strictly in JSON in the language code "${language}".`,
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

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Claude returned non-text response');
    }

    const rawText = content.text.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsedData: PrescriptionExtractionResult = JSON.parse(rawText);

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

    const interactions = findLocalInteractions(medicines.map((m) => m.name));

    return NextResponse.json({
      success: true,
      isDemo: false,
      data: {
        medicines,
        doctor_notes: parsedData.doctor_notes || '',
        raw_summary: parsedData.raw_summary || '',
        confidence_overall: parsedData.confidence_overall || 0.88,
      },
      interactions,
    });
  } catch (error: any) {
    console.error('Prescription extraction error:', error);
    const fallback = SAMPLE_PRESCRIPTIONS[0].result;
    return NextResponse.json(
      {
        success: true,
        fallbackMode: true,
        error: error.message,
        data: fallback,
        interactions: findLocalInteractions(fallback.medicines.map((m) => m.name)),
      },
      { status: 200 }
    );
  }
}
