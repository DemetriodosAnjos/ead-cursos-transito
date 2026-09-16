import { Course, Order, WebhookLog } from '../src/types';
import { COURSES } from '../src/data/courses';
import { getSupabase } from './supabase';

class Database {
  private orders: Map<string, Order> = new Map();
  private webhookLogs: WebhookLog[] = [];
  private courses: Course[] = COURSES.map(c => {
    // Definir custo e margem calculada padrão para inicialização
    const costPrice = c.costPrice ?? (c.price <= 120 ? 50 : c.price <= 150 ? 65 : 70);
    const profitPercent = c.profitPercent ?? (costPrice > 0 ? Number((((c.price - costPrice) / costPrice) * 100).toFixed(1)) : 100);
    return {
      ...c,
      costPrice,
      profitPercent,
      isActive: c.isActive !== false
    };
  });

  constructor() {
    this.initSupabaseSeed();
  }

  // Semeia os 28 cursos no Supabase se ainda não existirem
  private async initSupabaseSeed() {
    const supabase = await getSupabase();
    if (!supabase) return;

    try {
      const { data, error } = await supabase.from('courses').select('id').limit(1);
      if (!error && (!data || data.length === 0)) {
        console.log('[SUPABASE] Semeando catálogo de 28 cursos...');
        const coursesToInsert = this.courses.map(c => ({
          id: c.id,
          title: c.title,
          subtitle: c.subtitle,
          acronym: c.acronym,
          category: c.category,
          category_label: c.categoryLabel,
          description: c.description,
          full_description: c.fullDescription,
          price: c.price,
          duration: c.duration,
          workload_hours: c.workloadHours,
          detran_approval: c.detranApproval,
          modality: c.modality,
          thumbnail: c.thumbnail,
          backdrop: c.backdrop,
          badge: c.badge,
          requirements: c.requirements,
          modules: c.modules,
          is_featured: c.isFeatured || false,
        }));
        await supabase.from('courses').upsert(coursesToInsert);
        console.log('[SUPABASE] 28 cursos sincronizados com sucesso no PostgreSQL!');
      }
    } catch (err) {
      console.warn('[SUPABASE] Aviso ao sincronizar cursos:', err);
    }
  }

  getCourses(includeInactive: boolean = false): Course[] {
    if (includeInactive) {
      return [...this.courses];
    }
    return this.courses.filter(c => c.isActive !== false);
  }

  getCourseById(id: string): Course | undefined {
    return this.courses.find(c => c.id === id);
  }

  updateCourse(id: string, updates: Partial<Course>): Course | null {
    const idx = this.courses.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const current = this.courses[idx];
    const updated: Course = {
      ...current,
      ...updates
    };

    // Recalcular coerência entre custo, lucro e venda caso aplicável
    if (updates.costPrice !== undefined || updates.price !== undefined || updates.profitPercent !== undefined) {
      const cost = updated.costPrice ?? current.costPrice ?? 0;
      if (updates.profitPercent !== undefined && updates.price === undefined) {
        // Lucro % informado manualmente -> recalcula preço de venda
        const profit = updates.profitPercent;
        updated.price = cost > 0 ? Number((cost * (1 + profit / 100)).toFixed(2)) : cost;
      } else if (updates.price !== undefined && updates.profitPercent === undefined) {
        // Preço de venda informado manualmente -> recalcula percentual de lucro
        const price = updates.price;
        updated.profitPercent = cost > 0 ? Number((((price - cost) / cost) * 100).toFixed(1)) : 0;
      } else if (updates.costPrice !== undefined && updates.price === undefined && updates.profitPercent === undefined) {
        // Custo atualizado -> recalcula preço baseado no lucro existente
        const profit = updated.profitPercent ?? 0;
        updated.price = cost > 0 ? Number((cost * (1 + profit / 100)).toFixed(2)) : cost;
      }
    }

    this.courses[idx] = updated;
    console.log(`[DB] Curso atualizado: ${id} | Preço: R$ ${updated.price} | Custo: R$ ${updated.costPrice} | Lucro: ${updated.profitPercent}% | Ativo: ${updated.isActive}`);
    return updated;
  }

  createCourse(newCourse: Course): Course {
    let id = newCourse.id ? newCourse.id.trim() : '';
    if (!id) {
      id = newCourse.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    if (this.courses.some(c => c.id === id)) {
      id = `${id}-${Date.now().toString().slice(-4)}`;
    }

    const costPrice = newCourse.costPrice ?? 60;
    let price = newCourse.price ?? 169;
    let profitPercent = newCourse.profitPercent;

    if (profitPercent !== undefined && newCourse.price === undefined) {
      price = costPrice > 0 ? Number((costPrice * (1 + profitPercent / 100)).toFixed(2)) : costPrice;
    } else if (profitPercent === undefined) {
      profitPercent = costPrice > 0 ? Number((((price - costPrice) / costPrice) * 100).toFixed(1)) : 0;
    }

    const course: Course = {
      ...newCourse,
      id,
      costPrice,
      profitPercent,
      price,
      isActive: newCourse.isActive !== false,
      requirements: Array.isArray(newCourse.requirements) ? newCourse.requirements : [],
      modules: Array.isArray(newCourse.modules) ? newCourse.modules : []
    };

    this.courses.unshift(course);
    console.log(`[DB] Novo curso cadastrado com sucesso: [${course.id}] ${course.title} (Preço: R$ ${course.price})`);
    return course;
  }

  toggleCourseActive(id: string): { success: boolean; isActive: boolean; course?: Course } {
    const course = this.courses.find(c => c.id === id);
    if (!course) return { success: false, isActive: false };
    course.isActive = course.isActive === false ? true : false;
    console.log(`[DB] Status do curso [${id}] alterado para: ${course.isActive ? 'ATIVO' : 'INATIVO/OCULTO'}`);
    return { success: true, isActive: course.isActive, course };
  }

  deleteCourse(id: string): boolean {
    const initialLen = this.courses.length;
    this.courses = this.courses.filter(c => c.id !== id);
    const removed = this.courses.length < initialLen;
    if (removed) {
      console.log(`[DB] Curso removido: ${id}`);
    }
    return removed;
  }

  async createOrder(order: Order): Promise<Order> {
    this.orders.set(order.txid, order);
    this.orders.set(order.id, order);

    const supabase = await getSupabase();
    if (supabase) {
      try {
        console.log('[SUPABASE] Gravando aluno e pedido para CPF:', order.customerCpf);

        // 1. Cadastra/Atualiza aluno na tabela students
        const { data: studentData, error: studentError } = await supabase.from('students').upsert({
          cpf: order.customerCpf,
          full_name: order.customerName,
          email: order.customerEmail,
          whatsapp: order.customerWhatsapp,
          birth_date: order.customerBirthDate || null,
          cnh_number: order.customerCnhNumber,
          cnh_category: order.customerCnhCategory,
        }, { onConflict: 'cpf' }).select('id').single();

        if (studentError) {
          console.error('[SUPABASE] Erro ao gravar aluno na tabela students:', studentError.message, studentError.details);
        } else {
          console.log('[SUPABASE] Aluno gravado com sucesso! ID:', studentData?.id);
        }

        // 2. Registra o Pedido na tabela orders
        const { error: orderError } = await supabase.from('orders').insert({
          id: order.id,
          student_id: studentData?.id || null,
          course_id: order.courseId,
          course_title: order.courseTitle,
          course_price: order.amount,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_cpf: order.customerCpf,
          customer_whatsapp: order.customerWhatsapp,
          customer_cnh_number: order.customerCnhNumber,
          customer_cnh_category: order.customerCnhCategory,
          gateway: order.gateway,
          txid: order.txid,
          mercado_pago_payment_id: order.mercadoPagoPaymentId,
          pix_copia_e_cola: order.pixCopiaECola,
          qr_code_url: order.qrCodeUrl,
          status: order.status,
          status_message: order.statusMessage,
          access_dispatched_status: order.accessDispatchedStatus,
        });

        if (orderError) {
          console.error('[SUPABASE] Erro ao gravar pedido na tabela orders:', orderError.message, orderError.details);
        } else {
          console.log('[SUPABASE] Pedido gravado com sucesso no PostgreSQL! ID:', order.id);
        }
      } catch (err) {
        console.error('[SUPABASE] Exceção inesperada ao gravar pedido/aluno:', err);
      }
    } else {
      console.warn('[SUPABASE] Supabase não conectado. Verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
    }

    return order;
  }

  getOrderByTxid(txidOrId: string): Order | undefined {
    return this.orders.get(txidOrId);
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  async getOrderByIdAsync(id: string): Promise<Order | undefined> {
    const local = this.orders.get(id);
    if (local) return local;

    const supabase = await getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`id.eq.${id},txid.eq.${id}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          const restored: Order = {
            id: data.id,
            txid: data.txid,
            gateway: data.gateway || 'MERCADO_PAGO',
            courseId: data.course_id,
            courseTitle: data.course_title,
            courseSubtitle: 'DETRAN Homologado',
            courseThumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerCpf: data.customer_cpf,
            customerWhatsapp: data.customer_whatsapp,
            customerBirthDate: '',
            customerCnhNumber: data.customer_cnh_number || '',
            customerCnhCategory: data.customer_cnh_category || 'B',
            amount: Number(data.course_price || 0),
            status: data.status,
            statusMessage: data.status_message,
            qrCodeUrl: data.qr_code_url,
            pixCopiaECola: data.pix_copia_e_cola,
            createdAt: data.created_at || new Date().toISOString(),
            paidAt: data.paid_at,
            accessDispatchedStatus: data.access_dispatched_status,
            mercadoPagoPaymentId: data.mercado_pago_payment_id
          };
          this.orders.set(restored.id, restored);
          this.orders.set(restored.txid, restored);
          return restored;
        }
      } catch (err) {
        console.warn('[DB] Erro ao recuperar pedido no Supabase:', err);
      }
    }
    return undefined;
  }

  async findStudentByCpf(cpf: string): Promise<any | null> {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (!cleanCpf) return null;

    // 1. Procura nas orders locais em memória
    for (const order of this.orders.values()) {
      if (order.customerCpf.replace(/\D/g, '') === cleanCpf) {
        return {
          fullName: order.customerName,
          cpf: order.customerCpf,
          email: order.customerEmail,
          whatsapp: order.customerWhatsapp,
          birthDate: order.customerBirthDate,
          cnhNumber: order.customerCnhNumber,
          cnhCategory: order.customerCnhCategory,
        };
      }
    }

    // 2. Procura no Supabase (tabela students ou orders)
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const { data: student, error: studentErr } = await supabase
          .from('students')
          .select('*')
          .or(`cpf.eq.${cleanCpf},cpf.eq.${cpf}`)
          .limit(1)
          .maybeSingle();

        if (student && !studentErr) {
          return {
            fullName: student.full_name,
            cpf: student.cpf,
            email: student.email,
            whatsapp: student.whatsapp,
            birthDate: student.birth_date,
            cnhNumber: student.cnh_number,
            cnhCategory: student.cnh_category,
          };
        }

        // Tenta também na tabela orders caso students ainda não tenha sido populada
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .or(`customer_cpf.eq.${cleanCpf},customer_cpf.eq.${cpf}`)
          .limit(1)
          .maybeSingle();

        if (orderData && !orderErr) {
          const localOrder = Array.from(this.orders.values()).find(
            o => o.customerCpf.replace(/\D/g, '') === cleanCpf
          );
          return {
            fullName: orderData.customer_name,
            cpf: orderData.customer_cpf,
            email: orderData.customer_email,
            whatsapp: orderData.customer_whatsapp,
            birthDate: orderData.customer_birth_date || localOrder?.customerBirthDate || '',
            cnhNumber: orderData.customer_cnh_number,
            cnhCategory: orderData.customer_cnh_category,
          };
        }
      } catch (err) {
        console.warn('[DB] Erro ao consultar aluno no Supabase:', err);
      }
    }

    return null;
  }

  async findActiveOrderByCpfAndCourse(cpf: string, courseId: string): Promise<Order | null> {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (!cleanCpf || !courseId) return null;

    // 1. Procura em memória
    for (const order of this.orders.values()) {
      if (order.customerCpf.replace(/\D/g, '') === cleanCpf && order.courseId === courseId) {
        return order;
      }
    }

    // 2. Procura no Supabase
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`customer_cpf.eq.${cleanCpf},customer_cpf.eq.${cpf}`)
          .eq('course_id', courseId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          const restored: Order = {
            id: data.id,
            txid: data.txid,
            gateway: data.gateway || 'MERCADO_PAGO',
            courseId: data.course_id,
            courseTitle: data.course_title,
            courseSubtitle: 'DETRAN Homologado',
            courseThumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerCpf: data.customer_cpf,
            customerWhatsapp: data.customer_whatsapp,
            customerBirthDate: '',
            customerCnhNumber: data.customer_cnh_number || '',
            customerCnhCategory: data.customer_cnh_category || 'B',
            amount: Number(data.course_price || 0),
            status: data.status,
            statusMessage: data.status_message,
            qrCodeUrl: data.qr_code_url,
            pixCopiaECola: data.pix_copia_e_cola,
            createdAt: data.created_at || new Date().toISOString(),
            paidAt: data.paid_at,
            accessDispatchedStatus: data.access_dispatched_status,
            mercadoPagoPaymentId: data.mercado_pago_payment_id
          };
          this.orders.set(restored.id, restored);
          this.orders.set(restored.txid, restored);
          return restored;
        }
      } catch (err) {
        console.warn('[DB] Erro ao checar pedido duplicado por curso/cpf:', err);
      }
    }

    return null;
  }

  async getOrderByCpf(cpf: string): Promise<Order | undefined> {
    const cleanCpf = cpf.replace(/\D/g, '');
    // 1. Procura em memória
    for (const order of this.orders.values()) {
      if (order.customerCpf.replace(/\D/g, '') === cleanCpf) {
        return order;
      }
    }

    // 2. Procura no Supabase
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`customer_cpf.eq.${cleanCpf},customer_cpf.eq.${cpf}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          const restored: Order = {
            id: data.id,
            txid: data.txid,
            gateway: data.gateway || 'MERCADO_PAGO',
            courseId: data.course_id,
            courseTitle: data.course_title,
            courseSubtitle: 'DETRAN Homologado',
            courseThumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerCpf: data.customer_cpf,
            customerWhatsapp: data.customer_whatsapp,
            customerBirthDate: '',
            customerCnhNumber: data.customer_cnh_number || '',
            customerCnhCategory: data.customer_cnh_category || 'B',
            amount: Number(data.course_price || 0),
            status: data.status,
            statusMessage: data.status_message,
            qrCodeUrl: data.qr_code_url,
            pixCopiaECola: data.pix_copia_e_cola,
            createdAt: data.created_at || new Date().toISOString(),
            paidAt: data.paid_at,
            accessDispatchedStatus: data.access_dispatched_status,
            mercadoPagoPaymentId: data.mercado_pago_payment_id
          };
          this.orders.set(restored.id, restored);
          this.orders.set(restored.txid, restored);
          return restored;
        }
      } catch (err) {
        console.warn('[DB] Erro ao buscar pedido por CPF no Supabase:', err);
      }
    }
    return undefined;
  }

  async getStudentPortalData(cpf: string): Promise<{
    student: any | null;
    orders: Order[];
    authorized: boolean;
    registeredInSupabase: boolean;
    registeredInAdmin: boolean;
  }> {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (!cleanCpf || cleanCpf.length !== 11) {
      return { 
        student: null, 
        orders: [],
        authorized: false,
        registeredInSupabase: false,
        registeredInAdmin: false
      };
    }

    let registeredInAdmin = false;
    let registeredInSupabase = false;

    // 1. Coleta e verifica pedidos e cadastros na base do Painel Admin (memória)
    const ordersMap = new Map<string, Order>();
    for (const order of this.orders.values()) {
      if (order.customerCpf.replace(/\D/g, '') === cleanCpf) {
        ordersMap.set(order.id, order);
        registeredInAdmin = true;
      }
    }

    const student = await this.findStudentByCpf(cleanCpf);
    if (student) {
      registeredInAdmin = registeredInAdmin || true;
    }

    // 2. Coleta e verifica pedidos e alunos no Supabase
    const supabase = await getSupabase();
    let supabaseBirthDate = '';

    if (supabase) {
      try {
        // Verifica na tabela students
        const { data: studentRecord, error: sErr } = await supabase
          .from('students')
          .select('*')
          .or(`cpf.eq.${cleanCpf},cpf.eq.${cpf}`)
          .maybeSingle();

        if (studentRecord && !sErr) {
          registeredInSupabase = true;
          supabaseBirthDate = studentRecord.birth_date || '';
        }

        // Verifica na tabela orders
        const { data: ordersData, error: oErr } = await supabase
          .from('orders')
          .select('*')
          .or(`customer_cpf.eq.${cleanCpf},customer_cpf.eq.${cpf}`)
          .order('created_at', { ascending: false });

        if (ordersData && !oErr && ordersData.length > 0) {
          registeredInSupabase = true;
          for (const row of ordersData) {
            const courseDef = COURSES.find(c => c.id === row.course_id);
            const localOrd = this.orders.get(row.id);
            const restored: Order = {
              id: row.id,
              txid: row.txid,
              gateway: row.gateway || 'MERCADO_PAGO',
              courseId: row.course_id,
              courseTitle: row.course_title,
              courseSubtitle: courseDef?.subtitle || 'DETRAN Homologado',
              courseThumbnail: courseDef?.thumbnail || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
              customerName: row.customer_name,
              customerEmail: row.customer_email,
              customerCpf: row.customer_cpf,
              customerWhatsapp: row.customer_whatsapp,
              customerBirthDate: row.customer_birth_date || supabaseBirthDate || student?.birthDate || localOrd?.customerBirthDate || '',
              customerCnhNumber: row.customer_cnh_number || '',
              customerCnhCategory: row.customer_cnh_category || 'B',
              amount: Number(row.course_price || 0),
              status: row.status,
              statusMessage: row.status_message,
              qrCodeUrl: row.qr_code_url,
              pixCopiaECola: row.pix_copia_e_cola,
              createdAt: row.created_at || new Date().toISOString(),
              paidAt: row.paid_at,
              accessDispatchedStatus: row.access_dispatched_status,
              mercadoPagoPaymentId: row.mercado_pago_payment_id
            };
            ordersMap.set(restored.id, restored);
            this.orders.set(restored.id, restored);
            this.orders.set(restored.txid, restored);
          }
        }
      } catch (err) {
        console.warn('[DB] Erro ao consultar registros do aluno no Supabase:', err);
      }
    }

    // Regra estrita de autorização: Acesso liberado apenas se existir registro no Supabase ou no painel admin
    const authorized = registeredInSupabase || registeredInAdmin;

    if (!authorized) {
      return {
        student: null,
        orders: [],
        authorized: false,
        registeredInSupabase: false,
        registeredInAdmin: false
      };
    }

    const orders = Array.from(ordersMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Garante preenchimento da data de nascimento nos dados do estudante
    const enrichedStudent = student ? {
      ...student,
      birthDate: student.birthDate || supabaseBirthDate || orders[0]?.customerBirthDate || ''
    } : (orders[0] ? {
      fullName: orders[0].customerName,
      cpf: orders[0].customerCpf,
      email: orders[0].customerEmail,
      whatsapp: orders[0].customerWhatsapp,
      birthDate: orders[0].customerBirthDate || supabaseBirthDate || '',
      cnhNumber: orders[0].customerCnhNumber,
      cnhCategory: orders[0].customerCnhCategory,
    } : null);

    return {
      student: enrichedStudent,
      orders,
      authorized: true,
      registeredInSupabase,
      registeredInAdmin
    };
  }

  async getAllOrdersAsync(): Promise<Order[]> {
    const uniqueOrders = new Map<string, Order>();

    // Supabase first
    const supabase = await getSupabase();
    const studentsBirthMap = new Map<string, string>();

    if (supabase) {
      try {
        // Pré-carrega datas de nascimento dos alunos no Supabase
        const { data: studentsData } = await supabase
          .from('students')
          .select('cpf, birth_date');
        if (studentsData) {
          for (const s of studentsData) {
            if (s.cpf && s.birth_date) {
              studentsBirthMap.set(s.cpf.replace(/\D/g, ''), s.birth_date);
            }
          }
        }
      } catch (e) {
        console.warn('[DB] Erro ao buscar lista de alunos no Supabase:', e);
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error) {
          for (const row of data) {
            const cleanCpf = (row.customer_cpf || '').replace(/\D/g, '');
            const localOrder = this.orders.get(row.id);
            const birthDate = row.customer_birth_date || 
              studentsBirthMap.get(cleanCpf) || 
              localOrder?.customerBirthDate || 
              '';

            const ord: Order = {
              id: row.id,
              txid: row.txid,
              gateway: row.gateway || 'MERCADO_PAGO',
              courseId: row.course_id,
              courseTitle: row.course_title,
              courseSubtitle: 'DETRAN Homologado',
              courseThumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
              customerName: row.customer_name,
              customerEmail: row.customer_email,
              customerCpf: row.customer_cpf,
              customerWhatsapp: row.customer_whatsapp,
              customerBirthDate: birthDate,
              customerCnhNumber: row.customer_cnh_number || '',
              customerCnhCategory: row.customer_cnh_category || 'B',
              amount: Number(row.course_price || 0),
              status: row.status,
              statusMessage: row.status_message,
              qrCodeUrl: row.qr_code_url,
              pixCopiaECola: row.pix_copia_e_cola,
              createdAt: row.created_at || new Date().toISOString(),
              paidAt: row.paid_at,
              accessDispatchedStatus: row.access_dispatched_status,
              mercadoPagoPaymentId: row.mercado_pago_payment_id
            };
            uniqueOrders.set(ord.id, ord);
            this.orders.set(ord.id, ord);
            this.orders.set(ord.txid, ord);
          }
        }
      } catch (err) {
        console.warn('[DB] Erro ao listar pedidos do Supabase:', err);
      }
    }

    // Merge com os pedidos da memória local
    for (const order of this.orders.values()) {
      if (!uniqueOrders.has(order.id)) {
        uniqueOrders.set(order.id, order);
      }
    }

    return Array.from(uniqueOrders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getAllOrders(): Order[] {
    const uniqueOrders = new Map<string, Order>();
    for (const order of this.orders.values()) {
      uniqueOrders.set(order.id, order);
    }
    return Array.from(uniqueOrders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateOrderStatus(
    txidOrId: string, 
    status: Order['status'], 
    statusMessage?: string
  ): Promise<Order | undefined> {
    const order = this.orders.get(txidOrId);
    if (!order) return undefined;

    order.status = status;
    if (statusMessage) order.statusMessage = statusMessage;
    
    this.orders.set(order.txid, order);
    this.orders.set(order.id, order);

    const supabase = await getSupabase();
    if (supabase) {
      supabase.from('orders')
        .update({ status, status_message: statusMessage })
        .or(`id.eq.${order.id},txid.eq.${order.txid}`)
        .then();
    }

    return order;
  }

  async markOrderAsPaid(txidOrId: string, mercadoPagoId?: string): Promise<{ order?: Order }> {
    const order = this.orders.get(txidOrId);
    if (!order) return {};

    if (order.status !== 'PAID') {
      order.status = 'PAID';
      order.paidAt = new Date().toISOString();
      order.statusMessage = 'Pagamento confirmado pelo gateway via Webhook.';
      order.accessDispatchedStatus = 'AGUARDANDO_ENVIO_MANUAL';
      
      if (mercadoPagoId) {
        order.mercadoPagoPaymentId = mercadoPagoId;
      }
      
      this.orders.set(order.txid, order);
      this.orders.set(order.id, order);

      const supabase = await getSupabase();
      if (supabase) {
        supabase.from('orders')
          .update({
            status: 'PAID',
            paid_at: order.paidAt,
            status_message: order.statusMessage,
            mercado_pago_payment_id: mercadoPagoId || order.mercadoPagoPaymentId,
            access_dispatched_status: 'AGUARDANDO_ENVIO_MANUAL'
          })
          .or(`id.eq.${order.id},txid.eq.${order.txid}`)
          .then();
      }

      return { order };
    }

    return { order };
  }

  async markAccessAsDispatched(orderId: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;

    order.accessDispatchedStatus = 'ENVIADO';
    order.accessDispatchedAt = new Date().toISOString();
    
    this.orders.set(order.txid, order);
    this.orders.set(order.id, order);

    const supabase = await getSupabase();
    if (supabase) {
      supabase.from('orders')
        .update({
          access_dispatched_status: 'ENVIADO',
          access_dispatched_at: order.accessDispatchedAt
        })
        .eq('id', order.id)
        .then();
    }

    return order;
  }

  async addWebhookLog(log: Omit<WebhookLog, 'id' | 'receivedAt'>): Promise<WebhookLog> {
    const fullLog: WebhookLog = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      receivedAt: new Date().toISOString(),
      ...log
    };
    this.webhookLogs.unshift(fullLog);
    if (this.webhookLogs.length > 80) {
      this.webhookLogs.pop();
    }

    const supabase = await getSupabase();
    if (supabase) {
      supabase.from('webhook_logs').insert({
        gateway: fullLog.gateway,
        endpoint: fullLog.endpoint,
        txid: fullLog.txid,
        amount: fullLog.amount,
        status_code: fullLog.statusCode,
        status_message: fullLog.statusMessage,
        raw_payload: fullLog.rawPayload,
      }).then();
    }

    return fullLog;
  }

  getWebhookLogs(): WebhookLog[] {
    return this.webhookLogs;
  }
}

export const db = new Database();
