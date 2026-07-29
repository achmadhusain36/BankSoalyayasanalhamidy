"use client";

import React from "react";

interface SchoolStampProps {
  stampText?: string;
  verificationCode?: string;
  size?: number;
}

export function SchoolStamp({
  stampText = "YAYASAN AL-HAMIDY * STEMPEL RESMI *",
  verificationCode = "ALH-2026-VAL",
  size = 110,
}: SchoolStampProps) {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className="relative flex items-center justify-center select-none pointer-events-none opacity-85 rotate-[-8deg] filter drop-shadow-xs"
    >
      <svg viewBox="0 0 120 120" className="w-full h-full text-cyan-800 border-cyan-800">
        {/* Outer Circular Ring */}
        <circle cx="60" cy="60" r="56" fill="none" stroke="#0369a1" strokeWidth="3" strokeDasharray="100 0" />
        <circle cx="60" cy="60" r="51" fill="none" stroke="#0284c7" strokeWidth="1" />

        {/* Circular Text Path */}
        <path id="stampCirclePath" d="M 60,60 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0" fill="none" />
        
        <text fontSize="7.5" fontWeight="bold" fill="#0284c7" letterSpacing="1">
          <textPath href="#stampCirclePath" startOffset="0%">
            {stampText.toUpperCase()}
          </textPath>
        </text>

        {/* Inner Stars & Center Box */}
        <circle cx="60" cy="60" r="32" fill="none" stroke="#0369a1" strokeWidth="1.5" />
        
        {/* Center Star & Verification Text */}
        <polygon points="60,35 63,42 70,42 65,47 67,54 60,50 53,54 55,47 50,42 57,42" fill="#0284c7" />
        
        <text x="60" y="64" fill="#0369a1" fontSize="7" fontWeight="bold" textAnchor="middle">
          LULUS VERIFIKASI
        </text>
        <text x="60" y="73" fill="#0284c7" fontSize="5.5" fontWeight="semibold" textAnchor="middle">
          {verificationCode}
        </text>

        {/* Star Accents on sides */}
        <circle cx="24" cy="60" r="2" fill="#0284c7" />
        <circle cx="96" cy="60" r="2" fill="#0284c7" />
      </svg>
    </div>
  );
}
