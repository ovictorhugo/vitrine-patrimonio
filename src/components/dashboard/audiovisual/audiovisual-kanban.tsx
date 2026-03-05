import { Pencil, Trash, Barcode, User as UserIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { Alert } from "../../ui/alert";
import { Carousel } from "../../ui/carousel";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import { CardContent } from "../../ui/card";
import React, { useContext } from "react";
import { UserContext } from "../../../context/context";
import { LikeButton } from "../../homepage/components/like-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useModal } from "../../hooks/use-modal-store";
import { CatalogEntry } from "../itens-vitrine/card-item-dropdown";
import { usePermissions } from "../../permissions";
import { useNavigate } from "react-router-dom";

type Props = CatalogEntry & {
  isImage?: boolean; // Mantido como opcional para não quebrar o arquivo pai
  isFavorite?: boolean;
  onToggleFavorite?: (patrimonioId: string) => void;
  handlePutItem?: (patrimonio_id: string, verificado: boolean) => Promise<void>;
  viewCount?: number;
  onPromptDelete?: () => void;
  onPromptMove?: () => void;
  thumbOnly?: boolean;
};

export function AudiovisualKanban(props: Props) {
  const { urlGeral, loggedIn, user } = useContext(UserContext);
  const { onOpen } = useModal();
  const { hasCatalogo } = usePermissions();
  const navigate = useNavigate();

  const materialNome =
    props.asset?.material?.material_name ??
    props.asset?.asset_description ??
    "Item";
  const assetCode = props.asset?.asset_code ?? "";
  const assetDgv = props.asset?.asset_check_digit ?? "";

  const firstStatus = props.workflow_history?.[0]?.workflow_status ?? "";
  const workflowReview = [
    "REVIEW_REQUESTED_DESFAZIMENTO",
    "REVIEW_REQUESTED_VITRINE",
    "ADJUSTMENT_VITRINE",
    "ADJUSTMENT_DESFAZIMENTO",
    "REJEITADOS_COMISSAO",
  ].includes(firstStatus);
  const workflowAnunciados = firstStatus === "VITRINE";

  const firstImg = props.images?.[0];
  let firstImgSrc = "";
  let firstImgSrcSet = "";
  let firstImgPlaceholder = "";

  if (firstImg) {
    const original = `${urlGeral}${firstImg.file_path?.startsWith("/") ? firstImg.file_path.slice(1) : firstImg.file_path}`;
    const baseForSet = props.thumbOnly
      ? `${original}${original.includes("?") ? "&" : "?"}format=jpeg`
      : original;

    firstImgSrc = baseForSet;
    firstImgSrcSet = [320, 480, 640, 960, 1280]
      .map(
        (w) =>
          `${baseForSet}${baseForSet.includes("?") ? "&" : "?"}w=${w}&q=75 ${w}w`,
      )
      .join(", ");
    firstImgPlaceholder = `${baseForSet}${baseForSet.includes("?") ? "&" : "?"}w=24&q=10`;
  }

  // Apenas um clique limpo e direto para abrir o modal
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen("audiovisual-modal", { ...props });
  };

  return (
    <div
      className="group cursor-pointer relative transition-all"
      onClick={handleClick}
    >
      {/* Botões de Ação (Aparecem no hover) */}
      <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {(props.user.id === user?.id || hasCatalogo) &&
          workflowReview &&
          props.onPromptDelete && (
            <>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/editar-item?id=${props.id}`);
                }}
                size="icon"
                variant="outline"
                className="h-8 w-8"
              >
                <Pencil size={16} />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onPromptDelete?.();
                }}
                size="icon"
                variant="destructive"
                className="h-8 w-8"
              >
                <Trash size={16} />
              </Button>
            </>
          )}
        {loggedIn && workflowAnunciados && (
          <div onClick={(e) => e.stopPropagation()}>
            <LikeButton id={props.id} />
          </div>
        )}
      </div>

      {firstImg && (
        <div className="max-h-0 opacity-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-[640px] group-hover:opacity-100 rounded-t-lg">
          <Carousel className="w-full flex items-center">
            <Alert className="rounded-b-none rounded-t-lg border-b-0 p-0 w-full">
              <CardContent className="flex aspect-square justify-end p-0 rounded-t-lg">
                <LazyLoadImage
                  src={firstImgSrc}
                  srcSet={firstImgSrcSet}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  alt={materialNome}
                  effect="blur"
                  placeholderSrc={firstImgPlaceholder}
                  className="rounded-t-lg object-cover w-full h-full"
                  wrapperClassName="w-full h-full"
                />
              </CardContent>
            </Alert>
          </Carousel>
        </div>
      )}

      {/* Rodapé Sempre Visível */}
      <Alert className="p-3 flex justify-between items-center rounded-md rounded-b-none group-hover:rounded-t-none transition-all duration-300">
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
              <TooltipTrigger asChild>
                <Avatar
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/user?id=${props.user.id}`, "_blank");
                  }}
                  className="h-6 w-6 rounded-md shrink-0 hover:ring-2 hover:ring-primary transition-all"
                >
                  <AvatarImage
                    src={`${urlGeral}user/upload/${props.user.id}/icon`}
                  />
                  <AvatarFallback>
                    <UserIcon size={12} />
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{props.user.username}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Alert>

      {/* Linha Azul na base */}
      <div className="h-2 border rounded-b-md border-t-0 bg-eng-blue" />
    </div>
  );
}
