import React from 'react';
import { Course } from '../types';
import { X, ShieldCheck, Clock, Check, Play, BookOpen, AlertCircle } from 'lucide-react';

interface CourseDetailsModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse: (course: Course) => void;
}

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  course,
  isOpen,
  onClose,
  onSelectCourse,
}) => {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        id="course-details-modal"
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      >
        {/* Banner com Imagem Backdrop */}
        <div className="relative aspect-video sm:h-64 w-full overflow-hidden shrink-0">
          <img
            src={course.backdrop || course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
          
          <button
            id="close-details-modal-btn"
            onClick={onClose}
            className="absolute top-3 right-3 text-zinc-300 hover:text-white p-2 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
            <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              {course.badge || 'Homologado'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {course.title}
            </h2>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              {course.subtitle}
            </p>
          </div>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Informações rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-500 block">Carga Horária</span>
              <strong className="text-zinc-200">{course.duration}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block">Modalidade</span>
              <strong className="text-zinc-200">100% EAD Online</strong>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-zinc-500 block">Validade</span>
              <strong className="text-emerald-400">Válido em Todo Brasil</strong>
            </div>
          </div>

          {/* Descrição Completa */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Sobre o Curso
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {course.fullDescription || course.description}
            </p>
          </div>

          {/* Requisitos */}
          {course.requirements && course.requirements.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Requisitos de Matrícula (DETRAN)</span>
              </h4>
              <ul className="space-y-1.5">
                {course.requirements.map((req, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Módulos */}
          {course.modules && course.modules.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-red-500" />
                <span>Conteúdo Programático</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.modules.map((mod, i) => (
                  <div key={i} className="p-2.5 bg-zinc-950/70 border border-zinc-800 rounded-lg text-xs text-zinc-300 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-950 text-red-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{mod}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Fixo com Botão de Matrícula */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase">Investimento Total</span>
            <div className="text-xl sm:text-2xl font-black text-white">
              {course.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>

          <button
            id="modal-iniciar-matricula-btn"
            onClick={() => {
              onClose();
              onSelectCourse(course);
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-red-900/40 transition-all text-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Iniciar Matrícula</span>
          </button>
        </div>
      </div>
    </div>
  );
};
