"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { SignatureConfig } from "@/types/exam";
import { SchoolStamp } from "./school-stamp";

interface SignatureFooterProps {
  config: SignatureConfig;
}

export function SignatureFooter({ config }: SignatureFooterProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (config.qrCodeVerification) {
      const textToEncode =
        config.verificationCode && config.verificationCode.trim() !== ""
          ? config.verificationCode
          : "ALHAMIDY-VERIFIED-DOC";
      QRCode.toDataURL(
        textToEncode,
        {
          margin: 1,
          width: 120,
          color: {
            dark: "#064e3b", // emerald-900
            light: "#ffffff",
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [config.qrCodeVerification, config.verificationCode]);

  return (
    <div className="w-full mt-8 pt-4 border-t border-slate-300 text-slate-900 select-none print:mt-6 print:pt-2 page-break-inside-avoid font-times">
      <div className="flex items-start justify-between text-xs">
        {/* Left Side: Principal */}
        <div className="relative text-center w-56 flex flex-col items-center">
          <p className="font-semibold text-slate-800">Mengetahui,</p>
          <p className="font-bold text-slate-900 mb-2">{config.principalTitle}</p>

          {/* Signature Area */}
          <div className="relative w-44 h-20 my-1 flex items-center justify-center border border-dashed border-emerald-300/40 rounded-lg bg-emerald-50/20 print:border-none print:bg-transparent">
            {config.principalSignatureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.principalSignatureUrl}
                alt="TTD Kepala Sekolah"
                className="max-h-16 object-contain z-10"
              />
            ) : (
              /* Simulated Cursive TTD */
              <span className="font-serif italic text-lg tracking-widest text-emerald-800 font-bold opacity-80 z-10">
                {config.principalName.split(" ")[1] || "Ahmad"}...
              </span>
            )}

            {/* School Stamp Overlay */}
            {config.showSchoolStamp && (
              <div className="absolute -left-6 -top-2 z-20 pointer-events-none">
                <SchoolStamp stampText={config.stampText} verificationCode={config.verificationCode} size={92} />
              </div>
            )}
          </div>

          <p className="font-bold text-slate-900 underline mt-1">{config.principalName}</p>
          <p className="text-[10px] text-slate-600">{config.principalNip}</p>
        </div>

        {/* Center: Verification QR Code */}
        {config.qrCodeVerification && (
          <div className="flex flex-col items-center justify-center px-2 py-1 border border-emerald-200 bg-emerald-50/50 rounded text-center print:border-slate-300">
            <div className="w-12 h-12 bg-white p-0.5 border border-slate-300 rounded shadow-2xs flex items-center justify-center">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="QR Verifikasi TTD"
                  className="w-full h-full object-contain print:block"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 animate-pulse rounded" />
              )}
            </div>
            <p className="text-[9px] font-mono text-emerald-900 font-semibold mt-1">VERIFIED TTD</p>
            <p className="text-[8px] font-mono text-slate-500">{config.verificationCode}</p>
          </div>
        )}

        {/* Right Side: Teacher / Guru Penyusun */}
        <div className="text-center w-56 flex flex-col items-center">
          <p className="font-semibold text-slate-800">{config.locationDate}</p>
          <p className="font-bold text-slate-900 mb-2">{config.teacherTitle}</p>

          {/* Signature Area */}
          <div className="relative w-44 h-20 my-1 flex items-center justify-center border border-dashed border-emerald-300/40 rounded-lg bg-emerald-50/20 print:border-none print:bg-transparent">
            {config.teacherSignatureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.teacherSignatureUrl}
                alt="TTD Guru"
                className="max-h-16 object-contain z-10"
              />
            ) : (
              /* Simulated Cursive TTD */
              <span className="font-serif italic text-lg tracking-widest text-emerald-800 font-bold opacity-80 z-10">
                {config.teacherName.split(" ")[1] || "Pengampu"}...
              </span>
            )}
          </div>

          <p className="font-bold text-slate-900 underline mt-1">{config.teacherName}</p>
          <p className="text-[10px] text-slate-600">{config.teacherNip}</p>
        </div>
      </div>
    </div>
  );
}
