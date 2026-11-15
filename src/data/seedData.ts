import { HealthReading, PatientProfile, ScheduleItem } from '@/types';

export const INITIAL_PATIENT: PatientProfile = {
  id: 'patient-demo-001',
  device_id: 'device-demo-ram-prasad',
  full_name: 'Ram Prasad Sharma',
  phone: '+919811223344',
  emergency_contact_name: 'Arun Sharma (Son)',
  emergency_contact_phone: '+919876543210',
  preferred_language: 'hi',
  streak_count: 6
};

// Past 7 days dates helper
function getDayOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString();
}

export const INITIAL_READINGS: HealthReading[] = [
  // 7 days ago
  {
    id: 'rdg-sugar-7',
    type: 'sugar',
    value_numeric: 132,
    meal_context: 'fasting',
    source: 'manual',
    risk_level: 'normal',
    risk_message: 'Fasting blood sugar is in a safe manageable range (100-140 mg/dL).',
    action_plan: ['Continue morning walk and prescribed medicines.'],
    logged_at: getDayOffset(6)
  },
  {
    id: 'rdg-bp-7',
    type: 'bp',
    value_numeric: 130,
    value_secondary: 82,
    source: 'manual',
    risk_level: 'normal',
    risk_message: 'Blood pressure is well controlled.',
    action_plan: ['Keep low salt diet.'],
    logged_at: getDayOffset(6)
  },
  // 6 days ago
  {
    id: 'rdg-sugar-6',
    type: 'sugar',
    value_numeric: 145,
    meal_context: 'fasting',
    source: 'manual',
    risk_level: 'normal',
    risk_message: 'Fasting sugar is slightly elevated but acceptable.',
    action_plan: ['Limit sweets and high carbs at dinner.'],
    logged_at: getDayOffset(5)
  },
  {
    id: 'rdg-bp-6',
    type: 'bp',
    value_numeric: 135,
    value_secondary: 85,
    source: 'voice',
    risk_level: 'normal',
    risk_message: 'Blood pressure in pre-hypertension zone.',
    action_plan: ['Avoid fried foods.'],
    logged_at: getDayOffset(5)
  },
  // 5 days ago
  {
    id: 'rdg-sugar-5',
    type: 'sugar',
    value_numeric: 158,
    meal_context: 'post-meal',
    source: 'manual',
    risk_level: 'normal',
    risk_message: 'Post-meal sugar is well under 180 mg/dL target.',
    action_plan: ['Stay hydrated with warm water.'],
    logged_at: getDayOffset(4)
  },
  {
    id: 'rdg-bp-5',
    type: 'bp',
    value_numeric: 138,
    value_secondary: 86,
    source: 'camera_ocr',
    risk_level: 'normal',
    risk_message: 'BP stable.',
    action_plan: ['Take Telma 40 after breakfast.'],
    logged_at: getDayOffset(4)
  },
  // 4 days ago
  {
    id: 'rdg-sugar-4',
    type: 'sugar',
    value_numeric: 172,
    meal_context: 'post-meal',
    source: 'voice',
    risk_level: 'moderate',
    risk_message: 'Mild sugar rise noted.',
    action_plan: ['Avoid sweet tea and biscuits.'],
    logged_at: getDayOffset(3)
  },
  {
    id: 'rdg-bp-4',
    type: 'bp',
    value_numeric: 142,
    value_secondary: 88,
    source: 'manual',
    risk_level: 'moderate',
    risk_message: 'Stage 1 Hypertension reading.',
    action_plan: ['Rest for 10 minutes and re-check if feeling dizzy.'],
    logged_at: getDayOffset(3)
  },
  // 3 days ago (rising trend starts here)
  {
    id: 'rdg-sugar-3',
    type: 'sugar',
    value_numeric: 195,
    meal_context: 'post-meal',
    source: 'manual',
    risk_level: 'moderate',
    risk_message: 'Post-lunch sugar elevated.',
    action_plan: ['Drink plenty of water. Check before dinner.'],
    logged_at: getDayOffset(2)
  },
  {
    id: 'rdg-bp-3',
    type: 'bp',
    value_numeric: 150,
    value_secondary: 92,
    source: 'camera_ocr',
    risk_level: 'moderate',
    risk_message: 'Blood pressure rising. Avoid emotional stress.',
    action_plan: ['Deep breathing exercise for 10 minutes.'],
    logged_at: getDayOffset(2)
  },
  // 2 days ago
  {
    id: 'rdg-sugar-2',
    type: 'sugar',
    value_numeric: 220,
    meal_context: 'post-meal',
    source: 'voice',
    risk_level: 'moderate',
    risk_message: 'Sugar above 200 mg/dL (Rising trend: 3 readings in a row).',
    action_plan: ['Check urine ketones if feeling fatigued.'],
    logged_at: getDayOffset(1)
  },
  {
    id: 'rdg-bp-2',
    type: 'bp',
    value_numeric: 162,
    value_secondary: 98,
    source: 'manual',
    risk_level: 'moderate',
    risk_message: 'High BP recorded. Systolic above 160 mmHg.',
    action_plan: ['Do not miss morning dose.'],
    logged_at: getDayOffset(1)
  },
  // Today (High Risk spike demonstrating safety alert & WhatsApp link!)
  {
    id: 'rdg-sugar-1',
    type: 'sugar',
    value_numeric: 285,
    meal_context: 'random',
    source: 'voice',
    risk_level: 'high',
    risk_message: 'HIGH ALERT: Blood Sugar is 285 mg/dL. This is dangerously high and on a 3-day consecutive upward spike.',
    action_plan: [
      'Immediately inform Arun Sharma (+919876543210).',
      'Do not consume any sweets or fruits.',
      'Drink 2 glasses of plain warm water.',
      'Check for nausea, severe thirst, or confusion.'
    ],
    logged_at: new Date().toISOString()
  },
  {
    id: 'rdg-bp-1',
    type: 'bp',
    value_numeric: 178,
    value_secondary: 104,
    source: 'camera_ocr',
    risk_level: 'high',
    risk_message: 'HIGH BP WARNING: 178/104 mmHg. Approaching hypertensive urgency threshold (180/120 mmHg).',
    action_plan: [
      'Sit down quietly in an upright position for 10 minutes.',
      'Do not perform any physical work or exertion.',
      'Contact family or local doctor if headache or chest tightness occurs.'
    ],
    logged_at: new Date().toISOString()
  }
];

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sched-1',
    medicine_id: 'med-4',
    medicine_name: 'Pan 40 (Pantoprazole)',
    dose: '1 tablet',
    slot: 'morning',
    timing: 'Before breakfast (empty stomach)',
    color_shape_hint: 'Yellow enteric tablet',
    taken: true,
    taken_at: '07:30 AM'
  },
  {
    id: 'sched-2',
    medicine_id: 'med-1',
    medicine_name: 'Glycomet GP 1',
    dose: '1 tablet',
    slot: 'morning',
    timing: '15 mins before breakfast',
    color_shape_hint: 'White scored tablet',
    taken: true,
    taken_at: '08:15 AM'
  },
  {
    id: 'sched-3',
    medicine_id: 'med-2',
    medicine_name: 'Telma 40',
    dose: '1 tablet',
    slot: 'morning',
    timing: 'After breakfast',
    color_shape_hint: 'Yellow oblong tablet',
    taken: true,
    taken_at: '08:45 AM'
  },
  {
    id: 'sched-4',
    medicine_id: 'med-5',
    medicine_name: 'Ecosprin 75 (Aspirin)',
    dose: '1 tablet',
    slot: 'afternoon',
    timing: 'After lunch',
    color_shape_hint: 'Tiny round white tablet',
    taken: false
  },
  {
    id: 'sched-5',
    medicine_id: 'med-1',
    medicine_name: 'Glycomet GP 1',
    dose: '1 tablet',
    slot: 'night',
    timing: '15 mins before dinner',
    color_shape_hint: 'White scored tablet',
    taken: false
  },
  {
    id: 'sched-6',
    medicine_id: 'med-3',
    medicine_name: 'Atorva 10 (Atorvastatin)',
    dose: '1 tablet',
    slot: 'night',
    timing: 'At bedtime with warm water',
    color_shape_hint: 'Small white round tablet',
    taken: false
  }
];
