import { MedicationItem } from "@/types/clinical";
import { Pill } from "lucide-react";

interface MedicationTableProps {
  medications: MedicationItem[];
}

export default function MedicationTable({ medications }: MedicationTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50 font-semibold text-slate-700">
          <tr>
            <th scope="col" className="px-3.5 py-3">#</th>
            <th scope="col" className="px-3.5 py-3">Medication</th>
            <th scope="col" className="px-3.5 py-3">Dose</th>
            <th scope="col" className="px-3.5 py-3">Frequency</th>
            <th scope="col" className="px-3.5 py-3">Duration</th>
            <th scope="col" className="px-3.5 py-3">Instructions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {medications.map((m, index) => (
            <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-3.5 py-3 font-bold text-slate-400">{index + 1}</td>
              <td className="px-3.5 py-3 font-semibold text-slate-900 flex items-center space-x-2">
                <div className="w-5 h-5 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Pill className="w-3 h-3" />
                </div>
                <div>
                  <span>{m.name}</span>
                  {m.route && (
                    <span className="block text-[10px] text-slate-400 font-normal">{m.route} route</span>
                  )}
                </div>
              </td>
              <td className="px-3.5 py-3 font-mono font-medium text-slate-800">{m.dosage}</td>
              <td className="px-3.5 py-3 text-slate-700">{m.frequency}</td>
              <td className="px-3.5 py-3 font-mono text-slate-600">{m.duration}</td>
              <td className="px-3.5 py-3 text-slate-600">
                <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                  {m.instructions || "As directed"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
