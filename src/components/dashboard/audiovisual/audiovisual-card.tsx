import React, { useContext, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Timer,
  Check,
  X,
  Loader2,
  CornerDownLeft,
} from "lucide-react";
import { Alert } from "../../ui/alert";
import { Carousel, CarouselContent, CarouselItem } from "../../ui/carousel";
import { CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { UserContext } from "../../../context/context";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useModal } from "../../hooks/use-modal-store";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { cn } from "../../../lib";
import { toast } from "sonner";
import { LoanableItemDTO, LoanDTO } from "./audiovisual"; // Ajuste o caminho se necessário
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { AlertDialogHeader } from "../../ui/alert-dialog";
import { Input } from "../../ui/input";
import { DownloadPdfButton } from "../../download/download-pdf-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

type Props = LoanableItemDTO & {
  column:
    | "Disponível"
    | "Pedido"
    | "Emprestado"
    | "Atrasado"
    | "Manutenção"
    | string;
  reload: Function;
  thumbOnly?: boolean;
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

const formatData = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function AudiovisualCard(props: Props) {
  const { urlGeral } = useContext(UserContext);
  const { onOpen } = useModal();
  const token = localStorage.getItem("jwt_token") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [openDetalhamento, setOpenDetalhamento] = useState(false);
  const [openVistoriaDialog, setOpenVistoriaDialog] = useState(false);
  const [detalhamento, setDetalhamento] = useState("");

  const materialNome =
    props.catalog?.asset?.material?.material_name ??
    props.catalog?.asset?.asset_description ??
    "Item";

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
    firstImgPlaceholder = `${baseForSet}${baseForSet.includes("?") ? "&" : "?"}w=24&q=10`;
  }

  // Pegamos o empréstimo mais recente/ativo para exibir no Card
  const loan =
    props.loans && props.loans.length > 0
      ? props.loans[props.loans.length - 1]
      : null;

  const requesterName = loan?.requester?.username || "N/A";
  const guardianName = loan?.temporary_guardian?.username || "N/A";

  const isAtrasado = (l: LoanDTO | null) => {
    if (!l || l.is_returned || !l.end_at) return false;
    return new Date(l.end_at) < new Date();
  };

  const atrasado = isAtrasado(loan);
  const statusColor =
    !loan || loan.is_returned
      ? "'bg-green-500'"
      : props.in_maintenance
        ? "bg-amber-500"
        : atrasado
          ? "bg-red-500"
          : !loan.is_executed
            ? "bg-eng-blue"
            : "bg-eng-blue";

  // ================= FUNÇÕES DE AÇÃO ================= //

  const handleFazerEmprestimo = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Abre o modal que já possui a aba de criar solicitação
    onOpen("audiovisual-modal", { ...props });
  };

  const handleAceitar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!loan) return;
    setIsLoading(true);
    try {
      // 1. Confirma o empréstimo
      const resConfirm = await fetch(
        `${urlGeral}loans/confirm/${loan.id}?confirm=true`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!resConfirm.ok) {
        throw new Error("Falha ao aceitar a solicitação.");
      }

      toast.success("Empréstimo aceito com sucesso!");
      props.reload();
    } catch (err: any) {
      toast.error(err.message || "Ocorreu um erro ao aceitar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmprestar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!loan) return;
    setIsLoading(true);
    try {
      // 1. Confirma o empréstimo
      const resConfirm = await fetch(`${urlGeral}loans/execute/${loan.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resConfirm.ok) {
        throw new Error("Falha ao aceitar a solicitação.");
      }

      toast.success("Empréstimo executado com sucesso!");
      props.reload();
    } catch (err: any) {
      toast.error(err.message || "Ocorreu um erro ao aceitar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendWithObservation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDetalhamento(false)
    if (!loan) return;

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({ confirm: "false" });
      if (detalhamento.trim()) {
        queryParams.append("rejection_reason", detalhamento.trim());
      }

      const res = await fetch(
        `${urlGeral}loans/${props.column === "Pedido" ? "confirm" : "return"}/${loan.id}/?${queryParams.toString()}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Falha ao recusar a solicitação.");

      toast.success("Empréstimo recusado com sucesso!");
      setOpenDetalhamento(false);
      props.reload();
    } catch (err: any) {
      toast.error(err.message || "Ocorreu um erro ao recusar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndMaintenance = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenVistoriaDialog(true);
  };

  const confirmEndMaintenance = async (isVistoria: boolean) => {
    setIsLoading(true);
    setOpenVistoriaDialog(false);

    try {
      const queryParams = new URLSearchParams({
        is_vistoria: String(isVistoria),
      });

      const res = await fetch(
        `${urlGeral}loans/end_maintenance/${props.id}?${queryParams.toString()}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Falha ao retirar o item da manutenção.",
        );
      }

      toast.success("Manutenção finalizada com sucesso!");
      props.reload();
    } catch (err: any) {
      toast.error(err.message || "Ocorreu um erro ao finalizar a manutenção.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex cursor-pointer rounded-md bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all">
      {/* Barra Lateral Colorida */}
      <div className={cn("w-2 min-w-[8px] shrink-0", statusColor)} />
      <div className="flex flex-1 p-4 border-neutral-200 dark:border-neutral-800 transition-colors group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50">
        <div className="flex flex-col flex-1">
          <div
            className="flex flex-col"
            onClick={() => onOpen("audiovisual-modal", { ...props })}
          >
            <div className="flex gap-4 mb-2">
              <div className="w-[60%] flex flex-col justify-between">
                {/* Título */}
                <div className="flex items-start justify-between mb-4 gap-2">
                  <p
                    className="font-bold text-sm line-clamp-2"
                    title={materialNome}
                  >
                    {materialNome}
                  </p>
                </div>

                {/* Exibir Infos de Empréstimo se a coluna não for "Disponível" */}
                {props.column !== "Disponível" && loan && (
                  <div>
                    {/* Datas */}
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4 text-muted-foreground" />
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          Início:
                        </p>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {formatData(loan.start_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          Fim:
                        </p>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            atrasado
                              ? "text-red-600 font-bold"
                              : "text-gray-700 dark:text-gray-300",
                          )}
                        >
                          {formatData(loan.end_at)}
                        </span>
                      </div>
                    </div>

                    {/* Envolvidos */}
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                          Solicitante
                        </p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `/user?id=${loan.requester?.id}`,
                                  "_blank",
                                );
                              }}
                              className="flex gap-2 items-center bg-white dark:bg-zinc-800 px-2 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm"
                            >
                              <Avatar className="rounded-md h-5 w-5 shrink-0">
                                <AvatarImage
                                  src={`${urlGeral}user/upload/${loan.requester?.id}/icon`}
                                />
                                <AvatarFallback>
                                  <UserIcon size={10} />
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">
                                {requesterName}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{requesterName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                          Responsável
                        </p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `/user?id=${loan.requester?.id}`,
                                  "_blank",
                                );
                              }}
                              className="flex gap-2 items-center bg-white dark:bg-zinc-800 px-2 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm"
                            >
                              <Avatar className="rounded-md h-5 w-5 shrink-0">
                                <AvatarImage
                                  src={`${urlGeral}user/upload/${loan.temporary_guardian?.id}/icon`}
                                />
                                <AvatarFallback>
                                  <UserIcon size={10} />
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">
                                {guardianName}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{guardianName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Carrossel de Imagem */}
              <div className="w-[40%] ">
                <Carousel className="w-full flex items-center ">
                  <CarouselContent>
                    {firstImg ? (
                      <CarouselItem key={firstImg.id}>
                        <Alert className="rounded border-b-0 border-x-0 border-t-0 p-0">
                          <CardContent className="aspect-square justify-end p-0">
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
                              className="rounded-t-md"
                            />
                          </CardContent>
                        </Alert>
                      </CarouselItem>
                    ) : (
                      <CarouselItem>
                        <Alert className="bg-center rounded-b-none border-0 bg-muted">
                          <CardContent className="flex aspect-square justify-end p-0" />
                        </Alert>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>

            {/* Observações / Recusa */}
            {props.column !== "Disponível" &&
              props.column !== "Manutenção" &&
              loan &&
              (loan.lend_detail || loan.rejection_reason) && (
                <div className="mt-auto pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  {loan.lend_detail && (
                    <p className="text-xs text-muted-foreground italic line-clamp-2">
                      "{loan.lend_detail}"
                    </p>
                  )}
                  {loan.rejection_reason && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      Motivo Rejeição: {loan.rejection_reason}
                    </p>
                  )}
                </div>
              )}

            {/* BOTÕES BASEADOS NA COLUNA */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              {props.column === "Disponível" && (
                <Button
                  size="sm"
                  className={cn(
                    "w-full bg-eng-blue hover:bg-eng-blue/90 text-white",
                    statusColor,
                  )}
                  onClick={handleFazerEmprestimo}
                  disabled={isLoading}
                >
                  <CalendarIcon size={14} className="mr-1.5" /> Fazer empréstimo
                </Button>
              )}

              {props.column === "Pedido" && !loan?.is_confirmed && (
                <>
                  <DownloadPdfButton
                    filters={{}}
                    id={loan?.id}
                    label="Baixar termo"
                    method={"loan_terms"}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-red-500 text-white hover:bg-red-200 hover:text-red-700 dark:hover:bg-red-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDetalhamento(true);
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="mr-1.5 animate-spin" />
                    ) : (
                      <X size={14} className="mr-1.5" />
                    )}
                    Recusar
                  </Button>
                  <Button
                    size="sm"
                    className={
                      "w-full bg-eng-blue hover:bg-eng-blue/90 text-white"
                    }
                    onClick={handleAceitar}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="mr-1.5 animate-spin" />
                    ) : (
                      <Check size={14} className="mr-1.5" />
                    )}
                    Aceitar
                  </Button>
                </>
              )}
              {props.column === "Confirmados" && (
                <>
                  <DownloadPdfButton
                    filters={{}}
                    id={loan?.id}
                    label="Baixar termo"
                    method={"loan_terms"}
                  />
                  <Button
                    size="sm"
                    className={cn(
                      "w-full bg-eng-blue hover:bg-eng-blue/90 text-white",
                      statusColor,
                    )}
                    onClick={handleEmprestar}
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="mr-1.5 animate-spin" />
                    ) : (
                      <Check size={14} className="mr-1.5" />
                    )}
                    Emprestar
                  </Button>
                </>
              )}

              {(props.column === "Emprestado" ||
                props.column === "Atrasado") && (
                <Button
                  size="sm"
                  className={cn(
                    "w-full bg-eng-blue hover:bg-eng-blue/90 text-white",
                    statusColor,
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDetalhamento(true);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="mr-1.5 animate-spin" />
                  ) : (
                    <CornerDownLeft size={14} className="mr-1.5" />
                  )}
                  Devolver
                </Button>
              )}
              {props.column === "Manutenção" && (
                <Button
                  size="sm"
                  className={cn(
                    "w-full bg-eng-blue hover:bg-eng-blue/90 text-white",
                    statusColor,
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEndMaintenance();
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="mr-1.5 animate-spin" />
                  ) : (
                    <CornerDownLeft size={14} className="mr-1.5" />
                  )}
                  Finalizar manutenção
                </Button>
              )}
            </div>
          </div>
        </div>
        <Dialog open={openDetalhamento} onOpenChange={setOpenDetalhamento}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {props.column === "Pedido"
                  ? "Motivo da recusa"
                  : "Detalhes (opcional)"}
              </DialogTitle>
            </DialogHeader>

            <div className="max-h-[250px] overflow-y-auto mt-2 space-y-1">
              <Input
                value={detalhamento}
                onChange={(e) => setDetalhamento(e.target.value)}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button onClick={handleSendWithObservation}>Enviar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={openVistoriaDialog} onOpenChange={setOpenVistoriaDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                Considerar essa manutenção como vistoria?
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ao confirmar, a data da última vistoria do item será atualizada.
              </p>
            </div>

            <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => confirmEndMaintenance(false)}
                disabled={isLoading}
              >
                Não
              </Button>
              <Button
                onClick={() => confirmEndMaintenance(true)}
                disabled={isLoading}
                className="bg-eng-blue hover:bg-eng-blue/90 text-white"
              >
                Sim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default AudiovisualCard;
