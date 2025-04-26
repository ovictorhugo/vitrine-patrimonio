import { Check, ChevronRight, CircleDollarSign, File, User, X } from "lucide-react";
import { useIsMobile } from "../../hooks/use-mobile";
import { csvCodToText, qualisColor } from "../busca-patrimonio/patrimonio-item";
import { useModal } from "../hooks/use-modal-store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent } from "../ui/dialog";
import { Drawer, DrawerContent } from "../ui/drawer";
import { Button } from "../ui/button";
import { Alert } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import QRCode from "react-qr-code";

export function PatrimonioModal() {
    const isMobile = useIsMobile()

    const { onClose, isOpen, type: typeModal, data } = useModal();
    const isModalOpen = (isOpen && typeModal === 'patrimonio')
    
    const csvCodTrimmed = data.csv_cod ? data.csv_cod.trim() : '';
  
    // Verificar se props.bem_sta está definido antes de usar .trim()
    const bemStaTrimmed = data.bem_sta ? data.bem_sta.trim() : '';
  
    const conectee = import.meta.env.VITE_BACKEND_URL || ''
    

    const content = () => {
        return(
          <div className={`flex group ${isMobile ? ('flex-col'):(' ')} `}>
          <div className={` ${isMobile ? ('h-3 min-h-3 rounded-t-md'):('w-3 min-w-3  rounded-l-md border-r-0')} dark:border-neutral-800 border  border-neutral-200  ${qualisColor[data.csv_cod || '' as keyof typeof qualisColor]} min-h-full relative `}></div>
        
          <Alert className={`  ${isMobile ? ('rounded-t-none rounded-b-none'):(' rounded-l-none')}  flex flex-col flex-1 h-fit   p-0 `}>
            <div className="flex mb-1 gap-3 justify-between p-4 pb-0">
              <p className="font-semibold flex gap-3 items-center text-left mb-4  flex-1">
                {data.bem_cod?.trim()} - {data.bem_dgv}

             {(data.bem_num_atm != '' && data.bem_num_atm != 'None') && (
                 <Badge variant={'outline'}>ATM: {data.bem_num_atm}</Badge>
             )}
              </p>

              <div className="flex items-start justify-end min-w-20   gap-3">
             {!isMobile && (
               <Button
               className="h-8 w-8"
               variant={"outline"}
               onClick={() => onClose()}
               size={"icon"}
             >
               <X size={16} />
             </Button>
             )}

              </div>
             
             
            </div>
            <div className="flex flex-col p-4 pt-0 justify-between">
             
             <div className="flex items-center gap-8 justify-between">
             <div className="flex flex-col flex-1">
                <div className="text-2xl mb-2 font-bold">{data.mat_nom || 'Sem nome'}</div>
                <p className="text-left mb-4 uppercase">
                  {data.bem_dsc_com} 
                </p>

                <div className="flex  flex-wrap gap-3">
                {(data.csv_cod != 'None' && data.csv_cod != '' && data.csv_cod != null) && (
                  <div className=" text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                  <div className={`w-4 h-4 rounded-md ${qualisColor[csvCodTrimmed as keyof typeof qualisColor]}`}></div>
                  {csvCodToText[csvCodTrimmed as keyof typeof csvCodToText]}
                </div>
                )}

                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                  {bemStaTrimmed === "NO" ? (<Check size={12} />) : (<X size={12} />)}
                  {bemStaTrimmed === "NO" ? 'Normal' : 'Não encontrado no local de guarda'}
                </div>

                {(data.pes_nome != '' && data.pes_nome  != 'None' && data.pes_nome  != null) && (
                  <div className="flex gap-1 items-center cursor-pointer">
                  <Avatar className="cursor-pointer rounded-md  h-5 w-5">
                                <AvatarImage className={'rounded-md h-5 w-5'} src={`${conectee}ResearcherData/Image?name=${data.pes_nome}`} />
                                <AvatarFallback className="flex items-center justify-center"><User size={10} /></AvatarFallback>
                              </Avatar>
                    <p className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">{data.pes_nome}</p>
                  </div>
                )}

<div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
<CircleDollarSign size={12} />
             Valor estimado R$ {Number(data.bem_val).toFixed(2)}
              </div>

              {(data.tre_cod != 'None' && data.tre_cod != '' && data.tre_cod != null) && (
                  <div className=" text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                 <File size={12} />
                Termo de resp.: {data.tre_cod}
                </div>
                )}
                </div>
              </div>
              
{!isMobile && (
  
  <QRCode
  className={` w-fit   h-28`}
     value={`https://vitrinepatrimonio.eng.ufmg.br/buscar-patrimonio?terms=${data.bem_cod?.trim()}-${data.bem_dgv}&type_search=cod`}
   
   />
)}
              
             </div>

              <div>
                <Separator className="my-8"/>

                <div className="flex items-center  flex-wrap gap-3">
                <p className="text-sm uppercase font-bold">Localização:</p>
                
                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              
                {data.org_cod} - {data.org_nom}
                </div>
               {data.set_nom != null && (
                <>
                 <ChevronRight size={16} />
                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              
                {data.set_cod} - {data.set_nom}
                </div></>
               )}
                {data.loc_nom != null && (
                <>
                 <ChevronRight size={16} />
                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              
                {data.loc_cod} - {data.loc_nom}
                </div></>
               )}
                </div>

            
              </div>

              <div>
              <Separator className="my-8"/>

                            
{isMobile && (
  
  <QRCode
  className={` w-full`}
     value={`https://vitrinepatrimonio.eng.ufmg.br/buscar-patrimonio?terms=${data.bem_cod?.trim()}-${data.bem_dgv}&type_search=cod`}
   
   />
)}
              </div>
  
            
            </div>
          </Alert>
        </div>
        )
    }
    if (isMobile) {
        return (
          <Drawer open={isModalOpen} onOpenChange={onClose}>
            <DrawerContent className="p-0 m-0  border-0">{content()}</DrawerContent>
          </Drawer>
        );
      } else {
        return (
          <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="p-0 min-w-[50vw] bg-transparent border-0">{content()}</DialogContent>
          </Dialog>
        );
      }
}