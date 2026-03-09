import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        province: true,
      },
      orderBy: {
        province: "asc",
      },
    });

    const options = locations.map((location) => ({
      value: String(location.id),
      label: location.province,
    }));

    return NextResponse.json(options);
  } catch (error) {
    console.error("Failed to fetch location options", error);

    return NextResponse.json(
      { message: "Failed to fetch location options" },
      { status: 500 },
    );
  }
}
