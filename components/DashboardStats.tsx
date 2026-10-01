import { Users, FileText, Pill, Clock, ArrowUpRight } from "lucide-react";

export default function DashboardStats() {
  const stats = [
    {
      label: "Consultations Today",
      value: "14",
      subtext: "+3 since morning shift",
      icon: Users,
      trendColor: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Notes Generated",
      value: "14",
      subtext: "100% structured schema",
      icon: FileText,
      trendColor: "text-blue-600 bg-blue-50",
    },
    {
      label: "Prescriptions Prepared",
      value: "12",
      subtext: "Doctor reviewed & signed",
      icon: Pill,
      trendColor: "text-teal-600 bg-teal-50",
    },
    {
      label: "Avg. Processing Time",
      value: "1.8s",
      subtext: "Ambient extraction speed",
      icon: Clock,
      trendColor: "text-indigo-600 bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.trendColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
              <span className="text-xs text-emerald-600 flex items-center font-medium">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                Active
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{stat.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
