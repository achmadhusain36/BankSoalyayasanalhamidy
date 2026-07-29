"use client";

import React, { useState, useCallback } from "react";
import { ExamDocument, Question } from "@/types/exam";
import { KopSurat } from "./kop-surat";
import { SignatureFooter } from "./signature-footer";
import { exportToDocx } from "@/lib/export-docx";
import {
  Printer,
  FileText,
  Key,
  Grid,
  Edit2,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  MoveUp,
  MoveDown,
  Sparkles,
  Info,
  Shuffle,
  FileCheck,
  Download,
  Undo2,
  Redo2,
} from "lucide-react";

interface A4DocumentPreviewProps {
  exam: ExamDocument;
  onUpdateExam: (updated: ExamDocument) => void;
  onSaveToBank: (doc: ExamDocument) => void;
}

// Helper functions for anti-cheating Paket B randomization
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function cleanOptionText(opt: string): string {
  return opt.replace(/^[A-E]\.\s*/i, "").trim();
}

function createRandomizedExam(sourceExam: ExamDocument): ExamDocument {
  const types: Question["type"][] = [
    "pilihan_ganda",
    "pg_kompleks",
    "menjodohkan",
    "isian_singkat",
    "uraian",
  ];
  let randomizedQuestions: Question[] = [];

  types.forEach((type) => {
    const group = sourceExam.questions.filter((q) => q.type === type);
    if (group.length === 0) return;

    // Shuffle questions within this type group
    const shuffledGroup = shuffleArray(group);

    // Shuffle options for pilihan_ganda and adjust answerKey
    const processedGroup = shuffledGroup.map((q) => {
      if (q.type === "pilihan_ganda" && q.options && q.options.length > 0) {
        const rawAnswerText = cleanOptionText(q.answerKey || "");
        const rawOptions = q.options.map(cleanOptionText);

        const shuffledRawOptions = shuffleArray(rawOptions);
        const newOptions = shuffledRawOptions.map(
          (text, idx) => `${String.fromCharCode(65 + idx)}. ${text}`
        );

        let newAnswerKey = q.answerKey;
        const correctIndex = shuffledRawOptions.findIndex(
          (text) => text.toLowerCase() === rawAnswerText.toLowerCase()
        );
        if (correctIndex !== -1) {
          newAnswerKey = newOptions[correctIndex];
        }

        return {
          ...q,
          options: newOptions,
          answerKey: newAnswerKey,
        };
      }
      return { ...q };
    });

    randomizedQuestions.push(...processedGroup);
  });

  // Renumber 1..N
  const renumbered = randomizedQuestions.map((q, idx) => ({
    ...q,
    number: idx + 1,
  }));

  return {
    ...sourceExam,
    id: `${sourceExam.id}-paketB`,
    questions: renumbered,
  };
}

export function A4DocumentPreview({
  exam,
  onUpdateExam,
  onSaveToBank,
}: A4DocumentPreviewProps) {
  const [viewMode, setViewMode] = useState<"soal" | "kunci" | "kisi-kisi" | "ljk">("soal");
  const [paketVersion, setPaketVersion] = useState<"A" | "B">("A");
  const [paketBExam, setPaketBExam] = useState<ExamDocument | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isSavedNotification, setIsSavedNotification] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);

  // Active exam selection depending on selected Paket A or Paket B
  const currentExam = paketVersion === "B" && paketBExam ? paketBExam : exam;

  // Undo / Redo history stack state (max 10 snapshots)
  const [history, setHistory] = useState<ExamDocument[]>([currentExam]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const pushSnapshot = (snapshot: ExamDocument) => {
    setHistory((prev) => {
      const newHist = prev.slice(0, historyIndex + 1);
      if (newHist.length >= 10) {
        newHist.shift();
      }
      return [...newHist, snapshot];
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 9));
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const prevDoc = history[prevIdx];
      setHistoryIndex(prevIdx);
      if (paketVersion === "B") {
        setPaketBExam(prevDoc);
      } else {
        onUpdateExam(prevDoc);
      }
    }
  }, [historyIndex, history, paketVersion, onUpdateExam]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextDoc = history[nextIdx];
      setHistoryIndex(nextIdx);
      if (paketVersion === "B") {
        setPaketBExam(nextDoc);
      } else {
        onUpdateExam(nextDoc);
      }
    }
  }, [historyIndex, history, paketVersion, onUpdateExam]);

  // Keyboard shortcuts (Ctrl+Z for Undo, Ctrl+Y or Ctrl+Shift+Z for Redo)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handlePrint = async () => {
    if (currentExam.kopConfig?.useCustomFullKop && currentExam.kopConfig?.customFullKopUrl) {
      try {
        const img = new Image();
        img.src = currentExam.kopConfig.customFullKopUrl;
        if (typeof img.decode === "function") {
          await img.decode();
        } else {
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }
      } catch (err) {
        console.warn("Pre-decoding custom kop image error:", err);
      }
    }
    window.print();
  };

  const handleSave = () => {
    onSaveToBank(currentExam);
    setIsSavedNotification(true);
    setTimeout(() => setIsSavedNotification(false), 3000);
  };

  const handleExportWord = async () => {
    try {
      setIsExportingWord(true);
      await exportToDocx(currentExam, `PAKET ${paketVersion}`);
    } catch (err) {
      console.error("Gagal mengunduh file Word:", err);
      alert("Terjadi kesalahan saat mengekspor file Word (.docx).");
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleGeneratePaketB = () => {
    pushSnapshot(currentExam);
    const newPaketB = createRandomizedExam(exam);
    setPaketBExam(newPaketB);
    setPaketVersion("B");
  };

  const handleDeleteQuestion = (qId: string) => {
    pushSnapshot(currentExam);
    const updated = currentExam.questions.filter((q) => q.id !== qId);
    const renumbered = updated.map((q, idx) => ({ ...q, number: idx + 1 }));
    if (paketVersion === "B" && paketBExam) {
      setPaketBExam({ ...paketBExam, questions: renumbered });
    } else {
      onUpdateExam({ ...exam, questions: renumbered });
    }
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    const questions = [...currentExam.questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    pushSnapshot(currentExam);
    const temp = questions[index];
    questions[index] = questions[targetIndex];
    questions[targetIndex] = temp;

    const renumbered = questions.map((q, idx) => ({ ...q, number: idx + 1 }));
    if (paketVersion === "B" && paketBExam) {
      setPaketBExam({ ...paketBExam, questions: renumbered });
    } else {
      onUpdateExam({ ...exam, questions: renumbered });
    }
  };

  const handleAddQuestion = () => {
    pushSnapshot(currentExam);
    const newQ: Question = {
      id: `q-custom-${Date.now()}`,
      number: currentExam.questions.length + 1,
      type: "pilihan_ganda",
      questionText: "Ketik teks soal baru di sini...",
      options: ["A. Pilihan 1", "B. Pilihan 2", "C. Pilihan 3", "D. Pilihan 4"],
      answerKey: "A. Pilihan 1",
      explanation: "Ketik pembahasan soal di sini.",
      bloomLevel: "C2 (MOTS)",
      cpElement: "Umum",
      indikatorSoal: "Soal buatan guru",
      scoreWeight: 2,
    };
    if (paketVersion === "B" && paketBExam) {
      setPaketBExam({ ...paketBExam, questions: [...paketBExam.questions, newQ] });
    } else {
      onUpdateExam({ ...exam, questions: [...exam.questions, newQ] });
    }
    setEditingQuestionId(newQ.id);
  };

  const handleUpdateQuestion = (qId: string, updatedQ: Partial<Question>) => {
    pushSnapshot(currentExam);
    const updatedQuestions = currentExam.questions.map((q) =>
      q.id === qId ? { ...q, ...updatedQ } : q
    );
    if (paketVersion === "B" && paketBExam) {
      setPaketBExam({ ...paketBExam, questions: updatedQuestions });
    } else {
      onUpdateExam({ ...exam, questions: updatedQuestions });
    }
  };

  // Group questions by type for clean organized paper presentation
  const pgQuestions = currentExam.questions.filter((q) => q.type === "pilihan_ganda");
  const pgkQuestions = currentExam.questions.filter((q) => q.type === "pg_kompleks");
  const matchQuestions = currentExam.questions.filter((q) => q.type === "menjodohkan");
  const isianQuestions = currentExam.questions.filter((q) => q.type === "isian_singkat");
  const uraianQuestions = currentExam.questions.filter((q) => q.type === "uraian");

  return (
    <div className="w-full flex flex-col items-center">
      {/* Control Bento Bar - Hidden during printing */}
      <div className="w-full max-w-5xl bento-card-dark p-4 rounded-[20px] shadow-md mb-6 print:hidden flex flex-wrap items-center justify-between gap-3 border border-emerald-800">
        
        {/* View Mode Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-emerald-950/80 p-1.5 rounded-2xl border border-emerald-800">
          <button
            onClick={() => setViewMode("soal")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
              viewMode === "soal"
                ? "bg-amber-400 text-emerald-950 shadow-xs scale-[1.02]"
                : "text-emerald-100 hover:text-white hover:bg-emerald-900/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Lembar Soal
          </button>
          <button
            onClick={() => setViewMode("ljk")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
              viewMode === "ljk"
                ? "bg-amber-400 text-emerald-950 shadow-xs scale-[1.02]"
                : "text-emerald-100 hover:text-white hover:bg-emerald-900/60"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Lembar Jawaban (LJK)
          </button>
          <button
            onClick={() => setViewMode("kunci")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
              viewMode === "kunci"
                ? "bg-amber-400 text-emerald-950 shadow-xs scale-[1.02]"
                : "text-emerald-100 hover:text-white hover:bg-emerald-900/60"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Kunci & Pembahasan
          </button>
          <button
            onClick={() => setViewMode("kisi-kisi")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
              viewMode === "kisi-kisi"
                ? "bg-amber-400 text-emerald-950 shadow-xs scale-[1.02]"
                : "text-emerald-100 hover:text-white hover:bg-emerald-900/60"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Kisi-Kisi
          </button>
        </div>

        {/* Paket Soal A/B Switcher & Generator */}
        <div className="flex items-center gap-1.5 bg-emerald-950/80 p-1.5 rounded-2xl border border-emerald-800">
          <button
            onClick={() => setPaketVersion("A")}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-full transition-all ${
              paketVersion === "A"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-200 hover:bg-emerald-900/60"
            }`}
          >
            Paket A (Asli)
          </button>

          {paketBExam ? (
            <button
              onClick={() => setPaketVersion("B")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-full transition-all ${
                paketVersion === "B"
                  ? "bg-amber-400 text-emerald-950 shadow-xs"
                  : "text-emerald-200 hover:bg-emerald-900/60"
              }`}
            >
              Paket B (Acak)
            </button>
          ) : (
            <button
              onClick={handleGeneratePaketB}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-extrabold rounded-full transition-all shadow-xs"
              title="Kocok urutan soal & opsi pilihan ganda untuk versi B anti-nyontek"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Buat Paket Acak (B)
            </button>
          )}

          {paketBExam && (
            <button
              onClick={handleGeneratePaketB}
              className="p-1.5 text-amber-300 hover:text-white hover:bg-emerald-900/80 rounded-full transition-all"
              title="Acak ulang Paket B"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Undo / Redo buttons */}
          <div className="flex items-center gap-1 bg-emerald-950/80 p-1 rounded-full border border-emerald-800">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 text-emerald-100 hover:text-amber-300 disabled:opacity-30 disabled:hover:text-emerald-100 transition rounded-full"
              title="Urungkan perubahan (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 text-emerald-100 hover:text-amber-300 disabled:opacity-30 disabled:hover:text-emerald-100 transition rounded-full"
              title="Ulangi perubahan (Ctrl+Y / Ctrl+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 text-xs font-bold px-3 py-2 rounded-full border border-emerald-700/80 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            Tambah
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-amber-300 text-xs font-bold px-3.5 py-2 rounded-full shadow-xs transition-all hover:scale-[1.02]"
          >
            <Save className="w-3.5 h-3.5" />
            {isSavedNotification ? "Tersimpan!" : "Simpan Ke Bank"}
          </button>
          <button
            onClick={handleExportWord}
            disabled={isExportingWord}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-xs transition-all hover:scale-[1.02] disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5 text-sky-200" />
            {isExportingWord ? "Mengolah..." : "Unduh Word (.docx)"}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-extrabold px-4 py-2 rounded-full shadow-md transition-all hover:scale-[1.02]"
          >
            <Printer className="w-4 h-4" />
            Cetak PDF
          </button>
        </div>
      </div>

      {/* Auto Kop, Font Times New Roman & Signature Callout */}
      <div className="w-full max-w-5xl bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl p-4 mb-6 flex items-start gap-3 text-xs print:hidden shadow-2xs">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="pill pill-green text-[10px] font-bold">Font Times New Roman Active</span>
            <span className="pill pill-amber text-[10px] font-bold">Perataan Rata Kanan-Kiri (Justify)</span>
            <span className="pill bg-emerald-800 text-amber-300 text-[10px] font-bold">Versi Aktif: PAKET {paketVersion}</span>
          </div>
          <span className="font-extrabold text-emerald-950 uppercase tracking-wide">Format Standar Dokumen Resmi: </span>
          Naskah disajikan dalam font <strong className="text-emerald-900">Times New Roman</strong> dengan perataan teks <strong className="text-emerald-900">Justify (Rata Kanan-Kiri)</strong>, Kop Surat resmi <strong className="text-emerald-900">{currentExam.institution}</strong>, TTD Digital, serta dukungan ekspor Word (.docx) & Lembar Jawaban (LJK) terpisah.
        </div>
      </div>

      {/* A4 Paper Canvas */}
      <div className="w-full max-w-4xl bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 print:p-0 print:shadow-none print:w-full print:max-w-none print:rounded-none font-times text-xs leading-relaxed border border-slate-200 print:border-none">
        
        {/* MODE 1 & 2: LEMBAR SOAL ATAU KUNCI JAWABAN */}
        {viewMode !== "kisi-kisi" && viewMode !== "ljk" && (
          <>
            {/* Kop Surat Header */}
            <KopSurat config={currentExam.kopConfig} />

            {/* Document Title Header */}
            <div className="text-center my-3 font-times">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className={`text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-md border ${
                  paketVersion === "A"
                    ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                    : "bg-amber-100 text-amber-950 border-amber-300"
                }`}>
                  PAKET SOAL {paketVersion}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
                {currentExam.title}
              </h2>
              {viewMode === "kunci" && (
                <p className="text-xs font-bold text-emerald-800 tracking-widest uppercase bg-emerald-100/80 inline-block px-3 py-0.5 rounded-full mt-1 border border-emerald-300">
                  *** KUNCI JAWABAN & PEMBAHASAN GURU (PAKET {paketVersion}) ***
                </p>
              )}
            </div>

            {/* Exam Metadata Grid Box */}
            <div className="w-full border border-slate-900 rounded-xs p-2.5 my-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50/50 print:bg-transparent print:border-slate-800">
              <div>
                <span className="font-semibold text-slate-600">Mata Pelajaran:</span>{" "}
                <strong className="text-slate-900 block sm:inline">{currentExam.subject}</strong>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Kelas / Sem:</span>{" "}
                <strong className="text-slate-900 block sm:inline">
                  {currentExam.grade} ({currentExam.semester})
                </strong>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Tahun Ajaran:</span>{" "}
                <strong className="text-slate-900 block sm:inline">{currentExam.academicYear}</strong>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Alokasi Waktu:</span>{" "}
                <strong className="text-slate-900 block sm:inline">{currentExam.timeLimitMinutes} Menit</strong>
              </div>

              {/* Student Answer Metadata fields */}
              {viewMode === "soal" && (
                <div className="col-span-2 sm:col-span-4 border-t border-slate-300 pt-2 mt-1 grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-500">Nama Siswa:</span>{" "}
                    <span className="border-b border-dotted border-slate-800 inline-block w-32"></span>
                  </div>
                  <div>
                    <span className="text-slate-500">No. Absen/NIS:</span>{" "}
                    <span className="border-b border-dotted border-slate-800 inline-block w-20"></span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-bold">NILAI / SKOR:</span>{" "}
                    <span className="inline-block border border-slate-800 w-12 h-6 text-center align-middle"></span>
                  </div>
                </div>
              )}
            </div>

            {/* General Instructions Box */}
            {viewMode === "soal" && (
              <div className="w-full my-3 p-2.5 bg-slate-100/70 border-l-2 border-slate-800 text-[10.5px] print:bg-slate-50">
                <p className="font-bold text-slate-900 uppercase text-[10px] mb-1">
                  PETUNJUK UMUM PENGERJAAN:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-800 text-justify-document leading-relaxed">
                  {currentExam.generalInstructions.map((inst, idx) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Questions Container */}
            <div className="mt-5 space-y-6">
              
              {/* BAGIAN A: PILIHAN GANDA */}
              {pgQuestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-1">
                    I. PILIHAN GANDA
                  </h3>
                  <p className="text-[10px] italic text-slate-600 mb-2">
                    Pilihlah salah satu jawaban yang paling tepat dengan memberikan tanda silang (X) pada huruf A, B, C, D, atau E!
                  </p>

                  <div className="space-y-4">
                    {pgQuestions.map((q, idx) => (
                      <QuestionItemCard
                        key={q.id}
                        q={q}
                        viewMode={viewMode}
                        editingQuestionId={editingQuestionId}
                        setEditingQuestionId={setEditingQuestionId}
                        onUpdateQuestion={handleUpdateQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                        onMoveQuestion={handleMoveQuestion}
                        globalIndex={currentExam.questions.findIndex((item) => item.id === q.id)}
                        totalQuestions={currentExam.questions.length}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* BAGIAN B: PILIHAN GANDA KOMPLEKS */}
              {pgkQuestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-1">
                    II. PILIHAN GANDA KOMPLEKS
                  </h3>
                  <p className="text-[10px] italic text-slate-600 mb-2">
                    Berilah tanda centang (✓) pada setiap pernyataan yang menurut Anda BENAR!
                  </p>

                  <div className="space-y-4">
                    {pgkQuestions.map((q) => (
                      <QuestionItemCard
                        key={q.id}
                        q={q}
                        viewMode={viewMode}
                        editingQuestionId={editingQuestionId}
                        setEditingQuestionId={setEditingQuestionId}
                        onUpdateQuestion={handleUpdateQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                        onMoveQuestion={handleMoveQuestion}
                        globalIndex={currentExam.questions.findIndex((item) => item.id === q.id)}
                        totalQuestions={currentExam.questions.length}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* BAGIAN C: MENJODOHKAN */}
              {matchQuestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-1">
                    III. MENJODOHKAN
                  </h3>
                  <p className="text-[10px] italic text-slate-600 mb-2">
                    Jodohkanlah pernyataan di Kolom A dengan pilihan pasangan yang tepat di Kolom B!
                  </p>

                  <div className="space-y-4">
                    {matchQuestions.map((q) => (
                      <QuestionItemCard
                        key={q.id}
                        q={q}
                        viewMode={viewMode}
                        editingQuestionId={editingQuestionId}
                        setEditingQuestionId={setEditingQuestionId}
                        onUpdateQuestion={handleUpdateQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                        onMoveQuestion={handleMoveQuestion}
                        globalIndex={currentExam.questions.findIndex((item) => item.id === q.id)}
                        totalQuestions={currentExam.questions.length}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* BAGIAN D: ISIAN SINGKAT */}
              {isianQuestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-1">
                    IV. ISIAN SINGKAT
                  </h3>
                  <p className="text-[10px] italic text-slate-600 mb-2">
                    Isilah titik-titik di bawah ini dengan jawaban yang singkat, tepat, dan benar!
                  </p>

                  <div className="space-y-4">
                    {isianQuestions.map((q) => (
                      <QuestionItemCard
                        key={q.id}
                        q={q}
                        viewMode={viewMode}
                        editingQuestionId={editingQuestionId}
                        setEditingQuestionId={setEditingQuestionId}
                        onUpdateQuestion={handleUpdateQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                        onMoveQuestion={handleMoveQuestion}
                        globalIndex={currentExam.questions.findIndex((item) => item.id === q.id)}
                        totalQuestions={currentExam.questions.length}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* BAGIAN E: URAIAN / ESSAY */}
              {uraianQuestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-1">
                    V. URAIAN / ESSAY
                  </h3>
                  <p className="text-[10px] italic text-slate-600 mb-2">
                    Jawablah pertanyaan-pertanyaan berikut dengan jelas, lengkap, dan logis!
                  </p>

                  <div className="space-y-4">
                    {uraianQuestions.map((q) => (
                      <QuestionItemCard
                        key={q.id}
                        q={q}
                        viewMode={viewMode}
                        editingQuestionId={editingQuestionId}
                        setEditingQuestionId={setEditingQuestionId}
                        onUpdateQuestion={handleUpdateQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                        onMoveQuestion={handleMoveQuestion}
                        globalIndex={currentExam.questions.findIndex((item) => item.id === q.id)}
                        totalQuestions={currentExam.questions.length}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Signature Footer */}
            <SignatureFooter config={currentExam.sigConfig} />
          </>
        )}

        {/* MODE: LEMBAR JAWABAN KOMPUTER (LJK) */}
        {viewMode === "ljk" && (
          <div className="space-y-4 font-times">
            <KopSurat config={currentExam.kopConfig} />

            {/* LJK Document Header */}
            <div className="text-center my-3 border-b-2 border-slate-900 pb-2">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900">
                LEMBAR JAWABAN KOMPUTER / ASESMEN (LJK)
              </h2>
              <div className="flex items-center justify-center gap-3 mt-1 text-xs">
                <span className="font-bold text-emerald-900 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300">
                  {currentExam.title}
                </span>
                <span className="font-extrabold text-amber-900 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-300">
                  PAKET {paketVersion}
                </span>
              </div>
            </div>

            {/* Student Identity Form Box */}
            <div className="border-2 border-slate-900 rounded-xs p-3 bg-slate-50/50 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3 print:bg-transparent">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold w-28 text-slate-700">Nama Siswa:</span>
                  <div className="flex-1 border-b-2 border-dotted border-slate-800 h-5"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold w-28 text-slate-700">Kelas / Tingkat:</span>
                  <div className="flex-1 border-b-2 border-dotted border-slate-800 h-5 text-slate-900 font-semibold px-1">
                    {currentExam.grade}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold w-28 text-slate-700">No. Absen / NIS:</span>
                  <div className="flex-1 border-b-2 border-dotted border-slate-800 h-5"></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold w-28 text-slate-700">Mata Pelajaran:</span>
                  <div className="flex-1 border-b-2 border-dotted border-slate-800 h-5 text-slate-900 font-semibold px-1">
                    {currentExam.subject}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold w-28 text-slate-700">Hari / Tanggal:</span>
                  <div className="flex-1 border-b-2 border-dotted border-slate-800 h-5"></div>
                </div>
                <div className="flex items-center gap-2 justify-between pt-1">
                  <span className="font-bold text-slate-700">TTD Siswa:</span>
                  <div className="w-32 border border-slate-800 h-8 rounded-xs text-[9px] text-slate-400 flex items-center justify-center">
                    ( Tanda Tangan )
                  </div>
                </div>
              </div>
            </div>

            {/* Petunjuk Pengisian LJK */}
            <div className="bg-amber-50/80 border border-amber-300 p-2.5 rounded-xs text-[10.5px] text-amber-950 font-sans print:bg-slate-50 print:border-slate-400">
              <strong className="block font-bold mb-0.5">PETUNJUK PENGISIAN LEMBAR JAWABAN:</strong>
              <p>1. Hitamkan atau beri tanda silang (X) pada salah satu lingkaran huruf A, B, C, D, atau E yang paling tepat.</p>
              <p>2. Untuk jawaban Isian / Uraian, tuliskan jawaban secara rapi pada bagian jawaban tertulis yang telah disediakan.</p>
            </div>

            {/* SECTION I: PILIHAN GANDA & PG KOMPLEKS BUBBLE GRID */}
            {(pgQuestions.length > 0 || pgkQuestions.length > 0) && (
              <div className="my-4 border border-slate-800 p-3 rounded-xs">
                <h3 className="font-bold text-xs uppercase text-slate-900 mb-3 pb-1 border-b border-slate-800 flex items-center justify-between">
                  <span>BAGIAN I: LEMBAR JAWABAN OBJEKTIF (PILIHAN GANDA & PG KOMPLEKS)</span>
                  <span className="text-[10px] text-slate-600 font-normal">(Berikan Tanda X / Lingkaran)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                  {[...pgQuestions, ...pgkQuestions].map((q) => (
                    <div key={q.id} className="flex items-center justify-between bg-slate-50/80 p-1.5 rounded border border-slate-200 print:bg-transparent print:border-slate-300">
                      <span className="font-bold text-slate-900 w-8 text-right pr-2">{q.number}.</span>
                      <div className="flex items-center gap-1.5">
                        {["A", "B", "C", "D", "E"].map((letter) => (
                          <span
                            key={letter}
                            className="w-5 h-5 rounded-full border border-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-800 bg-white"
                          >
                            {letter}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION II: ISIAN SINGKAT & URAIAN WRITTEN RESPONSE LINES */}
            {(isianQuestions.length > 0 || uraianQuestions.length > 0 || matchQuestions.length > 0) && (
              <div className="my-4 border border-slate-800 p-3 rounded-xs space-y-3">
                <h3 className="font-bold text-xs uppercase text-slate-900 pb-1 border-b border-slate-800">
                  BAGIAN II: LEMBAR JAWABAN ISIAN, MENJODOHKAN & URAIAN
                </h3>

                {matchQuestions.map((q) => (
                  <div key={q.id} className="space-y-1">
                    <span className="font-bold text-xs text-slate-900">{q.number}. Jawaban Menjodohkan:</span>
                    <div className="p-2 border border-slate-300 bg-slate-50 rounded-xs text-[11px] space-y-1.5 print:bg-transparent">
                      {q.matchingPairs?.map((_, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-24 font-semibold">Pasangan {idx + 1}:</span>
                          <div className="flex-1 border-b border-slate-800 h-4"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {isianQuestions.map((q) => (
                  <div key={q.id} className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 w-16">{q.number}. Isian:</span>
                    <div className="flex-1 border-b border-slate-800 h-5"></div>
                  </div>
                ))}

                {uraianQuestions.map((q) => (
                  <div key={q.id} className="space-y-1 text-xs">
                    <span className="font-bold text-slate-900">{q.number}. Jawaban Uraian / Essay:</span>
                    <div className="w-full border border-slate-300 rounded-xs p-2 min-h-[70px] space-y-3 print:border-slate-800">
                      <div className="border-b border-slate-200 border-dashed h-4"></div>
                      <div className="border-b border-slate-200 border-dashed h-4"></div>
                      <div className="border-b border-slate-200 border-dashed h-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Signature Footer */}
            <SignatureFooter config={currentExam.sigConfig} />
          </div>
        )}

        {/* MODE 3: KISI-KISI SOAL MATRIX TABLE */}
        {viewMode === "kisi-kisi" && (
          <div className="space-y-4">
            <KopSurat config={currentExam.kopConfig} />

            <div className="text-center my-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase">
                KISI-KISI PENULISAN SOAL ASESMEN (KURIKULUM MERDEKA)
              </h2>
              <p className="text-xs font-semibold text-emerald-900">
                {currentExam.title} — PAKET {paketVersion}
              </p>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[10.5px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-800 print:bg-slate-200">
                  <th className="border border-slate-800 p-2 text-center w-10">No</th>
                  <th className="border border-slate-800 p-2 text-left w-28">Elemen CP</th>
                  <th className="border border-slate-800 p-2 text-left">Materi / Topik</th>
                  <th className="border border-slate-800 p-2 text-left">Indikator Soal</th>
                  <th className="border border-slate-800 p-2 text-center w-24">Bentuk Soal</th>
                  <th className="border border-slate-800 p-2 text-center w-24">Level Kognitif</th>
                </tr>
              </thead>
              <tbody>
                {currentExam.questions.map((q) => (
                  <tr key={q.id} className="border-b border-slate-700">
                    <td className="border border-slate-800 p-1.5 text-center font-bold">
                      {q.number}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-left">{q.cpElement || "CP Utama"}</td>
                    <td className="border border-slate-800 p-1.5 font-medium text-justify-document">{q.stimulus ? q.stimulus.slice(0, 60) + "..." : "Sesuai CP"}</td>
                    <td className="border border-slate-800 p-1.5 text-justify-document">{q.indikatorSoal || "Peserta didik dapat menjawab dengan tepat."}</td>
                    <td className="border border-slate-800 p-1.5 text-center capitalize">
                      {q.type.replace("_", " ")}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-900">
                      {q.bloomLevel || "C3"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <SignatureFooter config={currentExam.sigConfig} />
          </div>
        )}

      </div>
    </div>
  );
}

// Sub-component for individual question card rendering
interface QuestionItemCardProps {
  q: Question;
  viewMode: "soal" | "kunci" | "kisi-kisi" | "ljk";
  editingQuestionId: string | null;
  setEditingQuestionId: (id: string | null) => void;
  onUpdateQuestion: (qId: string, updated: Partial<Question>) => void;
  onDeleteQuestion: (qId: string) => void;
  onMoveQuestion: (index: number, direction: "up" | "down") => void;
  globalIndex: number;
  totalQuestions: number;
}

function QuestionItemCard({
  q,
  viewMode,
  editingQuestionId,
  setEditingQuestionId,
  onUpdateQuestion,
  onDeleteQuestion,
  onMoveQuestion,
  globalIndex,
  totalQuestions,
}: QuestionItemCardProps) {
  const isEditing = editingQuestionId === q.id;

  if (isEditing) {
    return (
      <div className="p-4 bg-amber-50/90 border-2 border-amber-400 rounded-xl space-y-3 text-xs print:hidden shadow-md">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <span className="font-extrabold text-amber-950">
            Edit Soal No. {q.number} ({q.type.replace("_", " ").toUpperCase()})
          </span>
          <button
            onClick={() => setEditingQuestionId(null)}
            className="px-3 py-1 bg-emerald-800 text-amber-300 font-bold rounded-lg hover:bg-emerald-900 text-xs flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selesai Edit
          </button>
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Stimulus (Opsional):</label>
          <textarea
            value={q.stimulus || ""}
            onChange={(e) => onUpdateQuestion(q.id, { stimulus: e.target.value })}
            rows={2}
            className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Teks Pertanyaan Soal:</label>
          <textarea
            value={q.questionText}
            onChange={(e) => onUpdateQuestion(q.id, { questionText: e.target.value })}
            rows={3}
            className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
          />
        </div>

        {q.type === "pilihan_ganda" && q.options && (
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">Opsi Pilihan Ganda:</label>
            {q.options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                value={opt}
                onChange={(e) => {
                  const newOpts = [...q.options!];
                  newOpts[idx] = e.target.value;
                  onUpdateQuestion(q.id, { options: newOpts });
                }}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Kunci Jawaban:</label>
            <input
              type="text"
              value={q.answerKey}
              onChange={(e) => onUpdateQuestion(q.id, { answerKey: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-bold text-emerald-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-800 mb-1">Taksonomi Bloom:</label>
            <input
              type="text"
              value={q.bloomLevel || ""}
              onChange={(e) => onUpdateQuestion(q.id, { bloomLevel: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Pembahasan Guru:</label>
          <textarea
            value={q.explanation}
            onChange={(e) => onUpdateQuestion(q.id, { explanation: e.target.value })}
            rows={2}
            className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative p-2 rounded hover:bg-slate-50/80 transition-colors">
      
      {/* Quick Action Floating Bar - Hidden in Print */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 border border-slate-300 rounded-lg p-1 shadow-xs print:hidden z-10">
        <button
          onClick={() => onMoveQuestion(globalIndex, "up")}
          disabled={globalIndex === 0}
          className="p-1 hover:bg-slate-100 text-slate-700 disabled:opacity-30 rounded"
          title="Geser Ke Atas"
        >
          <MoveUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onMoveQuestion(globalIndex, "down")}
          disabled={globalIndex === totalQuestions - 1}
          className="p-1 hover:bg-slate-100 text-slate-700 disabled:opacity-30 rounded"
          title="Geser Ke Bawah"
        >
          <MoveDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setEditingQuestionId(q.id)}
          className="p-1 hover:bg-amber-100 text-amber-900 rounded font-bold"
          title="Edit Teks Soal"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDeleteQuestion(q.id)}
          className="p-1 hover:bg-rose-100 text-rose-700 rounded"
          title="Hapus Soal Ini"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-start gap-2.5">
        <span className="font-bold text-slate-900 min-w-6 text-right">
          {q.number}.
        </span>

        <div className="flex-1 space-y-1.5 text-slate-900">
          {/* Stimulus */}
          {q.stimulus && (
            <div className="p-2.5 bg-slate-100/80 rounded border-l-2 border-emerald-800 text-[11px] font-times text-justify-document my-1 print:bg-slate-50 leading-relaxed">
              {q.stimulus}
            </div>
          )}

          {/* Question Main Text */}
          <p className="font-semibold text-slate-900 leading-snug whitespace-pre-line text-justify-document">
            {q.questionText}
          </p>

          {/* Type A: Pilihan Ganda */}
          {q.type === "pilihan_ganda" && q.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 pl-1">
              {q.options.map((opt, i) => (
                <div key={i} className="text-slate-800 text-[11px] text-left">
                  {opt}
                </div>
              ))}
            </div>
          )}

          {/* Type B: PG Kompleks */}
          {q.type === "pg_kompleks" && q.complexSubItems && (
            <div className="mt-2 text-[11px]">
              <table className="w-full border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200">
                    <th className="border border-slate-300 p-1.5 text-left font-bold">Pernyataan</th>
                    <th className="border border-slate-300 p-1.5 text-center w-16 font-bold">Benar</th>
                  </tr>
                </thead>
                <tbody>
                  {q.complexSubItems.map((sub, idx) => (
                    <tr key={idx} className="border-b border-slate-300">
                      <td className="p-1.5 text-justify-document">{sub.statement}</td>
                      <td className="p-1.5 text-center border-l border-slate-300">
                        {viewMode === "kunci" && sub.isTrue ? "✓" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Type C: Menjodohkan */}
          {q.type === "menjodohkan" && q.matchingPairs && (
            <div className="mt-2 grid grid-cols-2 gap-4 p-2 bg-slate-50 rounded border border-slate-200 print:bg-transparent text-[11px]">
              <div>
                <span className="font-bold text-[10px] uppercase block mb-1">KOLOM A (Pernyataan):</span>
                <ol className="list-decimal list-inside space-y-1">
                  {q.matchingPairs.map((pair, idx) => (
                    <li key={idx} className="text-[10.5px]">{pair.left}</li>
                  ))}
                </ol>
              </div>
              <div>
                <span className="font-bold text-[10px] uppercase block mb-1">KOLOM B (Jawaban):</span>
                <ul className="list-disc list-inside space-y-1">
                  {q.matchingPairs.map((pair, idx) => (
                    <li key={idx} className="text-[10.5px]">{pair.right}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Type D: Isian Singkat */}
          {q.type === "isian_singkat" && viewMode === "soal" && (
            <div className="pt-2 text-slate-500 font-mono text-[11px]">
              Jawaban: .........................................................................................................
            </div>
          )}

          {/* Type E: Uraian */}
          {q.type === "uraian" && viewMode === "soal" && (
            <div className="h-16 border-b border-dotted border-slate-400 mt-2"></div>
          )}

          {/* Teacher Answer Key & Explanation Box */}
          {viewMode === "kunci" && (
            <div className="mt-2 p-2.5 bg-emerald-50 border-l-3 border-emerald-700 text-slate-900 rounded-r text-[11px] space-y-1">
              <p className="font-bold text-emerald-950">
                KUNCI JAWABAN: <span className="text-emerald-800">{q.answerKey}</span>
              </p>
              <p className="text-slate-800">
                <strong className="text-emerald-950">Pembahasan:</strong> {q.explanation}
              </p>
              {q.rubric && (
                <p className="text-slate-700 italic border-t border-emerald-200 pt-1 mt-1">
                  <strong>Rubrik Skor Uraian:</strong> {q.rubric}
                </p>
              )}
              <div className="flex items-center gap-3 text-[10px] text-emerald-900 pt-1">
                <span>Level Kognitif: <strong>{q.bloomLevel}</strong></span>
                <span>Bobot Skor: <strong>{q.scoreWeight || 2} Poin</strong></span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
