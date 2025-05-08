import { useContext, useEffect, useState } from "react";
import { Button } from "../ui/button";

import { toast } from "sonner"
import { UserContext } from "../../context/context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { useModal } from "../hooks/use-modal-store";
import { Label } from "../ui/label";
import { useQuery } from "../modal/search-modal-patrimonio";
import { Trash } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
interface Props {
    ofertante: string
    loc_ofertante: string
      patrimonio_id: string
}

export function ButtonTransference(props:Props) {
  const queryUrl = useQuery();
  const loc_nom = queryUrl.get('loc_nom');

  const [locNom, setLocNom] = useState(loc_nom || '')
useEffect(() => {

setLocNom(loc_nom || '')

}, [loc_nom]);

    const {user, urlGeral, loggedIn} = useContext(UserContext)


    const handleSubmit = async () => {

      
        try {
          const data = [
            {
                ofertante: props.ofertante,
                loc_ofertante: props.loc_ofertante,
                solicitante: user?.user_id,
                loc_solicitante: locNom,
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
      
      const {onOpen} = useModal()
  const navigate = useNavigate();
  const location = useLocation();

    return(
       <div className="flex gap-4 flex-col">
        <div className="grid gap-3 w-full">
        <Label htmlFor="tre_cod">Local de guarda</Label>
        <div className="flex items-center gap-3">
          <Input
            id="loc_nom"
            type="text"
         
            className="w-full"
            value={locNom}
           
         onClick={() => onOpen('search-loc-nom')}
            onChange={(e) => setLocNom(e.target.value)}
          />
          {locNom.length > 0 && (
            <Button onClick={() => {
              setLocNom('')
              queryUrl.set('loc_nom', '');
              navigate({
                pathname: location.pathname,
                search: queryUrl.toString(),
              });
            }} size={'icon'} className="min-w-10 " variant={'destructive'}> <Trash size={16}/></Button>
          )}
        </div>
      </div>

         <Button onClick={() => handleSubmit()} disabled={ !loggedIn || locNom.length == 0} className="w-full">Solicitar transferência</Button>
       </div>
    )
}