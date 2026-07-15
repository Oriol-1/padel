import Link from "next/link";
import { getDashboardStats, listUpcomingEvents } from "@/lib/repository";
import { formatShortDateTime, eventTypeLabel } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [stats, upcoming] = await Promise.all([getDashboardStats(), listUpcomingEvents(6)]);
  return <main className="page"><div className="container">
    <header className="page-heading"><div><p className="eyebrow">Centro de control</p><h1>Todo el club, de un vistazo</h1><p className="muted">Consulta la actividad y entra directamente en cada tarea.</p></div><Link className="button button-primary" href="/admin/events/new">+ Nueva convocatoria</Link></header>
    <section className="grid grid-3">
      <article className="card metric-card"><p className="metric-label">Jugadores activos</p><p className="metric">{stats.players}</p></article>
      <article className="card metric-card"><p className="metric-label">Convocatorias creadas</p><p className="metric">{stats.events}</p></article>
      <article className="card metric-card"><p className="metric-label">Respuestas pendientes</p><p className="metric">{stats.pending}</p></article>
    </section>
    <section className="content-section"><div className="section-heading"><div><p className="eyebrow">Agenda</p><h2>Próximas convocatorias</h2></div><Link href="/admin/events">Ver todas</Link></div><div className="table-wrap"><table className="responsive-table">
      <caption className="sr-only">Próximas convocatorias del club</caption><thead><tr><th scope="col">Actividad</th><th scope="col">Fecha</th><th scope="col">Tipo</th><th scope="col">Respuestas</th><th scope="col"><span className="sr-only">Acciones</span></th></tr></thead>
      <tbody>{upcoming.length === 0 ? <tr><td className="empty-row" colSpan={5}><strong>Todavía no hay convocatorias próximas.</strong><br /><Link href="/admin/events/new">Crear la primera convocatoria</Link></td></tr> : upcoming.map((event) => <tr key={event.id}>
        <td data-label="Actividad"><Link className="event-title-link" href={`/admin/events/${event.id}`}>{event.title}</Link><br /><span className="muted small">{event.venue}</span></td><td data-label="Fecha">{formatShortDateTime(event.startsAt)}</td><td data-label="Tipo">{eventTypeLabel(event.type)}</td><td data-label="Respuestas"><strong>{event.answeredCount} de {event.invitationCount}</strong><div className="progress" aria-hidden="true"><span style={{ width: `${event.invitationCount ? Math.min(100, event.answeredCount / event.invitationCount * 100) : 0}%` }} /></div></td><td className="table-actions"><Link className="button button-secondary button-compact" href={`/admin/events/${event.id}`}>Gestionar</Link></td>
      </tr>)}</tbody>
    </table></div></section>
  </div></main>;
}
