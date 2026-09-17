import { WhatsAppQueueItem, WhatsAppQueueStats, WhatsAppMessageType, Order } from '../src/types';

// Constantes de Proteção Anti-Bloqueio Meta (WhatsApp Cloud API / Business)
export const META_HARD_LIMIT = 40;          // Teto máximo oficial da Meta por minuto (Tier 1)
export const MAX_MESSAGES_PER_MINUTE = 38;  // Limite configurado com margem de segurança estrita
export const MIN_INTERVAL_MS = 1600;        // 1.6 segundos entre cada envio (60s / 38 ≈ 1579ms)

class WhatsAppQueueService {
  private queue: WhatsAppQueueItem[] = [];
  private history: WhatsAppQueueItem[] = [];
  private sentTimestamps: number[] = [];
  private isProcessing = false;
  private isPaused = false;
  private lastDispatchedAt = 0;
  private totalSent = 0;
  private totalFailed = 0;

  constructor() {
    // Inicia limpeza periódica da janela de timestamps a cada 10 segundos
    setInterval(() => this.cleanOldTimestamps(), 10000);
  }

  /**
   * Remove timestamps com mais de 60 segundos (janela móvel)
   */
  private cleanOldTimestamps() {
    const now = Date.now();
    this.sentTimestamps = this.sentTimestamps.filter(t => now - t < 60000);
  }

  /**
   * Quantidade de mensagens disparadas nos últimos 60 segundos
   */
  public getSentLastMinuteCount(): number {
    this.cleanOldTimestamps();
    return this.sentTimestamps.length;
  }

  /**
   * Retorna estatísticas completas de proteção e vazão da fila
   */
  public getStats(): WhatsAppQueueStats {
    const sentLastMinute = this.getSentLastMinuteCount();
    const queuedCount = this.queue.length;

    let protectionStatus: 'SAFE' | 'THROTTLING' | 'PAUSED' = 'SAFE';
    if (this.isPaused) {
      protectionStatus = 'PAUSED';
    } else if (sentLastMinute >= MAX_MESSAGES_PER_MINUTE - 3) {
      protectionStatus = 'THROTTLING';
    }

    // Tempo estimado para descarregar a fila respeitando o limite de 38 msgs/min (1600ms cada)
    const estimatedDrainTimeSeconds = Math.ceil((queuedCount * MIN_INTERVAL_MS) / 1000);

    return {
      queuedCount,
      sentLastMinute,
      maxPerMinute: MAX_MESSAGES_PER_MINUTE,
      metaHardLimit: META_HARD_LIMIT,
      safeMarginPerMinute: META_HARD_LIMIT - MAX_MESSAGES_PER_MINUTE,
      protectionStatus,
      totalSent: this.totalSent,
      totalFailed: this.totalFailed,
      minIntervalMs: MIN_INTERVAL_MS,
      estimatedDrainTimeSeconds,
      isPaused: this.isPaused,
      lastDispatchedAt: this.lastDispatchedAt ? new Date(this.lastDispatchedAt).toISOString() : undefined,
    };
  }

  /**
   * Formata número de telefone para o padrão WhatsApp internacional E.164 (55 + DDD + 9 dígitos)
   */
  public formatPhoneForWhatsApp(phone: string): string {
    const digits = (phone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('55') && digits.length >= 12) {
      return digits;
    }
    return `55${digits}`;
  }

  /**
   * Adiciona uma mensagem à fila com prioridade e garantia anti-bloqueio
   */
  public enqueue(item: {
    orderId?: string;
    recipientPhone: string;
    recipientName: string;
    courseTitle?: string;
    type: WhatsAppMessageType;
    messageText: string;
    priority?: 'HIGH' | 'NORMAL' | 'LOW';
  }): WhatsAppQueueItem {
    const priority = item.priority || 'NORMAL';
    const queueItem: WhatsAppQueueItem = {
      id: `wa_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderId: item.orderId,
      recipientPhone: this.formatPhoneForWhatsApp(item.recipientPhone),
      recipientName: item.recipientName,
      courseTitle: item.courseTitle,
      type: item.type,
      messageText: item.messageText,
      status: 'QUEUED',
      priority,
      enqueuedAt: new Date().toISOString(),
      attempts: 0
    };

    if (priority === 'HIGH') {
      // Itens de alta prioridade entram na frente dos itens de prioridade normal/baixa
      const insertIndex = this.queue.findIndex(q => q.priority !== 'HIGH');
      if (insertIndex === -1) {
        this.queue.push(queueItem);
      } else {
        this.queue.splice(insertIndex, 0, queueItem);
      }
    } else {
      this.queue.push(queueItem);
    }

    console.log(`[WHATSAPP QUEUE] Mensagem enfileirada: ID ${queueItem.id} | Tipo: ${queueItem.type} | Para: ${queueItem.recipientName} (${queueItem.recipientPhone}) | Posição na fila: ${this.queue.length}`);

    // Dispara o processador de forma assíncrona se não estiver em execução
    this.triggerProcessing();

    return queueItem;
  }

  /**
   * Enfileiramento em lote seguro (para campanhas ou disparos de cobrança em massa)
   */
  public enqueueBulk(items: Array<{
    orderId?: string;
    recipientPhone: string;
    recipientName: string;
    courseTitle?: string;
    type: WhatsAppMessageType;
    messageText: string;
    priority?: 'HIGH' | 'NORMAL' | 'LOW';
  }>): WhatsAppQueueItem[] {
    const results = items.map(item => this.enqueue(item));
    return results;
  }

  /**
   * Dispara a execução da fila de envio respeitando a vazão de 38 msgs/minuto
   */
  private async triggerProcessing() {
    if (this.isProcessing || this.isPaused) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0 && !this.isPaused) {
        // 1. Verifica taxa de disparo no último minuto (limite estrito: 38 msgs/minuto)
        this.cleanOldTimestamps();
        if (this.sentTimestamps.length >= MAX_MESSAGES_PER_MINUTE) {
          const oldest = this.sentTimestamps[0];
          const waitTime = Math.max(100, 60000 - (Date.now() - oldest) + 150);
          console.log(`[WHATSAPP ANTI-BLOQUEIO META] Limite de ${MAX_MESSAGES_PER_MINUTE} msgs/min atingido! Pausando processador por ${(waitTime / 1000).toFixed(1)}s para proteger o número contra bloqueio...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          this.cleanOldTimestamps();
          continue;
        }

        // 2. Garante o intervalo mínimo (MIN_INTERVAL_MS = 1600ms) desde o último disparo
        const elapsedSinceLast = Date.now() - this.lastDispatchedAt;
        if (elapsedSinceLast < MIN_INTERVAL_MS) {
          const waitInterval = MIN_INTERVAL_MS - elapsedSinceLast;
          await new Promise(resolve => setTimeout(resolve, waitInterval));
        }

        // 3. Remove o próximo item da fila
        const item = this.queue.shift();
        if (!item) break;

        item.status = 'PROCESSING';
        item.attempts += 1;

        try {
          await this.dispatchMessage(item);
          item.status = 'SENT';
          item.sentAt = new Date().toISOString();
          this.totalSent += 1;
          this.lastDispatchedAt = Date.now();
          this.sentTimestamps.push(this.lastDispatchedAt);

          console.log(`[WHATSAPP DISPARADO] Sucesso: ${item.id} -> ${item.recipientName} (${item.recipientPhone}) | Disparos no último minuto: ${this.sentTimestamps.length}/${MAX_MESSAGES_PER_MINUTE} (Meta Max: ${META_HARD_LIMIT})`);
        } catch (err: any) {
          console.error(`[WHATSAPP ERRO] Falha ao enviar ${item.id}:`, err?.message || err);
          item.error = err?.message || 'Erro desconhecido ao enviar mensagem via WhatsApp';

          // Se for erro de rate-limit da Meta (429), re-enfileira com delay
          if (err?.status === 429 || err?.message?.includes('rate limit') || err?.message?.includes('131053')) {
            item.status = 'RATE_LIMITED';
            this.queue.unshift(item); // devolve para a frente da fila
            console.warn(`[WHATSAPP META 429] Detectado rate limit da Meta. Aguardando 10 segundos antes de tentar novamente...`);
            await new Promise(resolve => setTimeout(resolve, 10000));
            continue;
          }

          if (item.attempts < 3) {
            item.status = 'QUEUED';
            this.queue.push(item); // tenta novamente depois
          } else {
            item.status = 'FAILED';
            this.totalFailed += 1;
          }
        }

        // Salva no histórico (mantém até 100 registros recentes)
        this.history.unshift(item);
        if (this.history.length > 100) {
          this.history.pop();
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Realiza a comunicação HTTP com a API da Meta (ou simulação de alta fidelidade)
   */
  private async dispatchMessage(item: WhatsAppQueueItem): Promise<void> {
    const metaToken = process.env.META_WA_ACCESS_TOKEN;
    const phoneId = process.env.META_WA_PHONE_NUMBER_ID;

    // Se as credenciais da Meta Cloud API estiverem configuradas, faz o envio real
    if (metaToken && phoneId) {
      const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: item.recipientPhone,
        type: 'text',
        text: {
          preview_url: true,
          body: item.messageText
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const status = res.status;
        const msg = errorData?.error?.message || `Erro HTTP ${status} na Meta Cloud API`;
        const err: any = new Error(msg);
        err.status = status;
        err.details = errorData;
        throw err;
      }
      return;
    }

    // Simulação de produção com latência controlada e log completo
    await new Promise(resolve => setTimeout(resolve, 150));
    console.log(`\n======================================================`);
    console.log(`[WHATSAPP CLOUD API - DISPARO PROTEGIDO (38 msgs/min)]`);
    console.log(`Destinatário: ${item.recipientName} (${item.recipientPhone})`);
    console.log(`Tipo: ${item.type} | Curso: ${item.courseTitle || 'N/A'}`);
    console.log(`Texto:\n${item.messageText}`);
    console.log(`======================================================\n`);
  }

  // --- Templates Prontos de Mensagens Homologadas ---

  /**
   * Template: Confirmação de Pagamento Recebido (Pix ou Cartão)
   */
  public generatePaymentConfirmedMessage(order: Order): string {
    const firstName = order.customerName.split(' ')[0] || order.customerName;
    const valor = order.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return `*Olá, ${firstName}!* 👋\n\n` +
      `Recebemos com sucesso a confirmação do seu pagamento no valor de *${valor}* para o curso:\n` +
      `🚗 *${order.courseTitle}*\n\n` +
      `📋 *Status da Matrícula:* HOMOLOGAÇÃO EM ANDAMENTO\n` +
      `Seus dados de CNH (${order.customerCnhNumber || 'Registrada'} - Cat. ${order.customerCnhCategory || 'B'}) foram encaminhados para a integração com o DETRAN.\n\n` +
      `⏳ Em instantes nossa equipe acadêmica liberará suas credenciais oficiais de acesso diretamente aqui neste WhatsApp e no seu e-mail (${order.customerEmail}).\n\n` +
      `Qualquer dúvida, estamos à disposição!`;
  }

  /**
   * Template: Envio de Credenciais e Link da Sala de Aula
   */
  public generateAccessCredentialsMessage(order: Order): string {
    const firstName = order.customerName.split(' ')[0] || order.customerName;

    return `*Parabéns, ${firstName}! Seu Acesso foi Liberado!* 🎓✅\n\n` +
      `A sua matrícula no curso *${order.courseTitle}* foi concluída com sucesso.\n\n` +
      `🔑 *Dados para Iniciar seus Estudos:*\n` +
      `• *Ambiente Virtual:* https://ead-cursos-transito.vercel.app\n` +
      `• *Seu Login:* ${order.customerCpf}\n` +
      `• *Senha Padrão:* Os 6 primeiros dígitos do seu CPF\n\n` +
      `📄 *Comprovante de Matrícula Oficial:* Disponível a qualquer momento na sua Área do Aluno com seu CPF.\n\n` +
      `Bons estudos e conte com nossa equipe de suporte pedagógico! 📚`;
  }

  /**
   * Template: Recuperação de Cobrança / Link Pix para Pedido Pendente
   */
  public generatePaymentRecoveryMessage(order: Order): string {
    const firstName = order.customerName.split(' ')[0] || order.customerName;
    const valor = order.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return `*Olá, ${firstName}! Tudo bem?* 👋\n\n` +
      `Notamos que você iniciou a matrícula para o curso *${order.courseTitle}* (${valor}), mas o pagamento via Pix ainda não foi identificado.\n\n` +
      `Caso queira garantir sua vaga com valor promocional:\n` +
      `👉 *Acesse sua área de pagamento:* https://ead-cursos-transito.vercel.app\n\n` +
      `💡 O curso é 100% online, homologado pela Portaria DETRAN PR e você pode estudar direto pelo celular ou computador.\n\n` +
      `Se precisar de qualquer auxílio com o Pix ou emissão em cartão, é só nos responder aqui!`;
  }

  /**
   * Obtém a lista atual da fila de espera
   */
  public getQueue(): WhatsAppQueueItem[] {
    return [...this.queue];
  }

  /**
   * Obtém o histórico recente de envios
   */
  public getHistory(): WhatsAppQueueItem[] {
    return [...this.history];
  }

  /**
   * Limpa a fila de mensagens pendentes
   */
  public clearQueue(): void {
    this.queue = [];
    console.log('[WHATSAPP QUEUE] Fila de mensagens pendentes limpa pelo administrador.');
  }

  /**
   * Pausa ou retoma o processador de fila
   */
  public setPaused(paused: boolean): void {
    this.isPaused = paused;
    console.log(`[WHATSAPP QUEUE] Status de pausa alterado para: ${paused}`);
    if (!paused) {
      this.triggerProcessing();
    }
  }
}

export const whatsappQueueService = new WhatsAppQueueService();
