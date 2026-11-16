import { HealthReading, RiskEvaluationResult, RiskLevel } from '@/types';
import { Language } from '@/context/LanguageContext';

export interface VitalsInput {
  type: 'sugar' | 'bp';
  value_numeric: number; // sugar or systolic
  value_secondary?: number; // diastolic
  meal_context?: 'fasting' | 'post-meal' | 'random';
  patient_name?: string;
  emergency_phone?: string;
  language?: Language;
}

export function evaluateVitalsRisk(
  input: VitalsInput,
  history: HealthReading[] = []
): RiskEvaluationResult {
  const {
    type,
    value_numeric,
    value_secondary,
    meal_context,
    patient_name = 'Patient',
    emergency_phone = '+919876543210',
    language = 'en',
  } = input;

  let risk_level: RiskLevel = 'normal';
  let risk_title = '';
  let risk_message = '';
  const action_steps: string[] = [];
  let should_notify_emergency = false;

  // Filter history for this type
  const typeHistory = history.filter((h) => h.type === type && typeof h.value_numeric === 'number');

  // Trend Rule 1: 3 Rising Readings in a Row
  let hasThreeRising = false;
  if (typeHistory.length >= 2) {
    const prev1 = typeHistory[0].value_numeric;
    const prev2 = typeHistory[1].value_numeric;
    if (value_numeric > prev1 && prev1 > prev2) {
      hasThreeRising = true;
    }
  }

  // Trend Rule 2: Big Jump from 7-Day Average Check (>30% jump)
  let hasBigJump = false;
  let avg7Day = 0;
  if (typeHistory.length >= 3) {
    const recent = typeHistory.slice(0, 7);
    const sum = recent.reduce((acc, curr) => acc + curr.value_numeric, 0);
    avg7Day = Math.round(sum / recent.length);
    if (value_numeric >= avg7Day * 1.30) {
      hasBigJump = true;
    }
  }

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const nowDate = new Date().toLocaleDateString();

  // ------------------- MULTILINGUAL TEXT PACKS -------------------
  const TEXTS: Record<Language, any> = {
    en: {
      sugarLowTitle: 'CRITICAL ALERT: Low Blood Sugar (<70 mg/dL)',
      sugarLowMsg: `Blood sugar is dangerously low at ${value_numeric} mg/dL. Risk of dizziness or fainting!`,
      sugarLowSteps: [
        'Immediately consume 3 teaspoons of sugar, honey, or half cup fruit juice.',
        'Rest quietly for 15 minutes and re-test blood sugar.',
        'If sweating or shakiness continues, contact your doctor or call 108.',
      ],
      sugarHighTitle: 'CRITICAL ALERT: Extremely High Sugar (>300 mg/dL)',
      sugarHighMsg: `Blood sugar is critically high at ${value_numeric} mg/dL. Risk of ketoacidosis emergency!`,
      sugarHighSteps: [
        'Drink 2 to 3 glasses of plain warm water immediately to flush excess glucose.',
        'Strictly avoid fruits, rice, or any sweet foods.',
        'Alert family member and consult your physician immediately.',
      ],
      sugarModTitle: 'Warning: Elevated Blood Sugar',
      sugarModMsg: `Blood sugar reading of ${value_numeric} mg/dL is above your optimal target range.`,
      sugarModSteps: [
        'Eat light, low-glycemic food and avoid sweet tea or biscuits.',
        'Take a 20-30 minute gentle walk and drink adequate water.',
        'Re-check reading before your next meal.',
      ],
      sugarNormTitle: 'Safe: Blood Sugar in Normal Range',
      sugarNormMsg: `Blood sugar ${value_numeric} mg/dL is in your safe healthy target range. Well done!`,
      sugarNormSteps: [
        'Continue regular routine and take scheduled medicines.',
        'Maintain balanced diet and regular light physical activity.',
      ],
      bpCrisisTitle: 'EMERGENCY: Hypertensive Crisis (BP > 180/120)',
      bpCrisisMsg: `Blood pressure of ${value_numeric}/${value_secondary || 80} mmHg is dangerously high. Severe risk of stroke or cardiac event!`,
      bpCrisisSteps: [
        'Sit down calmly in an upright position for 10 minutes without exertion.',
        'Check for chest tightness, severe headache, or numbness; call 108 if present.',
        'Trigger immediate alert to your emergency contact.',
      ],
      bpLowTitle: 'CRITICAL ALERT: Low Blood Pressure (BP < 90/60)',
      bpLowMsg: `Blood pressure is critically low at ${value_numeric}/${value_secondary || 60} mmHg. Risk of fainting or collapse!`,
      bpLowSteps: [
        'Lie down flat and elevate legs with a pillow to restore brain blood flow.',
        'Drink a glass of water with a pinch of salt or ORS solution.',
        'Do not stand up abruptly.',
      ],
      bpModTitle: 'Warning: High Blood Pressure (Stage 2)',
      bpModMsg: `Blood pressure ${value_numeric}/${value_secondary || 80} mmHg is elevated above the 130/80 target.`,
      bpModSteps: [
        'Avoid salty snacks, pickles, and processed food.',
        'Practice 15 minutes of quiet deep breathing.',
        'Ensure your prescribed BP tablet was taken.',
      ],
      bpNormTitle: 'Safe: Blood Pressure Normal',
      bpNormMsg: `Blood pressure ${value_numeric}/${value_secondary || 80} mmHg is optimal and healthy.`,
      bpNormSteps: [
        'Continue daily medications and light walking.',
      ],
      trendRiseSuffix: ' [Trend Alert: 3 Consecutive Increases]',
      trendRiseStep: 'NOTE: Your readings have risen for 3 consecutive measurements. Review your diet and ensure no missed doses.',
      jumpSuffix: ' [Sharp Spike: 30%+ Above 7-Day Average]',
      jumpStep: `Spike Alert: This reading is more than 30% higher than your recent 7-day average of ${avg7Day}.`,
      sosHeader: '🚨 DAWAISAATHI HEALTH ALERT 🚨',
      sosFooter: '(Sent automatically via DawaiSaathi Safety Loop)',
    },
    hi: {
      sugarLowTitle: 'गंभीर चेतावनी: लो शुगर (Hypoglycemia)',
      sugarLowMsg: `ब्लड शुगर ${value_numeric} mg/dL है, जो खतरनाक रूप से कम है। चक्कर या बेहोशी का खतरा है!`,
      sugarLowSteps: [
        'तुरंत 3 चम्मच चीनी, शहद या आधा गिलास फलों का जूस लें।',
        '15 मिनट आराम करें और दोबारा शुगर नापें।',
        'यदि कंपकंपी न रुके तो तुरंत डॉक्टर या 108 पर संपर्क करें।',
      ],
      sugarHighTitle: 'गंभीर चेतावनी: अत्यधिक हाई शुगर (>300)',
      sugarHighMsg: `ब्लड शुगर ${value_numeric} mg/dL है। यह आपातकालीन स्थिति का संकेत है!`,
      sugarHighSteps: [
        'तुरंत 2-3 गिलास सादा गुनगुना पानी पिएं।',
        'कोई भी मीठा, चावल या फल बिल्कुल न खाएं।',
        'परिवार को सूचित करें और तुरंत डॉक्टर से संपर्क करें।',
      ],
      sugarModTitle: 'चेतावनी: शुगर का स्तर बढ़ा हुआ है',
      sugarModMsg: `शुगर रीडिंग ${value_numeric} mg/dL लक्ष्य से अधिक है।`,
      sugarModSteps: [
        'हल्का भोजन लें और मीठी चाय व बिस्कुट से बचें।',
        '30 मिनट टहलें और पर्याप्त पानी पिएं।',
        'अगली खुराक से पहले दोबारा नापें।',
      ],
      sugarNormTitle: 'सुरक्षित: ब्लड शुगर सामान्य है',
      sugarNormMsg: `शुगर ${value_numeric} mg/dL सुरक्षित दायरे में है। शाबाश!`,
      sugarNormSteps: [
        'अपनी नियमित दिनचर्या और दवा समय पर जारी रखें।',
        'संतुलित भोजन और हल्का व्यायाम करते रहें।',
      ],
      bpCrisisTitle: 'आपातकालीन चेतावनी: बीपी संकट (BP > 180/120)',
      bpCrisisMsg: `ब्लड प्रेशर ${value_numeric}/${value_secondary || 80} mmHg अत्यधिक खतरनाक है। स्ट्रोक का खतरा!`,
      bpCrisisSteps: [
        'बिना हिले-डुले शांत होकर 10 मिनट सीधे बैठें।',
        'सीने में दर्द, सिरदर्द होने पर 108 पर कॉल करें।',
        'तुरंत आपातकालीन संपर्क को सूचित करें।',
      ],
      bpLowTitle: 'गंभीर चेतावनी: लो बीपी (BP < 90/60)',
      bpLowMsg: `ब्लड प्रेशर ${value_numeric}/${value_secondary || 60} mmHg बहुत कम है। कमजोरी आ सकती है!`,
      bpLowSteps: [
        'तुरंत लेट जाएं और पैरों के नीचे तकिया रखकर ऊपर उठाएं।',
        'एक गिलास पानी में एक चुटकी नमक मिलाकर पिएं।',
        'अचानक खड़े न हों।',
      ],
      bpModTitle: 'चेतावनी: हाई ब्लड प्रेशर (स्टेज 2)',
      bpModMsg: `बीपी रीडिंग ${value_numeric}/${value_secondary || 80} mmHg सामान्य से अधिक है।`,
      bpModSteps: [
        'नमक और तले-भुने खाने से परहेज करें।',
        '15 मिनट गहरी सांस लें और तनाव कम करें।',
        'अपनी आज की बीपी की दवा समय पर लें।',
      ],
      bpNormTitle: 'सुरक्षित: ब्लड प्रेशर सामान्य है',
      bpNormMsg: `ब्लड प्रेशर ${value_numeric}/${value_secondary || 80} mmHg सामान्य और सुरक्षित है।`,
      bpNormSteps: [
        'दैनिक दवाएं और व्यायाम जारी रखें।',
      ],
      trendRiseSuffix: ' [ट्रेंड चेतावनी: लगातार 3 बार बढ़ा]',
      trendRiseStep: 'ध्यान दें: पिछले 3 मापों से आपकी रीडिंग लगातार बढ़ रही है। अपनी दवा की समीक्षा करें।',
      jumpSuffix: ' [बड़ा उछाल: 7 दिन के औसत से 30% अधिक]',
      jumpStep: `चेतावनी: यह रीडिंग आपके 7 दिनों के औसत (${avg7Day}) से 30% ज्यादा है।`,
      sosHeader: '🚨 दवाई साथी स्वास्थ्य आपातकालीन सूचना 🚨',
      sosFooter: '(दवाई साथी सेफ्टी लूप द्वारा स्वतः प्रेषित)',
    },
    ta: {
      sugarLowTitle: 'ஆபத்து எச்சரிக்கை: குறைந்த சர்க்கரை (<70 mg/dL)',
      sugarLowMsg: `இரத்த சர்க்கரை ${value_numeric} mg/dL ஆக ஆபத்தான அளவுக்கு குறைந்துள்ளது!`,
      sugarLowSteps: [
        'உடனடியாக 3 தேக்கரண்டி சர்க்கரை, தேன் அல்லது பழச்சாறு குடிக்கவும்.',
        '15 நிமிடங்கள் ஓய்வெடுத்து மீண்டும் சர்க்கரையை பரிசோதிக்கவும்.',
        'நடுக்கம் நிற்கவில்லை என்றால் மருத்துவரை அணுகவும்.',
      ],
      sugarHighTitle: 'ஆபத்து எச்சரிக்கை: அதிக சர்க்கரை (>300 mg/dL)',
      sugarHighMsg: `இரத்த சர்க்கரை ${value_numeric} mg/dL ஆக மிகவும் அதிகமாக உள்ளது!`,
      sugarHighSteps: [
        'உடனடியாக 2-3 டம்ளர் வெதுவெதுப்பான நீர் குடிக்கவும்.',
        'இனிப்பு மற்றும் பழங்களைத் தவிர்க்கவும்.',
        'குடும்பத்தினரிடம் தெரிவித்து உடனடியாக மருத்துவரை அணுகவும்.',
      ],
      sugarModTitle: 'எச்சரிக்கை: அதிகரித்த இரத்த சர்க்கரை',
      sugarModMsg: `சர்க்கரை அளவு ${value_numeric} mg/dL இலக்கை விட அதிகமாக உள்ளது.`,
      sugarModSteps: [
        'எளிய உணவை உட்கொள்ளவும், இனிப்பு தேநீரை தவிர்க்கவும்.',
        '20 நிமிடங்கள் மெதுவாக நடைப்பயிற்சி செய்யவும்.',
        'அடுத்த உணவுக்கு முன் மீண்டும் சோதிக்கவும்.',
      ],
      sugarNormTitle: 'பாதுகாப்பானது: சர்க்கரை அளவு இயல்பு',
      sugarNormMsg: `சர்க்கரை ${value_numeric} mg/dL பாதுகாப்பான வரம்பில் உள்ளது. நன்று!`,
      sugarNormSteps: [
        'வழக்கமான அட்டவணைப்படி மருந்துகளைத் தொடரவும்.',
      ],
      bpCrisisTitle: 'அவசர நிலை: கடுமையான BP (> 180/120)',
      bpCrisisMsg: `இரத்த அழுத்தம் ${value_numeric}/${value_secondary || 80} mmHg ஆபத்தான அளவுக்கு அதிகமாக உள்ளது!`,
      bpCrisisSteps: [
        '10 நிமிடங்கள் அமைதியாக உட்காரவும்.',
        'மார்பு வலி இருந்தால் 108 ஐ அழைக்கவும்.',
        'குடும்பத்தினருக்கு அவசர தகவல் அனுப்பவும்.',
      ],
      bpLowTitle: 'எச்சரிக்கை: குறைந்த BP (< 90/60)',
      bpLowMsg: `இரத்த அழுத்தம் ${value_numeric}/${value_secondary || 60} mmHg ஆக மிகவும் குறைந்துள்ளது!`,
      bpLowSteps: [
        'படுத்துக்கொண்டு கால்களை உயர்த்தி வைக்கவும்.',
        'உப்பு கலந்த நீர் குடிக்கவும்.',
        'திடீரென எழுந்து நிற்க வேண்டாம்.',
      ],
      bpModTitle: 'எச்சரிக்கை: உயர் இரத்த அழுத்தம்',
      bpModMsg: `இரத்த அழுத்தம் ${value_numeric}/${value_secondary || 80} mmHg இலக்கை விட அதிகமாக உள்ளது.`,
      bpModSteps: [
        'உப்பு உணவுகளைத் தவிர்க்கவும்.',
        'இன்றைய BP மாத்திரையை தவறாமல் எடுத்துக்கொள்ளவும்.',
      ],
      bpNormTitle: 'பாதுகாப்பானது: இரத்த அழுத்தம் இயல்பு',
      bpNormMsg: `இரத்த அழுத்தம் ${value_numeric}/${value_secondary || 80} mmHg இயல்பானது.`,
      bpNormSteps: [
        'வழக்கமான மருந்துகளைத் தொடரவும்.',
      ],
      trendRiseSuffix: ' [போக்கு எச்சரிக்கை: 3 முறை தொடர் உயர்வு]',
      trendRiseStep: 'குறிப்பு: உங்கள் அளவுகள் தொடர்ந்து 3 முறை உயர்ந்துள்ளன. உணவை கவனிக்கவும்.',
      jumpSuffix: ' [கடுமையான உயர்வு: சராசரியை விட 30% அதிகம்]',
      jumpStep: `எச்சரிக்கை: இந்த அளவு உங்கள் 7 நாள் சராசரியை (${avg7Day}) விட 30% அதிகம்.`,
      sosHeader: '🚨 மருந்து தோழன் அவசர எச்சரிக்கை 🚨',
      sosFooter: '(மருந்து தோழன் மூலம் தானாக அனுப்பப்பட்டது)',
    },
    te: {
      sugarLowTitle: 'ప్రమాదకర హెచ్చరిక: తక్కువ షుగర్ (<70 mg/dL)',
      sugarLowMsg: `బ్లడ్ షుగర్ ${value_numeric} mg/dL కి ప్రమాదకరంగా పడిపోయింది!`,
      sugarLowSteps: [
        'వెంటనే 3 చెంచాల చక్కెర, తేనె లేదా పండ్ల రసం తీసుకోండి.',
        '15 నిమిషాలు విశ్రాంతి తీసుకుని మళ్ళీ తనిఖీ చేయండి.',
        'నీరసం తగ్గకపోతే వైద్యుడిని సంప్రదించండి.',
      ],
      sugarHighTitle: 'ప్రమాదకర హెచ్చరిక: అత్యధిక షుగర్ (>300 mg/dL)',
      sugarHighMsg: `బ్లడ్ షుగర్ ${value_numeric} mg/dL తో చాలా ప్రమాదకరంగా ఉంది!`,
      sugarHighSteps: [
        'వెంటనే 2-3 గ్లాసుల గోరువెచ్చని నీరు త్రాగండి.',
        'తీపి మరియు పండ్లను పూర్తిగా మానేయండి.',
        'కుటుంబానికి తెలిపి వెంటనే వైద్యుడిని సంప్రదించండి.',
      ],
      sugarModTitle: 'హెచ్చరిక: పెరిగిన బ్లడ్ షుగర్',
      sugarModMsg: `షుగర్ రీడింగ్ ${value_numeric} mg/dL లక్ష్యం కంటే ఎక్కువ ఉంది.`,
      sugarModSteps: [
        'తేలికపాటి ఆహారం తీసుకోండి, తీపి టీ మానేయండి.',
        '20 నిమిషాలు నడవండి మరియు తగినంత నీరు త్రాగండి.',
        'తదుపరి భోజనానికి ముందు మళ్ళీ తనిఖీ చేయండి.',
      ],
      sugarNormTitle: 'సురక్షితం: బ్లడ్ షుగర్ సాధారణం',
      sugarNormMsg: `బ్లడ్ షుగర్ ${value_numeric} mg/dL సురక్షిత పరిధిలో ఉంది. బాగుంది!`,
      sugarNormSteps: [
        'సమయానికి మందులు వేసుకోవడం కొనసాగించండి.',
      ],
      bpCrisisTitle: 'అత్యవసర పరిస్థితి: తీవ్రమైన బీపీ (> 180/120)',
      bpCrisisMsg: `రక్తపోటు ${value_numeric}/${value_secondary || 80} mmHg ప్రమాదకరంగా ఉంది! గుండె ప్రమాదం పొంచి ఉంది.`,
      bpCrisisSteps: [
        '10 నిమిషాలు కదలకుండా ప్రశాంతంగా కూర్చోండి.',
        'ఛాతీలో నొప్పి ఉంటే 108 కి కాల్ చేయండి.',
        'కుటుంబానికి వెంటనే సమాచారం అందించండి.',
      ],
      bpLowTitle: 'హెచ్చరిక: తక్కువ బీపీ (< 90/60)',
      bpLowMsg: `రక్తపోటు ${value_numeric}/${value_secondary || 60} mmHg కి పడిపోయింది! స్పృహ తప్పే ప్రమాదం ఉంది.`,
      bpLowSteps: [
        'పడుకుని కాళ్ళ క్రింద దిండు పెట్టుకోండి.',
        'ఉప్పు కలిపిన నీరు త్రాగండి.',
        'ఒక్కసారిగా పైకి లేవకండి.',
      ],
      bpModTitle: 'హెచ్చరిక: అధిక రక్తపోటు',
      bpModMsg: `రక్తపోటు ${value_numeric}/${value_secondary || 80} mmHg సాధారణం కంటే ఎక్కువ ఉంది.`,
      bpModSteps: [
        'ఉప్పు ఎక్కువగా ఉండే ఆహారాలకు దూరంగా ఉండండి.',
        'ఈరోజు బీపీ మాత్ర తప్పక వేసుకోండి.',
      ],
      bpNormTitle: 'సురక్షితం: రక్తపోటు సాధారణం',
      bpNormMsg: `రక్తపోటు ${value_numeric}/${value_secondary || 80} mmHg సాధారణ పరిధిలో ఉంది.`,
      bpNormSteps: [
        'రోజువారీ మందులను కొనసాగించండి.',
      ],
      trendRiseSuffix: ' [ట్రెండ్ హెచ్చరిక: వరుసగా 3 సార్లు పెరిగింది]',
      trendRiseStep: 'గమనిక: మీ రీడింగ్‌లు వరుసగా 3 సార్లు పెరిగాయి. మందులు మరియు ఆహారాన్ని సమీక్షించండి.',
      jumpSuffix: ' [తీవ్ర పెరుగుదల: సగటు కంటే 30% ఎక్కువ]',
      jumpStep: `హెచ్చరిక: ఈ రీడింగ్ మీ 7 రోజుల సగటు (${avg7Day}) కంటే 30% ఎక్కువ.`,
      sosHeader: '🚨 మందుల సహచరి అత్యవసర హెచ్చరిక 🚨',
      sosFooter: '(మందుల సహచరి ద్వారా ఆటోమేటిక్‌గా పంపబడింది)',
    },
  };

  const L = TEXTS[language] || TEXTS.en;

  // ------------------- BLOOD SUGAR RULES -------------------
  if (type === 'sugar') {
    const sugar = value_numeric;

    if (sugar < 70) {
      risk_level = 'high';
      should_notify_emergency = true;
      risk_title = L.sugarLowTitle;
      risk_message = L.sugarLowMsg;
      action_steps.push(...L.sugarLowSteps);
    } else if (sugar > 300) {
      risk_level = 'high';
      should_notify_emergency = true;
      risk_title = L.sugarHighTitle;
      risk_message = L.sugarHighMsg;
      action_steps.push(...L.sugarHighSteps);
    } else if (sugar > 200 || (meal_context === 'fasting' && sugar > 130) || (meal_context === 'post-meal' && sugar > 180)) {
      risk_level = 'moderate';
      risk_title = L.sugarModTitle;
      risk_message = L.sugarModMsg;
      action_steps.push(...L.sugarModSteps);
    } else {
      risk_level = 'normal';
      risk_title = L.sugarNormTitle;
      risk_message = L.sugarNormMsg;
      action_steps.push(...L.sugarNormSteps);
    }
  }

  // ------------------- BLOOD PRESSURE RULES -------------------
  if (type === 'bp') {
    const sys = value_numeric;
    const dia = value_secondary || 80;

    if (sys > 180 || dia > 120) {
      risk_level = 'high';
      should_notify_emergency = true;
      risk_title = L.bpCrisisTitle;
      risk_message = L.bpCrisisMsg;
      action_steps.push(...L.bpCrisisSteps);
    } else if (sys < 90 || dia < 60) {
      risk_level = 'high';
      should_notify_emergency = true;
      risk_title = L.bpLowTitle;
      risk_message = L.bpLowMsg;
      action_steps.push(...L.bpLowSteps);
    } else if (sys >= 140 || dia >= 90) {
      risk_level = 'moderate';
      risk_title = L.bpModTitle;
      risk_message = L.bpModMsg;
      action_steps.push(...L.bpModSteps);
    } else {
      risk_level = 'normal';
      risk_title = L.bpNormTitle;
      risk_message = L.bpNormMsg;
      action_steps.push(...L.bpNormSteps);
    }
  }

  // ------------------- TREND RULES ESCALATION -------------------
  if (hasThreeRising) {
    if (risk_level === 'normal') risk_level = 'moderate';
    risk_title += L.trendRiseSuffix;
    action_steps.unshift(L.trendRiseStep);
  }

  if (hasBigJump) {
    if (risk_level === 'normal') risk_level = 'moderate';
    risk_title += L.jumpSuffix;
    action_steps.unshift(L.jumpStep);
  }

  // ------------------- WHATSAPP SOS LINK GENERATION -------------------
  let readingDetail = '';
  if (type === 'sugar') {
    readingDetail = `Blood Sugar: ${value_numeric} mg/dL (${meal_context || 'reading'})`;
  } else {
    readingDetail = `Blood Pressure: ${value_numeric}/${value_secondary || 80} mmHg`;
  }

  const sosMessage = `${L.sosHeader}
Patient: ${patient_name}
Date & Time: ${nowDate} at ${nowTime}
${readingDetail}
Status: *${risk_level.toUpperCase()} RISK*
Message: ${risk_message}

Please check immediately.
${L.sosFooter}`;

  const cleanPhone = emergency_phone.replace(/[^0-9]/g, '');
  const whatsapp_url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(sosMessage)}`;

  return {
    risk_level,
    risk_title,
    risk_message,
    action_steps,
    should_notify_emergency,
    whatsapp_text: whatsapp_url,
  };
}
