import Link from "next/link";
import { getDashboardStats, listUpcomingEvents } from "@/lib/repository";
import { formatShortDateTime, eventTypeLabel } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [stats, upcoming] = await Promise.all([getDashboardStats(), listUpcomingEvents(6)]);
  return <main className="page"><div className="container">
    <div className="actions" style={{ justifyContent: "space-between", marginBottom: 28 }}><div><p className="eyebrow">Centro de control</p><h1>Resumen</h1><p className="muted">Estado general de las convocatorias.</p></div><Link className="button button-primary" href="/admin/events/new">Nueva convocatoria</Link></div>
    <section className="grid grid-3">
      <article className="card"><p className="muted">Jugadores activos</p><p className="metric">{stats.players}</p></article>
      <article className="card"><p className="muted">Convocatorias creadas</p><p className="metric">{stats.events}</p></article>
      <article className="card"><p className="muted">Respuestas pendientes</p><p className="metric">{stats.pending}</p></article>
    </section>
    <section style={{ marginTop: 28 }}><h2>Próximas convocatorias</h2><div className="table-wrap"><table>
      <thead><tr><th>Actividad</th><th>Fecha</th><th>Tipo</th><th>Respuestas</th><th></th></tr></thead>
      <tbody>{upcoming.length === 0 ? <tr><td colSpan={5}>Todavía no hay convocatorias próximas.</td></tr> : upcoming.map((event) => <tr key={event.id}>
        <td><strong>{event.title}</strong><br /><span className="muted small">{event.venue}</span></td><td>{formatShortDateTime(event.startsAt)}</td><td>{eventTypeLabel(event.type)}</td><td>{event.answeredCount}/{event.invitationCount}</td><td><Link href={`/admin/events/${event.id}`}>Abrir</Link></td>
      </tr>)}</tbody>
    </table></div></section>
  </div></main>;
}
