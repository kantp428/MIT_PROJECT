import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type {
  PollutionPredictionResponse,
  PollutionPredictionRow,
} from "@/types/pollution";

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 1) {
    return Math.floor(parsed);
  }

  return fallback;
};

const formatIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

interface PollutionListRow {
  id: number;
  province_name: string;
  pm_predicted: Prisma.Decimal | null;
  predicted_at: Date;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(
      100,
      parsePositiveInt(searchParams.get("limit"), 20),
    );
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.max(1, limit);

    const now = new Date();
    const todayDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(todayDate.getDate() - 1);
    const todayText = formatIsoDate(todayDate);
    const yesterdayText = formatIsoDate(yesterdayDate);

    const totalResult = await prisma.$queryRaw<Array<{ total: bigint | number }>>(
      Prisma.sql`
        SELECT COUNT(*) AS total
        FROM pm_actual a
        INNER JOIN pm_prediction p ON p.pm_actual_id = a.id
        WHERE a.date = ${yesterdayText}::date
          AND p.predicted_for = ${todayText}::date
      `,
    );
    const total = Number(totalResult[0]?.total ?? 0);

    const rowsResult = await prisma.$queryRaw<PollutionListRow[]>(Prisma.sql`
      SELECT
        l.id,
        l.province AS province_name,
        p.pm_predicted,
        p.predicted_at,
        l.latitude,
        l.longitude
      FROM pm_actual a
      INNER JOIN location l ON l.id = a.location_id
      INNER JOIN pm_prediction p ON p.pm_actual_id = a.id
      WHERE a.date = ${yesterdayText}::date
        AND p.predicted_for = ${todayText}::date
      ORDER BY l.province ASC
      LIMIT ${normalizedLimit}
      OFFSET ${(normalizedPage - 1) * normalizedLimit}
    `);

    const formatPredictedAt = (date: Date): string => {
      const diffMs = Date.now() - date.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 24) {
        return `${Math.floor(diffHours)} ชม. ที่แล้ว`;
      }

      return date
        .toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" })
        .replace("T", " ");
    };

    const rows: PollutionPredictionRow[] = rowsResult.map((row) => ({
      id: row.id,
      provinceName: row.province_name,
      PM25:
        row.pm_predicted !== null
          ? Math.round(Number(row.pm_predicted) * 100) / 100
          : null,
      predicted_at: formatPredictedAt(row.predicted_at),
      latitude: row.latitude !== null ? Number(row.latitude) : null,
      longitude: row.longitude !== null ? Number(row.longitude) : null,
    }));

    const pagination = {
      total,
      limit: normalizedLimit,
      page: normalizedPage,
      totalPage: Math.max(1, Math.ceil(total / normalizedLimit)),
    };

    const payload: PollutionPredictionResponse = {
      data: rows,
      pagination,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to load pollution predictions", error);
    return NextResponse.json(
      { message: "Unable to load pollution predictions right now" },
      { status: 500 },
    );
  }
}
