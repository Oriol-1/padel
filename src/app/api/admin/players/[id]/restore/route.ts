import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { setPlayerActive } from "@/lib/repository";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  const { id } = await params;
  try {
    const restored = await setPlayerActive(id, true, admin.email);
    return NextResponse.redirect(new URL(`/admin/players?${restored ? "restored=1" : "error=not-found"}`, request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin/players?error=restore", request.url), 303);
  }
}
