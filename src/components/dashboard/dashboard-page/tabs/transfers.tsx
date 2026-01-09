import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../../../context/context";
import { TransferCard } from "../components/transfer-card";
import { LoaderCircle } from "lucide-react";
import { useIsMobile } from "../../../../hooks/use-mobile";

type UUID = string;

interface Material { material_name: string; material_code: string; id: UUID; }
interface LegalGuardian { legal_guardians_name: string; legal_guardians_code: string; id: UUID; }

interface CatalogAsset {
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
  id: UUID;
  material: Material;
  legal_guardian: LegalGuardian;
  location: {
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
  };
  is_official: boolean;
}

export type WorkflowHistoryItem = {
  workflow_status: string;
  detail?: Record<string, any>;
  id: UUID;
  user: {
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
  };
  catalog_id: UUID;
  created_at: string;
};

type CatalogImage = { id: UUID; catalog_id: UUID; file_path: string; };

export type CatalogEntry = {
  situation: string;
  conservation_status: string;
  description: string;
  id: UUID;
  asset: CatalogAsset;
  user: WorkflowHistoryItem["user"];
  location: CatalogAsset["location"];
  images: CatalogImage[];
  workflow_history: WorkflowHistoryItem[];
  created_at: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};




export function Transfers() {
  const { urlGeral, user } = useContext(UserContext);
  const token = useMemo(() => localStorage.getItem("jwt_token") ?? "", []);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<CatalogEntry[]>([]);

  async function getCatalog() {
    if (!user) return;
    const items = await fetch(
      `${urlGeral}catalog/?offset=0&limit=100&user_id=${user.id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!items.ok) {
      throw new Error(`Falha ao carregar items (HTTP ${items.status}).`);
    }

    const res = await items.json();

    let catalogItems = res.catalog_entries;
    catalogItems = catalogItems.filter(
      (item) =>
        item.workflow_history?.some(
          (historico) => historico.workflow_status === "VITRINE"
        ) &&
        item.workflow_history?.some(
          (historico) => historico.detail?.transfer_requests.length > 0
        )
    );
    setItems(catalogItems);
    setLoading(false);
  }

  useEffect(() => {
    getCatalog();
  }, [urlGeral, user]);
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
  return (
    <div className="p-8 pt-0 grid gap-8">
      {items.map((ci) => (
        <TransferCard
          catalog={ci}
          urlGeral={urlGeral}
          token={token}
          onChange={() => {}}
        />
      ))}
    </div>
  );
}
