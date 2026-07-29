"use client";

import React, { useState } from "react";
import { BankSoalFilter, ExamDocument } from "@/types/exam";
import {
  Search,
  BookOpen,
  GraduationCap,
  Trash2,
  Eye,
  Download,
  Upload,
  Calendar,
  FileCheck2,
  PlusCircle,
  Copy,
} from "lucide-react";

interface BankSoalManagerProps {
  bankItems: ExamDocument[];
  onSelectExam: (doc: ExamDocument) => void;
  onDeleteExam: (id: string) => void;
  onImportExams: (docs: ExamDocument[]) => void;
}

export function BankSoalManager({
  bankItems,
  onSelectExam,
  onDeleteExam,
  onImportExams,
}: BankSoalManagerProps) {
  const [filterSchool, setFilterSchool] = useState<string>("ALL");
  const [filterGrade, setFilterGrade] = useState<string>("ALL");
  const [filterSubject, setFilterSubject] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredItems = bankItems.filter((item) => {
    if (filterSchool !== "ALL" && item.institution !== filterSchool) return false;
    if (filterGrade !== "ALL" && item.grade !== filterGrade) return false;
    if (filterSubject !== "ALL" && item.subject !== filterSubject) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubject = item.subject.toLowerCase().includes(q);
      const matchQuestion = item.questions.some((ques) =>
        ques.questionText.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchSubject && !matchQuestion) return false;
    }
    return true;
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bankItems, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bank-soal-alhamidy-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportExams(parsed);
          alert(`Berhasil mengimpor ${parsed.length} paket soal ke Bank Soal!`);
        } else if (parsed && parsed.id) {
          onImportExams([parsed]);
          alert("Berhasil mengimpor 1 paket soal ke Bank Soal!");
        }
      } catch (err) {
        alert("Gagal membaca file JSON. Pastikan format file sesuai.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 sm:p-8 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pill pill-green text-[10px] font-bold">Bank Soal Terintegrasi</span>
            <span className="pill pill-amber text-[10px] font-bold">Format Merdeka</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-800" />
            Manajemen Bank Soal & Arsip Dokumen
          </h2>
          <p className="text-xs text-slate-600">
            Kumpulan paket soal terstruktur SMP Qur&apos;an Al-Hamidy & SMA Plus Al-Hamidy Pringsewu-Lampung
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-full border border-slate-300 transition flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>Impor JSON</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
          <button
            onClick={handleExportJSON}
            className="bg-emerald-800 hover:bg-emerald-900 text-amber-300 text-xs font-bold px-4 py-2 rounded-full shadow-xs transition flex items-center gap-1.5 hover:scale-[1.02]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Semua (JSON)</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Bento Panel */}
      {(() => {
        const smpCount = bankItems.filter((i) => i.institution === "SMP Qur'an Al-Hamidy").length;
        const smaCount = bankItems.filter((i) => i.institution === "SMA Plus Al-Hamidy").length;
        const formatifCount = bankItems.filter((i) => i.assessmentType === "Formative").length;
        const sumatifCount = bankItems.filter((i) => i.assessmentType === "Summative").length;

        let totalHots = 0;
        let totalMots = 0;
        let totalLots = 0;

        bankItems.forEach((doc) => {
          doc.questions.forEach((q) => {
            const bloom = (q.bloomLevel || "").toUpperCase();
            if (bloom.includes("HOTS") || bloom.includes("C4") || bloom.includes("C5") || bloom.includes("C6")) {
              totalHots++;
            } else if (bloom.includes("LOTS") || bloom.includes("C1") || bloom.includes("C2")) {
              totalLots++;
            } else {
              totalMots++;
            }
          });
        });

        const totalSoal = totalHots + totalMots + totalLots;

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                🏫 Sekolah
              </span>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-extrabold text-slate-900">SMP: {smpCount}</span>
                <span className="font-extrabold text-slate-900">SMA: {smaCount}</span>
              </div>
              <p className="text-[9px] text-emerald-700 mt-1 font-medium">Total: {bankItems.length} Paket Soal</p>
            </div>

            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                📋 Jenis Asesmen
              </span>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-extrabold text-slate-900">Formatif: {formatifCount}</span>
                <span className="font-extrabold text-slate-900">Sumatif: {sumatifCount}</span>
              </div>
              <p className="text-[9px] text-amber-800 mt-1 font-medium">Kategori Terklasifikasi</p>
            </div>

            <div className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-200 col-span-2">
              <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block mb-1 flex justify-between">
                <span>🧠 Akumulasi Level Bloom (Total Soal: {totalSoal})</span>
                <span>HOTS / MOTS / LOTS</span>
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-1">
                <div className="bg-white p-1.5 rounded-xl border border-sky-200 shadow-2xs">
                  <span className="block text-[9px] font-bold text-amber-800">HOTS (C4-C6)</span>
                  <span className="font-extrabold text-amber-950 text-sm">{totalHots} Soal</span>
                </div>
                <div className="bg-white p-1.5 rounded-xl border border-sky-200 shadow-2xs">
                  <span className="block text-[9px] font-bold text-emerald-800">MOTS (C3)</span>
                  <span className="font-extrabold text-emerald-950 text-sm">{totalMots} Soal</span>
                </div>
                <div className="bg-white p-1.5 rounded-xl border border-sky-200 shadow-2xs">
                  <span className="block text-[9px] font-bold text-sky-800">LOTS (C1-C2)</span>
                  <span className="font-extrabold text-sky-950 text-sm">{totalLots} Soal</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Filter Bento Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
        
        {/* Search Input */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Cari Soal / Kata Kunci:</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tajwid, fisika, dll..."
              className="w-full p-2.5 pl-8 border border-slate-200 rounded-xl bg-white text-xs font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </div>
        </div>

        {/* Filter School */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Lembaga:</label>
          <select
            value={filterSchool}
            onChange={(e) => setFilterSchool(e.target.value)}
            className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800"
          >
            <option value="ALL">Semua Lembaga</option>
            <option value="SMP Qur'an Al-Hamidy">SMP Qur&apos;an Al-Hamidy</option>
            <option value="SMA Plus Al-Hamidy">SMA Plus Al-Hamidy</option>
          </select>
        </div>

        {/* Filter Grade */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Kelas:</label>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800"
          >
            <option value="ALL">Semua Kelas</option>
            <option value="Kelas 7">Kelas 7 SMP</option>
            <option value="Kelas 8">Kelas 8 SMP</option>
            <option value="Kelas 9">Kelas 9 SMP</option>
            <option value="Kelas 10">Kelas 10 SMA</option>
            <option value="Kelas 11">Kelas 11 SMA</option>
            <option value="Kelas 12">Kelas 12 SMA</option>
          </select>
        </div>

        {/* Total Badge counter */}
        <div className="flex flex-col justify-end">
          <div className="p-2.5 bg-emerald-100/90 border border-emerald-300 text-emerald-950 rounded-xl text-center font-extrabold text-xs">
            Tersimpan: {filteredItems.length} Paket Soal
          </div>
        </div>

      </div>

      {/* Exam Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">Belum ada paket soal yang tersimpan di kriteria ini.</p>
          <p className="text-xs text-slate-400 mt-1">Gunakan tab AI Generator untuk membuat soal baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((exam) => (
            <div
              key={exam.id}
              className="bento-card hover:border-emerald-500 bg-white p-5 rounded-2xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="pill pill-green text-[10px]">
                    {exam.institution}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(exam.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2 mt-1">
                  {exam.title}
                </h3>

                <div className="mt-3 text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p>
                    <strong className="text-slate-800">Mapel & Kelas:</strong> {exam.subject} ({exam.grade})
                  </p>
                  <p>
                    <strong className="text-slate-800">Jumlah Soal:</strong> {exam.questions.length} Soal |{" "}
                    <strong className="text-slate-800">Waktu:</strong> {exam.timeLimitMinutes} Menit
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">
                  Pengesahan: {exam.sigConfig.principalName.split(",")[0]}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDeleteExam(exam.id)}
                    title="Hapus dari Bank"
                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectExam(exam)}
                    className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-2xs transition hover:scale-[1.02]"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>Buka & Cetak</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
