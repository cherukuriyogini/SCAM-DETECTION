"use client";

import { ClinicalSummary } from "@/types/clinical";
import { generatePrescriptionPDF } from "@/lib/pdfGenerator";
import { Download, Eye, ChevronRight } from "lucide-react";
import Link from "next/link";

interface RecentConsultationsTableProps {
  consultations: ClinicalSummary[];
  onSelect: (consultation: ClinicalSummary) => void;
}

export default function RecentConsultationsTable({
  consultations,
  onSelect,
}: RecentConsultationsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved & Prescribed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Doctor Reviewed":
        return "bg-teal-50 text-teal-800 border-teal-200";
      case "AI Draft":
      default:
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  const handleDownloadPDF = (e: React.MouseEvent, c: ClinicalSummary) => {
    e.stopPropagation();
    try {
      const doc = generatePrescriptionPDF(c);
      const safeName = c.patient.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      doc.save(`Prescription-${safeName}-${c.consultation.date}.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Recent Consultations</h3>
          <p className="text-xs text-slate-500">
            Latest ambient recordings and physician-reviewed prescriptions
          </p>
        </div>
        <Link
          href="/history"
          className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
        >
          <span>View All ({consultations.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
          <thead className="bg-slate-50/80 font-semibold text-slate-700">
            <tr>
              <th scope="col" className="px-4 py-3">Patient</th>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Chief Complaint</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {consultations.map((c) => (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {c.patient.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {c.patient.age} yrs • {c.patient.gender}
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-slate-600">
                  {c.consultation.date}
                </td>
                <td className="px-4 py-3.5 text-slate-700 font-medium max-w-xs truncate">
                  {c.chiefComplaint}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                      c.status
                    )}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(c);
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                    title="View Clinical Details"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDownloadPDF(e, c)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium"
                    title="Download PDF"
                  >
                    <Download className="w-3 h-3" />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
