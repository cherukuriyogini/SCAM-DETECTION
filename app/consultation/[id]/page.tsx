"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ClinicalSummary } from "@/types/clinical";
import { getConsultationById, saveConsultation, getActiveConsultation } from "@/lib/storage";
import { SAMPLE_CASES } from "@/data/sampleConsultations";
import ClinicalSummaryView from "@/components/ClinicalSummaryView";
import DoctorReviewForm from "@/components/DoctorReviewForm";
import PrescriptionPreview from "@/components/PrescriptionPreview";
import {
  FileText,
  Edit3,
  FileCheck,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";

type ActiveTab = "summary" | "review" | "prescription";

export default function ConsultationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;

  const [summary, setSummary] = useState<ClinicalSummary | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    // Check url search param for initial tab
    const tabParam = searchParams.get("tab") as ActiveTab;
    if (tabParam && ["summary", "review", "prescription"].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    if (id) {
      const found = getConsultationById(id);
      if (found) {
        setSummary(found);
      } else {
        // Check active or match against sample cases
        const active = getActiveConsultation();
        if (active && active.id === id) {
          setSummary(active);
        } else {
          const sample = SAMPLE_CASES.find((s) => s.id === id);
          if (sample) {
            setSummary(sample.summary);
          } else {
            // Default fallback to first sample
            setSummary(SAMPLE_CASES[0].summary);
          }
        }
      }
    }
  }, [id, searchParams]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  const handleSaveReview = (updated: ClinicalSummary) => {
    setSummary(updated);
    saveConsultation(updated);
    triggerToast("Draft changes successfully saved.");
  };

  const handleApprovePrescription = (updated: ClinicalSummary) => {
    setSummary(updated);
    saveConsultation(updated);
    setActiveTab("prescription");
    triggerToast("Prescription approved and officially issued by Dr. Jenkins.");
  };

  if (!summary) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading clinical consultation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-xl text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Top Breadcrumb & Workflow Tab Navigation */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Link
            href="/"
            className="flex items-center space-x-1 text-slate-600 hover:text-teal-700 font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">{summary.patient.name}</span>
          <span>/</span>
          <span className="font-mono text-slate-400">{summary.consultation.id}</span>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "summary"
                ? "bg-white text-teal-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Clinical Summary</span>
          </button>

          <button
            onClick={() => setActiveTab("review")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "review"
                ? "bg-white text-teal-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Doctor Review</span>
          </button>

          <button
            onClick={() => setActiveTab("prescription")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "prescription"
                ? "bg-white text-teal-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Prescription Preview</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      <div>
        {activeTab === "summary" && (
          <ClinicalSummaryView
            summary={summary}
            onEdit={() => setActiveTab("review")}
            onApprove={() => setActiveTab("review")}
            onViewPrescription={() => setActiveTab("prescription")}
          />
        )}

        {activeTab === "review" && (
          <DoctorReviewForm
            summary={summary}
            onSave={handleSaveReview}
            onApprove={handleApprovePrescription}
            onCancel={() => setActiveTab("summary")}
          />
        )}

        {activeTab === "prescription" && (
          <PrescriptionPreview
            summary={summary}
            onEdit={() => setActiveTab("review")}
          />
        )}
      </div>
    </div>
  );
}
