import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PM25Status {
  labelEn: string;
  labelTh: string;
  color: string;
}

export function getPM25Constant(value: number): PM25Status {
  // ดีมาก (0 - 15)
  if (value <= 15) {
    return {
      labelEn: "Good",
      labelTh: "ดีมาก",
      color: "oklch(0.7666 0.1212 171.81)",
    };
  }
  // ปานกลาง (15.1 - 25)
  if (value <= 25) {
    return {
      labelEn: "Moderate",
      labelTh: "ปานกลาง",
      color: "oklch(0.8776 0.1574 105.85)",
    };
  }
  // เริ่มมีผลต่อสุขภาพ (25.1 - 37.5)
  if (value <= 37.5) {
    return {
      labelEn: "Unhealthy for Sensitive Groups",
      labelTh: "เริ่มมีผลต่อสุขภาพ",
      color: "oklch(0.7816 0.1426 71.53)",
    };
  }
  // มีผลต่อสุขภาพ (37.5 - 75)
  if (value <= 75) {
    return {
      labelEn: "Unhealthy",
      labelTh: "มีผลต่อสุขภาพ",
      color: "oklch(0.6012 0.182 24.81)",
    };
  }
  // มีผลต่อสุขภาพมาก (75.1 - 250.5)
  if (value <= 250.5) {
    return {
      labelEn: "Very Unhealthy",
      labelTh: "มีผลต่อสุขภาพมาก",
      color: "oklch(0.4188 0.1565 13.76)",
    };
  }

  // อันตราย (> 250.5)
  return {
    labelEn: "Hazardous",
    labelTh: "อันตราย",
    color: "oklch(0.4349 0.1687 326.19)",
  };
}
