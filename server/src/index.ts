import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { openDb } from './db/index.js'
import { seed } from './db/seed.js'
import { registerRoutes } from './routes/api.js'
import { registerTelegramWebhook } from './bot/telegram.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const db = openDb()
  seed(db)

  const app = Fastify({ logger: true })
  await app.register(cors, { origin: true })

  await registerRoutes(app, db)
  await registerTelegramWebhook(app, db)

  const port = Number(process.env.PORT || 3001)
  const host = process.env.HOST || '0.0.0.0'

  await app.listen({ port, host })
  console.log(`API listening on http://localhost:${port}`)
  console.log(`DB: ${path.resolve(__dirname, '../data/offer-lab.db')} (or DATABASE_URL)`)
  console.log('Admin: send header X-Admin-Token')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
