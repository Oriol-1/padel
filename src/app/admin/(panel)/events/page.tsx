import Link from "next/link";
import { listEvents } from "@/lib/repository";
import { eventTypeLabel, formatShortDateTime, responseModeLabel } from "@/lib/format";
import { env } from "@/lib/env";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ deleted?: string; error?: string }> }) {
  const params = await searchParams;
  const events = await listEvents();
  return <main className="page"><div className="container">
    <div className="actions" style={{ justifyContent: "space-between" }}><div><h1>Convocatorias</h1><p className="muted">Partidas sueltas y jornadas de liga.</p></div><Link className="button button-primary" href="/admin/events/new">Nueva convocatoria</Link></div>
    {params.deleted ? <div className="alert alert-success">Convocatoria eliminada.</div> : null}
    {params.error ? <div className="alert alert-error">No se pudo completar la operación.</div> : null}
    <div className="table-wrap" style={{ marginTop: 22 }}><table><thead><tr><th>Convocatoria</th><th>Fecha</th><th>Modalidad</th><th>Estado</th><th>Respuestas</th><th></th></tr></thead><tbody>
      {events.length === 0 ? <tr><td colSpan={6}>No hay convocatorias.</td></tr> : events.map((event) => <tr key={event.id}><td><strong>{event.title}</strong><br /><span className="muted small">{eventTypeLabel(event.type)} · {event.venue}</span></td><td>{formatShortDateTime(event.startsAt)}</td><td>{responseModeLabel(event.responseMode)}</td><td>{event.status}</td><td>{event.answeredCount}/{event.invitationCount}</td><td><div className="actions"><Link href={`/admin/events/${event.id}`}>Gestionar</Link><form action={`/api/admin/events/${event.id}/duplicate`} method="post"><button className="link-action" type="submit" disabled={env.DEMO_MODE}>Duplicar</button></form></div></td></tr>)}
    </tbody></table></div>
  </div></main>;
}
