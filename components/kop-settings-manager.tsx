"use client";

import React, { useState } from "react";
import { KopHeaderConfig, SchoolType, SignatureConfig } from "@/types/exam";
import { KopSurat } from "./kop-surat";
import { SignatureFooter } from "./signature-footer";
import {
  Building2,
  FilePen,
  Stamp,
  QrCode,
  Save,
  RotateCcw,
  CheckCircle2,
  Image as ImageIcon,
  HelpCircle,
} from "lucide-react";

interface KopSettingsManagerProps {
  smpKop: KopHeaderConfig;
  smpSig: SignatureConfig;
  smaKop: KopHeaderConfig;
  smaSig: SignatureConfig;
  onSaveSmpKop: (cfg: KopHeaderConfig) => void;
  onSaveSmpSig: (cfg: SignatureConfig) => void;
  onSaveSmaKop: (cfg: KopHeaderConfig) => void;
  onSaveSmaSig: (cfg: SignatureConfig) => void;
}

export function KopSettingsManager({
  smpKop,
  smpSig,
  smaKop,
  smaSig,
  onSaveSmpKop,
  onSaveSmpSig,
  onSaveSmaKop,
  onSaveSmaSig,
}: KopSettingsManagerProps) {
  const [activeTabSchool, setActiveTabSchool] = useState<SchoolType>("SMP Qur'an Al-Hamidy");

  const [kopState, setKopState] = useState<KopHeaderConfig>(
    activeTabSchool === "SMP Qur'an Al-Hamidy" ? smpKop : smaKop
  );
  const [sigState, setSigState] = useState<SignatureConfig>(
    activeTabSchool === "SMP Qur'an Al-Hamidy" ? smpSig : smaSig
  );

  const [isSaved, setIsSaved] = useState(false);

  const handleSwitchSchool = (school: SchoolType) => {
    setActiveTabSchool(school);
    if (school === "SMP Qur'an Al-Hamidy") {
      setKopState(smpKop);
      setSigState(smpSig);
    } else {
      setKopState(smaKop);
      setSigState(smaSig);
    }
  };

  const handleSaveAll = () => {
    if (activeTabSchool === "SMP Qur'an Al-Hamidy") {
      onSaveSmpKop(kopState);
      onSaveSmpSig(sigState);
    } else {
      onSaveSmaKop(kopState);
      onSaveSmaSig(sigState);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logoLeft" | "logoRight" | "fullKop" | "principalSig" | "teacherSig"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (field === "logoLeft") setKopState((prev) => ({ ...prev, logoLeftUrl: dataUrl }));
      if (field === "logoRight") setKopState((prev) => ({ ...prev, logoRightUrl: dataUrl }));
      if (field === "fullKop") setKopState((prev) => ({ ...prev, customFullKopUrl: dataUrl, useCustomFullKop: true }));
      if (field === "principalSig") setSigState((prev) => ({ ...prev, principalSignatureUrl: dataUrl }));
      if (field === "teacherSig") setSigState((prev) => ({ ...prev, teacherSignatureUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 sm:p-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pill pill-green text-[10px] font-bold">Autentikasi Lembaga</span>
            <span className="pill pill-amber text-[10px] font-bold">Kop & TTD Digital</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-800" />
            Pengaturan Kop Surat & Tanda Tangan Digital
          </h2>
          <p className="text-xs text-slate-600">
            Kelola detail identitas lembaga, stempel sekolah, serta TTD digital untuk dokumen ujian
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold text-xs px-5 py-2.5 rounded-full shadow-md transition-all flex items-center gap-2 shrink-0 hover:scale-[1.02]"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? "Tersimpan Ke Sistem!" : "Simpan Pengaturan Kop"}</span>
        </button>
      </div>

      {/* School Tab Selector */}
      <div className="flex items-center gap-2 mb-6 bg-slate-100 p-1.5 rounded-full border border-slate-200">
        <button
          onClick={() => handleSwitchSchool("SMP Qur'an Al-Hamidy")}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
            activeTabSchool === "SMP Qur'an Al-Hamidy"
              ? "bg-emerald-800 text-amber-300 shadow-xs scale-[1.01]"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          SMP Qur&apos;an Al-Hamidy
        </button>
        <button
          onClick={() => handleSwitchSchool("SMA Plus Al-Hamidy")}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
            activeTabSchool === "SMA Plus Al-Hamidy"
              ? "bg-emerald-800 text-amber-300 shadow-xs scale-[1.01]"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          SMA Plus Al-Hamidy
        </button>
      </div>

      {/* Live Pratinjau Section */}
      <div className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="bento-header mb-3">
          <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
            👁️ Pratinjau Langsung Kop Surat & TTD Digital
          </span>
          <span className="pill pill-green text-[10px]">Format Dokumen Resmi</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <KopSurat config={kopState} />
          <div className="my-4 text-center py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 italic">
            [ Area Isi Dokumen Naskah Soal & Lembar Jawab ]
          </div>
          <SignatureFooter config={sigState} />
        </div>
      </div>

      {/* Settings Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        
        {/* Form Column 1: Kop Surat Settings */}
        <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 className="font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between text-xs uppercase tracking-wide">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              1. Detail Kop Surat
            </span>
            <span className="pill pill-emerald text-[9px]">Kop Header</span>
          </h3>

          {/* Full Custom Header Toggle */}
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 text-[11px]">
                🖼️ Gunakan Desain Kop Surat Sendiri (Upload PNG/JPG):
              </span>
              <input
                type="checkbox"
                checked={!!kopState.useCustomFullKop}
                onChange={(e) => setKopState({ ...kopState, useCustomFullKop: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </div>
            {kopState.useCustomFullKop && (
              <div className="space-y-2 pt-1">
                <label className="block text-[10px] font-semibold text-amber-900">
                  Upload Gambar Kop Surat Lengkap (PNG / JPG):
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => handleFileUpload(e, "fullKop")}
                  className="w-full text-[10px] text-slate-600 bg-white p-1.5 border border-amber-300 rounded-lg"
                />
                {kopState.customFullKopUrl && (
                  <div className="mt-2 p-2 bg-white rounded border border-amber-300 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-emerald-800">Pratinjau Gambar Kop:</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={kopState.customFullKopUrl}
                      alt="Pratinjau Kop Surat"
                      className="max-h-20 object-contain w-full rounded"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {!kopState.useCustomFullKop ? (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Yayasan:</label>
                <input
                  type="text"
                  value={kopState.yayasanName}
                  onChange={(e) => setKopState({ ...kopState, yayasanName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lembaga / Sekolah:</label>
                <input
                  type="text"
                  value={kopState.institutionName}
                  onChange={(e) => setKopState({ ...kopState, institutionName: e.target.value as SchoolType })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-extrabold text-emerald-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Akreditasi:</label>
                  <input
                    type="text"
                    value={kopState.akreditasi}
                    onChange={(e) => setKopState({ ...kopState, akreditasi: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NPSN / NSS:</label>
                  <input
                    type="text"
                    value={kopState.npsnNss}
                    onChange={(e) => setKopState({ ...kopState, npsnNss: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap:</label>
                <textarea
                  value={kopState.address}
                  onChange={(e) => setKopState({ ...kopState, address: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kontak Telepon & Email:</label>
                <input
                  type="text"
                  value={kopState.phoneEmail}
                  onChange={(e) => setKopState({ ...kopState, phoneEmail: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upload Logo Kiri:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "logoLeft")}
                    className="w-full text-[10px] text-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Garis Pembatas Kop:</label>
                  <select
                    value={kopState.headerLineStyle}
                    onChange={(e) => setKopState({ ...kopState, headerLineStyle: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800"
                  >
                    <option value="double">Garis Ganda Hitam</option>
                    <option value="gold">Garis Emas Pesantren</option>
                    <option value="single">Garis Tunggal Minimalis</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Garis Pembatas Kop:</label>
              <select
                value={kopState.headerLineStyle}
                onChange={(e) => setKopState({ ...kopState, headerLineStyle: e.target.value as any })}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800"
              >
                <option value="double">Garis Ganda Hitam</option>
                <option value="gold">Garis Emas Pesantren</option>
                <option value="single">Garis Tunggal Minimalis</option>
              </select>
            </div>
          )}
        </div>

        {/* Form Column 2: Signature & Stamp Settings */}
        <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 className="font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between text-xs uppercase tracking-wide">
            <span className="flex items-center gap-1.5">
              <FilePen className="w-4 h-4 text-emerald-700" />
              2. Tanda Tangan Digital & Stempel
            </span>
            <span className="pill pill-amber text-[9px]">Autentikasi</span>
          </h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lokasi & Tanggal Dokumen:</label>
            <input
              type="text"
              value={sigState.locationDate}
              onChange={(e) => setSigState({ ...sigState, locationDate: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold"
            />
          </div>

          {/* Principal details */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 text-[11px] block">
              👤 Details Kepala Sekolah:
            </span>
            <input
              type="text"
              value={sigState.principalName}
              onChange={(e) => setSigState({ ...sigState, principalName: e.target.value })}
              placeholder="Nama Kepala Sekolah & Gelar"
              className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold"
            />
            <input
              type="text"
              value={sigState.principalNip}
              onChange={(e) => setSigState({ ...sigState, principalNip: e.target.value })}
              placeholder="NIP / NIY"
              className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium"
            />
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                Upload File TTD Kepala Sekolah (PNG Transparan):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "principalSig")}
                className="w-full text-[10px] text-slate-500"
              />
            </div>
          </div>

          {/* Teacher details */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 text-[11px] block">
              👤 Details Guru Penyusun / Pengampu:
            </span>
            <input
              type="text"
              value={sigState.teacherName}
              onChange={(e) => setSigState({ ...sigState, teacherName: e.target.value })}
              placeholder="Nama Guru & Gelar"
              className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold"
            />
            <input
              type="text"
              value={sigState.teacherNip}
              onChange={(e) => setSigState({ ...sigState, teacherNip: e.target.value })}
              placeholder="NIP / NIY Guru"
              className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium"
            />
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                Upload File TTD Guru Pengampu (PNG Transparan):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "teacherSig")}
                className="w-full text-[10px] text-slate-500"
              />
            </div>
          </div>

          {/* Stamp toggle */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 text-[11px]">
                🏵️ Stempel Resmi Digital Sekolah:
              </span>
              <input
                type="checkbox"
                checked={sigState.showSchoolStamp}
                onChange={(e) => setSigState({ ...sigState, showSchoolStamp: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </div>
            {sigState.showSchoolStamp && (
              <>
                <input
                  type="text"
                  value={sigState.stampText}
                  onChange={(e) => setSigState({ ...sigState, stampText: e.target.value })}
                  placeholder="Teks Lingkaran Stempel"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-mono"
                />
                <input
                  type="text"
                  value={sigState.verificationCode}
                  onChange={(e) => setSigState({ ...sigState, verificationCode: e.target.value })}
                  placeholder="Kode Verifikasi QR"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-mono"
                />
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
