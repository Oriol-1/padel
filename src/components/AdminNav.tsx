"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Resumen", description: "Vista general", icon: "home" },
  { href: "/admin/events", label: "Convocatorias", description: "Partidas y jornadas", icon: "calendar" },
  { href: "/admin/events/new", label: "Nueva convocatoria", description: "Crear y seleccionar", icon: "plus", primary: true },
  { href: "/admin/players", label: "Jugadores", description: "Plantilla del club", icon: "users" }
];

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10M9 20v-6h6v6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /><path d="M8 14h3M14 14h2M8 17h2" /></>,
    plus: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
    users: <><path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20" /><circle cx="10" cy="7" r="4" /><path d="M17 10a3 3 0 1 0 0-6M18 14a4 4 0 0 1 3 3.9V20" /></>,
    logout: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 8l4 4-4 4M8 12h10" /></>
  };
  return <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function AdminNav({ demoMode }: { demoMode: boolean }) {
  const pathname = usePathname();
  const active = (href: string) => {
    if (href === "/admin") return pathname === href;
    if (href === "/admin/events/new") return pathname === href;
    if (href === "/admin/events") return pathname.startsWith(href) && pathname !== "/admin/events/new";
    return pathname.startsWith(href);
  };

  return <>
    <header className="mobile-admin-bar">
      <Link className="brand" href="/admin"><span className="brand-mark">P</span><span>Panel de pádel</span></Link>
      <form action="/api/auth/logout" method="post"><button className="mobile-logout" type="submit" aria-label="Cerrar sesión"><NavIcon name="logout" /></button></form>
    </header>
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <Link className="brand" href="/admin"><span className="brand-mark">P</span><span><strong>Panel de pádel</strong><small>Gestión deportiva</small></span></Link>
      </div>
      <nav className="sidebar-nav" aria-label="Administración">
        <p className="nav-section-label">Espacio de trabajo</p>
        {items.map((item) => <Link className={`nav-item ${item.primary ? "nav-item-primary" : ""} ${active(item.href) ? "is-active" : ""}`} href={item.href} key={item.href} aria-current={active(item.href) ? "page" : undefined}>
          <span className="nav-icon-wrap"><NavIcon name={item.icon} /></span>
          <span className="nav-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
        </Link>)}
      </nav>
      <div className="sidebar-footer">
        <div className="system-state"><span className="system-dot" /><span><strong>Sistema activo</strong><small>{demoMode ? "Modo visual" : "Base de datos conectada"}</small></span></div>
        <form action="/api/auth/logout" method="post"><button className="nav-item logout-item" type="submit"><span className="nav-icon-wrap"><NavIcon name="logout" /></span><span className="nav-copy"><strong>Cerrar sesión</strong><small>Salir del panel</small></span></button></form>
      </div>
    </aside>
  </>;
}
