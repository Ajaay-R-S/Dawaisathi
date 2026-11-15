import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthReading, PatientProfile, ScheduleItem, PrescriptionExtractionResult } from '@/types';
import { INITIAL_PATIENT, INITIAL_READINGS, INITIAL_SCHEDULE } from '@/data/seedData';
import { SAMPLE_PRESCRIPTIONS } from '@/data/samplePrescriptions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};

// Storage keys for local fallback
const STORAGE_KEYS = {
  PATIENT: 'dawaisaathi_patient',
  READINGS: 'dawaisaathi_readings',
  SCHEDULE: 'dawaisaathi_schedule',
  PRESCRIPTIONS: 'dawaisaathi_prescriptions',
  DEMO_MODE: 'dawaisaathi_demo_mode_active',
};

// Local storage helper
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage error', err);
  }
}

// ----------------- Data Access Operations -----------------

export async function getPatientProfile(): Promise<PatientProfile> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .limit(1)
        .single();
      if (!error && data) return data as PatientProfile;
    } catch (e) {
      console.warn('Supabase fetch failed, using local profile', e);
    }
  }
  return getLocalItem<PatientProfile>(STORAGE_KEYS.PATIENT, INITIAL_PATIENT);
}

export async function savePatientProfile(profile: Partial<PatientProfile>): Promise<PatientProfile> {
  const current = await getPatientProfile();
  const updated: PatientProfile = { ...current, ...profile };

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('patients').upsert(updated);
    } catch (e) {
      console.warn('Supabase upsert failed', e);
    }
  }
  setLocalItem(STORAGE_KEYS.PATIENT, updated);
  return updated;
}

export async function getHealthReadings(): Promise<HealthReading[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('health_readings')
        .select('*')
        .order('logged_at', { ascending: false });
      if (!error && data && data.length > 0) return data as HealthReading[];
    } catch (e) {
      console.warn('Supabase readings fetch failed, using local', e);
    }
  }
  return getLocalItem<HealthReading[]>(STORAGE_KEYS.READINGS, INITIAL_READINGS);
}

export async function saveHealthReading(reading: Omit<HealthReading, 'id'>): Promise<HealthReading> {
  const newReading: HealthReading = {
    ...reading,
    id: 'rdg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('health_readings').insert(newReading);
    } catch (e) {
      console.warn('Supabase save reading failed', e);
    }
  }

  const existing = await getHealthReadings();
  const updated = [newReading, ...existing];
  setLocalItem(STORAGE_KEYS.READINGS, updated);
  return newReading;
}

export async function getDailySchedule(): Promise<ScheduleItem[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('schedule_logs')
        .select('*, medicines(*)')
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          medicine_id: item.medicine_id,
          medicine_name: item.medicines?.name || 'Medicine',
          dose: item.medicines?.dose || '1 dose',
          slot: item.slot,
          timing: item.medicines?.timing || 'After food',
          color_shape_hint: item.medicines?.color_shape_hint || 'Tablet',
          taken: item.taken,
          taken_at: item.taken_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase schedule fetch failed', e);
    }
  }
  return getLocalItem<ScheduleItem[]>(STORAGE_KEYS.SCHEDULE, INITIAL_SCHEDULE);
}

export async function toggleScheduleItem(id: string, taken: boolean): Promise<ScheduleItem[]> {
  const list = await getDailySchedule();
  const updated = list.map((item) =>
    item.id === id
      ? {
          ...item,
          taken,
          taken_at: taken
            ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : undefined,
        }
      : item
  );

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('schedule_logs')
        .update({
          taken,
          taken_at: taken ? new Date().toISOString() : null,
        })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase schedule toggle failed', e);
    }
  }

  setLocalItem(STORAGE_KEYS.SCHEDULE, updated);

  // Check if all taken today, update streak
  const allDone = updated.every((i) => i.taken);
  if (allDone) {
    const profile = await getPatientProfile();
    await savePatientProfile({ streak_count: profile.streak_count + 1 });
  }

  return updated;
}

export async function saveExtractedPrescription(
  result: PrescriptionExtractionResult
): Promise<{ schedule: ScheduleItem[] }> {
  // Build schedule items from medicines
  const newSchedule: ScheduleItem[] = [];

  for (const med of result.medicines) {
    const freq = med.frequency || '1-0-1';
    const parts = freq.split('-').map((s) => s.trim());

    // Morning slot
    if (parts[0] && parts[0] !== '0') {
      newSchedule.push({
        id: `sched-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        medicine_id: med.id,
        medicine_name: med.name,
        dose: med.dose,
        slot: 'morning',
        timing: med.timing || 'After food',
        color_shape_hint: med.color_shape_hint || 'Tablet',
        taken: false,
      });
    }

    // Afternoon slot
    if (parts[1] && parts[1] !== '0') {
      newSchedule.push({
        id: `sched-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        medicine_id: med.id,
        medicine_name: med.name,
        dose: med.dose,
        slot: 'afternoon',
        timing: med.timing || 'After lunch',
        color_shape_hint: med.color_shape_hint || 'Tablet',
        taken: false,
      });
    }

    // Night slot
    if (parts[2] && parts[2] !== '0') {
      newSchedule.push({
        id: `sched-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        medicine_id: med.id,
        medicine_name: med.name,
        dose: med.dose,
        slot: 'night',
        timing: med.timing || 'After dinner',
        color_shape_hint: med.color_shape_hint || 'Tablet',
        taken: false,
      });
    }
  }

  // Save to local storage
  setLocalItem(STORAGE_KEYS.SCHEDULE, newSchedule);
  setLocalItem(STORAGE_KEYS.PRESCRIPTIONS, result);

  return { schedule: newSchedule };
}

export async function resetDemoState(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(INITIAL_PATIENT));
    localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(INITIAL_READINGS));
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(INITIAL_SCHEDULE));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(SAMPLE_PRESCRIPTIONS[0].result));
  }
}
