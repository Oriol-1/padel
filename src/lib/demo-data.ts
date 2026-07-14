import type { EventRecord, Invitation, Player } from "@/lib/types";

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const demoPlayers: Player[] = [
  { id: "demo-player-sandra", firstName: "Sandra", lastName: "Martínez", phone: "+34600111001", email: "sandra@example.com", category: "Liga A", level: "Intermedio", active: true, whatsappConsent: true, consentTextVersion: "v1", consentedAt: new Date(now - 30 * day), createdAt: new Date(now - 30 * day), updatedAt: new Date(now - 30 * day) },
  { id: "demo-player-marc", firstName: "Marc", lastName: "Soler", phone: "+34600111002", email: "marc@example.com", category: "Liga A", level: "Intermedio alto", active: true, whatsappConsent: true, consentTextVersion: "v1", consentedAt: new Date(now - 28 * day), createdAt: new Date(now - 28 * day), updatedAt: new Date(now - 28 * day) },
  { id: "demo-player-laia", firstName: "Laia", lastName: "Costa", phone: "+34600111003", email: "laia@example.com", category: "Liga A", level: "Intermedio", active: true, whatsappConsent: true, consentTextVersion: "v1", consentedAt: new Date(now - 25 * day), createdAt: new Date(now - 25 * day), updatedAt: new Date(now - 25 * day) },
  { id: "demo-player-jordi", firstName: "Jordi", lastName: "Roca", phone: "+34600111004", email: "jordi@example.com", category: "Liga A", level: "Intermedio", active: false, whatsappConsent: false, consentTextVersion: null, consentedAt: null, createdAt: new Date(now - 20 * day), updatedAt: new Date(now - 2 * day) }
];

export const demoEvents: Array<EventRecord & { invitationCount: number; answeredCount: number }> = [
  { id: "demo-event-thursday", title: "Partida del jueves · Nivel intermedio", type: "SINGLE_MATCH", responseMode: "DIRECT", status: "PUBLISHED", startsAt: new Date(now + 3 * day), endsAt: new Date(now + 3 * day + 90 * 60 * 1000), deadlineAt: new Date(now + 2 * day), venue: "Club de Pádel Demo", address: "Pista central", capacity: 4, category: "Intermedio", priceNote: "8 € por jugador", description: "Partida amistosa de prueba.", createdBy: "demo@clubpadel.local", publishedAt: new Date(now - day), createdAt: new Date(now - 2 * day), updatedAt: new Date(now - day), invitationCount: 4, answeredCount: 3 },
  { id: "demo-event-league", title: "Jornada 4 · Liga A", type: "LEAGUE_ROUND", responseMode: "SELECTION", status: "DRAFT", startsAt: new Date(now + 8 * day), endsAt: new Date(now + 8 * day + 2 * 60 * 60 * 1000), deadlineAt: new Date(now + 6 * day), venue: "Club de Pádel Demo", address: "Pistas 1 y 2", capacity: 4, category: "Liga A", priceNote: null, description: "El capitán seleccionará el equipo entre quienes estén disponibles.", createdBy: "demo@clubpadel.local", publishedAt: null, createdAt: new Date(now - day), updatedAt: new Date(now - day), invitationCount: 4, answeredCount: 2 }
];

const responses: Invitation["response"][] = ["CONFIRMED", "AVAILABLE", "DECLINED", "PENDING"];

export function getDemoEventDetail(id: string) {
  const event = demoEvents.find((item) => item.id === id);
  if (!event) return null;
  const invitations = demoPlayers.map((player, index) => {
    const response = event.responseMode === "SELECTION" && index === 0 ? "SELECTED" : responses[index];
    const responded = response !== "PENDING";
    return {
      id: `demo-invitation-${event.id}-${index}`,
      eventId: event.id,
      playerId: player.id,
      status: responded ? "RESPONDED" as const : "PENDING" as const,
      response,
      responseNote: null,
      waitlistPosition: null,
      linkVersion: 1,
      sentAt: responded ? new Date(now - day) : null,
      openedAt: responded ? new Date(now - day) : null,
      respondedAt: responded ? new Date(now - day) : null,
      selectedAt: response === "SELECTED" ? new Date(now - day) : null,
      createdAt: new Date(now - 2 * day),
      updatedAt: new Date(now - day),
      player,
      messageStatus: responded ? "MOCKED" as const : null,
      messageSentAt: responded ? new Date(now - day) : null
    };
  });
  return { event, invitations };
}
