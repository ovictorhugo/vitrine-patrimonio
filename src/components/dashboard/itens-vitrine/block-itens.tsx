import { useContext, useEffect, useState } from "react";
import { toast } from "sonner"
import { UserContext } from "../../../context/context";
import { ItemPatrimonio } from "../../homepage/components/item-patrimonio";
import { Item } from "../../item-page/item-page";
import { Link } from "react-router-dom";
import { Alert } from "../../ui/alert";
import { Plus } from "lucide-react";
import { Button } from "../../ui/button";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

interface Props {
    bens: any[];
    new_item?:boolean
    handlePutItem?: (patrimonio_id: any, verificado: boolean) => Promise<void>;
}

export function BlockItem(props:Props) {
      const {user, urlGeral, defaultLayout, loggedIn, itemsSelecionados} = useContext(UserContext)
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

            const [count, setCount] = useState(12)



    return(
        <div>
          <ResponsiveMasonry
                          columnsCountBreakPoints={{
                            350: 1,
                            750: 2,
                            900: 3,
                            1200: 4,
                            1700: 5
                          }}
                        >
                          <Masonry gutter="16px">
     
            {props.bens
  .filter((item) => 
    itemsSelecionados.length === 0 || 
    itemsSelecionados.some((selected) => selected.term === item.mat_nom)
  )
  .slice(0, count)
  .map((item) => {
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
            bem_dsc_com={item.bem_dsc_com}
            bem_num_atm={item.bem_num_atm}
            bem_serie={item.bem_serie}
            bem_sta={item.bem_sta}
            bem_val={item.bem_val}
            csv_cod={item.csv_cod}
            display_name={item.display_name}
            ele_cod={item.ele_cod}
            grp_cod={item.grp_cod}
            ite_mar={item.ite_mar}
            ite_mod={item.ite_mod}
            loc_cod={item.loc_cod}
            loc_nom={item.loc_nom}
            mat_cod={item.mat_cod}
            org_cod={item.org_cod}
            org_nom={item.org_nom}
            pes_cod={item.pes_cod}
            pes_nome={item.pes_nome}
            sbe_cod={item.sbe_cod}
            set_cod={item.set_cod}
            set_nom={item.set_nom}
            tgr_cod={item.tgr_cod}
            tre_cod={item.tre_cod}
            uge_cod={item.uge_cod}
            uge_nom={item.uge_nom}
            uge_siaf={item.uge_siaf}
            bem_cod={item.bem_cod}
            bem_dgv={item.bem_dgv}
            handlePutItem={props.handlePutItem}
            />
          );
        })}
             </Masonry>
             </ResponsiveMasonry>

            {props.bens
  .filter((item) => 
    itemsSelecionados.length === 0 || 
    itemsSelecionados.some((selected) => selected.term === item.mat_nom)
  ).length > count && (
            <div className="w-full flex justify-center mt-8"><Button onClick={() => setCount(count + 24)}><Plus size={16} />Mostrar mais</Button></div>
        )}
        </div>
    )
}