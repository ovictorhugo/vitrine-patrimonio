// src/pages/desfazimento/components/item-patrimonio.tsx
import { Eye, User, Barcode } from "lucide-react";
import { Alert } from "../../../ui/alert";
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "../../../ui/carousel";
import { CardContent } from "../../../ui/card";
import { useContext } from "react";
import { UserContext } from "../../../../context/context";
import { Badge } from "../../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";

export interface CatalogEntry {
  id: string;
  description: string;
  created_at?: string;
  images: { id: string; file_path: string }[];
  user: { id: string };
  asset: {
    asset_code: string;
    asset_check_digit: string;
    csv_code: string;
    asset_description: string;
    item_brand: string | null;
    item_model: string | null;
    material: { material_name: string };
  };
}

type Props = CatalogEntry & {
  selected?: boolean;
  onItemClick?: (e: React.MouseEvent) => void;
};

export function ItemPatrimonio(props: Props) {
  const { urlGeral } = useContext(UserContext);

  const formatDateTimeBR = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(d);
    } catch { return iso; }
  };

  const materialNome =
    props.asset?.material?.material_name ??
    props.asset?.asset_description ??
    "Item";

  const assetCode = props.asset?.asset_code ?? "";
  const assetDgv = props.asset?.asset_check_digit ?? "";

  const buildImgUrl = (p: string) => {
    const cleanPath = p.startsWith("/") ? p.slice(1) : p;
    return `${urlGeral}${cleanPath}`;
  };

  return (
    <div className="group cursor-pointer relative" onClick={props.onItemClick}>
      {/* selecionado */}
      {props.selected && (
        <div className="absolute -top-2 left-2 z-[2]">
          <Badge className="bg-blue-600 text-white h-6 py-1 text-xs font-medium">Selecionado</Badge>
        </div>
      )}

      <div className="relative">
        {/* Imagens */}
        <Carousel className="w-full flex items-center">
          <CarouselContent>
            {(props.images ?? []).map((img, idx) => {
              const bg = buildImgUrl(img.file_path);
              return (
                <CarouselItem key={img.id ?? idx}>
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
            <CarouselPrevious variant="outline" />
            <CarouselNext variant="outline" />
          </div>
        </Carousel>
      </div>

      {/* Rodapé */}
      <Alert className={`rounded-none p-3 flex justify-between items-center ${props.selected ? "ring-2 ring-blue-600" : ""}`}>
        <div className="w-full">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 mb-1 min-w-0">
            <p className="font-medium truncate min-w-0" title={materialNome}>
              {materialNome}
            </p>
            <p className="text-sm flex items-center gap-1 whitespace-nowrap shrink-0">
              <Barcode size={16} /> {assetCode}{assetDgv ? `-${assetDgv}` : ""}
            </p>
            <Avatar className="h-6 w-6 rounded-md shrink-0">
              <AvatarImage src={`${urlGeral}user/upload/${props.user.id}/icon`} />
              <AvatarFallback><User size={12} /></AvatarFallback>
            </Avatar>
          </div>
          <p className="text-sm line-clamp-1 text-gray-500">{props.description}</p>
        </div>
      </Alert>
      <div className="h-2 border rounded-b-md border-t-0 bg-zinc-300" />
    </div>
  );
}
