import { Eye, Heart, Pencil, Trash, Repeat, Barcode, ArrowRightLeft, Calendar, User } from "lucide-react";
import { Button } from "../../ui/button";
import { Alert } from "../../ui/alert";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../ui/carousel";
import { CardContent } from "../../ui/card";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";
import { Badge } from "../../ui/badge";
import { Switch } from "../../ui/switch";
import { LikeButton } from "./like-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useModal } from "../../hooks/use-modal-store";
import { CatalogEntry } from "../../dashboard/itens-vitrine/card-item-dropdown";
import { usePermissions } from "../../permissions";
import { useNavigate } from "react-router-dom";

/* ========= Básicos ========= */
export interface Unit {
  id: string;
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
}

export interface Agency {
  id: string;
  agency_name: string;
  agency_code: string;
  unit_id: string;
  unit: Unit;
}

export interface Sector {
  id: string;
  sector_name: string;
  sector_code: string;
  agency_id: string;
  agency: Agency;
}

export interface LegalGuardian {
  id: string;
  legal_guardians_name: string;
  legal_guardians_code: string;
}

export interface Material {
  id: string;
  material_name: string;
  material_code: string;
}

/* ========= Usuário ========= */
export interface User {
  id: string;
  username: string;
  email: string;
  provider: string;
  linkedin: string | null;
  lattes_id: string | null;
  orcid: string | null;
  ramal: string | null;
  photo_url: string | null;
  background_url: string | null;
  matricula: string | null;
  verify: boolean;
  institution_id: string;
}

/* ========= Inventário por Local ========= */
export interface Inventory {
  key: string;
  avaliable: boolean; // (sic) segue o JSON
  id: string;
  created_by: User;
}

export interface LocationInventory {
  id: string;
  assets: string[];          // lista de IDs/códigos em string
  inventory: Inventory;
  filled: boolean;
}

/* ========= Local ========= */
export interface Location {
  id: string;
  location_name: string;
  location_code: string;
  sector_id: string;
  legal_guardian_id: string;
  sector: Sector;
  legal_guardian: LegalGuardian;
  location_inventories: LocationInventory[];
}

/* ========= Patrimônio (Asset) ========= */
export interface Asset {
  id: string;
  asset_code: string;
  asset_check_digit: string;
  atm_number: string | null;
  serial_number: string | null;
  asset_status: string;
  asset_value: string;
  asset_description: string;
  csv_code: string;
  accounting_entry_code: string;
  item_brand: string | null;
  item_model: string | null;
  group_type_code: string;
  group_code: string;
  expense_element_code: string;
  subelement_code: string;
  is_official: boolean;

  material: Material;
  legal_guardian: LegalGuardian;
  location: Location;
}

/* ========= Mídias ========= */
export interface Image {
  id: string;
  catalog_id: string;
  file_path: string;
}

/* ========= Transferência ========= */
export interface TransferRequest {
  id: string;
  status: string;
  user: User;
  location: Location;
}

/* ========= Histórico de Workflow ========= */
export interface WorkflowHistory {
  id: string;
  workflow_status: string;
  detail: Record<string, unknown>; // aceita qualquer payload
  catalog_id: string;
  user: User;
  transfer_requests: TransferRequest[];
  created_at: string; // ISO
}

/* ========= Catálogo ========= */

/* ========= Payload do endpoint ========= */
export interface CatalogEntriesResponse {
  catalog_entries: CatalogEntry[];
}

/** Props extras: o filho só dispara os diálogos do pai */
type Props = CatalogEntry & {
  isFavorite?: boolean;
  onToggleFavorite?: (patrimonioId: string) => void;
  handlePutItem?: (patrimonio_id: string, verificado: boolean) => Promise<void>;
  viewCount?: number;
  onPromptDelete?: () => void;  // abre diálogo de deletar no pai
  onPromptMove?: () => void;    // abre diálogo de movimentar no pai
/** NOVO: controle externo do slide */
 // notifica o pai quando o usuário troca
};


export function ItemPatrimonio(props: Props) {
  const { urlGeral, loggedIn, user } = useContext(UserContext);
  const isFavorite = !!props.isFavorite;

  const formatDateTimeBR = (iso?: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
 
      // exemplo: 18/09/2025 12:37
    }).format(d);
  } catch {
    return iso;
  }
};


  const calculateDifference = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDiff = Math.abs(currentDate.getTime() - createdDate.getTime());
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const months = Math.floor(daysDiff / 30); // aproximação
    const days = daysDiff % 30;

    let bgColor = "";
    if (months < 3) bgColor = "bg-green-700";
    else if (months < 6) bgColor = "bg-yellow-500";
    else bgColor = "bg-red-500";

    return { months, days, bgColor };
  };

  const diff = props.created_at ? calculateDifference(props.created_at) : null;

  const materialNome =
    props.asset?.material?.material_name ??
    props.asset?.asset_description ??
    "Item";

  const assetCode = props.asset?.asset_code ?? "";
  const assetDgv = props.asset?.asset_check_digit ?? "";

  const buildImgUrl = (p: string) => {
    try {
      const cleanPath = p.startsWith("/") ? p.slice(1) : p;
      return `${urlGeral}${cleanPath}`;
    } catch {
      const cleanPath = p.startsWith("/") ? p.slice(1) : p;
      return `${urlGeral}${cleanPath}`;
    }
  };

   // Embla API para controlar o carrossel
   const [api, setApi] = useState<CarouselApi | null>(null);


 
     
  const qualisColor: Record<string, string> = {
    BM: "bg-green-500",
    AE: "bg-red-500",
    IR: "bg-yellow-500",
    OC: "bg-blue-500",
    RE: "bg-purple-500",
  };
  

 const csvCodTrimmed = (props.asset.csv_code || "").trim();

 const {onOpen} = useModal()

 const {hasCatalogo} = usePermissions()

// verifica se o primeiro workflow da lista é REVIEW_VITRINE
const workflowReview =
  (Array.isArray(props.workflow_history) &&
   props.workflow_history.length > 0 &&
   props.workflow_history[0].workflow_status === "REVIEW_REQUESTED_DESFAZIMENTO") 
   || props.workflow_history[0].workflow_status === "REVIEW_REQUESTED_VITRINE"
   || props.workflow_history[0].workflow_status === "ADJUSTMENT_VITRINE"
   || props.workflow_history[0].workflow_status === "ADJUSTMENT_DESFAZIMENTO"

   const workflowAnunciados =
  (Array.isArray(props.workflow_history) &&
   props.workflow_history.length > 0 &&
   props.workflow_history[0].workflow_status === "VITRINE") 

const navigate = useNavigate();

  return (
    <div
      className="group cursor-pointer"
      onClick={() => {
       onOpen('catalog-modal', {...props})
      }}
    >
      <div className="relative">
        {/* Barra superior (badge + ações) */}
        <div className="absolute w-full z-[1] gap-2 flex justify-end p-3">
          <div className="flex gap-2 w-full justify-between">
            {/* Badge de tempo (se houver created_at) */}
           <div>
          <div>
                {diff && (
              <Badge className={`text-white h-6 py-1 text-xs  group-hover:hidden font-medium ${diff.bgColor}`}>
                {diff.months > 0
                  ? `${diff.months} ${diff.months === 1 ? "mês" : "meses"} e ${diff.days} ${diff.days === 1 ? "dia" : "dias"}`
                  : `${diff.days} ${diff.days === 1 ? "dia" : "dias"}`}
              </Badge>
            )}

             {diff && (
              <Badge className={`text-white h-6 py-1 hidden group-hover:flex text-xs font-medium ${diff.bgColor}`}>
                    {formatDateTimeBR(props.created_at)}
              </Badge>
            )}

         
          </div>


           </div>
            <div className="flex gap-2 items-center">
              {/* Editar (somente dono) */}
           {((((props.user.id === user?.id) || hasCatalogo) && workflowReview) && (props.onPromptDelete)) && (
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                      navigate(`/dashboard/editar-item?id=${props.id}`);
                  }}
                  size="icon"
                  variant='outline'
                  className="h-8 w-8 group-hover:flex hidden transition-all"
                >
                  <Pencil size={16} />
                </Button>
              )}

           
              {/* Deletar (somente dono) */}
              {((((props.user.id === user?.id) || hasCatalogo) && workflowReview) && (props.onPromptDelete)) && (
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onPromptDelete?.();
                  }}
                  className="h-8 w-8 group-hover:flex hidden transition-all"
                  variant="destructive"
                  size="icon"
                >
                  <Trash size={16} />
                </Button>
              )}

              {/* Favoritar (opcional) */}
              {(loggedIn && workflowAnunciados) && (
                <div onClick={(e) => e.stopPropagation()}>
                  <LikeButton id={props.id} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Imagens */}
        <Carousel
          className="w-full flex items-center"
        >
          <CarouselContent>
            {props.images?.map((img, index) => {
              const bg = buildImgUrl(img.file_path);
              return (
                <CarouselItem key={img.id ?? index}>
                  <div>
                    <Alert
                      className="bg-center rounded-b-none border-b-0 bg-cover bg-no-repeat"
                      style={{ backgroundImage: `url(${bg})` }}
                    >
                      <CardContent className="flex aspect-square justify-end p-0" />
                    </Alert>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <div className="w-full hidden absolute justify-between group-hover:flex p-3">
            <CarouselPrevious variant={'outline'} />
            <CarouselNext variant={'outline'} />
          </div>
        </Carousel>
      </div>

      {/* Rodapé: material + código */}
      <Alert className="rounded-none p-3 flex justify-between items-center">
        <div className="w-full">
     <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 mb-1 min-w-0">
      {/* Título: único que pode encolher */}
      <p
        className="font-medium truncate min-w-0"
        title={materialNome}
      >
        {materialNome}
      </p>

      {/* Código patrimonial: não encolhe nem quebra */}
      <p className="text-sm flex items-center gap-1 whitespace-nowrap shrink-0">
        <Barcode size={16} /> {assetCode}{assetDgv ? `-${assetDgv}` : ""}
      </p>

      {/* Avatar: não encolhe */}
      

      <Tooltip>
  <TooltipTrigger>
    <Avatar
        onClick={(event) => {
          event.stopPropagation();
          window.open(`/user?id=${props.user.id}`, "_blank");
        }}
        className="h-6 w-6 rounded-md shrink-0"
      >
        <AvatarImage src={`${urlGeral}user/upload/${props.user.id}/icon`} />
        <AvatarFallback><User size={12} /></AvatarFallback>
      </Avatar>
  </TooltipTrigger>
  <TooltipContent>
    <p>{props.user.username}</p>
  </TooltipContent>
</Tooltip>
    </div>
          <p className="text-sm line-clamp-1 text-gray-500 ">
          {props.description}
          </p>
        
        </div>

    
      </Alert>
      <div className={`h-2 border rounded-b-md border-t-0 ${
                qualisColor[csvCodTrimmed as keyof typeof qualisColor] || "bg-zinc-300"
              }`}></div>
    </div>
  );
}
