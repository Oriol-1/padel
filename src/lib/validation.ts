import { z } from "zod";

export const playerSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Usa formato internacional, por ejemplo +34600111222"),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
  category: z.string().trim().max(80).optional(),
  level: z.string().trim().max(80).optional(),
  whatsappConsent: z.coerce.boolean().default(false)
});

export const eventDetailsSchema = z.object({
  title: z.string().trim().min(3).max(140),
  type: z.enum(["SINGLE_MATCH", "LEAGUE_ROUND"]),
  responseMode: z.enum(["DIRECT", "AVAILABILITY", "SELECTION"]),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  deadlineAt: z.coerce.date(),
  venue: z.string().trim().min(2).max(160),
  address: z.string().trim().max(200).optional(),
  capacity: z.coerce.number().int().min(1).max(100),
  category: z.string().trim().max(80).optional(),
  priceNote: z.string().trim().max(100).optional(),
  description: z.string().trim().max(2000).optional()
}).superRefine((value, ctx) => {
  if (value.endsAt <= value.startsAt) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "La hora final debe ser posterior al inicio" });
  if (value.deadlineAt > value.startsAt) ctx.addIssue({ code: "custom", path: ["deadlineAt"], message: "La fecha límite no puede ser posterior al inicio" });
});

export const eventSchema = eventDetailsSchema.and(z.object({
  playerIds: z.array(z.string().min(1)).min(1)
}));
