import { ClinicalSummary } from "@/types/clinical";
import { SAMPLE_CASES } from "@/data/sampleConsultations";

const STORAGE_KEY = "smartscribe_consultations";
const CURRENT_ACTIVE_KEY = "smartscribe_active_consultation";

const INITIAL_CONSULTATIONS: ClinicalSummary[] = [
  {
    ...SAMPLE_CASES[0].summary,
    id: "consult-hist-001",
    status: "Approved & Prescribed",
    doctorSignatureName: "Dr. Sarah Jenkins, MD",
    approvedAt: "2026-10-01 10:25 AM",
  },
  {
    ...SAMPLE_CASES[1].summary,
    id: "consult-hist-002",
    patient: {
      ...SAMPLE_CASES[1].summary.patient,
      name: "Anita Rao",
      age: "31",
    },
    chiefComplaint: "Severe pulsating headache and photophobia",
    status: "Doctor Reviewed",
  },
  {
    ...SAMPLE_CASES[2].summary,
    id: "consult-hist-003",
    status: "AI Draft",
  },
];

export function getStoredConsultations(): ClinicalSummary[] {
  if (typeof window === "undefined") return INITIAL_CONSULTATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONSULTATIONS));
      return INITIAL_CONSULTATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read from localStorage", e);
    return INITIAL_CONSULTATIONS;
  }
}

export function saveConsultation(consultation: ClinicalSummary): void {
  if (typeof window === "undefined") return;
  try {
    const list = getStoredConsultations();
    const index = list.findIndex((c) => c.id === consultation.id);
    let updated: ClinicalSummary[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = consultation;
    } else {
      updated = [consultation, ...list];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(CURRENT_ACTIVE_KEY, JSON.stringify(consultation));
  } catch (e) {
    console.error("Failed to save consultation", e);
  }
}

export function getConsultationById(id: string): ClinicalSummary | null {
  if (typeof window === "undefined") {
    return INITIAL_CONSULTATIONS.find((c) => c.id === id) || null;
  }
  const list = getStoredConsultations();
  return list.find((c) => c.id === id) || null;
}

export function setActiveConsultation(consultation: ClinicalSummary): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CURRENT_ACTIVE_KEY, JSON.stringify(consultation));
  } catch (e) {
    console.error("Failed to set active consultation", e);
  }
}

export function getActiveConsultation(): ClinicalSummary | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_ACTIVE_KEY);
    if (raw) return JSON.parse(raw);
    const list = getStoredConsultations();
    return list[0] || null;
  } catch (e) {
    console.error("Failed to get active consultation", e);
    return null;
  }
}
