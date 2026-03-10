"use client";

import { PMForecastSevenDays } from "@/components/forecast/pm-forecast-seven-days";
import { usePollutionForecastSummary } from "@/hooks/use-pollution-forecast-summary";

interface PMForecastSevenDaysClientProps {
  locationId: number;
}

export function PMForecastSevenDaysClient({
  locationId,
}: PMForecastSevenDaysClientProps) {
  const { data, isLoading, error } = usePollutionForecastSummary(locationId);

  if (isLoading) {
    return (
      <div className="rounded-[1.75rem] border bg-card p-6 text-sm text-muted-foreground shadow-sm md:p-8">
        Loading forecast...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[1.75rem] border bg-card p-6 text-sm text-red-600 shadow-sm md:p-8">
        {error ?? "Unable to load forecast data"}
      </div>
    );
  }

  return <PMForecastSevenDays forecastItem={data} />;
}
