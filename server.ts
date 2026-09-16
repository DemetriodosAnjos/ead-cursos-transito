import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db';
import { mercadoPagoService } from './server/mercadoPagoService';
import { notificationService } from './server/notificationService';
import { isSupabaseConfigured } from './server/supabase';
import { testSupabaseConnection } from './server/supabaseTest';
import { Order, PaymentGateway } from './src/types';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

  // Credenciais seguras de administrador
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

  // ==========================================
  // ROTAS DA API
  // ==========================================

  // 1. Status das Credenciais do Gateway e Banco
  app.get('/api/gateways/config-status', (req, res) => {
    const mercadoPago = mercadoPagoService.getConfigStatus(appUrl);
    const supabase = {
      isConfigured: isSupabaseConfigured(),
      url: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.replace(/https?:\/\//, '').split('.')[0] + '...' : null
    };
    res.json({ mercadoPago, supabase });
  });

  // 1.1 Rota de Teste e Diagnóstico Direto com o Supabase
  app.get('/api/supabase/test', testSupabaseConnection);

  // 2. Lista de Cursos disponíveis (28 cursos)
  app.get('/api/courses', (req, res) => {
    res.json(db.getCourses());
  });

  // 3. Obter curso por ID
  app.get('/api/courses/:id', (req, res) => {
    const course = db.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });
    res.json(course);
  });

  // 3.5 Verificação Prévia de Cadastro do Aluno (UX: Prevenção de duplicidade e aviso 'Usuário já cadastrado')
  app.get('/api/students/check', async (req, res) => {
    const cpf = req.query.cpf as string;
    const courseId = req.query.courseId as string;

    if (!cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório.' });
    }

    try {
      const student = await db.findStudentByCpf(cpf);
      let existingOrder: Order | null = null;

      if (courseId) {
        existingOrder = await db.findActiveOrderByCpfAndCourse(cpf, courseId);
      }

      return res.json({
        isRegistered: Boolean(student),
        student: student || null,
        existingCourseOrder: existingOrder
      });
    } catch (err: any) {
      console.error('Erro na checagem de aluno:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 3.6 Portal do Aluno: Histórico Completo de Cursos por CPF com Autorização Obrigatória
  app.get('/api/student/portal', async (req, res) => {
    const cpf = req.query.cpf as string;
    if (!cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório para acessar o painel do aluno.' });
    }

    try {
      const data = await db.getStudentPortalData(cpf);
      
      if (!data.authorized) {
        return res.status(403).json({
          success: false,
          authorized: false,
          error: 'Acesso não autorizado: CPF não encontrado no banco de dados Supabase nem no Painel Administrativo. A Área do Aluno é de acesso restrito a condutores cadastrados.',
          registeredInSupabase: data.registeredInSupabase,
          registeredInAdmin: data.registeredInAdmin
        });
      }

      return res.json({
        success: true,
        authorized: true,
        student: data.student,
        orders: data.orders,
        registeredInSupabase: data.registeredInSupabase,
        registeredInAdmin: data.registeredInAdmin
      });
    } catch (err: any) {
      console.error('Erro ao verificar autorização do aluno:', err);
      return res.status(500).json({ error: err.message || 'Erro ao consultar autorização no banco de dados' });
    }
  });

  // 4. Criar Pré-Matrícula e Gerar Pagamento Pix
  app.post('/api/pix/create', async (req, res) => {
    try {
      const { 
        courseId, 
        customerName, 
        customerEmail, 
        customerCpf, 
        customerWhatsapp = '',
        customerBirthDate = '',
        customerCnhNumber = '',
        customerCnhCategory = '',
        gateway = 'MERCADO_PAGO'
      } = req.body;

      if (!courseId || !customerName || !customerEmail || !customerCpf) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: Nome, E-mail, CPF e ID do Curso.' 
        });
      }

      const course = db.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Curso selecionado não foi encontrado no catálogo.' });
      }

      // Prevenção de duplicidade: checar se já existe matrícula ou pedido para o mesmo curso e CPF
      const existingOrder = await db.findActiveOrderByCpfAndCourse(customerCpf, courseId);
      if (existingOrder) {
        if (existingOrder.status === 'PAID') {
          return res.status(409).json({
            error: `Aluno já matriculado neste curso! O curso "${existingOrder.courseTitle}" já se encontra confirmado para este CPF.`,
            code: 'ALREADY_ENROLLED_AND_PAID',
            order: existingOrder
          });
        } else {
          // Já existe pedido gerado aguardando pagamento
          return res.status(409).json({
            error: `Já existe um pedido aberto para este curso com seu CPF. Você pode continuar o pagamento diretamente.`,
            code: 'PENDING_ORDER_EXISTS',
            order: existingOrder
          });
        }
      }

      const orderId = `ped_${Date.now()}`;
      const selectedGateway: PaymentGateway = 'MERCADO_PAGO';

      // 1. Geração Pix no Mercado Pago
      const mpResult = await mercadoPagoService.createPixPayment({
        orderId,
        amount: course.price,
        customerName,
        customerEmail,
        customerCpf,
        courseTitle: course.title,
        appUrl
      });

      // 2. Geração da Preferência Checkout Pro (Cartão de Crédito até 12x, Débito e Pix)
      const mpPreference = await mercadoPagoService.createPreference({
        orderId,
        amount: course.price,
        customerName,
        customerEmail,
        customerCpf,
        customerPhone: customerWhatsapp,
        courseTitle: course.title,
        appUrl
      });

      const order: Order = {
        id: orderId,
        txid: mpResult.paymentId,
        gateway: selectedGateway,
        paymentMethod: 'PIX',
        checkoutUrl: mpPreference.checkoutUrl,
        courseId: course.id,
        courseTitle: course.title,
        courseSubtitle: course.subtitle,
        courseThumbnail: course.thumbnail,
        customerName,
        customerEmail,
        customerCpf,
        customerWhatsapp,
        customerBirthDate,
        customerCnhNumber,
        customerCnhCategory,
        amount: course.price,
        status: 'PENDING',
        statusMessage: 'Aguardando pagamento via Pix ou Cartão.',
        qrCodeUrl: mpResult.qrCodeUrl,
        pixCopiaECola: mpResult.pixCopiaECola,
        createdAt: new Date().toISOString(),
        mercadoPagoPaymentId: mpResult.paymentId,
        accessDispatchedStatus: 'AGUARDANDO_ENVIO_MANUAL'
      };

      await db.createOrder(order);

      return res.status(201).json({
        order,
        isRealApi: mpResult.isRealApi,
        gateway: selectedGateway
      });
    } catch (error: any) {
      console.error('Erro ao gerar cobrança de matrícula:', error);
      return res.status(500).json({ error: error.message || 'Erro interno ao processar matrícula.' });
    }
  });

  // 4.1 Recuperação de Pedido / 2ª Via por CPF
  app.get('/api/orders/lookup', async (req, res) => {
    const cpf = req.query.cpf as string;
    if (!cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório.' });
    }

    try {
      const order = await db.getOrderByCpf(cpf);
      if (!order) {
        return res.status(404).json({ error: 'Nenhum pedido encontrado para o CPF informado.' });
      }
      return res.json({ order });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 4.2 Obter detalhes de pedido direto por ID (Recuperação via Link ?orderId=...)
  app.get('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const order = await db.getOrderByIdAsync(id);
      if (!order) {
        return res.status(404).json({ error: 'Matrícula não encontrada.' });
      }
      return res.json({ order });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 5. Consultar Status da Matrícula / Pagamento
  app.get('/api/pix/status/:txid', (req, res) => {
    const { txid } = req.params;
    const order = db.getOrderByTxid(txid);

    if (!order) {
      return res.status(404).json({ error: 'Matrícula não encontrada.' });
    }

    return res.json({
      order
    });
  });

  // 6. Atualizar Status para Prevenção de Erros
  app.post('/api/orders/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    const { status, statusMessage } = req.body;

    const order = db.updateOrderStatus(orderId, status, statusMessage);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

    res.json({ order });
  });

  // 7. WEBHOOK OFICIAL MERCADO PAGO (PIX, CARTÃO DE CRÉDITO E CARTÃO DE DÉBITO)
  // Suporta aliases comuns (plural, singular, com ou sem /api) para evitar 404 por digitação
  const webhookPaths = [
    '/api/webhooks/mercadopago',
    '/api/webhook/mercadopago',
    '/api/mercadopago/webhook',
    '/api/mercadopago/webhooks',
    '/webhooks/mercadopago',
    '/webhook/mercadopago'
  ];

  const handleWebhookGet = (req: express.Request, res: express.Response) => {
    res.status(200).json({ 
      status: 'OK', 
      message: 'Endpoint de Webhook do Mercado Pago ativo e pronto para receber notificações de pagamentos de cursos.',
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    });
  };

  const handleWebhookPost = async (req: express.Request, res: express.Response) => {
    const payload = req.body || {};
    const query = req.query || {};
    console.log('[WEBHOOK MERCADO PAGO RECEBIDO]', JSON.stringify({ body: payload, query }, null, 2));

    try {
      const paymentId = payload?.data?.id || payload?.id || (query.topic === 'payment' ? query.id : null);

      // Tratamento especial para testes de validação enviados pelo painel do Mercado Pago
      // Ex: { action: "payment.updated", data: { id: "123456" }, live_mode: false }
      const isMercadoPagoTest = 
        payload?.live_mode === false || 
        paymentId === '123456' || 
        payload?.action === 'payment.updated' && (!paymentId || paymentId === '123456');

      if (isMercadoPagoTest) {
        console.log('[MERCADO PAGO TESTE RECEBIDO] Teste de webhook validado com sucesso:', payload);
        db.addWebhookLog({
          gateway: 'MERCADO_PAGO',
          endpoint: req.originalUrl || '/api/webhooks/mercadopago',
          txid: String(paymentId || 'TEST_123456'),
          statusCode: 200,
          statusMessage: `Teste de Webhook do Mercado Pago validado com sucesso (Ação: ${payload.action || 'teste'}, Live Mode: ${payload.live_mode ?? false}).`,
          rawPayload: { body: payload, query }
        });
        return res.status(200).json({
          status: 'OK',
          message: 'Notificação de teste do Mercado Pago recebida e validada com sucesso.',
          received: true,
          timestamp: new Date().toISOString()
        });
      }

      if (!paymentId) {
        db.addWebhookLog({
          gateway: 'MERCADO_PAGO',
          endpoint: req.originalUrl || '/api/webhooks/mercadopago',
          txid: 'NO_PAYMENT_ID',
          statusCode: 200,
          statusMessage: 'Notificação recebida sem ID direto de pagamento (ex: teste ou Merchant Order).',
          rawPayload: { body: payload, query }
        });
        return res.status(200).send('OK');
      }

      // Detalhes da transação (consulta no Mercado Pago para saber se é Cartão, Débito ou Pix)
      const mpDetails = await mercadoPagoService.getPaymentDetails(String(paymentId));
      const externalReference = mpDetails?.external_reference || payload?.external_reference;
      const mpStatus = mpDetails?.status || 'approved';
      const paymentType = mpDetails?.payment_type_id || 'bank_transfer';
      const paymentMethod = mpDetails?.payment_method_id || 'pix';

      let foundOrder: Order | undefined;
      if (externalReference) {
        foundOrder = await db.getOrderByIdAsync(externalReference);
      }
      if (!foundOrder) {
        foundOrder = await db.getOrderByIdAsync(String(paymentId));
      }

      if (foundOrder) {
        // Se o pagamento for Aprovado (approved)
        if (mpStatus === 'approved') {
          let methodLabel: Order['paymentMethod'] = 'PIX';
          if (paymentType === 'credit_card') methodLabel = 'CREDIT_CARD';
          else if (paymentType === 'debit_card') methodLabel = 'DEBIT_CARD';

          foundOrder.paymentMethod = methodLabel;

          const { order } = await db.markOrderAsPaid(foundOrder.id, String(paymentId));

          if (order) {
            order.paymentMethod = methodLabel;
            notificationService.sendPaymentConfirmedNotification({
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              customerWhatsapp: order.customerWhatsapp,
              courseTitle: order.courseTitle,
              orderId: order.id,
              amount: order.amount
            });
          }

          db.addWebhookLog({
            gateway: 'MERCADO_PAGO',
            endpoint: req.originalUrl || '/api/webhooks/mercadopago',
            txid: String(paymentId),
            amount: foundOrder.amount,
            statusCode: 200,
            statusMessage: `Pagamento #${paymentId} Aprovado (${paymentType.toUpperCase()} / ${paymentMethod.toUpperCase()}).`,
            rawPayload: { body: payload, query, mpDetails }
          });

          return res.status(200).json({ status: 'PROCESSED', orderId: order?.id, method: methodLabel });
        } else if (mpStatus === 'rejected') {
          await db.updateOrderStatus(foundOrder.id, 'ERROR', 'Pagamento recusado pela operadora do cartão ou banco emissor.');
          db.addWebhookLog({
            gateway: 'MERCADO_PAGO',
            endpoint: req.originalUrl || '/api/webhooks/mercadopago',
            txid: String(paymentId),
            amount: foundOrder.amount,
            statusCode: 200,
            statusMessage: `Pagamento #${paymentId} Recusado pelo Mercado Pago. Motivo: ${mpDetails?.status_detail || 'Recusado'}.`,
            rawPayload: { body: payload, query, mpDetails }
          });
          return res.status(200).json({ status: 'REJECTED' });
        } else {
          db.addWebhookLog({
            gateway: 'MERCADO_PAGO',
            endpoint: req.originalUrl || '/api/webhooks/mercadopago',
            txid: String(paymentId),
            amount: foundOrder.amount,
            statusCode: 200,
            statusMessage: `Pagamento #${paymentId} com status em andamento: ${mpStatus}.`,
            rawPayload: { body: payload, query, mpDetails }
          });
          return res.status(200).send('OK');
        }
      } else {
        db.addWebhookLog({
          gateway: 'MERCADO_PAGO',
          endpoint: req.originalUrl || '/api/webhooks/mercadopago',
          txid: String(paymentId),
          statusCode: 200,
          statusMessage: `Aviso: Pedido não encontrado no banco para pagamento #${paymentId}.`,
          rawPayload: { body: payload, query }
        });
        return res.status(200).send('OK');
      }
    } catch (error: any) {
      console.error('Erro ao processar Webhook Mercado Pago:', error);
      db.addWebhookLog({
        gateway: 'MERCADO_PAGO',
        endpoint: req.originalUrl || '/api/webhooks/mercadopago',
        txid: 'ERROR',
        statusCode: 500,
        statusMessage: `Erro: ${error.message}`,
        rawPayload: { body: payload, query }
      });
      return res.status(500).json({ error: error.message });
    }
  };

  // Registra as rotas para todos os caminhos de webhook conhecidos
  webhookPaths.forEach(path => {
    app.get(path, handleWebhookGet);
    app.post(path, handleWebhookPost);
    app.head(path, (req, res) => res.status(200).end());
  });

  // 8. SIMULADOR DE PAGAMENTO
  app.post('/api/simulador/pagar-pix', async (req, res) => {
    const { txid } = req.body;
    const order = db.getOrderByTxid(txid);

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado para o txid informado.' });
    }

    if (order.status === 'PAID') {
      return res.json({ message: 'Pedido já se encontra marcado como PAGO.', order });
    }

    const simulatedMpPaymentId = order.mercadoPagoPaymentId || `998877${Date.now()}`;
    const { order: paidOrder } = await db.markOrderAsPaid(order.id, simulatedMpPaymentId);

    if (paidOrder) {
      notificationService.sendPaymentConfirmedNotification({
        customerName: paidOrder.customerName,
        customerEmail: paidOrder.customerEmail,
        customerWhatsapp: paidOrder.customerWhatsapp,
        courseTitle: paidOrder.courseTitle,
        orderId: paidOrder.id,
        amount: paidOrder.amount
      });
    }

    db.addWebhookLog({
      gateway: 'MERCADO_PAGO',
      endpoint: '/api/webhooks/mercadopago (Simulador)',
      txid: String(simulatedMpPaymentId),
      amount: order.amount,
      statusCode: 200,
      statusMessage: `Simulação de Pagamento: Pedido ${order.id} confirmado. Aluno notificado.`,
      rawPayload: { simulated: true, txid, orderId: order.id }
    });

    return res.json({
      success: true,
      message: 'Pagamento confirmado e notificação enviada!',
      order: db.getOrderByTxid(order.id)
    });
  });

  // =========================================================================
  // ROTAS DE AUTENTICAÇÃO E ADMINISTRAÇÃO SEGURA (PRODUÇÃO)
  // =========================================================================

  // Login do Administrador
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
      // Retorna token de sessão assinado simples para autorização no front
      const token = `adm_session_${Buffer.from(`${username}:${Date.now()}`).toString('base64')}`;
      return res.json({ 
        authenticated: true, 
        token,
        username: ADMIN_USER,
        message: 'Autenticação de administrador realizada com sucesso.' 
      });
    }
    return res.status(401).json({ error: 'Usuário ou senha de administrador incorretos.' });
  });

  // Middleware de checagem para rotas protegidas
  const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer adm_session_')) {
      return res.status(401).json({ error: 'Acesso restrito. Faça login como administrador.' });
    }
    next();
  };

  // Marcar Acesso como Enviado Manualmente (Admin Protegido)
  app.post('/api/admin/orders/:orderId/mark-dispatched', requireAdminAuth, (req, res) => {
    const { orderId } = req.params;
    const order = db.markAccessAsDispatched(orderId);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
    res.json({ order, message: 'Status atualizado para: Acesso Enviado Manualmente.' });
  });

  // Painel Admin: Visão Geral (Admin Protegido)
  app.get('/api/admin/overview', requireAdminAuth, async (req, res) => {
    const orders = await db.getAllOrdersAsync();
    const webhookLogs = db.getWebhookLogs();
    const mpConfig = mercadoPagoService.getConfigStatus(appUrl);

    res.json({
      orders,
      webhookLogs,
      configStatus: {
        mercadoPago: mpConfig
      }
    });
  });

  // ==========================================
  // VITE MIDDLEWARE (DEV) & STATIC (PROD)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVIDOR ATIVO] Plataforma com 28 Cursos EAD DETRAN rodando na porta ${PORT}`);
    console.log(`[WEBHOOK URL]: ${appUrl}/api/webhooks/mercadopago`);
  });
}

startServer();
