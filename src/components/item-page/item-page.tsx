// src/pages/item/index.tsx
import { useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Alert } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Card, Carousel } from "../ui/apple-cards-carousel";
import { ChevronLeft, ChevronRight, LoaderCircle, MapPin, Trash, Pencil, Home, Undo2, CheckIcon, HelpCircle, Archive, Hourglass, MoveRight, XIcon, User, BadgePercent, Recycle, Hammer, PackageOpen, LucideIcon, WrenchIcon, CheckCircle, Workflow, Calendar, LoaderCircleIcon, ArrowRightLeft, XCircle, Wrench, Users, Store, Clock, FileIcon, BookmarkPlus} from "lucide-react";
import { UserContext } from "../../context/context";
import { toast } from "sonner";
import { ArrowUUpLeft, CheckSquareOffset } from "phosphor-react";
import { SymbolEEWhite } from "../svg/SymbolEEWhite";
import { LogoVitrineWhite } from "../svg/LogoVitrineWhite";
import { SymbolEE } from "../svg/SymbolEE";
import { LogoVitrine } from "../svg/LogoVitrine";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { HeaderResultTypeHome } from "../header-result-type-home";
import { ButtonTransference } from "./button-transference";
import { useModal } from "../hooks/use-modal-store";
import QRCode from "react-qr-code";
import { Barcode128SVG } from "../dashboard/create-etiqueta/steps/etiqueta";
import { LikeButton } from "./like-button";
import { WORKFLOW_STATUS_LABELS, WORKFLOW_STATUS_META, WorkflowEvent } from "../modal/catalog-modal";
import { usePermissions } from "../permissions";
import { Tabs, TabsContent } from "../ui/tabs";
import MovimentacaoModalCatalog from "../homepage/components/movimentacao-modal-catalog";
import TransferTabCatalog, { TransferRequestDTO } from "../homepage/components/transfer-tab-catalog";
import { CatalogEntry } from "../dashboard/itens-vitrine/card-item-dropdown";
import { log } from "console";
import { ReviewersCatalogModal } from "../homepage/components/reviewers-catalog-modal";
import { DocumentsTabCatalog, Files } from "../homepage/components/documents-tab-catalog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

/* ===================== Tipos DTO ===================== */
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
interface LegalGuardian { legal_guardians_name: string; legal_guardians_code: string; id: UUID; }

type UUID = string;
interface LocationDTO {
    legal_guardian_id: UUID;
    sector_id: UUID;
    location_name: string;
    location_code: string;
    id: UUID;
    sector: {
      agency_id: UUID;
      sector_name: string;
      sector_code: string;
      id: UUID;
      agency: {
        agency_name: string;
        agency_code: string;
        unit_id: UUID;
        id: UUID;
        unit: { unit_name: string; unit_code: string; unit_siaf: string; id: UUID; };
      };
    };
    legal_guardian: LegalGuardian;
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
  is_official: boolean;
  material: MaterialDTO ;
  legal_guardian: LegalGuardianDTO ;
  location: LocationDTO ;
}
type ApiSituation = "UNUSED" | "BROKEN" | "UNECONOMICAL" | "RECOVERABLE";

interface CatalogImageDTO {
  id: string;
  catalog_id: string;
  file_path: string;
}

type WorkflowStatus =
  | "STARTED"
  | "VALIDATION_VITRINE"
  | "VALIDATION_UNDOING"
  | "VALIDATION_REJECTED"
  | "VALIDATION_APPROVED"
  | "PUBLISHED"
  | "ARCHIVED"
  | string; // permite desconhecidos



type WorkflowHistoryItem = {
  workflow_status: string;
  detail?: Record<string, any>;
  id: UUID;
  user: {
    id: UUID;
    username: string;
    email: string;
    provider: string;
    linkedin: string 
    lattes_id: string 
    orcid: string 
    ramal: string 
    photo_url: string 
    background_url: string 
    matricula: string 
    verify: boolean;
    institution_id: UUID;
  };
  catalog_id: UUID;
  created_at: string;
  transfer_requests?: TransferRequestDTO[];
};

 export interface CatalogResponseDTO {
  id: string;
  created_at:string
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
    linkedin: string 
    lattes_id: string 
    orcid: string 
    ramal: string 
    photo_url: string 
    background_url: string 
    matricula: string 
    verify: boolean;
    institution_id: UUID;
  };
  location: LocationDTO ; // localização ATUAL do item no catálogo
  images: CatalogImageDTO[];
  workflow_history:  WorkflowHistoryItem[]; 
  transfer_requests: TransferRequest[]
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





const money = (v?: string) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const chain = (loc?: LocationDTO ) => {
  if (!loc || !loc.sector) return [];
  const s = loc.sector;
  const a = s.agency;
  const u = a?.unit 
  // ordem: Unidade -> Agência -> Setor -> Local
  const parts: string[] = [];
  if (u) parts.push(`${u.unit_code} - ${u.unit_name}`);
  if (a) parts.push(`${a.agency_code} - ${a.agency_name}`);
  parts.push(`${s.sector_code} - ${s.sector_name}`);
  parts.push(`${loc.location_code} - ${loc.location_name}`);
  return parts;
};

/* ===================== Hook query ===================== */
const useQuery = () => new URLSearchParams(useLocation().search);

/* ===================== Página ===================== */
export function ItemPage() {
  const navigate = useNavigate();
  const query = useQuery();

  const { urlGeral, user, permission, loggedIn } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token") || "";

  const buildImgUrl = (p: string) => {
    try {
      const cleanPath = p.startsWith("/") ? p.slice(1) : p;
      return `${urlGeral}${cleanPath}`;
    } catch {
      const cleanPath = p.startsWith("/") ? p.slice(1) : p;
      return `${urlGeral}${cleanPath}`;
    }
  };

  const catalogId = query.get("id") || ""; // <-- novo: pega ?id= da URL

  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<CatalogResponseDTO>();
  const [deleting, setDeleting] = useState(false);

  const fetchCatalog = useCallback(async () => {
    if (!catalogId) return;
    setLoading(true);
    try {
      const r = await fetch(`${urlGeral}catalog/${catalogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(`Erro ${r.status}`);
      const data: CatalogResponseDTO = await r.json();
      setCatalog(data);
    } catch (e: any) {
      toast("Erro ao carregar", { description: e?.message || "Não foi possível obter o item." });
    } finally {
      setLoading(false);
    }
  }, [catalogId]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const images = useMemo(() => {
    return (catalog?.images ?? []).slice(0, 4).map((img) => ({
      category: "",
      title: "",
      src: buildImgUrl(img.file_path),
    }));
  }, [catalog?.images]);

  const cards = useMemo(
    () => images.map((card, index) => <Card key={card.src} card={card} index={index} layout={true} />),
    [images]
  );

  const handleBack = () => navigate(-1);

  const handleEdit = () => {
    if (!catalog) return;
    navigate(`/dashboard/editar-item?id=${catalog.id}`);
  };

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openDelete = () => setIsDeleteOpen(true);
  const closeDelete = () => setIsDeleteOpen(false);
  
  const handleConfirmDelete = async () => {
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
      navigate("/dashboard");
    } catch (e: any) {
      toast("Erro ao excluir", { description: e?.message || "Tente novamente." });
    } finally {
      setDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const [loadingMessage, setLoadingMessage] = useState("Estamos procurando todas as informações no nosso banco de dados, aguarde.");
  
     useEffect(() => {
            let timeouts: NodeJS.Timeout[] = [];
          
           
              setLoadingMessage("Estamos procurando todas as informações no nosso banco de dados, aguarde.");
          
              timeouts.push(setTimeout(() => {
                setLoadingMessage("Estamos quase lá, continue aguardando...");
              }, 5000));
          
              timeouts.push(setTimeout(() => {
                setLoadingMessage("Só mais um pouco...");
              }, 10000));
          
              timeouts.push(setTimeout(() => {
                setLoadingMessage("Está demorando mais que o normal... estamos tentando encontrar tudo.");
              }, 15000));
          
              timeouts.push(setTimeout(() => {
                setLoadingMessage("Estamos empenhados em achar todos os dados, aguarde só mais um pouco");
              }, 15000));
       
            return () => {
              // Limpa os timeouts ao desmontar ou quando isOpen mudar
              timeouts.forEach(clearTimeout);
            };
          }, []);     
  
const {theme} = useTheme()

const location = useLocation();


const handleVoltar = () => {

  const currentPath = location.pathname;
  const hasQueryParams = location.search.length > 0;
  
  if (hasQueryParams) {
    // Se tem query parameters, remove apenas eles
    navigate(currentPath);
  } else {
    // Se não tem query parameters, remove o último segmento do path
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');
    
    if (pathSegments.length > 1) {
      pathSegments.pop();
      const previousPath = '/' + pathSegments.join('/');
      navigate(previousPath);
    } else {
      // Se estiver na raiz ou com apenas um segmento, vai para raiz
      navigate('/');
    }
  }
};

  const asset = catalog?.asset ;
  const titulo = asset?.material?.material_name || asset?.item_model || asset?.item_brand || "Item sem nome";
  const valorFormatado = money(asset?.asset_value);

  const locCatalogoParts = chain(catalog?.location);

  const visibleCatalogParts = !loggedIn ? locCatalogoParts.slice(0, 2) : locCatalogoParts;

  const locAssetParts = chain(asset?.location);

const visibleParts = !loggedIn ? locAssetParts.slice(0, 2) : locAssetParts;
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
    NI: { text: "Não inventariado", icon: <HelpCircle size={12} /> as any }, // HelpCircle (phosphor) opcional
    CA: { text: "Cadastrado", icon: <Archive size={12} /> },
    TS: { text: "Aguardando aceite", icon: <Hourglass size={12} /> },
    MV: { text: "Movimentado", icon: <MoveRight size={12} /> },
    BX: { text: "Baixado", icon: <XIcon size={12} /> },
  };

  const csvCodTrimmed = (asset?.csv_code || "").trim();
  const bemStaTrimmed = (asset?.asset_status || "").trim();

  const status = statusMap[bemStaTrimmed];

type EstadoKindPt = "quebrado" | "ocioso" | "anti-economico" | "recuperavel";
type EstadoKindEn = "BROKEN" | "UNUSED" | "UNECONOMICAL" | "RECOVERABLE";
type EstadoKind = EstadoKindPt | EstadoKindEn;

// ---------------------------
// 2) Função de mapeamento
// ---------------------------
const mapSituation = (s?: EstadoKind): EstadoKindEn => {
  switch (s) {
    // português → inglês
    case "quebrado":        return "BROKEN";
    case "ocioso":          return "UNUSED";
    case "anti-economico":  return "UNECONOMICAL";
    case "recuperavel":     return "RECOVERABLE";
    // já em inglês → mantém
    case "BROKEN":
    case "UNUSED":
    case "UNECONOMICAL":
    case "RECOVERABLE":
      return s;
    // fallback
    default:
      return "UNUSED";
  }
};

// ---------------------------
// 3) Dicionário de descrições
// ---------------------------
const DESCRICOES: Record<EstadoKindEn, {
  titulo: string;
  exemplo: string;
  texto: string;
  Icon: LucideIcon;
}> = {
  UNUSED: {
    titulo: "Bom Estado",
    exemplo:"Computadores novos e semi-novos. Mesas e cadeiras em bom estado mas sem uso.",
    texto:
      "Bem permanente em condições de uso, porém sem aproveitamento funcional no setor em que se encontra, carecendo de realocação ou destinação.",
    Icon: PackageOpen,
  },
  RECOVERABLE: {
    titulo: "Recuperável",
    exemplo: "Projetor com lâmpada queimada (troca barata em relação ao preço do projetor). Cadeira com estofado rasgado, mas estrutura em bom estado.",
    texto:
      "É um bem que não pode ser usado no momento, mas que pode ser consertado com um custo viável.",
    Icon: Recycle,
  },
  UNECONOMICAL: {
    titulo: "Antieconômico",
    exemplo: "Impressora antiga que consome toners caros ou peças raras. Equipamento de laboratório ultrapassado, que funciona mas gera custos altos de manutenção em comparação a um modelo novo.",
    texto:
      "É um bem que funciona, mas cujo uso não compensa economicamente porque a manutenção é cara, a eficiência é baixa ou o equipamento ficou obsoleto.",
    Icon: BadgePercent,
  },
  BROKEN: {
     titulo: "Irrecuperável",
    exemplo:"Monitores de tubo. Microcomputador queimado com placa-mãe inutilizada. Móveis quebrados, sem possibilidade de reparo seguro. Equipamentos enferrujados, com estrutura comprometida.",
    texto:
      "É um bem que não tem mais condições de uso, porque perdeu suas características essenciais ou porque o reparo custaria mais de 50% do valor de mercado.",
    Icon: Hammer,
  },
};

 const situation = mapSituation(catalog?.situation ?? undefined);
  const info = DESCRICOES[situation];
  const Icon = info.Icon;

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

const isSameLocation =
  locCatalogoParts.join(" > ") === locAssetParts.join(" > ");

const toInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || "U";
};

const formatDateTimeBR = (iso?: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "short",
      timeStyle: "short",
      // exemplo: 18/09/2025 12:37
    }).format(d);
  } catch {
    return iso;
  }
};

  const calculateDifference = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDiff = Math.abs(currentDate.getTime() - createdDate.getTime());
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const months = Math.floor(daysDiff / 30); // aproximação
    const days = daysDiff % 30;

    let bgColor = "";
    if (months < 3) bgColor = "bg-green-700";
    else if (months < 6) bgColor = "bg-yellow-500";
    else bgColor = "bg-red-500";

    return { months, days, bgColor };
  };

   const diff = catalog?.created_at ? calculateDifference(catalog.created_at) : null;

// ... seus outros hooks (useState, useEffect, useCallback, etc.)


const {onOpen} = useModal()

const getStatusLabel = (status: WorkflowStatus) =>
  WORKFLOW_STATUS_LABELS[status] ?? status; // fallback: mostra a chave original

const fullCodeFrom = (d: CatalogResponseDTO) =>
  [d?.asset?.asset_code, d?.asset?.asset_check_digit].filter(Boolean).join("-");

const qrUrlFrom = (d: CatalogResponseDTO) => {
  const code = fullCodeFrom(d);
  return code
    ? `https://sistemapatrimonio.eng.ufmg.br/buscar-patrimonio?bem_cod=${d?.asset?.asset_code}&bem_dgv=${d?.asset?.asset_check_digit}`
    : d?.asset?.atm_number || d?.id || "Sistema Patrimônio";
};

  const {hasCatalogo, hasAcervoHistorico} = usePermissions()

const lastWorkflow = useMemo(() => {
  const hist = catalog?.workflow_history ?? [];
  if (!hist.length) return null;
  // pega o mais recente por created_at
  return hist.reduce((a, b) =>
    new Date(a.created_at) > new Date(b.created_at) ? a : b
  );
}, [catalog?.workflow_history]);


  const fullCode = fullCodeFrom(catalog || ({} as CatalogResponseDTO));
  const qrValue = qrUrlFrom(catalog || ({} as CatalogResponseDTO));



// Garante que workflow_history é um array válido
const firstWorkflow = Array.isArray(catalog?.workflow_history)
  ? catalog.workflow_history[0]
  : undefined;



// Agora você pode acessar com segurança
const firstStatus = lastWorkflow?.workflow_status;

console.log(' firstStatus', firstStatus );
// Exemplos de uso:
const workflowReview =
  firstStatus === "REVIEW_REQUESTED_DESFAZIMENTO" ||
  firstStatus === "REVIEW_REQUESTED_VITRINE" ||
  firstStatus === "ADJUSTMENT_VITRINE" ||
  firstStatus === "ADJUSTMENT_DESFAZIMENTO" ||
  firstStatus === "REJEITADOS_COMISSAO";

const workflowAnunciados = firstStatus === "VITRINE";


       const [transfers, setTransfers] = useState<TransferRequestDTO[]>([]);
     
       useEffect(() => {
    const hist = catalog?.workflow_history ?? [];
    const list = hist
      .filter((ev) => ev.workflow_status === "VITRINE")
      .flatMap((ev) => ev.transfer_requests ?? []);
    setTransfers(list);
  }, [catalog?.workflow_history]);

 const tabs = [
    { id: "visao_geral", label: "Visão Geral", icon: Home },
     { id: "documentos", label: "Documentos", icon: FileIcon },
    { id: "transferencia", label: `Pedidos de transferência ${transfers?.length ? ` (${transfers.length})` : ""}`, icon: Archive, condition:!((hasCatalogo || (user?.id == catalog?.user?.id)) && workflowAnunciados) },
    { id: "movimentacao", label: "Movimentação", icon: ArrowRightLeft, condition:!hasCatalogo },
     { id: "pareceristas", label: "Pareceristas", icon: Users, condition:!hasCatalogo },
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

  //////////////JUSTIFICVATIVA E AVALIADOR
  // === Visibilidade ===
  /**
   * ===========================================================
   * BLOCO DE EXIBIÇÃO: REVISOR E JUSTIFICATIVA
   * -----------------------------------------------------------
   * Este trecho é responsável por exibir informações do revisor
   * e/ou justificativa dentro do histórico de workflows
   * do catálogo patrimonial.
   *
   * As informações são extraídas diretamente do campo `detail`
   * de cada evento de workflow.
   *
   * === REGRAS DE EXIBIÇÃO ===================================
   * 
   * ➤ Revisor:
   *    - Só deve ser mostrado se o status atual (`workflow_status`)
   *      estiver entre:
   *        • REVIEW_REQUESTED_COMISSION
   *        • REJEITADOS_COMISSAO
   *        • DESFAZIMENTO
   *        • DESCARTADOS
   *    - O revisor SEMPRE é obtido do primeiro evento
   *      com `workflow_status === "REVIEW_REQUESTED_COMISSION"`,
   *      a partir de `detail.reviewers[0]`.
   *
   * ➤ Justificativa:
   *    - Só deve ser mostrada se o status atual estiver entre:
   *        • REJEITADOS_COMISSAO
   *        • DESFAZIMENTO
   *        • DESCARTADOS
   *    - A origem varia conforme o status atual:
   *        • Se REJEITADOS_COMISSAO → vem do primeiro evento
   *          com `workflow_status === "REJEITADOS_COMISSAO"`
   *        • Se DESFAZIMENTO ou DESCARTADOS → vem do primeiro
   *          evento com `workflow_status === "DESFAZIMENTO"`
   *    - O campo usado é `detail.justificativa`
   *
   * ===========================================================
   */
  
  // -----------------------------------------------------------
  // 1️⃣ Conjuntos de status de visibilidade
// === Conjuntos de visibilidade ===
const REVIEWER_VISIBLE_STATUSES = new Set([
  "REVIEW_REQUESTED_COMISSION",
  "REJEITADOS_COMISSAO",
  "DESFAZIMENTO",
  "DESCARTADOS",
  // novos (vitrine/desfazimento)
  "REVIEW_REQUESTED_VITRINE",
  "ADJUSTMENT_VITRINE",
  "REVIEW_REQUESTED_DESFAZIMENTO",
  "ADJUSTMENT_DESFAZIMENTO",
]);

const JUSTIFICATION_VISIBLE_STATUSES = new Set([
  "REJEITADOS_COMISSAO",
  "DESFAZIMENTO",
  "DESCARTADOS",
  // novos (vitrine/desfazimento)
  "REVIEW_REQUESTED_VITRINE",
  "ADJUSTMENT_VITRINE",
  "REVIEW_REQUESTED_DESFAZIMENTO",
  "ADJUSTMENT_DESFAZIMENTO",
]);

// === Util: achar o primeiro evento com um dos status
function findFirstWorkflowByStatuses(
  list:any,
  statuses: string[]
): WorkflowEvent | undefined {
  if (!list?.length) return undefined;
  return list.find((ev) => statuses.includes(ev.workflow_status));
}

// === Util: acessar detail (sempre "detail", conforme alinhado)
function getDetail(ev?: WorkflowEvent | null): Record<string, any> | undefined {
  if (!ev) return undefined;
  return (ev as any).detail ?? undefined;
}

// === Util: pegar justificativa do detail
function pickJustificativa(detail?: Record<string, any>): string | undefined {
  if (!detail) return undefined;
  const j = detail.justificativa;
  return typeof j === "string" && j.trim() ? j : undefined;
}

// === Util: normalizar um "user" de event.user
function pickUserFromEvent(ev?: WorkflowEvent | null): { id?: string; username?: string } | undefined {
  const u = (ev as any)?.user;
  if (u && (u.id || u.username)) {
    return { id: u.id, username: u.username };
  }
  return undefined;
}

const currentStatus = lastWorkflow?.workflow_status ?? "";
const shouldShowReviewer = REVIEWER_VISIBLE_STATUSES.has(currentStatus);
const shouldShowJustification = JUSTIFICATION_VISIBLE_STATUSES.has(currentStatus);

// ---------------- Revisor ----------------
// 1) Comissão (preferência): do primeiro REVIEW_REQUESTED_COMISSION -> detail.reviewers[0]
// 2) Fallback geral da comissão: se não houver reviewers, tentar event.user do mesmo REVIEW_REQUESTED_COMISSION
// 3) Vitrine/Desfazimento (ajustes): do primeiro ADJUSTMENT_VITRINE ou ADJUSTMENT_DESFAZIMENTO -> event.user
const reviewerFromCommission = useMemo(() => {
  if (!shouldShowReviewer) return undefined;

  // Comissão: pega do primeiro REVIEW_REQUESTED_COMISSION
  const firstCommission = findFirstWorkflowByStatuses(catalog?.workflow_history, ["REVIEW_REQUESTED_COMISSION"]);
  const commissionDetail = getDetail(firstCommission);
  const reviewerFromDetail = commissionDetail?.reviewers?.[0];

  if (reviewerFromDetail && (reviewerFromDetail.id || reviewerFromDetail.username)) {
    return reviewerFromDetail as { id?: string; username?: string };
  }

  // Fallback: user do próprio evento de comissão
  const reviewerFromCommissionUser = pickUserFromEvent(firstCommission);
  if (reviewerFromCommissionUser) return reviewerFromCommissionUser;

  // Se o status atual é de Vitrine/Desfazimento (review/adjustment), permitir revisor via ADJUSTMENT.user
  if (
    [
      "REVIEW_REQUESTED_VITRINE",
      "ADJUSTMENT_VITRINE",
      "REVIEW_REQUESTED_DESFAZIMENTO",
      "ADJUSTMENT_DESFAZIMENTO",
    ].includes(currentStatus)
  ) {
    const firstAdjustment =
      findFirstWorkflowByStatuses(catalog?.workflow_history, ["ADJUSTMENT_VITRINE"]) ??
      findFirstWorkflowByStatuses(catalog?.workflow_history, ["ADJUSTMENT_DESFAZIMENTO"]);
    const reviewerFromAdjustmentUser = pickUserFromEvent(firstAdjustment);
    if (reviewerFromAdjustmentUser) return reviewerFromAdjustmentUser;
  }

  return undefined;
}, [shouldShowReviewer, currentStatus, catalog?.workflow_history]);

// ---------------- Justificativa ----------------
// Regras:
// - REJEITADOS_COMISSAO  -> do primeiro REJEITADOS_COMISSAO (detail.justificativa)
// - DESFAZIMENTO/DESCARTADOS -> do primeiro DESFAZIMENTO (detail.justificativa)
// - REVIEW_REQUESTED_COMISSION -> do primeiro REVIEW_REQUESTED_COMISSION (detail.justificativa)
// - REVIEW_REQUESTED_VITRINE / ADJUSTMENT_VITRINE / REVIEW_REQUESTED_DESFAZIMENTO / ADJUSTMENT_DESFAZIMENTO
//      -> do primeiro ADJUSTMENT_VITRINE OU ADJUSTMENT_DESFAZIMENTO (detail.justificativa)
const justificationText = useMemo(() => {
  if (!shouldShowJustification) return undefined;

  let wf: WorkflowEvent | undefined;

  if (currentStatus === "REJEITADOS_COMISSAO") {
    wf = findFirstWorkflowByStatuses(catalog?.workflow_history, ["REJEITADOS_COMISSAO"]);
  } else if (currentStatus === "DESFAZIMENTO" || currentStatus === "DESCARTADOS") {
    wf = findFirstWorkflowByStatuses(catalog?.workflow_history, ["DESFAZIMENTO"]);
  } else if (currentStatus === "REVIEW_REQUESTED_COMISSION") {
    wf = findFirstWorkflowByStatuses(catalog?.workflow_history, ["REVIEW_REQUESTED_COMISSION"]);
  } else if (
    [
      "REVIEW_REQUESTED_VITRINE",
      "ADJUSTMENT_VITRINE",
      "REVIEW_REQUESTED_DESFAZIMENTO",
      "ADJUSTMENT_DESFAZIMENTO",
    ].includes(currentStatus)
  ) {
    wf =
      findFirstWorkflowByStatuses(catalog?.workflow_history, ["ADJUSTMENT_VITRINE"]) ??
      findFirstWorkflowByStatuses(catalog?.workflow_history, ["ADJUSTMENT_DESFAZIMENTO"]);
  } else {
    return undefined;
  }

  const detail = getDetail(wf);
  return pickJustificativa(detail);
}, [shouldShowJustification, currentStatus, catalog?.workflow_history]);
  //////////////////////////////////////////////////

      // ====== Acervo Histórico / Toggle ======
    const currentStatusFromServer = lastWorkflow?.workflow_status ?? "";
  const [isAcervoHistoricoLocal, setIsAcervoHistoricoLocal] = useState(
    currentStatusFromServer === "ACERVO_HISTORICO"
  );
  
  // sincroniza quando abrir outro item/modal
  useEffect(() => {
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
          `Falha ao alterar workflow (${res.status}): ${text || "Erro desconhecido"}`
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
  
      // ✅ SÓ AQUI muda o botão
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
  
      // ✅ SÓ AQUI muda o botão
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
  
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="text-eng-blue mb-4 animate-pulse">
              <LoaderCircle size={108} className="animate-spin" />
            </div>
            <p className="font-medium text-lg max-w-[500px] text-center">
              {loadingMessage}
            </p>
          </div>
        </div>
    );
  }

  if (!catalog) {
    return (
      <div
      className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900"
      
    >
    
          

      <div className="w-full flex flex-col items-center justify-center">
      <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
          (⊙_⊙)
        </p>
        <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
          Não foi possível acessar as <br/>  informações deste item.
        </h1>
       

        <div className="flex gap-3 mt-8">
                <Button  onClick={handleVoltar} variant={'ghost'}><Undo2 size={16}/> Voltar</Button>
                 <Link to={'/'}> <Button><Home size={16}/> Página Inicial</Button></Link>

                </div>
      </div>
    </div>
    );
  }


if(catalog) {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Helmet>
        <title>{titulo} | Sistema Patrimônio</title>
        <meta name="description" content={`Detalhes do item ${asset?.asset_code}-${asset?.asset_check_digit}`} />
      </Helmet>

      {/* Header */}
      <div className="flex items-center gap-4">
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
        
 

 {((((catalog?.user?.id === user?.id) || hasCatalogo) && workflowReview)) && (
          <Button onClick={handleEdit} variant='outline' size="sm">
            <Pencil size={16} /> Editar
          </Button>
           )}

 {((((catalog.user?.id === user?.id) || hasCatalogo) && workflowReview)) && (
          <Button onClick={openDelete} variant="destructive" size="sm" disabled={deleting}>
  <Trash size={16} /> Excluir
</Button>
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

 {/* Favoritar (opcional) */}
              {(loggedIn && workflowAnunciados) && (
                <div onClick={(e) => e.stopPropagation()}>
                  <LikeButton id={catalog?.id} />
                </div>
              )}
        </div>
      </div>

      {/* Imagens */}
      <div className="grid grid-cols-1">
      <Carousel items={cards} />

        <div className="flex flex-1 mt-8 h-full lg:flex-row flex-col-reverse gap-8">
          {/* Coluna principal */}
           <Tabs defaultValue="visao_geral" value={value} className="w-full">
                     <div className="flex justify-between items-start">
             <div className="flex justify-between w-full">
               <h2 className="text-3xl font-semibold leading-none tracking-tight mb-2">{titulo}</h2>

                 <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-2 items-center">
                  <Calendar size={16}/>{formatDateTimeBR(catalog.created_at)}
                 
                 {diff && (
              <Badge className={`text-white h-6 py-1 text-xs font-medium ${diff.bgColor}`}>
                {diff.months > 0
                  ? `${diff.months} ${diff.months === 1 ? "mês" : "meses"} e ${diff.days} ${diff.days === 1 ? "dia" : "dias"}`
                  : `${diff.days} ${diff.days === 1 ? "dia" : "dias"}`}
              </Badge>
            )}
                 </div>
             </div>
            </div>

            <p className="mb-8 text-gray-500">{asset?.asset_description || "Sem descrição."}</p>

 
                    
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
                              {tabs.map(({ id, label, icon: Icon, condition }) => !condition && (
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

<TabsContent value="visao_geral">
  
          <div className="flex w-full flex-col">
          
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
                            qualisColor[csvCodTrimmed as keyof typeof qualisColor] || "bg-zinc-300"
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

                  {loggedIn && (
                    <>
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
              <div className={`w-2 min-w-2 rounded-l-md border border-r-0 bg-eng-blue relative`} />
              <Alert className="flex flex-col rounded-l-none">
                
        <div className="flex gap-4 flex-col ">
        
          <div className="flex gap-2 w-full">
            <Icon  size={24} />
            <div className="w-full">
           <div className="flex justify-between">
               <p className="font-medium">{info.titulo}</p>

               <Badge variant="outline">Situação</Badge>
           </div>
              <p className="text-gray-500 text-sm">{info.texto}</p>
            
          
            </div>
          </div>
        </div>

        
{catalog.conservation_status && (
<Separator className="my-4" />
)}
        {
  catalog.conservation_status &&
  catalog.conservation_status in CONSERVATION_MAP && (
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
          <p
            className="text-gray-500 text-sm"
            data-description
          >
            {
              CONSERVATION_MAP[catalog.conservation_status as ConservationStatus]
                .description
            }
          </p>
        </div>
      </div>
    </div>
  )
}
         

          

                {/* Localização do asset (origem) */}
              
              </Alert>
            </div>

            
            <div className="flex">
              <div className={`w-2 min-w-2 rounded-l-md border border-r-0 bg-eng-blue relative`} />
              <Alert className="flex flex-col rounded-l-none">
                
   

  
               

                {catalog.description && (
                  <>
               <p className="text-xl font-medium">Justificativa</p>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{catalog.description}</div>
                  </>
                )}

                {/* Localização atual (Catálogo) */}
                <Separator className="my-4" />
               <div className="space-y-2">
  {/* Localização do Catálogo (sempre mostra) */}
   <div className="flex items-center gap-2 flex-wrap">
        <MapPin size={16} />
      <p className="text-sm uppercase font-bold">Local de tombamento:</p>
    
      {visibleParts.length ? (
        <div className="flex items-center gap-2 flex-wrap">
          {visibleParts.map((p, i) => (
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

  {/* Localização do Asset (só mostra se for diferente) */}
  {!isSameLocation && (
      <div className="flex items-center gap-2 flex-wrap">
        <MapPin size={16} />
    <p className="text-sm uppercase font-bold">Local atual:</p>

    {visibleCatalogParts.length ? (
      <div className="flex items-center gap-2 flex-wrap">
        {visibleCatalogParts.map((p, i) => (
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

            

{/* Revisor + Justificativa (apenas quando houver algo) */}
{((shouldShowReviewer && reviewerFromCommission) || (shouldShowJustification && justificationText)) && (
  <Alert className="mt-8">
    {shouldShowReviewer && reviewerFromCommission && (
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
          <p className="text-sm w-fit text-gray-500">Parecerista</p>
          <p className="text-black dark:text-white font-medium text-lg truncate">
            {reviewerFromCommission.username ?? "Não informado"}
          </p>
        </div>
      </div>
    )}

    {shouldShowJustification && justificationText && (
      <div className={reviewerFromCommission ? "mt-4" : ""}>
        <p className=" w-fit text-gray-500 mb-2">Justificativa</p>
        <p className="text-gray-500 text-sm text-justify">
          {justificationText}
        </p>
      </div>
    )}
  </Alert>
)}

     {/* Material / Metadados rápidos */}
           {loggedIn && (
         
            <Separator className="mt-8 mb-2" />
           )}
           
          {loggedIn && (
             <Accordion  type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1" >
                <div className="flex ">
                <HeaderResultTypeHome title="Histórico na plataforma" icon={<Workflow size={24} className="text-gray-400" />}>
                        </HeaderResultTypeHome>
                    <AccordionTrigger>
                    
                    </AccordionTrigger>
                    </div>
                   <AccordionContent className="p-0">
  <div className="flex flex-col ">
    {catalog.workflow_history?.length === 0 ? (
      <div className="text-sm text-muted-foreground px-1">
        Nenhum evento de workflow.
      </div>
    ) : (
     catalog.workflow_history?.reverse().map((ev, idx) => {
        const meta =
          WORKFLOW_STATUS_META[ev.workflow_status] ??
          { Icon: HelpCircle, colorClass: "text-zinc-500" };

        const { Icon } = meta;
        const username =
          ev.user?.username ||
          ev.user?.email?.split("@")[0] ||
          "Usuário";

           const total = catalog?.workflow_history?.length ?? 0;
  const isLast = idx === total - 1;
        return (
          <div key={ev.id} className="flex gap-2">
            {/* Bloco do ícone à esquerda, seguindo seu layout */}
           <div className="flex flex-col items-center">
             <Alert className="flex w-14 h-14 items-center justify-center">
          <div>
                <Icon className={``} size={16}/>
          </div>
            </Alert>

         {!isLast && (
          <Separator className="min-h-8" orientation="vertical" />
        )}
           </div>

            {/* Conteúdo à direita */}
            <div className="flex-1">
              <p className="text-lg font-medium">
                {getStatusLabel(ev.workflow_status)}
              </p>

  {ev.detail?.justificativa && (
 <p className="text-sm dark:text-gray-300 mt-2 mb-4 text-gray-500 font-normal">
                {ev.detail.justificativa}
              </p>
  ) }
                

              {/* linha com avatar + user + data */}
              <div className="flex gap-3 mt-2 mb-2 flex-wrap items-center justify-between ">
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

              {/* Se quiser mostrar detalhes do evento futuramente:
              {ev.detail && <p className="text-sm text-muted-foreground mt-1">...</p>} */}
            </div>
          </div>
        );
      })
    )}
  </div>
</AccordionContent>
                </AccordionItem>
                </Accordion>
          )}
          </div>
</TabsContent>

 <TabsContent value="transferencia">
     <TransferTabCatalog
      catalog={catalog}
      urlGeral={urlGeral}
      token={token}
      onChange={() => {
        // opcional: refetch do catálogo ou setState local, se quiser
      }}
    />
 </TabsContent>

{hasCatalogo && (

                    <TabsContent value="movimentacao">
 <MovimentacaoModalCatalog
    catalog={catalog ?? ({} as CatalogEntry)}
    urlGeral={urlGeral}
    onUpdated={(updated) => {
      // opcional: atualizar o estado local do CatalogModal com o catálogo atualizado
      // por exemplo, se você guarda `catalog` em state, faça setCatalog(updated)
      (catalog.workflow_history ??= []);
      // Se o catalog vem de props/context, você pode ignorar ou forçar um refresh
    }}
  />
                    </TabsContent>
                    )}


                        <TabsContent value="documentos">
                                          <DocumentsTabCatalog
                        catalog={catalog}
                        urlGeral={urlGeral}
                        token={token}
                        onChange={() => {
                          // opcional: refetch do catálogo ou setState local, se quiser
                        }}
                      />
                                        </TabsContent>

                                           <TabsContent value="pareceristas">
                                        <ReviewersCatalogModal
                                        catalog={catalog}
                                        roleId={import.meta.env.VITE_ID_COMISSAO_PERMANENTE}
                                        />
                                                              </TabsContent>
                                        
          </Tabs>

          {/* Coluna lateral */}
          <div className="lg:w-[420px] flex flex-col gap-8 lg:min-w-[420px] w-full">
           <ButtonTransference catalog={catalog}/>
           
           <Link to={`/user?id=${catalog.user?.id}`} target="_blank">
           <Alert className="p-8">
             <div className="flex gap-3 items-center">
                                <Avatar className="rounded-md h-12 w-12">
                                  <AvatarImage className={""} src={`${urlGeral}user/upload/${catalog.user?.id}/icon`} alt={`${catalog.user?.username}`} />
                                  <AvatarFallback className="flex items-center justify-center">
                                    <User size={16} />
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
           </Link>
           
          <Link to={`/buscar-patrimonio?bem_cod=${asset?.asset_code}&bem_dgv=${asset?.asset_check_digit}`}>
          <div className={`flex   `} >
      <div className="w-2 min-w-2 rounded-l-md  border dark:border-neutral-800  border-r-0 bg-eng-blue min-h-full" />
      <Alert className=" border  rounded-l-none items-center flex gap-4 p-8 rounded-r-md">
        <div className="w-fit">
          <QRCode fgColor={theme == 'dark'? '#FFFFFF': '#000000'} bgColor={!(theme == 'dark')? '#FFFFFF': '#000000'} size={96} value={qrValue} />
        </div>
        <div className="flex flex-col h-full justify-center ">
          <p className=" font-semibold  uppercase">Engenharia UFMG</p>
        
          <div className="font-bold  mb-2 text-2xl">{fullCode}</div>
          <div className="h-8">
            <Barcode128SVG value={fullCode} heightPx={32} modulePx={1.4} fullWidth={true} />
          </div>
        </div>
      </Alert>
    </div></Link>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader >
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
  )
};
}

export default ItemPage;
