import { Bot, InlineKeyboard, webhookCallback } from 'grammy'
import type Database from 'better-sqlite3'
import type { FastifyInstance } from 'fastify'
import * as repo from '../db/repo.js'

function channelRef(): string {
  return (
    process.env.CHANNEL_ID ||
    process.env.CHANNEL_USERNAME ||
    '@myrat_code'
  )
}

function channelJoinUrl(): string {
  const ref = channelRef()
  if (ref.startsWith('@')) return `https://t.me/${ref.slice(1)}`
  if (ref.startsWith('-') || /^\d+$/.test(ref)) {
    return process.env.CHANNEL_USERNAME
      ? `https://t.me/${process.env.CHANNEL_USERNAME.replace(/^@/, '')}`
      : 'https://t.me/myrat_code'
  }
  return `https://t.me/${ref.replace(/^@/, '')}`
}

function contactHandle(): string {
  return process.env.CONTACT_HANDLE || '@myratcode'
}

function contactUrl(): string {
  return `https://t.me/${contactHandle().replace(/^@/, '')}`
}

function formatPrice(rub: number): string {
  return `${rub.toLocaleString('ru-RU')} ₽`
}

const MEMBER_STATUSES = new Set(['creator', 'administrator', 'member', 'restricted'])

export function createBot(db: Database.Database, token: string): Bot {
  const bot = new Bot(token)

  async function isSubscribed(userId: number): Promise<boolean> {
    try {
      const member = await bot.api.getChatMember(channelRef(), userId)
      return MEMBER_STATUSES.has(member.status)
    } catch (err) {
      console.error('getChatMember failed:', err)
      return false
    }
  }

  function mainMenuKeyboard() {
    return new InlineKeyboard()
      .text('Бесплатные гайды', 'menu:leads')
      .row()
      .text('Охота на оффер', 'menu:ohota')
      .row()
      .text('Вайб до прода', 'menu:vibe')
      .row()
      .url(`Связь ${contactHandle()}`, contactUrl())
  }

  function subscribeKeyboard() {
    return new InlineKeyboard()
      .url('Подписаться на канал', channelJoinUrl())
      .row()
      .text('Проверить снова', 'check:sub')
  }

  async function ensureAccess(ctx: {
    from?: { id: number; username?: string; first_name?: string }
    reply: (text: string, other?: object) => Promise<unknown>
  }): Promise<boolean> {
    if (!ctx.from) return false
    const ok = await isSubscribed(ctx.from.id)
    repo.upsertBotUser(db, {
      telegram_id: ctx.from.id,
      username: ctx.from.username ?? null,
      first_name: ctx.from.first_name ?? null,
      is_subscribed: ok ? 1 : 0,
    })
    if (!ok) {
      await ctx.reply(
        `Сначала подпишитесь на канал ${channelRef()} — там лежат бесплатные гайды.\n\nПосле подписки нажмите «Проверить снова».`,
        { reply_markup: subscribeKeyboard() },
      )
      return false
    }
    return true
  }

  async function showMainMenu(ctx: {
    reply: (text: string, other?: object) => Promise<unknown>
    editMessageText?: (text: string, other?: object) => Promise<unknown>
    callbackQuery?: unknown
  }) {
    const text =
      'Меню «До оффера»:\n\n• Бесплатные гайды\n• Тарифы Охоты и Вайба\n• Связь с менеджером'
    const markup = { reply_markup: mainMenuKeyboard() }
    if (ctx.callbackQuery && ctx.editMessageText) {
      try {
        await ctx.editMessageText(text, markup)
        return
      } catch {
        /* fall through */
      }
    }
    await ctx.reply(text, markup)
  }

  bot.command('start', async (ctx) => {
    if (!(await ensureAccess(ctx))) return
    await showMainMenu(ctx)
  })

  bot.callbackQuery('check:sub', async (ctx) => {
    await ctx.answerCallbackQuery()
    if (!(await ensureAccess(ctx))) return
    await ctx.reply('Подписка подтверждена ✓')
    await showMainMenu(ctx)
  })

  bot.callbackQuery('menu:main', async (ctx) => {
    await ctx.answerCallbackQuery()
    if (!(await ensureAccess(ctx))) return
    await showMainMenu(ctx)
  })

  bot.callbackQuery('menu:leads', async (ctx) => {
    await ctx.answerCallbackQuery()
    if (!(await ensureAccess(ctx))) return
    const leads = repo.listLeadMagnets(db, true)
    if (!leads.length) {
      await ctx.reply('Пока нет бесплатных материалов. Загляните позже.')
      return
    }
    const kb = new InlineKeyboard()
    for (const lead of leads) {
      kb.text(lead.title, `lead:${lead.id}`).row()
    }
    kb.text('← Меню', 'menu:main')
    await ctx.reply('Бесплатные гайды и мини-курсы:', { reply_markup: kb })
  })

  bot.callbackQuery(/^lead:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()
    if (!(await ensureAccess(ctx))) return
    const id = Number(ctx.match![1])
    const lead = repo.getLeadMagnet(db, id)
    if (!lead || !lead.active) {
      await ctx.reply('Материал не найден.')
      return
    }
    const kb = new InlineKeyboard()
    if (lead.content_url) kb.url('Открыть', lead.content_url).row()
    kb.text('← К гайдам', 'menu:leads').text('Меню', 'menu:main')
    await ctx.reply(`*${lead.title}*\n\n${lead.description}`, {
      parse_mode: 'Markdown',
      reply_markup: kb,
    })
  })

  async function showProductTariffs(
    ctx: { reply: (text: string, other?: object) => Promise<unknown> },
    productSlug: 'ohota' | 'vibe',
  ) {
    const products = repo.listProducts(db, true)
    const product = products.find((p) => p.slug === productSlug)
    if (!product) {
      await ctx.reply('Продукт пока недоступен.')
      return
    }
    const tariffs = repo.listTariffs(db, { activeOnly: true, productId: product.id })
    if (!tariffs.length) {
      await ctx.reply('Тарифы скоро появятся.')
      return
    }
    const kb = new InlineKeyboard()
    for (const t of tariffs) {
      kb.text(`${t.name} — ${formatPrice(t.price_rub)}`, `tariff:${t.id}`).row()
    }
    kb.text('← Меню', 'menu:main')
    await ctx.reply(`${product.name}\n\nВыберите тариф:`, { reply_markup: kb })
  }

  bot.callbackQuery('menu:ohota', async (ctx) => {
    await ctx.answerCallbackQuery()
    if (!(await ensureAccess(ctx))) return
    await showProductTariffs(ctx, 'ohota')
  })

  bot.callbackQuery('menu:vibe', async (ctx) => {
    await ctx.answerCallbackQuery()
    if (!(await ensureAccess(ctx))) return
    await showProductTariffs(ctx, 'vibe')
  })

  bot.callbackQuery(/^tariff:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()
    if (!(await ensureAccess(ctx))) return
    const id = Number(ctx.match![1])
    const tariff = repo.getTariff(db, id)
    if (!tariff || !tariff.active) {
      await ctx.reply('Тариф не найден.')
      return
    }
    const features = tariff.features.map((f) => `• ${f}`).join('\n')
    const summary = tariff.summary ? `\n_${tariff.summary}_\n` : '\n'
    const kb = new InlineKeyboard()
      .text('Оставить заявку', `order:${tariff.id}`)
      .row()
      .text('← Назад', `menu:${tariff.product_slug === 'vibe' ? 'vibe' : 'ohota'}`)
    await ctx.reply(
      `*${tariff.product_name} — ${tariff.name}*\n${summary}${formatPrice(tariff.price_rub)}\n\n${features}`,
      { parse_mode: 'Markdown', reply_markup: kb },
    )
  })

  bot.callbackQuery(/^order:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()
    if (!(await ensureAccess(ctx))) return
    const tariffId = Number(ctx.match![1])
    const tariff = repo.getTariff(db, tariffId)
    if (!tariff || !tariff.active) {
      await ctx.reply('Тариф не найден.')
      return
    }
    const order = repo.createOrder(db, {
      tariff_id: tariffId,
      telegram_user_id: ctx.from!.id,
      telegram_username: ctx.from!.username ?? null,
      status: 'pending',
      contact_note: 'Заявка из Telegram-бота',
    })
    const kb = new InlineKeyboard()
      .url(`Написать ${contactHandle()}`, contactUrl())
      .row()
      .text('← Меню', 'menu:main')
    await ctx.reply(
      `Заявка #${order.id} на «${tariff.name}» принята.\n\nМенеджер напишет в Telegram. Онлайн-оплата скоро — пока можно сразу связаться: ${contactHandle()}.`,
      { reply_markup: kb },
    )
  })

  bot.catch((err) => {
    console.error('Bot error:', err)
  })

  return bot
}

export async function registerTelegramWebhook(
  app: FastifyInstance,
  db: Database.Database,
): Promise<Bot | null> {
  const token = process.env.BOT_TOKEN?.trim()
  if (!token) {
    console.warn('BOT_TOKEN not set — Telegram webhook disabled (API still runs)')
    app.post('/telegram/webhook', async (_request, reply) => {
      return reply.code(503).send({ error: 'BOT_TOKEN not configured' })
    })
    return null
  }

  const bot = createBot(db, token)
  const secret = process.env.WEBHOOK_SECRET?.trim()

  app.post('/telegram/webhook', async (request, reply) => {
    if (secret) {
      const q = request.query as { secret?: string }
      const header = request.headers['x-telegram-bot-api-secret-token']
      if (q.secret !== secret && header !== secret) {
        return reply.code(401).send({ error: 'Invalid webhook secret' })
      }
    }
    const handler = webhookCallback(bot, 'fastify')
    return handler(request, reply)
  })

  return bot
}
