import React, { useContext, useMemo, useState } from "react";
import { Eye, Heart, Pencil, Trash, Barcode, User } from "lucide-react";
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
import { UserContext } from "../../../context/context";
import { Badge } from "../../ui/badge";
import { LikeButton } from "./like-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useModal } from "../../hooks/use-modal-store";
import { CatalogEntry } from "../../dashboard/itens-vitrine/card-item-dropdown";
import { usePermissions } from "../../permissions";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

/** ========= Tipagens herdadas ========= */
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

export interface UserT {
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

export interface Inventory {
  key: string;
  avaliable: boolean;
  id: string;
  created_by: UserT;
}

export interface LocationInventory {
  id: string;
  assets: string[];
  inventory: Inventory;
  filled: boolean;
}

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

export interface Image {
  id: string;
  catalog_id: string;
  file_path: string;
}

export interface TransferRequest {
  id: string;
  status: string;
  user: UserT;
  location: Location;
}

export interface WorkflowHistory {
  id: string;
  workflow_status: string;
  detail: Record<string, unknown>;
  catalog_id: string;
  user: UserT;
  transfer_requests: TransferRequest[];
  created_at: string;
}

export interface CatalogEntriesResponse {
  catalog_entries: CatalogEntry[];
}

/** Props do card (herda do CatalogEntry) + extras */
type Props = CatalogEntry & {
  isFavorite?: boolean;
  onToggleFavorite?: (patrimonioId: string) => void;
  handlePutItem?: (patrimonio_id: string, verificado: boolean) => Promise<void>;
  viewCount?: number;
  onPromptDelete?: () => void;
  onPromptMove?: () => void;
  /** Otimizações durante drag: */
  thumbOnly?: boolean;   // usa miniaturas (seu backend puder fornecer)
  noImages?: boolean;    // não renderiza imagens (clone do DnD)
  /** Seleção visual externa (coluna/expandido) */
  selected?: boolean;
};

/** Util: datas BR */
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

/** Gera variantes responsivas caso seu backend aceite query de redimensionamento (?w=, ?q=) */
const buildResponsiveSrcSet = (base: string) => {
  // se o backend aceitar `?w=` e `?q=`, use:
  const add = (w: number) => `${base}${base.includes("?") ? "&" : "?"}w=${w}&q=75 ${w}w`;
  return [320, 480, 640, 960, 1280].map(add).join(", ");
};
const sizes =
  "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw";

/** Constrói URL absoluta da imagem a partir do file_path */
const buildImgUrl = (urlGeral: string, p: string) => {
  const clean = p.startsWith("/") ? p.slice(1) : p;
  return `${urlGeral}${clean}`;
};

/** Paleta para csv_code (mantém sua lógica) */
const qualisColor: Record<string, string> = {
  BM: "bg-green-500",
  AE: "bg-red-500",
  IR: "bg-yellow-500",
  OC: "bg-blue-500",
  RE: "bg-purple-500",
};

function ItemPatrimonioBase(props: Props) {
  const { urlGeral, loggedIn, user } = useContext(UserContext);
  const { onOpen } = useModal();
  const { hasCatalogo } = usePermissions();
  const navigate = useNavigate();

  const isFavorite = !!props.isFavorite;
  const diff = useMemo(() => calculateDifference(props.created_at), [props.created_at]);

  const materialNome =
    props.asset?.material?.material_name ??
    props.asset?.asset_description ??
    "Item";

  const assetCode = props.asset?.asset_code ?? "";
  const assetDgv = props.asset?.asset_check_digit ?? "";
  const csvCodTrimmed = (props.asset.csv_code || "").trim();

  // Workflows (mesma lógica original)
  const firstStatus = props.workflow_history?.[0]?.workflow_status ?? "";
  const workflowReview =
    firstStatus === "REVIEW_REQUESTED_DESFAZIMENTO" ||
    firstStatus === "REVIEW_REQUESTED_VITRINE" ||
    firstStatus === "ADJUSTMENT_VITRINE" ||
    firstStatus === "ADJUSTMENT_DESFAZIMENTO";

  const workflowAnunciados = firstStatus === "VITRINE";

  // Embla API opcional (caso precise controlar externamente)
  const [api, setApi] = useState<CarouselApi | null>(null);

  // Borda de seleção (quando usado na visão com multiseleção)
  const selectedClass = props.selected ? "ring-2 ring-primary" : "";

  return (
    <div
      className={`group cursor-pointer rounded-md overflow-hidden ${selectedClass}`}
      onClick={() => {
        onOpen("catalog-modal", { ...props });
      }}
    >
      <div className="relative">
        {/* Barra superior (badge + ações) */}
        <div className="absolute w-full z-[1] gap-2 flex justify-end p-3">
          <div className="flex gap-2 w-full justify-between">
            {/* Badge de tempo */}
            <div>
              {diff && (
                <>
                  <Badge
                    className={`text-white h-6 py-1 text-xs group-hover:hidden font-medium ${diff.bgColor}`}
                  >
                    {diff.months > 0
                      ? `${diff.months} ${diff.months === 1 ? "mês" : "meses"} e ${diff.days} ${diff.days === 1 ? "dia" : "dias"}`
                      : `${diff.days} ${diff.days === 1 ? "dia" : "dias"}`}
                  </Badge>

                  <Badge
                    className={`text-white h-6 py-1 hidden group-hover:flex text-xs font-medium ${diff.bgColor}`}
                  >
                    {formatDateTimeBR(props.created_at)}
                  </Badge>
                </>
              )}
            </div>

            <div className="flex gap-2 items-center">
              {/* Editar (somente dono ou permissão) */}
              {(((props.user.id === user?.id) || hasCatalogo) && workflowReview) && (
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/dashboard/editar-item?id=${props.id}`);
                  }}
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 group-hover:flex hidden transition-all"
                >
                  <Pencil size={16} />
                </Button>
              )}

              {/* Deletar (somente dono ou permissão) */}
              {(((props.user.id === user?.id) || hasCatalogo) && workflowReview) && props.onPromptDelete && (
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

              {/* Favoritar (apenas Vitrine) */}
              {(loggedIn && workflowAnunciados) && (
                <div onClick={(e) => e.stopPropagation()}>
                  <LikeButton id={props.id} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== Imagens com otimização ===== */}
        <Carousel className="w-full flex items-center" setApi={setApi}>
          <CarouselContent>
            {/* Clone/drag: não renderiza imagens */}
            {props.noImages ? (
              <CarouselItem>
                <div>
                  <Alert className="bg-center rounded-b-none border-b-0 bg-muted">
                    <CardContent className="flex aspect-square justify-end p-0" />
                  </Alert>
                </div>
              </CarouselItem>
            ) : (
              (props.images ?? []).map((img, index) => {
                const original = buildImgUrl(urlGeral, img.file_path);

                // Se tiver 'thumbOnly', tente apontar para uma rota de miniatura do seu backend (ajuste conforme sua API):
                const baseForSet = props.thumbOnly
                  ? `${original}${original.includes("?") ? "&" : "?"}format=jpeg`
                  : original;

                const srcSet = buildResponsiveSrcSet(baseForSet);

                return (
                  <CarouselItem key={img.id ?? index}>
                    <div>
                      <Alert className="rounded-b-none border-b-0 p-0">
                        <CardContent className="flex aspect-square justify-end p-0">
                          <LazyLoadImage
                            src={baseForSet}
                            srcSet={srcSet}
                            sizes={sizes}
                            alt={materialNome}
                            effect="blur"
                            placeholderSrc={`${baseForSet}${baseForSet.includes("?") ? "&" : "?"}w=24&q=10`}
                            width="100%"
                            height="100%"
                            wrapperClassName="w-full h-full"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </CardContent>
                      </Alert>
                    </div>
                  </CarouselItem>
                );
              })
            )}
          </CarouselContent>

          <div className="w-full hidden absolute justify-between group-hover:flex p-3">
            <CarouselPrevious variant="outline" />
            <CarouselNext variant="outline" />
          </div>
        </Carousel>
      </div>

      {/* Rodapé: material + código + avatar */}
      <Alert className="rounded-none p-3 flex justify-between items-center">
        <div className="w-full">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 mb-1 min-w-0">
            <p className="font-medium truncate min-w-0" title={materialNome}>
              {materialNome}
            </p>

            <p className="text-sm flex items-center gap-1 whitespace-nowrap shrink-0">
              <Barcode size={16} /> {assetCode}{assetDgv ? `-${assetDgv}` : ""}
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

      <div
        className={`h-2 border rounded-b-md border-t-0 ${
          qualisColor[csvCodTrimmed as keyof typeof qualisColor] || "bg-zinc-300"
        }`}
      />
    </div>
  );
}

/** Evita re-render desnecessário durante o drag */
export const ItemPatrimonio = React.memo(ItemPatrimonioBase, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.selected === next.selected &&
    prev.noImages === next.noImages &&
    prev.thumbOnly === next.thumbOnly &&
    prev.asset?.asset_code === next.asset?.asset_code &&
    prev.asset?.asset_check_digit === next.asset?.asset_check_digit &&
    (prev.images?.[0]?.file_path ?? "") === (next.images?.[0]?.file_path ?? "")
  );
});
