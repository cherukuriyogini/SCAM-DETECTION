"use client";

import { useEffect, useState } from "react";
import { ClinicalSummary } from "@/types/clinical";
import {
  Shield,
  Activity,
  Users,
  Database,
  CheckCircle2,
  Sparkles,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Eye,
  Search,
  X,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface AdminUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "doctor" | "patient" | "admin";
  isActive: boolean;
  specialization?: string;
  clinicName?: string;
  licenseNumber?: string;
  mrn?: string;
  contact?: string;
  createdAt?: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "consultations">("overview");

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Consultations state
  const [consultations, setConsultations] = useState<ClinicalSummary[]>([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [consultationSearch, setConsultationSearch] = useState("");
  const [viewingConsultation, setViewingConsultation] = useState<ClinicalSummary | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<ClinicalSummary | null>(null);

  // Notification feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      showToast("Failed to load users from database", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchConsultations = async () => {
    setLoadingConsultations(true);
    try {
      const res = await fetch("/api/admin/consultations");
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations || []);
      }
    } catch {
      showToast("Failed to load consultation records", "error");
    } finally {
      setLoadingConsultations(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchConsultations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── USER ACTIONS ──

  const handleToggleUserActive = async (user: AdminUser) => {
    const targetId = user._id || user.id;
    if (!targetId) return;
    const newStatus = !user.isActive;

    try {
      const res = await fetch(`/api/admin/users/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === targetId ? { ...u, isActive: newStatus } : u))
      );
      showToast(`User ${user.name} has been ${newStatus ? "ACTIVATED" : "DEACTIVATED"}.`);
    } catch {
      showToast("Failed to update user status", "error");
    }
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const targetId = editingUser._id || editingUser.id;
    if (!targetId) return;

    try {
      const res = await fetch(`/api/admin/users/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });

      if (!res.ok) throw new Error("Failed to save changes");
      const data = await res.json();

      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === targetId ? data.user : u))
      );
      setEditingUser(null);
      showToast(`Profile for ${editingUser.name} updated successfully.`);
    } catch {
      showToast("Failed to save user updates", "error");
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    const targetId = user._id || user.id;
    if (!targetId) return;
    if (!confirm(`Are you sure you want to permanently delete user "${user.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${targetId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== targetId));
      showToast(`User ${user.name} deleted successfully.`);
    } catch {
      showToast("Failed to delete user", "error");
    }
  };

  // ── CONSULTATION ACTIONS ──

  const handleSaveConsultationEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConsultation) return;

    try {
      const res = await fetch(`/api/admin/consultations/${editingConsultation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingConsultation),
      });

      if (!res.ok) throw new Error("Failed to update consultation");
      const data = await res.json();

      setConsultations((prev) =>
        prev.map((c) => (c.id === editingConsultation.id ? data.consultation : c))
      );
      setEditingConsultation(null);
      showToast("Consultation record updated successfully.");
    } catch {
      showToast("Failed to save consultation edits", "error");
    }
  };

  const handleDeleteConsultation = async (c: ClinicalSummary) => {
    if (!confirm(`Are you sure you want to delete consultation record for patient "${c.patient.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/consultations/${c.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete consultation");

      setConsultations((prev) => prev.filter((item) => item.id !== c.id));
      showToast("Consultation record deleted.");
    } catch {
      showToast("Failed to delete consultation", "error");
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.specialization && u.specialization.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Consultations
  const filteredConsultations = consultations.filter((c) => {
    return (
      c.patient.name.toLowerCase().includes(consultationSearch.toLowerCase()) ||
      c.consultation.doctorName.toLowerCase().includes(consultationSearch.toLowerCase()) ||
      c.chiefComplaint.toLowerCase().includes(consultationSearch.toLowerCase()) ||
      c.status.toLowerCase().includes(consultationSearch.toLowerCase())
    );
  });

  const totalPrescriptions = consultations.filter(
    (c) => c.status === "Approved & Prescribed"
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-xl text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-slate-900 text-white border border-slate-700"
              : "bg-rose-900 text-white border border-rose-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>SmartScribe Administrator Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Hospital Administration & Clinical Oversight
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80">
              Manage user accounts, toggle permissions, view full transcripts, and edit clinical consultation records.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs space-y-1 shrink-0">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MongoDB Atlas Live</span>
            </div>
            <p className="text-[11px] text-slate-300">Cluster: cluster0.sti3pxy.mongodb.net</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-purple-800/40 pt-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-white text-purple-950 shadow-md"
                : "bg-white/10 hover:bg-white/20 text-purple-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry & Health</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "users"
                ? "bg-white text-purple-950 shadow-md"
                : "bg-white/10 hover:bg-white/20 text-purple-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("consultations")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "consultations"
                ? "bg-white text-purple-950 shadow-md"
                : "bg-white/10 hover:bg-white/20 text-purple-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Manage Consultations ({consultations.length})</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: OVERVIEW & TELEMETRY ─── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">Total Consultations</span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{consultations.length}</div>
              <p className="text-[11px] text-slate-400">Captured in MongoDB Atlas</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">Authorized Prescriptions</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{totalPrescriptions}</div>
              <p className="text-[11px] text-emerald-600 font-semibold">Doctor verified and signed</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">Registered Users</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{users.length}</div>
              <p className="text-[11px] text-blue-600 font-semibold">Doctors, Patients, & Admins</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">Clinical AI Engine</span>
                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-sm font-bold text-slate-900">Groq GPT-OSS 120B</div>
              <p className="text-[11px] text-teal-600 font-semibold">100% Free • Low Latency</p>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setActiveTab("users")}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">User Access Management</h3>
                </div>
                <span className="text-xs text-purple-600 font-semibold">Manage Users →</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Activate or deactivate doctor and patient accounts, modify clinical specializations, or remove users.
              </p>
            </div>

            <div
              onClick={() => setActiveTab("consultations")}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-105 transition-transform">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">Clinical Data Oversight</h3>
                </div>
                <span className="text-xs text-teal-600 font-semibold">Inspect & Edit →</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Read complete consultation transcripts, edit clinical diagnoses or prescriptions, and delete obsolete records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: USERS MANAGEMENT (ACTIVATE / DEACTIVATE / EDIT / DELETE) ─── */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Hospital User Accounts & Access Control</span>
              </h3>
              <p className="text-xs text-slate-500">
                Activate or deactivate user accounts. Deactivated users cannot log into the system.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name or email..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none bg-white text-slate-700"
              >
                <option value="all">All Roles</option>
                <option value="doctor">Doctors</option>
                <option value="patient">Patients</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {loadingUsers ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
              <span>Loading user directory...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-700">
                  <tr>
                    <th className="px-4 py-3">User & Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Profile Details</th>
                    <th className="px-4 py-3 text-center">Account Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredUsers.map((u, idx) => {
                    const isActive = u.isActive !== false;
                    return (
                      <tr key={u._id || u.id || idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              u.role === "doctor"
                                ? "bg-teal-50 text-teal-800 border-teal-200"
                                : u.role === "patient"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "bg-purple-50 text-purple-800 border-purple-200"
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                          {u.specialization && <div>{u.specialization}</div>}
                          {u.licenseNumber && (
                            <div className="text-[11px] text-slate-400 font-mono">
                              Lic: {u.licenseNumber}
                            </div>
                          )}
                          {u.mrn && (
                            <div className="text-[11px] text-slate-400 font-mono">
                              MRN: {u.mrn}
                            </div>
                          )}
                          {u.contact && (
                            <div className="text-[11px] text-slate-400">{u.contact}</div>
                          )}
                        </td>

                        {/* Status + Quick Toggle */}
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleUserActive(u)}
                            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                              isActive
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                            }`}
                            title={isActive ? "Click to Deactivate" : "Click to Activate"}
                          >
                            {isActive ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5 text-rose-600" />
                                <span>Deactivated</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 py-3.5 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit user details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: CONSULTATIONS MANAGEMENT (READ & EDIT) ─── */}
      {activeTab === "consultations" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                <span>Hospital Consultation Records Oversight</span>
              </h3>
              <p className="text-xs text-slate-500">
                Inspect raw transcripts, AI diagnostic extractions, and edit prescription records.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={consultationSearch}
                onChange={(e) => setConsultationSearch(e.target.value)}
                placeholder="Search patient, doctor, complaint..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {loadingConsultations ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
              <span>Loading consultation data...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Date & Ref</th>
                    <th className="px-4 py-3">Chief Complaint</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredConsultations.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{c.patient.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {c.patient.age} yrs • {c.patient.gender}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{c.consultation.doctorName}</div>
                        <div className="text-[10px] text-slate-400">{c.consultation.clinicName}</div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        <div>{c.consultation.date}</div>
                        <div className="text-[10px] text-slate-400">{c.consultation.id}</div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate">
                        {c.chiefComplaint}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            c.status === "Approved & Prescribed"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : c.status === "Doctor Reviewed"
                              ? "bg-teal-50 text-teal-800 border-teal-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingConsultation(c)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View complete record & transcript"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingConsultation({ ...c })}
                          className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit clinical record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteConsultation(c)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL 1: EDIT USER ─── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Edit User Account</h4>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as "doctor" | "patient" | "admin",
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white"
                >
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {editingUser.role === "doctor" && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={editingUser.specialization || ""}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, specialization: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">License Number</label>
                    <input
                      type="text"
                      value={editingUser.licenseNumber || ""}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, licenseNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none font-mono"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editingUser.contact || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, contact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={editingUser.isActive !== false}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, isActive: e.target.checked })
                  }
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isActiveToggle" className="font-semibold text-slate-700">
                  Account is Active & Permitted to Login
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: VIEW FULL CONSULTATION RECORD & TRANSCRIPT ─── */}
      {viewingConsultation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Clinical Record: {viewingConsultation.patient.name}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Doctor: {viewingConsultation.consultation.doctorName} • Date: {viewingConsultation.consultation.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingConsultation(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-700">Chief Complaint:</span>
                <p className="text-slate-800">{viewingConsultation.chiefComplaint}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Prescribed Medications:</span>
                <div className="space-y-1">
                  {viewingConsultation.medications.map((m, idx) => (
                    <div key={idx} className="p-2.5 bg-blue-50/60 rounded-lg text-[11px] flex justify-between">
                      <span className="font-bold text-blue-900">{m.name}</span>
                      <span className="text-slate-600">{m.dosage} • {m.frequency} • {m.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {viewingConsultation.transcript && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    Full Audio Speech-to-Text Transcript:
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl max-h-48 overflow-y-auto text-[11px] text-slate-700 font-mono whitespace-pre-wrap leading-relaxed border border-slate-200">
                    {viewingConsultation.transcript}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingConsultation(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: EDIT CONSULTATION DATA ─── */}
      {editingConsultation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Edit Consultation Record</h4>
              <button
                type="button"
                onClick={() => setEditingConsultation(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConsultationEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chief Complaint</label>
                <textarea
                  rows={2}
                  value={editingConsultation.chiefComplaint}
                  onChange={(e) =>
                    setEditingConsultation({ ...editingConsultation, chiefComplaint: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Status</label>
                <select
                  value={editingConsultation.status}
                  onChange={(e) =>
                    setEditingConsultation({
                      ...editingConsultation,
                      status: e.target.value as ClinicalSummary["status"],
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white font-semibold"
                >
                  <option value="AI Draft">AI Draft</option>
                  <option value="Doctor Reviewed">Doctor Reviewed</option>
                  <option value="Approved & Prescribed">Approved & Prescribed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Follow-Up Instructions</label>
                <input
                  type="text"
                  value={editingConsultation.followUp || ""}
                  onChange={(e) =>
                    setEditingConsultation({ ...editingConsultation, followUp: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Review Notes</label>
                <textarea
                  rows={2}
                  value={editingConsultation.reviewNotes || ""}
                  onChange={(e) =>
                    setEditingConsultation({ ...editingConsultation, reviewNotes: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingConsultation(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Record Edits</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
