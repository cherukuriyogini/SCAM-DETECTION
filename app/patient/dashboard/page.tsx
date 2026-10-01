"use client";

import { useEffect, useState } from "react";
import { ClinicalSummary } from "@/types/clinical";
import { fetchConsultationsFromDb, getStoredConsultations } from "@/lib/storage";
import { generatePrescriptionPDF } from "@/lib/pdfGenerator";
import {
  FileText,
  Download,
  Calendar,
  Pill,
  HeartPulse,
  User,
  ShieldCheck,
  Clock,
  Sparkles,
  Stethoscope,
} from "lucide-react";

export default function PatientDashboardPage() {
  const [consultations, setConsultations] = useState<ClinicalSummary[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<ClinicalSummary | null>(null);

  useEffect(() => {
    const local = getStoredConsultations();
    if (local.length > 0) {
      setConsultations(local);
      setSelectedConsultation(local[0]);
    }
    fetchConsultationsFromDb().then((list) => {
      if (list && list.length > 0) {
        setConsultations(list);
        setSelectedConsultation((prev) => prev || list[0]);
      }
    });
  }, []);

  const handleDownloadPDF = (c: ClinicalSummary) => {
    try {
      const doc = generatePrescriptionPDF(c);
      const safeName = c.patient.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      doc.save(`Prescription-${safeName}-${c.consultation.date}.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  const patientName = selectedConsultation?.patient.name || "Rahul Sharma";
  const patientMrn = selectedConsultation?.patient.mrn || "MRN-2026-0841";

  return (
    <div className="space-y-6 pb-12">
      {/* Patient Portal Welcome Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
              <User className="w-3.5 h-3.5" />
              <span>SmartScribe Patient Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome, {patientName}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/80">
              Access your official medical prescriptions, physician instructions, and care plans.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs space-y-1 shrink-0">
            <div className="flex items-center space-x-2 text-blue-300 font-mono text-[11px]">
              <span>ID: {patientMrn}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-white font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Health Record</span>
            </div>
          </div>
        </div>
      </div>

      {consultations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Prescriptions on File Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once your doctor conducts a consultation in SmartScribe, your official digital prescription and care instructions will appear right here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of Prescriptions */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>My Consultation Records ({consultations.length})</span>
            </h2>

            <div className="space-y-2.5">
              {consultations.map((c) => {
                const isSelected = selectedConsultation?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConsultation(c)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-500 shadow-sm ring-2 ring-blue-500/20"
                        : "bg-white hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {c.consultation.date}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {c.status}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-slate-600 line-clamp-1 font-medium">
                      {c.chiefComplaint}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-teal-600" />
                        {c.consultation.doctorName}
                      </span>
                      <span>{c.medications.length} medicines</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed View of Selected Prescription */}
          {selectedConsultation && (
            <div className="lg:col-span-2 space-y-5">
              {/* Prescription Card Header */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Official Medical Prescription
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedConsultation.consultation.doctorName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedConsultation.consultation.clinicName} • {selectedConsultation.consultation.specialization}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadPDF(selectedConsultation)}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Prescription PDF</span>
                  </button>
                </div>

                {/* Diagnosis / Chief Complaint */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Chief Complaint
                    </span>
                    <p className="font-semibold text-slate-800">
                      {selectedConsultation.chiefComplaint}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Clinical Impression
                    </span>
                    <p className="font-semibold text-slate-800">
                      {selectedConsultation.diagnoses.map((d) => d.name).join(", ") || "General Assessment"}
                    </p>
                  </div>
                </div>

                {/* Prescribed Medications Table */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-blue-600" />
                    <span>Prescribed Medications & Dosages</span>
                  </h4>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                      <thead className="bg-slate-50 font-semibold text-slate-700">
                        <tr>
                          <th className="px-3.5 py-2.5">Medication</th>
                          <th className="px-3.5 py-2.5">Dosage</th>
                          <th className="px-3.5 py-2.5">Frequency</th>
                          <th className="px-3.5 py-2.5">Duration</th>
                          <th className="px-3.5 py-2.5">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {selectedConsultation.medications.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-3.5 py-3 font-bold text-slate-900">{m.name}</td>
                            <td className="px-3.5 py-3 text-slate-600">{m.dosage}</td>
                            <td className="px-3.5 py-3 text-slate-600 font-medium">{m.frequency}</td>
                            <td className="px-3.5 py-3 text-slate-600">{m.duration}</td>
                            <td className="px-3.5 py-3 text-blue-700 font-medium">{m.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Doctor's Care & Dietary Instructions */}
                {(selectedConsultation.dietaryAdvice.length > 0 || selectedConsultation.clinicalAdvice.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {selectedConsultation.dietaryAdvice.length > 0 && (
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                          Dietary Recommendations
                        </span>
                        <ul className="list-disc list-inside text-emerald-900 space-y-1 text-[11px]">
                          {selectedConsultation.dietaryAdvice.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedConsultation.clinicalAdvice.length > 0 && (
                      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                        <span className="font-bold text-blue-950 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          Lifestyle & Recovery Advice
                        </span>
                        <ul className="list-disc list-inside text-blue-900 space-y-1 text-[11px]">
                          {selectedConsultation.clinicalAdvice.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Follow-up Note */}
                {selectedConsultation.followUp && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-start space-x-2 text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Follow-Up Schedule: </span>
                      <span>{selectedConsultation.followUp}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
