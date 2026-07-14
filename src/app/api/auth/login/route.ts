import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  if (!await verifyAdminCredentials(email, password)) return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  await createAdminSession(email);
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
