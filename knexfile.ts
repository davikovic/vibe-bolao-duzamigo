import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import fs from 'fs';
import type { Knex } from "knex";

// Carrega .env.local se existir, senão .env
const envPath = fs.existsSync(path.resolve(process.cwd(), '.env.local'))
  ? path.resolve(process.cwd(), '.env.local')
  : path.resolve(process.cwd(), '.env');

dotenvConfig({ path: envPath });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL?.split('?')[0],
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/db/migrations"
    },
    seeds: {
      directory: "./src/db/seeds"
    }
  },
  production: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL?.split('?')[0],
      ssl: { rejectUnauthorized: false }, // Muitas vezes necessário para conexões externas na Vercel
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/db/migrations"
    },
    seeds: {
      directory: "./src/db/seeds"
    }
  }
};

export default config;
