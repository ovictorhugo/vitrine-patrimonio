import { Trash } from "lucide-react";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { BlockItemsVitrine } from "../../../homepage/components/block-items-vitrine";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion";

export function ListaFinalDesfazimento() {
    return (
       <div className="flex flex-col gap-8 p-8 pt-0">

     <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-0">
            <HeaderResultTypeHome
              title={'Lista Final de Defazimento (LFD)'}
              icon={<Trash size={24} className="" />}
            />
          </AccordionTrigger>

          <AccordionContent className="p-0">
          <BlockItemsVitrine workflow="DESFAZIMENTO"/>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

        
       </div>
    )
}