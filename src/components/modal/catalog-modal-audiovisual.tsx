import {
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Textarea } from "../ui/textarea";
import { Link } from "react-router-dom";
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
import { Alert } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Card, Carousel } from "../ui/apple-cards-carousel";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Trash,
  Pencil,
  Home,
  Undo2,
  CheckIcon,
  HelpCircle,
  Archive,
  Hourglass,
  MoveRight,
  XIcon,
  User,
  ArrowRightLeft,
  CalendarIcon,
  ChevronDownIcon,
  Package2,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { ArrowSquareOut, ArrowUUpLeft } from "phosphor-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useModal } from "../hooks/use-modal-store";
import { useIsMobile } from "../../hooks/use-mobile";
import { Drawer, DrawerContent } from "../ui/drawer";
import { UserContext } from "../../context/context";
import { ScrollArea } from "../ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Tabs, TabsContent } from "../ui/tabs";
import { DownloadPdfButton } from "../download/download-pdf-button";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ItemLoanCalendar from "../dashboard/audiovisual/calendario-item";

/* ===================== Tipos DTO ===================== */
export type UUID = string;

export interface UserDTO {
  id: UUID;
  username: string;
  email: string;
  provider: string;
  linkedin: string | null;
  lattes_id: string | null;
  orcid: string | null;
  ramal: string | null;
  photo_url: string | null;
  background_url: string | null;
  matricula: string | null;
  verify: boolean;
  institution_id: UUID;
}

export interface LegalGuardianDTO {
  id: UUID;
  legal_guardians_code: string;
  legal_guardians_name: string;
}

export interface MaterialDTO {
  id: UUID;
  material_code: string;
  material_name: string;
}
export interface UnitDTO {
  id: UUID;
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
}

export interface AgencyDTO {
  id: UUID;
  agency_name: string;
  agency_code: string;
  unit_id: UUID;
  unit: UnitDTO;
}

export interface SectorDTO {
  id: UUID;
  sector_name: string;
  sector_code: string;
  agency_id: UUID;
  agency: AgencyDTO;
}
export interface LocationDTO {
  id: UUID;
  location_name: string;
  location_code: string;
  sector_id: UUID;
  legal_guardian_id: UUID;
  sector: SectorDTO;
  legal_guardian: LegalGuardianDTO;
}
export interface WorkflowHistoryDTO {
  id: UUID;
  workflow_status: string; // considere criar um union se tiver a enum
  detail?: Record<string, any>;
  user: UserDTO;
  transfer_requests?: any[];
  catalog_id: UUID;
  created_at: string;
}
export interface AssetDTO {
  id: UUID;
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

  material: MaterialDTO;
  legal_guardian: LegalGuardianDTO;
  location: LocationDTO;

  is_official: boolean;
}

export interface CatalogImageDTO {
  id: UUID;
  catalog_id: UUID;
  file_path: string;
}

export interface CatalogResponseDTO {
  id: UUID;
  description: string;
  conservation_status: string;
  situation: string; // ex.: "UNUSED" (crie union se tiver a lista completa)
  asset: AssetDTO;
  user: UserDTO;
  location: LocationDTO;
  images: CatalogImageDTO[];
  workflow_history: WorkflowHistoryDTO[];
  created_at: string;
}

export interface LoanDTO {
  id: UUID;
  loanable_item_id: UUID;
  requester_id: UUID | null;
  temporary_guardian_id: UUID;
  start_at: string;
  end_at: string | null;
  returned_at: string | null;
  is_confirmed: boolean;
  is_executed: boolean;
  is_returned: boolean;
  is_maintenance: boolean;
  lend_detail: string | null;
  returned_detail: string | null;
  rejection_reason: string | null;
  requester?: UserDTO;
  temporary_guardian?: UserDTO;
}
export interface LoanableItemDTO {
  id: UUID;
  catalog_id: UUID;
  legal_guardian_id: UUID;
  owner_notes: string | null;
  catalog: CatalogResponseDTO;
  guardian: UserDTO;
  loans: LoanDTO[];
}

const chain = (loc?: LocationDTO | null) => {
  if (!loc || !loc.sector) return [];
  const s = loc.sector;
  const a = s.agency;
  const u = a?.unit;
  const parts: string[] = [];
  if (u) parts.push(`${u.unit_code} - ${u.unit_name}`);
  if (a) parts.push(`${a.agency_code} - ${a.agency_name}`);
  parts.push(`${s.sector_code} - ${s.sector_name}`);
  parts.push(`${loc.location_code} - ${loc.location_name}`);
  return parts;
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

/* ===================== Componente Principal ===================== */
export function AudiovisualModal() {
  const isMobile = useIsMobile();
  const { onClose, isOpen, type: typeModal, data } = useModal();
  const isModalOpen = isOpen && typeModal === "audiovisual-modal";

  const { urlGeral, loggedIn, user } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token") || "";

  // CORREÇÃO AQUI: Cast duplo para extrair o objeto perfeitamente
  const loanItem = data as unknown as LoanableItemDTO | null;
  const catalog = loanItem?.catalog;

  const images = useMemo(() => {
    return (catalog?.images ?? []).slice(0, 4).map((img, index) => {
      const p = img.file_path;
      const cleanPath = p?.startsWith("/") ? p.slice(1) : p;
      const fullUrl = `${urlGeral}${cleanPath}`;
      return {
        category: "",
        title: img.id || `${index}-${img.file_path}`,
        src: fullUrl,
      };
    });
  }, [catalog?.images, urlGeral]);

  const cards = useMemo(
    () =>
      images.map((card, index) => (
        <Card key={card.src} card={card} index={index} layout={true} />
      )),
    [images],
  );

  const handleBack = () => onClose();
  const handleVoltar = () => onClose();

  const [observation, setObservation] = useState<string>("");
  const [users, setUsers] = useState<UserDTO[]>([]);

  const [openUser, setOpenUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const displaySelectedUser = selectedUser
    ? selectedUser.username || selectedUser.email?.split("@")[0] || "Usuário"
    : "Selecione o guardião temporário...";

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
    if (isModalOpen) fetchUsers();
  }, [isModalOpen]);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const closeDelete = () => setIsDeleteOpen(false);

  const handleConfirmDelete = useCallback(async () => {
    if (!catalog) return;
    try {
      setDeleting(true);
      const r = await fetch(`${urlGeral}catalog/${catalog.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("Falha ao excluir");
      toast("Item excluído com sucesso.");
      window.dispatchEvent(
        new CustomEvent("catalog:deleted", { detail: { id: catalog.id } }),
      );
      onClose();
    } catch (e: any) {
      toast("Erro ao excluir", {
        description: e?.message || "Tente novamente.",
      });
    } finally {
      setDeleting(false);
      setIsDeleteOpen(false);
    }
  }, [catalog, onClose, token, urlGeral]);

  const asset = catalog?.asset;
  const titulo = asset?.material?.material_name || "Item sem nome";

  const locCatalogoParts = chain(catalog?.location) ?? [];
  const visibleCatalogParts = !loggedIn
    ? locCatalogoParts.slice(0, 2)
    : locCatalogoParts;

  const locAssetParts = chain(asset?.location) ?? [];
  const visibleParts = !loggedIn ? locAssetParts.slice(0, 2) : locAssetParts;

  const isSameLocation =
    locCatalogoParts.join(" > ") === locAssetParts.join(" > ");

  const qualisColor: Record<string, string> = {
    BM: "bg-green-500",
    AE: "bg-red-500",
    IR: "bg-yellow-500",
    OC: "bg-blue-500",
    RE: "bg-purple-500",
  };
  const csvCodToText: Record<string, string> = {
    BM: "Bom",
    AE: "Anti-Econômico",
    IR: "Irrecuperável",
    OC: "Ocioso",
    RE: "Recuperável",
  };

  const statusMap: Record<string, { text: string; icon: JSX.Element }> = {
    NO: { text: "Normal", icon: <CheckIcon size={12} /> },
    NI: { text: "Não inventariado", icon: <HelpCircle size={12} /> },
    CA: { text: "Cadastrado", icon: <Archive size={12} /> },
    TS: { text: "Aguardando aceite", icon: <Hourglass size={12} /> },
    MV: { text: "Movimentado", icon: <MoveRight size={12} /> },
    BX: { text: "Baixado", icon: <XIcon size={12} /> },
  };

  const csvCodTrimmed = (asset?.csv_code || "").trim();
  const bemStaTrimmed = (asset?.asset_status || "").trim();
  const status = statusMap[bemStaTrimmed];
  const colorClassStr = qualisColor[csvCodTrimmed] || "bg-zinc-300";
  const borderColorClass = colorClassStr.replace("bg-", "border-");

  const tabs = [
    { id: "visao_geral", label: "Visão Geral", icon: Home },
    { id: "emprestimo", label: "Empréstimo", icon: ArrowRightLeft },
    { id: "calendario", label: "Calendário", icon: CalendarIcon },
  ];

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollAreaRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () =>
    scrollAreaRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () =>
    scrollAreaRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, []);

  const [tabOpen, setTabOpen] = useState("visao_geral");

  // Adaptação dos Empréstimos para manter sua lógica de Datas inalterada
  const workflows = useMemo(() => {
    if (!loanItem?.loans) return [];
    return loanItem.loans
      .filter(
        (l) => !l.is_returned && !l.rejection_reason && l.start_at && l.end_at,
      )
      .map((l) => ({
        workflow_status: "AUDIOVISUAL_EMPRESTIMO",
        detail: {
          inicio: l.start_at,
          fim: l.end_at,
        },
      }));
  }, [loanItem?.loans]);

  // =============== LÓGICA DE DATAS (Inalterada) ===============
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [hourFrom, setHourFrom] = useState<number>(11);
  const [hourTo, setHourTo] = useState<number>(12);
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  const [beginHours, setBeginHours] = useState<number[]>(hours);
  const [endHours, setEndHours] = useState<number[]>(hours);

  function getAvailableHours(dateFrom: Date, workflow: any[]) {
    const year = dateFrom.getFullYear();
    const month = dateFrom.getMonth();
    const day = dateFrom.getDate();

    return hours.filter((hour) => {
      const slotStart = new Date(year, month, day, hour, 0, 0, 0).getTime();
      const slotEnd = new Date(year, month, day, hour, 59, 59, 999).getTime();

      const hasConflict = workflow.some((item) => {
        try {
          const start = new Date(item.inicio).getTime();
          const end = new Date(item.fim).getTime();
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

    const conflictingWorkflows = workflows.reduce<any[]>((acc, item) => {
      if (!item.detail?.inicio || !item.detail?.fim) return acc;
      const inicioTimestamp = new Date(item.detail.inicio).setHours(0, 0, 0, 0);
      const fimTimestamp = new Date(item.detail.fim).setHours(0, 0, 0, 0);
      if (hora >= inicioTimestamp && hora <= fimTimestamp) {
        acc.push({ inicio: item.detail.inicio, fim: item.detail.fim });
      }
      return acc;
    }, []);

    setBeginHours(getAvailableHours(dateFrom, conflictingWorkflows));
  }, [dateFrom, workflows]);

  useEffect(() => {
    const dateFromClean = new Date(dateFrom);
    dateFromClean.setHours(0, 0, 0, 0);
    const dateToClean = new Date(dateTo);
    dateToClean.setHours(0, 0, 0, 0);

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
    } else {
      if (!dateFrom || !dateTo) return;
      const hora = dateFromClean.getTime();
      let conflictingWorkflows = workflows.reduce<any[]>((acc, item) => {
        if (!item.detail?.inicio || !item.detail?.fim) return acc;
        const inicioTimestamp = new Date(item.detail.inicio).setHours(
          0,
          0,
          0,
          0,
        );
        const fimTimestamp = new Date(item.detail.fim).setHours(0, 0, 0, 0);
        if (hora < inicioTimestamp || hora < fimTimestamp) {
          acc.push({ inicio: item.detail.inicio, fim: item.detail.fim });
        }
        return acc;
      }, []);

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
      let closestBarrier = Infinity;

      conflictingWorkflows.forEach((wf) => {
        if (typeof wf.inicio === "number") return;
        const wfStart = new Date(wf.inicio.replace("Z", "")).getTime();
        if (
          wfStart >= startMs &&
          (closestBarrier === Infinity || wfStart < closestBarrier)
        ) {
          closestBarrier = wfStart;
        }
      });

      if (closestBarrier !== Infinity) {
        const barrierDate = new Date(closestBarrier);
        const barrierDayClean = new Date(closestBarrier).setHours(0, 0, 0, 0);
        const targetDayMs = dateToClean.getTime();

        if (barrierDayClean < targetDayMs) setEndHours([]);
        else if (barrierDayClean === targetDayMs)
          setEndHours(hours.filter((h) => h <= barrierDate.getHours()));
        else setEndHours(hours);
      } else {
        setEndHours(hours);
      }
    }
  }, [dateFrom, hourFrom, beginHours, dateTo, workflows]);

  const mergeDateAndTime = (date: Date, time: number): Date => {
    const newDate = new Date(date);
    newDate.setHours(time, 0, 0, 0);
    return newDate;
  };

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

    const res = await fetch(`${urlGeral}loans/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        loanable_item_id: loanItem?.id, // ID CORRETO VINDO DO LOANABLE ITEM
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
      } catch {}
      toast.error(message);
    } else {
      toast.success("Solicitação de empréstimo realizada com sucesso!");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      if (onClose) onClose();
    }
  }

  // =============== Render JSX ===============
  const content = () => {
    if (!catalog) {
      return (
        <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-8">
          <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
            (⊙_⊙)
          </p>
          <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1]">
            Não foi possível acessar as <br /> informações deste item.
          </h1>
          <div className="flex gap-3 mt-8">
            <Button onClick={handleVoltar} variant={"ghost"}>
              <Undo2 size={16} /> Voltar
            </Button>
            <Link to={"/"}>
              <Button>
                <Home size={16} /> Página Inicial
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <main
        className={`grid flex-col gap-4 md:gap-8 border-b-[12px] rounded-b-lg overflow-hidden ${borderColorClass}`}
      >
        <div className="flex items-center gap-4 p-8 pb-0">
          <Button
            onClick={handleBack}
            variant="outline"
            size="icon"
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>

          <h1 className="flex-1 flex flex-wrap gap-2 items-center text-xl font-semibold tracking-tight">
            Detalhes do item {asset?.asset_code}-{asset?.asset_check_digit}
          </h1>

          <div className="hidden md:flex items-center gap-2">
            <DownloadPdfButton
              filters={{}}
              id={catalog.id}
              label="Baixar Item"
              method={"item"}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link target="_blank" to={`/item?id=${catalog.id}`}>
                    <Button variant="outline" size="icon">
                      <ArrowSquareOut size={16} />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="z-[99]">Ir a página</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <ScrollArea className="max-h-[70vh] border-solid">
          <div className="px-8">
            <div className="grid grid-cols-1">
              <Carousel items={cards} />

              <div className="flex flex-1 h-full lg:flex-row flex-col-reverse gap-8">
                <div className="flex w-full flex-col">
                  <div className="flex justify-between items-start">
                    <div className="flex justify-between w-full">
                      <h2 className="text-3xl font-semibold leading-none tracking-tight mb-2">
                        {titulo}
                      </h2>

                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-2 items-center">
                        <CalendarIcon size={16} />
                        {formatDateTimeBR(catalog.created_at)}
                      </div>
                    </div>
                  </div>

                  <p
                    className={
                      isMobile
                        ? "mb-4 mt-6 text-gray-500 text-sm"
                        : "mb-4 mt-6 text-gray-500"
                    }
                  >
                    {asset?.asset_description || "Sem descrição."}
                  </p>

                  <Tabs defaultValue="visao_geral" value={tabOpen} className="">
                    <div className="mb-8 bg-white dark:bg-neutral-950 border rounded-md p-2 px-4 pb-0 dark:border-neutral-800">
                      <div className="relative grid grid-cols-1 w-full ">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`absolute left-0 z-10 h-8 w-8 p-0 top-1 ${
                            !canScrollLeft
                              ? "opacity-30 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={scrollLeft}
                          disabled={!canScrollLeft}
                        >
                          <ChevronLeft size={16} />
                        </Button>

                        <div className="mx-10">
                          <div
                            ref={scrollAreaRef}
                            className="overflow-x-auto scrollbar-hide"
                            onScroll={checkScrollability}
                          >
                            <div className="flex gap-2 h-auto bg-transparent dark:bg-transparent">
                              {tabs.map(({ id, label, icon: Icon }) => (
                                <div
                                  key={id}
                                  className={`pb-2 border-b-2 transition-all text-black dark:text-white ${
                                    tabOpen === id
                                      ? "border-b-[#719CB8]"
                                      : "border-b-transparent"
                                  }`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setTabOpen(id);
                                  }}
                                >
                                  <Button
                                    variant="ghost"
                                    className="m-0 flex items-center gap-2"
                                  >
                                    <Icon size={16} />
                                    {label}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className={`absolute right-0 z-10 h-8 w-8 p-0 top-1 ${
                            !canScrollRight
                              ? "opacity-30 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={scrollRight}
                          disabled={!canScrollRight}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>

                    {/* ===== Visão Geral ===== */}
                    <TabsContent value="visao_geral">
                      <div>
                        <>
                          <div className="flex group ">
                            <div
                              className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${
                                qualisColor[
                                  csvCodTrimmed as keyof typeof qualisColor
                                ] || "bg-zinc-300"
                              } min-h-full`}
                            />
                            <Alert className="flex flex-col flex-1 h-fit rounded-l-none p-0">
                              <div className="flex mb-1 gap-3 justify-between p-4 pb-0">
                                <p className="font-semibold flex gap-3 items-center text-left mb-4 flex-1">
                                  {asset?.asset_code?.trim()} -{" "}
                                  {asset?.asset_check_digit}
                                  {!!asset?.atm_number &&
                                    asset.atm_number !== "None" && (
                                      <Badge variant="outline">
                                        ATM: {asset.atm_number}
                                      </Badge>
                                    )}
                                </p>
                              </div>

                              <div className="flex flex-col p-4 pt-0 justify-between">
                                <div>
                                  <div className="flex flex-wrap gap-3">
                                    {!!asset?.csv_code &&
                                      asset?.csv_code !== "None" && (
                                        <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                          <div
                                            className={`w-4 h-4 rounded-md ${
                                              qualisColor[
                                                csvCodTrimmed as keyof typeof qualisColor
                                              ] || "bg-zinc-300"
                                            }`}
                                          />
                                          {csvCodToText[
                                            csvCodTrimmed as keyof typeof csvCodToText
                                          ] || "—"}
                                        </div>
                                      )}

                                    {status && (
                                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                        {status.icon}
                                        {status.text}
                                      </div>
                                    )}

                                    {loggedIn && (
                                      <>
                                        {!!asset?.legal_guardian &&
                                          asset.legal_guardian
                                            .legal_guardians_name !==
                                            "None" && (
                                            <div className="flex gap-1 items-center">
                                              <Avatar className="rounded-md h-5 w-5">
                                                <AvatarImage
                                                  className="rounded-md h-5 w-5"
                                                  src={`${urlGeral}ResearcherData/Image?name=${asset.legal_guardian.legal_guardians_name}`}
                                                />
                                                <AvatarFallback className="flex items-center justify-center">
                                                  <User size={10} />
                                                </AvatarFallback>
                                              </Avatar>
                                              <p className="text-sm text-gray-500 dark:text-gray-300 font-normal">
                                                {
                                                  asset.legal_guardian
                                                    .legal_guardians_name
                                                }
                                              </p>
                                            </div>
                                          )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Alert>
                          </div>
                        </>

                        <div className="flex mt-[30px]">
                          <div
                            className={`w-2 min-w-2 rounded-l-md border border-r-0 bg-eng-blue`}
                          />
                          <Alert className="flex flex-col rounded-l-none">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <MapPin size={16} />
                                <p className="text-sm uppercase font-bold">
                                  Local de tombamento:
                                </p>

                                {visibleParts.length ? (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {visibleParts.map((p, i) => (
                                      <div
                                        key={i}
                                        className={
                                          isMobile
                                            ? "text-xs text-gray-500 dark:text-gray-300 flex items-center gap-2"
                                            : "text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2"
                                        }
                                      >
                                        {i > 0 && <ChevronRight size={14} />}{" "}
                                        {p}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span
                                    className={
                                      isMobile
                                        ? "text-xs text-gray-500"
                                        : "text-sm text-gray-500"
                                    }
                                  >
                                    Não definido.
                                  </span>
                                )}
                              </div>

                              {!isSameLocation && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <MapPin size={16} />
                                  <p className="text-sm uppercase font-bold">
                                    Local atual:
                                  </p>

                                  {visibleCatalogParts.length ? (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {visibleCatalogParts.map((p, i) => (
                                        <div
                                          key={i}
                                          className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2"
                                        >
                                          {i > 0 && <ChevronRight size={14} />}{" "}
                                          {p}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      Não definido.
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </Alert>
                        </div>

                        {loggedIn && (
                          <Link
                            to={`/user?id=${catalog.user?.id}`}
                            target="_blank"
                          >
                            <Alert className="my-8">
                              <div className="flex gap-3 items-center">
                                <Avatar className="rounded-md h-12 w-12">
                                  <AvatarImage
                                    className=""
                                    src={`${urlGeral}user/upload/${catalog.user?.id}/icon`}
                                  />
                                  <AvatarFallback className="flex items-center justify-center">
                                    <User size={16} />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm w-fit text-gray-500">
                                    Anunciante
                                  </p>
                                  <p className="text-black dark:text-white font-medium text-lg truncate">
                                    {catalog.user?.username}
                                  </p>
                                </div>
                              </div>
                            </Alert>
                          </Link>
                        )}
                      </div>
                    </TabsContent>
                    {/* ===== Empréstimo ===== */}
                    <TabsContent value="emprestimo">
                      <div>
                        <>
                          <div className="grid gap-6 w-full">
                            <div className="grid gap-3 w-full">
                              <Label>Responsável</Label>

                              <div className="flex-1">
                                <Popover
                                  open={openUser}
                                  onOpenChange={setOpenUser}
                                  modal={true}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={openUser}
                                      className={cn(
                                        "w-full justify-between font-normal z-[99]",
                                        !selectedUserId &&
                                          "text-muted-foreground",
                                      )}
                                    >
                                      <span className="truncate">
                                        {displaySelectedUser}
                                      </span>
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
                                          <CommandEmpty>
                                            Carregando usuários...
                                          </CommandEmpty>
                                        ) : (
                                          <CommandEmpty>
                                            Nenhum usuário encontrado.
                                          </CommandEmpty>
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

                            <div className="">
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
                                            ? dateFrom.toLocaleDateString(
                                                "pt-BR",
                                                {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric",
                                                },
                                              )
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
                                    <Label
                                      htmlFor="time-from"
                                      className="invisible px-1"
                                    >
                                      From
                                    </Label>
                                    <Select
                                      value={hourFrom.toString()}
                                      onValueChange={(v) =>
                                        setHourFrom(Number(v))
                                      }
                                      disabled={beginHours.length == 0}
                                    >
                                      <SelectTrigger className="w-[100px]">
                                        <SelectValue placeholder="Itens" />
                                      </SelectTrigger>
                                      <SelectContent className="z-[999]">
                                        {beginHours.map((val) => (
                                          <SelectItem
                                            key={val}
                                            value={val.toString()}
                                          >
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
                                    <Popover
                                      open={openTo}
                                      onOpenChange={setOpenTo}
                                      modal={true}
                                    >
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          id="date-to"
                                          className="w-full justify-between font-normal"
                                        >
                                          {dateTo
                                            ? dateTo.toLocaleDateString(
                                                "pt-BR",
                                                {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric",
                                                },
                                              )
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
                                          disabled={
                                            dateFrom && { before: dateFrom }
                                          }
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <div className="flex flex-col gap-3">
                                    <Label
                                      htmlFor="time-to"
                                      className="invisible px-1"
                                    >
                                      To
                                    </Label>
                                    <Select
                                      value={hourTo.toString()}
                                      onValueChange={(v) =>
                                        setHourTo(Number(v))
                                      }
                                      disabled={endHours.length == 0}
                                    >
                                      <SelectTrigger className="w-[100px]">
                                        <SelectValue placeholder="Itens" />
                                      </SelectTrigger>
                                      <SelectContent className="z-[999]">
                                        {endHours.map((val) => (
                                          <SelectItem
                                            key={val}
                                            value={val.toString()}
                                          >
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
                              <Label htmlFor="asset_description">
                                Observações
                              </Label>
                              <Textarea
                                id="description"
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                              />
                            </div>
                          </div>
                        </>
                        <div className="flex m-auto my-8 items-center justify-end">
                          <Button size="sm" onClick={submit}>
                            Solicitar empréstimo
                            <Package2 size={16} className="" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    {/* ===== Calendário ===== */}
                    <TabsContent value="calendario">
                      <div>
                        <ItemLoanCalendar item={loanItem} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Dialog de confirmação de delete */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
                Deletar item {titulo} do catálogo
              </DialogTitle>
              <DialogDescription className="text-zinc-500 ">
                Esta ação é irreversível. Ao deletar, todas as informações deste
                item no catálogo serão perdidas.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="">
              <Button variant="ghost" onClick={closeDelete}>
                <ArrowUUpLeft size={16} /> Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                <Trash size={16} /> {deleting ? "Deletando…" : "Deletar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    );
  };

  if (isMobile) {
    return (
      <Drawer open={isModalOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[80vh] flex flex-col">
          {content()}
        </DrawerContent>
      </Drawer>
    );
  } else {
    return (
      <Dialog open={isModalOpen} onOpenChange={onClose}>
        <DialogContent className="p-0 min-w-[65vw]">{content()}</DialogContent>
      </Dialog>
    );
  }
}

export default AudiovisualModal;
