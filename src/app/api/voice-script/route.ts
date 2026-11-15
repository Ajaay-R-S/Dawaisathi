import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ScheduleItem, Language } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schedule = [], language = 'hi', isDemo = false, patientName = 'बाबा' } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

    // Categorize medicines by slot
    const morningMeds = schedule.filter((s: ScheduleItem) => s.slot === 'morning');
    const afternoonMeds = schedule.filter((s: ScheduleItem) => s.slot === 'afternoon');
    const nightMeds = schedule.filter((s: ScheduleItem) => s.slot === 'night');

    // High quality offline / demo spoken templates
    const fallbackScripts: Record<Language, string> = {
      hi: `नमस्ते ${patientName} जी! आज की दवाई का समय इस प्रकार है: 
सुबह के समय: खाली पेट पीली गोली पैन-40 गुनगुने पानी से लें। नाश्ते से 15 मिनट पहले सफेद गोली ग्लाइकोमेट लें, और नाश्ते के बाद पीली लंबी गोली टेलमा-40 बीपी के लिए लें।
दोपहर में: खाना खाने के बाद छोटी सफेद गोली इकोस्प्रिन पानी के साथ लें।
रात को: रात के खाने से पहले सफेद गोली ग्लाइकोमेट लें, और सोने से पहले छोटी सफेद गोली एटोरवा लें।
समय पर दवाई लें, खुश रहें और स्वस्थ रहें!`,

      en: `Hello! Here is your medicine schedule for today:
In the morning: Take the yellow Pan-40 tablet on an empty stomach with warm water. Take the white Glycomet tablet 15 minutes before breakfast, and the yellow oblong Telma-40 tablet for BP after breakfast.
In the afternoon: Take the small white Ecosprin tablet after lunch.
At night: Take the white Glycomet tablet before dinner, and the small round Atorva tablet before going to sleep.
Stay hydrated and take your medicines on time!`,

      ta: `வணக்கம்! இன்றைய மருந்து அட்டவணை இதோ:
காலையில்: வெறும் வயிற்றில் மஞ்சள் நிற பான்-40 மாத்திரையை வெதுவெதுப்பான நீரில் எடுத்துக் கொள்ளுங்கள். காலை உணவுக்கு முன் வெள்ளை கிளைகோமெட் மாத்திரையும், உணவுக்குப் பின் பிபிக்கான டெல்மா-40 மாத்திரையும் எடுக்கவும்.
மதியம்: மதிய உணவுக்குப் பின் சிறிய வெள்ளை எக்கோஸ்ப்ரின் மாத்திரை.
இரவில்: இரவு உணவுக்கு முன் வெள்ளை கிளைகோமெட், தூங்குவதற்கு முன் சிறிய அடோர்வா மாத்திரை.
சரியான நேரத்தில் மருந்து உட்கொண்டு ஆரோக்கியமாக இருங்கள்!`,

      te: `నమస్కారం! నేటి మీ మందుల షెడ్యూల్ ఇదిగోండి:
ఉదయం వేళ: ఖాళీ కడుపుతో పసుపు రంగు పాన్-40 టాబ్లెట్ గోరువెచ్చని నీటితో తీసుకోండి. టిఫిన్ ముందు తెల్లటి గ్లైకోమెట్, టిఫిన్ తర్వాత బీపీ కోసం పసుపు రంగు టెల్మా-40 టాబ్లెట్ వేసుకోండి.
మధ్యాహ్నం: భోజనం తర్వాత చిన్న తెల్లటి ఎకోస్ప్రిన్ టాబ్లెట్.
రాత్రి వేళ: రాత్రి భోజనానికి ముందు తెల్లటి గ్లైకోమెట్, పడుకునే ముందు చిన్న అటోర్వా టాబ్లెట్ వేసుకోండి.
సమయానికి మందులు వేసుకుని ఆరోగ్యంగా ఉండండి!`
    };

    if (isDemo || !apiKey) {
      return NextResponse.json({
        success: true,
        isDemo: true,
        script: fallbackScripts[language as Language] || fallbackScripts.en,
      });
    }

    // Call Claude for custom, personalized spoken script
    const anthropic = new Anthropic({ apiKey });
    const prompt = `You are an affectionate, respectful Indian healthcare companion speaking to an elderly patient named "${patientName}".
Write a simple, conversational, warm spoken guide for taking today's medicines.
Refer clearly to visual cues (color, shape like yellow tablet, white round pill) and daily landmarks (empty stomach, breakfast, lunch, bedtime).
Target Language: ${language} (hi = Hindi, ta = Tamil, te = Telugu, en = English).

Medication list:
Morning: ${morningMeds.map((m: ScheduleItem) => `${m.medicine_name} (${m.color_shape_hint}) - ${m.timing}`).join(', ')}
Afternoon: ${afternoonMeds.map((m: ScheduleItem) => `${m.medicine_name} (${m.color_shape_hint}) - ${m.timing}`).join(', ')}
Night: ${nightMeds.map((m: ScheduleItem) => `${m.medicine_name} (${m.color_shape_hint}) - ${m.timing}`).join(', ')}

Return ONLY the plain spoken text ready to be read aloud via Text-to-Speech. Do NOT include markdown headers, bullet points, or stage directions.`;

    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: 600,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const script =
      response.content[0].type === 'text'
        ? response.content[0].text.trim()
        : fallbackScripts[language as Language] || fallbackScripts.en;

    return NextResponse.json({
      success: true,
      isDemo: false,
      script,
    });
  } catch (error: any) {
    console.error('Voice script generation error:', error);
    const lang = 'hi';
    return NextResponse.json({
      success: true,
      fallbackMode: true,
      script:
        'नमस्ते! कृपया अपनी सुबह की गोली नाश्ते के बाद गुनगुने पानी से लें। दोपहर और रात की दवा समय पर लें और खूब पानी पिएं।',
    });
  }
}
