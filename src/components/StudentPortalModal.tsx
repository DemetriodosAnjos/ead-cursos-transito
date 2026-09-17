import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  UserCheck, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  LogOut, 
  PlusCircle, 
  ChevronRight,
  AlertCircle,
  FileCheck,
  Printer,
  Download,
  Share2,
  Lock,
  Search
} from 'lucide-react';
import { Order, Course } from '../types';

interface StudentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayment: (order: Order) => void;
  onSelectNewCourse: (course: Course, studentCpf?: string) => void;
  initialCpf?: string;
  courses?: Course[];
}

export const StudentPortalModal: React.FC<StudentPortalModalProps> = ({
  isOpen,
  onClose,
  onOpenPayment,
  onSelectNewCourse,
  initialCpf = '',
  courses: propCourses,
}) => {
  const [cpfInput, setCpfInput] = useState(initialCpf);
  const [activeCpf, setActiveCpf] = useState<string | null>(null);
  const [student, setStudent] = useState<any | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'paid' | 'pending'>('all');
  
  // Catálogo com Supabase como única fonte de verdade
  const [coursesList, setCoursesList] = useState<Course[]>(propCourses || []);

  // Estado para visualização do Comprovante de Matrícula & Pagamento
  const [viewingReceipt, setViewingReceipt] = useState<Order | null>(null);

  useEffect(() => {
    if (propCourses && propCourses.length > 0) {
      setCoursesList(propCourses);
    } else {
      fetch('/api/courses')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setCoursesList(data);
          }
        })
        .catch(err => console.error('Erro ao sincronizar catálogo do Supabase:', err));
    }
  }, [propCourses]);

  // Carrega CPF salvo no localStorage
  useEffect(() => {
    if (isOpen) {
      const savedCpf = localStorage.getItem('ead_student_cpf') || initialCpf;
      if (savedCpf) {
        setCpfInput(savedCpf);
        handleLoadPortal(savedCpf);
      }
    }
  }, [isOpen, initialCpf]);

  if (!isOpen) return null;

  const formatCPF = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 11);
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleLoadPortal = async (cpfToLoad: string) => {
    const clean = cpfToLoad.replace(/\D/g, '');
    if (clean.length !== 11) {
      setErrorMsg('Informe um CPF válido com 11 dígitos.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const formatted = formatCPF(clean);
      const res = await fetch(`/api/student/portal?cpf=${clean}&formattedCpf=${encodeURIComponent(formatted)}`);
      
      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.warn('Resposta não-JSON ao consultar portal do aluno:', res.status, text.slice(0, 120));
        if (res.status === 404 || res.status === 500 || res.status === 502 || res.status === 503) {
          throw new Error('O servidor está processando uma inicialização. Aguarde alguns segundos e tente novamente.');
        }
        throw new Error('Não foi possível obter resposta do servidor. Tente novamente.');
      }

      if (!res.ok || data?.authorized === false) {
        throw new Error(data?.error || 'Nenhum cadastro ou matrícula encontrada para este CPF. Escolha um curso para iniciar!');
      }

      setStudent(data.student);
      setOrders(data.orders || []);
      setActiveCpf(clean);
      localStorage.setItem('ead_student_cpf', clean);

      if (!data.student && (!data.orders || data.orders.length === 0)) {
        setErrorMsg('Nenhum cadastro ou curso encontrado para este CPF. Escolha um curso para iniciar sua matrícula!');
      }
    } catch (err: any) {
      console.error('Erro no portal do aluno:', err);
      setErrorMsg(err.message || 'Falha ao consultar dados do aluno.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ead_student_cpf');
    setActiveCpf(null);
    setStudent(null);
    setOrders([]);
    setCpfInput('');
    setViewingReceipt(null);
  };

  // Cursos filtrados
  const paidOrders = orders.filter(o => o.status === 'PAID');
  const pendingOrders = orders.filter(o => o.status !== 'PAID');

  const displayedOrders = filterTab === 'all' 
    ? orders 
    : filterTab === 'paid' 
      ? paidOrders 
      : pendingOrders;

  // Carga horária total acumulada
  const totalHours = paidOrders.reduce((acc, curr) => {
    const course = coursesList.find(c => c.id === curr.courseId);
    return acc + (course?.workloadHours || 50);
  }, 0);

  // Sugestões de novos cursos que o aluno ainda não comprou
  const enrolledCourseIds = new Set(orders.map(o => o.courseId));
  const suggestedCourses = coursesList.filter(c => !enrolledCourseIds.has(c.id)).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl my-auto text-zinc-100 flex flex-col max-h-[92vh]">
        
        {/* HEADER DO PORTAL */}
        <div className="px-5 py-4 sm:px-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center shadow-inner">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Área do Aluno • Portal do Condutor
                </h2>
                <span className="text-[10px] bg-red-600/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/20 hidden sm:inline-flex">
                  DETRAN EAD Homologado
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Histórico de matrículas, sala de aula virtual e certificados oficiais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeCpf && (
              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 transition-all"
                title="Sair desta conta"
              >
                <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Sair / Trocar CPF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTEÚDO SCROLLÁVEL */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* TELA DE LOGIN POR CPF SE NÃO IDENTIFICADO */}
          {!activeCpf ? (
            <div className="max-w-md mx-auto py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto text-red-500 shadow-xl">
                <UserCheck className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Acesse seu Histórico com seu CPF</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Informe o CPF utilizado na matrícula para ver todos os seus cursos contratados, acessar as aulas liberadas e emitir seus certificados homologados.
                </p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLoadPortal(cpfInput);
                }}
                className="space-y-4"
              >
                <div className="relative">
                  <input
                    id="student-portal-cpf-input"
                    type="text"
                    value={cpfInput}
                    onChange={(e) => setCpfInput(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3.5 text-center text-lg font-mono text-white tracking-widest placeholder-zinc-600 outline-none transition-all"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  id="student-portal-login-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-zinc-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Consultando dados do aluno...</span>
                  ) : (
                    <>
                      <span>Consultar Meus Cursos</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-left text-xs text-zinc-400 space-y-2">
                <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Ambiente Protegido DETRAN</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  O acesso ao histórico é vinculado diretamente aos registros oficiais no banco de dados e sincronizado automaticamente com as confirmações de pagamento via Pix ou Cartão.
                </p>
              </div>
            </div>
          ) : (
            /* CONTEÚDO DO PORTAL LOGADO */
            <div className="space-y-6">

              {/* CARD DE IDENTIFICAÇÃO DO CONDUTOR */}
              <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center text-xl font-black uppercase shrink-0">
                    {student?.fullName ? student.fullName.slice(0, 2) : 'AL'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {student?.fullName || orders[0]?.customerName || 'Condutor Matriculado'}
                      </h3>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">
                        CPF: {formatCPF(activeCpf)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                      {student?.cnhNumber && (
                        <span>CNH: <strong className="text-zinc-200">{student.cnhNumber}</strong> (Cat. {student.cnhCategory || 'B'})</span>
                      )}
                      <span>WhatsApp: <strong className="text-zinc-200">{student?.whatsapp || orders[0]?.customerWhatsapp || 'Não informado'}</strong></span>
                      <span>E-mail: <strong className="text-zinc-200">{student?.email || orders[0]?.customerEmail}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    id="portal-new-course-btn"
                    onClick={() => {
                      onClose();
                      // Rola para a vitrine para escolher outro curso
                      const el = document.getElementById('catalogo-cursos');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full md:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-red-900/30"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Fazer Outro Curso</span>
                  </button>
                </div>
              </div>

              {/* STATS / MÉTRICAS DO ALUNO */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Cursos Matriculados</span>
                  <span className="text-xl sm:text-2xl font-black text-white">{orders.length}</span>
                </div>
                <div className="bg-zinc-950/80 border border-emerald-900/40 rounded-xl p-3.5">
                  <span className="text-[11px] font-semibold text-emerald-400 block mb-1">Acesso Liberado (Pagos)</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">{paidOrders.length}</span>
                </div>
                <div className="bg-zinc-950/80 border border-amber-900/40 rounded-xl p-3.5">
                  <span className="text-[11px] font-semibold text-amber-400 block mb-1">Aguardando Pagamento</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">{pendingOrders.length}</span>
                </div>
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Carga Horária EAD</span>
                  <span className="text-xl sm:text-2xl font-black text-white">{totalHours}h</span>
                </div>
              </div>

              {/* VISUALIZADOR DO COMPROVANTE OFICIAL DE MATRÍCULA E PAGAMENTO */}
              {viewingReceipt && (
                <div id="student-receipt-modal" className="bg-zinc-950 border border-emerald-500/50 rounded-2xl p-5 sm:p-6 text-zinc-100 shadow-2xl space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <FileCheck className="w-5 h-5" />
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">
                          Comprovante de Matrícula & Pagamento
                        </h4>
                        <span className="text-[11px] text-emerald-400 font-medium">
                          Acesso Liberado • Sistema Homologado DETRAN PR
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewingReceipt(null)}
                      className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 transition"
                    >
                      Fechar
                    </button>
                  </div>

                  {/* DOCUMENTO DO COMPROVANTE */}
                  <div className="bg-white text-zinc-900 rounded-xl p-5 sm:p-7 border border-zinc-200 shadow-sm space-y-5 font-sans">
                    {/* Topo do Comprovante */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 pb-4 gap-3">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-red-700">
                          DETRAN PR • EDUCAÇÃO PARA O TRÂNSITO EAD
                        </div>
                        <h3 className="text-lg font-black text-zinc-950 uppercase mt-0.5">
                          Comprovante Oficial de Matrícula
                        </h3>
                        <p className="text-xs text-zinc-600">
                          Homologado conforme Portarias SENATRAN/CONTRAN e DETRAN PR
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Pagamento Confirmado
                        </span>
                        <div className="text-[11px] text-zinc-500 mt-1 font-mono">
                          ID: #{viewingReceipt.id}
                        </div>
                      </div>
                    </div>

                    {/* Dados do Aluno e Curso */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Bloco Aluno */}
                      <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200/80 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider block">
                          Dados do Condutor / Aluno
                        </span>
                        <div className="text-sm font-bold text-zinc-900">
                          {viewingReceipt.customerName}
                        </div>
                        <div className="text-zinc-700">
                          <span className="text-zinc-500">CPF:</span> <strong>{formatCPF(viewingReceipt.customerCpf)}</strong>
                        </div>
                        {viewingReceipt.customerCnhNumber && (
                          <div className="text-zinc-700">
                            <span className="text-zinc-500">CNH:</span> <strong>{viewingReceipt.customerCnhNumber}</strong> (Cat. {viewingReceipt.customerCnhCategory || 'B'})
                          </div>
                        )}
                        <div className="text-zinc-700">
                          <span className="text-zinc-500">E-mail:</span> {viewingReceipt.customerEmail}
                        </div>
                        {viewingReceipt.customerWhatsapp && (
                          <div className="text-zinc-700">
                            <span className="text-zinc-500">WhatsApp:</span> {viewingReceipt.customerWhatsapp}
                          </div>
                        )}
                      </div>

                      {/* Bloco Curso e Homologação */}
                      <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200/80 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider block">
                          Curso Especializado Homologado
                        </span>
                        <div className="text-sm font-bold text-zinc-900">
                          {viewingReceipt.courseTitle}
                        </div>
                        <div className="text-zinc-700">
                          <span className="text-zinc-500">Carga Horária:</span> <strong>50 Horas</strong>
                        </div>
                        <div className="text-zinc-700">
                          <span className="text-zinc-500">Modalidade:</span> 100% Online EAD com Biometria Facial
                        </div>
                        <div className="text-zinc-700">
                          <span className="text-zinc-500">Validação:</span> Resolução CONTRAN nº 789/20 e DETRAN PR
                        </div>
                      </div>
                    </div>

                    {/* Dados Financeiros e de Autenticação */}
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Valor Liquidado</span>
                        <strong className="text-emerald-700 text-sm font-black">
                          {viewingReceipt.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Forma de Pagamento</span>
                        <strong className="text-zinc-800">
                          {viewingReceipt.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : viewingReceipt.paymentMethod === 'DEBIT_CARD' ? 'Cartão de Débito' : 'Pix Instantâneo'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Data / Hora</span>
                        <strong className="text-zinc-800">
                          {new Date(viewingReceipt.createdAt).toLocaleString('pt-BR')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Gateway Autenticador</span>
                        <strong className="text-zinc-800">Mercado Pago S.A.</strong>
                      </div>
                    </div>

                    {/* Rodapé do Documento */}
                    <div className="border-t border-zinc-200 pt-3 text-[11px] text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <span>Autenticação Digital: <code className="text-zinc-800 font-mono text-[10px]">{viewingReceipt.txid || viewingReceipt.id}</code></span>
                      <span>Sincronizado diretamente no RENACH / CNH Digital</span>
                    </div>
                  </div>

                  {/* Ações do Comprovante */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir / Salvar em PDF</span>
                    </button>
                    <button
                      onClick={() => setViewingReceipt(null)}
                      className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {/* ABAS DE FILTRO */}
              <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterTab('all')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      filterTab === 'all'
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Todos os Cursos ({orders.length})
                  </button>
                  <button
                    onClick={() => setFilterTab('paid')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      filterTab === 'paid'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                        : 'text-zinc-400 hover:text-emerald-400'
                    }`}
                  >
                    Liberados / Pagos ({paidOrders.length})
                  </button>
                  <button
                    onClick={() => setFilterTab('pending')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      filterTab === 'pending'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                        : 'text-zinc-400 hover:text-amber-400'
                    }`}
                  >
                    Aguardando Pagamento ({pendingOrders.length})
                  </button>
                </div>

                <div className="text-xs text-zinc-400">
                  Total de registros: <strong>{displayedOrders.length}</strong>
                </div>
              </div>

              {/* LISTA DE CURSOS DO ALUNO */}
              {displayedOrders.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3">
                  <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
                  <h4 className="text-sm font-semibold text-zinc-300">
                    Nenhum curso encontrado nesta visualização.
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Você pode escolher qualquer curso da nossa vitrine para expandir sua qualificação como condutor.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedOrders.map((order) => {
                    const isPaid = order.status === 'PAID';
                    const courseDef = coursesList.find(c => c.id === order.courseId);

                    return (
                      <div 
                        key={order.id}
                        className={`bg-zinc-950 border rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all hover:border-zinc-700 ${
                          isPaid ? 'border-emerald-900/50' : 'border-amber-900/40'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                              isPaid 
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' 
                                : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                            }`}>
                              {isPaid ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                                  <span>Acesso Liberado • Homologado</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>Aguardando Pagamento</span>
                                </>
                              )}
                            </span>

                            <span className="text-[10px] text-zinc-500 font-mono">
                              #{order.id}
                            </span>
                          </div>

                          <div className="flex gap-3">
                            <img
                              src={order.courseThumbnail || courseDef?.thumbnail || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'}
                              alt={order.courseTitle}
                              className="w-20 h-20 rounded-xl object-cover border border-zinc-800 shrink-0"
                            />
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-white line-clamp-2">
                                {order.courseTitle}
                              </h4>
                              <p className="text-[11px] text-zinc-400">
                                {courseDef?.duration || '50 Horas'} • Homologação Portaria SENATRAN/DETRAN
                              </p>
                              <div className="text-[11px] text-zinc-500">
                                Matriculado em: {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Ações do Curso */}
                        <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-2 flex-wrap">
                          {isPaid ? (
                            <div className="flex items-center justify-between gap-2 w-full">
                              <div className="text-xs">
                                <span className="text-zinc-500 block text-[10px]">Valor Pago:</span>
                                <strong className="text-emerald-400 font-bold">
                                  {order.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </strong>
                              </div>
                              <button
                                id={`btn-comprovante-${order.id}`}
                                onClick={() => setViewingReceipt(order)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-950/40"
                              >
                                <FileCheck className="w-3.5 h-3.5 text-emerald-100" />
                                <span>Ver Comprovante</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 w-full">
                              <div className="text-xs">
                                <span className="text-zinc-500 block text-[10px]">Valor:</span>
                                <strong className="text-white">
                                  {order.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </strong>
                              </div>
                              <button
                                onClick={() => {
                                  onOpenPayment(order);
                                  onClose();
                                }}
                                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pagar Agora (Pix / Cartão 12x)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SEÇÃO: QUER FAZER OUTRO CURSO? RECOMENDAÇÕES */}
              {suggestedCourses.length > 0 && (
                <div className="p-5 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-red-500" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Expandir Qualificação • Outros Cursos Recomendados para sua CNH
                      </h4>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Seus dados serão aproveitados automaticamente!
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {suggestedCourses.map(course => (
                      <div 
                        key={course.id}
                        className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between hover:border-zinc-700 transition-all group"
                      >
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block">
                            {course.categoryLabel}
                          </span>
                          <h5 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                            {course.title}
                          </h5>
                          <p className="text-[11px] text-zinc-400 line-clamp-2">
                            {course.subtitle}
                          </p>
                        </div>

                        <div className="pt-3 mt-2 border-t border-zinc-800 flex items-center justify-between">
                          <span className="text-xs font-black text-white">
                            {course.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          <button
                            onClick={() => {
                              onSelectNewCourse(course, activeCpf);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1"
                          >
                            <span>Matricular</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
