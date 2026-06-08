import { NextResponse } from "next/server";
import { getActiveConfig } from "@/lib/config/service";

export async function GET() {
  try {
    const config = await getActiveConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to load active config:", error);
    return NextResponse.json(
      { error: "Config unavailable — run db:push and db:seed" },
      { status: 503 },
    );
  }
}
