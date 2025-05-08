import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Archive, Check, ChevronLeft, ChevronRight, CircleDollarSign, Eye, File, Heart, HelpCircle, Hourglass, MapPin, MoveRight, Share, Trash, User, X } from "lucide-react";
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
       const [bens, setBens] = useState<Item>(); 
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
                            setBens(data[0]);
                            isLoading(false)

                            console.log(data)
                          } 
                          
                      } catch (err) {
                        console.log(err);
                      }
                    }
        
                      fetchData();
                    }, [urlBens])

                    const data = (bens?.imagens || []).slice(0, 4).map((img, index) => ({
                      category: "",
                      title: "",
                      src: `${urlGeral}imagem/${img}`,
                    }));
                    
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

                        const urlPatrimonioBusca = `vitrine.eng.ufmg.br/buscar-patrimonio?bem_cod=${bens?.bem_cod}&bem_dgv=${bens?.bem_dgv}`; 
                      
                        const isFavorite = favoritos.some(fav => fav.patrimonio_id === bens?.patrimonio_id );
                        const csvCodTrimmed = bens?.csv_cod ? bens?.csv_cod.trim() : '';
  
                        // Verificar se props.bem_sta está definido antes de usar .trim()
                        const bemStaTrimmed = bens?.bem_sta ? bens?.bem_sta.trim() : '';
                      
                        const conectee = import.meta.env.VITE_BACKEND_CONECTEE || ''
                        
                        const statusMap = {
                          NO: { text: "Normal", icon: <Check size={12} className="" /> },
                          NI: { text: "Não inventariado", icon: <HelpCircle size={12} className="" /> },
                          CA: { text: "Cadastrado", icon: <Archive size={12} className="" /> },
                          TS: { text: "Aguardando aceite", icon: <Hourglass size={12} className="" /> },
                          MV: { text: "Movimentado", icon: <MoveRight size={12} className="" /> },
                          BX:{ text: "Baixado", icon: <X size={12} className="" /> },
                        };
                        
                        
                        const status = statusMap[bemStaTrimmed];

    return(
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <div className="  gap-4">
            <div className="flex items-center gap-4">
         
           <Button  onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 flex gap-2 items-center shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
             Detalhes do item

   
            
                  <Badge variant={'outline'}>{bens?.bem_cod} - {bens?.bem_dgv}</Badge>
                  {(bens?.bem_num_atm != '' && bens?.bem_num_atm != 'None') && (
                 <Badge variant={'outline'}>ATM: {bens?.bem_num_atm}</Badge>
             )}
             
              </h1>
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">

          
                    <Button onClick={() => handleDelete(bens?.patrimonio_id || '')} variant='destructive' size="sm">
                    <Trash size={16}/> Excluir
                   </Button>
             

                <Button variant="outline" size="sm">
                 <Share size={16}/> Compartilhar
                </Button>

              


    <Button
    onClick={() => handleAddFavorite(bens?.patrimonio_id || '', 'favorito', user?.user_id || '')}
      variant='outline'
      size="sm"
      className={isFavorite ? 'bg-pink-600 hover:bg-pink-700 hover:text-white text-white dark:bg-pink-600 dark:hover:bg-pink-700 dark:hover:text-white dark:text-white' : ''} // Aplica a classe de estilo condicionalmente
    >
      <Heart size={16} /> {isFavorite ? 'Remover' : 'Salvar'}
    </Button>
 
              
              </div>
            </div>

            </div>

            <div className="grid grid-cols-1">
            <Carousel items={cards} />

            <div className="flex flex-1 mt-8 h-full lg:flex-row flex-col-reverse  gap-8 ">

                <div className="flex w-full flex-col">
            
                
                  <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-semibold flex gap-2 leading-none items-center tracking-tight mb-2">{bens?.mat_nom || 'Sem nome'} 
                   {(bens?.mat_cod != 'None' && bens?.mat_cod != '' && bens?.mat_cod != null)  && (
                    <Badge variant="outline" className="ml-auto sm:ml-0">
                    Código: {bens?.mat_cod}
               </Badge>
                  )}
                   </h2>

                   <div className="flex gap-2 items-center">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Eye size={16}/> {bens?.qtd_de_favorito}
          </div>

         
     </div>
                  </div>
                  <h2 className="mb-8 text-gray-500 ">{bens?.bem_dsc_com}</h2>

                  <div className="flex ">
                  <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border  border-neutral-200 border-r-0 ${qualisColor[bens?.csv_cod || '' as keyof typeof qualisColor]} relative `}></div>

                  <Alert className="flex flex-col  rounded-l-none">
               
                  <div className="flex flex-col flex-1">
    

                <div className="flex  flex-wrap gap-3">
                {(bens?.csv_cod != 'None' && bens?.csv_cod != '' && bens?.csv_cod != null) && (
                  <div className=" text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                  <div className={`w-4 h-4 rounded-md ${qualisColor[csvCodTrimmed as keyof typeof qualisColor]}`}></div>
                  {csvCodToText[csvCodTrimmed as keyof typeof csvCodToText]}
                </div>
                )}

{status && (
                  <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
      {status.icon}
      {status.text}
      </div>
  ) }

               

<div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
<CircleDollarSign size={12} />
             Valor estimado R$ {Number(bens?.bem_val).toFixed(2)}
              </div>

              {(bens?.tre_cod != 'None' && bens?.tre_cod != '' && bens?.tre_cod != null) && (
                  <div className=" text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                 <File size={12} />
                Termo de resp.: {bens?.tre_cod}
                </div>
                )}
                </div>
              </div>

              <div>
                <Separator className="my-4"/>

                <div className="flex items-center   flex-wrap gap-3">
                <p className="text-sm uppercase font-bold">Localização:</p>
                
                {bens?.uge_nom != null && (
                <>
         
                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              
                {bens?.uge_cod} - {bens?.uge_nom}
                </div></>
               )}

{bens?.org_nom != null && (
                <>
         
                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              
                {bens?.org_cod} - {bens?.org_nom}
                </div></>
               )}

             
               {bens?.set_nom != null && (
                <>
                 <ChevronRight size={16} />
                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              
                {bens?.set_cod} - {bens?.set_nom}
                </div></>
               )}
                {bens?.loc_nom != null && (
                <>
                 <ChevronRight size={16} />
                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              
                {bens?.loc_cod} - {bens?.loc_nom}
                </div></>
               )}
                </div>

            
              </div>

                  </Alert>
                  </div>

                  
                  {(bens?.observacao.length || 0) > 0 && (
                   <div>
                     <Separator className="my-8"/>
                  <Alert>
                  <h2 className="text-sm uppercase font-bold mb-2">Observações do anunciante</h2>
                  <h2 className=" text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center ">{bens?.observacao}</h2>
                  </Alert>
                   </div>
                )}

                  {(bens?.pes_nome != '' && bens?.pes_nome  != 'None' && bens?.pes_nome  != null) && (
                 <div>
                   <Separator className="my-8"/>
                   <div className="flex gap-3 items-center ">
                  <Avatar className=" rounded-md  h-10 w-10">
                                <AvatarImage className={'rounded-md h-10 w-10'} src={`${conectee}ResearcherData/Image?name=${bens?.pes_nome}`} />
                                <AvatarFallback className="flex items-center justify-center"><User size={10} /></AvatarFallback>
                              </Avatar>
                 <div>
                 <p className="text-sm w-fit text-gray-500">Responsável</p>
                 <p className="text-black dark:text-white font-medium text-lg">{bens?.pes_nome}</p>
                 </div>
                  </div>
                 </div>
                )}

                
               
         
                  
                </div>

                <div className="lg:w-[400px] flex flex-col gap-8 lg:min-w-[400px] w-full">
                
                <Alert className="p-0">
                   <CardHeader>
                    <CardTitle>Transferência</CardTitle>
                    <CardDescription>
                    Informe o destino desejado para a transferência.
                    </CardDescription>
                  </CardHeader>
               
              <CardContent>
              <ButtonTransference ofertante={bens?.user_id || ''} patrimonio_id={bens?.patrimonio_id || ''} loc_ofertante={bens?.loc || ''}/>
              </CardContent>
                </Alert>

                <Alert className="p-0">
                <CardHeader>
                   
                <CardDescription className="text-justify">
  Ao solicitar a transferência, o anunciante será notificado. A Seção de Patrimônio analisará o pedido e dará um retorno em até 3 dias úteis.
</CardDescription>

<div>
<Separator className="my-4"/>
</div>

 <div className="flex justify-between items-center">
          <div className="text-sm w-fit text-gray-500 dark:text-gray-300 font-normal flex gap-2 items-center">
            <Avatar className="cursor-pointer rounded-md  h-10 w-10">
      <AvatarImage  className={'rounded-md h-10 w-10'} src={`${urlGeral}s/user/imagem/${bens?.user_id}`} />
      <AvatarFallback className="flex items-center justify-center"><User size={16}/></AvatarFallback>
  </Avatar>
 <div>
 <p className="text-sm w-fit text-gray-500">Anunciante</p>
 <p className="text-black dark:text-white font-medium text-lg">{bens?.display_name}</p>
</div></div>

 <div>

 </div>
          </div>

                  </CardHeader>
                </Alert>

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
                               <div className="flex gap-3 mb-2">
                               <p className={`uppercase text-muted-foreground dark:text-black  text-xs`}>
                                    Material: {bens?.mat_nom}
                                   </p>
                   
                                   <p className={`text-muted-foreground dark:text-black  text-xs`}>
                                    Ano: {currentYear}
                                   </p>
                   
                               </div>
                   
                                   <div className={` font-bold dark:text-black  text-xl`}>{bens?.bem_cod}-{bens?.bem_dgv}</div>
                                 <div className="">
                                 <div
  style={{
    backgroundImage: `url('https://barcode.orcascan.com/?type=code128&data=${bens?.bem_cod}-${bens?.bem_dgv}&fontsize=Fit&format=svg')`,
  }}
  className="mix-blend-multiply w-full bg-cover bg-no-repeat h-7"
></div>

                                 </div>
                   
                                 </div>
                   
                   
                   
                   
                   </Alert>
                   </div>
             

                </div>
            </div>
            </div>

            
        </main>
    )
}


