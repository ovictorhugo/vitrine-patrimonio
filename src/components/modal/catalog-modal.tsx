// src/components/modals/catalog-modal.tsx
import { useContext, useMemo, useState, useCallback, useEffect, useRef } from "react";
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
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ArrowSquareOut, ArrowUUpLeft, CheckSquareOffset } from "phosphor-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { HeaderResultTypeHome } from "../header-result-type-home";

import { useModal } from "../hooks/use-modal-store";
import QRCode from "react-qr-code";
import { Barcode128SVG } from "../dashboard/create-etiqueta/steps/etiqueta";
import { useIsMobile } from "../../hooks/use-mobile";
import { Drawer, DrawerContent } from "../ui/drawer";
import { UserContext } from "../../context/context";
import { ScrollArea } from "../ui/scroll-area";
import { LikeButton } from "../item-page/like-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Tabs, TabsContent } from "../ui/tabs";

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

type WorkflowEvent = {
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
  workflow_history?: WorkflowEvent[];
}

/* ===================== Utils ===================== */

const situationToText: Record<ApiSituation, string> = {
  UNUSED: "Ocioso",
  BROKEN: "Quebrado",
  UNECONOMICAL: "Anti-econômico",
  RECOVERABLE: "Recuperável",
};

const WORKFLOW_STATUS_META: Record<string, { Icon: LucideIcon; colorClass: string }> = {
  // Vitrine
  REVIEW_REQUESTED_VITRINE: { Icon: Hourglass, colorClass: "text-amber-500" },
  ADJUSTMENT_VITRINE: { Icon: Wrench, colorClass: "text-blue-500" },
  VITRINE: { Icon: Store, colorClass: "text-green-600" },
  AGUARDANDO_TRANSFERENCIA: { Icon: Clock, colorClass: "text-indigo-500" },
  TRANSFERIDOS: { Icon: Archive, colorClass: "text-zinc-500" },

  // Desfazimento
  REVIEW_REQUESTED_DESFAZIMENTO: { Icon: Hourglass, colorClass: "text-amber-500" },
  ADJUSTMENT_DESFAZIMENTO: { Icon: Wrench, colorClass: "text-blue-500" },
  REVIEW_REQUESTED_COMISSION: { Icon: Users, colorClass: "text-purple-500" },
  REJEITADOS_COMISSAO: { Icon: XCircle, colorClass: "text-red-500" },
  DESFAZIMENTO: { Icon: Recycle, colorClass: "text-green-600" },
};

export const WORKFLOW_STATUS_LABELS: Record<string, string> = {
  STARTED: "Iniciado",
  REVIEW_REQUESTED_VITRINE: "Revisão para Vitrine",
  ADJUSTMENT_VITRINE: "Ajustes Vitrine",
  VITRINE: "Anunciados na Vitrine",
  AGUARDANDO_TRANSFERENCIA: "Aguardando Transferência",
  TRANSFERIDOS: "Transferidos",

  REVIEW_REQUESTED_DESFAZIMENTO: "Revisão para Desfazimento",
  ADJUSTMENT_DESFAZIMENTO: "Ajustes Desfazimento",
  REVIEW_REQUESTED_COMISSION: "Revisão Comissão",
  REJEITADOS_COMISSAO: "Rejeitados pela Comissão",
  DESFAZIMENTO: "Desfazimento Concluído",
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
    exemplo: "Computadores novos e semi-novos. Mesas e cadeiras em bom estado mas sem uso.",
    texto:
      "Bem permanente em condições de uso, porém sem aproveitamento funcional no setor em que se encontra, carecendo de realocação ou destinação.",
    Icon: PackageOpen,
  },
  RECOVERABLE: {
    titulo: "Recuperável",
    exemplo:
      "Projetor com lâmpada queimada (troca barata em relação ao preço do projetor). Cadeira com estofado rasgado, mas estrutura em bom estado.",
    texto: "É um bem que não pode ser usado no momento, mas que pode ser consertado com um custo viável.",
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

type ConservationStatus = "Excelente estado" | "Semi-novo" | "Necessita de pequenos reparos";

const CONSERVATION_MAP: Record<
  ConservationStatus,
  { icon: JSX.Element; title: string; description: string }
> = {
  "Excelente estado": {
    icon: <CheckCircle className="size-5 " />,
    title: "Excelente estado",
    description: "Bem em perfeitas condições, completo, com todos os acessórios essenciais.",
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

const toInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || "U";
};

export function CatalogModal() {
  const isMobile = useIsMobile();
  const { onClose, isOpen, type: typeModal, data } = useModal();
  const isModalOpen = isOpen && typeModal === "catalog-modal";

  const { urlGeral } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token") || "";
  const { theme } = useTheme();

  // Se você passa data.catalog, uso, senão tento data direto
  const catalog = (data as any)?.catalog ?? (data as CatalogResponseDTO | null) ?? null;

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
    [catalog?.images, urlGeral]
  );

  const cards = useMemo(
    () => images.map((card, index) => <Card key={card.src} card={card} index={index} layout={true} />),
    [images]
  );

  // ===== Transferências dos eventos com status 'VITRINE'
  const [transfers, setTransfers] = useState<TransferRequestDTO[]>([]);
  useEffect(() => {
    const hist = catalog?.workflow_history ?? [];
    const list = hist
      .filter((ev) => ev.workflow_status === "VITRINE")
      .flatMap((ev) => ev.transfer_requests ?? []);
    setTransfers(list);
  }, [catalog?.workflow_history]);

  // Labels e cores para status de transferência segundo a API (PENDING, DECLINED, ACCEPTABLE)
  const TRANSFER_STATUS_LABEL: Record<string, string> = {
    PENDING: "Pendente",
    ACCEPTABLE: "Aceita",
    DECLINED: "Recusada",
  };
  const TRANSFER_STATUS_COLOR: Record<string, string> = {
    PENDING: "bg-amber-500",
    ACCEPTABLE: "bg-green-600",
    DECLINED: "bg-red-600",
  };

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
          throw new Error(`Falha ao aceitar transferência (${res.status}): ${text || "Erro desconhecido"}`);
        }

        // Atualiza UI: todas como DECLINED e a escolhida como ACCEPTABLE
        setTransfers((prev) =>
          prev.map((t) => ({
            ...t,
            status: t.id === tr.id ? "ACCEPTABLE" : "DECLINED",
          }))
        );

        toast("Transferência aceita", {
          description: "Esta solicitação foi marcada como ACCEPTABLE. As demais foram marcadas como DECLINED.",
        });

        // Se o backend exigir que *cada* transferência seja atualizada também,
        // você pode iterar prev.filter(t => t.id !== tr.id) e dar PUT DECLINED em cada.
        // Como muitos backends já fazem isso via regra de negócio, aqui atualizamos só a UI.
      } catch (e: any) {
        toast("Erro ao aceitar transferência", { description: e?.message || "Tente novamente." });
      } finally {
        setAcceptingId(null);
      }
    },
    [token, urlGeral]
  );

  const lastWorkflow = useMemo(() => {
  const hist = catalog?.workflow_history ?? [];
  if (!hist.length) return null;
  // pega o mais recente por created_at
  return hist.reduce((a, b) =>
    new Date(a.created_at) > new Date(b.created_at) ? a : b
  );
}, [catalog?.workflow_history]);


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
      onClose();
    } catch (e: any) {
      toast("Erro ao excluir", { description: e?.message || "Tente novamente." });
    } finally {
      setDeleting(false);
      setIsDeleteOpen(false);
    }
  }, [catalog, onClose, token, urlGeral]);

  const asset = catalog?.asset;
  const titulo = asset?.material?.material_name || asset?.item_model || asset?.item_brand || "Item sem nome";
  const valorFormatado = money(asset?.asset_value);

  const locCatalogoParts = chain(catalog?.location);
  const locAssetParts = chain(asset?.location);
  const isSameLocation = locCatalogoParts.join(" > ") === locAssetParts.join(" > ");

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
    NI: { text: "Não inventariado", icon: <HelpCircle size={12} /> as any },
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

  const getStatusLabel = (status: WorkflowStatus) => WORKFLOW_STATUS_LABELS[status] ?? status;

  const fullCodeFrom = (d: CatalogResponseDTO) =>
    [d?.asset?.asset_code, d?.asset?.asset_check_digit].filter(Boolean).join("-");

  const qrUrlFrom = (d: CatalogResponseDTO) => {
    const code = fullCodeFrom(d);
    return code
      ? `https://vitrine.eng.ufmg.br/buscar-patrimonio?bem_cod=${d?.asset?.asset_code}&bem_dgv=${d?.asset?.asset_check_digit}`
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

  const diff = catalog?.created_at ? calculateDifference(catalog.created_at) : null;

  const tabs = [
    { id: "visao_geral", label: "Visão Geral", icon: Home },
    { id: "transferencia", label: `Transferência${transfers?.length ? ` (${transfers.length})` : ""}`, icon: Archive },
    { id: "movimentacao", label: "Movimentação", icon: ArrowRightLeft },
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

  const content = () => {
    if (!catalog) {
      return (
        <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-8">
          <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">(⊙_⊙)</p>
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

    const header = (
      <>
        <div className="flex items-center gap-4 p-8 pb-0">
          <Button onClick={handleBack} variant="outline" size="icon" className="h-7 w-7">
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
    className={`flex items-center gap-1 
    
    `}
    title={formatDateTimeBR(lastWorkflow.created_at)}
  >
    {(() => {
      const Meta = WORKFLOW_STATUS_META[lastWorkflow.workflow_status];
      const IconCmp = Meta?.Icon ?? HelpCircle;
      return <IconCmp size={14} />;
    })()}
    {getStatusLabel(lastWorkflow.workflow_status as WorkflowStatus)}
  </Badge>
)}
          </h1>

          <div className="hidden md:flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Link target="_blank" to={`/item?id=${catalog.id}`}>
                    <Button variant="outline" size="icon">
                      <ArrowSquareOut size={16} />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Ir a página</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <Link target="_blank" to={`/dashboard/editar-item?id=${catalog.id}`}>
                    <Button variant="outline" size="icon">
                      <Pencil size={16} />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <Button onClick={openDelete} variant="destructive" size="icon" disabled={deleting}>
                    <Trash size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Deletar</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <LikeButton id={catalog.id} />
          </div>
        </div>
      </>
    );

    return (
      <main className="flex flex-1 flex-col gap-4 md:gap-8">
        {header}
        <ScrollArea className="max-h-[70vh]">
          <div className="px-8">
            {/* Imagens */}
            <div className="grid grid-cols-1">
              <Carousel items={cards} />

              <div className="flex flex-1 mt-8 h-full lg:flex-row flex-col-reverse gap-8">
                {/* Coluna principal */}
                <div className="flex w-full flex-col">
                  <div className="flex justify-between items-start">
                    <div className="flex justify-between w-full">
                      <h2 className="text-3xl font-semibold leading-none tracking-tight mb-2">{titulo}</h2>

                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-2 items-center">
                        <Calendar size={16} />
                        {formatDateTimeBR(catalog.created_at)}
                        {diff && (
                          <Badge className={`text-white h-6 py-1 text-xs font-medium ${diff.bgColor}`}>
                            {diff.months > 0
                              ? `${diff.months} ${diff.months === 1 ? "mês" : "meses"} e ${diff.days} ${
                                  diff.days === 1 ? "dia" : "dias"
                                }`
                              : `${diff.days} ${diff.days === 1 ? "dia" : "dias"}`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mb-8 text-gray-500">{asset?.asset_description || "Sem descrição."}</p>

                  <Tabs defaultValue="visao_geral" value={value} className="">
                    <div className="mb-8 bg-white dark:bg-neutral-950 border rounded-md p-2 px-4 pb-0 dark:border-neutral-800">
                      <div className="relative grid grid-cols-1 w-full ">
                        {/* Botão Esquerda */}
                        <Button
                          variant="outline"
                          size="sm"
                          className={`absolute left-0 z-10 h-8 w-8 p-0 top-1 ${
                            !canScrollLeft ? "opacity-30 cursor-not-allowed" : ""
                          }`}
                          onClick={scrollLeft}
                          disabled={!canScrollLeft}
                        >
                          <ChevronLeft size={16} />
                        </Button>

                        {/* Scroll Area com Tabs */}
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
                                    value === id ? "border-b-[#719CB8]" : "border-b-transparent"
                                  }`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setValue(id);
                                  }}
                                >
                                  <Button variant="ghost" className="m-0 flex items-center gap-2">
                                    <Icon size={16} />
                                    {label}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Botão Direita */}
                        <Button
                          variant="outline"
                          size="sm"
                          className={`absolute right-0 z-10 h-8 w-8 p-0 top-1 ${
                            !canScrollRight ? "opacity-30 cursor-not-allowed" : ""
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
                        {/* Bloco status + csv */}
                        <>
                          <div className="flex group ">
                            <div
                              className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${
                                qualisColor[csvCodTrimmed as keyof typeof qualisColor] || "bg-zinc-300"
                              } min-h-full`}
                            />
                            <Alert className="flex flex-col flex-1 h-fit rounded-l-none p-0">
                              <div className="flex mb-1 gap-3 justify-between p-4 pb-0">
                                <p className="font-semibold flex gap-3 items-center text-left mb-4 flex-1">
                                  {asset?.asset_code?.trim()} - {asset?.asset_check_digit}
                                  {!!asset?.atm_number && asset.atm_number !== "None" && (
                                    <Badge variant="outline">ATM: {asset.atm_number}</Badge>
                                  )}
                                </p>
                              </div>

                              <div className="flex flex-col p-4 pt-0 justify-between">
                                <div>
                                  <div className="flex flex-wrap gap-3">
                                    {!!asset?.csv_code && asset?.csv_code !== "None" && (
                                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                        <div
                                          className={`w-4 h-4 rounded-md ${
                                            qualisColor[csvCodTrimmed as keyof typeof qualisColor] ||
                                            "bg-zinc-300"
                                          }`}
                                        />
                                        {csvCodToText[csvCodTrimmed as keyof typeof csvCodToText] || "—"}
                                      </div>
                                    )}

                                    {status && (
                                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                        {status.icon}
                                        {status.text}
                                      </div>
                                    )}

                                    {!!asset?.legal_guardian &&
                                      asset.legal_guardian.legal_guardians_name !== "None" && (
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
                                            {asset.legal_guardian.legal_guardians_name}
                                          </p>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </Alert>
                          </div>

                          <Separator className="my-8" />
                        </>

                        {/* Situação + conservação */}
                        <div className="flex mb-8">
                          <div className={`w-2 min-w-2 rounded-l-md border border-r-0 bg-eng-blue relative`} />
                          <Alert className="flex flex-col rounded-l-none">
                            <div className="flex gap-4 flex-col ">
                              <div className="flex gap-2 w-full">
                                <Icon size={24} />
                                <div className="w-full">
                                  <div className="flex justify-between">
                                    <p className="font-medium">{info.titulo}</p>
                                    <Badge variant="outline">Situação</Badge>
                                  </div>
                                  <p className="text-gray-500 text-sm">{info.texto}</p>
                                </div>
                              </div>
                            </div>

                            {catalog.conservation_status && <Separator className="my-4" />}

                            {catalog.conservation_status &&
                              (catalog.conservation_status as any) in CONSERVATION_MAP && (
                                <div className="grid gap-3 w-full">
                                  <div className="flex w-full items-start gap-3 text-muted-foreground">
                                    {CONSERVATION_MAP[catalog.conservation_status as ConservationStatus].icon}
                                    <div className="grid gap-0.5 w-full">
                                      <div className="flex justify-between">
                                        <p className="font-medium">
                                          {CONSERVATION_MAP[catalog.conservation_status as ConservationStatus].title}
                                        </p>

                                        <Badge variant="outline">Estado de conservação</Badge>
                                      </div>
                                      <p className="text-gray-500 text-sm" data-description>
                                        {
                                          CONSERVATION_MAP[catalog.conservation_status as ConservationStatus]
                                            .description
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </Alert>
                        </div>

                        {/* Justificativa + Localizações */}
                        <div className="flex">
                          <div className={`w-2 min-w-2 rounded-l-md border border-r-0 bg-eng-blue relative`} />
                          <Alert className="flex flex-col rounded-l-none">
                            {catalog.description && (
                              <>
                                <p className="text-xl font-medium">Justificativa</p>
                                <div className="text-sm text-gray-500 dark:text-gray-300">{catalog.description}</div>
                              </>
                            )}

                            <Separator className="my-4" />

                            <div className="space-y-2">
                              {/* Local de tombamento (Asset) */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <MapPin size={16} />
                                <p className="text-sm uppercase font-bold">Local de tombamento:</p>

                                {locAssetParts.length ? (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {locAssetParts.map((p, i) => (
                                      <div
                                        key={i}
                                        className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2"
                                      >
                                        {i > 0 && <ChevronRight size={14} />} {p}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">Não definido.</span>
                                )}
                              </div>

                              {/* Local atual (Catálogo), se diferente */}
                              {!isSameLocation && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <MapPin size={16} />
                                  <p className="text-sm uppercase font-bold">Local atual:</p>

                                  {locCatalogoParts.length ? (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {locCatalogoParts.map((p, i) => (
                                        <div
                                          key={i}
                                          className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2"
                                        >
                                          {i > 0 && <ChevronRight size={14} />} {p}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500">Não definido.</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </Alert>
                        </div>

                        <Alert className="mt-8">
                          <div className="flex gap-3 items-center">
                            <Avatar className="rounded-md h-12 w-12">
                              <AvatarImage
                                className={""}
                                src={`${urlGeral}user/upload/${catalog.user?.id}/icon`}
                                alt={`${catalog.user?.username}`}
                              />
                              <AvatarFallback className="flex items-center justify-center">
                                <User size={10} />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm w-fit text-gray-500">Anunciante</p>
                              <p className="text-black dark:text-white font-medium text-lg truncate">
                                {catalog.user?.username}
                              </p>
                            </div>
                          </div>
                        </Alert>

                        {/* Histórico */}
                        <Separator className="mt-8 mb-2" />
                        <Accordion type="single" collapsible>
                          <AccordionItem value="item-1">
                            <div className="flex ">
                              <HeaderResultTypeHome
                                title="Histórico na plataforma"
                                icon={<Workflow size={24} className="text-gray-400" />}
                              />
                              <AccordionTrigger></AccordionTrigger>
                            </div>
                            <AccordionContent className="p-0">
                              <div className="flex flex-col ">
                              {catalog.workflow_history?.length === 0 ? (
  <div className="text-sm text-muted-foreground px-1">
    Nenhum evento de workflow.
  </div>
) : (
  catalog.workflow_history
    ?.slice() // cria uma cópia
    .reverse() // inverte a ordem
    .map((ev, idx) => {
      const meta =
        WORKFLOW_STATUS_META[ev.workflow_status] ?? {
          Icon: HelpCircle,
          colorClass: "text-zinc-500",
        };

      const { Icon: EvIcon } = meta;
      const username =
        ev.user?.username || ev.user?.email?.split("@")[0] || "Usuário";

      const total = catalog?.workflow_history?.length ?? 0;
      const isLast = idx === total - 1;

      return (
        <div key={ev.id} className="flex gap-2">
          <div className="flex flex-col items-center">
            <Alert className="flex w-14 h-14 items-center justify-center">
             <div>
                 <EvIcon className={``} size={16} />
             </div>
            </Alert>

            {!isLast && <Separator className="h-8" orientation="vertical" />}
          </div>

          <div className="flex-1">
            <p className="text-lg font-medium">{getStatusLabel(ev.workflow_status)}</p>

            {ev.detail?.justificativa && (
              <p className="text-sm dark:text-gray-300 font-normal">
                {ev.detail.justificativa}
              </p>
            )}

            <div className="flex gap-3 mt-2 flex-wrap items-center justify-between">
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
                <Calendar size={16} />
                {formatDateTimeBR(ev.created_at)}
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
                      </div>
                    </TabsContent>

                    {/* ===== Transferência ===== */}
                    <TabsContent value="transferencia">
                      <div className="space-y-4">
                        {(!transfers || transfers.length === 0) && (
                          <Alert className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Nenhuma transferência registrada em “VITRINE”.</p>
                              <p className="text-sm text-muted-foreground">
                                Quando houver pedidos, eles aparecem aqui.
                              </p>
                            </div>
                          </Alert>
                        )}

                        {transfers?.map((tr) => {
                          const requesterName =
                            tr.user?.username || tr.user?.email?.split("@")[0] || "Usuário";
                          const statusText = TRANSFER_STATUS_LABEL[tr.status] ?? tr.status;
                          const color = TRANSFER_STATUS_COLOR[tr.status] ?? "bg-zinc-500";

                          const cadeia = chain(tr.location);
                          const isAccepting = acceptingId === tr.id;
                          const alreadyAccepted = tr.status === "ACCEPTABLE";

                          return (
                            <div key={tr.id} className="flex">
                              <div className={`w-2 min-w-2 rounded-l-md ${color}`} />
                              <Alert className="flex-1 rounded-l-none">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <Archive className="size-4" />
                                    <p className="font-medium">Pedido de Transferência</p>
                                    <Badge variant="outline">#{tr.id.slice(0, 8)}</Badge>
                                  </div>

                                  <div className="flex gap-2 items-center">
                                    <Badge className={`text-white ${color}`}>{statusText}</Badge>

                                    <Button
                                      variant={alreadyAccepted ? "outline" : "default"}
                                      size="sm"
                                      onClick={() => handleAcceptTransfer(tr)}
                                      disabled={isAccepting || alreadyAccepted}
                                      className="gap-2"
                                    >
                                      {isAccepting ? (
                                        <>
                                          <LoaderCircle className="animate-spin size-4" />
                                          Processando…
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="size-4" />
                                          Escolher esta transferência
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                <Separator className="my-3" />

                                <div className="grid gap-3">
                                  <div className="flex items-center gap-2">
                                    <Users className="size-4" />
                                    <p className="text-sm text-muted-foreground">
                                      Solicitante:{" "}
                                      <span className="text-foreground font-medium">{requesterName}</span>
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap">
                                    <MapPin className="size-4" />
                                    <p className="text-sm font-semibold uppercase">Destino:</p>
                                    {cadeia.length ? (
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {cadeia.map((p, i) => (
                                          <div
                                            key={i}
                                            className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2"
                                          >
                                            {i > 0 && <ChevronRight size={14} />}
                                            {p}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">Local não informado</span>
                                    )}
                                  </div>
                                </div>
                              </Alert>
                            </div>
                          );
                        })}
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
                Esta ação é irreversível. Ao deletar, todas as informações deste item no catálogo serão
                perdidas.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="">
              <Button variant="ghost" onClick={closeDelete}>
                <ArrowUUpLeft size={16} /> Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
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
        <DialogContent className="p-0 min-w-[65vw]   ">{content()}</DialogContent>
      </Dialog>
    );
  }
}

export default CatalogModal;
