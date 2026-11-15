import { DrugInteractionRule } from '@/types';

export const DANGEROUS_INTERACTIONS: DrugInteractionRule[] = [
  {
    drugA: 'warfarin',
    drugB: 'aspirin',
    severity: 'High',
    medicalExplanation: 'Concurrent use of warfarin and aspirin significantly elevates major gastrointestinal and systemic bleeding risks due to combined anticoagulant and antiplatelet effects.',
    plainLanguage: {
      en: 'DANGER: Warfarin and Aspirin both thin your blood. Taking them together can cause severe internal bleeding. Contact your doctor immediately before taking both.',
      hi: 'खतरा: वॉरफारिन और एस्पिरिन दोनों खून को पतला करते हैं। इन्हें साथ लेने से गंभीर आंतरिक रक्तस्राव हो सकता है। तुरंत डॉक्टर से संपर्क करें।',
      ta: 'ஆபத்து: வார்ஃபரின் மற்றும் ஆஸ்பிரின் இரண்டும் இரத்தத்தை மெலிதாக்குகின்றன. இரண்டையும் ஒன்றாக எடுத்துக்கொள்வது கடுமையான இரத்தப்போக்கை ஏற்படுத்தும்.',
      te: 'ప్రమాదం: వార్ఫరిన్ మరియు ఆస్పిరిన్ రెండూ రక్తాన్ని పలచన చేస్తాయి. రెండింటినీ కలిపి తీసుకోవడం వల్ల తీవ్రమైన అంతర్గత రక్తస్రావం కావచ్చు.'
    }
  },
  {
    drugA: 'metformin',
    drugB: 'alcohol',
    severity: 'High',
    medicalExplanation: 'Alcohol potentiates the effect of metformin on lactate metabolism, dramatically increasing the risk of fatal lactic acidosis and hypoglycemia.',
    plainLanguage: {
      en: 'HIGH RISK: Alcohol with Metformin can trigger severe lactic acidosis and sudden dangerous blood sugar drops. Avoid alcohol completely.',
      hi: 'गंभीर जोखिम: मेटफॉर्मिन के साथ शराब लेने से लैक्टिक एसिडोसिस और शुगर में खतरनाक गिरावट हो सकती है। शराब से बिल्कुल बचें।',
      ta: 'அதிக ஆபத்து: மெட்ஃபோர்மினுடன் ஆல்கஹால் உட்கொள்வது உயிருக்கு ஆபத்தான லாக்டிக் அமிலத்தன்மை மற்றும் சர்க்கரை வீழ்ச்சியை ஏற்படுத்தும்.',
      te: 'అధిక ప్రమాదం: మెట్‌ఫార్మిన్‌తో మద్యం తీసుకోవడం వల్ల తీవ్రమైన లాక్టిక్ అసిడోసిస్ మరియు రక్తంలో చక్కెర పడిపోవడం జరుగుతుంది.'
    }
  },
  {
    drugA: 'lisinopril',
    drugB: 'potassium',
    severity: 'High',
    medicalExplanation: 'ACE inhibitors like Lisinopril reduce aldosterone, causing potassium retention. Adding potassium supplements can cause lethal hyperkalemia and cardiac arrest.',
    plainLanguage: {
      en: 'DANGER: Lisinopril holds potassium in your body. Taking potassium tablets can stop your heart. Stop potassium supplements and speak to your doctor.',
      hi: 'खतरा: लिसिनोप्रिल शरीर में पोटेशियम को रोकता है। साथ में पोटेशियम लेने से दिल की धड़कन रुकने का खतरा होता है। तुरंत डॉक्टर को बताएं।',
      ta: 'ஆபத்து: லிசினோபிரில் உடலில் பொட்டாசியத்தை தக்கவைக்கும். பொட்டாசியம் மாத்திரைகளைச் சேர்ப்பது இதயத் துடிப்பை பாதிக்கலாம்.',
      te: 'ప్రమాదం: లిసినోప్రిల్ శరీరంలో పొటాషియం నిలుపుకుంటుంది. పొటాషియం మాత్రలు వేసుకుంటే గుండె ఆగిపోయే ప్రమాదం ఉంది.'
    }
  },
  {
    drugA: 'enalapril',
    drugB: 'spironolactone',
    severity: 'High',
    medicalExplanation: 'Combined aldosterone blockade and ACE inhibition lead to profound hyperkalemia and renal failure.',
    plainLanguage: {
      en: 'HIGH RISK: Enalapril with Spironolactone traps excess potassium in the blood, which can trigger irregular heart rhythm.',
      hi: 'गंभीर जोखिम: एनालाप्रिल और स्पिरोनोलैक्टोन मिलकर खून में बहुत ज्यादा पोटेशियम बढ़ा सकते हैं, जिससे दिल की धड़कन अनियंत्रित हो सकती है।',
      ta: 'அதிக ஆபத்து: எனலாப்ரில் மற்றும் ஸ்பைரோனோலாக்டோன் இரத்தத்தில் பொட்டாசியத்தை அதிகரித்து இதயத் துடிப்பை பாதிக்கும்.',
      te: 'అధిక ప్రమాదం: ఎనలాప్రిల్ మరియు స్పైరోనోలాక్టోన్ రక్తంలో పొటాషియంను అధికం చేసి గుండె లయను దెబ్బతీస్తాయి.'
    }
  },
  {
    drugA: 'clopidogrel',
    drugB: 'omeprazole',
    severity: 'Medium',
    medicalExplanation: 'Omeprazole inhibits CYP2C19, significantly reducing clopidogrels bioactivation and antiplatelet efficacy, increasing stroke/heart attack risk.',
    plainLanguage: {
      en: 'WARNING: Omeprazole weakens the heart-protection effect of Clopidogrel (blood thinner). Ask your doctor for Pantoprazole instead.',
      hi: 'चेतावनी: ओमेप्राजोल क्लोपिडोग्रेल (खून पतला करने की दवा) का असर कम कर देता है। डॉक्टर से पेंटोप्राजोल का विकल्प पूछें।',
      ta: 'எச்சரிக்கை: ஒமேபிரசோல் குளோபிடோக்ரலின் இதயப் பாதுகாப்பு விளைவைக் குறைக்கிறது. மாற்று மருந்தைக் கேட்கவும்.',
      te: 'హెచ్చరిక: ఒమెప్రజోల్ క్లోపిడోగ్రెల్ ప్రభావవంతాన్ని తగ్గిస్తుంది. వైద్యుడిని సంప్రదించండి.'
    }
  },
  {
    drugA: 'simvastatin',
    drugB: 'amiodarone',
    severity: 'High',
    medicalExplanation: 'Amiodarone inhibits CYP3A4, causing simvastatin toxicity, severe rhabdomyolysis, and acute kidney failure.',
    plainLanguage: {
      en: 'DANGER: Simvastatin dose above 20mg with Amiodarone can destroy muscles and damage kidneys. Dose adjustment required immediately.',
      hi: 'खतरा: सिम्वास्टेटिन और एमियोडैरोन साथ लेने से मांसपेशियों और किडनी को भारी नुकसान हो सकता है। खुराक कम करना जरूरी है।',
      ta: 'ஆபத்து: சிம்வாஸ்டேடின் மற்றும் அமியோடரோன் தசைகளை சேதப்படுத்தி சிறுநீரகத்தை பாதிக்கலாம்.',
      te: 'ప్రమాదం: సిమ్వాస్టాటిన్ మరియు అమియోడారోన్ కండరాలను మరియు మూత్రపిండాలను దెబ్బతీస్తాయి.'
    }
  },
  {
    drugA: 'atorvastatin',
    drugB: 'clarithromycin',
    severity: 'High',
    medicalExplanation: 'Clarithromycin is a potent CYP3A4 inhibitor, causing dramatic increases in atorvastatin exposure and severe muscle breakdown (rhabdomyolysis).',
    plainLanguage: {
      en: 'HIGH RISK: Clarithromycin antibiotic heavily increases Atorvastatin level in blood, causing severe muscle pain and kidney harm.',
      hi: 'गंभीर जोखिम: क्लेरिथ्रोमाइसिन एंटीबायोटिक एटोरवास्टेटिन का स्तर बढ़ा देती है, जिससे मांसपेशियों में दर्द और किडनी को नुकसान हो सकता है।',
      ta: 'அதிக ஆபத்து: கிளாரித்ரோமைசின் மற்றும் அடோர்வாஸ்டேடின் கடுமையான தசை வலி மற்றும் சிறுநீரக பாதிப்பை ஏற்படுத்தும்.',
      te: 'అధిక ప్రమాదం: క్లారిత్రోమైసిన్ మరియు అటోర్వాస్టాటిన్ తీవ్రమైన కండరాల నొప్పిని మరియు మూత్రపిండాల హానిని కలిగిస్తాయి.'
    }
  },
  {
    drugA: 'digoxin',
    drugB: 'amiodarone',
    severity: 'High',
    medicalExplanation: 'Amiodarone inhibits P-glycoprotein and decreases renal clearance of digoxin, doubling serum digoxin and triggering lethal arrhythmias.',
    plainLanguage: {
      en: 'DANGER: Amiodarone doubles Digoxin heart medicine level in the body, leading to toxic nausea and dangerous slow pulse.',
      hi: 'खतरा: एमियोडैरोन डिगॉक्सिन दवा का स्तर दोगुना कर देता है, जिससे उल्टी, चक्कर और दिल की धड़कन खतरनाक रूप से धीमी हो सकती है।',
      ta: 'ஆபத்து: அமியோடரோன் டிகோக்சின் நச்சுத்தன்மையை இரட்டிப்பாக்கும்.',
      te: 'ప్రమాదం: అమియోడారోన్ డిగోక్సిన్ స్థాయిని రెట్టింపు చేస్తుంది.'
    }
  },
  {
    drugA: 'methotrexate',
    drugB: 'ibuprofen',
    severity: 'High',
    medicalExplanation: 'NSAIDs like Ibuprofen reduce renal perfusion and competitive tubular excretion of methotrexate, causing lethal bone marrow suppression.',
    plainLanguage: {
      en: 'DANGER: Ibuprofen stops your body from clearing Methotrexate, causing severe poison in the bone marrow and liver. Do not mix.',
      hi: 'खतरा: ब्रूफेन (आइबुप्रोफेन) मेथोट्रेक्सेट को बाहर नहीं निकलने देता, जिससे हड्डियों के मज्जे और लिवर में जहर फैल सकता है।',
      ta: 'ஆபத்து: இப்யூபுரூஃபன் மெத்தோட்ரெக்ஸேட் நச்சுத்தன்மையை அதிகரிக்கும்.',
      te: 'ప్రమాదం: ఐబుప్రోఫెన్ మెథోట్రెక్సేట్ విషాన్ని పెంచుతుంది.'
    }
  },
  {
    drugA: 'methotrexate',
    drugB: 'aspirin',
    severity: 'High',
    medicalExplanation: 'Salicylates displace methotrexate from plasma proteins and impede renal tubular secretion, causing severe pancytopenia.',
    plainLanguage: {
      en: 'DANGER: Aspirin mixed with Methotrexate causes dangerous blood cell destruction and severe ulcers.',
      hi: 'खतरा: एस्पिरिन और मेथोट्रेक्सेट साथ लेने से खून के कण कम हो सकते हैं और पेट में गंभीर छाले पड़ सकते हैं।',
      ta: 'ஆபத்து: ஆஸ்பிரின் மற்றும் மெத்தோட்ரெக்ஸேட் கடுமையான இரத்த அணுக்களின் இழப்பை ஏற்படுத்தும்.',
      te: 'ప్రమాదం: ఆస్పిరిన్ మరియు మెథోట్రెక్సేట్ ప్రమాదకరమైన రక్త కణాల నాశనానికి దారితీస్తాయి.'
    }
  },
  {
    drugA: 'ciprofloxacin',
    drugB: 'theophylline',
    severity: 'High',
    medicalExplanation: 'Ciprofloxacin inhibits CYP1A2, drastically reducing theophylline clearance and precipitating seizures and fatal arrhythmias.',
    plainLanguage: {
      en: 'HIGH RISK: Ciprofloxacin antibiotic makes asthma medicine Theophylline build up to toxic levels, causing tremors and seizures.',
      hi: 'गंभीर जोखिम: सिप्रोफ्लोक्सासिन दमे की दवा थियोफिलाइन का जहर बढ़ा देती है, जिससे दौरे और कंपकंपी हो सकती है।',
      ta: 'அதிக ஆபத்து: சிப்ரோஃப்ளோக்சசின் தியோபிலின் அளவை உயர்த்தி வலிப்பு ஏற்படுத்தலாம்.',
      te: 'అధిక ప్రమాదం: సిప్రోఫ్లోక్సాసిన్ థియోఫిలిన్ స్థాయిని విషపూరితం చేస్తుంది.'
    }
  },
  {
    drugA: 'sildenafil',
    drugB: 'nitroglycerin',
    severity: 'High',
    medicalExplanation: 'Potentiation of cGMP signaling causes catastrophic, irreversible vasodilation, profound hypotension, and fatal myocardial infarction.',
    plainLanguage: {
      en: 'DANGER: Nitroglycerin / Sorbitrate with Sildenafil / Viagra causes a sudden, deadly collapse in blood pressure. Never take together.',
      hi: 'खतरा: सोरबिट्रेट (दिल की दवा) और सिल्डेनाफिल साथ लेने से बीपी अचानक शून्य तक गिर सकता है जो जानलेवा है।',
      ta: 'உயிர்காக்கும் எச்சரிக்கை: நைட்ரோகிளிசரின் மற்றும் சில்டெனாபில் ஒன்றாக எடுத்தால் இரத்த அழுத்தம் ஆபத்தான அளவுக்கு வீழ்ச்சியடையும்.',
      te: 'ప్రాణాంతక హెచ్చరిక: నైట్రోగ్లిజరిన్ మరియు సిల్డెనాఫిల్ కలిపి తీసుకుంటే రక్తపోటు ఒక్కసారిగా పడిపోతుంది.'
    }
  },
  {
    drugA: 'tramadol',
    drugB: 'sertraline',
    severity: 'High',
    medicalExplanation: 'Dual serotonergic enhancement precipitates Serotonin Syndrome with hyperthermia, clonus, and autonomic instability.',
    plainLanguage: {
      en: 'HIGH RISK: Tramadol painkiller with Sertraline antidepressant causes Serotonin Syndrome: high fever, shivering, confusion, and seizures.',
      hi: 'गंभीर जोखिम: ट्रामाडोल और सर्ट्रालाइन साथ लेने से सेरोटोनिन सिंड्रोम (तेज बुखार, कंपकंपी, बेहोशी) हो सकता है।',
      ta: 'அதிக ஆபத்து: டிராமடால் மற்றும் செர்ட்ராலைன் கடுமையான செரோடோனின் நோய்க்குறியை ஏற்படுத்தும்.',
      te: 'అధిక ప్రమాదం: ట్రామడాల్ మరియు సెర్ట్రాలైన్ తీవ్రమైన జ్వరం మరియు మూర్ఛను కలిగిస్తాయి.'
    }
  },
  {
    drugA: 'fluoxetine',
    drugB: 'tramadol',
    severity: 'High',
    medicalExplanation: 'Potent CYP2D6 inhibition and cumulative serotonergic load precipitate serotonin syndrome and seizure activity.',
    plainLanguage: {
      en: 'HIGH RISK: Fluoxetine with Tramadol raises brain chemicals to toxic levels, causing twitching, fever, and seizures.',
      hi: 'गंभीर जोखिम: फ्लुओक्सेटीन और ट्रामाडोल दिमाग में रासायनिक असंतुलन कर झटके और तेज बुखार ला सकते हैं।',
      ta: 'அதிக ஆபத்து: ஃப்ளூயாக்செடின் மற்றும் டிராமடால் நடுக்கம் மற்றும் வலிப்பை உண்டாக்கும்.',
      te: 'అధిక ప్రమాదం: ఫ్లూయొక్సేటైన్ మరియు ట్రామడాల్ వణుకు మరియు మూర్ఛలకు కారణమవుతాయి.'
    }
  },
  {
    drugA: 'paracetamol',
    drugB: 'alcohol',
    severity: 'Medium',
    medicalExplanation: 'Chronic alcohol induces CYP2E1, shunting paracetamol into the toxic metabolite NAPQI, accelerating acute hepatic necrosis.',
    plainLanguage: {
      en: 'WARNING: Regular alcohol intake combined with frequent Paracetamol (Crocin/Dolo) damages liver cells permanently.',
      hi: 'चेतावनी: शराब के साथ बार-बार पैरासिटामोल (डोलो/क्रोसिन) लेने से लिवर खराब हो सकता है।',
      ta: 'எச்சரிக்கை: ஆல்கஹால் மற்றும் பாராசிட்டமால் கல்லீரலை கடுமையாக சேதப்படுத்தும்.',
      te: 'హెచ్చరిక: ఆల్కహాల్ మరియు పారాసిటమాల్ కాలేయాన్ని దెబ్బతీస్తాయి.'
    }
  },
  {
    drugA: 'metronidazole',
    drugB: 'alcohol',
    severity: 'High',
    medicalExplanation: 'Disulfiram-like reaction due to acetaldehyde accumulation; causes intense flushing, tachycardia, vomiting, and cardiovascular collapse.',
    plainLanguage: {
      en: 'DANGER: Alcohol with Metronidazole (Flagyl) triggers severe violent vomiting, chest pain, and racing heartbeat. Strict avoidance needed.',
      hi: 'खतरा: मेट्रोनिडाजोल के साथ शराब लेने से भयंकर उल्टियां, सीने में दर्द और सांस फूलने की समस्या हो सकती है।',
      ta: 'ஆபத்து: மெட்ரோனிடசோல் மற்றும் ஆல்கஹால் கடுமையான வாந்தி மற்றும் படபடப்பை ஏற்படுத்தும்.',
      te: 'ప్రమాదం: మెట్రోనిడాజోల్ మరియు ఆల్కహాల్ తీవ్రమైన వాంతులు మరియు దడను కలిగిస్తాయి.'
    }
  },
  {
    drugA: 'levothyroxine',
    drugB: 'calcium carbonate',
    severity: 'Medium',
    medicalExplanation: 'Calcium carbonate binds to levothyroxine in the acidic gastric environment, reducing thyroxine absorption by over 30%.',
    plainLanguage: {
      en: 'CAUTION: Calcium tablets block thyroid medicine (Thyronorm/Eltroxin) absorption. Keep at least 4 hours gap between them.',
      hi: 'सावधानी: कैल्शियम की गोली थायरॉइड की दवा (थायरोनॉर्म) को शरीर में सोखने नहीं देती। दोनों में कम से कम 4 घंटे का अंतर रखें।',
      ta: 'எச்சரிக்கை: கால்சியம் தைராய்டு மருந்தை உறிஞ்சுவதை தடுக்கிறது. 4 மணி நேர இடைவெளி தேவை.',
      te: 'హెచ్చరిక: కాల్షియం థైరాయిడ్ ఔషధ శోషణను అడ్డుకుంటుంది. 4 గంటల వ్యవధి పాటించండి.'
    }
  },
  {
    drugA: 'levothyroxine',
    drugB: 'iron',
    severity: 'Medium',
    medicalExplanation: 'Ferrous sulfate forms an insoluble chelate with levothyroxine in the gut, severely blunting clinical efficacy.',
    plainLanguage: {
      en: 'CAUTION: Iron tonic or tablets block thyroid medicine. Take thyroid medicine empty stomach in the morning, and iron after lunch.',
      hi: 'सावधानी: आयरन की गोली थायरॉइड दवा का असर खत्म कर देती है। थायरॉइड सुबह खाली पेट और आयरन दोपहर में लें।',
      ta: 'எச்சரிக்கை: இரும்புச்சத்து மாத்திரைகள் தைராய்டு மருந்தை உறிஞ்சுவதை தடுக்கின்றன.',
      te: 'హెచ్చరిక: ఐరన్ థైరాయిడ్ మందు ప్రభావాన్ని తగ్గిస్తుంది.'
    }
  },
  {
    drugA: 'allopurinol',
    drugB: 'azathioprine',
    severity: 'High',
    medicalExplanation: 'Allopurinol inhibits xanthine oxidase, the primary catabolic enzyme of 6-mercaptopurine/azathioprine, triggering fatal bone marrow aplasia.',
    plainLanguage: {
      en: 'DANGER: Allopurinol blocks the breakdown of Azathioprine, leading to deadly white blood cell collapse. Requires 75% dose reduction or stop.',
      hi: 'खतरा: एलोप्यूरिनॉल और एजाथियोप्रिन साथ लेने से सफेद रक्त कोशिकाएं खत्म हो सकती हैं, जिससे जानलेवा संक्रमण हो सकता है।',
      ta: 'ஆபத்து: அலோபுரினால் மற்றும் அசாதியோப்ரின் எலும்பு மஜ்ஜை செயலிழப்பை ஏற்படுத்தும்.',
      te: 'ప్రమాదం: అల్లోపురినాల్ మరియు అజాథియోప్రిన్ ప్రాణాంతక ఇన్ఫెక్షన్లకు దారితీస్తాయి.'
    }
  },
  {
    drugA: 'lithium',
    drugB: 'ibuprofen',
    severity: 'High',
    medicalExplanation: 'NSAIDs decrease renal prostaglandin synthesis, reducing lithium renal clearance by up to 40% and precipitating acute lithium toxicity.',
    plainLanguage: {
      en: 'HIGH RISK: Ibuprofen/Brufen reduces kidney excretion of Lithium, causing brain toxicity, severe tremors, and kidney failure.',
      hi: 'गंभीर जोखिम: ब्रूफेन (आइबुप्रोफेन) लिथियम को शरीर में जमा कर देता है, जिससे हाथ कांपना, चक्कर और किडनी खराब हो सकती है।',
      ta: 'அதிக ஆபத்து: இப்யூபுரூஃபன் லித்தியம் நச்சுத்தன்மையை உண்டாக்கி சிறுநீரகத்தை பாதிக்கும்.',
      te: 'అధిక ప్రమాదం: ఐబుప్రోఫెన్ లిథియం విషపూరితానికి కారణమవుతుంది.'
    }
  },
  {
    drugA: 'lithium',
    drugB: 'hydrochlorothiazide',
    severity: 'High',
    medicalExplanation: 'Thiazide diuretics promote compensatory proximal tubular reabsorption of lithium, escalating lithium levels to neurotoxic thresholds.',
    plainLanguage: {
      en: 'DANGER: Water tablets (Hydrochlorothiazide) cause Lithium to spike to dangerous toxic levels. Close doctor monitoring needed.',
      hi: 'खतरा: हाइड्रोक्लोरोथियाजाइड (बीपी की पेशाब वाली दवा) लिथियम का स्तर खतरनाक स्तर तक बढ़ा देती है।',
      ta: 'ஆபத்து: நீர் மாத்திரைகள் லித்தியம் அளவை நச்சு அளவுக்கு அதிகரிக்கும்.',
      te: 'ప్రమాదం: నీటి మాత్రలు లిథియం స్థాయిని విషపూరితంగా పెంచుతాయి.'
    }
  },
  {
    drugA: 'potassium',
    drugB: 'spironolactone',
    severity: 'High',
    medicalExplanation: 'Direct potassium supplementation alongside potassium-sparing diuretic causes lethal hyperkalemia and ventricular fibrillation.',
    plainLanguage: {
      en: 'DANGER: Spironolactone already saves potassium. Extra potassium pills can cause immediate cardiac arrest.',
      hi: 'खतरा: स्पिरोनोलैक्टोन पहले ही शरीर में पोटेशियम रोकता है। अतिरिक्त पोटेशियम लेने से दिल की धड़कन रुक सकती है।',
      ta: 'ஆபத்து: கூடுதல் பொட்டாசியம் மாத்திரைகள் இதயக் கோளாறை உண்டாக்கும்.',
      te: 'ప్రమాదం: అదనపు పొటాషియం మాత్రలు గుండెపోటుకు దారితీస్తాయి.'
    }
  },
  {
    drugA: 'warfarin',
    drugB: 'fluconazole',
    severity: 'High',
    medicalExplanation: 'Fluconazole potently inhibits CYP2C9, the primary metabolizer of S-warfarin, causing massive INR spikes and hemorrhage.',
    plainLanguage: {
      en: 'DANGER: Fluconazole antifungal triples the power of Warfarin blood thinner. High risk of severe bleeding.',
      hi: 'खतरा: फ्लूकोनाज़ोल एंटीफंगल वॉरफारिन के असर को 3 गुना बढ़ा देता है, जिससे गंभीर रक्तस्राव हो सकता है।',
      ta: 'ஆபத்து: ஃப்ளுகோனசோல் வார்ஃபரின் ரத்தப்போக்கு அபாயத்தை மும்மடங்காக்கும்.',
      te: 'ప్రమాదం: ఫ్లూకోనజోల్ వార్ఫరిన్ రక్తస్రావ ప్రమాదాన్ని మూడు రెట్లు పెంచుతుంది.'
    }
  },
  {
    drugA: 'doxycycline',
    drugB: 'antacids',
    severity: 'Medium',
    medicalExplanation: 'Multivalent cations (Mg, Al, Ca) form insoluble chelate complexes with tetracyclines, impairing oral bioavailability by up to 85%.',
    plainLanguage: {
      en: 'CAUTION: Antacids (Digene, Gelusil) neutralize Doxycycline antibiotic before it can work. Keep at least 2 hours gap.',
      hi: 'सावधानी: डाइजीन या एंटासिड डॉक्सीसाइक्लिन एंटीबायोटिक को बेअसर कर देते हैं। दोनों में कम से कम 2 घंटे का अंतर रखें।',
      ta: 'எச்சரிக்கை: அசிடிட்டி மருந்துகள் டாக்சிசைக்ளின் நன்மையை தடுக்கும். 2 மணி நேர இடைவெளி தேவை.',
      te: 'హెచ్చరిక: యాంటాసిడ్లు డాక్సీసైక్లిన్ యాంటీబయాటిక్ పనితీరును అడ్డుకుంటాయి.'
    }
  },
  {
    drugA: 'carbamazepine',
    drugB: 'clarithromycin',
    severity: 'High',
    medicalExplanation: 'CYP3A4 inhibition by clarithromycin prevents carbamazepine metabolism, causing severe cerebellar ataxia, diplopia, and toxicity.',
    plainLanguage: {
      en: 'HIGH RISK: Clarithromycin causes Carbamazepine seizure medicine to reach toxic levels, leading to stumbling, confusion, and dizziness.',
      hi: 'गंभीर जोखिम: क्लेरिथ्रोमाइसिन कार्बामेज़ापाइन का जहर बढ़ा देती है, जिससे चक्कर, लड़खड़ाहट और बेहोशी हो सकती है।',
      ta: 'அதிக ஆபத்து: கிளாரித்ரோமைசின் கார்பமாசெபைன் நச்சுத்தன்மையை உண்டாக்கி தலைசுற்றலை ஏற்படுத்தும்.',
      te: 'అధిక ప్రమాదం: క్లారిత్రోమైసిన్ కార్బమజెపైన్ విషపూరితానికి కారణమవుతుంది.'
    }
  },
  {
    drugA: 'amlodipine',
    drugB: 'simvastatin',
    severity: 'Medium',
    medicalExplanation: 'Amlodipine increases simvastatin exposure by inhibiting CYP3A4, raising risk of myopathy; simvastatin dose should not exceed 20 mg/day.',
    plainLanguage: {
      en: 'WARNING: Taking Amlodipine BP medicine with high-dose Simvastatin increases muscle breakdown risk. Check dose with doctor.',
      hi: 'चेतावनी: एमलोडिपाइन बीपी की दवा के साथ सिम्वास्टेटिन ज्यादा खुराक में लेने से मांसपेशियों में दर्द और खराबी हो सकती है।',
      ta: 'எச்சரிக்கை: அம்லோடிபைன் மற்றும் சிம்வாஸ்டேடின் தசை பாதிப்பு அபாயத்தை அதிகரிக்கும்.',
      te: 'హెచ్చరిక: అమ్లోడిపైన్ మరియు సిమ్వాస్టాటిన్ కండరాల బలహీనతను కలిగిస్తాయి.'
    }
  },
  {
    drugA: 'glimepiride',
    drugB: 'miconazole',
    severity: 'High',
    medicalExplanation: 'Miconazole inhibits CYP2C9 metabolism of sulfonylureas, causing prolonged, severe, and refractory hypoglycemia.',
    plainLanguage: {
      en: 'DANGER: Miconazole antifungal makes Glimepiride diabetes pills too powerful, causing sudden coma-level low sugar.',
      hi: 'खतरा: माइकोनाज़ोल एंटीफंगल ग्लिमेपिराइड शुगर की दवा का असर बहुत तेज कर देता है, जिससे शुगर जानलेवा स्तर तक गिर सकती है।',
      ta: 'ஆபத்து: மைகோனசோல் கிளிமிபிரைட் சர்க்கரை அளவை ஆபத்தான அளவுக்கு குறைக்கும்.',
      te: 'ప్రమాదం: మైకోనజోల్ గ్లైమిపైరైడ్ చక్కెరను ప్రమాదకరంగా తగ్గిస్తుంది.'
    }
  },
  {
    drugA: 'ciprofloxacin',
    drugB: 'prednisolone',
    severity: 'High',
    medicalExplanation: 'Synergistic collagen degradation triggers Achilles tendon rupture and severe tendinitis, especially in older adults.',
    plainLanguage: {
      en: 'HIGH RISK: Ciprofloxacin antibiotic plus Prednisolone steroid can cause sudden tendon tearing, especially in the ankle. Report pain immediately.',
      hi: 'गंभीर जोखिम: सिप्रोफ्लोक्सासिन और प्रेडनिसोलोन (स्टेरॉयड) साथ लेने से एड़ी और जोड़ों की नसें फटने का खतरा रहता है।',
      ta: 'அதிக ஆபத்து: சிப்ரோஃப்ளோக்சசின் மற்றும் ப்ரெட்னிசோலோன் தசைநாண் கிழிவை ஏற்படுத்தலாம்.',
      te: 'అధిక ప్రమాదం: సిప్రోఫ్లోక్సాసిన్ మరియు ప్రెడ్నిసోలోన్ స్నాయువు చిరిగిపోయే ప్రమాదాన్ని కలిగిస్తాయి.'
    }
  },
  {
    drugA: 'phenytoin',
    drugB: 'fluconazole',
    severity: 'High',
    medicalExplanation: 'Fluconazole potently inhibits CYP2C9/2C19, causing phenytoin toxicity manifest as nystagmus, ataxia, and encephalopathy.',
    plainLanguage: {
      en: 'DANGER: Fluconazole causes seizure medicine Phenytoin to reach toxic levels in the blood, leading to loss of balance and confusion.',
      hi: 'खतरा: फ्लूकोनाज़ोल फेनिटोइन दवा का स्तर बढ़ा देती है, जिससे चक्कर, चलने में लड़खड़ाहट और भ्रम हो सकता है।',
      ta: 'ஆபத்து: ஃப்ளுகோனசோல் ஃபெனிடோயின் நச்சுத்தன்மையை உண்டாக்கி நிலை தடுமாறச் செய்யும்.',
      te: 'ప్రమాదం: ఫ్లూకోనజోల్ ఫెనిటోయిన్ విషపూరితానికి కారణమవుతుంది.'
    }
  },
  {
    drugA: 'aspirin',
    drugB: 'ibuprofen',
    severity: 'Medium',
    medicalExplanation: 'Ibuprofen competitively inhibits platelet COX-1 binding site, blocking aspirins irreversible cardioprotective antiplatelet effect.',
    plainLanguage: {
      en: 'WARNING: Taking Brufen/Ibuprofen blocks heart-protection benefits of daily baby Aspirin (Ecosprin). Take aspirin 30 mins before ibuprofen.',
      hi: 'चेतावनी: ब्रूफेन (आइबुप्रोफेन) इकोस्प्रिन (एस्पिरिन) के दिल की सुरक्षा करने वाले असर को रोक देती है।',
      ta: 'எச்சரிக்கை: இப்யூபுரூஃபன் ஆஸ்பிரினின் இதய பாதுகாப்பு விளைவை தடுக்கிறது.',
      te: 'హెచ్చరిక: ఐబుప్రోఫెన్ ఆస్పిరిన్ యొక్క గుండె రక్షణ ప్రయోజనాన్ని అడ్డుకుంటుంది.'
    }
  },
  {
    drugA: 'rifampicin',
    drugB: 'oral contraceptives',
    severity: 'High',
    medicalExplanation: 'Rifampicin powerfully induces CYP3A4, clearing ethinyl estradiol rapidly and leading to breakthrough ovulation and pregnancy.',
    plainLanguage: {
      en: 'HIGH RISK: Rifampicin TB medicine completely deactivates birth control pills, leading to unplanned pregnancy. Use barrier methods.',
      hi: 'गंभीर जोखिम: टीबी की दवा रिफैम्पिसिन गर्भनिरोधक गोलियों का असर शून्य कर देती है। अतिरिक्त सुरक्षा उपाय जरूरी हैं।',
      ta: 'அதிக ஆபத்து: ரிஃபாம்பிசின் கருத்தடை மாத்திரைகளின் செயல்திறனை குறைக்கும்.',
      te: 'అధిక ప్రమాదం: రిఫాంపిసిన్ గర్భనిరోధక మాత్రల ప్రభావాన్ని రద్దు చేస్తుంది.'
    }
  },
  {
    drugA: 'warfarin',
    drugB: 'paracetamol',
    severity: 'Medium',
    medicalExplanation: 'High sustained doses of paracetamol (>2g/day) inhibit vitamin K-dependent clotting factor synthesis, raising INR.',
    plainLanguage: {
      en: 'CAUTION: Taking high doses of Paracetamol (Crocin/Dolo) for multiple days while on Warfarin increases bleeding risk. Monitor INR.',
      hi: 'सावधानी: वॉरफारिन के साथ रोज ज्यादा पैरासिटामोल लेने से खून ज्यादा पतला हो सकता है और ब्लीडिंग का खतरा बढ़ जाता है।',
      ta: 'எச்சரிக்கை: வார்ஃபரினுடன் அதிக பாராசிட்டமால் இரத்தப்போக்கு அபாயத்தை அதிகரிக்கும்.',
      te: 'హెచ్చరిక: వార్ఫరిన్‌తో అధిక పారాసిటమాల్ రక్తస్రావ ప్రమాదాన్ని పెంచుతుంది.'
    }
  },
  {
    drugA: 'telmisartan',
    drugB: 'potassium',
    severity: 'High',
    medicalExplanation: 'Angiotensin receptor blockers increase serum potassium levels; potassium salts can precipitate critical hyperkalemia.',
    plainLanguage: {
      en: 'HIGH RISK: Telmisartan retains potassium in the kidneys. Extra potassium supplements can cause dangerous heart palpitations.',
      hi: 'गंभीर जोखिम: टेलमिसार्टन शरीर में पोटेशियम रोकती है। ऊपर से पोटेशियम लेने से दिल की धड़कन में खतरनाक गड़बड़ी हो सकती है।',
      ta: 'அதிக ஆபத்து: டெல்மிசார்டன் மற்றும் பொட்டாசியம் இதயத் துடிப்பில் ஆபத்தான மாற்றங்களை ஏற்படுத்தும்.',
      te: 'అధిక ప్రమాదం: టెల్మిసార్టన్ మరియు పొటాషియం గుండె లయలో ప్రమాదకరమైన మార్పులను తెస్తాయి.'
    }
  },
  {
    drugA: 'metformin',
    drugB: 'contrast dye',
    severity: 'High',
    medicalExplanation: 'Iodinated radiocontrast agents induce transient renal failure, precipitating acute metformin retention and fatal lactic acidosis.',
    plainLanguage: {
      en: 'DANGER: Stop Metformin 48 hours before any CT Scan or angiogram with contrast dye to prevent acute kidney shutdown.',
      hi: 'खतरा: कंट्रास्ट डाई वाले सीटी स्कैन से 48 घंटे पहले मेटफॉर्मिन बंद करना अनिवार्य है, नहीं तो किडनी अचानक बंद हो सकती है।',
      ta: 'ஆபத்து: CT ஸ்கேன் செய்வதற்கு முன் மெட்ஃபோர்மினை 48 மணி நேரம் நிறுத்த வேண்டும்.',
      te: 'ప్రమాదం: కాంట్రాస్ట్ డైతో CT స్కాన్‌కు ముందు మెట్‌ఫార్మిన్‌ను 48 గంటలు ఆపాలి.'
    }
  },
  {
    drugA: 'linezolid',
    drugB: 'sertraline',
    severity: 'High',
    medicalExplanation: 'Linezolid is a reversible non-selective MAO inhibitor; combined with SSRIs, it rapidly triggers severe serotonin syndrome.',
    plainLanguage: {
      en: 'DANGER: Linezolid antibiotic combined with Sertraline/antidepressant causes lethal brain agitation, rigid muscles, and high fever.',
      hi: 'खतरा: लिनेज़ोलिड एंटीबायोटिक और सर्ट्रालाइन साथ लेने से मस्तिष्क में जानलेवा सेरोटोनिन विषाक्तता हो सकती है।',
      ta: 'ஆபத்து: லைனசோலிட் மற்றும் செர்ட்ராலைன் மரணத்தை விளைவிக்கும் நச்சுத்தன்மையை உண்டாக்கும்.',
      te: 'ప్రమాదం: లినెజోలిడ్ మరియు సెర్ట్రాలైన్ ప్రాణాంతక సెరోటోనిన్ సిండ్రోమ్‌ను కలిగిస్తాయి.'
    }
  }
];

export function findLocalInteractions(medicines: string[]): DrugInteractionRule[] {
  const normalized = medicines.map(m => m.toLowerCase().trim());
  const found: DrugInteractionRule[] = [];

  for (const rule of DANGEROUS_INTERACTIONS) {
    const hasA = normalized.some(m => m.includes(rule.drugA.toLowerCase()) || rule.drugA.toLowerCase().includes(m));
    const hasB = normalized.some(m => m.includes(rule.drugB.toLowerCase()) || rule.drugB.toLowerCase().includes(m));

    if (hasA && hasB) {
      found.push(rule);
    }
  }

  return found;
}
