import { useEffect, useState } from 'react'
import { api } from '../api'

type Order = {
  id: number
  status: 'new' | 'pending' | 'paid' | 'cancelled'
  telegram_username: string | null
  telegram_user_id: number | null
  contact_note: string | null
  tariff_name?: string
  product_name?: string
  created_at: string
}

const STATUSES: Order['status'][] = ['new', 'pending', 'paid', 'cancelled']

const STATUS_LABEL: Record<Order['status'], string> = {
  new: 'новая',
  pending: 'в работе',
  paid: 'оплачена',
  cancelled: 'отменена',
}

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([])
  const [error, setError] = useState('')

  async function load() {
    setError('')
    try {
      setItems(await api<Order[]>('/api/admin/orders'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function setStatus(id: number, status: Order['status']) {
    setError('')
    try {
      await api(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка обновления')
    }
  }

  return (
    <div className="panel">
      <h2>Заявки</h2>
      {error ? <p className="error">{error}</p> : null}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Продукт / тариф</th>
            <th>Telegram</th>
            <th>Статус</th>
            <th>Создана</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>
                {item.product_name}
                <div className="muted">{item.tariff_name}</div>
              </td>
              <td>
                {item.telegram_username ? `@${item.telegram_username}` : '—'}
                <div className="muted">{item.telegram_user_id ?? ''}</div>
              </td>
              <td>
                <select
                  value={item.status}
                  onChange={(e) => void setStatus(item.id, e.target.value as Order['status'])}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="muted">{item.created_at}</td>
            </tr>
          ))}
          {!items.length ? (
            <tr>
              <td colSpan={5} className="muted">
                Пока нет заявок
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}
