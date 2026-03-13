import { useContext, useState, useEffect, useMemo } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { cn } from "../../lib";
import { Calendar } from "../ui/calendar";
import { ChevronsUpDown, Check, ChevronDownIcon, Package2 } from "lucide-react";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { UserContext } from "../../context/context";
import { Files } from "../homepage/components/documents-tab-catalog";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { LoanableItemDTO, UserDTO } from "../dashboard/audiovisual/audiovisual";
import { Switch } from "../ui/switch";
import { Alert } from "../ui/alert";

interface AudiovisualTabProps {
  loan: LoanableItemDTO;
  reload: () => void;
}

export function AudiovisualTab(
  { loan, reload }: AudiovisualTabProps,
) {
  const { urlGeral, user } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token") || "";

  const [observation, setObservation] = useState<string>("");
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);

  // Estados para o Combobox de Usuários
  const [openUser, setOpenUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Encontra o usuário completo baseado no ID selecionado
  const selectedUser = users.find((u) => u.id === selectedUserId);

  // Formata o nome para exibição (fallback para a primeira parte do email se não tiver username)
  const displaySelectedUser = selectedUser
    ? selectedUser.username || selectedUser.email?.split("@")[0] || "Usuário"
    : "Selecione o guardião temporário...";

  // DATAS

  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);

  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [hourFrom, setHourFrom] = useState<number>(11);
  const [hourTo, setHourTo] = useState<number>(12);
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  const [beginHours, setBeginHours] = useState<number[]>(hours);
  const [endHours, setEndHours] = useState<number[]>(hours);

  const conflictingLoans = useMemo(() => {
    if (!loan?.loans) return [];

    return (
      loan.loans
        // Filtramos apenas empréstimos que não foram devolvidos nem rejeitados, e que possuem data.
        .filter(
          (l) =>
            !l.is_returned && !l.rejection_reason && l.start_at && l.end_at,
        )
        .map((l) => ({
          inicio: l.start_at,
          fim: l.end_at!,
        }))
    );
  }, [loan?.loans]);

  function getAvailableHours(
    targetDate: Date,
    conflicts: { inicio: string; fim: string }[],
  ) {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const day = targetDate.getDate();

    return hours.filter((hour) => {
      // Criamos o timestamp do slot de hora atual (ex: 14:00:00 até 14:59:59)
      const slotStart = new Date(year, month, day, hour, 0, 0, 0).getTime();
      const slotEnd = new Date(year, month, day, hour, 59, 59, 999).getTime();

      const hasConflict = conflicts.some((c) => {
        try {
          const start = new Date(c.inicio).getTime();
          const end = new Date(c.fim).getTime();
          // Há conflito se o slot de hora intersecta o intervalo do empréstimo
          return slotStart < end && slotEnd > start;
        } catch {
          return false;
        }
      });

      return !hasConflict;
    });
  }

  useEffect(() => {
    const dateFromClean = new Date(dateFrom);
    dateFromClean.setHours(0, 0, 0, 0);
    const hora = dateFromClean.getTime();

    // Filtra apenas os conflitos que caem exatamente no dia selecionado (dateFrom)
    const conflictsForToday = conflictingLoans.filter((item) => {
      const inicioTimestamp = new Date(item.inicio).setHours(0, 0, 0, 0);
      const fimTimestamp = new Date(item.fim).setHours(0, 0, 0, 0);
      return hora >= inicioTimestamp && hora <= fimTimestamp;
    });

    try {
      setBeginHours(getAvailableHours(dateFrom, conflictsForToday));
    } catch (e) {
      toast.error("Erro ao calcular disponibilidade de horário.");
    }
  }, [dateFrom, conflictingLoans]);

  useEffect(() => {
    const dateFromClean = new Date(dateFrom);
    dateFromClean.setHours(0, 0, 0, 0);

    const dateToClean = new Date(dateTo);
    dateToClean.setHours(0, 0, 0, 0);

    // CASO 1: Início e Fim no mesmo dia
    if (dateFromClean.getTime() === dateToClean.getTime()) {
      const nonConflict = hours.filter(
        (v) => v > hourFrom && beginHours.includes(v),
      );

      const firstConflict =
        hours.find(
          (v) => hours.includes(v) && v > hourFrom && !nonConflict.includes(v),
        ) || 23;

      setEndHours(
        hours.filter(
          (v) => v > hourFrom && beginHours.includes(v) && v <= firstConflict,
        ),
      );
    }
    // CASO 2: Dias diferentes
    else {
      if (!dateFrom || !dateTo) return;

      const hora = dateFromClean.getTime();

      // Encontra conflitos que começam ou terminam depois do dia de início
      const futureConflicts = conflictingLoans.filter((item) => {
        const inicioTimestamp = new Date(item.inicio).setHours(0, 0, 0, 0);
        const fimTimestamp = new Date(item.fim).setHours(0, 0, 0, 0);
        return hora < inicioTimestamp || hora < fimTimestamp;
      });

      const availableTimes = beginHours.filter((n) => n > hourFrom).length;
      const totalTimes = hours.filter((n) => n > hourFrom).length;

      // Se não há horas suficientes hoje e quer agendar para dias depois, bloqueia
      if (
        availableTimes < totalTimes &&
        dateFromClean.getTime() < dateToClean.getTime()
      ) {
        setEndHours([]);
        return;
      }

      dateFromClean.setHours(hourFrom, 0, 0, 0);
      const startMs = dateFromClean.getTime();

      // Encontra o PRIMEIRO conflito (barreira) que ocorre após o horário de início selecionado
      let closestBarrier = Infinity;

      futureConflicts.forEach((c) => {
        const wfStart = new Date(c.inicio).getTime();
        // Se esse workflow começa DEPOIS (ou junto) do início escolhido pelo usuário
        if (wfStart >= startMs) {
          if (closestBarrier === Infinity || wfStart < closestBarrier) {
            closestBarrier = wfStart;
          }
        }
      });

      // --- DEFINIR AS HORAS FINAIS ---
      if (closestBarrier !== Infinity) {
        const barrierDate = new Date(closestBarrier);
        const barrierDayClean = new Date(closestBarrier).setHours(0, 0, 0, 0);
        const targetDayMs = dateToClean.getTime();

        // Cenário A: O bloqueio acontece ANTES de chegar no dia final selecionado.
        if (barrierDayClean < targetDayMs) {
          setEndHours([]);
        }
        // Cenário B: O bloqueio é EXATAMENTE no dia final.
        else if (barrierDayClean === targetDayMs) {
          const limitHour = barrierDate.getHours();
          setEndHours(hours.filter((h) => h <= limitHour));
        }
        // Cenário C: O bloqueio é num dia DEPOIS do dia final.
        else {
          setEndHours(hours);
        }
      } else {
        // Sem conflitos futuros, dia liberado
        setEndHours(hours);
      }
    }
  }, [dateFrom, hourFrom, beginHours, dateTo, conflictingLoans]);

  const mergeDateAndTime = (date: Date, time: number): Date => {
    const newDate = new Date(date);
    newDate.setHours(time);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  };

  async function fetchUsers() {
    try {
      const res = await fetch(`${urlGeral}users/?limit=2000`, {
        headers: { Accept: "application/json" },
      });
      const json: { users: UserDTO[] } = await res.json();
      setUsers(json.users);
    } catch (e) {
      console.error("Erro ao buscar usuários:", e);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function submit() {
    if (!dateFrom || !dateTo) return;
    const timestampFrom = mergeDateAndTime(dateFrom, hourFrom);
    const timestampTo = mergeDateAndTime(dateTo, hourTo);

    if (timestampTo <= timestampFrom && !isMaintenance) {
      toast.error(
        "Horário inválido! A hora final deve ser maior que a inicial.",
      );
      return;
    }

    if (!selectedUserId || selectedUserId === "") {
      toast.error("Favor preencher o responsável.");
      return;
    }

    const res = await fetch(`${urlGeral}loans/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        loanable_item_id: loan?.id,
        start_at: timestampFrom,
        end_at: isMaintenance ? null : timestampTo,
        requester_id: user?.id,
        temporary_guardian_id: selectedUserId,
        is_maintenance: isMaintenance,
        lend_detail: observation,
      }),
    });

    if (!res.ok) {
      let message = "Erro ao solicitar empréstimo";
      try {
        const err = await res.json();
        if (err?.detail) {
          message = Array.isArray(err.detail)
            ? err.detail[0]?.msg || JSON.stringify(err.detail)
            : err.detail;
        }
      } catch {
        toast.error(message);
      }
    } else {
      toast.success("Solicitação de empréstimo realizada com sucesso!");
      setTimeout(() => {
        reload();
      }, 1500);
    }
  }

  return (
    <main className={`grid flex-col gap-4 md:gap-8`}>
      <div className="p-8">
        <div className="grid grid-cols-1">
          <div className="grid gap-3 w-full pb-4">
            <Label>Responsável</Label>
            <div className="flex-1">
              <Popover
                modal={true}
                open={openUser}
                onOpenChange={(val) => {
                  setOpenUser(val);
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openUser}
                    className="w-full justify-between"
                  >
                    {displaySelectedUser}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 w-[var(--radix-popover-trigger-width)] z-[99]"
                  align="start"
                  onKeyDown={(e) => e.stopPropagation()}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command>
                    <CommandInput
                      placeholder="Buscar por nome ou email..."
                      autoFocus
                    />
                    <CommandList>
                      {users.length === 0 ? (
                        <CommandEmpty>Carregando usuários...</CommandEmpty>
                      ) : (
                        <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                      )}

                      <CommandGroup className="max-h-60 overflow-y-auto">
                        {users.map((user) => {
                          const userName =
                            user.username ||
                            user.email?.split("@")[0] ||
                            "Usuário";

                          return (
                            <CommandItem
                              key={user.id}
                              value={`${userName} ${user.email}`}
                              onSelect={() => {
                                setSelectedUserId(user.id);
                                setOpenUser(false);
                              }}
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4 flex-shrink-0",
                                  selectedUserId === user.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{userName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="pb-4">
            <div className="flex w-full max-w-64 min-w-0 flex-col gap-6">
              <div className="flex gap-4">
                <div className="flex flex-1 flex-col gap-3">
                  <Label htmlFor="date-from" className="px-1">
                    Início do empréstimo
                  </Label>
                  <Popover
                    open={openFrom}
                    onOpenChange={setOpenFrom}
                    modal={true}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-from"
                        className="w-full justify-between font-normal"
                      >
                        {dateFrom
                          ? dateFrom.toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0 z-[99]"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (!date) return;
                          setDateFrom(date);
                          setOpenFrom(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="time-from" className="invisible px-1">
                    From
                  </Label>
                  <Select
                    value={hourFrom.toString()}
                    onValueChange={(v) => setHourFrom(Number(v))}
                    disabled={beginHours.length == 0}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Itens" />
                    </SelectTrigger>
                    <SelectContent className="z-[999]">
                      {beginHours.map((val) => (
                        <SelectItem key={val} value={val.toString()}>
                          {`${val}h`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-1 flex-col gap-3">
                  <Label htmlFor="date-to" className="px-1">
                    Fim do empréstimo
                  </Label>
                  <Popover open={openTo} onOpenChange={setOpenTo} modal={true}>
                    <PopoverTrigger asChild disabled={isMaintenance}>
                      <Button
                        variant="outline"
                        id="date-to"
                        className="w-full justify-between font-normal"
                      >
                        {dateTo
                          ? dateTo.toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0 z-[99]"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (!date) return;
                          setDateTo(date);
                          setOpenTo(false);
                        }}
                        disabled={dateFrom && { before: dateFrom }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="time-to" className="invisible px-1">
                    To
                  </Label>
                  <Select
                    value={hourTo.toString()}
                    onValueChange={(v) => setHourTo(Number(v))}
                    disabled={endHours.length == 0 || isMaintenance}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Itens" />
                    </SelectTrigger>
                    <SelectContent className="z-[999]">
                      {endHours.map((val) => (
                        <SelectItem key={val} value={val.toString()}>
                          {`${val}h`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <Alert className="flex gap-3 my-4 w-fit">
            É manutenção?
            <Switch
              checked={isMaintenance}
              onCheckedChange={(checked) => setIsMaintenance(!isMaintenance)}
            />
          </Alert>
          <div className="grid gap-3 w-full">
            <Label htmlFor="asset_description">Observações</Label>
            <Textarea
              id="description"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          </div>
        </div>

        <div className="flex m-auto mt-8 items-center justify-end">
          <Button size="sm" onClick={submit}>
            Solicitar empréstimo
            <Package2 size={16} className="" />
          </Button>
        </div>
      </div>
    </main>
  );
}

export default AudiovisualTab;
