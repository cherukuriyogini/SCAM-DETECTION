"use client";

import { useState, useRef } from "react";
import { SAMPLE_CASES } from "@/data/sampleConsultations";
import {
  Mic,
  UploadCloud,
  FileText,
  Sparkles,
  Music,
  Trash2,
  Play,
  Pause,
  AlertCircle,
  Shield,
  ArrowRight,
} from "lucide-react";

interface ConsultationUploaderProps {
  onAnalyze: (data: {
    transcript: string;
    audioFileName?: string;
    audioDuration?: string;
  }) => void;
}

export default function ConsultationUploader({ onAnalyze }: ConsultationUploaderProps) {
  const [activeTab, setActiveTab] = useState<"audio" | "transcript">("audio");
  const [audioFile, setAudioFile] = useState<{
    name: string;
    size: string;
    duration: string;
  } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load a demo consultation case
  const handleLoadDemoCase = (caseIndex: number = 0) => {
    const selected = SAMPLE_CASES[caseIndex];
    setSelectedCaseId(selected.id);
    setTranscript(selected.transcript);
    setAudioFile({
      name: `consultation_${selected.id}.mp3`,
      size: "2.4 MB",
      duration: selected.audioDuration,
    });
    setValidationError(null);
  };

  // Handle file drop / select
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["mp3", "wav", "m4a", "webm"].includes(ext || "")) {
        setValidationError("Please upload a valid audio format: MP3, WAV, M4A, or WEBM.");
        return;
      }
      setValidationError(null);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      setAudioFile({
        name: file.name,
        size: sizeMB,
        duration: "2m 14s",
      });
      // If transcript is empty, prefill default consultation or keep current
      if (!transcript) {
        setTranscript(SAMPLE_CASES[0].transcript);
      }
    }
  };

  const handleClearAudio = () => {
    setAudioFile(null);
    setIsPlayingAudio(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStartAnalysis = () => {
    if (activeTab === "audio" && !audioFile && !transcript.trim()) {
      setValidationError("Please select an audio recording or load a synthetic demo consultation.");
      return;
    }
    if (activeTab === "transcript" && !transcript.trim()) {
      setValidationError("Please enter or paste a doctor-patient conversation transcript.");
      return;
    }
    setValidationError(null);
    onAnalyze({
      transcript: transcript.trim() || SAMPLE_CASES[0].transcript,
      audioFileName: audioFile?.name,
      audioDuration: audioFile?.duration,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">New Consultation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload a consultation recording or paste a transcript to begin ambient clinical analysis.
        </p>
      </div>

      {/* Synthetic Demo Consultation Quick Load Bar */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50/90 via-emerald-50/60 to-slate-50 border border-teal-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-600 text-white">
                Hackathon Demo
              </span>
              <h3 className="text-sm font-bold text-slate-900">Load Synthetic Demo Consultation</h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Instantly test realistic doctor-patient conversations with full clinical entity trace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleLoadDemoCase(0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedCaseId === SAMPLE_CASES[0].id
                  ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Demo 1: Fever & Cough
            </button>
            <button
              type="button"
              onClick={() => handleLoadDemoCase(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedCaseId === SAMPLE_CASES[1].id
                  ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Demo 2: Migraine
            </button>
            <button
              type="button"
              onClick={() => handleLoadDemoCase(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedCaseId === SAMPLE_CASES[2].id
                  ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Demo 3: Acid Reflux
            </button>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("audio")}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "audio"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Option A: Audio Recording</span>
        </button>

        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "transcript"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Option B: Text Transcript</span>
        </button>
      </div>

      {/* OPTION A: Audio Upload */}
      {activeTab === "audio" && (
        <div className="space-y-4">
          {!audioFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-white hover:bg-slate-50/60 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.m4a,.webm,audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Upload consultation audio recording
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Drag and drop MP3, WAV, M4A, or WEBM audio file here, or click to browse.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-medium">
                <span className="px-2 py-0.5 rounded bg-slate-100">MP3</span>
                <span className="px-2 py-0.5 rounded bg-slate-100">WAV</span>
                <span className="px-2 py-0.5 rounded bg-slate-100">M4A</span>
                <span className="px-2 py-0.5 rounded bg-slate-100">WEBM</span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{audioFile.name}</h4>
                    <p className="text-xs text-slate-500">
                      Size: {audioFile.size} • Duration: {audioFile.duration} • Ready for analysis
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingAudio ? "Pause" : "Preview Audio"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearAudio}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Animated Waveform Visualizer */}
              <div className="p-3 bg-slate-900 rounded-lg flex items-center justify-between gap-1 overflow-hidden h-12 px-4">
                {[...Array(32)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isPlayingAudio ? "bg-teal-400 animate-pulse" : "bg-teal-800"
                    }`}
                    style={{
                      height: isPlayingAudio
                        ? `${Math.max(15, (Math.sin(i * 0.7) * 0.5 + 0.5) * 100)}%`
                        : `${(i % 5 + 2) * 12}%`,
                    }}
                  />
                ))}
              </div>

              {/* Synchronized Transcript Preview */}
              {transcript && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Synchronized Conversation Transcript
                  </div>
                  <p className="text-slate-600 italic line-clamp-2">
                    &ldquo;{transcript.slice(0, 160)}...&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* OPTION B: Text Transcript */}
      {activeTab === "transcript" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700">Paste Consultation Transcript</label>
            <span className="text-slate-400 font-mono">{transcript.length} characters</span>
          </div>

          <textarea
            rows={10}
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              setValidationError(null);
            }}
            placeholder={`Doctor: What brings you in today?\nPatient: I've had a fever and cough for three days...\nDoctor: Any shortness of breath, chest pain, or vomiting?`}
            className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs font-mono leading-relaxed bg-white"
          />
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Primary CTA and Privacy Note */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Shield className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            Data processed for documentation assistance only. Avoid uploading real PHI in demo environments.
          </span>
        </div>

        <button
          type="button"
          onClick={handleStartAnalysis}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze Consultation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
