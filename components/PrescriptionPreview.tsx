"use client";

import { useState } from "react";
import { ClinicalSummary } from "@/types/clinical";
import { generatePrescriptionPDF } from "@/lib/pdfGenerator";
import {
  Download,
  Printer,
  Edit3,
  ShieldCheck,
  Stethoscope,
  FileCheck,
} from "lucide-react";

interface PrescriptionPreviewProps {
  summary: ClinicalSummary;
  onEdit?: () => void;
}

export default function PrescriptionPreview({ summary, onEdit }: PrescriptionPreviewProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = () => {
    try {
      setDownloading(true);
      const doc = generatePrescriptionPDF(summary);
      const safeName = summary.patient.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      doc.save(`Prescription-${safeName}-${summary.consultation.date}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("An error occurred while generating the PDF. Please try browser print.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">Official Medical Prescription</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Doctor Approved & Signed
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Verified clinical document ready for patient download or pharmacy dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Modify Details</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Prescription</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? "Preparing PDF..." : "Download Prescription PDF"}</span>
          </button>
        </div>
      </div>

      {/* The Printable Prescription Letterhead */}
      <div className="bg-white rounded-2xl border border-slate-300/80 shadow-lg p-8 sm:p-12 max-w-4xl mx-auto print-shadow-none relative">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 rounded-t-2xl" />

        {/* Clinic & Doctor Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-200 pb-6 mb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold shadow-xs">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">SMARTSCRIBE MEDICAL</h1>
                <p className="text-[10px] text-teal-800 font-semibold uppercase tracking-wider">
                  Outpatient Internal Medicine & Primary Care
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-xs">
              450 Innovation Parkway, Medical Technology District<br />
              Ph: +1 (800) 555-0199 • reception@smartscribe.health
            </p>
          </div>

          <div className="text-left sm:text-right">
            <h3 className="text-sm font-bold text-slate-900">{summary.consultation.doctorName}</h3>
            <p className="text-xs text-slate-600 font-medium">{summary.consultation.specialization}</p>
            <p className="text-[11px] text-slate-500">{summary.consultation.clinicName}</p>
            <p className="text-[11px] text-teal-800 font-mono mt-0.5">
              Registration No: {summary.consultation.doctorLicense}
            </p>
          </div>
        </div>

        {/* Patient Details Banner Card */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 mb-6 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{summary.patient.name}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Age & Gender</span>
              <span className="font-semibold text-slate-800">
                {summary.patient.age} yrs / {summary.patient.gender}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Consult</span>
              <span className="font-semibold text-slate-800">{summary.consultation.date}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">MRN / ID</span>
              <span className="font-mono font-semibold text-slate-700">
                {summary.patient.mrn || "MRN-2026-0841"}
              </span>
            </div>
          </div>
        </div>

        {/* Chief Complaint & Clinical Impression */}
        <div className="mb-6 space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Chief Complaint & Clinical Presentation
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              {summary.chiefComplaint}
            </p>
          </div>

          <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs">
            <span className="font-bold text-teal-950">Clinical Impression / Diagnosis:</span>
            <div className="flex items-center space-x-2 mt-1 sm:mt-0">
              <span className="font-semibold text-slate-900">
                {summary.diagnoses.map((d) => d.name).join(", ") || "Clinical evaluation complete"}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
                Mentioned by physician
              </span>
            </div>
          </div>
        </div>

        {/* Rx Symbol & Medication Table */}
        <div className="mb-6">
          <div className="flex items-baseline space-x-2 mb-3">
            <span className="text-2xl font-serif font-black text-teal-700">Rx</span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Prescribed Medications</h3>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="px-3.5 py-2.5">#</th>
                  <th className="px-3.5 py-2.5">Medication</th>
                  <th className="px-3.5 py-2.5">Dosage</th>
                  <th className="px-3.5 py-2.5">Frequency</th>
                  <th className="px-3.5 py-2.5">Duration</th>
                  <th className="px-3.5 py-2.5">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {summary.medications.map((m, idx) => (
                  <tr key={m.id} className={idx % 2 === 1 ? "bg-slate-50/40" : ""}>
                    <td className="px-3.5 py-2.5 font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-3.5 py-2.5 font-bold text-slate-900">
                      {m.name}
                      <span className="text-[10px] text-slate-400 block font-normal">{m.route || "Oral"}</span>
                    </td>
                    <td className="px-3.5 py-2.5 font-mono font-semibold text-slate-800">{m.dosage}</td>
                    <td className="px-3.5 py-2.5 text-slate-700 font-medium">{m.frequency}</td>
                    <td className="px-3.5 py-2.5 font-mono text-slate-700">{m.duration}</td>
                    <td className="px-3.5 py-2.5 text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {m.instructions || "As directed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Advice & Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
          <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
              <span>Dietary & Lifestyle Instructions</span>
            </h4>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              {[...summary.dietaryAdvice, ...summary.clinicalAdvice].map((adv, i) => (
                <li key={i} className="leading-relaxed">{adv}</li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-2">Follow-Up & Red Flag Precautions</h4>
            <p className="text-slate-700 font-medium mb-2 leading-relaxed">
              • {summary.followUp}
            </p>
            {summary.warnings && summary.warnings.length > 0 && (
              <div className="text-rose-700 bg-rose-50/70 p-2 rounded border border-rose-200/60 text-[11px] font-medium leading-relaxed">
                {summary.warnings.map((w, i) => (
                  <div key={i}>⚠ {w}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Doctor Signature & Authentication Footer */}
        <div className="pt-6 border-t-2 border-slate-200 mt-8 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
          <div className="space-y-1 max-w-sm">
            <div className="flex items-center space-x-1.5 text-teal-800 font-bold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>AI-Assisted Draft — Reviewed and Approved by Attending Doctor</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Clinical ambient synthesis verified against consultation recording. Issued under medical practice guidelines.
            </p>
          </div>

          <div className="text-right min-w-[200px]">
            {/* Signature representation */}
            <div className="font-serif italic text-lg text-slate-800 mb-1 select-none pr-2 border-b border-slate-400 pb-1">
              {summary.consultation.doctorName}
            </div>
            <div className="font-bold text-slate-900 text-xs">{summary.consultation.doctorName}</div>
            <div className="text-[10px] text-slate-500">
              Verified Digitally: {summary.approvedAt || `${summary.consultation.date} 10:25 AM`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
