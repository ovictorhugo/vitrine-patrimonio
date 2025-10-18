import { create } from "zustand";

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
  | "search-patrimonio"       // <- usado pelo SearchPatrimonioModal
  | "filters-patrimonio"
  | "filters-patrimonio-adm"
  | "patrimonio"
  | "add-patrimonio"
  | "search-cod-atm"
  | "search-loc-nom"
  | "edit-patrimonio"
  | "relatar-problema"
  | "workflow"
  | 'filters-assets'
  | 'catalog-modal'
  |'sign-in'

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
  legal_guardian_id: string;
  sector_id: string;
  location_name: string;
  location_code: string;
  id: string;
  sector: SectorDTO;
  legal_guardian: LegalGuardianDTO;
};
type MaterialDTO = {
  material_code: string;
  material_name: string;
  id: string;
};

/** Payload que trafega dentro do modal */
export interface ModalData {
  id?: string;
  name?: string;

  workflow_status?: string;

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
}

/** Store do modal */
interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  data: ModalData;

  /** Abre (ou reabre) um modal definindo o tipo e substituindo o data */
  onOpen: (type: ModalType, data?: ModalData) => void;

  /** Fecha o modal sem apagar o data (para permitir leitura após fechar) */
  onClose: () => void;

  /** Substitui todo o data */
  setData: (data: ModalData) => void;

  /** Mescla parcialmente o data (merge-shallow) */
  mergeData: (patch: Partial<ModalData>) => void;

  /** Limpa o data manualmente, quando for desejado */
  resetData: () => void;

  /** Altera só o tipo (opcional) */
  setType: (type: ModalType | null) => void;

  /** Altera só o estado de abertura (opcional) */
  setOpen: (open: boolean) => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  data: {},

  onOpen: (type, data = {}) =>
    set({
      isOpen: true,
      type,
      data, // substitui o data inteiro ao abrir
    }),

  onClose: () =>
    set((state) => ({
      ...state,
      isOpen: false,
      type: null,
      // ⚠️ não zeramos `data` aqui; ele fica disponível pós-fechamento
    })),

  setData: (data) => set((state) => ({ ...state, data })),

  mergeData: (patch) =>
    set((state) => ({
      ...state,
      data: { ...state.data, ...patch },
    })),

  resetData: () => set((state) => ({ ...state, data: {} })),

  setType: (type) => set((state) => ({ ...state, type })),

  setOpen: (open) => set((state) => ({ ...state, isOpen: open })),
}));
