import { Language } from '@/types';

// Map app language code to BCP 47 speech tags
export const LANG_SPEECH_MAP: Record<Language, string> = {
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  en: 'en-IN',
};

/**
 * Checks if browser supports SpeechSynthesis
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Checks if browser supports SpeechRecognition (webkitSpeechRecognition)
 */
export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

/**
 * Speaks text using the browser's native Web Speech API
 */
export function speakText(
  text: string,
  lang: Language = 'hi',
  onEnd?: () => void,
  onError?: (err: any) => void
): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis not supported in this browser');
    onError?.('Speech synthesis not supported');
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG_SPEECH_MAP[lang] || 'en-IN';
  utterance.rate = 0.9; // Slightly slower, clear rate for elderly ears
  utterance.pitch = 1.0;

  // Attempt to select a native voice matching the language if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(lang) || v.lang === utterance.lang);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (e) => {
    console.error('Speech error', e);
    onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/**
 * Stops any active speech
 */
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Starts listening to speech input via Web Speech Recognition
 */
export function startVoiceRecognition(
  lang: Language = 'hi',
  onResult: (transcript: string) => void,
  onError?: (error: any) => void,
  onEnd?: () => void
): any {
  if (!isSpeechRecognitionSupported()) {
    onError?.('Speech recognition not supported in this browser. Please type reading.');
    return null;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = LANG_SPEECH_MAP[lang] || 'hi-IN';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    onError?.(event.error);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.start();
  return recognition;
}

export interface ParsedVitalsFromSpeech {
  type: 'sugar' | 'bp';
  value_numeric: number;
  value_secondary?: number;
  meal_context?: 'fasting' | 'post-meal' | 'random';
  confidence: number;
  rawText: string;
}

/**
 * Deterministically parses spoken utterances like:
 * "sugar 240", "fasting sugar 110", "BP 130 85", "blood pressure 140 over 90"
 */
export function parseSpokenVitals(rawText: string): ParsedVitalsFromSpeech | null {
  const text = rawText.toLowerCase().trim();

  // 1. Check for BP patterns: "BP 130 80", "130/80", "140 over 90", "120 by 80"
  const isBP = text.includes('bp') || text.includes('pressure') || text.includes('ब्लड प्रेशर') || text.includes('बीपी');
  const bpNumbers = text.match(/\b(\d{2,3})\s*(?:[/]|over|by|\s)\s*(\d{2,3})\b/);

  if (isBP || bpNumbers) {
    if (bpNumbers) {
      const sys = parseInt(bpNumbers[1], 10);
      const dia = parseInt(bpNumbers[2], 10);
      if (sys >= 60 && sys <= 260 && dia >= 40 && dia <= 160) {
        return {
          type: 'bp',
          value_numeric: sys,
          value_secondary: dia,
          confidence: 0.95,
          rawText,
        };
      }
    }
  }

  // 2. Check for Sugar patterns: "sugar 240", "145 fasting", "shugar 180"
  const isSugar =
    text.includes('sugar') ||
    text.includes('shugar') ||
    text.includes('शुगर') ||
    text.includes('glucose') ||
    text.includes('डायबिटीज');

  let meal_context: 'fasting' | 'post-meal' | 'random' = 'random';
  if (text.includes('fasting') || text.includes('खाली पेट') || text.includes('morning')) {
    meal_context = 'fasting';
  } else if (text.includes('post') || text.includes('after') || text.includes('खाने के बाद') || text.includes('lunch')) {
    meal_context = 'post-meal';
  }

  // Find 2 or 3 digit numbers in speech
  const sugarNumbers = text.match(/\b(\d{2,3})\b/g);
  if (sugarNumbers && sugarNumbers.length > 0) {
    const candidate = parseInt(sugarNumbers[0], 10);
    // Reasonable physiological sugar range
    if (candidate >= 40 && candidate <= 600) {
      return {
        type: 'sugar',
        value_numeric: candidate,
        meal_context,
        confidence: isSugar ? 0.95 : 0.8,
        rawText,
      };
    }
  }

  return null;
}
