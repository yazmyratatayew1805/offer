import { useEffect, useState } from 'react'
import { api } from '../api'

type Lead = {
  id: number
  slug: string
  title: string
  description: string
  content_url: string
  active: number
}

export default function LeadMagnetsPage() {
  const [items, setItems] = useState<Lead[]>([])
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)

  async function load() {
    setError('')
    try {
      setItems(await api<Lead[]>('/api/admin/lead-magnets'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function save(item: Lead) {
    setSavingId(item.id)
    setError('')
    try {
      await api(`/api/admin/lead-magnets/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          content_url: item.content_url,
          active: item.active,
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
      <h2>Лид-магниты</h2>
      <p className="muted">Бесплатные гайды, которые бот отдаёт после проверки подписки на канал.</p>
      {error ? <p className="error">{error}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Описание / ссылка</th>
            <th>Активен</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <input
                  value={item.title}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === item.id ? { ...x, title: e.target.value } : x)),
                    )
                  }
                />
                <div className="muted">{item.slug}</div>
              </td>
              <td>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === item.id ? { ...x, description: e.target.value } : x,
                      ),
                    )
                  }
                />
                <input
                  style={{ marginTop: '0.4rem' }}
                  value={item.content_url}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === item.id ? { ...x, content_url: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="https://..."
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
