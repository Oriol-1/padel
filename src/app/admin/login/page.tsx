import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { env } from "@/lib/env";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminSession()) redirect("/admin");
  const params = await searchParams;
  const testPassword = env.ADMIN_PASSWORD ?? "";
  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="card login-card">
          <div className="login-brand"><BrandMark /></div>
          <p className="eyebrow">Área privada</p>
          <h1>Acceso de administración</h1>
          <p className="muted">Gestiona jugadores, partidas sueltas y jornadas de liga.</p>
          {env.DEMO_MODE ? <div className="alert alert-success" role="status">Acceso temporal para pruebas.<br /><strong>Correo:</strong> {env.ADMIN_EMAIL}<br /><strong>Contraseña:</strong> {testPassword || "Configurada mediante hash"}</div> : null}
          {params.error ? <div className="alert alert-error" role="alert">Correo o contraseña incorrectos.</div> : null}
          <form action="/api/auth/login" method="post" className="form-grid">
            <div className="field field-full">
              <label htmlFor="email">Correo</label>
               <input id="email" name="email" type="email" autoComplete="username" defaultValue={env.DEMO_MODE ? env.ADMIN_EMAIL : ""} autoFocus required />
            </div>
            <div className="field field-full">
              <label htmlFor="password">Contraseña</label>
               <input id="password" name="password" type={env.DEMO_MODE ? "text" : "password"} autoComplete="current-password" defaultValue={env.DEMO_MODE ? testPassword : ""} required />
            </div>
            <div className="field-full">
              <button className="button button-primary button-block" type="submit">Entrar al panel</button>
            </div>
          </form>
        </section><Link className="login-back" href="/">← Volver al inicio</Link>
      </div>
    </main>
  );
}
