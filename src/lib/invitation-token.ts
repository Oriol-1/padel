import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

const secret = new TextEncoder().encode(env.SESSION_SECRET);

export async function createInvitationToken(invitationId: string, version: number, expiresAt: Date) {
  const expiration = Math.max(Math.floor(expiresAt.getTime() / 1000), Math.floor(Date.now() / 1000) + 3600);
  return new SignJWT({ invitationId, version, type: "padel-invitation" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(secret);
}

export async function verifyInvitationToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  if (payload.type !== "padel-invitation" || typeof payload.invitationId !== "string" || typeof payload.version !== "number") {
    throw new Error("Enlace de invitación no válido");
  }
  return { invitationId: payload.invitationId, version: payload.version };
}
