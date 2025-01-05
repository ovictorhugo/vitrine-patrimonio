import { useContext, useEffect, useState } from "react";
import { useModalDashboard } from "../hooks/use-modal-dashboard";
import { UserContext } from "../../context/context";
import { useModal } from "../hooks/use-modal-store";
import { TooltipProvider } from "../ui/tooltip";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { ItensListVitrine } from "./components/itens-list-vitrine";
import { DisplayItemVitrine } from "./components/display-item-vitrine";

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

export function ItensVitrine() {
    const { isOpen, type} = useModalDashboard();
    const {user, urlGeral, defaultLayout} = useContext(UserContext)
    const {onOpen} = useModal;


    const isModalOpen = isOpen && type === "itens-vitrine";


    const [total, setTotal] = useState<Patrimonio | null>(null);

    // Função para lidar com a atualização de researcherData
    const handleResearcherUpdate = (newResearcherData: Patrimonio) => {
        setTotal(newResearcherData);
      };

      console.log(total)
  
      const [search, setSearch] = useState('')
    return(
        <>
        {isModalOpen && (
            <TooltipProvider delayDuration={0}>
                <ResizablePanelGroup
            direction="horizontal"
            onLayout={() => defaultLayout}
            className="h-full  items-stretch"
            >
                 <ResizablePanel defaultSize={40} minSize={40}>
                 <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-lg font-bold">Itens do Vitrine</h1>
              <TabsList className="ml-auto">
                <TabsTrigger value="all" className="text-zinc-600 dark:text-zinc-200">Aprovação</TabsTrigger>
                <TabsTrigger value="unread" className="text-zinc-600 dark:text-zinc-200">Publicados</TabsTrigger>
              </TabsList>
            </div>
           <div className="w-full border-b border-neutral-200 dark:border-neutral-800 "></div>

            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
              <div className="relative bg-white flex gap-3 items-center border px-4 border-neutral-200 dark:border-neutral-800 rounded-md dark:bg-neutral-950">
                <Search size={16} />
                <Input placeholder="Filtrar pelo número do patrimônio..." className="border-none" value={search}  onChange={(e) => setSearch(e.target.value)}/>
              </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
             <ItensListVitrine
             onResearcherUpdate={handleResearcherUpdate}
             url={`${urlGeral}allPatrimonio?loc_nom=1506B ASSESSORIA DE RECURSOS HUMANOS`}
             search={search}
             />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
            <ItensListVitrine
             onResearcherUpdate={handleResearcherUpdate}
             url={`${urlGeral}allPatrimonio?loc_nom=1506B ASSESSORIA DE RECURSOS HUMANOS`}
             search={search}
             />
            </TabsContent>
          </Tabs>
                 </ResizablePanel>
                 <ResizableHandle withHandle />

                 <ResizablePanel defaultSize={defaultLayout[2]} minSize={50}>
       
                 {total ? (
        <DisplayItemVitrine
          bem_cod={total.bem_cod}
          bem_dgv={total.bem_dgv}
          bem_num_atm={total.bem_num_atm}
          csv_cod={total.csv_cod}
          bem_serie={total.bem_serie}
          bem_sta={total.bem_sta}
          bem_val={total.bem_val}
          tre_cod={total.tre_cod}
          bem_dsc_com={total.bem_dsc_com}
          uge_cod={total.uge_cod}
          uge_nom={total.uge_nom}
          org_cod={total.org_cod}
          uge_siaf={total.uge_siaf}
          org_nom={total.org_nom}
          set_cod={total.set_cod}
          set_nom={total.set_nom}
          loc_cod={total.loc_cod}
          loc_nom={total.loc_nom}
          ite_mar={total.ite_mar}
          ite_mod={total.ite_mod}
          tgr_cod={total.tgr_cod}
          grp_cod={total.grp_cod}
          ele_cod={total.ele_cod}
          sbe_cod={total.sbe_cod}
          mat_cod={total.mat_cod}
          mat_nom={total.mat_nom}
          pes_cod={total.pes_cod}
          pes_nome={total.pes_nome}
        />
      ):( 
        <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-9xl  text-eng-blue  font-bold mb-16 animate-pulse">^_~</p>
         <p className="font-medium text-lg">Nenhum patrimônio selecionado</p>
       </div>
      )}
        
        </ResizablePanel>

</ResizablePanelGroup>
            </TooltipProvider>
        )}
        </>
    )
}