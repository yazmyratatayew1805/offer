import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function resolveDbPath(databaseUrl?: string): string {
  const raw = databaseUrl || process.env.DATABASE_URL || './data/offer-lab.db'
  if (raw.startsWith('file:')) {
    return path.resolve(raw.replace(/^file:/, ''))
  }
  if (path.isAbsolute(raw)) return raw
  return path.resolve(path.join(__dirname, '../..'), raw)
}

export function openDb(databaseUrl?: string): Database.Database {
  const dbPath = resolveDbPath(databaseUrl)
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  migrate(db)
  return db
}

export function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tariffs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      price_rub INTEGER NOT NULL,
      features_json TEXT NOT NULL DEFAULT '[]',
      summary TEXT,
      popular INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(product_id, slug)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tariff_id INTEGER NOT NULL REFERENCES tariffs(id),
      status TEXT NOT NULL DEFAULT 'new'
        CHECK(status IN ('new', 'pending', 'paid', 'cancelled')),
      telegram_user_id INTEGER,
      telegram_username TEXT,
      contact_note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lead_magnets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      content_url TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bot_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER NOT NULL UNIQUE,
      username TEXT,
      first_name TEXT,
      subscribed_checked_at TEXT,
      is_subscribed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
}

/**
 * Later: switch to Postgres by setting DATABASE_URL=postgres://...
 * and replacing better-sqlite3 with drizzle+postgres or pg.
 * Keep the same schema; only the driver and connection string change.
 */
