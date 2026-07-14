import Link from "next/link";
import { env } from "@/lib/env";

export default function HomePage() {
  return (
    <>
      <main>
        <section className="hero">
          <div className="container">
            <p><strong>{env.CLUB_NAME}</strong></p>
            <h1>Convocatorias de pádel claras, rápidas y sin cadenas interminables.</h1>
            <p>Crea partidas sueltas o jornadas de liga, envía un enlace por WhatsApp y controla confirmados, disponibilidad, lista de espera y suplencias.</p>
            <div className="hero-actions">
              <Link className="button button-accent" href="/admin/login">Entrar en administración</Link>
            </div>
          </div>
        </section>
        <section className="page">
          <div className="container grid grid-3">
            <article className="card"><h2>1. Crea</h2><p>Define fecha, lugar, plazas, modalidad y jugadores convocados.</p></article>
            <article className="card"><h2>2. Envía</h2><p>El sistema genera enlaces personales y los comunica mediante WhatsApp.</p></article>
            <article className="card"><h2>3. Controla</h2><p>Consulta respuestas en tiempo real y gestiona selección, bajas y suplentes.</p></article>
          </div>
        </section>
      </main>
      <footer><div className="container">MVP de gestión de convocatorias de pádel.</div></footer>
    </>
  );
}
