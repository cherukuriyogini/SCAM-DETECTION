"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Stethoscope,
  Sparkles,
  PlusCircle,
  History,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { AuthUser } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (pathname === "/login") return;

    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  if (pathname === "/login") {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network errors
    }
    // Force full page reload to clear all client-side state + cookie
    window.location.replace("/login");
  };

  const role = user?.role || "doctor";

  // Build role-specific navigation links
  let navLinks: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [];

  if (role === "patient") {
    navLinks = [
      { href: "/patient/dashboard", label: "My Prescriptions", icon: LayoutDashboard },
    ];
  } else if (role === "admin") {
    navLinks = [
      { href: "/admin/dashboard", label: "System Admin", icon: Shield },
      { href: "/", label: "Doctor Suite", icon: LayoutDashboard },
      { href: "/history", label: "Consultation Audit", icon: History },
    ];
  } else {
    // Doctor
    navLinks = [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/consultation/new", label: "New Consultation", icon: PlusCircle },
      { href: "/history", label: "History", icon: History },
    ];
  }

  const initials = user?.name
    ? user.name
        .replace(/Dr\.\s*/i, "")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SJ";

  const getRoleBadge = () => {
    if (role === "patient") {
      return (
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-800 font-semibold">
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>Patient Portal</span>
        </div>
      );
    }
    if (role === "admin") {
      return (
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs text-purple-800 font-semibold">
          <Shield className="w-3.5 h-3.5 text-purple-600" />
          <span>System Admin</span>
        </div>
      );
    }
    return (
      <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs text-teal-800 font-semibold">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
        <span>Doctor In Control</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href={role === "patient" ? "/patient/dashboard" : role === "admin" ? "/admin/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  SmartScribe
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-teal-500" />
                  Clinical AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Ambient Clinical Intelligence
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-50 text-teal-800 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-teal-600" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Pill & Logout */}
          <div className="flex items-center space-x-3">
            {getRoleBadge()}

            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
              <div
                className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-xs shadow-inner ${
                  role === "patient"
                    ? "bg-blue-600"
                    : role === "admin"
                    ? "bg-purple-700"
                    : "bg-slate-800"
                }`}
              >
                {initials}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {user?.name || "Dr. Sarah Jenkins"}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {user?.specialization || (role === "patient" ? "Patient" : role === "admin" ? "Superuser" : "Internal Medicine")}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
