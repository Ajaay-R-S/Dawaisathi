'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import enLocale from '../../locales/en.json';
import hiLocale from '../../locales/hi.json';
import taLocale from '../../locales/ta.json';
import teLocale from '../../locales/te.json';

export type Language = 'en' | 'hi' | 'ta' | 'te';

export const SUPPORTED_LANGUAGES: { code: Language; name: string; nativeName: string; bcp47: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', bcp47: 'hi-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN' },
];

const LOCALES: Record<Language, any> = {
  en: enLocale,
  hi: hiLocale,
  ta: taLocale,
  te: teLocale,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  formatNumber: (num: number) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'dawaisaathi_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English as specified in requirement 2
  const [language, setLanguageState] = useState<Language>('en');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'ta' || saved === 'te')) {
        setLanguageState(saved);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = saved;
        }
      } else {
        // default to english
        localStorage.setItem(STORAGE_KEY, 'en');
        if (typeof document !== 'undefined') {
          document.documentElement.lang = 'en';
        }
      }
    } catch (e) {
      // localStorage not accessible
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  }, []);

  // Translation function with English fallback and variable interpolation
  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split('.');
      const currentDict = LOCALES[language] || LOCALES.en;

      // Try current language
      let value: any = currentDict;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }

      // Fallback to English if missing or not string
      if (typeof value !== 'string') {
        if (process.env.NODE_ENV === 'development' && language !== 'en') {
          console.warn(`[i18n] Missing key "${path}" in locale "${language}". Falling back to English.`);
        }
        let fallbackVal: any = LOCALES.en;
        for (const k of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && k in fallbackVal) {
            fallbackVal = fallbackVal[k];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        value = typeof fallbackVal === 'string' ? fallbackVal : path;
      }

      // Variable interpolation like {count}, {name}, {percent}
      if (params && typeof value === 'string') {
        for (const [paramKey, paramVal] of Object.entries(params)) {
          value = value.replaceAll(`{${paramKey}}`, String(paramVal));
        }
      }

      return value;
    },
    [language]
  );

  const formatNumber = useCallback(
    (num: number): string => {
      try {
        const localeTag = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : 'en-IN';
        return new Intl.NumberFormat(localeTag).format(num);
      } catch {
        return num.toString();
      }
    },
    [language]
  );

  const formatDate = useCallback(
    (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = typeof date === 'string' ? new Date(date) : date;
        const localeTag = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : 'en-IN';
        return new Intl.DateTimeFormat(
          localeTag,
          options || { month: 'short', day: 'numeric', year: 'numeric' }
        ).format(d);
      } catch {
        return String(date);
      }
    },
    [language]
  );

  const formatTime = useCallback(
    (date: Date | string): string => {
      try {
        const d = typeof date === 'string' ? new Date(date) : date;
        const localeTag = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : 'en-IN';
        return new Intl.DateTimeFormat(localeTag, {
          hour: '2-digit',
          minute: '2-digit',
        }).format(d);
      } catch {
        return String(date);
      }
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatNumber,
        formatDate,
        formatTime,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
