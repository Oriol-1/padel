import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="admin-shell"><AdminNav demoMode={env.DEMO_MODE} /><div className="admin-content">{env.DEMO_MODE ? <div className="demo-banner"><div className="container"><strong>Modo demostración</strong> · Datos de ejemplo sin PostgreSQL. Puedes revisar la interfaz, pero los cambios no se guardan.</div></div> : null}{children}</div></div>;
}
