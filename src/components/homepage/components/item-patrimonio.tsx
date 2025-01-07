import { Eye, Heart, Pencil } from "lucide-react"
import { Button } from "../../ui/button"
import { Alert } from "../../ui/alert"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "../../ui/carousel"
import { CardContent } from "../../ui/card"
import { Link, useNavigate } from "react-router-dom"
import { useContext } from "react"
import { UserContext } from "../../../context/context"
import { toast } from "sonner"


interface Props {
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
    isFavorite: boolean;
  onToggleFavorite: (patrimonioId: string) => void;
  qtd_de_favorito:string
}

export function ItemPatrimonio(props:Props) {
     const history = useNavigate();

     const {urlGeral, loggedIn, user} = useContext(UserContext)
     const isFavorite = props.isFavorite

     console.log(isFavorite)

 
    return(
<div className="group">
    <div>
    <Carousel className="w-full flex items-center ">
      <CarouselContent>
        {props.imagens?.map((item, index) => (
          <CarouselItem key={index}>
          <div className="p-1 relative flex justify-end">
        <div className="absolute z-[9] gap-2 flex justify-end p-3">  

        {loggedIn &&



<Button
onClick={() => props.onToggleFavorite(props.patrimonio_id)}
size={'icon'} variant={'ghost'}

  className={`  h-8 w-8  `}// Aplica a classe de estilo condicionalmente
>
  <Pencil size={16} /> 
</Button>

}
       

{loggedIn &&



    <Button
    onClick={() => props.onToggleFavorite(props.patrimonio_id)}
    size={'icon'} variant={'ghost'}
   
      className={`  h-8 w-8 ${isFavorite ? 'bg-pink-600 hover:bg-pink-700 hover:text-white text-white dark:bg-pink-600 dark:hover:bg-pink-700 dark:hover:text-white dark:text-white' : ' '} `}// Aplica a classe de estilo condicionalmente
    >
      <Heart size={16} /> 
    </Button>

}

        </div>
            <Alert className="bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(${urlGeral}imagem/${item}` }}>
              <CardContent className="flex aspect-square  justify-end p-0">
            
              </CardContent>
            </Alert>
          </div>
        </CarouselItem>
        ))}
      </CarouselContent>
      <div className="w-full hidden  absolute justify-between group-hover:flex p-4">
    <CarouselPrevious variant={'ghost'} />
    <CarouselNext variant={'ghost'}  />
    </div>
    </Carousel>
    </div>
    <Link target="_blank" to={`/item?item_id=${props.patrimonio_id}`}>
    <div className="mt-2 flex justify-between items-center">
     <div>
     <p className="font-medium">{props.mat_nom}</p>
     <p className="text-sm text-gray-500">{props.num_patrimonio} - {props.num_verificacao}</p>
     </div>

     <div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Eye size={12}/> {props.qtd_de_favorito}
          </div>
     </div>
    </div></Link>
  </div>
    )
}