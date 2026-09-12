import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import type Database from 'better-sqlite3'
import { openDb } from './index.js'

const ohotaFeatures = {
  sled: [
    'Разбор кандидата',
    'Обновление резюме',
    'Сопроводительное письмо (шаблоны под 2–3 вакансии)',
    'Карта поиска: сайты, TG-каналы, комьюнити',
    'Чеклист подготовки к собесам',
  ],
  ohota: [
    'Всё из След',
    'Оформление GitHub-профиля',
    'Личный сайт-визитка',
    'Гайд «как проходить собесы»',
    '2 mock-собеса с письменным разбором',
  ],
  trofey: [
    'Всё из Охота',
    'До 4 mock-собесов',
    'Наставничество первый месяц на новой работе',
    'Дейлики, код-ревью, общение с TL / менеджерами / коллегами',
    'Поведение на работе и онбординг без хаоса',
  ],
}

const vibeFeatures = {
  sprint: [
    'Идея и скоуп под реальный деплой',
    'Репозиторий и базовая архитектура',
    'AI-воркфлоу без потери контроля',
    'Деплой и чеклист «что проверить самому»',
  ],
  freelance: [
    'Как брать заказы и оценивать объём',
    'Сдача, правки и границы без «гореть»',
    'Vibe-workflow под фриланс',
    'Шаблоны коммуникации с заказчиком',
  ],
  web: [
    'Сайт / веб с AI-ускорением',
    'HTML, JS, API — что нельзя отдавать «на автопилоте»',
    'Деплой и базовая эксплуатация',
    'Практика: от макета до рабочей страницы',
  ],
}

export function seed(db: Database.Database): void {
  const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get() as { c: number }
  if (productCount.c > 0) {
    console.log('Seed skipped: products already present')
    return
  }

  const insertProduct = db.prepare(
    `INSERT INTO products (slug, name, description) VALUES (@slug, @name, @description)`,
  )
  const insertTariff = db.prepare(
    `INSERT INTO tariffs
      (product_id, slug, name, price_rub, features_json, summary, popular, sort_order)
     VALUES
      (@product_id, @slug, @name, @price_rub, @features_json, @summary, @popular, @sort_order)`,
  )
  const insertLead = db.prepare(
    `INSERT INTO lead_magnets (slug, title, description, content_url, sort_order)
     VALUES (@slug, @title, @description, @content_url, @sort_order)`,
  )

  const run = db.transaction(() => {
    const ohota = insertProduct.run({
      slug: 'ohota',
      name: 'Охота на оффер',
      description:
        'Помогаю backend-инженерам брать офферы уровня Senior / Tech Lead и спокойно заходить в первый месяц на новой работе.',
    })
    const vibe = insertProduct.run({
      slug: 'vibe',
      name: 'Вайб до прода',
      description:
        'AI-ускоренная разработка с инженерными стандартами: идея → репо → деплой, фриланс-воркфлоу или веб-курс.',
    })

    insertTariff.run({
      product_id: ohota.lastInsertRowid,
      slug: 'sled',
      name: 'След',
      price_rub: 19900,
      features_json: JSON.stringify(ohotaFeatures.sled),
      summary: null,
      popular: 0,
      sort_order: 1,
    })
    insertTariff.run({
      product_id: ohota.lastInsertRowid,
      slug: 'ohota',
      name: 'Охота',
      price_rub: 49900,
      features_json: JSON.stringify(ohotaFeatures.ohota),
      summary: null,
      popular: 1,
      sort_order: 2,
    })
    insertTariff.run({
      product_id: ohota.lastInsertRowid,
      slug: 'trofey',
      name: 'Трофей',
      price_rub: 99900,
      features_json: JSON.stringify(ohotaFeatures.trofey),
      summary: null,
      popular: 0,
      sort_order: 3,
    })

    insertTariff.run({
      product_id: vibe.lastInsertRowid,
      slug: 'sprint',
      name: 'Спринт',
      price_rub: 24900,
      features_json: JSON.stringify(vibeFeatures.sprint),
      summary: '1 проект с нуля: идея → репо → деплой',
      popular: 0,
      sort_order: 1,
    })
    insertTariff.run({
      product_id: vibe.lastInsertRowid,
      slug: 'freelance',
      name: 'Фриланс на вайбе',
      price_rub: 39900,
      features_json: JSON.stringify(vibeFeatures.freelance),
      summary: 'Заказы, оценка, сдача — vibe-workflow без выгорания',
      popular: 0,
      sort_order: 2,
    })
    insertTariff.run({
      product_id: vibe.lastInsertRowid,
      slug: 'web',
      name: 'Веб с вайбкодингом',
      price_rub: 59900,
      features_json: JSON.stringify(vibeFeatures.web),
      summary: 'Поток / мини-курс: сайт с AI + что обязан понимать сам',
      popular: 0,
      sort_order: 3,
    })

    insertLead.run({
      slug: 'resume-checklist',
      title: 'Чеклист резюме Senior/TL',
      description: 'Короткий чеклист: что усилить в резюме перед охотой на оффер.',
      content_url: 'https://t.me/myrat_code',
      sort_order: 1,
    })
    insertLead.run({
      slug: 'interview-map',
      title: 'Карта собесов backend',
      description: 'Куда смотреть и как готовиться к техническим раундам.',
      content_url: 'https://t.me/myrat_code',
      sort_order: 2,
    })
    insertLead.run({
      slug: 'vibe-deploy',
      title: 'Мини-гайд: от идеи до деплоя',
      description: 'Базовый workflow AI-сборки без потери контроля над кодом.',
      content_url: 'https://t.me/myrat_code',
      sort_order: 3,
    })
  })

  run()
  console.log('Seed complete: products, tariffs, lead magnets')
}

const isDirectRun =
  process.argv[1] != null &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])

if (isDirectRun) {
  const db = openDb()
  seed(db)
  db.close()
}
