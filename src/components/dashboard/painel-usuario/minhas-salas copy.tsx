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
        <div>
<Carousel className="w-full flex gap-3 items-center ">
      <CarouselPrevious />
<CarouselContent className="-ml-1 flex w-full flex-1">
{sala.map((props) => {

  return(
    <CarouselItem className="pl-1 md:basis-1/2 lg:basis-1/4">
 <Alert className="min-h-[250px]">
 <CardHeader className="flex p-2 flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
            
              </CardTitle>
              <Barcode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent className="p-2 pt-0 flex flex-col justify-between h-full">
              <div>
                <div className="text-xl font-bold">gff</div>
              
              </div>
  
             
            </CardContent>

    <div>

    </div>
 </Alert>
</CarouselItem>
  )
})}
</CarouselContent>


<CarouselNext />

</Carousel>
        </div>
    )
}