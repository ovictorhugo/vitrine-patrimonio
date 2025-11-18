import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/context";
import { BarChart, BriefcaseBusiness, ChevronLeft, ChevronRight, ListTodo, Trash, Users } from "lucide-react";

import { Tabs, TabsContent } from "../../ui/tabs";
import { ListaFinalDesfazimento } from "./tabs/lista-final-desfazimento";
import { MeusItens } from "./tabs/meus-itens";
import AdmComission from "./tabs/adm-comission";
import { usePermissions } from "../../permissions";
import { useQuery } from "../../authentication/signIn";
import { Estatistica } from "./tabs/estatistica";
export function Comission() {
      const { urlGeral, permission } = useContext(UserContext);
      const navigate = useNavigate();
      const location = useLocation();


 
 const { hasAdministracaoDaComissao
} = usePermissions();


              
  const tabs = [
    { id: "meus-items", label: "Meus itens para avaliação", icon: ListTodo },
        { id: "adm-comission", label: "Pareceristas", icon: Users, condition: !hasAdministracaoDaComissao },
         { id: "estatistica", label: "Estatísticas", icon: BarChart, condition: !hasAdministracaoDaComissao },
         { id: "lfd", label: "Lista Final de desfazimento", icon: Trash },
  ];

  

  const [isOn, setIsOn] = useState(true);
  const queryUrl = useQuery();
  const tab = queryUrl.get("tab");
  const [value, setValue] = useState(tab || tabs[0].id);

  useEffect(() => {
    setValue(tabs[0].id);
  }, [permission]);
  
  // ===== Scroll dos tabs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollAreaRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeftBtn = () => scrollAreaRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRightBtn = () => scrollAreaRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


    return(
         <div className=" gap-4 flex flex-col h-full">
              <Helmet>
                <title>Comissão permanente | Sistema Patrimônio</title>
             
              </Helmet>
        
              <main className="flex flex-col gap-8  flex-1 ">
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
                
                        
                        </div>

                         <Tabs defaultValue={tabs[0].id} value={value} className="relative ">
                              <div className="sticky top-[68px]  z-[2] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur ">
            <div className={`w-full ${isOn ? "px-8" : "px-4"} border-b border-b-neutral-200 dark:border-b-neutral-800`}>
              {isOn && <div className="w-full  flex justify-between items-center"></div>}
              <div className={`flex pt-2 gap-8 justify-between  ${isOn ? "" : ""} `}>
                <div className="flex items-center gap-2">
                  <div className="relative grid grid-cols-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`absolute left-0 z-2 h-8 w-8 p-0 top-1 ${!canScrollLeft ? "opacity-30 cursor-not-allowed" : ""}`}
                      onClick={scrollLeftBtn}
                      disabled={!canScrollLeft}
                    >
                      <ChevronLeft size={16} />
                    </Button>

                    <div className=" mx-10 ">
                      <div ref={scrollAreaRef} className="overflow-x-auto scrollbar-hide scrollbar-hide" onScroll={checkScrollability}>
                        <div className="p-0 flex gap-2 h-auto bg-transparent dark:bg-transparent">
                          {tabs.map(({ id, label, icon: Icon, condition }) => !condition && (
                            <div
                              key={id}
                              className={`pb-2 border-b-2 text-black dark:text-white transition-all ${
                                value === id ? "border-b-[#719CB8]" : "border-b-transparent"
                              }`}
                              onClick={() => {
                                setValue(id);
                             
                                navigate({
                                  pathname: location.pathname,
                                  search: queryUrl.toString(),
                                });
                              }}
                            >
                              <Button variant="ghost" className="m-0">
                                <Icon size={16} />
                                {label}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className={`absolute right-0 z-2 h-8 w-8 p-0 rounded-md  top-1 ${
                        !canScrollRight ? "opacity-30 cursor-not-allowed" : ""
                      }`}
                      onClick={scrollRightBtn}
                      disabled={!canScrollRight}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>

                <div className="hidden xl:flex xl:flex-nowrap gap-2">
                  <div className="md:flex md:flex-nowrap gap-2">
                     
                  </div>
                </div>
              </div>
            </div>
          </div>
                            
                            <TabsContent value="meus-items" className="m-0 p-0">
                             <MeusItens/>
                          </TabsContent>
                         {
                          hasAdministracaoDaComissao &&    <TabsContent value='adm-comission' className="m-0 p-0">
                              <AdmComission/>
                          </TabsContent>
                         }

                         <TabsContent value="lfd" className="m-0 p-0">
                             <ListaFinalDesfazimento/>
                          </TabsContent>

                           <TabsContent value="estatistica" className="m-0 p-0">
                             <Estatistica/>
                          </TabsContent>

                           
                        </Tabs>


                       
                        </main>
                        </div>
    )
}