import Link from "next/link";
import { env } from "@/lib/env";

export default function HomePage() {
  return (
    <>
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{env.CLUB_NAME} · Gestión deportiva</p>
              <h1>Tu club, perfectamente coordinado.</h1>
              <p>Convocatorias, disponibilidad y equipos en un único lugar. Menos mensajes cruzados, más tiempo para jugar.</p>
              <div className="hero-actions">
                <Link className="button button-accent" href="/admin/login">Abrir panel</Link>
                <a className="button button-secondary" href="#funciones">Ver cómo funciona</a>
              </div>
            </div>
            <div className="hero-panel" aria-hidden="true">
              <div className="hero-panel-inner">
                <div className="hero-panel-top">
                  <div><p className="small muted">Próxima convocatoria</p><strong>Partida del jueves</strong></div>
                  <div className="hero-date"><span>JUL</span><strong>16</strong></div>
                </div>
                <div className="hero-roster">
                  <div className="hero-player"><span>Sandra Martínez</span><span className="hero-status">Confirmada</span></div>
                  <div className="hero-player"><span>Marc Soler</span><span className="hero-status">Disponible</span></div>
                  <div className="hero-player"><span>Laia Costa</span><span className="hero-status">Confirmada</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="feature-section" id="funciones">
          <div className="container">
            <div className="feature-intro">
              <p className="eyebrow">Un flujo más simple</p>
              <h2>De la convocatoria al partido, sin fricción.</h2>
              <p className="muted">Diseñado para que capitanes y jugadores sepan siempre qué toca y quién está disponible.</p>
            </div>
            <div className="grid grid-3">
              <article className="card"><p className="eyebrow">01 · Organiza</p><h2>Crea con precisión</h2><p className="muted">Define fecha, pista, plazas, modalidad y el grupo exacto de jugadores.</p></article>
              <article className="card"><p className="eyebrow">02 · Convoca</p><h2>Enlaces personales</h2><p className="muted">Cada jugador recibe un acceso seguro y responde desde cualquier móvil.</p></article>
              <article className="card"><p className="eyebrow">03 · Decide</p><h2>Control en tiempo real</h2><p className="muted">Gestiona confirmados, disponibilidad, selección y lista de espera de un vistazo.</p></article>
            </div>
          </div>
        </section>
      </main>
      <footer><div className="container">{env.CLUB_NAME} · Gestión de convocatorias de pádel.</div></footer>
    </>
  );
}
