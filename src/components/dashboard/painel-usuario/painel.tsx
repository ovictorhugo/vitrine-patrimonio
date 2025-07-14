import { ArrowRightLeft, Check, CheckCheck, ChevronLeft, File, Heart, Home, LoaderIcon, Mail, Phone, Plus, Rows, Search, Shapes, Store, Tag, Trash } from "lucide-react";
import { useModalDashboard } from "../../hooks/use-modal-dashboard";
import { Button } from "../../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
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
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Favoritos } from "./favoritos";

export function PainelGeral() {
  const history = useNavigate();
const {urlGeral, user} = useContext(UserContext)
  const handleVoltar = () => {
    history(-1);
  };


  const tabs = [
    { id: "visao_geral", label: "Visão geral", icon: Home },
    { id: "gestao_patrimonio", label: "Gestão de Patrimônio", icon: Search },
    { id: "vitrine", label: "Vitrine", icon: Store },
    { id: "desfazimento", label: "Desfazimento", icon: Trash },
  
 
  ];

  const tabs2 = [
    { id: "aguardando_aprovacao", label: "Aguardando aprovação", icon: CheckCheck },
    { id: "itens_anunciados", label: "Itens anunciados", icon: Store },
    { id: "transferidos", label: "Transferidos", icon: ArrowRightLeft },
  
 
  ];

  const tabs3 = [
    { id: "minhas_salas", label: "Minhas salas", icon: CheckCheck },
    { id: "meus_bens", label: "Meus bens patrimoniados", icon: Store },
    { id: "transferidos", label: "Assinaturas", icon: ArrowRightLeft },
  
 
  ];
  const [value, setValue] = useState(tabs[0].id)
  const [value2, setValue2] = useState(tabs2[0].id)


    return(
       
             <main className="flex flex-1 flex-col  p-4  md:p-8 relative">
            <Helmet>
        <title>Dashboard | Módulo administrativo | Vitrine Ptrimônio</title>
        <meta name="description" content={`Dashboard | Vitrine Ptrimônio`} />
        <meta name="robots" content="index, follow" />
      </Helmet>
            <div className="flex relative">
            <div className="bg-eng-blue flex-col flex items-center justify-center w-full   rounded-lg h-[400px]">
            <div className="w-full gap-4 p-8 pb-0">
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
          <div className="flex flex-1 w-full items-center">
          <div className="grid w-full  pb-8 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className="  flex flex-col md:gap-8 gap-4"  >

            </div>
           
            <div className="xl:col-span-2  flex flex-col md:gap-8 gap-4"  >
            <div>
                 

                 <h1 className="text-3xl text-white mb-2  font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                 Olá, {user?.username}
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
            </div>
            </div>
            

           <div className="z-[1] flex flex-col gap-8">
           
           <div className="grid  pb-8 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className=" -top-[100px] relative flex flex-col md:gap-8 gap-4"  >
                <Button>e</Button>
            </div>
           
            <div className="xl:col-span-2 -top-[50px] relative  flex flex-col md:gap-8 gap-4"  >
            <Tabs defaultValue={tabs[0].id} value={value} className="">
<div className="w-full flex justify-between bap-8">
<ScrollArea className="relative overflow-x-auto">
    <TabsList className="p-0 justify-start flex gap-2 h-auto bg-transparent dark:bg-transparent">
      {tabs.map(
        ({ id, label, icon: Icon }) =>
         
            <div
              key={id}
              className={`pb-2 border-b-2 text-black dark:text-white transition-all ${
                value === id ? "border-b-white" : "border-b-transparent"
              }`}
              onClick={() => setValue(id)}
            >
              <Button variant="ghost" className={`m-0 text-white hover:text-eng-blue ${ value === id ? "bg-white text-eng-blue" : ""}`}>
                <Icon size={16} />
                {label}
              </Button>
            </div>
          
      )}
    </TabsList>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>

<div>

</div>
</div>

<TabsContent value="visao_geral">
  <div className="grid gap-8 mt-8 w-full">
     <Favoritos/>
  </div>
</TabsContent>

<TabsContent value="gestao_patrimonio">
  <div className="grid gap-8 mt-8 w-full">
    <MinhasSalas/>

    <MeusBens/>
  </div>
</TabsContent>

<TabsContent value="vitrine">
  <div className="grid gap-8 w-full">
  <h3 className="text-2xl font-medium ">Vitrine patrimônio</h3>
      <Tabs defaultValue={tabs2[0].id} value={value2} className="">
      <TabsList className="p-0 flex justify-start gap-2 h-auto bg-transparent dark:bg-transparent">
      {tabs2.map(
        ({ id, label, icon: Icon }) =>
         
            <div
              key={id}
              className={`pb-2 border-b-2 text-black dark:text-white transition-all ${
                value2 === id ? "border-b-[#719CB8]" : "border-b-transparent"
              }`}
              onClick={() => setValue2(id)}
            >
              <Button variant="ghost" className="m-0">
                <Icon size={16} />
                {label}
              </Button>
            </div>
          
      )}
    </TabsList>
    </Tabs>
  </div>
</TabsContent>
            </Tabs>



            </div>

        

            </div>
           </div>
            
             </main>
     
    )
}