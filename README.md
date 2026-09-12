# До оффера (Offer Lab)

Личный лендинг для менторинга backend / Tech Lead: mock-собесы, прожарка резюме, пакет «До оффера».

## Запуск

```bash
cd C:\Users\User\offer-lab
npm install
npm run dev
```

Откройте в браузере: [http://localhost:5173/](http://localhost:5173/)

Сборка:

```bash
npm run build
npm run preview
```

## Где менять тексты, цены и Telegram

Всё в одном файле: [`src/content.ts`](src/content.ts)

| Что | Поле |
| --- | --- |
| Telegram | `site.telegramHandle` (`@your_username`) |
| Цены и услуги | `services.items` |
| Hero / FAQ / CTA | соответствующие экспорты в том же файле |

Ссылка на Telegram собирается из `@username` автоматически.

## Стек

Vite + React + TypeScript. Один лендинг, без бэкенда.

## Дизайн

**Night-ocean editorial** — чернильный navy, океанский teal, светлая «бумажная» середина. Шрифты: Unbounded + Manrope (кириллица).
