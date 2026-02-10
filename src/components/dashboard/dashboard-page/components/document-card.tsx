import React, { useContext, useEffect, useState } from "react";
import { FilePen, LoaderCircle } from "lucide-react"; // Adicionado LoaderCircle
import { useModal } from "../../../hooks/use-modal-store";
import { UserContext } from "../../../../context/context";
import { useIsMobile } from "../../../../hooks/use-mobile";

/* ===== Tipos ===== */
type UUID = string;

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
  created_at: string;
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
  created_at: string;
}

export type SignerData = {
  user: UUID;
  document: UUID;
  isSigned: boolean;
  signedAt: Date;
  token: string;
};

export type DocumentData = {
  id: UUID;
  status: "PENDING" | "APPROVED" | "REJECTED";
  catalog: CatalogDTO;
  file_path: string;
  signers: SignerData[];
};

export interface SignerCardProps {
  catalog_id: string;
  data: DocumentData;
}

/* ===== Componente ===== */
export function DocumentCard({ catalog_id, data }: SignerCardProps) {
  const { onOpen } = useModal();
  const { urlGeral } = useContext(UserContext);

  // States
  const [catalog, setCatalog] = useState<CatalogDTO | undefined>(undefined);
  const [loading, setLoading] = useState(true); // Estado de loading

  // Utils
  const isMobile = useIsMobile();
  const loadingMessage = "Carregando informações do documento...";

  const pending =
    data.signers?.filter((signer) => !signer.isSigned).length ?? 0;

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${urlGeral}catalog/${catalog_id}`);
      if (!res.ok) throw new Error("Erro ao buscar catálogo");
      const json = await res.json();
      setCatalog(json);
    } catch (error) {
      console.error("Erro no SignerCard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [catalog_id, urlGeral]);

  const handleOpen = () => {
    onOpen("document-signers", {
      catalog,
      document_data: data,
    });
  };

  // --- LÓGICA DE LOADING ---
  if (loading) {
    if (isMobile) {
      return (
        <div className="flex justify-center items-center h-full min-h-[100px]">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="text-eng-blue mb-4 animate-pulse items-center">
              <LoaderCircle size={24} className="animate-spin" />
            </div>
            <p className="font-medium text-sm max-w-[400px] text-center text-muted-foreground">
              {loadingMessage}
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex justify-center items-center h-full min-h-[120px]">
          <div className="w-full flex gap-3 items-center">
            <div className="text-eng-blue items-center animate-pulse">
              <LoaderCircle size={24} className="animate-spin" />
            </div>
            <p className="font-medium text-base max-w-[500px] text-center text-muted-foreground">
              {loadingMessage}
            </p>
          </div>
        </div>
      );
    }
  }

  // --- CONTEÚDO PRINCIPAL ---
  return (
    <>
      <div className="grid cursor-pointer" onClick={handleOpen}>
        <div className="w-full my-3 py-3 flex items-center gap-4 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded p-2 transition-colors">
          {/* Ícone */}
          <FilePen size={24} className="text-gray-500 shrink-0" />

          {/* Conteúdo */}
          <div className="text-lg font-bold flex items-center gap-8 flex-wrap">
            <span className="break-all">{data.file_path}</span>

            {pending > 0 ? (
              <span className="bg-eng-blue text-white text-sm px-3 py-1 rounded-full whitespace-nowrap">
                {pending} assinaturas pendentes
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full border border-green-200 whitespace-nowrap">
                Concluído
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DocumentCard;
