// src/pages/item/index.tsx
import {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert } from "../ui/alert";
import { Card, Carousel } from "../ui/apple-cards-carousel";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  MapPin,
  Home,
  Undo2,
  User,
  History,
  CalendarIcon,
  Info,
} from "lucide-react";
import { UserContext } from "../../context/context";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tabs, TabsContent } from "../ui/tabs";
import TransferTabCatalog, {
  TransferRequestDTO,
} from "../homepage/components/transfer-tab-catalog";
import { DownloadPdfButton } from "../download/download-pdf-button";
import { useIsMobile } from "../../hooks/use-mobile";
import AudiovisualTab from "./emprestimo";
import HistoryTab from "./history";
import ItemLoanCalendar from "../dashboard/audiovisual/calendario-item";
import { Files } from "../homepage/components/documents-tab-catalog";
import { LoanableItemDTO } from "../dashboard/audiovisual/audiovisual";

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
interface LegalGuardian {
  legal_guardians_name: string;
  legal_guardians_code: string;
  id: UUID;
}

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
      unit: {
        unit_name: string;
        unit_code: string;
        unit_siaf: string;
        id: UUID;
      };
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
  material: MaterialDTO;
  legal_guardian: LegalGuardianDTO;
  location: LocationDTO;
}
type ApiSituation = "UNUSED" | "BROKEN" | "UNECONOMICAL" | "RECOVERABLE";

interface CatalogImageDTO {
  id: string;
  catalog_id: string;
  file_path: string;
}

export interface UserDTO {
  id: UUID;
  username: string;
  email: string;
  provider: string;
  linkedin?: string;
  lattes_id?: string;
  orcid?: string;
  ramal?: string;
  photo_url?: string;
  background_url?: string;
  matricula?: string;
  verify?: boolean;
  institution_id: UUID;
}
type WorkflowHistoryItem = {
  workflow_status: string;
  detail?: Record<string, any>;
  id: UUID;
  user: UserDTO;
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
  user: UserDTO;
  location: LocationDTO; // localização ATUAL do item no catálogo
  images: CatalogImageDTO[];
  workflow_history: WorkflowHistoryItem[];
  transfer_requests?: TransferRequest[];
}

export type TransferRequest = {
  id: string;
  status: string;
  user: UserDTO;
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

/* ===================== Hook query ===================== */
const useQuery = () => new URLSearchParams(useLocation().search);

/* ===================== Página ===================== */
export function LoanItemPage() {
  const navigate = useNavigate();
  const query = useQuery();

  const { urlGeral, loggedIn } = useContext(UserContext);
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
  const [loan, setLoan] = useState<LoanableItemDTO>();

  const fetchLoan = useCallback(async () => {
    if (!catalogId) return;
    setLoading(true);
    try {
      const res = await fetch(`${urlGeral}loans/${catalogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data: LoanableItemDTO = await res.json();

      setLoan(data);
    } catch (e: any) {
      toast("Erro ao carregar", {
        description: e?.message || "Não foi possível obter o item.",
      });
    } finally {
      setLoading(false);
    }
  }, [catalogId, token, urlGeral]);

  useEffect(() => {
    fetchLoan();
  }, [fetchLoan]);

  const images = useMemo(() => {
    return (loan?.catalog?.images ?? []).slice(0, 4).map((img) => ({
      category: "",
      title: "",
      src: buildImgUrl(img.file_path),
    }));
  }, [loan?.catalog?.images]);

  const cards = useMemo(
    () =>
      images.map((card, index) => (
        <Card key={card.src} card={card} index={index} layout={true} />
      )),
    [images],
  );

  const handleBack = () => navigate(-1);

  const [loadingMessage, setLoadingMessage] = useState(
    "Estamos procurando todas as informações no nosso banco de dados, aguarde.",
  );

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    setLoadingMessage(
      "Estamos procurando todas as informações no nosso banco de dados, aguarde.",
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Estamos quase lá, continue aguardando...");
      }, 5000),
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Só mais um pouco...");
      }, 10000),
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Está demorando mais que o normal... estamos tentando encontrar tudo.",
        );
      }, 15000),
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Estamos empenhados em achar todos os dados, aguarde só mais um pouco",
        );
      }, 15000),
    );

    return () => {
      // Limpa os timeouts ao desmontar ou quando isOpen mudar
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const location = useLocation();

  const handleVoltar = () => {
    const currentPath = location.pathname;
    const hasQueryParams = location.search.length > 0;

    if (hasQueryParams) {
      // Se tem query parameters, remove apenas eles
      navigate(currentPath);
    } else {
      // Se não tem query parameters, remove o último segmento do path
      const pathSegments = currentPath
        .split("/")
        .filter((segment) => segment !== "");

      if (pathSegments.length > 1) {
        pathSegments.pop();
        const previousPath = "/" + pathSegments.join("/");
        navigate(previousPath);
      } else {
        // Se estiver na raiz ou com apenas um segmento, vai para raiz
        navigate("/");
      }
    }
  };

  const chain = (loc?: LocationDTO) => {
    if (!loc || !loc.sector) return [];
    const s = loc.sector;
    const a = s.agency;
    const u = a?.unit;
    // ordem: Unidade -> Agência -> Setor -> Local
    const parts: string[] = [];
    if (u) parts.push(`${u.unit_code} - ${u.unit_name}`);
    if (a) parts.push(`${a.agency_code} - ${a.agency_name}`);
    parts.push(`${s.sector_code} - ${s.sector_name}`);
    parts.push(`${loc.location_code} - ${loc.location_name}`);
    return parts;
  };

  const asset = loan?.catalog?.asset;
  const titulo =
    asset?.material?.material_name ||
    asset?.item_model ||
    asset?.item_brand ||
    "Item sem nome";

  const locCatalogoParts = chain(loan?.catalog?.location);

  const visibleCatalogParts = !loggedIn
    ? locCatalogoParts.slice(0, 2)
    : locCatalogoParts;

  const locAssetParts = chain(asset?.location);

  const visibleParts = !loggedIn ? locAssetParts.slice(0, 2) : locAssetParts;

  let tabs = [
    { id: "emprestimo", label: "Empréstimo", icon: Info },
    { id: "historico", label: "Histórico", icon: History },
    { id: "calendario", label: "Calendário", icon: CalendarIcon },
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

  const [value, setValue] = useState("emprestimo");

  const isMobile = useIsMobile();

  if (loading) {
    if (isMobile) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="text-eng-blue mb-4 animate-pulse">
              <LoaderCircle size={54} className="animate-spin" />
            </div>
            <p className="font-medium text-lg max-w-[400px] text-center">
              {loadingMessage}
            </p>
          </div>
        </div>
      );
    } else
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
  if (!loan?.catalog) {
    return (
      <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full flex flex-col items-center justify-center">
          <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
            (⊙_⊙)
          </p>
          <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
            Não foi possível acessar as <br /> informações deste item.
          </h1>

          <div className="flex gap-3 mt-8">
            <Button onClick={handleVoltar} variant={"ghost"}>
              <Undo2 size={16} /> Voltar
            </Button>
            <Link to={"/"}>
              {" "}
              <Button>
                <Home size={16} /> Página Inicial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loan?.catalog) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Helmet>
          <title>{titulo} | Sistema Patrimônio</title>
          <meta
            name="description"
            content={`Detalhes do item ${asset?.asset_code}-${asset?.asset_check_digit}`}
          />
        </Helmet>

        {/* Header */}
        <div className="flex items-center gap-4">
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
          </h1>

          <div className="hidden md:flex items-center gap-2">
            <DownloadPdfButton
              filters={{}}
              id={catalogId}
              label="Baixar Item"
              method={"item"}
            />
          </div>
        </div>

        {/* Imagens */}
        <div className="grid grid-cols-1">
          <Carousel items={cards} />

          <div
            className={
              isMobile
                ? "flex flex-1 h-full lg:flex-row flex-col-reverse gap-8"
                : "flex flex-1 mt-8 h-full lg:flex-row flex-col-reverse gap-8"
            }
          >
            {/* Coluna principal */}
            <Tabs defaultValue="emprestimo" value={value} className="w-full">
              <div className="flex justify-between items-start">
                <div
                  className={
                    isMobile
                      ? "flex flex-col justify-between w-full"
                      : "flex justify-between w-full"
                  }
                >
                  <h2 className="text-3xl font-semibold leading-none tracking-tight mb-2">
                    {titulo}
                  </h2>
                </div>
              </div>

              <p
                className={
                  isMobile
                    ? "mb-8 text-gray-500 text-sm mt-4"
                    : "mb-8 text-gray-500"
                }
              >
                {asset?.asset_description || "Sem descrição."}
              </p>

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

              <TabsContent value="emprestimo">
                <div className="flex w-full flex-col">
                  <div className="flex group ">
                    <div
                      className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-eng-blue min-h-full`}
                    />
                    <Alert className="flex flex-col flex-1 h-fit rounded-l-none p-4 gap-4">
                      <p className="font-semibold flex gap-3 items-center text-left flex-1">
                        {asset?.asset_code?.trim()} - {asset?.asset_check_digit}
                        {!!asset?.atm_number && asset.atm_number !== "None" && (
                          <Badge variant="outline">
                            ATM: {asset.atm_number}
                          </Badge>
                        )}
                      </p>
                      <div className="flex gap-1 items-center">
                        <Avatar className="rounded-md h-5 w-5">
                          <AvatarImage
                            className="rounded-md h-5 w-5"
                            src={`${urlGeral}ResearcherData/Image?name=${loan?.guardian?.username || ""}`}
                          />
                          <AvatarFallback className="flex items-center justify-center">
                            <User size={10} />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-gray-500 dark:text-gray-300 font-normal">
                          {asset?.legal_guardian?.legal_guardians_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <MapPin size={16} />
                        <p className="text-sm uppercase font-bold">Local:</p>
                        {visibleParts.map((p, i) => (
                          <div
                            key={i}
                            className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2"
                          >
                            {i > 0 && <ChevronRight size={14} />} {p}
                          </div>
                        ))}
                      </div>
                    </Alert>
                  </div>
                  <AudiovisualTab loan={loan} />
                </div>
              </TabsContent>

              <TabsContent value="historico">
                <HistoryTab item={loan} />
              </TabsContent>
              <TabsContent value="calendario">
                <div>
                  <ItemLoanCalendar item={loan} />
                </div>
              </TabsContent>
            </Tabs>

            {/* Coluna lateral */}
          </div>
        </div>
      </main>
    );
  }
}

export default LoanItemPage;
