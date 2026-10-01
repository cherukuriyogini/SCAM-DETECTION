export interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  contact?: string;
  mrn?: string;
}

export interface ConsultationMeta {
  id: string;
  date: string;
  time?: string;
  doctorName: string;
  specialization: string;
  clinicName: string;
  doctorLicense: string;
}

export interface SymptomItem {
  id: string;
  name: string;
  duration: string;
  severity: string;
  status?: string;
  evidence: string;
  sourceSentence?: string;
}

export interface DiagnosisItem {
  id: string;
  name: string;
  certainty: string;
  icd10?: string;
  evidence: string;
  sourceSentence?: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
  evidence: string;
  sourceSentence?: string;
}

export interface ClinicalSummary {
  id: string;
  patient: PatientInfo;
  consultation: ConsultationMeta;
  chiefComplaint: string;
  chiefComplaintEvidence?: string;
  symptoms: SymptomItem[];
  diagnoses: DiagnosisItem[];
  medications: MedicationItem[];
  dietaryAdvice: string[];
  clinicalAdvice: string[];
  followUp: string;
  warnings?: string[];
  summaryText: string;
  transcript: string;
  audioFileName?: string;
  audioDuration?: string;
  status: "AI Draft" | "Doctor Reviewed" | "Approved & Prescribed";
  mode: "ai" | "demo";
  processedAt: string;
  reviewNotes?: string;
  doctorSignatureName?: string;
  approvedAt?: string;
}
