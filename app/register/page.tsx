"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Stethoscope,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  User,
  Phone,
  FileText,
  BadgeCheck,
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();

  const [role, setRole] = useState<"doctor" | "patient">("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          specialization: role === "doctor" ? specialization : undefined,
          licenseNumber: role === "doctor" ? licenseNumber : undefined,
          contact,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      // Success → auto-login, navigate to dashboard
      router.push(data.redirectTo || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200/80 space-y-5">
      {/* Role Selector */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
          I am registering as a...
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center space-y-1 ${
              role === "patient"
                ? "bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
            }`}
          >
            <User className={`w-5 h-5 ${role === "patient" ? "text-blue-600" : "text-slate-400"}`} />
            <span className="text-xs font-bold">Patient</span>
            <span className="text-[10px] text-slate-500">View prescriptions & care plans</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center space-y-1 ${
              role === "doctor"
                ? "bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-500/20 shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
            }`}
          >
            <Stethoscope className={`w-5 h-5 ${role === "doctor" ? "text-teal-600" : "text-slate-400"}`} />
            <span className="text-xs font-bold">Physician</span>
            <span className="text-[10px] text-slate-500">Upload & analyze consultations</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start space-x-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-950 block">Registration Error</span>
            <p className="leading-relaxed mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            {role === "doctor" ? "Physician Full Name" : "Full Name"}
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === "doctor" ? "Dr. Jane Smith" : "Rahul Sharma"}
              className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Contact (optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Phone / Contact <span className="text-slate-400 font-normal normal-case">(optional)</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+91 98765 43210"
              className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Doctor-specific Fields */}
        {role === "doctor" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Medical Specialization
              </label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. General Physician, Cardiologist"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Medical License Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <BadgeCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required={role === "doctor"}
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. MED-LIC-12345"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-slate-400"
                />
              </div>
            </div>
          </>
        )}

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={`block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 bg-white placeholder-slate-400 ${
                confirmPassword && confirmPassword !== password
                  ? "border-rose-400 focus:ring-rose-400/20 focus:border-rose-500"
                  : "border-slate-300 focus:ring-teal-500/20 focus:border-teal-600"
              }`}
            />
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p className="mt-1 text-[11px] text-rose-600 font-medium">Passwords do not match.</p>
          )}
        </div>

        {/* HIPAA Consent note */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
          <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            By registering, you acknowledge that your clinical data is stored securely in MongoDB Atlas and access is restricted to authorized healthcare providers.
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 shadow-lg shadow-teal-600/20 transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create {role === "doctor" ? "Physician" : "Patient"} Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-3 border-t border-slate-100 text-center space-y-2">
        <p className="text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-teal-700 hover:text-teal-900 hover:underline">
            Sign In Here
          </Link>
        </p>
        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>HIPAA Compliant • Role-Based Access • MongoDB Secured</span>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-4 shadow-lg shadow-teal-500/10">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Create an Account
        </h1>
        <p className="mt-1 text-sm text-teal-300/80 font-medium">
          SmartScribe Healthcare Portal
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Register as a Physician or Patient
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="bg-white/95 p-10 rounded-2xl text-center">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
