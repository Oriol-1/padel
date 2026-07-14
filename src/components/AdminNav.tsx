import Link from "next/link";

export function AdminNav() {
  return (
    <header className="admin-header">
      <div className="container nav-row">
        <Link className="brand" href="/admin"><span className="brand-mark">P</span><span>Panel de pádel</span></Link>
        <nav className="nav-links" aria-label="Administración">
          <Link href="/admin">Resumen</Link>
          <Link href="/admin/events">Convocatorias</Link>
          <Link href="/admin/events/new">Nueva convocatoria</Link>
          <Link href="/admin/players">Jugadores</Link>
          <form action="/api/auth/logout" method="post">
            <button className="link-button" type="submit">Salir</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
