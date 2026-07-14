import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL no está configurada");
const pool = new Pool({ connectionString });
const sql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
await pool.query(sql);
await pool.end();
console.log("Esquema de base de datos aplicado.");
