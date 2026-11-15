-- ==============================================================================
-- DawaiSaathi (Medicine Buddy) - Supabase Postgres Schema & Demo Seed Data
-- Track 2: Easy, Safe & Smart Healthcare (VibeX Codes Hackathon)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS schedule_logs CASCADE;
DROP TABLE IF EXISTS health_readings CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- 3. Patients Table (Anonymous Device-Based with optional profile)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Ram Prasad Sharma',
    phone TEXT DEFAULT '+919811223344',
    emergency_contact_name TEXT DEFAULT 'Arun Sharma (Son)',
    emergency_contact_phone TEXT DEFAULT '+919876543210',
    preferred_language TEXT NOT NULL DEFAULT 'hi' CHECK (preferred_language IN ('hi', 'ta', 'te', 'en')),
    streak_count INT DEFAULT 6,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Prescriptions Table
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_notes TEXT,
    raw_summary TEXT,
    confidence_overall NUMERIC(3, 2) DEFAULT 0.90,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Medicines Table
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    generic_name TEXT,
    dose TEXT NOT NULL DEFAULT '1 tablet',
    frequency TEXT NOT NULL DEFAULT '1-0-1',
    timing TEXT NOT NULL DEFAULT 'After food',
    duration TEXT DEFAULT '30 days',
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.95,
    is_verified BOOLEAN DEFAULT TRUE,
    generic_alternative TEXT,
    generic_savings_pct INT DEFAULT 0,
    color_shape_hint TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Schedule Logs (Daily Timetable & Adherence Streak)
CREATE TABLE schedule_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    slot TEXT NOT NULL CHECK (slot IN ('morning', 'afternoon', 'night')),
    taken BOOLEAN NOT NULL DEFAULT FALSE,
    taken_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Health Readings (Sugar & BP with Source and Risk Evaluation)
CREATE TABLE health_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sugar', 'bp')),
    value_numeric NUMERIC NOT NULL,
    value_secondary NUMERIC,
    meal_context TEXT CHECK (meal_context IN ('fasting', 'post-meal', 'random')),
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'voice', 'camera_ocr')),
    risk_level TEXT NOT NULL DEFAULT 'normal' CHECK (risk_level IN ('normal', 'moderate', 'high')),
    risk_message TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Indexes for Instant Retrieval
CREATE INDEX idx_patients_device ON patients(device_id);
CREATE INDEX idx_medicines_patient ON medicines(patient_id);
CREATE INDEX idx_schedule_patient_date ON schedule_logs(patient_id, scheduled_date);
CREATE INDEX idx_health_readings_patient_time ON health_readings(patient_id, logged_at DESC);

-- 9. Row Level Security (RLS) Setup
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_readings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access matching device_id or unrestricted for hackathon evaluation
CREATE POLICY "Public full access to patients" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to prescriptions" ON prescriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to medicines" ON medicines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to schedule_logs" ON schedule_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to health_readings" ON health_readings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 10. DEMO SEED DATA: Patient Ram Prasad Sharma (7-Day Vitals + Sample Rx)
-- ==============================================================================

DO $$
DECLARE
    v_patient_id UUID;
    v_prescription_id UUID;
    v_med1 UUID;
    v_med2 UUID;
    v_med3 UUID;
    v_med4 UUID;
    v_med5 UUID;
BEGIN
    -- Insert Demo Patient
    INSERT INTO patients (
        device_id,
        full_name,
        phone,
        emergency_contact_name,
        emergency_contact_phone,
        preferred_language,
        streak_count
    ) VALUES (
        'device-demo-ram-prasad',
        'Ram Prasad Sharma',
        '+919811223344',
        'Arun Sharma (Son)',
        '+919876543210',
        'hi',
        6
    ) RETURNING id INTO v_patient_id;

    -- Insert Sample Prescription
    INSERT INTO prescriptions (
        patient_id,
        doctor_notes,
        raw_summary,
        confidence_overall
    ) VALUES (
        v_patient_id,
        'Regular morning walk 30 mins. Restrict sodium/salt in food. Maintain daily blood sugar log. Report immediately if BP > 180.',
        'Prescription for Type 2 Diabetes and Hypertension management from Dr. K. K. Agarwal.',
        0.89
    ) RETURNING id INTO v_prescription_id;

    -- Insert Medicines
    INSERT INTO medicines (
        id, prescription_id, patient_id, name, generic_name, dose, frequency, timing, duration, confidence, is_verified, generic_alternative, generic_savings_pct, color_shape_hint, notes
    ) VALUES 
    (gen_random_uuid(), v_prescription_id, v_patient_id, 'Pan 40', 'Pantoprazole 40mg', '1 tablet', '1-0-0', 'Before breakfast (empty stomach)', '15 days', 0.95, true, 'Pantoprazole Gastro-resistant Tablets IP 40mg (Jan Aushadhi)', 90, 'Yellow enteric tablet', 'Take with warm water')
    RETURNING id INTO v_med1;

    INSERT INTO medicines (
        id, prescription_id, patient_id, name, generic_name, dose, frequency, timing, duration, confidence, is_verified, generic_alternative, generic_savings_pct, color_shape_hint, notes
    ) VALUES 
    (gen_random_uuid(), v_prescription_id, v_patient_id, 'Glycomet GP 1', 'Glimepiride 1mg + Metformin 500mg', '1 tablet', '1-0-1', '15 mins before meals', '30 days', 0.94, true, 'Glimepiride & Metformin Tablets (Jan Aushadhi)', 80, 'White scored tablet', 'Take before breakfast and dinner')
    RETURNING id INTO v_med2;

    INSERT INTO medicines (
        id, prescription_id, patient_id, name, generic_name, dose, frequency, timing, duration, confidence, is_verified, generic_alternative, generic_savings_pct, color_shape_hint, notes
    ) VALUES 
    (gen_random_uuid(), v_prescription_id, v_patient_id, 'Telma 40', 'Telmisartan 40mg', '1 tablet', '1-0-0', 'After breakfast', '30 days', 0.92, true, 'Telmisartan Tablets IP 40mg (Jan Aushadhi)', 86, 'Yellow oblong tablet', 'For BP control')
    RETURNING id INTO v_med3;

    INSERT INTO medicines (
        id, prescription_id, patient_id, name, generic_name, dose, frequency, timing, duration, confidence, is_verified, generic_alternative, generic_savings_pct, color_shape_hint, notes
    ) VALUES 
    (gen_random_uuid(), v_prescription_id, v_patient_id, 'Ecosprin 75', 'Aspirin 75mg', '1 tablet', '0-1-0', 'After lunch', '30 days', 0.65, false, 'Enteric Coated Aspirin Tablets IP 75mg', 59, 'Tiny white tablet', 'Confidence 0.65 - Needs verification')
    RETURNING id INTO v_med4;

    INSERT INTO medicines (
        id, prescription_id, patient_id, name, generic_name, dose, frequency, timing, duration, confidence, is_verified, generic_alternative, generic_savings_pct, color_shape_hint, notes
    ) VALUES 
    (gen_random_uuid(), v_prescription_id, v_patient_id, 'Atorva 10', 'Atorvastatin 10mg', '1 tablet', '0-0-1', 'At bedtime', '30 days', 0.88, true, 'Atorvastatin Tablets IP 10mg (Jan Aushadhi)', 87, 'Small white round tablet', 'For cholesterol management')
    RETURNING id INTO v_med5;

    -- Insert Today Schedule Logs
    INSERT INTO schedule_logs (patient_id, medicine_id, slot, taken, taken_at) VALUES
    (v_patient_id, v_med1, 'morning', true, NOW() - INTERVAL '4 hours'),
    (v_patient_id, v_med2, 'morning', true, NOW() - INTERVAL '3 hours'),
    (v_patient_id, v_med3, 'morning', true, NOW() - INTERVAL '2 hours'),
    (v_patient_id, v_med4, 'afternoon', false, NULL),
    (v_patient_id, v_med2, 'night', false, NULL),
    (v_patient_id, v_med5, 'night', false, NULL);

    -- Insert 7 Days of Health Readings (Sugar and BP)
    -- Day -6
    INSERT INTO health_readings (patient_id, type, value_numeric, meal_context, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'sugar', 132, 'fasting', 'manual', 'normal', 'Fasting sugar is within safe limits.', NOW() - INTERVAL '6 days');
    INSERT INTO health_readings (patient_id, type, value_numeric, value_secondary, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'bp', 130, 82, 'manual', 'normal', 'Blood pressure well managed.', NOW() - INTERVAL '6 days');

    -- Day -5
    INSERT INTO health_readings (patient_id, type, value_numeric, meal_context, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'sugar', 145, 'fasting', 'manual', 'normal', 'Slightly high but acceptable.', NOW() - INTERVAL '5 days');
    INSERT INTO health_readings (patient_id, type, value_numeric, value_secondary, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'bp', 135, 85, 'voice', 'normal', 'BP normal.', NOW() - INTERVAL '5 days');

    -- Day -4
    INSERT INTO health_readings (patient_id, type, value_numeric, meal_context, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'sugar', 158, 'post-meal', 'manual', 'normal', 'Post-lunch sugar normal.', NOW() - INTERVAL '4 days');
    INSERT INTO health_readings (patient_id, type, value_numeric, value_secondary, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'bp', 138, 86, 'camera_ocr', 'normal', 'BP stable.', NOW() - INTERVAL '4 days');

    -- Day -3 (rising trend)
    INSERT INTO health_readings (patient_id, type, value_numeric, meal_context, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'sugar', 172, 'post-meal', 'voice', 'moderate', 'Mild sugar rise.', NOW() - INTERVAL '3 days');
    INSERT INTO health_readings (patient_id, type, value_numeric, value_secondary, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'bp', 142, 88, 'manual', 'moderate', 'Stage 1 hypertension reading.', NOW() - INTERVAL '3 days');

    -- Day -2 (2nd rise)
    INSERT INTO health_readings (patient_id, type, value_numeric, meal_context, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'sugar', 195, 'post-meal', 'manual', 'moderate', 'Post meal sugar elevated.', NOW() - INTERVAL '2 days');
    INSERT INTO health_readings (patient_id, type, value_numeric, value_secondary, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'bp', 150, 92, 'camera_ocr', 'moderate', 'BP elevated. Deep breathing recommended.', NOW() - INTERVAL '2 days');

    -- Day -1 (3rd consecutive rise)
    INSERT INTO health_readings (patient_id, type, value_numeric, meal_context, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'sugar', 220, 'post-meal', 'voice', 'moderate', 'Sugar rising 3 days in a row.', NOW() - INTERVAL '1 day');
    INSERT INTO health_readings (patient_id, type, value_numeric, value_secondary, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'bp', 162, 98, 'manual', 'moderate', 'Systolic above 160 mmHg.', NOW() - INTERVAL '1 day');

    -- Today (High Risk spike triggering WhatsApp alert)
    INSERT INTO health_readings (patient_id, type, value_numeric, meal_context, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'sugar', 285, 'random', 'voice', 'high', 'HIGH ALERT: Blood Sugar is 285 mg/dL. Upward spike detected.', NOW());
    INSERT INTO health_readings (patient_id, type, value_numeric, value_secondary, source, risk_level, risk_message, logged_at)
    VALUES (v_patient_id, 'bp', 178, 104, 'camera_ocr', 'high', 'HIGH BP WARNING: 178/104 mmHg. Approaching urgency threshold.', NOW());

END $$;
