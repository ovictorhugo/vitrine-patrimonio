// src/pages/desfazimento/components/item-patrimonio.tsx
import React, { useContext, useEffect, useRef } from "react";
import { Eye, User, Barcode } from "lucide-react";
import { Alert } from "../../../ui/alert";
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "../../../ui/carousel";
import { CardContent } from "../../../ui/card";
import { UserContext } from "../../../../context/context";
import { Badge } from "../../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
// ⬇️ hook do seu modal
import { useModal } from "../../../hooks/use-modal-store";

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
  onItemClick?: (e: React.MouseEvent) => void; // seleção no clique simples (pai controla)
};

export function ItemPatrimonio(props: Props) {
  const { urlGeral } = useContext(UserContext);
  const { onOpen } = useModal();

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

  // ======= Clique simples x duplo clique =======
  const clickTimerRef = useRef<number | null>(null);
  const CLICK_DELAY = 200; // ajuste fino se quiser

  const handleRootClick: React.MouseEventHandler = (e) => {
    if (clickTimerRef.current !== null) {
      // Double-click: cancela single e abre modal
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      onOpen("catalog-modal", { ...props });
      return;
    }
    // Single-click: agenda seleção
    clickTimerRef.current = window.setTimeout(() => {
      clickTimerRef.current = null;
      props.onItemClick?.(e);
    }, CLICK_DELAY);
  };

  useEffect(() => {
    return () => {
      if (clickTimerRef.current !== null) {
        window.clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
    };
  }, []);

  const stop: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={`group cursor-pointer rounded-lg relative ${props.selected ? "border-2 border-eng-blue" : ""}`}
      onClick={handleRootClick}
    >
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

      <div
        className={`${qualisColor[props.asset.csv_code] || "bg-neutral-300"} h-2 border rounded-b-md border-t-0`}
      />
    </div>
  );
}
