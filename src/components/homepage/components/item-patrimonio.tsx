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
  display_name:string
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
<div className="group">
    <div>
    <Carousel className="w-full flex items-center ">
      <CarouselContent>
        {props.imagens?.map((item, index) => (
          <CarouselItem key={index}>
          <div className="p-1 relative flex justify-end">
        <div className="absolute z-[9] gap-2 flex justify-end p-3">  


        <Button
onClick={() =>
  onOpen('edit-admin-item', {
    condicao: props.condicao,
    desfazimento: props.desfazimento,
    email: props.email,
    imagens: props.imagens,
    loc: props.loc,
    material: props.material,
    matricula: props.matricula,
    num_patrimonio: props.num_patrimonio,
    num_verificacao: props.num_verificacao,
    observacao: props.observacao,
    patrimonio_id: props.patrimonio_id,
    phone: props.phone,
    situacao: props.situacao,
    u_matricula: props.u_matricula,
    user_id: props.user_id,
    verificado: props.verificado,
    vitrine: props.vitrine,
    mat_nom: props.mat_nom,
    bem_cod: String(props.num_patrimonio),
    bem_dgv: String(props.num_verificacao),
    loc_nom: props.loc,
    qtd_de_favorito: props.qtd_de_favorito,
    estado_transferencia: props.estado_transferencia,
    created_at: props.created_at,
    bem_dsc_com:props.bem_dsc_com,

  
    bem_num_atm: props.bem_num_atm,
bem_serie: props.bem_serie,
bem_sta: props.bem_sta,
bem_val: props.bem_val,
csv_cod: props.csv_cod,
display_name: props.display_name,
ele_cod: props.ele_cod,
grp_cod: props.grp_cod,
ite_mar: props.ite_mar,
ite_mod: props.ite_mod,
loc_cod: props.loc_cod,
mat_cod: props.mat_cod,
org_cod: props.org_cod,
org_nom: props.org_nom,
pes_cod: props.pes_cod,
pes_nome: props.pes_nome,
sbe_cod: props.sbe_cod,
set_cod: props.set_cod,
set_nom: props.set_nom,
tgr_cod: props.tgr_cod,
tre_cod: props.tre_cod,
uge_cod: props.uge_cod,
uge_nom: props.uge_nom,
uge_siaf: props.uge_siaf
  })
}
size={'icon'} variant={'ghost'}

  className={`  h-8 w-8  `}// Aplica a classe de estilo condicionalmente
>
  <Gear size={16} /> 
</Button>


        {loggedIn &&



<Button
  onClick={() =>
    onOpen('edit-item', {
      condicao: props.condicao,
      desfazimento: props.desfazimento,
      email: props.email,
      imagens: props.imagens,
      loc: props.loc,
      material: props.material,
      matricula: props.matricula,
      num_patrimonio: props.num_patrimonio,
      num_verificacao: props.num_verificacao,
      observacao: props.observacao,
      patrimonio_id: props.patrimonio_id,
      phone: props.phone,
      situacao: props.situacao,
      u_matricula: props.u_matricula,
      user_id: props.user_id,
      verificado: props.verificado,
      vitrine: props.vitrine,
      mat_nom: props.mat_nom,
      bem_cod: String(props.num_patrimonio),
      bem_dgv: String(props.num_verificacao),
      loc_nom: props.loc,
      qtd_de_favorito: props.qtd_de_favorito,
      estado_transferencia: props.estado_transferencia,
      created_at: props.created_at,
      bem_dsc_com:props.bem_dsc_com,

    
      bem_num_atm: props.bem_num_atm,
  bem_serie: props.bem_serie,
  bem_sta: props.bem_sta,
  bem_val: props.bem_val,
  csv_cod: props.csv_cod,
  display_name: props.display_name,
  ele_cod: props.ele_cod,
  grp_cod: props.grp_cod,
  ite_mar: props.ite_mar,
  ite_mod: props.ite_mod,
  loc_cod: props.loc_cod,
  mat_cod: props.mat_cod,
  org_cod: props.org_cod,
  org_nom: props.org_nom,
  pes_cod: props.pes_cod,
  pes_nome: props.pes_nome,
  sbe_cod: props.sbe_cod,
  set_cod: props.set_cod,
  set_nom: props.set_nom,
  tgr_cod: props.tgr_cod,
  tre_cod: props.tre_cod,
  uge_cod: props.uge_cod,
  uge_nom: props.uge_nom,
  uge_siaf: props.uge_siaf
    })
  }
  size="icon"
  variant="ghost"
  className="h-8 w-8"
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

     <div className="flex gap-2 items-center">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Eye size={12}/> {props.qtd_de_favorito}
          </div>

         
     </div>
    </div></Link>
  </div>
    )
}