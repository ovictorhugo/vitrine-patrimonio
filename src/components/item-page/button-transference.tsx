import { useContext } from "react";
import { Button } from "../ui/button";

import { toast } from "sonner"
import { UserContext } from "../../context/context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
interface Props {
    ofertante: string
    loc_ofertante: string
      patrimonio_id: string
}

export function ButtonTransference(props:Props) {

    const {user, urlGeral, loggedIn} = useContext(UserContext)


    const handleSubmit = async () => {

      
        try {
          const data = [
            {
                ofertante: props.ofertante,
                loc_ofertante: props.loc_ofertante,
                solicitante: user?.user_id,
                loc_solicitante: "locationB",
                patrimonio_id:props.patrimonio_id
            }
            
          ]
      
          console.log(data)
      
          let urlProgram = urlGeral + ' /transferencia'
      
      
          const fetchData = async () => {
          
    
            try {
             
              const response = await fetch(urlProgram, {
                mode: 'cors',
                method: 'POST',
                headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'POST',
                  'Access-Control-Allow-Headers': 'Content-Type',
                  'Access-Control-Max-Age': '3600',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
              });
      
              if (response.ok) {
               
                toast("Dados enviados com sucesso", {
                    description: "Item adicionado ao Vitrine",
                    action: {
                      label: "Fechar",
                      onClick: () => console.log("Undo"),
                    },
                  })
      
                
               
              } else {
                console.error('Erro ao enviar dados para o servidor.');
                toast("Tente novamente!", {
                    description: "Tente novamente",
                    action: {
                      label: "Fechar",
                      onClick: () => console.log("Undo"),
                    },
                  })
              }
              
            } catch (err) {
              console.log(err);
            } 
           
          };
          fetchData();
      
      
        } catch (error) {
            toast("Erro ao processar requisição", {
                description: "Tente novamente",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Undo"),
                },
              })
        }
      }

    return(
       <div className="flex gap-4 flex-col">
        <Select disabled={(props.ofertante == user?.user_id) || !loggedIn} >
  <SelectTrigger >
    <SelectValue placeholder="Selecione a sala de destino" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>

  </SelectContent>
</Select>

         <Button disabled={(props.ofertante == user?.user_id) || !loggedIn} className="w-full">Solicitar transferência</Button>
       </div>
    )
}