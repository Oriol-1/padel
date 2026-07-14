import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deleteEvent } from "@/lib/repository";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  const { id } = await params;
  try {
    const deleted = await deleteEvent(id, admin.email);
    return NextResponse.redirect(new URL(`/admin/events?${deleted ? "deleted=1" : "error=not-found"}`, request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin/events?error=delete", request.url), 303);
  }
}
