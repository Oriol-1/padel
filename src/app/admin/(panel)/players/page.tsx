import { listPlayers } from "@/lib/repository";
import { env } from "@/lib/env";

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ created?: string; archived?: string; restored?: string; accessRevoked?: string; error?: string }> }) {
  const params = await searchParams;
  const players = await listPlayers(false);
  const active = players.filter((player) => player.active);
  const discarded = players.filter((player) => !player.active);

  return <main className="page"><div className="container">
    <div className="page-heading"><div><p className="eyebrow">Plantilla del club</p><h1>Jugadores</h1><p className="muted">Gestiona la plantilla sin perder el historial de participación.</p></div><div className="count-pill"><strong>{active.length}</strong><span>activos</span></div></div>
    {params.created ? <div className="alert alert-success">Jugador añadido a la plantilla.</div> : null}
    {params.archived ? <div className="alert alert-success">Jugador trasladado a descartados. Su historial se conserva.</div> : null}
    {params.restored ? <div className="alert alert-success">Jugador restaurado en la plantilla activa.</div> : null}
    {params.accessRevoked ? <div className="alert alert-success">Acceso personal revocado. Los enlaces de sesión anteriores ya no serán válidos.</div> : null}
    {params.error ? <div className="alert alert-error">No se pudo completar la operación. Revisa los datos o posibles duplicados.</div> : null}

    <details className="card quick-create" open={active.length === 0}>
      <summary><span><strong>Añadir jugador</strong><small>Alta rápida con los datos esenciales</small></span><span className="summary-action">Nuevo</span></summary>
      <form action="/api/admin/players" method="post" className="form-grid details-content">
        <div className="field"><label htmlFor="firstName">Nombre</label><input id="firstName" name="firstName" autoComplete="given-name" required /></div>
        <div className="field"><label htmlFor="lastName">Apellidos</label><input id="lastName" name="lastName" autoComplete="family-name" required /></div>
        <div className="field field-full"><label htmlFor="phone">WhatsApp</label><input id="phone" name="phone" type="tel" placeholder="+34600111222" autoComplete="tel" required /><span className="field-hint">Formato internacional, incluyendo +34.</span></div>
        <div className="field-full checkbox-row"><input id="whatsappConsent" name="whatsappConsent" value="true" type="checkbox" /><label htmlFor="whatsappConsent">Ha autorizado recibir convocatorias deportivas por WhatsApp.</label></div>
        <details className="advanced-options field-full"><summary>Datos opcionales</summary><div className="form-grid details-content">
          <div className="field"><label htmlFor="email">Correo</label><input id="email" name="email" type="email" autoComplete="email" /></div>
          <div className="field"><label htmlFor="category">Equipo o grupo</label><input id="category" name="category" /></div>
          <div className="field"><label htmlFor="level">Nivel</label><input id="level" name="level" /></div>
        </div></details>
        <div className="field-full"><button className="button button-primary" type="submit" disabled={env.DEMO_MODE}>Añadir a la plantilla</button></div>
      </form>
    </details>

    <section className="roster-section"><div className="section-heading"><div><h2>Plantilla activa</h2><p className="muted">Jugadores disponibles para nuevas convocatorias.</p></div><span className="section-count">{active.length}</span></div>
      <div className="table-wrap"><table><thead><tr><th>Jugador</th><th>Contacto</th><th>Grupo y nivel</th><th>WhatsApp</th><th></th></tr></thead><tbody>
        {active.length === 0 ? <tr><td colSpan={5}>No hay jugadores activos.</td></tr> : active.map((player) => <tr key={player.id}>
          <td><div className="person-cell"><span className="avatar">{player.firstName[0]}{player.lastName[0]}</span><strong>{player.firstName} {player.lastName}</strong></div></td>
          <td>{player.phone}<br /><span className="muted small">{player.email ?? "Sin correo"}</span></td>
          <td>{player.category ?? "Sin grupo"}<br /><span className="muted small">{player.level ?? "Nivel no indicado"}</span></td>
          <td><span className={`consent-dot ${player.whatsappConsent ? "is-on" : ""}`} />{player.whatsappConsent ? "Autorizado" : "Pendiente"}</td>
          <td><div className="row-actions"><form action={`/api/admin/players/${player.id}/revoke-access`} method="post"><button className="icon-action" type="submit" disabled={env.DEMO_MODE} title="Revocar acceso personal">Revocar acceso</button></form><form action={`/api/admin/players/${player.id}/archive`} method="post"><button className="button button-secondary" type="submit" disabled={env.DEMO_MODE}>Descartar</button></form></div></td>
        </tr>)}
      </tbody></table></div>
    </section>

    <details className="discarded-section" open={discarded.length > 0}>
      <summary><span><strong>Descartados</strong><small>Fuera de nuevas convocatorias, con su historial conservado</small></span><span className="section-count">{discarded.length}</span></summary>
      <div className="table-wrap"><table><thead><tr><th>Jugador</th><th>Contacto</th><th>Último grupo</th><th></th></tr></thead><tbody>
        {discarded.length === 0 ? <tr><td colSpan={4}>No hay jugadores descartados.</td></tr> : discarded.map((player) => <tr key={player.id}>
          <td><div className="person-cell"><span className="avatar avatar-muted">{player.firstName[0]}{player.lastName[0]}</span><strong>{player.firstName} {player.lastName}</strong></div></td>
          <td>{player.phone}<br /><span className="muted small">{player.email ?? "Sin correo"}</span></td><td>{player.category ?? "Sin grupo"}</td>
          <td><form action={`/api/admin/players/${player.id}/restore`} method="post"><button className="button button-secondary" type="submit" disabled={env.DEMO_MODE}>Restaurar</button></form></td>
        </tr>)}
      </tbody></table></div>
    </details>
  </div></main>;
}
