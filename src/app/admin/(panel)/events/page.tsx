import Link from "next/link";
import { listEvents } from "@/lib/repository";
import { eventStatusLabel, eventTypeLabel, formatShortDateTime, responseModeLabel } from "@/lib/format";
import { env } from "@/lib/env";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ deleted?: string; error?: string }> }) {
  const params = await searchParams;
  const events = await listEvents();
  const now = new Date();
  const upcoming = events.filter((event) => new Date(event.startsAt) >= now && !["CLOSED", "CANCELLED"].includes(event.status)).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const previous = events.filter((event) => !upcoming.includes(event));

  const mobileEventCard = (event: (typeof events)[number]) => <article className="mobile-event-card" key={event.id}>
    <div className="mobile-event-top"><span className="mobile-event-date">{formatShortDateTime(event.startsAt)}</span><span className={`badge status-${event.status.toLowerCase()}`}>{eventStatusLabel(event.status)}</span></div>
    <Link className="mobile-card-title" href={`/admin/events/${event.id}`}>{event.title}</Link>
    <p className="mobile-card-meta">{event.venue} · {eventTypeLabel(event.type)}</p>
    <div className="mobile-event-progress"><span><strong>{event.answeredCount}</strong> de {event.invitationCount} respuestas</span><div className="progress" aria-hidden="true"><span style={{ width: `${event.invitationCount ? Math.min(100, event.answeredCount / event.invitationCount * 100) : 0}%` }} /></div></div>
    <div className="mobile-card-footer"><Link className="button button-primary" href={`/admin/events/${event.id}`}>Gestionar</Link><details className="mobile-actions-menu"><summary aria-label={`Más acciones para ${event.title}`}>•••</summary><div><p>{responseModeLabel(event.responseMode)}</p><form action={`/api/admin/events/${event.id}/duplicate`} method="post"><button className="button button-secondary" type="submit" disabled={env.DEMO_MODE}>Duplicar convocatoria</button></form></div></details></div>
  </article>;

  return <main className="page"><div className="container">
    <header className="page-heading"><div><p className="eyebrow">Calendario deportivo</p><h1>Convocatorias</h1><p className="muted">Primero, los encuentros que necesitan atención.</p></div><Link className="button button-primary" href="/admin/events/new">+ Nueva convocatoria</Link></header>
    {params.deleted ? <div className="alert alert-success" role="status">Convocatoria eliminada.</div> : null}
    {params.error ? <div className="alert alert-error" role="alert">No se pudo completar la operación.</div> : null}

    <div className="mobile-only mobile-event-sections">
      <section><div className="section-heading"><div><h2>Próximas</h2><p className="muted">Abiertas y ordenadas por cercanía.</p></div><span className="section-count">{upcoming.length}</span></div><div className="mobile-event-list">{upcoming.length ? upcoming.map(mobileEventCard) : <div className="mobile-empty"><strong>No hay convocatorias próximas</strong><Link href="/admin/events/new">Crear una nueva</Link></div>}</div></section>
      <details className="mobile-archive" open={upcoming.length === 0}><summary><span><strong>Historial y cerradas</strong><small>{previous.length} convocatorias</small></span><span className="section-count">{previous.length}</span></summary><div className="mobile-event-list">{previous.map(mobileEventCard)}</div></details>
    </div>

    <div className="table-wrap desktop-only"><table><caption className="sr-only">Todas las convocatorias</caption><thead><tr><th scope="col">Convocatoria</th><th scope="col">Fecha</th><th scope="col">Modalidad</th><th scope="col">Estado</th><th scope="col">Respuestas</th><th scope="col"><span className="sr-only">Acciones</span></th></tr></thead><tbody>
      {events.length === 0 ? <tr><td className="empty-row" colSpan={6}><strong>No hay convocatorias todavía.</strong><br /><Link href="/admin/events/new">Crear la primera convocatoria</Link></td></tr> : events.map((event) => <tr key={event.id}><td><Link className="event-title-link" href={`/admin/events/${event.id}`}>{event.title}</Link><br /><span className="muted small">{eventTypeLabel(event.type)} · {event.venue}</span></td><td>{formatShortDateTime(event.startsAt)}</td><td>{responseModeLabel(event.responseMode)}</td><td><span className={`badge status-${event.status.toLowerCase()}`}>{eventStatusLabel(event.status)}</span></td><td><strong>{event.answeredCount} de {event.invitationCount}</strong><div className="progress" aria-hidden="true"><span style={{ width: `${event.invitationCount ? Math.min(100, event.answeredCount / event.invitationCount * 100) : 0}%` }} /></div></td><td><div className="row-actions"><Link className="button button-primary button-compact" href={`/admin/events/${event.id}`}>Gestionar</Link><form action={`/api/admin/events/${event.id}/duplicate`} method="post"><button className="button button-secondary button-compact" type="submit" disabled={env.DEMO_MODE}>Duplicar</button></form></div></td></tr>)}
    </tbody></table></div>
  </div></main>;
}
