import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createPlayerSession } from "@/lib/player-auth";
import { getPlayerPortalAccess } from "@/lib/repository";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  const { id } = await params;
  const access = await getPlayerPortalAccess(id);
  if (!access) return NextResponse.redirect(new URL("/admin/players?error=portal", request.url), 303);
  await createPlayerSession(id, access.version);
  return NextResponse.redirect(new URL("/mis-partidos?preview=1", request.url), 303);
}
