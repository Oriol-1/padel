import { compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";

const COOKIE_NAME = "padel_admin_session";
const secret = new TextEncoder().encode(env.SESSION_SECRET);

type AdminSession = { email: string; role: "ADMIN" };

export async function verifyAdminCredentials(email: string, password: string) {
  if (email.trim().toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) return false;
  if (env.ADMIN_PASSWORD_HASH) return compare(password, env.ADMIN_PASSWORD_HASH);
  return Boolean(env.ADMIN_PASSWORD && password === env.ADMIN_PASSWORD);
}

export async function createAdminSession(email: string) {
  const token = await new SignJWT({ email, role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "ADMIN" || typeof payload.email !== "string") return null;
    return { email: payload.email, role: "ADMIN" };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
