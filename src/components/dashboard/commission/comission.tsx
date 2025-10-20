import { useContext, useState } from "react";
import { Button } from "../../ui/button";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/context";
import { ChevronLeft } from "lucide-react";

import { Tabs, TabsContent } from "../../ui/tabs";
import { ListaFinalDesfazimento } from "./tabs/lista-final-desfazimento";
import { MeusItens } from "./tabs/meus-itens";
import AdmComission from "./tabs/adm-comission";
import { usePermissions } from "../../permissions";
export function Comission() {
      const { urlGeral } = useContext(UserContext);
      const navigate = useNavigate();
      const location = useLocation();

        const [tab, setTab] = useState("meus-itens");
 
 const { hasAdministracaoDaComissao
} = usePermissions();

    return(
         <div className=" gap-4 flex flex-col h-full">
              <Helmet>
                <title>Comissão permanente | Sistema Patrimônio</title>
             
              </Helmet>
        
              <main className="flex flex-col gap-4  flex-1 min-h-0 overflow-hidden">
                {/* Header */}
                 <div className="flex p-8 pb-0 items-center justify-between flex-wrap gap-3">
                          <div className="flex gap-2 items-center">
                            <Button
                              onClick={() => {
                                const path = location.pathname;
                                const hasQuery = location.search.length > 0;
                                if (hasQuery) navigate(path);
                                else {
                                  const seg = path.split("/").filter(Boolean);
                                  if (seg.length > 1) {
                                    seg.pop();
                                    navigate("/" + seg.join("/"));
                                  } else navigate("/");
                                }
                              }}
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <span className="sr-only">Voltar</span>
                            </Button>
                
                            <h1 className="text-xl font-semibold tracking-tight">Comissão permanente</h1>
                          </div>
                
                          <div className="hidden gap-2 items-center xl:flex">
                       
                            <div className="flex">
                              <Button
                                size="sm"
                                onClick={() => {
                              setTab('meus-itens')
                                }}
                                variant={tab == "meus-itens" ? "default" : "outline"}
                                className="rounded-r-none"
                              >
                               
                                Meus itens para avaliação
                              </Button>
{hasAdministracaoDaComissao && (
  
                                  <Button
                                size="sm"
                                onClick={() => {
                              setTab('adm')
                                }}
                                variant={tab == "adm" ? "default" : "outline"}
                                className="rounded-l-none rounded-r-none"
                              >
                               
                              Administração da comissão
                              </Button>
)}
                              <Button
                                onClick={() => {
                                  setTab('lfd')
                                }}
                                size="sm"
                                variant={tab === "lfd" ? "default" : "outline"}
                                className="rounded-l-none"
                              >
                               
                                Lista Final de desfazimento
                              </Button>
                            </div>
                
                           
                          </div>
                        </div>

                        <Tabs defaultValue={tab} value={tab} className="w-full">
                            <TabsContent value="meus-itens" className="m-0 p-0">
                             <MeusItens/>
                          </TabsContent>
                         {
                          hasAdministracaoDaComissao && <TabsContent value="lfd" className="m-0 p-0">
                             <ListaFinalDesfazimento/>
                          </TabsContent>
                         }

                              <TabsContent value='adm' className="m-0 p-0">
                              <AdmComission/>
                          </TabsContent>
                        </Tabs>


                       
                        </main>
                        </div>
    )
}