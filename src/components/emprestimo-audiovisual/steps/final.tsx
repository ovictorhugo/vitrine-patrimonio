import { useEffect, useState } from "react";
import { Label } from "../../ui/label";
import { FlowMode, StepBaseProps } from "../novo-item";
import { Toggle } from "../../ui/toggle";
import { Badge } from "../../ui/badge";
import { ArrowRight, Bell, FileDown } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";
import { BackgroundLines } from "../../ui/background-lines";


export function FinalStep({
    onValidityChange,
    onStateChange,
step
  }: StepBaseProps<'final'>) {
    
    useEffect(() => {
        onValidityChange(true);
      }, []);
    
    
      
    return(
        <div className="max-w-[936px]  h-full mx-auto flex flex-col justify-center">

<div className="z-[1]">
<div className="flex gap-2">
   <div className="flex justify-between items-center h-fit mt-2 w-8">
   <p className="text-lg">{step}</p>
   <ArrowRight size={16}/>
   </div>
    <h1 className="mb-16 text-4xl font-semibold max-w-[700px]">
    Estamos chegando ao final, ufa! Ao continuar você enviará o item para avaliação.
                </h1>
</div>

<div className="ml-8">
<div className="flex gap-4 flex-col">
<div className="flex gap-2">
  <Bell size={24} className=""/>
  <div>
    <p className="font-medium">Notificações</p>
    <p className="text-gray-500 text-sm">
      Você será notificado na plataforma sobre o andamento e o resultado da avaliação.
    </p>
  </div>
</div>

<div className="flex gap-2">
  <FileDown size={24} className=""/>
  <div>
    <p className="font-medium">Documentos</p>
    <p className="text-gray-500 text-sm">
      Os documentos gerados ficarão disponíveis para download após a conclusão do processo.
    </p>
  </div>
</div>

  </div>
</div>
</div>

 

        </div>
    )
}