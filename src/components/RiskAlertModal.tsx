'use client';

import React from 'react';
import { AlertTriangle, PhoneCall, MessageCircle, X, ShieldAlert } from 'lucide-react';
import { RiskEvaluationResult } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface RiskAlertModalProps {
  evaluation: RiskEvaluationResult | null;
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  emergencyPhone?: string;
}

export default function RiskAlertModal({
  evaluation,
  isOpen,
  onClose,
  patientName = 'Patient',
  emergencyPhone = '+919876543210',
}: RiskAlertModalProps) {
  const { t } = useLanguage();

  if (!isOpen || !evaluation) return null;

  const isHighRisk = evaluation.risk_level === 'high';
  const cleanPhone = emergencyPhone.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden border-4 ${
          isHighRisk ? 'border-red-600' : 'border-amber-500'
        }`}
      >
        {/* Header Alert Strip */}
        <div
          className={`px-6 py-5 text-white flex items-center justify-between ${
            isHighRisk ? 'bg-red-600' : 'bg-amber-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full inline-block">
                {isHighRisk ? t('common.danger') : t('common.warning')}
              </span>
              <h3 className="text-xl font-black mt-0.5">{evaluation.risk_title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
            aria-label={t('common.close')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Main Risk Explanation */}
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-950 font-bold text-base sm:text-lg">
            {evaluation.risk_message}
          </div>

          {/* Action Steps */}
          <div>
            <h4 className="text-sm font-black text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-700" />
              <span>{t('prescription.doctorNotesTitle')}:</span>
            </h4>
            <div className="space-y-2">
              {evaluation.action_steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm sm:text-base font-semibold"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency SOS Actions */}
          <div className="space-y-3 pt-2 border-t">
            {/* One-Tap WhatsApp Button */}
            {evaluation.whatsapp_text ? (
              <a
                href={evaluation.whatsapp_text}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg transition"
              >
                <MessageCircle className="w-6 h-6" />
                <span>{t('emergency.sendSosWhatsapp')}</span>
              </a>
            ) : null}

            {/* 108 Emergency Ambulance Button */}
            <a
              href="tel:108"
              className="w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-base flex items-center justify-center gap-2 shadow transition"
            >
              <PhoneCall className="w-5 h-5" />
              <span>{t('emergency.call108Full')}</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-center text-gray-600 font-bold text-sm hover:underline"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
