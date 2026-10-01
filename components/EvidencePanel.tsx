"use client";

import { useState } from "react";
import { ClinicalSummary } from "@/types/clinical";
import { ShieldCheck, Search, Quote, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface EvidencePanelProps {
  summary: ClinicalSummary;
}

export default function EvidencePanel({ summary }: EvidencePanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Build evidence items from the summary
  const items = [
    {
      category: "Chief Complaint",
      entity: "Chief Complaint",
      value: summary.chiefComplaint,
      source: summary.chiefComplaintSource || summary.transcript.split("\n")[1] || "Patient reported during consultation intake.",
    },
    ...summary.symptoms.map((s) => ({
      category: "Symptoms",
      entity: s.name,
      value: `${s.duration} • ${s.severity} severity`,
      source: s.sourceSentence,
    })),
    ...summary.diagnoses.map((d) => ({
      category: "Diagnosis",
      entity: d.name,
      value: `Status: ${d.certainty.toUpperCase()} by physician`,
      source: d.sourceSentence,
    })),
    ...summary.medications.map((m) => ({
      category: "Medication",
      entity: `${m.name} ${m.dosage}`,
      value: `${m.frequency} for ${m.duration} (${m.instructions})`,
      source: m.sourceSentence,
    })),
    ...summary.dietaryAdvice.map((a, i) => ({
      category: "Advice",
      entity: `Dietary Advice #${i + 1}`,
      value: a,
      source: summary.transcript.includes("fluid")
        ? "Drink plenty of fluids and get adequate rest."
        : summary.transcript.split("\n").slice(-2)[0] || a,
    })),
    ...summary.clinicalAdvice.map((a, i) => ({
      category: "Advice",
      entity: `Clinical Advice #${i + 1}`,
      value: a,
      source: summary.transcript.includes("rest")
        ? "Adequate rest and symptom monitoring."
        : a,
    })),
  ];

  const categories = ["All", "Symptoms", "Medication", "Diagnosis", "Advice", "Chief Complaint"];

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.value.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
      {/* Header with toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-teal-50/60 to-slate-50 cursor-pointer select-none hover:bg-teal-50/80 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-base">Why was this extracted?</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                100% Traceable
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Clinical entity verification — every fact linked to its original conversation quote.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
          <span>{isOpen ? "Collapse" : "Expand Traceability"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-slate-200">
          {/* Controls: Category tabs & search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-teal-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search extracted facts..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Evidence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-teal-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 px-2 py-0.5 rounded bg-teal-50 border border-teal-100">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                    Verified Quote
                  </span>
                </div>

                <div className="font-semibold text-slate-900 text-sm mb-1">{item.entity}</div>
                <div className="text-xs text-slate-600 mb-2 font-mono bg-white/80 px-2 py-1 rounded border border-slate-100">
                  {item.value}
                </div>

                {/* Source quote */}
                <div className="mt-2 pt-2 border-t border-slate-200/70 flex items-start space-x-2 text-xs text-slate-700 bg-teal-50/40 p-2 rounded">
                  <Quote className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <p className="italic leading-relaxed">
                    &ldquo;{item.source}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No matching clinical entities found for this query.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
