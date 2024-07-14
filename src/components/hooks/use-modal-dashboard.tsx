
import { create } from "zustand";

export type ModalType = "general" | "visao-geral-user" | 'atualizar-dados' | 'gerenciar-usuarios' | 'configuracoes' | 'lista-patrimonio' | 'visao-sala' | 'novo-item' | 'itens-vitrine' | 'empenhos' | 'create-bar-bode' | 'painel'


interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType) => void;
  onClose: () => void;
}

export const useModalDashboard = create<ModalStore>((set:any) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type: any) => set({ isOpen: true, type}),
  onClose: () => set({ type: null, isOpen: false })
}));