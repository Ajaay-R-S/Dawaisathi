import { HealthReading, Language, RiskEvaluationResult, RiskLevel } from '@/types';

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
  const { type, value_numeric, value_secondary, meal_context, patient_name = 'Patient', emergency_phone = '+919876543210', language = 'hi' } = input;

  let risk_level: RiskLevel = 'normal';
  let risk_title = '';
  let risk_message = '';
  const action_steps: string[] = [];
  let should_notify_emergency = false;

  // Filter history for this type
  const typeHistory = history.filter((h) => h.type === type && typeof h.value_numeric === 'number');

  // Trend Rule 1: 3 Rising Readings in a Row Check
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

  // ------------------- BLOOD SUGAR RULES -------------------
  if (type === 'sugar') {
    const sugar = value_numeric;

    if (sugar < 70) {
      risk_level = 'high';
      should_notify_emergency = true;
      risk_title = language === 'hi' ? 'गंभीर चेतावनी: लो शुगर (Hypoglycemia)' : 'CRITICAL ALERT: Low Blood Sugar (<70)';
      risk_message =
        language === 'hi'
          ? `ब्लड शुगर ${sugar} mg/dL है, जो खतरनाक रूप से कम है। चक्कर या बेहोशी का खतरा है!`
          : `Blood sugar is dangerously low at ${sugar} mg/dL. Risk of dizziness or fainting!`;
      action_steps.push(
        language === 'hi' ? 'तुरंत 3 चम्मच चीनी, ग्लूकोज पाउडर या आधा गिलास फलों का जूस पिएं।' : 'Immediately consume 3 teaspoons of sugar, honey, or half cup fruit juice.',
        language === 'hi' ? '15 मिनट आराम करें और दोबारा शुगर नापें।' : 'Rest quietly for 15 minutes and re-test sugar.',
        language === 'hi' ? 'यदि चक्कर या पसीना न रुके तो तुरंत डॉक्टर या 108 पर संपर्क करें।' : 'If sweating or shaking continues, contact doctor or call 108.'
      );
    } else if (sugar > 300) {
      risk_level = 'high';
      should_notify_emergency = true;
      risk_title = language === 'hi' ? 'गंभीर चेतावनी: अत्यधिक हाई शुगर (>300)' : 'CRITICAL ALERT: Extremely High Sugar (>300)';
      risk_message =
        language === 'hi'
          ? `ब्लड शुगर ${sugar} mg/dL है। यह आपातकालीन स्थिति (केतोएसिडोसिस) का संकेत है!`
          : `Blood sugar is critically high at ${sugar} mg/dL. Risk of ketoacidosis emergency!`;
      action_steps.push(
        language === 'hi' ? 'तुरंत 2-3 गिलास सादा गुनगुना पानी पिएं।' : 'Drink 2 to 3 glasses of warm water immediately to flush toxins.',
        language === 'hi' ? 'कोई भी मीठा, चावल या फल बिल्कुल न खाएं।' : 'Strictly avoid carbs, fruits, or sugary snacks.',
        language === 'hi' ? 'परिवार को सूचित करें और तुरंत डॉक्टर से संपर्क करें।' : 'Alert family member and consult your physician immediately.'
      );
    } else if (sugar > 200 || (meal_context === 'fasting' && sugar > 130) || (meal_context === 'post-meal' && sugar > 180)) {
      risk_level = 'moderate';
      risk_title = language === 'hi' ? 'चेतावनी: शुगर का स्तर बढ़ा हुआ है' : 'Warning: Elevated Blood Sugar';
      risk_message =
        language === 'hi'
          ? `शुगर रीडिंग ${sugar} mg/dL लक्ष्य से अधिक है।`
          : `Blood sugar reading of ${sugar} mg/dL is above optimal target range.`;
      action_steps.push(
        language === 'hi' ? 'हल्का भोजन लें और मीठी चाय व बिस्कुट से बचें।' : 'Eat light, low-glycemic food and avoid biscuits or sweet tea.',
        language === 'hi' ? '30 मिनट टहलें और पर्याप्त पानी पिएं।' : 'Take a 20-30 minute light walk and drink adequate water.',
        language === 'hi' ? 'अगली खुराक से पहले दोबारा नापें।' : 'Re-check before your next meal.'
      );
    } else {
      risk_level = 'normal';
      risk_title = language === 'hi' ? 'सुरक्षित: ब्लड शुगर सामान्य है' : 'Safe: Blood Sugar in Normal Range';
      risk_message =
        language === 'hi'
          ? `शुगर ${sugar} mg/dL सुरक्षित दायरे में है। शाबाश!`
          : `Blood sugar ${sugar} mg/dL is in your safe healthy target range. Well done!`;
      action_steps.push(
        language === 'hi' ? 'अपनी नियमित दिनचर्या और दवा समय पर जारी रखें।' : 'Continue regular routine and take scheduled medicines.',
        language === 'hi' ? 'संतुलित भोजन और हल्का व्यायाम करते रहें।' : 'Maintain balanced diet and regular light exercise.'
      );
    }
  }

  // ------------------- BLOOD PRESSURE RULES -------------------
  if (type === 'bp') {
    const sys = value_numeric;
    const dia = value_secondary || 80;

    if (sys > 180 || dia > 120) {
      risk_level = 'high';
      should_notify_emergency = true;
      risk_title = language === 'hi' ? 'आपातकालीन चेतावनी: हाइपरटेंसिव संकट (BP > 180/120)' : 'EMERGENCY: Hypertensive Crisis (BP > 180/120)';
      risk_message =
        language === 'hi'
          ? `ब्लड प्रेशर ${sys}/${dia} mmHg अत्यधिक खतरनाक है। स्ट्रोक या दिल का दौरा पड़ने का खतरा!`
          : `Blood pressure of ${sys}/${dia} mmHg is dangerously high. Severe risk of stroke or cardiac event!`;
      action_steps.push(
        language === 'hi' ? 'बिना हिले-डुले शांत होकर 10 मिनट सीधे बैठें।' : 'Sit down calmly in an upright position for 10 minutes.',
        language === 'hi' ? 'सीने में दर्द, सिरदर्द, धुंधला दिखने पर 108 पर कॉल करें।' : 'Check for chest tightness, severe headache, or numbness; call 108 if present.',
        language === 'hi' ? 'तुरंत आपातकालीन संपर्क को सूचित करें।' : 'Trigger immediate alert to emergency contact.'
      );
    } else if (sys < 90 || dia < 60) {
      risk_level = 'high';
      should_notify_emergency = true;
      risk_title = language === 'hi' ? 'गंभीर चेतावनी: लो बीपी (BP < 90/60)' : 'CRITICAL ALERT: Low Blood Pressure (BP < 90/60)';
      risk_message =
        language === 'hi'
          ? `ब्लड प्रेशर ${sys}/${dia} mmHg बहुत कम है। कमजोरी या बेहोशी आ सकती है!`
          : `Blood pressure is critically low at ${sys}/${dia} mmHg. Risk of fainting or collapse!`;
      action_steps.push(
        language === 'hi' ? 'तुरंत लेट जाएं और पैरों के नीचे तकिया रखकर ऊपर उठाएं।' : 'Lie down flat and elevate legs with a pillow to restore brain blood flow.',
        language === 'hi' ? 'एक गिलास पानी में एक चुटकी नमक और ओआरएस मिलाकर पिएं।' : 'Drink a glass of water with a pinch of salt or ORS solution.',
        language === 'hi' ? 'अचानक खड़े न हों।' : 'Do not stand up abruptly.'
      );
    } else if (sys >= 140 || dia >= 90) {
      risk_level = 'moderate';
      risk_title = language === 'hi' ? 'चेतावनी: हाई ब्लड प्रेशर (स्टेज 2)' : 'Warning: High Blood Pressure (Stage 2)';
      risk_message =
        language === 'hi'
          ? `बीपी रीडिंग ${sys}/${dia} mmHg सामान्य से अधिक है।`
          : `Blood pressure ${sys}/${dia} mmHg is elevated above the 130/80 target.`;
      action_steps.push(
        language === 'hi' ? 'नमक (सोडियम) और पापड़, अचार से परहेज करें।' : 'Avoid salty snacks, pickles, and processed food.',
        language === 'hi' ? '15 मिनट गहरी सांस लें और तनाव कम करें।' : 'Practice 15 minutes of quiet deep breathing.',
        language === 'hi' ? 'अपनी आज की बीपी की दवा समय पर लें।' : 'Ensure your prescribed BP tablet was taken.'
      );
    } else {
      risk_level = 'normal';
      risk_title = language === 'hi' ? 'सुरक्षित: ब्लड प्रेशर सामान्य है' : 'Safe: Blood Pressure Normal';
      risk_message =
        language === 'hi'
          ? `ब्लड प्रेशर ${sys}/${dia} mmHg एकदम सामान्य और सुरक्षित है।`
          : `Blood pressure ${sys}/${dia} mmHg is optimal and healthy.`;
      action_steps.push(
        language === 'hi' ? 'दैनिक दवाएं और व्यायाम जारी रखें।' : 'Continue daily medications and light walking.'
      );
    }
  }

  // ------------------- TREND RULES ESCALATION -------------------
  if (hasThreeRising) {
    if (risk_level === 'normal') risk_level = 'moderate';
    risk_title += language === 'hi' ? ' [ट्रेंड चेतावनी: लगातार 3 बार बढ़ा]' : ' [Trend Alert: 3 Consecutive Increases]';
    action_steps.unshift(
      language === 'hi'
        ? 'ध्यान दें: पिछले 3 मापों से आपकी रीडिंग लगातार बढ़ रही है। अपनी दवा और खानपान की समीक्षा करें।'
        : 'NOTE: Your readings have risen for 3 consecutive measurements. Review your diet and ensure no missed doses.'
    );
  }

  if (hasBigJump) {
    if (risk_level === 'normal') risk_level = 'moderate';
    risk_title += language === 'hi' ? ' [बड़ा उछाल: 7 दिन के औसत से 30% अधिक]' : ' [Sharp Spike: 30%+ Above 7-Day Average]';
    action_steps.unshift(
      language === 'hi'
        ? `चेतावनी: यह रीडिंग आपके 7 दिनों के औसत (${avg7Day}) से 30% ज्यादा है।`
        : `Spike Alert: This reading is more than 30% higher than your recent 7-day average of ${avg7Day}.`
    );
  }

  // ------------------- WHATSAPP SOS LINK GENERATION -------------------
  let readingDetail = '';
  if (type === 'sugar') {
    readingDetail = `Blood Sugar: ${value_numeric} mg/dL (${meal_context || 'reading'})`;
  } else {
    readingDetail = `Blood Pressure: ${value_numeric}/${value_secondary || 80} mmHg`;
  }

  const sosMessage = `🚨 *DAWAISAATHI HEALTH ALERT* 🚨
Patient: ${patient_name}
Recorded: ${nowDate} at ${nowTime}
${readingDetail}
Status: *${risk_level.toUpperCase()} RISK*
Message: ${risk_message}

Please check on ${patient_name} immediately or arrange a medical consultation.
(Sent automatically via DawaiSaathi Safety Loop)`;

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
