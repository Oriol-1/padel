import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { duplicateEvent } from "@/lib/repository";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  const { id } = await params;
  try {
    const event = await duplicateEvent(id, admin.email);
    if (!event) return NextResponse.redirect(new URL("/admin/events?error=not-found", request.url), 303);
    return NextResponse.redirect(new URL(`/admin/events/${event.id}/edit?duplicated=1`, request.url), 303);
  } catch {
    return NextResponse.redirect(new URL(`/admin/events/${id}?error=duplicate`, request.url), 303);
  }
}
