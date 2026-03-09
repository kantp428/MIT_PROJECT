import { NextResponse } from "next/server";
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

    const whereClause = {
      date: yesterdayDate,
      pm_prediction: {
        some: {
          predicted_for: todayDate,
        },
      },
    };

    const total = await prisma.pm_actual.count({ where: whereClause });
    const actuals = await prisma.pm_actual.findMany({
      where: whereClause,
      include: {
        location: {
          select: {
            id: true,
            province: true,
          },
        },
        pm_prediction: {
          where: {
            predicted_for: todayDate,
          },
          orderBy: {
            predicted_at: "asc",
          },
          take: 1,
        },
      },
      orderBy: {
        location: {
          province: "asc",
        },
      },
      skip: (normalizedPage - 1) * normalizedLimit,
      take: normalizedLimit,
    });

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

    const rows = actuals
      .map((actual) => {
        const prediction = actual.pm_prediction[0];
        if (!prediction) return null;

        return {
          id: actual.location.id,
          provinceName: actual.location.province,
          PM25:
            prediction.pm_predicted !== null
              ? Math.round(Number(prediction.pm_predicted) * 100) / 100
              : null,
          predicted_at: formatPredictedAt(prediction.predicted_at),
        };
      })
      .filter(
        (item): item is PollutionPredictionRow =>
          item !== null &&
          item.provinceName !== undefined &&
          item.predicted_at !== undefined,
      );

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
