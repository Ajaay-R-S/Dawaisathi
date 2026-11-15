'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Mic,
  Camera,
  Keyboard,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
  Plus,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from 'recharts';
import Navbar from '@/components/Navbar';
import VoiceInputButton from '@/components/VoiceInputButton';
import CameraCaptureModal from '@/components/CameraCaptureModal';
import RiskAlertModal from '@/components/RiskAlertModal';
import {
  getHealthReadings,
  saveHealthReading,
  getPatientProfile,
} from '@/lib/supabase';
import { evaluateVitalsRisk } from '@/lib/riskEngine';
import { ParsedVitalsFromSpeech } from '@/lib/speech';
import {
  HealthReading,
  PatientProfile,
  Language,
  RiskEvaluationResult,
} from '@/types';
import { TRANSLATIONS } from '@/data/translations';

export default function HealthPage() {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [language, setLanguage] = useState<Language>('hi');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Active Vitals Type
  const [activeType, setActiveType] = useState<'sugar' | 'bp'>('sugar');
  const [inputMode, setInputMode] = useState<'voice' | 'camera' | 'manual'>('voice');

  // Input states
  const [sugarValue, setSugarValue] = useState<string>('145');
  const [mealContext, setMealContext] = useState<'fasting' | 'post-meal' | 'random'>('post-meal');
  const [bpSystolic, setBpSystolic] = useState<string>('130');
  const [bpDiastolic, setBpDiastolic] = useState<string>('82');

  // Modals & Camera states
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [activeRiskAlert, setActiveRiskAlert] = useState<RiskEvaluationResult | null>(null);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const p = await getPatientProfile();
    setPatient(p);
    if (p.preferred_language) setLanguage(p.preferred_language);

    const data = await getHealthReadings();
    setReadings(data);
  };

  // Handle Spoken Vitals from Web Speech API
  const handleParsedVoiceVitals = (parsed: ParsedVitalsFromSpeech) => {
    if (parsed.type === 'sugar') {
      setActiveType('sugar');
      setSugarValue(parsed.value_numeric.toString());
      if (parsed.meal_context) setMealContext(parsed.meal_context);
    } else {
      setActiveType('bp');
      setBpSystolic(parsed.value_numeric.toString());
      if (parsed.value_secondary) setBpDiastolic(parsed.value_secondary.toString());
    }
  };

  // Handle Camera Capture for Glucometer / BP Screen
  const handleCameraCapture = async (data: { base64: string; compressedKB: number }) => {
    setIsOcrLoading(true);
    try {
      const res = await fetch('/api/extract-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: data.base64,
          isDemo: isDemoMode,
          targetType: activeType,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.type === 'bp') {
          setActiveType('bp');
          setBpSystolic(json.data.value_numeric.toString());
          if (json.data.value_secondary) setBpDiastolic(json.data.value_secondary.toString());
        } else {
          setActiveType('sugar');
          setSugarValue(json.data.value_numeric.toString());
        }
      }
    } catch (e) {
      console.warn('Vitals OCR error:', e);
    } finally {
      setIsOcrLoading(false);
    }
  };

  // Submit and Save Reading
  const handleSaveReading = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let valNum = 0;
    let valSec: number | undefined = undefined;

    if (activeType === 'sugar') {
      valNum = parseFloat(sugarValue);
      if (isNaN(valNum) || valNum <= 0) {
        alert('Please enter a valid blood sugar reading');
        return;
      }
    } else {
      valNum = parseFloat(bpSystolic);
      valSec = parseFloat(bpDiastolic);
      if (isNaN(valNum) || isNaN(valSec)) {
        alert('Please enter valid systolic and diastolic BP numbers');
        return;
      }
    }

    // 1. Evaluate with Rule-Based Risk Engine (NOT LLM only)
    const riskEval = evaluateVitalsRisk(
      {
        type: activeType,
        value_numeric: valNum,
        value_secondary: valSec,
        meal_context: activeType === 'sugar' ? mealContext : undefined,
        patient_name: patient?.full_name,
        emergency_phone: patient?.emergency_contact_phone,
        language,
      },
      readings
    );

    // 2. Persist to Supabase / Local database
    const saved = await saveHealthReading({
      type: activeType,
      value_numeric: valNum,
      value_secondary: valSec,
      meal_context: activeType === 'sugar' ? mealContext : undefined,
      source: inputMode === 'voice' ? 'voice' : inputMode === 'camera' ? 'camera_ocr' : 'manual',
      risk_level: riskEval.risk_level,
      risk_message: riskEval.risk_message,
      action_plan: riskEval.action_steps,
      logged_at: new Date().toISOString(),
    });

    // Update list
    setReadings([saved, ...readings]);

    // 3. If Moderate or High Risk, pop up safety alert modal with WhatsApp link!
    if (riskEval.risk_level !== 'normal') {
      setActiveRiskAlert(riskEval);
      setIsRiskModalOpen(true);
    } else {
      alert(language === 'hi' ? 'रीडिंग सुरक्षित हो गई! स्तर सामान्य है।' : 'Reading saved! Level is safe.');
    }
  };

  // Quick Demo Spike Generator for Judges
  const handleTriggerTestSpike = (spikeType: 'high_sugar' | 'high_bp' | 'trend_rise') => {
    if (spikeType === 'high_sugar') {
      setActiveType('sugar');
      setSugarValue('315');
      setInputMode('manual');
    } else if (spikeType === 'high_bp') {
      setActiveType('bp');
      setBpSystolic('185');
      setBpDiastolic('122');
      setInputMode('manual');
    } else if (spikeType === 'trend_rise') {
      setActiveType('sugar');
      setSugarValue('235');
      setInputMode('manual');
    }
  };

  // Filter readings for Chart
  const filteredReadings = readings
    .filter((r) => r.type === activeType)
    .slice(0, 10)
    .reverse()
    .map((r) => {
      const d = new Date(r.logged_at);
      const timeStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return {
        date: timeStr,
        value: r.value_numeric,
        secondary: r.value_secondary,
        meal: r.meal_context,
      };
    });

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
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Feature 6: Health Safety Loop
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {t.vitals.title}
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-0.5">
              बोलकर, मशीन की फोटो खींचकर या टाइप करके तुरंत जांचें।
            </p>
          </div>

          {/* Test Risk Triggers for Judges */}
          <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
            <span className="text-[11px] font-bold text-gray-400">जज टेस्ट (Triggers):</span>
            <button
              onClick={() => handleTriggerTestSpike('high_sugar')}
              className="text-xs font-bold bg-rose-50 text-rose-800 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-300 transition"
              title="Test >300 mg/dL critical threshold"
            >
              शुगर 315 (Spike)
            </button>
            <button
              onClick={() => handleTriggerTestSpike('high_bp')}
              className="text-xs font-bold bg-red-50 text-red-800 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-300 transition"
              title="Test >180/120 mmHg hypertensive crisis threshold"
            >
              BP 185/122
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VITALS TYPE SELECTOR: SUGAR vs BP                             */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveType('sugar')}
            className={`p-4 sm:p-5 rounded-3xl font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 transition shadow-sm ${
              activeType === 'sugar'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20 ring-4 ring-emerald-200'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border-2 border-gray-200'
            }`}
          >
            <Activity className="w-6 h-6" />
            <span>{t.vitals.sugarTab}</span>
          </button>

          <button
            onClick={() => setActiveType('bp')}
            className={`p-4 sm:p-5 rounded-3xl font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 transition shadow-sm ${
              activeType === 'bp'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-500/20 ring-4 ring-rose-200'
                : 'bg-white text-gray-700 hover:bg-rose-50 border-2 border-gray-200'
            }`}
          >
            <Activity className="w-6 h-6" />
            <span>{t.vitals.bpTab}</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INPUT MODE TABS: VOICE / CAMERA OCR / TYPE                    */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm space-y-5">
          <div className="flex items-center justify-center gap-2 border-b border-gray-100 pb-4">
            <button
              onClick={() => setInputMode('voice')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm sm:text-base font-black transition ${
                inputMode === 'voice'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span>{t.vitals.voiceReading}</span>
            </button>

            <button
              onClick={() => {
                setInputMode('camera');
                setCameraOpen(true);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm sm:text-base font-black transition ${
                inputMode === 'camera'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-5 h-5" />
              <span>{t.vitals.cameraReading}</span>
            </button>

            <button
              onClick={() => setInputMode('manual')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm sm:text-base font-black transition ${
                inputMode === 'manual'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Keyboard className="w-5 h-5" />
              <span>{t.vitals.typeReading}</span>
            </button>
          </div>

          {/* Mode 1: Voice Recognition Component */}
          {inputMode === 'voice' && (
            <div className="py-2">
              <VoiceInputButton
                language={language}
                onParsedVitals={handleParsedVoiceVitals}
                targetType={activeType}
              />
            </div>
          )}

          {/* Mode 2: Camera OCR Progress or Trigger */}
          {inputMode === 'camera' && (
            <div className="text-center py-6 space-y-4">
              {isOcrLoading ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-bold text-gray-700">
                    मशीन की स्क्रीन से नंबर पढ़ा जा रहा है...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Camera className="w-12 h-12 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-gray-700">
                    ग्लूकोमीटर या बीपी मशीन की स्क्रीन सामने रखकर फोटो लें
                  </p>
                  <button
                    onClick={() => setCameraOpen(true)}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow transition"
                  >
                    कैमरा खोलें (Open Camera)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Value Inputs & Context Form */}
          <form onSubmit={handleSaveReading} className="space-y-4 pt-2">
            {activeType === 'sugar' ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-xs font-black text-gray-600 uppercase mb-1">
                      ब्लड शुगर रीडिंग (mg/dL)
                    </label>
                    <input
                      type="number"
                      value={sugarValue}
                      onChange={(e) => setSugarValue(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border-3 border-emerald-300 text-3xl font-black text-gray-900 focus:border-emerald-600 focus:outline-none"
                      placeholder="145"
                      required
                    />
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label className="block text-xs font-black text-gray-600 uppercase mb-1">
                      नापने का समय (Context)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { key: 'fasting', label: t.vitals.fasting },
                        { key: 'post-meal', label: t.vitals.postMeal },
                        { key: 'random', label: t.vitals.random },
                      ] as const).map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setMealContext(key)}
                          className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${
                            mealContext === key
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase mb-1">
                    {t.vitals.systolic} (ऊपर का)
                  </label>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-3 border-rose-300 text-3xl font-black text-gray-900 focus:border-rose-600 focus:outline-none"
                    placeholder="130"
                    required
                  />
                  <span className="text-[11px] text-gray-400 font-semibold">mmHg</span>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase mb-1">
                    {t.vitals.diastolic} (नीचे का)
                  </label>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-3 border-rose-300 text-3xl font-black text-gray-900 focus:border-rose-600 focus:outline-none"
                    placeholder="82"
                    required
                  />
                  <span className="text-[11px] text-gray-400 font-semibold">mmHg</span>
                </div>
              </div>
            )}

            {/* Save Reading Button */}
            <button
              type="submit"
              className="w-full py-4 sm:py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-lg sm:text-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>{t.vitals.saveBtn}</span>
            </button>
          </form>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RECHARTS TREND CHART (7-Day Trend + Safe Reference Areas)     */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-black text-gray-900">
                {t.vitals.trendTitle} ({activeType === 'sugar' ? 'Sugar' : 'BP'})
              </h3>
            </div>
            <span className="text-xs font-bold text-gray-500">
              {activeType === 'sugar' ? 'लक्ष्य: 70-140 mg/dL' : 'लक्ष्य: <130/80 mmHg'}
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredReadings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  domain={activeType === 'sugar' ? [50, 350] : [50, 200]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    borderColor: '#cbd5e1',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />

                {/* Safe Range Green Highlight Band */}
                {activeType === 'sugar' ? (
                  <>
                    <ReferenceArea
                      y1={70}
                      y2={140}
                      fill="#22c55e"
                      fillOpacity={0.08}
                      label={{ value: 'Safe Range', position: 'insideTopLeft', fill: '#16a34a', fontSize: 10 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Blood Sugar (mg/dL)"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#16a34a' }}
                      activeDot={{ r: 8 }}
                    />
                  </>
                ) : (
                  <>
                    <ReferenceArea
                      y1={90}
                      y2={130}
                      fill="#22c55e"
                      fillOpacity={0.08}
                      label={{ value: 'Normal BP', position: 'insideTopLeft', fill: '#16a34a', fontSize: 10 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Systolic (mmHg)"
                      stroke="#dc2626"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#dc2626' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="secondary"
                      name="Diastolic (mmHg)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#3b82f6' }}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Readings List */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm space-y-3">
          <h3 className="text-lg font-black text-gray-900">
            हाल की रीडिंग (Recent History)
          </h3>
          <div className="space-y-2.5">
            {readings.slice(0, 5).map((rdg) => {
              const isHigh = rdg.risk_level === 'high';
              const isMod = rdg.risk_level === 'moderate';
              return (
                <div
                  key={rdg.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isHigh
                      ? 'bg-red-50 border-red-300'
                      : isMod
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 text-lg">
                        {rdg.type === 'sugar'
                          ? `${rdg.value_numeric} mg/dL`
                          : `${rdg.value_numeric}/${rdg.value_secondary || 80} mmHg`}
                      </span>
                      <span
                        className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isHigh
                            ? 'bg-red-600 text-white animate-pulse'
                            : isMod
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rdg.risk_level}
                      </span>
                      <span className="text-[11px] text-gray-400 font-semibold">
                        ({rdg.source})
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      {rdg.risk_message || 'Reading logged successfully'}
                    </p>
                  </div>

                  <span className="text-[11px] text-gray-400 font-semibold shrink-0">
                    {new Date(rdg.logged_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onImageCaptured={handleCameraCapture}
        title="मशीन स्क्रीन की फोटो लें (Snap Device Screen)"
        description="ग्लूकोमीटर या बीपी मशीन की स्क्रीन के अंकों को फ्रेम में रखें"
      />

      {/* Safety Risk Alert Modal (Triggered by Rule-Based Risk Engine) */}
      <RiskAlertModal
        evaluation={activeRiskAlert}
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        patientName={patient?.full_name}
        emergencyPhone={patient?.emergency_contact_phone}
        language={language}
      />
    </div>
  );
}
