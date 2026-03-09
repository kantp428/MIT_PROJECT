import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

interface ActualHistoryRow {
  id: number;
  location_id: number;
  date: string;
  pm: Prisma.Decimal | null;
  temp: Prisma.Decimal | null;
  dew_point: Prisma.Decimal | null;
  humidity: number | null;
  pressure: Prisma.Decimal | null;
  wind_speed: Prisma.Decimal | null;
  precipitation: Prisma.Decimal | null;
  wind_direction: Prisma.Decimal | null;
  fetched_at: Date;
}

interface ActualPayload {
  date?: string;
  pm?: number | null;
  temp?: number | null;
  dew_point?: number | null;
  humidity?: number | null;
  pressure?: number | null;
  wind_speed?: number | null;
  precipitation?: number | null;
  wind_direction?: number | null;
  fetched_at?: string;
}

const mapActualRow = (row: ActualHistoryRow) => ({
  id: row.id,
  location_id: row.location_id,
  date: row.date,
  pm: row.pm === null ? null : Number(row.pm),
  temp: row.temp === null ? null : Number(row.temp),
  dew_point: row.dew_point === null ? null : Number(row.dew_point),
  humidity: row.humidity,
  pressure: row.pressure === null ? null : Number(row.pressure),
  wind_speed: row.wind_speed === null ? null : Number(row.wind_speed),
  precipitation: row.precipitation === null ? null : Number(row.precipitation),
  wind_direction:
    row.wind_direction === null ? null : Number(row.wind_direction),
  fetched_at: row.fetched_at.toISOString(),
});

const parseNullableNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export async function GET(
  _: Request,
  { params }: { params: Promise<{ locationCode: string }> },
) {
  const { locationCode } = await params;

  if (!locationCode) {
    return NextResponse.json(
      { message: "Missing locationCode" },
      { status: 400 },
    );
  }

  try {
    const location = await prisma.location.findUnique({
      where: { code: locationCode },
      select: { code: true },
    });

    if (!location) {
      return NextResponse.json(
        { message: "Location not found" },
        { status: 404 },
      );
    }

    const rows = await prisma.$queryRaw<ActualHistoryRow[]>(Prisma.sql`
      SELECT
        a.id,
        a.location_id,
        a.date::text AS date,
        a.pm,
        a.temp,
        a.dew_point,
        a.humidity,
        a.pressure,
        a.wind_speed,
        a.precipitation,
        a.wind_direction,
        a.fetched_at
      FROM pm_actual a
      INNER JOIN location l ON l.id = a.location_id
      WHERE l.code = ${locationCode}
      ORDER BY a.date DESC
      LIMIT 14
    `);

    return NextResponse.json({
      locationCode: location.code,
      data: rows.map(mapActualRow),
    });
  } catch (error) {
    console.error("Failed to load actual pollution history", error);

    return NextResponse.json(
      { message: "Unable to load actual pollution history" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ locationCode: string }> },
) {
  const { locationCode } = await params;

  if (!locationCode) {
    return NextResponse.json(
      { message: "Missing locationCode" },
      { status: 400 },
    );
  }

  try {
    const payload = (await request.json()) as ActualPayload;

    if (!payload.date) {
      return NextResponse.json(
        { message: "Missing required field: date" },
        { status: 400 },
      );
    }

    const location = await prisma.location.findUnique({
      where: { code: locationCode },
      select: { id: true, code: true },
    });

    if (!location) {
      return NextResponse.json(
        { message: "Location not found" },
        { status: 404 },
      );
    }

    const pm = parseNullableNumber(payload.pm);
    const temp = parseNullableNumber(payload.temp);
    const dewPoint = parseNullableNumber(payload.dew_point);
    const humidity = parseNullableNumber(payload.humidity);
    const pressure = parseNullableNumber(payload.pressure);
    const windSpeed = parseNullableNumber(payload.wind_speed);
    const precipitation = parseNullableNumber(payload.precipitation);
    const windDirection = parseNullableNumber(payload.wind_direction);

    const numericValues = [
      pm,
      temp,
      dewPoint,
      humidity,
      pressure,
      windSpeed,
      precipitation,
      windDirection,
    ];

    if (numericValues.some((value) => Number.isNaN(value))) {
      return NextResponse.json(
        { message: "One or more numeric fields are invalid" },
        { status: 400 },
      );
    }

    const fetchedAt = payload.fetched_at ? new Date(payload.fetched_at) : null;
    if (payload.fetched_at && Number.isNaN(fetchedAt?.getTime())) {
      return NextResponse.json(
        { message: "Invalid fetched_at" },
        { status: 400 },
      );
    }

    const insertedRows = await prisma.$queryRaw<ActualHistoryRow[]>(Prisma.sql`
      INSERT INTO pm_actual (
        location_id,
        date,
        pm,
        temp,
        dew_point,
        humidity,
        pressure,
        wind_speed,
        precipitation,
        wind_direction,
        fetched_at
      )
      VALUES (
        ${location.id},
        ${payload.date}::date,
        ${pm},
        ${temp},
        ${dewPoint},
        ${humidity},
        ${pressure},
        ${windSpeed},
        ${precipitation},
        ${windDirection},
        COALESCE(${fetchedAt?.toISOString() ?? null}::timestamptz, NOW())
      )
      RETURNING
        id,
        location_id,
        date::text AS date,
        pm,
        temp,
        dew_point,
        humidity,
        pressure,
        wind_speed,
        precipitation,
        wind_direction,
        fetched_at
    `);

    return NextResponse.json(
      {
        locationCode: location.code,
        data: mapActualRow(insertedRows[0]),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create actual pollution record", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2010"
    ) {
      const dbCode = (error.meta as { code?: string } | undefined)?.code;
      if (dbCode === "23505") {
        return NextResponse.json(
          {
            message: "Actual record already exists for this location and date",
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { message: "Unable to create actual pollution record" },
      { status: 500 },
    );
  }
}
