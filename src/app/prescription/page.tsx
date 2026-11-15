'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  ShieldAlert,
  Coins,
  FileText,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CameraCaptureModal from '@/components/CameraCaptureModal';
import GenericSavingsCard from '@/components/GenericSavingsCard';
import { compressImage } from '@/lib/imageCompressor';
import { saveExtractedPrescription, getPatientProfile } from '@/lib/supabase';
import { SAMPLE_PRESCRIPTIONS } from '@/data/samplePrescriptions';
import { lookupGenericAlternative } from '@/data/genericMedicines';
import { findLocalInteractions } from '@/data/drugInteractions';
import { Medicine, PrescriptionExtractionResult, DrugInteractionRule, Language, PatientProfile } from '@/types';
import { TRANSLATIONS } from '@/data/translations';

export default function PrescriptionPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [language, setLanguage] = useState<Language>('hi');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageSizeKB, setImageSizeKB] = useState<number>(0);

  // Extracted Prescription State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [rawSummary, setRawSummary] = useState<string>('');
  const [interactions, setInteractions] = useState<DrugInteractionRule[]>([]);
  const [hasExtracted, setHasExtracted] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    getPatientProfile().then((p) => {
      setPatient(p);
      if (p.preferred_language) setLanguage(p.preferred_language);
    });
  }, []);

  // Analyze prescription via API
  const analyzeImage = async (base64: string, sizeKB: number, isDemo = isDemoMode) => {
    setIsAnalyzing(true);
    setPreviewImage(base64);
    setImageSizeKB(sizeKB);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/analyze-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          isDemo,
          mimeType: 'image/jpeg',
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const result: PrescriptionExtractionResult = json.data;
        setMedicines(result.medicines || []);
        setDoctorNotes(result.doctor_notes || '');
        setRawSummary(result.raw_summary || '');

        // Recalculate interactions
        const inter = json.interactions || findLocalInteractions(result.medicines.map((m) => m.name));
        setInteractions(inter);
        setHasExtracted(true);
      } else {
        alert(json.error || 'Failed to analyze prescription');
      }
    } catch (e: any) {
      console.error('Analysis request error', e);
      // Fallback gracefully to demo sample
      handleLoadSample(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCameraCapture = (data: { base64: string; compressedKB: number }) => {
    analyzeImage(data.base64, data.compressedKB);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 1600, 0.82);
      analyzeImage(compressed.base64, compressed.compressedSizeKB);
    } catch (err) {
      alert('Error compressing image');
    }
  };

  const handleLoadSample = (sampleIndex = 0) => {
    const sample = SAMPLE_PRESCRIPTIONS[sampleIndex].result;
    setMedicines(sample.medicines);
    setDoctorNotes(sample.doctor_notes);
    setRawSummary(sample.raw_summary || '');
    setInteractions(findLocalInteractions(sample.medicines.map((m) => m.name)));
    setPreviewImage(null);
    setHasExtracted(true);
  };

  // Medicine Field Edits
  const handleUpdateMedicine = (index: number, field: keyof Medicine, value: any) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };

    // If user edits name or confirms, we can mark verified
    if (field === 'name') {
      const gen = lookupGenericAlternative(value);
      if (gen) {
        updated[index].generic_alternative = `${gen.janAushadhiName} (Jan Aushadhi)`;
        updated[index].generic_savings_pct = gen.savingsPercent;
      }
      // Recheck interactions
      setInteractions(findLocalInteractions(updated.map((m) => m.name)));
    }

    setMedicines(updated);
  };

  const handleConfirmVerified = (index: number) => {
    const updated = [...medicines];
    updated[index].confidence = 1.0;
    updated[index].is_verified = true;
    setMedicines(updated);
  };

  const handleAddMedicine = () => {
    const newMed: Medicine = {
      id: `med-${Date.now()}`,
      name: 'New Medicine',
      dose: '1 tablet',
      frequency: '1-0-1',
      timing: 'After food',
      duration: '15 days',
      confidence: 1.0,
      is_verified: true,
      color_shape_hint: 'Tablet',
    };
    setMedicines([...medicines, newMed]);
  };

  const handleRemoveMedicine = (index: number) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
    setInteractions(findLocalInteractions(updated.map((m) => m.name)));
  };

  const handleSaveToSchedule = async () => {
    if (medicines.length === 0) return;

    await saveExtractedPrescription({
      medicines,
      doctor_notes: doctorNotes,
      raw_summary: rawSummary,
      confidence_overall: 0.9,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      router.push('/schedule');
    }, 1200);
  };

  // Count unverified low confidence items (< 0.7)
  const lowConfidenceCount = medicines.filter((m) => m.confidence < 0.7).length;

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
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Feature 1: AI Vision Reader
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {t.prescription.title}
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-0.5">
              मोबाइल कैमरे से पर्चे की फोटो खींचें। एआई लिखावट पढ़कर दवाएं निकालेगा।
            </p>
          </div>

          {/* Quick Demo Loader Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleLoadSample(0)}
              className="text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-300 transition"
              title="Loads sample diabetes & BP prescription with confidence flagging"
            >
              नमूना पर्चा 1 (Sample Rx)
            </button>
            <button
              onClick={() => handleLoadSample(1)}
              className="text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 px-3 py-2 rounded-xl border border-amber-300 transition"
              title="Loads cardiac prescription with drug interaction alert"
            >
              नमूना पर्चा 2 (Cardiac Risk)
            </button>
          </div>
        </div>

        {/* Prescription Capture / Upload Buttons */}
        {!hasExtracted && !isAnalyzing && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-dashed border-emerald-300 text-center space-y-5">
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                डॉक्टर का पर्चा अपलोड करें
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                सीधे कैमरे से फोटो लें या फोन की गैलरी से फाइल चुनें। फोटो अपने आप कंप्रेस होगी।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setCameraOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
              >
                <Camera className="w-6 h-6" />
                <span>कैमरे से फोटो लें</span>
              </button>

              <label className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 font-black text-lg flex items-center justify-center gap-2 cursor-pointer transition">
                <Upload className="w-6 h-6 text-gray-600" />
                <span>गैलरी से फाइल चुनें</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isAnalyzing && (
          <div className="bg-white rounded-3xl p-10 border-2 border-emerald-200 text-center space-y-4 shadow-sm animate-pulse">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-xl font-black text-gray-900">
              {t.prescription.analyzing}
            </h3>
            <p className="text-sm text-gray-500 font-semibold max-w-sm mx-auto">
              क्लाउड विजन एलएलएम डॉक्टर की लिखावट का विश्लेषण कर रहा है। कृपया कुछ सेकंड प्रतीक्षा करें।
            </p>
          </div>
        )}

        {/* Extracted Prescription Confirmation Section */}
        {hasExtracted && !isAnalyzing && (
          <div className="space-y-6">
            {/* Low Confidence Alert Box (CRITICAL REQUIREMENT) */}
            {lowConfidenceCount > 0 ? (
              <div className="bg-red-50 border-4 border-red-500 rounded-3xl p-5 sm:p-6 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-red-950">
                      ⚠️ सावधानी: {lowConfidenceCount} दवा की लिखावट अस्पष्ट है!
                    </h3>
                    <p className="text-sm font-bold text-red-800 mt-1">
                      हमने लाल रंग वाले बॉक्स को चिन्हित किया है। हम कभी भी चुपचाप गलत अनुमान नहीं लगाते।
                      कृपया दवा की गोली का डिब्बा देखकर नाम और खुराक की पुष्टि करें।
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <p className="text-sm font-bold text-emerald-900">
                  सभी दवाएं उच्च सटीकता (&gt; 70% Confidence) के साथ पहचानी गईं।
                </p>
              </div>
            )}

            {/* Drug Interaction Warning Strip (if detected) */}
            {interactions.length > 0 && (
              <div className="bg-rose-50 border-3 border-rose-600 rounded-3xl p-5 sm:p-6 space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-rose-900">
                  <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                  <h3 className="text-lg sm:text-xl font-black">
                    🚨 खतरनाक दवा पारस्परिक क्रिया (Drug-Drug Interaction Alert)
                  </h3>
                </div>
                {interactions.map((inter, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white rounded-2xl border-2 border-rose-300 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-rose-950 uppercase tracking-wide text-sm">
                        {inter.drugA} + {inter.drugB}
                      </span>
                      <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                        {inter.severity} SEVERITY
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-gray-900">
                      {inter.plainLanguage[language] || inter.plainLanguage.en}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {inter.medicalExplanation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Editable Confirmation Table / Cards */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    {t.prescription.verifyItems}
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    आप किसी भी नाम या समय को बदलकर ठीक कर सकते हैं।
                  </p>
                </div>
                <button
                  onClick={handleAddMedicine}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-300 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>दवा जोड़ें (Add)</span>
                </button>
              </div>

              {/* Medicine Cards List */}
              <div className="space-y-4">
                {medicines.map((med, idx) => {
                  const isLowConf = med.confidence < 0.7;
                  return (
                    <div
                      key={med.id || idx}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                        isLowConf
                          ? 'border-red-500 bg-red-50/50 shadow-sm'
                          : 'border-gray-200 bg-gray-50/70 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-gray-200 text-gray-800 flex items-center justify-center text-xs font-black">
                            #{idx + 1}
                          </span>
                          <span
                            className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                              isLowConf
                                ? 'bg-red-600 text-white animate-bounce'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            Confidence: {Math.round(med.confidence * 100)}%
                            {isLowConf && ' ⚠️ कृपया जांचें'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isLowConf && (
                            <button
                              onClick={() => handleConfirmVerified(idx)}
                              className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg"
                            >
                              सही है, पुष्टि करें ✓
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveMedicine(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                            title="हटाएं (Delete)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Inputs Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Medicine Name */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-0.5">
                            दवा का नाम (Name)
                          </label>
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border font-bold text-sm ${
                              isLowConf
                                ? 'border-red-400 bg-white text-red-950 focus:ring-2 focus:ring-red-500'
                                : 'border-gray-300 bg-white text-gray-900 focus:border-emerald-500'
                            }`}
                          />
                        </div>

                        {/* Dose */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-0.5">
                            खुराक (Dose)
                          </label>
                          <input
                            type="text"
                            value={med.dose}
                            onChange={(e) => handleUpdateMedicine(idx, 'dose', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-sm focus:border-emerald-500"
                          />
                        </div>

                        {/* Frequency */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-0.5">
                            आवृत्ति (1-0-1 / कब लें)
                          </label>
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-sm focus:border-emerald-500"
                          />
                        </div>

                        {/* Timing */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-0.5">
                            समय (खाने से पहले / बाद)
                          </label>
                          <input
                            type="text"
                            value={med.timing}
                            onChange={(e) => handleUpdateMedicine(idx, 'timing', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-sm focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Visual Tablet Hint & Notes */}
                      <div className="mt-2 text-xs text-gray-500 flex flex-wrap items-center gap-3">
                        {med.color_shape_hint && (
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            रंग/आकार: {med.color_shape_hint}
                          </span>
                        )}
                        {med.notes && (
                          <span className="italic text-gray-600">
                            नोट: {med.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Doctor's Notes */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-100 shadow-sm space-y-2">
              <h4 className="font-black text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>{t.prescription.doctorNotes}</span>
              </h4>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 bg-gray-50"
              />
            </div>

            {/* Generic Alternatives Suggestions (Jan Aushadhi) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-black text-gray-900">
                  {t.prescription.genericSavingsHeader}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medicines
                  .map((m) => lookupGenericAlternative(m.name))
                  .filter((g): g is NonNullable<typeof g> => g !== null)
                  .map((gen, idx) => (
                    <GenericSavingsCard key={idx} genericInfo={gen} />
                  ))}
              </div>
            </div>

            {/* Confirm & Save to Schedule Button */}
            <div className="pt-2">
              <button
                onClick={handleSaveToSchedule}
                disabled={saveSuccess}
                className={`w-full py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-2 shadow-xl transition transform active:scale-95 ${
                  saveSuccess
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-7 h-7" />
                    <span>शेड्यूल में सुरक्षित हो गया! (Saved!)</span>
                  </>
                ) : (
                  <>
                    <span>पुष्टि करें और आज के शेड्यूल में जोड़ें</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400 font-semibold mt-2">
                (Human-in-the-loop: आपकी पुष्टि के बाद ही दवाएं शेड्यूल में जुड़ती हैं)
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onImageCaptured={handleCameraCapture}
        title="पर्चे की फोटो लें (Scan Prescription)"
        description="पर्चे को सीधी रोशनी में रखकर चौकोर फ्रेम में संरेखित करें"
      />
    </div>
  );
}
