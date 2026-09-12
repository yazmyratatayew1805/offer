# Server (API + Telegram bot)

Node.js + TypeScript + Fastify + SQLite (`better-sqlite3`) + Grammy.

Лендинг на Cloudflare Pages остаётся в корне репозитория. Этот сервис — отдельный процесс (локально / Fly / Railway / VPS). Worker на CF для API позже.

## Быстрый старт

```bash
cd server
cp .env.example .env
# отредактируйте ADMIN_TOKEN (обязательно для админки)
npm install
npm run dev
```

API: [http://localhost:3001](http://localhost:3001)  
Health: `GET /health`  
Публично: `GET /api/products`, `GET /api/tariffs`, `POST /api/orders`  
Админ: те же сущности под `/api/admin/*` + заголовок `X-Admin-Token: <ADMIN_TOKEN>`

При старте автоматически создаётся SQLite-файл и seed тарифов (Охота: След/Охота/Трофей; Вайб: Спринт/Фриланс/Веб) + 3 лид-магнита.

Повторный seed вручную:

```bash
npm run seed
```

## Переменные окружения

См. [`.env.example`](.env.example):

| Переменная | Назначение |
| --- | --- |
| `PORT` | Порт API (по умолчанию 3001) |
| `DATABASE_URL` | Путь к SQLite, напр. `./data/offer-lab.db` |
| `ADMIN_TOKEN` | Секрет для админ-API и админ-SPA |
| `BOT_TOKEN` | Токен от @BotFather (без него API работает, webhook отвечает 503) |
| `CHANNEL_USERNAME` | `@myrat_code` — проверка подписки |
| `CHANNEL_ID` | Числовой id канала (если username не срабатывает) |
| `WEBHOOK_SECRET` | Опциональный секрет webhook |
| `CONTACT_HANDLE` | `@myratcode` — кнопка «Связь» |

**Секреты не коммитьте.** `.env` уже в `.gitignore`.

## Telegram-бот

1. Создайте бота у [@BotFather](https://t.me/BotFather), получите `BOT_TOKEN`.
2. Добавьте бота **администратором** канала [@myrat_code](https://t.me/myrat_code) (нужно для `getChatMember`).
3. Узнайте id канала (через @userinfobot / пересылку в @ RawDataBot) → при необходимости `CHANNEL_ID=-100...`.
4. Поднимите API с публичным HTTPS (ngrok / туннель / хостинг).
5. Установите webhook:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://YOUR_HOST/telegram/webhook&secret_token=YOUR_WEBHOOK_SECRET"
```

Если задан `WEBHOOK_SECRET`, передайте его как `?secret=` или заголовок `X-Telegram-Bot-Api-Secret-Token`.

### Поведение `/start`

1. Проверка подписки на канал.
2. Если нет — ссылка на канал + «Проверить снова».
3. Если да — меню: бесплатные гайды | Охота | Вайб | связь `@myratcode`.
4. «Оставить заявку» создаёт `Order` со статусом `pending`.

## Оплата

`src/payments/` — stub. Методы `createPayment(orderId)` и `handleWebhook` возвращают `not_implemented` / HTTP 501. Подключайте ЮKassa / Stripe позже, не ломая интерфейс `PaymentProvider`.

## Postgres позже

Сейчас SQLite через `better-sqlite3`. Для Postgres:

1. Поставьте `DATABASE_URL=postgres://...`
2. Замените драйвер (drizzle + postgres / `pg`) — схема таблиц уже описана в `src/db/index.ts` (`migrate`).
3. Репозиторий в `src/db/repo.ts` почти 1:1 переносится на SQL-запросы drizzle.

## Админка

См. [`../admin/README.md`](../admin/README.md).
