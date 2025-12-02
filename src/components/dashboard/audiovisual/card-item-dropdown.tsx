// src/pages/vitrine/card-item-dropdown.tsx
import { Draggable } from "@hello-pangea/dnd";
import { useContext } from "react";
import { UserContext } from "../../../context/context";
import { ItemPatrimonioKanban } from "../../homepage/components/item-patrimonio-kanban";

/* ===== Tipos (compatíveis com a página) ===== */
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
};

/** Ações que vêm do pai (todas opcionais) */
type ParentActions = {
  isFavorite?: boolean;
  onToggleFavorite?: (patrimonioId: string) => void;
  handlePutItem?: (patrimonio_id: string, verificado: boolean) => Promise<void>;
  viewCount?: number;
  onPromptDelete?: () => void; // abre diálogo de deletar no pai
  onPromptMove?: () => void;   // abre diálogo de movimentar no pai
};

type Props = ParentActions & {
  entry: CatalogEntry;
  index: number;
  isImage: boolean
  draggableId: string
};

export function CardItemDropdown({
  entry,
  index,
  isFavorite,
  onToggleFavorite,
  handlePutItem,
  viewCount,
  onPromptDelete,
  onPromptMove,
  isImage,
  draggableId
}: Props) {
  // (se precisar de algo do contexto)
  useContext(UserContext);

  return (
   <Draggable draggableId={draggableId} index={index}>
    {(prov, snap) => (
      <div
        ref={prov.innerRef}
        {...prov.draggableProps}
        {...prov.dragHandleProps}
        className={`${snap.isDragging ? "" : ""}`}
        style={{
          ...prov.draggableProps.style,
          pointerEvents: snap.isDragging ? 'none' : 'auto',
        }}
      >
        <ItemPatrimonioKanban
          key={entry.id}
          {...entry}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          handlePutItem={handlePutItem}
          viewCount={viewCount}
          onPromptDelete={onPromptDelete}
          onPromptMove={onPromptMove}
          isImage={isImage}
        />
      </div>
    )}
  </Draggable>
  );
}
