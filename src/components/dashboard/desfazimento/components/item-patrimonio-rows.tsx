// src/pages/desfazimento/components/item-patrimonio-rows.tsx
import React, { useContext, useEffect, useRef } from "react";
import {
  Archive,
  Check,
  HelpCircle,
  Hourglass,
  MoveRight,
  User,
  X,
} from "lucide-react";
import { Alert } from "../../../ui/alert";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { CardContent } from "../../../ui/card";
import { UserContext } from "../../../../context/context";
import { AssetDTO } from "../../sala/visao-sala";
// ⬇️ importa o hook do seu modal
import { useModal } from "../../../hooks/use-modal-store";
import { useIsMobile } from "../../../../hooks/use-mobile";

export interface CatalogEntry {
  id: string;
  description: string;
  created_at?: string;
  images: { id: string; file_path: string }[];
  user: { id: string };
  asset: AssetDTO;
}

type Props = CatalogEntry & {
  selected?: boolean;
  onItemClick?: (e: React.MouseEvent) => void; // single-click para seleção (vem do pai)
};

// Paleta e rótulos (ajuste se necessário)
const qualisColor: Record<string, string> = {
  BM: "bg-green-500",
  AE: "bg-red-500",
  IR: "bg-yellow-500",
  OC: "bg-blue-500",
  RE: "bg-purple-500",
};

const csvCodToText: Record<string, string> = {
  BM: "Bom",
  AE: "A Encaminhar",
  IR: "Irrecuperável",
  OC: "Ocioso",
  RE: "Recuperável",
};

export function ItemPatrimonioRows(props: Props) {
  const { urlGeral } = useContext(UserContext);
  const { onOpen } = useModal();

  const asset = props.asset ?? ({} as Props["asset"]);
  const materialName =
    asset?.material?.material_name || asset?.asset_description || "Item";

  const bemStaTrimmed = (asset.asset_status || "").toString().trim();

  const statusMap: Record<string, { text: string; icon: JSX.Element }> = {
    NO: { text: "Normal", icon: <Check size={12} /> },
    NI: { text: "Não inventariado", icon: <HelpCircle size={12} /> },
    CA: { text: "Cadastrado", icon: <Archive size={12} /> },
    TS: { text: "Aguardando aceite", icon: <Hourglass size={12} /> },
    MV: { text: "Movimentado", icon: <MoveRight size={12} /> },
    BX: { text: "Baixado", icon: <X size={12} /> },
  };

  const csvCodTrimmed = (asset?.csv_code || "").toString().trim();
  const legalGuardianName = asset.legal_guardian?.legal_guardians_name;
  const statusInfo = statusMap[bemStaTrimmed];

  const buildImgUrl = (p?: string) => {
    if (!p) return undefined;
    const cleanPath = p.startsWith("/") ? p.slice(1) : p;
    return `${urlGeral}${cleanPath}`;
  };

  const imageUrls = (props.images ?? [])
    .map((i) => buildImgUrl(i.file_path))
    .filter(Boolean) as string[];

  const stop: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // ======= Clique simples x duplo clique =======
  const clickTimerRef = useRef<number | null>(null);
  const CLICK_DELAY = 200; // ms — ajuste fino se quiser

  const handleRowClick: React.MouseEventHandler = (e) => {
    // se já houver um timer pendente, é double-click
    if (clickTimerRef.current !== null) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;

      // abre o modal com os dados do item
      onOpen("catalog-modal", { ...props });
      return;
    }

    // inicia o timer para tratar como single-click
    clickTimerRef.current = window.setTimeout(() => {
      clickTimerRef.current = null;
      props.onItemClick?.(e); // seleção
    }, CLICK_DELAY);
  };

  // limpa timer quando componente desmontar (higiene)
  useEffect(() => {
    return () => {
      if (clickTimerRef.current !== null) {
        window.clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
    };
  }, []);

  // estilo de borda/realce quando selecionado
  const selectedCls = props.selected ? "border-2 border-eng-blue" : "";
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div
        className={`flex group cursor-pointer rounded-lg ${selectedCls}`}
        onClick={handleRowClick}
      >
        {/* Barra colorida */}
        <div
          className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${
            qualisColor[csvCodTrimmed] || "bg-neutral-300"
          } min-h-full relative`}
        />

        {/* Card */}
        <div>
          <Alert className="rounded-l-none items-center p-0 pb-3 flex w-full">
            <div className="w-full">
              {/* HEADER */}
              <div className="flex items-center gap-3 p-4 pb-0">
                <div className="flex items-center gap-2 text-sm min-w-0 w-full">
                  <p className="font-semibold text-left  whitespace-nowrap shrink-0">
                    {asset.asset_code?.toString().trim()}{" "}
                    {asset.asset_check_digit
                      ? `- ${asset.asset_check_digit}`
                      : ""}
                  </p>

                  {/* ATM placeholder (ligue quando existir no payload) */}
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
              <div className="min-w-0">
                {/* BODY */}
                <div className="flex flex-col p-4 pt-0 justify-between">
                  <div className="min-w-0">
                    <div className="text-base font-bold">{materialName}</div>
                    <p className="text-left text-xs uppercase">
                      {asset.asset_description || ""}
                    </p>

                    <div className="flex text-sm flex-wrap gap-1 min-w-0">
                      {!!csvCodTrimmed && (
                        <div className="text-xs text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                          <div
                            className={`w-4 h-4 rounded-md ${
                              qualisColor[csvCodTrimmed] || "bg-neutral-300"
                            }`}
                          />
                          <p> {csvCodToText[csvCodTrimmed] || csvCodTrimmed}</p>
                        </div>
                      )}

                      {statusInfo && (
                        <div className="text-xs text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                          {statusInfo.icon}
                          {statusInfo.text}
                        </div>
                      )}

                      {!!legalGuardianName && (
                        <div className="flex gap-1 items-center min-w-0">
                          <Avatar className="rounded-md h-5 w-5 shrink-0">
                            <AvatarImage
                              className="rounded-md h-5 w-5"
                              src={`${urlGeral}user/upload/${asset.legal_guardian?.id}/icon`}
                            />
                            <AvatarFallback className="flex items-center justify-center">
                              <User size={10} />
                            </AvatarFallback>
                          </Avatar>

                          <p
                            className="text-xs text-gray-500 dark:text-gray-300 font-normal flex-1 min-w-0 truncate"
                            title={legalGuardianName}
                          >
                            {legalGuardianName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna carrossel */}
              <div className="pl-4 pr-4">
                <Carousel className="flex gap-2 items-center">
                  <div onClick={stop}>
                    <CarouselPrevious variant="outline" />
                  </div>

                  <CarouselContent>
                    {(imageUrls.length ? imageUrls : [undefined]).map(
                      (url, index) => (
                        <CarouselItem
                          key={url ?? index}
                          className="w-full basis-1/3"
                        >
                          <div
                            className="relative h-[150px] rounded-md overflow-hidden bg-muted flex items-center justify-center"
                            onClick={stop}
                          >
                            {url ? (
                              <img
                                src={url}
                                alt={`Imagem ${index + 1}`}
                                className="h-full w-full object-contain"
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
          </Alert>
        </div>
      </div>
    );
  } else {
    return (
      <div
        className={`flex group cursor-pointer rounded-lg ${selectedCls}`}
        onClick={handleRowClick}
      >
        {/* Barra colorida */}
        <div
          className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${
            qualisColor[csvCodTrimmed] || "bg-neutral-300"
          } min-h-full relative`}
        />

        {/* Card */}
        <div className="w-full">
          <Alert className="rounded-l-none items-center p-0 flex w-full">
            {/* Coluna info */}
            <div className="flex-1 min-w-0">
              {/* HEADER */}
              <div className="flex items-center gap-3 p-4 pb-0">
                <div className="flex items-center gap-2 mb-4 min-w-0 w-full">
                  <p className="font-semibold text-left whitespace-nowrap shrink-0">
                    {asset.asset_code?.toString().trim()}{" "}
                    {asset.asset_check_digit
                      ? `- ${asset.asset_check_digit}`
                      : ""}
                  </p>

                  {/* ATM placeholder (ligue quando existir no payload) */}
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

              {/* BODY */}
              <div className="flex flex-col p-4 pt-0 justify-between">
                <div className="min-w-0">
                  <div className="text-lg mb-2 font-bold">{materialName}</div>
                  <p className="text-left mb-4 uppercase">
                    {asset.asset_description || ""}
                  </p>

                  <div className="flex flex-wrap gap-3 min-w-0">
                    {!!csvCodTrimmed && (
                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                        <div
                          className={`w-4 h-4 rounded-md ${
                            qualisColor[csvCodTrimmed] || "bg-neutral-300"
                          }`}
                        />
                        {csvCodToText[csvCodTrimmed] || csvCodTrimmed}
                      </div>
                    )}

                    {statusInfo && (
                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                        {statusInfo.icon}
                        {statusInfo.text}
                      </div>
                    )}

                    {!!legalGuardianName && (
                      <div className="flex gap-1 items-center min-w-0">
                        <Avatar className="rounded-md h-5 w-5 shrink-0">
                          <AvatarImage
                            className="rounded-md h-5 w-5"
                            src={`${urlGeral}user/upload/${asset.legal_guardian?.id}/icon`}
                          />
                          <AvatarFallback className="flex items-center justify-center">
                            <User size={10} />
                          </AvatarFallback>
                        </Avatar>

                        <p
                          className="text-sm text-gray-500 dark:text-gray-300 font-normal flex-1 min-w-0 truncate"
                          title={legalGuardianName}
                        >
                          {legalGuardianName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna carrossel */}
            <div className="p-4 w-full flex-1 max-w-[600px]">
              <div className="w-full select-none">
                <Carousel className="w-full flex gap-4 items-center">
                  {/* Prev/Next com stopPropagation (não queremos que cliques no nav disparem seleção) */}
                  <div onClick={stop}>
                    <CarouselPrevious variant="outline" />
                  </div>

                  <CarouselContent>
                    {(imageUrls.length ? imageUrls : [undefined]).map(
                      (url, index) => (
                        <CarouselItem
                          key={url ?? index}
                          className="w-full sm:basis-full lg:basis-1/2 xl:basis-1/3"
                        >
                          {/* Wrapper com tamanho consistente */}
                          <div
                            className="relative w-full aspect-square rounded-md overflow-hidden bg-muted"
                            onClick={stop}
                          >
                            {url ? (
                              <Alert
                                style={{ backgroundImage: `url(${url})` }}
                                className="absolute inset-0 h-full w-full object-cover bg-center bg-cover bg-no-repeat"
                                draggable={false}
                              >
                                <CardContent className="p-0 m-0" />
                              </Alert>
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
          </Alert>
        </div>
      </div>
    );
  }
}
