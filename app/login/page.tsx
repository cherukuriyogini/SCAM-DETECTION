"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Shield,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("from");

  const [email, setEmail] = useState("doctor@smartscribe.com");
  const [password, setPassword] = useState("doctor123");
  const [selectedRole, setSelectedRole] = useState<"doctor" | "patient" | "admin">("doctor");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectRole = (role: "doctor" | "patient" | "admin") => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === "doctor") {
      setEmail("doctor@smartscribe.com");
      setPassword("doctor123");
    } else if (role === "patient") {
      setEmail("patient@smartscribe.com");
      setPassword("patient123");
    } else if (role === "admin") {
      setEmail("admin@smartscribe.com");
      setPassword("admin123");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // If user had a specific deep-link destination and role is compatible, use it; otherwise use role default
      const destination = returnTo && !returnTo.startsWith("/login") ? returnTo : data.redirectTo || "/";
      router.push(destination);
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Invalid clinical credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200/80 space-y-6">
      {/* 3-Role Quick Switcher for Demo & Evaluation */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
          Select Role for Instant Demo
        </label>
        <div className="grid grid-cols-3 gap-2">
          {/* Doctor */}
          <button
            type="button"
            onClick={() => handleSelectRole("doctor")}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
              selectedRole === "doctor"
                ? "bg-teal-50 border-teal-500 text-teal-900 shadow-sm ring-2 ring-teal-500/20 font-bold"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
            }`}
          >
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold">Doctor</span>
            <span className="text-[10px] text-teal-700/80 font-mono">doctor123</span>
          </button>

          {/* Patient */}
          <button
            type="button"
            onClick={() => handleSelectRole("patient")}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
              selectedRole === "patient"
                ? "bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-2 ring-blue-500/20 font-bold"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
            }`}
          >
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold">Patient</span>
            <span className="text-[10px] text-blue-700/80 font-mono">patient123</span>
          </button>

          {/* Admin */}
          <button
            type="button"
            onClick={() => handleSelectRole("admin")}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
              selectedRole === "admin"
                ? "bg-purple-50 border-purple-500 text-purple-900 shadow-sm ring-2 ring-purple-500/20 font-bold"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
            }`}
          >
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold">Admin</span>
            <span className="text-[10px] text-purple-700/80 font-mono">admin123</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start space-x-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-rose-950">Access Denied</span>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            Email Address
          </label>
          <div className="relative rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@smartscribe.com"
              className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-slate-400 font-mono"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            Password
          </label>
          <div className="relative rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-slate-400 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 shadow-lg shadow-teal-600/20 transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In as {selectedRole.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 space-y-3">
        <p className="text-center text-xs text-slate-500">
          New to SmartScribe?{" "}
          <Link
            href="/register"
            className="font-bold text-teal-700 hover:text-teal-900 hover:underline"
          >
            Create an Account
          </Link>
        </p>
        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Role-Based Access Control (RBAC) • HIPAA Ready</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-4 shadow-lg shadow-teal-500/10">
          <Stethoscope className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          SmartScribe
        </h1>
        <p className="mt-1 text-sm text-teal-300/80 font-medium">
          Ambient Clinical AI & Prescription Suite
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Healthcare Portal • Doctor • Patient • Administrator
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="bg-white/95 p-10 rounded-2xl text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto" />
              <p className="text-xs text-slate-500">Loading portal...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
