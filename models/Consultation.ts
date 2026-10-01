import mongoose, { Schema, Model } from "mongoose";
import { ClinicalSummary } from "@/types/clinical";

const SymptomSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    duration: { type: String, default: "" },
    severity: { type: String, default: "Moderate" },
    status: { type: String, default: "Active" },
    evidence: { type: String, default: "" },
    sourceSentence: { type: String, default: "" },
  },
  { _id: false }
);

const DiagnosisSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    certainty: { type: String, default: "mentioned" },
    icd10: { type: String, default: "" },
    evidence: { type: String, default: "" },
    sourceSentence: { type: String, default: "" },
  },
  { _id: false }
);

const MedicationSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    dosage: { type: String, default: "" },
    frequency: { type: String, default: "" },
    duration: { type: String, default: "" },
    route: { type: String, default: "Oral" },
    instructions: { type: String, default: "" },
    evidence: { type: String, default: "" },
    sourceSentence: { type: String, default: "" },
  },
  { _id: false }
);

const ConsultationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    patient: {
      name: { type: String, required: true },
      age: { type: String, default: "" },
      gender: { type: String, default: "" },
      contact: { type: String, default: "" },
      mrn: { type: String, default: "" },
    },
    consultation: {
      id: { type: String, default: "" },
      date: { type: String, required: true },
      time: { type: String, default: "" },
      doctorName: { type: String, required: true },
      specialization: { type: String, default: "" },
      clinicName: { type: String, default: "" },
      doctorLicense: { type: String, default: "" },
    },
    chiefComplaint: { type: String, default: "" },
    chiefComplaintEvidence: { type: String, default: "" },
    symptoms: { type: [SymptomSchema], default: [] },
    diagnoses: { type: [DiagnosisSchema], default: [] },
    medications: { type: [MedicationSchema], default: [] },
    dietaryAdvice: { type: [String], default: [] },
    clinicalAdvice: { type: [String], default: [] },
    followUp: { type: String, default: "" },
    warnings: { type: [String], default: [] },
    summaryText: { type: String, default: "" },
    transcript: { type: String, default: "" },
    audioFileName: { type: String, default: "" },
    audioDuration: { type: String, default: "" },
    status: {
      type: String,
      enum: ["AI Draft", "Doctor Reviewed", "Approved & Prescribed"],
      default: "AI Draft",
    },
    mode: { type: String, default: "ai" },
    processedAt: { type: String, default: "" },
    reviewNotes: { type: String, default: "" },
    doctorSignatureName: { type: String, default: "" },
    approvedAt: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model across Next.js hot reloads
const ConsultationModel: Model<ClinicalSummary> =
  mongoose.models.Consultation ||
  mongoose.model<ClinicalSummary>("Consultation", ConsultationSchema);

export default ConsultationModel;
