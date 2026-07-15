import Link from "next/link";
import { env } from "@/lib/env";
import { formatDateTime, playerResponseLabel } from "@/lib/format";
import { getPlayerSession } from "@/lib/player-auth";
import { listSelectedEventsForPlayer } from "@/lib/repository";
import { StatusBadge } from "@/components/StatusBadge";
import { BrandMark } from "@/components/BrandMark";
import { UiIcon } from "@/components/UiIcon";

export const dynamic = "force-dynamic";

export default async function MyMatchesPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const query = await searchParams;
  const session = await getPlayerSession();
  const portal = session ? await listSelectedEventsForPlayer(session.playerId, session.version) : null;

  if (!portal) return <main className="player-portal"><div className="player-shell player-shell-narrow">
    <div className="player-brand"><BrandMark /><span><strong>{env.CLUB_NAME}</strong><small>Área del jugador</small></span></div>
    <section className="player-empty card"><span className="empty-icon"><UiIcon name="arrow" /></span><h1>Abre tu enlace personal</h1><p className="muted">Para proteger tus convocatorias, entra desde el enlace que has recibido por WhatsApp.</p><Link className="button button-secondary" href="/">Volver al inicio</Link></section>
  </div></main>;

  return <main className="player-portal"><div className="player-shell">
    {query.preview ? <div className="preview-ribbon"><strong>Vista del jugador</strong><span>Estás viendo exactamente lo que verá {portal.player.firstName}.</span><Link href="/admin/players">Volver al panel</Link></div> : null}
    <header className="player-header"><div className="player-brand"><BrandMark /><span><strong>{env.CLUB_NAME}</strong><small>Área del jugador</small></span></div><form action="/api/player/logout" method="post"><button className="quiet-button" type="submit">Salir</button></form></header>
    <section className="player-welcome"><p className="eyebrow">Tu calendario deportivo</p><h1>Hola, {portal.player.firstName}</h1><p className="muted">Aquí aparecen únicamente los próximos partidos donde tienes plaza confirmada o has sido seleccionado.</p></section>
    {portal.events.length === 0 ? <section className="player-empty card"><span className="empty-icon"><UiIcon name="calendar" /></span><h2>No tienes partidos confirmados</h2><p className="muted">Cuando confirmes una plaza o seas seleccionado, aparecerá aquí automáticamente.</p></section> : <section className="match-list" aria-label="Próximos partidos">
      {portal.events.map(({ event, response }, index) => <article className={`match-card ${index === 0 ? "is-next" : ""}`} key={event.id}>
        <div className="match-date"><span>{new Intl.DateTimeFormat("es-ES", { month: "short", timeZone: env.CLUB_TIMEZONE }).format(event.startsAt)}</span><strong>{new Intl.DateTimeFormat("es-ES", { day: "2-digit", timeZone: env.CLUB_TIMEZONE }).format(event.startsAt)}</strong></div>
        <div className="match-main">{index === 0 ? <span className="next-label">Próximo partido</span> : null}<div className="match-title-row"><h2>{event.title}</h2><StatusBadge value={response} /></div><p className="match-time">{formatDateTime(event.startsAt)}</p><p className="match-place">{event.venue}{event.address ? ` · ${event.address}` : ""}</p>{event.description ? <p className="match-description">{event.description}</p> : null}<div className="match-actions">{event.address ? <a className="button button-secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.address}`)}`} target="_blank" rel="noreferrer">Cómo llegar ↗</a> : null}<span className="sr-only">{playerResponseLabel(response)}</span></div></div>
      </article>)}
    </section>}
    <footer className="player-footer">Este acceso es personal. No compartas el enlace recibido.</footer>
  </div></main>;
}
