"use client";

import { apiClient } from "@/lib/axios";
import type {
  PollutionDayDetail,
  PollutionRecordType,
} from "@/types/pollution";
import * as React from "react";

interface UsePollutionDayDetailParams {
  type?: PollutionRecordType;
  id?: number;
  enabled?: boolean;
}

interface UsePollutionDayDetailResult {
  data: PollutionDayDetail | null;
  isLoading: boolean;
  error: string | null;
}

export function usePollutionDayDetail({
  type,
  id,
  enabled = true,
}: UsePollutionDayDetailParams): UsePollutionDayDetailResult {
  const [data, setData] = React.useState<PollutionDayDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!type || id === undefined || !enabled) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchDetail() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get<PollutionDayDetail>(
          "/pollution/detail",
          {
            params: { type, id },
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

        console.error("Failed to load day detail", fetchError);
        setData(null);
        setError("Unable to load pollution detail");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchDetail();

    return () => {
      controller.abort();
    };
  }, [type, id, enabled]);

  return { data, isLoading, error };
}
