'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  SunMedium,
  Moon,
  Check,
  Bell,
  Volume2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import SpeechPlayer from '@/components/SpeechPlayer';
import AdherenceStreak from '@/components/AdherenceStreak';
import {
  getDailySchedule,
  toggleScheduleItem,
  getPatientProfile,
} from '@/lib/supabase';
import { speakText } from '@/lib/speech';
import { ScheduleItem, PatientProfile } from '@/types';
import { useLanguage, Language } from '@/context/LanguageContext';

export default function SchedulePage() {
  const { language, t, formatNumber, formatTime } = useLanguage();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [voiceScript, setVoiceScript] = useState<string>('');
  const [isScriptLoading, setIsScriptLoading] = useState<boolean>(false);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(false);

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationEnabled(Notification.permission === 'granted');
    }
  }, []);

  // When language changes, re-fetch voice script in the new language
  useEffect(() => {
    if (schedule.length > 0) {
      generateVoiceScript(schedule, language);
    }
  }, [language]);

  const loadData = async () => {
    const p = await getPatientProfile();
    setPatient(p);

    const sched = await getDailySchedule();
    setSchedule(sched);
    generateVoiceScript(sched, language);
  };

  const generateVoiceScript = async (items: ScheduleItem[], targetLang: Language) => {
    setIsScriptLoading(true);
    try {
      const res = await fetch('/api/voice-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: items,
          language: targetLang,
          isDemo: isDemoMode,
          patientName: patient?.full_name || 'Patient',
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

  const handleToggleTaken = async (id: string, currentTaken: boolean) => {
    const updated = await toggleScheduleItem(id, !currentTaken);
    setSchedule(updated);

    if (!currentTaken) {
      speakText(t('schedule.wellDoneTaken'), language);
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
        new Notification(t('schedule.notificationTitle'), {
          body: t('schedule.notificationBody'),
          icon: '/favicon.ico',
        });
      }
    }
  };

  const morningList = schedule.filter((s) => s.slot === 'morning');
  const afternoonList = schedule.filter((s) => s.slot === 'afternoon');
  const nightList = schedule.filter((s) => s.slot === 'night');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
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
              {t('schedule.badge')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {t('schedule.title')}
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-0.5">
              {t('schedule.subtitle')}
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
              {notificationEnabled ? t('schedule.alertsActive') : t('schedule.enableAlerts')}
            </span>
          </button>
        </div>

        {/* VOICE EXPLANATION IN LOCAL LANGUAGE */}
        <SpeechPlayer
          textToSpeak={voiceScript}
          onRefreshScript={() => generateVoiceScript(schedule, language)}
          isLoading={isScriptLoading}
        />

        {/* Adherence Streak */}
        <AdherenceStreak
          streakCount={patient?.streak_count || 6}
          schedule={schedule}
        />

        {/* DAILY SCHEDULE BY SLOTS */}
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
                    {t('schedule.morningTitle')}
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    {t('schedule.morningSub')}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                {t('schedule.slotTakenCount', {
                  taken: formatNumber(morningList.filter((m) => m.taken).length),
                  total: formatNumber(morningList.length),
                })}
              </span>
            </div>

            <div className="space-y-3">
              {morningList.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-2">
                  {t('schedule.emptyMorning')}
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
                    {t('schedule.afternoonTitle')}
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    {t('schedule.afternoonSub')}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-800 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                {t('schedule.slotTakenCount', {
                  taken: formatNumber(afternoonList.filter((m) => m.taken).length),
                  total: formatNumber(afternoonList.length),
                })}
              </span>
            </div>

            <div className="space-y-3">
              {afternoonList.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-2">
                  {t('schedule.emptyAfternoon')}
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
                    {t('schedule.nightTitle')}
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    {t('schedule.nightSub')}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                {t('schedule.slotTakenCount', {
                  taken: formatNumber(nightList.filter((m) => m.taken).length),
                  total: formatNumber(nightList.length),
                })}
              </span>
            </div>

            <div className="space-y-3">
              {nightList.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-2">
                  {t('schedule.emptyNight')}
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
  const { t } = useLanguage();

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
        item.taken
          ? 'bg-emerald-50/60 border-emerald-300 opacity-80'
          : 'bg-white border-gray-200 hover:border-emerald-400 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        {/* Big Checkbox */}
        <button
          onClick={onToggle}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition shadow-sm active:scale-90 ${
            item.taken
              ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
              : 'border-2 border-gray-300 hover:border-emerald-500 bg-gray-50'
          }`}
          aria-label={item.taken ? t('common.verified') : t('common.verify')}
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
              {t('schedule.pillHint')} {item.color_shape_hint}
            </span>
            {item.taken_at && (
              <span className="text-emerald-700 font-bold">
                {t('schedule.takenAt', { time: item.taken_at })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Single Item Voice Read Aloud Button */}
      <button
        onClick={onSpeak}
        className="p-3 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition shrink-0"
        title={t('schedule.speakMedicineTitle')}
        aria-label={t('schedule.speakMedicineTitle')}
      >
        <Volume2 className="w-5 h-5" />
      </button>
    </div>
  );
}
