import { ArrowUUpLeft, FileCsv, FileXls, Upload } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCallback, useContext, useState } from "react";
import { toast } from "sonner"
import { UserContext } from "../../context/context";
import * as XLSX from 'xlsx';
import {useDropzone} from 'react-dropzone'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

import {
  Sheet,
  SheetContent,

} from "../../components/ui/sheet"
import { LoaderCircle, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { DataTableModal } from "../componentsModal/data-table";
import { columnsPatrimonio } from "../componentsModal/columns-patrimonio";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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

export function AddPatrimonioModal() {
    const { onClose, isOpen, type: typeModal, data } = useModal();
    
    const isModalOpen = (isOpen && typeModal === 'add-patrimonio') || (isOpen && typeModal === 'edit-patrimonio')

    const {urlGeral} = useContext(UserContext)
   
   const [dataPatrimonio, setDataPatrimonio] = useState<Patrimonio>({
    bem_cod: data?.bem_cod || '',
    bem_dgv: data?.bem_dgv || '',
    bem_num_atm: data?.bem_num_atm || '',
    csv_cod: data?.csv_cod || '',
    bem_serie: data?.bem_serie || '',
    bem_sta: data?.bem_sta || '',
    bem_val: data?.bem_val || '',
    tre_cod: data?.tre_cod || '',
    bem_dsc_com: data?.bem_dsc_com || '',
    uge_cod: data?.uge_cod || '',
    uge_nom: data?.uge_nom || '',
    org_cod: data?.org_cod || '',
    uge_siaf: data?.uge_siaf || '',
    org_nom: data?.org_nom || '',
    set_cod: data?.set_cod || '',
    set_nom: data?.set_nom || '',
    loc_cod: data?.loc_cod || '',
    loc_nom: data?.loc_nom || '',
    ite_mar: data?.ite_mar || '',
    ite_mod: data?.ite_mod || '',
    tgr_cod: data?.tgr_cod || '',
    grp_cod: data?.grp_cod || '',
    ele_cod: data?.ele_cod || '',
    sbe_cod: data?.sbe_cod || '',
    mat_cod: data?.mat_cod || '',
    mat_nom: data?.mat_nom || '',
    pes_cod: data?.pes_cod || '',
    pes_nome: data?.pes_nome || '',
  });

  const handleChangePatrimonio = (field: keyof any, value: any) => {
    setDataPatrimonio((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

    return(
      <Sheet open={isModalOpen} onOpenChange={onClose}>
      <SheetContent className={`p-0 dark:bg-neutral-900 dark:border-gray-600 min-w-[50vw]`}>
      <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-b-neutral-600">

<div className="flex items-center gap-3">
<TooltipProvider>
<Tooltip>
<TooltipTrigger asChild>
<Button className="h-8 w-8" variant={'outline'}  onClick={() => onClose()} size={'icon'}><X size={16}/></Button>
</TooltipTrigger>
<TooltipContent> Fechar</TooltipContent>
</Tooltip>
</TooltipProvider>

<div className="flex ml-auto items-center w-full justify-between">

 <div className="flex ml-auto items-center gap-3">


    </div>
</div>

</div>

</DialogHeader>

<ScrollArea className="relative pb-4 whitespace-nowrap h-[calc(100vh-50px)] p-8 ">
        <div className="mb-8">
                      <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                      Patrimômio
                        </p>

                        <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                          {typeModal == 'add-patrimonio' ? ('Adicionar patrimônio temporário'):('Editar patrimônio temporário')}
                        </h1>
                        
                      </div>

               <div className="flex flex-1 flex-col ">
               <div className="flex flex-col gap-4">
                <div className={`flex gap-4 w-full flex-col lg:flex-row `}>
  {/* Código */}
  <div className="grid gap-3 w-full">
                      <Label htmlFor="name">Código</Label>
                     <div className="flex items-center gap-3">
                     <Input
                    id="bem_cod"
                    type="text"
                    className="w-full"
                    value={dataPatrimonio.bem_cod}
               
                    onChange={(e) => handleChangePatrimonio('bem_cod', e.target.value)}
                  />
                     </div>
                    </div>


                    {/* Dígito Verificador */}
      <div className="grid gap-3 w-full">
        <Label htmlFor="bem_dgv">Díg. Verificador</Label>
        <div className="flex items-center gap-3">
          <Input
            id="bem_dgv"
            type="text"
            className="w-full"
            value={dataPatrimonio.bem_dgv}
         
            onChange={(e) => handleChangePatrimonio('bem_dgv', e.target.value)}
          />
        </div>
      </div>

      {/* Código CSV */}
     <div className="grid gap-3 w-full">
        <Label htmlFor="mat_nom">Material</Label>
        <div className="flex items-center gap-3">
          <Input
            id="mat_nom"
            type="text"
            className="w-full"
            value={dataPatrimonio.mat_nom}
  
            onChange={(e) => handleChangePatrimonio('mat_nom', e.target.value)}
          />
        </div>
      </div>
                  
                </div>

                <div className={`flex gap-4 w-full flex-col lg:flex-row `}>
{/* Código CSV */}
<div className="grid gap-3 w-full">
  <Label htmlFor="csv_cod">Estado de conservação</Label>
  <div className="flex items-center gap-3">
    <Select
      value={dataPatrimonio.csv_cod || ""}
      onValueChange={(value) => handleChangePatrimonio('csv_cod', value)}
     
    >
      <SelectTrigger id="csv_cod" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="BM">Bom</SelectItem>
        <SelectItem value="AE">Anti-Econômico</SelectItem>
        <SelectItem value="IR">Irrecuperável</SelectItem>
        <SelectItem value="OC">Ocioso</SelectItem>
        <SelectItem value="RE">Recuperável</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>

{/* Código CSV */}
<div className="grid gap-3 w-full">
  <Label htmlFor="csv_cod">Estado de conservação</Label>
  <div className="flex items-center gap-3">
    <Select
      value={dataPatrimonio.csv_cod || ""}
      onValueChange={(value) => handleChangePatrimonio('csv_cod', value)}
   
    >
      <SelectTrigger id="csv_cod" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="BM">Bom</SelectItem>
        <SelectItem value="AE">Anti-Econômico</SelectItem>
        <SelectItem value="IR">Irrecuperável</SelectItem>
        <SelectItem value="OC">Ocioso</SelectItem>
        <SelectItem value="RE">Recuperável</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>


  {/* Valor */}
  <div className="grid gap-3 w-full">
        <Label htmlFor="bem_val">Valor</Label>
        <div className="flex items-center gap-3">
          <Input
            id="bem_val"
            type="text"
            className="w-full"
            value={dataPatrimonio.bem_val}
         
            onChange={(e) => handleChangePatrimonio('bem_val', e.target.value)}
          />
        </div>
      </div>
                </div>

                  {/* Descrição Completa */}
      <div className="grid gap-3 w-full">
        <Label htmlFor="bem_dsc_com">Descrição </Label>
        <div className="flex items-center gap-3">
          <Input
            id="bem_dsc_com"
         type="text"
            className="w-full"
            value={dataPatrimonio.bem_dsc_com}
         
            onChange={(e) => handleChangePatrimonio('bem_dsc_com', e.target.value)}
          />
        </div>
      </div>
               </div>
               </div>

</ScrollArea>
              
    

               </SheetContent>
               </Sheet>
    )
}