"use client";

import { useState } from "react";
import { ClinicalSummary, SymptomItem, MedicationItem } from "@/types/clinical";
import {
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle,
  FileCheck,
  User,
  Activity,
  Pill,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface DoctorReviewFormProps {
  summary: ClinicalSummary;
  onSave: (updated: ClinicalSummary) => void;
  onApprove: (updated: ClinicalSummary) => void;
  onCancel?: () => void;
}

export default function DoctorReviewForm({
  summary,
  onSave,
  onApprove,
  onCancel,
}: DoctorReviewFormProps) {
  // Form State initialized directly from extracted summary
  const [patientName, setPatientName] = useState(summary.patient.name);
  const [patientAge, setPatientAge] = useState(summary.patient.age);
  const [patientGender, setPatientGender] = useState(summary.patient.gender);
  const [chiefComplaint, setChiefComplaint] = useState(summary.chiefComplaint);
  const [diagnosisName, setDiagnosisName] = useState(
    summary.diagnoses[0]?.name || "Clinical Impression"
  );
  const [diagnosisCertainty, setDiagnosisCertainty] = useState<string>(
    summary.diagnoses[0]?.certainty || "mentioned"
  );
  const [symptoms, setSymptoms] = useState<SymptomItem[]>(summary.symptoms);
  const [medications, setMedications] = useState<MedicationItem[]>(summary.medications);
  const [dietaryAdvice, setDietaryAdvice] = useState<string[]>(summary.dietaryAdvice);
  const [clinicalAdvice, setClinicalAdvice] = useState<string[]>(summary.clinicalAdvice);
  const [followUp, setFollowUp] = useState(summary.followUp);
  const [doctorNotes, setDoctorNotes] = useState(summary.reviewNotes || "");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Symptoms handlers
  const handleAddSymptom = () => {
    const newSym: SymptomItem = {
      id: `sym-${Date.now()}`,
      name: "New Symptom",
      duration: "1 day",
      severity: "Moderate",
      status: "Active",
      evidence: "Added manually by physician during clinical review.",
    };
    setSymptoms([...symptoms, newSym]);
  };

  const handleUpdateSymptom = (id: string, field: keyof SymptomItem, value: string) => {
    setSymptoms(
      symptoms.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleDeleteSymptom = (id: string) => {
    setSymptoms(symptoms.filter((s) => s.id !== id));
  };

  // Medication handlers
  const handleAddMedication = () => {
    const newMed: MedicationItem = {
      id: `med-${Date.now()}`,
      name: "New Medicine",
      dosage: "500 mg",
      frequency: "BD (Twice daily)",
      duration: "5 days",
      route: "Oral",
      instructions: "After meals",
      evidence: "Added manually by physician during clinical review.",
    };
    setMedications([...medications, newMed]);
  };

  const handleUpdateMedication = (id: string, field: keyof MedicationItem, value: string) => {
    setMedications(
      medications.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  // Advice handlers
  const handleAddAdvice = (type: "diet" | "clinical") => {
    if (type === "diet") {
      setDietaryAdvice([...dietaryAdvice, "New dietary instruction"]);
    } else {
      setClinicalAdvice([...clinicalAdvice, "New lifestyle or activity instruction"]);
    }
  };

  const handleUpdateAdvice = (type: "diet" | "clinical", index: number, value: string) => {
    if (type === "diet") {
      const arr = [...dietaryAdvice];
      arr[index] = value;
      setDietaryAdvice(arr);
    } else {
      const arr = [...clinicalAdvice];
      arr[index] = value;
      setClinicalAdvice(arr);
    }
  };

  const handleDeleteAdvice = (type: "diet" | "clinical", index: number) => {
    if (type === "diet") {
      setDietaryAdvice(dietaryAdvice.filter((_, i) => i !== index));
    } else {
      setClinicalAdvice(clinicalAdvice.filter((_, i) => i !== index));
    }
  };

  const buildUpdatedSummary = (newStatus: "Doctor Reviewed" | "Approved & Prescribed"): ClinicalSummary => {
    return {
      ...summary,
      patient: {
        ...summary.patient,
        name: patientName,
        age: patientAge,
        gender: patientGender,
      },
      chiefComplaint,
      diagnoses: [
        {
          id: summary.diagnoses[0]?.id || "diag-1",
          name: diagnosisName,
          certainty: diagnosisCertainty,
          evidence: summary.diagnoses[0]?.evidence || "Confirmed by physician.",
          sourceSentence: summary.diagnoses[0]?.sourceSentence || "Confirmed by physician.",
        },
      ],
      symptoms,
      medications,
      dietaryAdvice,
      clinicalAdvice,
      followUp,
      reviewNotes: doctorNotes,
      status: newStatus,
      doctorSignatureName:
        newStatus === "Approved & Prescribed"
          ? summary.consultation.doctorName || "Dr. Sarah Jenkins, MD"
          : undefined,
      approvedAt: newStatus === "Approved & Prescribed" ? new Date().toLocaleString() : undefined,
    };
  };

  const handleSaveOnly = () => {
    const updated = buildUpdatedSummary("Doctor Reviewed");
    onSave(updated);
  };

  const handleConfirmApproval = () => {
    const updated = buildUpdatedSummary("Approved & Prescribed");
    setShowConfirmModal(false);
    onApprove(updated);
  };

  return (
    <div className="space-y-6">
      {/* Visual Status Progress */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Clinical Workflow</span>
            <h2 className="text-lg font-bold text-slate-900">Doctor Review & Edit Studio</h2>
          </div>

          {/* Stepper */}
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>AI Extracted</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 ring-2 ring-teal-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Doctor Review (Active)</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-400">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Prescription Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Doctor Control Banner */}
      <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex items-start space-x-3 text-xs text-teal-900">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-teal-950">You have full clinical oversight.</p>
          <p className="text-teal-800 mt-0.5">
            Modify any extracted symptom, diagnosis, medicine, dosage, or advice below. Every change immediately reflects on the final issued prescription.
          </p>
        </div>
      </div>

      {/* Section 1: Patient Information */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
          <User className="w-4 h-4 text-teal-600" />
          <span>Patient Demographics</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Age</label>
            <input
              type="text"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gender</label>
            <select
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Unspecified">Unspecified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Chief Complaint & Diagnosis */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          <span>Chief Complaint & Clinical Impression</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Chief Complaint</label>
            <textarea
              rows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium leading-relaxed"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Diagnosis / Clinical Impression</label>
            <input
              type="text"
              value={diagnosisName}
              onChange={(e) => setDiagnosisName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium mb-3"
            />
            <label className="block font-semibold text-slate-700 mb-1">Physician Certainty / Qualification</label>
            <select
              value={diagnosisCertainty}
              onChange={(e) => setDiagnosisCertainty(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium bg-white"
            >
              <option value="mentioned">Mentioned by physician in consultation</option>
              <option value="suspected">Suspected / Provisional diagnosis</option>
              <option value="confirmed">Confirmed clinical diagnosis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Symptoms (Add / Edit / Delete) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Extracted Symptoms ({symptoms.length})</span>
          </div>
          <button
            type="button"
            onClick={handleAddSymptom}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Symptom</span>
          </button>
        </div>

        <div className="space-y-3">
          {symptoms.map((sym) => (
            <div
              key={sym.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 items-center text-xs"
            >
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={sym.name}
                  onChange={(e) => handleUpdateSymptom(sym.id, "name", e.target.value)}
                  placeholder="Symptom name"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-medium"
                />
              </div>
              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={sym.duration}
                  onChange={(e) => handleUpdateSymptom(sym.id, "duration", e.target.value)}
                  placeholder="Duration (e.g. 3 days)"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <select
                  value={sym.severity}
                  onChange={(e) => handleUpdateSymptom(sym.id, "severity", e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <select
                  value={sym.status || "Active"}
                  onChange={(e) => handleUpdateSymptom(sym.id, "status", e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Resolving">Resolving</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="sm:col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => handleDeleteSymptom(sym.id)}
                  title="Remove symptom"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Medications (Add / Edit / Delete) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Pill className="w-4 h-4 text-teal-600" />
            <span>Prescription Medications ({medications.length})</span>
          </div>
          <button
            type="button"
            onClick={handleAddMedication}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medication</span>
          </button>
        </div>

        <div className="space-y-3">
          {medications.map((med, idx) => (
            <div
              key={med.id}
              className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/80 text-xs space-y-2.5"
            >
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Medicine #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteMedication(med.id)}
                  className="flex items-center space-x-1 text-slate-400 hover:text-rose-600 text-[11px] font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Medicine Name</label>
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => handleUpdateMedication(med.id, "name", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-semibold text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Dosage</label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => handleUpdateMedication(med.id, "dosage", e.target.value)}
                    placeholder="e.g. 500 mg, 650 mg"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono font-medium"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Frequency</label>
                  <input
                    type="text"
                    value={med.frequency}
                    onChange={(e) => handleUpdateMedication(med.id, "frequency", e.target.value)}
                    placeholder="e.g. TDS / Three times daily"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Duration</label>
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => handleUpdateMedication(med.id, "duration", e.target.value)}
                    placeholder="e.g. 3 days"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Route</label>
                  <select
                    value={med.route}
                    onChange={(e) => handleUpdateMedication(med.id, "route", e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white"
                  >
                    <option value="Oral">Oral</option>
                    <option value="Inhalation">Inhalation</option>
                    <option value="Topical">Topical</option>
                    <option value="Nasal">Nasal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Special Instructions</label>
                <input
                  type="text"
                  value={med.instructions}
                  onChange={(e) => handleUpdateMedication(med.id, "instructions", e.target.value)}
                  placeholder="e.g. After meals with water"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-slate-700"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Advice & Follow-Up */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          <span>Dietary & Clinical Advice</span>
        </div>

        {/* Dietary Advice */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-semibold text-slate-700">
            <span>Dietary Instructions</span>
            <button
              type="button"
              onClick={() => handleAddAdvice("diet")}
              className="text-[11px] text-teal-700 font-bold hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Dietary Advice</span>
            </button>
          </div>
          {dietaryAdvice.map((adv, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <input
                type="text"
                value={adv}
                onChange={(e) => handleUpdateAdvice("diet", idx, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded border border-slate-200 font-medium"
              />
              <button
                type="button"
                onClick={() => handleDeleteAdvice("diet", idx)}
                className="text-slate-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Clinical Advice */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between font-semibold text-slate-700">
            <span>Clinical & Lifestyle Advice</span>
            <button
              type="button"
              onClick={() => handleAddAdvice("clinical")}
              className="text-[11px] text-teal-700 font-bold hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Clinical Advice</span>
            </button>
          </div>
          {clinicalAdvice.map((adv, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <input
                type="text"
                value={adv}
                onChange={(e) => handleUpdateAdvice("clinical", idx, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded border border-slate-200 font-medium"
              />
              <button
                type="button"
                onClick={() => handleDeleteAdvice("clinical", idx)}
                className="text-slate-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Follow-up */}
        <div className="pt-2">
          <label className="block font-semibold text-slate-700 mb-1">Follow-Up Instructions</label>
          <input
            type="text"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
          />
        </div>

        {/* Doctor Personal Notes */}
        <div className="pt-2">
          <label className="block font-semibold text-slate-700 mb-1">Doctor Private Clinical Notes (Optional)</label>
          <textarea
            rows={2}
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            placeholder="Additional notes for medical record or follow up reference..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur p-4 rounded-xl border border-slate-200 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Doctor changes are strictly preserved and applied directly to the prescription.</span>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveOnly}
            className="px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
          >
            Save Draft Changes
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-lg shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01]"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve & Generate Prescription</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Physician Verification Confirmation</h3>
                <p className="text-xs text-slate-500">Official medical prescription issuance</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 space-y-1.5 border border-slate-200">
              <p className="font-semibold text-slate-900">Please verify before signing:</p>
              <p>• Patient: <strong>{patientName}</strong> ({patientAge} yrs, {patientGender})</p>
              <p>• Prescribed Medications: <strong>{medications.length} items</strong> ({medications.map(m => `${m.name} ${m.dosage}`).join(", ")})</p>
              <p>• Clinical Diagnosis: <strong>{diagnosisName}</strong></p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              By confirming, you authorize and sign the clinical summary and generate the official medical prescription PDF with all your edits applied.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Go Back & Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
              >
                Yes, Sign & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
