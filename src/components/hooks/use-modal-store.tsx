
import { create } from "zustand";

export type ModalType = 'add-background' | 'delete-account' | 'atualizar-senha' | 'import-csv'

interface ModalData {
  id?: string,
  name?: string,

  nome?: string;
  latitude?: number;
  longitude?: number;
  pesquisadores?: number;
  professores?: string[];


  doi?: string,
  qualis?: "A1" | "A2" | "A3" | "A4" | "B1" | "B2" | "B3" | "B4" | "B5" | "C" | "None" | "NP" | "SQ",
  title?: string,
  year?: string,
  jif?: string,
  jcr_link?: string
  lattes_10_id?: string,
  researcher_id?: string
  magazine?:string
 
}

interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType, data?:ModalData) => void;
  onClose: () => void;
  data: ModalData;
}

export const useModal = create<ModalStore>((set:any) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false, data:[] }),
  
}));