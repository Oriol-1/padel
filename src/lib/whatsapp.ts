import { env } from "@/lib/env";
import { createInvitationToken } from "@/lib/invitation-token";
import { formatShortDateTime } from "@/lib/format";
import { createOutboundMessage, getInvitationFull, markLiveSent, markMessageFailed, markMockSent } from "@/lib/repository";

function normalizePhone(phone: string) { return phone.replace(/[^0-9]/g, ""); }

export async function sendInvitation(invitationId: string, purpose: "invitation" | "reminder" = "invitation") {
  const invitation = await getInvitationFull(invitationId);
  if (!invitation) throw new Error("Invitación no encontrada");
  if (!invitation.player.whatsappConsent) throw new Error("El jugador no ha autorizado convocatorias por WhatsApp");
  if (!invitation.player.active) throw new Error("El jugador está inactivo");
  if (["CANCELLED", "CLOSED", "COMPLETED"].includes(invitation.event.status)) throw new Error("La convocatoria está cerrada");

  const token = await createInvitationToken(invitation.id, invitation.linkVersion, invitation.event.startsAt);
  const link = `${env.APP_URL}/i/${token}`;
  const destination = normalizePhone(invitation.player.phone);
  const payload = {
    purpose,
    player: invitation.player.firstName,
    event: invitation.event.title,
    date: formatShortDateTime(invitation.event.startsAt),
    venue: invitation.event.venue,
    link
  };
  const message = await createOutboundMessage({ invitationId: invitation.id, destination, templateName: env.WHATSAPP_TEMPLATE_NAME, payload });

  if (env.WHATSAPP_MODE === "mock") {
    await markMockSent(message.id, invitation.id);
    return { mode: "mock" as const, link, messageId: message.id };
  }
  if (!env.WHATSAPP_PHONE_NUMBER_ID || !env.WHATSAPP_ACCESS_TOKEN) {
    await markMessageFailed(message.id, invitation.id, "Faltan credenciales de WhatsApp");
    throw new Error("Faltan WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN");
  }

  const url = `https://graph.facebook.com/${env.WHATSAPP_GRAPH_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: destination,
    type: "template",
    template: {
      name: env.WHATSAPP_TEMPLATE_NAME,
      language: { code: env.WHATSAPP_TEMPLATE_LANGUAGE },
      components: [
        { type: "body", parameters: [
          { type: "text", text: invitation.player.firstName },
          { type: "text", text: invitation.event.title },
          { type: "text", text: formatShortDateTime(invitation.event.startsAt) },
          { type: "text", text: invitation.event.venue }
        ] },
        { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: token }] }
      ]
    }
  };

  let response: Response;
  try {
    response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "No se pudo conectar con WhatsApp";
    await markMessageFailed(message.id, invitation.id, errorMessage);
    throw error;
  }
  const result = await response.json() as { messages?: Array<{ id: string }>; error?: { message?: string } };
  if (!response.ok || !result.messages?.[0]?.id) {
    const errorMessage = result.error?.message ?? `Error HTTP ${response.status}`;
    await markMessageFailed(message.id, invitation.id, errorMessage);
    throw new Error(errorMessage);
  }
  await markLiveSent(message.id, invitation.id, result.messages[0].id);
  return { mode: "live" as const, link, messageId: result.messages[0].id };
}
