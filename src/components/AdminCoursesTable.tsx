import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  Layers, 
  DollarSign, 
  Percent, 
  X, 
  Edit3, 
  Trash2, 
  GraduationCap, 
  Tag, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { Course } from '../types';

interface AdminCoursesTableProps {
  courses: Course[];
  onCoursesUpdated: (newCourses: Course[]) => void;
  authToken?: string | null;
}

// Categorias oficiais solicitadas
export const ADMIN_CATEGORIES = [
  { id: 'all', label: 'Todos os Cursos', badgeColor: 'bg-zinc-800 text-zinc-300' },
  { id: 'especializados', label: 'Detran Formação', badgeColor: 'bg-red-950/70 text-red-400 border-red-800/60' },
  { id: 'atualizacao', label: 'Atualização & Reciclagem', badgeColor: 'bg-amber-950/70 text-amber-400 border-amber-800/60' },
  { id: 'saude', label: 'Saúde & APH', badgeColor: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60' },
  { id: 'tea', label: 'Jornada TEA', badgeColor: 'bg-indigo-950/70 text-indigo-400 border-indigo-800/60' },
  { id: 'nr', label: 'Normas NR', badgeColor: 'bg-blue-950/70 text-blue-400 border-blue-800/60' },
] as const;

export const AdminCoursesTable: React.FC<AdminCoursesTableProps> = ({
  courses,
  onCoursesUpdated,
  authToken
}) => {
  // Configurações visuais e de filtro
  const [divideByTabs, setDivideByTabs] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Controle de edição em lote de preços
  // armazena as strings digitadas temporariamente para cada id de curso
  const [editingRows, setEditingRows] = useState<{
    [courseId: string]: {
      costPrice: string;
      profitPercent: string;
      price: string;
      isDirty: boolean;
      saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
    };
  }>({});

  // Modais de Criação e Edição Completa
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);
  const [globalFeedback, setGlobalFeedback] = useState<string | null>(null);

  // Formulário de Novo Curso / Edição
  const [formData, setFormData] = useState<Partial<Course>>({
    id: '',
    title: '',
    subtitle: 'Reconhecido pelo Detran PR | 100% EAD',
    acronym: '',
    category: 'especializados',
    categoryLabel: 'Formação Especializada',
    description: '',
    fullDescription: '',
    costPrice: 60,
    profitPercent: 181.6,
    price: 169.00,
    duration: '50 horas',
    workloadHours: 50,
    detranApproval: 'Homologado CONTRAN / DETRAN PR',
    modality: '100% Online EAD com Reconhecimento Facial',
    thumbnail: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1600&q=80',
    badge: 'Mais Procurado',
    requirements: ['Maior de 21 anos', 'Habilitado na CNH compatível', 'Sem suspensão ativa'],
    modules: ['Legislação Aplicada', 'Direção Defensiva', 'Primeiros Socorros', 'Relacionamento Interpessoal'],
    isFeatured: false,
    isActive: true,
  });

  // Obter valor formatado da linha
  const getRowValues = (c: Course) => {
    const edit = editingRows[c.id];
    if (edit) {
      return {
        costPrice: edit.costPrice,
        profitPercent: edit.profitPercent,
        price: edit.price,
        isDirty: edit.isDirty,
        saveStatus: edit.saveStatus || 'idle'
      };
    }
    const cost = c.costPrice ?? (c.price <= 120 ? 50 : c.price <= 150 ? 65 : 70);
    const profit = c.profitPercent ?? (cost > 0 ? Number((((c.price - cost) / cost) * 100).toFixed(1)) : 100);
    return {
      costPrice: cost.toFixed(2),
      profitPercent: profit.toFixed(1),
      price: c.price.toFixed(2),
      isDirty: false,
      saveStatus: 'idle' as const
    };
  };

  // 1 & 2: Cálculo bidirecional quando o % de Lucro é digitado manualmente
  const handleProfitChange = (courseId: string, valueStr: string, currentCourse: Course) => {
    const currentValues = getRowValues(currentCourse);
    const cost = parseFloat(currentValues.costPrice.replace(',', '.')) || 0;
    const profit = parseFloat(valueStr.replace(',', '.')) || 0;

    // Calcula preço de venda sobre o preço de custo
    const newPrice = cost > 0 ? (cost * (1 + profit / 100)) : cost;

    setEditingRows(prev => ({
      ...prev,
      [courseId]: {
        costPrice: currentValues.costPrice,
        profitPercent: valueStr,
        price: newPrice.toFixed(2),
        isDirty: true,
        saveStatus: 'idle'
      }
    }));
  };

  // 1 & 3: Cálculo bidirecional quando o Preço de Venda é digitado manualmente
  const handlePriceChange = (courseId: string, valueStr: string, currentCourse: Course) => {
    const currentValues = getRowValues(currentCourse);
    const cost = parseFloat(currentValues.costPrice.replace(',', '.')) || 0;
    const salePrice = parseFloat(valueStr.replace(',', '.')) || 0;

    // Calcula percentual (%) de lucro sobre o preço de custo
    const newProfit = cost > 0 ? (((salePrice - cost) / cost) * 100) : 0;

    setEditingRows(prev => ({
      ...prev,
      [courseId]: {
        costPrice: currentValues.costPrice,
        profitPercent: newProfit.toFixed(1),
        price: valueStr,
        isDirty: true,
        saveStatus: 'idle'
      }
    }));
  };

  // Quando o Preço de Custo é digitado manualmente
  const handleCostChange = (courseId: string, valueStr: string, currentCourse: Course) => {
    const currentValues = getRowValues(currentCourse);
    const newCost = parseFloat(valueStr.replace(',', '.')) || 0;
    const profit = parseFloat(currentValues.profitPercent.replace(',', '.')) || 0;

    // Recalcula o preço de venda mantendo a margem de lucro
    const newPrice = newCost > 0 ? (newCost * (1 + profit / 100)) : newCost;

    setEditingRows(prev => ({
      ...prev,
      [courseId]: {
        costPrice: valueStr,
        profitPercent: currentValues.profitPercent,
        price: newPrice.toFixed(2),
        isDirty: true,
        saveStatus: 'idle'
      }
    }));
  };

  // 4: Salvar alteração de preço diretamente na plataforma e no servidor
  const handleSavePrice = async (courseId: string) => {
    const edit = editingRows[courseId];
    if (!edit) return;

    const costNum = parseFloat(edit.costPrice.replace(',', '.')) || 0;
    const profitNum = parseFloat(edit.profitPercent.replace(',', '.')) || 0;
    const priceNum = parseFloat(edit.price.replace(',', '.')) || 0;

    setEditingRows(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], saveStatus: 'saving' }
    }));

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          costPrice: costNum,
          profitPercent: profitNum,
          price: priceNum
        })
      });

      if (!res.ok) throw new Error('Erro ao salvar no servidor');

      const data = await res.json();
      const updatedCourse: Course = data.course;

      // Atualiza estado local da plataforma em App.tsx imediatamente
      const updatedList = courses.map(c => c.id === courseId ? updatedCourse : c);
      onCoursesUpdated(updatedList);

      setEditingRows(prev => ({
        ...prev,
        [courseId]: {
          costPrice: (updatedCourse.costPrice ?? costNum).toFixed(2),
          profitPercent: (updatedCourse.profitPercent ?? profitNum).toFixed(1),
          price: updatedCourse.price.toFixed(2),
          isDirty: false,
          saveStatus: 'saved'
        }
      }));

      setTimeout(() => {
        setEditingRows(prev => {
          if (!prev[courseId]) return prev;
          const copy = { ...prev };
          delete copy[courseId];
          return copy;
        });
      }, 2500);

      setGlobalFeedback(`Preço do curso atualizado na plataforma: R$ ${priceNum.toFixed(2)}`);
      setTimeout(() => setGlobalFeedback(null), 3500);
    } catch (err: any) {
      console.error('Erro ao atualizar preço:', err);
      setEditingRows(prev => ({
        ...prev,
        [courseId]: { ...prev[courseId], saveStatus: 'error' }
      }));
    }
  };

  // Salvar todas as linhas modificadas de uma vez
  const handleSaveAllDirty = async () => {
    const dirtyIds = Object.keys(editingRows).filter(id => editingRows[id]?.isDirty);
    if (dirtyIds.length === 0) return;

    setIsSavingAll(true);
    for (const id of dirtyIds) {
      await handleSavePrice(id);
    }
    setIsSavingAll(false);
  };

  // 5: Inativar / Ocultar o card do curso na plataforma
  const handleToggleActive = async (c: Course) => {
    const actionLabel = c.isActive === false ? 'ativar e exibir na vitrine' : 'inativar e ocultar da vitrine';
    if (!window.confirm(`Deseja ${actionLabel} o curso "${c.title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/courses/${c.id}/toggle-active`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('Erro ao alternar status do curso');

      const data = await res.json();
      const updatedList = courses.map(item => item.id === c.id ? { ...item, isActive: data.isActive } : item);
      onCoursesUpdated(updatedList);

      setGlobalFeedback(
        data.isActive 
          ? `O curso "${c.title}" agora está VISÍVEL na vitrine da plataforma!` 
          : `O curso "${c.title}" foi OCULTADO da vitrine da plataforma.`
      );
      setTimeout(() => setGlobalFeedback(null), 4000);
    } catch (err) {
      alert('Não foi possível alterar o status do curso no momento.');
    }
  };

  // Excluir curso
  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!window.confirm(`ATENÇÃO: Deseja realmente excluir o curso "${courseTitle}" do catálogo?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Erro ao excluir curso');

      const updatedList = courses.filter(item => item.id !== courseId);
      onCoursesUpdated(updatedList);
      setGlobalFeedback(`Curso "${courseTitle}" excluído com sucesso.`);
      setTimeout(() => setGlobalFeedback(null), 3500);
    } catch (err) {
      alert('Erro ao excluir o curso.');
    }
  };

  // 6: Submissão do Modal "+ Cadastrar Novo" ou "Editar"
  const handleSaveCourseModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      alert('Preencha ao menos o Título e a Categoria do curso.');
      return;
    }

    try {
      // Categorias labels automáticas
      const catConfig = ADMIN_CATEGORIES.find(cat => cat.id === formData.category);
      const categoryLabel = catConfig ? catConfig.label : (formData.categoryLabel || 'Curso');

      const payload: Course = {
        id: formData.id ? formData.id.trim() : '',
        title: formData.title.trim(),
        subtitle: formData.subtitle || 'Reconhecido pelo Detran PR | 100% EAD',
        acronym: formData.acronym || '',
        category: formData.category as any,
        categoryLabel: categoryLabel,
        description: formData.description || formData.title,
        fullDescription: formData.fullDescription || formData.description || formData.title,
        costPrice: Number(formData.costPrice) || 60,
        profitPercent: Number(formData.profitPercent) || 100,
        price: Number(formData.price) || 169,
        duration: formData.duration || '50 horas',
        workloadHours: Number(formData.workloadHours) || 50,
        detranApproval: formData.detranApproval || 'Homologado Resolução CONTRAN nº 789/20 e DETRAN PR',
        modality: formData.modality || '100% Online EAD',
        thumbnail: formData.thumbnail || 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=800&q=80',
        backdrop: formData.backdrop || 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1600&q=80',
        badge: formData.badge || '',
        requirements: Array.isArray(formData.requirements) ? formData.requirements : (formData.requirements as any || '').split('\n').filter(Boolean),
        modules: Array.isArray(formData.modules) ? formData.modules : (formData.modules as any || '').split('\n').filter(Boolean),
        isFeatured: Boolean(formData.isFeatured),
        isActive: formData.isActive !== false,
      };

      if (editingCourse) {
        // Atualizar curso existente
        const res = await fetch(`/api/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Falha ao atualizar curso');
        const data = await res.json();
        const updatedList = courses.map(c => c.id === editingCourse.id ? data.course : c);
        onCoursesUpdated(updatedList);
        setGlobalFeedback(`Curso "${payload.title}" atualizado com sucesso na plataforma!`);
      } else {
        // Criar novo curso
        const res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Falha ao cadastrar novo curso');
        const data = await res.json();
        onCoursesUpdated([data.course, ...courses]);
        setGlobalFeedback(`Novo curso "${payload.title}" cadastrado e adicionado ao catálogo!`);
      }

      setIsCreateModalOpen(false);
      setEditingCourse(null);
      setTimeout(() => setGlobalFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar o curso.');
    }
  };

  // Abrir modal para edição de um curso existente
  const handleOpenEditModal = (c: Course) => {
    setEditingCourse(c);
    setFormData({
      ...c,
      requirements: Array.isArray(c.requirements) ? c.requirements : [],
      modules: Array.isArray(c.modules) ? c.modules : []
    });
    setIsCreateModalOpen(true);
  };

  // Abrir modal para criar novo curso
  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      id: '',
      title: '',
      subtitle: 'Reconhecido pelo Detran PR | 100% EAD',
      acronym: '',
      category: 'especializados',
      categoryLabel: 'Detran Formação',
      description: '',
      fullDescription: '',
      costPrice: 60,
      profitPercent: 181.6,
      price: 169.00,
      duration: '50 horas',
      workloadHours: 50,
      detranApproval: 'Homologado Resolução CONTRAN nº 789/20 e DETRAN PR',
      modality: '100% Online EAD com Reconhecimento Facial',
      thumbnail: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=800&q=80',
      backdrop: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1600&q=80',
      badge: 'Mais Procurado',
      requirements: ['Maior de 21 anos', 'Habilitado em qualquer categoria CNH', 'Sem suspensão ativa'],
      modules: ['Legislação Aplicada', 'Direção Defensiva', 'Primeiros Socorros', 'Relacionamento Interpessoal'],
      isFeatured: false,
      isActive: true,
    });
    setIsCreateModalOpen(true);
  };

  // Filtragem dos cursos da tabela
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Filtro de aba quando ativado
      if (divideByTabs && activeTab !== 'all') {
        if (c.category !== activeTab) return false;
      }

      // Filtro de busca textual
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        c.title.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.acronym && c.acronym.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q) ||
        c.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [courses, divideByTabs, activeTab, searchQuery]);

  // Contadores por categoria para as abas
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = { all: courses.length };
    courses.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [courses]);

  // Indicadores de resumo
  const activeCount = courses.filter(c => c.isActive !== false).length;
  const inactiveCount = courses.length - activeCount;
  const avgPrice = courses.length > 0 ? (courses.reduce((acc, c) => acc + c.price, 0) / courses.length) : 0;
  const hasUnsavedChanges = Object.values(editingRows).some((r: any) => r?.isDirty);

  return (
    <div id="admin-courses-component" className="space-y-6">
      {/* Alerta de Feedback Global */}
      {globalFeedback && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg shadow-emerald-950/40 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{globalFeedback}</span>
          </div>
          <button 
            onClick={() => setGlobalFeedback(null)} 
            className="text-emerald-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cabeçalho de Controle e Precificação */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Gestão de Cursos e Precificação</span>
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                  {courses.length} Cursos
                </span>
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Altere custo, margem de lucro % ou preço de venda com recálculo automático instantâneo. 
              As alterações são propagadas imediatamente para a vitrine e checkout da plataforma.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {hasUnsavedChanges && (
              <button
                id="btn-save-all-courses"
                onClick={handleSaveAllDirty}
                disabled={isSavingAll}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-md shadow-emerald-950 transition-all animate-pulse"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingAll ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            )}

            {/* 6: Botão "+ Cadastrar Novo" */}
            <button
              id="btn-add-new-course"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-lg shadow-red-950/60 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Cadastrar Novo</span>
            </button>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800/80">
          <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-medium block">Total de Cursos</span>
            <span className="text-lg font-black text-white">{courses.length}</span>
          </div>
          <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
            <span className="text-[11px] text-emerald-400 font-medium block flex items-center gap-1">
              <Eye className="w-3 h-3" /> Ativos na Vitrine
            </span>
            <span className="text-lg font-black text-emerald-400">{activeCount}</span>
          </div>
          <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-medium block flex items-center gap-1">
              <EyeOff className="w-3 h-3 text-red-400" /> Ocultos / Inativos
            </span>
            <span className="text-lg font-black text-zinc-300">{inactiveCount}</span>
          </div>
          <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-medium block">Ticket Médio</span>
            <span className="text-lg font-black text-white">R$ {avgPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Barra de Ferramentas: Checkbox de Abas + Busca Rápida */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Requisito 6: Checkbox para dividir em abas */}
          <label 
            id="checkbox-divide-tabs-label"
            className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-200 select-none bg-zinc-950/80 px-3 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <input
              id="checkbox-divide-tabs"
              type="checkbox"
              checked={divideByTabs}
              onChange={(e) => setDivideByTabs(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 text-red-600 focus:ring-red-500 bg-zinc-900 cursor-pointer"
            />
            <Layers className="w-3.5 h-3.5 text-red-500" />
            <span>Dividir tabela por abas de categorias</span>
          </label>

          {/* Campo de Busca Rápida */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              id="search-course-admin-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar curso por título, sigla, ID..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Requisito 6: Abas de Categorias Solicitadas (quando checkbox estiver ativo) */}
        {divideByTabs && (
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {ADMIN_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`tab-category-${cat.id}`}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/40'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* TABELA DE CURSOS E PRECIFICAÇÃO */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table id="table-admin-courses" className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[11px] select-none">
                <th className="py-3 px-4 font-semibold">Curso / Identificação</th>
                <th className="py-3 px-3 font-semibold">Categoria</th>
                <th className="py-3 px-3 font-semibold min-w-[130px]">
                  <div className="flex items-center gap-1 text-zinc-300">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Preço de Custo (R$)</span>
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold min-w-[120px]">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Percent className="w-3.5 h-3.5" />
                    <span>Lucro (%)</span>
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold min-w-[140px]">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Preço Venda (R$)</span>
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold text-center">Status Vitrine</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70 text-zinc-300">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-zinc-500 text-xs">
                    Nenhum curso encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => {
                  const row = getRowValues(c);
                  const isInactive = c.isActive === false;

                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        isInactive ? 'bg-zinc-950/40 opacity-75' : ''
                      }`}
                    >
                      {/* Coluna 1: Imagem, Título e ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.thumbnail}
                            alt={c.title}
                            className="w-10 h-10 rounded-lg object-cover border border-zinc-800 shrink-0 bg-zinc-950"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white text-xs leading-tight">
                                {c.title}
                              </span>
                              {c.acronym && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                                  {c.acronym}
                                </span>
                              )}
                              {c.isFeatured && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-red-950 text-red-400 rounded border border-red-800">
                                  Destaque
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500 truncate max-w-xs mt-0.5">
                              ID: <code className="text-zinc-400 font-mono text-[10px]">{c.id}</code> • {c.duration}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Coluna 2: Categoria */}
                      <td className="py-3 px-3">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border bg-zinc-950 text-zinc-300 border-zinc-800">
                          {c.categoryLabel || c.category}
                        </span>
                      </td>

                      {/* Coluna 3: Input Preço de Custo */}
                      <td className="py-3 px-3">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-[11px] font-medium pointer-events-none">
                            R$
                          </span>
                          <input
                            id={`input-cost-${c.id}`}
                            type="text"
                            value={row.costPrice}
                            onChange={(e) => handleCostChange(c.id, e.target.value, c)}
                            onBlur={() => row.isDirty && handleSavePrice(c.id)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-white font-mono font-semibold focus:outline-none focus:border-red-500 hover:border-zinc-600 transition-colors"
                          />
                        </div>
                      </td>

                      {/* Coluna 4: Input Percentual (%) de Lucro */}
                      <td className="py-3 px-3">
                        <div className="relative">
                          <input
                            id={`input-profit-${c.id}`}
                            type="text"
                            value={row.profitPercent}
                            onChange={(e) => handleProfitChange(c.id, e.target.value, c)}
                            onBlur={() => row.isDirty && handleSavePrice(c.id)}
                            className="w-full bg-zinc-950 border border-amber-900/50 rounded-md pl-2.5 pr-6 py-1.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500 hover:border-amber-700 transition-colors"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-500/80 text-[11px] font-bold pointer-events-none">
                            %
                          </span>
                        </div>
                      </td>

                      {/* Coluna 5: Input Preço de Venda */}
                      <td className="py-3 px-3">
                        <div className="relative flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500 text-[11px] font-bold pointer-events-none">
                              R$
                            </span>
                            <input
                              id={`input-price-${c.id}`}
                              type="text"
                              value={row.price}
                              onChange={(e) => handlePriceChange(c.id, e.target.value, c)}
                              onBlur={() => row.isDirty && handleSavePrice(c.id)}
                              className="w-full bg-zinc-950 border border-emerald-900/60 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500 hover:border-emerald-700 transition-colors"
                            />
                          </div>

                          {/* Botão de Salvar Linha Individual */}
                          {row.isDirty && (
                            <button
                              id={`btn-save-row-${c.id}`}
                              onClick={() => handleSavePrice(c.id)}
                              disabled={row.saveStatus === 'saving'}
                              title="Salvar alterações na plataforma"
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors shrink-0 shadow"
                            >
                              {row.saveStatus === 'saving' ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {row.saveStatus === 'saved' && (
                            <span title="Salvo na plataforma!" className="p-1 text-emerald-400 shrink-0">
                              <Check className="w-4 h-4 text-emerald-400" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Coluna 6: Status Ativo / Inativo */}
                      <td className="py-3 px-3 text-center">
                        {isInactive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                            <EyeOff className="w-3 h-3 text-red-400" />
                            <span>Oculto</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                            <Eye className="w-3 h-3" />
                            <span>Ativo</span>
                          </span>
                        )}
                      </td>

                      {/* Coluna 7: Menu Ações */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 5: Ação de Inativar / Ocultar o card na plataforma */}
                          <button
                            id={`btn-toggle-active-${c.id}`}
                            type="button"
                            onClick={() => handleToggleActive(c)}
                            title={isInactive ? "Ativar e exibir na vitrine" : "Inativar e ocultar da vitrine"}
                            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                              isInactive
                                ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-800/60'
                                : 'bg-zinc-800 hover:bg-red-950/80 text-zinc-300 hover:text-red-300 border-zinc-700 hover:border-red-800'
                            }`}
                          >
                            {isInactive ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="hidden sm:inline">Exibir</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-red-400" />
                                <span className="hidden sm:inline">Ocultar</span>
                              </>
                            )}
                          </button>

                          {/* Editar Completo */}
                          <button
                            id={`btn-edit-course-${c.id}`}
                            type="button"
                            onClick={() => handleOpenEditModal(c)}
                            title="Editar detalhes completos do curso"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Excluir */}
                          <button
                            id={`btn-delete-course-${c.id}`}
                            type="button"
                            onClick={() => handleDeleteCourse(c.id, c.title)}
                            title="Excluir curso"
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/70 text-red-400 border border-red-900/50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela */}
        <div className="p-3 bg-zinc-950/80 border-t border-zinc-800 text-[11px] text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Exibindo <strong className="text-zinc-300">{filteredCourses.length}</strong> de <strong className="text-zinc-300">{courses.length}</strong> cursos cadastrados
          </span>
          <span className="flex items-center gap-1 text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Preços sincronizados diretamente com o checkout do Mercado Pago</span>
          </span>
        </div>
      </div>

      {/* MODAL: + CADASTRAR NOVO / EDITAR CURSO (REQUISITO 6) */}
      {isCreateModalOpen && (
        <div 
          id="modal-create-course"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Cabeçalho do Modal */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {editingCourse ? `Editar Curso: ${editingCourse.title}` : '+ Cadastrar Novo Curso na Plataforma'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Defina todas as propriedades conforme o modelo de courses.ts
                  </p>
                </div>
              </div>
              <button
                id="btn-close-create-course-modal"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulário com Scroll */}
            <form onSubmit={handleSaveCourseModal} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID / Slug */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    ID / Slug Único do Curso *
                  </label>
                  <input
                    id="form-course-id"
                    type="text"
                    value={formData.id || ''}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="Ex: formacao-transporte-novo"
                    disabled={Boolean(editingCourse)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-red-600 disabled:opacity-60"
                  />
                  <span className="text-[10px] text-zinc-500">
                    {editingCourse ? 'ID não pode ser alterado após a criação.' : 'Deixe em branco para gerar automaticamente do título.'}
                  </span>
                </div>

                {/* Sigla */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Sigla Oficial (Acronym)
                  </label>
                  <input
                    id="form-course-acronym"
                    type="text"
                    value={formData.acronym || ''}
                    onChange={(e) => setFormData({ ...formData, acronym: e.target.value.toUpperCase() })}
                    placeholder="Ex: CVE, MOPP, NR 35..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>

                {/* Título */}
                <div className="sm:col-span-2">
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Título Principal do Curso *
                  </label>
                  <input
                    id="form-course-title"
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Formação Transporte Coletivo de Passageiros"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>

                {/* Subtítulo */}
                <div className="sm:col-span-2">
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Subtítulo do Card
                  </label>
                  <input
                    id="form-course-subtitle"
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Ex: Reconhecido pelo Detran PR | 100% EAD"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Categoria da Plataforma *
                  </label>
                  <select
                    id="form-course-category"
                    value={formData.category || 'especializados'}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      const catConfig = ADMIN_CATEGORIES.find(c => c.id === val);
                      setFormData({ 
                        ...formData, 
                        category: val,
                        categoryLabel: catConfig ? catConfig.label : 'Curso'
                      });
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="especializados">Detran Formação (Especializados 50h/30h)</option>
                    <option value="atualizacao">Atualização & Reciclagem</option>
                    <option value="saude">Saúde & APH</option>
                    <option value="tea">Jornada TEA</option>
                    <option value="nr">Normas NR</option>
                  </select>
                </div>

                {/* Selo / Badge */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Selo de Destaque (Badge)
                  </label>
                  <input
                    id="form-course-badge"
                    type="text"
                    value={formData.badge || ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Ex: Mais Procurado, Alta Demanda, Homologado..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* BLOCO DE PRECIFICAÇÃO COM CÁLCULO BIDIRECIONAL */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center gap-1.5 text-zinc-200 font-bold text-xs">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Precificação & Margens Comerciais (Cálculo Automático)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Preço de Custo */}
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1 text-[11px]">
                      Preço de Custo (R$)
                    </label>
                    <input
                      id="form-course-cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costPrice ?? ''}
                      onChange={(e) => {
                        const cost = parseFloat(e.target.value) || 0;
                        const profit = formData.profitPercent ?? 100;
                        const price = cost > 0 ? (cost * (1 + profit / 100)) : cost;
                        setFormData({
                          ...formData,
                          costPrice: cost,
                          price: Number(price.toFixed(2))
                        });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Margem de Lucro % */}
                  <div>
                    <label className="block text-amber-400 font-semibold mb-1 text-[11px]">
                      Margem de Lucro (%)
                    </label>
                    <input
                      id="form-course-profit"
                      type="number"
                      step="0.1"
                      value={formData.profitPercent ?? ''}
                      onChange={(e) => {
                        const profit = parseFloat(e.target.value) || 0;
                        const cost = formData.costPrice || 0;
                        const price = cost > 0 ? (cost * (1 + profit / 100)) : cost;
                        setFormData({
                          ...formData,
                          profitPercent: profit,
                          price: Number(price.toFixed(2))
                        });
                      }}
                      className="w-full bg-zinc-900 border border-amber-800/60 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Preço de Venda */}
                  <div>
                    <label className="block text-emerald-400 font-semibold mb-1 text-[11px]">
                      Preço de Venda (R$) *
                    </label>
                    <input
                      id="form-course-price"
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      value={formData.price ?? ''}
                      onChange={(e) => {
                        const price = parseFloat(e.target.value) || 0;
                        const cost = formData.costPrice || 0;
                        const profit = cost > 0 ? (((price - cost) / cost) * 100) : 0;
                        setFormData({
                          ...formData,
                          price: price,
                          profitPercent: Number(profit.toFixed(1))
                        });
                      }}
                      className="w-full bg-zinc-900 border border-emerald-800/60 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Informações Técnicas Detran */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Carga Horária (horas)
                  </label>
                  <input
                    id="form-course-workload"
                    type="number"
                    value={formData.workloadHours || 50}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      workloadHours: parseInt(e.target.value) || 0,
                      duration: `${e.target.value} horas`
                    })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Duração Formatada
                  </label>
                  <input
                    id="form-course-duration"
                    type="text"
                    value={formData.duration || '50 horas'}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Ex: 50 horas, 20 horas..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Modalidade de Ensino
                  </label>
                  <input
                    id="form-course-modality"
                    type="text"
                    value={formData.modality || '100% Online EAD com Reconhecimento Facial'}
                    onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Homologação */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Homologação Legal / DETRAN
                </label>
                <input
                  id="form-course-detran-approval"
                  type="text"
                  value={formData.detranApproval || 'Homologado Resolução CONTRAN nº 789/20 e DETRAN PR'}
                  onChange={(e) => setFormData({ ...formData, detranApproval: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Imagens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                    <span>URL Imagem Thumbnail (Card)</span>
                  </label>
                  <input
                    id="form-course-thumbnail"
                    type="url"
                    value={formData.thumbnail || ''}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                    <span>URL Imagem Backdrop (Banner)</span>
                  </label>
                  <input
                    id="form-course-backdrop"
                    type="url"
                    value={formData.backdrop || ''}
                    onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Descrições */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Descrição Resumida (Card Vitrine)
                </label>
                <textarea
                  id="form-course-description"
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Resumo do objetivo do curso..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Descrição Completa / Ementa Detalhada
                </label>
                <textarea
                  id="form-course-full-description"
                  rows={3}
                  value={formData.fullDescription || ''}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Informações completas sobre a formação, credenciamento e diretrizes..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Requisitos e Módulos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Requisitos de Matrícula (um por linha)
                  </label>
                  <textarea
                    id="form-course-requirements"
                    rows={3}
                    value={Array.isArray(formData.requirements) ? formData.requirements.join('\n') : (formData.requirements || '')}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value.split('\n') })}
                    placeholder="Ex: Maior de 21 anos&#10;Habilitado na categoria D ou E"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Módulos do Curso (um por linha)
                  </label>
                  <textarea
                    id="form-course-modules"
                    rows={3}
                    value={Array.isArray(formData.modules) ? formData.modules.join('\n') : (formData.modules || '')}
                    onChange={(e) => setFormData({ ...formData, modules: e.target.value.split('\n') })}
                    placeholder="Ex: Legislação de Trânsito&#10;Direção Defensiva&#10;Primeiros Socorros"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Checkboxes de Controle */}
              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="form-course-is-active"
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500 bg-zinc-900 cursor-pointer"
                  />
                  <span className="text-zinc-200 font-medium">Curso Ativo e Visível na Plataforma</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="form-course-is-featured"
                    type="checkbox"
                    checked={Boolean(formData.isFeatured)}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 text-red-600 focus:ring-red-500 bg-zinc-900 cursor-pointer"
                  />
                  <span className="text-zinc-200 font-medium">Exibir no Destaque Principal</span>
                </label>
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  id="btn-cancel-course-modal"
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-colors"
                >
                  Cancelar
                </button>

                <button
                  id="btn-submit-course-modal"
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-950/50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingCourse ? 'Atualizar Curso' : 'Salvar Novo Curso'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
