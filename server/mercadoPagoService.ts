import QRCode from 'qrcode';
import crypto from 'crypto';
import { generateBacenPixPayload } from './pixHelper';
import { MercadoPagoConfigStatus } from '../src/types';

export class MercadoPagoService {
  private getAccessToken(): string {
    return (process.env.MERCADO_PAGO_ACCESS_TOKEN || '').trim();
  }

  public getConfigStatus(appUrl: string): MercadoPagoConfigStatus {
    const token = this.getAccessToken();
    const isConfigured = Boolean(token && token.length > 10 && !token.includes('MY_') && !token.includes('...'));
    const isTest = token.startsWith('TEST-');

    return {
      isConfigured,
      hasAccessToken: isConfigured,
      environment: isTest ? 'sandbox' : 'production',
      maskedToken: isConfigured
        ? `${token.slice(0, 8)}...${token.slice(-4)}`
        : undefined,
      webhookUrl: `${appUrl.replace(/\/$/, '')}/api/webhooks/mercadopago`
    };
  }

  /**
   * Cria uma cobrança Pix via API oficial do Mercado Pago.
   * Se o token estiver inválido, expirado ou não informado, efetua fallback gracioso
   * para o simulador Pix, garantindo que o pedido e o aluno SEJAM SEMPRE gravados no Supabase!
   */
  public async createPixPayment(params: {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerCpf: string;
    courseTitle: string;
    appUrl: string;
  }): Promise<{
    paymentId: string;
    pixCopiaECola: string;
    qrCodeUrl: string;
    isRealApi: boolean;
    warning?: string;
  }> {
    const { orderId, amount, customerName, customerEmail, customerCpf, courseTitle, appUrl } = params;
    const token = this.getAccessToken();
    const cleanCpf = customerCpf.replace(/\D/g, '') || '12345678909';
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'Aluno';
    const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/webhooks/mercadopago`;

    // Se houver Access Token do Mercado Pago preenchido
    if (token && token.length > 10 && !token.includes('MY_') && !token.includes('...')) {
      try {
        const idempotencyKey = crypto.randomUUID();
        const payload = {
          transaction_amount: Number(amount.toFixed(2)),
          description: `Curso: ${courseTitle.slice(0, 50)}`,
          payment_method_id: 'pix',
          payer: {
            email: customerEmail,
            first_name: firstName,
            last_name: lastName,
            identification: {
              type: 'CPF',
              number: cleanCpf
            }
          },
          external_reference: orderId,
          notification_url: webhookUrl
        };

        const response = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': idempotencyKey
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.warn(`[MERCADO PAGO] Token recusado pela API (HTTP ${response.status}): ${errorBody}. Ativando fallback para simulador Pix.`);
          return this.generateSimulatedPayment(orderId, amount, courseTitle, `Mercado Pago retornou ${response.status} (token inválido/não autorizado). Modo de teste ativado.`);
        }

        const data = await response.json() as any;
        const transactionData = data?.point_of_interaction?.transaction_data;
        const pixCopiaECola = transactionData?.qr_code || '';
        let qrCodeUrl = '';

        if (transactionData?.qr_code_base64) {
          qrCodeUrl = `data:image/png;base64,${transactionData.qr_code_base64}`;
        } else if (pixCopiaECola) {
          qrCodeUrl = await QRCode.toDataURL(pixCopiaECola, {
            width: 320,
            margin: 2,
            color: { dark: '#009ee3', light: '#ffffff' }
          });
        }

        return {
          paymentId: String(data.id),
          pixCopiaECola,
          qrCodeUrl,
          isRealApi: true
        };
      } catch (err: any) {
        console.error('Falha ao comunicar com a API do Mercado Pago:', err);
        return this.generateSimulatedPayment(orderId, amount, courseTitle, err.message);
      }
    }

    // Modo Demonstrativo / Sandbox integrado quando não há token
    return this.generateSimulatedPayment(orderId, amount, courseTitle);
  }

  private async generateSimulatedPayment(orderId: string, amount: number, courseTitle: string, warning?: string) {
    const simulatedPaymentId = `mp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const pixCopiaECola = generateBacenPixPayload({
      pixKey: 'financeiro@mercadopago.com.br',
      merchantName: 'MERCADO PAGO CURSOS',
      merchantCity: 'SAO PAULO',
      amount,
      txid: orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25),
      description: courseTitle
    });

    const qrCodeUrl = await QRCode.toDataURL(pixCopiaECola, {
      width: 320,
      margin: 2,
      color: { dark: '#0284c7', light: '#ffffff' }
    });

    return {
      paymentId: simulatedPaymentId,
      pixCopiaECola,
      qrCodeUrl,
      isRealApi: false,
      warning
    };
  }

  /**
   * Cria uma Preferência no Mercado Pago Checkout Pro
   * Suporta Cartão de Crédito (em até 12x), Cartão de Débito e Pix.
   */
  public async createPreference(params: {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerCpf: string;
    customerPhone?: string;
    courseTitle: string;
    appUrl: string;
  }): Promise<{
    preferenceId?: string;
    checkoutUrl?: string;
    isRealApi: boolean;
    error?: string;
  }> {
    const { orderId, amount, customerName, customerEmail, customerCpf, courseTitle, appUrl } = params;
    const token = this.getAccessToken();
    const cleanCpf = customerCpf.replace(/\D/g, '') || '12345678909';
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'Aluno';
    const baseUrl = appUrl.replace(/\/$/, '');
    const webhookUrl = `${baseUrl}/api/webhooks/mercadopago`;

    if (token && token.length > 10 && !token.includes('MY_') && !token.includes('...')) {
      try {
        const preferencePayload = {
          items: [
            {
              id: orderId,
              title: `Curso: ${courseTitle.slice(0, 100)}`,
              quantity: 1,
              currency_id: 'BRL',
              unit_price: Number(amount.toFixed(2))
            }
          ],
          payer: {
            name: firstName,
            surname: lastName,
            email: customerEmail,
            identification: {
              type: 'CPF',
              number: cleanCpf
            }
          },
          external_reference: orderId,
          notification_url: webhookUrl,
          payment_methods: {
            // Permite Cartão de Crédito, Débito e Pix
            excluded_payment_types: [],
            installments: 12
          },
          back_urls: {
            success: `${baseUrl}/?orderId=${orderId}&payment_status=success`,
            failure: `${baseUrl}/?orderId=${orderId}&payment_status=failure`,
            pending: `${baseUrl}/?orderId=${orderId}&payment_status=pending`
          },
          auto_return: 'approved'
        };

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(preferencePayload)
        });

        if (response.ok) {
          const prefData = await response.json() as any;
          const isTest = token.startsWith('TEST-');
          const checkoutUrl = isTest && prefData.sandbox_init_point 
            ? prefData.sandbox_init_point 
            : (prefData.init_point || prefData.sandbox_init_point);

          console.log(`[MERCADO PAGO] Preferência de checkout criada: ID ${prefData.id}`);
          return {
            preferenceId: prefData.id,
            checkoutUrl,
            isRealApi: true
          };
        } else {
          const errBody = await response.text();
          console.warn(`[MERCADO PAGO] Erro ao criar preferência (HTTP ${response.status}):`, errBody);
          return {
            checkoutUrl: `${baseUrl}/?orderId=${orderId}&checkout_mode=card_demo`,
            isRealApi: false,
            error: `API Mercado Pago HTTP ${response.status}`
          };
        }
      } catch (err: any) {
        console.error('[MERCADO PAGO] Exceção ao criar preferência:', err);
        return {
          checkoutUrl: `${baseUrl}/?orderId=${orderId}&checkout_mode=card_demo`,
          isRealApi: false,
          error: err.message
        };
      }
    }

    return {
      checkoutUrl: `${baseUrl}/?orderId=${orderId}&checkout_mode=card_demo`,
      isRealApi: false
    };
  }

  /**
   * Consulta pagamento na API do Mercado Pago
   */
  public async getPayment(paymentId: string): Promise<any | null> {
    const token = this.getAccessToken();
    if (!token || token.length < 10) return null;

    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.error('Erro ao consultar status no Mercado Pago:', err);
      return null;
    }
  }

  /**
   * Alias compatível com o Webhook
   */
  public async getPaymentDetails(paymentId: string): Promise<any | null> {
    return this.getPayment(paymentId);
  }
}

export const mercadoPagoService = new MercadoPagoService();
