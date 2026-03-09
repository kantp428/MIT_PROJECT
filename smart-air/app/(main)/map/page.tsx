"use client";

import MapWrapper from "@/components/map/MapWrapper";
import { PollutionTableSection } from "@/components/pollution/pollution-table-section";
import { MOCK_AIR_STATIONS } from "@/lib/mock-air-stations";

export default function MainPage() {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Air Quality Monitoring</h1>

      <div className="overflow-hidden rounded-2xl shadow-lg">
        <MapWrapper airData={MOCK_AIR_STATIONS} />
      </div>

      <PollutionTableSection
        airData={MOCK_AIR_STATIONS}
        className="px-0 pb-0"
      />
    </main>
  );
}
