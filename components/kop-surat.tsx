"use client";

import React from "react";
import { KopHeaderConfig } from "@/types/exam";
import { DEFAULT_KOP_SMP, DEFAULT_KOP_SMA } from "@/lib/default-data";
import { SchoolLogo } from "./school-logo";

interface KopSuratProps {
  config?: KopHeaderConfig;
  institution?: string;
}

export function KopSurat({ config, institution }: KopSuratProps) {
  const effectiveConfig =
    config ||
    (institution === "SMA Plus Al-Hamidy" ? DEFAULT_KOP_SMA : DEFAULT_KOP_SMP);

  if (!effectiveConfig) return null;

  return (
    <div className="w-full mb-4 text-slate-900 select-none print:mb-3">
      {effectiveConfig.useCustomFullKop && effectiveConfig.customFullKopUrl ? (
        <div className="w-full flex justify-center pb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={effectiveConfig.customFullKopUrl}
            alt="Kop Surat Resmi"
            className="w-full h-auto block"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 pb-2">
          {/* Left Logo */}
          <div className="shrink-0 flex items-center justify-center">
            <SchoolLogo school={effectiveConfig.institutionName} customLogoUrl={effectiveConfig.logoLeftUrl} size={76} />
          </div>

          {/* Center Kop Text */}
          <div className="flex-1 text-center font-times leading-tight">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-wider uppercase">
              {effectiveConfig.yayasanName}
            </h3>
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-wide text-emerald-950 uppercase my-0.5">
              {effectiveConfig.institutionName}
            </h1>
            <p className="text-[11px] font-bold text-emerald-800 tracking-normal">
              {effectiveConfig.akreditasi} | {effectiveConfig.npsnNss}
            </p>
            <p className="text-[10.5px] text-slate-700 mt-1 leading-normal">
              {effectiveConfig.address}
            </p>
            <p className="text-[10px] text-slate-600">
              {effectiveConfig.phoneEmail} | Web: {effectiveConfig.website}
            </p>
          </div>

          {/* Right Secondary Emblem or Empty spacer for symmetry */}
          <div className="shrink-0 flex items-center justify-center">
            {effectiveConfig.logoRightUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={effectiveConfig.logoRightUrl} alt="Logo Samping" className="w-[72px] h-[72px] object-contain" />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full border border-dashed border-emerald-300/60 flex items-center justify-center text-[9px] font-sans text-emerald-600/70 text-center p-1 leading-none print:hidden">
                Al-Hamidy Center
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decorative Line Separator */}
      {effectiveConfig.headerLineStyle === "double" && (
        <div className="relative mt-1">
          <div className="border-b-[3px] border-emerald-950"></div>
          <div className="border-b-[1px] border-emerald-950 mt-[2px]"></div>
        </div>
      )}
      {effectiveConfig.headerLineStyle === "gold" && (
        <div className="relative mt-1">
          <div className="border-b-[3px] border-emerald-800"></div>
          <div className="border-b-[2px] border-amber-500 mt-[2px]"></div>
        </div>
      )}
      {effectiveConfig.headerLineStyle === "single" && (
        <div className="border-b-[2px] border-slate-900 mt-1"></div>
      )}
    </div>
  );
}
