import React, { useState, useEffect, Suspense } from "react";
import {
  Play,
  Search,
  ShieldCheck,
  Award,
  Clock,
  ChevronRight,
  Lock,
  Terminal,
  CheckCircle2,
  BookOpen,
  Filter,
  Sparkles,
  PhoneCall,
  FileText,
  GraduationCap,
  Menu,
  X,
  Home,
  MessageCircle,
} from "lucide-react";
import { Course, Order, StudentRegistration } from "./types";
import { COURSES, CATEGORIES } from "./data/courses";
import { HeroBanner } from "./components/HeroBanner";
import { CourseCard } from "./components/CourseCard";

// Carregamento Assíncrono (Code-Splitting / Lazy Loading) para reduzir drasticamente o bundle inicial e eliminar tela branca
const RegistrationModal = React.lazy(() =>
  import("./components/RegistrationModal").then((m) => ({
    default: m.RegistrationModal,
  })),
);
const PaymentModal = React.lazy(() =>
  import("./components/PaymentModal").then((m) => ({
    default: m.PaymentModal,
  })),
);
const CourseDetailsModal = React.lazy(() =>
  import("./components/CourseDetailsModal").then((m) => ({
    default: m.CourseDetailsModal,
  })),
);
const AdminPanel = React.lazy(() =>
  import("./components/AdminPanel").then((m) => ({ default: m.AdminPanel })),
);
const OrderRecoveryModal = React.lazy(() =>
  import("./components/OrderRecoveryModal").then((m) => ({
    default: m.OrderRecoveryModal,
  })),
);
const StudentPortalModal = React.lazy(() =>
  import("./components/StudentPortalModal").then((m) => ({
    default: m.StudentPortalModal,
  })),
);

export default function App() {
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modais
  const [modalCourse, setModalCourse] = useState<Course | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isStudentPortalOpen, setIsStudentPortalOpen] = useState(false);
  const [studentPortalCpf, setStudentPortalCpf] = useState<string>("");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Aba de Administração
  const [viewMode, setViewMode] = useState<"vitrine" | "admin">("vitrine");

  // Recuperação de pedido via link da URL (?orderId=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) {
            setCurrentOrder(data.order);
            setIsPaymentOpen(true);
          }
        })
        .catch((err) =>
          console.error("Erro ao recuperar pedido via URL:", err),
        );
    }
  }, []);

  useEffect(() => {
    // Sincronizar catálogo com backend se disponível
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCourses(data);
          }
        }
      } catch (err) {
        console.log("Usando catálogo local");
      }
    };
    fetchCourses();

    const handleCoursesEvent = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail && Array.isArray(customEvt.detail)) {
        setCourses(customEvt.detail);
      }
    };
    window.addEventListener("courses-updated", handleCoursesEvent);
    return () =>
      window.removeEventListener("courses-updated", handleCoursesEvent);
  }, []);

  // Filtro de cursos
  const filteredCourses = courses.filter((c) => {
    // Requisito 5: Inativar / Ocultar card do curso na plataforma
    if (c.isActive === false) return false;

    const matchesCategory =
      selectedCategory === "all" || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredCourse =
    courses.find((c) => c.isFeatured && c.isActive !== false) ||
    courses.find((c) => c.isActive !== false);

  // Abertura do Modal de Matrícula
  const handleStartEnrollment = (course: Course, initialCpf?: string) => {
    setModalCourse(course);
    if (initialCpf) {
      setStudentPortalCpf(initialCpf);
    } else {
      const saved = localStorage.getItem("ead_student_cpf");
      if (saved) setStudentPortalCpf(saved);
    }
    setIsDetailsOpen(false);
    setIsRegistrationOpen(true);
  };

  // Abertura do Modal de Detalhes
  const handleOpenDetails = (course: Course) => {
    setModalCourse(course);
    setIsDetailsOpen(true);
  };

  // Submissão da Pré-Matrícula (Salva dados no banco e abre a tela de pagamento)
  const handleRegistrationSubmit = async (data: StudentRegistration) => {
    if (!modalCourse) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/pix/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: modalCourse.id,
          customerName: data.fullName,
          customerEmail: data.email,
          customerCpf: data.cpf,
          customerWhatsapp: data.whatsapp,
          customerBirthDate: data.birthDate,
          customerCnhNumber: data.cnhNumber,
          customerCnhCategory: data.cnhCategory,
          gateway: "MERCADO_PAGO",
        }),
      });

      if (!res.ok) {
        let errMessage = "Erro ao processar matrícula.";
        try {
          const errData = await res.json();
          // Se for duplicidade ou pedido pendente já existente
          if (res.status === 409 && errData.order) {
            setIsRegistrationOpen(false);
            setCurrentOrder(errData.order);
            setIsPaymentOpen(true);
            return;
          }
          errMessage = errData.error || errMessage;
        } catch {
          errMessage = `Servidor retornou status ${res.status} (${res.statusText || "Não encontrado"}). Verifique se o backend na Vercel está ativo.`;
        }
        throw new Error(errMessage);
      }

      let resData;
      try {
        resData = await res.json();
      } catch {
        throw new Error(
          "Resposta inválida recebida do servidor. Por favor, tente novamente.",
        );
      }
      setCurrentOrder(resData.order);
      if (data.cpf) {
        const clean = data.cpf.replace(/\D/g, "");
        localStorage.setItem("ead_student_cpf", clean);
        setStudentPortalCpf(clean);
      }
      setIsRegistrationOpen(false);
      setIsPaymentOpen(true);
    } catch (err: any) {
      alert(`Atenção: ${err.message || "Erro ao salvar matrícula"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white pb-20 lg:pb-0">
      {/* NAVBAR NETFLIX DARK */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-zinc-950/95 via-zinc-950/80 to-transparent backdrop-blur-md border-b border-zinc-900/60 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Marca + Botão Menu Hambúrguer (Mobile & Tablet) */}
          <div className="flex items-center gap-2 sm:gap-6">
            <button
              id="navbar-hamburger-btn"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors focus:outline-none"
              aria-label="Abrir menu de navegação lateral"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div
              onClick={() => setViewMode("vitrine")}
              className="cursor-pointer flex items-center gap-2"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-red-600 flex items-center justify-center font-black text-white text-xs sm:text-base tracking-tighter shadow-lg shadow-red-900/40 shrink-0">
                EAD
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-sm sm:text-lg lg:text-xl tracking-tight text-white leading-none">
                  DETRAN<span className="text-red-500 font-extrabold">PR</span>
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-400 font-semibold tracking-widest uppercase truncate max-w-[105px] sm:max-w-none">
                  Cursos Especializados
                </span>
              </div>
            </div>

            {/* Menu Desktop */}
            <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-zinc-300">
              <button
                onClick={() => {
                  setViewMode("vitrine");
                  setSelectedCategory("all");
                }}
                className={`hover:text-white transition-colors ${viewMode === "vitrine" && selectedCategory === "all" ? "text-white font-bold" : ""}`}
              >
                Início
              </button>
              <button
                onClick={() => {
                  setViewMode("vitrine");
                  setSelectedCategory("especializados");
                }}
                className={`hover:text-white transition-colors ${selectedCategory === "especializados" ? "text-white font-bold" : ""}`}
              >
                DETRAN Formação
              </button>
              <button
                onClick={() => {
                  setViewMode("vitrine");
                  setSelectedCategory("atualizacao");
                }}
                className={`hover:text-white transition-colors ${selectedCategory === "atualizacao" ? "text-white font-bold" : ""}`}
              >
                Atualização & Reciclagem
              </button>
              <button
                onClick={() => {
                  setViewMode("vitrine");
                  setSelectedCategory("saude");
                }}
                className={`hover:text-white transition-colors ${selectedCategory === "saude" ? "text-white font-bold" : ""}`}
              >
                Saúde & APH
              </button>
              <button
                onClick={() => {
                  setViewMode("vitrine");
                  setSelectedCategory("tea");
                }}
                className={`hover:text-white transition-colors ${selectedCategory === "tea" ? "text-white font-bold" : ""}`}
              >
                Jornada TEA
              </button>
              <button
                onClick={() => {
                  setViewMode("vitrine");
                  setSelectedCategory("nr");
                }}
                className={`hover:text-white transition-colors ${selectedCategory === "nr" ? "text-white font-bold" : ""}`}
              >
                Normas NR
              </button>
            </nav>
          </div>

          {/* Busca & Ações Rápidas */}
          <div className="flex items-center gap-2 sm:gap-3">
            {viewMode === "vitrine" && (
              <div className="relative w-28 sm:w-44 md:w-56">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search-course-input"
                  type="text"
                  placeholder="Buscar curso..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-full pl-8 sm:pl-9 pr-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                />
              </div>
            )}

            <button
              id="open-student-portal-btn"
              onClick={() => setIsStudentPortalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 hover:border-red-500/60 shadow-sm transition-all"
              title="Acesse seus cursos, certificados e sala de aula com seu CPF"
            >
              <GraduationCap className="w-3.5 h-3.5 text-red-400" />
              <span>Área do Aluno</span>
            </button>

            <button
              id="open-recovery-modal-btn"
              onClick={() => setIsRecoveryOpen(true)}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>2ª Via / Pagar Depois</span>
            </button>

            <button
              id="toggle-admin-btn"
              onClick={() =>
                setViewMode(viewMode === "vitrine" ? "admin" : "vitrine")
              }
              className={`flex items-center gap-1.5 text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition-all ${
                viewMode === "admin"
                  ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-900/30"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
              }`}
              title="Painel Administrativo"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {viewMode === "admin" ? "Vitrine" : "Admin"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR LATERAL (DRAWER ESQUERDA PARA DIREITA - MOBILE E TABLET) */}
      {isSidebarOpen && (
        <div
          id="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity lg:hidden"
        />
      )}

      <aside
        id="mobile-sidebar-drawer"
        className={`fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[320px] bg-zinc-950 border-r border-zinc-800 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header do Drawer */}
        <div className="p-4 sm:p-5 border-b border-zinc-900 flex items-center justify-between">
          <div
            onClick={() => {
              setViewMode("vitrine");
              setSelectedCategory("all");
              setIsSidebarOpen(false);
            }}
            className="cursor-pointer flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-900/40">
              EAD
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-white leading-none">
                DETRAN<span className="text-red-500 font-extrabold">PR</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold tracking-widest uppercase">
                Cursos Especializados
              </span>
            </div>
          </div>
          <button
            id="close-sidebar-btn"
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links de Navegação do Drawer */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Destaque: Área do Aluno */}
          <button
            id="sidebar-student-portal-btn"
            onClick={() => {
              setIsSidebarOpen(false);
              setIsStudentPortalOpen(true);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-600/25 to-red-950/40 border border-red-500/40 text-red-200 font-bold text-xs hover:border-red-500/80 transition-all shadow-md text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-bold text-xs">Área do Aluno</div>
              <div className="text-[10px] text-red-300/80 font-normal">
                Acessar aulas e certificados
              </div>
            </div>
          </button>

          <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2">
            Categorias & Cursos
          </div>

          <nav className="space-y-1 text-xs font-semibold text-zinc-300">
            <button
              onClick={() => {
                setViewMode("vitrine");
                setSelectedCategory("all");
                setIsSidebarOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                viewMode === "vitrine" && selectedCategory === "all"
                  ? "bg-zinc-800 text-white font-bold"
                  : "hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Home className="w-4 h-4 text-zinc-400" />
              <span>Início (Todos os Cursos)</span>
            </button>

            <button
              onClick={() => {
                setViewMode("vitrine");
                setSelectedCategory("especializados");
                setIsSidebarOpen(false);
                document
                  .getElementById("catalog-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                selectedCategory === "especializados"
                  ? "bg-zinc-800 text-white font-bold"
                  : "hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4 text-red-400" />
              <span>DETRAN Formação</span>
            </button>

            <button
              onClick={() => {
                setViewMode("vitrine");
                setSelectedCategory("atualizacao");
                setIsSidebarOpen(false);
                document
                  .getElementById("catalog-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                selectedCategory === "atualizacao"
                  ? "bg-zinc-800 text-white font-bold"
                  : "hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Atualização & Reciclagem</span>
            </button>

            <button
              onClick={() => {
                setViewMode("vitrine");
                setSelectedCategory("saude");
                setIsSidebarOpen(false);
                document
                  .getElementById("catalog-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                selectedCategory === "saude"
                  ? "bg-zinc-800 text-white font-bold"
                  : "hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Saúde & APH</span>
            </button>

            <button
              onClick={() => {
                setViewMode("vitrine");
                setSelectedCategory("tea");
                setIsSidebarOpen(false);
                document
                  .getElementById("catalog-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                selectedCategory === "tea"
                  ? "bg-zinc-800 text-white font-bold"
                  : "hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Jornada TEA</span>
            </button>

            <button
              onClick={() => {
                setViewMode("vitrine");
                setSelectedCategory("nr");
                setIsSidebarOpen(false);
                document
                  .getElementById("catalog-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                selectedCategory === "nr"
                  ? "bg-zinc-800 text-white font-bold"
                  : "hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Normas Regulamentadoras (NR)</span>
            </button>

            <div className="pt-3 pb-1 border-t border-zinc-900 space-y-1">
              <button
                id="sidebar-recovery-btn"
                onClick={() => {
                  setIsSidebarOpen(false);
                  setIsRecoveryOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>2ª Via / Recuperar Matrícula</span>
              </button>

              <button
                id="sidebar-admin-btn"
                onClick={() => {
                  setIsSidebarOpen(false);
                  setViewMode(viewMode === "admin" ? "vitrine" : "admin");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors"
              >
                <Terminal className="w-4 h-4 text-zinc-400" />
                <span>
                  {viewMode === "admin"
                    ? "Voltar à Vitrine"
                    : "Painel Administrativo"}
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* Rodapé do Drawer: Suporte WhatsApp */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/90">
          <a
            href="https://wa.me/qr/3YKLDKONQ5A7E1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <span>Suporte WhatsApp</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="text-[11px] text-emerald-400/90 font-mono truncate">
                (41) 99788-4424
              </div>
            </div>
          </a>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1">
        {viewMode === "admin" ? (
          <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 gap-3">
                  <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">
                    Carregando Painel Administrativo...
                  </span>
                </div>
              }
            >
              <AdminPanel courses={courses} onCoursesUpdated={setCourses} />
            </Suspense>
          </div>
        ) : (
          <div className="space-y-8">
            {/* HERO BANNER ESTILO NETFLIX */}
            {!searchQuery && selectedCategory === "all" && featuredCourse && (
              <HeroBanner
                course={featuredCourse}
                onSelectCourse={handleStartEnrollment}
                onOpenDetails={handleOpenDetails}
              />
            )}

            {/* SEÇÃO DE FILTROS & CATEGORIAS */}
            <section
              id="catalog-section"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>Catálogo de Cursos Homologados</span>
                    <span className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 font-bold px-2 py-0.5 rounded">
                      {filteredCourses.length} cursos
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Cursos 100% online com reconhecimento facial e inclusão
                    automática na CNH Digital.
                  </p>
                </div>

                {/* Filtros por Categorias Mobile Scroll */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      id={`category-btn-${cat.id}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        selectedCategory === cat.id
                          ? "bg-red-600 text-white shadow-md shadow-red-900/40"
                          : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800/80"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* GRID / FILEIRAS DE CARDS NETFLIX */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              {filteredCourses.length === 0 ? (
                <div className="p-12 text-center bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <p className="text-zinc-400 text-sm">
                    Nenhum curso encontrado com os termos pesquisados.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSearchQuery("");
                    }}
                    className="mt-3 text-xs text-red-500 hover:underline font-bold"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onSelectCourse={handleStartEnrollment}
                      onOpenDetails={handleOpenDetails}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* FAIXA INFORMATIVA DE SEGURANÇA E SUPORTE */}
            <section className="bg-zinc-900/70 border-t border-b border-zinc-800/80 py-10 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Homologação Oficial
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Certificado válido em todo território nacional pelo
                      DETRAN/CONTRAN.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      100% EAD Flexível
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Estude quando e onde quiser pelo celular ou computador.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Averbação na CNH
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Após a conclusão o curso é inserido direto no prontuário
                      RENACH.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneCall className="w-6 h-6 text-sky-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Envio Manual Personalizado
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Seu link exclusivo de acesso é conferido e enviado no seu
                      WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* FOOTER NETFLIX */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-10 px-4 sm:px-6 lg:px-8 text-zinc-500 text-xs text-center">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-zinc-300">
              DETRAN PR EAD Cursos Especializados
            </span>
            <span>•</span>
            <span>Plataforma Oficial de Capacitação</span>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap text-xs">
            <button
              onClick={() => setIsStudentPortalOpen(true)}
              className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-4 flex items-center gap-1"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Área do Aluno (Consultar com CPF)</span>
            </button>
            <span className="text-zinc-700">•</span>
            <button
              onClick={() => setIsRecoveryOpen(true)}
              className="text-zinc-400 hover:text-zinc-200 underline underline-offset-4 flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2ª Via do Pedido / Pagar Pix</span>
            </button>
            <span className="text-zinc-700">•</span>
            <button
              onClick={() =>
                setViewMode(viewMode === "vitrine" ? "admin" : "vitrine")
              }
              className="text-zinc-400 hover:text-zinc-200 underline underline-offset-4 flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>
                {viewMode === "admin"
                  ? "Voltar à Vitrine"
                  : "Painel da Coordenação"}
              </span>
            </button>
          </div>

          <p className="max-w-xl mx-auto text-zinc-600 text-[11px]">
            Todos os cursos atendem rigorosamente às resoluções do CONTRAN e
            normas vigentes do DETRAN. O link de acesso à plataforma de estudos
            é liberado após a confirmação do pagamento.
          </p>
          <div className="pt-2 text-[10px] text-zinc-700">
            © 2026 Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* MODAL 1: FORMULÁRIO DE PRÉ-MATRÍCULA CNH */}
      {isRegistrationOpen && modalCourse && (
        <Suspense fallback={null}>
          <RegistrationModal
            course={modalCourse}
            isOpen={isRegistrationOpen}
            onClose={() => setIsRegistrationOpen(false)}
            onSubmit={handleRegistrationSubmit}
            onContinueExistingOrder={(existingOrder) => {
              setCurrentOrder(existingOrder);
              setIsPaymentOpen(true);
            }}
            isLoading={isSubmitting}
            initialCpf={studentPortalCpf}
          />
        </Suspense>
      )}

      {/* MODAL 2: CHECKOUT DE PAGAMENTO E STATUS DO WEBHOOK */}
      {isPaymentOpen && currentOrder && (
        <Suspense fallback={null}>
          <PaymentModal
            order={currentOrder}
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
          />
        </Suspense>
      )}

      {/* MODAL DE RECUPERAÇÃO DE 2ª VIA DO PEDIDO */}
      {isRecoveryOpen && (
        <Suspense fallback={null}>
          <OrderRecoveryModal
            isOpen={isRecoveryOpen}
            onClose={() => setIsRecoveryOpen(false)}
            onOrderFound={(recoveredOrder) => {
              setCurrentOrder(recoveredOrder);
              setIsPaymentOpen(true);
            }}
          />
        </Suspense>
      )}

      {/* MODAL DE ÁREA DO ALUNO / PORTAL DO CONDUTOR */}
      {isStudentPortalOpen && (
        <Suspense fallback={null}>
          <StudentPortalModal
            isOpen={isStudentPortalOpen}
            onClose={() => setIsStudentPortalOpen(false)}
            onOpenPayment={(order) => {
              setCurrentOrder(order);
              setIsPaymentOpen(true);
            }}
            onSelectNewCourse={(course, studentCpf) => {
              handleStartEnrollment(course, studentCpf);
            }}
            initialCpf={studentPortalCpf}
          />
        </Suspense>
      )}

      {/* MODAL DE DETALHES DO CURSO */}
      {isDetailsOpen && modalCourse && (
        <Suspense fallback={null}>
          <CourseDetailsModal
            course={modalCourse}
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            onSelectCourse={handleStartEnrollment}
          />
        </Suspense>
      )}

      {/* TOOLBAR FIXA NA BASE DA TELA (MOBILE E TABLET) */}
      <nav
        id="mobile-bottom-toolbar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.85)] lg:hidden px-2 py-1.5"
        aria-label="Navegação rápida inferior"
      >
        <div className="max-w-lg mx-auto flex items-center justify-around relative">
          {/* 1. Início (Esquerda) */}
          <button
            id="bottom-nav-home"
            onClick={() => {
              setViewMode("vitrine");
              setSelectedCategory("all");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
              viewMode === "vitrine" && selectedCategory === "all"
                ? "text-red-500 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              Início
            </span>
          </button>

          {/* 2. Detran Formação (Esquerda) */}
          <button
            id="bottom-nav-formacao"
            onClick={() => {
              setViewMode("vitrine");
              setSelectedCategory("especializados");
              document
                .getElementById("catalog-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
              selectedCategory === "especializados"
                ? "text-red-500 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              Formação
            </span>
          </button>

          {/* 3. Área do Aluno (Centro - Destaque) */}
          <div className="flex flex-col items-center justify-center -mt-5">
            <button
              id="bottom-nav-aluno"
              onClick={() => setIsStudentPortalOpen(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white flex items-center justify-center shadow-lg shadow-red-900/60 border-2 border-zinc-950 active:scale-95 transition-transform"
              title="Área do Aluno"
              aria-label="Acessar Área do Aluno com seu CPF"
            >
              <GraduationCap className="w-6 h-6" />
            </button>
            <span className="text-[9px] font-bold text-red-400 mt-1 tracking-tight">
              Área do Aluno
            </span>
          </div>

          {/* 4. 2ª Via (Direita) */}
          <button
            id="bottom-nav-recovery"
            onClick={() => setIsRecoveryOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              2ª Via
            </span>
          </button>

          {/* 5. Suporte WhatsApp (Direita) */}
          <a
            id="bottom-nav-support"
            href="https://wa.me/qr/3YKLDKONQ5A7E1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"
            title="Suporte WhatsApp: (41) 99788-4424"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              Suporte
            </span>
          </a>
        </div>
      </nav>

      {/* BOTÃO FLUTUANTE DE SUPORTE NA VERSÃO WEB (DESKTOP) */}
      <a
        id="floating-web-support-btn"
        href="https://wa.me/qr/3YKLDKONQ5A7E1"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden lg:flex fixed bottom-6 right-6 z-40 items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white pl-4 pr-5 py-3 rounded-full shadow-2xl shadow-emerald-950/80 border border-emerald-400/40 transition-all transform hover:scale-105 active:scale-95 group"
        title="Suporte WhatsApp DETRAN PR: (41) 99788-4424"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-200 animate-ping"></span>
        </div>
        <div className="text-left leading-tight">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Suporte WhatsApp</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
          </div>
          <div className="text-[11px] text-emerald-100 font-mono">
            (41) 99788-4424
          </div>
        </div>
      </a>
    </div>
  );
}
