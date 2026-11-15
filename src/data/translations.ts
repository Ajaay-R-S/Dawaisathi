import { Language } from '@/types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  emergencyTitle: string;
  callAmbulance: string;
  notifyFamily: string;
  homeButtons: {
    scanPrescription: string;
    scanSub: string;
    logVitals: string;
    logSub: string;
    todaySchedule: string;
    todaySub: string;
  };
  navigation: {
    home: string;
    scan: string;
    schedule: string;
    vitals: string;
    safety: string;
    generics: string;
    limits: string;
  };
  streak: {
    title: string;
    days: string;
    encouragement: string;
  };
  voicePlayer: {
    playTitle: string;
    playing: string;
    paused: string;
    listenInstructions: string;
    stop: string;
  };
  vitals: {
    title: string;
    sugarTab: string;
    bpTab: string;
    typeReading: string;
    voiceReading: string;
    cameraReading: string;
    fasting: string;
    postMeal: string;
    random: string;
    systolic: string;
    diastolic: string;
    sugarUnit: string;
    bpUnit: string;
    saveBtn: string;
    trendTitle: string;
    voiceHint: string;
    voiceListening: string;
  };
  prescription: {
    title: string;
    takePhoto: string;
    uploadFile: string;
    analyzing: string;
    confidenceWarning: string;
    verifyItems: string;
    saveSchedule: string;
    doctorNotes: string;
    genericSavingsHeader: string;
  };
  disclaimer: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  hi: {
    appName: 'दवाई साथी',
    tagline: 'बुजुर्गों और परिवारों के लिए आसान, सुरक्षित स्वास्थ्य साथी',
    emergencyTitle: 'आपातकालीन सहायता (Emergency)',
    callAmbulance: '108 एम्बुलेंस बुलाएं',
    notifyFamily: 'परिवार को WhatsApp SOS भेजें',
    homeButtons: {
      scanPrescription: 'पर्ची स्कैन करें',
      scanSub: 'कैमरे से फोटो खींचें या अपलोड करें',
      logVitals: 'शुगर / बीपी नापें',
      logSub: 'बोलकर, फोटो से या टाइप करके दर्ज करें',
      todaySchedule: 'आज की दवाइयां',
      todaySub: 'सुबह, दोपहर, रात का शेड्यूल देखें'
    },
    navigation: {
      home: 'होम',
      scan: 'पर्ची स्कैन',
      schedule: 'शेड्यूल',
      vitals: 'शुगर / बीपी',
      safety: 'दवा सुरक्षा',
      generics: 'सस्ती दवा',
      limits: 'सीमाएं व नियम'
    },
    streak: {
      title: 'दवा की निरंतरता (Streak)',
      days: 'दिन लगातार ली',
      encouragement: 'बहुत खूब! आपने 6 दिनों से समय पर दवा ली है।'
    },
    voicePlayer: {
      playTitle: 'दवा का समय सुनें (आवाज में)',
      playing: 'आवाज चल रही है...',
      paused: 'रुकी हुई है',
      listenInstructions: 'दवा खाने का पूरा तरीका अपनी भाषा में सुनें',
      stop: 'रोकें'
    },
    vitals: {
      title: 'शुगर और ब्लड प्रेशर (BP) डायरी',
      sugarTab: 'ब्लड शुगर (Sugar)',
      bpTab: 'ब्लड प्रेशर (BP)',
      typeReading: 'टाइप करें',
      voiceReading: 'बोलकर बताएं',
      cameraReading: 'मशीन की फोटो लें',
      fasting: 'खाली पेट (Fasting)',
      postMeal: 'खाना खाने के बाद',
      random: 'कभी भी (Random)',
      systolic: 'ऊपर का बीपी (Systolic)',
      diastolic: 'नीचे का बीपी (Diastolic)',
      sugarUnit: 'mg/dL',
      bpUnit: 'mmHg',
      saveBtn: 'रीडिंग सुरक्षित करें',
      trendTitle: 'पिछले 7 दिनों का चार्ट',
      voiceHint: 'माइक दबाकर बोलें: "शुगर 145" या "बीपी 130 80"',
      voiceListening: 'सुन रहे हैं... कृपया बोलें'
    },
    prescription: {
      title: 'डॉक्टर का पर्चा (Prescription) जांचें',
      takePhoto: 'कैमरे से फोटो लें',
      uploadFile: 'गैलरी से पर्चा चुनें',
      analyzing: 'एआई पर्चा पढ़ रहा है...',
      confidenceWarning: 'कृपया लाल रंग वाली दवा ध्यान से देखें और सही करें',
      verifyItems: 'दवाएं जांचें और पुष्टि करें',
      saveSchedule: 'शेड्यूल में जोड़ें',
      doctorNotes: 'डॉक्टर की सलाह',
      genericSavingsHeader: 'सस्ती जेनेरिक दवा (जन औषधि) के विकल्प'
    },
    disclaimer: 'यह एक सहायता उपकरण है, डॉक्टर नहीं। दवा बदलने या गंभीर स्थिति में तुरंत डॉक्टर से संपर्क करें।'
  },
  en: {
    appName: 'DawaiSaathi',
    tagline: 'Easy, Safe & Smart Healthcare Buddy for Families & Elders',
    emergencyTitle: 'Emergency Quick Action',
    callAmbulance: 'Call 108 Ambulance',
    notifyFamily: 'Send Family WhatsApp SOS',
    homeButtons: {
      scanPrescription: 'Scan Prescription',
      scanSub: 'Capture photo or upload prescription',
      logVitals: 'Log Sugar / BP',
      logSub: 'Speak, snap machine screen, or type',
      todaySchedule: "Today's Medicines",
      todaySub: 'Morning, afternoon & night timetable'
    },
    navigation: {
      home: 'Home',
      scan: 'Prescription',
      schedule: 'Schedule',
      vitals: 'Sugar & BP',
      safety: 'Drug Safety',
      generics: 'Generic Savings',
      limits: 'How it Works'
    },
    streak: {
      title: 'Medicine Streak',
      days: 'Days in a row',
      encouragement: 'Great job! You have taken medicines on time for 6 straight days.'
    },
    voicePlayer: {
      playTitle: 'Listen to Medication Schedule',
      playing: 'Speaking...',
      paused: 'Paused',
      listenInstructions: 'Hear instructions read aloud in your language',
      stop: 'Stop'
    },
    vitals: {
      title: 'Sugar & Blood Pressure Diary',
      sugarTab: 'Blood Sugar',
      bpTab: 'Blood Pressure',
      typeReading: 'Type',
      voiceReading: 'Speak (Voice)',
      cameraReading: 'Snap Screen',
      fasting: 'Fasting',
      postMeal: 'Post Meal',
      random: 'Random',
      systolic: 'Systolic (Top)',
      diastolic: 'Diastolic (Bottom)',
      sugarUnit: 'mg/dL',
      bpUnit: 'mmHg',
      saveBtn: 'Save Reading',
      trendTitle: '7-Day Trend Chart',
      voiceHint: 'Tap mic and speak: "sugar 145" or "BP 130 over 80"',
      voiceListening: 'Listening... Please speak now'
    },
    prescription: {
      title: 'Prescription Reader & Safety Check',
      takePhoto: 'Take Photo with Camera',
      uploadFile: 'Upload Prescription File',
      analyzing: 'AI is analyzing prescription...',
      confidenceWarning: 'Please carefully verify medicines highlighted in RED',
      verifyItems: 'Review & Confirm Medicines',
      saveSchedule: 'Save to Daily Schedule',
      doctorNotes: "Doctor's Advice",
      genericSavingsHeader: 'Cheaper Generic Alternatives (Jan Aushadhi)'
    },
    disclaimer: 'This is a support tool, not a doctor. Always consult your healthcare provider before changing medications.'
  },
  ta: {
    appName: 'மருந்து தோழன் (DawaiSaathi)',
    tagline: 'எளிய, பாதுகாப்பான மருத்துவ உதவியாளர்',
    emergencyTitle: 'அவசர உதவி (Emergency)',
    callAmbulance: '108 ஆம்புலன்ஸை அழைக்கவும்',
    notifyFamily: 'குடும்பத்திற்கு வாட்ஸ்அப் SOS அனுப்பவும்',
    homeButtons: {
      scanPrescription: 'மருந்து சீட்டை ஸ்கேன் செய்க',
      scanSub: 'கேமரா மூலம் புகைப்படம் எடுக்கவும்',
      logVitals: 'சர்க்கரை / BP பதிவு செய்க',
      logSub: 'குரல், புகைப்படம் அல்லது தட்டச்சு மூலம்',
      todaySchedule: 'இன்றைய மருந்துகள்',
      todaySub: 'காலை, மதியம், இரவு அட்டவணை'
    },
    navigation: {
      home: 'முகப்பு',
      scan: 'மருந்து சீட்டு',
      schedule: 'அட்டவணை',
      vitals: 'சர்க்கரை & BP',
      safety: 'மருந்து பாதுகாப்பு',
      generics: 'மலிவு விலை மருந்து',
      limits: 'விளக்கம் & வரம்புகள்'
    },
    streak: {
      title: 'மருந்து ஒழுங்குமுறை',
      days: 'நாட்கள் தொடர்ச்சி',
      encouragement: 'சிறப்பு! நீங்கள் 6 நாட்களாக சரியான நேரத்தில் மருந்து எடுத்து வருகிறீர்கள்.'
    },
    voicePlayer: {
      playTitle: 'மருந்து அட்டவணையை குரலில் கேளுங்கள்',
      playing: 'பேசுகிறது...',
      paused: 'நிறுத்தப்பட்டது',
      listenInstructions: 'உங்கள் மொழியில் தெளிவாக கேட்கவும்',
      stop: 'நிறுத்து'
    },
    vitals: {
      title: 'சர்க்கரை & இரத்த அழுத்தக் குறிப்பேடு',
      sugarTab: 'இரத்த சர்க்கரை',
      bpTab: 'இரத்த அழுத்தம் (BP)',
      typeReading: 'தட்டச்சு செய்க',
      voiceReading: 'குரலில் கூறவும்',
      cameraReading: 'மெஷின் புகைப்படம்',
      fasting: 'சாப்பிடுவதற்கு முன்',
      postMeal: 'சாப்பிட்ட பின்',
      random: 'பொதுவான நேரம்',
      systolic: 'மேல் BP',
      diastolic: 'கீழ் BP',
      sugarUnit: 'mg/dL',
      bpUnit: 'mmHg',
      saveBtn: 'பதிவு செய்க',
      trendTitle: '7 நாள் வரைபடம்',
      voiceHint: 'மைக் அழுத்தி பேசவும்: "சர்க்கரை 140"',
      voiceListening: 'கேட்கிறது... இப்போது பேசவும்'
    },
    prescription: {
      title: 'மருந்து சீட்டு ஆய்வு',
      takePhoto: 'கேமரா மூலம் படம் எடு',
      uploadFile: 'கோப்பை பதிவேற்றவும்',
      analyzing: 'சீட்டு ஆய்வு செய்யப்படுகிறது...',
      confidenceWarning: 'சிவப்பு நிறத்தில் உள்ள மருந்துகளை உறுதிப்படுத்தவும்',
      verifyItems: 'மருந்துகளை சரிபார்க்கவும்',
      saveSchedule: 'அட்டவணையில் சேமிக்கவும்',
      doctorNotes: 'மருத்துவர் குறிப்பு',
      genericSavingsHeader: 'மலிவான ஜன் ஔஷதி மாற்றுகள்'
    },
    disclaimer: 'இது ஒரு துணை கருவி மட்டுமே, மருத்துவர் அல்ல. மருத்துவரை கலந்தாலோசிக்கவும்.'
  },
  te: {
    appName: 'మందుల సహచరి (DawaiSaathi)',
    tagline: 'సులభమైన, సురక్షితమైన ఆరోగ్య నేస్తం',
    emergencyTitle: 'అత్యవసర సహాయం (Emergency)',
    callAmbulance: '108 అంబులెన్స్‌కు కాల్ చేయండి',
    notifyFamily: 'కుటుంబానికి వాట్సాప్ SOS పంపండి',
    homeButtons: {
      scanPrescription: 'ప్రిస్క్రిప్షన్ స్కాన్ చేయండి',
      scanSub: 'కెమెరాతో ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి',
      logVitals: 'షుగర్ / BP నమోదు చేయండి',
      logSub: 'వాయిస్, ఫోటో లేదా టైప్ చేయడం ద్వారా',
      todaySchedule: 'నేటి మందులు',
      todaySub: 'ఉదయం, మధ్యాహ్నం, రాత్రి వేళలు'
    },
    navigation: {
      home: 'హోమ్',
      scan: 'ప్రిస్క్రిప్షన్',
      schedule: 'షెడ్యూల్',
      vitals: 'షుగర్ & BP',
      safety: 'మందుల భద్రత',
      generics: 'చౌకైన మందులు',
      limits: 'పరిమితులు & సమాచారం'
    },
    streak: {
      title: 'మందుల క్రమం (Streak)',
      days: 'రోజులు వరుసగా',
      encouragement: 'చాలా మంచిది! మీరు 6 రోజులుగా సమయానికి మందులు వేసుకుంటున్నారు.'
    },
    voicePlayer: {
      playTitle: 'మందుల వివరాలు వినండి (వాయిస్)',
      playing: 'వివరిస్తోంది...',
      paused: 'ఆపబడింది',
      listenInstructions: 'మీ భాషలో స్పష్టంగా వినండి',
      stop: 'ఆపండి'
    },
    vitals: {
      title: 'షుగర్ & రక్తపోటు (BP) డైరీ',
      sugarTab: 'బ్లడ్ షుగర్',
      bpTab: 'బ్లడ్ ప్రెజర్ (BP)',
      typeReading: 'టైప్ చేయండి',
      voiceReading: 'నోటితో చెప్పండి',
      cameraReading: 'మెషిన్ ఫోటో తీయండి',
      fasting: 'ఖాళీ కడుపుతో (Fasting)',
      postMeal: 'తిన్న తర్వాత',
      random: 'సాధారణ సమయం',
      systolic: 'పై BP (Systolic)',
      diastolic: 'క్రింది BP (Diastolic)',
      sugarUnit: 'mg/dL',
      bpUnit: 'mmHg',
      saveBtn: 'సేవ్ చేయండి',
      trendTitle: '7 రోజుల ట్రెండ్ చార్ట్',
      voiceHint: 'మైక్ నొక్కి చెప్పండి: "షుగర్ 150" లేదా "బీపీ 120 80"',
      voiceListening: 'వింటోంది... దయచేసి మాట్లాడండి'
    },
    prescription: {
      title: 'ప్రిస్క్రిప్షన్ రీడర్ & భద్రతా తనిఖీ',
      takePhoto: 'కెమెరాతో ఫోటో తీయండి',
      uploadFile: 'ఫైల్ అప్‌లోడ్ చేయండి',
      analyzing: 'ఏఐ పరిశీలిస్తోంది...',
      confidenceWarning: 'ఎరుపు రంగులో ఉన్న మందులను ఖచ్చితంగా సరిచూసుకోండి',
      verifyItems: 'మందులను నిర్ధారించండి',
      saveSchedule: 'షెడ్యూల్‌లో భద్రపరచండి',
      doctorNotes: 'వైద్యుని సలహా',
      genericSavingsHeader: 'చౌకైన జన ఔషధి ప్రత్యామ్నాయాలు'
    },
    disclaimer: 'ఇది ఒక సహాయక సాధనం మాత్రమే, వైద్యుడు కాదు. ఔషధ మార్పుల కోసం వైద్యుడిని సంప్రదించండి.'
  }
};
