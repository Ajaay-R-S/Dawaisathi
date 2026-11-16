'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Search,
  BookOpen,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { DANGEROUS_INTERACTIONS, findLocalInteractions } from '@/data/drugInteractions';
import { getPatientProfile } from '@/lib/supabase';
import { DrugInteractionRule, PatientProfile } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export default function SafetyPage() {
  const { language, t, formatNumber } = useLanguage();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'High' | 'Medium'>('All');

  // Interactive Live Tester
  const [testDrugA, setTestDrugA] = useState('Warfarin');
  const [testDrugB, setTestDrugB] = useState('Aspirin');
  const [testResult, setTestResult] = useState<DrugInteractionRule[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    getPatientProfile().then((p) => {
      setPatient(p);
    });
    runCheck('Warfarin', 'Aspirin');
  }, [language]);

  const runCheck = async (drugA: string, drugB: string) => {
    setIsChecking(true);
    const local = findLocalInteractions([drugA, drugB]);
    setTestResult(local);

    try {
      const res = await fetch('/api/drug-safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicines: [drugA, drugB],
          language,
          isDemo: isDemoMode,
        }),
      });
      const data = await res.json();
      if (data.interactions && data.interactions.length > 0) {
        setTestResult(data.interactions);
      }
    } catch (e) {
      console.warn('API safety check failed, using local rules table');
    } finally {
      setIsChecking(false);
    }
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCheck(testDrugA, testDrugB);
  };

  const filteredRules = DANGEROUS_INTERACTIONS.filter((rule) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      rule.drugA.toLowerCase().includes(q) ||
      rule.drugB.toLowerCase().includes(q) ||
      (rule.plainLanguage[language] || rule.plainLanguage.en).toLowerCase().includes(q);

    const matchesSeverity = severityFilter === 'All' || rule.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        emergencyPhone={patient?.emergency_contact_phone}
        patientName={patient?.full_name}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            {t('safety.badge')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            {t('safety.title')}
          </h1>
          <p className="text-sm text-gray-500 font-semibold">
            {t('safety.subtitle')}
          </p>
        </div>

        {/* INTERACTIVE DRUG INTERACTION TESTER */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl font-black text-gray-900">
              {t('safety.checkPairTitle')}
            </h3>
          </div>

          <form onSubmit={handleTestSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">
                  {t('safety.drugALabel')}
                </label>
                <input
                  type="text"
                  value={testDrugA}
                  onChange={(e) => setTestDrugA(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 font-bold focus:border-emerald-500 focus:outline-none"
                  placeholder={t('safety.drugAPlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">
                  {t('safety.drugBLabel')}
                </label>
                <input
                  type="text"
                  value={testDrugB}
                  onChange={(e) => setTestDrugB(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 font-bold focus:border-emerald-500 focus:outline-none"
                  placeholder={t('safety.drugBPlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Quick Preset Buttons for Hackathon Judges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-gray-400">{t('safety.presetTitle')}</span>
              {[
                ['Warfarin', 'Aspirin'],
                ['Metformin', 'Alcohol'],
                ['Lisinopril', 'Potassium'],
                ['Sildenafil', 'Nitroglycerin'],
                ['Methotrexate', 'Ibuprofen'],
              ].map(([a, b]) => (
                <button
                  key={`${a}-${b}`}
                  type="button"
                  onClick={() => {
                    setTestDrugA(a);
                    setTestDrugB(b);
                    runCheck(a, b);
                  }}
                  className="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 transition"
                >
                  {a} + {b}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isChecking}
              className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-lg shadow-lg shadow-amber-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>{isChecking ? t('safety.checkingBtn') : t('safety.checkSafetyBtn')}</span>
            </button>
          </form>

          {/* Test Results Output */}
          <div className="pt-2">
            {testResult.length > 0 ? (
              <div className="space-y-3">
                {testResult.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-red-50 border-3 border-red-500 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-red-950 uppercase">
                        ⚠️ {rule.drugA} + {rule.drugB}
                      </span>
                      <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full">
                        {rule.severity} RISK
                      </span>
                    </div>
                    <p className="text-base font-bold text-red-900 leading-relaxed">
                      {rule.plainLanguage[language] || rule.plainLanguage.en}
                    </p>
                    <p className="text-xs text-gray-600 font-mono pt-1 border-t border-red-200">
                      {t('safety.clinicalDetails')} {rule.medicalExplanation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <p className="text-sm font-bold text-emerald-900">
                  {t('safety.noInteractionFound', { drugA: testDrugA, drugB: testDrugB })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* COMPREHENSIVE 30+ RULES TABLE BROWSER */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-700" />
              <h3 className="text-xl font-black text-gray-900">
                {t('safety.matrixTitle')}
              </h3>
            </div>
            <span className="text-xs font-bold text-gray-500">
              {t('safety.matrixCount', { count: formatNumber(filteredRules.length) })}
            </span>
          </div>

          {/* Search & Severity Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('safety.searchPlaceholder')}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-200 text-sm font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {[
                { key: 'All', label: t('safety.filterAll') },
                { key: 'High', label: t('safety.filterHigh') },
                { key: 'Medium', label: t('safety.filterMedium') },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSeverityFilter(key as any)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition ${
                    severityFilter === key
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-3 pt-1">
            {filteredRules.map((rule, index) => {
              const isHigh = rule.severity === 'High';
              return (
                <div
                  key={index}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition ${
                    isHigh
                      ? 'bg-red-50/40 border-red-200 hover:border-red-400'
                      : 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-gray-900 text-base">
                      {rule.drugA.toUpperCase()} + {rule.drugB.toUpperCase()}
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 leading-snug">
                    {rule.plainLanguage[language] || rule.plainLanguage.en}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono mt-1 pt-1 border-t border-gray-200">
                    Pharmacology: {rule.medicalExplanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
