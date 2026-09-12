export type ProductSlug = 'ohota' | 'vibe'

export type OrderStatus = 'new' | 'pending' | 'paid' | 'cancelled'

export interface Product {
  id: number
  slug: ProductSlug
  name: string
  description: string
  active: number
  created_at: string
}

export interface Tariff {
  id: number
  product_id: number
  slug: string
  name: string
  price_rub: number
  features_json: string
  summary: string | null
  popular: number
  active: number
  sort_order: number
  created_at: string
}

export interface TariffPublic extends Omit<Tariff, 'features_json'> {
  features: string[]
  product_slug?: string
  product_name?: string
}

export interface Order {
  id: number
  tariff_id: number
  status: OrderStatus
  telegram_user_id: number | null
  telegram_username: string | null
  contact_note: string | null
  created_at: string
  updated_at: string
}

export interface LeadMagnet {
  id: number
  slug: string
  title: string
  description: string
  content_url: string
  active: number
  sort_order: number
  created_at: string
}

export interface BotUser {
  id: number
  telegram_id: number
  username: string | null
  first_name: string | null
  subscribed_checked_at: string | null
  is_subscribed: number
  created_at: string
}
