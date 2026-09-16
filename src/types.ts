export interface Course {
  id: string;
  title: string;
  subtitle: string;
  acronym?: string;
  category: 'especializados' | 'atualizacao' | 'saude' | 'tea' | 'nr' | 'reciclagem' | 'maquinas' | 'formacao';
  categoryLabel: string;
  description: string;
  fullDescription: string;
  price: number;
  costPrice?: number;
  profitPercent?: number;
  isActive?: boolean;
  duration: string;
  workloadHours: number;
  detranApproval: string;
  modality: string;
  thumbnail: string;
  backdrop: string;
  badge?: string;
  requirements: string[];
  modules: string[];
  isFeatured?: boolean;
}

export const CNH_CATEGORIES = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'AB',
  'AC',
  'AD',
  'AE',
  'ACC - (Ciclo Motor)',
  'ACC B',
  'ACC C',
  'ACC D',
  'ACC E',
] as const;

export type CnhCategoryType = typeof CNH_CATEGORIES[number];

export type OrderStatus = 
  | 'PENDING'            // Pendente / Aguardando pagamento
  | 'PROCESSING'         // Em processamento no banco/gateway
  | 'PAID'               // Confirmado / Pago
  | 'UNCONFIRMED'        // Não confirmado
  | 'EXPIRED'            // Expirado (tempo de Pix esgotado)
  | 'ERROR';             // Falha de comunicação/gateway

export type PaymentGateway = 'MERCADO_PAGO' | 'PAGSEGURO';

export interface StudentRegistration {
  fullName: string;
  cpf: string;
  whatsapp: string;
  email: string;
  birthDate: string;
  cnhNumber: string;
  cnhCategory: CnhCategoryType;
}

export type PaymentMethodType = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'OUTROS';

export interface Order {
  id: string;
  txid: string;
  gateway: PaymentGateway;
  paymentMethod?: PaymentMethodType;
  checkoutUrl?: string;
  courseId: string;
  courseTitle: string;
  courseSubtitle: string;
  courseThumbnail: string;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  customerWhatsapp: string;
  customerBirthDate: string;
  customerCnhNumber: string;
  customerCnhCategory: string;
  amount: number;
  status: OrderStatus;
  statusMessage?: string;
  qrCodeUrl?: string;
  pixCopiaECola: string;
  createdAt: string;
  paidAt?: string;
  accessDispatchedAt?: string;
  accessDispatchedStatus?: 'AGUARDANDO_ENVIO_MANUAL' | 'ENVIADO' | 'CANCELADO';
  mercadoPagoPaymentId?: string;
}

export interface WebhookLog {
  id: string;
  gateway: PaymentGateway;
  receivedAt: string;
  endpoint: string;
  txid: string;
  amount?: number;
  statusCode: number;
  statusMessage: string;
  rawPayload: any;
}

export interface Enrollment {
  id: string;
  orderId: string;
  courseId: string;
  courseTitle: string;
  courseSubtitle?: string;
  courseThumbnail?: string;
  customerName: string;
  customerEmail: string;
  enrolledAt: string;
  modules: string[];
  accessUrl: string;
}

export interface MercadoPagoConfigStatus {
  isConfigured: boolean;
  hasAccessToken: boolean;
  environment: 'sandbox' | 'production';
  maskedToken?: string;
  webhookUrl: string;
}

export interface InterConfigStatus {
  isConfigured: boolean;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasCert: boolean;
  hasKey: boolean;
  hasPixKey?: boolean;
  environment: 'sandbox' | 'production';
  pixKey: string;
  webhookUrl: string;
}
