"use client";

import { AirStation } from "@/types/air-quality";
import dynamic from "next/dynamic";

// ย้าย dynamic import มาไว้ที่นี่
const ThailandMap = dynamic(() => import("@/components/map/ThailandMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-gray-50 border rounded-xl">
      <p className="animate-pulse">กำลังโหลดแผนที่...</p>
    </div>
  ),
});

interface MapWrapperProps {
  airData: AirStation[];
}

export default function MapWrapper({ airData }: MapWrapperProps) {
  return (
    <div className="h-[600px] w-full">
      <ThailandMap airData={airData} />
    </div>
  );
}
