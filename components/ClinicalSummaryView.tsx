"use client";

import { ClinicalSummary } from "@/types/clinical";
import SymptomsTable from "@/components/SymptomsTable";
import MedicationTable from "@/components/MedicationTable";
import EvidencePanel from "@/components/EvidencePanel";
import {
  AlertTriangle,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  User,
  ArrowRight,
  FileText,
} from "lucide-react";

interface ClinicalSummaryViewProps {
  summary: ClinicalSummary;
  onEdit: () => void;
  onApprove: () => void;
  onViewPrescription?: () => void;
}

export default function ClinicalSummaryView({
  summary,
  onEdit,
  onApprove,
  onViewPrescription,
}: ClinicalSummaryViewProps) {
  const isApproved = summary.status === "Approved & Prescribed";

  return (
    <div className="space-y-6">
      {/* Top Header & Clinical Status Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Summary
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isApproved
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : summary.status === "Doctor Reviewed"
                  ? "bg-teal-50 text-teal-800 border-teal-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {summary.status === "AI Draft"
                ? "AI Generated — Doctor Review Required"
                : summary.status}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
              {summary.mode === "ai" ? "AI Extraction (GPT-4o)" : "Demo Mode"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Reference: {summary.consultation.id} • Processed: {summary.processedAt}
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Doctor Review & Edit</span>
          </button>

          {isApproved && onViewPrescription ? (
            <button
              type="button"
              onClick={onViewPrescription}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Prescription</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onApprove}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-lg shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve & Prescribe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mandatory Safety & AI Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-start space-x-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-amber-950 mr-1">Clinical Safety Disclaimer:</span>
          AI-generated information is intended exclusively to assist clinical documentation. The treating doctor must review and approve all information before clinical use. The system does not autonomously diagnose or treat patients.
        </div>
      </div>

      {/* Patient Demographics Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <User className="w-4 h-4 text-teal-600" />
            <span>Patient Information</span>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {summary.patient.mrn || "MRN-2026-N/A"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Patient Name</span>
            <span className="text-sm font-bold text-slate-900">{summary.patient.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Age</span>
            <span className="text-sm font-semibold text-slate-800">{summary.patient.age} years</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Gender</span>
            <span className="text-sm font-semibold text-slate-800">{summary.patient.gender}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Consultation Date</span>
            <span className="text-sm font-semibold text-slate-800">{summary.consultation.date}</span>
          </div>
        </div>
      </div>

      {/* Chief Complaint Highlight Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-1">
          Chief Complaint
        </span>
        <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          &ldquo;{summary.chiefComplaint}&rdquo;
        </p>
      </div>

      {/* Clinical Impression / Diagnosis Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Diagnosis / Clinical Impression
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            Mentioned by physician
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-base font-bold text-slate-900">
              {summary.diagnoses.map((d) => d.name).join(", ") || "Clinical evaluation pending"}
            </div>
            {summary.diagnoses[0]?.icd10 && (
              <span className="text-xs font-mono text-slate-500">
                ICD-10: {summary.diagnoses[0].icd10}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 italic">
            Qualified from doctor&apos;s verbal assessment
          </span>
        </div>
      </div>

      {/* Symptoms Table Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Identified Symptoms</h3>
          <span className="text-xs text-slate-500 font-medium">
            {summary.symptoms.length} symptom{summary.symptoms.length !== 1 ? "s" : ""} recorded
          </span>
        </div>
        <SymptomsTable symptoms={summary.symptoms} />
      </div>

      {/* Prescribed Medications Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-base font-serif font-black text-teal-700">Rx</span>
            <h3 className="text-sm font-bold text-slate-900">Medications & Dosage Regimen</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {summary.medications.length} medication{summary.medications.length !== 1 ? "s" : ""}
          </span>
        </div>
        <MedicationTable medications={summary.medications} />
      </div>

      {/* Dietary & Clinical Advice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dietary Advice */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Dietary Recommendations
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {summary.dietaryAdvice.map((adv, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Clinical Advice */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Clinical Instructions & Lifestyle
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {summary.clinicalAdvice.map((adv, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{adv}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Follow-up & Red Flags */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Follow-Up & Emergency Return Criteria
        </h3>
        <p className="text-xs text-slate-800 leading-relaxed font-medium">
          • {summary.followUp}
        </p>
        {summary.warnings && summary.warnings.length > 0 && (
          <div className="p-3 rounded-lg bg-rose-50/80 border border-rose-200/80 text-rose-800 text-xs font-medium space-y-1">
            {summary.warnings.map((w, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evidence & Traceability Feature ("Why was this extracted?") */}
      <EvidencePanel summary={summary} />

      {/* Footer Navigation Bar */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-600">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Doctor remains the final clinical authority before any prescription generation.</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs"
          >
            Review & Edit
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="px-5 py-2 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
          >
            Approve & Generate Prescription
          </button>
        </div>
      </div>
    </div>
  );
}
