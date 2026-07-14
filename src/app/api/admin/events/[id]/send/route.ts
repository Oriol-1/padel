import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { addAudit, getEventForSending, publishEvent } from "@/lib/repository";
import { sendInvitation } from "@/lib/whatsapp";

export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  const { id } = await params;
  const detail = await getEventForSending(id);
  if (!detail) return NextResponse.redirect(new URL("/admin/events", request.url), 303);
  const errors: string[] = [];
  for (const invitation of detail.invitations) {
    if (!["PENDING", "OPENED", "FAILED"].includes(invitation.status)) continue;
    if (!invitation.player.whatsappConsent) { errors.push(`${invitation.player.firstName}: sin consentimiento`); continue; }
    try { await sendInvitation(invitation.id); } catch (error) { errors.push(`${invitation.player.firstName}: ${error instanceof Error ? error.message : "error"}`); }
  }
  await publishEvent(id);
  await addAudit(null, admin.email, "INVITATIONS_SENT", "Event", id, { errors });
  const suffix = errors.length ? `?sent=1&error=${encodeURIComponent(errors.join("; "))}` : "?sent=1";
  return NextResponse.redirect(new URL(`/admin/events/${id}${suffix}`, request.url), 303);
}
