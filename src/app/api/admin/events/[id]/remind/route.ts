import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { addAudit, getEventForSending } from "@/lib/repository";
import { sendInvitation } from "@/lib/whatsapp";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  const { id } = await params;
  const detail = await getEventForSending(id);
  if (!detail) return NextResponse.redirect(new URL("/admin/events", request.url), 303);
  if (["CANCELLED", "CLOSED", "COMPLETED"].includes(detail.event.status) || detail.event.deadlineAt < new Date()) {
    return NextResponse.redirect(new URL(`/admin/events/${id}?error=${encodeURIComponent("La convocatoria está cerrada")}`, request.url), 303);
  }
  const errors: string[] = [];
  let sent = 0;
  for (const invitation of detail.invitations) {
    try {
      await sendInvitation(invitation.id, "reminder");
      sent += 1;
    } catch (error) {
      errors.push(`${invitation.player.firstName}: ${error instanceof Error ? error.message : "error"}`);
    }
  }
  await addAudit(null, admin.email, "REMINDERS_SENT", "Event", id, { sent, errors });
  const query = new URLSearchParams({ reminded: String(sent) });
  if (errors.length) query.set("error", errors.join("; "));
  return NextResponse.redirect(new URL(`/admin/events/${id}?${query}`, request.url), 303);
}
