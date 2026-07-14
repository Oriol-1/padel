import { notFound } from "next/navigation";
import { getInvitationFull, markInvitationOpened } from "@/lib/repository";
import { verifyInvitationToken } from "@/lib/invitation-token";
import { eventTypeLabel, formatDateTime, playerResponseLabel, responseModeLabel } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function InvitationPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { token } = await params;
  const query = await searchParams;
  let payload: Awaited<ReturnType<typeof verifyInvitationToken>>;
  try { payload = await verifyInvitationToken(token); } catch { notFound(); }

  const invitation = await getInvitationFull(payload.invitationId);
  if (!invitation || invitation.linkVersion !== payload.version) notFound();

  if (!invitation.openedAt) await markInvitationOpened(invitation.id);

  const closed = invitation.event.status === "CANCELLED" || invitation.event.status === "CLOSED" || new Date() > invitation.event.deadlineAt;
  const direct = invitation.event.responseMode === "DIRECT";
  return <main className="page"><div className="narrow">
    <p className="muted"><strong>{env.CLUB_NAME}</strong></p>
    <section className="card invitation-card">
      <p className="muted">Hola, {invitation.player.firstName}</p>
      <h1>{invitation.event.title}</h1>
      <p>{eventTypeLabel(invitation.event.type)} · {responseModeLabel(invitation.event.responseMode)}</p>
      {query.ok ? <div className="alert alert-success">Respuesta registrada: <strong>{playerResponseLabel(invitation.response)}</strong>.</div> : null}
      {query.error ? <div className="alert alert-error">{decodeURIComponent(query.error)}</div> : null}
      <div className="event-meta">
        <div><strong>Fecha</strong><span>{formatDateTime(invitation.event.startsAt)}</span></div>
        <div><strong>Final</strong><span>{formatDateTime(invitation.event.endsAt)}</span></div>
        <div><strong>Lugar</strong><span>{invitation.event.venue}{invitation.event.address ? ` · ${invitation.event.address}` : ""}</span></div>
        <div><strong>Plazas</strong><span>{invitation.event.capacity}</span></div>
        <div><strong>Fecha límite</strong><span>{formatDateTime(invitation.event.deadlineAt)}</span></div>
        <div><strong>Tu estado</strong><span><StatusBadge value={invitation.response} /></span></div>
      </div>
      {invitation.event.description ? <p>{invitation.event.description}</p> : null}
      {invitation.event.priceNote ? <p><strong>Aportación:</strong> {invitation.event.priceNote}</p> : null}

      {closed ? <div className="alert alert-error">La convocatoria ya está cerrada o ha superado la fecha límite.</div> : <form action={`/api/invitations/${token}/respond`} method="post" className="response-buttons">
        {direct ? <button className="button button-primary" name="response" value="CONFIRMED" type="submit">Quiero apuntarme</button> : <button className="button button-primary" name="response" value="AVAILABLE" type="submit">Estoy disponible</button>}
        <button className="button button-danger" name="response" value="DECLINED" type="submit">No puedo asistir</button>
        <label htmlFor="note">Observación opcional</label>
        <textarea id="note" name="note" maxLength={500} placeholder="Por ejemplo: solo puedo jugar a partir de las 19:30" />
      </form>}
      <p className="small muted" style={{ marginTop: 24 }}>Este enlace es personal. No lo reenvíes a otra persona.</p>
    </section>
  </div></main>;
}
