import https from 'https';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { generateBacenPixPayload } from './pixHelper';
import { InterConfigStatus } from '../src/types';

export class InterPixService {
  private clientId: string;
  private clientSecret: string;
  private pixKey: string;
  private cert: string;
  private key: string;
  private env: 'sandbox' | 'production';

  constructor() {
    this.clientId = process.env.INTER_CLIENT_ID || '';
    this.clientSecret = process.env.INTER_CLIENT_SECRET || '';
    this.pixKey = process.env.INTER_PIX_KEY || '';
    this.cert = process.env.INTER_CERT || '';
    this.key = process.env.INTER_KEY || '';
    this.env = (process.env.INTER_ENV === 'production') ? 'production' : 'sandbox';
  }

  public getConfigStatus(appUrl: string): InterConfigStatus {
    const isConfigured = Boolean(
      this.clientId && this.clientSecret && (this.cert || this.env === 'sandbox')
    );

    return {
      isConfigured,
      environment: this.env,
      hasClientId: Boolean(this.clientId),
      hasClientSecret: Boolean(this.clientSecret),
      hasPixKey: Boolean(this.pixKey),
      hasCert: Boolean(this.cert),
      hasKey: Boolean(this.key),
      pixKey: this.pixKey ? `${this.pixKey.slice(0, 4)}***${this.pixKey.slice(-4)}` : undefined,
      webhookUrl: `${appUrl.replace(/\/$/, '')}/api/webhooks/inter-pix`
    };
  }

  public generateTxId(): string {
    // Inter e BACEN exigem txid alfanumérico entre 26 e 35 caracteres
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Obtém token OAuth2 mTLS no endpoint do Banco Inter (se em produção com credenciais reais)
   */
  private async getOAuthToken(): Promise<string> {
    if (!this.cert || !this.key) {
      throw new Error('Certificado mTLS (.crt) e Chave (.key) não configurados no ambiente.');
    }

    const httpsAgent = new https.Agent({
      cert: this.cert,
      key: this.key,
      rejectUnauthorized: true
    });

    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
      scope: 'pix.read pix.write webhook.read webhook.write'
    });

    const response = await fetch('https://cdpj.partners.bancointer.com.br/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString(),
      // @ts-ignore
      agent: httpsAgent
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro de autenticação Inter: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  }

  /**
   * Cria uma cobrança imediata Pix (PUT /pix/v2/cob/:txid)
   */
  public async createCobPix(params: {
    txid: string;
    amount: number;
    customerName: string;
    customerCpf: string;
    courseTitle: string;
  }): Promise<{
    txid: string;
    pixCopiaECola: string;
    qrCodeUrl: string;
    isRealInterApi: boolean;
  }> {
    const { txid, amount, customerName, customerCpf, courseTitle } = params;

    // Se estiver em modo de produção e tiver todos os certificados configurados
    if (this.env === 'production' && this.cert && this.key && this.clientId && this.clientSecret) {
      try {
        const token = await this.getOAuthToken();
        const httpsAgent = new https.Agent({
          cert: this.cert,
          key: this.key,
          rejectUnauthorized: true
        });

        const cleanCpf = customerCpf.replace(/\D/g, '');

        const payload = {
          calendario: { expiracao: 3600 },
          devedor: {
            cpf: cleanCpf,
            nome: customerName
          },
          valor: {
            original: amount.toFixed(2)
          },
          chave: this.pixKey,
          solicitacaoPagador: `Acesso: ${courseTitle.slice(0, 30)}`
        };

        const response = await fetch(`https://cdpj.partners.bancointer.com.br/pix/v2/cob/${txid}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          // @ts-ignore
          agent: httpsAgent
        });

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Inter Pix API retornou ${response.status}: ${errBody}`);
        }

        const data = await response.json() as {
          pixCopiaECola?: string;
          textoImagemQRcode?: string;
        };

        const pixCode = data.pixCopiaECola || data.textoImagemQRcode || '';
        const qrCodeUrl = await QRCode.toDataURL(pixCode, {
          width: 320,
          margin: 2,
          color: { dark: '#1e293b', light: '#ffffff' }
        });

        return {
          txid,
          pixCopiaECola: pixCode,
          qrCodeUrl,
          isRealInterApi: true
        };
      } catch (err) {
        console.error('Falha ao comunicar com a API do Inter:', err);
        throw err;
      }
    }

    // Modo Sandbox / Demonstração com validação e padrão 100% fiel ao BACEN e Inter
    const simulatedPixKey = this.pixKey || 'pix-pj@inter.com.br';
    const pixCopiaECola = generateBacenPixPayload({
      pixKey: simulatedPixKey,
      merchantName: 'INTER PJ CURSOS',
      merchantCity: 'BELO HORIZONTE',
      amount,
      txid,
      description: courseTitle
    });

    const qrCodeUrl = await QRCode.toDataURL(pixCopiaECola, {
      width: 320,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' }
    });

    return {
      txid,
      pixCopiaECola,
      qrCodeUrl,
      isRealInterApi: false
    };
  }
}

export const interService = new InterPixService();
