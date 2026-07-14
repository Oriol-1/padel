import type { Metadata } from "next";
import "./globals.css";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: `${env.CLUB_NAME} · Convocatorias`,
  description: "Gestión de convocatorias e inscripciones para partidas sueltas y jornadas de liga de pádel."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
