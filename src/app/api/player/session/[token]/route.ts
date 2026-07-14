import { NextResponse } from "next/server";
import { verifyInvitationToken } from "@/lib/invitation-token";
import { createPlayerSession } from "@/lib/player-auth";
import { getInvitationFull, getPlayerPortalAccess } from "@/lib/repository";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const payload = await verifyInvitationToken(token);
    const invitation = await getInvitationFull(payload.invitationId);
    if (!invitation || invitation.linkVersion !== payload.version) throw new Error("Acceso no válido");
    const access = await getPlayerPortalAccess(invitation.playerId);
    if (!access) throw new Error("Acceso no disponible");
    await createPlayerSession(invitation.playerId, access.version);
    return NextResponse.redirect(new URL("/mis-partidos", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL(`/i/${token}?error=${encodeURIComponent("No se pudo abrir el área personal")}`, request.url), 303);
  }
}
