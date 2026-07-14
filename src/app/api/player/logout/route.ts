import { NextResponse } from "next/server";
import { clearPlayerSession } from "@/lib/player-auth";

export async function POST(request: Request) {
  await clearPlayerSession();
  return NextResponse.redirect(new URL("/", request.url), 303);
}
