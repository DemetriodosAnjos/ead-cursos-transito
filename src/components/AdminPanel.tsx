import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Code2,
  Database,
  Shield,
  Send,
  Lock,
  LogOut,
  KeyRound,
  Check,
  User,
  AlertCircle,
  Copy,
  MessageSquare,
  ExternalLink,
  Calendar,
  Mail,
  Phone,
  Search,
  FileText
} from 'lucide-react';
import { Order, WebhookLog } from '../types';

// Formatador de CPF: 000.000.000-00
const formatCPF = (val?: string) => {
  if (!val) return 'Não inf.';
  const clean = val.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return val;
};

// Formatador de Data de Nascimento: DD/MM/AAAA
const formatBirthDate = (val?: string) => {
  if (!val) return 'Não inf.';
  const clean = val.trim();
  if (clean.includes('-')) {
    const parts = clean.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
  }
  return clean;
};

// Componente com Botão de Cópia Individual para cada Dado
interface CopyFieldProps {
  value: string;
  copyValue?: string;
  label: string;
  display?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  fieldId?: string;
}

const CopyField: React.FC<CopyFieldProps> = ({
  value,
  copyValue,
  label,
  display,
  icon,
  className = '',
  fieldId
}) => {
  const [copied, setCopied] = useState(false);
  const textToCopy = copyValue !== undefined ? copyValue : value;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!textToCopy || textToCopy === 'Não inf.') return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!textToCopy && !display) {
    return <span className="text-zinc-500 text-[11px]">Não inf.</span>;
  }

  return (
    <div className={`inline-flex items-center gap-1 group/copy ${className}`}>
      {icon && <span className="text-zinc-500 shrink-0">{icon}</span>}
      <span>{display !== undefined ? display : value}</span>
      {textToCopy && textToCopy !== 'Não inf.' && (
        <button
          id={fieldId}
          type="button"
          onClick={handleCopy}
          title={copied ? `Copiado: ${textToCopy}` : `Copiar ${label}`}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors shrink-0 focus:outline-none focus:ring-1 focus:ring-zinc-600"
        >
          {copied ? (
            <span className="inline-flex items-center gap-0.5 text-emerald-400 font-sans font-bold text-[10px]">
              <Check className="w-3 h-3 text-emerald-400" />
            </span>
          ) : (
            <Copy className="w-3 h-3 opacity-60 group-hover/copy:opacity-100 transition-opacity" />
          )}
        </button>
      )}
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  // Estado de Autenticação para Produção
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('admin_token') || null;
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estados de dados
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (ord: Order) => {
    const link = `${window.location.origin}/?orderId=${ord.id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(ord.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleWhatsAppRecovery = (ord: Order) => {
    const cleanPhone = ord.customerWhatsapp.replace(/\D/g, '');
    const link = `${window.location.origin}/?orderId=${ord.id}`;
    const text = encodeURIComponent(
      `Olá, ${ord.customerName}! 🚗\n` +
      `Aqui é da coordenação dos Cursos Especializados DETRAN PR.\n\n` +
      `Vimos que sua matrícula no curso *${ord.courseTitle}* está salva no sistema aguardando pagamento.\n\n` +
      `Para concluir com segurança via Pix ou Cartão de Crédito em até 12x, acesse seu link exclusivo:\n` +
      `${link}\n\n` +
      `Assim que confirmado, liberamos seu acesso ao ambiente de estudos. Qualquer dúvida, conte conosco!`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas.');
      }

      setAuthToken(data.token);
      localStorage.setItem('admin_token', data.token);
      setUsernameInput('');
      setPasswordInput('');
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao realizar login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('admin_token');
    setOrders([]);
    setLogs([]);
  };

  const fetchOverview = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setLogs(data.webhookLogs || []);
        if (data.webhookLogs?.length > 0 && !selectedLog) {
          setSelectedLog(data.webhookLogs[0]);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchOverview();
      const interval = setInterval(fetchOverview, 4000);
      return () => clearInterval(interval);
    }
  }, [authToken]);

  const handleMarkAsDispatched = async (orderId: string) => {
    if (!authToken) return;
    setDispatchingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/mark-dispatched`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        fetchOverview();
      }
    } catch (err) {
      console.error('Erro ao atualizar envio manual:', err);
    } finally {
      setDispatchingId(null);
    }
  };

  // Se não estiver logado, exibe tela de login profissional estilo Netflix Admin
  if (!authToken) {
    return (
      <div id="admin-login-screen" className="max-w-md mx-auto py-12 px-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 bg-red-600/20 text-red-500 rounded-xl flex items-center justify-center mx-auto border border-red-500/30 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white">Painel Administrativo</h2>
            <p className="text-xs text-zinc-400">
              Acesso restrito para gestão de matrículas, dados da CNH e liberação de acessos.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Usuário Administrador</span>
              </label>
              <input
                id="admin-username-input"
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ex: admin"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                <span>Senha de Segurança</span>
              </label>
              <input
                id="admin-password-input"
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
              />
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-red-950/50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Entrar no Painel</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <span className="text-[11px] text-zinc-500">
              Credenciais padrão de desenvolvimento: <strong className="text-zinc-400">admin / admin123</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((ord) => {
    if (filterStatus !== 'ALL' && ord.status !== filterStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const cleanQ = q.replace(/\D/g, '');
    const cleanCpf = (ord.customerCpf || '').replace(/\D/g, '');
    const cleanPhone = (ord.customerWhatsapp || '').replace(/\D/g, '');

    return (
      ord.id.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      (cleanCpf && cleanCpf.includes(cleanQ)) ||
      (cleanPhone && cleanPhone.includes(cleanQ)) ||
      ord.customerEmail.toLowerCase().includes(q) ||
      (ord.customerBirthDate && ord.customerBirthDate.toLowerCase().includes(q)) ||
      ord.courseTitle.toLowerCase().includes(q) ||
      (ord.customerCnhNumber && ord.customerCnhNumber.includes(q))
    );
  });

  return (
    <div id="admin-panel" className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner de Diagnóstico */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-white">
              Painel de Gestão e Liberação Manual de Acessos
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Sessão autenticada de produção. Acompanhe pré-matrículas, dados da CNH, logs de Webhook e marque envios no WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="refresh-admin-btn"
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900/80 text-xs font-semibold text-red-300 px-3 py-2 rounded-lg border border-red-800/60 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Tabela de Matrículas & Pedidos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Matrículas e Pedidos Registrados ({filteredOrders.length})</span>
            </h3>
            <span className="text-xs text-zinc-400">Banco de Dados com CPF, Data de Nascimento, CNH e Contato</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* Campo de Busca Rápida por CPF, Nome, CNH, etc. */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                id="admin-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por CPF, Nome, CNH..."
                className="w-full sm:w-60 bg-zinc-950 border border-zinc-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs px-1"
                  title="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs shrink-0">
              <span className="text-zinc-400 font-medium">Status:</span>
              {['ALL', 'PAID', 'PENDING'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    filterStatus === st 
                      ? 'bg-red-600 text-white shadow-sm' 
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {st === 'ALL' ? 'Todos' : st === 'PAID' ? 'Pagos' : 'Pendentes'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="p-3 whitespace-nowrap">Data / ID</th>
                <th className="p-3">Aluno / Documentos (CPF & Nascimento)</th>
                <th className="p-3">Contato</th>
                <th className="p-3 whitespace-nowrap">CNH / Cat.</th>
                <th className="p-3">Curso & Valor</th>
                <th className="p-3 whitespace-nowrap">Status Pagamento</th>
                <th className="p-3 text-right whitespace-nowrap">Ações & Envio Manual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    {searchQuery ? 'Nenhum registro encontrado para os termos da busca.' : 'Nenhuma matrícula registrada até o momento.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* 1. DATA / ID */}
                    <td className="p-3 align-top whitespace-nowrap">
                      <div className="font-mono font-medium text-zinc-300 text-[11px]">{ord.id}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {new Date(ord.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </td>

                    {/* 2. ALUNO & DOCUMENTOS: NOME, CPF, DATA DE NASCIMENTO (COM COPIAR INDIVIDUAL) */}
                    <td className="p-3 align-top min-w-[210px]">
                      <div className="mb-1">
                        <CopyField 
                          value={ord.customerName} 
                          label="Nome Completo do Aluno" 
                          display={<span className="font-bold text-white text-xs">{ord.customerName}</span>} 
                          fieldId={`copy-name-${ord.id}`}
                        />
                      </div>

                      {/* CPF com ícone de copiar individual */}
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 mt-0.5">
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase">CPF:</span>
                        <CopyField 
                          value={ord.customerCpf} 
                          copyValue={ord.customerCpf.replace(/\D/g, '')} 
                          label="CPF do Aluno" 
                          display={
                            <span className="font-mono bg-zinc-800/90 text-zinc-200 px-1.5 py-0.5 rounded border border-zinc-700/60 font-medium text-[11px]">
                              {formatCPF(ord.customerCpf)}
                            </span>
                          } 
                          fieldId={`copy-cpf-${ord.id}`}
                        />
                      </div>

                      {/* DATA DE NASCIMENTO com ícone de copiar individual */}
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 mt-1">
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase">Nasc.:</span>
                        <CopyField 
                          value={formatBirthDate(ord.customerBirthDate)} 
                          copyValue={formatBirthDate(ord.customerBirthDate)} 
                          label="Data de Nascimento" 
                          icon={<Calendar className="w-3 h-3 text-zinc-400" />}
                          display={
                            <span className="font-mono text-zinc-300 text-[11px]">
                              {formatBirthDate(ord.customerBirthDate)}
                            </span>
                          } 
                          fieldId={`copy-birth-${ord.id}`}
                        />
                      </div>
                    </td>

                    {/* 3. CONTATO: WHATSAPP, EMAIL (COM COPIAR INDIVIDUAL) */}
                    <td className="p-3 align-top whitespace-nowrap">
                      <div className="mb-1">
                        <CopyField 
                          value={ord.customerWhatsapp} 
                          copyValue={ord.customerWhatsapp.replace(/\D/g, '')} 
                          label="WhatsApp" 
                          icon={<Phone className="w-3 h-3 text-emerald-400" />}
                          display={<span className="text-emerald-400 font-mono text-[11px] font-semibold">{ord.customerWhatsapp}</span>} 
                          fieldId={`copy-whatsapp-${ord.id}`}
                        />
                      </div>
                      <div>
                        <CopyField 
                          value={ord.customerEmail} 
                          label="E-mail" 
                          icon={<Mail className="w-3 h-3 text-zinc-400" />}
                          display={<span className="text-zinc-400 text-[11px] max-w-[170px] truncate inline-block align-middle">{ord.customerEmail}</span>} 
                          fieldId={`copy-email-${ord.id}`}
                        />
                      </div>
                    </td>

                    {/* 4. CNH / CATEGORIA (COM COPIAR INDIVIDUAL) */}
                    <td className="p-3 align-top whitespace-nowrap">
                      <div>
                        <CopyField 
                          value={ord.customerCnhNumber || 'Não inf.'} 
                          copyValue={ord.customerCnhNumber} 
                          label="Número de Registro CNH" 
                          display={<span className="text-zinc-300 font-medium font-mono text-[11px]">Registro: {ord.customerCnhNumber || 'Não inf.'}</span>} 
                          fieldId={`copy-cnh-${ord.id}`}
                        />
                      </div>
                      <div className="mt-1">
                        <CopyField 
                          value={ord.customerCnhCategory || 'B'} 
                          label="Categoria da CNH" 
                          display={
                            <span className="inline-block bg-zinc-800 text-zinc-200 text-[10px] font-bold px-1.5 py-0.5 rounded border border-zinc-700">
                              Cat: {ord.customerCnhCategory || 'B'}
                            </span>
                          } 
                          fieldId={`copy-cat-${ord.id}`}
                        />
                      </div>
                    </td>

                    {/* 5. CURSO & VALOR (SEM ÍCONES DE COPIAR) */}
                    <td className="p-3 align-top min-w-[180px]">
                      <div className="font-semibold text-zinc-200 line-clamp-1 text-xs">{ord.courseTitle}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{ord.courseSubtitle}</div>
                      <div className="mt-1 font-bold text-white text-xs">
                        {ord.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </td>

                    {/* 6. STATUS PAGAMENTO & LINK DE PAGAMENTO */}
                    <td className="p-3 align-top whitespace-nowrap">
                      <div>
                        {ord.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> PAGO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-yellow-950 text-yellow-400 border border-yellow-500/40 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                            <Clock className="w-3 h-3" /> AGUARDANDO
                          </span>
                        )}
                      </div>

                      {/* Se pendente, link para abrir tela de pagamento em nova aba */}
                      {ord.status !== 'PAID' && (
                        <div className="mt-1.5">
                          <a 
                            href={`/?orderId=${ord.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            id={`open-payment-link-${ord.id}`}
                            title="Abrir tela de pagamento / Pix em nova aba"
                            className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 bg-sky-950/50 hover:bg-sky-900/60 px-2 py-0.5 rounded border border-sky-500/30 transition-colors font-medium"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>Abrir Link Pagamento</span>
                          </a>
                        </div>
                      )}
                    </td>

                    {/* 7. AÇÕES / ENVIO MANUAL */}
                    <td className="p-3 text-right align-top whitespace-nowrap">
                      {ord.status === 'PAID' ? (
                        ord.accessDispatchedStatus === 'ENVIADO' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                            <Check className="w-3.5 h-3.5" /> Acesso Enviado
                          </span>
                        ) : (
                          <button
                            id={`dispatch-btn-${ord.id}`}
                            onClick={() => handleMarkAsDispatched(ord.id)}
                            disabled={dispatchingId === ord.id}
                            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-2.5 py-1.5 rounded text-[11px] inline-flex items-center gap-1 shadow transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>{dispatchingId === ord.id ? 'Marcando...' : 'Marcar Acesso Enviado'}</span>
                          </button>
                        )
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            id={`copy-order-link-${ord.id}`}
                            onClick={() => handleCopyLink(ord)}
                            title="Copiar Link de Pagamento do Aluno"
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold px-2 py-1 rounded inline-flex items-center gap-1 border border-zinc-700 transition-colors"
                          >
                            {copiedId === ord.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-zinc-400" />
                                <span>Copiar Link</span>
                              </>
                            )}
                          </button>

                          <button
                            id={`whatsapp-order-btn-${ord.id}`}
                            onClick={() => handleWhatsAppRecovery(ord)}
                            title="Reenviar Cobrança no WhatsApp do Aluno"
                            className="bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded inline-flex items-center gap-1 border border-emerald-800/60 shadow-sm transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-400" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal de Webhooks */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-white">
              Terminal de Auditoria de Webhooks ({logs.length} eventos)
            </h3>
          </div>
          <span className="text-xs text-zinc-400">Notificações Mercado Pago em tempo real</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
            {logs.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs">
                Nenhum webhook recebido ainda.
              </div>
            ) : (
              logs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`w-full p-3 text-left transition-colors flex items-start justify-between gap-2 text-xs ${
                    selectedLog?.id === log.id ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{log.gateway}</span>
                      <span className="font-mono text-zinc-400 text-[10px]">#{log.txid}</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-0.5 line-clamp-1">{log.statusMessage}</p>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(log.receivedAt).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.statusCode === 200 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                  }`}>
                    {log.statusCode}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="p-4 bg-zinc-950 max-h-80 overflow-y-auto">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Payload JSON Inspecionado</span>
            </div>
            {selectedLog ? (
              <pre className="text-[11px] font-mono text-emerald-400 bg-black/60 p-3 rounded-lg overflow-x-auto border border-zinc-900">
                {JSON.stringify(selectedLog.rawPayload, null, 2)}
              </pre>
            ) : (
              <div className="text-xs text-zinc-500 text-center pt-8">
                Selecione um log ao lado para visualizar os detalhes brutos.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
