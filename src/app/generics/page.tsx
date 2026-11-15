'use client';

import React, { useState, useEffect } from 'react';
import { Coins, Search, ShoppingBag, ArrowRight, AlertCircle, Calculator, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import GenericSavingsCard from '@/components/GenericSavingsCard';
import { GENERIC_MEDICINES_DB } from '@/data/genericMedicines';
import { getPatientProfile } from '@/lib/supabase';
import { GenericDrugInfo, Language, PatientProfile } from '@/types';
import { TRANSLATIONS } from '@/data/translations';

export default function GenericsPage() {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [language, setLanguage] = useState<Language>('hi');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Interactive Calculator State
  const [selectedMeds, setSelectedMeds] = useState<GenericDrugInfo[]>([
    GENERIC_MEDICINES_DB[1], // Glycomet 500
    GENERIC_MEDICINES_DB[3], // Telma 40
    GENERIC_MEDICINES_DB[6], // Atorva 10
    GENERIC_MEDICINES_DB[8], // Pan 40
  ]);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    getPatientProfile().then((p) => {
      setPatient(p);
      if (p.preferred_language) setLanguage(p.preferred_language);
    });
  }, []);

  const filteredMedicines = GENERIC_MEDICINES_DB.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.brandName.toLowerCase().includes(q) ||
      item.genericSalt.toLowerCase().includes(q) ||
      item.janAushadhiName.toLowerCase().includes(q) ||
      item.indication.toLowerCase().includes(q)
    );
  });

  // Calculate monthly costs (assuming 1 strip of each per month)
  const totalBrandMonthly = selectedMeds.reduce((acc, m) => acc + m.brandPricePerStrip, 0);
  const totalGenericMonthly = selectedMeds.reduce((acc, m) => acc + m.genericPricePerStrip, 0);
  const monthlySavings = totalBrandMonthly - totalGenericMonthly;
  const yearlySavings = monthlySavings * 12;
  const overallSavingsPercent =
    totalBrandMonthly > 0 ? Math.round((monthlySavings / totalBrandMonthly) * 100) : 0;

  const toggleSelectForCalculator = (item: GenericDrugInfo) => {
    const exists = selectedMeds.some((m) => m.brandName === item.brandName);
    if (exists) {
      setSelectedMeds(selectedMeds.filter((m) => m.brandName !== item.brandName));
    } else {
      setSelectedMeds([...selectedMeds, item]);
    }
  };

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
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Feature 3: Jan Aushadhi Generic Alternatives
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            सस्ती जेनेरिक दवा खोजें (Jan Aushadhi Savings)
          </h1>
          <p className="text-sm text-gray-500 font-semibold">
            ब्रांडेड दवाओं की जगह वही साल्ट वाली जन औषधि दवाएं लेकर 50% से 85% तक पैसे बचाएं।
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MONTHLY SAVINGS CALCULATOR                                    */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-7 h-7 text-emerald-200" />
            <h3 className="text-xl sm:text-2xl font-black">
              मासिक दवा बचत कैलकुलेटर (Monthly Savings)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
              <span className="text-xs uppercase font-bold text-emerald-200 block">
                ब्रांडेड दवा का खर्च
              </span>
              <span className="text-2xl sm:text-3xl font-black mt-1 block">
                ₹{totalBrandMonthly.toFixed(0)}
              </span>
              <span className="text-[11px] text-emerald-100">प्रति माह (Per month)</span>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
              <span className="text-xs uppercase font-bold text-emerald-200 block">
                जन औषधि का खर्च
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300 mt-1 block">
                ₹{totalGenericMonthly.toFixed(0)}
              </span>
              <span className="text-[11px] text-emerald-100">प्रति माह (Per month)</span>
            </div>

            <div className="bg-amber-400 text-amber-950 rounded-2xl p-4 shadow-lg">
              <span className="text-xs uppercase font-black block">
                आपकी कुल बचत ({overallSavingsPercent}%)
              </span>
              <span className="text-2xl sm:text-3xl font-black mt-1 block">
                ₹{monthlySavings.toFixed(0)} / माह
              </span>
              <span className="text-[11px] font-bold block">
                साल में ₹{yearlySavings.toFixed(0)} की बचत!
              </span>
            </div>
          </div>

          {/* Active List Pills in Calculator */}
          <div className="pt-2 border-t border-white/15">
            <span className="text-xs text-emerald-100 font-bold block mb-2">
              कैलकुलेटर में शामिल दवाएं ({selectedMeds.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedMeds.map((med) => (
                <button
                  key={med.brandName}
                  onClick={() => toggleSelectForCalculator(med)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>{med.brandName}</span>
                  <span className="text-amber-300">(-{med.savingsPercent}%)</span>
                  <span>✕</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SEARCH & DATABASE LIST                                        */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xl font-black text-gray-900">
              दवा खोजें (Search Database)
            </h3>
            <span className="text-xs font-bold text-gray-500">
              {filteredMedicines.length} दवाएं उपलब्ध
            </span>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ब्रांड या सॉल्ट का नाम लिखें (उदा. Augmentin, Telma, Pan 40, Glycomet)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 text-base font-bold focus:border-emerald-500 focus:outline-none bg-white shadow-sm"
            />
          </div>

          {/* Grid of Generic Savings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {filteredMedicines.map((item) => (
              <div key={item.brandName} className="relative group">
                <GenericSavingsCard genericInfo={item} />
                <button
                  onClick={() => toggleSelectForCalculator(item)}
                  className={`mt-2 w-full py-2 rounded-xl text-xs font-bold transition border ${
                    selectedMeds.some((m) => m.brandName === item.brandName)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {selectedMeds.some((m) => m.brandName === item.brandName)
                    ? '✓ कैलकुलेटर में जुड़ा है'
                    : '+ कैलकुलेटर में जोड़ें'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 font-semibold leading-relaxed">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-bold">सख्त नियामक एवं क्लिनिकल सलाह (Clinical Notice):</p>
            <p>
              जेनेरिक दवाइयों में वही सक्रिय साल्ट (Active Pharmaceutical Ingredient) होता है जो ब्रांडेड में होता है।
              लेकिन खुराक और ब्रांड बदलने से पहले हमेशा अपने डॉक्टर या नजदीकी फार्मासिस्ट से परामर्श अवश्य लें।
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
