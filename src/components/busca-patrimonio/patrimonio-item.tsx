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

import { Barcode, Locate, Maximize2, User } from "lucide-react";
import logo_eng from '../../assets/logo_eng.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowRight, Camera, Check, Funnel, Info, MagnifyingGlass, X, MapPin } from "phosphor-react";
import { Button } from "../ui/button";


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

 
  
        <div className="flex group">
          <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border  border-neutral-200 border-r-0 ${qualisColor[csvCodTrimmed as keyof typeof qualisColor]} min-h-full relative `}></div>
  
          <Alert className="flex flex-col flex-1 h-fit  rounded-l-none p-0 ">
            <div className="flex mb-1 gap-3 justify-between p-4 pb-0">
              <p className="font-semibold text-left mb-4 flex flex-1">
                {props.bem_cod}-{props.bem_dgv}
              </p>

              <div className="flex items-start justify-end min-w-20   gap-3">
              <Button
                 
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
                <div className="text-lg mb-2 font-bold">{props.mat_nom}</div>
                <p className="text-left uppercase">
                  {props.bem_dsc_com} {props.ite_mar !== "" && (`| ${props.ite_mar}`)}
                </p>
              </div>
  
            
            </div>
          </Alert>
        </div>
   
    );
  }
  