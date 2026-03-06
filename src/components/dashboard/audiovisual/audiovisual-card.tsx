import React, { useContext } from "react";
import { Eye, Heart, Pencil, Trash, Barcode, User } from "lucide-react";
import { Alert } from "../../ui/alert";
import { Carousel, CarouselContent, CarouselItem } from "../../ui/carousel";
import { CardContent } from "../../ui/card";
import { UserContext } from "../../../context/context";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useModal } from "../../hooks/use-modal-store";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useIsMobile } from "../../../hooks/use-mobile";
import { LoanableItemDTO } from "./audiovisual";

type Props = LoanableItemDTO & {
  isImage?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (patrimonioId: string) => void;
  handlePutItem?: (patrimonio_id: string, verificado: boolean) => Promise<void>;
  viewCount?: number;
  onPromptDelete?: () => void;
  onPromptMove?: () => void;
  thumbOnly?: boolean;
};

/** Paleta para csv_code (mantém sua lógica) */
const qualisColor: Record<string, string> = {
  BM: "bg-green-500",
  AE: "bg-red-500",
  IR: "bg-yellow-500",
  OC: "bg-blue-500",
  RE: "bg-purple-500",
};

const sizes =
  "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw";

const buildImgUrl = (urlGeral: string, p: string) => {
  const clean = p.startsWith("/") ? p.slice(1) : p;
  return `${urlGeral}${clean}`;
};

const buildResponsiveSrcSet = (base: string) => {
  const add = (w: number) =>
    `${base}${base.includes("?") ? "&" : "?"}w=${w}&q=75 ${w}w`;
  return [320, 480, 640, 960, 1280].map(add).join(", ");
};

function AudiovisualCard(props: Props) {
  const { urlGeral } = useContext(UserContext);
  const { onOpen } = useModal();
  const materialNome =
    props.catalog?.asset?.material?.material_name ??
    props.catalog?.asset?.asset_description ??
    "Item";

  const assetCode = props.catalog?.asset?.asset_code ?? "";
  const assetDgv = props.catalog?.asset?.asset_check_digit ?? "";
  const csvCodTrimmed = (props.catalog?.asset?.csv_code || "").trim();

  const firstImg = props.catalog?.images?.[0];

  let firstImgSrc = "";
  let firstImgSrcSet = "";
  let firstImgPlaceholder = "";

  if (firstImg) {
    const original = buildImgUrl(urlGeral, firstImg.file_path);

    const baseForSet = props.thumbOnly
      ? `${original}${original.includes("?") ? "&" : "?"}format=jpeg`
      : original;

    firstImgSrc = baseForSet;
    firstImgSrcSet = buildResponsiveSrcSet(baseForSet);
    firstImgPlaceholder = `${baseForSet}${
      baseForSet.includes("?") ? "&" : "?"
    }w=24&q=10`;
  }

  const isMobile = useIsMobile();

  return (
    <div
      className={`group cursor-pointer rounded-md overflow-hidden`}
      onClick={() => {
        onOpen("audiovisual-modal", { ...props });
      }}
    >
      <div className="relative">
        <Carousel className="w-full flex items-center">
          <CarouselContent>
            {firstImg ? (
              <CarouselItem key={firstImg.id}>
                <div>
                  <Alert className="rounded-b-none border-b-0 p-0">
                    <CardContent className="flex aspect-square justify-end p-0">
                      <LazyLoadImage
                        src={firstImgSrc}
                        srcSet={firstImgSrcSet}
                        sizes={sizes}
                        alt={materialNome}
                        effect="blur"
                        placeholderSrc={firstImgPlaceholder}
                        width="100%"
                        height="100%"
                        wrapperClassName="w-full h-full"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        className="rounded-t-lg"
                      />
                    </CardContent>
                  </Alert>
                </div>
              </CarouselItem>
            ) : (
              <CarouselItem>
                <div>
                  <Alert className="bg-center rounded-b-none border-b-0 bg-muted">
                    <CardContent className="flex aspect-square justify-end p-0" />
                  </Alert>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
      </div>

      {isMobile ? (
        <Alert className="rounded-none p-3 flex justify-between items-center">
          <div className="w-full">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 mb-1 min-w-0">
              <p
                className="font-medium text-sm truncate min-w-0"
                title={materialNome}
              >
                {materialNome}
              </p>

              <p className="text-xs flex items-center gap-1 whitespace-nowrap shrink-0">
                <Barcode size={12} /> {assetCode}
                {assetDgv ? `-${assetDgv}` : ""}
              </p>

              <Tooltip>
                <TooltipTrigger>
                  <Avatar
                    onClick={(event) => {
                      event.stopPropagation();
                      window.open(
                        `/user?id=${props.catalog.user.id}`,
                        "_blank",
                      );
                    }}
                    className="h-5 w-5 rounded-md shrink-0"
                  >
                    <AvatarImage
                      src={`${urlGeral}user/upload/${props.catalog.user.id}/icon`}
                    />
                    <AvatarFallback>
                      <User size={10} />
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{props.catalog.user.username}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <p className="text-xs line-clamp-1 text-gray-500 ">
              {props.catalog.description}
            </p>
          </div>
        </Alert>
      ) : (
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

              <Tooltip>
                <TooltipTrigger>
                  <Avatar
                    onClick={(event) => {
                      event.stopPropagation();
                      window.open(
                        `/user?id=${props.catalog.user.id}`,
                        "_blank",
                      );
                    }}
                    className="h-6 w-6 rounded-md shrink-0"
                  >
                    <AvatarImage
                      src={`${urlGeral}user/upload/${props.catalog.user.id}/icon`}
                    />
                    <AvatarFallback>
                      <User size={12} />
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{props.catalog.user.username}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <p className="text-sm line-clamp-1 text-gray-500 ">
              {props.catalog.description}
            </p>
          </div>
        </Alert>
      )}

      <div
        className={`h-2 border rounded-b-md border-t-0 ${
          qualisColor[csvCodTrimmed as keyof typeof qualisColor] ||
          "bg-zinc-300"
        }`}
      />
    </div>
  );
}

export default AudiovisualCard;
