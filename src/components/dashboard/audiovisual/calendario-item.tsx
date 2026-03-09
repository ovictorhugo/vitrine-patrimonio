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
import { LoanableItemDTO } from "./audiovisual"; // Ajuste o caminho se necessário

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Interfaces Locais ---
interface CalendarEvent {
  eventId: string;
  userName: string;
  userEmail: string;
  status: string;
  startFmt: string;
  endFmt: string;
  observation?: string;
  colorClass: string;
  badgeClass: string;
}

// --- Componente ---
export default function ItemLoanCalendar({
  item,
}: {
  item: LoanableItemDTO | null;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  console.log(item);

  // 1. Processamento Otimizado (Gera Map indexado por YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const eventMap = new Map<string, CalendarEvent[]>();

    if (!item || !item.loans || item.loans.length === 0) return eventMap;

    const now = new Date();

    item.loans.forEach((loan) => {
      if (!loan.start_at) return;

      // Evita bug de timezone de datas ISO sem offset nativo do JS
      const start = new Date(loan.start_at);
      const end = loan.end_at
        ? new Date(loan.end_at)
        : loan.returned_at
          ? new Date(loan.returned_at)
          : start;

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

      // Lógica de Status
      const isLate = end < now && !loan.is_returned;
      const status = loan.is_maintenance
        ? "MANUTENÇÃO"
        : loan.is_returned
          ? "DEVOLVIDO"
          : !loan.is_executed
            ? "PEDIDO"
            : isLate
              ? "ATRASADO"
              : "EMPRESTADO";

      // Dicionário de cores simplificado
      const colors = {
        MANUTENÇÃO: {
          pill: "bg-amber-50 text-amber-700 border-amber-500 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
          badge: "bg-amber-100 text-amber-700",
        },
        DEVOLVIDO: {
          pill: "bg-green-50 text-green-700 border-green-500 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
          badge: "bg-green-100 text-green-700",
        },
        PEDIDO: {
          pill: "bg-gray-100 text-gray-700 border-gray-400 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600",
          badge: "bg-gray-200 text-gray-700",
        },
        ATRASADO: {
          pill: "bg-red-50 text-red-700 border-red-500 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
          badge: "bg-red-100 text-red-700",
        },
        EMPRESTADO: {
          pill: "bg-eng-blue/10 border-eng-blue dark:bg-eng-blue/40 dark:text-white dark:border-eng-blue",
          badge: "bg-eng-blue/20 text-eng-blue",
        },
      }[status]!;

      const event: CalendarEvent = {
        eventId: loan.id,
        userName:
          loan.requester?.username ||
          loan.temporary_guardian?.username ||
          "Desconhecido",
        userEmail:
          loan.requester?.email || loan.temporary_guardian?.email || "",
        status,
        startFmt: format(start, "dd/MM/yy 'às' HH:mm"),
        endFmt: format(end, "dd/MM/yy 'às' HH:mm"),
        observation: loan.lend_detail || item.owner_notes || "",
        colorClass: colors.pill,
        badgeClass: colors.badge,
      };

      // Adiciona o evento para TODOS os dias do intervalo (Início -> Fim)
      const daysInInterval = eachDayOfInterval({ start, end });
      daysInInterval.forEach((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        if (!eventMap.has(dateStr)) eventMap.set(dateStr, []);
        eventMap.get(dateStr)!.push(event);
      });
    });

    return eventMap;
  }, [item]);

  // 2. Geração dos dias do mês visível
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentDate)),
      end: endOfWeek(endOfMonth(currentDate)),
    });
  }, [currentDate]);

  // Navegação
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Resgata os eventos rapidamente em O(1)
  const selectedDayEvents = selectedDay
    ? eventsByDate.get(format(selectedDay, "yyyy-MM-dd")) || []
    : [];

  const productName =
    item?.catalog?.asset?.material?.material_name ||
    item?.catalog?.asset?.asset_description ||
    "Item";

  return (
    <div className="w-full bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-eng-blue" />
            Histórico
          </h2>
          <p className="text-sm font-medium text-gray-400 capitalize mt-1">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-zinc-900 p-1 rounded-lg">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white rounded-md text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white rounded-md text-gray-600 dark:text-gray-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Calendário */}
      <div className="grid grid-cols-7 gap-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-semibold text-gray-400 uppercase"
          >
            {day}
          </div>
        ))}

        {daysInMonth.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate.get(dateStr) || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "min-h-[100px] sm:min-h-[120px] rounded-lg p-2 cursor-pointer transition border border-transparent hover:border-eng-blue flex flex-col gap-1",
                isCurrentMonth
                  ? "bg-white dark:bg-zinc-950 shadow-[0_0_10px_rgba(0,0,0,0.02)]"
                  : "bg-gray-50/50 text-gray-300 dark:bg-zinc-900/50",
                isToday && "ring-2 ring-eng-blue",
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                  isToday && "bg-eng-blue text-white",
                  !isCurrentMonth && "text-gray-300",
                )}
              >
                {format(day, "d")}
              </span>

              <div className="flex flex-col gap-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((evt, idx) => (
                  <div
                    key={evt.eventId + idx}
                    className={cn(
                      "text-[10px] px-1.5 py-1 rounded truncate border-l-2",
                      evt.colorClass,
                    )}
                  >
                    {evt.status} - {evt.userName.split(" ")[0]}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-gray-400 pl-1">
                    + {dayEvents.length - 3} outros
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      <Dialog.Root
        open={!!selectedDay}
        onOpenChange={(open) => !open && setSelectedDay(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white dark:bg-zinc-900 p-0 shadow-2xl  z-[999] flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 flex justify-between items-center">
              <div>
                <Dialog.Title className="text-xl font-bold flex items-center gap-2 dark:text-white">
                  <CalendarIcon className="w-5 h-5 text-eng-blue" />
                  {selectedDay &&
                    format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500 mt-1">
                  {selectedDayEvents.length} registros encontrados.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 dark:text-white">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedDayEvents.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  Nenhum empréstimo para esta data.
                </p>
              ) : (
                selectedDayEvents.map((evt, idx) => (
                  <div
                    key={evt.eventId + idx}
                    className="relative bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <span
                      className={cn(
                        "absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded-full",
                        evt.badgeClass,
                      )}
                    >
                      {evt.status}
                    </span>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-eng-blue/20 dark:bg-eng-blue/20 flex items-center justify-center text-eng-blue">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-bold mb-3">
                          <User className="w-4 h-4" /> {evt.userName}
                        </div>

                        <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-3 text-xs space-y-1.5 border dark:border-zinc-800">
                          <div className="flex justify-between text-gray-500">
                            Retirada:{" "}
                            <span className="font-medium text-black dark:text-gray-200">
                              {evt.startFmt}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            Devolução:{" "}
                            <span className="font-medium text-black dark:text-gray-200">
                              {evt.endFmt}
                            </span>
                          </div>
                          {evt.observation && (
                            <p className="pt-2 mt-2 border-t dark:border-zinc-700 text-gray-600 dark:text-gray-400 italic">
                              "{evt.observation}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
