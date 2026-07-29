export type SchoolType = "SMP Qur'an Al-Hamidy" | "SMA Plus Al-Hamidy";

export type AssessmentType = "Formative" | "Summative";

export type QuestionType =
  | "pilihan_ganda"
  | "pg_kompleks"
  | "menjodohkan"
  | "isian_singkat"
  | "uraian";

export interface ComplexSubItem {
  statement: string;
  isTrue?: boolean;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  number: number;
  type: QuestionType;
  stimulus?: string;
  questionText: string;
  options?: string[]; // for PG
  complexSubItems?: ComplexSubItem[]; // for PGK
  matchingPairs?: MatchingPair[]; // for Menjodohkan
  answerKey: string;
  explanation: string;
  rubric?: string;
  bloomLevel?: string; // e.g. "C4 (HOTS)", "C2 (LOTS)"
  cpElement?: string;
  indikatorSoal?: string;
  scoreWeight?: number;
}

export interface KisiKisiItem {
  nomorSoal: number;
  cpElement: string;
  materi: string;
  indikatorSoal: string;
  bentukSoal: string;
  levelKognitif: string;
}

export interface KopHeaderConfig {
  yayasanName: string;
  institutionName: SchoolType;
  akreditasi: string;
  npsnNss: string;
  address: string;
  phoneEmail: string;
  website: string;
  logoLeftUrl?: string;
  logoRightUrl?: string;
  useCustomFullKop?: boolean;
  customFullKopUrl?: string;
  headerLineStyle: "double" | "single" | "gold";
}

export interface SignatureConfig {
  locationDate: string; // e.g., "Pamekasan, 15 Oktober 2025"
  principalTitle: string; // "Kepala SMP Qur'an Al-Hamidy" | "Kepala SMA Plus Al-Hamidy"
  principalName: string;
  principalNip: string;
  principalSignatureUrl?: string; // data URL or image link
  teacherTitle: string; // "Guru Pengampu Mata Pelajaran"
  teacherName: string;
  teacherNip: string;
  teacherSignatureUrl?: string;
  showSchoolStamp: boolean;
  stampText: string; // e.g., "YAYASAN AL-HAMIDY * STEMPEL RESMI *"
  qrCodeVerification: boolean;
  verificationCode: string;
}

export interface ExamDocument {
  id: string;
  title: string;
  institution: SchoolType;
  grade: string;
  subject: string;
  assessmentType: AssessmentType;
  semester: "Ganjil" | "Genap";
  academicYear: string;
  timeLimitMinutes: number;
  generalInstructions: string[];
  summaryCP?: string;
  summaryTP?: string;
  questions: Question[];
  kisiKisiMatrix?: KisiKisiItem[];
  kopConfig: KopHeaderConfig;
  sigConfig: SignatureConfig;
  createdAt: string;
  updatedAt: string;
}

export interface BankSoalFilter {
  institution?: string;
  grade?: string;
  subject?: string;
  assessmentType?: string;
  searchTerm?: string;
}
