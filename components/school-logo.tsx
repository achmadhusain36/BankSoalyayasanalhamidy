"use client";

import React from "react";
import { SchoolType } from "@/types/exam";

interface SchoolLogoProps {
  school: SchoolType;
  customLogoUrl?: string;
  size?: number;
}

export function SchoolLogo({ school, customLogoUrl, size = 72 }: SchoolLogoProps) {
  if (customLogoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={customLogoUrl}
        alt={`Logo ${school}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="object-contain"
      />
    );
  }

  const isSmp = school === "SMP Qur'an Al-Hamidy";

  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className="relative flex items-center justify-center rounded-full bg-emerald-900/10 p-1 border-2 border-emerald-700 shadow-xs select-none"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-800">
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="#047857" strokeWidth="4" />
        <circle cx="50" cy="50" r="41" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 2" />
        
        {/* Islamic Star / Octagram Background */}
        <path
          d="M50 10 L62 25 L80 20 L75 38 L90 50 L75 62 L80 80 L62 75 L50 90 L38 75 L20 80 L25 62 L10 50 L25 38 L20 20 L38 25 Z"
          fill="#065f46"
          opacity="0.1"
        />

        {/* Shield outline */}
        <path
          d="M30 25 L70 25 L70 55 C70 70 50 82 50 82 C50 82 30 70 30 55 Z"
          fill="#047857"
          stroke="#022c22"
          strokeWidth="2"
        />

        {/* Inside Shield: Rehal / Open Qur'an Icon */}
        <g transform="translate(35, 34) scale(0.6)">
          {/* Open Book pages */}
          <path d="M5 25 C15 15 25 22 25 35 C25 22 35 15 45 25 L45 42 C35 32 25 38 25 50 C25 38 15 32 5 42 Z" fill="#ffffff" />
          {/* Rehal base stand */}
          <path d="M8 40 L42 12 M42 40 L8 12" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Crescent and Star on Top */}
        <path
          d="M48 15 A 5 5 0 1 0 53 23 A 6 6 0 1 1 48 15 Z"
          fill="#fbbf24"
        />

        {/* Text Ribbon Arc */}
        <rect x="20" y="70" width="60" height="12" rx="3" fill="#15803d" stroke="#fef08a" strokeWidth="1" />
        <text
          x="50"
          y="78"
          fill="#ffffff"
          fontSize="7"
          fontWeight="bold"
          textAnchor="middle"
          className="tracking-tight"
        >
          {isSmp ? "SMP QUR'AN" : "SMA PLUS"}
        </text>
      </svg>
    </div>
  );
}
