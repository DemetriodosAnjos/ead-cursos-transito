export interface NotificationResult {
  sent: boolean;
  channel: 'email' | 'whatsapp' | 'both';
  message: string;
  recipientEmail: string;
  recipientWhatsapp: string;
  timestamp: string;
}

export const notificationService = {
  sendPaymentConfirmedNotification(data: {
    customerName: string;
    customerEmail: string;
    customerWhatsapp: string;
    courseTitle: string;
    orderId: string;
    amount: number;
  }): NotificationResult {
    const firstName = data.customerName.split(' ')[0] || data.customerName;
    const formattedAmount = data.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    console.log(`\n======================================================`);
    console.log(`[DISPARO DE NOTIFICAÇÃO PÓS-PAGAMENTO]`);
    console.log(`Para: ${data.customerName} (${data.customerEmail} / WhatsApp: ${data.customerWhatsapp})`);
    console.log(`Curso: ${data.courseTitle} - Pedido: ${data.orderId} - Valor: ${formattedAmount}`);
    console.log(`------------------------------------------------------`);
    console.log(`MENSAGEM DE E-MAIL:`);
    console.log(`Assunto: Pagamento Confirmado! Seu acesso ao curso ${data.courseTitle} está sendo preparado.`);
    console.log(`Olá ${firstName},`);
    console.log(`Confirmamos o recebimento do seu pagamento no valor de ${formattedAmount} via Pix.`);
    console.log(`Sua matrícula foi registrada com sucesso no sistema.`);
    console.log(`IMPORTANTE: Como o curso possui homologação oficial no DETRAN, nossa equipe acadêmica está validando os seus dados de CNH.`);
    console.log(`Em breve (geralmente em alguns minutos), você receberá o seu LINK DE ACESSO e credenciais diretamente no seu WhatsApp (${data.customerWhatsapp}) e neste e-mail.`);
    console.log(`------------------------------------------------------`);
    console.log(`MENSAGEM DE WHATSAPP:`);
    console.log(`*Olá, ${firstName}!* 👋`);
    console.log(`Recebemos a confirmação do seu pagamento do *${data.courseTitle}*!`);
    console.log(`Seus dados já foram encaminhados para a homologação. Em breve você receberá aqui por este WhatsApp o seu link de acesso exclusivo à plataforma de estudos.`);
    console.log(`======================================================\n`);

    return {
      sent: true,
      channel: 'both',
      message: 'Notificação de confirmação enviada com sucesso ao aluno.',
      recipientEmail: data.customerEmail,
      recipientWhatsapp: data.customerWhatsapp,
      timestamp: new Date().toISOString()
    };
  }
};
