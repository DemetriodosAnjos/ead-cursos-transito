import React, { useState } from 'react';
import { Course } from '../types';
import { Play, CheckCircle2, ShieldCheck, Clock, Award, Info } from 'lucide-react';

interface HeroBannerProps {
  course: Course;
  onSelectCourse: (course: Course) => void;
  onOpenDetails: (course: Course) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  course,
  onSelectCourse,
  onOpenDetails,
}) => {
  return (
    <div className="relative w-full min-h-[520px] md:min-h-[580px] lg:min-h-[640px] flex items-end pb-12 pt-28 px-4 sm:px-8 lg:px-14 overflow-hidden">
      {/* Background Image com Gradientes Netflix */}
      <div className="absolute inset-0 z-0">
        <img
          src={course.backdrop || course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Camadas de gradiente cinematográfico */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent w-full md:w-3/4" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-zinc-950/90 to-transparent" />
      </div>

      {/* Conteúdo do Destaque */}
      <div className="relative z-10 max-w-2xl text-left space-y-4">
        {/* Badges de Destaque */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="bg-red-600 text-white px-2.5 py-1 rounded tracking-wider uppercase text-[11px] font-bold shadow-lg shadow-red-900/40">
            {course.badge || 'Destaque EAD'}
          </span>
          <span className="flex items-center gap-1 bg-zinc-900/90 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            {course.subtitle}
          </span>
          <span className="flex items-center gap-1 bg-zinc-900/80 text-zinc-300 px-2.5 py-1 rounded backdrop-blur-sm">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            {course.duration}
          </span>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md">
          {course.title}
        </h1>

        {/* Subtítulo / Descrição */}
        <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 leading-relaxed drop-shadow">
          {course.fullDescription || course.description}
        </p>

        {/* Valor e CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <div className="text-xs uppercase text-zinc-400 font-medium tracking-wider">Investimento</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {course.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-xs text-zinc-400">à vista no Pix</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="hero-iniciar-matricula-btn"
              onClick={() => onSelectCourse(course)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-6 py-3.5 rounded-md shadow-xl shadow-red-600/30 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar Matrícula</span>
            </button>

            <button
              id="hero-mais-informacoes-btn"
              onClick={() => onOpenDetails(course)}
              className="flex items-center justify-center gap-1.5 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 font-medium px-4 py-3.5 rounded-md border border-zinc-700/60 backdrop-blur-sm transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>Detalhes</span>
            </button>
          </div>
        </div>

        {/* Requisitos / Selos */}
        <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Inclusão no RENACH / CNH Digital
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Certificado Digital Válido
          </span>
        </div>
      </div>
    </div>
  );
};
