import { Heart } from "lucide-react"
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
}

export function ItemPatrimonio(props:Props) {
     const history = useNavigate();

     const {urlGeral, loggedIn} = useContext(UserContext)

    return(
<div className="group">
    <div>
    <Carousel className="w-full flex items-center ">
      <CarouselContent>
        {props.imagens.map((item, index) => (
          <CarouselItem key={index}>
          <div className="p-1 relative flex justify-end">
        <div className="absolute z-[9]  flex justify-end p-3">  
          {loggedIn && (
            <Button size={'icon'} variant={'ghost'} className=" bg-transparent h-8 w-8  "><Heart size={16}/></Button>
          )}
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
    <div className="mt-2">
     <div>
     <p className="font-medium">{props.mat_nom}</p>
     <p className="text-sm text-gray-500">{props.num_patrimonio} - {props.num_verificacao}</p>
     </div>

     <div>

     </div>
    </div></Link>
  </div>
    )
}