import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { updateMessageProviderStatus } from "@/lib/repository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === env.WHATSAPP_VERIFY_TOKEN && challenge) return new NextResponse(challenge, { status: 200 });
  return new NextResponse("Forbidden", { status: 403 });
}

type StatusPayload = { id?: string; status?: string; timestamp?: string; errors?: Array<{ title?: string; message?: string }> };
export async function POST(request: Request) {
  const body = await request.json() as { entry?: Array<{ changes?: Array<{ value?: { statuses?: StatusPayload[] } }> }> };
  const statuses = body.entry?.flatMap((entry) => entry.changes?.flatMap((change) => change.value?.statuses ?? []) ?? []) ?? [];
  for (const item of statuses) {
    if (!item.id || !item.status) continue;
    const statusMap: Record<string, "SENT" | "DELIVERED" | "READ" | "FAILED"> = { sent: "SENT", delivered: "DELIVERED", read: "READ", failed: "FAILED" };
    const mapped = statusMap[item.status];
    if (!mapped) continue;
    const at = item.timestamp ? new Date(Number(item.timestamp) * 1000) : new Date();
    await updateMessageProviderStatus(item.id, mapped, at, mapped === "FAILED" ? item.errors?.map((e) => e.title ?? e.message).filter(Boolean).join("; ") || "Envío fallido" : undefined);
  }
  return NextResponse.json({ received: true });
}
