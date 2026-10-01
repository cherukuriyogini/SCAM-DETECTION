import { SymptomItem } from "@/types/clinical";
import { Activity } from "lucide-react";

interface SymptomsTableProps {
  symptoms: SymptomItem[];
}

export default function SymptomsTable({ symptoms }: SymptomsTableProps) {
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "Severe":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Moderate":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Mild":
      default:
        return "bg-teal-50 text-teal-700 border-teal-200";
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50 font-semibold text-slate-700">
          <tr>
            <th scope="col" className="px-3.5 py-3">Symptom</th>
            <th scope="col" className="px-3.5 py-3">Duration</th>
            <th scope="col" className="px-3.5 py-3">Severity</th>
            <th scope="col" className="px-3.5 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {symptoms.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-3.5 py-3 font-medium text-slate-900 flex items-center space-x-2">
                <Activity className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{s.name}</span>
              </td>
              <td className="px-3.5 py-3 text-slate-600 font-mono">{s.duration}</td>
              <td className="px-3.5 py-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getSeverityBadge(
                    s.severity
                  )}`}
                >
                  {s.severity}
                </span>
              </td>
              <td className="px-3.5 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  {s.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
