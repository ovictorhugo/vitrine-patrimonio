import { Download, Trash } from "lucide-react";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { BlockItemsVitrine } from "../../../homepage/components/block-items-vitrine";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion";
import { Button } from "../../../ui/button";

export function ListaFinalDesfazimento() {
    return (
       <div className="flex flex-col gap-8 p-8 pt-4">

     <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
         
        <div className="flex items-center justify-between">
              <HeaderResultTypeHome
              title={'Lista Final de Defazimento (LFD)'}
              icon={<Trash size={24} className="text-gray-400" />}
            />
             <div className="flex items-center gap-2">
              <Button><Download size={16} />Baixar lista</Button>
              <AccordionTrigger className="px-0">
          </AccordionTrigger>
             </div>
        </div>

          <AccordionContent className="p-0">
         <div className="">
           <BlockItemsVitrine workflow="DESFAZIMENTO"/>
         </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

        
       </div>
    )
}