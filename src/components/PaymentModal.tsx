import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { 
  X, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Check,
  CreditCard,
  Share2,
  Lock,
  ChevronRight
} from 'lucide-react';

interface PaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSimulateWebhookPayment: (txid: string) => void;
  onRetryPayment?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onSimulateWebhookPayment,
  onRetryPayment,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [isPolling, setIsPolling] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'pix' | 'card'>('pix');

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  // Polling automático a cada 3 segundos para acompanhar o webhook em tempo real
  useEffect(() => {
    if (!isOpen || currentOrder.status === 'PAID') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pix/status/${currentOrder.txid}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setCurrentOrder(data.order);
            if (data.order.status === 'PAID') {
              setIsPolling(false);
            }
          }
        }
      } catch (err) {
        console.error('Erro no polling de status:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, currentOrder.txid, currentOrder.status]);

  if (!isOpen) return null;

  const orderRecoveryUrl = `${window.location.origin}/?orderId=${currentOrder.id}`;

  const handleCopy = () => {
    if (currentOrder.pixCopiaECola) {
      navigator.clipboard.writeText(currentOrder.pixCopiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleCopyRecoveryLink = () => {
    navigator.clipboard.writeText(orderRecoveryUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSendToWhatsApp = () => {
    const cleanPhone = currentOrder.customerWhatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${currentOrder.customerName}! Aqui está o seu link de pagamento para o curso ${currentOrder.courseTitle}:\n${orderRecoveryUrl}\n\nVocê pode pagar via Pix ou Cartão em até 12x!`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await onSimulateWebhookPayment(currentOrder.txid);
      const res = await fetch(`/api/pix/status/${currentOrder.txid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setCurrentOrder(data.order);
        }
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleOpenCardCheckout = () => {
    if (currentOrder.checkoutUrl) {
      window.location.href = currentOrder.checkoutUrl;
    } else {
      alert('Link do Mercado Pago sendo gerado, aguarde um instante.');
    }
  };

  // Renderização de Badges de Status para Prevenção de Erros
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>PAGAMENTO CONFIRMADO</span>
          </div>
        );
      case 'PROCESSING':
        return (
          <div className="flex items-center gap-1.5 bg-amber-950/80 text-amber-400 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>EM PROCESSAMENTO</span>
          </div>
        );
      case 'UNCONFIRMED':
        return (
          <div className="flex items-center gap-1.5 bg-red-950/80 text-red-400 border border-red-500/40 px-3 py-1 rounded-full text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>NÃO CONFIRMADO</span>
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="flex items-center gap-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700 px-3 py-1 rounded-full text-xs font-bold">
            <Clock className="w-4 h-4" />
            <span>PIX EXPIRADO</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 bg-yellow-950/80 text-yellow-400 border border-yellow-500/40 px-3 py-1 rounded-full text-xs font-bold">
            <Clock className="w-4 h-4" />
            <span>AGUARDANDO PAGAMENTO</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div 
        id="payment-modal-card"
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-6"
      >
        {/* Header com Notificação de Recebimento de Dados */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                {currentOrder.status === 'PAID' ? 'Matrícula Concluída com Sucesso!' : 'Dados Pré-Cadastrados!'}
              </h2>
              <p className="text-xs text-zinc-400">
                {currentOrder.status === 'PAID' 
                  ? 'Aguarde o envio das suas credenciais de acesso.' 
                  : 'Escolha pagar por Pix ou Cartão para confirmar sua matrícula'}
              </p>
            </div>
          </div>

          <button
            id="close-payment-modal-btn"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Curso Selecionado */}
        <div className="p-4 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center gap-3.5">
          <img
            src={currentOrder.courseThumbnail}
            alt={currentOrder.courseTitle}
            className="w-16 h-16 rounded-md object-cover border border-zinc-800 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase font-bold text-red-500 tracking-wider">
              Curso Selecionado
            </div>
            <h3 className="text-sm font-bold text-white truncate">
              {currentOrder.courseTitle}
            </h3>
            <p className="text-xs text-emerald-400 truncate">
              {currentOrder.courseSubtitle}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Aluno: <strong className="text-zinc-200">{currentOrder.customerName}</strong></span>
              <span className="text-base font-extrabold text-white">
                {currentOrder.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status do Pagamento (Prevenção de Erros) */}
          <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">Status do Pedido:</div>
            {renderStatusBadge(currentOrder.status)}
          </div>

          {/* FLUXO 1: SE JÁ ESTIVER PAGO */}
          {currentOrder.status === 'PAID' ? (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-5 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">
                  Pagamento Confirmado!
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                  Identificamos o seu pagamento via {currentOrder.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : currentOrder.paymentMethod === 'DEBIT_CARD' ? 'Cartão de Débito' : 'Pix'}. Seus dados foram enviados para o sistema DETRAN/RENACH.
                </p>
              </div>

              {/* Box de Instruções de Envio Manual */}
              <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 text-left space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Próxima Etapa: Liberação do Acesso</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  O link exclusivo e suas credenciais de acesso ao ambiente EAD serão enviados manualmente para você por:
                </p>
                <div className="space-y-1.5 text-xs text-zinc-200">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp: <strong>{currentOrder.customerWhatsapp || 'Cadastrado'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>E-mail: <strong>{currentOrder.customerEmail}</strong></span>
                  </div>
                </div>
              </div>

              <button
                id="close-success-btn"
                onClick={onClose}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                Concluir e Voltar ao Catálogo
              </button>
            </div>
          ) : (
            /* FLUXO 2: AGUARDANDO PAGAMENTO (PIX OU CARTÃO) */
            <div className="space-y-4">
              {/* Abas de Opção: Pix vs Cartão de Crédito/Débito */}
              <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
                <button
                  id="tab-pix-btn"
                  onClick={() => setActiveTab('pix')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'pix'
                      ? 'bg-red-600 text-white shadow-md shadow-red-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Pix Imediato</span>
                </button>
                <button
                  id="tab-card-btn"
                  onClick={() => setActiveTab('card')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'card'
                      ? 'bg-red-600 text-white shadow-md shadow-red-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cartão (Até 12x)</span>
                </button>
              </div>

              {/* CONTEÚDO DA ABA PIX */}
              {activeTab === 'pix' && (
                <div className="space-y-4">
                  {/* QR Code Pix */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner max-w-[240px] mx-auto">
                    {currentOrder.qrCodeUrl ? (
                      <img
                        src={currentOrder.qrCodeUrl}
                        alt="QR Code Pix"
                        className="w-44 h-44 object-contain"
                      />
                    ) : (
                      <div className="w-44 h-44 flex flex-col items-center justify-center text-zinc-800 text-center p-2">
                        <QrCode className="w-16 h-16 mb-2 text-zinc-700 animate-pulse" />
                        <span className="text-xs font-semibold">Gerando QR Code Pix...</span>
                      </div>
                    )}
                    <span className="text-[11px] font-bold text-zinc-800 mt-1">Escaneie no app do seu Banco</span>
                  </div>

                  {/* Copia e Cola */}
                  {currentOrder.pixCopiaECola && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Código Pix Copia e Cola:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="input-copia-cola"
                          type="text"
                          readOnly
                          value={currentOrder.pixCopiaECola}
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 font-mono truncate focus:outline-none"
                        />
                        <button
                          id="copy-pix-btn"
                          onClick={handleCopy}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Simulação em ambiente de desenvolvimento */}
                  <button
                    id="simulate-webhook-btn"
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                    <span>
                      {isSimulating ? 'Processando Webhook...' : 'Simular Pagamento no App do Banco (Disparar Webhook)'}
                    </span>
                  </button>
                </div>
              )}

              {/* CONTEÚDO DA ABA CARTÃO DE CRÉDITO E DÉBITO */}
              {activeTab === 'card' && (
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Cartão de Crédito ou Débito</h4>
                      <p className="text-xs text-zinc-400">Pague em até 12x com aprovação instantânea pelo Mercado Pago.</p>
                    </div>
                  </div>

                  <div className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-800 text-xs space-y-2 text-zinc-300">
                    <div className="flex justify-between items-center text-white font-medium pb-2 border-b border-zinc-800">
                      <span>Bandeiras Aceitas:</span>
                      <span className="font-semibold text-zinc-300">Visa, Master, Elo, Hipercard, Amex</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Parcelamento:</span>
                      <strong className="text-emerald-400">Em até 12x</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cartão de Débito:</span>
                      <span className="text-zinc-400">Caixa Virtual, Nubank, Inter e outros</span>
                    </div>
                  </div>

                  <button
                    id="open-mercadopago-checkout-btn"
                    onClick={handleOpenCardCheckout}
                    className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-950 transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Ir para Pagamento Seguro com Cartão</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[10px] text-zinc-500">
                    Ambiente criptografado e seguro processado pela infraestrutura oficial do Mercado Pago.
                  </p>
                </div>
              )}

              {/* BOX DE RECUPERAÇÃO DE UX: SALVAR PEDIDO / 2ª VIA */}
              <div className="p-3.5 bg-gradient-to-r from-zinc-950 to-zinc-900 rounded-xl border border-zinc-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>Precisa fechar e pagar depois?</span>
                  </div>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
                    ID: {currentOrder.id}
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Não se preocupe! Sua pré-matrícula já está salva no banco. Você pode reabrir esta mesma tela de pagamento a qualquer momento pelo link da 2ª via:
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    id="copy-recovery-link-btn"
                    onClick={handleCopyRecoveryLink}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Copiar Link da 2ª Via</span>
                      </>
                    )}
                  </button>

                  <button
                    id="send-whatsapp-recovery-btn"
                    onClick={handleSendToWhatsApp}
                    className="flex-1 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enviar no meu WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
