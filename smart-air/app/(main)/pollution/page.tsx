"use client";

import { PollutionTableSection } from "@/components/pollution/pollution-table-section";
import { MOCK_AIR_STATIONS } from "@/lib/mock-air-stations";

export default function PollutionPage() {
  return <PollutionTableSection airData={MOCK_AIR_STATIONS} />;
}
