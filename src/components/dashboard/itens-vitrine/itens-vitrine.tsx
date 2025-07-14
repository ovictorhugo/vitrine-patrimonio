import { useContext, useEffect, useMemo, useState } from "react";
import { useModalDashboard } from "../../hooks/use-modal-dashboard";
import { UserContext } from "../../../context/context";
import { useModal } from "../../hooks/use-modal-store";
import { TooltipProvider } from "../../ui/tooltip";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Input } from "../../ui/input";
import { CheckCheck, ChevronDown, ChevronLeft, ChevronUp, Download, Search, Store, X } from "lucide-react";
import { ItensListVitrine } from "../components/itens-list-vitrine";
import { DisplayItemVitrine } from "../components/display-item-vitrine";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import { ItemPatrimonio } from "../../homepage/components/item-patrimonio";
import { BlockItem } from "./block-itens";
import { Skeleton } from "../../ui/skeleton";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { MagnifyingGlass } from "phosphor-react";
import { Alert } from "../../ui/alert";
import { EsperandoAprovacao } from "./esperando-aprovacao";
import { toast } from "sonner";
import { Anunciados } from "./anunciados";

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

export interface Item {
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
    bem_cod:string
    bem_dgv:string
    bem_dsc_com:string
    bem_num_atm:string
    bem_serie:string
    bem_sta:string
    bem_val:string
    csv_cod:string
    username:string
    ele_cod:string
    grp_cod:string
    ite_mar:string
    ite_mod:string
    loc_cod:string
    loc_nom:string
    mat_cod:string
    org_cod:string
    org_nom:string
    pes_cod:string
    pes_nome:string
    sbe_cod:string
    set_cod:string
    set_nom:string
    tgr_cod:string
    tre_cod:string
    uge_cod:string
    uge_nom:string
    uge_siaf:string
    qtd_de_favorito:string
    estado_transferencia:string
    created_at:string
}

export function ItensVitrine() {
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
          const [jsonData, setJsonData] = useState<any[]>([]);

          let urlBens = urlGeral +`formulario?user_id=&loc=&verificado=${value == '1' ? ('false') : ('true')}&desfazimento=false&estado_transferencia=NÃO+VERIFICADO`
console.log(urlBens)

  const fetchData = async () => {
                try {
                  isLoading(true)
                  const response = await fetch(urlBens, {
                    mode: "cors",
                    method:'GET',
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
                    setJsonData(data)
                    isLoading(false)
                  } 
                  
              } catch (err) {
                console.log(err);
              }
            }

          useEffect(() => {
          

              fetchData();
            }, [urlBens])


            
    const handlePutItem = async (patrimonio_id:any, verificado:boolean) => {

      try {
        const dataPut = [
          {
            patrimonio_id:patrimonio_id,

            verificado:verificado
          }
        ]
    
        console.log(dataPut)
    
        let urlProgram = urlGeral + '/formulario'
    
    
        const fetchDataVisible = async () => {
        
       
          try {
           
            const response = await fetch(urlProgram, {
              mode: 'cors',
              method: 'PUT',
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'PUT',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '3600',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(dataPut),
            });
    
            if (response.ok) {
             
           if (verificado == true) {
            toast("Item despublicado", {
              description: "Item apenas para administração",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            })

           } else {
            toast("Item publicado", {
              description: "Visível para todos os usuários",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            })

           }
             
            } else {
              console.error('Erro ao enviar dados para o servidor.');
              toast("Tente novamente!", {
                  description: "Tente novamente",
                  action: {
                    label: "Fechar",
                    onClick: () => console.log("Undo"),
                  },
                })
            }
            
          } catch (err) {
            console.log(err);
          } 
         }
    
        fetchDataVisible();
        fetchData()
    
    
      } catch (error) {
          toast("Erro ao processar requisição", {
              description: "Tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            })
      }
    }

            const items = Array.from({ length: 12 }, (_, index) => (
              <Skeleton key={index} className="w-full rounded-md aspect-square" />
            ));

            const [isOn, setIsOn] = useState(true);

            const tabs = [
              { id: "1", label: "Esperando aprovação", icon: CheckCheck },
              { id: "2", label: "Anunciados", icon: Store},
          
            
            ];

            const convertJsonToCsv = (json: any[]): string => {
              const items = json;
              const replacer = (_: string, value: any) => (value === null ? '' : value); // Handle null values
              const header = Object.keys(items[0]);
              const csv = [
                '\uFEFF' + header.join(';'), // Add BOM and CSV header
                ...items.map((item) =>
                  header.map((fieldName) => JSON.stringify(item[fieldName], replacer)).join(';')
                ) // CSV data
              ].join('\r\n');
          
              return csv;
            };
          
            const handleDownloadJson = async () => {
              try {
                const csvData = convertJsonToCsv(jsonData);
                const blob = new Blob([csvData], { type: 'text/csv;charset=windows-1252;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `dados.csv`;
                link.href = url;
                link.click();
              } catch (error) {
                console.error(error);
              }
            };
          
    return(
      <main  className="flex flex-1 flex-col  ">
         <div className="w-full  gap-4 p-4 md:p-8 md:pb-0">
            <div className="flex items-center gap-4">
         
           <Button  onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Itens do vitrine
              </h1>
             
              <div className="hidden items-center h-10 gap-2 md:ml-auto md:flex">
              
            
              </div>
            </div>

            </div>

            <Tabs defaultValue="1" value={value} className="">
            <div>
              <div className={`w-full ${isOn ? 'px-8' : 'px-8'} border-b border-b-neutral-200 dark:border-b-neutral-800`}>
                {isOn && (
                  <div className="w-full pt-4  flex justify-between items-center">
                   <Alert className="h-12 p-2 mb-4 flex items-center justify-between  w-full ">
                <div className="flex items-center gap-2 w-full flex-1">
                  <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
                  <Input onChange={(e) => setSearch(e.target.value)} value={search} type="text" className="border-0 w-full " />
                </div>

                <div className="w-fit">


                </div>
              </Alert>
                  </div>
                )}
                <div className={`flex pt-2 gap-8 justify-between  ${isOn ? '' : ''} `}>
                  <div className="flex items-center gap-2">
                  <div className="relative grid grid-cols-1">
  <ScrollArea className="relative overflow-x-auto">
    <TabsList className="p-0 flex gap-2 h-auto bg-transparent dark:bg-transparent">
      {tabs.map(
        ({ id, label, icon: Icon  }) =>
          
            <div
              key={id}
              className={`pb-2 border-b-2 text-black dark:text-white transition-all ${
                value === id ? "border-b-[#719CB8]" : "border-b-transparent"
              }`}
              onClick={() => setValue(id)}
            >
              <Button variant="ghost" className="m-0">
                <Icon size={16} />
                {label}
              </Button>
            </div>
          
      )}
    </TabsList>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>

 
</div>

       
                   
                  </div>
                  <div className="hidden xl:flex xl:flex-nowrap gap-2">
                <div className="md:flex md:flex-nowrap gap-2">
                  
                  <Button onClick={() => handleDownloadJson()} variant="ghost" className="">
                    <Download size={16} className="" />
                    Baixar resultado
                  </Button>

                  <Button variant="ghost" size="icon" onClick={() => setIsOn(!isOn)}>
                  {isOn ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                </div>

               
              </div>

             

                </div>
              </div>
            
            </div>


            <TabsContent value="1" className="p-0 m-0">
                    <EsperandoAprovacao bens={bens} loading={loading} handlePutItem={handlePutItem}/>
            </TabsContent>

            <TabsContent value="2" className="p-0 m-0">
                    <Anunciados bens={bens} loading={loading} handlePutItem={handlePutItem}/>
            </TabsContent>
            </Tabs>
            </main>

    )
}