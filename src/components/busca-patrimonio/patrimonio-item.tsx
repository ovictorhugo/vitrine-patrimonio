import { Alert } from "../ui/alert";

interface Patrimonio {
    bem_cod:string
    bem_dgv:string
    bem_num_atm:string
    csv_cod:string
    bem_serie:string
    bem_sta:string
    bem_val:string
    tre_cod:string
    bem_dsc_com:string
    uge_cod:string
    uge_nom:string
    org_cod:string
    uge_siaf:string
    org_nom:string
    set_cod:string
    set_nom:string
    loc_cod:string
    loc_nom:string
    ite_mar:string
    ite_mod:string
    tgr_cod:string
    grp_cod:string
    ele_cod:string
    sbe_cod:string
    mat_cod:string
    mat_nom:string
    pes_cod:string
    pes_nome:string
}

import { Archive, Barcode, HelpCircle, Hourglass, Locate, Maximize2, MoveRight, User } from "lucide-react";
import logo_eng from '../../assets/logo_eng.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowRight, Camera, Check, Funnel, Info, MagnifyingGlass, X, MapPin } from "phosphor-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useModal } from "../hooks/use-modal-store";
import { Badge } from "../ui/badge";

export const qualisColor = {
  'BM': 'bg-green-500',
  'AE': 'bg-red-500',
  'IR': 'bg-yellow-500',
  'OC': 'bg-blue-500',
  'RE': 'bg-purple-500'
};

export const csvCodToText = {
  'BM': 'Bom',
  'AE': 'Anti-Econômico',
  'IR': 'Irrecuperável',
  'OC': 'Ocioso',
  'RE': 'Recuperável'
};

export function PatrimonioItem(props: Patrimonio) {
 
  
    // Verificar se props está definido
    if (!props) {
      return null; // Ou qualquer comportamento desejado se props for indefinido
    }
  
    // Verificar se props.csv_cod está definido antes de usar .trim()
    const csvCodTrimmed = props.csv_cod ? props.csv_cod.trim() : '';
  
    // Verificar se props.bem_sta está definido antes de usar .trim()
    const bemStaTrimmed = props.bem_sta ? props.bem_sta.trim() : '';
  
    const conectee = import.meta.env.VITE_BACKEND_CONECTEE || ''
    
const {onOpen} = useModal()

const statusMap = {
  NO: { text: "Normal", icon: <Check size={12} className="" /> },
  NI: { text: "Não inventariado", icon: <HelpCircle size={12} className="" /> },
  CA: { text: "Cadastrado", icon: <Archive size={12} className="" /> },
  TS: { text: "Aguardando aceite", icon: <Hourglass size={12} className="" /> },
  MV: { text: "Movimentado", icon: <MoveRight size={12} className="" /> },
  BX:{ text: "Baixado", icon: <X size={12} className="" /> },
};

const status = statusMap[bemStaTrimmed];

    return (
        <div className="flex group">
          <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border  border-neutral-200 border-r-0 ${qualisColor[csvCodTrimmed as keyof typeof qualisColor]} min-h-full relative `}></div>
  
          <Alert className="flex flex-col flex-1 h-fit  rounded-l-none p-0 ">
            <div className="flex mb-1 gap-3 justify-between p-4 pb-0">
            <p className="font-semibold flex gap-3 items-center text-left mb-4  flex-1">
                {props.bem_cod?.trim()} - {props.bem_dgv}

             {(props.bem_num_atm != '' && props.bem_num_atm != 'None') && (
                 <Badge variant={'outline'}>ATM: {props.bem_num_atm}</Badge>
             )}
              </p>

              <div className="flex items-start justify-end min-w-20   gap-3">
              <Button
                 onClick={() => onOpen('patrimonio', {...props})}
                 variant="outline"
                 size={'icon'}
                 className=" hidden group-hover:flex text-sm h-8 w-8 text-gray-500 dark:text-gray-300"
               >
                 <Maximize2 size={16} />
               </Button>
              </div>
             
             
            </div>
            <div className="flex flex-col p-4 pt-0 justify-between">
              <div>
                <div className="text-lg mb-2 font-bold">{props.mat_nom || 'Sem nome'}</div>
                <p className="text-left mb-4 uppercase">
                  {props.bem_dsc_com} 
                </p>

                <div className="flex  flex-wrap gap-3">
                {(props.csv_cod != 'None' && props.csv_cod != '' && props.csv_cod != null) && (
                  <div className=" text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                  <div className={`w-4 h-4 rounded-md ${qualisColor[csvCodTrimmed as keyof typeof qualisColor]}`}></div>
                  {csvCodToText[csvCodTrimmed as keyof typeof csvCodToText]}
                </div>
                )}

                
                {status && (
                  <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
      {status.icon}
      {status.text}
      </div>
  ) }
                

                {(props.pes_nome != '' && props.pes_nome  != 'None' && props.pes_nome  != null) && (
                  <div className="flex gap-1 items-center ">
                  <Avatar className=" rounded-md  h-5 w-5">
                                <AvatarImage className={'rounded-md h-5 w-5'} src={`${conectee}ResearcherData/Image?name=${props.pes_nome}`} />
                                <AvatarFallback className="flex items-center justify-center"><User size={10} /></AvatarFallback>
                              </Avatar>
                    <p className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">{props.pes_nome}</p>
                  </div>
                )}
                </div>
              </div>
  
            
            </div>
          </Alert>
        </div>
   
    );
  }
  