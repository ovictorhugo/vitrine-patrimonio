import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ChevronLeft, Heart, Share, Trash } from "lucide-react";
import { Card, Carousel } from "../ui/apple-cards-carousel";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Alert } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import QRCode from "react-qr-code";
import { Label } from "../ui/label";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";

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
    bem_cod:string
    bem_dgv:string
    bem_dsc_com:string
    bem_num_atm:string
    bem_serie:string
    bem_sta:string
    bem_val:string
    csv_cod:string
    display_name:string
    ele_cod:string
    grp_cod:string
    ite_mar:string
    ite_mod:string
    loc_cod:string
    loc_nom:string
    mat_cod:string
    org_cod:string
    org_nom:string
    pes_cod:string
    pes_nome:string
    sbe_cod:string
    set_cod:string
    set_nom:string
    tgr_cod:string
    tre_cod:string
    uge_cod:string
    uge_nom:string
    uge_siaf:string

  }

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

export function ItemPage() {
       const {user, urlGeral, defaultLayout} = useContext(UserContext)
       const [bens, setBens] = useState<Item[]>([]); 

   

      const query = useQuery();
      const item_id = query.get('item_id');

     const history = useNavigate();
    
        const handleVoltar = () => {
          history(-3);
        };

        const currentYear = new Date().getFullYear();

                  const [loading, isLoading] = useState(false)
                 
                  let urlBens = urlGeral +`formulario?user_id=&loc=&verificado=&patrimonio_id=${item_id}`
        console.log(urlBens)
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

                            console.log(data)
                          } 
                          
                      } catch (err) {
                        console.log(err);
                      }
                    }
        
                      fetchData();
                    }, [urlBens])

                    const data = [
                      {
                        category: "Artificial Intelligence",
                        title: "You can do more with AI.",
                        src: `${urlGeral}imagem/${bens?.[0]?.imagens?.[0]}`,
                       
                      },
                      {
                        category: "Productivity",
                        title: "Enhance your productivity.",
                        src: `${urlGeral}imagem/${bens?.[0]?.imagens?.[1]}`,
                     
                      },
                      {
                        category: "Product",
                        title: "Launching the new Apple Vision Pro.",
                        src: `${urlGeral}imagem/${bens?.[0]?.imagens?.[2]}`,
                      
                      },
                     
                      {
                        category: "Product",
                        title: "Maps for your iPhone 15 Pro Max.",
                        src: `${urlGeral}/imagem/${bens?.[0]?.imagens?.[3]}`,
                  
                     
                      },
                     
                    ];
                  
                    console.log(data)
                  
                  
                    const cards = data.map((card, index) => (
                      <Card key={card.src} card={card} index={index} layout={true} />
                    )); 
                    
                    
                    const [relevance, setRelevance] = useState(false);
                    const [desfazimento, setDesfazimento] = useState(false);


    return(
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <div className="  gap-4">
            <div className="flex items-center gap-4">
         
           <Button  onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 flex gap-2 items-center shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              {bens.slice(0, 1).map((user) => {
                return(
                  `${user.mat_nom}`
                  )
                })}

{bens.slice(0, 1).map((user) => {
                return(
                  <Badge variant={'outline'}>{user.bem_cod} - {user.bem_dgv}</Badge>
                  )
                })}
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

                <div className="flex w-full flex-col">
                {bens.slice(0, 1).map((props) => {
                return(
                  <>
                   <h2 className="text-2xl font-medium mb-2">Descrição do patrimônio</h2>
                  <h2 className="mb-8 text-gray-500 ">{props.bem_dsc_com}</h2>

                  <Alert>

                  </Alert>

                  <Separator className="mt-8"/>

                  <Separator className="my-8"/>
                {props.observacao.length > 0 && (
                   <div>
                   <h2 className="text-2xl font-medium mb-2">Observações do anunciante</h2>
                   <h2 className="mb-8 text-gray-500 ">{props.observacao}</h2>
                   </div>
                )}
                  </>
                  )
                })}
                  
                </div>

                <div className="lg:w-[400px] flex flex-col gap-8 lg:min-w-[400px] w-full">
                
                <Alert className="p-0">
               
                  <CardContent className="flex mt-6 flex-col gap-4">
                    <div className="">
                    <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Alocação no Vitrine (sala 40)</Label>
                        <CardDescription>
                      Caso haja a disponibilidade, gostaria que o item seja guardado na sala física do Vitrine?
                    </CardDescription>
                        <div className="flex gap-2 items-center ">
            <Switch checked={relevance} onCheckedChange={(e) => {
              setRelevance(e)
              setDesfazimento(false)
            }} />
            <p className="text-sm">{relevance ? "Sim, preciso da alocação" : "Não, não preciso"} </p>
          </div>
                      </div>
                    
                    </div>

                    <div className="">
                    <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Desfazimento</Label>
                        <CardDescription>
                    Este é um item elegível para o desfazimento?
                    </CardDescription>
                        <div className="flex gap-2 items-center ">
            <Switch disabled={relevance} checked={desfazimento} onCheckedChange={(e) => setDesfazimento(e)} />
            <p className="text-sm">{desfazimento ? "Não, não preciso" : "Sim, preciso da alocação"} </p>
          </div>
                      </div>
                    
                    </div>
                  </CardContent>
                </Alert>

                <Alert >

                </Alert>
                {bens.slice(0, 1).map((props) => {
                   const urlPatrimonioBusca = `vitrine.eng.ufmg.br/buscar-patrimonio?bem_cod=${props.bem_cod}&bem_dgv=${props.bem_dgv}`; 
                return(
                  <div id="content-to-pdf" className={` flex dark:text-black `}>
                   <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 k border-r-0 bg-eng-blue min-h-full relative `}></div>
                   <Alert className={`dark:bg-white  border-l-0  rounded-l-none items-center flex gap-4 `}>
                   <div className="w-fit">
                   <QRCode
                    className={` w-fit  h-20`}
                       value={urlPatrimonioBusca}
                       
                     />
                   </div>
                   
                   <div className="flex flex-col w-full h-full justify-center py-2">
                                 <p className={`dark:text-black  font-semibold `}>Escola de Engenharia da UFMG</p>
                                 <p className={`text-muted-foreground dark:text-black  text-xs`}>
                                    Resp.:{props.pes_nome}
                                   </p>
                   
                                   <p className={`text-muted-foreground dark:text-black  text-xs`}>
                                    Ano: {currentYear}
                                   </p>
                   
                   
                                   <div className={` font-bold dark:text-black  text-xl`}>{props.bem_cod}-{props.bem_dgv}</div>
                                 <div className="">
                                 <div
  style={{
    backgroundImage: `url('https://barcode.orcascan.com/?type=code128&data=${props.bem_cod}-${props.bem_dgv}&fontsize=Fit&format=svg')`,
  }}
  className="mix-blend-multiply w-full bg-cover bg-no-repeat h-7"
></div>

                                 </div>
                   
                                 </div>
                   
                   
                   
                   
                   </Alert>
                   </div>
                  )
                })}

                </div>
            </div>
            </div>

            
        </main>
    )
}


