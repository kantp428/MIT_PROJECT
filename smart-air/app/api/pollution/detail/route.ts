import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { FALLBACK_DETAIL_MAP } from "@/lib/forecast-sample";

interface ActualDetailRow {
  date: string;
  pm: Prisma.Decimal | null;
  temp: Prisma.Decimal | null;
  humidity: number | null;
  wind_speed: Prisma.Decimal | null;
}

interface PredictedDetailRow {
  date: string;
  pm_predicted: Prisma.Decimal | null;
  temp: Prisma.Decimal | null;
  humidity: number | null;
  wind_speed: Prisma.Decimal | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = Number(searchParams.get("id"));

  if (!type || Number.isNaN(id)) {
    return NextResponse.json(
      { message: "Missing type or id query parameter" },
      { status: 400 },
    );
  }

  const respondWithFallback = (error: unknown) => {
    console.error("Detail lookup failed", error);
    const fallback = FALLBACK_DETAIL_MAP.get(`${type}:${id}`);
    if (fallback) {
      return NextResponse.json(fallback);
    }

    return NextResponse.json(
      { message: "Unable to load detail data" },
      { status: 500 },
    );
  };

  try {
    if (type === "ACTUAL") {
      const actualRows = await prisma.$queryRaw<ActualDetailRow[]>(Prisma.sql`
        SELECT
          date::text AS date,
          pm,
          temp,
          humidity,
          wind_speed
        FROM pm_actual
        WHERE id = ${id}
        LIMIT 1
      `);
      const actual = actualRows[0];

      if (!actual) {
        return NextResponse.json(
          { message: "Actual record not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        date: actual.date,
        pm: actual.pm === null ? null : Number(actual.pm),
        temp: actual.temp === null ? null : Number(actual.temp),
        humidity: actual.humidity ?? null,
        wind_speed:
          actual.wind_speed === null ? null : Number(actual.wind_speed),
      });
    }

    if (type === "PREDICTED") {
      const predictionRows = await prisma.$queryRaw<PredictedDetailRow[]>(
        Prisma.sql`
          SELECT
            predicted_for::text AS date,
            pm_predicted,
            temp,
            humidity,
            wind_speed
          FROM pm_prediction
          WHERE id = ${id}
          LIMIT 1
        `,
      );
      const prediction = predictionRows[0];

      if (!prediction) {
        return NextResponse.json(
          { message: "Prediction record not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        date: prediction.date,
        pm:
          prediction.pm_predicted === null
            ? null
            : Number(prediction.pm_predicted),
        temp: prediction.temp === null ? null : Number(prediction.temp),
        humidity: prediction.humidity ?? null,
        wind_speed:
          prediction.wind_speed === null ? null : Number(prediction.wind_speed),
      });
    }

    return NextResponse.json({ message: "Unsupported type" }, { status: 400 });
  } catch (error) {
    return respondWithFallback(error);
  }
}
