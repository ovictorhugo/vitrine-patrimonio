import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import {
  Calendar,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  LoaderCircle,
  NotebookPen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "../../lib";
import { LoanableItemDTO } from "../dashboard/audiovisual/audiovisual";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useIsMobile } from "../../hooks/use-mobile";

// Importações do Dialog (ajuste o caminho se necessário)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { usePermissions } from "../permissions";
import { Alert } from "../ui/alert";

interface MaintenanceTabProps {
  item: LoanableItemDTO | undefined;
}

export default function MaintenanceTab({ item }: MaintenanceTabProps) {
  const { urlGeral } = useContext(UserContext);
  const { hasAnunciarItem } = usePermissions();
  const token = localStorage.getItem("jwt_token") || "";

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Estamos procurando todas as informações no nosso banco de dados, aguarde.",
  );

  // Novo estado para controlar o modal de confirmação
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  let loans = item?.loans || [];
  loans = loans.filter((l) => l.is_maintenance);
  const reversed = loans.reverse();

  // Função auxiliar para formatar datas (estilo 20/05/2024)
  const formatData = (dateStr: string) => {
    if (!dateStr) return "N/A";
    if (dateStr === "N/A") return "Não realizado";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };
  const showDate = (dateStr: Date = new Date(0)) => {
    if (dateStr === new Date(0)) return "N/A";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const shiftDate = () => {
    let first_date = item?.last_check || null;
    if (first_date === null) return "N/A";

    const date = new Date(first_date);
    // Adiciona a quantidade de dias especificada
    date.setDate(date.getDate() + 100);

    return date.toLocaleDateString("pt-BR");
  };

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    setLoadingMessage(
      "Estamos procurando todas as informações no nosso banco de dados, aguarde.",
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Estamos quase lá, continue aguardando...");
      }, 5000),
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Só mais um pouco...");
      }, 10000),
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Está demorando mais que o normal... estamos tentando encontrar tudo.",
        );
      }, 15000),
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Estamos empenhados em achar todos os dados, aguarde só mais um pouco",
        );
      }, 15000),
    );

    return () => {
      // Limpa os timeouts ao desmontar
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const handleSendMaintenance = async () => {
    // Fecha o modal antes de começar a carregar
    setIsDialogOpen(false);
    setLoading(true);

    if (!hasAnunciarItem) {
      toast.error("Você não possui permissão para realizar esta ação");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${urlGeral}loans/send_maintenance/${item?.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Falha ao enviar o item para manutenção.",
        );
      }

      toast.success("Item enviado para manutenção com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Ocorreu um erro ao enviar para manutenção.");
    } finally {
      setLoading(false);
    }
  };

  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-full flex flex-col items-center justify-center h-full">
          <div className="text-eng-blue mb-4 animate-pulse">
            <LoaderCircle size={isMobile ? 54 : 108} className="animate-spin" />
          </div>
          <p
            className={cn(
              "font-medium text-lg text-center",
              isMobile ? "max-w-[400px]" : "max-w-[500px]",
            )}
          >
            {loadingMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <div className="pl-4 ml-4 flex flex-col gap-3">
        <div className="text-4xl mb-6 flex justify-between items-center font-semibold">
          Histórico de manutenções
          {/* O botão agora apenas abre o modal */}
          <Button
            className="w-fit text-sm"
            onClick={() => setIsDialogOpen(true)}
          >
            Colocar em manutenção
          </Button>
        </div>
        <div className="flex group ">
          <div
            className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-eng-blue min-h-full`}
          />
          <Alert className="flex flex-col flex-1 h-fit rounded-l-none p-4 gap-3">
            <div className="flex gap-6">
              <p className="font-semibold flex gap-3 items-center text-xl text-left">
                Última vistoria:
              </p>
              <div className="w-fit text-sm bg-zinc-50 dark:bg-zinc-800 p-1.5 rounded-md border dark:border-zinc-700 shadow-sm">
                {showDate(item?.last_check)}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xl font-semibold">Próxima vistoria:</p>
              <div className="w-fit text-sm bg-zinc-50 dark:bg-zinc-800 p-1.5 rounded-md border dark:border-zinc-700 shadow-sm">
                {shiftDate()}
              </div>
            </div>
          </Alert>
        </div>
        {/* Modal de Confirmação */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar Manutenção</DialogTitle>
              <DialogDescription>
                Tem certeza de que deseja enviar este item para a manutenção?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Não, cancelar
              </Button>
              <Button
                onClick={handleSendMaintenance}
                className="bg-eng-blue hover:bg-eng-blue/90 text-white"
              >
                Sim, confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {loans.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
            Nenhum registro de manutenções encontrado para este item.
          </div>
        ) : (
          [...reversed].map((loan, idx) => {
            const requesterName = loan.requester?.username || "N/A";
            const statusColor = "bg-amber-500";

            return (
              <div key={loan.id || idx} className="flex mb-3">
                <div
                  className={cn(
                    "w-2 min-w-2 rounded-l-md border border-neutral-200 border-r-0 dark:border-neutral-800",
                    statusColor,
                  )}
                />

                <div className="flex flex-col flex-1 h-fit bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 rounded-r-md p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        <Wrench size={12} /> Manutenção
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-wrap mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <p className="text-sm font-semibold uppercase">Início:</p>
                      <span className="text-sm text-gray-500 dark:text-gray-300">
                        {formatData(loan.start_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <p className="text-sm font-semibold uppercase">
                        Prev. Fim:
                      </p>
                      <span
                        className={"text-sm text-gray-500 dark:text-gray-300"}
                      >
                        {formatData(loan.end_at ?? "")}
                      </span>
                    </div>

                    {loan.returned_at && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-500" />
                        <p className="text-sm font-semibold uppercase">
                          Retorno:
                        </p>
                        <span className="text-sm text-gray-500 dark:text-gray-300">
                          {formatData(loan.returned_at) || ""}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                        Solicitante
                      </p>
                      <div className="flex gap-2 items-center bg-zinc-50 dark:bg-zinc-800 px-2 py-1.5 rounded-md border dark:border-zinc-700 shadow-sm">
                        <Avatar className="rounded-md h-5 w-5">
                          <AvatarImage
                            className="rounded-md h-5 w-5 object-cover"
                            src={`${urlGeral}Researchercatalog/Image?name=${requesterName}`}
                          />
                          <AvatarFallback className="flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
                            <User size={10} />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                          {requesterName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(loan.lend_detail || loan.rejection_reason) && (
                    <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                      {loan.lend_detail && (
                        <p className="text-xs text-muted-foreground italic">
                          " {loan.lend_detail} "
                        </p>
                      )}
                      {loan.rejection_reason && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          Motivo Rejeição: {loan.rejection_reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
