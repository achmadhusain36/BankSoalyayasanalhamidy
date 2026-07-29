import { ExamDocument, KopHeaderConfig, SchoolType, SignatureConfig } from "@/types/exam";
import { DEFAULT_KOP_SMA, DEFAULT_KOP_SMP, DEFAULT_SIG_SMA, DEFAULT_SIG_SMP, SAMPLE_BANK_SOAL } from "./default-data";

const BANK_SOAL_KEY = "alhamidy_bank_soal_v1";
const KOP_SETTINGS_KEY = "alhamidy_kop_settings_v1";
const SIG_SETTINGS_KEY = "alhamidy_sig_settings_v1";
const DRAFT_EXAM_KEY = "alhamidy_draft_exam_v1";

export function loadBankSoal(): ExamDocument[] {
  if (typeof window === "undefined") return SAMPLE_BANK_SOAL;
  try {
    const raw = localStorage.getItem(BANK_SOAL_KEY);
    if (!raw) {
      localStorage.setItem(BANK_SOAL_KEY, JSON.stringify(SAMPLE_BANK_SOAL));
      return SAMPLE_BANK_SOAL;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_BANK_SOAL;
  } catch (err) {
    console.error("Failed to load Bank Soal from storage:", err);
    return SAMPLE_BANK_SOAL;
  }
}

export function saveBankSoal(items: ExamDocument[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BANK_SOAL_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to save Bank Soal:", err);
  }
}

export function saveExamToBank(doc: ExamDocument): ExamDocument[] {
  const current = loadBankSoal();
  const existingIndex = current.findIndex((item) => item.id === doc.id);
  let updated: ExamDocument[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...doc, updatedAt: new Date().toISOString() };
  } else {
    updated = [
      {
        ...doc,
        id: doc.id || `exam-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...current,
    ];
  }
  saveBankSoal(updated);
  return updated;
}

export function deleteExamFromBank(id: string): ExamDocument[] {
  const current = loadBankSoal();
  const updated = current.filter((item) => item.id !== id);
  saveBankSoal(updated);
  return updated;
}

export function loadKopConfig(school: SchoolType): KopHeaderConfig {
  if (typeof window === "undefined") return school === "SMP Qur'an Al-Hamidy" ? DEFAULT_KOP_SMP : DEFAULT_KOP_SMA;
  try {
    const raw = localStorage.getItem(`${KOP_SETTINGS_KEY}_${school}`);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load Kop settings:", err);
  }
  return school === "SMP Qur'an Al-Hamidy" ? DEFAULT_KOP_SMP : DEFAULT_KOP_SMA;
}

export function saveKopConfig(school: SchoolType, config: KopHeaderConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${KOP_SETTINGS_KEY}_${school}`, JSON.stringify(config));
  } catch (err) {
    console.error("Failed to save Kop settings:", err);
  }
}

export function loadSigConfig(school: SchoolType): SignatureConfig {
  if (typeof window === "undefined") return school === "SMP Qur'an Al-Hamidy" ? DEFAULT_SIG_SMP : DEFAULT_SIG_SMA;
  try {
    const raw = localStorage.getItem(`${SIG_SETTINGS_KEY}_${school}`);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load Signature settings:", err);
  }
  return school === "SMP Qur'an Al-Hamidy" ? DEFAULT_SIG_SMP : DEFAULT_SIG_SMA;
}

export function saveSigConfig(school: SchoolType, config: SignatureConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${SIG_SETTINGS_KEY}_${school}`, JSON.stringify(config));
  } catch (err) {
    console.error("Failed to save Signature settings:", err);
  }
}

export function loadDraftExam(): ExamDocument | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_EXAM_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load draft exam:", err);
  }
  return null;
}

export function saveDraftExam(doc: ExamDocument): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_EXAM_KEY, JSON.stringify(doc));
  } catch (err) {
    console.error("Failed to save draft exam:", err);
  }
}
