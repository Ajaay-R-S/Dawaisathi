'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Check, AlertCircle } from 'lucide-react';
import {
  startVoiceRecognition,
  parseSpokenVitals,
  isSpeechRecognitionSupported,
  ParsedVitalsFromSpeech,
} from '@/lib/speech';
import { useLanguage } from '@/context/LanguageContext';

interface VoiceInputButtonProps {
  onParsedVitals: (parsed: ParsedVitalsFromSpeech) => void;
  targetType?: 'sugar' | 'bp';
}

export default function VoiceInputButton({
  onParsedVitals,
  targetType,
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [detectedResult, setDetectedResult] = useState<ParsedVitalsFromSpeech | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  const { language, t } = useLanguage();

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  const handleStartListening = () => {
    setErrorMessage(null);
    setLiveTranscript('');
    setDetectedResult(null);
    setIsListening(true);

    const recognition = startVoiceRecognition(
      language,
      (transcript) => {
        setLiveTranscript(transcript);
        const parsed = parseSpokenVitals(transcript);
        if (parsed) {
          if (targetType) {
            parsed.type = targetType;
          }
          setDetectedResult(parsed);
          onParsedVitals(parsed);
        } else {
          setErrorMessage(t('errors.speechError'));
        }
      },
      (err) => {
        setIsListening(false);
        if (err !== 'no-speech') {
          setErrorMessage(t('errors.micPermission'));
        }
      },
      () => {
        setIsListening(false);
      }
    );

    if (!recognition) {
      setIsListening(false);
      setSupported(false);
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  if (!supported) {
    return (
      <div className="text-center p-3 bg-gray-50 rounded-2xl border text-xs text-gray-500 font-semibold">
        {t('vitals.voiceUnsupported')}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Big Central Mic Button */}
      <div className="relative">
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
            <span className="absolute -inset-2 rounded-full bg-red-300 animate-pulse opacity-60" />
          </>
        )}

        <button
          onClick={isListening ? handleStopListening : handleStartListening}
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-transform active:scale-95 ${
            isListening
              ? 'bg-red-600 ring-8 ring-red-200'
              : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 ring-8 ring-emerald-100'
          }`}
          aria-label={isListening ? t('schedule.voicePlayerStop') : t('vitals.modeVoice')}
        >
          {isListening ? (
            <>
              <MicOff className="w-10 h-10 mb-1 animate-bounce" />
              <span className="text-xs font-black uppercase tracking-wider">{t('schedule.voicePlayerStop')}</span>
            </>
          ) : (
            <>
              <Mic className="w-10 h-10 mb-1" />
              <span className="text-xs font-black uppercase tracking-wider">{t('vitals.modeVoice')}</span>
            </>
          )}
        </button>
      </div>

      {/* Voice Status and Spoken Transcript */}
      <p className="mt-3 text-base sm:text-lg font-bold text-gray-800 text-center">
        {isListening ? t('vitals.voiceListening') : t('vitals.voiceHint')}
      </p>

      {/* Spoken Text Display */}
      {liveTranscript && (
        <div className="mt-3 w-full max-w-md bg-white rounded-xl p-3 border-2 border-emerald-300 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-semibold uppercase">{t('vitals.heardText')}</p>
          <p className="text-lg font-bold text-emerald-950 mt-0.5">&ldquo;{liveTranscript}&rdquo;</p>
        </div>
      )}

      {/* Parsed Result Badge */}
      {detectedResult && (
        <div className="mt-2 flex items-center gap-2 bg-emerald-100 text-emerald-900 px-4 py-2 rounded-full text-sm font-black border border-emerald-400">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>
            {t('vitals.recognizedResult', {
              type: detectedResult.type.toUpperCase(),
              val:
                detectedResult.type === 'bp'
                  ? `${detectedResult.value_numeric}/${detectedResult.value_secondary || 80} ${t('vitals.bpUnit')}`
                  : `${detectedResult.value_numeric} ${t('vitals.sugarUnit')}`,
            })}
          </span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200 max-w-sm text-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
