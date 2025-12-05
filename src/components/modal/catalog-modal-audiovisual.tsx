import {
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
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
  LucideIcon,
  Workflow,
  ArrowRightLeft,
  Wrench,
  BookmarkPlus,
  CalendarCheck,
  BookMarked,
  LucideAlarmClockOff,
  ChevronsUpDown,
  Check,
  CalendarIcon,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { HeaderResultTypeHome } from "../header-result-type-home";

import { useModal } from "../hooks/use-modal-store";
import { useIsMobile } from "../../hooks/use-mobile";
import { Drawer, DrawerContent } from "../ui/drawer";
import { UserContext } from "../../context/context";
import { ScrollArea } from "../ui/scroll-area";
import { LikeButton } from "../item-page/like-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Tabs, TabsContent } from "../ui/tabs";
import { usePermissions } from "../permissions";
import { Files } from "../homepage/components/documents-tab-catalog";
import { DownloadPdfButton } from "../download/download-pdf-button";
import { Input } from "../ui/input";
import { type DateRange } from "react-day-picker";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

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
interface Patrimonio {
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
  id: string;
  agency: { agency_name: string; agency_code: string; id: string };
  unit: { unit_name: string; unit_code: string; unit_siaf: string; id: string };
  sector: { sector_name: string; sector_code: string; id: string };
  location: { location_code: string; location_name: string; id: string };
  material: { id: string; material_code: string; material_name: string };
  legal_guardian: {
    id: string;
    legal_guardians_code: string;
    legal_guardians_name: string;
  };
  is_official: boolean;
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

type WorkflowStatus =
  | "STARTED"
  | "VALIDATION_VITRINE"
  | "VALIDATION_UNDOING"
  | "VALIDATION_REJECTED"
  | "VALIDATION_APPROVED"
  | "PUBLISHED"
  | "ARCHIVED"
  | string;

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

export interface CatalogResponseDTO {
  id: string;
  created_at: string;
  situation: ApiSituation;
  conservation_status: string;
  description: string;
  asset: AssetDTO;
  user?: {
    id: string;
    username: string;
    email: string;
  } | null;
  location?: LocationDTO | null;
  images: CatalogImageDTO[];
  files: Files | Files[] | null | undefined;
  workflow_history?: WorkflowEvent[];
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

/* ===================== Utils ===================== */

const WORKFLOW_STATUS_META: Record<
  string,
  { Icon: LucideIcon; colorClass: string }
> = {
  AUDIOVISUAL_ANUNCIADO: { Icon: BookMarked, colorClass: "text-amber-500" },
  AUDIOVISUAL_EMPRESTIMO: { Icon: CalendarCheck, colorClass: "text-blue-500" },
  AUDIOVISUAL_ATRASADO: {
    Icon: LucideAlarmClockOff,
    colorClass: "text-green-600",
  },
  AUDIOVISUAL_QUEBRADO: { Icon: Wrench, colorClass: "text-indigo-500" },
};

const WORKFLOW_STATUS_LABELS: Record<string, string> = {
  AUDIOVISUAL_ANUNCIADO: "Item disponível para empréstimo",
  AUDIOVISUAL_EMPRESTIMO: "Item emprestado",
  AUDIOVISUAL_ATRASADO: "Item em estado de atraso",
  AUDIOVISUAL_QUEBRADO: "Item foi quebrado",

  STARTED: "Iniciado",
  REVIEW_REQUESTED_VITRINE: "Avaliação S. Patrimônio - Vitrine",
  ADJUSTMENT_VITRINE: "Ajustes - Vitrine",
  VITRINE: "Anunciados",
  AGUARDANDO_TRANSFERENCIA: "Aguardando Transferência",
  TRANSFERIDOS: "Transferidos",
  REVIEW_REQUESTED_DESFAZIMENTO: "Avaliação S. Patrimônio - Desfazimento",
  ADJUSTMENT_DESFAZIMENTO: "Ajustes - Desfazimento",
  REVIEW_REQUESTED_COMISSION: "LTD - Lista Temporária de Desfazimento",
  REJEITADOS_COMISSAO: "Recusados",
  DESFAZIMENTO: "LFD - Lista Final de Desfazimento",
  DESCARTADOS: "Processo Finalizado",
  ACERVO_HISTORICO: "Acervo Histórico",
};

const chain = (loc?: LocationDTO | null) => {
  if (!loc || !loc.sector) return [];
  const s = loc.sector;
  const a = s.agency;
  const u = a?.unit ?? s.unit;
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

export function AudiovisualModal() {
  const isMobile = useIsMobile();
  const { onClose, isOpen, type: typeModal, data } = useModal();
  const isModalOpen = isOpen && typeModal === "catalog-modal";

  const { urlGeral, user, loggedIn } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token") || "";

  // Se você passa data.catalog, uso, senão tento data direto
  const catalog = (data as any)?.catalog ?? (data as CatalogResponseDTO | null);

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
    [images]
  );
  const historySortedDesc = useMemo(() => {
    const hist = catalog?.workflow_history ?? [];
    return [...hist].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [catalog?.workflow_history]);

  // Sempre pega o status atual real (último workflow cronológico)
  const lastWorkflow = historySortedDesc[0];

  const { hasCatalogo, hasAcervoHistorico } = usePermissions();

  const handleBack = () => onClose(); // no modal, voltar = fechar
  const handleVoltar = () => onClose();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

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

  /** objeto “em branco” seguro */
  const blankPatrimonio = (): Patrimonio => ({
    asset_code: "",
    asset_check_digit: "",
    atm_number: "",
    serial_number: "",
    asset_status: "NI",
    asset_value: "",
    asset_description: "",
    csv_code: "",
    accounting_entry_code: "",
    item_brand: "",
    item_model: "",
    group_type_code: "",
    group_code: "",
    expense_element_code: "",
    subelement_code: "",
    id: "",
    agency: { agency_name: "", agency_code: "", id: "" },
    unit: { unit_name: "", unit_code: "", unit_siaf: "", id: "" },
    sector: { sector_name: "", sector_code: "", id: "" },
    location: { location_code: "", location_name: "", id: "" },
    material: { id: "", material_code: "", material_name: "" },
    legal_guardian: {
      id: "",
      legal_guardians_code: "",
      legal_guardians_name: "",
    },
    is_official: false,
  });

  const [objectData, setObjectData] = useState<Patrimonio>(blankPatrimonio());

  // listas e seleção (Material/Responsável)
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

  const patch = (partial: Partial<Patrimonio>) =>
    setObjectData((prev) => ({ ...prev, ...partial }));

  const handleChange =
    (field: keyof Patrimonio) => (e: React.ChangeEvent<HTMLInputElement>) => {
      patch({ [field]: e.target.value } as Partial<Patrimonio>);
    };

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
    [urlGeral]
  );

  // carregar inicialmente
  useEffect(() => {
    fetchLegalGuardians(guardianQd);
  }, [fetchLegalGuardians, guardianQd]);

  const handleGuardianSelect = (id: string) => {
    const g = legalGuardians.find((x) => x.id === id);
    setLegalGuardianId(g?.id || "");
    patch({
      legal_guardian: g
        ? {
            id: g.id,
            legal_guardians_code: g.legal_guardians_code,
            legal_guardians_name: g.legal_guardians_name,
          }
        : { id: "", legal_guardians_code: "", legal_guardians_name: "" },
    });
  };

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openDelete = () => setIsDeleteOpen(true);
  const closeDelete = () => setIsDeleteOpen(false);

  const handleConfirmDelete = useCallback(async () => {
    if (!catalog) return;
    try {
      setDeleting(true);
      const r = await fetch(`${urlGeral}catalog/${catalog.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`Falha ao excluir (${r.status}): ${t}`);
      }
      toast("Item excluído com sucesso.");
      try {
        window.dispatchEvent(
          new CustomEvent("catalog:deleted", { detail: { id: catalog.id } })
        );
      } catch {}
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
  const titulo =
    asset?.material?.material_name ||
    asset?.item_model ||
    asset?.item_brand ||
    "Item sem nome";

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
    NI: { text: "Não inventariado", icon: (<HelpCircle size={12} />) as any },
    CA: { text: "Cadastrado", icon: <Archive size={12} /> },
    TS: { text: "Aguardando aceite", icon: <Hourglass size={12} /> },
    MV: { text: "Movimentado", icon: <MoveRight size={12} /> },
    BX: { text: "Baixado", icon: <XIcon size={12} /> },
  };

  const csvCodTrimmed = (asset?.csv_code || "").trim();
  const bemStaTrimmed = (asset?.asset_status || "").trim();
  const status = statusMap[bemStaTrimmed];

  const colorClassStr =
    qualisColor[csvCodTrimmed as keyof typeof qualisColor] || "bg-zinc-300";
  const borderColorClass = colorClassStr.replace("bg-", "border-");

  const getStatusLabel = (status: WorkflowStatus) =>
    WORKFLOW_STATUS_LABELS[status] ?? status;

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

  // Agora você pode acessar com segurança
  const [workflowReview, setWorkflowReview] = useState(false);
  const [workflowAnunciados, setWorkflowAnunciados] = useState(false);

  useEffect(() => {
    if (!catalog) return;

    const current = historySortedDesc[0]?.workflow_status;

    const isReview =
      current === "REVIEW_REQUESTED_DESFAZIMENTO" ||
      current === "REVIEW_REQUESTED_VITRINE" ||
      current === "ADJUSTMENT_VITRINE" ||
      current === "ADJUSTMENT_DESFAZIMENTO" ||
      current === "REJEITADOS_COMISSAO";

    const isAnunciado = current === "VITRINE";

    setWorkflowReview(isReview);
    setWorkflowAnunciados(isAnunciado);
  }, [catalog, historySortedDesc]);

  const tabs = [
    { id: "visao_geral", label: "Visão Geral", icon: Home },
    { id: "emprestimo", label: "Empréstimo", icon: ArrowRightLeft },
  ];

  // Componente principal
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

  const scrollLeft = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [tabOpen, setTabOpen] = useState("visao_geral");

  //////////////JUSTIFICATIVA E AVALIADOR

  const REVIEWER_VISIBLE_STATUSES = new Set([
    "REVIEW_REQUESTED_COMISSION",
    "REJEITADOS_COMISSAO",
    "DESFAZIMENTO",
    "DESCARTADOS",
    "REVIEW_REQUESTED_VITRINE",
    "ADJUSTMENT_VITRINE",
    "REVIEW_REQUESTED_DESFAZIMENTO",
    "ADJUSTMENT_DESFAZIMENTO",
  ]);

  const JUSTIFICATION_VISIBLE_STATUSES = new Set([
    "REJEITADOS_COMISSAO",
    "DESFAZIMENTO",
    "DESCARTADOS",
    "REVIEW_REQUESTED_VITRINE",
    "ADJUSTMENT_VITRINE",
    "REVIEW_REQUESTED_DESFAZIMENTO",
    "ADJUSTMENT_DESFAZIMENTO",
  ]);

  function findFirstWorkflowByStatuses(
    list: any,
    statuses: string[]
  ): WorkflowEvent | undefined {
    if (!list?.length) return undefined;
    return list.find((ev: WorkflowEvent) =>
      statuses.includes(ev.workflow_status)
    );
  }

  function getDetail(
    ev?: WorkflowEvent | null
  ): Record<string, any> | undefined {
    if (!ev) return undefined;
    return (ev as any).detail ?? undefined;
  }

  function pickJustificativa(detail?: Record<string, any>): string | undefined {
    if (!detail) return undefined;
    const j = detail.justificativa;
    return typeof j === "string" && j.trim() ? j : undefined;
  }

  function pickUserFromEvent(
    ev?: WorkflowEvent | null
  ): { id?: string; username?: string } | undefined {
    const u = (ev as any)?.user;
    if (u && (u.id || u.username)) {
      return { id: u.id, username: u.username };
    }
    return undefined;
  }

  const currentStatus = lastWorkflow?.workflow_status ?? "";
  const shouldShowReviewer = REVIEWER_VISIBLE_STATUSES.has(currentStatus);
  const shouldShowJustification =
    JUSTIFICATION_VISIBLE_STATUSES.has(currentStatus);

  const reviewerFromCommission = useMemo(() => {
    if (!shouldShowReviewer) return undefined;

    const firstCommission = findFirstWorkflowByStatuses(
      catalog?.workflow_history,
      ["REVIEW_REQUESTED_COMISSION"]
    );
    const commissionDetail = getDetail(firstCommission);
    const reviewerFromDetail = commissionDetail?.reviewers?.[0];

    if (
      reviewerFromDetail &&
      (reviewerFromDetail.id || reviewerFromDetail.username)
    ) {
      return reviewerFromDetail as { id?: string; username?: string };
    }

    const reviewerFromCommissionUser = pickUserFromEvent(firstCommission);
    if (reviewerFromCommissionUser) return reviewerFromCommissionUser;

    if (
      [
        "REVIEW_REQUESTED_VITRINE",
        "ADJUSTMENT_VITRINE",
        "REVIEW_REQUESTED_DESFAZIMENTO",
        "ADJUSTMENT_DESFAZIMENTO",
      ].includes(currentStatus)
    ) {
      const firstAdjustment =
        findFirstWorkflowByStatuses(catalog?.workflow_history, [
          "ADJUSTMENT_VITRINE",
        ]) ??
        findFirstWorkflowByStatuses(catalog?.workflow_history, [
          "ADJUSTMENT_DESFAZIMENTO",
        ]);
      const reviewerFromAdjustmentUser = pickUserFromEvent(firstAdjustment);
      if (reviewerFromAdjustmentUser) return reviewerFromAdjustmentUser;
    }

    return undefined;
  }, [shouldShowReviewer, currentStatus, catalog?.workflow_history]);

  const justificationText = useMemo(() => {
    if (!shouldShowJustification) return undefined;

    let wf: WorkflowEvent | undefined;

    if (currentStatus === "REJEITADOS_COMISSAO") {
      wf = findFirstWorkflowByStatuses(catalog?.workflow_history, [
        "REJEITADOS_COMISSAO",
      ]);
    } else if (
      currentStatus === "DESFAZIMENTO" ||
      currentStatus === "DESCARTADOS"
    ) {
      wf = findFirstWorkflowByStatuses(catalog?.workflow_history, [
        "DESFAZIMENTO",
      ]);
    } else if (currentStatus === "REVIEW_REQUESTED_COMISSION") {
      wf = findFirstWorkflowByStatuses(catalog?.workflow_history, [
        "REVIEW_REQUESTED_COMISSION",
      ]);
    } else if (
      [
        "REVIEW_REQUESTED_VITRINE",
        "ADJUSTMENT_VITRINE",
        "REVIEW_REQUESTED_DESFAZIMENTO",
        "ADJUSTMENT_DESFAZIMENTO",
      ].includes(currentStatus)
    ) {
      wf =
        findFirstWorkflowByStatuses(catalog?.workflow_history, [
          "ADJUSTMENT_VITRINE",
        ]) ??
        findFirstWorkflowByStatuses(catalog?.workflow_history, [
          "ADJUSTMENT_DESFAZIMENTO",
        ]);
    } else {
      return undefined;
    }

    const detail = getDetail(wf);
    return pickJustificativa(detail);
  }, [shouldShowJustification, currentStatus, catalog?.workflow_history]);

  ///// ACERVO HISTÓRICO

  const currentStatusFromServer = lastWorkflow?.workflow_status ?? "";
  const [isAcervoHistoricoLocal, setIsAcervoHistoricoLocal] = useState(
    currentStatusFromServer === "ACERVO_HISTORICO"
  );

  useEffect(() => {
    console.log();
    setIsAcervoHistoricoLocal(
      (lastWorkflow?.workflow_status ?? "") === "ACERVO_HISTORICO"
    );
  }, [lastWorkflow?.workflow_status, catalog?.id]);

  const postWorkflow = useCallback(
    async (newStatus: string) => {
      if (!catalog?.id) {
        toast("Não foi possível alterar o workflow", {
          description: "ID do catálogo não encontrado.",
        });
        return null;
      }

      const endpoint = `${urlGeral}catalog/${catalog.id}/workflow`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflow_status: newStatus,
          detail: { additionalProp1: {} },
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Falha ao alterar workflow (${res.status}): ${
            text || "Erro desconhecido"
          }`
        );
      }

      return await res.json().catch(() => null);
    },
    [catalog?.id, token, urlGeral]
  );

  const [addingAcervo, setAddingAcervo] = useState(false);

  const handleAddToAcervoHistorico = useCallback(async () => {
    try {
      setAddingAcervo(true);

      await postWorkflow("ACERVO_HISTORICO");

      setIsAcervoHistoricoLocal(true);

      toast("Item adicionado ao Acervo Histórico ", {
        description: "Workflow atualizado com sucesso.",
      });
    } catch (e: any) {
      toast("Erro ao adicionar ao Acervo Histórico", {
        description: e?.message || "Tente novamente.",
      });
    } finally {
      setAddingAcervo(false);
    }
  }, [postWorkflow]);

  const handleBackToReviewRequestedDesfazimento = useCallback(async () => {
    try {
      setAddingAcervo(true);

      await postWorkflow("REVIEW_REQUESTED_DESFAZIMENTO");

      setIsAcervoHistoricoLocal(false);

      toast("Item enviado para Avaliação de Desfazimento ", {
        description: "Workflow atualizado com sucesso.",
      });
    } catch (e: any) {
      toast("Erro ao alterar workflow", {
        description: e?.message || "Tente novamente.",
      });
    } finally {
      setAddingAcervo(false);
    }
  }, [postWorkflow]);

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
        className={`flex flex-1 flex-col gap-4 md:gap-8 border-b-[12px] rounded-b-lg ${borderColorClass}`}
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
            Detalhes do item
            <Badge variant="outline">
              {asset?.asset_code}-{asset?.asset_check_digit}
            </Badge>
            {asset?.atm_number && asset?.atm_number !== "None" && (
              <Badge variant="outline">ATM: {asset.atm_number}</Badge>
            )}
            {lastWorkflow && (
              <Badge
                variant="outline"
                className="flex items-center gap-1"
                title={formatDateTimeBR(lastWorkflow.created_at)}
              >
                {(() => {
                  const Meta =
                    WORKFLOW_STATUS_META[lastWorkflow.workflow_status];
                  const IconCmp = Meta?.Icon ?? HelpCircle;
                  return <IconCmp size={14} />;
                })()}
                {getStatusLabel(lastWorkflow.workflow_status as WorkflowStatus)}
              </Badge>
            )}
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

              {(catalog.user?.id === user?.id || hasCatalogo) &&
                workflowReview && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to={`/dashboard/editar-item?id=${catalog.id}`}>
                        <Button
                          variant="outline"
                          onClick={() => onClose()}
                          size="icon"
                        >
                          <Pencil size={16} />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="z-[99]">Editar</TooltipContent>
                  </Tooltip>
                )}

              {(catalog.user?.id === user?.id || hasCatalogo) &&
                workflowReview && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={openDelete}
                        variant="destructive"
                        size="icon"
                        disabled={deleting}
                      >
                        <Trash size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="z-[99]">Deletar</TooltipContent>
                  </Tooltip>
                )}

              {hasAcervoHistorico && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isAcervoHistoricoLocal ? "default" : "outline"}
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAcervoHistoricoLocal) {
                          handleBackToReviewRequestedDesfazimento();
                        } else {
                          handleAddToAcervoHistorico();
                        }
                      }}
                      disabled={addingAcervo}
                    >
                      <BookmarkPlus
                        size={16}
                        className={addingAcervo ? "animate-pulse" : ""}
                      />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent className="z-[99]">
                    {addingAcervo
                      ? "Atualizando..."
                      : isAcervoHistoricoLocal
                      ? "Enviar para Avaliação de Desfazimento"
                      : "Adicionar ao Acervo Histórico"}
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
            {/* Favoritar (opcional) */}
            {loggedIn && workflowAnunciados && (
              <div onClick={(e) => e.stopPropagation()}>
                <LikeButton id={catalog?.id} />
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[70vh] border-solid">
          <div className="px-8">
            <div className="grid grid-cols-1">
              <Carousel items={cards} />

              <div className="flex flex-1 mt-8 h-full lg:flex-row flex-col-reverse gap-8">
                <div className="flex w-full flex-col">
                  <div className="flex justify-between items-start">
                    <div className="flex justify-between w-full">
                      <h2 className="text-3xl font-semibold leading-none tracking-tight mb-2">
                        {titulo}
                      </h2>

                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-2 items-center">
                        <CalendarIcon size={16} />
                        {formatDateTimeBR(catalog.created_at)}
                        {diff && (
                          <Badge
                            className={`text-white h-6 py-1 text-xs font-medium ${diff.bgColor}`}
                          >
                            {diff.months > 0
                              ? `${diff.months} ${
                                  diff.months === 1 ? "mês" : "meses"
                                } e ${diff.days} ${
                                  diff.days === 1 ? "dia" : "dias"
                                }`
                              : `${diff.days} ${
                                  diff.days === 1 ? "dia" : "dias"
                                }`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mb-8 text-gray-500">
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
                            <Alert className="mt-8">
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

                        {/* Histórico */}
                        {loggedIn && (
                          <>
                            <Separator className="mt-8 mb-2" />
                            <Accordion type="single" collapsible>
                              <AccordionItem value="item-1">
                                <div className="flex ">
                                  <HeaderResultTypeHome
                                    title="Histórico na plataforma"
                                    icon={
                                      <Workflow
                                        size={24}
                                        className="text-gray-400"
                                      />
                                    }
                                  />
                                  <AccordionTrigger></AccordionTrigger>
                                </div>
                                <AccordionContent className="p-0">
                                  <div className="flex flex-col ">
                                    {historySortedDesc.length === 0 ? (
                                      <div className="text-sm text-muted-foreground px-1">
                                        Nenhum evento de workflow.
                                      </div>
                                    ) : (
                                      // ✅ NÃO muta: copia antes do reverse
                                      [...historySortedDesc].map((ev, idx) => {
                                        const meta = WORKFLOW_STATUS_META[
                                          ev.workflow_status
                                        ] ?? {
                                          Icon: HelpCircle,
                                          colorClass: "text-zinc-500",
                                        };

                                        const { Icon: EvIcon } = meta;
                                        const username =
                                          ev.user?.username ||
                                          ev.user?.email?.split("@")[0] ||
                                          "Usuário";

                                        const total = historySortedDesc.length;
                                        const isLast = idx === total - 1;

                                        return (
                                          <div
                                            key={ev.id}
                                            className="flex gap-2"
                                          >
                                            <div className="flex flex-col items-center">
                                              <Alert className="flex w-14 h-14 items-center justify-center">
                                                <div>
                                                  <EvIcon
                                                    className={``}
                                                    size={16}
                                                  />
                                                </div>
                                              </Alert>

                                              {!isLast && (
                                                <Separator
                                                  className="min-h-8"
                                                  orientation="vertical"
                                                />
                                              )}
                                            </div>

                                            <div className="flex-1">
                                              <p className="text-lg font-medium">
                                                {getStatusLabel(
                                                  ev.workflow_status
                                                )}
                                              </p>

                                              {ev.detail?.justificativa && (
                                                <p className="text-sm dark:text-gray-300 mt-2 mb-4 text-gray-500 font-normal">
                                                  {ev.detail.justificativa}
                                                </p>
                                              )}

                                              <div className="flex gap-3 mt-2 flex-wrap mb-2 items-center justify-between">
                                                <div className="flex gap-1 items-center">
                                                  <Avatar className="rounded-md h-5 w-5">
                                                    {ev.user?.photo_url ? (
                                                      <AvatarImage
                                                        className="rounded-md h-5 w-5"
                                                        src={ev.user.photo_url}
                                                        alt={username}
                                                      />
                                                    ) : (
                                                      <AvatarFallback className="flex items-center justify-center">
                                                        <User size={10} />
                                                      </AvatarFallback>
                                                    )}
                                                  </Avatar>
                                                  <p className="text-sm text-gray-500 dark:text-gray-300 font-normal">
                                                    {username}
                                                  </p>
                                                </div>

                                                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                                  <CalendarIcon size={16} />
                                                  {formatDateTimeBR(
                                                    ev.created_at
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </>
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
                                        ? legalGuardians.find(
                                            (g) => g.id === selectedGuardianId
                                          )?.legal_guardians_name
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
                                                { sensitivity: "base" }
                                              )
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
                                                      : "opacity-0"
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

                            <div className="m-auto">
                              <Label>Período de empréstimo</Label>
                              <Calendar
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                className="rounded-lg border shadow-sm w-full"
                                classNames={{
                                  today: `border-eng-blue`, // Add a border to today's date
                                }}
                              />
                            </div>

                            <div className="grid gap-3 w-full">
                              <Label htmlFor="asset_description">
                                Observações
                              </Label>
                              <Input
                                id="asset_description"
                                className="w-full h-20"
                                value={objectData.asset_description}
                                onChange={handleChange("asset_description")}
                              />
                            </div>
                          </div>
                        </>
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
        <DrawerContent className="max-h-[70vh]">{content()}</DrawerContent>
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
