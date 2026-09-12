import { useEffect, useState } from 'react'
import { api } from '../api'

type Tariff = {
  id: number
  name: string
  slug: string
  price_rub: number
  active: number
  popular: number
  product_name?: string
  summary?: string | null
}

export default function TariffsPage() {
  const [items, setItems] = useState<Tariff[]>([])
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)

  async function load() {
    setError('')
    try {
      setItems(await api<Tariff[]>('/api/admin/tariffs'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function save(item: Tariff) {
    setSavingId(item.id)
    setError('')
    try {
      await api(`/api/admin/tariffs/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          price_rub: item.price_rub,
          active: item.active,
          popular: item.popular,
        }),
      })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="panel">
      <h2>Тарифы</h2>
      <p className="muted">Редактируйте цену и активность. Полный CRUD продуктов — через API.</p>
      {error ? <p className="error">{error}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Продукт</th>
            <th>Тариф</th>
            <th>Цена ₽</th>
            <th>Активен</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.product_name}</td>
              <td>
                {item.name}
                <div className="muted">{item.slug}</div>
              </td>
              <td style={{ maxWidth: 120 }}>
                <input
                  type="number"
                  value={item.price_rub}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === item.id ? { ...x, price_rub: Number(e.target.value) } : x,
                      ),
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={Boolean(item.active)}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === item.id ? { ...x, active: e.target.checked ? 1 : 0 } : x,
                      ),
                    )
                  }
                />
              </td>
              <td>
                <button type="button" disabled={savingId === item.id} onClick={() => void save(item)}>
                  {savingId === item.id ? '…' : 'Сохранить'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
