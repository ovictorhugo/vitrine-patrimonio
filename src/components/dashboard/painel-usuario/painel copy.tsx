import { Check, ChevronLeft, File, Heart, LoaderIcon, Mail, Plus, Rows, Shapes, Store, Tag, Trash } from "lucide-react";
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

  import { Card, CardContent, CardHeader } from "../../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Alert } from "../../ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

import { Skeleton } from "../../ui/skeleton";
import { useContext, useEffect, useState } from "react";
import { Item } from "../../item-page/item-page";
import { UserContext } from "../../../context/context";
import { BlockItem } from "../itens-vitrine/block-itens";
import { SalaItem } from "./sala-item";
import { MeusBens } from "./meus-bens";
import { MinhasSalas } from "./minhas-salas";
import { Accordion, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { SquaresFour } from "phosphor-react";
import { HeaderResultTypeHome } from "../../header-result-type-home";

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

  const [value, setValue] = useState('1')

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
            
            <main className="h-full w-full flex flex-col ">
        <div className="flex justify-between items-center py-12">
               <div className="flex items-center  gap-6">
               <Avatar className="cursor-pointer rounded-lg  h-24 w-24">
  <AvatarImage  className={'rounded-md h-24 w-24'} src={user?.photo_url} />
  <AvatarFallback className="flex items-center justify-center"></AvatarFallback>
</Avatar>

               <div>
                 

                    <h1 className="text-3xl max-w-[800px] mb-2  font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                    {user?.display_name}
                    </h1>

                    <p className="max-w-[750px] text-lg font-light text-foreground">
                  <div className="flex flex-wrap gap-4 ">
    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Mail size={12}/>{user?.email}</div>
 

    </div> 
                    </p>
                  </div>
               </div>

                 <div>

                 </div>
                </div>

             
                </main>

                {favoritos.length > 0 && (
              <Alert className="p-8">
               <HeaderResultTypeHome title="Favoritos" icon={<Heart size={24} className="text-gray-400" />}>
               
               </HeaderResultTypeHome>

              <div className="mt-6 w-full">
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
          </Alert>
          )}

                <div>
                <HeaderResultTypeHome title="Minhas salas" icon={<Shapes size={24} className="text-gray-400" />}>
               
              </HeaderResultTypeHome>
                <div className="w-full">
                <MinhasSalas/>
                </div>
            </div>

            
            
            <div>
           
            </div>
                <div>
               

                <div className="w-full">
                <MeusBens/>
                </div>
            </div>


        

<Tabs defaultValue={value} value={value} className="">
  <TabsList>
    <TabsTrigger value="1" onClick={() => setValue('1')}> <LoaderIcon size={16}/> Aguardando aprovação</TabsTrigger>
    <TabsTrigger value="2" onClick={() => setValue('2')}><Store size={16}/>Itens anunciados</TabsTrigger>
    <TabsTrigger value="3" onClick={() => setValue('3')}> <Trash size={16}/>Desfazimento</TabsTrigger>
    <TabsTrigger value="4" onClick={() => setValue('4')}><Check size={16}/>Transferidos</TabsTrigger>
  </TabsList>
  <TabsContent value="1">
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
  </TabsContent>
  <TabsContent value="2">
  <div className="w-full">
                {loading ? (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5">
          {items.map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
      </div>
    ):(
      <div>
        {bens.filter(item => item.verificado === true).length > 0 ? (
  <BlockItem bens={bens.filter(item => item.verificado === true)} />
        ):(
          <p className="text-center w-full text-sm py-8">Nenhum item encontrado</p>
        )}
       
      </div>
    )}
                </div>
  </TabsContent>

  <TabsContent value="3">
  <div className="w-full">
                {loading ? (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5">
          {items.map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
      </div>
    ):(
      <div>
        {bens.filter(item => item.verificado === true).length > 0 ? (
  <BlockItem bens={bens.filter(item => item.verificado === true)} />
        ):(
          <p className="text-center w-full text-sm py-8">Nenhum item encontrado</p>
        )}
        
      </div>
    )}
                </div>
  </TabsContent>

  <TabsContent value="4">
  <div className="w-full">
                {loading ? (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5">
          {items.map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
      </div>
    ):(
      <div>
        {bens.filter(item => item.verificado === true).length > 0 ? (
  <BlockItem bens={bens.filter(item => item.verificado === true)} />
        ):(
          <p className="text-center w-full text-sm py-8">Nenhum item encontrado</p>
        )}
        
      </div>
    )}
                </div>
  </TabsContent>
</Tabs>


      
            

           

            
          


            </TabsContent>
            

           
            <TabsContent value="unread" className="flex flex-col gap-4 md:gap-8">
              
            </TabsContent>

            
            </Tabs>
             </main>
     
    )
}