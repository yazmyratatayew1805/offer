import type Database from 'better-sqlite3'
import type { LeadMagnet, Order, OrderStatus, Product, Tariff, TariffPublic } from '../types.js'

function parseTariff(row: Tariff & { product_slug?: string; product_name?: string }): TariffPublic {
  const { features_json, ...rest } = row
  let features: string[] = []
  try {
    features = JSON.parse(features_json) as string[]
  } catch {
    features = []
  }
  return { ...rest, features }
}

export function listProducts(db: Database.Database, activeOnly = true): Product[] {
  const sql = activeOnly
    ? 'SELECT * FROM products WHERE active = 1 ORDER BY id'
    : 'SELECT * FROM products ORDER BY id'
  return db.prepare(sql).all() as Product[]
}

export function getProduct(db: Database.Database, id: number): Product | undefined {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined
}

export function createProduct(
  db: Database.Database,
  data: { slug: string; name: string; description?: string; active?: number },
): Product {
  const result = db
    .prepare(
      `INSERT INTO products (slug, name, description, active)
       VALUES (@slug, @name, @description, @active)`,
    )
    .run({
      slug: data.slug,
      name: data.name,
      description: data.description ?? '',
      active: data.active ?? 1,
    })
  return getProduct(db, Number(result.lastInsertRowid))!
}

export function updateProduct(
  db: Database.Database,
  id: number,
  data: Partial<{ slug: string; name: string; description: string; active: number }>,
): Product | undefined {
  const current = getProduct(db, id)
  if (!current) return undefined
  db.prepare(
    `UPDATE products SET
      slug = @slug, name = @name, description = @description, active = @active
     WHERE id = @id`,
  ).run({
    id,
    slug: data.slug ?? current.slug,
    name: data.name ?? current.name,
    description: data.description ?? current.description,
    active: data.active ?? current.active,
  })
  return getProduct(db, id)
}

export function deleteProduct(db: Database.Database, id: number): boolean {
  return db.prepare('DELETE FROM products WHERE id = ?').run(id).changes > 0
}

export function listTariffs(
  db: Database.Database,
  opts: { activeOnly?: boolean; productId?: number } = {},
): TariffPublic[] {
  const clauses: string[] = []
  const params: Record<string, number> = {}
  if (opts.activeOnly) clauses.push('t.active = 1')
  if (opts.productId != null) {
    clauses.push('t.product_id = @productId')
    params.productId = opts.productId
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const rows = db
    .prepare(
      `SELECT t.*, p.slug AS product_slug, p.name AS product_name
       FROM tariffs t
       JOIN products p ON p.id = t.product_id
       ${where}
       ORDER BY t.product_id, t.sort_order, t.id`,
    )
    .all(params) as Array<Tariff & { product_slug: string; product_name: string }>
  return rows.map(parseTariff)
}

export function getTariff(db: Database.Database, id: number): TariffPublic | undefined {
  const row = db
    .prepare(
      `SELECT t.*, p.slug AS product_slug, p.name AS product_name
       FROM tariffs t
       JOIN products p ON p.id = t.product_id
       WHERE t.id = ?`,
    )
    .get(id) as (Tariff & { product_slug: string; product_name: string }) | undefined
  return row ? parseTariff(row) : undefined
}

export function createTariff(
  db: Database.Database,
  data: {
    product_id: number
    slug: string
    name: string
    price_rub: number
    features?: string[]
    summary?: string | null
    popular?: number
    active?: number
    sort_order?: number
  },
): TariffPublic {
  const result = db
    .prepare(
      `INSERT INTO tariffs
        (product_id, slug, name, price_rub, features_json, summary, popular, active, sort_order)
       VALUES
        (@product_id, @slug, @name, @price_rub, @features_json, @summary, @popular, @active, @sort_order)`,
    )
    .run({
      product_id: data.product_id,
      slug: data.slug,
      name: data.name,
      price_rub: data.price_rub,
      features_json: JSON.stringify(data.features ?? []),
      summary: data.summary ?? null,
      popular: data.popular ?? 0,
      active: data.active ?? 1,
      sort_order: data.sort_order ?? 0,
    })
  return getTariff(db, Number(result.lastInsertRowid))!
}

export function updateTariff(
  db: Database.Database,
  id: number,
  data: Partial<{
    product_id: number
    slug: string
    name: string
    price_rub: number
    features: string[]
    summary: string | null
    popular: number
    active: number
    sort_order: number
  }>,
): TariffPublic | undefined {
  const current = db.prepare('SELECT * FROM tariffs WHERE id = ?').get(id) as Tariff | undefined
  if (!current) return undefined
  db.prepare(
    `UPDATE tariffs SET
      product_id = @product_id,
      slug = @slug,
      name = @name,
      price_rub = @price_rub,
      features_json = @features_json,
      summary = @summary,
      popular = @popular,
      active = @active,
      sort_order = @sort_order
     WHERE id = @id`,
  ).run({
    id,
    product_id: data.product_id ?? current.product_id,
    slug: data.slug ?? current.slug,
    name: data.name ?? current.name,
    price_rub: data.price_rub ?? current.price_rub,
    features_json:
      data.features != null ? JSON.stringify(data.features) : current.features_json,
    summary: data.summary !== undefined ? data.summary : current.summary,
    popular: data.popular ?? current.popular,
    active: data.active ?? current.active,
    sort_order: data.sort_order ?? current.sort_order,
  })
  return getTariff(db, id)
}

export function deleteTariff(db: Database.Database, id: number): boolean {
  return db.prepare('DELETE FROM tariffs WHERE id = ?').run(id).changes > 0
}

export function listOrders(db: Database.Database): Array<Order & { tariff_name?: string; product_name?: string }> {
  return db
    .prepare(
      `SELECT o.*, t.name AS tariff_name, p.name AS product_name
       FROM orders o
       JOIN tariffs t ON t.id = o.tariff_id
       JOIN products p ON p.id = t.product_id
       ORDER BY o.id DESC`,
    )
    .all() as Array<Order & { tariff_name: string; product_name: string }>
}

export function getOrder(db: Database.Database, id: number): Order | undefined {
  return db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined
}

export function createOrder(
  db: Database.Database,
  data: {
    tariff_id: number
    telegram_user_id?: number | null
    telegram_username?: string | null
    contact_note?: string | null
    status?: OrderStatus
  },
): Order {
  const result = db
    .prepare(
      `INSERT INTO orders
        (tariff_id, status, telegram_user_id, telegram_username, contact_note)
       VALUES
        (@tariff_id, @status, @telegram_user_id, @telegram_username, @contact_note)`,
    )
    .run({
      tariff_id: data.tariff_id,
      status: data.status ?? 'new',
      telegram_user_id: data.telegram_user_id ?? null,
      telegram_username: data.telegram_username ?? null,
      contact_note: data.contact_note ?? null,
    })
  return getOrder(db, Number(result.lastInsertRowid))!
}

export function updateOrderStatus(
  db: Database.Database,
  id: number,
  status: OrderStatus,
): Order | undefined {
  const result = db
    .prepare(
      `UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .run(status, id)
  if (!result.changes) return undefined
  return getOrder(db, id)
}

export function listLeadMagnets(db: Database.Database, activeOnly = true): LeadMagnet[] {
  const sql = activeOnly
    ? 'SELECT * FROM lead_magnets WHERE active = 1 ORDER BY sort_order, id'
    : 'SELECT * FROM lead_magnets ORDER BY sort_order, id'
  return db.prepare(sql).all() as LeadMagnet[]
}

export function getLeadMagnet(db: Database.Database, id: number): LeadMagnet | undefined {
  return db.prepare('SELECT * FROM lead_magnets WHERE id = ?').get(id) as LeadMagnet | undefined
}

export function createLeadMagnet(
  db: Database.Database,
  data: {
    slug: string
    title: string
    description?: string
    content_url?: string
    active?: number
    sort_order?: number
  },
): LeadMagnet {
  const result = db
    .prepare(
      `INSERT INTO lead_magnets (slug, title, description, content_url, active, sort_order)
       VALUES (@slug, @title, @description, @content_url, @active, @sort_order)`,
    )
    .run({
      slug: data.slug,
      title: data.title,
      description: data.description ?? '',
      content_url: data.content_url ?? '',
      active: data.active ?? 1,
      sort_order: data.sort_order ?? 0,
    })
  return getLeadMagnet(db, Number(result.lastInsertRowid))!
}

export function updateLeadMagnet(
  db: Database.Database,
  id: number,
  data: Partial<{
    slug: string
    title: string
    description: string
    content_url: string
    active: number
    sort_order: number
  }>,
): LeadMagnet | undefined {
  const current = getLeadMagnet(db, id)
  if (!current) return undefined
  db.prepare(
    `UPDATE lead_magnets SET
      slug = @slug, title = @title, description = @description,
      content_url = @content_url, active = @active, sort_order = @sort_order
     WHERE id = @id`,
  ).run({
    id,
    slug: data.slug ?? current.slug,
    title: data.title ?? current.title,
    description: data.description ?? current.description,
    content_url: data.content_url ?? current.content_url,
    active: data.active ?? current.active,
    sort_order: data.sort_order ?? current.sort_order,
  })
  return getLeadMagnet(db, id)
}

export function deleteLeadMagnet(db: Database.Database, id: number): boolean {
  return db.prepare('DELETE FROM lead_magnets WHERE id = ?').run(id).changes > 0
}

export function upsertBotUser(
  db: Database.Database,
  data: {
    telegram_id: number
    username?: string | null
    first_name?: string | null
    is_subscribed?: number
  },
): void {
  db.prepare(
    `INSERT INTO bot_users (telegram_id, username, first_name, is_subscribed, subscribed_checked_at)
     VALUES (@telegram_id, @username, @first_name, @is_subscribed, datetime('now'))
     ON CONFLICT(telegram_id) DO UPDATE SET
       username = excluded.username,
       first_name = excluded.first_name,
       is_subscribed = COALESCE(@is_subscribed, bot_users.is_subscribed),
       subscribed_checked_at = CASE
         WHEN @is_subscribed IS NOT NULL THEN datetime('now')
         ELSE bot_users.subscribed_checked_at
       END`,
  ).run({
    telegram_id: data.telegram_id,
    username: data.username ?? null,
    first_name: data.first_name ?? null,
    is_subscribed: data.is_subscribed ?? null,
  })
}
