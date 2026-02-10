import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Home, LoaderCircle, Undo2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { UserContext } from "../../../context/context";
import { useQuery } from "../../authentication/signIn";
import { useIsMobile } from "../../../hooks/use-mobile";

export type UUID = string;
export type ISODateString = string;

/** ----- User ----- */
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

/** ----- Unit / Agency / Sector (hierarquia) ----- */
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

/** ----- Legal Guardian ----- */
export interface LegalGuardianDTO {
  id: UUID;
  legal_guardians_code: string;
  legal_guardians_name: string;
}

/** ----- Location ----- */
export interface LocationDTO {
  id: UUID;
  location_name: string;
  location_code: string;
  sector_id: UUID;
  legal_guardian_id: UUID;
  sector: SectorDTO;
  legal_guardian: LegalGuardianDTO;
}

/** ----- Material ----- */
export interface MaterialDTO {
  id: UUID;
  material_code: string;
  material_name: string;
}

/** ----- Asset ----- */
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

/** ----- Catalog image ----- */
export interface CatalogImageDTO {
  id: UUID;
  catalog_id: UUID;
  file_path: string;
}

/** ----- Transfer request dentro do histórico de workflow ----- */
export interface WorkflowTransferRequestDTO {
  id: UUID;
  status: string; // "PENDING" | "DECLINED" | "ACCEPTABLE" | ...
  user: UserDTO;
  location: LocationDTO;
}

/** ----- Workflow history ----- */
export interface WorkflowHistoryDTO {
  id: UUID;
  workflow_status: string; // considere criar um union se tiver a enum
  detail?: Record<string, any>;
  user: UserDTO;
  transfer_requests: WorkflowTransferRequestDTO[];
  catalog_id: UUID;
  created_at: ISODateString;
}

/** ----- Catalog ----- */
export interface CatalogDTO {
  id: UUID;
  description: string;
  conservation_status: string;
  situation: string; // ex.: "UNUSED" (crie union se tiver a lista completa)
  asset: AssetDTO;
  user: UserDTO;
  location: LocationDTO;
  images: CatalogImageDTO[];
  workflow_history: WorkflowHistoryDTO[];
  created_at: ISODateString;
}

/** ----- Collection item ----- */
export interface CollectionItemDTO {
  id: UUID;
  status: boolean;
  comment: string;
  catalog: CatalogDTO;
}

/** ----- Collection (raiz da resposta) ----- */
export interface CollectionDTO {
  id: UUID;
  name: string;
  description: string;
  user_id: UUID;
  created_at: ISODateString;
  items: CollectionItemDTO[];
}

export function CollectionPage() {
  const { urlGeral } = useContext(UserContext);
  const navigate = useNavigate();
  const queryUrl = useQuery();
  const type_search = queryUrl.get("collection_id");
  const [loading, setLoading] = useState(false);
  const [collection, setCollection] = useState<CollectionDTO | null>(null);
  const location = useLocation();
  const token = localStorage.getItem("jwt_token");
  useEffect(() => {
    const locId = type_search?.trim();
    if (!locId) {
      setCollection(null);
      return;
    }

    const controller = new AbortController();

    async function fetchLocation() {
      try {
        setLoading(true);

        const res = await fetch(`${urlGeral}colletions/${type_search}`, {
          method: "GET",
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` }, // se precisar de auth, descomente e injete o token
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            text || `Falha ao buscar localização (${res.status})`
          );
        }

        const data: CollectionDTO = await res.json();
        setCollection(data);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setCollection(null);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchLocation();
    return () => controller.abort();
  }, [type_search]);

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

  const [loadingMessage, setLoadingMessage] = useState(
    "Estamos procurando todas as informações no nosso banco de dados, aguarde."
  );

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    setLoadingMessage(
      "Estamos procurando todas as informações no nosso banco de dados, aguarde."
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Estamos quase lá, continue aguardando...");
      }, 5000)
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Só mais um pouco...");
      }, 10000)
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Está demorando mais que o normal... estamos tentando encontrar tudo."
        );
      }, 15000)
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Estamos empenhados em achar todos os dados, aguarde só mais um pouco"
        );
      }, 15000)
    );

    return () => {
      // Limpa os timeouts ao desmontar ou quando isOpen mudar
      timeouts.forEach(clearTimeout);
    };
  }, []);

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

  if (!collection) {
    return (
      <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full flex flex-col items-center justify-center">
          <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
            (⊙_⊙)
          </p>
          <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
            Não foi possível acessar as <br /> informações desta sala.
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

  return (
    <main className=" w-full grid grid-cols-1 ">
      <Helmet>
        <title>{collection.name} | Sistema Patrimônio</title>
        <meta
          name="description"
          content={`${collection.name} | Sistema Patrimônio`}
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <main className="grid grid-cols-1 "></main>
    </main>
  );
}
