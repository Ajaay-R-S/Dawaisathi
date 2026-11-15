export type Language = 'hi' | 'ta' | 'te' | 'en';

export type Slot = 'morning' | 'afternoon' | 'night';

export interface Medicine {
  id: string;
  name: string;
  generic_name?: string;
  dose: string;
  frequency: string;
  timing: string; // 'Before food' | 'After food' | 'With food' | 'Bedtime'
  duration: string;
  confidence: number; // 0.0 - 1.0
  is_verified?: boolean;
  generic_alternative?: string;
  generic_savings_pct?: number;
  color_shape_hint?: string;
  notes?: string;
}

export interface PrescriptionExtractionResult {
  medicines: Medicine[];
  doctor_notes: string;
  raw_summary?: string;
  confidence_overall?: number;
}

export type RiskLevel = 'normal' | 'moderate' | 'high';

export interface HealthReading {
  id: string;
  patient_id?: string;
  type: 'sugar' | 'bp';
  value_numeric: number; // sugar (mg/dL) or systolic BP (mmHg)
  value_secondary?: number; // diastolic BP (mmHg)
  meal_context?: 'fasting' | 'post-meal' | 'random';
  source: 'manual' | 'voice' | 'camera_ocr';
  risk_level: RiskLevel;
  risk_message: string;
  action_plan?: string[];
  logged_at: string; // ISO date string
}

export interface ScheduleItem {
  id: string;
  medicine_id: string;
  medicine_name: string;
  dose: string;
  slot: Slot;
  timing: string;
  color_shape_hint: string;
  taken: boolean;
  taken_at?: string;
}

export interface PatientProfile {
  id: string;
  device_id: string;
  full_name: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  preferred_language: Language;
  streak_count: number;
}

export interface DrugInteractionRule {
  drugA: string;
  drugB: string;
  severity: 'High' | 'Medium' | 'Low';
  plainLanguage: {
    en: string;
    hi: string;
    ta: string;
    te: string;
  };
  medicalExplanation: string;
}

export interface GenericDrugInfo {
  brandName: string;
  genericSalt: string;
  indication: string;
  brandPricePerStrip: number; // in INR
  genericPricePerStrip: number; // Jan Aushadhi price
  savingsPercent: number;
  janAushadhiName: string;
}

export interface RiskEvaluationResult {
  risk_level: RiskLevel;
  risk_title: string;
  risk_message: string;
  action_steps: string[];
  should_notify_emergency: boolean;
  whatsapp_text?: string;
}
