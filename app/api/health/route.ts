import { NextResponse } from "next/server";
import { getRuntimeHealth } from "@/lib/server/local-runtime";

export async function GET() {
  const health = await getRuntimeHealth();
  return NextResponse.json(health);
}
