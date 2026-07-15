import { notFound } from "next/navigation";
import { getInvitationFull, markInvitationOpened } from "@/lib/repository";
import { verifyInvitationToken } from "@/lib/invitation-token";
import { eventTypeLabel, formatDateTime, playerResponseLabel, responseModeLabel } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { env } from "@/lib/env";
import { BrandMark } from "@/components/BrandMark";
import { UiIcon } from "@/components/UiIcon";

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
  const answered = invitation.response !== "PENDING";

  return <main className="invitation-page"><div className="invitation-shell">
    <header className="player-header"><div className="player-brand"><BrandMark /><span><strong>{env.CLUB_NAME}</strong><small>Convocación personal</small></span></div>{answered ? <a className="quiet-button" href={`/api/player/session/${token}`}>Mis partidos</a> : null}</header>
    <section className="invitation-hero">
      <p className="eyebrow">{eventTypeLabel(invitation.event.type)} · {responseModeLabel(invitation.event.responseMode)}</p>
      <p className="invitation-hello">Hola, {invitation.player.firstName}</p>
      <h1>{invitation.event.title}</h1>
      <div className="invitation-essentials">
        <div><span className="essential-icon"><UiIcon name="clock" /></span><span><small>Fecha y hora</small><strong>{formatDateTime(invitation.event.startsAt)}</strong></span></div>
        <div><span className="essential-icon"><UiIcon name="pin" /></span><span><small>Lugar</small><strong>{invitation.event.venue}{invitation.event.address ? ` · ${invitation.event.address}` : ""}</strong></span></div>
      </div>
    </section>

    {query.ok ? <section className="response-success" role="status"><span className="success-check"><UiIcon name="check" /></span><div><p>Respuesta registrada</p><h2>{playerResponseLabel(invitation.response)}</h2></div><a className="button button-primary" href={`/api/player/session/${token}`}>Ver mis partidos</a></section> : null}
    {query.error ? <div className="alert alert-error" role="alert">{decodeURIComponent(query.error)}</div> : null}

    <section className="invitation-response card">
      <div className="response-heading"><div><p className="eyebrow">Tu respuesta</p><h2>{answered ? "Estado actual" : direct ? "¿Quieres jugar?" : "¿Estás disponible?"}</h2></div>{answered ? <StatusBadge value={invitation.response} /> : null}</div>
      {env.DEMO_MODE ? <div className="demo-note">Vista de demostración. Las respuestas se activarán al conectar PostgreSQL.</div> : null}
      {closed ? <div className="alert alert-closed">La convocatoria está cerrada o ha superado la fecha límite.</div> : <form action={`/api/invitations/${token}/respond`} method="post" className="response-buttons">
        {direct ? <button className="button button-primary" name="response" value="CONFIRMED" type="submit" disabled={env.DEMO_MODE}>Sí, quiero jugar</button> : <button className="button button-primary" name="response" value="AVAILABLE" type="submit" disabled={env.DEMO_MODE}>Sí, estoy disponible</button>}
        <button className="button button-secondary" name="response" value="DECLINED" type="submit" disabled={env.DEMO_MODE}>No puedo asistir</button>
        <details className="response-note"><summary>Añadir una observación</summary><label className="sr-only" htmlFor="note">Observación para el capitán</label><textarea id="note" name="note" maxLength={500} placeholder="Por ejemplo: llego diez minutos tarde" disabled={env.DEMO_MODE} /></details>
      </form>}
      <p className="response-deadline">{closed ? "El plazo de respuesta ha finalizado." : `${answered ? "Puedes cambiar tu respuesta" : "Puedes responder"} hasta ${formatDateTime(invitation.event.deadlineAt)}.`}</p>
    </section>

    <details className="invitation-details"><summary>Más información de la convocatoria</summary><div className="event-meta">
      <div><strong>Final</strong><span>{formatDateTime(invitation.event.endsAt)}</span></div><div><strong>Plazas</strong><span>{invitation.event.capacity}</span></div>{invitation.event.priceNote ? <div><strong>Aportación</strong><span>{invitation.event.priceNote}</span></div> : null}
    </div>{invitation.event.description ? <p>{invitation.event.description}</p> : null}</details>
    <footer className="player-footer">Este enlace es personal y protege tus convocatorias. No lo reenvíes.</footer>
  </div></main>;
}
