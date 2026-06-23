import React from "react";
import { Calendar, Clock, BookOpen, ChevronRight, UserCheck } from "lucide-react";
import { motion } from "motion/react";

interface CoverPageProps {
  onEnter: () => void;
  onTeacherLoginClick: () => void;
}

export default function CoverPage({ onEnter, onTeacherLoginClick }: CoverPageProps) {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-primary selection:text-white font-sans">
      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-brand-primary text-white p-2 rounded-xl shadow-md shadow-blue-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-display font-black text-brand-dark text-lg tracking-tight">
            EduSchedule
          </span>
        </div>
        <button
          onClick={onTeacherLoginClick}
          className="flex items-center gap-2 px-4 py-2 border-2 border-brand-secondary hover:border-brand-secondary-hover text-brand-secondary hover:text-brand-secondary-hover text-sm font-bold rounded-xl transition bg-white shadow-[4px_4px_0px_rgba(99,102,241,0.15)]"
          id="teacher-login-btn"
        >
          <UserCheck className="w-4 h-4 text-brand-secondary" />
          Área do Professor
        </button>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-brand-primary rounded-full text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
              Agendamento Disponível
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black text-brand-dark tracking-tight leading-none">
              Apresentação de <span className="text-brand-primary">Trabalhos</span>
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-md">
              Olá, estudantes! Reservem o horário do seu grupo para a apresentação dos projetos. Garanta o seu slot e informe os detalhes necessários.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="p-2 bg-white border-2 border-slate-100 rounded-xl text-slate-500 shadow-[2px_2px_0px_rgba(0,0,0,0.05)]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data Única</p>
                  <p className="text-sm font-bold text-slate-800">Sábado, 27 de Junho</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <div className="p-2 bg-white border-2 border-slate-100 rounded-xl text-slate-500 shadow-[2px_2px_0px_rgba(0,0,0,0.05)]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Intervalo & Duração</p>
                  <p className="text-sm font-bold text-slate-800">Das 08:00h às 11:00h • 20 min por grupo</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onEnter}
                className="group flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold px-6 py-3.5 rounded-2xl shadow-[6px_6px_0px_rgba(59,130,246,0.15)] transition-all transform active:scale-[0.98]"
                id="enter-booking-btn"
              >
                Ver Horários e Agendar
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Hero Right Visual Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flat-card flat-card-hover p-8 relative overflow-hidden bg-white"
          >
            {/* Background absolute shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 -z-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mb-12 -z-10 blur-xl"></div>

            <h3 className="font-display font-extrabold text-brand-dark text-xl mb-4">
              Instruções para Marcação
            </h3>
            
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-brand-primary font-bold text-xs flex items-center justify-center">1</span>
                <span>Escolha apenas <strong>um horário livre</strong> que seja melhor para todo o grupo.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-brand-primary font-bold text-xs flex items-center justify-center">2</span>
                <span>Preencha os **nomes de todos os integrantes** e o **título** do seu projeto.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-brand-primary font-bold text-xs flex items-center justify-center">3</span>
                <span>Cada slot tem limite estrito de <strong>20 minutos</strong> para apresentação e feedback.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-brand-primary font-bold text-xs flex items-center justify-center">4</span>
                <span>Os dados dos alunos são restritos ao professor. Outros alunos verão apenas que o horário está reservado.</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Dúvidas? Procure o docente.</span>
              <span className="text-xs font-bold text-brand-primary bg-blue-50 px-2.5 py-1 rounded-full">Dia 27/06</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-slate-100 text-slate-400 text-xs">
        <p>© 2026 EduSchedule • Organização e Controle de Apresentações</p>
      </footer>
    </div>
  );
}
