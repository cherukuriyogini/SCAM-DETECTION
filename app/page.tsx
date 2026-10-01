"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RecentConsultationsTable from "@/components/RecentConsultationsTable";
import {
  getStoredConsultations,
  setActiveConsultation,
  fetchConsultationsFromDb,
} from "@/lib/storage";
import { ClinicalSummary } from "@/types/clinical";
import {
  Sparkles,
  UploadCloud,
  Users,
  FileText,
  Pill,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<ClinicalSummary[]>([]);

  useEffect(() => {
    setConsultations(getStoredConsultations());
    fetchConsultationsFromDb().then((list) => {
      if (list && list.length > 0) {
        setConsultations(list);
      }
    });
  }, []);

  const handleSelectConsultation = (c: ClinicalSummary) => {
    setActiveConsultation(c);
    router.push(`/consultation/${c.id}`);
  };

  const totalPrescriptions = consultations.filter(
    (c) => c.status === "Approved & Prescribed"
  ).length;

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-8 sm:p-12 shadow-xl border border-slate-700/50">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SmartScribe • Ambient Clinical Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Turn Real Doctor-Patient Conversations Into Structured Clinical Notes
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            Upload an actual consultation audio recording (MP3, WAV, M4A). SmartScribe transcribes the dialogue in real-time, extracts verified clinical entities with source evidence, and equips the physician with full review control before generating an official prescription PDF.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/consultation/new"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Real Consultation Audio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/history"
              className="flex items-center space-x-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Consultation Archive ({consultations.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Outpatient Telemetry Stats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Outpatient Clinical Performance
          </h2>
          <span className="text-xs text-slate-400">Live Session Telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Consultations
              </span>
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{consultations.length}</div>
            <p className="mt-1 text-xs text-slate-500">Real processed consultations</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Notes Generated
              </span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{consultations.length}</div>
            <p className="mt-1 text-xs text-slate-500">100% structured clinical schema</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Prescriptions Issued
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Pill className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalPrescriptions}</div>
            <p className="mt-1 text-xs text-slate-500">Doctor verified and authorized</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Speech Pipeline
              </span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">Active</div>
            <p className="mt-1 text-xs text-slate-500">Groq Whisper & LLaMA</p>
          </div>
        </div>
      </div>

      {/* Consultations Archive Table */}
      {consultations.length > 0 ? (
        <RecentConsultationsTable
          consultations={consultations}
          onSelect={handleSelectConsultation}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4">
          <UploadCloud className="w-12 h-12 text-teal-600 mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              No Consultations Recorded Yet
            </h3>
            <p className="text-xs text-slate-500">
              Ready for real audio. Upload an MP3 consultation recording to transcribe and extract clinical documentation.
            </p>
          </div>
          <Link
            href="/consultation/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Real Consultation Audio</span>
          </Link>
        </div>
      )}
    </div>
  );
}
