import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ChevronLeft, Heart, Share, Trash } from "lucide-react";
import { Card, Carousel } from "../ui/apple-cards-carousel";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Alert } from "../ui/alert";

interface Item {
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
  }

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

export function ItemPage() {
       const {user, urlGeral, defaultLayout} = useContext(UserContext)

    const cards = data.map((card, index) => (
        <Card key={card.src} card={card} index={index} layout={true} />
      ));

      const query = useQuery();
      const item_id = query.get('item_id');

     const history = useNavigate();
    
        const handleVoltar = () => {
          history(-3);
        };


          const [bens, setBens] = useState<Item | null>(null); 
                  const [loading, isLoading] = useState(false)
                 
                  let urlBens = urlGeral +`formulario?user_id=&loc=&verificado=&patrimonio_id=${item_id}`
        
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
    
    return(
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <div className="  gap-4">
            <div className="flex items-center gap-4">
         
           <Button  onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                {}
              </h1>
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button variant='destructive' size="sm">
                 <Trash size={16}/> Excluir
                </Button>

                <Button variant="outline" size="sm">
                 <Share size={16}/> Compartilhar
                </Button>
                <Button variant="outline"  size="sm"><Heart size={16} />Salvar</Button>
              </div>
            </div>

            </div>

            <div className="grid grid-cols-1">
            <Carousel items={cards} />

            <div className="flex flex-1 mt-8 h-full lg:flex-row flex-col-reverse  gap-8 ">

                <div className="flex w-full">

                </div>

                <Alert className="lg:w-[400px] lg:min-w-[400px] w-full">

                </Alert>
            </div>
            </div>

            
        </main>
    )
}


   
  const data = [
    {
      category: "Artificial Intelligence",
      title: "You can do more with AI.",
      src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
     
    },
    {
      category: "Productivity",
      title: "Enhance your productivity.",
      src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   
    },
    {
      category: "Product",
      title: "Launching the new Apple Vision Pro.",
      src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    
    },
   
    {
      category: "Product",
      title: "Maps for your iPhone 15 Pro Max.",
      src: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   
    },
   
  ];