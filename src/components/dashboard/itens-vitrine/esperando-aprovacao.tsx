import { CheckCheck, Package } from "lucide-react"
import { Alert } from "../../ui/alert"
import { CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Item } from "./itens-vitrine"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion"
import { HeaderResultTypeHome } from "../../header-result-type-home"
import { Skeleton } from "../../ui/skeleton"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { BlockItem } from "./block-itens"

interface Props {
    bens:Item[]
    loading:boolean
}

export function EsperandoAprovacao({bens, loading}:Props) {
    const items = Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md h-[300px]" />
      ));

    return(
        <main className="p-8 flex flex-col gap-4">
              <Alert className={`p-0  bg-cover bg-no-repeat bg-center `}  >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Esperando aprovação
                  </CardTitle>
                  <CheckCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bens.length}</div>
                  <p className="text-xs text-muted-foreground">
                  {bens.length > 1 ? ('encontrados'):('encontrado')} na busca
                  </p>
                </CardContent>
              </Alert>

              <Accordion defaultValue="item-1" type="single" collapsible className=" ">
                            <AccordionItem value="item-1" className="w-full ">
                              <div className="flex mb-2">
                                <HeaderResultTypeHome title="Patrimônios" icon={<Package size={24} className="text-gray-400" />}>
                                </HeaderResultTypeHome>
              
                                <AccordionTrigger>
              
                                </AccordionTrigger>
                              </div>
                              <AccordionContent className="p-0">
                              {loading ? (
                                <ResponsiveMasonry
                                                          columnsCountBreakPoints={{
                                                            350: 1,
                                                            750: 2,
                                                            900: 2,
                                                            1200: 3,
                                                            1700: 4
                                                          }}
                                                        >
                                                          <Masonry gutter="16px">
                                                            {items.map((item, index) => (
                                                              <div className="w-full" key={index}>{item}</div>
                                                            ))}
                                                          </Masonry>
                                                        </ResponsiveMasonry>
                  
                  ) : (
                    <BlockItem bens={bens}/>
                  )}
                              </AccordionContent>

                              </AccordionItem>
                            </Accordion>

        </main>
    )
}