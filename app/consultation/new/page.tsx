"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConsultationUploader from "@/components/ConsultationUploader";
import { ClinicalSummary } from "@/types/clinical";
import { saveConsultation, setActiveConsultation } from "@/lib/storage";
import { Loader2, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";

export default function NewConsultationPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleStartAnalysis = async (data: {
    transcript: string;
    audioFileName?: string;
    audioDuration?: string;
    patientDetails?: {
      name?: string;
      age?: string;
      gender?: string;
      mrn?: string;
    };
  }) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Clinical analysis failed.");
      }

      const summary: ClinicalSummary = result;
      saveConsultation(summary);
      setActiveConsultation(summary);
      router.push(`/consultation/${summary.id}`);
    } catch (err) {
      console.error("Analysis execution error:", err);
      setAnalysisError(
        err instanceof Error
          ? err.message
          : "We couldn't analyze this consultation. Please verify your Groq API key and try again."
      );
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {analysisError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-rose-950">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>AI Clinical Extraction Error</span>
          </div>
          <p className="leading-relaxed">{analysisError}</p>
          <button
            type="button"
            onClick={() => setAnalysisError(null)}
            className="flex items-center space-x-1 font-semibold text-rose-700 hover:text-rose-900 underline pt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to transcript editor</span>
          </button>
        </div>
      )}

      {isAnalyzing ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-10 text-center max-w-lg mx-auto space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Extracting Clinical Information
            </h3>
            <p className="text-xs text-slate-500">
              Clinical AI is processing the conversation transcript, isolating symptoms, medications, dosages, and evidence...
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs text-teal-700 font-semibold py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing against clinical schema...</span>
          </div>
        </div>
      ) : (
        <ConsultationUploader onTranscriptReady={handleStartAnalysis} />
      )}
    </div>
  );
}
