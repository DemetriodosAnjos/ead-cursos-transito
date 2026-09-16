import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  PlayCircle, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ExternalLink,
  Search,
  Award,
  Clock,
  Sparkles
} from 'lucide-react';
import { Enrollment } from '../types';

interface CourseMembersAreaProps {
  initialEmail?: string;
  onGoToCheckout?: () => void;
}

export const CourseMembersArea: React.FC<CourseMembersAreaProps> = ({ 
  initialEmail = 'ddoanjos@gmail.com',
  onGoToCheckout
}) => {
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  const fetchEnrollments = async (email: string) => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/student/access?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data.enrollments || []);
        if (data.enrollments?.length > 0 && data.enrollments[0].modules?.length > 0) {
          setActiveLesson(data.enrollments[0].modules[0]);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar matrículas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments(initialEmail);
  }, [initialEmail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEnrollments(emailInput);
  };

  return (
    <div id="members-area" className="max-w-5xl mx-auto space-y-8">
      {/* Busca por e-mail */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Portal do Aluno - Cursos Liberados</h2>
            <p className="text-xs text-slate-500">
              O acesso é liberado instantaneamente quando o Webhook do Inter confirma o Pix
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="email"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            placeholder="Digite o e-mail cadastrado"
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none w-full sm:w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shrink-0 transition"
          >
            Consultar
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          Carregando matrículas vinculadas...
        </div>
      ) : enrollments.length === 0 ? (
        /* Sem matrículas encontradas */
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Nenhum curso liberado para "{emailInput}"
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Assim que você realizar a compra com Pix na aba de checkout e o Banco Inter confirmar o recebimento via Webhook, seu curso aparecerá automaticamente aqui.
          </p>
          {onGoToCheckout && (
            <button
              onClick={onGoToCheckout}
              className="mt-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-2"
            >
              Ir para o Checkout e Gerar Pix
            </button>
          )}
        </div>
      ) : (
        /* Cursos Liberados */
        <div className="space-y-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Cabeçalho do Curso Liberado */}
              <div className="bg-slate-900 text-white p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> Acesso Ativo &amp; Liberado
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {enrollment.orderId}</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-white">{enrollment.courseTitle}</h3>
                  <div className="text-xs text-slate-400">
                    Matriculado: <strong>{enrollment.customerName}</strong> ({enrollment.customerEmail}) em {new Date(enrollment.unlockedAt).toLocaleDateString('pt-BR')} às {new Date(enrollment.unlockedAt).toLocaleTimeString('pt-BR')}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-xs">
                  <Award className="w-4 h-4 text-orange-400" />
                  <span>Certificado Incluído</span>
                </div>
              </div>

              {/* Conteúdo e Módulos */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-2 border-r border-slate-100 pr-0 md:pr-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Módulos Desbloqueados:
                  </h4>
                  {enrollment.modules.map((moduleName, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveLesson(moduleName)}
                      className={`w-full text-left p-3 rounded-xl text-xs transition flex items-start gap-2.5 ${
                        activeLesson === moduleName
                          ? 'bg-orange-50 text-orange-950 font-semibold border border-orange-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <PlayCircle className={`w-4 h-4 shrink-0 mt-0.5 ${activeLesson === moduleName ? 'text-orange-600' : 'text-slate-400'}`} />
                      <span className="leading-snug">{moduleName}</span>
                    </button>
                  ))}
                </div>

                {/* Player / Conteúdo da Aula Selecionada */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-slate-950 rounded-xl p-8 text-center text-white flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden border border-slate-800">
                    <div className="w-14 h-14 rounded-full bg-orange-600/90 text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition">
                      <PlayCircle className="w-8 h-8 ml-0.5" />
                    </div>
                    <div className="mt-4 font-semibold text-sm max-w-md">
                      {activeLesson || 'Selecione uma aula para assistir'}
                    </div>
                    <span className="text-xs text-slate-400 mt-1">
                      Acesso liberado pelo Webhook oficial do Inter
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Status no Banco de Dados: Pedido marcado como PAGO automaticamente
                    </span>
                    <span className="font-mono text-emerald-800">STATUS: CONCLUIDA</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
