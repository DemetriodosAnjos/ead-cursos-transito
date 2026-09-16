import React from 'react';
import { Course } from '../types';
import { ShieldCheck, Clock, Award, ChevronRight, Check } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onSelectCourse: (course: Course) => void;
  onOpenDetails: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onSelectCourse,
  onOpenDetails,
}) => {
  return (
    <div
      id={`course-card-${course.id}`}
      className="group relative flex flex-col bg-zinc-900/90 rounded-lg overflow-hidden border border-zinc-800/80 hover:border-red-600/60 shadow-lg hover:shadow-2xl hover:shadow-red-950/30 transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Imagem do Curso / Pôster Netflix */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Gradiente sobre a imagem */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/40" />

        {/* Badge superior */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {course.badge && (
            <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
              {course.badge}
            </span>
          )}
          <span className="bg-zinc-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5" />
            100% EAD
          </span>
        </div>

        {/* Carga horária flutuante */}
        <div className="absolute bottom-2 right-2 z-10">
          <span className="bg-zinc-950/85 backdrop-blur-sm text-zinc-300 text-[11px] font-semibold px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            {course.duration}
          </span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Subtítulo / Reconhecimento */}
          <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <span>{course.subtitle}</span>
          </div>

          {/* Título */}
          <h3 className="mt-1 text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          {/* Descrição curta */}
          <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Módulos chave resumidos */}
        {course.modules && course.modules.length > 0 && (
          <div className="pt-1 border-t border-zinc-800/60">
            <div className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider mb-1">
              Destaques do Conteúdo
            </div>
            <div className="space-y-1">
              {course.modules.slice(0, 2).map((mod, i) => (
                <div key={i} className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate">{mod}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preço e Botão CTA */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] text-zinc-400 uppercase font-medium">Valor do Curso</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white">
                {course.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id={`details-btn-${course.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(course);
              }}
              title="Ver detalhes do curso"
              className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              id={`enroll-btn-${course.id}`}
              onClick={() => onSelectCourse(course)}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold px-3.5 py-2 rounded shadow-md shadow-red-950/50 hover:shadow-red-700/40 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Iniciar Matrícula</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
