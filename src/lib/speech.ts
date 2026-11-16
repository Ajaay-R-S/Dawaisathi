import { Language } from '@/context/LanguageContext';

export const LANG_SPEECH_MAP: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
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
 * Speaks text using the browser's native Web Speech API with strict language matching
 */
export function speakText(
  text: string,
  lang: Language = 'en',
  onEnd?: () => void,
  onError?: (err: any) => void
): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisSupported()) {
    onError?.('Speech synthesis not supported');
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const targetTag = LANG_SPEECH_MAP[lang] || 'en-IN';
  utterance.lang = targetTag;
  utterance.rate = 0.9; // Clear rate for elderly ears
  utterance.pitch = 1.0;

  // Try to find matching voice for language
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => v.lang === targetTag || v.lang.toLowerCase().startsWith(lang)
  );
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
 * Starts listening to speech input via Web Speech Recognition in the chosen language
 */
export function startVoiceRecognition(
  lang: Language = 'en',
  onResult: (transcript: string) => void,
  onError?: (error: any) => void,
  onEnd?: () => void
): any {
  if (!isSpeechRecognitionSupported()) {
    onError?.('Speech recognition not supported');
    return null;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = LANG_SPEECH_MAP[lang] || 'en-IN';
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
 * Multi-lingual parser recognizing vitals spoken in English, Hindi, Tamil, or Telugu
 */
export function parseSpokenVitals(rawText: string): ParsedVitalsFromSpeech | null {
  const text = rawText.toLowerCase().trim();

  // 1. BP recognition across languages
  const bpKeywords = ['bp', 'pressure', 'blood pressure', 'बीपी', 'ब्लड प्रेशर', 'இரத்த அழுத்தம்', 'ரத்த அழுத்தம்', 'రక్తపోటు', 'బీపీ'];
  const isBP = bpKeywords.some((k) => text.includes(k));

  // Regex pattern for 2 numbers e.g. "130/80", "130 over 80", "140 by 90", "130 80"
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

  // 2. Sugar context across languages
  let meal_context: 'fasting' | 'post-meal' | 'random' = 'random';
  const fastingKeywords = ['fasting', 'खाली पेट', 'சாப்பிடுவதற்கு முன்', 'ఖాళీ కడుపుతో', 'morning'];
  const postMealKeywords = ['post', 'after', 'खाने के बाद', 'சாப்பிட்ட பின்', 'తిన్న తర్వాత', 'lunch', 'dinner'];

  if (fastingKeywords.some((k) => text.includes(k))) {
    meal_context = 'fasting';
  } else if (postMealKeywords.some((k) => text.includes(k))) {
    meal_context = 'post-meal';
  }

  const sugarKeywords = ['sugar', 'shugar', 'glucose', 'diabetes', 'शुगर', 'சர்க்கரை', 'షుగర్'];
  const isSugar = sugarKeywords.some((k) => text.includes(k));

  const numbers = text.match(/\b(\d{2,3})\b/g);
  if (numbers && numbers.length > 0) {
    const candidate = parseInt(numbers[0], 10);
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
