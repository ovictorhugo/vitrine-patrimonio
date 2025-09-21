// src/pages/vitrine/card-item-dropdown.tsx
import { Pencil, Trash, Barcode, ArrowRightLeft, User } from "lucide-react";
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
import { useContext, useState } from "react";
import { UserContext } from "../../../context/context";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { LikeButton } from "../../homepage/components/like-button";
import { Draggable } from "@hello-pangea/dnd";

/* ===== Tipos (compatíveis com a página) ===== */
type UUID = string;

interface Material { material_name: string; material_code: string; id: UUID; }
interface LegalGuardian { legal_guardians_name: string; legal_guardians_code: string; id: UUID; }

interface CatalogAsset {
  asset_code: string;
  asset_check_digit: string;
  atm_number: string;
  serial_number: string;
  asset_status: string;
  asset_value: string;
  asset_description: string;
  csv_code: string;
  accounting_entry_code: string;
  item_brand: string;
  item_model: string;
  group_type_code: string;
  group_code: string;
  expense_element_code: string;
  subelement_code: string;
  id: UUID;
  material: Material;
  legal_guardian: LegalGuardian;
  location: {
    legal_guardian_id: UUID;
    sector_id: UUID;
    location_name: string;
    location_code: string;
    id: UUID;
    sector: {
      agency_id: UUID;
      sector_name: string;
      sector_code: string;
      id: UUID;
      agency: {
        agency_name: string;
        agency_code: string;
        unit_id: UUID;
        id: UUID;
        unit: { unit_name: string; unit_code: string; unit_siaf: string; id: UUID; };
      };
    };
    legal_guardian: LegalGuardian;
  };
  is_official: boolean;
}

type WorkflowHistoryItem = {
  workflow_status: string;
  detail?: Record<string, any>;
  id: UUID;
  user: {
    id: UUID;
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
    institution_id: UUID;
  };
  catalog_id: UUID;
  created_at: string;
};

type CatalogImage = { id: UUID; catalog_id: UUID; file_path: string; };

export type CatalogEntry = {
  situation: string;
  conservation_status: string;
  description: string;
  id: UUID;
  asset: CatalogAsset;
  user: WorkflowHistoryItem["user"];
  location: CatalogAsset["location"];
  images: CatalogImage[];
  workflow_history: WorkflowHistoryItem[];
  created_at: string;
};

/** Props extras do pai (opcionais) */
type ParentActions = {
  isFavorite?: boolean;
  onToggleFavorite?: (patrimonioId: string) => void;
  handlePutItem?: (patrimonio_id: string, verificado: boolean) => Promise<void>;
  viewCount?: number;
  onPromptDelete?: () => void;
  onPromptMove?: () => void;
};

type Props = ParentActions & {
  entry: CatalogEntry;
  index: number;
};

export function CardItemDropdown({
  entry,
  index,
  onPromptDelete,
  onPromptMove,
  isFavorite,
}: Props) {
  const { urlGeral, loggedIn, user } = useContext(UserContext);
  const _isFavorite = !!isFavorite;

  const formatDateTimeBR = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }).format(d);
    } catch {
      return iso as string;
    }
  };

  const calculateDifference = (createdAt: string) => {
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

  const diff = entry.created_at ? calculateDifference(entry.created_at) : null;

  const materialNome =
    entry.asset?.material?.material_name ??
    entry.asset?.asset_description ??
    "Item";

  const assetCode = entry.asset?.asset_code ?? "";
  const assetDgv = entry.asset?.asset_check_digit ?? "";

  const buildImgUrl = (p: string) => {
    try {
      const cleanPath = p.startsWith("/") ? p.slice(1) : p;
      return `${urlGeral}${cleanPath}`;
    } catch {
      const cleanPath = p.startsWith("/") ? p.slice(1) : p;
      return `${urlGeral}${cleanPath}`;
    }
  };

  const [api, setApi] = useState<CarouselApi | null>(null);

  const qualisColor: Record<string, string> = {
    BM: "bg-green-500",
    AE: "bg-red-500",
    IR: "bg-yellow-500",
    OC: "bg-blue-500",
    RE: "bg-purple-500",
  };

  const csvCodTrimmed = (entry.asset.csv_code || "").trim();

  return (
    <Draggable draggableId={entry.id} index={index}>
      {(prov, snap) => (
        <div
          ref={prov.innerRef}
          {...prov.draggableProps}
          {...prov.dragHandleProps}
          className={` ${
            snap.isDragging ? "" : ""
          }`}
        >
          <div
            className="group cursor-pointer"
            onClick={() => {
              window.open(`/item?id=${entry.id}`, "_blank");
            }}
          >
            <div className="relative">
              {/* Barra superior (badge + ações) */}
              <div className="absolute w-full z-[1] gap-2 flex justify-end p-3">
                <div className="flex gap-2 w-full justify-between">
                  <div>
                    <div>
                      {diff && (
                        <Badge className={`text-white h-6 py-1 text-xs group-hover:hidden font-medium ${diff.bgColor}`}>
                          {diff.months > 0
                            ? `${diff.months} ${diff.months === 1 ? "mês" : "meses"} e ${diff.days} ${diff.days === 1 ? "dia" : "dias"}`
                            : `${diff.days} ${diff.days === 1 ? "dia" : "dias"}`}
                        </Badge>
                      )}

                      {diff && (
                        <Badge className={`text-white h-6 py-1 hidden group-hover:flex text-xs font-medium ${diff.bgColor}`}>
                          {formatDateTimeBR(entry.created_at)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {entry.user.id === user?.id && (
                      <Button
                        onClick={(event) => {
                          event.stopPropagation();
                          window.open(`/dashboard/editar-item?id=${entry.id}`, "_blank");
                        }}
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 group-hover:flex hidden transition-all"
                      >
                        <Pencil size={16} />
                      </Button>
                    )}


                    {entry.user.id === user?.id && (
                      <Button
                        onClick={(event) => {
                          event.stopPropagation();
                          onPromptDelete?.();
                        }}
                        className="h-8 w-8 group-hover:flex hidden transition-all"
                        variant="destructive"
                        size="icon"
                      >
                        <Trash size={16} />
                      </Button>
                    )}

                 
                  </div>
                </div>
              </div>

              {/* Imagens */}
              <Carousel className="w-full flex items-center" setApi={setApi}>
                <CarouselContent>
                  {entry.images?.map((img, indexImg) => {
                    const bg = buildImgUrl(img.file_path);
                    return (
                      <CarouselItem key={img.id ?? indexImg}>
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
                  <CarouselPrevious variant={"secondary"} />
                  <CarouselNext variant={"secondary"} />
                </div>
              </Carousel>
            </div>

            {/* Rodapé: material + código */}
            <Alert className="rounded-none p-3 flex justify-between items-center">
              <div className="w-full">
                <div className="flex mb-1 justify-between">
                  <p className="font-medium truncate">{materialNome}</p>

                  <div className="flex items-center gap-2">
                    <p className="text-sm flex items-center gap-1">
                      <Barcode size={16} /> {assetCode}
                      {assetDgv ? `-${assetDgv}` : ""}
                    </p>

                    <Avatar
                      onClick={(event) => {
                        event.stopPropagation();
                        window.open(`/user?id=${entry.user.id}`, "_blank");
                      }}
                      className="h-6 w-6 rounded-md"
                    >
                      <AvatarImage src={`${urlGeral}user/upload/${entry.user.id}/icon`} />
                      <AvatarFallback><User size={12} /></AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <p className="text-sm line-clamp-1 text-gray-500 ">
                  {entry.description}
                </p>
              </div>
            </Alert>

            <div
              className={`h-2 border rounded-b-md border-t-0 ${
                qualisColor[csvCodTrimmed as keyof typeof qualisColor] || "bg-zinc-300"
              }`}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
}
