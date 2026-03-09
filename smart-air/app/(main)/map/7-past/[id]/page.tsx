import { PMForecastSevenDaysClient } from "@/components/forecast/pm-forecast-seven-days-client";

export default async function PMForecast({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-7xl p-6">
      <PMForecastSevenDaysClient locationId={Number(id)} />
    </main>
  );
}
