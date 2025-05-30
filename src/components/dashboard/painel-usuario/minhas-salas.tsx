import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../ui/carousel";
import { Alert } from "../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Barcode, Check, MapPin, X } from "lucide-react";

interface Salas {
    loc_cod:string
    loc_nom:string
}

export function MinhasSalas() {

    const {urlGeral, user} = useContext(UserContext)
    const [sala, setSala] = useState<Salas[]>([]); 

     const handleGetFavorites = async () => {
      const urlGetFavorites = `${urlGeral}loc/${user?.user_id}`;
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
          setSala(data);
        } else {
         
        }
      } catch (err) {
       
      }
    };
    
    useEffect(() => {
      handleGetFavorites()
      }, [user?.user_id])

    return(
      <div className="grid gap-8 w-full">
  <h3 className="text-2xl font-medium ">Minhas salas </h3>
</div>
    )
}