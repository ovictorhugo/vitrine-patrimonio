import { useContext, useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { UserContext } from "../../../context/context";
import { Item } from "../itens-vitrine/itens-vitrine";
import { Skeleton } from "../../ui/skeleton";
import { ItemPatrimonio } from "../../homepage/components/item-patrimonio";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Heart } from "lucide-react";

export function Favoritos() {
   const [favoritos, setFavoritos] = useState<Item[]>([]); 

    const { urlGeral, user} = useContext(UserContext)
    const [loading, isLoading] = useState(false)
     const handleGetFavorites = async (tipo: string, userId: string) => {
      const urlGetFavorites = `${urlGeral}favorito?tipo=${tipo}&user_id=${userId}`;
    console.log(urlGetFavorites)
    isLoading(true)
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
          isLoading(false)
        } else {
         
        }
      } catch (err) {
        isLoading(false)
      }
    };
    
    useEffect(() => {
      handleGetFavorites('favorito', user?.user_id || '')
      }, [user?.user_id])

      const items = Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md aspect-square" />
      ));

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
          

    return(
        <Alert className="p-0 gap-0">
              <CardHeader
                    className="
                      flex flex-row p-10  pb-0 items-center justify-between 

                    
                    "
                  >
                    <div>
                    <CardTitle className="text-sm font-medium">
  Favoritos
</CardTitle>
<CardDescription>Itens que você marcou como favoritos na plataforma</CardDescription>
                    </div>

                    <Heart className="h-4 w-4 text-muted-foreground" />

                  </CardHeader>


                  <CardContent className="pt-0 p-10">
                 <div>
             

              <div className=" w-full">
              {loading ? (
    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5">
        {items.map((item, index) => (
                        <div key={index}>{item}</div>
                      ))}
    </div>
  ):(
   <div className="grid grid-cols-1">
     <ScrollArea className="">
        <div className="flex gap-4">
        {favoritos.map((item) => {
        return(
            <div className="w-[250px]">
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
            username={item.username}
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
          
            />
            </div>
        )
    })}
    </div>
    <ScrollBar orientation='horizontal'/>
    </ScrollArea>
   </div>
  )}
              </div>
    

                 </div>
                  </CardContent>
        </Alert>
    )
}