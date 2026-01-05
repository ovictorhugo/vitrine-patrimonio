// src/components/catalog/TransferTabCatalog.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Alert } from "../../../ui/alert";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Separator } from "../../../ui/separator";
import { toast } from "sonner";
import {
  Archive,
  MapPin,
  Users,
  ChevronRight,
  LoaderCircle,
  CheckCircle,
  Check,
  HelpCircle,
  Hourglass,
  MoveRight,
  X,
  User,
} from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../ui/carousel";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { CatalogEntry } from "../../itens-vitrine/card-item-dropdown";
import { useIsMobile } from "../../../../hooks/use-mobile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion";
import TransferModal from "../../../modal/transfer-modal";
import { useModal } from "../../../hooks/use-modal-store";

/* ===== Tipos mínimos para funcionar isolado ===== */

export const qualisColor: Record<string, string> = {
  BM: "bg-green-500",
  AE: "bg-red-500",
  IR: "bg-yellow-500",
  OC: "bg-blue-500",
  RE: "bg-purple-500",
};

export const csvCodToText: Record<string, string> = {
  BM: "Bom",
  AE: "Anti-Econômico",
  IR: "Irrecuperável",
  OC: "Ocioso",
  RE: "Recuperável",
};

type UUID = string;

type UnitDTO = {
  id: UUID;
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
};
type AgencyDTO = {
  id: UUID;
  agency_name: string;
  agency_code: string;
  unit?: UnitDTO | null;
};
type SectorDTO = {
  id: UUID;
  sector_name: string;
  sector_code: string;
  agency?: AgencyDTO | null;
  unit?: UnitDTO | null;
};
type LegalGuardianDTO = {
  id: UUID;
  legal_guardians_code: string;
  legal_guardians_name: string;
};
type LocationDTO = {
  id: UUID;
  location_name: string;
  location_code: string;
  sector?: SectorDTO | null;
  legal_guardian?: LegalGuardianDTO | null;
};
export type TransferRequestDTO = {
  id: string;
  status: string;
  user: {
    id: string;
    username: string;
    email: string;
    provider: string;
    linkedin: string;
    lattes_id: string;
    orcid: string;
    ramal: string;
    photo_url: string;
    background_url: string;
    matricula: string;
    verify: boolean;
    institution_id: string;
  };
  location: {
    legal_guardian_id: string;
    sector_id: string;
    location_name: string;
    location_code: string;
    id: string;
    sector: {
      agency_id: string;
      sector_name: string;
      sector_code: string;
      id: string;
      agency: {
        agency_name: string;
        agency_code: string;
        unit_id: string;
        id: string;
        unit: {
          unit_name: string;
          unit_code: string;
          unit_siaf: string;
          id: string;
        };
      };
    };
    legal_guardian: {
      legal_guardians_code: string;
      legal_guardians_name: string;
      id: string;
    };
  };
};
type WorkflowEvent = {
  id: UUID;
  workflow_status: string;
  created_at: string;
  transfer_requests?: TransferRequestDTO[];
};
export type CatalogResponseDTO = {
  id: UUID;
  workflow_history?: WorkflowEvent[];
};

/* ===== Utils ===== */
const chain = (loc?: LocationDTO | null) => {
  if (!loc || !loc.sector) return [];
  const s = loc.sector;
  const a = s.agency;
  const u = a?.unit ?? s.unit;
  const parts: string[] = [];
  if (u) parts.push(`${u.unit_code} - ${u.unit_name}`);
  if (a) parts.push(`${a.agency_code} - ${a.agency_name}`);
  parts.push(`${s.sector_code} - ${s.sector_name}`);
  parts.push(`${loc.location_code} - ${loc.location_name}`);
  return parts;
};

/* ===== Labels/Cores ===== */
const TRANSFER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  ACCEPTABLE: "Aceita",
  DECLINED: "Recusada",
};
const TRANSFER_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-500",
  ACCEPTABLE: "bg-green-600",
  DECLINED: "bg-red-600",
};


/* ===== Props ===== */
export interface TransferCardProps {
  catalog: CatalogEntry;
  urlGeral: string;
  token?: string;
  /** Opcional: permita o pai sincronizar o catálogo (ex.: refetch) */
  onChange?: (next: Partial<CatalogResponseDTO>) => void;
}

/* ===== Componente ===== */
export function TransferCard({
  catalog,
  urlGeral,
  onChange,
}: TransferCardProps) {
  const { onOpen } = useModal();

  // Extrai transferências apenas dos eventos com status "VITRINE"
  const initialTransfers = useMemo<TransferRequestDTO[]>(() => {
    const hist = catalog?.workflow_history ?? [];
    return hist
      .filter((ev) => ev.workflow_status === "VITRINE")
      .flatMap((ev) => ev.detail?.transfer_requests ?? []);
  }, [catalog?.workflow_history]);

  const [transfers, setTransfers] =
    useState<TransferRequestDTO[]>(initialTransfers);

  useEffect(() => {
    setTransfers(initialTransfers);
  }, [initialTransfers]);

  const [openModal, setOpenModal] = useState(false);
  const [tr_selected, setTRSelected] = useState<TransferRequestDTO>();

  const buildImgUrl = (p: string) => {
    const cleanPath = p?.startsWith("/") ? p.slice(1) : p || "";
    return `${urlGeral}${cleanPath}`;
  };

  const imageUrls = useMemo(
    () => (catalog.images || []).map((img) => buildImgUrl(img.file_path)),
    [catalog.images, urlGeral]
  );

  const asset = catalog.asset;
  if (!asset) return null;

  const materialName = asset.material?.material_name || "Sem nome";
  const isMobile = useIsMobile();

  const handleOpen = (transfer_request: TransferRequestDTO) => {
    console.log(transfer_request);
    onOpen("transfer-modal", { ...catalog, transfer_request });
  };

  return (
    <div className="space-y-4">
      <div className="flex">
        <div className={`w-2 min-w-2 rounded-l-md bg-eng-blue`} />
        <Alert className="flex-1 rounded-l-none">
          <div className="w-full">
            <div className={isMobile ? " flex-col" : "flex"}>
              {/* HEADER */}
              <div className={isMobile ? "w-full" : "max-w-[60%]"}>
                <div className="flex items-center gap-3 p-4 pb-0">
                  <div className="flex items-center gap-2 text-sm min-w-0 w-full">
                    <p className="font-semibold text-left  whitespace-nowrap shrink-0">
                      {asset.asset_code?.toString().trim()}{" "}
                      {asset.asset_check_digit
                        ? `- ${asset.asset_check_digit}`
                        : ""}
                    </p>
                    {false && (
                      <div className="min-w-0 flex-1">
                        <Badge
                          variant="outline"
                          className="truncate min-w-0"
                          title={""}
                        >
                          ATM:
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col p-4 pt-0 justify-between">
                  <div className="min-w-0">
                    <div className="text-base font-bold">{materialName}</div>
                    <p className="text-left text-xs uppercase">
                      {asset.asset_description || ""}
                    </p>
                  </div>
                </div>
              </div>
              {/* Coluna carrossel */}
              <div className="w-full">
                <Carousel className="flex gap-2 items-center p-4">
                  {/* Prev/Next com stopPropagation */}
                  <div onClick={stop}>
                    <CarouselPrevious variant="outline" />
                  </div>

                  <CarouselContent>
                    {(imageUrls.length ? imageUrls : [undefined]).map(
                      (url, index) => (
                        <CarouselItem
                          key={url ?? index}
                          className="w-full basis-1/2"
                        >
                          {/* Wrapper com tamanho consistente */}
                          <div
                            className="relative w-full aspect-square rounded-md overflow-hidden bg-muted  max-h-[100px] items-center"
                            onClick={
                              url
                                ? (e) => openImageDialog(e, url) // 🔥 abre o modal
                                : stop // se não tiver imagem, só impede propagação
                            }
                          >
                            {url ? (
                              <LazyLoadImage
                                src={url}
                                alt={materialName}
                                effect="blur"
                                width="100%"
                                height="100%"
                                wrapperClassName="absolute inset-0 h-full w-full"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                className="rounded-md"
                                draggable={false}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                                Sem imagens
                              </div>
                            )}
                          </div>
                        </CarouselItem>
                      )
                    )}
                  </CarouselContent>

                  <div onClick={stop}>
                    <CarouselNext variant="outline" />
                  </div>
                </Carousel>
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="item">
              <AccordionTrigger>Pedidos de transferências</AccordionTrigger>
              <AccordionContent>
                {transfers?.map((tr) => {
                  const requesterName =
                    tr.user?.username ||
                    tr.user?.email?.split("@")[0] ||
                    "Usuário";
                  const statusText =
                    TRANSFER_STATUS_LABEL[tr.status] ?? tr.status;
                  const color =
                    TRANSFER_STATUS_COLOR[tr.status] ?? "bg-zinc-500";
                  const cadeia = chain(tr.location);

                  if (openModal) {
                    return (
                      <TransferModal
                        catalog={catalog}
                        transfer_request={tr_selected}
                      />
                    );
                  } else
                    return (
                      <>
                        <Separator className="my-3" />
                        <div
                          className=" px-8 pb-4 transition delay-150 duration-300 ease-in-out  hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded"
                          onClick={() => handleOpen(tr)}
                        >
                          <div
                            key={tr.id}
                            className="flex flex-wrap items-start justify-between gap-3 py-4"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="size-4" />
                              <p className="text-muted-foreground">
                                Solicitante:{" "}
                                <span className="text-foreground font-medium">
                                  {requesterName}
                                </span>
                              </p>
                              <Badge className={`text-white ${color}`}>
                                {statusText}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <MapPin className="size-4" />
                              <p className="text-sm font-semibold uppercase">
                                Destino:
                              </p>
                              {cadeia.length ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  {cadeia.map((p, i) => (
                                    <div
                                      key={i}
                                      className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2"
                                    >
                                      {i > 0 && <ChevronRight size={14} />}
                                      {p}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  Local não informado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    );
                })}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Alert>
      </div>
    </div>
  );
}

export default TransferCard;
