import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminSession()) redirect("/admin");
  const params = await searchParams;
  return (
    <main className="page">
      <div className="narrow">
        <section className="card">
          <h1>Acceso de administración</h1>
          <p className="muted">Gestiona jugadores, partidas sueltas y jornadas de liga.</p>
          {params.error ? <div className="alert alert-error">Correo o contraseña incorrectos.</div> : null}
          <form action="/api/auth/login" method="post" className="form-grid">
            <div className="field field-full">
              <label htmlFor="email">Correo</label>
              <input id="email" name="email" type="email" autoComplete="username" required />
            </div>
            <div className="field field-full">
              <label htmlFor="password">Contraseña</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <div className="field-full">
              <button className="button button-primary" type="submit">Entrar</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
