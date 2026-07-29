"use client";

import React, { useState, useEffect } from "react";
import { AssessmentType, ExamDocument, SchoolType } from "@/types/exam";
import { SUBJECTS_BY_SCHOOL } from "@/lib/default-data";
import { loadKopConfig, loadSigConfig } from "@/lib/storage";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Layers,
  BarChart3,
  Sliders,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Loader2,
} from "lucide-react";

interface GeneratorFormProps {
  onGenerated: (doc: ExamDocument) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LOADING_MESSAGES = [
  "Menganalisis Capaian Pembelajaran (CP) & Tujuan Pembelajaran...",
  "Menyusun matriks kisi-kisi asesmen Kurikulum Merdeka...",
  "Menulis soal HOTS & MOTS sesuai Taksonomi Bloom...",
  "Merumuskan stimulus kontekstual & studi kasus...",
  "Menyusun kunci jawaban & pembahasan lengkap...",
  "Merapikan format naskah soal & tata letak A4...",
];

export function GeneratorForm({
  onGenerated,
  isLoading,
  setIsLoading,
}: GeneratorFormProps) {
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => {
      clearInterval(interval);
      setLoadingMsgIdx(0);
    };
  }, [isLoading]);
  const [school, setSchool] = useState<SchoolType>("SMP Qur'an Al-Hamidy");
  const [grade, setGrade] = useState<string>("Kelas 7");
  const [subject, setSubject] = useState<string>("Tahfizh Al-Qur'an & Tajwid");
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("Summative");
  const [assessmentTitle, setAssessmentTitle] = useState("Sumatif Tengah Semester (STS) Ganjil");
  const [semester, setSemester] = useState<"Ganjil" | "Genap">("Ganjil");
  const [academicYear, setAcademicYear] = useState("2025/2026");

  const [capaianPembelajaran, setCapaianPembelajaran] = useState("");
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState("");
  const [topics, setTopics] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");

  const [questionCounts, setQuestionCounts] = useState({
    pilihanGanda: 5,
    pgKompleks: 2,
    menjodohkan: 2,
    isianSingkat: 2,
    uraian: 2,
  });

  const [bloomsRatio, setBloomsRatio] = useState({
    HOTS: 30,
    MOTS: 50,
    LOTS: 20,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update available subjects when school or grade changes
  const availableGrades = Object.keys(SUBJECTS_BY_SCHOOL[school].subjectsByGrade);
  const availableSubjects = SUBJECTS_BY_SCHOOL[school].subjectsByGrade[grade] || [];

  const handleSchoolChange = (newSchool: SchoolType) => {
    setSchool(newSchool);
    const newGrades = Object.keys(SUBJECTS_BY_SCHOOL[newSchool].subjectsByGrade);
    const defaultGrade = newGrades[0];
    setGrade(defaultGrade);
    const defaultSubj = SUBJECTS_BY_SCHOOL[newSchool].subjectsByGrade[defaultGrade][0];
    setSubject(defaultSubj);

    if (newSchool === "SMP Qur'an Al-Hamidy") {
      setAssessmentTitle("Sumatif Tengah Semester (STS) Ganjil");
    } else {
      setAssessmentTitle("Sumatif Akhir Semester (SAS) Ganjil");
    }
  };

  const handleGradeChange = (newGrade: string) => {
    setGrade(newGrade);
    const newSubjects = SUBJECTS_BY_SCHOOL[school].subjectsByGrade[newGrade] || [];
    setSubject(newSubjects[0] || "");
  };

  const applyPresetTemplate = (preset: "tahfizh" | "fisika" | "bahasa_arab" | "matematika") => {
    if (preset === "tahfizh") {
      setSchool("SMP Qur'an Al-Hamidy");
      setGrade("Kelas 7");
      setSubject("Tahfizh Al-Qur'an & Tajwid");
      setAssessmentType("Summative");
      setAssessmentTitle("Sumatif Tengah Semester (STS) Ganjil");
      setCapaianPembelajaran("Memahami hukum Nun Sukun/Tanwin, Mim Sukun, Mad, Makhraj Huruf, serta ayat Juz 30.");
      setTopics("Hukum Iqlab, Idgham, Izhar, Ikhfa', QS. Al-A'la & QS. Al-Ghasyiyah");
      setQuestionCounts({ pilihanGanda: 5, pgKompleks: 2, menjodohkan: 2, isianSingkat: 2, uraian: 2 });
    } else if (preset === "fisika") {
      setSchool("SMA Plus Al-Hamidy");
      setGrade("Kelas 10");
      setSubject("Fisika (Fase E)");
      setAssessmentType("Summative");
      setAssessmentTitle("Sumatif Akhir Semester (SAS) Ganjil");
      setCapaianPembelajaran("Menganalisis Usaha, Energi, Kinematika Gerak Lurus, dan Hukum Newton.");
      setTopics("Gaya Mekanis, Katrol Bergerak, Pompa Air Sumur Bor Pesantren");
      setQuestionCounts({ pilihanGanda: 5, pgKompleks: 2, menjodohkan: 2, isianSingkat: 2, uraian: 2 });
    } else if (preset === "bahasa_arab") {
      setSchool("SMP Qur'an Al-Hamidy");
      setGrade("Kelas 8");
      setSubject("Bahasa Arab");
      setAssessmentType("Formative");
      setAssessmentTitle("Asesmen Formatif Harian - Nahwu & Shorof");
      setCapaianPembelajaran("Memahami struktur Jumlah Fi'liyyah & Jumlah Ismiyyah serta perubahan Fi'il Madhi dan Mudhari'.");
      setTopics("Fi'il Madhi, Fi'il Mudhari', Fa'il, dan Maf'ul Bih dalam konteks percakapan harian.");
      setQuestionCounts({ pilihanGanda: 5, pgKompleks: 2, menjodohkan: 2, isianSingkat: 2, uraian: 2 });
    } else if (preset === "matematika") {
      setSchool("SMA Plus Al-Hamidy");
      setGrade("Kelas 11");
      setSubject("Matematika Tingkat Lanjut");
      setAssessmentType("Summative");
      setAssessmentTitle("Sumatif Akhir Tahun (SAT) Matematika");
      setCapaianPembelajaran("Menganalisis Polinomial, Fungsi Trigonometri, dan Vektor dalam menyelesaikan masalah saintifik.");
      setTopics("Operasi Polinomial, Sisa Pembagian, dan Persamaan Trigonometri");
      setQuestionCounts({ pilihanGanda: 5, pgKompleks: 2, menjodohkan: 2, isianSingkat: 2, uraian: 2 });
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation 1: Total question count must be greater than 0
    const totalQuestions =
      (questionCounts.pilihanGanda || 0) +
      (questionCounts.pgKompleks || 0) +
      (questionCounts.menjodohkan || 0) +
      (questionCounts.isianSingkat || 0) +
      (questionCounts.uraian || 0);

    if (totalQuestions <= 0) {
      setErrorMessage(
        "Kombinasi input tidak valid: Total jumlah soal harus lebih dari 0. Silakan tentukan jumlah untuk minimal salah satu jenis format soal."
      );
      return;
    }

    // Validation 2: Bloom's ratio sum must equal exactly 100%
    const totalBloom =
      (bloomsRatio.HOTS || 0) + (bloomsRatio.MOTS || 0) + (bloomsRatio.LOTS || 0);

    if (totalBloom !== 100) {
      setErrorMessage(
        `Kombinasi input tidak valid: Total persentase Taksonomi Bloom (HOTS + MOTS + LOTS) harus persis 100%. Saat ini total = ${totalBloom}%.`
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institution: school,
          grade,
          subject,
          assessmentType,
          assessmentTitle,
          semester,
          academicYear,
          capaianPembelajaran,
          tujuanPembelajaran,
          topics,
          bloomsDistribution: bloomsRatio,
          questionCounts,
          customInstruction,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal membuat soal melalui AI server.");
      }

      const data = await res.json();

      // Transform response to match full ExamDocument schema
      const doc: ExamDocument = {
        id: `exam-${Date.now()}`,
        title: assessmentTitle || `${assessmentType} ${subject} ${grade}`,
        institution: school,
        grade,
        subject,
        assessmentType,
        semester,
        academicYear,
        timeLimitMinutes: data.timeLimitMinutes || 90,
        generalInstructions: data.generalInstructions || [
          "Awali dengan membaca Basmalah dan niat ikhlas.",
          "Tuliskan nama lengkap, kelas, dan nomor absen.",
          "Periksa kelengkapan soal sebelum menjawab.",
        ],
        summaryCP: capaianPembelajaran || data.summaryCP,
        summaryTP: tujuanPembelajaran || data.summaryTP,
        questions: (data.questions || []).map((q: any, idx: number) => ({
          ...q,
          id: `q-${idx + 1}-${Date.now()}`,
          number: idx + 1,
        })),
        kisiKisiMatrix: data.kisiKisiMatrix || [],
        kopConfig: loadKopConfig(school),
        sigConfig: loadSigConfig(school),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onGenerated(doc);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses generator soal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 font-sans transition-all overflow-hidden">
      
      {/* Loading Overlay with Skeleton and Rotating Status Messages */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-16 h-16 rounded-full bg-emerald-900/90 border-2 border-amber-400 flex items-center justify-center shadow-xl mb-4">
            <Loader2 className="w-8 h-8 text-amber-300 animate-spin" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="text-sm font-extrabold text-amber-300 uppercase tracking-widest">
              AI Engine Gemini Sedang Bekerja
            </span>
          </div>

          <p className="text-base font-bold text-white max-w-md transition-all duration-300 min-h-[48px] flex items-center justify-center">
            &ldquo;{LOADING_MESSAGES[loadingMsgIdx]}&rdquo;
          </p>

          <p className="text-xs text-emerald-200/80 mt-2 font-mono">
            Proses ini memakan waktu sekitar 10-20 detik. Harap tunggu...
          </p>

          {/* Skeleton Progress Bar */}
          <div className="w-64 h-2 bg-emerald-950 rounded-full overflow-hidden border border-emerald-700/60 mt-4">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 animate-pulse rounded-full w-3/4" />
          </div>
        </div>
      )}

      {/* Form Header Dark Bento Card */}
      <div className="bento-card-dark mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800/80 text-amber-300 border border-emerald-600/60 flex items-center justify-center shadow-inner shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pill pill-amber text-[10px] font-bold uppercase tracking-wider">AI Engine v2.5</span>
              <span className="pill pill-green text-[10px] font-bold uppercase tracking-wider">Kurikulum Merdeka</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-amber-300 leading-tight">
              AI Generator Soal & Kisi-Kisi Otomatis
            </h2>
            <p className="text-xs text-emerald-100/90 font-medium">
              Penyusunan Asesmen Berbasis Capaian Pembelajaran (CP) Al-Hamidy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-[11px] font-mono bg-emerald-950/60 text-emerald-200 px-3 py-1 rounded-full border border-emerald-700/60">
            Ready to Generate
          </span>
        </div>
      </div>

      {/* Preset Quick Templates Bar */}
      <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <span className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wide flex items-center justify-between">
          <span>⚡ Templat Cepat Asesmen:</span>
          <span className="text-[10px] text-slate-400 font-normal">Klik untuk memuat data preset</span>
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPresetTemplate("tahfizh")}
            className="text-xs bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 font-semibold px-3 py-1.5 rounded-full border border-emerald-300 transition-all flex items-center gap-1 hover:scale-[1.02]"
          >
            📖 STS Tahfizh & Tajwid (SMP 7)
          </button>
          <button
            type="button"
            onClick={() => applyPresetTemplate("fisika")}
            className="text-xs bg-amber-100/80 hover:bg-amber-200 text-amber-900 font-semibold px-3 py-1.5 rounded-full border border-amber-300 transition-all flex items-center gap-1 hover:scale-[1.02]"
          >
            🔬 SAS Fisika Terapan (SMA 10)
          </button>
          <button
            type="button"
            onClick={() => applyPresetTemplate("bahasa_arab")}
            className="text-xs bg-sky-100/80 hover:bg-sky-200 text-sky-900 font-semibold px-3 py-1.5 rounded-full border border-sky-300 transition-all flex items-center gap-1 hover:scale-[1.02]"
          >
            🕌 Formatif Bahasa Arab (SMP 8)
          </button>
          <button
            type="button"
            onClick={() => applyPresetTemplate("matematika")}
            className="text-xs bg-purple-100/80 hover:bg-purple-200 text-purple-900 font-semibold px-3 py-1.5 rounded-full border border-purple-300 transition-all flex items-center gap-1 hover:scale-[1.02]"
          >
            📐 SAT Matematika Lanjut (SMA 11)
          </button>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        <fieldset disabled={isLoading} className="space-y-6">
        
        {/* Section 1: Institution & Subject Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* School Selector */}
          <div className="bento-card p-4">
            <label className="bento-header">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                1. Lembaga Pendidikan
              </span>
              <span className="pill pill-green">Al-Hamidy</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => handleSchoolChange("SMP Qur'an Al-Hamidy")}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  school === "SMP Qur'an Al-Hamidy"
                    ? "bg-emerald-800 text-amber-300 border-emerald-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                SMP Qur&apos;an Al-Hamidy
              </button>
              <button
                type="button"
                onClick={() => handleSchoolChange("SMA Plus Al-Hamidy")}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  school === "SMA Plus Al-Hamidy"
                    ? "bg-emerald-800 text-amber-300 border-emerald-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                SMA Plus Al-Hamidy
              </button>
            </div>
          </div>

          {/* Grade Selector */}
          <div className="bento-card p-4">
            <label className="bento-header">
              <span className="flex items-center gap-1">
                <Layers className="w-4 h-4 text-emerald-700" />
                2. Tingkat / Kelas
              </span>
              <span className="pill pill-amber">{grade}</span>
            </label>
            <select
              value={grade}
              onChange={(e) => handleGradeChange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none focus:bg-white"
            >
              {availableGrades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div className="bento-card p-4">
            <label className="bento-header">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                3. Mata Pelajaran
              </span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none focus:bg-white"
            >
              {availableSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Type */}
          <div className="bento-card p-4">
            <label className="bento-header">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                4. Format Asesmen
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  setAssessmentType("Formative");
                  setAssessmentTitle("Asesmen Formatif Harian / Kuis");
                }}
                className={`py-2 px-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                  assessmentType === "Formative"
                    ? "bg-amber-500 text-emerald-950 border-amber-600 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Asesmen Formatif
              </button>
              <button
                type="button"
                onClick={() => {
                  setAssessmentType("Summative");
                  setAssessmentTitle("Sumatif Tengah Semester (STS)");
                }}
                className={`py-2 px-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                  assessmentType === "Summative"
                    ? "bg-amber-500 text-emerald-950 border-amber-600 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Asesmen Sumatif
              </button>
            </div>
          </div>

        </div>

        {/* Section 2: Assessment Metadata */}
        <div className="bento-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Judul Dokumen Ujian:</label>
            <input
              type="text"
              value={assessmentTitle}
              onChange={(e) => setAssessmentTitle(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900"
              placeholder="Contoh: STS Ganjil / SAS Genap"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Semester:</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value as "Ganjil" | "Genap")}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran:</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900"
            />
          </div>
        </div>

        {/* Section 3: Capaian Pembelajaran & Topics */}
        <div className="bento-card p-4 space-y-3">
          <div className="bento-header mb-1">
            <span>Capaian Pembelajaran (CP) & Fokus Topik</span>
            <span className="pill pill-green text-[10px]">Kurikulum Merdeka Kemendikbud</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Capaian Pembelajaran (CP) / Tujuan Pembelajaran (TP):
            </label>
            <textarea
              value={capaianPembelajaran}
              onChange={(e) => setCapaianPembelajaran(e.target.value)}
              rows={2}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              placeholder="Kosongkan jika ingin AI menentukan CP otomatis sesuai standar Kurikulum Merdeka Kemendikbudristek..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Topik / Materi Spesifik & Konteks Pesantren:
            </label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              placeholder="Contoh: Hukum Iqlab, Bab Usaha & Energi, Studi kasus asrama..."
            />
          </div>
        </div>

        {/* Section 4: Question Formats Composition */}
        <div className="bento-card p-5 space-y-4">
          <div className="flex items-center justify-between bento-header mb-0 border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase">
              <Sliders className="w-4 h-4 text-emerald-700" />
              Komposisi & Format Soal (Variasi Kurikulum Merdeka)
            </h3>
            <span className="pill pill-amber font-bold">
              Total: {Object.values(questionCounts).reduce((a, b) => a + b, 0)} Soal
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <label className="block font-bold text-slate-800 text-[11px] mb-1">Pilihan Ganda</label>
              <input
                type="number"
                min={0}
                max={20}
                value={questionCounts.pilihanGanda}
                onChange={(e) =>
                  setQuestionCounts({ ...questionCounts, pilihanGanda: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-center font-extrabold text-slate-900 bg-white"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <label className="block font-bold text-slate-800 text-[11px] mb-1">PG Kompleks</label>
              <input
                type="number"
                min={0}
                max={10}
                value={questionCounts.pgKompleks}
                onChange={(e) =>
                  setQuestionCounts({ ...questionCounts, pgKompleks: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-center font-extrabold text-slate-900 bg-white"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <label className="block font-bold text-slate-800 text-[11px] mb-1">Menjodohkan</label>
              <input
                type="number"
                min={0}
                max={10}
                value={questionCounts.menjodohkan}
                onChange={(e) =>
                  setQuestionCounts({ ...questionCounts, menjodohkan: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-center font-extrabold text-slate-900 bg-white"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <label className="block font-bold text-slate-800 text-[11px] mb-1">Isian Singkat</label>
              <input
                type="number"
                min={0}
                max={10}
                value={questionCounts.isianSingkat}
                onChange={(e) =>
                  setQuestionCounts({ ...questionCounts, isianSingkat: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-center font-extrabold text-slate-900 bg-white"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center col-span-2 sm:col-span-1">
              <label className="block font-bold text-slate-800 text-[11px] mb-1">Uraian / Essay</label>
              <input
                type="number"
                min={0}
                max={10}
                value={questionCounts.uraian}
                onChange={(e) =>
                  setQuestionCounts({ ...questionCounts, uraian: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-center font-extrabold text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Bloom's Taxonomy Ratio */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Distribusi Kognitif Taksonomi Bloom (%):</span>
              <span className="text-[10px] text-slate-500">Total persentase HOTS + MOTS + LOTS harus berjumlah 100%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                <span className="font-bold text-amber-900 text-[11px]">HOTS:</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={bloomsRatio.HOTS}
                  onChange={(e) => setBloomsRatio({ ...bloomsRatio, HOTS: parseInt(e.target.value) || 0 })}
                  className="w-12 p-0.5 border border-amber-300 rounded text-center font-bold text-amber-950 bg-white"
                />
                <span className="text-amber-900 font-semibold">%</span>
              </div>

              <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                <span className="font-bold text-emerald-900 text-[11px]">MOTS:</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={bloomsRatio.MOTS}
                  onChange={(e) => setBloomsRatio({ ...bloomsRatio, MOTS: parseInt(e.target.value) || 0 })}
                  className="w-12 p-0.5 border border-emerald-300 rounded text-center font-bold text-emerald-950 bg-white"
                />
                <span className="text-emerald-900 font-semibold">%</span>
              </div>

              <div className="flex items-center gap-1 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
                <span className="font-bold text-sky-900 text-[11px]">LOTS:</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={bloomsRatio.LOTS}
                  onChange={(e) => setBloomsRatio({ ...bloomsRatio, LOTS: parseInt(e.target.value) || 0 })}
                  className="w-12 p-0.5 border border-sky-300 rounded text-center font-bold text-sky-950 bg-white"
                />
                <span className="text-sky-900 font-semibold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.01]"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
              <span>Memproses AI Generating Soal & Kisi-Kisi...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Buat Soal Otomatis Berbasis AI Gemini</span>
            </>
          )}
        </button>

        </fieldset>
      </form>
    </div>
  );
}
