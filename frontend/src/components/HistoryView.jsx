import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Trash2, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { fetchHistoryApi, deleteHistoryItemApi, clearAllHistoryApi } from '../services/api';

export default function HistoryView({ onSelectHistoryItem, onBackToAnalyze }) {
  const [historyList, setHistoryList] = useState([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchHistoryApi({ search, risk_level: riskFilter, category: categoryFilter });
    setHistoryList(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [search, riskFilter, categoryFilter]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteHistoryItemApi(id);
    setHistoryList(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear your entire scan history?")) {
      await clearAllHistoryApi();
      setHistoryList([]);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Analysis History</h2>
          <p className="text-sm text-slate-400">Review past scam investigations, threat scores, and forensic indicators.</p>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={handleClearAll}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/50 text-xs font-medium transition-all flex items-center space-x-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keywords, text, or category..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Risk Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
            <option value="SAFE">Safe</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="Fake Job">Fake Job Scam</option>
            <option value="Investment">Investment Scam</option>
            <option value="Phishing">Phishing</option>
            <option value="Impersonation">Impersonation</option>
            <option value="Payment">Payment Scam</option>
            <option value="Lottery">Lottery / Prize</option>
          </select>
        </div>
      </div>

      {/* History Items Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          Loading history audit records...
        </div>
      ) : historyList.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">No Analysis Records Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            {search || riskFilter || categoryFilter 
              ? "No records match your search filter." 
              : "Perform an analysis to populate your cybersecurity audit history."}
          </p>
          <button
            onClick={onBackToAnalyze}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all inline-flex items-center space-x-2"
          >
            <span>Scan Content Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {historyList.map((item) => {
            const isHigh = item.risk_level?.toUpperCase() === 'HIGH';
            const isMedium = item.risk_level?.toUpperCase() === 'MEDIUM';

            return (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group shadow-sm hover:shadow-md"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                    isHigh 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                      : isMedium 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}>
                    <span className="text-sm font-extrabold">{item.risk_score}</span>
                    <span className="text-[9px] uppercase font-mono">Score</span>
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isHigh ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : isMedium ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.risk_level}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(item.created_at)}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {item.summary || item.input_text}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1">
                      <span>Source: <strong className="text-slate-400 capitalize">{item.input_type || 'Message'}</strong></span>
                      <span>•</span>
                      <span>Signals Detected: <strong className="text-slate-400">{item.indicators?.length || 0}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-2 rounded-lg text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
