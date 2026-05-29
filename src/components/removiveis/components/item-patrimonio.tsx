// src/pages/desfazimento/components/item-patrimonio.tsx
import React, { useContext } from "react";
import { User, Barcode } from "lucide-react";
import { Alert } from "../../ui/alert";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../ui/carousel";
import { CardContent } from "../../ui/card";
import { UserContext } from "../../../context/context";
import { Checkbox } from "../../ui/checkbox";

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
  onItemClick?: (id: string) => void;
};

export function ItemPatrimonio(props: Props) {
  const { urlGeral } = useContext(UserContext);

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

  const qualisColor: Record<string, string> = {
    BM: "bg-green-500",
    AE: "bg-red-500",
    IR: "bg-yellow-500",
    OC: "bg-blue-500",
    RE: "bg-purple-500",
  };

  const stop: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={`group cursor-pointer rounded-lg relative transition-all duration-200 border-3 ${
        props.selected ? "border-eng-blue" : "border-transparent"
      }`}
      onClick={() => props.onItemClick?.(props.id)}
    >
      <div className="absolute top-2 right-2 z-10" onClick={stop}>
        <Checkbox
          checked={props.selected}
          onCheckedChange={() => props.onItemClick?.(props.id)}
          className="h-5 w-5 bg-white data-[state=checked]:bg-eng-blue data-[state=checked]:text-white border-eng-blue border-2"
        />
      </div>

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

          {/* botões com stopPropagation para não selecionar ao clicar */}
          <div className="w-full hidden absolute justify-between group-hover:flex p-3">
            <div onClick={stop}>
              <CarouselPrevious variant="outline" />
            </div>
            <div onClick={stop}>
              <CarouselNext variant="outline" />
            </div>
          </div>
        </Carousel>
      </div>

      {/* Rodapé */}
      <Alert className="rounded-none p-3 flex justify-between items-center">
        <div className="w-full">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 mb-1 min-w-0">
            <p className="font-medium truncate min-w-0" title={materialNome}>
              {materialNome}
            </p>
            <p className="text-sm flex items-center gap-1 whitespace-nowrap shrink-0">
              <Barcode size={16} /> {assetCode}
              {assetDgv ? `-${assetDgv}` : ""}
            </p>
          </div>
          <p className="text-sm line-clamp-1 text-gray-500">
            {props.description}
          </p>
        </div>
      </Alert>

      <div
        className={`${qualisColor[props.asset.csv_code] || "bg-neutral-300"} h-2 border rounded-b-md border-0`}
      />
    </div>
  );
}
