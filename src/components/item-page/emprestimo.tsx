import {
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { cn } from "../../lib";
import { Calendar } from "../ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Card, Carousel } from "../ui/apple-cards-carousel";
import {
  Trash,
  LucideIcon,
  Wrench,
  CalendarCheck,
  BookMarked,
  LucideAlarmClockOff,
  ChevronsUpDown,
  Check,
  CalendarIcon,
  ChevronDownIcon,
  Package2,
} from "lucide-react";
import { toast } from "sonner";
import { ArrowUUpLeft } from "phosphor-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { useModal } from "../hooks/use-modal-store";
import { useIsMobile } from "../../hooks/use-mobile";
import { Drawer, DrawerContent } from "../ui/drawer";
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

type ApiSituation = "UNUSED" | "BROKEN" | "UNECONOMICAL" | "RECOVERABLE";

// ===== Inventário em Local =====
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

// ===== Transferência =====
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

export type WorkflowEvent = {
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
};

type UUID = string;

type WorkflowHistoryItem = {
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
};

export interface CatalogResponseDTO {
  id: string;
  created_at: string;
  situation: ApiSituation;
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

export type TransferRequest = {
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
};

type LegalGuardian = {
  id: string;
  legal_guardians_name: string;
  legal_guardians_code: string;
};

const formatDateTimeBR = (iso?: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
};
interface AudiovisualTabProps {
  catalog: CatalogResponseDTO;
}

export function AudiovisualTab({ catalog }: AudiovisualTabProps) {
  const isMobile = useIsMobile();

  const { urlGeral } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token") || "";

  const images = useMemo(() => {
    return (catalog?.images ?? []).slice(0, 4).map((img, index) => {
      // Lógica do buildImgUrl movida para cá
      const p = img.file_path;
      const cleanPath = p?.startsWith("/") ? p.slice(1) : p;
      const fullUrl = `${urlGeral}${cleanPath}`;

      return {
        category: "",
        title: img.id || `${index}-${img.file_path}`,
        src: fullUrl,
      };
    });
  }, [catalog?.images, urlGeral]); // Adicionei urlGeral nas dependências
  const cards = useMemo(
    () =>
      images.map((card, index) => (
        <Card key={card.src} card={card} index={index} layout={true} />
      )),
    [images],
  );

  /* ================= Legal Guardian ================ */

  const guardianReqIdRef = useRef(0);
  const [openGuardian, setOpenGuardian] = useState(false);
  // termos de busca
  const [guardianQ, setGuardianQ] = useState("");
  const guardianQd = useDebounced(guardianQ, 300);
  // loading
  const [loading, setLoading] = useState({
    guardians: false,
  });

  const [observation, setObservation] = useState<string>("");
  const [legalGuardians, setLegalGuardians] = useState<LegalGuardian[]>([]);
  const [selectedGuardianId, setLegalGuardianId] = useState("");

  function useDebounced<T>(value: T, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const id = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
  }

  const fetchLegalGuardians = useCallback(
    async (q?: string) => {
      const reqId = ++guardianReqIdRef.current;
      setLoading((p) => ({ ...p, guardians: true }));
      try {
        const params = q ? `?q=${encodeURIComponent(q)}` : "";
        const res = await fetch(`${urlGeral}legal-guardians/${params}`, {
          headers: { Accept: "application/json" },
        });
        const json: { legal_guardians: LegalGuardian[] } = await res.json();
        if (guardianReqIdRef.current !== reqId) return; // resposta antiga
        setLegalGuardians(json.legal_guardians);
      } catch (e) {
        if (guardianReqIdRef.current === reqId) setLegalGuardians([]);
        console.error("Erro ao buscar responsáveis:", e);
      } finally {
        if (guardianReqIdRef.current === reqId)
          setLoading((p) => ({ ...p, guardians: false }));
      }
    },
    [urlGeral],
  );

  // carregar inicialmente
  useEffect(() => {
    fetchLegalGuardians(guardianQd);
  }, [fetchLegalGuardians, guardianQd]);

  const handleGuardianSelect = (id: string) => {
    const g = legalGuardians.find((x) => x.id === id);
    setLegalGuardianId(g?.id || "");
  };

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

  function getAvailableHours(dateFrom, workflow) {
    const year = dateFrom.getFullYear();
    const month = dateFrom.getMonth();
    const day = dateFrom.getDate();

    return hours.filter((hour) => {
      const timeToCheck = new Date(year, month, day, hour, 0, 0, 0).getTime();

      const hasConflict = workflow.some((item) => {
        try {
          const start = new Date(item.inicio.replace("Z", "")).getTime();
          const end = new Date(item.fim.replace("Z", "")).getTime();
          return timeToCheck >= start && timeToCheck < end;
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
        const wfStart = new Date(wf.inicio.replace("Z", "")).getTime();

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

  async function submit() {
    if (!dateFrom || !dateTo) {
      console.error("Datas não selecionadas");
      return;
    }

    const timestampFrom = mergeDateAndTime(dateFrom, hourFrom);
    const timestampTo = mergeDateAndTime(dateTo, hourTo);

    if (timestampTo <= timestampFrom) {
      toast.error(
        "Horário inválido! A hora final deve ser maior que a inicial.",
      );
      return;
    }

    const guardian = legalGuardians.find((g) => g.id === selectedGuardianId);

    const res = await fetch(`${urlGeral}catalog/${catalog?.id}/workflow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        workflow_status: "AUDIOVISUAL_EMPRESTIMO",
        detail: {
          inicio: timestampFrom,
          fim: timestampTo,
          legal_guardian: guardian,
          observation: observation,
        },
      }),
    });

    if (!res.ok) {
      // Tenta ler detalhes do erro (ex.: 422 com 'detail')
      let message = "Erro ao solicitar empréstimo";
      try {
        const err = await res.json();
        if (err?.detail) message = JSON.stringify(err.detail);
        toast.error(message);
      } catch {
        toast.error(message);
      }
      throw new Error(message);
    } else {
      toast.success("Solicitação de empréstimo realizada com sucesso!");
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
                modal={false}
                open={openGuardian}
                onOpenChange={(val) => {
                  setOpenGuardian(val);
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openGuardian}
                    className="w-full justify-between"
                  >
                    {selectedGuardianId
                      ? legalGuardians.find((g) => g.id === selectedGuardianId)
                          ?.legal_guardians_name
                      : loading.guardians
                        ? "Carregando..."
                        : "Selecione o responsável"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[320px] p-0 z-[9999] pointer-events-auto"
                  align="start"
                  sideOffset={6}
                >
                  <Command>
                    <CommandInput
                      placeholder="Buscar responsável (nome ou código)..."
                      onValueChange={(v) => {
                        setGuardianQ(v);
                        fetchLegalGuardians(v);
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {loading.guardians
                          ? "Carregando..."
                          : "Nenhum responsável encontrado."}
                      </CommandEmpty>
                      <CommandGroup>
                        {legalGuardians
                          .slice()
                          .sort((a, b) =>
                            a.legal_guardians_name.localeCompare(
                              b.legal_guardians_name,
                              "pt-BR",
                              { sensitivity: "base" },
                            ),
                          )
                          .map((g) => (
                            <CommandItem
                              key={g.id}
                              value={`${g.legal_guardians_name} ${g.legal_guardians_code}`}
                              onSelect={() => {
                                handleGuardianSelect(g.id);
                                setOpenGuardian(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedGuardianId === g.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm">
                                  {g.legal_guardians_name}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
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
