"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClinicalSummary } from "@/types/clinical";
import {
  getStoredConsultations,
  setActiveConsultation,
  fetchConsultationsFromDb,
} from "@/lib/storage";
import { generatePrescriptionPDF } from "@/lib/pdfGenerator";
import {
  History,
  Search,
  PlusCircle,
  Eye,
  Download,
  FileCheck,
} from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<ClinicalSummary[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    setConsultations(getStoredConsultations());
    fetchConsultationsFromDb().then((list) => {
      if (list && list.length > 0) {
        setConsultations(list);
      }
    });
  }, []);

  const handleSelect = (c: ClinicalSummary, tab?: string) => {
    setActiveConsultation(c);
    if (tab) {
      router.push(`/consultation/${c.id}?tab=${tab}`);
    } else {
      router.push(`/consultation/${c.id}`);
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

  const filtered = consultations.filter((c) => {
    const matchesSearch =
      c.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      c.chiefComplaint.toLowerCase().includes(search.toLowerCase()) ||
      c.consultation.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Consultation History</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {filtered.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Access previous ambient clinical recordings, doctor notes, and issued prescriptions.
          </p>
        </div>

        <Link
          href="/consultation/new"
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Consultation</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, chief complaint, or ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["All", "Approved & Prescribed", "Doctor Reviewed", "AI Draft"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Patient Details</th>
                  <th scope="col" className="px-4 py-3.5">Date & Ref</th>
                  <th scope="col" className="px-4 py-3.5">Chief Complaint</th>
                  <th scope="col" className="px-4 py-3.5">Prescriptions</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {c.patient.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {c.patient.age} yrs • {c.patient.gender}
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono text-slate-600">
                      <div>{c.consultation.date}</div>
                      <div className="text-[10px] text-slate-400">{c.consultation.id}</div>
                    </td>

                    <td className="px-4 py-4 text-slate-700 font-medium max-w-xs truncate">
                      {c.chiefComplaint}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {c.medications.length} items
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate max-w-[150px]">
                        {c.medications.map((m) => m.name).join(", ")}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(c);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                        title="View consultation details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      {c.status === "Approved & Prescribed" ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(c, "prescription");
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200"
                          title="View Official Prescription"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Prescription</span>
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => handleDownloadPDF(e, c)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 font-semibold border border-slate-200"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No consultation records found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search
                ? "Try searching with a different term or clear the filter."
                : "Create a new ambient clinical recording to begin."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
