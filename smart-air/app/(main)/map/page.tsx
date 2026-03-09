"use client";

"use client";

import MapLegend from "@/components/map/map-legend";
import MapWrapper from "@/components/map/MapWrapper";
import { PollutionTableSection } from "@/components/pollution/pollution-table-section";
import { getPM25Band } from "@/lib/utils";
import { MOCK_AIR_STATIONS } from "@/lib/mock-air-stations";
import * as React from "react";

export default function MainPage() {
  const [selectedProvinces, setSelectedProvinces] = React.useState<string[]>(
    [],
  );
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  const filteredMapData = React.useMemo(() => {
    return MOCK_AIR_STATIONS.filter((item) => {
      const matchesProvince =
        selectedProvinces.length === 0 ||
        selectedProvinces.includes(item.province);
      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(getPM25Band(item.pm25).labelTh);

      return matchesProvince && matchesStatus;
    });
  }, [selectedProvinces, selectedStatuses]);

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Air Quality Monitoring</h1>

      <div className="overflow-hidden rounded-2xl shadow-lg">
        <MapWrapper airData={filteredMapData} />
      </div>

      <MapLegend />

      <PollutionTableSection
        selectedProvinces={selectedProvinces}
        onSelectedProvincesChange={setSelectedProvinces}
        selectedStatuses={selectedStatuses}
        onSelectedStatusesChange={setSelectedStatuses}
        className="px-0 pb-0"
      />
    </main>
  );
}
