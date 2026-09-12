# Admin SPA

Минимальная Vite + React админка (русский UI).

## Запуск

1. Поднимите API (`cd ../server && npm run dev`).
2. В `server/.env` задайте `ADMIN_TOKEN`.
3. Здесь:

```bash
cd admin
npm install
npm run dev
```

Откройте [http://localhost:5174](http://localhost:5174/) — вставьте тот же `ADMIN_TOKEN`.

Vite проксирует `/api` → `http://localhost:3001`. Для отдельного хоста API задайте `VITE_API_URL`.

## Страницы

- **Тарифы** — цена и active
- **Заявки** — статусы new / pending / paid / cancelled
- **Лид-магниты** — тексты и ссылки для бота
