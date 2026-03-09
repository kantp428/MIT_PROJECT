import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FALLBACK_DETAIL_MAP } from "@/lib/forecast-sample";

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
      const actual = await prisma.pm_actual.findUnique({
        where: {
          id,
        },
      });

      if (!actual) {
        return NextResponse.json(
          { message: "Actual record not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        date: actual.date.toISOString().slice(0, 10),
        pm: actual.pm === null ? null : Number(actual.pm),
        temp: actual.temp === null ? null : Number(actual.temp),
        humidity: actual.humidity ?? null,
        wind_speed:
          actual.wind_speed === null ? null : Number(actual.wind_speed),
      });
    }

    if (type === "PREDICTED") {
      const prediction = await prisma.pm_prediction.findUnique({
        where: {
          id,
        },
      });

      if (!prediction) {
        return NextResponse.json(
          { message: "Prediction record not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        date: prediction.predicted_for.toISOString().slice(0, 10),
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
