
import { create } from "zustand";

export type ModalType = 'add-background' | 'delete-account' | 'atualizar-senha' | 'import-csv' | 'import-csv-morto' |'itens-ociosos' | 'adicionar-empenho' | 'confirm-delete-fornecedor' | 'informacoes-empenhos' | 'search' | 'minha-area' | 'search-vitrine' | 'edit-item' | 'edit-admin-item' | 'search-patrimonio' | 'filters-patrimonio' | 'filters-patrimonio-adm' |'patrimonio' | 'add-patrimonio' | 'search-cod-atm' | 'search-loc-nom' | 'edit-patrimonio' | 'relatar-problema'

interface ModalData {
  id?: string,
  name?: string,

  workflow_status?: string,

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


  coluna?:string
  emp_nom?:string
  status_tomb?:string
  tipo_emp?:string
  pdf_empenho?:string
  data_fornecedor?:string
  prazo_entrega?:string
  status_recebimento?:string
  loc_entrega?:string
  loc_entrega_confirmado?:string
  cnpj?:string
  loc_nom?:string
  des_nom?:string
  status_tombamento?:string
  data_tombamento?:string
  data_aviso?:string
  prazo_teste?:string
  atestado?:string
  loc_tom?:string
  status_nf?:string
  observacoes?:string
  data_agendamento?:string
  n_termo_processo?:string
  origem?:string
  valor_termo?:string
  n_projeto?:string
  data_tomb_sei?:string
  pdf_nf?:string
  pdf_resumo?:string
  created_at?:string


    condicao?: string
    desfazimento?: boolean
    email?: string
    imagens?: string[]
    loc?: string
    material?: string
    matricula?: string
    num_patrimonio?:number
    num_verificacao?:number
    observacao?: string
    patrimonio_id?: string
    phone?: string
    situacao?: string
    u_matricula?: string
    user_id?: string
    verificado?: boolean,
    vitrine?:boolean
    mat_nom?:string
    bem_cod?:string
    bem_dgv?:string
    bem_dsc_com?:string
    bem_num_atm?:string
    bem_serie?:string
    bem_sta?:string
    bem_val?:string
    csv_cod?:string
    username?:string
    ele_cod?:string
    grp_cod?:string
    ite_mar?:string
    ite_mod?:string
    loc_cod?:string

    mat_cod?:string
    org_cod?:string
    org_nom?:string
    pes_cod?:string
    pes_nome?:string
    sbe_cod?:string
    set_cod?:string
    set_nom?:string
    tgr_cod?:string
    tre_cod?:string
    uge_cod?:string
    uge_nom?:string
    uge_siaf?:string
    qtd_de_favorito?:string
    estado_transferencia?:string

 
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