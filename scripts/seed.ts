import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL no está configurada");
const pool = new Pool({ connectionString });
const players = [
  ["Sandra", "Martínez", "+34600111001", "sandra@example.com", "Liga A", "Intermedio", true],
  ["Marc", "Soler", "+34600111002", "marc@example.com", "Liga A", "Intermedio alto", true],
  ["Laia", "Costa", "+34600111003", "laia@example.com", "Liga A", "Intermedio", true],
  ["Jordi", "Roca", "+34600111004", "jordi@example.com", "Liga A", "Intermedio", true],
  ["Marta", "Puig", "+34600111005", "marta@example.com", "Liga A", "Intermedio alto", true],
  ["Pau", "Vidal", "+34600111006", "pau@example.com", "Liga A", "Intermedio", false]
];
for (const p of players) {
  await pool.query(`INSERT INTO players (first_name,last_name,phone,email,category,level,whatsapp_consent,consent_text_version,consented_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,CASE WHEN $7 THEN 'v1' ELSE NULL END,CASE WHEN $7 THEN NOW() ELSE NULL END)
    ON CONFLICT (phone) DO UPDATE SET first_name=EXCLUDED.first_name,last_name=EXCLUDED.last_name,email=EXCLUDED.email,category=EXCLUDED.category,level=EXCLUDED.level,whatsapp_consent=EXCLUDED.whatsapp_consent,updated_at=NOW()`, p);
}
await pool.end();
console.log(`Seed completado: ${players.length} jugadores.`);
