import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  QrCode, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  Lock,
  Zap,
  CheckCircle,
  Building2,
  Wallet
} from 'lucide-react';
import { Course, Order, Enrollment, PaymentGateway } from '../types';

interface CourseCheckoutProps {
  course: Course;
  onPaymentSuccess: (order: Order, enrollment?: Enrollment) => void;
}

export const CourseCheckout: React.FC<CourseCheckoutProps> = ({ course, onPaymentSuccess }) => {
  const [formData, setFormData] = useState({
    name: 'Diogo dos Anjos',
    email: 'ddoanjos@gmail.com',
    cpf: '123.456.789-00'
  });

  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('INTER');
  const [loading, setLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Timer regressivo
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'PAID') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeOrder]);

  // Polling para checar se o Webhook atualizou o status para PAID
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'PAID') {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/pix/status/${activeOrder.txid}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order && data.order.status === 'PAID') {
            setActiveOrder(data.order);
            onPaymentSuccess(data.order, data.enrollment);
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        }
      } catch (err) {
        console.error('Erro ao consultar status:', err);
      }
    };

    pollingRef.current = setInterval(checkStatus, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeOrder, onPaymentSuccess]);

  const handleCreatePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/pix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          customerName: formData.name,
          customerEmail: formData.email,
          customerCpf: formData.cpf,
          gateway: selectedGateway
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao criar cobrança Pix');
      }

      setActiveOrder(data.order);
      setTimeLeft(900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    if (!activeOrder?.pixCopiaECola) return;
    navigator.clipboard.writeText(activeOrder.pixCopiaECola);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSimulatePayment = async () => {
    if (!activeOrder) return;
    setSimulatingPayment(true);
    try {
      const res = await fetch('/api/simulador/pagar-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid: activeOrder.txid })
      });
      const data = await res.json();
      if (data.order) {
        setActiveOrder(data.order);
        onPaymentSuccess(data.order, data.enrollment);
      }
    } catch (err) {
      console.error('Erro ao simular pagamento:', err);
    } finally {
      setSimulatingPayment(false);
    }
  };

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isMercadoPago = activeOrder ? activeOrder.gateway === 'MERCADO_PAGO' : selectedGateway === 'MERCADO_PAGO';

  return (
    <div id="course-checkout" className="max-w-4xl mx-auto space-y-6">
      {/* Detalhes do Produto */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full md:w-56 h-36 object-cover rounded-xl border border-slate-100 shrink-0"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isMercadoPago
                ? 'bg-sky-100 text-sky-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {isMercadoPago ? 'Checkout Pix Mercado Pago' : 'Checkout Pix Inter PJ'}
            </span>
            <span className="text-xs text-slate-500 font-medium">Liberação Automática via Webhook</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{course.title}</h2>
          <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-extrabold text-slate-900">
              R$ {course.price.toFixed(2).replace('.', ',')}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              selectedGateway === 'INTER' 
                ? 'text-emerald-700 bg-emerald-50' 
                : 'text-sky-700 bg-sky-50'
            }`}>
              {selectedGateway === 'INTER' ? '0% de Taxa Inter PJ' : 'Aprovação Imediata MP'}
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!activeOrder ? (
        /* Formulário de Identificação do Aluno & Seleção de Gateway */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Seletor de Gateway de Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Escolha o Gateway Pix para Processar:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opção Banco Inter PJ */}
              <button
                type="button"
                onClick={() => setSelectedGateway('INTER')}
                className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                  selectedGateway === 'INTER'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                      i
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Banco Inter PJ</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">Taxa Zero (0% de comissão)</div>
                    </div>
                  </div>
                  {selectedGateway === 'INTER' && (
                    <CheckCircle className="w-5 h-5 text-orange-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Ideal para empresas com conta PJ no Inter que querem economizar em taxas e usar certificados mTLS.
                </p>
              </button>

              {/* Opção Mercado Pago */}
              <button
                type="button"
                onClick={() => setSelectedGateway('MERCADO_PAGO')}
                className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                  selectedGateway === 'MERCADO_PAGO'
                    ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-200'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-sm">
                      MP
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Mercado Pago</div>
                      <div className="text-[11px] text-sky-700 font-semibold">Configuração Rápida (Token)</div>
                    </div>
                  </div>
                  {selectedGateway === 'MERCADO_PAGO' && (
                    <CheckCircle className="w-5 h-5 text-sky-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Ideal para quem quer começar na hora apenas colando um Access Token sem burocracia de certificados.
                </p>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <Lock className="w-5 h-5 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Dados para Emissão da Cobrança Pix</h3>
          </div>

          <form onSubmit={handleCreatePix} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome Completo do Aluno
              </label>
              <input
                type="text"
                id="customer-name-input"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none text-sm text-slate-800"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-mail (Para onde o curso será liberado)
                </label>
                <input
                  type="email"
                  id="customer-email-input"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none text-sm text-slate-800"
                  placeholder="aluno@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  CPF (Exigido pelo Banco Central no Pix)
                </label>
                <input
                  type="text"
                  id="customer-cpf-input"
                  required
                  value={formData.cpf}
                  onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none text-sm text-slate-800"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                id="generate-pix-btn"
                disabled={loading}
                className={`w-full text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 ${
                  selectedGateway === 'MERCADO_PAGO'
                    ? 'bg-sky-600 hover:bg-sky-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando Cobrança via {selectedGateway === 'MERCADO_PAGO' ? 'Mercado Pago' : 'Banco Inter'}...
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    Gerar Pix via {selectedGateway === 'MERCADO_PAGO' ? 'Mercado Pago' : 'Banco Inter PJ'} (R$ {course.price.toFixed(2).replace('.', ',')})
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {selectedGateway === 'MERCADO_PAGO' ? 'API Segura Mercado Pago' : 'Segurança mTLS Banco Inter'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-500" />
                Confirmação Automática por Webhook
              </span>
            </div>
          </form>
        </div>
      ) : (
        /* Tela com o QR Code Pix e Verificação ao Vivo */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {activeOrder.status === 'PAID' ? (
            /* Estado: PAGO */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Pagamento Confirmado pelo {activeOrder.gateway === 'MERCADO_PAGO' ? 'Mercado Pago' : 'Banco Inter'}!
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                O Webhook processou a notificação oficial de recebimento e o seu acesso ao curso já foi liberado no banco de dados.
              </p>
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-200 max-w-sm mx-auto font-mono">
                {activeOrder.gateway === 'MERCADO_PAGO' ? 'Mercado Pago ID' : 'EndToEndId'}: {activeOrder.mercadoPagoPaymentId || activeOrder.endToEndId || 'CONFIRMADO'}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onPaymentSuccess(activeOrder)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl shadow transition text-sm inline-flex items-center gap-2"
                >
                  Entrar na Área do Aluno Agora
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Estado: AGUARDANDO PAGAMENTO */
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                    <span className="text-sm font-bold text-slate-900">
                      Aguardando Pagamento Pix ({activeOrder.gateway === 'MERCADO_PAGO' ? 'Mercado Pago' : 'Banco Inter PJ'})
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    O status será atualizado automaticamente em tempo real via Webhook
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  Expira em: {formatMinutes(timeLeft)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* QR Code */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  {activeOrder.qrCodeUrl ? (
                    <img
                      src={activeOrder.qrCodeUrl}
                      alt="QR Code Pix"
                      className="w-56 h-56 rounded-xl border border-white shadow-sm bg-white p-2"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center bg-slate-100 rounded-xl">
                      <QrCode className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-2 text-center">
                    Abra o app do seu banco e escolha <strong>"Pagar com Pix" &gt; "Ler QR Code"</strong>
                  </div>
                </div>

                {/* Código Copia e Cola & Simulação */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pix Copia e Cola (BRCode):
                    </label>
                    <div className="relative">
                      <textarea
                        readOnly
                        rows={3}
                        value={activeOrder.pixCopiaECola}
                        className="w-full p-3 bg-slate-100 rounded-xl text-xs font-mono text-slate-700 border border-slate-200 focus:outline-none resize-none"
                      />
                      <button
                        onClick={copyPixCode}
                        id="copy-pix-string-btn"
                        className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition"
                      >
                        {copiedPix ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copiedPix ? 'Código Pix Copiado!' : 'Copiar Código Pix'}
                      </button>
                    </div>
                  </div>

                  {/* CAIXA DE SIMULAÇÃO INSTANTÂNEA */}
                  <div className={`p-4 rounded-xl space-y-2 border ${
                    activeOrder.gateway === 'MERCADO_PAGO'
                      ? 'bg-sky-50 border-sky-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Sparkles className={`w-4 h-4 ${activeOrder.gateway === 'MERCADO_PAGO' ? 'text-sky-600' : 'text-orange-600'}`} />
                      Testando o fluxo agora?
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Clique no botão abaixo para simular que o cliente pagou o Pix. Isso dispara o Webhook do {activeOrder.gateway === 'MERCADO_PAGO' ? 'Mercado Pago' : 'Banco Inter'} e libera o curso imediatamente:
                    </p>
                    <button
                      onClick={handleSimulatePayment}
                      id="simulate-payment-btn"
                      disabled={simulatingPayment}
                      className={`w-full text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50 ${
                        activeOrder.gateway === 'MERCADO_PAGO'
                          ? 'bg-sky-600 hover:bg-sky-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                      }`}
                    >
                      {simulatingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processando Webhook...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Simular Pagamento no App (Disparar Webhook)
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {activeOrder.gateway === 'MERCADO_PAGO' ? 'MP Payment' : 'TxID'}: {activeOrder.txid.slice(0, 16)}...
                    </span>
                    <button
                      onClick={() => setActiveOrder(null)}
                      className="text-slate-500 hover:text-slate-800 underline"
                    >
                      Trocar dados / gateway
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
