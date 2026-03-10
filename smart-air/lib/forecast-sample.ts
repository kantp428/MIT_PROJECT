export type ForecastType = "ACTUAL" | "PREDICTED";

export interface ForecastDetails {
  date: string;
  pm: number | null;
  temp: number | null;
  humidity: number | null;
  wind_speed: number | null;
}

export interface ForecastItem {
  id: number;
  type: ForecastType;
  day: string;
  date: string;
  isoDate: string;
  value: number;
  trend: string;
  details: ForecastDetails;
}

export interface ForecastResponse {
  locationId: number;
  provinceName: string;
  data: ForecastItem[];
}

const FO_ITEM = (
  id: number,
  type: ForecastType,
  day: string,
  date: string,
  isoDate: string,
  value: number,
  trend: string,
): ForecastItem => ({
  id,
  type,
  day,
  date,
  isoDate,
  value,
  trend,
  details: {
    date: isoDate,
    pm: value,
    temp: null,
    humidity: null,
    wind_speed: null,
  },
});

export const FALLBACK_FORECAST: ForecastResponse = {
  locationId: 1,
  provinceName: "กรุงเทพมหานคร",
  data: [
    FO_ITEM(1, "ACTUAL", "Tue", "03 Mar", "2026-03-03", 36, "เริ่มสะสม"),
    FO_ITEM(2, "ACTUAL", "Wed", "04 Mar", "2026-03-04", 41, "เพิ่มขึ้นเล็กน้อย"),
    FO_ITEM(3, "ACTUAL", "Thu", "05 Mar", "2026-03-05", 47, "เพิ่มขึ้น"),
    FO_ITEM(4, "ACTUAL", "Fri", "06 Mar", "2026-03-06", 44, "ทรงตัว"),
    FO_ITEM(5, "ACTUAL", "Sat", "07 Mar", "2026-03-07", 39, "ลดลงเล็กน้อย"),
    FO_ITEM(6, "ACTUAL", "Sun", "08 Mar", "2026-03-08", 34, "อยู่ในเกณฑ์ปานกลาง"),
    FO_ITEM(7, "ACTUAL", "Mon", "09 Mar", "2026-03-09", 42, "เพิ่มขึ้นเล็กน้อย"),
    FO_ITEM(1, "PREDICTED", "Tue", "10 Mar", "2026-03-10", 38, "ปัจจุบันทรงตัว"),
    FO_ITEM(2, "PREDICTED", "Wed", "11 Mar", "2026-03-11", 29, "ลดลง"),
    FO_ITEM(3, "PREDICTED", "Thu", "12 Mar", "2026-03-12", 55, "เพิ่มขึ้น"),
    FO_ITEM(4, "PREDICTED", "Fri", "13 Mar", "2026-03-13", 61, "สูงต่อเนื่อง"),
    FO_ITEM(5, "PREDICTED", "Sat", "14 Mar", "2026-03-14", 34, "เริ่มดีขึ้น"),
    FO_ITEM(6, "PREDICTED", "Sun", "15 Mar", "2026-03-15", 22, "อยู่ในเกณฑ์ดี"),
    FO_ITEM(7, "PREDICTED", "Mon", "16 Mar", "2026-03-16", 27, "ยังคงดี"),
  ],
};

export const FALLBACK_DETAIL_MAP = new Map<string, ForecastDetails>(
  FALLBACK_FORECAST.data.map((item) => [
    `${item.type}:${item.id}`,
    item.details,
  ]),
);
