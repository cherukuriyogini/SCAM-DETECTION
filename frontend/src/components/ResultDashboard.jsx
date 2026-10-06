import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink, 
  Phone, 
  DollarSign, 
  Building2, 
  Tag, 
  Share2, 
  Copy, 
  Check, 
  ArrowLeft,
  Sparkles,
  Lock,
  Compass,
  FileCheck2,
  Cpu
} from 'lucide-react';

export default function ResultDashboard({ result, onReset }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const {
    risk_score = 0,
    risk_level = 'LOW',
    category = 'General Content',
    confidence = 85,
    summary = '',
    indicators = [],
    risk_breakdown = {},
    recommended_actions = [],
    safety_tips = [],
    extracted_entities = {},
    url_security = null,
    analysis_engine = 'Pattern & Heuristic AI Engine',
    created_at = new Date().toISOString()
  } = result;

  // Colors based on risk level
  const getRiskStyles = () => {
    switch (risk_level.toUpperCase()) {
      case 'HIGH':
        return {
          textColor: 'text-rose-400',
          bgColor: 'bg-rose-500/10',
          borderColor: 'border-rose-500/30',
          glowColor: 'shadow-rose-500/20',
          strokeColor: '#f43f5e',
          badgeText: '🔴 HIGH RISK',
          accentGradient: 'from-rose-500 to-red-600'
        };
      case 'MEDIUM':
        return {
          textColor: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          glowColor: 'shadow-amber-500/20',
          strokeColor: '#f59e0b',
          badgeText: '🟡 MEDIUM RISK',
          accentGradient: 'from-amber-500 to-orange-600'
        };
      case 'LOW':
      case 'SAFE':
      default:
        return {
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          glowColor: 'shadow-emerald-500/20',
          strokeColor: '#10b981',
          badgeText: '🟢 LOW RISK / SAFE',
          accentGradient: 'from-emerald-500 to-teal-600'
        };
    }
  };

  const styles = getRiskStyles();

  // SVG Circular progress math
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (risk_score / 100) * circumference;

  const handleCopyReport = () => {
    const textToCopy = `ScamInvestigation AI Report\nRisk: ${risk_level} (${risk_score}/100)\nCategory: ${category}\nConfidence: ${confidence}%\n\nSummary:\n${summary}\n\nIndicators:\n${indicators.map(i => `- ${i.title}: ${i.explanation} (Evidence: ${i.evidence})`).join('\n')}\n\nRecommended Actions:\n${recommended_actions.map((a, i) => `${i+1}. ${a}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Analyze Another Message or Link</span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono">{analysis_engine}</span>
          </div>

          <button
            onClick={handleCopyReport}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 10. TOP CARD: SCAM RISK ASSESSMENT */}
      <div className={`p-8 rounded-3xl bg-slate-900/90 border ${styles.borderColor} shadow-2xl backdrop-blur-xl relative overflow-hidden`}>
        {/* Glow */}
        <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${styles.accentGradient} opacity-10 blur-3xl pointer-events-none`} />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Circular Score Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-44 h-44 -rotate-90 transform">
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke="#1e293b"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke={styles.strokeColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-white tracking-tight">{risk_score}</span>
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">/ 100</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">Threat Score</span>
            </div>
          </div>

          {/* Assessment Overview */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className={`px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${styles.bgColor} ${styles.textColor} border ${styles.borderColor}`}>
                {styles.badgeText}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono text-slate-400 bg-slate-800/80 border border-slate-700">
                {confidence}% Confidence
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Scam Risk Assessment: <span className={styles.textColor}>{category}</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {summary}
            </p>
          </div>
        </div>
      </div>

      {/* 11. "WHY WE FLAGGED THIS" (THE MOST IMPORTANT SECTION) */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Forensic Breakdown</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Why We Flagged This</h3>
          <p className="text-sm text-slate-400">
            Our AI decomposed the message into specific malicious signals. Here is the verified evidence found:
          </p>
        </div>

        {indicators.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>No deceptive trigger patterns, payment demands, or credential requests were detected.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {indicators.map((indicator, idx) => {
              const isHigh = indicator.severity?.toUpperCase() === 'HIGH';
              const isMedium = indicator.severity?.toUpperCase() === 'MEDIUM';
              return (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${isHigh ? 'text-rose-400' : isMedium ? 'text-amber-400' : 'text-blue-400'}`} />
                        <h4 className="text-sm font-bold text-white tracking-tight">{indicator.title}</h4>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        isHigh 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                          : isMedium 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        {indicator.severity} RISK
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-amber-200/90 break-words">
                      <span className="text-slate-500 block text-[10px] uppercase font-sans mb-0.5">Evidence Found:</span>
                      {indicator.evidence}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {indicator.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 12. RISK BREAKDOWN (PROGRESS BARS) */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Risk Breakdown</h3>
          <p className="text-sm text-slate-400">Multi-vector psychological and financial danger assessment.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Urgency', value: risk_breakdown.urgency || 20, color: 'bg-rose-500' },
            { label: 'Financial Request', value: risk_breakdown.financial_request || 15, color: 'bg-amber-500' },
            { label: 'Identity Request', value: risk_breakdown.identity_request || 25, color: 'bg-purple-500' },
            { label: 'Suspicious Language', value: risk_breakdown.suspicious_language || 30, color: 'bg-blue-500' },
            { label: 'URL Risk', value: risk_breakdown.url_risk || 0, color: 'bg-red-500' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">{item.label}</span>
                <span className="font-mono text-white font-bold">{item.value}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min(100, Math.max(5, item.value))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. URL SECURITY ANALYSIS (IF URL INVOLVED) */}
      {url_security && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Zero-Visit URL Inspection</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">URL Security Analysis</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 font-mono text-slate-300 border border-slate-700">
                Protocol: {url_security.protocol}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase ${
                url_security.risk === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {url_security.risk} Risk
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Host / Domain:</span>
              <span className="font-mono text-amber-300 font-semibold">{url_security.domain || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Suspicious Patterns Detected:</span>
              <span className="font-mono text-white font-bold">{url_security.suspicious_patterns_count}</span>
            </div>
          </div>

          {url_security.findings && url_security.findings.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-300 block">Security Scanner Findings:</span>
              <ul className="space-y-1.5">
                {url_security.findings.map((f, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start space-x-2">
                    <span className="text-rose-400 font-bold shrink-0">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 13. RECOMMENDED ACTIONS: "WHAT SHOULD I DO NOW?" */}
      <div className="rounded-3xl bg-slate-900/90 border border-blue-500/30 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <FileCheck2 className="w-4 h-4" />
              <span>Immediate Protective Protocol</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">What Should I Do Now?</h3>
          </div>
          <span className="text-xs text-slate-400">Follow these steps immediately</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {recommended_actions.map((action, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start space-x-3.5 hover:border-slate-700 transition-colors"
            >
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                {idx + 1}
              </div>
              <p className="text-sm font-medium text-slate-200 leading-snug">
                {action}
              </p>
            </div>
          ))}
        </div>

        {/* Safety Callout Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-indigo-400 shrink-0" />
            <span className="text-sm font-semibold text-white">
              Golden Rule: <span className="text-indigo-300 italic">"When in doubt, verify before you trust."</span>
            </span>
          </div>
        </div>
      </div>

      {/* 14. EXTRACTED INFORMATION */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 space-y-5">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Extracted Entities & Metadata</h3>
          <p className="text-sm text-slate-400">Structured data automatically scraped from the content.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Money Amounts */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-400 font-semibold">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Money Amounts</span>
            </div>
            {extracted_entities.amounts && extracted_entities.amounts.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {extracted_entities.amounts.map((amt, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-semibold">
                    {amt}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-600 italic">None detected</span>
            )}
          </div>

          {/* Phone Numbers */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-400 font-semibold">
              <Phone className="w-4 h-4 text-blue-400" />
              <span>Phone Numbers</span>
            </div>
            {extracted_entities.phone_numbers && extracted_entities.phone_numbers.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {extracted_entities.phone_numbers.map((phone, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono">
                    {phone}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-600 italic">None detected</span>
            )}
          </div>

          {/* Organizations */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-400 font-semibold">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>Organizations Mentioned</span>
            </div>
            {extracted_entities.organizations && extracted_entities.organizations.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {extracted_entities.organizations.map((org, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold">
                    {org}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-600 italic">None detected</span>
            )}
          </div>

          {/* URLs */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-400 font-semibold">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>Extracted URLs</span>
            </div>
            {extracted_entities.urls && extracted_entities.urls.length > 0 ? (
              <div className="flex flex-col gap-1">
                {extracted_entities.urls.map((u, i) => (
                  <span key={i} className="text-amber-300 font-mono truncate hover:text-amber-200" title={u}>
                    {u}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-600 italic">None detected</span>
            )}
          </div>
        </div>

        {/* Suspicious Keywords Badges */}
        {extracted_entities.keywords && extracted_entities.keywords.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-400 block mb-2">Trigger Keywords Flagged:</span>
            <div className="flex flex-wrap gap-1.5">
              {extracted_entities.keywords.map((kw, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
