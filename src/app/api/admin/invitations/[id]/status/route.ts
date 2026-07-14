import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { updateInvitationByAdmin } from "@/lib/repository";
import type { Invitation } from "@/lib/types";

const allowed = new Set<Invitation["response"]>(["PENDING", "AVAILABLE", "CONFIRMED", "WAITLISTED", "SELECTED", "NOT_SELECTED", "DECLINED", "CANCELLED"]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  const { id } = await params;
  const form = await request.formData();
  const response = String(form.get("response") ?? "") as Invitation["response"];
  const eventId = String(form.get("eventId") ?? "");
  if (!allowed.has(response)) return NextResponse.redirect(new URL(`/admin/events/${eventId}?error=estado`, request.url), 303);
  try {
    await updateInvitationByAdmin(id, response, admin.email);
    return NextResponse.redirect(new URL(`/admin/events/${eventId}?updated=1`, request.url), 303);
  } catch (error) {
    return NextResponse.redirect(new URL(`/admin/events/${eventId}?error=${encodeURIComponent(error instanceof Error ? error.message : "error")}`, request.url), 303);
  }
}
