import { create } from "zustand";

export type ModalType = "initial-home" | "authentication-home" | "payment-home" | 'doacao' | 'escolher-assinatura' | 'atualizar-cadastro' | 'pagamento'| 'verificar-situacao-fumpista' | 'criar-conta-fumpista' | 'login-fumpista' | 'nao-encontrado' | 'cartao' | 'pix' | 'boleto'| 'criar-conta-donation' |'login-donation' | 'busca-patrimonio' | 'dashboard' | 'join-sala' | 'item-page' | 'informacoes' | 'emprestimo-audiovisual'


interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType) => void;
  onClose: () => void;
}

export const useModalHomepage = create<ModalStore>((set:any) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type: any) => set({ isOpen: true, type}),
  onClose: () => set({ type: null, isOpen: false })
}));