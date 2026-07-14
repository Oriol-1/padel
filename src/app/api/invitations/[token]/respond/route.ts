import { NextResponse } from "next/server";
import { verifyInvitationToken } from "@/lib/invitation-token";
import { playerRespond } from "@/lib/repository";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const form = await request.formData();
  const requested = String(form.get("response") ?? "");
  const note = String(form.get("note") ?? "").trim().slice(0, 500) || null;
  if (!["CONFIRMED", "AVAILABLE", "DECLINED"].includes(requested)) return NextResponse.redirect(new URL(`/i/${token}?error=${encodeURIComponent("Respuesta no válida")}`, request.url), 303);
  try {
    const payload = await verifyInvitationToken(token);
    await playerRespond(payload.invitationId, payload.version, requested as "CONFIRMED" | "AVAILABLE" | "DECLINED", note);
    return NextResponse.redirect(new URL(`/i/${token}?ok=1`, request.url), 303);
  } catch (error) {
    return NextResponse.redirect(new URL(`/i/${token}?error=${encodeURIComponent(error instanceof Error ? error.message : "No se pudo registrar la respuesta")}`, request.url), 303);
  }
}
