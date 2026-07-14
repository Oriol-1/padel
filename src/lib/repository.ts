import type { PoolClient } from "pg";
import { query, transaction } from "@/lib/db";
import type { EventRecord, Invitation, InvitationFull, OutboundMessage, Player } from "@/lib/types";
import { env } from "@/lib/env";
import { demoEvents, demoPlayers, getDemoEventDetail } from "@/lib/demo-data";

const c = (alias: string | undefined, column: string) => alias ? `${alias}.${column}` : column;
const playerSelect = (a?: string) => `${c(a,"id")} AS "id", ${c(a,"first_name")} AS "firstName", ${c(a,"last_name")} AS "lastName", ${c(a,"phone")} AS "phone", ${c(a,"email")} AS "email", ${c(a,"category")} AS "category", ${c(a,"level")} AS "level", ${c(a,"active")} AS "active",
  ${c(a,"whatsapp_consent")} AS "whatsappConsent", ${c(a,"consent_text_version")} AS "consentTextVersion", ${c(a,"consented_at")} AS "consentedAt",
  ${c(a,"created_at")} AS "createdAt", ${c(a,"updated_at")} AS "updatedAt"`;
const eventSelect = (a?: string) => `${c(a,"id")} AS "id", ${c(a,"title")} AS "title", ${c(a,"type")} AS "type", ${c(a,"response_mode")} AS "responseMode", ${c(a,"status")} AS "status", ${c(a,"starts_at")} AS "startsAt", ${c(a,"ends_at")} AS "endsAt",
  ${c(a,"deadline_at")} AS "deadlineAt", ${c(a,"venue")} AS "venue", ${c(a,"address")} AS "address", ${c(a,"capacity")} AS "capacity", ${c(a,"category")} AS "category", ${c(a,"price_note")} AS "priceNote", ${c(a,"description")} AS "description",
  ${c(a,"created_by")} AS "createdBy", ${c(a,"published_at")} AS "publishedAt", ${c(a,"created_at")} AS "createdAt", ${c(a,"updated_at")} AS "updatedAt"`;
const invitationSelect = (a?: string) => `${c(a,"id")} AS "id", ${c(a,"event_id")} AS "eventId", ${c(a,"player_id")} AS "playerId", ${c(a,"status")} AS "status", ${c(a,"response")} AS "response", ${c(a,"response_note")} AS "responseNote",
  ${c(a,"waitlist_position")} AS "waitlistPosition", ${c(a,"link_version")} AS "linkVersion", ${c(a,"sent_at")} AS "sentAt", ${c(a,"opened_at")} AS "openedAt",
  ${c(a,"responded_at")} AS "respondedAt", ${c(a,"selected_at")} AS "selectedAt", ${c(a,"created_at")} AS "createdAt", ${c(a,"updated_at")} AS "updatedAt"`;
const messageSelect = (a?: string) => `${c(a,"id")} AS "id", ${c(a,"invitation_id")} AS "invitationId", ${c(a,"provider_message_id")} AS "providerMessageId", ${c(a,"template_name")} AS "templateName",
  ${c(a,"destination")} AS "destination", ${c(a,"status")} AS "status", ${c(a,"payload")} AS "payload", ${c(a,"error_message")} AS "errorMessage", ${c(a,"sent_at")} AS "sentAt", ${c(a,"delivered_at")} AS "deliveredAt",
  ${c(a,"read_at")} AS "readAt", ${c(a,"created_at")} AS "createdAt", ${c(a,"updated_at")} AS "updatedAt"`;

export async function getDashboardStats() {
  if (env.DEMO_MODE) return { players: demoPlayers.filter((player) => player.active).length, events: demoEvents.length, pending: 3 };
  const [players, events, pending] = await Promise.all([
    query<{ count: string }>("SELECT COUNT(*)::text AS count FROM players WHERE active = TRUE"),
    query<{ count: string }>("SELECT COUNT(*)::text AS count FROM events"),
    query<{ count: string }>("SELECT COUNT(*)::text AS count FROM invitations WHERE response = 'PENDING'")
  ]);
  return { players: Number(players.rows[0].count), events: Number(events.rows[0].count), pending: Number(pending.rows[0].count) };
}

export async function listUpcomingEvents(limit = 6) {
  if (env.DEMO_MODE) return demoEvents.filter((event) => event.startsAt >= new Date()).slice(0, limit);
  const result = await query<EventRecord & { invitationCount: string; answeredCount: string }>(`
    SELECT ${eventSelect("e")}, COUNT(i.id)::text AS "invitationCount",
      COUNT(i.id) FILTER (WHERE i.response <> 'PENDING')::text AS "answeredCount"
    FROM events e LEFT JOIN invitations i ON i.event_id = e.id
    WHERE e.starts_at >= NOW() AND e.status <> 'CANCELLED'
    GROUP BY e.id ORDER BY e.starts_at ASC LIMIT $1`, [limit]);
  return result.rows.map((row) => ({ ...row, invitationCount: Number(row.invitationCount), answeredCount: Number(row.answeredCount) }));
}

export async function listPlayers(activeOnly = false) {
  if (env.DEMO_MODE) return activeOnly ? demoPlayers.filter((player) => player.active) : demoPlayers;
  const result = await query<Player>(`SELECT ${playerSelect("p")} FROM players p ${activeOnly ? "WHERE p.active = TRUE" : ""} ORDER BY p.active DESC, p.category NULLS LAST, p.first_name ASC`);
  return result.rows;
}

export async function getPlayerPortalAccess(playerId: string) {
  if (env.DEMO_MODE) {
    const player = demoPlayers.find((item) => item.id === playerId && item.active);
    return player ? { player, version: 1 } : null;
  }
  const result = await query<Player & { portalLinkVersion: number }>(`SELECT ${playerSelect("p")},p.portal_link_version AS "portalLinkVersion"
    FROM players p WHERE p.id=$1 AND p.active=TRUE`, [playerId]);
  const row = result.rows[0];
  if (!row) return null;
  await query("UPDATE players SET portal_accessed_at=NOW() WHERE id=$1", [playerId]);
  return { player: row, version: row.portalLinkVersion };
}

export async function listSelectedEventsForPlayer(playerId: string, version: number) {
  if (env.DEMO_MODE) {
    const player = demoPlayers.find((item) => item.id === playerId && item.active);
    if (!player || version !== 1) return null;
    return {
      player,
      events: demoEvents.flatMap((event) => {
        const invitation = getDemoEventDetail(event.id)?.invitations.find((item) => item.playerId === playerId);
        return invitation && ["CONFIRMED", "SELECTED"].includes(invitation.response) && event.startsAt >= new Date() ? [{ event, response: invitation.response }] : [];
      }).sort((a, b) => a.event.startsAt.getTime() - b.event.startsAt.getTime())
    };
  }
  const playerResult = await query<Player & { portalLinkVersion: number }>(`SELECT ${playerSelect("p")},p.portal_link_version AS "portalLinkVersion"
    FROM players p WHERE p.id=$1 AND p.active=TRUE`, [playerId]);
  const player = playerResult.rows[0];
  if (!player || player.portalLinkVersion !== version) return null;
  const eventsResult = await query<EventRecord & { response: Invitation["response"] }>(`SELECT ${eventSelect("e")},i.response
    FROM invitations i JOIN events e ON e.id=i.event_id
    WHERE i.player_id=$1 AND i.response IN ('CONFIRMED','SELECTED') AND e.starts_at>=NOW() AND e.status<>'CANCELLED'
    ORDER BY e.starts_at ASC`, [playerId]);
  return { player, events: eventsResult.rows.map((event) => ({ event, response: event.response })) };
}

export async function revokePlayerPortal(id: string, actor: string) {
  if (env.DEMO_MODE) return demoPlayers.some((player) => player.id === id);
  return transaction(async (client) => {
    const result = await client.query<{ id: string }>("UPDATE players SET portal_link_version=portal_link_version+1,portal_access_revoked_at=NOW(),updated_at=NOW() WHERE id=$1 RETURNING id", [id]);
    if (!result.rows[0]) return false;
    await addAudit(client, actor, "PLAYER_PORTAL_REVOKED", "Player", id);
    return true;
  });
}

export async function createPlayer(data: Omit<Player, "id" | "active" | "consentTextVersion" | "consentedAt" | "createdAt" | "updatedAt">, actor: string) {
  return transaction(async (client) => {
    const result = await client.query<Player>(`INSERT INTO players (first_name,last_name,phone,email,category,level,whatsapp_consent,consent_text_version,consented_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,CASE WHEN $7 THEN 'v1' ELSE NULL END,CASE WHEN $7 THEN NOW() ELSE NULL END)
      RETURNING ${playerSelect()}`,
      [data.firstName, data.lastName, data.phone, data.email, data.category, data.level, data.whatsappConsent]);
    await addAudit(client, actor, "PLAYER_CREATED", "Player", result.rows[0].id, { phone: data.phone });
    return result.rows[0];
  });
}

export async function setPlayerActive(id: string, active: boolean, actor: string) {
  if (env.DEMO_MODE) return demoPlayers.some((player) => player.id === id);
  return transaction(async (client) => {
    const result = await client.query<{ id: string; firstName: string; lastName: string }>(`UPDATE players SET active=$2,updated_at=NOW()
      WHERE id=$1 RETURNING id,first_name AS "firstName",last_name AS "lastName"`, [id, active]);
    const player = result.rows[0];
    if (!player) return false;
    await addAudit(client, actor, active ? "PLAYER_RESTORED" : "PLAYER_ARCHIVED", "Player", id, { name: `${player.firstName} ${player.lastName}` });
    return true;
  });
}

export async function listEvents() {
  if (env.DEMO_MODE) return demoEvents;
  const result = await query<EventRecord & { invitationCount: string; answeredCount: string }>(`
    SELECT ${eventSelect("e")}, COUNT(i.id)::text AS "invitationCount",
      COUNT(i.id) FILTER (WHERE i.response <> 'PENDING')::text AS "answeredCount"
    FROM events e LEFT JOIN invitations i ON i.event_id=e.id
    GROUP BY e.id ORDER BY e.starts_at DESC`);
  return result.rows.map((row) => ({ ...row, invitationCount: Number(row.invitationCount), answeredCount: Number(row.answeredCount) }));
}

export async function createEvent(data: Omit<EventRecord, "id" | "status" | "publishedAt" | "createdAt" | "updatedAt">, playerIds: string[], actor: string) {
  return transaction(async (client) => {
    const result = await client.query<EventRecord>(`INSERT INTO events (title,type,response_mode,starts_at,ends_at,deadline_at,venue,address,capacity,category,price_note,description,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING ${eventSelect()}`,
      [data.title,data.type,data.responseMode,data.startsAt,data.endsAt,data.deadlineAt,data.venue,data.address,data.capacity,data.category,data.priceNote,data.description,data.createdBy]);
    const event = result.rows[0];
    for (const playerId of playerIds) await client.query("INSERT INTO invitations (event_id,player_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [event.id, playerId]);
    await addAudit(client, actor, "EVENT_CREATED", "Event", event.id, { playerCount: playerIds.length });
    return event;
  });
}

type EventChanges = Omit<EventRecord, "id" | "status" | "createdBy" | "publishedAt" | "createdAt" | "updatedAt">;

export async function updateEvent(id: string, data: EventChanges, actor: string) {
  return transaction(async (client) => {
    const currentResult = await client.query<EventRecord>(`SELECT ${eventSelect("e")} FROM events e WHERE e.id=$1 FOR UPDATE`, [id]);
    const current = currentResult.rows[0];
    if (!current) return null;
    const countResult = await client.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM invitations WHERE event_id=$1 AND response IN ('CONFIRMED','SELECTED')", [id]);
    if (data.capacity < Number(countResult.rows[0].count)) throw new Error("Las plazas no pueden ser inferiores a los jugadores confirmados");
    const scheduleChanged = current.startsAt.getTime() !== data.startsAt.getTime();
    const result = await client.query<EventRecord>(`UPDATE events SET title=$2,type=$3,response_mode=$4,starts_at=$5,ends_at=$6,deadline_at=$7,
      venue=$8,address=$9,capacity=$10,category=$11,price_note=$12,description=$13,updated_at=NOW() WHERE id=$1 RETURNING ${eventSelect()}`,
      [id,data.title,data.type,data.responseMode,data.startsAt,data.endsAt,data.deadlineAt,data.venue,data.address,data.capacity,data.category,data.priceNote,data.description]);
    if (scheduleChanged) await client.query("UPDATE invitations SET link_version=link_version+1,updated_at=NOW() WHERE event_id=$1", [id]);
    await addAudit(client, actor, "EVENT_UPDATED", "Event", id, { scheduleChanged });
    return result.rows[0];
  });
}

export async function duplicateEvent(id: string, actor: string) {
  return transaction(async (client) => {
    const sourceResult = await client.query<EventRecord>(`SELECT ${eventSelect("e")} FROM events e WHERE e.id=$1 FOR UPDATE`, [id]);
    const source = sourceResult.rows[0];
    if (!source) return null;
    const result = await client.query<EventRecord>(`INSERT INTO events (title,type,response_mode,starts_at,ends_at,deadline_at,venue,address,capacity,category,price_note,description,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING ${eventSelect()}`,
      [`Copia de ${source.title}`,source.type,source.responseMode,source.startsAt,source.endsAt,source.deadlineAt,source.venue,source.address,source.capacity,source.category,source.priceNote,source.description,actor]);
    const duplicate = result.rows[0];
    await client.query("INSERT INTO invitations (event_id,player_id) SELECT $1,player_id FROM invitations WHERE event_id=$2", [duplicate.id, id]);
    await addAudit(client, actor, "EVENT_DUPLICATED", "Event", duplicate.id, { sourceEventId: id });
    return duplicate;
  });
}

export async function deleteEvent(id: string, actor: string) {
  return transaction(async (client) => {
    const result = await client.query<{ id: string; title: string }>("SELECT id,title FROM events WHERE id=$1 FOR UPDATE", [id]);
    const event = result.rows[0];
    if (!event) return false;
    const countResult = await client.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM invitations WHERE event_id=$1", [id]);
    await addAudit(client, actor, "EVENT_DELETED", "Event", id, { title: event.title, invitationCount: Number(countResult.rows[0].count) });
    await client.query("DELETE FROM events WHERE id=$1", [id]);
    return true;
  });
}

export async function getEventWithInvitations(id: string) {
  if (env.DEMO_MODE) return getDemoEventDetail(id);
  const eventResult = await query<EventRecord>(`SELECT ${eventSelect("e")} FROM events e WHERE e.id=$1`, [id]);
  const event = eventResult.rows[0];
  if (!event) return null;
  const invitationsResult = await query<Invitation & Omit<Player, "id" | "createdAt" | "updatedAt"> & { playerCreatedAt: Date; playerUpdatedAt: Date; messageStatus: OutboundMessage["status"] | null; messageSentAt: Date | null }>(`
    SELECT ${invitationSelect("i")}, p.first_name AS "firstName", p.last_name AS "lastName", p.phone, p.email, p.category, p.level,
      p.active, p.whatsapp_consent AS "whatsappConsent", p.consent_text_version AS "consentTextVersion", p.consented_at AS "consentedAt",
      p.created_at AS "playerCreatedAt", p.updated_at AS "playerUpdatedAt",
      m.status AS "messageStatus", m.sent_at AS "messageSentAt"
    FROM invitations i JOIN players p ON p.id=i.player_id
    LEFT JOIN LATERAL (SELECT status,sent_at FROM outbound_messages WHERE invitation_id=i.id ORDER BY created_at DESC LIMIT 1) m ON TRUE
    WHERE i.event_id=$1 ORDER BY i.response ASC, i.created_at ASC`, [id]);
  const invitations = invitationsResult.rows.map((row) => ({
    id: row.id, eventId: row.eventId, playerId: row.playerId, status: row.status, response: row.response, responseNote: row.responseNote,
    waitlistPosition: row.waitlistPosition, linkVersion: row.linkVersion, sentAt: row.sentAt, openedAt: row.openedAt, respondedAt: row.respondedAt,
    selectedAt: row.selectedAt, createdAt: row.createdAt, updatedAt: row.updatedAt,
    player: { id: row.playerId, firstName: row.firstName, lastName: row.lastName, phone: row.phone, email: row.email, category: row.category,
      level: row.level, active: row.active, whatsappConsent: row.whatsappConsent, consentTextVersion: row.consentTextVersion,
      consentedAt: row.consentedAt, createdAt: row.playerCreatedAt, updatedAt: row.playerUpdatedAt },
    messageStatus: row.messageStatus, messageSentAt: row.messageSentAt
  }));
  return { event, invitations };
}

export async function getInvitationFull(id: string): Promise<InvitationFull | null> {
  if (env.DEMO_MODE) {
    for (const event of demoEvents) {
      const detail = getDemoEventDetail(event.id);
      const invitation = detail?.invitations.find((item) => item.id === id);
      if (invitation) return { ...invitation, event };
    }
    return null;
  }
  const invResult = await query<Invitation>(`SELECT ${invitationSelect("i")} FROM invitations i WHERE i.id=$1`, [id]);
  const invitation = invResult.rows[0];
  if (!invitation) return null;
  const [playerResult, eventResult] = await Promise.all([
    query<Player>(`SELECT ${playerSelect("p")} FROM players p WHERE p.id=$1`, [invitation.playerId]),
    query<EventRecord>(`SELECT ${eventSelect("e")} FROM events e WHERE e.id=$1`, [invitation.eventId])
  ]);
  if (!playerResult.rows[0] || !eventResult.rows[0]) return null;
  return { ...invitation, player: playerResult.rows[0], event: eventResult.rows[0] };
}

export async function markInvitationOpened(id: string) {
  if (env.DEMO_MODE) return;
  await query(`UPDATE invitations SET opened_at=COALESCE(opened_at,NOW()), status=CASE WHEN status='PENDING' THEN 'OPENED' ELSE status END, updated_at=NOW() WHERE id=$1`, [id]);
}

export async function getEventForSending(id: string) {
  const detail = await getEventWithInvitations(id);
  return detail;
}

export async function publishEvent(id: string) {
  await query("UPDATE events SET status='PUBLISHED', published_at=COALESCE(published_at,NOW()), updated_at=NOW() WHERE id=$1", [id]);
}

export async function createOutboundMessage(data: { invitationId: string; destination: string; templateName: string; payload: unknown }) {
  const result = await query<OutboundMessage>(`INSERT INTO outbound_messages (invitation_id,destination,template_name,payload) VALUES ($1,$2,$3,$4::jsonb) RETURNING ${messageSelect()}`,
    [data.invitationId, data.destination, data.templateName, JSON.stringify(data.payload)]);
  return result.rows[0];
}

export async function markMockSent(messageId: string, invitationId: string) {
  await transaction(async (client) => {
    await client.query("UPDATE outbound_messages SET status='MOCKED',sent_at=NOW(),updated_at=NOW() WHERE id=$1", [messageId]);
    await client.query("UPDATE invitations SET status=CASE WHEN status='RESPONDED' THEN status ELSE 'SENT' END,sent_at=NOW(),updated_at=NOW() WHERE id=$1", [invitationId]);
  });
}

export async function markLiveSent(messageId: string, invitationId: string, providerMessageId: string) {
  await transaction(async (client) => {
    await client.query("UPDATE outbound_messages SET status='SENT',sent_at=NOW(),provider_message_id=$2,updated_at=NOW() WHERE id=$1", [messageId, providerMessageId]);
    await client.query("UPDATE invitations SET status=CASE WHEN status='RESPONDED' THEN status ELSE 'SENT' END,sent_at=NOW(),updated_at=NOW() WHERE id=$1", [invitationId]);
  });
}

export async function markMessageFailed(messageId: string, invitationId: string, errorMessage: string) {
  await transaction(async (client) => {
    await client.query("UPDATE outbound_messages SET status='FAILED',error_message=$2,updated_at=NOW() WHERE id=$1", [messageId, errorMessage]);
    await client.query("UPDATE invitations SET status=CASE WHEN status='RESPONDED' THEN status ELSE 'FAILED' END,updated_at=NOW() WHERE id=$1", [invitationId]);
  });
}

export async function updateMessageProviderStatus(providerMessageId: string, status: string, at: Date, errorMessage?: string) {
  const fields: Record<string, string> = { SENT: "sent_at", DELIVERED: "delivered_at", READ: "read_at" };
  const field = fields[status];
  if (field) await query(`UPDATE outbound_messages SET status=$2, ${field}=$3, updated_at=NOW() WHERE provider_message_id=$1`, [providerMessageId, status, at]);
  else await query("UPDATE outbound_messages SET status='FAILED',error_message=$2,updated_at=NOW() WHERE provider_message_id=$1", [providerMessageId, errorMessage ?? "Envío fallido"]);
}

export async function addAudit(client: PoolClient | null, actor: string, action: string, entityType: string, entityId: string, metadata?: unknown) {
  const executor = client ?? { query: (text: string, values: unknown[]) => query(text, values) };
  await executor.query("INSERT INTO audit_logs (actor,action,entity_type,entity_id,metadata) VALUES ($1,$2,$3,$4,$5::jsonb)",
    [actor, action, entityType, entityId, JSON.stringify(metadata ?? null)]);
}

export async function updateInvitationByAdmin(id: string, response: Invitation["response"], actor: string) {
  return transaction(async (client) => {
    const invResult = await client.query<Invitation & { capacity: number }>(`SELECT ${invitationSelect("i")}, e.capacity FROM invitations i JOIN events e ON e.id=i.event_id WHERE i.id=$1 FOR UPDATE`, [id]);
    const invitation = invResult.rows[0];
    if (!invitation) throw new Error("Invitación no encontrada");
    if (["CONFIRMED","SELECTED"].includes(response) && !["CONFIRMED","SELECTED"].includes(invitation.response)) {
      const count = await client.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM invitations WHERE event_id=$1 AND response IN ('CONFIRMED','SELECTED')", [invitation.eventId]);
      if (Number(count.rows[0].count) >= invitation.capacity) throw new Error("No quedan plazas disponibles");
    }
    await client.query("UPDATE invitations SET response=$2,status='RESPONDED',responded_at=NOW(),selected_at=CASE WHEN $2='SELECTED' THEN NOW() ELSE NULL END,updated_at=NOW() WHERE id=$1", [id, response]);
    await addAudit(client, actor, "INVITATION_STATUS_CHANGED", "Invitation", id, { response });
    return invitation.eventId;
  });
}

async function playerRespondOnce(id: string, version: number, requested: "CONFIRMED" | "AVAILABLE" | "DECLINED", note: string | null) {
  return transaction(async (client) => {
    const result = await client.query<Invitation & { capacity: number; responseMode: EventRecord["responseMode"]; eventStatus: EventRecord["status"]; deadlineAt: Date }>(`
      SELECT ${invitationSelect("i")}, e.capacity, e.response_mode AS "responseMode", e.status AS "eventStatus", e.deadline_at AS "deadlineAt"
      FROM invitations i JOIN events e ON e.id=i.event_id WHERE i.id=$1 FOR UPDATE`, [id]);
    const invitation = result.rows[0];
    if (!invitation || invitation.linkVersion !== version) throw new Error("El enlace ya no es válido");
    if (["CANCELLED","CLOSED"].includes(invitation.eventStatus) || new Date() > invitation.deadlineAt) throw new Error("La convocatoria está cerrada");
    let response: Invitation["response"] = requested;
    let waitlistPosition: number | null = null;
    if (invitation.responseMode === "DIRECT" && requested === "CONFIRMED") {
      const count = await client.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM invitations WHERE event_id=$1 AND response IN ('CONFIRMED','SELECTED') AND id<>$2", [invitation.eventId, invitation.id]);
      if (Number(count.rows[0].count) >= invitation.capacity) {
        response = "WAITLISTED";
        const waiting = await client.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM invitations WHERE event_id=$1 AND response='WAITLISTED' AND id<>$2", [invitation.eventId, invitation.id]);
        waitlistPosition = Number(waiting.rows[0].count) + 1;
      }
    }
    if (invitation.responseMode !== "DIRECT" && requested === "CONFIRMED") response = "AVAILABLE";
    await client.query("UPDATE invitations SET response=$2,response_note=$3,waitlist_position=$4,responded_at=NOW(),status='RESPONDED',updated_at=NOW() WHERE id=$1", [id,response,note,waitlistPosition]);
    await addAudit(client, `player:${invitation.playerId}`, "PLAYER_RESPONDED", "Invitation", id, { response, note });
    return response;
  }, true);
}

export async function playerRespond(id: string, version: number, requested: "CONFIRMED" | "AVAILABLE" | "DECLINED", note: string | null) {
  try { return await playerRespondOnce(id, version, requested, note); }
  catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "40001") return playerRespondOnce(id, version, requested, note);
    throw error;
  }
}
