import { z } from "zod";

const envSchema = z.object({
  DEMO_MODE: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  DATABASE_URL: z.string().min(1),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(10).default(2),
  APP_URL: z.string().url(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  SESSION_SECRET: z.string().min(32),
  CLUB_TIMEZONE: z.string().default("Europe/Madrid"),
  CLUB_NAME: z.string().default("Club de Pádel"),
  WHATSAPP_MODE: z.enum(["mock", "live"]).default("mock"),
  WHATSAPP_GRAPH_VERSION: z.string().default("v25.0"),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_TEMPLATE_NAME: z.string().default("convocatoria_padel"),
  WHATSAPP_TEMPLATE_LANGUAGE: z.string().default("es")
});

const demoMode = process.env.DEMO_MODE === "true";
const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const env = envSchema.parse({
  DEMO_MODE: process.env.DEMO_MODE,
  DATABASE_URL: process.env.DATABASE_URL ?? (isProductionBuild || demoMode ? "postgresql://demo:demo@localhost:5432/demo" : undefined),
  DB_POOL_MAX: process.env.DB_POOL_MAX,
  APP_URL: process.env.APP_URL ?? (vercelHost ? `https://${vercelHost}` : undefined) ?? (isProductionBuild || demoMode ? "http://localhost:3000" : undefined),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? (demoMode ? "demo@clubpadel.local" : undefined) ?? (isProductionBuild ? "build@example.com" : undefined),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? (demoMode ? "Demo123!" : undefined),
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  SESSION_SECRET: process.env.SESSION_SECRET ?? (demoMode ? "demo-only-session-secret-not-for-production" : undefined) ?? (isProductionBuild ? "build-only-secret-never-used-at-runtime" : undefined),
  CLUB_TIMEZONE: process.env.CLUB_TIMEZONE,
  CLUB_NAME: process.env.CLUB_NAME,
  WHATSAPP_MODE: process.env.WHATSAPP_MODE,
  WHATSAPP_GRAPH_VERSION: process.env.WHATSAPP_GRAPH_VERSION,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
  WHATSAPP_TEMPLATE_NAME: process.env.WHATSAPP_TEMPLATE_NAME,
  WHATSAPP_TEMPLATE_LANGUAGE: process.env.WHATSAPP_TEMPLATE_LANGUAGE
});
