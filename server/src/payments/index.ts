/**
 * Payment provider stub — wire YooKassa / Stripe / Telegram Payments later.
 * Do not call real gateways from here yet.
 */

export interface PaymentSession {
  orderId: number
  provider: string
  status: 'not_implemented'
  message: string
}

export interface PaymentWebhookResult {
  handled: boolean
  orderId?: number
  status?: string
  message: string
}

export interface PaymentProvider {
  createPayment(orderId: number): Promise<PaymentSession>
  handleWebhook(payload: unknown): Promise<PaymentWebhookResult>
}

export class StubPaymentProvider implements PaymentProvider {
  async createPayment(orderId: number): Promise<PaymentSession> {
    return {
      orderId,
      provider: 'stub',
      status: 'not_implemented',
      message: 'Оплата пока не подключена. Менеджер свяжется в Telegram.',
    }
  }

  async handleWebhook(_payload: unknown): Promise<PaymentWebhookResult> {
    return {
      handled: false,
      message: 'Payment webhooks are not implemented yet',
    }
  }
}

export const payments: PaymentProvider = new StubPaymentProvider()
