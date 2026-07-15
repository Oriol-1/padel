import Link from "next/link";
import { env } from "@/lib/env";
import { BrandMark } from "@/components/BrandMark";
import { UiIcon } from "@/components/UiIcon";

export default function HomePage() {
  return (
    <>
      <main>
        <section className="landing-hero">
          <div className="landing-glow landing-glow-one" />
          <div className="landing-glow landing-glow-two" />
          <div className="container hero-nav">
            <Link className="brand" href="/"><BrandMark /><span>{env.CLUB_NAME}</span></Link>
            <div className="landing-nav-actions"><a href="#sistema">El sistema</a><a href="#flujo">Cómo funciona</a><Link className="hero-login-link" href="/admin/login">Acceso al panel</Link></div>
          </div>

          <div className="container landing-hero-grid">
            <div className="landing-hero-copy">
              <div className="landing-kicker"><span className="live-dot" /> Gestión de club, sin ruido</div>
              <h1>Tu equipo entra a pista <span>antes del partido.</span></h1>
              <p>Convocatorias, disponibilidad y selección en una experiencia diseñada para que capitanes y jugadores siempre sepan cuál es el siguiente punto.</p>
              <div className="hero-actions">
                <Link className="button button-accent landing-main-cta" href="/admin/login">Entrar al club <span>↗</span></Link>
                <a className="landing-text-link" href="#sistema">Descubrir el sistema <span>↓</span></a>
              </div>
              <div className="landing-proof" aria-label="Ventajas principales">
                <div><strong>1 enlace</strong><span>para responder</span></div>
                <div><strong>0 contraseñas</strong><span>para jugadores</span></div>
                <div><strong>100% móvil</strong><span>desde WhatsApp</span></div>
              </div>
            </div>

            <div className="padel-stage" aria-label="Vista previa del sistema de convocatorias">
              <div className="court-frame">
                <div className="court-glass court-glass-left" />
                <div className="court-glass court-glass-right" />
                <div className="court-surface">
                  <span className="court-line court-line-center" />
                  <span className="court-line court-line-service-one" />
                  <span className="court-line court-line-service-two" />
                  <span className="court-net" />
                  <span className="court-player player-one" />
                  <span className="court-player player-two" />
                  <span className="court-player player-three" />
                  <span className="court-player player-four" />
                  <span className="court-ball" />
                </div>
              </div>

              <div className="landing-scoreboard">
                <span>PRÓXIMA PISTA</span><strong>JUE · 20:30</strong><small>Club Central · Pista 3</small>
              </div>

              <div className="landing-roster-card">
                <div className="roster-card-head"><div><span>Convocatoria abierta</span><strong>Partida nivel intermedio</strong></div><span className="roster-count">3/4</span></div>
                <div className="landing-player-row"><span className="avatar">SM</span><span><strong>Sandra Martínez</strong><small>Confirmada</small></span><UiIcon name="check" /></div>
                <div className="landing-player-row"><span className="avatar">MS</span><span><strong>Marc Soler</strong><small>Confirmado</small></span><UiIcon name="check" /></div>
                <div className="landing-player-row is-pending"><span className="avatar">LC</span><span><strong>Laia Costa</strong><small>Pendiente de respuesta</small></span><span className="pending-ring" /></div>
              </div>
            </div>
          </div>

          <div className="container landing-scroll-cue"><span>SCROLL PARA JUGAR</span><i /></div>
        </section>

        <section className="landing-ticker" aria-label="Funciones principales"><div className="ticker-track"><span>CONVOCA</span><i /> <span>CONFIRMA</span><i /> <span>SELECCIONA</span><i /> <span>JUEGA</span><i /> <span>CONVOCA</span><i /> <span>CONFIRMA</span></div></section>

        <section className="landing-system" id="sistema">
          <div className="container">
            <div className="landing-section-head"><div><p className="eyebrow">Diseñado desde la pista</p><h2>Todo lo importante.<br /><span>En la misma línea de juego.</span></h2></div><p>Una herramienta operativa que convierte conversaciones dispersas en decisiones claras, rápidas y visibles.</p></div>
            <div className="landing-capability-grid">
              <article className="capability-card capability-featured">
                <div className="capability-number">01</div><div className="capability-icon"><UiIcon name="calendar" /></div><h3>Agenda que se entiende</h3><p>Cada convocatoria reúne horario, pista, plazas y jugadores sin perderse entre mensajes.</p>
                <div className="mini-calendar"><span>L</span><span>M</span><span>X</span><span className="is-match">J<strong>16</strong></span><span>V</span><span>S</span><span>D</span></div>
              </article>
              <article className="capability-card">
                <div className="capability-number">02</div><div className="capability-icon"><UiIcon name="arrow" /></div><h3>Respuesta directa</h3><p>El jugador abre su enlace personal desde WhatsApp y responde en segundos, sin cuentas ni contraseñas.</p>
                <div className="response-preview"><span><UiIcon name="check" /> Estoy disponible</span><small>Respuesta registrada</small></div>
              </article>
              <article className="capability-card">
                <div className="capability-number">03</div><div className="capability-icon"><UiIcon name="check" /></div><h3>Control del equipo</h3><p>Confirmados, disponibles y lista de espera se actualizan en una vista preparada para decidir.</p>
                <div className="team-preview"><span className="avatar">SM</span><span className="avatar">MS</span><span className="avatar">LC</span><span className="team-more">+8</span></div>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-workflow" id="flujo">
          <div className="container landing-workflow-grid">
            <div className="workflow-copy"><p className="eyebrow">Un partido. Tres movimientos.</p><h2>La coordinación deja de ser el rival.</h2><p>Del primer mensaje al equipo definitivo, cada paso tiene un propósito y una señal visual clara.</p><Link className="button button-accent" href="/admin/login">Probar el panel</Link></div>
            <ol className="workflow-list">
              <li><span>01</span><div><strong>Crea la convocatoria</strong><p>Fecha, sede, modalidad y plazas en un único formulario.</p></div></li>
              <li><span>02</span><div><strong>Comparte por WhatsApp</strong><p>Cada jugador recibe un acceso personal, seguro y directo.</p></div></li>
              <li><span>03</span><div><strong>Cierra el equipo</strong><p>Decide con toda la disponibilidad ordenada delante.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="landing-final">
          <div className="container landing-final-inner">
            <div className="final-ball" aria-hidden="true" />
            <p className="eyebrow">El próximo punto empieza aquí</p>
            <h2>Menos gestión.<br />Más pádel.</h2>
            <p>Tu club coordinado con la misma precisión con la que compite.</p>
            <Link className="button button-accent landing-main-cta" href="/admin/login">Abrir el panel <span>↗</span></Link>
          </div>
        </section>
      </main>
      <footer className="landing-footer"><div className="container"><div className="player-brand"><BrandMark /><span><strong>{env.CLUB_NAME}</strong><small>Gestión deportiva</small></span></div><span>Convocatorias de pádel, bien jugadas.</span></div></footer>
    </>
  );
}
