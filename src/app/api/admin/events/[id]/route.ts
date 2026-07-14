import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { updateEvent } from "@/lib/repository";
import { localClubDateTimeToUtc } from "@/lib/time";
import { eventDetailsSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  const { id } = await params;
  const form = await request.formData();
  let startsAt: Date, endsAt: Date, deadlineAt: Date;
  try {
    startsAt = localClubDateTimeToUtc(String(form.get("startsAt") ?? ""));
    endsAt = localClubDateTimeToUtc(String(form.get("endsAt") ?? ""));
    deadlineAt = localClubDateTimeToUtc(String(form.get("deadlineAt") ?? ""));
  } catch {
    return NextResponse.redirect(new URL(`/admin/events/${id}/edit?error=date`, request.url), 303);
  }
  const parsed = eventDetailsSchema.safeParse({
    title: form.get("title"), type: form.get("type"), responseMode: form.get("responseMode"), startsAt, endsAt, deadlineAt,
    venue: form.get("venue"), address: form.get("address"), capacity: form.get("capacity"), category: form.get("category"),
    priceNote: form.get("priceNote"), description: form.get("description")
  });
  if (!parsed.success) return NextResponse.redirect(new URL(`/admin/events/${id}/edit?error=validation`, request.url), 303);
  try {
    const event = await updateEvent(id, {
      ...parsed.data,
      address: parsed.data.address || null,
      category: parsed.data.category || null,
      priceNote: parsed.data.priceNote || null,
      description: parsed.data.description || null
    }, admin.email);
    if (!event) return NextResponse.redirect(new URL("/admin/events", request.url), 303);
    return NextResponse.redirect(new URL(`/admin/events/${id}?edited=1`, request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar";
    return NextResponse.redirect(new URL(`/admin/events/${id}/edit?error=${encodeURIComponent(message)}`, request.url), 303);
  }
}
