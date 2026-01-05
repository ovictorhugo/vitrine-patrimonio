import { create } from "zustand";
import { Files } from "../homepage/components/documents-tab-catalog";
import { CatalogEntriesResponse } from "../homepage/components/item-patrimonio";
import { CatalogDTO } from "../dashboard/collection/collection-page";

/** Todos os tipos de modal usados no app */
export type ModalType =
  | "add-background"
  | "delete-account"
  | "atualizar-senha"
  | "import-csv"
  | "import-csv-morto"
  | "itens-ociosos"
  | "adicionar-empenho"
  | "confirm-delete-fornecedor"
  | "informacoes-empenhos"
  | "search"
  | "minha-area"
  | "search-vitrine"
  | "edit-item"
  | "edit-admin-item"
  | "search-patrimonio"
  | "filters-patrimonio"
  | "filters-patrimonio-adm"
  | "patrimonio"
  | "add-patrimonio"
  | "search-cod-atm"
  | "search-loc-nom"
  | "edit-patrimonio"
  | "relatar-problema"
  | "workflow"
  | "filters-assets"
  | "catalog-modal"
  | "sign-in"
  | "search-patrimonio-exact"
  | "transfer-modal";

/** DTOs auxiliares */
type UnitDTO = {
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
  id: string;
};
type AgencyDTO = {
  agency_name: string;
  agency_code: string;
  unit_id: string;
  id: string;
  unit: UnitDTO;
};
type SectorDTO = {
  agency_id: string;
  sector_name: string;
  sector_code: string;
  id: string;
  agency: AgencyDTO;
};
type LegalGuardianDTO = {
  legal_guardians_code: string;
  legal_guardians_name: string;
  id: string;
};
type LocationDTO = {
  legal_guardian_id?: string;
  sector_id?: string;
  location_name: string;
  location_code: string;
  id?: string;
  sector?: SectorDTO;
  legal_guardian?: LegalGuardianDTO;
};
type MaterialDTO = {
  material_code: string;
  material_name: string;
  id: string;
};
export type TransferRequestDTO = {
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

/** Payload que trafega dentro do modal */
export interface ModalData {
  id?: string;
  name?: string;
  catalog?: CatalogDTO;
  workflow_status?: string;
  files?: Files;
  asset_code?: string;
  asset_check_digit?: string;
  atm_number?: string;
  serial_number?: string;
  asset_status?: string;
  asset_value?: string;
  asset_description?: string;
  csv_code?: string;
  accounting_entry_code?: string;
  item_brand?: string;
  item_model?: string;
  group_type_code?: string;
  group_code?: string;
  expense_element_code?: string;
  subelement_code?: string;
  material?: MaterialDTO;
  legal_guardian?: LegalGuardianDTO;
  location?: LocationDTO;
  is_official?: boolean;
  transfer_request?: TransferRequestDTO;
}

/** Factory para garantir um data SEM resíduos */
const getInitialData = (): ModalData => ({
  // manter vazio garante que TODAS as chaves opcionais fiquem undefined
  // se você quiser valores default, defina-os aqui
});

/** Store do modal */
interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  data: ModalData;

  /** Abre (ou reabre) um modal definindo o tipo e substituindo o data */
  onOpen: (type: ModalType, data?: ModalData) => void;

  /** Fecha o modal e zera o data (limpo mesmo pós-fechamento) */
  onClose: () => void;

  /** Substitui todo o data */
  setData: (data: ModalData) => void;

  /** Mescla parcialmente o data (merge-shallow) */
  mergeData: (patch: Partial<ModalData>) => void;

  /** Limpa o data manualmente, quando for desejado */
  resetData: () => void;

  /** Altera só o tipo (opcional) */
  setType: (type: ModalType | null) => void;

  /** Altera o estado de abertura; se false, também zera o data */
  setOpen: (open: boolean) => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  data: getInitialData(),

  onOpen: (type, data = {}) =>
    set(() => ({
      // limpa ANTES de abrir para evitar “restos” de chaves
      data: { ...getInitialData(), ...data },
      isOpen: true,
      type,
    })),

  onClose: () =>
    set(() => ({
      isOpen: false,
      type: null,
      data: getInitialData(), // <- zera tudo ao fechar
    })),

  setData: (data) =>
    set(() => ({
      data: { ...getInitialData(), ...data }, // força substituição total
    })),

  mergeData: (patch) =>
    set((state) => ({
      ...state,
      data: { ...state.data, ...patch },
    })),

  resetData: () =>
    set(() => ({
      data: getInitialData(),
    })),

  setType: (type) =>
    set((state) => ({
      ...state,
      type,
    })),

  setOpen: (open) =>
    set((state) =>
      open
        ? { ...state, isOpen: true }
        : {
            // ao FECHAR por aqui, também zera o data
            isOpen: false,
            type: null,
            data: getInitialData(),
          }
    ),
}));
