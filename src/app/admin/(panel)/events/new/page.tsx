import Link from "next/link";
import { listPlayers } from "@/lib/repository";
import { env } from "@/lib/env";

export default async function NewEventPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const players = await listPlayers(true);
  const authorizedPlayers = players.filter((player) => player.whatsappConsent);
  const unauthorizedPlayers = players.filter((player) => !player.whatsappConsent);
  return <main className="page"><div className="container">
    <header className="page-heading"><div><Link className="back-link" href="/admin/events">← Volver a convocatorias</Link><p className="eyebrow">Nuevo encuentro</p><h1>Nueva convocatoria</h1><p className="muted">Prepara el partido, define el plazo y elige a los jugadores.</p></div></header>
    {params.error ? <div className="alert alert-error" role="alert">No se pudo crear la convocatoria. Revisa fechas, plazas y destinatarios.</div> : null}
    <form action="/api/admin/events" method="post" className="card form-card">
      <fieldset className="form-section"><legend><span className="form-section-title">1. El encuentro</span></legend><div className="form-grid">
        <div className="field field-full"><label htmlFor="title">Título de la convocatoria</label><input id="title" name="title" placeholder="Partida del jueves · Nivel intermedio" required /><span className="field-hint">Será lo primero que verán los jugadores.</span></div>
      </div></fieldset>
      <fieldset className="form-section"><legend><span className="form-section-title">2. Fecha y pista</span></legend><div className="form-grid">
        <div className="field"><label htmlFor="startsAt">Inicio</label><input id="startsAt" name="startsAt" type="datetime-local" required /><span className="field-hint">Hora local del club.</span></div>
        <div className="field"><label htmlFor="venue">Club o sede</label><input id="venue" name="venue" placeholder="Nombre del club" required /></div>
        <div className="field"><label htmlFor="capacity">Número de plazas</label><input id="capacity" name="capacity" type="number" min="1" max="100" defaultValue="4" required /></div>
        <div className="field"><label htmlFor="responseMode">Cómo responderán</label><select id="responseMode" name="responseMode"><option value="DIRECT">Inscripción directa</option><option value="AVAILABILITY">Declarar disponibilidad</option><option value="SELECTION">Disponibilidad y selección</option></select><span className="field-hint">En selección, el capitán decide las plazas finales.</span></div>
        <div className="field"><label htmlFor="deadlineAt">Límite de respuesta</label><input id="deadlineAt" name="deadlineAt" type="datetime-local" required /><span className="field-hint">Después de esta hora ya no podrán responder.</span></div>
        <div className="field"><label htmlFor="endsAt">Final</label><input id="endsAt" name="endsAt" type="datetime-local" required /></div>
        <div className="field"><label htmlFor="type">Tipo</label><select id="type" name="type"><option value="SINGLE_MATCH">Partida suelta</option><option value="LEAGUE_ROUND">Jornada de liga</option></select></div>
        <details className="advanced-options field-full"><summary>Añadir dirección, categoría, precio o indicaciones</summary><div className="form-grid details-content">
          <div className="field"><label htmlFor="address">Dirección</label><input id="address" name="address" /></div>
          <div className="field"><label htmlFor="category">Categoría</label><input id="category" name="category" /></div>
          <div className="field"><label htmlFor="priceNote">Precio informativo</label><input id="priceNote" name="priceNote" placeholder="8 € por jugador" /></div>
          <div className="field field-full"><label htmlFor="description">Descripción o indicaciones</label><textarea id="description" name="description" /></div>
        </div></details>
      </div></fieldset>
      <fieldset className="form-section"><legend><span className="form-section-title">3. Jugadores convocados</span></legend>
        {players.length === 0 ? <div className="empty-state"><strong>Aún no hay jugadores activos</strong><Link href="/admin/players">Añade jugadores a la plantilla</Link> antes de crear la convocatoria.</div> : <><p className="player-selection-summary"><strong>{authorizedPlayers.length}</strong> jugadores autorizados seleccionados</p><div className="player-checks">{authorizedPlayers.map((player) => <label className="player-check" key={player.id}><input type="checkbox" name="playerIds" value={player.id} defaultChecked /><span className="player-check-copy"><strong>{player.firstName} {player.lastName}</strong><small>{player.category ?? "Sin grupo"} · {player.level ?? "Nivel no indicado"}</small><span className="consent-tag">WhatsApp autorizado</span></span></label>)}</div>{unauthorizedPlayers.length ? <details className="unauthorized-players"><summary>Sin autorización de WhatsApp ({unauthorizedPlayers.length})</summary><div className="player-checks">{unauthorizedPlayers.map((player) => <label className="player-check" key={player.id}><input type="checkbox" name="playerIds" value={player.id} /><span className="player-check-copy"><strong>{player.firstName} {player.lastName}</strong><small>{player.category ?? "Sin grupo"} · {player.level ?? "Nivel no indicado"}</small><span className="consent-tag is-off">Sin autorización de WhatsApp</span></span></label>)}</div></details> : null}</>}
      </fieldset>
      <div className="form-actions actions"><button className="button button-primary" type="submit" disabled={env.DEMO_MODE || players.length === 0}>Crear convocatoria</button><Link className="button button-secondary" href="/admin/events">Cancelar</Link></div>
    </form>
  </div></main>;
}
