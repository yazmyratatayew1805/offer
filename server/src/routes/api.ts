import type { FastifyInstance } from 'fastify'
import type Database from 'better-sqlite3'
import { requireAdmin } from '../auth.js'
import * as repo from '../db/repo.js'
import { payments } from '../payments/index.js'
import type { OrderStatus } from '../types.js'

const ORDER_STATUSES: OrderStatus[] = ['new', 'pending', 'paid', 'cancelled']

export async function registerRoutes(app: FastifyInstance, db: Database.Database): Promise<void> {
  app.get('/health', async () => ({ ok: true }))

  // —— Public ——
  app.get('/api/products', async () => repo.listProducts(db, true))

  app.get('/api/tariffs', async (request) => {
    const q = request.query as { productId?: string }
    const productId = q.productId ? Number(q.productId) : undefined
    return repo.listTariffs(db, {
      activeOnly: true,
      productId: Number.isFinite(productId) ? productId : undefined,
    })
  })

  app.post('/api/orders', async (request, reply) => {
    const body = request.body as {
      tariff_id?: number
      telegram_user_id?: number
      telegram_username?: string
      contact_note?: string
    }
    if (!body?.tariff_id || !Number.isFinite(body.tariff_id)) {
      return reply.code(400).send({ error: 'tariff_id required' })
    }
    const tariff = repo.getTariff(db, body.tariff_id)
    if (!tariff || !tariff.active) {
      return reply.code(404).send({ error: 'Tariff not found' })
    }
    const order = repo.createOrder(db, {
      tariff_id: body.tariff_id,
      telegram_user_id: body.telegram_user_id ?? null,
      telegram_username: body.telegram_username ?? null,
      contact_note: body.contact_note ?? null,
      status: 'pending',
    })
    return reply.code(201).send(order)
  })

  app.post('/api/payments/create', async (request, reply) => {
    const body = request.body as { orderId?: number }
    if (!body?.orderId) return reply.code(400).send({ error: 'orderId required' })
    const session = await payments.createPayment(body.orderId)
    return reply.code(501).send(session)
  })

  app.post('/api/payments/webhook', async (request, reply) => {
    const result = await payments.handleWebhook(request.body)
    return reply.code(501).send(result)
  })

  // —— Admin (X-Admin-Token) ——
  app.register(async (admin) => {
    admin.addHook('preHandler', requireAdmin)

    admin.get('/api/admin/products', async () => repo.listProducts(db, false))
    admin.post('/api/admin/products', async (request, reply) => {
      const body = request.body as {
        slug: string
        name: string
        description?: string
        active?: number
      }
      if (!body?.slug || !body?.name) {
        return reply.code(400).send({ error: 'slug and name required' })
      }
      return reply.code(201).send(repo.createProduct(db, body))
    })
    admin.patch('/api/admin/products/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      const updated = repo.updateProduct(db, Number(id), request.body as object)
      if (!updated) return reply.code(404).send({ error: 'Not found' })
      return updated
    })
    admin.delete('/api/admin/products/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      if (!repo.deleteProduct(db, Number(id))) {
        return reply.code(404).send({ error: 'Not found' })
      }
      return { ok: true }
    })

    admin.get('/api/admin/tariffs', async () => repo.listTariffs(db, { activeOnly: false }))
    admin.post('/api/admin/tariffs', async (request, reply) => {
      const body = request.body as {
        product_id: number
        slug: string
        name: string
        price_rub: number
        features?: string[]
        summary?: string | null
        popular?: number
        active?: number
        sort_order?: number
      }
      if (!body?.product_id || !body?.slug || !body?.name || body.price_rub == null) {
        return reply.code(400).send({ error: 'product_id, slug, name, price_rub required' })
      }
      return reply.code(201).send(repo.createTariff(db, body))
    })
    admin.patch('/api/admin/tariffs/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      const updated = repo.updateTariff(db, Number(id), request.body as object)
      if (!updated) return reply.code(404).send({ error: 'Not found' })
      return updated
    })
    admin.delete('/api/admin/tariffs/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      if (!repo.deleteTariff(db, Number(id))) {
        return reply.code(404).send({ error: 'Not found' })
      }
      return { ok: true }
    })

    admin.get('/api/admin/orders', async () => repo.listOrders(db))
    admin.patch('/api/admin/orders/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = request.body as { status?: OrderStatus }
      if (!body?.status || !ORDER_STATUSES.includes(body.status)) {
        return reply.code(400).send({ error: 'valid status required' })
      }
      const updated = repo.updateOrderStatus(db, Number(id), body.status)
      if (!updated) return reply.code(404).send({ error: 'Not found' })
      return updated
    })

    admin.get('/api/admin/lead-magnets', async () => repo.listLeadMagnets(db, false))
    admin.post('/api/admin/lead-magnets', async (request, reply) => {
      const body = request.body as {
        slug: string
        title: string
        description?: string
        content_url?: string
        active?: number
        sort_order?: number
      }
      if (!body?.slug || !body?.title) {
        return reply.code(400).send({ error: 'slug and title required' })
      }
      return reply.code(201).send(repo.createLeadMagnet(db, body))
    })
    admin.patch('/api/admin/lead-magnets/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      const updated = repo.updateLeadMagnet(db, Number(id), request.body as object)
      if (!updated) return reply.code(404).send({ error: 'Not found' })
      return updated
    })
    admin.delete('/api/admin/lead-magnets/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      if (!repo.deleteLeadMagnet(db, Number(id))) {
        return reply.code(404).send({ error: 'Not found' })
      }
      return { ok: true }
    })
  })
}
