import { ChevronLeft } from "lucide-react";
import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BlockItem } from "../itens-vitrine/block-itens";
import { Item } from "../itens-vitrine/itens-vitrine";
import { UserContext } from "../../../context/context";
import { Skeleton } from "../../ui/skeleton";

export function Transferencia() {
  const {user, urlGeral, defaultLayout} = useContext(UserContext)

      const [tab, setTab] = useState('all')

      const history = useNavigate();

    const handleVoltar = () => {
      history(-1);
    }


     const [bens, setBens] = useState<Item[]>([]); 
              const [loading, isLoading] = useState(false)
              const [value, setValue] = useState('1')
             
              let urlBens = urlGeral +`formulario?user_id=&loc=&verificado=true&desfazimento=false&estado_transferencia=${value == '1' ? ('EM ANDAMENTO') : value == '2' ? ('CONCLUÍDO') : ('RECUSADO')}`
    console.log(urlBens)
              useEffect(() => {
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
 <Tabs defaultValue={value} className="h-full" value={value} >
 <div className="mb-8  gap-4">
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
              <TabsTrigger value="1" onClick={() =>setValue('1')} className="text-zinc-600 dark:text-zinc-200">Em andamento</TabsTrigger>
              <TabsTrigger value="2" onClick={() =>setValue('2')}className="text-zinc-600 dark:text-zinc-200">Concluído</TabsTrigger>
              <TabsTrigger value="3" onClick={() =>setValue('3')}className="text-zinc-600 dark:text-zinc-200">Recusado</TabsTrigger>
                </TabsList>
               
          
　　 　 　 　
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