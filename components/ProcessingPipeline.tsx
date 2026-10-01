"use client";

import { useEffect, useState, ComponentType } from "react";
import { CheckCircle2, Loader2, Sparkles, Brain, Stethoscope, FileText, Pill, ShieldCheck, LucideProps } from "lucide-react";

interface ProcessingPipelineProps {
  onComplete: () => void;
  audioFileName?: string;
}

interface Step {
  id: number;
  label: string;
  detail: string;
  icon: ComponentType<LucideProps>;
}

export default function ProcessingPipeline({ onComplete, audioFileName }: ProcessingPipelineProps) {
  const steps: Step[] = [
    {
      id: 1,
      label: "Conversation received",
      detail: audioFileName ? `Audio file: ${audioFileName} (16kHz PCM)` : "Transcript received & tokenized",
      icon: Stethoscope,
    },
    {
      id: 2,
      label: "Transcribing & filtering conversational noise",
      detail: "Isolating medical colloquy from conversational pleasantries",
      icon: Brain,
    },
    {
      id: 3,
      label: "Identifying clinical entities",
      detail: "Detecting chief complaint, timeline & physician remarks",
      icon: Sparkles,
    },
    {
      id: 4,
      label: "Extracting symptoms and medications",
      detail: "Parsing dosages, dosing intervals, duration & contraindications",
      icon: Pill,
    },
    {
      id: 5,
      label: "Structuring clinical summary",
      detail: "Building standardized SOAP & ICD-10 compatible summary",
      icon: FileText,
    },
    {
      id: 6,
      label: "Preparing doctor review workspace",
      detail: "Attributing traceable source sentences for doctor validation",
      icon: ShieldCheck,
    },
  ];

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [progress, setProgress] = useState<number>(15);

  useEffect(() => {
    const timers = [
      setTimeout(() => { setCurrentStep(2); setProgress(32); }, 500),
      setTimeout(() => { setCurrentStep(3); setProgress(50); }, 1050),
      setTimeout(() => { setCurrentStep(4); setProgress(70); }, 1600),
      setTimeout(() => { setCurrentStep(5); setProgress(88); }, 2150),
      setTimeout(() => { setCurrentStep(6); setProgress(98); }, 2600),
      setTimeout(() => {
        setProgress(100);
        onComplete();
      }, 3100),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 mb-3 ring-8 ring-teal-50/50">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            SmartScribe Ambient Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Transforming natural clinical dialogue into structured, verified medical documentation
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>Clinical Extraction Pipeline</span>
            <span className="font-mono text-teal-700">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id || progress === 100;
            const isCurrent = currentStep === step.id && progress < 100;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-start space-x-3.5 p-3 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-teal-50/80 border border-teal-200/80 shadow-xs"
                    : isCompleted
                    ? "bg-slate-50/60 opacity-90"
                    : "opacity-40"
                }`}
              >
                {/* State Icon */}
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center animate-spin">
                      <Loader2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-medium">
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-semibold ${
                        isCurrent ? "text-teal-900" : isCompleted ? "text-slate-800" : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-teal-200/60 text-teal-800 rounded">
                        Processing...
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Safety Note in processing screen */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>AI acts exclusively as a scribe. The doctor retains complete clinical authority.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
