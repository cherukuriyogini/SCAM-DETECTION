import React from 'react';
import { Briefcase, TrendingUp, KeyRound, UserCheck, Sparkles, ArrowUpRight } from 'lucide-react';

export const DEMO_SAMPLES = [
  {
    id: 'fake_job',
    title: 'Fake Job Offer',
    badge: 'Job Fraud',
    icon: Briefcase,
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
    type: 'message',
    text: 'Congratulations! You have been selected for a remote data entry position with a salary of ₹45,000/month. To activate your employee account, pay a refundable registration fee of ₹999 immediately. Send your Aadhaar, PAN and bank details to complete verification.',
    url: '',
    description: 'Guaranteed salary + upfront registration fee + identity harvesting'
  },
  {
    id: 'investment',
    title: 'Investment Scam',
    badge: 'Crypto / Ponzi',
    icon: TrendingUp,
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    type: 'message',
    text: 'Exclusive VIP Crypto Signal Group! Invest ₹5,000 today and get guaranteed returns of ₹25,000 in 24 hours. 100% risk free daily profit. Limited slots filling fast, send money via UPI to instant-crypto@upi to lock your VIP spot today only.',
    url: '',
    description: 'Guaranteed 5x returns + fake urgency + advance UPI transfer'
  },
  {
    id: 'phishing',
    title: 'Phishing Message',
    badge: 'Account Takeover',
    icon: KeyRound,
    color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
    type: 'message',
    text: 'Dear Customer, your State Bank account will be suspended today due to pending KYC verification. Click http://sbi-netbanking-verify.xyz/login to update your PAN and Aadhaar immediately or your card will be deactivated within 2 hours.',
    url: 'http://sbi-netbanking-verify.xyz/login',
    description: 'Panic inducement + account suspension + malicious login domain'
  },
  {
    id: 'impersonation',
    title: 'Police Impersonation',
    badge: 'Digital Arrest / Authority',
    icon: UserCheck,
    color: 'from-purple-500/20 to-fuchsia-500/20 text-purple-400 border-purple-500/30',
    type: 'message',
    text: 'This is Inspector Sharma from Cyber Crime Investigation Department. A courier parcel in your name containing illegal contraband and foreign passports was seized at Delhi customs. Pay ₹15,000 clearance penalty immediately to avoid arrest warrant and court summons.',
    url: '',
    description: 'Fake law enforcement + illegal parcel extortion + arrest threat'
  }
];

export default function DemoPresets({ onSelectDemo }) {
  return (
    <div id="demo-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Evaluation</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Try a Live Scam Demo</h2>
          <p className="text-sm text-slate-400">Click any realistic scenario below to immediately populate the analyzer.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_SAMPLES.map((demo) => {
          const Icon = demo.icon;
          return (
            <button
              key={demo.id}
              onClick={() => onSelectDemo(demo)}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all text-left group hover:-translate-y-1 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${demo.color} border flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {demo.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors mb-1.5 flex items-center justify-between">
                  <span>{demo.title}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {demo.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-300">
                <span className="italic truncate pr-2 text-[11px]">"{demo.text.substring(0, 32)}..."</span>
                <span className="text-blue-400 font-medium shrink-0">Load &rarr;</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
