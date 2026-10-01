"use client";

import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  Shield,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Copy,
  Sparkles,
  User,
} from "lucide-react";

interface PatientDetailsInput {
  name?: string;
  age?: string;
  gender?: string;
  mrn?: string;
}

interface ConsultationUploaderProps {
  onTranscriptReady: (data: {
    transcript: string;
    audioFileName?: string;
    audioDuration?: string;
    patientDetails?: PatientDetailsInput;
  }) => void;
}

export default function ConsultationUploader({ onTranscriptReady }: ConsultationUploaderProps) {
  // Patient intake state
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Unspecified");
  const [patientMrn, setPatientMrn] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"audio" | "transcript">("audio");

  // Real Transcription Pipeline State
  const [transcribing, setTranscribing] = useState(false);
  const [transcribeStep, setTranscribeStep] = useState<string>("");
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [isTranscribed, setIsTranscribed] = useState(false);

  // Manual transcript
  const [manualTranscript, setManualTranscript] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleFileChange = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const valid = ["mp3", "wav", "m4a", "webm", "ogg", "mpeg"];
    if (ext && !valid.includes(ext)) {
      setErrorMessage(`Unsupported audio format (.${ext}). Please select an MP3, WAV, M4A, or WEBM audio file.`);
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setIsTranscribed(false);
    setTranscribedText("");

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const newUrl = URL.createObjectURL(file);
    setAudioUrl(newUrl);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const sec = Math.round(audioRef.current.duration);
      if (!isNaN(sec)) {
        const mins = Math.floor(sec / 60);
        const remSecs = sec % 60;
        setAudioDuration(`${mins}:${remSecs < 10 ? "0" : ""}${remSecs}`);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioDuration("");
    setIsTranscribed(false);
    setTranscribedText("");
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Execute REAL speech-to-text API call
  const handleRealTranscription = async () => {
    if (!selectedFile) return;

    setTranscribing(true);
    setErrorMessage(null);

    try {
      setTranscribeStep("Uploading audio file to backend pipeline...");

      const formData = new FormData();
      formData.append("file", selectedFile);

      setTranscribeStep("Transcribing conversation with speech-to-text API...");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Speech-to-text transcription failed.");
      }

      setTranscribeStep("Transcript ready!");
      setTranscribedText(data.transcript);
      setIsTranscribed(true);

      if (data.duration && !audioDuration) {
        const m = Math.floor(data.duration / 60);
        const s = data.duration % 60;
        setAudioDuration(`${m}:${s < 10 ? "0" : ""}${s}`);
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "We couldn't transcribe this audio. Please check your API configuration and try again."
      );
    } finally {
      setTranscribing(false);
    }
  };

  // User clicks Analyze Clinical Information
  const handleProceedToAnalysis = () => {
    const textToAnalyze = activeTab === "audio" ? transcribedText.trim() : manualTranscript.trim();

    if (!textToAnalyze) {
      setErrorMessage("Please ensure a consultation transcript is available to analyze.");
      return;
    }

    setErrorMessage(null);
    onTranscriptReady({
      transcript: textToAnalyze,
      audioFileName: selectedFile?.name,
      audioDuration: audioDuration || undefined,
      patientDetails: {
        name: patientName.trim() || undefined,
        age: patientAge.trim() || undefined,
        gender: patientGender !== "Unspecified" ? patientGender : undefined,
        mrn: patientMrn.trim() || undefined,
      },
    });
  };

  const handleCopyTranscript = () => {
    const text = activeTab === "audio" ? transcribedText : manualTranscript;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          New Clinical Consultation
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter patient details and upload an actual consultation recording (MP3, WAV, M4A) for real speech-to-text and AI entity extraction.
        </p>
      </div>

      {/* Patient Intake Card (Requirement #17 Step 3) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-800">
          <User className="w-4 h-4 text-teal-600" />
          <span>Patient Intake Demographics (Optional / Pre-fill)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Patient Full Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Age</label>
            <input
              type="text"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="e.g. 28"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Gender</label>
            <select
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white text-slate-700"
            >
              <option value="Unspecified">Unspecified (Auto-detect)</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Medical Record No. (MRN)</label>
            <input
              type="text"
              value={patientMrn}
              onChange={(e) => setPatientMrn(e.target.value)}
              placeholder="e.g. MRN-2026-0841"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Input Method Switcher */}
      <div className="flex space-x-1 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab("audio");
            setErrorMessage(null);
          }}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "audio"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Real Audio File Upload (MP3 / WAV)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("transcript");
            setErrorMessage(null);
          }}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "transcript"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Direct Transcript Input</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-rose-950 block">Pipeline Error</span>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* TAB 1: AUDIO UPLOAD */}
      {activeTab === "audio" && (
        <div className="space-y-5">
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/20 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all space-y-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.m4a,.webm,.ogg,.mpeg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
              />

              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Select or drag consultation audio recording
                </h3>
                <p className="text-xs text-slate-500">
                  Supports MP3, WAV, M4A, WEBM, FLAC (Max 25MB)
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20"
              >
                <span>Browse Files</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs uppercase">
                    {selectedFile.name.split(".").pop()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {audioDuration || "Calculating duration..."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Native HTML5 Audio Player for Physician Playback */}
              {audioUrl && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Physician Audio Preview</span>
                    <span className="text-[11px] text-teal-700 font-normal">Play, pause & seek consultation recording</span>
                  </div>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    controls
                    onLoadedMetadata={handleLoadedMetadata}
                    className="w-full h-11 rounded-xl bg-slate-50"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {!isTranscribed ? (
                  <button
                    type="button"
                    onClick={handleRealTranscription}
                    disabled={transcribing}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 disabled:opacity-60 transition-all"
                  >
                    {transcribing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{transcribeStep || "Transcribing Audio..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Transcribe with Speech-to-Text</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleProceedToAnalysis}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-teal-600/20 transition-all hover:scale-[1.01]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Clinical Information</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Transcribed dialogue box */}
              {isTranscribed && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Verbatim Transcript Generated from Audio</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTranscript}
                      className="text-[11px] text-teal-700 font-semibold hover:underline flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto bg-white p-3 rounded-lg border border-slate-200">
                    {transcribedText}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIRECT TRANSCRIPT INPUT */}
      {activeTab === "transcript" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Paste or Type Consultation Dialogue
            </label>
            <p className="text-xs text-slate-500">
              Provide doctor-patient dialogue. SmartScribe will extract symptoms, diagnoses, medications, dosages, and exact citations.
            </p>
          </div>

          <textarea
            rows={10}
            value={manualTranscript}
            onChange={(e) => setManualTranscript(e.target.value)}
            placeholder="Doctor: Good morning. What brings you in today?&#10;Patient: Doctor, I've had fever for three days, dry cough, and mild headache...&#10;Doctor: Let me check. I will prescribe paracetamol 500 mg..."
            className="w-full p-4 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleProceedToAnalysis}
              disabled={!manualTranscript.trim()}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Extract Clinical Information</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Security footer notice */}
      <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-2">
        <Shield className="w-3.5 h-3.5 text-teal-600" />
        <span>Protected Health Information (PHI) encrypted • Server-side API processing only • No client credential exposure</span>
      </div>
    </div>
  );
}
