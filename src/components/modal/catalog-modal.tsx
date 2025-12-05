// src/components/modals/catalog-modal.tsx
import {
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "../ui/button";
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
  BadgePercent,
  Recycle,
  Hammer,
  PackageOpen,
  LucideIcon,
  WrenchIcon,
  CheckCircle,
  Workflow,
  Calendar,
  ArrowRightLeft,
  XCircle,
  Wrench,
  Users,
  Store,
  Clock,
  ListTodo,
  File,
  Landmark,
  BookmarkPlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  ArrowSquareOut,
  ArrowUUpLeft,
  CheckSquareOffset,
} from "phosphor-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { HeaderResultTypeHome } from "../header-result-type-home";

import { useModal } from "../hooks/use-modal-store";
import QRCode from "react-qr-code";
import { Barcode128SVG } from "../dashboard/create-etiqueta/steps/etiqueta";
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
import MovimentacaoModalCatalog from "../homepage/components/movimentacao-modal-catalog";
import TransferTabCatalog from "../homepage/components/transfer-tab-catalog";
import { ButtonTransference } from "../item-page/button-transference";
import {
  DocumentsTabCatalog,
  Files,
} from "../homepage/components/documents-tab-catalog";
import { ReviewersCatalogModal } from "../homepage/components/reviewers-catalog-modal";
import { DownloadPdfButton } from "../download/download-pdf-button";
import { AudiovisualModal } from "./catalog-modal-audiovisual";

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
type ApiSituation = "UNUSED" | "BROKEN" | "UNECONOMICAL" | "RECOVERABLE";

interface CatalogImageDTO {
  id: string;
  catalog_id: string;
  file_path: string;
}

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

/* ===================== Utils ===================== */

const situationToText: Record<ApiSituation, string> = {
  UNUSED: "Ocioso",
  BROKEN: "Quebrado",
  UNECONOMICAL: "Anti-econômico",
  RECOVERABLE: "Recuperável",
};

export const WORKFLOW_STATUS_META: Record<
  string,
  { Icon: LucideIcon; colorClass: string }
> = {
  // Vitrine
  REVIEW_REQUESTED_VITRINE: { Icon: Hourglass, colorClass: "text-amber-500" },
  ADJUSTMENT_VITRINE: { Icon: Wrench, colorClass: "text-blue-500" },
  VITRINE: { Icon: Store, colorClass: "text-green-600" },
  AGUARDANDO_TRANSFERENCIA: { Icon: Clock, colorClass: "text-indigo-500" },
  TRANSFERIDOS: { Icon: Archive, colorClass: "text-zinc-500" },

  // Desfazimento
  REVIEW_REQUESTED_DESFAZIMENTO: {
    Icon: Hourglass,
    colorClass: "text-amber-500",
  },
  ADJUSTMENT_DESFAZIMENTO: { Icon: Wrench, colorClass: "text-blue-500" },
  REVIEW_REQUESTED_COMISSION: { Icon: ListTodo, colorClass: "text-purple-500" },
  REJEITADOS_COMISSAO: { Icon: XCircle, colorClass: "text-red-500" },
  DESFAZIMENTO: { Icon: Trash, colorClass: "text-green-600" },
  DESCARTADOS: { Icon: Recycle, colorClass: "text-zinc-500" },

  ACERVO_HISTORICO: { Icon: Landmark, colorClass: "text-zinc-500" },
};

export const WORKFLOW_STATUS_LABELS: Record<string, string> = {
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

const money = (v?: string) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

type EstadoKindPt = "quebrado" | "ocioso" | "anti-economico" | "recuperavel";
type EstadoKindEn = "BROKEN" | "UNUSED" | "UNECONOMICAL" | "RECOVERABLE";
type EstadoKind = EstadoKindPt | EstadoKindEn;

const mapSituation = (s?: EstadoKind): EstadoKindEn => {
  switch (s) {
    case "quebrado":
      return "BROKEN";
    case "ocioso":
      return "UNUSED";
    case "anti-economico":
      return "UNECONOMICAL";
    case "recuperavel":
      return "RECOVERABLE";
    case "BROKEN":
    case "UNUSED":
    case "UNECONOMICAL":
    case "RECOVERABLE":
      return s;
    default:
      return "UNUSED";
  }
};

const DESCRICOES: Record<
  EstadoKindEn,
  {
    titulo: string;
    exemplo: string;
    texto: string;
    Icon: LucideIcon;
  }
> = {
  UNUSED: {
    titulo: "Bom Estado",
    exemplo:
      "Computadores novos e semi-novos. Mesas e cadeiras em bom estado mas sem uso.",
    texto:
      "Bem permanente em condições de uso, porém sem aproveitamento funcional no setor em que se encontra, carecendo de realocação ou destinação.",
    Icon: PackageOpen,
  },
  RECOVERABLE: {
    titulo: "Recuperável",
    exemplo:
      "Projetor com lâmpada queimada (troca barata em relação ao preço do projetor). Cadeira com estofado rasgado, mas estrutura em bom estado.",
    texto:
      "É um bem que não pode ser usado no momento, mas que pode ser consertado com um custo viável.",
    Icon: Recycle,
  },
  UNECONOMICAL: {
    titulo: "Antieconômico",
    exemplo:
      "Impressora antiga que consome toners caros ou peças raras. Equipamento ultrapassado que funciona, mas gera custos altos de manutenção.",
    texto:
      "É um bem que funciona, mas cujo uso não compensa economicamente porque a manutenção é cara, a eficiência é baixa ou o equipamento ficou obsoleto.",
    Icon: BadgePercent,
  },
  BROKEN: {
    titulo: "Irrecuperável",
    exemplo:
      "Monitores de tubo. Microcomputador com placa-mãe queimada. Móveis com estrutura comprometida. Equipamentos enferrujados.",
    texto:
      "É um bem que não tem mais condições de uso, porque perdeu suas características essenciais ou porque o reparo custaria mais de 50% do valor de mercado.",
    Icon: Hammer,
  },
};

type ConservationStatus =
  | "Excelente estado"
  | "Semi-novo"
  | "Necessita de pequenos reparos";

const CONSERVATION_MAP: Record<
  ConservationStatus,
  { icon: JSX.Element; title: string; description: string }
> = {
  "Excelente estado": {
    icon: <CheckCircle className="size-5 " />,
    title: "Excelente estado",
    description:
      "Bem em perfeitas condições, completo, com todos os acessórios essenciais.",
  },
  "Semi-novo": {
    icon: <CheckSquareOffset className="size-5 " />,
    title: "Semi-novo",
    description:
      "Bem em ótimo estado de funcionamento, com sinais leves de uso ou com acessório secundário faltando, sem comprometer o uso principal.",
  },
  "Necessita de pequenos reparos": {
    icon: <WrenchIcon className="size-5 " />,
    title: "Pequenos reparos",
    description: "Funcional, mas precisa de manutenção leve.",
  },
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

export function CatalogModal() {
  const isMobile = useIsMobile();
  const { onClose, isOpen, type: typeModal, data } = useModal();
  const isModalOpen = isOpen && typeModal === "catalog-modal";

  const { urlGeral, user, loggedIn } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token") || "";
  const [isAudiovisual, setIsAudiovisual] = useState(false);

  // Se você passa data.catalog, uso, senão tento data direto
  const catalog = (data as any)?.catalog ?? (data as CatalogResponseDTO | null);

  // Helpers do layout original
  const buildImgUrl = (p: string) => {
    const cleanPath = p?.startsWith("/") ? p.slice(1) : p;
    return `${urlGeral}${cleanPath}`;
  };

  const images = useMemo(
    () =>
      (catalog?.images ?? []).slice(0, 4).map((img, index) => ({
        category: "",
        title: img.id || `${index}-${img.file_path}`,
        src: buildImgUrl(img.file_path),
      })),
    [catalog?.images, buildImgUrl]
  );

  const cards = useMemo(
    () =>
      images.map((card, index) => (
        <Card key={card.src} card={card} index={index} layout={true} />
      )),
    [images]
  );

  /**
   * ===========================================================
   * ✅ FIX CENTRAL:
   * Cria uma lista ordenada DESC (mais recente primeiro)
   * SEM mutar o array original da API.
   * ===========================================================
   */
  const historySortedDesc = useMemo(() => {
    const hist = catalog?.workflow_history ?? [];
    return [...hist].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [catalog?.workflow_history]);

  // Sempre pega o status atual real (último workflow cronológico)
  const lastWorkflow = historySortedDesc[0];
  const firstStatus = lastWorkflow?.workflow_status;

  // ===== Transferências dos eventos com status 'VITRINE'
  const [transfers, setTransfers] = useState<TransferRequestDTO[]>([]);
  useEffect(() => {
    const hist = catalog?.workflow_history ?? [];

    const hasAudiovisual = hist.some((ev) =>
      ev.workflow_status?.startsWith("AUDIOVISUAL")
    );
    setIsAudiovisual(hasAudiovisual); // Assumindo que você tem um state para isso

    // Lógica existente
    const list = hist
      .filter((ev) => ev.workflow_status === "VITRINE")
      .flatMap((ev) => ev.transfer_requests ?? []);

    setTransfers(list);
  }, [catalog?.workflow_history]);

  const { hasCatalogo, hasAcervoHistorico } = usePermissions();

  // Ação: aceitar uma transferência => PUT /catalog/transfer/{transfer_id}?new_status=ACCEPTABLE
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const handleAcceptTransfer = useCallback(
    async (tr: TransferRequestDTO) => {
      if (!tr?.id) return;
      try {
        setAcceptingId(tr.id);

        const endpoint = `${urlGeral}catalog/transfer/${tr.id}?new_status=ACCEPTABLE`;
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `Falha ao aceitar transferência (${res.status}): ${
              text || "Erro desconhecido"
            }`
          );
        }

        // Atualiza UI: todas como DECLINED e a escolhida como ACCEPTABLE
        setTransfers((prev) =>
          prev.map((t) => ({
            ...t,
            status: t.id === tr.id ? "ACCEPTABLE" : "DECLINED",
          }))
        );

        toast("Transferência aceita", {
          description:
            "Esta solicitação foi marcada como ACCEPTABLE. As demais foram marcadas como DECLINED.",
        });
      } catch (e: any) {
        toast("Erro ao aceitar transferência", {
          description: e?.message || "Tente novamente.",
        });
      } finally {
        setAcceptingId(null);
      }
    },
    [token, urlGeral]
  );

  const handleBack = () => onClose(); // no modal, voltar = fechar
  const handleVoltar = () => onClose();

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
  const valorFormatado = money(asset?.asset_value);

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

  const situation = mapSituation(catalog?.situation ?? undefined);
  const info = DESCRICOES[situation];
  const Icon = info.Icon;

  const colorClassStr =
    qualisColor[csvCodTrimmed as keyof typeof qualisColor] || "bg-zinc-300";
  const borderColorClass = colorClassStr.replace("bg-", "border-");

  const getStatusLabel = (status: WorkflowStatus) =>
    WORKFLOW_STATUS_LABELS[status] ?? status;

  const fullCodeFrom = (d: CatalogResponseDTO) =>
    [d?.asset?.asset_code, d?.asset?.asset_check_digit]
      .filter(Boolean)
      .join("-");

  const qrUrlFrom = (d: CatalogResponseDTO) => {
    const code = fullCodeFrom(d);
    return code
      ? `https://sistemapatrimonio.eng.ufmg.br/buscar-patrimonio?bem_cod=${d?.asset?.asset_code}&bem_dgv=${d?.asset?.asset_check_digit}`
      : d?.asset?.atm_number || d?.id || "Sistema Patrimônio";
  };

  const fullCode = catalog ? fullCodeFrom(catalog) : "";
  const qrValue = catalog ? qrUrlFrom(catalog) : "";

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
  }, [catalog?.id, historySortedDesc]);

  const tabs = [
    { id: "visao_geral", label: "Visão Geral", icon: Home },
    { id: "documentos", label: "Documentos", icon: File },
    {
      id: "transferencia",
      label: `Pedidos de transferência${
        transfers?.length ? ` (${transfers.length})` : ""
      }`,
      icon: Archive,
      condition: !(
        (hasCatalogo || user?.id == catalog?.user?.id) &&
        workflowAnunciados
      ),
    },
    {
      id: "solicitar-transferencia",
      label: `Solicitar transferência`,
      icon: ArrowRightLeft,
      condition: !(!(user?.id == catalog?.user?.id) && workflowAnunciados),
    },
    {
      id: "movimentacao",
      label: "Movimentação",
      icon: ArrowRightLeft,
      condition: !hasCatalogo,
    },
    {
      id: "pareceristas",
      label: "Pareceristas",
      icon: Users,
      condition: !(hasCatalogo && firstStatus == "REVIEW_REQUESTED_COMISSION"),
    },
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

  const [value, setValue] = useState("visao_geral");

  const isComissao =
    firstStatus === "REVIEW_REQUESTED_COMISSION" ||
    firstStatus === "REJEITADOS_COMISSAO" ||
    firstStatus === "DESFAZIMENTO" ||
    firstStatus === "DESCARTADOS";

  const isJustificativa =
    firstStatus === "DESFAZIMENTO" ||
    firstStatus === "DESCARTADOS" ||
    firstStatus === "REJEITADOS_COMISSAO";

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

    if (!isAudiovisual) {
      const header = (
        <>
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
                  {getStatusLabel(
                    lastWorkflow.workflow_status as WorkflowStatus
                  )}
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
                  <TooltipContent className="z-[99]">
                    Ir a página
                  </TooltipContent>
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
                      <TooltipContent className="z-[99]">
                        Deletar
                      </TooltipContent>
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
        </>
      );

      return (
        <main
          className={`flex flex-1 flex-col gap-4 md:gap-8 border-b-[12px] rounded-b-lg ${borderColorClass}`}
        >
          {header}
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
                          <Calendar size={16} />
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

                    <Tabs defaultValue="visao_geral" value={value} className="">
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
                                {tabs.map(
                                  ({ id, label, icon: Icon, condition }) =>
                                    !condition && (
                                      <div
                                        key={id}
                                        className={`pb-2 border-b-2 transition-all text-black dark:text-white ${
                                          value === id
                                            ? "border-b-[#719CB8]"
                                            : "border-b-transparent"
                                        }`}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setValue(id);
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
                                    )
                                )}
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

                            <Separator className="my-8" />
                          </>

                          <div className="flex mb-8">
                            <div
                              className={`w-2 min-w-2 rounded-l-md border border-r-0 bg-eng-blue relative`}
                            />
                            <Alert className="flex flex-col rounded-l-none">
                              <div className="flex gap-4 flex-col ">
                                <div className="flex gap-2 w-full">
                                  <Icon size={24} />
                                  <div className="w-full">
                                    <div className="flex justify-between">
                                      <p className="font-medium">
                                        {info.titulo}
                                      </p>
                                      <Badge variant="outline">Situação</Badge>
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                      {info.texto}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {catalog.conservation_status && (
                                <Separator className="my-4" />
                              )}

                              {catalog.conservation_status &&
                                (catalog.conservation_status as any) in
                                  CONSERVATION_MAP && (
                                  <div className="grid gap-3 w-full">
                                    <div className="flex w-full items-start gap-3 text-muted-foreground">
                                      {
                                        CONSERVATION_MAP[
                                          catalog.conservation_status as ConservationStatus
                                        ].icon
                                      }
                                      <div className="grid gap-0.5 w-full">
                                        <div className="flex justify-between">
                                          <p className="font-medium">
                                            {
                                              CONSERVATION_MAP[
                                                catalog.conservation_status as ConservationStatus
                                              ].title
                                            }
                                          </p>

                                          <Badge variant="outline">
                                            Estado de conservação
                                          </Badge>
                                        </div>
                                        <p
                                          className="text-gray-500 text-sm"
                                          data-description
                                        >
                                          {
                                            CONSERVATION_MAP[
                                              catalog.conservation_status as ConservationStatus
                                            ].description
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </Alert>
                          </div>

                          <div className="flex">
                            <div
                              className={`w-2 min-w-2 rounded-l-md border border-r-0 bg-eng-blue relative`}
                            />
                            <Alert className="flex flex-col rounded-l-none">
                              {catalog.description && (
                                <>
                                  <p className="text-xl font-medium">
                                    Justificativa
                                  </p>
                                  <div className="text-sm text-gray-500 dark:text-gray-300">
                                    {catalog.description}
                                  </div>
                                </>
                              )}

                              <Separator className="my-4" />

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
                                            {i > 0 && (
                                              <ChevronRight size={14} />
                                            )}{" "}
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

                          {((shouldShowReviewer && reviewerFromCommission) ||
                            (shouldShowJustification && justificationText)) && (
                            <Alert className="mt-8">
                              {shouldShowReviewer &&
                                reviewerFromCommission &&
                                loggedIn && (
                                  <div className="flex gap-3 items-center">
                                    <Avatar className="rounded-md h-12 w-12">
                                      <AvatarImage
                                        src={
                                          reviewerFromCommission.id
                                            ? `${urlGeral}user/upload/${reviewerFromCommission.id}/icon`
                                            : undefined
                                        }
                                      />
                                      <AvatarFallback className="flex items-center justify-center">
                                        <User size={16} />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm w-fit text-gray-500">
                                        Parecerista
                                      </p>
                                      <p className="text-black dark:text-white font-medium text-lg truncate">
                                        {reviewerFromCommission.username ??
                                          "Não informado"}
                                      </p>
                                    </div>
                                  </div>
                                )}

                              {shouldShowJustification && justificationText && (
                                <div
                                  className={
                                    reviewerFromCommission ? "mt-4" : ""
                                  }
                                >
                                  <p className=" w-fit text-gray-500 mb-2">
                                    Justificativa
                                  </p>
                                  <p className="text-gray-500 text-sm text-justify">
                                    {justificationText}
                                  </p>
                                </div>
                              )}
                            </Alert>
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
                                        [...historySortedDesc].map(
                                          (ev, idx) => {
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

                                            const total =
                                              historySortedDesc.length;
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
                                                            src={
                                                              ev.user.photo_url
                                                            }
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
                                                      <Calendar size={16} />
                                                      {formatDateTimeBR(
                                                        ev.created_at
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          }
                                        )
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </>
                          )}
                        </div>
                      </TabsContent>

                      {/* ===== Transferência ===== */}
                      <TabsContent value="transferencia">
                        <TransferTabCatalog
                          catalog={catalog}
                          urlGeral={urlGeral}
                          token={token}
                          onChange={() => {}}
                        />
                      </TabsContent>

                      <TabsContent value="documentos">
                        <DocumentsTabCatalog
                          catalog={catalog}
                          urlGeral={urlGeral}
                          token={token}
                          onChange={() => {}}
                        />
                      </TabsContent>

                      <TabsContent value="solicitar-transferencia">
                        <ButtonTransference catalog={catalog} />
                      </TabsContent>

                      <TabsContent value="pareceristas">
                        <ReviewersCatalogModal
                          catalog={catalog}
                          roleId={import.meta.env.VITE_ID_COMISSAO_PERMANENTE}
                        />
                      </TabsContent>

                      {/* ===== Movimentação ===== */}
                      {hasCatalogo && (
                        <TabsContent value="movimentacao">
                          <MovimentacaoModalCatalog
                            catalog={catalog}
                            urlGeral={urlGeral}
                            onUpdated={(updated) => {
                              catalog.workflow_history ??= [];
                            }}
                          />
                        </TabsContent>
                      )}
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
                  Esta ação é irreversível. Ao deletar, todas as informações
                  deste item no catálogo serão perdidas.
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
    } else return <AudiovisualModal />;
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

export default CatalogModal;
