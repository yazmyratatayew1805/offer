# Деплой API + Telegram-бота

Практический гайд: HTTPS + always-on для webhook. Лендинг на Cloudflare Pages **не** трогаем — API живёт отдельно.

## Рекомендуемый путь: Railway

**Почему Railway:** простой деплой Node, публичный HTTPS, можно Postgres или volume. Бесплатный/дешёвый старт.

### Важно про БД

Сейчас код использует **SQLite** (`better-sqlite3`). На ephemeral-диске (типичный free tier без volume) файл БД **пропадёт** при рестарте.

Выберите одно:

| Вариант | Плюсы | Минусы |
| --- | --- | --- |
| **Volume на Railway** + SQLite | Без смены кода | Нужен volume; чуть дороже free |
| **Postgres (Railway)** | Надёжно для прода | Нужен адаптер (см. README «Postgres позже») |
| **Turso / libSQL** | Хороший free tier | Нужна замена драйвера |

Для первого запуска бота быстрее всего: **Railway + persistent volume** и `DATABASE_URL=/data/offer-lab.db` (путь на volume).

Альтернативы хостинга API: **Fly.io**, **Render** — та же логика (HTTPS + always-on + не ephemeral SQLite).

---

## Пошагово

### 1. Создать бота

1. Откройте [@BotFather](https://t.me/BotFather) → `/newbot`.
2. Сохраните `BOT_TOKEN` (никому не светите, не коммитьте).

### 2. Бот — админ канала

1. Канал: [@myrat_code](https://t.me/myrat_code).
2. Добавьте бота **администратором** (нужно для `getChatMember` / проверки подписки).
3. При сбоях проверки — узнайте числовой id канала (`@userinfobot` / RawDataBot) → `CHANNEL_ID=-100...`.

### 3. Переменные окружения

Скопируйте из [`.env.example`](.env.example) в панель Railway (Variables):

| Переменная | Пример / заметка |
| --- | --- |
| `PORT` | Railway часто задаёт сам — не конфликтуйте |
| `HOST` | `0.0.0.0` |
| `DATABASE_URL` | `/data/offer-lab.db` (на volume) или путь SQLite |
| `ADMIN_TOKEN` | длинная случайная строка |
| `BOT_TOKEN` | от BotFather |
| `CHANNEL_USERNAME` | `@myrat_code` |
| `CHANNEL_ID` | опционально |
| `WEBHOOK_SECRET` | случайная строка (рекомендуется) |
| `CONTACT_HANDLE` | `@myratcode` |

### 4. Задеплоить `server/`

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub → репозиторий `offer`.
2. Root Directory: `server`.
3. Build/Start (если не подхватилось):

   ```bash
   npm install
   npm start
   ```

4. Подключите **Volume** к `/data` (если остаётесь на SQLite).
5. Дождитесь публичного URL вида `https://YOUR_APP.up.railway.app`.
6. Проверка: `GET https://YOUR_APP/health`.

Локально перед деплоем:

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 5. setWebhook

Подставьте токен и URL API:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://YOUR_API/telegram/webhook&secret_token=<WEBHOOK_SECRET>"
```

Проверка:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

Если в env задан `WEBHOOK_SECRET`, Telegram шлёт его в заголовке; сервер также принимает `?secret=`.

### 6. Тест `/start`

1. Откройте бота в Telegram → `/start`.
2. Без подписки на `@myrat_code` — предложение подписаться + «Проверить снова».
3. После подписки — меню (гайды / Охота / Вайб / связь).
4. «Оставить заявку» → заказ в БД (смотрится в админке).

### 7. Лендинг отдельно (Cloudflare)

- **Cloudflare Pages/Workers** — только статический лендинг (корень репо).
- **API + webhook** — только Railway (или Fly/Render).
- Не пытайтесь держать Grammy webhook на Pages без отдельного always-on бэкенда.

### 8. Админка

**Вариант A — локально (проще на старте):**

```bash
cd admin
npm install
npm run dev
```

Откройте http://localhost:5174, вставьте `ADMIN_TOKEN`.  
Прокси Vite шлёт `/api` на `localhost:3001`. Для удалённого API:

```bash
# .env в admin/
VITE_API_URL=https://YOUR_API
```

**Вариант B — статика:**

```bash
cd admin
npm run build
```

Залейте `admin/dist` на Pages/Netlify/любой static host. Обязательно задайте `VITE_API_URL` на URL API **до** сборки.

**CORS:** на сервере сейчас `origin: true` (любой origin). Для продакшена позже сузьте список доменов админки/лендинга. Заголовок: `X-Admin-Token: <ADMIN_TOKEN>`.

---

## Чеклист «бот живой»

- [ ] `BOT_TOKEN` в env на Railway  
- [ ] Бот — админ `@myrat_code`  
- [ ] Volume или не-ephemeral БД  
- [ ] `GET /health` → OK  
- [ ] `setWebhook` → url вашего `/telegram/webhook`  
- [ ] `/start` проверяет подписку  
- [ ] Админка видит заявки с тем же `ADMIN_TOKEN`  

Оплата (ЮKassa/Stripe) — stub, отдельно; этот гайд её не включает.
