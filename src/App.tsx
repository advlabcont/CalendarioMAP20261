import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Sliders, 
  CheckCircle, 
  CalendarRange, 
  Sparkles, 
  HelpCircle, 
  Info,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CoverPage from "./components/CoverPage";
import TeacherDashboard from "./components/TeacherDashboard";
import BookingModal from "./components/BookingModal";
import { 
  Booking, 
  getBookings, 
  saveBooking, 
  initializeTeacherPassword,
  db
} from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

const ALL_SLOTS = [
  { id: "08:00", time: "08:00 - 08:20" },
  { id: "08:20", time: "08:20 - 08:40" },
  { id: "08:40", time: "08:40 - 09:00" },
  { id: "09:00", time: "09:00 - 09:20" },
  { id: "09:20", time: "09:20 - 09:40" },
  { id: "09:40", time: "09:40 - 10:00" },
  { id: "10:00", time: "10:00 - 10:20" },
  { id: "10:20", time: "10:20 - 10:40" },
  { id: "10:40", time: "10:40 - 11:00" },
];

type AppView = "cover" | "booking" | "teacher-dashboard";

export default function App() {
  const [view, setView] = useState<AppView>("cover");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{ id: string; time: string } | null>(null);

  // Load bookings and initialize teacher password on startup
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeTeacherPassword();
    
    // Subscribe to Firestore bookings in real-time
    const unsubscribe = onSnapshot(
      collection(db, "bookings"),
      (snapshot) => {
        const bookingsList: Booking[] = [];
        snapshot.forEach((doc) => {
          bookingsList.push({ id: doc.id, ...doc.data() } as Booking);
        });
        const sorted = bookingsList.sort((a, b) => a.id.localeCompare(b.id));
        setBookings(sorted);
        localStorage.setItem("eduschedule_bookings", JSON.stringify(sorted));
        setLoading(false);
      },
      (error) => {
        console.error("Erro no onSnapshot do Firestore, usando fallback de busca única:", error);
        fetchBookings();
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConfirmBooking = async (details: {
    projectTitle: string;
    members: string;
    materials: string[];
    customMaterials: string;
  }) => {
    if (!selectedSlot) return;

    await saveBooking({
      id: selectedSlot.id,
      slot: selectedSlot.time,
      ...details
    });
  };

  // Render view router
  if (view === "cover") {
    return (
      <CoverPage 
        onEnter={() => setView("booking")} 
        onTeacherLoginClick={() => setView("teacher-dashboard")} 
      />
    );
  }

  if (view === "teacher-dashboard") {
    return (
      <TeacherDashboard 
        bookings={bookings} 
        allSlots={ALL_SLOTS} 
        onLogout={() => setView("cover")} 
        onRefresh={fetchBookings} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-primary selection:text-white">
      {/* Header bar */}
      <header className="bg-white border-b-2 border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setView("cover")}
            className="group flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            id="back-to-cover-btn"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Capa Inicial
          </button>

          <div className="flex items-center gap-1.5 font-display font-black text-brand-dark">
            <CalendarRange className="w-5 h-5 text-brand-primary" />
            <span>EduSchedule</span>
          </div>

          <button
            onClick={() => setView("teacher-dashboard")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border-2 border-brand-secondary hover:border-brand-secondary-hover rounded-xl text-xs font-bold text-brand-secondary hover:text-brand-secondary-hover transition bg-white shadow-[2px_2px_0px_rgba(99,102,241,0.15)]"
            id="header-teacher-login-btn"
          >
            <Sliders className="w-3.5 h-3.5 text-brand-secondary" />
            Professor
          </button>
        </div>
      </header>

      {/* Main timeline page container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        
        {/* Banner with date info */}
        <div className="bg-brand-primary text-white p-6 sm:p-8 rounded-3xl shadow-[6px_6px_0px_rgba(59,130,246,0.15)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          {/* Decorative light circle */}
          <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Apresentações 2026
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight leading-tight">
              Sábado, 27 de Junho
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm font-medium">
              Selecione um horário vago para cadastrar seu projeto.
            </p>
          </div>

          <div className="flex gap-4 sm:border-l sm:border-white/20 sm:pl-6 text-sm font-bold">
            <div>
              <p className="text-xs text-blue-200 font-bold uppercase">Início</p>
              <p className="font-black text-base">08:00h</p>
            </div>
            <div>
              <p className="text-xs text-blue-200 font-bold uppercase">Intervalo</p>
              <p className="font-black text-base">20 min</p>
            </div>
            <div>
              <p className="text-xs text-blue-200 font-bold uppercase">Limite</p>
              <p className="font-black text-base">11:00h</p>
            </div>
          </div>
        </div>

        {/* Timeline Slot List Grid */}
        <div className="space-y-3">
          <h3 className="font-display font-extrabold text-brand-dark text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-primary" />
            Horários Disponíveis para Agendamento
          </h3>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-medium">Carregando horários do banco de dados...</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {ALL_SLOTS.map((slot) => {
                // Check if this slot is already booked
                const booking = bookings.find((b) => b.id === slot.id);
                const isBooked = !!booking;

                return (
                  <div
                    key={slot.id}
                    className={`group relative overflow-hidden bg-white border-2 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 ${
                      isBooked
                        ? "border-slate-100 opacity-90 shadow-none bg-slate-50/50"
                        : "border-slate-200/80 hover:border-brand-primary hover:shadow-flat cursor-pointer"
                    }`}
                    onClick={() => {
                      if (!isBooked) {
                        setSelectedSlot(slot);
                      }
                    }}
                    id={`slot-card-${slot.id}`}
                  >
                    {/* Time indicator */}
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl font-mono text-sm font-bold flex items-center gap-1.5 border ${
                        isBooked 
                          ? "bg-slate-100 text-slate-400 border-slate-200" 
                          : "bg-blue-50 text-brand-primary border-brand-primary/20"
                      }`}>
                        <Clock className="w-4 h-4" />
                        {slot.time}
                      </div>

                      <div className="space-y-0.5 font-medium">
                        {isBooked ? (
                          <>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Reservado</span>
                            <h4 className="text-sm font-bold text-slate-700 leading-snug">
                              Projeto: {booking.projectTitle}
                            </h4>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-brand-accent uppercase tracking-wider block">Livre</span>
                            <h4 className="text-sm font-bold text-slate-500">
                              Clique para reservar este horário
                            </h4>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Booking indicator button */}
                    <div className="flex items-center self-end sm:self-auto">
                      {isBooked ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold rounded-xl">
                          <CheckCircle className="w-3.5 h-3.5 text-slate-300" />
                          Indisponível
                        </span>
                      ) : (
                        <button
                          className="flex items-center gap-1 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl transition shadow-[2px_2px_0px_rgba(59,130,246,0.15)]"
                          id={`book-btn-${slot.id}`}
                        >
                          Reservar
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Booking Form Modal Overlay */}
      {selectedSlot && (
        <BookingModal
          slotId={selectedSlot.id}
          slotTime={selectedSlot.time}
          onClose={() => {
            setSelectedSlot(null);
            fetchBookings();
          }}
          onConfirm={handleConfirmBooking}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 text-center py-6 text-slate-400 text-xs mt-12 print:hidden">
        <p>© 2026 EduSchedule • Sistema de Agendamento Inteligente</p>
      </footer>
    </div>
  );
}
