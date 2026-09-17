import { whatsappQueueService } from './whatsappQueueService';
import { Order } from '../src/types';

export interface NotificationResult {
  sent: boolean;
  channel: 'email' | 'whatsapp' | 'both';
  message: string;
  recipientEmail: string;
  recipientWhatsapp: string;
  queueItemId?: string;
  timestamp: string;
}

export const notificationService = {
  /**
   * Dispara notificação de confirmação de pagamento com fila protegida contra bloqueio da Meta (máx 38 msgs/min)
   */
  sendPaymentConfirmedNotification(data: {
    customerName: string;
    customerEmail: string;
    customerWhatsapp: string;
    courseTitle: string;
    orderId: string;
    amount: number;
    cnhNumber?: string;
    cnhCategory?: string;
  }): NotificationResult {
    const firstName = data.customerName.split(' ')[0] || data.customerName;
    const formattedAmount = data.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const whatsappMessage = `*Olá, ${firstName}!* 👋\n\n` +
      `Recebemos a confirmação do seu pagamento de *${formattedAmount}* para o curso:\n` +
      `🚗 *${data.courseTitle}*\n\n` +
      `Seus dados já foram encaminhados para homologação do DETRAN. Em instantes você receberá aqui por este WhatsApp o seu link de acesso exclusivo à plataforma de estudos!\n\n` +
      `Pedido: *#${data.orderId.slice(-6)}*`;

    // Enfileira mensagem na Fila com Proteção Anti-Bloqueio Meta (máx 38 msgs/min)
    const queueItem = whatsappQueueService.enqueue({
      orderId: data.orderId,
      recipientPhone: data.customerWhatsapp,
      recipientName: data.customerName,
      courseTitle: data.courseTitle,
      type: 'PAYMENT_CONFIRMATION',
      messageText: whatsappMessage,
      priority: 'HIGH'
    });

    console.log(`[NOTIFICAÇÃO] Confirmação de pagamento enfileirada no WhatsApp Anti-Bloqueio (Fila ID: ${queueItem.id}) para ${data.customerName}`);

    return {
      sent: true,
      channel: 'both',
      message: 'Notificação de confirmação enfileirada com sucesso sob proteção anti-bloqueio Meta.',
      recipientEmail: data.customerEmail,
      recipientWhatsapp: data.customerWhatsapp,
      queueItemId: queueItem.id,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Dispara credenciais e liberação de acesso pelo WhatsApp com fila protegida
   */
  sendAccessCredentialsNotification(order: Order): NotificationResult {
    const message = whatsappQueueService.generateAccessCredentialsMessage(order);
    const queueItem = whatsappQueueService.enqueue({
      orderId: order.id,
      recipientPhone: order.customerWhatsapp,
      recipientName: order.customerName,
      courseTitle: order.courseTitle,
      type: 'ACCESS_CREDENTIALS',
      messageText: message,
      priority: 'HIGH'
    });

    return {
      sent: true,
      channel: 'whatsapp',
      message: 'Liberação de acesso enfileirada com sucesso na fila do WhatsApp.',
      recipientEmail: order.customerEmail,
      recipientWhatsapp: order.customerWhatsapp,
      queueItemId: queueItem.id,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Dispara lembrete de recuperação de pagamento via WhatsApp com fila protegida
   */
  sendPaymentRecoveryNotification(order: Order): NotificationResult {
    const message = whatsappQueueService.generatePaymentRecoveryMessage(order);
    const queueItem = whatsappQueueService.enqueue({
      orderId: order.id,
      recipientPhone: order.customerWhatsapp,
      recipientName: order.customerName,
      courseTitle: order.courseTitle,
      type: 'PAYMENT_RECOVERY',
      messageText: message,
      priority: 'NORMAL'
    });

    return {
      sent: true,
      channel: 'whatsapp',
      message: 'Lembrete de recuperação enfileirado com sucesso na fila do WhatsApp.',
      recipientEmail: order.customerEmail,
      recipientWhatsapp: order.customerWhatsapp,
      queueItemId: queueItem.id,
      timestamp: new Date().toISOString()
    };
  }
};

