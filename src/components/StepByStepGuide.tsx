import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Server, 
  Smartphone, 
  FileText,
  ArrowRight,
  Database,
  Lock,
  Building2,
  Wallet,
  Sparkles
} from 'lucide-react';
import { InterConfigStatus, MercadoPagoConfigStatus } from '../types';

interface StepByStepGuideProps {
  configStatus: InterConfigStatus | null;
  mercadoPagoConfig?: MercadoPagoConfigStatus | null;
}

export const StepByStepGuide: React.FC<StepByStepGuideProps> = ({ configStatus, mercadoPagoConfig }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [gatewayTab, setGatewayTab] = useState<'INTER' | 'MERCADO_PAGO'>('INTER');
  const [activeStep, setActiveStep] = useState<number>(1);

  const interWebhookUrl = configStatus?.webhookUrl || 'https://seu-dominio.com/api/webhooks/inter-pix';
  const mpWebhookUrl = mercadoPagoConfig?.webhookUrl || 'https://seu-dominio.com/api/webhooks/mercadopago';
  const currentWebhookUrl = gatewayTab === 'INTER' ? interWebhookUrl : mpWebhookUrl;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const interSteps = [
    {
      num: 1,
      title: 'Acessar o Internet Banking PJ do Inter',
      tag: 'No Computador',
      desc: 'Entre na sua conta PJ pelo navegador do computador (as configurações de API e certificados só ficam disponíveis na versão Web).'
    },
    {
      num: 2,
      title: 'Criar Aplicação Pix & Obter Credenciais',
      tag: 'Internet Banking',
      desc: 'Vá em Menu > Gestão de Cobranças > Pix ou "Aplicações / APIs" e clique em "Nova Aplicação".'
    },
    {
      num: 3,
      title: 'Selecionar os Escopos Corretos',
      tag: 'Permissões Obrigatórias',
      desc: 'Marque as permissões: pix.read, pix.write, webhook.read, webhook.write.'
    },
    {
      num: 4,
      title: 'Baixar Certificado mTLS (.crt e .key)',
      tag: 'Segurança Bancária',
      desc: 'O Inter utiliza Mutual TLS (mTLS). Baixe o certificado e chave privada no seu computador.'
    },
    {
      num: 5,
      title: 'Cadastrar a URL do Webhook',
      tag: 'Notificação Automática',
      desc: 'Configure o endpoint HTTPS onde o Inter enviará o aviso assim que o cliente pagar.'
    },
    {
      num: 6,
      title: 'Testar e Ativar a Liberação Automática',
      tag: 'Produção & Vendas',
      desc: 'Valide o fluxo de pagamento com o simulador antes de iniciar as vendas reais.'
    }
  ];

  const mpSteps = [
    {
      num: 1,
      title: 'Acessar o Mercado Pago Developers',
      tag: 'Painel Dev',
      desc: 'Acesse mercadopago.com.br/developers e faça login com sua conta do Mercado Pago ou Mercado Livre.'
    },
    {
      num: 2,
      title: 'Criar uma Nova Aplicação',
      tag: 'Suas Aplicações',
      desc: 'Clique em "Criar aplicação", dê o nome (ex: "Checkout Cursos Online") e selecione "Pagamentos online".'
    },
    {
      num: 3,
      title: 'Copiar o Access Token',
      tag: 'Credenciais',
      desc: 'No menu lateral "Credenciais de produção" (ou "Credenciais de teste"), copie seu Access Token (começa com APP_USR-... ou TEST-...).'
    },
    {
      num: 4,
      title: 'Cadastrar o Webhook no Mercado Pago',
      tag: 'Notificações Webhooks',
      desc: 'Vá em "Notificações Webhook", cole a URL do seu sistema e marque o evento "Pagamentos (payment)".'
    },
    {
      num: 5,
      title: 'Realizar Pagamento Teste e Vender',
      tag: 'Tudo Pronto',
      desc: 'Com o token preenchido, o QR Code é gerado diretamente pela API do Mercado Pago e confirmado via Webhook.'
    }
  ];

  const currentSteps = gatewayTab === 'INTER' ? interSteps : mpSteps;

  return (
    <div id="step-by-step-guide" className="max-w-5xl mx-auto space-y-8">
      {/* Header explicativo */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Integração Pix &amp; Webhooks Oficiais
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Guia de Integração: Banco Inter PJ &amp; Mercado Pago
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Você pode escolher qual gateway usar para receber seus pagamentos Pix com liberação automática de conteúdo no banco de dados.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-sm">
            <div className="text-xs text-slate-400 font-medium">Status no Sistema:</div>
            <div className="flex flex-col gap-1.5 mt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${configStatus?.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className="text-slate-300 font-medium">Inter PJ:</span>
                <span className="font-semibold text-white">
                  {configStatus?.isConfigured ? 'Produção mTLS' : 'Modo Simulador'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${mercadoPagoConfig?.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className="text-slate-300 font-medium">Mercado Pago:</span>
                <span className="font-semibold text-white">
                  {mercadoPagoConfig?.isConfigured ? `Ativo (${mercadoPagoConfig.environment})` : 'Modo Simulador'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela comparativa dos Gateways */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Comparativo Rápido: Qual escolher para o seu projeto?
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-orange-950/40 border border-orange-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-300 text-sm flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-orange-500 text-white flex items-center justify-center text-[10px] font-black">i</div>
                  Banco Inter PJ
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 text-[10px] font-bold">
                  0% Taxa de Pix
                </span>
              </div>
              <p className="text-slate-300">
                • <strong>Custo:</strong> Gratuito (você não paga nada por Pix recebido na conta PJ).
                <br />
                • <strong>Segurança:</strong> Certificado digital mTLS (.crt e .key ICP-Brasil).
                <br />
                • <strong>Requisito:</strong> Conta Pessoa Jurídica no Banco Inter.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-300 text-sm flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-sky-500 text-white flex items-center justify-center text-[10px] font-black">MP</div>
                  Mercado Pago
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-900 text-sky-300 text-[10px] font-bold">
                  Setup em 2 Minutos
                </span>
              </div>
              <p className="text-slate-300">
                • <strong>Custo:</strong> A partir de 0,99% por Pix.
                <br />
                • <strong>Segurança:</strong> Access Token OAuth Bearer simples.
                <br />
                • <strong>Vantagem:</strong> Funciona com conta PF ou PJ e não exige certificados mTLS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seletor de Guia (Inter PJ vs Mercado Pago) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl w-fit">
        <button
          onClick={() => {
            setGatewayTab('INTER');
            setActiveStep(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            gatewayTab === 'INTER'
              ? 'bg-white text-orange-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="w-4 h-4 rounded bg-orange-500 text-white flex items-center justify-center text-[9px] font-black">i</div>
          Passo a Passo: Banco Inter PJ
        </button>

        <button
          onClick={() => {
            setGatewayTab('MERCADO_PAGO');
            setActiveStep(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            gatewayTab === 'MERCADO_PAGO'
              ? 'bg-white text-sky-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="w-4 h-4 rounded bg-sky-500 text-white flex items-center justify-center text-[9px] font-black">MP</div>
          Passo a Passo: Mercado Pago
        </button>
      </div>

      {/* Tabs de navegação dos passos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {currentSteps.map((step) => (
          <button
            key={step.num}
            id={`step-tab-${step.num}`}
            onClick={() => setActiveStep(step.num)}
            className={`p-3 rounded-xl text-left border transition-all ${
              activeStep === step.num
                ? gatewayTab === 'INTER'
                  ? 'bg-orange-50 border-orange-500 text-orange-950 font-semibold shadow-sm'
                  : 'bg-sky-50 border-sky-500 text-sky-950 font-semibold shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
            }`}
          >
            <div className={`text-xs font-bold ${gatewayTab === 'INTER' ? 'text-orange-600' : 'text-sky-600'}`}>
              PASSO 0{step.num}
            </div>
            <div className="text-xs truncate font-medium mt-1">{step.title}</div>
          </button>
        ))}
      </div>

      {/* Detalhamento do passo selecionado */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {gatewayTab === 'INTER' ? (
          /* PASSOS BANCO INTER PJ */
          <>
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Acesse o Internet Banking PJ do Inter</h3>
                    <p className="text-sm text-slate-500">Procedimento no navegador web do computador</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 space-y-2">
                  <p>
                    1. Entre no site oficial do Banco Inter: <a href="https://www.bancointer.com.br" target="_blank" rel="noreferrer" className="text-orange-600 underline font-medium">bancointer.com.br</a>
                  </p>
                  <p>
                    2. Clique no canto superior em <strong>"Acessar Conta"</strong> e selecione <strong>Conta Digital PJ</strong>.
                  </p>
                  <p>
                    3. Faça login com seus dados e autorize pelo i-safe no aplicativo do celular.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-amber-900 text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Atenção:</strong> O gerenciamento de APIs, chaves mTLS e Webhooks não é feito pelo aplicativo móvel. Você precisa necessariamente acessar pelo navegador do computador.
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Localize o menu de APIs e crie uma Nova Aplicação</h3>
                    <p className="text-sm text-slate-500">Onde gerar suas chaves no painel do Inter</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 space-y-3">
                  <p className="font-semibold text-slate-900">Caminho no menu lateral do Inter:</p>
                  <div className="bg-white p-3 rounded-lg border border-slate-300 font-mono text-xs text-slate-800">
                    Menu Lateral &gt; Gestão de Cobranças &gt; Pix / Integrações &gt; Aplicações
                  </div>
                  <p>
                    <em>(Ou no menu lateral busque diretamente por <strong>"APIs"</strong> / <strong>"Integrações"</strong>)</em>
                  </p>
                  <p>
                    Clique no botão <strong>"+ Nova Aplicação"</strong>. Defina um nome identificador para ela, por exemplo: <code className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-mono">Checkout Cursos Online</code>.
                  </p>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Marque os Escopos Obrigatórios</h3>
                    <p className="text-sm text-slate-500">Permissões necessárias para criar cobranças e receber confirmação</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-emerald-200 bg-emerald-50/60 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      pix.read
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Permite consultar o status da cobrança Pix a qualquer momento para garantir a sincronização.
                    </p>
                  </div>

                  <div className="border border-emerald-200 bg-emerald-50/60 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      pix.write
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Permite gerar o QR Code dinâmico e o código Pix Copia e Cola individual para cada pedido de curso.
                    </p>
                  </div>

                  <div className="border border-emerald-200 bg-emerald-50/60 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      webhook.write
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Permite cadastrar a URL da sua aplicação no Banco Inter para receber avisos em tempo real.
                    </p>
                  </div>

                  <div className="border border-emerald-200 bg-emerald-50/60 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      webhook.read
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Permite verificar se o webhook está registrado e ativo na sua chave Pix.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Baixar o Certificado mTLS e Copiar Chaves</h3>
                    <p className="text-sm text-slate-500">Autenticação bancária de alta segurança</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  O Banco Inter exige autenticação <strong>Mutual TLS</strong>. Diferente de APIs simples que só usam token Bearer, qualquer chamada ao Inter exige um certificado digital fornecido por eles.
                </p>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono space-y-2">
                  <div className="text-slate-400"># Arquivos que você baixa na criação da aplicação:</div>
                  <div className="flex items-center justify-between text-sky-400">
                    <span>• Certificado Digital: Inter_API_Certificado.crt</span>
                    <span className="text-slate-500">Chave pública</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-400">
                    <span>• Chave Privada: Inter_API_Chave.key</span>
                    <span className="text-slate-500">Segredo criptográfico</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>• Client ID &amp; Client Secret</span>
                    <span className="text-slate-500">Gerados na tela</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Esses dados são colocados nas variáveis de ambiente (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">.env</code>) do seu backend.
                </p>
              </div>
            )}

            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
                    5
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Cadastre a URL do Webhook no Inter</h3>
                    <p className="text-sm text-slate-500">A mágica da confirmação e liberação automática</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  No painel do Banco Inter ou via chamada de API, cadastre a URL do seu webhook:
                </p>

                <div className="flex items-center gap-2 bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                  <span className="text-orange-400 font-bold">POST</span>
                  <span className="text-slate-300 flex-1 truncate">{interWebhookUrl}</span>
                  <button
                    id="copy-webhook-url-btn"
                    onClick={() => copyToClipboard(interWebhookUrl)}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs font-sans font-medium flex items-center gap-1.5 shrink-0 transition"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUrl ? 'Copiado!' : 'Copiar URL'}
                  </button>
                </div>

                <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 space-y-1 leading-relaxed">
                  <p className="font-semibold text-sky-950">Como o Inter confirma o pagamento:</p>
                  <p>
                    Assim que o cliente efetua o Pix no app do banco dele, o Inter envia um POST para essa URL com o <code className="font-mono bg-sky-100 px-1 rounded">txid</code> e o <code className="font-mono bg-sky-100 px-1 rounded">endToEndId</code>.
                  </p>
                  <p>
                    O endpoint <code className="font-mono bg-sky-100 px-1 rounded">/api/webhooks/inter-pix</code> já está pronto no backend para receber esse evento e liberar as aulas.
                  </p>
                </div>
              </div>
            )}

            {activeStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                    6
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Teste o Fluxo Completo Agora Mesmo</h3>
                    <p className="text-sm text-slate-500">Experimente como seu cliente e seu sistema vão se comportar</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  O backend deste app possui um <strong>emulador BACEN e simulador de Webhook</strong> fiel ao comportamento oficial do Inter.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-semibold text-slate-800 text-sm mb-1">1. Faça uma Compra Teste</div>
                    <p className="text-xs text-slate-500 mb-3">
                      Acesse a aba "Checkout do Curso", selecione Banco Inter e gere o Pix dinâmico.
                    </p>
                    <span className="text-xs font-semibold text-orange-600">Aba: Checkout do Curso →</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-semibold text-slate-800 text-sm mb-1">2. Veja a Liberação Instantânea</div>
                    <p className="text-xs text-slate-500 mb-3">
                      Clique no botão "Simular Pagamento no App" para disparar o Webhook e ver as aulas sendo liberadas.
                    </p>
                    <span className="text-xs font-semibold text-emerald-600">Aba: Área do Aluno &amp; Admin →</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* PASSOS MERCADO PAGO */
          <>
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Acesse o Portal de Desenvolvedores do Mercado Pago</h3>
                    <p className="text-sm text-slate-500">Área oficial para desenvolvedores e integrações</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 space-y-2">
                  <p>
                    1. Acesse o portal oficial: <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noreferrer" className="text-sky-600 underline font-medium">mercadopago.com.br/developers</a>
                  </p>
                  <p>
                    2. Faça login com sua conta Mercado Pago ou crie uma conta gratuita caso ainda não tenha.
                  </p>
                  <p>
                    3. No menu superior, clique em <strong>"Suas integrações"</strong> (Painel do Desenvolvedor).
                  </p>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Crie uma Nova Aplicação</h3>
                    <p className="text-sm text-slate-500">Identificação do seu sistema no Mercado Pago</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 space-y-3">
                  <p>
                    1. Clique no botão <strong>"Criar aplicação"</strong>.
                  </p>
                  <p>
                    2. Digite um nome (ex: <code className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono">Cursos Online Pix</code>).
                  </p>
                  <p>
                    3. No tipo de integração, escolha <strong>"Pagamentos online"</strong> e confirme.
                  </p>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Copie seu Access Token</h3>
                    <p className="text-sm text-slate-500">A chave de acesso necessária para chamar a API Pix</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  No menu lateral da sua aplicação, acesse <strong>"Credenciais de produção"</strong> (ou "Credenciais de teste" para simulações):
                </p>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono space-y-2">
                  <div className="text-slate-400"># Variável a ser configurada no seu arquivo .env:</div>
                  <div className="text-emerald-400">
                    MERCADO_PAGO_ACCESS_TOKEN="APP_USR-xxxxxxxxx-xxxxxx..."
                  </div>
                </div>

                <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900">
                  <strong>Simplicidade total:</strong> Diferente do mTLS, o Mercado Pago só exige esse token bearer no cabeçalho HTTP <code className="font-mono bg-sky-100 px-1 rounded">Authorization: Bearer seu_token</code>.
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Cadastre a URL do Webhook no Mercado Pago</h3>
                    <p className="text-sm text-slate-500">Notificação automática instantânea após o pagamento</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  No painel da sua aplicação, clique em <strong>"Notificações Webhook"</strong> e insira o endereço:
                </p>

                <div className="flex items-center gap-2 bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                  <span className="text-sky-400 font-bold">POST</span>
                  <span className="text-slate-300 flex-1 truncate">{mpWebhookUrl}</span>
                  <button
                    onClick={() => copyToClipboard(mpWebhookUrl)}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs font-sans font-medium flex items-center gap-1.5 shrink-0 transition"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUrl ? 'Copiado!' : 'Copiar URL'}
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  Marque o evento <strong>"Pagamentos (payment)"</strong>. O Mercado Pago enviará uma notificação assim que o Pix for aprovado.
                </div>
              </div>
            )}

            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                    5
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Teste o Fluxo no Simulador e Lance Vendas</h3>
                    <p className="text-sm text-slate-500">Totalmente integrado e operacional</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  Você pode alternar a qualquer momento entre Mercado Pago e Banco Inter no checkout deste app. Ao simular ou pagar de verdade, o webhook processa e o aluno recebe acesso na hora!
                </p>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    Tanto as ordens via <strong>Inter PJ</strong> quanto as via <strong>Mercado Pago</strong> são monitoradas no painel de administração com logs em tempo real!
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Botão de próximo passo */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
            disabled={activeStep === 1}
            className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <span className="text-xs text-slate-400 font-medium">
            Passo {activeStep} de {currentSteps.length}
          </span>
          <button
            onClick={() => setActiveStep(prev => Math.min(currentSteps.length, prev + 1))}
            disabled={activeStep === currentSteps.length}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Próximo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
