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

import { Barcode, Locate, User } from "lucide-react";
import logo_eng from '../../assets/logo_eng.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowRight, Camera, Check, Funnel, Info, MagnifyingGlass, X, MapPin } from "phosphor-react";


export function PatrimonioItem(props: Patrimonio) {
    const qualisColor = {
      'BM': 'bg-green-500',
      'AE': 'bg-red-500',
      'IR': 'bg-yellow-500',
      'OC': 'bg-blue-500',
      'BX': 'bg-gray-500',
      'RE': 'bg-purple-500'
    };
  
    const csvCodToText = {
      'BM': 'Bom',
      'AE': 'Anti-Econômico',
      'IR': 'Irrecuperável',
      'OC': 'Ocioso',
      'BX': 'Baixado',
      'RE': 'Recuperável'
    };
  
    // Verificar se props está definido
    if (!props) {
      return null; // Ou qualquer comportamento desejado se props for indefinido
    }
  
    // Verificar se props.csv_cod está definido antes de usar .trim()
    const csvCodTrimmed = props.csv_cod ? props.csv_cod.trim() : '';
  
    // Verificar se props.bem_sta está definido antes de usar .trim()
    const bemStaTrimmed = props.bem_sta ? props.bem_sta.trim() : '';
  
  
    return (
      <div className="flex w-full gap-3 flex-1 flex-col">
        <div className=" p-4 rounded-md bg-gray-200 dark:bg-zinc-800 border border-neutral-200 dark:border-neutral-800  flex gap-3 items-center">
          <img src={logo_eng} alt="" className="h-20" />
          {/* Outros elementos aqui */}
          <img src={`https://barcode.tec-it.com/barcode.ashx?data=${props.bem_cod.trim()}-${props.bem_dgv.trim()}&code=Code39&textposition=none`} alt="" className="h-20 mix-blend-multiply" />
        </div>
  
        <div className="flex flex-1">
          <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border min-h-[250px]  border-neutral-200 border-r-0 ${qualisColor[csvCodTrimmed as keyof typeof qualisColor]} min-h-full relative `}></div>
  
          <Alert className="flex flex-col flex-1 gap-4 rounded-l-none p-0 ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {props.bem_cod}-{props.bem_dgv}
              </CardTitle>
              <Barcode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-full">
              <div>
                <div className="text-2xl font-bold">{props.mat_nom}</div>
                <p className="text-xs text-muted-foreground">
                  {props.bem_dsc_com} {props.ite_mar !== "" && (`| ${props.ite_mar}`)}
                </p>
              </div>
  
              <div className="flex mt-8 flex-wrap gap-4">
                <div className="flex gap-2 items-center text-xs font-medium"><User size={12} />{props.pes_nome}</div>
                <div className="flex gap-2 items-center text-xs font-medium uppercase">
                  <div className={`w-4 h-4 rounded-md ${qualisColor[csvCodTrimmed as keyof typeof qualisColor]}`}></div>
                  {csvCodToText[csvCodTrimmed as keyof typeof csvCodToText]}
                </div>
               
                <div className="flex gap-2 items-center text-xs font-medium"><MapPin size={12} />{props.loc_nom}</div>
              </div>
            </CardContent>
          </Alert>
        </div>
      </div>
    );
  }
  