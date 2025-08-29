import { Eye, Heart, Pencil, Trash, Repeat, Barcode } from "lucide-react";
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

/* ===== Tipos (compatíveis com o Block) ===== */
interface Unit { id: string; unit_name: string; unit_code: string; unit_siaf: string; }
interface Agency { id: string; agency_name: string; agency_code: string; unit_id: string; unit: Unit; }
interface Sector { id: string; sector_name: string; sector_code: string; agency_id: string; agency: Agency; }
interface Location { id: string; location_name: string; location_code: string; sector_id: string; sector: Sector; }
interface Material { id: string; material_name: string; material_code: string; }
interface LegalGuardian { id: string; legal_guardians_name: string; legal_guardians_code: string; }
interface Asset {
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
  material?: Material;
  legal_guardian?: LegalGuardian;
  location?: Location;
}
interface User {
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
interface Image { id: string; catalog_id: string; file_path: string; }
interface WorkflowHistory {
  id: string;
  workflow_status: string;
  catalog_id: string;
  user_id: string;
  detail: { message: string };
}
interface CatalogEntry {
  id: string;
  situation: string;
  conservation_status: string;
  description: string;
  asset: Asset;
  user: User;
  location: Location;
  images: Image[];
  workflow_history: WorkflowHistory[];
  created_at?: string;
}

/** Props extras: o filho só dispara os diálogos do pai */
type Props = CatalogEntry & {
  isFavorite?: boolean;
  onToggleFavorite?: (patrimonioId: string) => void;
  handlePutItem?: (patrimonio_id: string, verificado: boolean) => Promise<void>;
  viewCount?: number;
  onPromptDelete: () => void;  // abre diálogo de deletar no pai
  onPromptMove: () => void;    // abre diálogo de movimentar no pai
/** NOVO: controle externo do slide */
currentSlide?: number;                  // índice atual vindo do pai
onSlideChange?: (index: number) => void; // notifica o pai quando o usuário troca
};

export function ItemPatrimonio(props: Props) {
  const { urlGeral, loggedIn, user } = useContext(UserContext);
  const isFavorite = !!props.isFavorite;

  const calculateDifference = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDiff = Math.abs(currentDate.getTime() - createdDate.getTime());
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const months = Math.floor(daysDiff / 30); // aproximação
    const days = daysDiff % 30;

    let bgColor = "";
    if (months < 3) bgColor = "bg-green-500";
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

   // Quando o usuário troca de slide, avisar o pai
   useEffect(() => {
     if (!api) return;
 
     const emit = () => {
       const idx = api.selectedScrollSnap();
       props.onSlideChange?.(idx);
     };
 
     api.on("select", emit);
     // chama uma vez para sincronizar na montagem
     emit();
     return () => {
       api.off("select", emit);
     };
   }, [api, props]);
 
   // Se o pai mandar um índice diferente, forçar o carrossel a ir para lá
   useEffect(() => {
     if (api == null) return;
     if (typeof props.currentSlide !== "number") return;
     // scrollTo silencioso/sem animação pode usar jump (dependendo da sua versão do embla)
   
   }, [api, props.currentSlide]);
 

  return (
    <div
      className="group cursor-pointer"
      onClick={() => {
        window.open(`/item?id=${props.id}`, "_blank");
      }}
    >
      <div className="relative">
        {/* Barra superior (badge + ações) */}
        <div className="absolute w-full z-[1] gap-2 flex justify-end p-3">
          <div className="flex gap-2 w-full justify-between">
            {/* Badge de tempo (se houver created_at) */}
           <div>
           {diff && (
              <Badge className={`text-white h-6 py-1 text-xs font-medium ${diff.bgColor}`}>
                {diff.months > 0
                  ? `${diff.months} ${diff.months === 1 ? "mês" : "meses"} e ${diff.days} ${diff.days === 1 ? "dia" : "dias"}`
                  : `${diff.days} ${diff.days === 1 ? "dia" : "dias"}`}
              </Badge>
            )}

           </div>
            <div className="flex gap-2 items-center">
              {/* Editar (somente dono) */}
              {(props.user.id === user?.id) && (
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    window.open(`/dashboard/editar-item?id=${props.id}`, "_blank");
                  }}
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 group-hover:flex hidden transition-all"
                >
                  <Pencil size={16} />
                </Button>
              )}

              {/* Movimentar (somente dono) */}
              {(props.user.id === user?.id) && (
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onPromptMove();
                  }}
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 group-hover:flex hidden transition-all"
                >
                  <Repeat size={16} />
                </Button>
              )}

              {/* Deletar (somente dono) */}
              {(props.user.id === user?.id) && (
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onPromptDelete();
                  }}
                  className="h-8 w-8 group-hover:flex hidden transition-all"
                  variant="destructive"
                  size="icon"
                >
                  <Trash size={16} />
                </Button>
              )}

              {/* Favoritar (opcional) */}
              {loggedIn && (
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
          setApi={setApi}
          // Opcionalmente garantir o índice inicial na 1ª montagem:
          opts={{ startIndex: props.currentSlide ?? 0 }}
        >
          <CarouselContent>
            {props.images?.map((img, index) => {
              const bg = buildImgUrl(img.file_path);
              return (
                <CarouselItem key={img.id ?? index}>
                  <div>
                    <Alert
                      className="bg-center bg-cover bg-no-repeat"
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
            <CarouselPrevious variant={"secondary"} />
            <CarouselNext variant={"secondary"} />
          </div>
        </Carousel>
      </div>

      {/* Rodapé: material + código */}
      <div className="mt-2 flex justify-between items-center">
        <div>
          <p className="font-medium truncate">{materialNome}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
          <Barcode size={16}/>  {assetCode}{assetDgv ? `-${assetDgv}` : ""}
          </p>
        </div>

        {/* Contagem (opcional) */}
        {typeof props.viewCount === "number" && (
          <div className="flex gap-2 items-center">
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Eye size={16} /> {props.viewCount}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
