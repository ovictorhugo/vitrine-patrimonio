
import { create } from "zustand";

export type ModalType = "1" | "2" | "3"


interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType) => void;
  onClose: () => void;
}

export const useModalBackground = create<ModalStore>((set:any) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type: any) => set({ isOpen: true, type}),
  onClose: () => set({ type: null, isOpen: false })
}));