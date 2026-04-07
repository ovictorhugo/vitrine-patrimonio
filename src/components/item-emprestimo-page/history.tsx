import { useContext } from "react";
import { UserContext } from "../../context/context";
import {
  Calendar,
  Clock,
  User,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Timer,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "../../lib";
import { LoanableItemDTO, LoanDTO } from "../dashboard/audiovisual/audiovisual";

interface HistoryTabProps {
  item: LoanableItemDTO | undefined;
}

export default function HistoryTab({ item }: HistoryTabProps) {
  const { urlGeral } = useContext(UserContext);

  const loans = item?.loans || [];
  const reversed = loans.reverse();

  const formatData = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const dataFormatada = date.toLocaleDateString("pt-BR");
    const hora = date.getHours();
    return `${dataFormatada} às ${hora}h`;
  };

  const isAtrasado = (loan: LoanDTO) => {
    if (loan.is_returned || !loan.end_at) return false;
    return new Date(loan.end_at) < new Date();
  };

  const eDevolucaoAtrasada = (
    endAt: string | null,
    returnedAt: string | null,
  ): boolean => {
    if (!endAt || !returnedAt) return false;
    const dateEnd = new Date(new Date(endAt).setHours(0, 0, 0, 0));
    const dateReturned = new Date(new Date(returnedAt).setHours(0, 0, 0, 0));
    return dateReturned > dateEnd;
  };

  // Componente auxiliar para renderizar a badge de usuário de forma reutilizável
  const UserBadge = ({ role, username }: { role: string; username: string | undefined }) => {
    if (!username) return null; // Não renderiza se o usuário não existir
    
    return (
      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
          {role}
        </p>
        <div className="flex gap-2 items-center bg-zinc-50 dark:bg-zinc-800 px-2 py-1.5 rounded-md border dark:border-zinc-700 shadow-sm">
          <Avatar className="rounded-md h-5 w-5">
            <AvatarImage
              className="rounded-md h-5 w-5 object-cover"
              src={`${urlGeral}Researchercatalog/Image?name=${username}`}
            />
            <AvatarFallback className="flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
              <User size={10} />
            </AvatarFallback>
          </Avatar>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {username}
          </p>
        </div>
      </div>
    );
  };

  return (
    <main className="flex flex-col gap-4 p-4">
      <div className="pl-4 ml-4 flex flex-col gap-3">
        <div className="text-2xl mb-4 flex justify-between items-center">
          Histórico
        </div>
        {loans.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
            Nenhum registro de empréstimo encontrado para este item.
          </div>
        ) : (
          [...reversed].map((loan: any, idx) => {
            // Mapeamento dos usuários (incluindo os novos de auditoria)
            const requesterName = loan.requester?.username || "N/A";
            const guardianName = loan.temporary_guardian?.username || "N/A";
            
            // Novos campos de auditoria
            const confirmedByName = loan.confirmed_by?.username;
            const executedByName = loan.executed_by?.username;
            const returnedByName = loan.returned_by?.username;

            const atrasado = isAtrasado(loan);
            const devolucaoAtrasada = eDevolucaoAtrasada(
              loan.end_at,
              loan.returned_at,
            );

            const statusColor = loan.is_maintenance
              ? "bg-amber-500"
              : loan.rejection_reason
                ? "bg-blue-950" 
                : atrasado ||
                    devolucaoAtrasada ||
                    (loan.is_returned && !loan.is_confirmed)
                  ? "bg-red-500" 
                  : loan.is_returned
                    ? "bg-green-500" 
                    : "bg-eng-blue"; 

            return (
              <div key={loan.id || idx} className="flex mb-3">
                <div
                  className={cn(
                    "w-2 min-w-2 rounded-l-md border border-neutral-200 border-r-0 dark:border-neutral-800",
                    statusColor,
                  )}
                />

                <div className="flex flex-col flex-1 h-fit bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 rounded-r-md p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  {/* Cabeçalho de Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {loan.is_maintenance ? (
                        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          <Wrench size={12} /> Manutenção
                        </div>
                      ) : !loan.is_executed && !loan.is_returned ? (
                        <div className="flex items-center gap-1.5 text-white bg-amber-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Pedido
                        </div>
                      ) : null}

                      {atrasado && (
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">
                          <AlertCircle size={12} /> Atrasado
                        </div>
                      )}

                      {devolucaoAtrasada && (
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">
                          <AlertCircle size={12} /> Devolvido em atraso
                        </div>
                      )}

                      {loan.rejection_reason ? (
                        <div className="flex items-center gap-1.5 text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          <X size={12} /> Recusado
                        </div>
                      ) : loan.is_returned && !loan.is_confirmed ? (
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          <X size={12} /> Recusado
                        </div>
                      ) : loan.is_returned ? (
                        <div className="flex items-center gap-1.5 text-green-600 bg-green-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          <CheckCircle2 size={12} /> Devolvido
                        </div>
                      ) : (
                        loan.is_executed &&
                        !atrasado && (
                          <div className="flex items-center gap-1.5 text-eng-blue bg-eng-blue/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            <Timer size={12} /> Emprestado
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Datas */}
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
                        className={cn(
                          "text-sm text-gray-500 dark:text-gray-300",
                          atrasado && "text-red-600 font-bold",
                        )}
                      >
                        {formatData(loan.end_at)}
                      </span>
                    </div>

                    {loan.returned_at && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-gray-500 dark:text-gray-300" />
                        <p className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-300">
                          Retorno:
                        </p>
                        <span className="text-sm text-gray-500 dark:text-gray-300">
                          {formatData(loan.returned_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Envolvidos */}
                  <div className="flex gap-3 flex-wrap">
                    <UserBadge role="Solicitante" username={requesterName} />
                    <UserBadge role="Responsável" username={guardianName} />
                    
                    {/* Renderiza dinamicamente as badges de auditoria caso os dados existam */}
                    <UserBadge 
                      role={loan.rejection_reason ? "Recusado por" : "Confirmado por"} 
                      username={confirmedByName} 
                    />
                    <UserBadge role="Entregue por" username={executedByName} />
                    <UserBadge role="Recebido por" username={returnedByName} />
                  </div>

                  {/* Detalhes do Empréstimo */}
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