'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '@/lib/speech';
import { Language } from '@/types';
import { TRANSLATIONS } from '@/data/translations';

interface SpeechPlayerProps {
  textToSpeak: string;
  language: Language;
  onRefreshScript?: () => void;
  isLoading?: boolean;
}

export default function SpeechPlayer({
  textToSpeak,
  language,
  onRefreshScript,
  isLoading = false,
}: SpeechPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

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
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-sm">
        Voice playback is not supported by your current browser. You can still read the text instructions below.
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
              {t.voicePlayer.playTitle}
            </h3>
          </div>
          <p className="text-emerald-100 text-sm sm:text-base">
            {isPlaying ? t.voicePlayer.playing : t.voicePlayer.listenInstructions}
          </p>
        </div>

        {/* Big Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {onRefreshScript && (
            <button
              onClick={onRefreshScript}
              disabled={isLoading || isPlaying}
              className="p-3.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl transition disabled:opacity-50"
              title="Regenerate Voice Guide with AI"
              aria-label="Refresh Script"
            >
              <Sparkles className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={handleReplay}
            disabled={!textToSpeak || isLoading}
            className="p-3.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl transition disabled:opacity-50"
            title="Replay from start"
            aria-label="Replay Audio"
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
            aria-label={isPlaying ? 'Pause Audio' : 'Play Audio'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-7 h-7 fill-current" />
                <span>{t.voicePlayer.stop}</span>
              </>
            ) : (
              <>
                <Play className="w-7 h-7 fill-current ml-0.5" />
                <span>सुनें (Play)</span>
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
          {textToSpeak || (isLoading ? 'AI is drafting spoken schedule...' : 'No prescription schedule loaded yet.')}
        </p>
      </div>
    </div>
  );
}
