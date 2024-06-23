import { Archive, BadgeAlert, Barcode, Check, MapPin, User, X } from "lucide-react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { CardContent, CardHeader, CardTitle } from "../../ui/card";

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

export function DisplayItemVitrine(props:Patrimonio) {
    const qualisColor = {
        'BM': 'bg-green-500',
        'AE': 'bg-red-500',
        'IR': 'bg-yellow-500',
        'OC': 'bg-blue-500',
        'BX': 'bg-gray-500',
        'RE': 'bg-purple-500',
        'QB': 'bg-red-500',
        'NE': 'bg-yellow-500',
        'SP': 'bg-orange-500',
      };
    
      const csvCodToText = {
        'BM': 'Bom',
        'AE': 'Anti-Econômico',
        'IR': 'Irrecuperável',
        'OC': 'Ocioso',
        'BX': 'Baixado',
        'RE': 'Recuperável'
      };


    return(
        <div className="flex h-full flex-col">
      <div className="flex items-center p-2 px-4 justify-between">
        <div className="flex items-center gap-2">

        <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" >
                <Archive className="h-4 w-4" />
                <span className="sr-only">Arquivar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
        <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" >
                <BadgeAlert className="h-4 w-4" />
                <span className="sr-only">Arquivar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notificar</TooltipContent>
          </Tooltip>

        <Tooltip>
            <TooltipTrigger asChild>
              <Button  size="icon" >
                <Check className="h-4 w-4" />
                <span className="sr-only">Arquivar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Publicar</TooltipContent>
          </Tooltip>
        </div>
        </div>
        <div className="w-full border-b border-neutral-200 dark:border-neutral-800 "></div>

        <div >
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
                  <div className={`w-4 h-4 rounded-md ${qualisColor[props.csv_cod.trim() as keyof typeof qualisColor]}`}></div>
                  {csvCodToText[props.csv_cod.trim() as keyof typeof csvCodToText]}
                </div>
                <div className="flex gap-2 items-center text-xs font-medium uppercase">
                  {props.bem_sta.trim() === "NO" ? (<Check size={12} />) : (<X size={12} />)}
                  {props.bem_sta.trim() === "NO" ? 'Normal' : 'Não encontrado no local de guarda'}
                </div>
                <div className="flex gap-2 items-center text-xs font-medium"><MapPin size={12} />{props.loc_nom}</div>
              </div>
            </CardContent>
        </div>
        </div>
    )
}