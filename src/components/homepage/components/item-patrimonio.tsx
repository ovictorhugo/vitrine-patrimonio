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
import { Badge } from "../../ui/badge"
import { useModal } from "../../hooks/use-modal-store"
import { Gear } from "phosphor-react"
import { Switch } from "../../ui/switch"


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
  estado_transferencia:string
  created_at:string
  bem_dsc_com:string


  bem_cod:string
  bem_dgv:string

  bem_num_atm:string
  bem_serie:string
  bem_sta:string
  bem_val:string
  csv_cod:string
  username:string
  ele_cod:string
  grp_cod:string
  ite_mar:string
  ite_mod:string
  loc_cod:string
  loc_nom:string
  mat_cod:string
  org_cod:string
  org_nom:string
  pes_cod:string
  pes_nome:string
  sbe_cod:string
  set_cod:string
  set_nom:string
  tgr_cod:string
  tre_cod:string
  uge_cod:string
  uge_nom:string
  uge_siaf:string
  handlePutItem?: (patrimonio_id: any, verificado: boolean) => Promise<void>;
}

export function ItemPatrimonio(props:Props) {
     const history = useNavigate();

     const {onOpen} = useModal()

     const {urlGeral, loggedIn, user} = useContext(UserContext)
     const isFavorite = props.isFavorite

     console.log(isFavorite)


     const calculateDifference = (createdAt: string) => {
      const createdDate = new Date(createdAt);
      const currentDate = new Date();
  
      const timeDiff = Math.abs(currentDate.getTime() - createdDate.getTime());
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
      // Calculando meses e dias
      const months = Math.floor(daysDiff / 30); // Aproximado, considerando meses com 30 dias
      const days = daysDiff % 30;
  
      let bgColor = '';
      if (months < 3) bgColor = 'bg-green-500';
      else if (months >= 3 && months < 6) bgColor = 'bg-yellow-500';
      else bgColor = 'bg-red-500';
  
      return { months, days, bgColor };
    };
  
    const { months, days, bgColor } = calculateDifference(props.created_at);

 

    return(
     
<div className="group cursor-pointer" onClick={() => {
 window.open(`/item?item_id=${props.patrimonio_id}`, '_blank');
}}>
    <div>

     <div className="relative">
     <div className="absolute  w-full  float-right z-[1] gap-2 flex justify-end p-3">
      <div className="flex gap-2 w-full justify-between ">  
      <Badge className={` text-white h-6 py-1 text-xs font-medium ${bgColor}`}>
      {months > 0
        ? `${months} ${months === 1 ? 'mês' : 'meses'} e ${days} ${days === 1 ? 'dia' : 'dias'}`
        : `${days} ${days === 1 ? 'dia' : 'dias'}`}
    </Badge>

<div className="flex gap-2 items-center">
  
<Switch
className={`group-hover:flex hidden data-[state=checked]:bg-green-500 border`}
  checked={props.verificado}
  onClick={(event) => event.stopPropagation()}
  onCheckedChange={(e) => {
    console.log('switch', !props.verificado)
    props.handlePutItem?.(props.patrimonio_id, !props.verificado)
  }}
/>


{loggedIn &&



<Button
onClick={(event) =>
{
  event.stopPropagation();
  window.open(`/dashboard/editar-item?patrimonio_id=${props.patrimonio_id}`, '_blank');
}
}
size="icon"
variant='secondary'
className="h-8 w-8 group-hover:flex hidden transition-all"
>
<Pencil size={16} />
</Button>


}


{loggedIn &&



<Button
onClick={(event) => {
  event.stopPropagation();
  props.onToggleFavorite(props.patrimonio_id)}}
size={'icon'} variant={'secondary'}

className={`  h-8 w-8 ${isFavorite ? 'bg-pink-600 hover:bg-pink-700 hover:text-white text-white dark:bg-pink-600 dark:hover:bg-pink-700 dark:hover:text-white dark:text-white' : ' '} `}// Aplica a classe de estilo condicionalmente
>
<Heart size={16} /> 
</Button>

}
</div>

</div>

      
      </div>
     </div>
    <Carousel className="w-full flex items-center ">
      <CarouselContent>
        {props.imagens?.map((item, index) => (
          <>
          
          <CarouselItem key={index}>
          <div className="">
  
            <Alert className="bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(${urlGeral}imagem/${item})` }}>
              <CardContent className="flex aspect-square  justify-end p-0">
            
              </CardContent>
            </Alert>
          </div>
        </CarouselItem></>
        ))}
      </CarouselContent>
      <div className="w-full hidden  absolute justify-between group-hover:flex p-3">
    <CarouselPrevious variant={'secondary'} />
    <CarouselNext variant={'secondary'}  />
    </div>
    </Carousel>
    </div>
  
    <div className="mt-2 flex justify-between items-center">
     <div>
     <p className="font-medium">{props.mat_nom}</p>
     <p className="text-sm text-gray-500">{props.num_patrimonio} - {props.num_verificacao}</p>
     </div>

     <div className="flex gap-2 items-center">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Eye size={16}/> {props.qtd_de_favorito}
          </div>

         
     </div>
    </div>
  </div>

    )
}