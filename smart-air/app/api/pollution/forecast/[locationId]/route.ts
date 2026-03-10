import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { FALLBACK_FORECAST } from "@/lib/forecast-sample";

const DAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
});

const formatIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const describeTrend = (
  current: number | null,
  previous: number | null,
): string => {
  if (current === null || previous === null) {
    return "ข้อมูลไม่พอ";
  }

  const diff = current - previous;
  if (Math.abs(diff) < 3) {
    return "ทรงตัว";
  }

  if (diff > 0) {
    return diff >= 10 ? "เพิ่มขึ้นอย่างมีนัยสำคัญ" : "เพิ่มขึ้นเล็กน้อย";
  }

  return diff <= -10 ? "ลดลงอย่างมาก" : "ลดลงเล็กน้อย";
};

const buildForecastItem = (
  id: number,
  type: "ACTUAL" | "PREDICTED",
  date: Date,
  value: number | null,
  trend: string,
) => ({
  id,
  type,
  day: DAY_FORMATTER.format(date),
  date: DATE_FORMATTER.format(date),
  isoDate: formatIsoDate(date),
  value,
  trend,
});

interface ActualRow {
  id: number;
  date_text: string;
  pm: Prisma.Decimal | null;
}

interface PredictedRow {
  id: number;
  predicted_for_text: string;
  pm_predicted: Prisma.Decimal | null;
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ locationId: string }> },
) {
  const { locationId: locationIdParam } = await params;
  const locationId = Number(locationIdParam);
  if (Number.isNaN(locationId)) {
    return NextResponse.json(
      { message: "Invalid locationId" },
      { status: 400 },
    );
  }

  const respondWithFallback = (error: unknown) => {
    console.error("Forecast lookup failed", error);
    if (locationId === FALLBACK_FORECAST.locationId) {
      return NextResponse.json(FALLBACK_FORECAST);
    }

    return NextResponse.json(
      { message: "Unable to load forecast data" },
      { status: 500 },
    );
  };

  try {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      select: {
        id: true,
        province: true,
      },
    });

    if (!location) {
      return NextResponse.json(
        { message: "Location not found" },
        { status: 404 },
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const actualStart = new Date(today);
    actualStart.setDate(today.getDate() - 7);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const predictedEnd = new Date(today);
    predictedEnd.setDate(today.getDate() + 6);
    const actualStartText = formatIsoDate(actualStart);
    const yesterdayText = formatIsoDate(yesterday);
    const todayText = formatIsoDate(today);
    const predictedEndText = formatIsoDate(predictedEnd);

    const actualRows = await prisma.$queryRaw<ActualRow[]>(Prisma.sql`
      SELECT
        id,
        date::text AS date_text,
        pm
      FROM pm_actual
      WHERE location_id = ${locationId}
        AND date BETWEEN ${actualStartText}::date AND ${yesterdayText}::date
      ORDER BY date ASC
    `);

    const predictedRows = await prisma.$queryRaw<PredictedRow[]>(Prisma.sql`
      SELECT
        p.id,
        p.predicted_for::text AS predicted_for_text,
        p.pm_predicted
      FROM pm_prediction p
      INNER JOIN pm_actual a ON a.id = p.pm_actual_id
      WHERE a.location_id = ${locationId}
        AND a.date = ${yesterdayText}::date
        AND p.predicted_for BETWEEN ${todayText}::date AND ${predictedEndText}::date
      ORDER BY p.predicted_for ASC
    `);

    const actualMap = new Map(
      actualRows.map((row) => [row.date_text, row]),
    );

    const predictedMap = new Map(
      predictedRows.map((row) => [row.predicted_for_text, row]),
    );

    const actualItems = [];
    let previousValue: number | null = null;
    for (let i = 0; i < 7; i++) {
      const date = new Date(actualStart);
      date.setDate(actualStart.getDate() + i);
      const iso = formatIsoDate(date);
      const row = actualMap.get(iso);
      const pm = row ? Number(row.pm) : null;

      const trend = describeTrend(pm, previousValue);
      previousValue = pm ?? previousValue;

      actualItems.push(
        buildForecastItem(row ? row.id : i + 1, "ACTUAL", date, pm, trend),
      );
    }

    const predictedItems = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const iso = formatIsoDate(date);
      const row = predictedMap.get(iso);
      const pm = row ? Number(row.pm_predicted) : null;

      const trend = describeTrend(pm, previousValue);
      previousValue = pm ?? previousValue;

      predictedItems.push(
        buildForecastItem(row ? row.id : i + 1, "PREDICTED", date, pm, trend),
      );
    }

    return NextResponse.json({
      locationId,
      provinceName: location.province,
      data: [...actualItems, ...predictedItems],
    });
  } catch (error) {
    return respondWithFallback(error);
  }
}
