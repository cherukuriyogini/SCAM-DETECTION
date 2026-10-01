"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConsultationUploader from "@/components/ConsultationUploader";
import ProcessingPipeline from "@/components/ProcessingPipeline";
import { ClinicalSummary } from "@/types/clinical";
import { saveConsultation, setActiveConsultation } from "@/lib/storage";
import { extractFromTranscript } from "@/lib/extractionEngine";
import { SAMPLE_CASES } from "@/data/sampleConsultations";

export default function NewConsultationPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAudioName, setProcessingAudioName] = useState<string | undefined>(undefined);
  const [analyzedSummary, setAnalyzedSummary] = useState<ClinicalSummary | null>(null);

  useEffect(() => {
    // Check if coming from 1-click demo on dashboard
    const preloadId = sessionStorage.getItem("smartscribe_preload_case");
    if (preloadId) {
      sessionStorage.removeItem("smartscribe_preload_case");
      const matched = SAMPLE_CASES.find((c) => c.id === preloadId);
      if (matched) {
        handleStartAnalysis({
          transcript: matched.transcript,
          audioFileName: `consultation_${matched.id}.mp3`,
          audioDuration: matched.audioDuration,
        });
      }
    }
  }, []);

  const handleStartAnalysis = async (data: {
    transcript: string;
    audioFileName?: string;
    audioDuration?: string;
  }) => {
    setProcessingAudioName(data.audioFileName);
    setIsProcessing(true);

    try {
      // Call server API route with fallback
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const summary: ClinicalSummary = await response.json();
        setAnalyzedSummary(summary);
      } else {
        // Fallback to client-side extraction engine if server route failed
        const fallback = extractFromTranscript(data.transcript, data.audioFileName, data.audioDuration);
        setAnalyzedSummary(fallback);
      }
    } catch (e) {
      console.warn("Using local deterministic extraction fallback", e);
      const fallback = extractFromTranscript(data.transcript, data.audioFileName, data.audioDuration);
      setAnalyzedSummary(fallback);
    }
  };

  const handlePipelineCompleted = () => {
    if (analyzedSummary) {
      saveConsultation(analyzedSummary);
      setActiveConsultation(analyzedSummary);
      router.push(`/consultation/${analyzedSummary.id}`);
    } else {
      // If still waiting, generate immediate fallback
      const sample = SAMPLE_CASES[0].summary;
      saveConsultation(sample);
      setActiveConsultation(sample);
      router.push(`/consultation/${sample.id}`);
    }
  };

  return (
    <div>
      {isProcessing ? (
        <ProcessingPipeline
          onComplete={handlePipelineCompleted}
          audioFileName={processingAudioName}
        />
      ) : (
        <div className="max-w-4xl mx-auto">
          <ConsultationUploader onAnalyze={handleStartAnalysis} />
        </div>
      )}
    </div>
  );
}
