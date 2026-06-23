import React, { useState } from "react";
import { X, Check, ArrowRight, BookOpen, Users, Cpu, FileText, AlertCircle, Sparkles } from "lucide-react";
import { Booking } from "../firebase";

interface BookingModalProps {
  slotId: string;
  slotTime: string;
  onClose: () => void;
  onConfirm: (bookingDetails: {
    projectTitle: string;
    members: string;
    materials: string[];
    customMaterials: string;
  }) => Promise<void>;
}

const MATERIAL_OPTIONS = [
  "Projetor Multimídia (Data Show)",
  "Caixa de Som / Áudio",
  "Lousa / Quadro Negro",
  "Notebook / Computador da Escola",
  "Extensão / Filtro de Linha",
  "Mesa / Suporte Extra"
];

export default function BookingModal({ slotId, slotTime, onClose, onConfirm }: BookingModalProps) {
  const [projectTitle, setProjectTitle] = useState("");
  const [members, setMembers] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [customMaterials, setCustomMaterials] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleMaterialToggle = (material: string) => {
    setSelectedMaterials(prev => 
      prev.includes(material) 
        ? prev.filter(m => m !== material) 
        : [...prev, material]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!projectTitle.trim()) {
      setError("Por favor, preencha o título do projeto.");
      return;
    }
    if (!members.trim()) {
      setError("Por favor, informe os integrantes do grupo.");
      return;
    }

    setLoading(true);
    try {
      await onConfirm({
        projectTitle: projectTitle.trim(),
        members: members.trim(),
        materials: selectedMaterials,
        customMaterials: customMaterials.trim()
      });
      setSuccess(true);
    } catch (err) {
      setError("Houve um erro ao realizar a reserva. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-8 -mt-8 -z-10 blur-xl"></div>
          
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm animate-scale-up">
            <Check className="w-8 h-8" />
          </div>

          <h3 className="font-display font-bold text-slate-800 text-2xl tracking-tight mb-2">
            Horário Reservado!
          </h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Seu agendamento para o horário das <strong className="text-slate-700">{slotTime}</strong> foi salvo com sucesso. Preparem a apresentação e boa sorte!
          </p>

          <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 mb-6 text-left space-y-1.5 text-xs text-slate-600">
            <p><strong>Projeto:</strong> {projectTitle}</p>
            <p><strong>Horário:</strong> {slotTime} (27 de Junho)</p>
            <p className="text-brand-primary font-bold mt-1">Os detalhes do grupo foram guardados de forma segura.</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-brand-accent hover:bg-emerald-600 text-white text-sm font-bold py-3.5 rounded-xl transition shadow-[4px_4px_0px_rgba(74,222,128,0.15)]"
            id="success-close-btn"
          >
            Ok, entendi!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden my-8 relative">
        {/* Header decoration */}
        <div className="bg-brand-primary text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
            aria-label="Fechar"
            id="booking-modal-close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span className="text-xs uppercase tracking-wider font-bold text-blue-100">Novo Agendamento</span>
          </div>
          <h3 className="font-display font-black text-xl tracking-tight">
            Reservar Horário: {slotTime}
          </h3>
          <p className="text-blue-100 text-xs font-medium mt-1">
            Data: Sábado, 27 de Junho • Duração: 20 minutos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border-2 border-rose-100 text-rose-700 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand-primary" />
              Título do Projeto
            </label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Digite o título do trabalho ou projeto"
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-brand-primary focus:bg-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all text-slate-800 font-medium"
              id="project-title-input"
            />
          </div>

          {/* Group Members */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-primary" />
              Integrantes do Grupo
            </label>
            <textarea
              required
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="Nomes completos dos integrantes do grupo (ex: João Silva, Maria Santos...)"
              rows={3}
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-brand-primary focus:bg-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all text-slate-800 resize-none font-medium"
              id="members-input"
            />
            <p className="text-[10px] text-slate-400 font-medium">
              * Apenas o professor terá acesso à lista de integrantes do grupo por segurança.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-bold py-3 rounded-xl transition text-sm"
              id="cancel-booking-btn"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 rounded-xl transition shadow-[4px_4px_0px_rgba(59,130,246,0.15)] text-sm disabled:opacity-70"
              id="confirm-booking-btn"
            >
              {loading ? "Reservando..." : "Confirmar Marcação"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
