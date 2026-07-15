import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventWithInvitations } from "@/lib/repository";
import { createInvitationToken } from "@/lib/invitation-token";
import { env } from "@/lib/env";
import { eventStatusLabel, eventTypeLabel, formatDateTime, messageStatusLabel, playerResponseLabel, responseModeLabel } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export default async function EventDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ sent?: string; reminded?: string; error?: string; updated?: string; edited?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const detail = await getEventWithInvitations(id);
  if (!detail) notFound();
  const { event, invitations } = detail;

  const confirmedCount = invitations.filter((i) => ["CONFIRMED", "SELECTED"].includes(i.response)).length;
  const availableCount = invitations.filter((i) => i.response === "AVAILABLE").length;
  const pendingCount = invitations.filter((i) => i.response === "PENDING").length;
  const waitlistCount = invitations.filter((i) => i.response === "WAITLISTED").length;
  const unsentCount = invitations.filter((i) => !i.messageSentAt).length;
  const rows = await Promise.all(invitations.map(async (invitation) => ({
    ...invitation,
    previewLink: `${env.APP_URL}/i/${await createInvitationToken(invitation.id, invitation.linkVersion, event.startsAt)}`
  })));
  const mobileGroups = [
    { title: "Pendientes", values: ["PENDING"], priority: true },
    { title: "Disponibles", values: ["AVAILABLE", "WAITLISTED"], priority: false },
    { title: "Equipo confirmado", values: ["CONFIRMED", "SELECTED"], priority: false },
    { title: "No disponibles", values: ["DECLINED", "NOT_SELECTED", "CANCELLED"], priority: false }
  ].map((group) => ({ ...group, invitations: rows.filter((row) => group.values.includes(row.response)) })).filter((group) => group.invitations.length > 0);

  return <main className="page"><div className="container">
    <header className="page-heading">
      <div><Link className="back-link" href="/admin/events">← Volver a convocatorias</Link><p className="eyebrow">Gestión del encuentro</p><h1>{event.title}</h1><p className="muted">{eventTypeLabel(event.type)} · {responseModeLabel(event.responseMode)} · <span className={`badge status-${event.status.toLowerCase()}`}>{eventStatusLabel(event.status)}</span></p></div>
      <div className="page-actions desktop-only">
        <Link className="button button-secondary" href={`/admin/events/${event.id}/edit`}>Editar</Link>
        <form action={`/api/admin/events/${event.id}/duplicate`} method="post"><button className="button button-secondary" type="submit" disabled={env.DEMO_MODE}>Duplicar</button></form>
        <form action={`/api/admin/events/${event.id}/send`} method="post"><button className="button button-primary" type="submit" disabled={env.DEMO_MODE}>Enviar pendientes</button></form>
        <form action={`/api/admin/events/${event.id}/remind`} method="post"><button className="button button-accent" type="submit" disabled={env.DEMO_MODE}>Enviar recordatorio</button></form>
        <form className="danger-actions" action={`/api/admin/events/${event.id}/delete`} method="post"><button className="button button-danger" type="submit" title="Elimina también invitaciones y mensajes" disabled={env.DEMO_MODE}>Eliminar</button></form>
      </div>
    </header>
    {query.sent ? <div className="alert alert-success" role="status">Proceso de envío completado. En modo de prueba se han generado mensajes y enlaces sin contactar con WhatsApp.</div> : null}
    {query.reminded ? <div className="alert alert-success" role="status">Recordatorios procesados: {query.reminded}. En modo de prueba no se ha contactado con WhatsApp.</div> : null}
    {query.edited ? <div className="alert alert-success" role="status">Convocatoria actualizada.</div> : null}
    {query.updated ? <div className="alert alert-success" role="status">Estado actualizado.</div> : null}
    {query.error ? <div className="alert alert-error" role="alert">No se pudo completar la operación: {decodeURIComponent(query.error)}</div> : null}

    <section className="mobile-only mobile-event-operations">
      <div className="mobile-operation-when"><div><span>Fecha y hora</span><strong>{formatDateTime(event.startsAt)}</strong></div><div><span>Pista</span><strong>{event.venue}</strong></div></div>
      <div className="mobile-operation-score"><div><strong>{confirmedCount}/{event.capacity}</strong><span>plazas</span></div><div><strong>{pendingCount}</strong><span>pendientes</span></div><div><strong>{waitlistCount}</strong><span>en espera</span></div></div>
      <p className="mobile-deadline">Respuestas hasta {formatDateTime(event.deadlineAt)}</p>
      {unsentCount > 0 ? <form action={`/api/admin/events/${event.id}/send`} method="post"><button className="button button-primary button-block" type="submit" disabled={env.DEMO_MODE}>Enviar {unsentCount} invitaciones pendientes</button></form> : pendingCount > 0 ? <form action={`/api/admin/events/${event.id}/remind`} method="post"><button className="button button-accent button-block" type="submit" disabled={env.DEMO_MODE}>Recordar a {pendingCount} pendientes</button></form> : null}
      <details className="mobile-secondary-actions"><summary>Información y más acciones</summary><div className="event-meta">
        <div><strong>Final</strong><span>{formatDateTime(event.endsAt)}</span></div><div><strong>Lugar</strong><span>{event.venue}{event.address ? ` · ${event.address}` : ""}</span></div><div><strong>Categoría</strong><span>{event.category ?? "Sin categoría"}</span></div><div><strong>Precio</strong><span>{event.priceNote ?? "No indicado"}</span></div>
      </div>{event.description ? <p>{event.description}</p> : null}<div className="mobile-secondary-buttons"><Link className="button button-secondary" href={`/admin/events/${event.id}/edit`}>Editar</Link><form action={`/api/admin/events/${event.id}/duplicate`} method="post"><button className="button button-secondary" type="submit" disabled={env.DEMO_MODE}>Duplicar</button></form><form action={`/api/admin/events/${event.id}/delete`} method="post"><button className="button button-danger" type="submit" disabled={env.DEMO_MODE}>Eliminar</button></form></div></details>
    </section>

    <section className="grid grid-3 desktop-only">
      <article className="card metric-card"><p className="metric-label">Plazas confirmadas</p><p className="metric">{confirmedCount}<span className="muted small"> / {event.capacity}</span></p></article>
      <article className="card metric-card"><p className="metric-label">Disponibles</p><p className="metric">{availableCount}</p></article>
      <article className="card metric-card"><p className="metric-label">Pendientes · En espera</p><p className="metric">{pendingCount}<span className="muted small"> · {waitlistCount}</span></p></article>
    </section>

    <section className="card event-summary-card content-section desktop-only"><p className="eyebrow">Datos de pista</p><h2>Información del encuentro</h2><div className="event-meta">
      <div><strong>Fecha</strong><span>{formatDateTime(event.startsAt)} - {formatDateTime(event.endsAt)}</span></div>
      <div><strong>Límite</strong><span>{formatDateTime(event.deadlineAt)}</span></div>
      <div><strong>Lugar</strong><span>{event.venue}{event.address ? ` · ${event.address}` : ""}</span></div>
      <div><strong>Plazas</strong><span>{event.capacity}</span></div><div><strong>Categoría</strong><span>{event.category ?? "Sin categoría"}</span></div><div><strong>Precio</strong><span>{event.priceNote ?? "No indicado"}</span></div>
    </div>{event.description ? <p className="event-description">{event.description}</p> : null}</section>

    <section className="content-section desktop-only"><div className="section-heading"><div><p className="eyebrow">Equipo</p><h2>Jugadores convocados</h2></div><span className="section-count">{rows.length}</span></div><div className="table-wrap"><table>
      <caption className="sr-only">Jugadores convocados y estado de sus invitaciones</caption><thead><tr><th scope="col">Jugador</th><th scope="col">Respuesta</th><th scope="col">Mensaje</th><th scope="col">Invitación</th><th scope="col">Gestión</th></tr></thead>
      <tbody>{rows.length === 0 ? <tr><td className="empty-row" colSpan={5}>No hay jugadores convocados.</td></tr> : rows.map((invitation) => <tr key={invitation.id}>
        <td data-label="Jugador"><div className="person-cell"><span className="avatar">{invitation.player.firstName[0]}{invitation.player.lastName[0]}</span><span><strong>{invitation.player.firstName} {invitation.player.lastName}</strong><br /><span className="muted small">{invitation.player.phone}</span></span></div></td>
        <td data-label="Respuesta"><StatusBadge value={invitation.response} />{invitation.responseNote ? <span className="invitation-note">{invitation.responseNote}</span> : null}</td>
        <td data-label="Mensaje"><span className="message-state"><span className={`badge status-${(invitation.messageStatus ?? invitation.status).toLowerCase()}`}>{messageStatusLabel(invitation.messageStatus ?? invitation.status)}</span><span className="muted small">{invitation.messageSentAt ? formatDateTime(invitation.messageSentAt) : "Aún no enviado"}</span></span></td>
        <td data-label="Invitación"><a className="button button-secondary button-compact" href={invitation.previewLink} target="_blank" rel="noreferrer">Vista previa ↗</a></td>
        <td data-label="Gestión"><form action={`/api/admin/invitations/${invitation.id}/status`} method="post" className="manage-form">
          <select name="response" defaultValue={invitation.response} aria-label={`Estado de ${invitation.player.firstName}`}>
            {["PENDING", "AVAILABLE", "CONFIRMED", "WAITLISTED", "SELECTED", "NOT_SELECTED", "DECLINED", "CANCELLED"].map((value) => <option value={value} key={value}>{playerResponseLabel(value)}</option>)}
          </select><input type="hidden" name="eventId" value={event.id} /><button className="button button-secondary" type="submit" disabled={env.DEMO_MODE}>Actualizar</button>
        </form></td>
      </tr>)}</tbody>
    </table></div></section>

    <section className="mobile-only mobile-roster"><div className="section-heading"><div><p className="eyebrow">Equipo</p><h2>Jugadores</h2></div><span className="section-count">{rows.length}</span></div>
      {mobileGroups.length === 0 ? <div className="mobile-empty">No hay jugadores convocados.</div> : mobileGroups.map((group) => <section className={`mobile-roster-group ${group.priority ? "is-priority" : ""}`} key={group.title}><div className="mobile-group-heading"><h3>{group.title}</h3><span>{group.invitations.length}</span></div><div className="mobile-player-list">{group.invitations.map((invitation) => <article className="mobile-player-card" key={invitation.id}>
        <div className="mobile-player-head"><div className="person-cell"><span className="avatar">{invitation.player.firstName[0]}{invitation.player.lastName[0]}</span><span><strong>{invitation.player.firstName} {invitation.player.lastName}</strong><small>{invitation.player.phone}</small></span></div><StatusBadge value={invitation.response} /></div>
        {invitation.responseNote ? <span className="invitation-note">{invitation.responseNote}</span> : null}
        <form action={`/api/admin/invitations/${invitation.id}/status`} method="post" className="mobile-player-manage"><select name="response" defaultValue={invitation.response} aria-label={`Estado de ${invitation.player.firstName}`}>{["PENDING", "AVAILABLE", "CONFIRMED", "WAITLISTED", "SELECTED", "NOT_SELECTED", "DECLINED", "CANCELLED"].map((value) => <option value={value} key={value}>{playerResponseLabel(value)}</option>)}</select><input type="hidden" name="eventId" value={event.id} /><button className="button button-secondary" type="submit" disabled={env.DEMO_MODE}>Actualizar</button></form>
        <details className="mobile-player-details"><summary>Envío y enlace</summary><div><span className={`badge status-${(invitation.messageStatus ?? invitation.status).toLowerCase()}`}>{messageStatusLabel(invitation.messageStatus ?? invitation.status)}</span><span className="muted small">{invitation.messageSentAt ? formatDateTime(invitation.messageSentAt) : "Aún no enviado"}</span><a className="button button-secondary" href={invitation.previewLink} target="_blank" rel="noreferrer">Vista previa ↗</a></div></details>
      </article>)}</div></section>)}
    </section>
  </div></main>;
}
