import { useContext, useEffect, useMemo, useState } from "react";
import { useModalDashboard } from "../../hooks/use-modal-dashboard";
import { UserContext } from "../../../context/context";
import { useModal } from "../../hooks/use-modal-store";
import { TooltipProvider } from "../../ui/tooltip";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Input } from "../../ui/input";
import { ChevronLeft, Search } from "lucide-react";
import { ItensListVitrine } from "../components/itens-list-vitrine";
import { DisplayItemVitrine } from "../components/display-item-vitrine";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import { ItemPatrimonio } from "../../homepage/components/item-patrimonio";

import { Skeleton } from "../../ui/skeleton";
import { BlockItem } from "../itens-vitrine/block-itens";

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

interface Item {
  codigo_atm: string
  condicao: string
  desfazimento: boolean
  email: string
  imagens: string[]
  loc: string
  material: string
  matricula: string
  num_patrimonio:number
  num_verificacao:number
  observacao: string
  patrimonio_id: string
  phone: string
  situacao: string
  u_matricula: string
  user_id: string
  verificado: boolean,
  vitrine:boolean
  mat_nom:string
  qtd_de_favorito:string
}

export function ItensDesfazimento() {
    const { isOpen, type} = useModalDashboard();
    const {user, urlGeral, defaultLayout} = useContext(UserContext)
 const [value, setValue] = useState('1')


    const [total, setTotal] = useState<Patrimonio | null>(null);

    // Função para lidar com a atualização de researcherData
    const handleResearcherUpdate = (newResearcherData: Patrimonio) => {
        setTotal(newResearcherData);
      };

      console.log(total)
  
      const [search, setSearch] = useState('')

        const history = useNavigate();
      
          const handleVoltar = () => {
            history(-3);
          };

          ///////////////////////
          const [bens, setBens] = useState<Item[]>([]); 
          const [loading, isLoading] = useState(false)
         
          let urlBens = urlGeral +`formulario?user_id=&loc=&verificado=${value == '1' ? ('false') : ('true')}&desfazimento=true`
console.log(urlBens)
          useEffect(() => {
            const fetchData = async () => {
                try {
                  isLoading(true)
                  const response = await fetch(urlBens, {
                    mode: "cors",
                    headers: {
                      "Access-Control-Allow-Origin": "*",
                      "Access-Control-Allow-Methods": "GET",
                      "Access-Control-Allow-Headers": "Content-Type",
                      "Access-Control-Max-Age": "3600",
                      "Content-Type": "text/plain",
                    },
                  });
                  
                  const data = await response.json();
                  if (data) {
                    setBens(data);
                    isLoading(false)
                  } 
                  
              } catch (err) {
                console.log(err);
              }
            }

              fetchData();
            }, [urlBens])

            const items = Array.from({ length: 12 }, (_, index) => (
              <Skeleton key={index} className="w-full rounded-md aspect-square" />
            ));
          
    return(
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        
        <Tabs defaultValue={value} className="">
         <div className="mb-8  gap-4">
            <div className="flex items-center gap-4">
         
           <Button  onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Itens do desfazimento
              </h1>
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <TabsList>
    <TabsTrigger value="1" onClick={() => setValue('1')}>Esperando aprovação</TabsTrigger>
    <TabsTrigger value="2" onClick={() => setValue('2')}>Anunciados</TabsTrigger>
  </TabsList>

              <Button variant={'outline'}  size="sm">
                  Filtros
                </Button>
                <Button  size="sm">
                 Adicionar comissão
                </Button>
              
              </div>
            </div>

            </div>

  
  <TabsContent value="1">
    {loading ? (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5">
          {items.map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
      </div>
    ):(
      <BlockItem bens={bens}/>
    )}
    </TabsContent>
  <TabsContent value="2">
  {loading ? (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5">
          {items.map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
      </div>
    ):(
      <BlockItem bens={bens}/>
    )}
    
    </TabsContent>
</Tabs>

       </main>
    )
}