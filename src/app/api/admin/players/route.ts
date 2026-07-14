import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createPlayer } from "@/lib/repository";
import { playerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  const form = await request.formData();
  const parsed = playerSchema.safeParse({
    firstName: form.get("firstName"), lastName: form.get("lastName"), phone: form.get("phone"), email: form.get("email"),
    category: form.get("category"), level: form.get("level"), whatsappConsent: form.get("whatsappConsent") === "true"
  });
  if (!parsed.success) return NextResponse.redirect(new URL("/admin/players?error=validation", request.url), 303);
  try {
    await createPlayer({
      firstName: parsed.data.firstName, lastName: parsed.data.lastName, phone: parsed.data.phone,
      email: parsed.data.email || null, category: parsed.data.category || null, level: parsed.data.level || null,
      whatsappConsent: parsed.data.whatsappConsent
    }, admin.email);
    return NextResponse.redirect(new URL("/admin/players?created=1", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin/players?error=duplicate", request.url), 303);
  }
}
