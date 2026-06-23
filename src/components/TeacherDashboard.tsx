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
  Sliders
} from "lucide-react";
import { deleteBooking, saveBooking, Booking } from "../firebase";

interface TeacherDashboardProps {
  bookings: Booking[];
  allSlots: { id: string; time: string }[];
  onLogout: () => void;
  onRefresh: () => Promise<void>;
}

export default function TeacherDashboard({ bookings, allSlots, onLogout, onRefresh }: TeacherDashboardProps) {
  // Navigation tabs: "dashboard" or "bookings"
  const [activeTab, setActiveTab] = useState<"dashboard" | "bookings">("dashboard");
  
  // States for editing booking
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMembers, setEditMembers] = useState("");
  const [editLoading, setEditLoading] = useState(false);

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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "dashboard"
                      ? "bg-white text-brand-primary shadow-sm border-2 border-brand-primary/10"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Geral & Relatórios
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "bookings"
                      ? "bg-white text-brand-primary shadow-sm border-2 border-brand-primary/10"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Lista Completa
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

        </main>
      </div>

    </div>
  );
}
