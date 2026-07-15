import { env } from "@/lib/env";

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: env.CLUB_TIMEZONE
  }).format(new Date(date));
}

export function formatShortDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: env.CLUB_TIMEZONE
  }).format(new Date(date));
}

export function eventTypeLabel(type: string) {
  return type === "LEAGUE_ROUND" ? "Jornada de liga" : "Partida suelta";
}

export function responseModeLabel(mode: string) {
  if (mode === "AVAILABILITY") return "Declaración de disponibilidad";
  if (mode === "SELECTION") return "Disponibilidad y selección del capitán";
  return "Inscripción directa";
}

export function playerResponseLabel(response: string) {
  const labels: Record<string, string> = {
    PENDING: "Sin responder",
    CONFIRMED: "Confirmado",
    AVAILABLE: "Disponible",
    DECLINED: "No disponible",
    WAITLISTED: "Lista de espera",
    SELECTED: "Seleccionado",
    NOT_SELECTED: "No seleccionado",
    CANCELLED: "Baja"
  };
  return labels[response] ?? response;
}

export function eventStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Borrador",
    PUBLISHED: "Publicada",
    OPEN: "Abierta",
    CLOSED: "Cerrada",
    CANCELLED: "Cancelada"
  };
  return labels[status] ?? status;
}

export function messageStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    CREATED: "Preparado",
    SENT: "Enviado",
    DELIVERED: "Entregado",
    READ: "Leído",
    FAILED: "Error",
    OPENED: "Abierto"
  };
  return labels[status] ?? status;
}
