import { ChevronLeft, File, Shapes, Store, Tag } from "lucide-react";
import { useModalDashboard } from "../hooks/use-modal-dashboard";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "../../components/ui/carousel"

  import { Card, CardContent } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert } from "../ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { AssinarDocumentos } from "./assinar-documento";

export function PainelGeral() {
    const { isOpen, type} = useModalDashboard();
 
    const history = useNavigate();

    const handleVoltar = () => {
      history(-1);
    }


    const isModalOpen = isOpen && type === "painel";
    return(
        <>
        {isModalOpen && (
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                
                 
                 <Tabs defaultValue={'all'} className="h-full" >
 <div className="w-full  gap-4">
            <div className="flex items-center gap-4">
          
            <Button onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Painel do usuário
              </h1>
             

                
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <TabsList >
              <TabsTrigger value="all" className="text-zinc-600 dark:text-zinc-200">Visão geral</TabsTrigger>
                <TabsTrigger value="unread" className="text-zinc-600 dark:text-zinc-200">Documentos</TabsTrigger>
                <TabsTrigger value="config" className="text-zinc-600 dark:text-zinc-200">Configurações</TabsTrigger>
               
                </TabsList>
               
          
                <Button size="sm">Gerar plaquetas para bens SQ</Button>
              </div>
            </div>

            </div>

            <TabsContent value="all" className="h-auto flex flex-col gap-4 md:gap-8">
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

            <div>
                <div className="flex items-center gap-3 mb-3">
                    <Store size={16}/>
                <h3 className=" font-medium">Itens no Vitrine Patrimônio</h3>
                </div>

                <div className="w-full">
                <Carousel className="w-full ">
      <CarouselContent className="-ml-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/4">
            <div className="p-1">
              <Card>
                <CardContent className="flex  items-center justify-center p-6">
                  <span className="text-2xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
                </div>
            </div>
            </TabsContent>
            

           
            <TabsContent value="unread" className="flex flex-col gap-4 md:gap-8">
                <AssinarDocumentos/>
            </TabsContent>

            
            </Tabs>
             </main>
        )}
        </>
    )
}