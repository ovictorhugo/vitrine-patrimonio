import {
  Badge,
  Calendar,
  CalendarCheck,
  ChevronRight,
  Clock,
  List,
  User,
  UserCheck,
  UserIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../context/context";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Alert } from "../../../ui/alert";
import { Button } from "../../../ui/button";
import GlobalLoanCalendar from "../../audiovisual/calendario";
import { LoanableItemDTO } from "../../audiovisual/audiovisual";
import { DownloadPdfButton } from "../../../download/download-pdf-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";

export function Emprestimos() {
  const { urlGeral } = useContext(UserContext);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const [emprestimos, setEmprestimos] = useState<LoanableItemDTO[]>([]);
  const [tab, setTab] = useState("lista");

  async function getCatalog() {
    try {
      const res = await fetch(`${urlGeral}loans/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();

      // O endpoint retorna { loanable_items: [...] }
      if (json && json.loanable_items) {
        setEmprestimos(json.loanable_items);
      }
    } catch (error) {
      console.error("Erro ao buscar meus empréstimos:", error);
    }
  }

  useEffect(() => {
    getCatalog();
  }, [urlGeral]);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item">
        <AccordionTrigger>
          <HeaderResultTypeHome
            title="Meus empréstimos"
            icon={<CalendarCheck size={24} className="text-gray-400" />}
          />
        </AccordionTrigger>
        <AccordionContent>
          <Alert className="px-8">
            <div className="flex w-full justify-end">
              <Button
                size="sm"
                onClick={() => setTab("lista")}
                variant={tab === "lista" ? "default" : "outline"}
                className="rounded-r-none"
              >
                <List size={16} className="" />
                Lista
              </Button>
              <Button
                onClick={() => setTab("calendario")}
                size="sm"
                variant={tab !== "lista" ? "default" : "outline"}
                className="rounded-l-none"
              >
                <Calendar size={16} className="" />
                Calendário
              </Button>
            </div>

            {tab === "lista" ? (
              <>
                {emprestimos?.map((item) => {
                  const formatData = (isoString?: string | null) => {
                    if (!isoString) return "Não informada";
                    return new Date(isoString)
                      .toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      .replace(",", " às");
                  };

                  return (
                    <div key={item.id} className="flex my-4">
                      <div
                        className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-eng-blue min-h-full`}
                      />
                      <Alert className="flex flex-col h-fit rounded-l-none w-full">
                        <div className="flex mb-1 pb-0">
                          <p className="font-semibold flex gap-3 items-center text-left flex-1">
                            {item.catalog?.asset?.asset_code?.trim() || "S/C"} -{" "}
                            {item.catalog?.asset?.asset_check_digit || ""}
                          </p>
                        </div>
                        <div className="flex flex-col p-4 pt-0 justify-between">
                          <div>
                            <div className="text-lg font-bold">
                              {item.catalog?.asset?.material?.material_name ||
                                "Sem nome"}
                            </div>
                            <p className="text-left uppercase text-sm text-muted-foreground">
                              {item.catalog?.asset?.asset_description || ""}
                            </p>
                          </div>
                        </div>

                        {/* LISTA DE EMPRÉSTIMOS DESTE ITEM */}
                        <div className="pl-4 ml-4 flex flex-col gap-3">
                          <p className="text-sm font-semibold text-muted-foreground uppercase">
                            Registros de Empréstimo ({item.loans?.length || 0})
                          </p>

                          {item.loans?.map((loan, empIndex) => {
                            // Pegando os dados corretos da tabela 'loans'
                            const guardianName =
                              loan.temporary_guardian?.username || "N/A";
                            const requesterName =
                              loan.requester?.username || "N/A";
                            const dataInicio = formatData(loan.start_at);
                            const dataFim = formatData(loan.end_at);
                            const emAberto = !loan.is_executed;

                            return (
                              <div key={loan.id || empIndex} className="w-full">
                                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/40 transition delay-150 duration-300 ease-in-out hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded cursor-pointer border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700">
                                  <div className="flex justify-between">
                                    {/* Datas */}
                                    <div className="flex items-center gap-6 flex-wrap mb-3">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="size-4 text-muted-foreground" />
                                        <p className="text-sm font-semibold uppercase">
                                          Início:
                                        </p>
                                        <span className="text-sm text-gray-500 dark:text-gray-300">
                                          {dataInicio}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Clock className="size-4 text-muted-foreground" />
                                        <p className="text-sm font-semibold uppercase">
                                          Fim:
                                        </p>
                                        <span className="text-sm text-gray-500 dark:text-gray-300">
                                          {dataFim}
                                        </span>
                                      </div>
                                    </div>
                                    { emAberto ? <DownloadPdfButton
                                      filters={{}}
                                      id={loan?.id}
                                      label="Baixar termo"
                                      method={"loan_terms"}
                                    />: <></> }
                                  </div>

                                  {/* Envolvidos (Solicitante e Guardião Temporário) */}
                                  <div className="flex gap-3 mb-4">
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
                              </div>
                            );
                          })}
                        </div>
                      </Alert>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="mt-4">
                <GlobalLoanCalendar board={{ "": emprestimos }} />
              </div>
            )}
          </Alert>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
