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

  // Se não houver empréstimo, ele fica "Disponível" (verde)
  const statusColor =
    !loan || loan.is_returned
      ? "bg-green-500"
      : loan.is_maintenance
        ? "bg-amber-500"
        : atrasado
          ? "bg-red-500"
          : !loan.is_executed
            ? "bg-eng-blue/20"
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

      // 2. Executa o empréstimo imediatamente (entrega física)
      const resExecute = await fetch(`${urlGeral}loans/execute/${loan.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resExecute.ok) {
        throw new Error("Falha ao registrar a execução do empréstimo.");
      }

      toast.success("Empréstimo aceito e executado com sucesso!");
      props.reload();
    } catch (err: any) {
      toast.error(err.message || "Ocorreu um erro ao aceitar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecusar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!loan) return;

    const motivo = prompt("Motivo da recusa (opcional):");
    // Se o usuário cancelar o prompt, não fazemos nada
    if (motivo === null) return;

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({ confirm: "false" });
      if (motivo.trim()) {
        queryParams.append("rejection_reason", motivo.trim());
      }

      const res = await fetch(
        `${urlGeral}loans/confirm/${loan.id}/?${queryParams.toString()}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Falha ao recusar a solicitação.");

      toast.success("Empréstimo recusado com sucesso!");
      props.reload();
    } catch (err: any) {
      toast.error(err.message || "Ocorreu um erro ao recusar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevolver = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!loan) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${urlGeral}loans/return/${loan.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Falha ao devolver o item.");

      toast.success("Item devolvido com sucesso!");
      props.reload();
    } catch (err: any) {
      toast.error(err.message || "Ocorreu um erro ao devolver.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex cursor-pointer rounded-md bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all"
      onClick={() => onOpen("audiovisual-modal", { ...props })}
    >
      {/* Barra Lateral Colorida */}
      <div className={cn("w-2 min-w-[8px] shrink-0", statusColor)} />
      <div className="flex flex-1 p-4 border-neutral-200 dark:border-neutral-800 transition-colors group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50">
        <div className="flex flex-col flex-1">
          <div className="flex flex-col">
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
                        <div className="flex gap-2 items-center bg-white dark:bg-zinc-800 px-2 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm">
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
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                          Guardião Temporário
                        </p>
                        <div className="flex gap-2 items-center bg-white dark:bg-zinc-800 px-2 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm">
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
                  className="w-full bg-eng-blue hover:bg-eng-blue/90 text-white"
                  onClick={handleFazerEmprestimo}
                  disabled={isLoading}
                >
                  <CalendarIcon size={14} className="mr-1.5" /> Fazer empréstimo
                </Button>
              )}

              {props.column === "Pedido" && !loan?.is_confirmed && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                    onClick={handleRecusar}
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
                    className="flex-1 bg-eng-blue hover:bg-eng-blue/90 text-white"
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
              {props.column === "Pedido" && loan?.is_confirmed && (
                <>
                  <Button
                    size="sm"
                    className="flex-1 bg-eng-blue hover:bg-eng-blue/90 text-white"
                    onClick={() => console.log("Já aceito")}
                    disabled={true}
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="mr-1.5 animate-spin" />
                    ) : (
                      <Check size={14} className="mr-1.5" />
                    )}
                    Já confirmado
                  </Button>
                </>
              )}

              {(props.column === "Emprestado" ||
                props.column === "Atrasado" ||
                props.column === "Manutenção") && (
                <Button
                  size="sm"
                  className="w-full bg-eng-blue hover:bg-eng-blue/90 text-white"
                  onClick={handleDevolver}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="mr-1.5 animate-spin" />
                  ) : (
                    <Timer size={14} className="mr-1.5" />
                  )}
                  Devolver
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudiovisualCard;
