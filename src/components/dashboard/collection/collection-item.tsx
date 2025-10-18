import { useContext } from "react";


import { Calendar, Earth, Lock } from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/context";

import { useQuery } from "../../authentication/signIn";
import { Alert } from "../../ui/alert";
import { CardContent } from "../../ui/card";
import { CollectionDTO } from "./collection-page";

export function CollectionItem({
  props,
  type,
}: {
  props: CollectionDTO;
  type: string;
}) {
    const {urlGeral} = useContext(UserContext)
    
      const navigate = useNavigate();
      const queryUrl = useQuery();
      const location = useLocation()

    const handlePesquisaFinal = (dep_id: string) => {
        queryUrl.set('collection_id', dep_id);
        navigate({
          pathname: location.pathname,
          search: queryUrl.toString(),
        });
      }

    return(
        <div className="w-full" onClick={() => handlePesquisaFinal(props.id)}>
             <Alert  className="bg-center cursor-pointer bg-cover bg-no-repeat">
              <CardContent className="flex aspect-square justify-between flex-col p-0">
             
              <p className="font-medium uppercase flex items-center gap-1 text-xs  text-gray-500"> 
             {type}
            </p>
            <div>
           <div>
           <p className="font-bold text-2xl truncate"  title={props.name}>{props.name}</p>
           <p className="font-medium flex items-center gap-1 text-xs mt-1 text-gray-500"> 
            
                <Calendar size={12}/>
                {new Date(props.created_at).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })}</p>
           </div>
            </div>
              </CardContent>
            </Alert>
            
        </div>
    )
}