"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardStats from "@/components/DashboardStats";
import RecentConsultationsTable from "@/components/RecentConsultationsTable";
import { getStoredConsultations, setActiveConsultation } from "@/lib/storage";
import { ClinicalSummary } from "@/types/clinical";
import { SAMPLE_CASES } from "@/data/sampleConsultations";
import {
  Sparkles,
  PlusCircle,
  PlayCircle,
  Mic,
  Activity,
  ShieldCheck,
  FileCheck,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<ClinicalSummary[]>([]);

  useEffect(() => {
    setConsultations(getStoredConsultations());
  }, []);

  const handleSelectConsultation = (c: ClinicalSummary) => {
    setActiveConsultation(c);
    router.push(`/consultation/${c.id}`);
  };

  const handleLaunchDemoCase = (caseIndex: number) => {
    const selected = SAMPLE_CASES[caseIndex];
    // Set active consultation and navigate to new consultation with preloaded state
    sessionStorage.setItem("smartscribe_preload_case", selected.id);
    router.push("/consultation/new");
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hero / Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-8 sm:p-12 shadow-xl border border-slate-700/50">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SmartScribe • Ambient Clinical Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Turn Doctor-Patient Conversations Into Structured Clinical Notes
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            SmartScribe uses ambient AI to transform natural clinical conversations into structured summaries and editable prescriptions — keeping doctors focused on patients, not keyboards.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/consultation/new"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Consultation</span>
            </Link>

            <button
              onClick={() => handleLaunchDemoCase(0)}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all hover:scale-[1.01]"
            >
              <PlayCircle className="w-4 h-4 text-teal-400" />
              <span>Try Demo Consultation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Outpatient Clinical Performance
          </h2>
          <span className="text-xs text-slate-400">Live Telemetry</span>
        </div>
        <DashboardStats />
      </div>

      {/* Instant 1-Click Demo Journey Cases (Ideal for Hackathon Judges) */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Instant Hackathon Test Cases
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                1-Click Demo Flow
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Select any pre-configured clinical dialogue to test the complete ambient pipeline immediately.
            </p>
          </div>
          <span className="text-xs text-slate-400">Zero configuration needed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_CASES.map((sample, idx) => (
            <div
              key={sample.id}
              onClick={() => handleLaunchDemoCase(idx)}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                    {sample.tag}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">{sample.audioDuration}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                  {sample.patientName}
                </h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {sample.complaint}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-semibold text-teal-700">
                <span>Run Demo Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Consultations Table */}
      <RecentConsultationsTable
        consultations={consultations}
        onSelect={handleSelectConsultation}
      />

      {/* Core Feature Value Highlights */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Engineered for Modern Clinical Workflow
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Eliminating clinical administrative burden while keeping the doctor in the loop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Ambient Listening</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transform consultation conversations into structured clinical information seamlessly.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Clinical Extraction</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Identify symptoms, medications, dosage, duration and clinical advice with high accuracy.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Doctor in Control</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review, edit, and adjust every single AI-generated field before issuing approval.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Instant Prescription</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate a clean, printable medical prescription in seconds with official registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
