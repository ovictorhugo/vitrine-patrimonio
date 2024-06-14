
import { create } from "zustand";

export type ModalType = "articles-home" | "institutions-home" | "researchers-home"


interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType) => void;
  onClose: () => void;
}

export const useModalResult = create<ModalStore>((set:any) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type: any) => set({ isOpen: true, type}),
  onClose: () => set({ type: null, isOpen: false })
}));