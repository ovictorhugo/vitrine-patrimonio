import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Check, ChevronLeft, Heart, MapPin, Share, Trash, User, X } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner"
import { ButtonTransference } from "./button-transference";

export interface Item {
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
    qtd_de_favorito:string
    estado_transferencia:string
    created_at:string
  }

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

export function ItemPage() {
       const {user, urlGeral, defaultLayout, loggedIn} = useContext(UserContext)
       const [bens, setBens] = useState<Item[]>([]); 
       const [favoritos, setFavoritos] = useState<Item[]>([]); 
   

      const query = useQuery();
      const item_id = query.get('item_id');

      const qualisColor = {
        'BM': 'bg-green-500',
        'AE': 'bg-red-500',
        'IR': 'bg-yellow-500',
        'OC': 'bg-blue-500',
        'BX': 'bg-gray-500',
        'RE': 'bg-purple-500'
      };
    
      const csvCodToText = {
        'BM': 'Bom',
        'AE': 'Anti-Econômico',
        'IR': 'Irrecuperável',
        'OC': 'Ocioso',
        'BX': 'Baixado',
        'RE': 'Recuperável'
      };

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


                    
                    const handleDelete = (id: string) => {

                        const urlDeleteProgram =  urlGeral + `formulario?patrimonio_id=${id}`
                        const fetchData = async () => {
                         
                          try {
                            const response = await fetch(urlDeleteProgram, {
                              mode: 'cors',
                              method: 'DELETE',
                              headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'DELETE',
                                'Access-Control-Allow-Headers': 'Content-Type',
                                'Access-Control-Max-Age': '3600',
                                'Content-Type': 'text/plain'
                              }
                            });
                            if (response.ok) {
                              toast("Dados deletados com sucesso!", {
                                description: "Item removido da base de dados",
                                action: {
                                  label: "Fechar",
                                  onClick: () => console.log("Undo"),
                                },
                              })
                            }
                          } catch (err) {
                            console.log(err);
                            toast("Erro ao deletar o item!", {
                                description: "Tente novamente",
                                action: {
                                  label: "Fechar",
                                  onClick: () => console.log("Undo"),
                                },
                              })
                          } 
                        };
                        fetchData();
                        history('/')
                  
                     
                      };



                      ///

                      const handleAddFavorite = (id: string, tipo: string, userId: string) => {
                        const urlAddFavorite = `${urlGeral}/favorito?id=${id}&tipo=${tipo}&user_id=${userId}`;
                        const isFavorite = favoritos.some(fav => fav.patrimonio_id === id);

                        const fetchData = async () => {
                          try {
                            const response = await fetch(urlAddFavorite, {
                              mode: 'cors',
                              method: 'POST',
                              headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'POST',
                                'Access-Control-Allow-Headers': 'Content-Type',
                                'Access-Control-Max-Age': '3600',
                                'Content-Type': 'application/json',
                              },
                            });
                      
                            if (response.ok) {
                              toast("Item adicionado aos favoritos com sucesso!", {
                                description: "O item foi salvo como favorito.",
                                action: {
                                  label: "Fechar",
                                  onClick: () => console.log("Fechar mensagem"),
                                },
                              });
                              handleGetFavorites('favorito', user?.user_id || '')
                            } else {
                              const errorMessage = await response.text();
                              console.log("Erro na resposta:", errorMessage);
                              toast("Erro ao adicionar o item aos favoritos!", {
                                description: "Por favor, tente novamente.",
                                action: {
                                  label: "Fechar",
                                  onClick: () => console.log("Fechar mensagem"),
                                },
                              });
                            }
                          } catch (err) {
                            console.log("Erro:", err);
                            toast("Erro ao adicionar o item aos favoritos!", {
                              description: "Verifique sua conexão e tente novamente.",
                              action: {
                                label: "Fechar",
                                onClick: () => console.log("Fechar mensagem"),
                              },
                            });
                          }
                        };

                             /////

                             const urlDeleteFavorite = `${urlGeral}favorito?id=${id}&tipo=${tipo}&user_id=${userId}`;


                        const fetchDataDelete = async () => {
                            try {
                                const response = await fetch(urlDeleteFavorite, {
                                  mode: 'cors',
                                  method: 'DELETE',
                                  headers: {
                                    'Access-Control-Allow-Origin': '*',
                                    'Access-Control-Allow-Methods': 'DELETE',
                                    'Access-Control-Allow-Headers': 'Content-Type',
                                    'Access-Control-Max-Age': '3600',
                                    'Content-Type': 'application/json',
                                  },
                                });
                            
                                if (response.ok) {
                                  toast("Item removido dos favoritos com sucesso!", {
                                    description: "O item foi removido da lista de favoritos.",
                                    action: {
                                      label: "Fechar",
                                      onClick: () => console.log("Fechar mensagem"),
                                    },
                                  });
                                  handleGetFavorites('favorito', user?.user_id || '')
                                  // Atualize o estado local removendo o item
                                  setFavoritos((prevFavoritos) => prevFavoritos.filter((fav) => fav.patrimonio_id !== id));
                                } else {
                                  const errorMessage = await response.text();
                                  console.log("Erro na resposta:", errorMessage);
                                  toast("Erro ao remover o item dos favoritos!", {
                                    description: "Por favor, tente novamente.",
                                    action: {
                                      label: "Fechar",
                                      onClick: () => console.log("Fechar mensagem"),
                                    },
                                  });
                                }
                              } catch (err) {
                                console.log("Erro:", err);
                                toast("Erro ao remover o item dos favoritos!", {
                                  description: "Verifique sua conexão e tente novamente.",
                                  action: {
                                    label: "Fechar",
                                    onClick: () => console.log("Fechar mensagem"),
                                  },
                                });
                              }
                        }

                   
                        if(isFavorite) {
                            fetchDataDelete();
                        } else {
                            fetchData();
                        }
                      
                       
                      };


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
    console.log(`${urlGeral}s/user/image/${user.user_id}`)
                return(
                  <Badge variant={'outline'}>{user.bem_cod} - {user.bem_dgv}</Badge>
                  )
                })}
              </h1>
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">

                {bens.slice(0, 1).map((user) => {
                return(
                    <Button onClick={() => handleDelete(user.patrimonio_id)} variant='destructive' size="sm">
                    <Trash size={16}/> Excluir
                   </Button>
                  )
                })}

                <Button variant="outline" size="sm">
                 <Share size={16}/> Compartilhar
                </Button>

              

{loggedIn && bens.slice(0, 1).map((user) => {
  // Verifica se o patrimônio está nos favoritos
  const isFavorite = favoritos.some(fav => fav.patrimonio_id === user.patrimonio_id);

  return (
    <Button
    onClick={() => handleAddFavorite(user.patrimonio_id, 'favorito', user?.user_id || '')}
      variant='outline'
      size="sm"
      className={isFavorite ? 'bg-pink-600 hover:bg-pink-700 hover:text-white text-white dark:bg-pink-600 dark:hover:bg-pink-700 dark:hover:text-white dark:text-white' : ''} // Aplica a classe de estilo condicionalmente
    >
      <Heart size={16} /> {isFavorite ? 'Remover' : 'Salvar'}
    </Button>
  );
})}
              
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
                   <h2 className="text-3xl font-semibold leading-none tracking-tight mb-2">Descrição do patrimônio</h2>
                  <h2 className="mb-8 text-gray-500 ">{props.bem_dsc_com}</h2>

                  <div className="flex ">
                  <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border  border-neutral-200 border-r-0 ${qualisColor[props.csv_cod as keyof typeof qualisColor]} relative `}></div>

                  <Alert className="flex flex-col  rounded-l-none">
                  <p className="text-black dark:text-white font-medium text-lg">Informações</p>
                  <div className="flex mt-2 flex-wrap gap-4">
                <div className="flex gap-2 items-center text-xs font-medium"><User size={12} />{props.pes_nome}</div>
                <div className="flex gap-2 items-center text-xs font-medium uppercase">
                  <div className={`w-4 h-4 rounded-md ${qualisColor[props.csv_cod as keyof typeof qualisColor]}`}></div>
                  {csvCodToText[props.csv_cod as keyof typeof csvCodToText]}
                </div>
                <div className="flex gap-2 items-center text-xs font-medium uppercase">
                  {props.bem_sta === "NO" ? (<Check size={12} />) : (<X size={12} />)}
                  {props.bem_sta === "NO" ? 'Normal' : 'Não encontrado no local de guarda'}
                </div>
                <div className="flex gap-2 items-center text-xs font-medium"><MapPin size={12} />{props.loc_nom}</div>
              </div>
                  </Alert>
                  </div>

                  <Separator className="my-8"/>

                  <div className="flex justify-between items-center">
          <div className="text-sm w-fit text-gray-500 dark:text-gray-300 font-normal flex gap-2 items-center">
            <Avatar className="cursor-pointer rounded-md  h-16 w-16">
      <AvatarImage  className={'rounded-md h-16 w-16'} src={`${urlGeral}s/user/imagem/${props.user_id}`} />
      <AvatarFallback className="flex items-center justify-center"><User size={16}/></AvatarFallback>
  </Avatar>
 <div>
 
 <p className="text-black dark:text-white font-medium text-lg">{props.display_name}</p>
 <p>{props.email}</p></div></div>

 <div>

 </div>
          </div>

                  <Separator className="my-8"/>
                {props.observacao.length > 0 && (
                   <div>
                   <h2 className="text-3xl font-semibold leading-none tracking-tight mb-2">Observações do anunciante</h2>
                   <h2 className="mb-8 text-gray-500 ">{props.observacao}</h2>
                   </div>
                )}
                  </>
                  )
                })}
                  
                </div>

                <div className="lg:w-[400px] flex flex-col gap-8 lg:min-w-[400px] w-full">
                
                
                {bens.slice(0, 1).map((props) => {
              return(
                <Alert className="p-0">
                   <CardHeader>
                    <CardTitle>Transferência</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
               
              <CardContent>
              <ButtonTransference ofertante={props.user_id} patrimonio_id={props.patrimonio_id} loc_ofertante={props.loc}/>
              </CardContent>
                </Alert>
 )
})}

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


