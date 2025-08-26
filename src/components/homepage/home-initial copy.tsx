import { useContext, useEffect, useRef, useState } from "react";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { motion } from "motion/react";
import { UserContext } from "../../context/context";
import fump_bg from '../../assets/fump_bg.png';
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Armchair, ArrowRight, Camera, ChalkboardSimple, ComputerTower, Desktop, DotsThree, Folder, Ladder, Laptop, MagnifyingGlass, Phone, Printer, ProjectorScreen, Scales, Television, Timer, Wrench } from "phosphor-react";
interface TotalPatrimonios {
  total_patrimonio:string
  total_patrimonio_morto:string
}

import { Link } from "react-router-dom";

import { Fan, Heart, Info, Package, RefreshCcw, Trash, User, WalletCards } from "lucide-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { ItemPatrimonio } from "./components/item-patrimonio";
import { Search } from "../search/search";
import { Item } from "../item-page/item-page";
import { BlockItem } from "../dashboard/itens-vitrine/block-itens";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { AuroraBackground } from "../ui/aurora-background";
import { toast } from "sonner";

export function HomeInicial() {
    const { isOpen, type, onOpen } = useModalHomepage();

    const [input, setInput] = useState("");
    const isModalOpen = isOpen && type === "initial-home";
    const {loggedIn} = useContext(UserContext)


   
  //stick search
  const [isSticky, setIsSticky] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function handleScrollSearch() {
    const element = ref.current!;
    const { top } = element.getBoundingClientRect();
    if (top <= 70) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  }


 ///////////////////////
 const {user, urlGeral, defaultLayout, bens, setBens, setItensSelecionados} = useContext(UserContext)
         
          const [loading, isLoading] = useState(false)
         
          let urlBens = urlGeral +`formulario?user_id=&loc=&verificado=true&desfazimento=false&estado_transferencia=NÃO+VERIFICADO`
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
                     
                   if (verificado) {
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

            const uniqueMatNom = [...new Set(bens.map((item) => item.mat_nom))];

            //////////////////


            
                const [total, setTotal] = useState<TotalPatrimonios[]>([]);
            
                const urlPatrimonioInsert = `${urlGeral}totalPatrimonio?loc_nom=`;
            
                useEffect(() => {
                  const fetchData = async () => {
                    try {
                      const response = await fetch(urlPatrimonioInsert , {
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
                          setTotal(data)
                      }
                    } catch (err) {
                      console.log(err);
                    }
                  };
                  fetchData()
              
                 
                }, [urlPatrimonioInsert]);

    return(


<div className="items-center w-full flex flex-col ">


<div ref={ref} className="bg-cover bg-no-repeat bg-center w-full">
<div className="justify-center px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20" >      
   
     
         <Link to={'/informacoes'}  className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"><Info size={12}/><div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>Saiba como utilizar a plataforma<ArrowRight size={12}/></Link>

        <h1 className="z-[2] text-center max-w-[850px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
          Procure, anuncie e facilite a reutilização de{' '}
          <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
            {' '}
            bens patrimoniais
          </strong>{' '}
        </h1>
        <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>

        <div className="lg:max-w-[60vw] lg:w-[60vw] w-full ">
          
          <Search/>
         </div>

              <div className="flex flex-wrap gap-3 z-[2] w-full lg:w-[60vw]">
                              {uniqueMatNom.slice(0, 10).map((word, index) => (
                                  <div
                                      key={index}
                                      className={`flex gap-2 capitalize h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs`}
                                  onClick={() => {
                                    setItensSelecionados([{ term: word }]);
                                  }}
                                  >
                                      {word}
                                  </div>
                              ))}
                          </div>
   

  
  </div>
</div>


<div className="px-8 w-full grid gap-8">
<Alert className="grid gap-3 lg:grid-cols-4 grid-cols-2 ">
         <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                Total de patrimônios
                </CardTitle>
              </div>

              <Package className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>
              <span className="text-lg font-bold leading-none sm:text-3xl">
              {total.length != 0? total.map((props) => props.total_patrimonio) : 0}
              </span>
            </CardContent>
            </div>
            <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                Total de patrimônios baixados
                </CardTitle>
              </div>

              <Trash className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>
              <span className="text-lg font-bold leading-none sm:text-3xl">
              {total.length != 0? total.map((props) => props.total_patrimonio_morto) : 0}
              </span>
            </CardContent>
            </div>
        
            <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                Total de itens anunciados
                </CardTitle>
              </div>

              <WalletCards className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>
              <span className="text-lg font-bold leading-none sm:text-3xl">
              {total.length != 0? total.map((props) => props.total_patrimonio):0}
              </span>
            </CardContent>
          </div>

         <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                Total de transferência
                </CardTitle>

              </div>

              <RefreshCcw className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>
              <span className="text-lg font-bold leading-none sm:text-3xl">
              {total.length != 0?total.map((props) => props.total_patrimonio):0}
              </span>
            </CardContent>
            </div>
          

        </Alert>

        <BlockItem bens={bens} handlePutItem={handlePutItem}/>
</div>


</div>

    )
}