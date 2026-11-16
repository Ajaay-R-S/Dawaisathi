'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '@/lib/speech';
import { useLanguage } from '@/context/LanguageContext';

interface SpeechPlayerProps {
  textToSpeak: string;
  onRefreshScript?: () => void;
  isLoading?: boolean;
}

export default function SpeechPlayer({
  textToSpeak,
  onRefreshScript,
  isLoading = false,
}: SpeechPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    setSupported(isSpeechSynthesisSupported());
    return () => {
      stopSpeaking();
    };
  }, []);

  // When language or script changes, stop speech
  useEffect(() => {
    stopSpeaking();
    setIsPlaying(false);
  }, [language, textToSpeak]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      if (!textToSpeak) return;
      setIsPlaying(true);
      speakText(
        textToSpeak,
        language,
        () => setIsPlaying(false),
        () => setIsPlaying(false)
      );
    }
  };

  const handleReplay = () => {
    stopSpeaking();
    setIsPlaying(true);
    speakText(
      textToSpeak,
      language,
      () => setIsPlaying(false),
      () => setIsPlaying(false)
    );
  };

  if (!supported) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-sm font-semibold">
        {t('schedule.browserNoSpeech')}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-5 sm:p-7 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Title and Voice Wave */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-emerald-200" />
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              {t('schedule.voicePlayerTitle')}
            </h3>
          </div>
          <p className="text-emerald-100 text-sm sm:text-base">
            {isPlaying ? t('schedule.voicePlayerPlaying') : t('schedule.voicePlayerListening')}
          </p>
        </div>

        {/* Big Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {onRefreshScript && (
            <button
              onClick={onRefreshScript}
              disabled={isLoading || isPlaying}
              className="p-3.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl transition disabled:opacity-50"
              title={t('schedule.voicePlayerRefresh')}
              aria-label={t('schedule.voicePlayerRefresh')}
            >
              <Sparkles className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={handleReplay}
            disabled={!textToSpeak || isLoading}
            className="p-3.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl transition disabled:opacity-50"
            title={t('schedule.voicePlayerReplay')}
            aria-label={t('schedule.voicePlayerReplay')}
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          {/* Big Elderly-Friendly Play/Pause Button */}
          <button
            onClick={handleTogglePlay}
            disabled={!textToSpeak || isLoading}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-lg sm:text-xl shadow-lg transition transform active:scale-95 disabled:opacity-50 ${
              isPlaying
                ? 'bg-amber-400 text-amber-950 hover:bg-amber-300 ring-4 ring-amber-300/40'
                : 'bg-white text-emerald-900 hover:bg-emerald-50 ring-4 ring-white/30'
            }`}
            aria-label={isPlaying ? t('schedule.voicePlayerStop') : t('schedule.voicePlayerPlay')}
          >
            {isPlaying ? (
              <>
                <Pause className="w-7 h-7 fill-current" />
                <span>{t('schedule.voicePlayerStop')}</span>
              </>
            ) : (
              <>
                <Play className="w-7 h-7 fill-current ml-0.5" />
                <span>{t('schedule.voicePlayerPlay')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Audio Waves Animation */}
      {isPlaying && (
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-center gap-1.5 h-8">
          {[40, 70, 95, 60, 100, 75, 45, 90, 65, 80, 50, 90, 70, 40].map((h, i) => (
            <div
              key={i}
              className="w-1.5 bg-amber-300 rounded-full animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${(i % 5) * 0.15}s`,
                animationDuration: '0.6s',
              }}
            />
          ))}
        </div>
      )}

      {/* Script Box (Spoken-Style Transcript) */}
      <div className="mt-5 bg-black/20 rounded-2xl p-4 sm:p-5 backdrop-blur-sm border border-white/10">
        <p className="text-white text-base sm:text-lg leading-relaxed font-medium">
          {textToSpeak || (isLoading ? t('common.loading') : t('schedule.voiceNoSchedule'))}
        </p>
      </div>
    </div>
  );
}
