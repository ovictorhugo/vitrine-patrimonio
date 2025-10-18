// PatrimonioItemCollection.tsx
import { Alert } from "../../../ui/alert";
import {
  Archive, HelpCircle, Hourglass, MoveRight, User, X, Check, Loader2,
  RefreshCcw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { useContext, useMemo, useState, MouseEvent, useCallback } from "react";
import { useModal } from "../../../hooks/use-modal-store";
import { UserContext } from "../../../../context/context";
import { CatalogEntry } from "../../../homepage/components/item-patrimonio";
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "../../../ui/carousel";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../../ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "../../../ui/toggle-group";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { toast } from "sonner";

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

type Props = {
  invId: string;
  entry: CatalogEntry;

  // 👇 novos props para update
  collectionId: string;     // /collections/{collection_id}
  itemId: string;           // /items/{item_id}

  // valores iniciais vindos do pai
  sel: string;              // "true" | "false"
  comm: string;

  isLocked?: boolean;

  // callback para atualizar o item no estado do pai sem refetch
  onUpdated?: (patch: { status?: boolean; comment?: string }) => void;

  // legados (não usados mais, mantidos por compat se houver chamadas antigas)
  onStatusChange?: (value: string) => void;
  onCommentChange?: (value: string) => void;
};

export function PatrimonioItemComission({
  entry,
  collectionId,
  itemId,
  sel,
  comm,
  isLocked,
  onUpdated,
}: Props) {
  if (!entry) return null;

  const { onOpen } = useModal();
  const { urlGeral } = useContext(UserContext);

  const conectee = import.meta.env.VITE_BACKEND_CONECTEE || "";
  const asset = entry.asset;
  if (!asset) return null;

  const csvCodTrimmed = (asset.csv_code || "").toString().trim();
  const bemStaTrimmed = (asset.asset_status || "").toString().trim();

  const statusMap: Record<string, { text: string; icon: JSX.Element }> = {
    NO: { text: "Normal", icon: <Check size={12} /> },
    NI: { text: "Não inventariado", icon: <HelpCircle size={12} /> },
    CA: { text: "Cadastrado", icon: <Archive size={12} /> },
    TS: { text: "Aguardando aceite", icon: <Hourglass size={12} /> },
    MV: { text: "Movimentado", icon: <MoveRight size={12} /> },
    BX: { text: "Baixado", icon: <X size={12} /> },
  };

  const statusInfo = statusMap[bemStaTrimmed];
  const materialName = asset.material?.material_name || "Sem nome";
  const legalGuardianName = asset.legal_guardian?.legal_guardians_name || "";
  const hasAtm =
    !!(asset.atm_number && asset.atm_number !== "None" && asset.atm_number !== "");

  const buildImgUrl = (p: string) => {
    const cleanPath = p?.startsWith("/") ? p.slice(1) : p || "";
    return `${urlGeral}${cleanPath}`;
  };

  // =========== estado local de edição ===========
  const [statusValue, setStatusValue] = useState<"true" | "false">(sel === "true" ? "true" : "false");
  const [commentValue, setCommentValue] = useState<string>(comm ?? "");

  // =========== dialog imagem ===========
  const [openImage, setOpenImage] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const openImageDialog = (e: MouseEvent, url: string) => {
    e.stopPropagation();
    setSelectedImg(url);
    setOpenImage(true);
  };
  const stop = (e: MouseEvent) => e.stopPropagation();

  // abre modal patrimônio (card)
  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onOpen("patrimonio", { ...entry });
  };

  // urls das imagens
  const imageUrls = useMemo(
    () => (entry.images || []).map((img) => buildImgUrl(img.file_path)),
    [entry.images, urlGeral]
  );

  // =========== PUT atualizar ===========
  const [updating, setUpdating] = useState(false);

  const handleUpdate = useCallback(async (e: MouseEvent) => {
    e.stopPropagation();

    if (!collectionId || !itemId) {
      toast("IDs insuficientes para atualizar.");
      return;
    }

    try {
      setUpdating(true);

      const token = localStorage.getItem("jwt_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const payload = {
        status: statusValue === "true",
        comment: commentValue ?? "",
      };

      const url = `${urlGeral}collections/${encodeURIComponent(collectionId)}/items/${encodeURIComponent(itemId)}`;
      const res = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Falha ao atualizar (HTTP ${res.status}).`);
      }

      // sucesso — atualiza o pai localmente (sem refetch)
      onUpdated?.(payload);

      toast.success("Item atualizado com sucesso.");
    } catch (err: any) {
      toast("Erro ao atualizar item", { description: err?.message || String(err) });
    } finally {
      setUpdating(false);
    }
  }, [collectionId, itemId, statusValue, commentValue, onUpdated, urlGeral]);

  return (
    <>
      <div className="flex group cursor-pointer" onClick={handleOpen}>
        {/* Barra colorida */}
        <div
          className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${
            qualisColor[csvCodTrimmed] || "bg-neutral-300"
          } min-h-full relative`}
        />

        {/* Card */}
        <div className="w-full">
          <Alert className="rounded-l-none items-center p-0 flex w-full rounded-b-none border-b-0">
            {/* Coluna info */}
            <div className="flex-1 min-w-0">
              {/* HEADER */}
              <div className="flex items-center gap-3 p-4 pb-0">
                <div className="flex items-center gap-2 mb-4 min-w-0 w-full">
                  <p className="font-semibold text-left whitespace-nowrap shrink-0">
                    {asset.asset_code?.toString().trim()} - {asset.asset_check_digit}
                  </p>

                  {hasAtm && (
                    <div className="min-w-0 flex-1">
                      <Badge
                        variant="outline"
                        className="truncate min-w-0"
                        title={asset.atm_number || ""}
                      >
                        ATM: {asset.atm_number}
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
                            src={`${conectee}ResearcherData/Image?name=${encodeURIComponent(
                              legalGuardianName
                            )}`}
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
                  {/* Prev/Next com stopPropagation */}
                  <div onClick={stop}>
                    <CarouselPrevious variant="outline" />
                  </div>

                  <CarouselContent>
                    {(imageUrls.length ? imageUrls : [undefined]).map((url, index) => (
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
                              onClick={(e) => openImageDialog(e, url)}
                              draggable={false}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                              Sem imagens
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  <div onClick={stop}>
                    <CarouselNext variant="outline" />
                  </div>
                </Carousel>
              </div>
            </div>
          </Alert>

          {/* Barra de edição (status/comment + atualizar) */}
          <Alert className="rounded-t-none rounded-l-none dark:bg-neutral-800/50 bg-neutral-100/50">
            <div className="flex gap-2 items-center h-full whitespace-nowrap flex-wrap">
              <p>Condição:</p>

              <ToggleGroup
                type="single"
                value={statusValue}
                onValueChange={(v) => v && setStatusValue(v as "true" | "false")}
                className="flex gap-2"
                variant={"outline"}
              >
                <ToggleGroupItem       onClick={stop} className="w-10 h-10 bg-green-700 text-white" value="true" aria-label="OK">
                  <Check size={16} />
                </ToggleGroupItem>
                <ToggleGroupItem       onClick={stop} className="w-10 h-10 bg-red-700 text-white" value="false" aria-label="Com problema">
                  <X size={16} />
                </ToggleGroupItem>
              </ToggleGroup>

              <Input
                placeholder="Observações"
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                className="min-w-[220px] flex-1"
                disabled={isLocked}
                onClick={stop}
              />

              <Button
                onClick={handleUpdate}
                disabled={updating || isLocked}
                variant='outline'
              >
                {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
             <RefreshCcw size={16}/>   Atualizar
              </Button>
            </div>
          </Alert>
        </div>
      </div>

      {/* Dialog de imagem */}
      <Dialog open={openImage} onOpenChange={setOpenImage}>
        <DialogContent className="max-w-5xl P-0" onClick={stop}>
         
          <div className="w-full">
            <div className="relative w-full max-h-[80vh]">
              {selectedImg ? (
                <img
                  src={selectedImg}
                  alt="Imagem do patrimônio"
                  className="mx-auto max-h-[75vh] w-auto object-contain"
                  draggable={false}
                />
              ) : (
                <div className="p-8 text-center text-sm text-gray-500">
                  Nenhuma imagem selecionada
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
