import Link from "next/link";
import { listEvents } from "@/lib/repository";
import { eventStatusLabel, eventTypeLabel, formatShortDateTime, responseModeLabel } from "@/lib/format";
import { env } from "@/lib/env";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ deleted?: string; error?: string }> }) {
  const params = await searchParams;
  const events = await listEvents();
  return <main className="page"><div className="container">
    <header className="page-heading"><div><p className="eyebrow">Calendario deportivo</p><h1>Convocatorias</h1><p className="muted">Organiza partidas y jornadas, y controla las respuestas.</p></div><Link className="button button-primary" href="/admin/events/new">+ Nueva convocatoria</Link></header>
    {params.deleted ? <div className="alert alert-success" role="status">Convocatoria eliminada.</div> : null}
    {params.error ? <div className="alert alert-error" role="alert">No se pudo completar la operación.</div> : null}
    <div className="table-wrap"><table className="responsive-table"><caption className="sr-only">Todas las convocatorias</caption><thead><tr><th scope="col">Convocatoria</th><th scope="col">Fecha</th><th scope="col">Modalidad</th><th scope="col">Estado</th><th scope="col">Respuestas</th><th scope="col"><span className="sr-only">Acciones</span></th></tr></thead><tbody>
      {events.length === 0 ? <tr><td className="empty-row" colSpan={6}><strong>No hay convocatorias todavía.</strong><br /><Link href="/admin/events/new">Crear la primera convocatoria</Link></td></tr> : events.map((event) => <tr key={event.id}><td data-label="Convocatoria"><Link className="event-title-link" href={`/admin/events/${event.id}`}>{event.title}</Link><br /><span className="muted small">{eventTypeLabel(event.type)} · {event.venue}</span></td><td data-label="Fecha">{formatShortDateTime(event.startsAt)}</td><td data-label="Modalidad">{responseModeLabel(event.responseMode)}</td><td data-label="Estado"><span className={`badge status-${event.status.toLowerCase()}`}>{eventStatusLabel(event.status)}</span></td><td data-label="Respuestas"><strong>{event.answeredCount} de {event.invitationCount}</strong><div className="progress" aria-hidden="true"><span style={{ width: `${event.invitationCount ? Math.min(100, event.answeredCount / event.invitationCount * 100) : 0}%` }} /></div></td><td className="table-actions"><div className="row-actions"><Link className="button button-primary button-compact" href={`/admin/events/${event.id}`}>Gestionar</Link><form action={`/api/admin/events/${event.id}/duplicate`} method="post"><button className="button button-secondary button-compact" type="submit" disabled={env.DEMO_MODE}>Duplicar</button></form></div></td></tr>)}
    </tbody></table></div>
  </div></main>;
}
