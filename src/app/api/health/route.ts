import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { env } from "@/lib/env";

export async function GET() {
  if (env.DEMO_MODE) return NextResponse.json({ status: "ok", database: "demo", persistent: false, time: new Date().toISOString() });
  try { await query("SELECT 1"); return NextResponse.json({ status: "ok", database: "ok", time: new Date().toISOString() }); }
  catch { return NextResponse.json({ status: "error", database: "unavailable" }, { status: 503 }); }
}
