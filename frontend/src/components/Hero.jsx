import React from 'react';
import { Search, Brain, ShieldCheck, ArrowRight, Zap, AlertTriangle, Lock } from 'lucide-react';

export default function Hero({ onStartAnalysis, onScrollToDemo }) {
  return (
    <div className="relative pt-8 pb-12 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="text-center max-w-4xl mx-auto px-4">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Next-Generation Scam & Fraud Intelligence</span>
        </div>

        {/* Headlines */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Don’t Trust It. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Check It.</span>
        </h1>

        <h2 className="text-xl sm:text-2xl font-semibold text-slate-300 mb-4">
          Could this message be a scam?
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Upload a screenshot, paste a suspicious message, or enter a link. Our AI analyzes suspicious patterns, reveals threat evidence, and explains the risk in simple language before you click, pay, or share.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onStartAnalysis}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Analyze Suspicious Content</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onScrollToDemo}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium hover:text-white transition-all flex items-center justify-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Try Interactive Demos</span>
          </button>
        </div>

        {/* Feature Cards: Detect, Explain, Protect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          {/* Detect */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 hover:border-blue-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <span>Detect</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">01</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Identify suspicious messages, malicious shortened links, and screenshot vouchers across WhatsApp, SMS, and Telegram.
            </p>
          </div>

          {/* Explain */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 hover:border-purple-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <span>Explain</span>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">02</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Not just SAFE or SCAM — understand exactly <strong className="text-slate-200">what</strong> triggered the warning and <strong className="text-slate-200">why</strong> it is dangerous.
            </p>
          </div>

          {/* Protect */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <span>Protect</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">03</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Get immediate, numbered safety actions and verification protocols so you never fall victim to extortion or asset loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
