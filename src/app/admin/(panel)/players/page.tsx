import { listPlayers } from "@/lib/repository";

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ created?: string; deleted?: string; error?: string }> }) {
  const params = await searchParams;
  const players = await listPlayers(false);
  return <main className="page"><div className="container">
    <h1>Jugadores</h1><p className="muted">Los números deben guardarse en formato internacional para poder utilizar WhatsApp.</p>
    {params.created ? <div className="alert alert-success">Jugador guardado correctamente.</div> : null}
    {params.deleted ? <div className="alert alert-success">Jugador eliminado junto con sus invitaciones asociadas.</div> : null}
    {params.error ? <div className="alert alert-error">No se pudo completar la operación. Revisa los datos y que el teléfono o correo no estén repetidos.</div> : null}
    <section className="card" style={{ marginBottom: 26 }}><h2>Nuevo jugador</h2><form action="/api/admin/players" method="post" className="form-grid">
      <div className="field"><label htmlFor="firstName">Nombre</label><input id="firstName" name="firstName" required /></div>
      <div className="field"><label htmlFor="lastName">Apellidos</label><input id="lastName" name="lastName" required /></div>
      <div className="field"><label htmlFor="phone">Teléfono</label><input id="phone" name="phone" placeholder="+34600111222" required /></div>
      <div className="field"><label htmlFor="email">Correo, opcional</label><input id="email" name="email" type="email" /></div>
      <div className="field"><label htmlFor="category">Categoría o equipo</label><input id="category" name="category" /></div>
      <div className="field"><label htmlFor="level">Nivel</label><input id="level" name="level" /></div>
      <div className="field-full checkbox-row"><input id="whatsappConsent" name="whatsappConsent" value="true" type="checkbox" /><label htmlFor="whatsappConsent">El jugador ha autorizado recibir convocatorias y avisos deportivos por WhatsApp.</label></div>
      <div className="field-full"><button className="button button-primary" type="submit">Guardar jugador</button></div>
    </form></section>
    <div className="table-wrap"><table><thead><tr><th>Jugador</th><th>Contacto</th><th>Grupo</th><th>Nivel</th><th>WhatsApp</th><th>Gestión master</th></tr></thead><tbody>
      {players.map((player) => <tr key={player.id}><td><strong>{player.firstName} {player.lastName}</strong></td><td>{player.phone}<br /><span className="muted small">{player.email ?? "Sin correo"}</span></td><td>{player.category ?? "—"}</td><td>{player.level ?? "—"}</td><td>{player.whatsappConsent ? "Autorizado" : "No autorizado"}</td><td><form action={`/api/admin/players/${player.id}/delete`} method="post"><button className="button button-danger" type="submit" title="También elimina sus invitaciones y mensajes">Eliminar</button></form></td></tr>)}
    </tbody></table></div>
  </div></main>;
}
