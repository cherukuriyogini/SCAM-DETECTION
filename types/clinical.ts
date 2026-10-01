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
  severity: "Mild" | "Moderate" | "Severe";
  status: "Active" | "Resolving" | "Resolved";
  sourceSentence: string;
}

export interface DiagnosisItem {
  id: string;
  name: string;
  certainty: "mentioned" | "suspected" | "confirmed";
  icd10?: string;
  sourceSentence: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
  sourceSentence: string;
}

export interface EvidenceItem {
  entityName: string;
  entityType: "Symptom" | "Medication" | "Diagnosis" | "Advice" | "Chief Complaint";
  extractedValue: string;
  sourceSentence: string;
}

export interface ClinicalSummary {
  id: string;
  patient: PatientInfo;
  consultation: ConsultationMeta;
  chiefComplaint: string;
  chiefComplaintSource?: string;
  symptoms: SymptomItem[];
  diagnoses: DiagnosisItem[];
  medications: MedicationItem[];
  dietaryAdvice: string[];
  clinicalAdvice: string[];
  followUp: string;
  warnings: string[];
  summaryText: string;
  transcript: string;
  audioFileName?: string;
  audioDuration?: string;
  status: "AI Draft" | "Doctor Reviewed" | "Approved & Prescribed";
  mode: "demo" | "ai";
  processedAt: string;
  reviewNotes?: string;
  doctorSignatureName?: string;
  approvedAt?: string;
}
