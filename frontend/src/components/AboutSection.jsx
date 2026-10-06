import React from 'react';
import { 
  ShieldCheck, 
  Workflow, 
  Layers, 
  CheckCircle2, 
  Terminal, 
  Cpu, 
  FileSearch, 
  Scale, 
  BookOpen, 
  Lock,
  ArrowRight,
  Database,
  Code
} from 'lucide-react';

export default function AboutSection() {
  const pipelineSteps = [
    { title: "Input Source", desc: "WhatsApp, SMS text, Screenshot, or Link URL", icon: FileSearch, color: "text-blue-400" },
    { title: "OCR Extraction", desc: "In-browser neural optical character recognition", icon: Cpu, color: "text-indigo-400" },
    { title: "NLP & Pattern Engine", desc: "Heuristic indicators, entity scraping, & regex rules", icon: Terminal, color: "text-purple-400" },
    { title: "Scam Classification", desc: "Fake Job, Phishing, Investment, Impersonation, etc.", icon: Layers, color: "text-pink-400" },
    { title: "Risk Assessment", desc: "0-100 Threat scoring and multi-vector breakdown", icon: Scale, color: "text-amber-400" },
    { title: "Plain Explanation", desc: "Deconstructed evidence and forensic reasoning", icon: BookOpen, color: "text-emerald-400" },
    { title: "Recommended Action", desc: "Direct defensive protocols & safety rules", icon: ShieldCheck, color: "text-cyan-400" }
  ];

  const techStack = [
    { name: "Python", category: "Backend Runtime", desc: "High-performance asynchronous core" },
    { name: "FastAPI", category: "API Framework", desc: "Modern, OpenAPI-compliant endpoints with strict validation" },
    { name: "React + Vite", category: "Frontend Engine", desc: "Ultra-fast reactive UI with hot module reloading" },
    { name: "Tailwind CSS", category: "Styling & Design", desc: "Dark cybersecurity design tokens and responsive grids" },
    { name: "Transformers / NLP", category: "AI & Linguistics", desc: "Semantic keyword extraction and urgency detection" },
    { name: "OCR Engine", category: "Vision Processing", desc: "Direct image-to-text transcription for mobile screenshots" },
    { name: "PostgreSQL-Ready", category: "Data Architecture", desc: "Standardized audit trail models ready for production databases" },
    { name: "Zero-Visit URL Sandbox", category: "Threat Intelligence", desc: "Safe cryptographic and reputation URL inspection" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* About Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>About The Platform</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          What is ScamInvestigation AI?
        </h2>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          <strong className="text-white">ScamInvestigation AI</strong> is an AI-powered platform designed to help users identify potential digital scams and understand the warning signs before responding or clicking.
        </p>
        <p className="text-sm text-slate-400">
          In an era of hyper-convincing digital scams, binary labels like "SAFE" or "SCAM" aren't enough. People need to see the exact evidence, understand the social engineering tactics, and know immediate defensive counter-measures.
        </p>
        <div className="pt-2">
          <span className="text-sm font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Detect. Explain. Protect.
          </span>
        </div>
      </div>

      {/* Architecture Flow */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Workflow className="w-3.5 h-3.5" />
            <span>End-to-End Processing Architecture</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Analysis Pipeline</h3>
          <p className="text-sm text-slate-400">
            How incoming suspicious data travels through the verification engine:
          </p>
        </div>

        {/* Visual Pipeline Sequence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between text-left group hover:border-blue-500/40 transition-all relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      0{idx + 1}
                    </span>
                    <Icon className={`w-4 h-4 ${step.color}`} />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-tight">{step.desc}</p>
                </div>

                {idx < pipelineSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-slate-600 z-10">
                    &rarr;
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Code className="w-3.5 h-3.5" />
            <span>Engineering Blueprint</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Enterprise-Grade Stack</h3>
          <p className="text-sm text-slate-400">
            Engineered for rapid response, robust fallback stability, and zero external dependency risk.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techStack.map((tech, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{tech.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {tech.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {tech.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
