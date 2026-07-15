import Link from "next/link";
import { getDashboardStats, listUpcomingEvents } from "@/lib/repository";
import { formatShortDateTime, eventTypeLabel } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [stats, upcoming] = await Promise.all([getDashboardStats(), listUpcomingEvents(6)]);
  return <main className="page"><div className="container">
    <header className="page-heading"><div><p className="eyebrow">Centro de control</p><h1>Tu próxima jugada</h1><p className="muted">Lo urgente y lo próximo, preparado para actuar.</p></div><Link className="button button-primary" href="/admin/events/new">+ Nueva convocatoria</Link></header>

    <section className="dashboard-agenda"><div className="section-heading"><div><p className="eyebrow">Agenda</p><h2>Próximas convocatorias</h2></div><Link href="/admin/events">Ver todas</Link></div>
      <div className="mobile-only mobile-event-list">{upcoming.length === 0 ? <div className="mobile-empty"><strong>No hay partidos próximos</strong><span>Crea una convocatoria para empezar.</span><Link className="button button-primary" href="/admin/events/new">Nueva convocatoria</Link></div> : upcoming.map((event, index) => <article className={`mobile-event-card ${index === 0 ? "is-priority" : ""}`} key={event.id}>
        <div className="mobile-event-top"><span className="mobile-event-date">{formatShortDateTime(event.startsAt)}</span>{index === 0 ? <span className="badge status-open">Próxima</span> : null}</div>
        <Link className="mobile-card-title" href={`/admin/events/${event.id}`}>{event.title}</Link>
        <p className="mobile-card-meta">{event.venue} · {eventTypeLabel(event.type)}</p>
        <div className="mobile-event-progress"><span><strong>{event.answeredCount}</strong> de {event.invitationCount} respuestas</span><div className="progress" aria-hidden="true"><span style={{ width: `${event.invitationCount ? Math.min(100, event.answeredCount / event.invitationCount * 100) : 0}%` }} /></div></div>
        <Link className={`button ${index === 0 ? "button-primary" : "button-secondary"}`} href={`/admin/events/${event.id}`}>Gestionar{index === 0 ? " próxima" : ""}</Link>
      </article>)}</div>
      <div className="table-wrap desktop-only"><table><caption className="sr-only">Próximas convocatorias del club</caption><thead><tr><th scope="col">Actividad</th><th scope="col">Fecha</th><th scope="col">Tipo</th><th scope="col">Respuestas</th><th scope="col"><span className="sr-only">Acciones</span></th></tr></thead>
        <tbody>{upcoming.length === 0 ? <tr><td className="empty-row" colSpan={5}><strong>Todavía no hay convocatorias próximas.</strong><br /><Link href="/admin/events/new">Crear la primera convocatoria</Link></td></tr> : upcoming.map((event) => <tr key={event.id}>
          <td><Link className="event-title-link" href={`/admin/events/${event.id}`}>{event.title}</Link><br /><span className="muted small">{event.venue}</span></td><td>{formatShortDateTime(event.startsAt)}</td><td>{eventTypeLabel(event.type)}</td><td><strong>{event.answeredCount} de {event.invitationCount}</strong><div className="progress" aria-hidden="true"><span style={{ width: `${event.invitationCount ? Math.min(100, event.answeredCount / event.invitationCount * 100) : 0}%` }} /></div></td><td><Link className="button button-secondary button-compact" href={`/admin/events/${event.id}`}>Gestionar</Link></td>
        </tr>)}</tbody>
      </table></div>
    </section>

    <section className="dashboard-stats"><div className="section-heading"><div><p className="eyebrow">Club</p><h2>Resumen de actividad</h2></div></div><div className="grid grid-3">
      <article className="card metric-card"><p className="metric-label">Jugadores activos</p><p className="metric">{stats.players}</p></article>
      <article className="card metric-card"><p className="metric-label">Convocatorias creadas</p><p className="metric">{stats.events}</p></article>
      <article className="card metric-card"><p className="metric-label">Respuestas pendientes</p><p className="metric">{stats.pending}</p></article>
    </div></section>
  </div></main>;
}
