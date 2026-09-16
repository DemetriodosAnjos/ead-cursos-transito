import React, { useState, useEffect } from 'react';
import { Course, CNH_CATEGORIES, CnhCategoryType, StudentRegistration, Order } from '../types';
import { X, ShieldCheck, User, Mail, Phone, Calendar, CreditCard, Award, ArrowRight, UserCheck, AlertCircle, Sparkles } from 'lucide-react';

interface RegistrationModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentRegistration) => void;
  onContinueExistingOrder?: (order: Order) => void;
  isLoading?: boolean;
  initialCpf?: string;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  course,
  isOpen,
  onClose,
  onSubmit,
  onContinueExistingOrder,
  isLoading = false,
  initialCpf = '',
}) => {
  const [formData, setFormData] = useState<StudentRegistration>({
    fullName: '',
    cpf: initialCpf || '',
    whatsapp: '',
    email: '',
    birthDate: '',
    cnhNumber: '',
    cnhCategory: 'B',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [checkingCpf, setCheckingCpf] = useState(false);
  const [userAlreadyRegistered, setUserAlreadyRegistered] = useState(false);
  const [registeredStudentName, setRegisteredStudentName] = useState<string | null>(null);
  const [existingCourseOrder, setExistingCourseOrder] = useState<Order | null>(null);

  // Reset or initialize states when modal opens
  useEffect(() => {
    if (isOpen) {
      setUserAlreadyRegistered(false);
      setRegisteredStudentName(null);
      setExistingCourseOrder(null);
      setErrors({});

      const cpfToUse = initialCpf || localStorage.getItem('ead_student_cpf') || '';
      if (cpfToUse) {
        const clean = cpfToUse.replace(/\D/g, '');
        if (clean.length === 11) {
          setFormData(prev => ({ ...prev, cpf: formatCPF(clean) }));
          checkExistingStudent(clean);
        }
      }
    }
  }, [isOpen, initialCpf]);

  if (!isOpen) return null;

  // Formatação automática de CPF
  const formatCPF = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 11);
    return raw
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Formatação automática de WhatsApp (DD) 9XXXX-XXXX
  const formatPhone = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 10) {
      return raw.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return raw.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  // Formatação de CNH (somente números, max 11 dígitos)
  const formatCNH = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };

  // Checagem assíncrona de CPF no Supabase / Backend
  const checkExistingStudent = async (cleanCpf: string) => {
    if (cleanCpf.length !== 11) return;
    setCheckingCpf(true);
    try {
      const res = await fetch(`/api/students/check?cpf=${cleanCpf}&courseId=${encodeURIComponent(course.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.isRegistered && data.student) {
          setUserAlreadyRegistered(true);
          setRegisteredStudentName(data.student.fullName || data.student.name || 'Aluno');

          // Auto-preenche os dados cadastrados para conveniência e evita duplicidade de dados
          setFormData(prev => ({
            ...prev,
            fullName: data.student.fullName || prev.fullName,
            email: data.student.email || prev.email,
            whatsapp: data.student.whatsapp ? formatPhone(data.student.whatsapp) : prev.whatsapp,
            birthDate: data.student.birthDate ? data.student.birthDate.split('T')[0] : prev.birthDate,
            cnhNumber: data.student.cnhNumber || prev.cnhNumber,
            cnhCategory: (data.student.cnhCategory as CnhCategoryType) || prev.cnhCategory,
          }));
        } else {
          setUserAlreadyRegistered(false);
          setRegisteredStudentName(null);
        }

        if (data.existingCourseOrder) {
          setExistingCourseOrder(data.existingCourseOrder);
        } else {
          setExistingCourseOrder(null);
        }
      }
    } catch (err) {
      console.warn('Erro ao checar cadastro do aluno:', err);
    } finally {
      setCheckingCpf(false);
    }
  };

  const handleChange = (field: keyof StudentRegistration, value: string) => {
    let formattedValue = value;
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
      const clean = formattedValue.replace(/\D/g, '');
      if (clean.length === 11) {
        checkExistingStudent(clean);
      } else {
        setUserAlreadyRegistered(false);
        setRegisteredStudentName(null);
        setExistingCourseOrder(null);
      }
    }
    if (field === 'whatsapp') formattedValue = formatPhone(value);
    if (field === 'cnhNumber') formattedValue = formatCNH(value);

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim() || formData.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Informe seu nome completo (nome e sobrenome).';
    }

    const cleanCpf = formData.cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      newErrors.cpf = 'CPF inválido (deve conter 11 dígitos).';
    }

    const cleanPhone = formData.whatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      newErrors.whatsapp = 'Informe um WhatsApp válido com DDD.';
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Informe um e-mail válido.';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória.';
    }

    if (!formData.cnhNumber || formData.cnhNumber.length < 9) {
      newErrors.cnhNumber = 'Informe o número do registro da CNH (9 a 11 dígitos).';
    }

    if (!formData.cnhCategory) {
      newErrors.cnhCategory = 'Selecione a categoria da sua CNH.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingCourseOrder) {
      if (onContinueExistingOrder) {
        onContinueExistingOrder(existingCourseOrder);
        onClose();
        return;
      }
    }
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        id="registration-modal-card"
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-6 transition-all"
      >
        {/* Header do Modal com Imagem Resumida do Curso */}
        <div className="relative bg-zinc-950 p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded object-cover border border-zinc-800 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                Formulário de Matrícula Oficial
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                {course.title}
              </h2>
              <div className="mt-0.5 text-xs text-emerald-400 font-medium">
                {course.subtitle} • {course.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
          </div>

          <button
            id="close-registration-modal-btn"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Supabase */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Alerta de Usuário Já Cadastrado */}
          {userAlreadyRegistered && (
            <div 
              id="user-already-registered-alert"
              className="bg-emerald-950/60 border border-emerald-500/50 rounded-lg p-3 text-xs text-emerald-200 flex items-start gap-2.5 animate-fadeIn shadow-inner"
            >
              <UserCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5 flex-wrap">
                  <span>Usuário cadastrado: Bem-vindo de volta, {registeredStudentName}!</span>
                  <span className="text-[10px] bg-emerald-800/80 text-white font-mono px-1.5 py-0.2 rounded">
                    Perfil Localizado
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 leading-relaxed">
                  Seus dados (WhatsApp, e-mail e CNH) foram preenchidos automaticamente para você não precisar digitar tudo de novo. Um novo pedido será gerado de forma independente para este curso.
                </p>
              </div>
            </div>
          )}

          {/* Alerta de Matrícula Existente para este Curso */}
          {existingCourseOrder && (
            <div 
              id="course-duplicate-alert"
              className={`rounded-lg p-3 text-xs border flex items-start gap-2.5 ${
                existingCourseOrder.status === 'PAID'
                  ? 'bg-blue-950/70 border-blue-500/50 text-blue-200'
                  : 'bg-amber-950/70 border-amber-500/50 text-amber-200'
              }`}
            >
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                existingCourseOrder.status === 'PAID' ? 'text-blue-400' : 'text-amber-400'
              }`} />
              <div className="space-y-1.5">
                <div className="font-bold text-sm">
                  {existingCourseOrder.status === 'PAID'
                    ? 'Você já possui este curso ativo e confirmado!'
                    : 'Pedido existente encontrado para este curso!'}
                </div>
                <p className="text-[11px] leading-relaxed">
                  {existingCourseOrder.status === 'PAID'
                    ? `Seu pagamento para "${existingCourseOrder.courseTitle}" já foi aprovado e o acesso liberado.`
                    : `Já existe um pedido aberto (${existingCourseOrder.id}) com valor de ${existingCourseOrder.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`}
                </p>
                {onContinueExistingOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      onContinueExistingOrder(existingCourseOrder);
                      onClose();
                    }}
                    className={`mt-1 font-bold text-xs px-3 py-1.5 rounded transition-all flex items-center gap-1.5 shadow ${
                      existingCourseOrder.status === 'PAID'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    <span>{existingCourseOrder.status === 'PAID' ? 'Ver Acesso / Comprovante' : 'Ir Direto para Pagamento (2ª Via)'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Importante (Validação DETRAN):</span> Os dados abaixo serão utilizados para registro de matrícula no sistema homologado do Detran e inclusão na sua CNH Digital.
            </div>
          </div>

          {/* CPF e Data de Nascimento em duas colunas (CPF em primeiro lugar para verificação imediata) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  CPF <span className="text-red-500">*</span>
                </label>
                {checkingCpf && (
                  <span className="text-[10px] text-amber-400 animate-pulse">Verificando cadastro...</span>
                )}
              </div>
              <input
                id="input-cpf"
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                className={`w-full bg-zinc-950 border ${errors.cpf ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors`}
              />
              {errors.cpf && <p className="text-[11px] text-red-400 mt-1">{errors.cpf}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Data de Nascimento <span className="text-red-500">*</span>
              </label>
              <input
                id="input-birthdate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                className={`w-full bg-zinc-950 border ${errors.birthDate ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition-colors`}
              />
              {errors.birthDate && <p className="text-[11px] text-red-400 mt-1">{errors.birthDate}</p>}
            </div>
          </div>

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-fullname"
                type="text"
                placeholder="Ex: João Carlos da Silva"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={`w-full bg-zinc-950 border ${errors.fullName ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors`}
              />
            </div>
            {errors.fullName && <p className="text-[11px] text-red-400 mt-1">{errors.fullName}</p>}
          </div>

          {/* WhatsApp e E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                WhatsApp <span className="text-red-500">*</span> (Recebimento do Acesso)
              </label>
              <input
                id="input-whatsapp"
                type="text"
                placeholder="(41) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className={`w-full bg-zinc-950 border ${errors.whatsapp ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors`}
              />
              {errors.whatsapp && <p className="text-[11px] text-red-400 mt-1">{errors.whatsapp}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                E-mail para Envio da Nota e Acesso <span className="text-red-500">*</span>
              </label>
              <input
                id="input-email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full bg-zinc-950 border ${errors.email ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors`}
              />
              {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* CNH: Registro e Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                CNH nº do Registro <span className="text-red-500">*</span>
              </label>
              <input
                id="input-cnh-number"
                type="text"
                placeholder="Ex: 01234567890"
                value={formData.cnhNumber}
                onChange={(e) => handleChange('cnhNumber', e.target.value)}
                className={`w-full bg-zinc-950 border ${errors.cnhNumber ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors`}
              />
              {errors.cnhNumber && <p className="text-[11px] text-red-400 mt-1">{errors.cnhNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Categoria da CNH <span className="text-red-500">*</span>
              </label>
              <select
                id="select-cnh-category"
                value={formData.cnhCategory}
                onChange={(e) => handleChange('cnhCategory', e.target.value as CnhCategoryType)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
              >
                {CNH_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-900 text-white">
                    Categoria {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão Enviar */}
          <div className="pt-3 border-t border-zinc-800">
            {existingCourseOrder ? (
              <button
                id="continue-existing-order-btn"
                type="button"
                onClick={() => {
                  if (onContinueExistingOrder) {
                    onContinueExistingOrder(existingCourseOrder);
                    onClose();
                  }
                }}
                className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Ir para Tela de Pagamento do Pedido #{existingCourseOrder.id}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="submit-registration-btn"
                type="submit"
                disabled={isLoading || checkingCpf}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-zinc-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Gravando Pré-Matrícula...</span>
                ) : (
                  <>
                    <span>Enviar Dados e Ir para Pagamento</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
            <p className="text-center text-[11px] text-zinc-500 mt-2">
              Seus dados estão protegidos e serão sincronizados com o banco de dados.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
