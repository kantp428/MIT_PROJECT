import { AirStation } from "@/types/air-quality";

export const MOCK_AIR_STATIONS: AirStation[] = [
  {
    id: 1,
    name: "เขตพื้นที่",
    province: "กรุงเทพมหานคร",
    lat: 13.78,
    lng: 100.54,
    pm25: 38,
    lastUpdated: "2026-02-16",
  },
  {
    id: 2,
    name: "อ.เมือง เชียงใหม่",
    province: "เชียงใหม่",
    lat: 18.79,
    lng: 98.98,
    pm25: 82,
    lastUpdated: "2026-02-16",
  },
];
