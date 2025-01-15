import { useContext, useEffect, useState } from "react";
import { toast } from "sonner"
import { UserContext } from "../../../context/context";
import { ItemPatrimonio } from "../../homepage/components/item-patrimonio";
import { Item } from "../../item-page/item-page";
import { Link } from "react-router-dom";
import { Alert } from "../../ui/alert";
import { Plus } from "lucide-react";
import { Button } from "../../ui/button";

interface Props {
    bens: any[];
    new_item?:boolean
}

export function BlockItem(props:Props) {
      const {user, urlGeral, defaultLayout, loggedIn} = useContext(UserContext)
      const [favoritos, setFavoritos] = useState<Item[]>([]); 

   

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

                            

                              // Add or remove a favorite
  const handleToggleFavorite = async (patrimonioId: string) => {
    const isFavorite = favoritos.some(fav => fav.patrimonio_id === patrimonioId);
    
    const method = isFavorite ? "DELETE" : "POST";
    const url = `${urlGeral}favorito?id=${patrimonioId}&tipo=favorito&user_id=${user?.user_id || ""}`;
    try {
      const response = await fetch(url, {
        method,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': isFavorite ? "DELETE" : "POST",
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
       if (isFavorite) {
        console.log('removido')
        toast("Item removido dos favoritos com sucesso!", {
            description: "O item foi removido da lista de favoritos.",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar mensagem"),
            },
          });
       } else {
        console.log('adicionado')
        toast("Item adicionado aos favoritos com sucesso!", {
            description: "O item foi salvo como favorito.",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar mensagem"),
            },
          });
       }///
       handleGetFavorites('favorito', user?.user_id || '')
       console.log(favoritos)
   
      } else {
        if (isFavorite) {
            toast("Erro ao remover o item dos favoritos!", {
                description: "Por favor, tente novamente.",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Fechar mensagem"),
                },
              });
           } else {
            toast("Erro ao adicionar o item aos favoritos!", {
                description: "Verifique sua conexão e tente novamente.",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Fechar mensagem"),
                },
              });
           }
      }
    } catch (err) {
        if (isFavorite) {
            toast("Erro ao remover o item dos favoritos!", {
                description: "Por favor, tente novamente.",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Fechar mensagem"),
                },
              });
           } else {
            toast("Erro ao adicionar o item aos favoritos!", {
                description: "Verifique sua conexão e tente novamente.",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Fechar mensagem"),
                },
              });
           }
    }
  };
      
        useEffect(() => {
            handleGetFavorites('favorito', user?.user_id || '')
            console.log(favoritos)
            }, [user?.user_id])

            const [count, setCount] = useState(6)

    return(
        <div>
           <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5">
           
           {props.new_item && (
            <Link to={'/dashboard/novo-item'} className="">
            <Alert  className="flex flex-col min-h-[200px] cursor-pointer text-eng-blue items-center justify-center aspect-square hover:bg-neutral-100 transition-all dark:hover:bg-neutral-900">
                           <div className="mb-4">
                           <Plus size={32}/>
                           </div>
    
                         <p className="font-semibold">  Criar item novo</p>
                        </Alert>
            </Link>
           )}
            {props.bens.slice(0, count).map((item) => {
          return (
            <ItemPatrimonio
              codigo_atm={item.codigo_atm}
              condicao={item.condicao}
              desfazimento={item.desfazimento}
              email={item.email}
              imagens={item.imagens}
              loc={item.loc}
              material={item.material}
              matricula={item.matricula}
              num_patrimonio={item.num_patrimonio}
              num_verificacao={item.num_verificacao}
              observacao={item.observacao}
              patrimonio_id={item.patrimonio_id}
              phone={item.phone}
              situacao={item.situacao}
              u_matricula={item.u_matricula}
              user_id={item.user_id}
              verificado={item.verificado}
              vitrine={item.vitrine}
              mat_nom={item.mat_nom}
              isFavorite={favoritos.some((fav) => fav.patrimonio_id === item.patrimonio_id)}
            onToggleFavorite={handleToggleFavorite}
            qtd_de_favorito={item.qtd_de_favorito}
            estado_transferencia={item.estado_transferencia}
            created_at={item.created_at}
            />
          );
        })}
            </div>

            {props.bens.length > count && (
            <div className="w-full flex justify-center mt-8"><Button onClick={() => setCount(count + 24)}><Plus size={16} />Mostrar mais</Button></div>
        )}
        </div>
    )
}