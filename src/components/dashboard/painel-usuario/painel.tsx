import { Check, ChevronLeft, File, Heart, LoaderIcon, Mail, Phone, Plus, Rows, Shapes, Store, Tag, Trash } from "lucide-react";
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
  const history = useNavigate();
const {urlGeral, user} = useContext(UserContext)
  const handleVoltar = () => {
    history(-1);
  };


    return(
       
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 relative">
            <div className="flex relative">
            <div className="bg-eng-blue w-full p-8 absolute rounded-lg h-[400px]">
          
            </div>
            </div>
            

           <div className="z-[1] flex flex-col gap-8">
           <div className="w-full px-8  gap-4">
            <div className="flex items-center gap-4">
         
           <Button  onClick={handleVoltar} variant='ghost' size="icon" className="h-7 w-7 text-white hover:text-eng-blue dark:hover:text-eng-blue">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 text-white whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Painel do usuário
              </h1>

            
          
             
              <div className="hidden items-center h-10 gap-2 md:ml-auto md:flex">
              <Button>df</Button>
              </div>
            </div>

            </div>
           <div className="grid  pb-8 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className="  flex flex-col md:gap-8 gap-4"  >

            </div>
           
            <div className="xl:col-span-2  flex flex-col md:gap-8 gap-4"  >
            <div>
                 

                 <h1 className="text-3xl text-white mb-2  font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                 Olá, {user?.display_name}
                 </h1>

                 <p className="max-w-[750px] text-lg font-light text-foreground">
               <div className="flex flex-wrap gap-4 ">
 <div className="text-sm text-white font-normal flex gap-1 items-center"><Mail size={12}/>{user?.email}</div>
 {typeof user?.ramal === "string" && user.ramal.length > 0 && ( <div className="text-sm text-white font-normal flex gap-1 items-center"><Mail size={12}/>{user?.ramal}</div>)}
 {typeof user?.telephone === "string" && user.telephone.length > 0 && ( <div className="text-sm text-white font-normal flex gap-1 items-center"><Phone size={12}/>{user?.telephone}</div>)}
 {typeof user?.matricula === "string" && user.matricula.length > 0 && ( <div className="text-sm text-white font-normal flex gap-1 items-center"><Mail size={12}/>{user?.matricula}</div>)}


 </div> 
                 </p>
               </div>
            </div>

        

            </div>
           </div>
            
             </main>
     
    )
}