'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Camera,
  Activity,
  Calendar,
  ShieldAlert,
  Coins,
  Info,
  User,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdherenceStreak from '@/components/AdherenceStreak';
import {
  getPatientProfile,
  getDailySchedule,
  getHealthReadings,
  savePatientProfile,
  resetDemoState,
} from '@/lib/supabase';
import { PatientProfile, ScheduleItem, HealthReading } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { language, t } = useLanguage();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [editName, setEditName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const prof = await getPatientProfile();
    setPatient(prof);
    setEditName(prof.full_name);
    setEditEmergencyPhone(prof.emergency_contact_phone);

    const sched = await getDailySchedule();
    setSchedule(sched);

    const vitals = await getHealthReadings();
    setReadings(vitals);
  };

  const handleToggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patient) {
      const updated = await savePatientProfile({
        full_name: editName,
        emergency_contact_phone: editEmergencyPhone,
      });
      setPatient(updated);
      setShowProfileModal(false);
    }
  };

  const handleResetDemoData = async () => {
    if (confirm(t('home.resetConfirm'))) {
      await resetDemoState();
      await loadData();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        emergencyPhone={patient?.emergency_contact_phone}
        patientName={patient?.full_name}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Welcome & Patient Header */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-2xl border-2 border-emerald-300 shadow-sm">
              <User className="w-8 h-8 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {t('home.welcome')}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {t('home.patientId')}: {patient?.device_id.slice(-8) || 'device-01'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
                {patient?.full_name || t('home.patientNameDefault')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold">
                {t('home.emergencyContact')}: {patient?.emergency_contact_name || 'Arun (Son)'} (
                {patient?.emergency_contact_phone || '+919876543210'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowProfileModal(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 transition"
            >
              {t('home.editProfile')}
            </button>
            <button
              onClick={handleResetDemoData}
              className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition"
              title={t('home.resetDemo')}
              aria-label={t('home.resetDemo')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CORE REQUIREMENT: FIRST SCREEN WITH JUST 3 BIG BUTTONS        */}
        {/* ------------------------------------------------------------- */}
        <section aria-label={t('home.quickAccessTitle')} className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">
            {t('home.quickAccessTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* BUTTON 1: SCAN PRESCRIPTION */}
            <Link
              href="/prescription"
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-200 border-2 border-blue-400/30"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                  {t('common.step')} 1
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                  {t('home.btnScanTitle')}
                </h3>
                <p className="text-blue-100 text-sm sm:text-base font-semibold mt-1">
                  {t('home.btnScanSub')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold">
                <span>{t('home.btnScanFoot')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* BUTTON 2: LOG SUGAR / BP */}
            <Link
              href="/health"
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-xl shadow-rose-500/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-200 border-2 border-red-400/30"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                  Safety Loop
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                  {t('home.btnLogTitle')}
                </h3>
                <p className="text-rose-100 text-sm sm:text-base font-semibold mt-1">
                  {t('home.btnLogSub')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold">
                <span>{t('home.btnLogFoot')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* BUTTON 3: TODAY'S MEDICINES */}
            <Link
              href="/schedule"
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-200 border-2 border-emerald-400/30"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                  Daily Voice
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                  {t('home.btnScheduleTitle')}
                </h3>
                <p className="text-emerald-100 text-sm sm:text-base font-semibold mt-1">
                  {t('home.btnScheduleSub')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold">
                <span>{t('home.btnScheduleFoot')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* Adherence Streak Summary */}
        <section aria-label={t('common.todayProgress')}>
          <AdherenceStreak
            streakCount={patient?.streak_count || 6}
            schedule={schedule}
          />
        </section>

        {/* Secondary Services Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Drug Safety Interaction Matrix */}
          <Link
            href="/safety"
            className="p-5 rounded-2xl bg-white border-2 border-amber-200 hover:border-amber-400 shadow-sm hover:shadow transition group flex flex-col justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 group-hover:text-amber-800 transition">
                  {t('home.secSafetyTitle')}
                </h4>
                <p className="text-xs text-gray-500">
                  {t('home.secSafetySub')}
                </p>
              </div>
            </div>
            <span className="mt-3 text-xs font-bold text-amber-700 flex items-center gap-1">
              {t('home.secSafetyAction')} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Jan Aushadhi Generic Savings */}
          <Link
            href="/generics"
            className="p-5 rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow transition group flex flex-col justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 group-hover:text-emerald-800 transition">
                  {t('home.secGenericsTitle')}
                </h4>
                <p className="text-xs text-gray-500">
                  {t('home.secGenericsSub')}
                </p>
              </div>
            </div>
            <span className="mt-3 text-xs font-bold text-emerald-700 flex items-center gap-1">
              {t('home.secGenericsAction')} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Honesty & Limits Page */}
          <Link
            href="/limits"
            className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-400 shadow-sm hover:shadow transition group flex flex-col justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 group-hover:text-slate-800 transition">
                  {t('home.secLimitsTitle')}
                </h4>
                <p className="text-xs text-gray-500">
                  {t('home.secLimitsSub')}
                </p>
              </div>
            </div>
            <span className="mt-3 text-xs font-bold text-slate-700 flex items-center gap-1">
              {t('home.secLimitsAction')} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </section>

        {/* Disclaimer Bar */}
        <div className="p-4 rounded-2xl bg-gray-100 border border-gray-200 text-center text-xs text-gray-600 font-semibold leading-relaxed">
          {t('common.disclaimer')}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-gray-900">
              {t('home.profileModalTitle')}
            </h3>
            <p className="text-xs text-gray-500">
              {t('home.profileModalSub')}
            </p>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {t('home.fieldName')}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-bold focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {t('home.fieldPhone')}
                </label>
                <input
                  type="text"
                  value={editEmergencyPhone}
                  onChange={(e) => setEditEmergencyPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-bold focus:border-emerald-500 focus:outline-none"
                  required
                  placeholder="+919876543210"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="w-1/2 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  {t('home.saveProfileBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
