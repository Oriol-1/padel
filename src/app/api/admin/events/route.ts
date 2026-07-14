import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createEvent } from "@/lib/repository";
import { eventSchema } from "@/lib/validation";
import { localClubDateTimeToUtc } from "@/lib/time";

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  const form = await request.formData();
  let startsAt: Date, endsAt: Date, deadlineAt: Date;
  try {
    startsAt = localClubDateTimeToUtc(String(form.get("startsAt") ?? ""));
    endsAt = localClubDateTimeToUtc(String(form.get("endsAt") ?? ""));
    deadlineAt = localClubDateTimeToUtc(String(form.get("deadlineAt") ?? ""));
  } catch {
    return NextResponse.redirect(new URL("/admin/events/new?error=date", request.url), 303);
  }
  const parsed = eventSchema.safeParse({
    title: form.get("title"), type: form.get("type"), responseMode: form.get("responseMode"), startsAt, endsAt, deadlineAt,
    venue: form.get("venue"), address: form.get("address"), capacity: form.get("capacity"), category: form.get("category"),
    priceNote: form.get("priceNote"), description: form.get("description"), playerIds: form.getAll("playerIds").map(String)
  });
  if (!parsed.success) return NextResponse.redirect(new URL("/admin/events/new?error=validation", request.url), 303);
  try {
    const event = await createEvent({
      title: parsed.data.title, type: parsed.data.type, responseMode: parsed.data.responseMode,
      startsAt: parsed.data.startsAt, endsAt: parsed.data.endsAt, deadlineAt: parsed.data.deadlineAt,
      venue: parsed.data.venue, address: parsed.data.address || null, capacity: parsed.data.capacity,
      category: parsed.data.category || null, priceNote: parsed.data.priceNote || null,
      description: parsed.data.description || null, createdBy: admin.email
    }, parsed.data.playerIds, admin.email);
    return NextResponse.redirect(new URL(`/admin/events/${event.id}`, request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin/events/new?error=database", request.url), 303);
  }
}
