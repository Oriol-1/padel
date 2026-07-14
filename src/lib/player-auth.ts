import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const COOKIE_NAME = "padel_player_session";
const secret = new TextEncoder().encode(env.SESSION_SECRET);

export async function createPlayerSession(playerId: string, version: number) {
  const token = await new SignJWT({ playerId, version, type: "padel-player" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 });
}

export async function getPlayerSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "padel-player" || typeof payload.playerId !== "string" || typeof payload.version !== "number") return null;
    return { playerId: payload.playerId, version: payload.version };
  } catch {
    return null;
  }
}

export async function clearPlayerSession() {
  (await cookies()).delete(COOKIE_NAME);
}
