"use client";

import MapWrapper from "@/components/map/MapWrapper";
import { AirStation } from "@/types/air-quality";

export default function Home() {
  // ข้อมูลตัวอย่างที่ตรงตาม Interface AirStation
  const mockData: AirStation[] = [
    {
      id: 1,
      name: "เขตพญาไท",
      lat: 13.78,
      lng: 100.54,
      pm25: 38,
      lastUpdated: "2026-02-16",
    },
    {
      id: 2,
      name: "อ.เมือง เชียงใหม่",
      lat: 18.79,
      lng: 98.98,
      pm25: 82,
      lastUpdated: "2026-02-16",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Air Quality Monitoring</h1>

      {/* เรียกใช้ Wrapper ตรงๆ ได้เลย เพราะข้างในมันจัดการ ssr: false ไว้แล้ว */}
      <div className="rounded-2xl shadow-lg overflow-hidden">
        <MapWrapper airData={mockData} />
      </div>
    </main>
  );
}
