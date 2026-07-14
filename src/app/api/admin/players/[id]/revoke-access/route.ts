import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { revokePlayerPortal } from "@/lib/repository";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  const { id } = await params;
  try {
    const revoked = await revokePlayerPortal(id, admin.email);
    return NextResponse.redirect(new URL(`/admin/players?${revoked ? "accessRevoked=1" : "error=not-found"}`, request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin/players?error=revoke", request.url), 303);
  }
}
