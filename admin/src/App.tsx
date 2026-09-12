import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { api, clearToken, getToken, setToken } from './api'
import LeadMagnetsPage from './pages/LeadMagnetsPage'
import OrdersPage from './pages/OrdersPage'
import TariffsPage from './pages/TariffsPage'

function LoginPage() {
  const [value, setValue] = useState(getToken())
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setToken(value.trim())
    try {
      await api('/api/admin/tariffs')
      navigate('/tariffs')
    } catch {
      clearToken()
      setError('Неверный токен или API недоступен')
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={onSubmit}>
        <h2>Админ «До оффера»</h2>
        <p>Вставьте ADMIN_TOKEN из server/.env — сохранится в localStorage.</p>
        <label>
          <span className="muted">Токен</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="ADMIN_TOKEN"
            autoComplete="off"
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <div style={{ marginTop: '1rem' }}>
          <button type="submit">Войти</button>
        </div>
      </form>
    </div>
  )
}

function Shell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const token = getToken()

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  if (!token) return null

  const links = [
    { to: '/tariffs', label: 'Тарифы' },
    { to: '/orders', label: 'Заявки' },
    { to: '/leads', label: 'Лид-магниты' },
  ]

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>До оффера · админ</h1>
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={location.pathname === l.to ? 'active' : ''}>
            {l.label}
          </Link>
        ))}
        <button
          type="button"
          className="logout"
          onClick={() => {
            clearToken()
            navigate('/login')
          }}
        >
          Выйти
        </button>
      </aside>
      <main className="content">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/tariffs"
        element={
          <Shell>
            <TariffsPage />
          </Shell>
        }
      />
      <Route
        path="/orders"
        element={
          <Shell>
            <OrdersPage />
          </Shell>
        }
      />
      <Route
        path="/leads"
        element={
          <Shell>
            <LeadMagnetsPage />
          </Shell>
        }
      />
      <Route path="*" element={<Navigate to="/tariffs" replace />} />
    </Routes>
  )
}
