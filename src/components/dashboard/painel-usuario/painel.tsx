import { Check, ChevronLeft, File, Heart, LoaderIcon, Plus, Shapes, Store, Tag, Trash } from "lucide-react";
import { useModalDashboard } from "../../hooks/use-modal-dashboard";
import { Button } from "../../ui/button";
import { Link, useNavigate } from "react-router-dom";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "../../ui/carousel"

  import { Card, CardContent } from "../../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Alert } from "../../ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { AssinarDocumentos } from "../assinar-documento";
import { Skeleton } from "../../ui/skeleton";
import { useContext, useEffect, useState } from "react";
import { Item } from "../../item-page/item-page";
import { UserContext } from "../../../context/context";
import { BlockItem } from "../itens-vitrine/block-itens";

export function PainelGeral() {
    const { isOpen, type} = useModalDashboard();
 
    const history = useNavigate();

    const handleVoltar = () => {
      history(-1);
    }

    const {urlGeral, user} = useContext(UserContext)

    const [bens, setBens] = useState<Item[]>([]); 
    const [loading, isLoading] = useState(false)
   
    let urlBens = urlGeral +`formulario?user_id=${user?.user_id}&loc=&verificado=`

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

      const items = Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md aspect-square" />
      ));


      ///


      const [favoritos, setFavoritos] = useState<Item[]>([]); 

 //get

 const handleGetFavorites = async (tipo: string, userId: string) => {
  const urlGetFavorites = `${urlGeral}favorito?tipo=${tipo}&user_id=${userId}`;
console.log(urlGetFavorites)
  try {
    const response = await fetch(urlGetFavorites, {
      mode: 'cors',
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      setFavoritos(data);
    } else {
     
    }
  } catch (err) {
   
  }
};

useEffect(() => {
  handleGetFavorites('favorito', user?.user_id || '')
  }, [user?.user_id])

   
    return(
       
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                
                 
                 <Tabs defaultValue={'all'} className="h-full" >
 <div className="w-full  gap-4 mb-8">
            <div className="flex items-center gap-4">
          
            <Button onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Painel do usuário
              </h1>
             

                
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
           
               
          
              
              </div>
            </div>

            </div>

            <TabsContent value="all" className="h-auto flex flex-col gap-8">
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <Shapes size={16}/>
                <h3 className=" font-medium">Minhas salas</h3>
                </div>

                <div className="w-full">
                <Carousel className="w-full flex gap-3 items-center ">
                <CarouselPrevious />
      <CarouselContent className="-ml-1 flex w-full flex-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/4">
            <div className="p-1">
            <Alert className="border-none bg-transparent p-0 h-[140px] " >
            <div className="h-full">
            <div className=" rounded-xl ">
            <div className="flex justify-between w-full">
            <div className="flex gap-3 bg-white border w-full border-r-0  rounded-tl-xl  items-center p-4">
                            <Tag size={20}/>
                            <div>
                                <p className="font-medium">I</p>
                                <p className="text-xs">Infor</p>
                            </div>
                        </div>

                        <div className="flex">
                            <div>
                            <div className="h-full w-[44px] bg-white border border-l-0 border-r-0 rounded-tr-xl "></div>
                            </div>
                            <div className="flex flex-col h-full">
                            <div className="flex">
                                <div className="bg-white absolute top-0 w-[44px]  h-full  max-h-[80px]"></div>
                            <div className="bg-neutral-50 z-[9] h-fit dark:bg-neutral-900 p-2 flex gap-3 rounded-bl-xl ">
                        <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />

              </Button>

              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
              </Button>
                        </div>
                            </div>
                        <div className="h-full">
                            <div className="min-h-[44px] h-full max-h-[80px] w-full bg-white border boder-r-0 rounded-tr-xl "></div>
                            </div>
                            </div>
                        </div>

            </div>
            </div>
            </div>
              </Alert>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
     
      <CarouselNext />
      
    </Carousel>
                </div>
            </div>

          {favoritos.length > 0 && (
              <div>
              <div className="flex items-center gap-3 mb-3">
                  <Heart size={16}/>
              <h3 className=" font-medium">Itens salvos</h3>
              </div>

              <div className="w-full">
              {loading ? (
    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5">
        {items.map((item, index) => (
                        <div key={index}>{item}</div>
                      ))}
    </div>
  ):(
    <div>
      <BlockItem bens={favoritos} />
    </div>
  )}
              </div>
          </div>
          )}

            <div>
                <div className="flex items-center gap-3 mb-3">
                    <LoaderIcon size={16}/>
                <h3 className=" font-medium">Aguardando aprovação</h3>
                </div>

                <div className="w-full">
                {loading ? (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5">
          {items.map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
      </div>
    ):(
      <div>
        <BlockItem bens={bens.filter(item => item.verificado === false)} new_item={true}/>
      </div>
    )}
                </div>
            </div>

            <div>
                <div className="flex items-center gap-3 mb-3">
                    <Store size={16}/>
                <h3 className=" font-medium">Itens anunciados</h3>
                </div>

                <div className="w-full">
                {loading ? (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5">
          {items.map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
      </div>
    ):(
      <div>
        <BlockItem bens={bens.filter(item => item.verificado === true)} />
      </div>
    )}
                </div>
            </div>

            <div>
                <div className="flex items-center gap-3 mb-3">
                    <Trash size={16}/>
                <h3 className=" font-medium">Desfazimento</h3>
                </div>

                <div className="w-full">
                {loading ? (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5">
          {items.map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
      </div>
    ):(
      <div>
        <BlockItem bens={bens} />
      </div>
    )}
                </div>
            </div>

            
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <Check size={16}/>
                <h3 className=" font-medium">Transferidos</h3>
                </div>

                <div className="w-full">
                {loading ? (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5">
          {items.map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
      </div>
    ):(
      <div>
        <BlockItem bens={bens} />
      </div>
    )}
                </div>
            </div>


            </TabsContent>
            

           
            <TabsContent value="unread" className="flex flex-col gap-4 md:gap-8">
                <AssinarDocumentos/>
            </TabsContent>

            
            </Tabs>
             </main>
     
    )
}