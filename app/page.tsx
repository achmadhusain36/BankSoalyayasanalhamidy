"use client";

import React, { useState, useEffect } from "react";
import { ExamDocument, KopHeaderConfig, SchoolType, SignatureConfig } from "@/types/exam";
import {
  DEFAULT_KOP_SMA,
  DEFAULT_KOP_SMP,
  DEFAULT_SIG_SMA,
  DEFAULT_SIG_SMP,
  SAMPLE_BANK_SOAL,
} from "@/lib/default-data";
import {
  loadBankSoal,
  loadDraftExam,
  loadKopConfig,
  loadSigConfig,
  saveBankSoal,
  saveDraftExam,
  saveExamToBank,
  saveKopConfig,
  saveSigConfig,
} from "@/lib/storage";
import { GeneratorForm } from "@/components/generator-form";
import { A4DocumentPreview } from "@/components/a4-document-preview";
import { BankSoalManager } from "@/components/bank-soal-manager";
import { KopSettingsManager } from "@/components/kop-settings-manager";
import { SchoolLogo } from "@/components/school-logo";
import {
  Sparkles,
  FileText,
  BookOpen,
  Building2,
  Printer,
  Plus,
  Info,
  CheckCircle2,
  GraduationCap,
  Moon,
  Sun,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"generator" | "editor" | "bank" | "kop">("generator");
  const [isLoading, setIsLoading] = useState(false);

  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("alhamidy_dark_mode");
      if (saved === "true") {
        queueMicrotask(() => {
          setDarkMode(true);
        });
      }
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("alhamidy_dark_mode", String(darkMode));
  }, [darkMode]);

  // Storage states initialized with server defaults to prevent hydration mismatch
  const [bankItems, setBankItems] = useState<ExamDocument[]>(SAMPLE_BANK_SOAL);
  const [activeExam, setActiveExam] = useState<ExamDocument>(SAMPLE_BANK_SOAL[0]);
  const [smpKop, setSmpKop] = useState<KopHeaderConfig>(DEFAULT_KOP_SMP);
  const [smpSig, setSmpSig] = useState<SignatureConfig>(DEFAULT_SIG_SMP);
  const [smaKop, setSmaKop] = useState<KopHeaderConfig>(DEFAULT_KOP_SMA);
  const [smaSig, setSmaSig] = useState<SignatureConfig>(DEFAULT_SIG_SMA);

  // Load client data from localStorage after hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      queueMicrotask(() => {
        const loadedBank = loadBankSoal();
        if (loadedBank && loadedBank.length > 0) {
          setBankItems(loadedBank);
        }
        const draft = loadDraftExam();
        if (draft) {
          setActiveExam(draft);
        } else if (loadedBank && loadedBank.length > 0) {
          setActiveExam(loadedBank[0]);
        }
        setSmpKop(loadKopConfig("SMP Qur'an Al-Hamidy"));
        setSmpSig(loadSigConfig("SMP Qur'an Al-Hamidy"));
        setSmaKop(loadKopConfig("SMA Plus Al-Hamidy"));
        setSmaSig(loadSigConfig("SMA Plus Al-Hamidy"));
      });
    }
  }, []);

  const handleExamGenerated = (newExam: ExamDocument) => {
    // Attach current saved Kop & Signature for selected school
    const school = newExam.institution;
    const currentKop = school === "SMP Qur'an Al-Hamidy" ? smpKop : smaKop;
    const currentSig = school === "SMP Qur'an Al-Hamidy" ? smpSig : smaSig;

    const fullExam: ExamDocument = {
      ...newExam,
      kopConfig: currentKop,
      sigConfig: currentSig,
    };

    setActiveExam(fullExam);
    saveDraftExam(fullExam);
    saveExamToBank(fullExam);
    setBankItems(loadBankSoal());
    setActiveTab("editor");
  };

  const handleUpdateActiveExam = (updated: ExamDocument) => {
    setActiveExam(updated);
    saveDraftExam(updated);
  };

  const handleSaveToBank = (doc: ExamDocument) => {
    const updatedList = saveExamToBank(doc);
    setBankItems(updatedList);
  };

  const handleDeleteFromBank = (id: string) => {
    const updated = bankItems.filter((item) => item.id !== id);
    setBankItems(updated);
    saveBankSoal(updated);
  };

  const handleSelectExamFromBank = (doc: ExamDocument) => {
    setActiveExam(doc);
    saveDraftExam(doc);
    setActiveTab("editor");
  };

  const handleImportExams = (docs: ExamDocument[]) => {
    const merged = [...docs, ...bankItems];
    setBankItems(merged);
    saveBankSoal(merged);
  };

  // Kop Settings Handlers
  const handleSaveSmpKop = (cfg: KopHeaderConfig) => {
    setSmpKop(cfg);
    saveKopConfig("SMP Qur'an Al-Hamidy", cfg);
    if (activeExam.institution === "SMP Qur'an Al-Hamidy") {
      const updated = { ...activeExam, kopConfig: cfg };
      setActiveExam(updated);
      saveDraftExam(updated);
    }
  };

  const handleSaveSmpSig = (cfg: SignatureConfig) => {
    setSmpSig(cfg);
    saveSigConfig("SMP Qur'an Al-Hamidy", cfg);
    if (activeExam.institution === "SMP Qur'an Al-Hamidy") {
      const updated = { ...activeExam, sigConfig: cfg };
      setActiveExam(updated);
      saveDraftExam(updated);
    }
  };

  const handleSaveSmaKop = (cfg: KopHeaderConfig) => {
    setSmaKop(cfg);
    saveKopConfig("SMA Plus Al-Hamidy", cfg);
    if (activeExam.institution === "SMA Plus Al-Hamidy") {
      const updated = { ...activeExam, kopConfig: cfg };
      setActiveExam(updated);
      saveDraftExam(updated);
    }
  };

  const handleSaveSmaSig = (cfg: SignatureConfig) => {
    setSmaSig(cfg);
    saveSigConfig("SMA Plus Al-Hamidy", cfg);
    if (activeExam.institution === "SMA Plus Al-Hamidy") {
      const updated = { ...activeExam, sigConfig: cfg };
      setActiveExam(updated);
      saveDraftExam(updated);
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col selection:bg-emerald-800 selection:text-amber-300 transition-colors duration-200 ${
      darkMode ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* Top Main Bento Navigation Bar (Hidden during printing) */}
      <header className="sticky top-0 z-40 bg-emerald-950 text-white border-b border-emerald-900 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Institution Brand Title */}
          <div className="flex items-center gap-3">
            <SchoolLogo school={activeExam.institution || "SMP Qur'an Al-Hamidy"} size={38} />
            <div>
              <h1 className="text-xs sm:text-sm font-extrabold text-amber-300 leading-tight uppercase tracking-wide">
                AL-HAMIDY ASSESSMENT AI
              </h1>
              <p className="text-[10.5px] text-emerald-200/90 font-medium hidden sm:block">
                SMP Qur&apos;an & SMA Plus Al-Hamidy Pringsewu-Lampung
              </p>
            </div>
          </div>

          {/* Tab Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-emerald-900/70 p-1.5 rounded-full border border-emerald-800/80">
            <button
              onClick={() => setActiveTab("generator")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "generator"
                  ? "bg-amber-400 text-emerald-950 shadow-sm scale-[1.02]"
                  : "text-emerald-100 hover:text-white hover:bg-emerald-800/80"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Generator</span>
            </button>

            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "editor"
                  ? "bg-amber-400 text-emerald-950 shadow-sm scale-[1.02]"
                  : "text-emerald-100 hover:text-white hover:bg-emerald-800/80"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pratinjau & Cetak A4</span>
            </button>

            <button
              onClick={() => setActiveTab("bank")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "bank"
                  ? "bg-amber-400 text-emerald-950 shadow-sm scale-[1.02]"
                  : "text-emerald-100 hover:text-white hover:bg-emerald-800/80"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bank Soal ({bankItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("kop")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "kop"
                  ? "bg-amber-400 text-emerald-950 shadow-sm scale-[1.02]"
                  : "text-emerald-100 hover:text-white hover:bg-emerald-800/80"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Pengaturan Kop & TTD</span>
            </button>
          </nav>

          {/* Quick Status Pills & Print CTA */}
          <div className="flex items-center gap-2">
            <span className="pill pill-green hidden lg:inline-flex">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Sistem Online
            </span>
            <span className="pill pill-amber hidden lg:inline-flex">
              Kurikulum: Merdeka
            </span>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
              className="p-2 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 border border-emerald-700/80 text-amber-300 transition flex items-center justify-center shrink-0"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-amber-300" />}
            </button>

            <button
              onClick={() => {
                setActiveTab("editor");
                setTimeout(() => window.print(), 300);
              }}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>
          </div>

        </div>

        {/* Mobile Subnav Bar */}
        <div className="md:hidden flex items-center justify-around bg-emerald-900 px-2 py-1.5 border-t border-emerald-800 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab("generator")}
            className={`px-3 py-1 rounded-full transition ${activeTab === "generator" ? "bg-amber-400 text-emerald-950" : "text-emerald-200"}`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-3 py-1 rounded-full transition ${activeTab === "editor" ? "bg-amber-400 text-emerald-950" : "text-emerald-200"}`}
          >
            Editor A4
          </button>
          <button
            onClick={() => setActiveTab("bank")}
            className={`px-3 py-1 rounded-full transition ${activeTab === "bank" ? "bg-amber-400 text-emerald-950" : "text-emerald-200"}`}
          >
            Bank Soal
          </button>
          <button
            onClick={() => setActiveTab("kop")}
            className={`px-3 py-1 rounded-full transition ${activeTab === "kop" ? "bg-amber-400 text-emerald-950" : "text-emerald-200"}`}
          >
            Kop & TTD
          </button>
        </div>
      </header>

      {/* Main Content Bento Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        
        {/* Bento Top Header Info Banner (Hidden during print) */}
        <div className="w-full max-w-5xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
          
          <div className="bento-card-dark flex flex-row items-center justify-between p-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                Pusat Kendali AI Asesmen
              </span>
              <h2 className="text-sm font-extrabold text-amber-300">
                {activeTab === "generator" && "AI Question Generator"}
                {activeTab === "editor" && "Pratinjau Cetak Dokumen A4"}
                {activeTab === "bank" && "Manajemen Bank Soal & Arsip"}
                {activeTab === "kop" && "Konfigurasi Kop & TTD Digital"}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/50 flex items-center justify-center text-amber-300 font-bold shrink-0">
              AH
            </div>
          </div>

          <div className="bento-card flex flex-row items-center justify-between p-4">
            <div>
              <span className="bento-header mb-1 text-[10px]">Lembaga Terpilih</span>
              <p className="text-xs font-bold text-slate-900">{activeExam.institution}</p>
              <span className="text-[10px] text-slate-500 font-medium">Kop & Stempel Digital Terhubung</span>
            </div>
            <span className="pill pill-green text-[10px]">Aktif</span>
          </div>

          <div className="bento-card flex flex-row items-center justify-between p-4">
            <div>
              <span className="bento-header mb-1 text-[10px]">Tersimpan di Bank</span>
              <p className="text-xs font-bold text-slate-900">{bankItems.length} Paket Soal Ujian</p>
              <span className="text-[10px] text-slate-500 font-medium">Format Kurikulum Merdeka</span>
            </div>
            <span className="pill pill-amber text-[10px]">Siap Ekspor</span>
          </div>

        </div>

        {/* Tab View Container */}
        {activeTab === "generator" && (
          <GeneratorForm
            onGenerated={handleExamGenerated}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {activeTab === "editor" && (
          <A4DocumentPreview
            exam={activeExam}
            onUpdateExam={handleUpdateActiveExam}
            onSaveToBank={handleSaveToBank}
          />
        )}

        {activeTab === "bank" && (
          <BankSoalManager
            bankItems={bankItems}
            onSelectExam={handleSelectExamFromBank}
            onDeleteExam={handleDeleteFromBank}
            onImportExams={handleImportExams}
          />
        )}

        {activeTab === "kop" && (
          <KopSettingsManager
            smpKop={smpKop}
            smpSig={smpSig}
            smaKop={smaKop}
            smaSig={smaSig}
            onSaveSmpKop={handleSaveSmpKop}
            onSaveSmpSig={handleSaveSmpSig}
            onSaveSmaKop={handleSaveSmaKop}
            onSaveSmaSig={handleSaveSmaSig}
          />
        )}

      </main>

      {/* Footer (Hidden during print) */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 print:hidden text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-300">
            Aplikasi Pembuat Soal Otomatis Kurikulum Merdeka - YAYASAN ALHAMIDY PRINGSEWU
          </p>
          <p className="text-slate-500">
            SMP Qur&apos;an Al-Hamidy & SMA Plus Al-Hamidy Pringsewu-Lampung | Didukung AI Gemini Server-Side dibuat oleh Achmad Husain
          </p>
        </div>
      </footer>

    </div>
  );
}
