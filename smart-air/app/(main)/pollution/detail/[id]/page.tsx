import Link from "next/link";

import { PMForecastSevenDaysClient } from "@/components/forecast/pm-forecast-seven-days-client";

export default async function PMForecast({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-7xl p-6">
      <Link
        href="/pollution"
        className="mb-6 inline-flex items-center rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        Back
      </Link>

      <PMForecastSevenDaysClient locationId={Number(id)} />
    </main>
  );
}
