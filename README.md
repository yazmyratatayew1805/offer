# До оффера (Offer Lab)

Продающий лендинг двух продуктов + backend/бот/админка.

1. **Охота на оффер** — Senior/TL для backend + онбординг первого месяца  
2. **Вайб до прода** — AI-сборка с инженерными стандартами (спринт / фриланс / веб)

## Структура

```
offer-lab/          # Vite-лендинг (Cloudflare Pages/Workers — как раньше)
  src/
  server/           # Fastify API + SQLite + Telegram webhook
  admin/            # Админ-SPA (тарифы, заявки, лид-магниты)
```

Лендинг **оставлен в корне**, чтобы не ломать текущий деплой статики на Cloudflare. API — отдельный сервис.

## Запуск

### Лендинг

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

### API + бот

```bash
cd server
cp .env.example .env   # задайте ADMIN_TOKEN; BOT_TOKEN — когда будет бот
npm install
npm run dev            # http://localhost:3001
```

Подробнее: [`server/README.md`](server/README.md).  
**Деплой API + webhook бота:** [`server/DEPLOY.md`](server/DEPLOY.md) (Railway / HTTPS / setWebhook).

### Админка

```bash
cd admin
npm install
npm run dev            # http://localhost:5174
```

Вставьте `ADMIN_TOKEN` из `server/.env`. См. [`admin/README.md`](admin/README.md).

## Telegram на лендинге

В [`src/content.ts`](src/content.ts):

| Что | Значение |
| --- | --- |
| Личные заявки / «Написать» | `@myratcode` → https://t.me/myratcode |
| Канал (контент / подписка бота) | `@myrat_code` → https://t.me/myrat_code |

Все CTA тарифов и финальная кнопка ведут на личный Telegram.

## Cloudflare

Статический лендинг и API **раздельны**: Pages/Workers отдают только фронт. API (и webhook бота) — отдельно.

Пошаговый деплой (Railway, env, setWebhook, админка): **[`server/DEPLOY.md`](server/DEPLOY.md)**.

## Стек

- Web: Vite + React + TypeScript  
- Server: Fastify + better-sqlite3 + Grammy  
- Admin: Vite + React  

## Дизайн лендинга

**Night-ocean sales** — ink + teal. Шрифты: Unbounded + Manrope.
