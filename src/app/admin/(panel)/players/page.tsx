import { listPlayers } from "@/lib/repository";
import { env } from "@/lib/env";
import { BrandMark } from "@/components/BrandMark";

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ created?: string; archived?: string; restored?: string; accessRevoked?: string; error?: string }> }) {
  const params = await searchParams;
  const players = await listPlayers(false);
  const active = players.filter((player) => player.active);
  const discarded = players.filter((player) => !player.active);

  return <main className="page"><div className="container">
    <div className="page-heading"><div><p className="eyebrow">Plantilla del club</p><h1>Jugadores</h1><p className="muted">Contactos y disponibilidad para convocar.</p></div><div className="page-heading-actions"><a className="button button-primary mobile-only" href="#add-player">+ Añadir</a><div className="count-pill"><strong>{active.length}</strong><span>activos</span></div></div></div>
    {params.created ? <div className="alert alert-success" role="status">Jugador añadido a la plantilla.</div> : null}
    {params.archived ? <div className="alert alert-success" role="status">Jugador trasladado a descartados. Su historial se conserva.</div> : null}
    {params.restored ? <div className="alert alert-success" role="status">Jugador restaurado en la plantilla activa.</div> : null}
    {params.accessRevoked ? <div className="alert alert-success" role="status">Acceso personal revocado. Los enlaces de sesión anteriores ya no serán válidos.</div> : null}
    {params.error ? <div className="alert alert-error" role="alert">No se pudo completar la operación. Revisa los datos o posibles duplicados.</div> : null}

    {env.DEMO_MODE ? <section className="portal-callout"><div className="portal-callout-icon"><BrandMark /></div><div><p className="eyebrow">Experiencia del jugador</p><h2>Área privada del jugador</h2><p>Comprueba cómo Sandra ve únicamente sus próximos partidos confirmados o seleccionados.</p></div><a className="button button-accent" href="/api/admin/players/demo-player-sandra/preview-portal" target="_blank" rel="noreferrer">Abrir como Sandra ↗</a></section> : null}

    <details className="card quick-create" id="add-player" open={active.length === 0}>
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
      <div className="mobile-only mobile-player-list">{active.length === 0 ? <div className="mobile-empty">No hay jugadores activos.</div> : active.map((player) => <article className="mobile-player-card" key={player.id}>
        <div className="mobile-player-head"><div className="person-cell"><span className="avatar">{player.firstName[0]}{player.lastName[0]}</span><span><strong>{player.firstName} {player.lastName}</strong><small>{player.category ?? "Sin grupo"} · {player.level ?? "Nivel no indicado"}</small></span></div><span className={`mobile-consent ${player.whatsappConsent ? "is-on" : ""}`}>{player.whatsappConsent ? "WhatsApp" : "Sin permiso"}</span></div>
        <a className="mobile-phone" href={`tel:${player.phone}`}>{player.phone}</a>
        <details className="mobile-player-details"><summary>Gestionar jugador</summary><div><a className="button button-primary" href={`/api/admin/players/${player.id}/preview-portal`} target="_blank" rel="noreferrer">Ver área ↗</a><form action={`/api/admin/players/${player.id}/revoke-access`} method="post"><button className="button button-secondary" type="submit" disabled={env.DEMO_MODE}>Revocar enlace</button></form><form action={`/api/admin/players/${player.id}/archive`} method="post"><button className="button button-danger" type="submit" disabled={env.DEMO_MODE}>Archivar jugador</button></form></div></details>
      </article>)}</div>
      <div className="table-wrap desktop-only"><table><caption className="sr-only">Jugadores activos</caption><thead><tr><th scope="col">Jugador</th><th scope="col">Contacto</th><th scope="col">Grupo y nivel</th><th scope="col">WhatsApp</th><th scope="col"><span className="sr-only">Acciones</span></th></tr></thead><tbody>
        {active.length === 0 ? <tr><td className="empty-row" colSpan={5}>No hay jugadores activos.</td></tr> : active.map((player) => <tr key={player.id}>
          <td data-label="Jugador"><div className="person-cell"><span className="avatar">{player.firstName[0]}{player.lastName[0]}</span><strong>{player.firstName} {player.lastName}</strong></div></td>
          <td data-label="Contacto">{player.phone}<br /><span className="muted small">{player.email ?? "Sin correo"}</span></td>
          <td data-label="Grupo y nivel">{player.category ?? "Sin grupo"}<br /><span className="muted small">{player.level ?? "Nivel no indicado"}</span></td>
          <td data-label="WhatsApp"><span className={`consent-dot ${player.whatsappConsent ? "is-on" : ""}`} />{player.whatsappConsent ? "Autorizado" : "Pendiente"}</td>
          <td className="table-actions"><div className="row-actions"><a className="button button-primary button-compact" href={`/api/admin/players/${player.id}/preview-portal`} target="_blank" rel="noreferrer">Ver área ↗</a><form action={`/api/admin/players/${player.id}/revoke-access`} method="post"><button className="button button-secondary button-compact" type="submit" disabled={env.DEMO_MODE} title="Invalida las sesiones personales anteriores">Revocar enlace</button></form><form action={`/api/admin/players/${player.id}/archive`} method="post"><button className="icon-action" type="submit" disabled={env.DEMO_MODE}>Archivar</button></form></div></td>
        </tr>)}
      </tbody></table></div>
    </section>

    <details className="discarded-section">
      <summary><span><strong>Descartados</strong><small>Fuera de nuevas convocatorias, con su historial conservado</small></span><span className="section-count">{discarded.length}</span></summary>
      <div className="mobile-only mobile-player-list">{discarded.length === 0 ? <div className="mobile-empty">No hay jugadores archivados.</div> : discarded.map((player) => <article className="mobile-player-card is-muted" key={player.id}><div className="mobile-player-head"><div className="person-cell"><span className="avatar avatar-muted">{player.firstName[0]}{player.lastName[0]}</span><span><strong>{player.firstName} {player.lastName}</strong><small>{player.category ?? "Sin grupo"}</small></span></div></div><a className="mobile-phone" href={`tel:${player.phone}`}>{player.phone}</a><form action={`/api/admin/players/${player.id}/restore`} method="post"><button className="button button-secondary button-block" type="submit" disabled={env.DEMO_MODE}>Restaurar en plantilla</button></form></article>)}</div>
      <div className="table-wrap desktop-only"><table><caption className="sr-only">Jugadores archivados</caption><thead><tr><th scope="col">Jugador</th><th scope="col">Contacto</th><th scope="col">Último grupo</th><th scope="col"><span className="sr-only">Acciones</span></th></tr></thead><tbody>
        {discarded.length === 0 ? <tr><td className="empty-row" colSpan={4}>No hay jugadores descartados.</td></tr> : discarded.map((player) => <tr key={player.id}>
          <td data-label="Jugador"><div className="person-cell"><span className="avatar avatar-muted">{player.firstName[0]}{player.lastName[0]}</span><strong>{player.firstName} {player.lastName}</strong></div></td>
          <td data-label="Contacto">{player.phone}<br /><span className="muted small">{player.email ?? "Sin correo"}</span></td><td data-label="Último grupo">{player.category ?? "Sin grupo"}</td>
          <td className="table-actions"><form action={`/api/admin/players/${player.id}/restore`} method="post"><button className="button button-secondary" type="submit" disabled={env.DEMO_MODE}>Restaurar</button></form></td>
        </tr>)}
      </tbody></table></div>
    </details>
  </div></main>;
}
