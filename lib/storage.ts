import { ClinicalSummary } from "@/types/clinical";

const STORAGE_KEY = "smartscribe_consultations";
const CURRENT_ACTIVE_KEY = "smartscribe_active_consultation";

export function getStoredConsultations(): ClinicalSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read consultations from localStorage", e);
    return [];
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

    fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consultation),
    }).catch((err) => console.warn("Sync notice:", err));
  } catch (e) {
    console.error("Failed to save consultation to localStorage", e);
  }
}

export async function saveConsultationAsync(consultation: ClinicalSummary): Promise<void> {
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

    await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consultation),
    });
  } catch (e) {
    console.error("Failed to save consultation", e);
  }
}

export async function fetchConsultationsFromDb(): Promise<ClinicalSummary[]> {
  try {
    const res = await fetch("/api/consultations");
    if (!res.ok) return getStoredConsultations();
    const data = await res.json();
    if (data.consultations && Array.isArray(data.consultations)) {
      // Merge with localStorage
      const local = getStoredConsultations();
      const map = new Map<string, ClinicalSummary>();
      local.forEach((c) => map.set(c.id, c));
      data.consultations.forEach((c: ClinicalSummary) => map.set(c.id, c));
      const combined = Array.from(map.values());
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
      }
      return combined;
    }
    return getStoredConsultations();
  } catch {
    return getStoredConsultations();
  }
}

export async function fetchConsultationById(
  id: string
): Promise<ClinicalSummary | null> {
  // First check local
  const local = getConsultationById(id);
  try {
    const res = await fetch(`/api/consultations/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.consultation) {
        saveConsultation(data.consultation);
        return data.consultation;
      }
    }
  } catch {
    // fallback to local
  }
  return local;
}

export function getConsultationById(id: string): ClinicalSummary | null {
  if (typeof window === "undefined") return null;
  const list = getStoredConsultations();
  return list.find((c) => c.id === id) || null;
}

export function setActiveConsultation(consultation: ClinicalSummary): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CURRENT_ACTIVE_KEY, JSON.stringify(consultation));
  } catch (e) {
    console.error("Failed to set active consultation in localStorage", e);
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
    console.error("Failed to get active consultation from localStorage", e);
    return null;
  }
}
