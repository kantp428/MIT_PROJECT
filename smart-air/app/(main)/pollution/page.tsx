"use client";

import { PollutionTableSection } from "@/components/pollution/pollution-table-section";
import { usePollutionPredictions } from "@/hooks/use-pollution-predictions";
import * as React from "react";

const LIMIT_PER_PAGE = 20;

export default function PollutionPage() {
  const [page, setPage] = React.useState(1);

  const {
    data: predictions,
    pagination,
    isLoading,
    error,
  } = usePollutionPredictions(page, LIMIT_PER_PAGE);

  const airData = React.useMemo(
    () =>
      predictions.map((prediction) => ({
        id: prediction.id,
        name: prediction.provinceName,
        province: prediction.provinceName,
        lat: prediction.latitude ?? 0,
        lng: prediction.longitude ?? 0,
        pm25: prediction.PM25 ?? 0,
        lastUpdated: prediction.predicted_at,
      })),
    [predictions],
  );

  const hasPreviousPage = page > 1;
  const hasNextPage = Boolean(pagination && pagination.page < pagination.totalPage);

  return (
    <PollutionTableSection
      airData={airData}
      isLoading={isLoading}
      error={error}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
      onNextPage={() => {
        if (hasNextPage) {
          setPage((current) => current + 1);
        }
      }}
    />
  );
}
