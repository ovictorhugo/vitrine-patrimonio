// src/pages/desfazimento/components/PatrimonioItemCollection.tsx
import { Alert } from "../../../ui/alert";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import {
  Archive,
  HelpCircle,
  Hourglass,
  MoveRight,
  User,
  X,
  Check,
  Loader2,
  RefreshCcw,
  Trash,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { useContext, useMemo, useState, useCallback } from "react";
import { useModal } from "../../../hooks/use-modal-store";
import { UserContext } from "../../../../context/context";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../ui/dialog";
import { Checkbox } from "../../../ui/checkbox";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { toast } from "sonner";
import { ArrowUUpLeft } from "phosphor-react";
import { CatalogEntry } from "../../itens-vitrine/card-item-dropdown";
import { usePermissions } from "../../../permissions";
import { useIsMobile } from "../../../../hooks/use-mobile";

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

  // novos props para operações da collection
  collectionId: string;
  itemId: string;

  // valores iniciais vindos do pai
  sel: string; // "true" | "false"
  comm: string;

  isLocked?: boolean;

  // callback para atualizar o item no estado do pai sem refetch
  onUpdated?: (patch: { status?: boolean; comment?: string }) => void;

  onDeleted?: (deletedId: string) => void;

  selected?: boolean;
  onItemClick?: (id: string) => void;

  // legados (não usados mais, mantidos por compat se houver chamadas antigas)
  onStatusChange?: (value: string) => void;
  onCommentChange?: (value: string) => void;
};

export function PatrimonioItemCollection({
  invId,
  entry,
  collectionId,
  itemId,
  sel,
  comm,
  isLocked,
  onUpdated,
  onDeleted,
  selected,
  onItemClick,
}: Props) {
  const { onOpen } = useModal();
  const { urlGeral } = useContext(UserContext);
  const { hasColecoes } = usePermissions();

  if (!entry) return null;

  const conectee = import.meta.env.VITE_BACKEND_CONECTEE || "";
  const asset = entry.asset;
  if (!asset) return null;

  const csvCodTrimmed = (asset.csv_code || "").toString().trim();
  const bemStaTrimmed = (asset.asset_status || "").toString().trim();

  const statusMap: Record<
    string,
    {
      text: string;
      icon: React.ReactNode;
    }
  > = {
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
  const hasAtm = !!(
    asset.atm_number &&
    asset.atm_number !== "None" &&
    asset.atm_number !== ""
  );

  const buildImgUrl = (p: string) => {
    const cleanPath = p?.startsWith("/") ? p.slice(1) : p || "";
    return `${urlGeral}${cleanPath}`;
  };

  // =========== estado local de edição ===========
  const [statusValue, setStatusValue] = useState<"true" | "false">(
    sel === "true" ? "true" : "false",
  );
  const [commentValue, setCommentValue] = useState<string>(comm ?? "");

  // =========== dialog imagem ===========
  const [openImage, setOpenImage] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const openImageDialog = (e: any, url: string) => {
    e.stopPropagation();
    setSelectedImg(url);
    setOpenImage(true);
  };

  const stop = (e: any) => e.stopPropagation();

  // abre modal patrimônio (card)
  const handleOpen = (event: any) => {
    event.stopPropagation();
    onOpen("catalog-modal", { ...entry });
  };

  // urls das imagens
  const imageUrls = useMemo(
    () => (entry.images || []).map((img) => buildImgUrl(img.file_path)),
    [entry.images, urlGeral],
  );

  // =========== PUT atualizar ===========
  const [updating, setUpdating] = useState(false);

  const handleUpdate = useCallback(
    async (e: any) => {
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

        const url = `${urlGeral}collection_items/${encodeURIComponent(
          collectionId,
        )}/${encodeURIComponent(itemId)}`;
        const res = await fetch(url, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
        let errorMessage = "Falha ao atualizar.";
        try {
          const errorData = await res.json();
          if (errorData?.detail) errorMessage = errorData.detail;
        } catch {}
        toast.error("Erro", { description: errorMessage });
        return;
      }

        // sucesso — atualiza o pai localmente (sem refetch)
        onUpdated?.(payload);

        toast.success("Item atualizado com sucesso.");
      } catch (err: any) {
        toast("Erro ao atualizar item", {
          description: err?.message || String(err),
        });
      } finally {
        setUpdating(false);
      }
    },
    [collectionId, itemId, statusValue, commentValue, onUpdated, urlGeral],
  );

  // =========== DELETE item da coleção ===========
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(
    async (e: any) => {
      e.stopPropagation();

      if (!collectionId || !itemId) {
        toast("IDs insuficientes para deletar.");
        return;
      }

      try {
        setDeleting(true);

        const token = localStorage.getItem("jwt_token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const url = `${urlGeral}collection_items/${encodeURIComponent(
          collectionId,
        )}/${encodeURIComponent(itemId)}`;
        const res = await fetch(url, {
          method: "DELETE",
          headers,
        });

        if (!res.ok) {
        let errorMessage = "Falha ao deletar.";
        try {
          const errorData = await res.json();
          if (errorData?.detail) errorMessage = errorData.detail;
        } catch {}
        toast.error("Erro", { description: errorMessage });
        return;
      }

        toast.success("Item removido da coleção.");
        setDeleteOpen(false);

        // ✅ sinaliza para o pai remover da lista, passando o id correto do CollectionItem
        onDeleted?.(itemId);
      } catch (err: any) {
        toast("Erro ao deletar item", {
          description: err?.message || String(err),
        });
      } finally {
        setDeleting(false);
      }
    },
    [collectionId, itemId, onDeleted, urlGeral],
  );

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        <div 
          className={`group cursor-pointer rounded-lg relative transition-all duration-200 border-2 ${
            sel === "true" ? "border-green-500" : selected ? "border-eng-blue" : "border-transparent"
          }`}
          onClick={(e) => {
             if (sel === "true") return;
             if (onItemClick) {
                 e.stopPropagation();
                 onItemClick(invId);
             } else {
                 handleOpen(e);
             }
          }}
        >
          {sel !== "true" && (
            <div className="absolute top-2 right-2 z-10 flex gap-2 items-center" onClick={stop}>
              <Checkbox 
                checked={selected} 
                onCheckedChange={() => onItemClick?.(invId)}
                className="h-5 w-5 bg-white data-[state=checked]:bg-eng-blue data-[state=checked]:text-white"
              />
            </div>
          )}

          <div>
            <Alert className="items-center p-0 flex w-full flex-1 border-0">
              {/* Coluna info */}

              <div className="w-full">
                {/* HEADER */}
                <div className="flex items-center gap-3 p-4 pb-0">
                  <div className="flex items-center gap-2 text-sm min-w-0 w-full">
                    {hasColecoes && collectionId && (
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          stop(e);
                          setDeleteOpen(true);
                        }}
                        disabled={isLocked || deleting}
                        size="icon"
                        className="h-8 w-8 shrink-0"
                      >
                        {deleting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash size={14} />
                        )}
                      </Button>
                    )}
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
                            <p>
                              {" "}
                              {csvCodToText[csvCodTrimmed] || csvCodTrimmed}
                            </p>
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
                <div className="p-4">
                  <Carousel className="flex gap-2 items-center">
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
                              className="relative w-full aspect-square rounded-md overflow-hidden bg-muted"
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
                        ),
                      )}
                    </CarouselContent>

                    <div onClick={stop}>
                      <CarouselNext variant="outline" />
                    </div>
                  </Carousel>
                </div>
              </div>
            </Alert>

            {/* Barra de edição (status/comment + atualizar + deletar) */}
          </div>
        </div>

        {/* Dialog de imagem */}
        <Dialog open={openImage} onOpenChange={setOpenImage}>
          <DialogContent className="max-w-5xl p-0" onClick={stop}>
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

        {/* Dialog de confirmação de DELETE */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent onClick={stop}>
            <DialogHeader>
              <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
                Remover item da coleção
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                Tem certeza que deseja remover este item da coleção de
                desfazimento? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                <ArrowUUpLeft size={16} /> Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash size={16} />
                )}
                Remover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  } else {
    return (
      <>
        <div 
          className={`group cursor-pointer rounded-lg relative transition-all duration-200 border-2 ${
            sel === "true" ? "border-green-500" : selected ? "border-eng-blue" : "border-transparent"
          }`}
          onClick={(e) => {
             if (sel === "true") return;
             if (onItemClick) {
                 e.stopPropagation();
                 onItemClick(invId);
             } else {
                 handleOpen(e);
             }
          }}
        >
          {sel !== "true" && (
            <div className="absolute top-2 right-2 z-10 flex gap-2 items-center" onClick={stop}>
              <Checkbox 
                checked={selected} 
                onCheckedChange={() => onItemClick?.(invId)}
                className="h-5 w-5 bg-white data-[state=checked]:bg-eng-blue border-eng-blue border-2 data-[state=checked]:text-white"
              />
            </div>
          )}

          <div className="w-full">
            <Alert className="items-center p-0 flex flex-1 w-full border-0">
              {/* Coluna info */}
              <div className="flex-1 min-w-0">
                {/* HEADER */}
                <div className="flex items-center gap-3 p-4 pb-0">
                  <div className="flex items-center gap-2 mb-4 min-w-0 w-full">
                    {hasColecoes && collectionId && (
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          stop(e);
                          setDeleteOpen(true);
                        }}
                        disabled={isLocked || deleting}
                        size="icon"
                        className="h-8 w-8 shrink-0"
                      >
                        {deleting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash size={14} />
                        )}
                      </Button>
                    )}
                    <p className="font-semibold text-left whitespace-nowrap shrink-0">
                      {asset.asset_code?.toString().trim()} -{" "}
                      {asset.asset_check_digit}
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
                                legalGuardianName,
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
                      {(imageUrls.length ? imageUrls : [undefined]).map(
                        (url, index) => (
                          <CarouselItem
                            key={url ?? index}
                            className="w-full sm:basis-full lg:basis-1/2 xl:basis-1/3"
                          >
                            {/* Wrapper com tamanho consistente */}
                            <div
                              className="relative w-full aspect-square rounded-md overflow-hidden bg-muted"
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
                        ),
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

        {/* Dialog de imagem */}
        <Dialog open={openImage} onOpenChange={setOpenImage}>
          <DialogContent className="max-w-5xl p-0" onClick={stop}>
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

        {/* Dialog de confirmação de DELETE */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent onClick={stop}>
            <DialogHeader>
              <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
                Remover item da coleção
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                Tem certeza que deseja remover este item da coleção de
                desfazimento? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                <ArrowUUpLeft size={16} /> Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash size={16} />
                )}
                Remover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}
