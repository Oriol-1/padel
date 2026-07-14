export type Player = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  category: string | null;
  level: string | null;
  active: boolean;
  whatsappConsent: boolean;
  consentTextVersion: string | null;
  consentedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EventRecord = {
  id: string;
  title: string;
  type: "SINGLE_MATCH" | "LEAGUE_ROUND";
  responseMode: "DIRECT" | "AVAILABILITY" | "SELECTION";
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED" | "COMPLETED";
  startsAt: Date;
  endsAt: Date;
  deadlineAt: Date;
  venue: string;
  address: string | null;
  capacity: number;
  category: string | null;
  priceNote: string | null;
  description: string | null;
  createdBy: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Invitation = {
  id: string;
  eventId: string;
  playerId: string;
  status: "PENDING" | "SENT" | "OPENED" | "RESPONDED" | "FAILED";
  response: "PENDING" | "CONFIRMED" | "AVAILABLE" | "DECLINED" | "WAITLISTED" | "SELECTED" | "NOT_SELECTED" | "CANCELLED";
  responseNote: string | null;
  waitlistPosition: number | null;
  linkVersion: number;
  sentAt: Date | null;
  openedAt: Date | null;
  respondedAt: Date | null;
  selectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OutboundMessage = {
  id: string;
  invitationId: string;
  providerMessageId: string | null;
  templateName: string | null;
  destination: string;
  status: "QUEUED" | "MOCKED" | "SENT" | "DELIVERED" | "READ" | "FAILED";
  payload: unknown;
  errorMessage: string | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InvitationFull = Invitation & { player: Player; event: EventRecord; messages?: OutboundMessage[] };
