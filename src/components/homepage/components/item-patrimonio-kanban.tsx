import {
  Pencil,
  Trash,
  Barcode,
  User as UserIcon,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Alert } from "../../ui/alert";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../ui/carousel";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import { CardContent } from "../../ui/card";
import React, { useContext } from "react";
import { UserContext } from "../../../context/context";
import { Badge } from "../../ui/badge";
import { LikeButton } from "./like-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useModal } from "../../hooks/use-modal-store";
import { CatalogEntry } from "../../dashboard/itens-vitrine/card-item-dropdown";
import { usePermissions } from "../../permissions";
import { useNavigate } from "react-router-dom";

type Props = CatalogEntry & {
  isImage: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (patrimonioId: string) => void;
  handlePutItem?: (patrimonio_id: string, verificado: boolean) => Promise<void>;
  viewCount?: number;
  onPromptDelete?: () => void;
  onPromptMove?: () => void;
  thumbOnly?: boolean; // opcional, usado na geração da thumb
};

export function ItemPatrimonioKanban(props: Props) {
  const { urlGeral, loggedIn, user } = useContext(UserContext);
  const { onOpen } = useModal();
  const { hasCatalogo } = usePermissions();
  const navigate = useNavigate();

  const formatDateTimeBR = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return iso || "";
    }
  };

  const calculateDifference = (createdAt?: string) => {
    if (!createdAt) return null;
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDiff = Math.abs(currentDate.getTime() - createdDate.getTime());
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const months = Math.floor(daysDiff / 30);
    const days = daysDiff % 30;

    let bgColor = "";
    if (months < 3) bgColor = "bg-green-700";
    else if (months < 6) bgColor = "bg-yellow-500";
    else bgColor = "bg-red-500";
    return { months, days, bgColor };
  };

  const diff = calculateDifference(props.created_at);

  const materialNome =
    props.asset?.material?.material_name ??
    props.asset?.asset_description ??
    "Item";

  const assetCode = props.asset?.asset_code ?? "";
  const assetDgv = props.asset?.asset_check_digit ?? "";

  /** Constrói URL absoluta da imagem a partir do file_path */
  const buildImgUrl = (p: string) => {
    const cleanPath = p?.startsWith("/") ? p.slice(1) : p;
    return `${urlGeral}${cleanPath}`;
  };

  const buildResponsiveSrcSet = (base: string) => {
    const add = (w: number) =>
      `${base}${base.includes("?") ? "&" : "?"}w=${w}&q=75 ${w}w`;
    return [320, 480, 640, 960, 1280].map(add).join(", ");
  };

  const sizes =
    "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw";

  const qualisColor: Record<string, string> = {
    BM: "bg-green-500",
    AE: "bg-red-500",
    IR: "bg-yellow-500",
    OC: "bg-blue-500",
    RE: "bg-purple-500",
  };

  const csvCodTrimmed = (props.asset.csv_code || "").trim();

  const firstStatus = props.workflow_history?.[0]?.workflow_status ?? "";
  const workflowReview = [
    "REVIEW_REQUESTED_DESFAZIMENTO",
    "REVIEW_REQUESTED_VITRINE",
    "ADJUSTMENT_VITRINE",
    "ADJUSTMENT_DESFAZIMENTO",
    "REJEITADOS_COMISSAO"
  ].includes(firstStatus);
  const workflowAnunciados = firstStatus === "VITRINE";

  const firstImg = props.images?.[0];

  let firstImgSrc = "";
  let firstImgSrcSet = "";
  let firstImgPlaceholder = "";

  if (firstImg) {
    const original = buildImgUrl(firstImg.file_path);

    // Se tiver 'thumbOnly', tente apontar para uma rota de miniatura do backend
    const baseForSet = props.thumbOnly
      ? `${original}${original.includes("?") ? "&" : "?"}format=jpeg`
      : original;

    firstImgSrc = baseForSet;
    firstImgSrcSet = buildResponsiveSrcSet(baseForSet);
    firstImgPlaceholder = `${baseForSet}${
      baseForSet.includes("?") ? "&" : "?"
    }w=24&q=10`;
  }

  // ---- helpers de classe para "abrir" via hover OU via isImage ----
  const openOnHoverAndIsImage =
    "group-hover:max-h-[640px] group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto";
  const closedBase = "max-h-0 opacity-0 -translate-y-2 pointer-events-none";
  const openBase = "max-h-[640px] opacity-100 translate-y-0 pointer-events-auto";

  // estado "aberto" quando isImage = true; senão, hover abre.
  const carouselStateClasses = [
    "overflow-hidden rounded-t-lg",
    "transition-[opacity,transform,max-height] rounded-t-lg duration-300 ease-out",
    props.isImage ? openBase : closedBase,
    openOnHoverAndIsImage,
  ].join(" ");

  // badges: quando isImage = true, mostra SEMPRE o de data (estado "hover"),
  // e esconde o de tempo. Quando isImage = false, alterna por hover.
  const timeBadgeClasses = [
    "text-white h-6 py-1 text-xs font-medium",
    diff?.bgColor ?? "",
    "transition-opacity duration-200",
    props.isImage ? "group-hover:hidden" : "hidden",
  ].join(" ");

  const dateBadgeClasses = [
    "text-white h-6 py-1 text-xs font-medium",
    diff?.bgColor ?? "",
    "transition-opacity duration-200",
    props.isImage ? "group-hover:block hidden" : "hidden group-hover:block",
  ].join(" ");

  // footer rounded: quando aberto (isImage ou hover), rounded-none; caso contrário, rounded-md
  const footerAlertClasses = [
    "p-3 flex justify-between items-center transition-[border-radius] duration-300",
    props.isImage ? "rounded-none" : "rounded-md rounded-b-none group-hover:rounded-none",
  ].join(" ");

    const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = React.useRef(false);

  React.useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);
  const handleClick = (event: React.MouseEvent) => {
    // Não abre o modal se estiver sendo arrastado ou se o evento foi prevenido
    if (event.defaultPrevented || isDraggingRef.current) return;
    event.stopPropagation();
    
    // Adiciona um pequeno delay para garantir que não é um drag
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        onOpen("catalog-modal", { ...props });
      }
    }, 100);
  };

  const handleMouseDown = () => {
    isDraggingRef.current = false;
  };

  const handleMouseMove = () => {
    isDraggingRef.current = true;
  };

  const handleMouseUp = () => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 150);
  };

  return (
    <div
      className="group cursor-pointer"
    onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="relative">
        {/* Barra superior (badge + ações) */}
        <div className="absolute w-full z-[1] gap-2 flex justify-end p-3">
          <div className="flex gap-2 w-full justify-between">
            <div className="w-fit">
              {diff && (
                <>
                  <Badge className={timeBadgeClasses}>
                    {diff.months > 0
                      ? `${diff.months} ${
                          diff.months === 1 ? "mês" : "meses"
                        } e ${diff.days} ${
                          diff.days === 1 ? "dia" : "dias"
                        }`
                      : `${diff.days} ${
                          diff.days === 1 ? "dia" : "dias"
                        }`}
                  </Badge>

                  <Badge className={dateBadgeClasses}>
                    {formatDateTimeBR(props.created_at)}
                  </Badge>
                </>
              )}
            </div>

            <div className="flex gap-2 items-center">
              {(((props.user.id === user?.id) || hasCatalogo) &&
                workflowReview &&
                props.onPromptDelete) && (
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/dashboard/editar-item?id=${props.id}`);
                  }}
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 hidden group-hover:flex transition-all"
                >
                  <Pencil size={16} />
                </Button>
              )}

              {(((props.user.id === user?.id) || hasCatalogo) &&
                workflowReview &&
                props.onPromptDelete) && (
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onPromptDelete?.();
                  }}
                  className="h-8 w-8 hidden group-hover:flex transition-all"
                  variant="destructive"
                  size="icon"
                >
                  <Trash size={16} />
                </Button>
              )}

              {loggedIn && workflowAnunciados && (
                <div onClick={(e) => e.stopPropagation()}>
                  <LikeButton id={props.id} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CARROSSEL: aparece no hover OU quando isImage=true */}
        {firstImg && (
          <div className={carouselStateClasses}>
            <Carousel className="w-full rounded-t-lg flex items-center">
              {/* Se no futuro for usar várias imagens, basta mapear CarouselItem aqui */}
              <Alert className="rounded-b-none rounded-t-lg border-b-0 p-0">
                <CardContent className="flex aspect-square justify-end p-0 rounded-t-lg">
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
            </Carousel>
          </div>
        )}
      </div>

      {/* Rodapé: material + código + avatar */}
      <Alert className={footerAlertClasses}>
        <div className="w-full">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 mb-1 min-w-0">
            <p className="font-medium truncate min-w-0" title={materialNome}>
              {materialNome}
            </p>

            <p className="text-sm flex items-center gap-1 whitespace-nowrap shrink-0">
              <Barcode size={16} />{" "}
              {assetCode}
              {assetDgv ? `-${assetDgv}` : ""}
            </p>

            <Tooltip>
              <TooltipTrigger>
                <Avatar
                  onClick={(event) => {
                    event.stopPropagation();
                    window.open(`/user?id=${props.user.id}`, "_blank");
                  }}
                  className="h-6 w-6 rounded-md shrink-0"
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

        <div className="relative">
            <p className="text-sm line-clamp-1 relative text-gray-500">
            {props.description}
          </p>
        </div>
        </div>
      </Alert>

      <div
        className={`h-2 border rounded-b-md border-t-0 ${
          qualisColor[csvCodTrimmed as keyof typeof qualisColor] ||
          "bg-zinc-300"
        }`}
      />
    </div>
  );
}
