import { listPlayers } from "@/lib/repository";
import { env } from "@/lib/env";


export default async function NewEventPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const players = await listPlayers(true);
  return <main className="page"><div className="container"><p className="eyebrow">Nuevo encuentro</p><h1>Nueva convocatoria</h1><p className="muted">Completa lo esencial y selecciona a quién quieres convocar.</p>
    {params.error ? <div className="alert alert-error">No se pudo crear la convocatoria. Revisa fechas, plazas y destinatarios.</div> : null}
    <form action="/api/admin/events" method="post" className="card form-grid">
      <div className="field field-full"><label htmlFor="title">Título</label><input id="title" name="title" placeholder="Partida del jueves · Nivel intermedio" required /></div>
      <div className="field"><label htmlFor="type">Tipo</label><select id="type" name="type"><option value="SINGLE_MATCH">Partida suelta</option><option value="LEAGUE_ROUND">Jornada de liga</option></select></div>
      <div className="field"><label htmlFor="responseMode">Modalidad</label><select id="responseMode" name="responseMode"><option value="DIRECT">Inscripción directa</option><option value="AVAILABILITY">Declarar disponibilidad</option><option value="SELECTION">Disponibilidad y selección</option></select></div>
      <div className="field"><label htmlFor="startsAt">Inicio</label><input id="startsAt" name="startsAt" type="datetime-local" required /></div>
      <div className="field"><label htmlFor="endsAt">Final</label><input id="endsAt" name="endsAt" type="datetime-local" required /></div>
      <div className="field"><label htmlFor="deadlineAt">Límite de respuesta</label><input id="deadlineAt" name="deadlineAt" type="datetime-local" required /></div>
      <div className="field"><label htmlFor="capacity">Plazas o máximo seleccionable</label><input id="capacity" name="capacity" type="number" min="1" max="100" defaultValue="4" required /></div>
      <div className="field"><label htmlFor="venue">Club o sede</label><input id="venue" name="venue" required /></div>
      <details className="advanced-options field-full"><summary>Añadir dirección, categoría, precio o indicaciones</summary><div className="form-grid details-content">
        <div className="field"><label htmlFor="address">Dirección</label><input id="address" name="address" /></div>
        <div className="field"><label htmlFor="category">Categoría</label><input id="category" name="category" /></div>
        <div className="field"><label htmlFor="priceNote">Precio informativo</label><input id="priceNote" name="priceNote" placeholder="8 € por jugador" /></div>
        <div className="field field-full"><label htmlFor="description">Descripción o indicaciones</label><textarea id="description" name="description" /></div>
      </div></details>
      <div className="field field-full"><label>Jugadores convocados</label><div className="player-checks">{players.map((player) => <label className="player-check" key={player.id}><input type="checkbox" name="playerIds" value={player.id} defaultChecked={player.whatsappConsent} /><span><strong>{player.firstName} {player.lastName}</strong> · {player.category ?? "Sin grupo"} · {player.whatsappConsent ? "WhatsApp autorizado" : "sin autorización"}</span></label>)}</div></div>
      <div className="field-full actions"><button className="button button-primary" type="submit" disabled={env.DEMO_MODE}>Crear convocatoria</button></div>
    </form>
  </div></main>;
}
