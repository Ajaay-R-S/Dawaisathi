'use client';

import React, { useState, useEffect } from 'react';
import {
  Info,
  ShieldCheck,
  AlertTriangle,
  Lock,
  WifiOff,
  Cpu,
  UserCheck,
  HeartHandshake,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getPatientProfile } from '@/lib/supabase';
import { Language, PatientProfile } from '@/types';
import { TRANSLATIONS } from '@/data/translations';

export default function LimitsPage() {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [language, setLanguage] = useState<Language>('hi');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    getPatientProfile().then((p) => {
      setPatient(p);
      if (p.preferred_language) setLanguage(p.preferred_language);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        currentLang={language}
        onLanguageChange={setLanguage}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        emergencyPhone={patient?.emergency_contact_phone}
        patientName={patient?.full_name}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-6 h-6 text-emerald-700" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
              Non-Functional: Transparency & Clinical Honesty
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            यह कैसे काम करता है और इसकी सीमाएं (How This Works & Limits)
          </h1>
          <p className="text-sm text-gray-600 font-semibold">
            हम तकनीक की सीमाओं और रोगियों की सुरक्षा के प्रति पूर्ण पारदर्शी और ईमानदार हैं।
          </p>
        </div>

        {/* 1. Clinical Disclaimer Card */}
        <div className="bg-amber-50 border-3 border-amber-400 rounded-3xl p-6 sm:p-7 space-y-3 shadow-sm">
          <div className="flex items-center gap-3 text-amber-900">
            <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
            <h3 className="text-xl font-black">
              मुख्य क्लिनिकल चेतावनी (Primary Medical Notice)
            </h3>
          </div>
          <p className="text-base font-bold text-amber-950 leading-relaxed">
            &ldquo;दवाई साथी (DawaiSaathi) एक सहायता और समझ बढ़ाने वाला सहायक टूल है, डॉक्टर नहीं।
            (This is a support tool, not a doctor.)&rdquo;
          </p>
          <p className="text-sm text-amber-900 font-medium">
            यह ऐप डॉक्टर के पर्चे को पढ़ने, दवाओं के समय का शेड्यूल बनाने और खतरनाक इंटरैक्शन के प्रति सचेत करने में मदद करता है।
            किसी भी दवा को बदलने, शुरू करने या बंद करने से पहले पंजीकृत डॉक्टर की सलाह लेना अनिवार्य है।
          </p>
        </div>

        {/* 2. Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pillar 1: AI Vision Accuracy & The <0.7 Confidence Rule */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900">
              1. दृष्टि मॉडल की सीमाएं (Vision Limits & Confidence Rule)
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              डॉक्टरों की हस्तलिखित लिखावट कई बार अत्यधिक अस्पष्ट या कटी-फटी होती है।
              हमारा सिस्टम हर दवा को 0.0 से 1.0 तक का कॉन्फिडेंस स्कोर देता है।
              <span className="font-bold text-red-600"> यदि कॉन्फिडेंस 0.7 (70%) से कम है, तो हम कभी भी चुपचाप अनुमान नहीं लगाते (Never silently guess).</span>
              हम उस दवा को लाल रंग से हाइलाइट करते हैं और रोगी या उसके परिवार से डिब्बा देखकर पुष्टि करने को कहते हैं।
            </p>
          </div>

          {/* Pillar 2: Human-in-the-Loop */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900">
              2. मानव पुष्टि आवश्यक (Human Confirmation Step)
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              एआई द्वारा पर्चा पढ़े जाने के बाद, कोई भी शेड्यूल सीधे बैकग्राउंड में सेव नहीं होता।
              रोगी या देखभाल करने वाले को एक संपादन योग्य तालिका (Editable Confirmation Table) दिखाई जाती है,
              जहाँ वे पुष्टि बटन दबाते हैं तभी दवाएं दिनचर्या में शामिल होती हैं।
            </p>
          </div>

          {/* Pillar 3: Offline-First Hybrid Safety Engine */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900">
              3. ऑफ़लाइन विश्वसनीयता (Local 30+ Rules Engine)
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              ग्रामीण या धीमे इंटरनेट वाले क्षेत्रों में एपीआई फेल होने पर भी ऐप काम करता रहे, इसके लिए
              हमने 30+ सबसे खतरनाक दवा जोड़ियों (जैसे Warfarin+Aspirin, Metformin+Alcohol, ACE Inhibitors+Potassium) की
              स्थानीय नियम तालिका सीधे कोडबेस में अंतर्निहित की है।
            </p>
          </div>

          {/* Pillar 4: Privacy & Zero Image Retention */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900">
              4. गोपनीयता और डेटा सुरक्षा (Privacy & Storage)
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              हम क्लाउड पर कच्चे पर्चे की फोटो कभी स्थायी रूप से स्टोर नहीं करते। फोटो का विश्लेषण होते ही
              मेमोरी से हटा दिया जाता है। मरीज की पहचान बिना किसी पासवर्ड के स्थानीय डिवाइस आईडी से सुरक्षित रखी जाती है।
            </p>
          </div>
        </div>

        {/* 3. Deterministic Vitals Risk Rules Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-100 shadow-sm space-y-4">
          <h3 className="text-xl font-black text-gray-900">
            शुगर और बीपी के निश्चित नियम (Deterministic Rule-Based Thresholds)
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            हमारा रिस्क इंजन केवल एलएलएम की अनिश्चितता पर निर्भर नहीं है, बल्कि प्रमाणित मेडिकल प्रोटोकॉल का पालन करता है:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl font-bold text-red-950">
              🔴 गंभीर लो शुगर: &lt; 70 mg/dL (हाइपोग्लाइसीमिया अलार्म)
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl font-bold text-red-950">
              🔴 गंभीर हाई शुगर: &gt; 300 mg/dL (केतोएसिडोसिस खतरा)
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl font-bold text-red-950">
              🔴 आपातकालीन बीपी संकट: &gt; 180/120 mmHg (Hypertensive Crisis)
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl font-bold text-red-950">
              🔴 गंभीर लो बीपी: &lt; 90/60 mmHg (हाइपोटेंशन अलार्म)
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl font-bold text-amber-950 sm:col-span-2">
              🟠 ट्रेंड नियम: लगातार 3 बार रीडिंग बढ़ना या 7-दिन के औसत से 30% अधिक का उछाल होने पर परिवार को ऑटो-अलर्ट!
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
