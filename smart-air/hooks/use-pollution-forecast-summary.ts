"use client";

import { apiClient } from "@/lib/axios";
import type { PollutionForecastResponse } from "@/types/pollution";
import * as React from "react";

interface UseForecastSummaryResult {
  data: PollutionForecastResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function usePollutionForecastSummary(
  locationId?: number,
): UseForecastSummaryResult {
  const [data, setData] = React.useState<PollutionForecastResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (locationId === undefined) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchSummary() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get<PollutionForecastResponse>(
          `/pollution/forecast/${locationId}`,
          {
            signal: controller.signal,
          },
        );

        if (!controller.signal.aborted) {
          setData(response.data);
        }
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to load forecast summary", fetchError);
        setData(null);
        setError("Unable to load pollution forecast");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchSummary();

    return () => {
      controller.abort();
    };
  }, [locationId]);

  return { data, isLoading, error };
}
