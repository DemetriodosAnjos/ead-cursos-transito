import express from 'express';
import dotenv from 'dotenv';
import { db } from './db';
import { mercadoPagoService } from './mercadoPagoService';
import { notificationService } from './notificationService';
import { whatsappQueueService, MAX_MESSAGES_PER_MINUTE, META_HARD_LIMIT, MIN_INTERVAL_MS } from './whatsappQueueService';
import { isSupabaseConfigured } from './supabase';
import { testSupabaseConnection } from './supabaseTest';
import type { Order, PaymentGateway } from '../src/types';

dotenv.config();

const app = express();

// Suporte a parsing de JSON tolerante a ambientes serverless (Vercel) e Express tradicional
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

// Permite CORS caso frontend e backend estejam em domínios ou portas diferentes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

const PORT = 3000;
const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

// Credenciais seguras de administrador
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// ==========================================
// ROTEADOR DE ROTAS DA API
// ==========================================
const apiRouter = express.Router();

// Healthcheck
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// 1. Status das Credenciais do Gateway e Banco
apiRouter.get('/gateways/config-status', (req, res) => {
  const currentAppUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}` || appUrl;
  const mercadoPago = mercadoPagoService.getConfigStatus(currentAppUrl);
  const supabase = {
    isConfigured: isSupabaseConfigured(),
    url: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.replace(/https?:\/\//, '').split('.')[0] + '...' : null
  };
  res.json({ mercadoPago, supabase });
});

// 1.1 Rota de Teste e Diagnóstico Direto com o Supabase
apiRouter.get('/supabase/test', testSupabaseConnection);

// 2. Lista de Cursos disponíveis (suporta ?includeInactive=true para o painel admin)
apiRouter.get('/courses', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const courses = await db.getCourses(includeInactive);
    res.json(courses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Obter curso por ID
apiRouter.get('/courses/:id', async (req, res) => {
  try {
    const course = await db.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });
    res.json(course);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3.1 Atualizar curso (Preço de Custo, Lucro %, Preço de Venda, Status Ativo/Inativo, Propriedades)
apiRouter.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedCourse = await db.updateCourse(id, updates);
    if (!updatedCourse) {
      return res.status(404).json({ error: 'Curso não encontrado para atualização.' });
    }
    res.json({ success: true, course: updatedCourse });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3.2 Cadastrar Novo Curso na Plataforma
apiRouter.post('/courses', async (req, res) => {
  try {
    const newCourseData = req.body;
    if (!newCourseData.title || !newCourseData.category) {
      return res.status(400).json({ error: 'Título e Categoria são obrigatórios.' });
    }
    const created = await db.createCourse(newCourseData);
    res.status(201).json({ success: true, course: created });
  } catch (err: any) {
    console.error('Erro ao cadastrar curso:', err);
    res.status(500).json({ error: err.message || 'Erro ao cadastrar novo curso.' });
  }
});

// 3.3 Alternar Status Ativo / Inativo (Ocultar da Vitrine)
const handleToggleActive = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await db.toggleCourseActive(id);
    if (!result.success) {
      return res.status(404).json({ error: 'Curso não encontrado.' });
    }
    res.json({ success: true, isActive: result.isActive, course: result.course });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
apiRouter.patch('/courses/:id/toggle-active', handleToggleActive);
apiRouter.put('/courses/:id/toggle-active', handleToggleActive);

// 3.4 Excluir Curso
apiRouter.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteCourse(id);
    if (!success) {
      return res.status(404).json({ error: 'Curso não encontrado para exclusão.' });
    }
    res.json({ success: true, message: 'Curso excluído com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3.5 Verificação Prévia de Cadastro do Aluno
apiRouter.get('/students/check', async (req, res) => {
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
apiRouter.get('/student/portal', async (req, res) => {
  const cpf = (req.query.cpf || req.query.formattedCpf) as string;
  if (!cpf) {
    return res.status(400).json({ error: 'CPF é obrigatório para acessar o painel do aluno.' });
  }

  try {
    const data = await db.getStudentPortalData(cpf);
    
    if (!data.authorized) {
      return res.status(200).json({
        success: false,
        authorized: false,
        student: null,
        orders: [],
        error: 'CPF não encontrado no sistema. A Área do Aluno é de acesso restrito a condutores cadastrados.',
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
apiRouter.post('/pix/create', async (req, res) => {
  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) || {};
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
    } = body;

    if (!courseId || !customerName || !customerEmail || !customerCpf) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: Nome, E-mail, CPF e ID do Curso.' 
      });
    }

    const course = await db.getCourseById(courseId);
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
        return res.status(409).json({
          error: `Já existe um pedido aberto para este curso com seu CPF. Você pode continuar o pagamento diretamente.`,
          code: 'PENDING_ORDER_EXISTS',
          order: existingOrder
        });
      }
    }

    const orderId = `ped_${Date.now()}`;
    const selectedGateway: PaymentGateway = 'MERCADO_PAGO';
    const effectiveAppUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}` || appUrl;

    // 1. Geração Pix no Mercado Pago
    const mpResult = await mercadoPagoService.createPixPayment({
      orderId,
      amount: course.price,
      customerName,
      customerEmail,
      customerCpf,
      courseTitle: course.title,
      appUrl: effectiveAppUrl
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
      appUrl: effectiveAppUrl
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
apiRouter.get('/orders/lookup', async (req, res) => {
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

// 4.2 Obter detalhes de pedido direto por ID
apiRouter.get('/orders/:id', async (req, res) => {
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
apiRouter.get('/pix/status/:txid', (req, res) => {
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
apiRouter.post('/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status, statusMessage } = req.body;

  const order = db.updateOrderStatus(orderId, status, statusMessage);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

  res.json({ order });
});

// 7. WEBHOOK OFICIAL MERCADO PAGO
const webhookPaths = [
  '/webhooks/mercadopago',
  '/webhook/mercadopago',
  '/mercadopago/webhook',
  '/mercadopago/webhooks'
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

    const isMercadoPagoTest = 
      payload?.live_mode === false || 
      paymentId === '123456' || 
      (payload?.action === 'payment.updated' && (!paymentId || paymentId === '123456'));

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

webhookPaths.forEach(p => {
  apiRouter.get(p, handleWebhookGet);
  apiRouter.post(p, handleWebhookPost);
  apiRouter.head(p, (req, res) => res.status(200).end());
});

// 8. SIMULADOR DE PAGAMENTO
apiRouter.post('/simulador/pagar-pix', async (req, res) => {
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

// 9. ADMIN: Login
apiRouter.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
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
apiRouter.post('/admin/orders/:orderId/mark-dispatched', requireAdminAuth, async (req, res) => {
  const { orderId } = req.params;
  const order = await db.markAccessAsDispatched(orderId);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
  res.json({ order, message: 'Status atualizado para: Acesso Enviado Manualmente.' });
});

// Disparar Acesso via WhatsApp com Proteção Anti-Bloqueio Meta (máx 38 msgs/min)
apiRouter.post('/admin/orders/:orderId/dispatch-whatsapp', requireAdminAuth, async (req, res) => {
  const { orderId } = req.params;
  const order = db.getOrderByTxid(orderId) || Array.from(db['orders'].values()).find((o: Order) => o.id === orderId);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

  // Marca no banco como enviado
  const updated = (await db.markAccessAsDispatched(order.id)) || order;

  // Enfileira disparo no serviço seguro de WhatsApp
  const notifResult = notificationService.sendAccessCredentialsNotification(updated);

  res.json({
    success: true,
    order: updated,
    notification: notifResult,
    stats: whatsappQueueService.getStats(),
    message: `Credenciais enfileiradas no WhatsApp com proteção anti-bloqueio (Fila ID: ${notifResult.queueItemId}).`
  });
});

// Disparar Cobrança/Recuperação Pix via WhatsApp Seguro
apiRouter.post('/admin/orders/:orderId/send-recovery-whatsapp', requireAdminAuth, (req, res) => {
  const { orderId } = req.params;
  const order = db.getOrderByTxid(orderId) || Array.from(db['orders'].values()).find((o: Order) => o.id === orderId);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

  const notifResult = notificationService.sendPaymentRecoveryNotification(order);

  res.json({
    success: true,
    order,
    notification: notifResult,
    stats: whatsappQueueService.getStats(),
    message: `Lembrete Pix enfileirado no WhatsApp com proteção anti-bloqueio (Fila ID: ${notifResult.queueItemId}).`
  });
});

// Disparar Lote Seguro de Mensagens WhatsApp (com controle de vazão de 38 msgs/min)
apiRouter.post('/admin/whatsapp/batch-dispatch', requireAdminAuth, async (req, res) => {
  const { orderIds, actionType } = req.body; // actionType: 'ACCESS' | 'RECOVERY'
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ error: 'Lista de IDs de pedidos inválida para disparo em lote.' });
  }

  const allOrders = await db.getAllOrdersAsync();
  const targetOrders = allOrders.filter(o => orderIds.includes(o.id));

  let enqueuedCount = 0;
  for (const ord of targetOrders) {
    if (actionType === 'ACCESS' && ord.status === 'PAID') {
      await db.markAccessAsDispatched(ord.id);
      notificationService.sendAccessCredentialsNotification(ord);
      enqueuedCount++;
    } else if (actionType === 'RECOVERY' && ord.status === 'PENDING') {
      notificationService.sendPaymentRecoveryNotification(ord);
      enqueuedCount++;
    }
  }

  const stats = whatsappQueueService.getStats();

  res.json({
    success: true,
    enqueuedCount,
    actionType,
    stats,
    message: `${enqueuedCount} mensagens enfileiradas com sucesso. O sistema disparará a uma taxa máxima segura de 38 msgs/minuto para cumprir as regras da Meta.`
  });
});

// Status em Tempo Real da Fila WhatsApp e Limites da Meta
apiRouter.get('/admin/whatsapp/status', requireAdminAuth, (req, res) => {
  const stats = whatsappQueueService.getStats();
  const queue = whatsappQueueService.getQueue();
  const history = whatsappQueueService.getHistory().slice(0, 30);

  res.json({
    success: true,
    stats,
    queue,
    history
  });
});

// Enfileirar Mensagem Manual Personalizada
apiRouter.post('/admin/whatsapp/enqueue', requireAdminAuth, (req, res) => {
  const { recipientPhone, recipientName, courseTitle, type, messageText, priority } = req.body;
  if (!recipientPhone || !recipientName || !messageText) {
    return res.status(400).json({ error: 'Telefone, nome e texto da mensagem são obrigatórios.' });
  }

  const queueItem = whatsappQueueService.enqueue({
    recipientPhone,
    recipientName,
    courseTitle,
    type: type || 'CUSTOM',
    messageText,
    priority: priority || 'NORMAL'
  });

  res.json({
    success: true,
    queueItem,
    stats: whatsappQueueService.getStats(),
    message: 'Mensagem adicionada com sucesso à fila anti-bloqueio.'
  });
});

// Pausar ou Retomar Fila WhatsApp
apiRouter.post('/admin/whatsapp/toggle-pause', requireAdminAuth, (req, res) => {
  const { paused } = req.body;
  whatsappQueueService.setPaused(Boolean(paused));
  res.json({
    success: true,
    stats: whatsappQueueService.getStats(),
    message: paused ? 'Fila de disparo pausada.' : 'Fila de disparo retomada.'
  });
});

// Limpar Fila WhatsApp
apiRouter.post('/admin/whatsapp/clear-queue', requireAdminAuth, (req, res) => {
  whatsappQueueService.clearQueue();
  res.json({
    success: true,
    stats: whatsappQueueService.getStats(),
    message: 'Fila de mensagens pendentes esvaziada com sucesso.'
  });
});

// Painel Admin: Visão Geral (Admin Protegido)
apiRouter.get('/admin/overview', requireAdminAuth, async (req, res) => {
  const orders = await db.getAllOrdersAsync();
  const webhookLogs = db.getWebhookLogs();
  const effectiveAppUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}` || appUrl;
  const mpConfig = mercadoPagoService.getConfigStatus(effectiveAppUrl);
  const whatsappStats = whatsappQueueService.getStats();

  res.json({
    orders,
    webhookLogs,
    whatsappStats,
    configStatus: {
      mercadoPago: mpConfig
    }
  });
});

// ==========================================
// REGISTRO DUPLO: Suporta tanto requisições para /api/... quanto para /...
// Isso garante compatibilidade 100% com Vercel Serverless Functions e Express local!
// ==========================================
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Tratamento global de erros para capturar qualquer exceção assíncrona ou de rota
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERRO SERVIDOR API]:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno ao processar requisição no servidor.',
    code: err.code || 'INTERNAL_SERVER_ERROR'
  });
});

export default app;
