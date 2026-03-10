"use client";

import { apiClient } from "@/lib/axios";
import type {
  PollutionPagination,
  PollutionPredictionResponse,
  PollutionPredictionRow,
} from "@/types/pollution";
import * as React from "react";

interface UsePollutionPredictionsResult {
  data: PollutionPredictionRow[];
  pagination: PollutionPagination | null;
  isLoading: boolean;
  error: string | null;
}

export function usePollutionPredictions(
  page = 1,
  limit = 20,
): UsePollutionPredictionsResult {
  const [data, setData] = React.useState<PollutionPredictionRow[]>([]);
  const [pagination, setPagination] = React.useState<PollutionPagination | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function fetchPredictions() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get<PollutionPredictionResponse>(
          "/pollution/list",
          {
            params: {
              page,
              limit,
            },
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) {
          return;
        }

        setData(response.data.data);
        setPagination(response.data.pagination);
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to load pollution predictions", fetchError);
        setError("Unable to load pollution predictions");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchPredictions();

    return () => {
      controller.abort();
    };
  }, [page, limit]);

  return { data, pagination, isLoading, error };
}
