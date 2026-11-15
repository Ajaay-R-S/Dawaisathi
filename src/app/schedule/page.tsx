'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  SunMedium,
  Moon,
  Check,
  Bell,
  Volume2,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import SpeechPlayer from '@/components/SpeechPlayer';
import AdherenceStreak from '@/components/AdherenceStreak';
import {
  getDailySchedule,
  toggleScheduleItem,
  getPatientProfile,
  savePatientProfile,
} from '@/lib/supabase';
import { speakText } from '@/lib/speech';
import { ScheduleItem, PatientProfile, Language, Slot } from '@/types';
import { TRANSLATIONS } from '@/data/translations';

export default function SchedulePage() {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [language, setLanguage] = useState<Language>('hi');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [voiceScript, setVoiceScript] = useState<string>('');
  const [isScriptLoading, setIsScriptLoading] = useState<boolean>(false);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    loadData();
    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationEnabled(Notification.permission === 'granted');
    }
  }, []);

  const loadData = async () => {
    const p = await getPatientProfile();
    setPatient(p);
    if (p.preferred_language) setLanguage(p.preferred_language);

    const sched = await getDailySchedule();
    setSchedule(sched);
    generateVoiceScript(sched, p.preferred_language || 'hi');
  };

  const generateVoiceScript = async (items: ScheduleItem[], lang: Language) => {
    setIsScriptLoading(true);
    try {
      const res = await fetch('/api/voice-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: items,
          language: lang,
          isDemo: isDemoMode,
          patientName: patient?.full_name || 'बाबा',
        }),
      });
      const data = await res.json();
      if (data.script) {
        setVoiceScript(data.script);
      }
    } catch (e) {
      console.warn('Voice script fetch error:', e);
    } finally {
      setIsScriptLoading(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (patient) {
      savePatientProfile({ preferred_language: lang });
    }
    generateVoiceScript(schedule, lang);
  };

  const handleToggleTaken = async (id: string, currentTaken: boolean) => {
    const updated = await toggleScheduleItem(id, !currentTaken);
    setSchedule(updated);

    // If turned on, speak positive reinforcement
    if (!currentTaken) {
      const positiveWords =
        language === 'hi'
          ? 'शाबाश! आपने दवा ले ली।'
          : 'Good job! Medicine marked as taken.';
      speakText(positiveWords, language);
    }
  };

  const handleSpeakItem = (item: ScheduleItem) => {
    const itemText = `${item.medicine_name}, ${item.dose}, ${item.timing}, ${item.color_shape_hint}`;
    speakText(itemText, language);
  };

  const handleRequestNotifications = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationEnabled(true);
        new Notification('दवाई साथी (DawaiSaathi)', {
          body: 'दवा के समय पर आपको याद दिलाया जाएगा! (Reminders Active)',
          icon: '/favicon.ico',
        });
      }
    }
  };

  // Group by slots
  const morningList = schedule.filter((s) => s.slot === 'morning');
  const afternoonList = schedule.filter((s) => s.slot === 'afternoon');
  const nightList = schedule.filter((s) => s.slot === 'night');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        currentLang={language}
        onLanguageChange={handleLanguageChange}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        emergencyPhone={patient?.emergency_contact_phone}
        patientName={patient?.full_name}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Header & Notifications Trigger */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Feature 4 & 5: Voice + Timetable
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {t.homeButtons.todaySchedule}
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-0.5">
              सुबह, दोपहर और रात की दवाएं देखें और आवाज में सुनें।
            </p>
          </div>

          {/* Browser Notification Button */}
          <button
            onClick={handleRequestNotifications}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition border shadow-sm ${
              notificationEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>
              {notificationEnabled ? 'रिमाइंडर चालू है ✓' : 'रिमाइंडर चालू करें (Alerts)'}
            </span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VOICE EXPLANATION IN LOCAL LANGUAGE (Web Speech API + Play)   */}
        {/* ------------------------------------------------------------- */}
        <SpeechPlayer
          textToSpeak={voiceScript}
          language={language}
          onRefreshScript={() => generateVoiceScript(schedule, language)}
          isLoading={isScriptLoading}
        />

        {/* Adherence Streak */}
        <AdherenceStreak
          streakCount={patient?.streak_count || 6}
          schedule={schedule}
        />

        {/* ------------------------------------------------------------- */}
        {/* DAILY SCHEDULE BY SLOTS (Morning, Afternoon, Night)           */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-6">
          {/* MORNING SLOT */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Sun className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    सुबह (Morning)
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    नाश्ते से पहले व बाद की दवाएं
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                {morningList.filter((m) => m.taken).length} / {morningList.length} ली गई
              </span>
            </div>

            <div className="space-y-3">
              {morningList.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-2">
                  सुबह के लिए कोई दवा निर्धारित नहीं है।
                </p>
              ) : (
                morningList.map((item) => (
                  <ScheduleItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggleTaken(item.id, item.taken)}
                    onSpeak={() => handleSpeakItem(item)}
                  />
                ))
              )}
            </div>
          </div>

          {/* AFTERNOON SLOT */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-orange-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center">
                  <SunMedium className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    दोपहर (Afternoon)
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    दोपहर के खाने के बाद की दवाएं
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-800 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                {afternoonList.filter((m) => m.taken).length} / {afternoonList.length} ली गई
              </span>
            </div>

            <div className="space-y-3">
              {afternoonList.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-2">
                  दोपहर के लिए कोई दवा निर्धारित नहीं है।
                </p>
              ) : (
                afternoonList.map((item) => (
                  <ScheduleItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggleTaken(item.id, item.taken)}
                    onSpeak={() => handleSpeakItem(item)}
                  />
                ))
              )}
            </div>
          </div>

          {/* NIGHT SLOT */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-indigo-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                  <Moon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    रात (Night / Bedtime)
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    रात के खाने व सोने से पहले की दवाएं
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                {nightList.filter((m) => m.taken).length} / {nightList.length} ली गई
              </span>
            </div>

            <div className="space-y-3">
              {nightList.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-2">
                  रात के लिए कोई दवा निर्धारित नहीं है।
                </p>
              ) : (
                nightList.map((item) => (
                  <ScheduleItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggleTaken(item.id, item.taken)}
                    onSpeak={() => handleSpeakItem(item)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface ScheduleItemCardProps {
  item: ScheduleItem;
  onToggle: () => void;
  onSpeak: () => void;
}

function ScheduleItemCard({ item, onToggle, onSpeak }: ScheduleItemCardProps) {
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
        item.taken
          ? 'bg-emerald-50/60 border-emerald-300 opacity-80'
          : 'bg-white border-gray-200 hover:border-emerald-400 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        {/* Big Checkbox for Elderly Fingers */}
        <button
          onClick={onToggle}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition shadow-sm active:scale-90 ${
            item.taken
              ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
              : 'border-2 border-gray-300 hover:border-emerald-500 bg-gray-50'
          }`}
          aria-label={item.taken ? 'Mark not taken' : 'Mark taken'}
        >
          {item.taken && <Check className="w-6 h-6 stroke-[3]" />}
        </button>

        {/* Medicine Details */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`text-lg sm:text-xl font-black ${
                item.taken ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {item.medicine_name}
            </h4>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
              {item.dose}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-emerald-800 font-bold">
            {item.timing}
          </p>

          <div className="flex items-center gap-2 pt-0.5 text-xs text-gray-500">
            <span className="bg-amber-50 text-amber-900 font-semibold px-2 py-0.5 rounded border border-amber-200">
              गोली: {item.color_shape_hint}
            </span>
            {item.taken_at && (
              <span className="text-emerald-700 font-bold">
                (ली गई: {item.taken_at})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Single Item Voice Read Aloud Button */}
      <button
        onClick={onSpeak}
        className="p-3 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition shrink-0"
        title="इस दवा के बारे में सुनें"
        aria-label="Speak Medicine"
      >
        <Volume2 className="w-5 h-5" />
      </button>
    </div>
  );
}
