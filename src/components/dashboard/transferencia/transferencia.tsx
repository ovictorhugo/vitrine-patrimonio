import { ChevronLeft } from "lucide-react";
import { Button } from "../../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Transferencia() {
      const [tab, setTab] = useState('all')

      const history = useNavigate();

    const handleVoltar = () => {
      history(-1);
    }

 

    return(
        <main className="grid grid-cols-1 gap-4 md:gap-8 ">
 <Tabs defaultValue={'all'} className="h-full" >
            <div className="w-full  gap-4 md:p-8 p-4 pb-0 md:pb-0">
            <div className="flex items-center gap-4">
          
            <Button onClick={handleVoltar } variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Painel do usuário
              </h1>
            

                
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <TabsList >
                
              <TabsTrigger value="all" onClick={() =>setTab('all')} className="text-zinc-600 dark:text-zinc-200">Visão geral</TabsTrigger>
              <TabsTrigger value="doc" onClick={() =>setTab('doc')}className="text-zinc-600 dark:text-zinc-200">Docentes</TabsTrigger>
             
           

　　 　 　 　
                </TabsList>
               
          
　　 　 　 　
              </div>
            </div>

            </div>
            </Tabs>
        </main>
    )
}