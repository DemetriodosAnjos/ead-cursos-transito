import type { Course, Order, WebhookLog } from "../src/types";
import { COURSES } from "../src/data/courses";
import { getSupabase } from "./supabase";

// Utilitário para gerar todas as variações de CPF (sem formatação, formatado 000.000.000-00 e original)
function getCpfVariations(cpf: string): string[] {
  const clean = (cpf || "").replace(/\D/g, "");
  const set = new Set<string>();
  if (clean) set.add(clean);
  if (cpf && cpf.trim()) set.add(cpf.trim());
  if (clean.length === 11) {
    set.add(
      `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`,
    );
  }
  return Array.from(set).filter(Boolean);
}

// Gera filtro seguro para cláusulas .or() do Supabase/PostgREST
function buildCpfFilter(field: string, cpf: string): string {
  const variations = getCpfVariations(cpf);
  return variations.map((v) => `${field}.eq.${v}`).join(",");
}

class Database {
  private orders: Map<string, Order> = new Map();
  private webhookLogs: WebhookLog[] = [];
  private courses: Course[] = [];

  constructor() {
    this.initSupabaseCourses();
  }

  // Converte linha do Supabase para a tipagem Course do app
  private mapSupabaseRowToCourse(row: any): Course {
    const rawPrice =
      row.price !== undefined && row.price !== null ? Number(row.price) : 169;
    const costPrice =
      row.cost_price !== undefined && row.cost_price !== null
        ? Number(row.cost_price)
        : undefined;
    const profitPercent =
      row.profit_percent !== undefined && row.profit_percent !== null
        ? Number(row.profit_percent)
        : undefined;

    return {
      id: String(row.id),
      title: row.title || "",
      subtitle: row.subtitle || "",
      acronym: row.acronym || "",
      category: row.category || "especializados",
      categoryLabel:
        row.category_label || row.categoryLabel || "Formação Especializada",
      description: row.description || "",
      fullDescription:
        row.full_description || row.fullDescription || row.description || "",
      price: rawPrice,
      costPrice,
      profitPercent,
      duration: row.duration || "50 horas",
      workloadHours:
        row.workload_hours !== undefined && row.workload_hours !== null
          ? Number(row.workload_hours)
          : 50,
      detranApproval:
        row.detran_approval ||
        row.detranApproval ||
        "Homologado Resolução CONTRAN e DETRAN PR",
      modality: row.modality || "100% Online EAD",
      thumbnail: row.thumbnail || "",
      backdrop: row.backdrop || "",
      badge: row.badge || "",
      requirements: Array.isArray(row.requirements) ? row.requirements : [],
      modules: Array.isArray(row.modules) ? row.modules : [],
      isFeatured: row.is_featured === true || row.isFeatured === true,
      isActive: row.is_active !== false && row.isActive !== false,
    };
  }

  // Inicializa e carrega catálogo exclusivamente a partir do Supabase
  private async initSupabaseCourses() {
    const supabase = await getSupabase();
    if (!supabase) {
      console.warn(
        "[SUPABASE] Não conectado. Usando catálogo estático como contingência.",
      );
      this.courses = COURSES.map((c) => ({
        ...c,
        isActive: c.isActive !== false,
      }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("id");

      if (!error && data && data.length > 0) {
        this.courses = data.map((r) => this.mapSupabaseRowToCourse(r));
        console.log(
          `[SUPABASE] Catálogo de ${this.courses.length} cursos sincronizado exclusivamente do Supabase PostgreSQL.`,
        );
      } else if (!error && (!data || data.length === 0)) {
        console.log(
          "[SUPABASE] Tabela courses vazia. Semeando catálogo inicial...",
        );
        const coursesToInsert = COURSES.map((c) => ({
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
          cost_price:
            c.costPrice ?? (c.price <= 120 ? 50 : c.price <= 150 ? 65 : 70),
          profit_percent: c.profitPercent ?? 100,
          is_active: c.isActive !== false,
        }));
        await supabase.from("courses").upsert(coursesToInsert);
        this.courses = coursesToInsert.map((r) =>
          this.mapSupabaseRowToCourse(r),
        );
        console.log("[SUPABASE] 28 cursos semeados no Supabase.");
      }
    } catch (err) {
      console.error("[SUPABASE] Erro ao carregar catálogo de cursos:", err);
    }
  }

  // Supabase como única fonte de verdade para listagem de cursos
  async getCourses(includeInactive: boolean = false): Promise<Course[]> {
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .order("id");

        if (!error && data && data.length > 0) {
          this.courses = data.map((r) => this.mapSupabaseRowToCourse(r));
        }
      } catch (err) {
        console.warn("[SUPABASE] Erro ao buscar cursos em tempo real:", err);
      }
    }

    if (includeInactive) {
      return [...this.courses];
    }
    return this.courses.filter((c) => c.isActive !== false);
  }

  // Supabase como única fonte de verdade para busca por ID
  async getCourseById(id: string): Promise<Course | undefined> {
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          const course = this.mapSupabaseRowToCourse(data);
          const idx = this.courses.findIndex((c) => c.id === id);
          if (idx >= 0) {
            this.courses[idx] = course;
          } else {
            this.courses.push(course);
          }
          return course;
        }
      } catch (err) {
        console.warn(
          `[SUPABASE] Erro ao buscar curso [${id}] em tempo real:`,
          err,
        );
      }
    }

    return this.courses.find((c) => c.id === id);
  }

  // Atualização direta no Supabase
  async updateCourse(
    id: string,
    updates: Partial<Course>,
  ): Promise<Course | null> {
    let current = await this.getCourseById(id);
    if (!current) return null;

    const updated: Course = {
      ...current,
      ...updates,
    };

    // Recalcular coerência entre custo, lucro e venda caso aplicável
    if (
      updates.costPrice !== undefined ||
      updates.price !== undefined ||
      updates.profitPercent !== undefined
    ) {
      const cost = updated.costPrice ?? current.costPrice ?? 0;
      if (updates.profitPercent !== undefined && updates.price === undefined) {
        // Lucro % informado manualmente -> recalcula preço de venda
        const profit = updates.profitPercent;
        updated.price =
          cost > 0 ? Number((cost * (1 + profit / 100)).toFixed(2)) : cost;
      } else if (
        updates.price !== undefined &&
        updates.profitPercent === undefined
      ) {
        // Preço de venda informado manualmente -> recalcula percentual de lucro
        const price = updates.price;
        updated.profitPercent =
          cost > 0 ? Number((((price - cost) / cost) * 100).toFixed(1)) : 0;
      } else if (
        updates.costPrice !== undefined &&
        updates.price === undefined &&
        updates.profitPercent === undefined
      ) {
        // Custo atualizado -> recalcula preço baseado no lucro existente
        const profit = updated.profitPercent ?? 0;
        updated.price =
          cost > 0 ? Number((cost * (1 + profit / 100)).toFixed(2)) : cost;
      }
    }

    // Persistir no Supabase
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const payload: any = {
          price: updated.price,
          cost_price: updated.costPrice,
          profit_percent: updated.profitPercent,
          is_active: updated.isActive !== false,
          updated_at: new Date().toISOString(),
        };

        if (updates.title !== undefined) payload.title = updated.title;
        if (updates.subtitle !== undefined) payload.subtitle = updated.subtitle;
        if (updates.acronym !== undefined) payload.acronym = updated.acronym;
        if (updates.category !== undefined) payload.category = updated.category;
        if (updates.categoryLabel !== undefined)
          payload.category_label = updated.categoryLabel;
        if (updates.description !== undefined)
          payload.description = updated.description;
        if (updates.fullDescription !== undefined)
          payload.full_description = updated.fullDescription;
        if (updates.duration !== undefined) payload.duration = updated.duration;
        if (updates.workloadHours !== undefined)
          payload.workload_hours = updated.workloadHours;
        if (updates.detranApproval !== undefined)
          payload.detran_approval = updated.detranApproval;
        if (updates.modality !== undefined) payload.modality = updated.modality;
        if (updates.thumbnail !== undefined)
          payload.thumbnail = updated.thumbnail;
        if (updates.backdrop !== undefined) payload.backdrop = updated.backdrop;
        if (updates.badge !== undefined) payload.badge = updated.badge;
        if (updates.requirements !== undefined)
          payload.requirements = updated.requirements;
        if (updates.modules !== undefined) payload.modules = updated.modules;
        if (updates.isFeatured !== undefined)
          payload.is_featured = updated.isFeatured;

        const { error } = await supabase
          .from("courses")
          .update(payload)
          .eq("id", id);

        if (error) {
          console.error(
            `[SUPABASE] Erro ao atualizar curso [${id}]:`,
            error.message,
          );
        } else {
          console.log(
            `[SUPABASE] Curso [${id}] atualizado com sucesso no banco! Novo preço: R$ ${updated.price}`,
          );
        }
      } catch (err) {
        console.error(`[SUPABASE] Exceção ao atualizar curso [${id}]:`, err);
      }
    }

    const idx = this.courses.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.courses[idx] = updated;
    } else {
      this.courses.push(updated);
    }
    return updated;
  }

  async createCourse(newCourse: Course): Promise<Course> {
    let id = newCourse.id ? newCourse.id.trim() : "";
    if (!id) {
      id = newCourse.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    if (this.courses.some((c) => c.id === id)) {
      id = `${id}-${Date.now().toString().slice(-4)}`;
    }

    const costPrice = newCourse.costPrice ?? 60;
    let price = newCourse.price ?? 169;
    let profitPercent = newCourse.profitPercent;

    if (profitPercent !== undefined && newCourse.price === undefined) {
      price =
        costPrice > 0
          ? Number((costPrice * (1 + profitPercent / 100)).toFixed(2))
          : costPrice;
    } else if (profitPercent === undefined) {
      profitPercent =
        costPrice > 0
          ? Number((((price - costPrice) / costPrice) * 100).toFixed(1))
          : 0;
    }

    const course: Course = {
      ...newCourse,
      id,
      costPrice,
      profitPercent,
      price,
      isActive: newCourse.isActive !== false,
      requirements: Array.isArray(newCourse.requirements)
        ? newCourse.requirements
        : [],
      modules: Array.isArray(newCourse.modules) ? newCourse.modules : [],
    };

    const supabase = await getSupabase();
    if (supabase) {
      try {
        await supabase.from("courses").insert({
          id: course.id,
          title: course.title,
          subtitle: course.subtitle,
          acronym: course.acronym,
          category: course.category,
          category_label: course.categoryLabel,
          description: course.description,
          full_description: course.fullDescription,
          price: course.price,
          cost_price: course.costPrice,
          profit_percent: course.profitPercent,
          duration: course.duration,
          workload_hours: course.workloadHours,
          detran_approval: course.detranApproval,
          modality: course.modality,
          thumbnail: course.thumbnail,
          backdrop: course.backdrop,
          badge: course.badge,
          requirements: course.requirements,
          modules: course.modules,
          is_featured: course.isFeatured || false,
          is_active: course.isActive !== false,
        });
        console.log(
          `[SUPABASE] Novo curso [${course.id}] persistido no Supabase.`,
        );
      } catch (err) {
        console.error("[SUPABASE] Erro ao gravar novo curso:", err);
      }
    }

    this.courses.unshift(course);
    return course;
  }

  async toggleCourseActive(
    id: string,
  ): Promise<{ success: boolean; isActive: boolean; course?: Course }> {
    const course = await this.getCourseById(id);
    if (!course) return { success: false, isActive: false };
    course.isActive = course.isActive === false ? true : false;

    const supabase = await getSupabase();
    if (supabase) {
      try {
        await supabase
          .from("courses")
          .update({
            is_active: course.isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        console.log(
          `[SUPABASE] Status ativo do curso [${id}] alterado para: ${course.isActive}`,
        );
      } catch (err) {
        console.error(
          `[SUPABASE] Erro ao alterar status ativo do curso [${id}]:`,
          err,
        );
      }
    }

    return { success: true, isActive: course.isActive, course };
  }

  async deleteCourse(id: string): Promise<boolean> {
    const initialLen = this.courses.length;
    this.courses = this.courses.filter((c) => c.id !== id);
    const removed = this.courses.length < initialLen;

    const supabase = await getSupabase();
    if (supabase) {
      try {
        await supabase.from("courses").delete().eq("id", id);
        console.log(`[SUPABASE] Curso [${id}] removido do banco.`);
      } catch (err) {
        console.error(`[SUPABASE] Erro ao remover curso [${id}]:`, err);
      }
    }

    return removed;
  }

  async createOrder(order: Order): Promise<Order> {
    this.orders.set(order.txid, order);
    this.orders.set(order.id, order);

    const supabase = await getSupabase();
    if (supabase) {
      try {
        console.log(
          "[SUPABASE] Gravando aluno e pedido para CPF:",
          order.customerCpf,
        );

        // 1. Cadastra/Atualiza aluno na tabela students
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .upsert(
            {
              cpf: order.customerCpf,
              full_name: order.customerName,
              email: order.customerEmail,
              whatsapp: order.customerWhatsapp,
              birth_date: order.customerBirthDate || null,
              cnh_number: order.customerCnhNumber,
              cnh_category: order.customerCnhCategory,
            },
            { onConflict: "cpf" },
          )
          .select("id")
          .single();

        if (studentError) {
          console.error(
            "[SUPABASE] Erro ao gravar aluno na tabela students:",
            studentError.message,
            studentError.details,
          );
        } else {
          console.log(
            "[SUPABASE] Aluno gravado com sucesso! ID:",
            studentData?.id,
          );
        }

        // 2. Registra o Pedido na tabela orders
        const { error: orderError } = await supabase.from("orders").insert({
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
          console.error(
            "[SUPABASE] Erro ao gravar pedido na tabela orders:",
            orderError.message,
            orderError.details,
          );
        } else {
          console.log(
            "[SUPABASE] Pedido gravado com sucesso no PostgreSQL! ID:",
            order.id,
          );
        }
      } catch (err) {
        console.error(
          "[SUPABASE] Exceção inesperada ao gravar pedido/aluno:",
          err,
        );
      }
    } else {
      console.warn(
        "[SUPABASE] Supabase não conectado. Verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env",
      );
    }

    return order;
  }

  getOrderByTxid(txidOrId: string): Order | undefined {
    return this.orders.get(txidOrId);
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  async getOrderByIdAsync(id: string) {
    const supabase = await getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .or(`id.eq.${id},txid.eq.${id}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          const restored = {
            id: data.id,
            txid: data.txid,
            gateway: data.gateway || "MERCADO_PAGO",
            courseId: data.course_id,
            courseTitle: data.course_title,
            courseSubtitle: "DETRAN Homologado",
            courseThumbnail:
              "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerCpf: data.customer_cpf,
            customerWhatsapp: data.customer_whatsapp,
            customerBirthDate: data.customer_birth_date || "",
            customerCnhNumber: data.customer_cnh_number || "",
            customerCnhCategory: data.customer_cnh_category || "B",
            amount: Number(data.course_price || 0),
            status: data.status,
            statusMessage: data.status_message,
            qrCodeUrl: data.qr_code_url,
            pixCopiaECola: data.pix_copia_e_cola,
            createdAt: data.created_at || new Date().toISOString(),
            paidAt: data.paid_at,
            accessDispatchedStatus: data.access_dispatched_status,
            mercadoPagoPaymentId: data.mercado_pago_payment_id,
          };

          // Atualiza/Sincroniza no cache local
          this.orders.set(restored.id, restored);
          this.orders.set(restored.txid, restored);
          return restored;
        }

        // Se a consulta rodou e o banco retornou null, garante remoção do cache
        this.orders.delete(id);
        return null;
      } catch (err) {
        console.warn("[DB] Erro ao recuperar pedido no Supabase:", err);
      }
    }

    // Fallback para memória se o Supabase falhar totalmente
    return this.orders.get(id) || null;
  }

  async findStudentByCpf(cpf: string) {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (!cleanCpf) return null;

    const supabase = await getSupabase();
    if (supabase) {
      try {
        // 1. Tenta na tabela students
        const studentCpfFilter = buildCpfFilter("cpf", cleanCpf);
        const { data: student, error: studentErr } = await supabase
          .from("students")
          .select("*")
          .or(studentCpfFilter)
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

        // 2. Tenta na tabela orders
        const orderCpfFilter = buildCpfFilter("customer_cpf", cleanCpf);
        const { data: orderData, error: orderErr } = await supabase
          .from("orders")
          .select("*")
          .or(orderCpfFilter)
          .limit(1)
          .maybeSingle();

        if (orderData && !orderErr) {
          return {
            fullName: orderData.customer_name,
            cpf: orderData.customer_cpf,
            email: orderData.customer_email,
            whatsapp: orderData.customer_whatsapp,
            birthDate: orderData.customer_birth_date || "",
            cnhNumber: orderData.customer_cnh_number,
            cnhCategory: orderData.customer_cnh_category,
          };
        }

        // Se consultou o Supabase e não encontrou, o aluno NÃO existe mais.
        return null;
      } catch (err) {
        console.warn("[DB] Erro ao consultar aluno no Supabase:", err);
      }
    }

    // Fallback de memória local apenas em caso de falha de rede/conexão com Supabase
    for (const order of this.orders.values()) {
      if (order.customerCpf.replace(/\D/g, "") === cleanCpf) {
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

    return null;
  }

  async findActiveOrderByCpfAndCourse(
    cpf: string,
    courseId: string,
  ): Promise<Order | null> {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (!cleanCpf || !courseId) return null;

    // 1. Procura em memória
    for (const order of this.orders.values()) {
      if (
        order.customerCpf.replace(/\D/g, "") === cleanCpf &&
        order.courseId === courseId
      ) {
        return order;
      }
    }

    // 2. Procura no Supabase
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const orderCpfFilter = buildCpfFilter("customer_cpf", cleanCpf);
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .or(orderCpfFilter)
          .eq("course_id", courseId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          const restored: Order = {
            id: data.id,
            txid: data.txid,
            gateway: data.gateway || "MERCADO_PAGO",
            courseId: data.course_id,
            courseTitle: data.course_title,
            courseSubtitle: "DETRAN Homologado",
            courseThumbnail:
              "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerCpf: data.customer_cpf,
            customerWhatsapp: data.customer_whatsapp,
            customerBirthDate: "",
            customerCnhNumber: data.customer_cnh_number || "",
            customerCnhCategory: data.customer_cnh_category || "B",
            amount: Number(data.course_price || 0),
            status: data.status,
            statusMessage: data.status_message,
            qrCodeUrl: data.qr_code_url,
            pixCopiaECola: data.pix_copia_e_cola,
            createdAt: data.created_at || new Date().toISOString(),
            paidAt: data.paid_at,
            accessDispatchedStatus: data.access_dispatched_status,
            mercadoPagoPaymentId: data.mercado_pago_payment_id,
          };
          this.orders.set(restored.id, restored);
          this.orders.set(restored.txid, restored);
          return restored;
        }
      } catch (err) {
        console.warn(
          "[DB] Erro ao checar pedido duplicado por curso/cpf:",
          err,
        );
      }
    }

    return null;
  }

  async getOrderByCpf(cpf: string): Promise<Order | undefined> {
    const cleanCpf = cpf.replace(/\D/g, "");
    // 1. Procura em memória
    for (const order of this.orders.values()) {
      if (order.customerCpf.replace(/\D/g, "") === cleanCpf) {
        return order;
      }
    }

    // 2. Procura no Supabase
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const orderCpfFilter = buildCpfFilter("customer_cpf", cleanCpf);
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .or(orderCpfFilter)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          const restored: Order = {
            id: data.id,
            txid: data.txid,
            gateway: data.gateway || "MERCADO_PAGO",
            courseId: data.course_id,
            courseTitle: data.course_title,
            courseSubtitle: "DETRAN Homologado",
            courseThumbnail:
              "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerCpf: data.customer_cpf,
            customerWhatsapp: data.customer_whatsapp,
            customerBirthDate: "",
            customerCnhNumber: data.customer_cnh_number || "",
            customerCnhCategory: data.customer_cnh_category || "B",
            amount: Number(data.course_price || 0),
            status: data.status,
            statusMessage: data.status_message,
            qrCodeUrl: data.qr_code_url,
            pixCopiaECola: data.pix_copia_e_cola,
            createdAt: data.created_at || new Date().toISOString(),
            paidAt: data.paid_at,
            accessDispatchedStatus: data.access_dispatched_status,
            mercadoPagoPaymentId: data.mercado_pago_payment_id,
          };
          this.orders.set(restored.id, restored);
          this.orders.set(restored.txid, restored);
          return restored;
        }
      } catch (err) {
        console.warn("[DB] Erro ao buscar pedido por CPF no Supabase:", err);
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
    const cleanCpf = cpf.replace(/\D/g, "");
    if (!cleanCpf || cleanCpf.length !== 11) {
      return {
        student: null,
        orders: [],
        authorized: false,
        registeredInSupabase: false,
        registeredInAdmin: false,
      };
    }

    let registeredInAdmin = false;
    let registeredInSupabase = false;

    // 1. Coleta e verifica pedidos e cadastros na base do Painel Admin (memória)
    const ordersMap = new Map<string, Order>();
    for (const order of this.orders.values()) {
      if (order.customerCpf.replace(/\D/g, "") === cleanCpf) {
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
    let supabaseBirthDate = "";

    if (supabase) {
      try {
        // Verifica na tabela students (com todas as variações de formatação do CPF)
        const studentFilter = buildCpfFilter("cpf", cleanCpf);
        const { data: studentRecord, error: sErr } = await supabase
          .from("students")
          .select("*")
          .or(studentFilter)
          .maybeSingle();

        if (studentRecord && !sErr) {
          registeredInSupabase = true;
          supabaseBirthDate = studentRecord.birth_date || "";
        }

        // Verifica na tabela orders (com todas as variações de formatação do CPF)
        const orderFilter = buildCpfFilter("customer_cpf", cleanCpf);
        const { data: ordersData, error: oErr } = await supabase
          .from("orders")
          .select("*")
          .or(orderFilter)
          .order("created_at", { ascending: false });

        if (ordersData && !oErr && ordersData.length > 0) {
          registeredInSupabase = true;
          for (const row of ordersData) {
            const courseDef =
              this.courses.find((c) => c.id === row.course_id) ||
              COURSES.find((c) => c.id === row.course_id);
            const localOrd = this.orders.get(row.id);
            const restored: Order = {
              id: row.id,
              txid: row.txid,
              gateway: row.gateway || "MERCADO_PAGO",
              courseId: row.course_id,
              courseTitle: row.course_title,
              courseSubtitle: courseDef?.subtitle || "DETRAN Homologado",
              courseThumbnail:
                courseDef?.thumbnail ||
                "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
              customerName: row.customer_name,
              customerEmail: row.customer_email,
              customerCpf: row.customer_cpf,
              customerWhatsapp: row.customer_whatsapp,
              customerBirthDate:
                row.customer_birth_date ||
                supabaseBirthDate ||
                student?.birthDate ||
                localOrd?.customerBirthDate ||
                "",
              customerCnhNumber: row.customer_cnh_number || "",
              customerCnhCategory: row.customer_cnh_category || "B",
              amount: Number(row.course_price || 0),
              status: row.status,
              statusMessage: row.status_message,
              qrCodeUrl: row.qr_code_url,
              pixCopiaECola: row.pix_copia_e_cola,
              createdAt: row.created_at || new Date().toISOString(),
              paidAt: row.paid_at,
              accessDispatchedStatus: row.access_dispatched_status,
              mercadoPagoPaymentId: row.mercado_pago_payment_id,
            };
            ordersMap.set(restored.id, restored);
            this.orders.set(restored.id, restored);
            this.orders.set(restored.txid, restored);
          }
        }
      } catch (err) {
        console.warn(
          "[DB] Erro ao consultar registros do aluno no Supabase:",
          err,
        );
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
        registeredInAdmin: false,
      };
    }

    const orders = Array.from(ordersMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Garante preenchimento da data de nascimento nos dados do estudante
    const enrichedStudent = student
      ? {
          ...student,
          birthDate:
            student.birthDate ||
            supabaseBirthDate ||
            orders[0]?.customerBirthDate ||
            "",
        }
      : orders[0]
        ? {
            fullName: orders[0].customerName,
            cpf: orders[0].customerCpf,
            email: orders[0].customerEmail,
            whatsapp: orders[0].customerWhatsapp,
            birthDate: orders[0].customerBirthDate || supabaseBirthDate || "",
            cnhNumber: orders[0].customerCnhNumber,
            cnhCategory: orders[0].customerCnhCategory,
          }
        : null;

    return {
      student: enrichedStudent,
      orders,
      authorized: true,
      registeredInSupabase,
      registeredInAdmin,
    };
  }

  async getAllOrdersAsync() {
    const uniqueOrders = new Map();
    const supabase = await getSupabase();
    const studentsBirthMap = new Map();

    if (supabase) {
      try {
        // 1. Busca alunos
        const { data: studentsData } = await supabase
          .from("students")
          .select("cpf, birth_date");
        if (studentsData) {
          for (const s of studentsData) {
            if (s.cpf && s.birth_date) {
              studentsBirthMap.set(s.cpf.replace(/\D/g, ""), s.birth_date);
            }
          }
        }

        // 2. Busca pedidos
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && !error) {
          // CORREÇÃO: Limpa o cache antigo da RAM para expurgar apagados do Supabase
          this.orders.clear();

          for (const row of data) {
            const cleanCpf = (row.customer_cpf || "").replace(/\D/g, "");
            const birthDate =
              row.customer_birth_date || studentsBirthMap.get(cleanCpf) || "";

            const ord = {
              id: row.id,
              txid: row.txid,
              gateway: row.gateway || "MERCADO_PAGO",
              courseId: row.course_id,
              courseTitle: row.course_title,
              courseSubtitle: "DETRAN Homologado",
              courseThumbnail:
                "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
              customerName: row.customer_name,
              customerEmail: row.customer_email,
              customerCpf: row.customer_cpf,
              customerWhatsapp: row.customer_whatsapp,
              customerBirthDate: birthDate,
              customerCnhNumber: row.customer_cnh_number || "",
              customerCnhCategory: row.customer_cnh_category || "B",
              amount: Number(row.course_price || 0),
              status: row.status,
              statusMessage: row.status_message,
              qrCodeUrl: row.qr_code_url,
              pixCopiaECola: row.pix_copia_e_cola,
              createdAt: row.created_at || new Date().toISOString(),
              paidAt: row.paid_at,
              accessDispatchedStatus: row.access_dispatched_status,
              mercadoPagoPaymentId: row.mercado_pago_payment_id,
            };

            uniqueOrders.set(ord.id, ord);
            this.orders.set(ord.id, ord);
            this.orders.set(ord.txid, ord);
          }

          // Retorna a lista atualizada do Supabase
          return Array.from(uniqueOrders.values()).sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        }
      } catch (err) {
        console.warn("[DB] Erro ao listar pedidos do Supabase:", err);
      }
    }

    // Só cai aqui se o Supabase estiver fora do ar
    return Array.from(this.orders.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  getAllOrders(): Order[] {
    const uniqueOrders = new Map<string, Order>();
    for (const order of this.orders.values()) {
      uniqueOrders.set(order.id, order);
    }
    return Array.from(uniqueOrders.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async updateOrderStatus(
    txidOrId: string,
    status: Order["status"],
    statusMessage?: string,
  ): Promise<Order | undefined> {
    const order = this.orders.get(txidOrId);
    if (!order) return undefined;

    order.status = status;
    if (statusMessage) order.statusMessage = statusMessage;

    this.orders.set(order.txid, order);
    this.orders.set(order.id, order);

    const supabase = await getSupabase();
    if (supabase) {
      supabase
        .from("orders")
        .update({ status, status_message: statusMessage })
        .or(`id.eq.${order.id},txid.eq.${order.txid}`)
        .then();
    }

    return order;
  }

  async markOrderAsPaid(
    txidOrId: string,
    mercadoPagoId?: string,
  ): Promise<{ order?: Order }> {
    const order = this.orders.get(txidOrId);
    if (!order) return {};

    if (order.status !== "PAID") {
      order.status = "PAID";
      order.paidAt = new Date().toISOString();
      order.statusMessage = "Pagamento confirmado pelo gateway via Webhook.";
      order.accessDispatchedStatus = "AGUARDANDO_ENVIO_MANUAL";

      if (mercadoPagoId) {
        order.mercadoPagoPaymentId = mercadoPagoId;
      }

      this.orders.set(order.txid, order);
      this.orders.set(order.id, order);

      const supabase = await getSupabase();
      if (supabase) {
        supabase
          .from("orders")
          .update({
            status: "PAID",
            paid_at: order.paidAt,
            status_message: order.statusMessage,
            mercado_pago_payment_id:
              mercadoPagoId || order.mercadoPagoPaymentId,
            access_dispatched_status: "AGUARDANDO_ENVIO_MANUAL",
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

    order.accessDispatchedStatus = "ENVIADO";
    order.accessDispatchedAt = new Date().toISOString();

    this.orders.set(order.txid, order);
    this.orders.set(order.id, order);

    const supabase = await getSupabase();
    if (supabase) {
      supabase
        .from("orders")
        .update({
          access_dispatched_status: "ENVIADO",
          access_dispatched_at: order.accessDispatchedAt,
        })
        .eq("id", order.id)
        .then();
    }

    return order;
  }

  async addWebhookLog(
    log: Omit<WebhookLog, "id" | "receivedAt">,
  ): Promise<WebhookLog> {
    const fullLog: WebhookLog = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      receivedAt: new Date().toISOString(),
      ...log,
    };
    this.webhookLogs.unshift(fullLog);
    if (this.webhookLogs.length > 80) {
      this.webhookLogs.pop();
    }

    const supabase = await getSupabase();
    if (supabase) {
      supabase
        .from("webhook_logs")
        .insert({
          gateway: fullLog.gateway,
          endpoint: fullLog.endpoint,
          txid: fullLog.txid,
          amount: fullLog.amount,
          status_code: fullLog.statusCode,
          status_message: fullLog.statusMessage,
          raw_payload: fullLog.rawPayload,
        })
        .then();
    }

    return fullLog;
  }

  getWebhookLogs(): WebhookLog[] {
    return this.webhookLogs;
  }
}

export const db = new Database();
