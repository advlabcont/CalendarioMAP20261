import React, { useState } from "react";
import { 
  BarChart3, 
  Clock, 
  Check, 
  Users, 
  Printer, 
  Download, 
  Trash2, 
  Edit, 
  LogOut, 
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  Sliders,
  Plus,
  PlusCircle,
  XCircle,
  CalendarPlus
} from "lucide-react";
import { deleteBooking, saveBooking, Booking, saveSlot, deleteSlot, Slot } from "../firebase";

interface TeacherDashboardProps {
  bookings: Booking[];
  allSlots: Slot[];
  onLogout: () => void;
  onRefresh: () => Promise<void>;
}

export default function TeacherDashboard({ bookings, allSlots, onLogout, onRefresh }: TeacherDashboardProps) {
  // Navigation tabs: "dashboard", "bookings" or "slots"
  const [activeTab, setActiveTab] = useState<"dashboard" | "bookings" | "slots">("dashboard");
  
  // States for editing booking
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMembers, setEditMembers] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // States for slot management
  const [newSlotStart, setNewSlotStart] = useState("");
  const [newSlotEnd, setNewSlotEnd] = useState("");
  const [slotError, setSlotError] = useState("");
  const [slotLoading, setSlotLoading] = useState(false);

  // Stats calculation
  const totalSlotsCount = allSlots.length;
  const bookedCount = bookings.length;
  const availableCount = totalSlotsCount - bookedCount;
  const fillingPercentage = Math.round((bookedCount / totalSlotsCount) * 100) || 0;

  const handleDelete = async (slotId: string, slotTime: string) => {
    if (window.confirm(`Tem certeza que deseja cancelar o agendamento de ${slotTime}?`)) {
      try {
        await deleteBooking(slotId);
        await onRefresh();
      } catch (err) {
        alert("Erro ao excluir agendamento.");
      }
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotError("");
    
    // Simple validation: must match HH:MM format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newSlotStart) || !timeRegex.test(newSlotEnd)) {
      setSlotError("Use o formato de hora HH:MM (ex: 08:00)");
      return;
    }

    const startMinutes = parseInt(newSlotStart.split(":")[0]) * 60 + parseInt(newSlotStart.split(":")[1]);
    const endMinutes = parseInt(newSlotEnd.split(":")[0]) * 60 + parseInt(newSlotEnd.split(":")[1]);

    if (endMinutes <= startMinutes) {
      setSlotError("O horário de término deve ser após o de início");
      return;
    }

    setSlotLoading(true);
    try {
      const id = newSlotStart; // use start time as the document ID
      const time = `${newSlotStart} - ${newSlotEnd}`;
      
      // Check if slot with this start time already exists
      if (allSlots.some(s => s.id === id)) {
        setSlotError("Já existe uma vaga iniciando neste horário");
        setSlotLoading(false);
        return;
      }

      await saveSlot({ id, time });
      setNewSlotStart("");
      setNewSlotEnd("");
      await onRefresh();
    } catch (err) {
      setSlotError("Erro ao criar vaga no banco de dados.");
    } finally {
      setSlotLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string, slotTime: string, isBooked: boolean) => {
    let confirmMsg = `Tem certeza que deseja remover a vaga de ${slotTime}?`;
    if (isBooked) {
      confirmMsg = `ATENÇÃO: Este horário (${slotTime}) já possui um agendamento. Se você excluir esta vaga, o agendamento correspondente também será cancelado e o horário liberado. Deseja continuar?`;
    }
    
    if (window.confirm(confirmMsg)) {
      try {
        await deleteSlot(slotId);
        await onRefresh();
      } catch (err) {
        alert("Erro ao excluir vaga.");
      }
    }
  };

  const startEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setEditTitle(booking.projectTitle);
    setEditMembers(booking.members);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    setEditLoading(true);
    try {
      await saveBooking({
        id: editingBooking.id,
        slot: editingBooking.slot,
        projectTitle: editTitle,
        members: editMembers,
        materials: editingBooking.materials || [],
        customMaterials: ""
      });
      setEditingBooking(null);
      await onRefresh();
    } catch (err) {
      alert("Erro ao editar agendamento.");
    } finally {
      setEditLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = "Horário;Título do Projeto;Integrantes;Status\n";
    const rows = allSlots.map(slot => {
      const b = bookings.find(book => book.id === slot.id);
      if (b) {
        return `"${slot.time}";"${b.projectTitle.replace(/"/g, '""')}";"${b.members.replace(/"/g, '""')}";"Reservado"`;
      }
      return `"${slot.time}";"DISPONÍVEL";"";"Vago"`;
    }).join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Relatorio_Apresentacoes_27_06.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-primary selection:text-white print:bg-white print:min-h-0">
      
      {/* Printable Area - Hidden on Screen */}
      <div className="hidden print:block p-8 space-y-6">
        <div className="text-center pb-6 border-b border-slate-300">
          <h1 className="text-2xl font-bold text-slate-800 font-display">Relatório de Apresentações de Trabalhos</h1>
          <p className="text-sm text-slate-500">Data Única: Sábado, 27 de Junho de 2026</p>
          <p className="text-xs text-slate-400 mt-1">Horários de 20 em 20 minutos • Das 08h00 às 11h00</p>
        </div>

        {/* Stats on Print */}
        <div className="grid grid-cols-3 gap-4 text-sm pb-4 border-b border-slate-200">
          <div><strong>Total de Horários:</strong> {totalSlotsCount}</div>
          <div><strong>Reservados:</strong> {bookedCount} ({fillingPercentage}%)</div>
          <div><strong>Disponíveis:</strong> {availableCount}</div>
        </div>

        {/* Main Table for Print */}
        <table className="w-full text-left border-collapse text-xs mt-4">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="p-2.5 font-bold text-slate-700 w-[20%]">Horário</th>
              <th className="p-2.5 font-bold text-slate-700 w-[40%]">Título do Projeto</th>
              <th className="p-2.5 font-bold text-slate-700 w-[40%]">Integrantes do Grupo</th>
            </tr>
          </thead>
          <tbody>
            {allSlots.map((slot) => {
              const b = bookings.find((bk) => bk.id === slot.id);
              return (
                <tr key={slot.id} className="border-b border-slate-200">
                  <td className="p-2.5 font-mono font-semibold">{slot.time}</td>
                  <td className="p-2.5 font-medium">{b ? b.projectTitle : "--- DISPONÍVEL ---"}</td>
                  <td className="p-2.5 text-slate-600 leading-relaxed">{b ? b.members : "Nenhum agendamento"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer on Print */}
        <div className="pt-12 text-center text-[10px] text-slate-400 border-t border-slate-200 mt-12">
          Gerado automaticamente pelo Sistema EduSchedule em {new Date().toLocaleString("pt-BR")}
        </div>
      </div>

      {/* Screen view content */}
      <div className="print:hidden flex flex-col flex-1">
        
        {/* Navigation / Header */}
        <header className="bg-white border-b-2 border-slate-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            <div className="flex items-center gap-3">
              <div className="bg-brand-primary text-white p-2.5 rounded-xl shadow-[2px_2px_0px_rgba(59,130,246,0.15)]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-black text-brand-dark text-xl tracking-tight">
                  Painel Administrativo
                </h1>
                <p className="text-xs text-slate-400 font-semibold">Docente • Gestão de Apresentações 27/06</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-end">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "dashboard"
                      ? "bg-white text-brand-primary shadow-sm border border-brand-primary/10"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Geral & Relatórios
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "bookings"
                      ? "bg-white text-brand-primary shadow-sm border border-brand-primary/10"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Lista Completa
                </button>
                <button
                  onClick={() => setActiveTab("slots")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "slots"
                      ? "bg-white text-brand-primary shadow-sm border border-brand-primary/10"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  id="tab-manage-slots"
                >
                  Abrir / Gerenciar Vagas
                </button>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-rose-100 text-rose-600 bg-rose-50/50 hover:bg-rose-50 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>

          </div>
        </header>

        {/* Edit Booking Modal (Overlay) */}
        {editingBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-2xl max-w-md w-full p-6">
              <h3 className="font-display font-black text-brand-dark text-xl mb-1">
                Editar Detalhes do Grupo
              </h3>
              <p className="text-xs text-slate-400 font-medium mb-4">
                Alterando horário de {editingBooking.slot}
              </p>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Título do Projeto</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-brand-primary px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Integrantes</label>
                  <textarea
                    required
                    rows={3}
                    value={editMembers}
                    onChange={(e) => setEditMembers(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-brand-primary px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingBooking(null)}
                    className="flex-1 border-2 border-slate-200 py-2.5 rounded-xl text-xs font-bold text-slate-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 bg-brand-primary text-white py-2.5 rounded-xl text-xs font-bold hover:bg-brand-primary-hover shadow-[4px_4px_0px_rgba(59,130,246,0.15)] disabled:opacity-75"
                  >
                    {editLoading ? "Gravando..." : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dashboard Main Content area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

          {/* Tab 1: GENERAL STATS & AUTOMATIC REPORTS */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Stats Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-flat flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-brand-primary">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total de Slots</p>
                    <p className="text-2xl font-black text-brand-dark">{totalSlotsCount}</p>
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-flat flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl text-brand-accent">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Reservados</p>
                    <p className="text-2xl font-black text-brand-dark">{bookedCount}</p>
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-flat flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl text-brand-warning">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Disponíveis</p>
                    <p className="text-2xl font-black text-brand-dark">{availableCount}</p>
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-flat flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-brand-secondary w-full">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Ocupação da Agenda</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden border">
                        <div className="bg-brand-primary h-full transition-all" style={{ width: `${fillingPercentage}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{fillingPercentage}%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Automatic Reports & Interactive Download Section */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Export Options & Actions */}
                <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-flat flex flex-col justify-between space-y-6">
                  <div>
                    <h2 className="font-display font-extrabold text-brand-dark text-lg mb-1.5 flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-brand-secondary" />
                      Relatórios Automáticos
                    </h2>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">
                      Exporte as informações para planilhas ou imprima o cronograma oficial de apresentações com facilidade.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={printReport}
                      className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 rounded-xl transition text-xs shadow-[4px_4px_0px_rgba(59,130,246,0.15)]"
                    >
                      <Printer className="w-4 h-4" />
                      Visualizar para Imprimir (PDF)
                    </button>
                    
                    <button
                      onClick={exportToCSV}
                      className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-xs border-2 border-slate-200"
                    >
                      <Download className="w-4 h-4" />
                      Exportar para Excel / CSV
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-100 text-[11px] text-slate-400 font-medium">
                    O relatório para impressão é otimizado automaticamente para formato A4 de folha inteira.
                  </div>
                </div>

                {/* Scheduled Slots Quick Summary */}
                <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-flat lg:col-span-2">
                  <h2 className="font-display font-extrabold text-brand-dark text-lg mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-primary" />
                    Resumo de Horários Agendados
                  </h2>

                  {bookedCount === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-4">
                      <Calendar className="w-8 h-8 opacity-40 mb-2" />
                      <p className="text-xs font-semibold">Nenhum horário agendado até o momento.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      <div className="grid gap-3">
                        {allSlots.map((slot) => {
                          const b = bookings.find((bk) => bk.id === slot.id);
                          if (!b) return null;
                          return (
                            <div key={slot.id} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-slate-200">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-brand-primary bg-blue-50 border border-brand-primary/20 px-2 py-0.5 rounded">
                                    {slot.time}
                                  </span>
                                  <h4 className="font-bold text-slate-800 text-sm">{b.projectTitle}</h4>
                                </div>
                                <p className="text-xs text-slate-500 font-medium pl-1">
                                  <strong className="text-slate-600">Alunos:</strong> {b.members}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDelete(b.id, slot.time)}
                                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition border border-transparent hover:border-rose-100 self-end sm:self-auto flex items-center gap-1 text-xs font-bold"
                                title="Cancelar agendamento"
                                id={`quick-delete-btn-${slot.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Cancelar
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Tab 2: COMPLETE TIMELINE TABLE */}
          {activeTab === "bookings" && (
            <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-flat overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="font-display font-extrabold text-brand-dark text-lg">Grade de Apresentações</h2>
                  <p className="text-xs text-slate-400 font-medium">Controle e edição direta dos horários agendados.</p>
                </div>
                <button
                  onClick={printReport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border-2 border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 transition"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  Imprimir Cronograma
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6 w-[20%]">Horário</th>
                      <th className="py-4 px-6 w-[35%]">Título do Projeto</th>
                      <th className="py-4 px-6 w-[35%]">Integrantes do Grupo</th>
                      <th className="py-4 px-6 w-[10%] text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {allSlots.map((slot) => {
                      const b = bookings.find((bk) => bk.id === slot.id);
                      return (
                        <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                          <td className="py-4 px-6">
                            <span className="font-mono font-bold text-brand-primary bg-blue-50 border border-brand-primary/20 px-2.5 py-1 rounded-lg">
                              {slot.time}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-800">
                            {b ? b.projectTitle : (
                              <span className="text-slate-300 font-normal italic">Horário Disponível</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            {b ? (
                              <p className="line-clamp-2 leading-relaxed text-xs font-medium">{b.members}</p>
                            ) : (
                              <span className="text-slate-300 font-light">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {b ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => startEdit(b)}
                                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition"
                                  title="Editar agendamento"
                                  id={`edit-btn-${slot.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(b.id, slot.time)}
                                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                                  title="Remover agendamento"
                                  id={`delete-btn-${slot.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs font-semibold">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: MANAGE SLOTS (ABRIR VAGA) */}
          {activeTab === "slots" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form to Open a New Slot */}
              <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-flat h-fit space-y-5">
                <div>
                  <h2 className="font-display font-extrabold text-brand-dark text-lg mb-1 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-brand-accent" />
                    Abrir Nova Vaga
                  </h2>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    Adicione um novo horário de apresentação na grade de horários para os alunos.
                  </p>
                </div>

                <form onSubmit={handleCreateSlot} className="space-y-4">
                  {slotError && (
                    <div className="p-3 bg-rose-50 border-2 border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{slotError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Início</label>
                      <input
                        type="text"
                        placeholder="11:00"
                        maxLength={5}
                        required
                        value={newSlotStart}
                        onChange={(e) => setNewSlotStart(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-brand-primary px-3 py-2.5 rounded-xl text-sm font-mono font-bold focus:outline-none text-center"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Término</label>
                      <input
                        type="text"
                        placeholder="11:20"
                        maxLength={5}
                        required
                        value={newSlotEnd}
                        onChange={(e) => setNewSlotEnd(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-brand-primary px-3 py-2.5 rounded-xl text-sm font-mono font-bold focus:outline-none text-center"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    Exemplo: Início <strong>11:00</strong> e Término <strong>11:20</strong> para criar a vaga "11:00 - 11:20".
                  </p>

                  <button
                    type="submit"
                    disabled={slotLoading}
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition text-xs shadow-[4px_4px_0px_rgba(59,130,246,0.15)] flex items-center justify-center gap-1.5"
                    id="submit-new-slot-btn"
                  >
                    <Plus className="w-4 h-4" />
                    {slotLoading ? "Criando..." : "Abrir Horário"}
                  </button>
                </form>
              </div>

              {/* List of current Slots */}
              <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-flat lg:col-span-2 space-y-4">
                <div>
                  <h2 className="font-display font-extrabold text-brand-dark text-lg mb-1 flex items-center gap-2">
                    <CalendarPlus className="w-5 h-5 text-brand-primary" />
                    Vagas Cadastradas ({allSlots.length})
                  </h2>
                  <p className="text-slate-500 text-xs font-medium">
                    Veja, cancele agendamentos ou exclua os horários disponíveis da grade.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {allSlots.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                      <Clock className="w-8 h-8 mx-auto opacity-30 mb-2" />
                      <p className="text-xs font-semibold">Nenhuma vaga cadastrada.</p>
                    </div>
                  ) : (
                    allSlots.map((slot) => {
                      const b = bookings.find((bk) => bk.id === slot.id);
                      const isBooked = !!b;

                      return (
                        <div
                          key={slot.id}
                          className="p-4 bg-slate-50/50 border-2 border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-slate-200"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-brand-primary bg-blue-50 border border-brand-primary/20 px-2.5 py-1 rounded-lg">
                              {slot.time}
                            </span>
                            <div>
                              {isBooked ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold rounded-md">
                                    Reservada: {b.projectTitle}
                                  </span>
                                  <p className="text-[11px] text-slate-400 font-medium font-sans">Alunos: {b.members}</p>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold rounded-md">
                                  Vaga Livre / Disponível
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {isBooked && (
                              <button
                                onClick={() => handleDelete(b.id, slot.time)}
                                className="px-2.5 py-1.5 border-2 border-rose-100 text-rose-600 bg-rose-50/50 hover:bg-rose-50 text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                                title="Cancelar apenas o agendamento"
                                id={`cancel-booking-btn-${slot.id}`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Liberar Vaga
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSlot(slot.id, slot.time, isBooked)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition border border-transparent hover:border-rose-100"
                              title="Excluir horário completamente"
                              id={`delete-slot-btn-${slot.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
