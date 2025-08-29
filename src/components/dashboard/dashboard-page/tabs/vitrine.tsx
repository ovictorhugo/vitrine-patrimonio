import { RefreshCcw, Store } from "lucide-react";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion";
import { BlockItemsVitrine } from "../../../homepage/components/block-items-vitrine";

export function Vitrine() {
    return(
      <div className="">
<Accordion  type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1" >
                <div className="flex ">
                <HeaderResultTypeHome   title="Itens aguardando aprovação"  icon={<RefreshCcw size={24} className="text-gray-400" />}>
                        </HeaderResultTypeHome>
                    <AccordionTrigger>
                    
                    </AccordionTrigger>
                    </div>
                    <AccordionContent className="p-0">
                   <BlockItemsVitrine workflow="REVIEW_REQUESTED_VITRINE"/>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>

                <Accordion  type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1" >
                <div className="flex ">
                <HeaderResultTypeHome title="Itens recusados / em modificação"  icon={<Store size={24} className="text-gray-400" />}>
                        </HeaderResultTypeHome>
                    <AccordionTrigger>
                    
                    </AccordionTrigger>
                    </div>
                    <AccordionContent className="p-0">
                   
                    </AccordionContent>
                </AccordionItem>
                </Accordion>

                <Accordion  type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1" >
                <div className="flex ">
                <HeaderResultTypeHome title="Itens anunciados na vitrine"  icon={<RefreshCcw size={24} className="text-gray-400" />}>
                        </HeaderResultTypeHome>
                    <AccordionTrigger>
                    
                    </AccordionTrigger>
                    </div>
                    <AccordionContent className="p-0">
                   
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
      </div>
    )
}