import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Pause, 
  Play, 
  Trash2, 
  RefreshCw, 
  Send, 
  Zap, 
  Activity, 
  ChevronRight,
  Info,
  Phone,
  User,
  GraduationCap
} from 'lucide-react';
import { WhatsAppQueueStats, WhatsAppQueueItem, Order } from '../types';

interface AdminWhatsAppMonitorProps {
  authToken: string;
  orders: Order[];
  onOrderUpdated?: () => void;
}

export const AdminWhatsAppMonitor: React.FC<AdminWhatsAppMonitorProps> = ({
  authToken,
  orders,
  onOrderUpdated
}) => {
  const [stats, setStats] = useState<WhatsAppQueueStats>({
    queuedCount: 0,
    sentLastMinute: 0,
    maxPerMinute: 38,
    metaHardLimit: 40,
    safeMarginPerMinute: 2,
    protectionStatus: 'SAFE',
    totalSent: 0,
    totalFailed: 0,
    minIntervalMs: 1600,
    estimatedDrainTimeSeconds: 0,
    isPaused: false
  });

  const [queue, setQueue] = useState<WhatsAppQueueItem[]>([]);
  const [history, setHistory] = useState<WhatsAppQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppQueueItem | null>(null);

  // Busca status em tempo real da fila
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/whatsapp/status', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.queue) setQueue(data.queue);
        if (data.history) setHistory(data.history);
      }
    } catch (err) {
      console.error('Erro ao buscar status do WhatsApp:', err);
    }
  }, [authToken]);

  useEffect(() => {
    fetchStatus();
    // Polling contínuo de alta precisão a cada 2.5 segundos para refletir a fila
    const interval = setInterval(fetchStatus, 2500);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Pausar ou Retomar Fila
  const handleTogglePause = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/whatsapp/toggle-pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ paused: !stats.isPaused })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(data.message);
        fetchStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Limpar Fila
  const handleClearQueue = async () => {
    if (!window.confirm('Deseja realmente esvaziar a fila de mensagens pendentes?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/whatsapp/clear-queue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(data.message);
        fetchStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Disparo em lote de alunos pagos com acesso aguardando
  const handleBatchDispatchAccess = async () => {
    const pendingPaidOrders = orders.filter(
      o => o.status === 'PAID' && o.accessDispatchedStatus !== 'ENVIADO'
    );

    if (pendingPaidOrders.length === 0) {
      setStatusMessage('Nenhum pedido pago aguardando envio de acesso no momento.');
      return;
    }

    if (!window.confirm(`Deseja enfileirar ${pendingPaidOrders.length} envios de acesso no WhatsApp? O sistema cadenciará os envios a no máximo 38 mensagens por minuto para cumprir as regras da Meta.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/whatsapp/batch-dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          orderIds: pendingPaidOrders.map(o => o.id),
          actionType: 'ACCESS'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(data.message);
        fetchStatus();
        if (onOrderUpdated) onOrderUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Disparo em lote de cobrança para pedidos pendentes
  const handleBatchDispatchRecovery = async () => {
    const pendingOrders = orders.filter(o => o.status === 'PENDING');

    if (pendingOrders.length === 0) {
      setStatusMessage('Nenhum pedido pendente para envio de lembrete Pix.');
      return;
    }

    if (!window.confirm(`Deseja enfileirar lembretes de Pix para ${pendingOrders.length} alunos? O sistema enviará respeitando o limite seguro de 38 msgs/minuto.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/whatsapp/batch-dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          orderIds: pendingOrders.map(o => o.id),
          actionType: 'RECOVERY'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(data.message);
        fetchStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Teste de Carga de UX: Simula 10 mensagens na fila para visualizar a cadência de 38/min
  const handleSimulateLoadTest = async () => {
    setActionLoading(true);
    try {
      for (let i = 1; i <= 6; i++) {
        await fetch('/api/admin/whatsapp/enqueue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            recipientPhone: `(41) 99788-44${20 + i}`,
            recipientName: `Condutor Demonstração #${i}`,
            courseTitle: 'Formação Transporte de Emergência',
            type: 'HOMOLOGATION_UPDATE',
            messageText: `*Teste de Cadência Anti-Bloqueio Meta #${i}*\nMensagem enviada respeitando o intervalo mínimo de 1.6s e o teto máximo de 38 msgs/minuto.`,
            priority: 'NORMAL'
          })
        });
      }
      setStatusMessage('6 mensagens de teste foram enfileiradas. Observe a vazão controlada de 1.6s por mensagem!');
      fetchStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Cálculo da porcentagem de uso do teto seguro (0 a 38)
  const safePercentage = Math.min(100, Math.round((stats.sentLastMinute / stats.maxPerMinute) * 100));
  
  // Cores dinâmicas baseadas na aproximação do limite
  let barColor = 'bg-emerald-500';
  let badgeText = 'Vazão Segura (Longe do Limite)';
  let badgeStyle = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';

  if (stats.sentLastMinute >= 36) {
    barColor = 'bg-amber-500';
    badgeText = 'Amortecedor Ativo (Segurando Fila)';
    badgeStyle = 'bg-amber-950/60 text-amber-400 border-amber-800/60';
  } else if (stats.sentLastMinute >= 25) {
    barColor = 'bg-blue-500';
    badgeText = 'Carga Moderada';
    badgeStyle = 'bg-blue-950/60 text-blue-400 border-blue-800/60';
  }

  return (
    <div id="admin-whatsapp-monitor" className="space-y-6">
      {/* Banner Principal de Proteção Meta */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Disparador WhatsApp com Proteção Anti-Bloqueio Meta
                  </h2>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                    {stats.isPaused ? 'Fila Pausada' : badgeText}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Vazão máxima controlada: <strong className="text-emerald-400 font-mono">38 mensagens/minuto</strong> (Margem de segurança para o teto de 40 da Meta). Intervalo mínimo de <strong className="text-zinc-100 font-mono">1.600ms</strong> entre disparos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="refresh-whatsapp-queue-btn"
              onClick={() => { setLoading(true); fetchStatus().finally(() => setLoading(false)); }}
              disabled={loading}
              className="flex items-center gap-1.5 bg-zinc-800/90 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 px-3.5 py-2.5 rounded-xl border border-zinc-700 transition-colors shadow-sm"
              title="Atualizar status da fila agora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>

            <button
              id="toggle-whatsapp-pause-btn"
              onClick={handleTogglePause}
              disabled={actionLoading}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl border transition-colors shadow-sm ${
                stats.isPaused 
                  ? 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border-emerald-700' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border-zinc-700'
              }`}
            >
              {stats.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{stats.isPaused ? 'Retomar Fila' : 'Pausar Fila'}</span>
            </button>

            <button
              id="clear-whatsapp-queue-btn"
              onClick={handleClearQueue}
              disabled={actionLoading || queue.length === 0}
              className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-xs font-semibold text-red-300 px-3.5 py-2.5 rounded-xl border border-red-800/50 transition-colors disabled:opacity-40"
              title="Limpar mensagens não enviadas"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Fila</span>
            </button>
          </div>
        </div>

        {/* Notificação / Toast de feedback */}
        {statusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-zinc-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button 
              onClick={() => setStatusMessage(null)}
              className="text-zinc-500 hover:text-zinc-300 text-xs font-bold px-2 py-0.5"
            >
              Fechar
            </button>
          </div>
        )}
      </div>

      {/* Grid de Métricas de Vazão e Engenharia de Fila */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Métrica 1: Vazão Último Minuto vs Teto Meta */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Vazão no Último Minuto</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-white font-mono">
                {stats.sentLastMinute}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                / {stats.maxPerMinute} msgs
              </span>
            </div>
            {/* Barra de Progresso do Minuto */}
            <div className="w-full bg-zinc-950 rounded-full h-2 mt-2 overflow-hidden border border-zinc-800">
              <div 
                className={`h-full transition-all duration-500 ${barColor}`} 
                style={{ width: `${safePercentage}%` }} 
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Teto Meta: 40/min</span>
            <span className="text-emerald-400 font-semibold">Margem: -2 segura</span>
          </div>
        </div>

        {/* Métrica 2: Mensagens Aguardando na Fila */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Fila de Espera Atual</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-amber-300 font-mono">
                {stats.queuedCount}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {stats.queuedCount === 1 ? 'mensagem' : 'mensagens'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              {stats.queuedCount > 0 
                ? `Tempo estimado: ~${stats.estimatedDrainTimeSeconds}s para entrega`
                : 'Fila zerada. Pronto para receber novas mensagens.'}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Status:</span>
            <span className={`font-semibold ${stats.isPaused ? 'text-amber-400' : 'text-emerald-400'}`}>
              {stats.isPaused ? 'Pausado' : stats.queuedCount > 0 ? 'Descarregando' : 'Aguardando'}
            </span>
          </div>
        </div>

        {/* Métrica 3: Cadenciamento Entre Disparos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Cadência Entre Envios</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-purple-300 font-mono">
                1.600
              </span>
              <span className="text-xs text-zinc-400 font-mono">ms (1.6s)</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Espaçamento individual anti-rajada. Impede que a Meta classifique disparos como spam.
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Filtro de Picos:</span>
            <span className="text-purple-400 font-semibold">Leaky Bucket</span>
          </div>
        </div>

        {/* Métrica 4: Total de Envios com Sucesso */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Histórico de Envios</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-white font-mono">
                {stats.totalSent}
              </span>
              <span className="text-xs text-zinc-400">enviadas</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              {stats.totalFailed > 0 ? `${stats.totalFailed} falhas registradas` : '100% de taxa de sucesso'}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Último envio:</span>
            <span className="text-zinc-300 font-mono text-[10px]">
              {stats.lastDispatchedAt ? new Date(stats.lastDispatchedAt).toLocaleTimeString('pt-BR') : 'Nenhum'}
            </span>
          </div>
        </div>
      </div>

      {/* Caixa de Ações em Lote e Simulação de Carga */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Ações Rápidas de Disparo Cadenciado (Máx 38 msgs/min)</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              O sistema enfileira as mensagens com prioridade alta e garante que nenhuma chamada exceda a política de vazão da Meta.
            </p>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono">
            {orders.length} pedidos na base
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Botão 1: Liberar Acessos Pendentes */}
          <button
            id="batch-send-access-btn"
            onClick={handleBatchDispatchAccess}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Disparar Acessos Pagos Pendentes</span>
          </button>

          {/* Botão 2: Cobrança Pix Pendentes */}
          <button
            id="batch-send-recovery-btn"
            onClick={handleBatchDispatchRecovery}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold py-3 px-4 rounded-xl border border-zinc-700 shadow-md transition-all disabled:opacity-50"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Disparar Lembrete Pix (Pendentes)</span>
          </button>

          {/* Botão 3: Teste de Carga da UX */}
          <button
            id="simulate-load-test-btn"
            onClick={handleSimulateLoadTest}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 text-xs font-bold py-3 px-4 rounded-xl border border-purple-800/60 shadow-md transition-all disabled:opacity-50"
            title="Adiciona 6 mensagens simuladas para demonstrar o espaçamento visual de 1.6s"
          >
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Simular Carga de Teste (6 msgs)</span>
          </button>
        </div>
      </div>

      {/* Duas Colunas: Fila Atual em Andamento & Histórico de Disparos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Mensagens na Fila */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Fila de Espera ({queue.length})
              </h4>
            </div>
            <span className="text-[11px] text-zinc-400">
              Cadência: 1 a cada 1.6s
            </span>
          </div>

          <div className="p-3 divide-y divide-zinc-800/60 flex-1 max-h-96 overflow-y-auto">
            {queue.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Nenhuma mensagem na fila de espera no momento. Todos os disparos foram entregues.
              </div>
            ) : (
              queue.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="py-2.5 px-2 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => setSelectedMessage(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 font-bold">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white">{item.recipientName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">{item.recipientPhone}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                    <span className="truncate max-w-[200px]">{item.courseTitle || item.type}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{item.priority}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Histórico Recente de Disparos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Últimos Disparos Concluídos ({history.length})
              </h4>
            </div>
            <span className="text-[11px] text-zinc-400">
              Registros com confirmação
            </span>
          </div>

          <div className="p-3 divide-y divide-zinc-800/60 flex-1 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Nenhum disparo registrado nesta sessão.
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  className="py-2.5 px-2 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => setSelectedMessage(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-white">{item.recipientName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {item.sentAt ? new Date(item.sentAt).toLocaleTimeString('pt-BR') : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                    <span className="truncate max-w-[220px] text-zinc-300">
                      {item.courseTitle || item.type}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Visualizador da Mensagem Formatada de WhatsApp */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Detalhes do Envio WhatsApp
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 block">Destinatário:</span>
                <span className="text-white font-semibold">{selectedMessage.recipientName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">WhatsApp:</span>
                <span className="text-emerald-400 font-mono font-semibold">{selectedMessage.recipientPhone}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Tipo:</span>
                <span className="text-zinc-300 font-mono">{selectedMessage.type}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Status:</span>
                <span className="text-emerald-400 font-bold">{selectedMessage.status}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-zinc-400 block mb-1">
                Conteúdo da Mensagem Entregue:
              </span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {selectedMessage.messageText}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMessage(null)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
