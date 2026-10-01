import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SmartScribe — Ambient Clinical AI & Prescription Generator",
  description:
    "Listen. Understand. Structure. Prescribe. SmartScribe transforms doctor-patient conversations into structured summaries and editable prescriptions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <footer className="no-print bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-700">SmartScribe</span> — Ambient Clinical Intelligence.
              <span className="ml-2 text-slate-400">Doctor in the loop at all times.</span>
            </div>
            <div className="text-slate-400">
              PS-010 Medical AI Hackathon MVP • Built with Next.js & Tailwind CSS
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
