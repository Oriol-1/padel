import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventWithInvitations } from "@/lib/repository";
import { createInvitationToken } from "@/lib/invitation-token";
import { env } from "@/lib/env";
import { eventTypeLabel, formatDateTime, playerResponseLabel, responseModeLabel } from "@/lib/format";
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
  const rows = await Promise.all(invitations.map(async (invitation) => ({
    ...invitation,
    previewLink: `${env.APP_URL}/i/${await createInvitationToken(invitation.id, invitation.linkVersion, event.startsAt)}`
  })));

  return <main className="page"><div className="container">
    <div className="actions" style={{ justifyContent: "space-between" }}>
      <div><p><Link href="/admin/events">← Convocatorias</Link></p><h1>{event.title}</h1><p className="muted">{eventTypeLabel(event.type)} · {responseModeLabel(event.responseMode)}</p></div>
      <div className="actions">
        <Link className="button button-secondary" href={`/admin/events/${event.id}/edit`}>Editar</Link>
        <form action={`/api/admin/events/${event.id}/duplicate`} method="post"><button className="button button-secondary" type="submit">Duplicar</button></form>
        <form action={`/api/admin/events/${event.id}/send`} method="post"><button className="button button-primary" type="submit">Enviar pendientes</button></form>
        <form action={`/api/admin/events/${event.id}/remind`} method="post"><button className="button button-accent" type="submit">Recordar a todos</button></form>
        <form action={`/api/admin/events/${event.id}/delete`} method="post"><button className="button button-danger" type="submit" title="Elimina también invitaciones y mensajes">Eliminar</button></form>
      </div>
    </div>
    {query.sent ? <div className="alert alert-success">Proceso de envío completado. En modo de prueba se han generado mensajes y enlaces sin contactar con WhatsApp.</div> : null}
    {query.reminded ? <div className="alert alert-success">Recordatorios procesados: {query.reminded}. En modo de prueba no se ha contactado con WhatsApp.</div> : null}
    {query.edited ? <div className="alert alert-success">Convocatoria actualizada.</div> : null}
    {query.updated ? <div className="alert alert-success">Estado actualizado.</div> : null}
    {query.error ? <div className="alert alert-error">No se pudo completar la operación: {decodeURIComponent(query.error)}</div> : null}

    <section className="grid grid-3" style={{ marginTop: 22 }}>
      <article className="card"><p className="muted">Confirmados o seleccionados</p><p className="metric">{confirmedCount}/{event.capacity}</p></article>
      <article className="card"><p className="muted">Disponibles</p><p className="metric">{availableCount}</p></article>
      <article className="card"><p className="muted">Pendientes / espera</p><p className="metric">{pendingCount} / {waitlistCount}</p></article>
    </section>

    <section className="card" style={{ marginTop: 24 }}><h2>Información</h2><div className="event-meta">
      <div><strong>Fecha</strong><span>{formatDateTime(event.startsAt)} – {formatDateTime(event.endsAt)}</span></div>
      <div><strong>Límite</strong><span>{formatDateTime(event.deadlineAt)}</span></div>
      <div><strong>Lugar</strong><span>{event.venue}{event.address ? ` · ${event.address}` : ""}</span></div>
      <div><strong>Plazas</strong><span>{event.capacity}</span></div><div><strong>Categoría</strong><span>{event.category ?? "Sin categoría"}</span></div><div><strong>Precio</strong><span>{event.priceNote ?? "No indicado"}</span></div>
    </div>{event.description ? <p>{event.description}</p> : null}</section>

    <section style={{ marginTop: 28 }}><h2>Jugadores convocados</h2><div className="table-wrap"><table>
      <thead><tr><th>Jugador</th><th>Respuesta</th><th>Mensaje</th><th>Enlace de prueba</th><th>Gestión</th></tr></thead>
      <tbody>{rows.map((invitation) => <tr key={invitation.id}>
        <td><strong>{invitation.player.firstName} {invitation.player.lastName}</strong><br /><span className="muted small">{invitation.player.phone}</span></td>
        <td><StatusBadge value={invitation.response} />{invitation.responseNote ? <><br /><span className="small muted">{invitation.responseNote}</span></> : null}</td>
        <td>{invitation.messageStatus ?? invitation.status}<br /><span className="muted small">{invitation.messageSentAt ? formatDateTime(invitation.messageSentAt) : "No enviado"}</span></td>
        <td><a href={invitation.previewLink} target="_blank" rel="noreferrer">Abrir como jugador</a></td>
        <td><form action={`/api/admin/invitations/${invitation.id}/status`} method="post" className="actions">
          <select name="response" defaultValue={invitation.response} aria-label={`Estado de ${invitation.player.firstName}`}>
            {["PENDING", "AVAILABLE", "CONFIRMED", "WAITLISTED", "SELECTED", "NOT_SELECTED", "DECLINED", "CANCELLED"].map((value) => <option value={value} key={value}>{playerResponseLabel(value)}</option>)}
          </select><input type="hidden" name="eventId" value={event.id} /><button className="button button-secondary" type="submit">Guardar</button>
        </form></td>
      </tr>)}</tbody>
    </table></div></section>
  </div></main>;
}
