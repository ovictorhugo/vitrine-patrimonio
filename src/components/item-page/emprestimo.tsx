import { useContext, useState, useEffect } from "react";
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

/* ===================== Tipos DTO (mesmos da página) ===================== */

type UUID = string;

interface UnitDTO {
  id: string;
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
}
interface AgencyDTO {
  id: string;
  agency_name: string;
  agency_code: string;
  unit_id?: string;
  unit?: UnitDTO;
}
interface SectorDTO {
  id: string;
  sector_name: string;
  sector_code: string;
  agency_id?: string;
  agency?: AgencyDTO;
  unit_id?: string;
  unit?: UnitDTO;
}
interface LocationDTO {
  id: string;
  location_name: string;
  location_code: string;
  sector_id?: string;
  sector?: SectorDTO;
  legal_guardian_id?: string;
  legal_guardian?: LegalGuardianDTO;
  location_inventories?: LocationInventoryDTO[];
}
interface MaterialDTO {
  id: string;
  material_code: string;
  material_name: string;
}
interface LegalGuardianDTO {
  id: string;
  legal_guardians_code: string;
  legal_guardians_name: string;
}
interface AssetDTO {
  id: string;
  asset_code: string;
  asset_check_digit: string;
  atm_number: string;
  serial_number: string;
  asset_status: string;
  asset_value: string;
  asset_description: string;
  csv_code: string;
  accounting_entry_code: string;
  item_brand: string;
  item_model: string;
  group_type_code: string;
  group_code: string;
  expense_element_code: string;
  subelement_code: string;
  is_official?: boolean;
  material?: MaterialDTO | null;
  legal_guardian?: LegalGuardianDTO | null;
  location?: LocationDTO | null;
}
interface CatalogImageDTO {
  id: string;
  catalog_id: string;
  file_path: string;
}
interface InventoryDTO {
  key: string;
  avaliable: boolean;
  id: string;
  created_by: {
    id: string;
    username?: string;
    email?: string;
    photo_url?: string | null;
  };
}
interface LocationInventoryDTO {
  id: string;
  assets: string[];
  inventory: InventoryDTO;
  filled: boolean;
}
interface TransferRequestDTO {
  id: string;
  status: "PENDING" | "DECLINED" | "ACCEPTABLE" | string;
  user: {
    id: string;
    username?: string;
    email?: string;
    photo_url?: string | null;
  };
  location: LocationDTO;
}
interface WorkflowEvent {
  id: string;
  detail?: Record<string, any>;
  workflow_status: string;
  created_at: string; // ISO
  user?: {
    id: string;
    username?: string;
    email?: string;
    photo_url?: string;
  } | null;
  transfer_requests?: TransferRequestDTO[];
}
interface WorkflowHistoryItem {
  workflow_status: string;
  detail?: Record<string, any>;
  id: UUID;
  user: {
    id: UUID;
    username: string;
    email: string;
    provider: string;
    linkedin: string;
    lattes_id: string;
    orcid: string;
    ramal: string;
    photo_url: string;
    background_url: string;
    matricula: string;
    verify: boolean;
    institution_id: UUID;
  };
  catalog_id: UUID;
  created_at: string;
  transfer_requests?: TransferRequestDTO[];
}
interface CatalogResponseDTO {
  id: string;
  created_at: string;
  situation: string;
  conservation_status: string;
  description: string;
  asset: AssetDTO;
  files: Files | Files[] | null | undefined;
  user: {
    id: UUID;
    username: string;
    email: string;
    provider: string;
    linkedin: string;
    lattes_id: string;
    orcid: string;
    ramal: string;
    photo_url: string;
    background_url: string;
    matricula: string;
    verify: boolean;
    institution_id: UUID;
  };
  location: LocationDTO; // localização ATUAL do item no catálogo
  images: CatalogImageDTO[];
  workflow_history: WorkflowHistoryItem[];
  transfer_requests: TransferRequest[];
}
interface TransferRequest {
  id: string;
  status: string;
  user: {
    id: string;
    username: string;
    email: string;
    provider: string;
    linkedin: string;
    lattes_id: string;
    orcid: string;
    ramal: string;
    photo_url: string;
    background_url: string;
    matricula: string;
    verify: boolean;
    institution_id: string;
  };
  location: {
    legal_guardian_id: string;
    sector_id: string;
    location_name: string;
    location_code: string;
    id: string;
    sector: {
      agency_id: string;
      sector_name: string;
      sector_code: string;
      id: string;
      agency: {
        agency_name: string;
        agency_code: string;
        unit_id: string;
        id: string;
        unit: {
          unit_name: string;
          unit_code: string;
          unit_siaf: string;
          id: string;
        };
      };
    };
    legal_guardian: {
      legal_guardians_code: string;
      legal_guardians_name: string;
      id: string;
    };
  };
}
interface UserDTO {
  id: string;
  username: string;
  email: string;
  provider: string;
  linkedin: string;
  lattes_id: string;
  orcid: string;
  ramal: string;
  photo_url: string;
  background_url: string;
  matricula: string;
  verify: boolean;
  institution_id: string;
}

interface AudiovisualTabProps {
  catalog: CatalogResponseDTO;
}

export function AudiovisualTab({ catalog }: AudiovisualTabProps) {
  const { urlGeral, user } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token") || "";

  const [observation, setObservation] = useState<string>("");
  const [users, setUsers] = useState<UserDTO[]>([]);

  // Estados para o Combobox de Usuários
  const [openUser, setOpenUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Encontra o usuário completo baseado no ID selecionado
  const selectedUser = users.find((u) => u.id === selectedUserId);

  // Formata o nome para exibição (fallback para a primeira parte do email se não tiver username)
  const displaySelectedUser = selectedUser
    ? selectedUser.username || selectedUser.email?.split("@")[0] || "Usuário"
    : "Selecione o guardião temporário...";

  const asset = catalog?.asset;
  const titulo =
    asset?.material?.material_name ||
    asset?.item_model ||
    asset?.item_brand ||
    "Item sem nome";

  const calculateDifference = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDiff = Math.abs(currentDate.getTime() - createdDate.getTime());
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const months = Math.floor(daysDiff / 30);
    const days = daysDiff % 30;

    let bgColor = "";
    if (months < 3) bgColor = "bg-green-700";
    else if (months < 6) bgColor = "bg-yellow-500";
    else bgColor = "bg-red-500";

    return { months, days, bgColor };
  };

  const diff = catalog?.created_at
    ? calculateDifference(catalog.created_at)
    : null;

  interface WorkflowDetail {
    inicio: number | string; // Aceita timestamp ou string ISO
    fim: number | string;
    [key: string]: any; // Outros campos do detail
  }

  interface WorkflowItem {
    workflow_status: string;
    detail: WorkflowDetail;
    [key: string]: any; // Outros campos do workflow
  }

  interface WorkflowOutput {
    inicio: string | number;
    fim: string | number;
  }

  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);

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

  async function getWorkflows() {
    const res = await fetch(`${urlGeral}catalog/${catalog?.id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();
    const workflows = json?.workflow_history.filter((item) => {
      const statusValido = item.workflow_status === "AUDIOVISUAL_EMPRESTIMO";
      return statusValido;
    });

    setWorkflows(workflows);
  }

  useEffect(() => {
    getWorkflows();
  }, []);

  function getAvailableHours(dateFrom: Date, workflow: WorkflowOutput[]) {
    const year = dateFrom.getFullYear();
    const month = dateFrom.getMonth();
    const day = dateFrom.getDate();

    return hours.filter((hour) => {
      // Criamos o timestamp do slot de hora atual (ex: 14:00:00 até 14:59:59)
      const slotStart = new Date(year, month, day, hour, 0, 0, 0).getTime();
      const slotEnd = new Date(year, month, day, hour, 59, 59, 999).getTime();

      const hasConflict = workflow.some((item) => {
        try {
          const start = new Date(item.inicio).getTime();
          const end = new Date(item.fim).getTime();

          // Há conflito se o slot de hora intersecta o intervalo do workflow
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

    const conflictingWorkflows = workflows.reduce<WorkflowOutput[]>(
      (acc, item) => {
        if (!item.detail?.inicio || !item.detail?.fim) return acc;

        const inicioTimestamp = new Date(item.detail.inicio).setHours(
          0,
          0,
          0,
          0,
        );
        const fimTimestamp = new Date(item.detail.fim).setHours(0, 0, 0, 0);
        if (hora >= inicioTimestamp && hora <= fimTimestamp) {
          acc.push({
            inicio: item.detail.inicio,
            fim: item.detail.fim,
          });
        }
        return acc;
      },
      [],
    );

    try {
      setBeginHours(getAvailableHours(dateFrom, conflictingWorkflows));
    } catch (e) {
      toast.error("Sem data, tente novamente");
    }
  }, [dateFrom, workflows]);

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
          (v) => v > hourFrom && beginHours.includes(v) && v < firstConflict,
        ),
      );
    }
    // CASO 2: Dias diferentes
    else {
      if (!dateFrom || !dateTo) return;

      const hora = dateFromClean.getTime();
      let conflictingWorkflows = workflows.reduce<WorkflowOutput[]>(
        (acc, item) => {
          if (!item.detail?.inicio || !item.detail?.fim) return acc;

          const inicioTimestamp = new Date(item.detail.inicio).setHours(
            0,
            0,
            0,
            0,
          );
          const fimTimestamp = new Date(item.detail.fim).setHours(0, 0, 0, 0);

          // Pega tudo que começa depois de hoje OU termina depois de hoje
          if (hora < inicioTimestamp || hora < fimTimestamp) {
            acc.push({
              inicio: item.detail.inicio,
              fim: item.detail.fim,
            });
          }
          return acc;
        },
        [],
      );

      const availableTimes = beginHours.filter((n) => n > hourFrom).length;
      const totalTimes = hours.filter((n) => n > hourFrom).length;
      if (
        availableTimes < totalTimes &&
        dateFromClean.getTime() < dateToClean.getTime()
      ) {
        setEndHours([]);
        return;
      }

      dateFromClean.setHours(hourFrom, 0, 0, 0);
      const startMs = dateFromClean.getTime();

      // Encontramos o timestamp do PRIMEIRO conflito real que acontece a partir do horário de início
      let closestBarrier = Infinity;

      conflictingWorkflows.forEach((wf) => {
        if (typeof wf.inicio === "number") return;
        const wfStart = new Date(wf.inicio).getTime();

        // Se esse workflow começa DEPOIS (ou junto) do início escolhido pelo usuário
        if (wfStart >= startMs) {
          // Se ainda não temos barreira, ou se essa é anterior à atual...
          if (closestBarrier === Infinity || wfStart < closestBarrier) {
            closestBarrier = wfStart;
          }
        }
      });

      // --- DEFINIR AS HORAS FINAIS ---

      if (closestBarrier) {
        const barrierDate = new Date(closestBarrier);
        const barrierDayClean = new Date(closestBarrier).setHours(0, 0, 0, 0);
        const targetDayMs = dateToClean.getTime();

        // Cenário A: O bloqueio acontece ANTES de chegar no dia final selecionado.
        // Ex: Início dia 10, Fim dia 15. Bloqueio dia 12. Dia 15 fica inacessível.
        if (barrierDayClean < targetDayMs) {
          setEndHours([]);
        }
        // Cenário B: O bloqueio é EXATAMENTE no dia final.
        // Ex: Início dia 10, Fim dia 15. Bloqueio dia 15 às 14:00.
        // Liberamos as horas do dia 15 apenas até as 14:00.
        else if (barrierDayClean === targetDayMs) {
          const limitHour = barrierDate.getHours();
          // Só mostra horas menores ou iguais ao início do bloqueio
          setEndHours(hours.filter((h) => h <= limitHour));
        }
        // Cenário C: O bloqueio é num dia DEPOIS do dia final.
        // Ex: Início dia 10, Fim dia 12. Bloqueio dia 20.
        else {
          setEndHours(hours);
        }
      } else {
        // Sem conflitos futuros, dia liberado
        setEndHours(hours);
      }
    }
  }, [dateFrom, hourFrom, beginHours, dateTo, workflows]);

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
      console.log(json.users);
      setUsers(json.users);
    } catch (e) {
      console.error("Erro ao buscar usuários:", e);
    }
  }

  // carregar inicialmente
  useEffect(() => {
    fetchUsers();
  }, []);

  async function submit() {
    if (!dateFrom || !dateTo) return;
    const timestampFrom = mergeDateAndTime(dateFrom, hourFrom);
    const timestampTo = mergeDateAndTime(dateTo, hourTo);

    if (timestampTo <= timestampFrom) {
      toast.error(
        "Horário inválido! A hora final deve ser maior que a inicial.",
      );
      return;
    }

    const r = await fetch(`${urlGeral}loans/${catalog.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!r.ok) {
      toast.error("Falha ao pegar dados de empréstimo");
      throw new Error("Falha ao pegar dados de empréstimo");
    }

    const loan_data = await r.json();

    const res = await fetch(`${urlGeral}loans/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        loanable_item_id: loan_data?.id,
        start_at: timestampFrom,
        end_at: timestampTo,
        requester_id: user?.id,
        temporary_guardian_id: selectedUserId,
        is_maintenance: false,
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
        window.location.reload();
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
                    <PopoverTrigger asChild>
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
                    disabled={endHours.length == 0}
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
