import { PrescriptionExtractionResult } from '@/types';

export const SAMPLE_PRESCRIPTIONS: { id: string; label: string; result: PrescriptionExtractionResult }[] = [
  {
    id: 'sample-diabetes-bp',
    label: 'Standard Diabetes & Hypertension (Elderly Patient)',
    result: {
      medicines: [
        {
          id: 'med-1',
          name: 'Glycomet GP 1',
          generic_name: 'Glimepiride 1mg + Metformin 500mg',
          dose: '1 tablet',
          frequency: '1-0-1',
          timing: 'Before food',
          duration: '30 days',
          confidence: 0.94,
          is_verified: true,
          color_shape_hint: 'White round tablet with score line',
          notes: 'Take 15 minutes before breakfast and dinner'
        },
        {
          id: 'med-2',
          name: 'Telma 40',
          generic_name: 'Telmisartan 40mg',
          dose: '1 tablet',
          frequency: '1-0-0',
          timing: 'After food',
          duration: '30 days',
          confidence: 0.92,
          is_verified: true,
          color_shape_hint: 'Yellow oblong tablet',
          notes: 'Take every morning after breakfast'
        },
        {
          id: 'med-3',
          name: 'Atorva 10',
          generic_name: 'Atorvastatin 10mg',
          dose: '1 tablet',
          frequency: '0-0-1',
          timing: 'Bedtime',
          duration: '30 days',
          confidence: 0.88,
          is_verified: true,
          color_shape_hint: 'Small white round tablet',
          notes: 'Take at bedtime for cholesterol control'
        },
        {
          id: 'med-4',
          name: 'Pan 40',
          generic_name: 'Pantoprazole 40mg',
          dose: '1 tablet',
          frequency: '1-0-0',
          timing: 'Before food',
          duration: '15 days',
          confidence: 0.95,
          is_verified: true,
          color_shape_hint: 'Yellow enteric coated tablet',
          notes: 'Take early morning on empty stomach with warm water'
        },
        {
          id: 'med-5',
          name: 'Ecosprin 75',
          generic_name: 'Aspirin 75mg',
          dose: '1 tablet',
          frequency: '0-1-0',
          timing: 'After food',
          duration: '30 days',
          confidence: 0.65, // < 0.7 to trigger the red verification alert requirement!
          is_verified: false,
          color_shape_hint: 'Tiny white tablet',
          notes: 'Unclear handwriting in prescription: Please verify if Ecosprin 75 or 150'
        }
      ],
      doctor_notes: 'Patient advised to walk 30 mins daily, restrict sodium/salt in food, maintain daily blood sugar log, and report immediately if systolic BP crosses 180.',
      raw_summary: '5 prescribed medicines for Type 2 Diabetes and Stage 2 Hypertension management.',
      confidence_overall: 0.87
    }
  },
  {
    id: 'sample-cardiac-risk',
    label: 'Cardiac Patient with Drug Interaction Warning',
    result: {
      medicines: [
        {
          id: 'med-c1',
          name: 'Warfarin 2.5mg',
          generic_name: 'Warfarin Sodium',
          dose: '1 tablet',
          frequency: '0-0-1',
          timing: 'Bedtime',
          duration: 'Ongoing',
          confidence: 0.96,
          is_verified: true,
          color_shape_hint: 'Lavender scored tablet',
          notes: 'Blood thinner - requires regular INR monitoring'
        },
        {
          id: 'med-c2',
          name: 'Aspirin 75mg',
          generic_name: 'Acetylsalicylic Acid',
          dose: '1 tablet',
          frequency: '0-1-0',
          timing: 'After food',
          duration: '15 days',
          confidence: 0.91,
          is_verified: true,
          color_shape_hint: 'White coated tablet',
          notes: 'Added for acute joint pain by local clinic'
        },
        {
          id: 'med-c3',
          name: 'Amlong 5',
          generic_name: 'Amlodipine 5mg',
          dose: '1 tablet',
          frequency: '1-0-0',
          timing: 'After food',
          duration: '30 days',
          confidence: 0.62, // < 0.7 flag!
          is_verified: false,
          color_shape_hint: 'White octagonal tablet',
          notes: 'Dosage unclear: verify if 5mg or 10mg'
        }
      ],
      doctor_notes: 'CRITICAL ALERT: Combination contains Warfarin + Aspirin which has high bleeding risk. Patient advised to confirm with cardiologist before starting.',
      raw_summary: 'Prescription with 3 cardiovascular medications.',
      confidence_overall: 0.83
    }
  }
];
