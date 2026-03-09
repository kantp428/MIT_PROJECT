"use client";

import { apiClient } from "@/lib/axios";
import { LocationOption } from "@/types/location";
import * as React from "react";

interface UseLocationOptionsResult {
  data: LocationOption[];
  isLoading: boolean;
  error: string | null;
}

export function useLocationOptions(): UseLocationOptionsResult {
  const [data, setData] = React.useState<LocationOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function fetchLocationOptions() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get<LocationOption[]>(
          "/locations/options",
          {
            signal: controller.signal,
          },
        );

        setData(response.data);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setError("Failed to fetch location options");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchLocationOptions();

    return () => {
      controller.abort();
    };
  }, []);

  return { data, isLoading, error };
}
