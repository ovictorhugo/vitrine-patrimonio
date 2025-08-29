import { ChevronLeft, ChevronRight, DoorClosed, Home, Store, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "../novo-item/search-bar";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Tabs, TabsContent } from "../../ui/tabs";
import { ScrollArea } from "../../ui/scroll-area";
import { Salas } from "./tabs/salas";
import { Vitrine } from "./tabs/vitrine";
export function VisaoGeralUser() {

  const tabs = [
             
    { id: "visao_geral", label: "Visão Geral", icon: Home },
    { id: "salas", label: "Minhas Salas", icon: DoorClosed },
    { id: "itens_vitrine", label: "Itens Vitrine", icon: Store,  },
    { id: "itens_desfazimento", label: "Itens Desfazimento", icon: Trash,  },
   
  ];

  const [isOn, setIsOn] = useState(true);
  const queryUrl = useQuery();

  const tab = queryUrl.get('tab');
  const [value, setValue] = useState(tab || tabs[0].id)

    // Componente principal
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    
    // Adicione estas funções:
    const checkScrollability = () => {
      if (scrollAreaRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };
    
    const scrollLeft = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      }
    };
    
    const scrollRight = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      }
    };
    
    // Adicione este useEffect:
    useEffect(() => {
      checkScrollability();
      const handleResize = () => checkScrollability();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navigate = useNavigate();
    const location = useLocation()
    const handleVoltar = () => {
              
      const currentPath = location.pathname;
      const hasQueryParams = location.search.length > 0;
      
      if (hasQueryParams) {
        // Se tem query parameters, remove apenas eles
        navigate(currentPath);
      } else {
        // Se não tem query parameters, remove o último segmento do path
        const pathSegments = currentPath.split('/').filter(segment => segment !== '');
        
        if (pathSegments.length > 1) {
          pathSegments.pop();
          const previousPath = '/' + pathSegments.join('/');
          navigate(previousPath);
        } else {
          // Se estiver na raiz ou com apenas um segmento, vai para raiz
          navigate('/');
        }
      }
    };

    return(
      <main className=" w-full grid grid-cols-1 ">
        <Helmet>
               <title>Dashboard | Vitrine Patrimônio</title>
               <meta name="description" content={`Dashboard | Vitrine Patrimônio`} />
               <meta name="robots" content="index, follow" />
             </Helmet>
       
             <div className="w-full  gap-4 p-4 md:p-8 ">
                    <div className="flex items-center gap-4">
                  
                    <Button onClick={handleVoltar } variant="outline" size="icon" className="h-7 w-7">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                      </Button>
                  
                      <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                      Dashboard
                      </h1>
                     
        
                        
                    
                      <div className="hidden items-center gap-2 md:ml-auto md:flex">
                      
                       
                  

                      </div>
                    </div>
        
                    </div>


                    <main className="h-full w-full flex flex-col relative">
           <Tabs defaultValue="articles" value={value} className="relative ">
             <div className="sticky top-[68px]  z-[2] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur ">
              <div className={`w-full ${isOn ? 'px-8' : 'px-4'} border-b border-b-neutral-200 dark:border-b-neutral-800`}>
                {isOn && (
                  <div className="w-full pt-4  flex justify-between items-center">
                   
                  </div>
                )}
                <div className={`flex pt-2 gap-8 justify-between  ${isOn ? '' : ''} `}>
                  <div className="flex items-center gap-2">
                  <div className="relative grid grid-cols-1">

                  <Button
        variant='outline'
        size="sm"
        className={`absolute left-0 z-10 h-8 w-8 p-0 top-1 ${
          !canScrollLeft ? 'opacity-30 cursor-not-allowed' : ''
        }`}
        onClick={scrollLeft}
        disabled={!canScrollLeft}
      >
        <ChevronLeft size={16} />
      </Button>

 <div className=" mx-10 ">
 <div ref={scrollAreaRef} className="overflow-x-auto scrollbar-hide scrollbar-hide" onScroll={checkScrollability}>
   <div className="p-0 flex gap-2 h-auto bg-transparent dark:bg-transparent">
      {tabs.map(
        ({ id, label, icon: Icon}) =>
          <div
        key={id}
        className={`pb-2 border-b-2 text-black dark:text-white transition-all ${
          value === id ? "border-b-[#719CB8]" : "border-b-transparent"
        }`}
        onClick={() => {
          setValue(id)
          queryUrl.set("page", '1');

navigate({
pathname: location.pathname,
search: queryUrl.toString(),
});

        }}
      >
        <Button variant="ghost" className="m-0">
          <Icon size={16} />
          {label}
        </Button>
      </div>
      )}
    </div>
   </div>
 </div>
  

 
      {/* Botão Direita */}
      <Button
        variant='outline'
        size="sm"
        className={`absolute right-0 z-10 h-8 w-8 p-0 rounded-md  top-1 ${
          !canScrollRight ? 'opacity-30 cursor-not-allowed' : ''
        }`}
        onClick={scrollRight}
        disabled={!canScrollRight}
      >
        <ChevronRight size={16} />
      </Button>
</div>

       
                   
                  </div>
                  <div className="hidden xl:flex xl:flex-nowrap gap-2">
                <div className="md:flex md:flex-nowrap gap-2">

                </div>

               
              </div>

              
                </div>
              </div>
            
            </div>


            <ScrollArea className="h-full">
            <div className="px-8">

            <TabsContent value="salas">
            <Salas />
  </TabsContent>

  <TabsContent value="itens_vitrine">
            <Vitrine />
  </TabsContent>

</div>
</ScrollArea>
            </Tabs>
            </main>


        </main>
    )
}