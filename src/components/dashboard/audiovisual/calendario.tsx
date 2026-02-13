import React, { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
  Package,
  User,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Interfaces (Adaptadas para sua estrutura) ---

// Estrutura do Usuário (reutilizada)
interface UserData {
  username: string;
  email: string;
}

// Detalhes do Workflow
interface WorkflowDetail {
  inicio?: string;
  fim?: string;
  observation?: string;
}

// Um item do histórico
interface WorkflowItem {
  id: string;
  workflow_status: string;
  detail?: WorkflowDetail;
  user: UserData;
  created_at: string;
}

export interface CatalogEntry {
  id: string;
  asset: {
    material: {
      material_name: string;
    };
  };
  workflow_history: WorkflowItem[];
}

interface CalendarEvent {
  eventId: string;
  productId: string;
  productName: string; // O nome do item sendo emprestado
  userName: string;
  userEmail: string;
  status: string;
  start: Date;
  end: Date;
  observation?: string;
}

// --- Componente ---
export default function GlobalLoanCalendar({
  rentedItems,
}: {
  rentedItems: CatalogEntry[];
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Processamento: Achatar todos os históricos em uma única lista de eventos
  const allEvents: CalendarEvent[] = useMemo(() => {
    if (!rentedItems) return [];
    return rentedItems.flatMap((product) => {
      // Para cada produto, pega o histórico
      return (product.workflow_history || [])
        .filter(
          (historyItem) => historyItem.detail?.inicio && historyItem.detail?.fim
        )
        .map((historyItem) => ({
          eventId: historyItem.id,
          productId: product.id,
          productName: product.asset.material.material_name, // Nome do produto
          userName: historyItem.user.username,
          userEmail: historyItem.user.email,
          status: historyItem.workflow_status,
          start: parseISO(historyItem.detail!.inicio!),
          end: parseISO(historyItem.detail!.fim!),
          observation: historyItem.detail?.observation,
        }));
    });
  }, [rentedItems]);

  // 2. Geração dos dias do calendário
  const daysInMonth = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Navegação
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Handler de clique no dia
  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setIsDialogOpen(true);
  };

  // Filtrar eventos para o Modal (Dia específico)
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return allEvents.filter(
      (event) =>
        isWithinInterval(selectedDay, { start: event.start, end: event.end }) ||
        isSameDay(selectedDay, event.start) ||
        isSameDay(selectedDay, event.end)
    );
  }, [selectedDay, allEvents]);

  return (
    <div className="w-full bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 p-6">
      {/* --- Header --- */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-gray-400 dark:text-eng-blue" />
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm rounded-md transition text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm rounded-md transition text-gray-600 dark:text-gray-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- Dias da Semana --- */}
      <div className="grid grid-cols-7 mb-4">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-400 dark:text-zinc-200 uppercase tracking-wider text-[11px]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* --- Grid do Calendário --- */}
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day) => {
          // Busca eventos que caem neste dia
          const dayEvents = allEvents.filter((event) =>
            isWithinInterval(day, {
              start: startOfDay(event.start),
              end: endOfDay(event.end),
            })
          );

          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={cn(
                "min-h-[140px] rounded-lg p-2 cursor-pointer transition border border-transparent hover:border-eng-blue dark:hover:border-eng-blue hover:shadow-md flex flex-col gap-1 relative group",
                !isCurrentMonth
                  ? "bg-gray-50/50 text-gray-300 dark:bg-zinc-900/50 dark:text-zinc-700"
                  : "bg-white border-gray-100 shadow-[0_0_10px_rgba(0,0,0,0.02)] dark:bg-zinc-950 dark:border-zinc-800 dark:shadow-none",
                isToday &&
                  "ring-2 ring-eng-blue ring-offset-2 z-10 dark:ring-offset-zinc-950"
              )}
            >
              {/* Número do dia */}
              <span
                className={cn(
                  "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                  isToday
                    ? "bg-eng-blue text-white"
                    : "text-gray-700 dark:text-gray-300",
                  !isCurrentMonth && "text-gray-300 dark:text-zinc-700"
                )}
              >
                {format(day, "d")}
              </span>

              {/* Lista de eventos (Pílulas) */}
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayEvents.slice(0, 4).map((evt) => {
                  const isLate = evt.status.includes("ATRASADO");
                  return (
                    <div
                      key={`${evt.eventId}-${day.toISOString()}`}
                      className={cn(
                        "text-[10px] px-1.5 py-1 rounded truncate font-medium border-l-2",
                        isLate
                          ? "bg-red-50 text-red-700 border-red-500 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                          : "bg-eng-blue/10 text-eng-blue border-eng-blue dark:bg-eng-blue/30 dark:text-white dark:border-eng-blue"
                      )}
                      title={`${evt.productName} - ${evt.userName}`}
                    >
                      {evt.productName}
                    </div>
                  );
                })}

                {dayEvents.length > 4 && (
                  <span className="text-[10px] text-gray-400 font-medium pl-1 dark:text-zinc-500">
                    + {dayEvents.length - 4} outros...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Modal Detalhado (Radix Dialog) --- */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white dark:bg-zinc-900 p-0 shadow-2xl z-50 animate-in zoom-in-95 duration-200 focus:outline-none overflow-hidden flex flex-col border border-transparent dark:border-zinc-800">
            {/* Header do Modal */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-eng-blue dark:text-eng-blue" />
                  {selectedDay &&
                    format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedDayEvents.length} itens emprestados ou reservados
                  neste dia.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-zinc-800 p-2 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Lista Scrollável */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-zinc-600 gap-3">
                  <Package className="w-12 h-12 opacity-20" />
                  <p>Nenhum registro para esta data.</p>
                </div>
              ) : (
                selectedDayEvents.map((evt, idx) => (
                  <div
                    key={`${evt.eventId}-${idx}`}
                    className="group relative bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 hover:shadow-md hover:border-eng-blue dark:hover:border-eng-blue transition-all"
                  >
                    {/* Badge de Status */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide",
                          evt.status.includes("ATRASADO")
                            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        )}
                      >
                        {evt.status.replace("AUDIOVISUAL_", "")}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Ícone do Produto */}
                      <div className="w-10 h-10 rounded-full bg-eng-blue/10 dark:bg-eng-blue/20 flex items-center justify-center flex-shrink-0 text-eng-blue dark:text-eng-blue">
                        <Package className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none mb-1">
                          {evt.productName}
                        </h4>

                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <User className="w-3 h-3" />
                          <span>
                            {evt.userName} ({evt.userEmail})
                          </span>
                        </div>

                        {/* Datas e Obs */}
                        <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-3 text-xs space-y-1.5 border border-gray-100 dark:border-zinc-800">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              Retirada:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">
                              {format(evt.start, "dd/MM/yy 'às' HH:mm")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              Devolução:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">
                              {format(evt.end, "dd/MM/yy 'às' HH:mm")}
                            </span>
                          </div>

                          {evt.observation && (
                            <div className="pt-2 mt-2 border-t border-gray-200/60 dark:border-zinc-700">
                              <p className="text-gray-600 dark:text-gray-400 italic">
                                "{evt.observation}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900 flex justify-end">
              <Dialog.Close asChild>
                <button className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 font-medium py-2 px-4 rounded-lg text-sm transition shadow-sm">
                  Fechar
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
