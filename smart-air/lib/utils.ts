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

export interface PM25Band extends PM25Status {
  min: number;
  max: number | null;
}

export const PM25_BANDS: PM25Band[] = [
  {
    labelEn: "Good",
    labelTh: "ดีมาก",
    color: "oklch(0.7666 0.1212 171.81)",
    min: 0,
    max: 15,
  },
  {
    labelEn: "Moderate",
    labelTh: "ปานกลาง",
    color: "oklch(0.8776 0.1574 105.85)",
    min: 15.1,
    max: 25,
  },
  {
    labelEn: "Unhealthy for Sensitive Groups",
    labelTh: "เริ่มมีผลต่อสุขภาพ",
    color: "oklch(0.7816 0.1426 71.53)",
    min: 25.1,
    max: 37.5,
  },
  {
    labelEn: "Unhealthy",
    labelTh: "มีผลต่อสุขภาพ",
    color: "oklch(0.6012 0.182 24.81)",
    min: 37.6,
    max: 75,
  },
  {
    labelEn: "Very Unhealthy",
    labelTh: "มีผลต่อสุขภาพมาก",
    color: "oklch(0.4188 0.1565 13.76)",
    min: 75.1,
    max: 250.5,
  },
  {
    labelEn: "Hazardous",
    labelTh: "อันตราย",
    color: "oklch(0.4349 0.1687 326.19)",
    min: 250.6,
    max: null,
  },
];

export function getPM25Constant(value: number): PM25Status {
  const status =
    PM25_BANDS.find((band) => band.max === null || value <= band.max) ??
    PM25_BANDS[PM25_BANDS.length - 1];

  return {
    labelEn: status.labelEn,
    labelTh: status.labelTh,
    color: status.color,
  };
}

export function getPM25Band(value: number): PM25Band {
  return (
    PM25_BANDS.find((band) => band.max === null || value <= band.max) ??
    PM25_BANDS[PM25_BANDS.length - 1]
  );
}

export function formatPM25Range(band: Pick<PM25Band, "min" | "max">) {
  return band.max === null ? `${band.min}+ µg/m³` : `${band.min} - ${band.max} µg/m³`;
}
