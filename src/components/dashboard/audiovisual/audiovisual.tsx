import { Helmet } from "react-helmet";
import {
  ChevronLeft,
  Maximize2,
  Plus,
  HelpCircle,
  Calendar,
  SquareKanban,
  BookMarked,
  LucideAlarmClockOff,
  CalendarCheck,
  Wrench,
  Check,
  Cog,
} from "lucide-react";
import { Button } from "../../ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/context";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { Skeleton } from "../../ui/skeleton";
import { toast } from "sonner";
import { Alert } from "../../ui/alert";
import { AudiovisualKanban } from "./audiovisual-kanban";
import AudiovisualCard from "./audiovisual-card";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { usePermissions } from "../../permissions";
import { useIsMobile } from "../../../hooks/use-mobile";
import LoanCalendar from "./calendario";
import { DownloadPdfButton } from "../../download/download-pdf-button";
import VistoriaTab from "./vistorias";
export type UUID = string;

export interface UserDTO {
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
}
export interface LegalGuardianDTO {
  id: UUID;
  legal_guardians_code: string;
  legal_guardians_name: string;
}
export interface MaterialDTO {
  id: UUID;
  material_code: string;
  material_name: string;
}
export interface LocationDTO {
  id: UUID;
  legal_guardian_id: UUID;
  sector_id: UUID;
  location_name: string;
  location_code: string;
  sector: {
    id: UUID;
    agency_id: UUID;
    sector_name: string;
    sector_code: string;
    agency: {
      id: UUID;
      unit_id: UUID;
      agency_name: string;
      agency_code: string;
      unit: {
        id: UUID;
        unit_name: string;
        unit_code: string;
        unit_siaf: string;
      };
    };
  };
  legal_guardian: LegalGuardianDTO;
}
export interface AssetDTO {
  id: UUID;
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
  is_official: boolean;
  material: MaterialDTO;
  legal_guardian: LegalGuardianDTO;
  location: LocationDTO;
}
export interface CatalogImageDTO {
  id: UUID;
  catalog_id: UUID;
  file_path: string;
}
export interface WorkflowDetailDTO {
  inicio?: string;
  fim?: string;
  observation?: string;
}
export interface WorkflowTransferRequestDTO {
  id: UUID;
  status: string; // "PENDING" | "DECLINED" | "ACCEPTABLE" | ...
  user: UserDTO;
  location: LocationDTO;
}
export interface WorkflowHistoryDTO {
  id: UUID;
  workflow_status: string; // considere criar um union se tiver a enum
  detail?: Record<string, any>;
  user: UserDTO;
  transfer_requests?: WorkflowTransferRequestDTO[];
  catalog_id: UUID;
  created_at: string;
}
export interface CatalogResponseDTO {
  id: UUID;
  created_at: string;
  situation: string;
  conservation_status: string;
  description: string;
  asset: AssetDTO;
  user: UserDTO;
  location: LocationDTO;
  images: CatalogImageDTO[];
  workflow_history: WorkflowHistoryDTO[];
  files?: any[];
  current_workflow_status: string;
}
export interface LoanDTO {
  id: UUID;
  loanable_item_id: UUID;
  requester_id: UUID | null;
  temporary_guardian_id: UUID;
  
  confirmed_by_id: UUID | null;
  executed_by_id: UUID | null;
  returned_by_id: UUID | null;
  
  start_at: string;
  end_at: string | null;
  returned_at: string | null;
  is_confirmed: boolean;
  is_executed: boolean;
  is_returned: boolean;
  is_maintenance: boolean;
  lend_detail: string | null;
  returned_detail: string | null;
  rejection_reason: string | null;
  
  requester?: UserDTO;
  temporary_guardian?: UserDTO;
  
  confirmed_by?: UserDTO;
  executed_by?: UserDTO;
  returned_by?: UserDTO;
}

export interface LoanableItemDTO {
  id: UUID;
  catalog_id: UUID;
  legal_guardian_id: UUID;
  in_maintenance: boolean;
  is_visible: boolean;
  owner_notes: string | null;
  catalog: CatalogResponseDTO;
  guardian: UserDTO;
  last_check: Date;
  loans: LoanDTO[];
}

/* ========================= Componente Principal ========================= */
export function Audiovisual() {
  const { urlGeral } = useContext(UserContext);
  const { hasAnunciarItem } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;

  const isMobile = useIsMobile();
  const [tab, setTab] = useState<string>("emprestimo");

  const [loading, setLoading] = useState(false);
  const [expandedColumn, setExpandedColumn] = useState("");
  const [filtroHojeAtivo, setFiltroHojeAtivo] = useState(false);

  const [board, setBoard] = useState<Record<string, LoanableItemDTO[]>>({
    Disponível: [],
    Pedido: [],
    Confirmados: [],
    Emprestado: [],
    Atrasado: [],
    Manutenção: [],
  });

  const fetchColumns = useCallback(async () => {
    try {
      const res = await fetch(`${urlGeral}loans/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error();

      const json: { loanable_items: LoanableItemDTO[] } = await res.json();
      const newEntries = json?.loanable_items ?? [];

      // Inicializa o board vazio com as chaves esperadas
      const categorizedBoard: Record<string, LoanableItemDTO[]> = {
        Disponível: [],
        Pedido: [],
        Confirmados: [],
        Emprestado: [],
        Atrasado: [],
        Manutenção: [],
      };

      const now = new Date();
      now.setHours(0, 0, 0, 0); // Zera as horas para comparar o atraso apenas pela data

      // SEPARAR Entries POR TIPO (BASEADO EM PRIORIDADE)
      newEntries.forEach((entry) => {
        // 1. Prioridade Máxima: Manutenção
        if (entry.in_maintenance) {
          categorizedBoard["Manutenção"].push(entry);
          return;
        }

        const loans = entry.loans || [];

        // 2. Busca os diferentes tipos de status dentro do histórico do item
        // Empréstimo ativo (executado e não devolvido)
        const activeLoan = loans.find((l) => l.is_executed && !l.is_returned);

        // Empréstimo confirmado para o futuro (não executado, confirmado e não devolvido)
        const confirmedLoan = loans.find(
          (l) => !l.is_executed && l.is_confirmed && !l.is_returned,
        );

        // Pedido pendente (não executado, não confirmado, não devolvido e sem motivo de recusa)
        const pendingLoan = loans.find(
          (l) =>
            !l.is_executed &&
            !l.is_confirmed &&
            !l.is_returned &&
            !l.rejection_reason,
        );

        // 3. Aplica a hierarquia
        if (activeLoan) {
          // Se está com alguém, verificamos se está atrasado
          let isAtrasado = false;
          if (activeLoan.end_at) {
            const endAtDate = new Date(activeLoan.end_at);
            endAtDate.setHours(0, 0, 0, 0);
            if (endAtDate < now) {
              isAtrasado = true;
            }
          }

          if (isAtrasado) {
            categorizedBoard["Atrasado"].push(entry);
          } else {
            categorizedBoard["Emprestado"].push(entry);
          }
        } else if (confirmedLoan) {
          // Se não está emprestado, mas tem reserva futura aprovada
          categorizedBoard["Confirmados"].push(entry);
        } else if (pendingLoan) {
          // Se não tem reserva aprovada, mas tem pedido na fila
          categorizedBoard["Pedido"].push(entry);
        } else {
          // Se passou por tudo e não caiu em nada, o item tá livre para jogo
          categorizedBoard["Disponível"].push(entry);
        }
      });

      // Atualiza o estado de uma só vez
      setBoard(categorizedBoard);
    } catch (err) {
      console.error("Erro ao buscar coluna:", err);
      toast.error(`Falha ao carregar dados de empréstimo`);
    }
  }, [urlGeral, token]);

  useEffect(() => {
    setLoading(true);
    fetchColumns().finally(() => setLoading(false));
  }, [fetchColumns]);

  async function reload() {
    fetchColumns();
    setExpandedColumn("");
  }

  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full">
      <Helmet>
        <title>Empréstimo Audiovisual | Sistema Patrimônio</title>
        <meta
          name="description"
          content="Empréstimo Audiovisual temporário | Sistema Patrimônio"
        />
      </Helmet>

      <main className="flex flex-col gap-4 flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-4 justify-between">
            <div className="flex gap-2 items-center">
              <Button
                onClick={() => {
                  const path = location.pathname;
                  const hasQuery = location.search.length > 0;
                  if (hasQuery) navigate(path);
                  else {
                    const seg = path.split("/").filter(Boolean);
                    if (seg.length > 1) {
                      seg.pop();
                      navigate("/" + seg.join("/"));
                    } else navigate("/");
                  }
                }}
                variant="outline"
                size="icon"
                className="h-7 w-7"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
              <h1 className="text-xl font-semibold tracking-tight">
                Empréstimo Audiovisual
              </h1>
            </div>
            {hasAnunciarItem && isMobile ? (
              <Button
                size="sm"
                onClick={() =>
                  navigate("/dashboard/emprestimo-audiovisual", {
                    replace: true,
                  })
                }
              >
                <Plus size={16} className="" />
                Anunciar item
              </Button>
            ) : (
              <></>
            )}
          </div>
          <div
            className={
              isMobile
                ? "grid gap-4 w-full justify-center mt-4"
                : "flex gap-2 items-center mt-4"
            }
          >
            <div className="flex items-center">
              <Button
                size="sm"
                onClick={() => {
                  setTab("emprestimo");
                }}
                variant={tab === "emprestimo" ? "default" : "outline"}
                className="rounded-r-none"
              >
                <SquareKanban size={16} className="" />
                Empréstimo
              </Button>
              <Button
                onClick={() => {
                  setTab("calendario");
                }}
                size="sm"
                className="rounded-l-none"
                variant={tab === "calendario" ? "default" : "outline"}
              >
                <Calendar size={16} className="" />
                Calendário
              </Button>
            </div>
            {isMobile ? (
              <></>
            ) : (
              <Separator orientation="vertical" className="h-8 mx-2" />
            )}

            {hasAnunciarItem ? (
              <div className={isMobile ? "grid gap-1" : "flex gap-2"}>
                <Button
                  onClick={() => {
                    setTab("vistoria");
                  }}
                  size="sm"
                  className="rounded"
                  variant={tab === "vistoria" ? "default" : "outline"}
                >
                  <Cog size={16} className="" />
                  Vistoria
                </Button>
                <DownloadPdfButton
                  filters={{}}
                  id={""}
                  label="Baixar inventário"
                  method={"loan_all"}
                />

                <Button
                  size="sm"
                  onClick={() =>
                    navigate("/dashboard/emprestimo-audiovisual", {
                      replace: true,
                    })
                  }
                >
                  <Plus size={16} className="" />
                  Anunciar item
                </Button>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>

        {tab === "emprestimo" ? (
          <>
            {expandedColumn === "" ? (
              <div
                className={`relative flex-1 ${"max-h-[calc(100vh-248px)] sm:max-h-[calc(100vh-250px)] "}`}
              >
                <div className="h-full overflow-x-auto overflow-y-hidden pb-2">
                  <div className="flex gap-4 min-w-[980px] h-full">
                    {Object.entries(board).map(([colName, items]) => {
                      const getColumnMeta = (name: string) => {
                        switch (name) {
                          case "Disponível":
                            return {
                              Icon: BookMarked,
                            };
                          case "Pedido":
                            return {
                              Icon: Calendar,
                            };
                          case "Confirmados":
                            return {
                              Icon: Check,
                            };
                          case "Emprestado":
                            return {
                              Icon: CalendarCheck,
                            };
                          case "Atrasado":
                            return {
                              Icon: LucideAlarmClockOff,
                            };
                          case "Manutenção":
                            return {
                              Icon: Wrench,
                            };
                          default:
                            return {
                              Icon: HelpCircle,
                            };
                        }
                      };

                      const { Icon } = getColumnMeta(colName);
                      const totalForCol = items.length;

                      return (
                        <Alert
                          key={colName}
                          className="w-[320px] min-w-[320px] h-full flex flex-col min-h-0 overflow-hidden"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Icon size={20} className={"text-gray-400"} />
                                <span
                                  title={colName}
                                  className="font-semibold truncate"
                                >
                                  {colName}
                                </span>
                              </div>
                              <Badge variant="outline" className="shrink-0">
                                {totalForCol}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => setExpandedColumn(colName)}
                              title="Expandir coluna"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <Separator className="mb-2" />

                          <div className="flex-1 min-h-0">
                            <div className="flex flex-col min-h-0 w-full max-w-full relative h-full">
                              <ScrollArea className="h-full relative flex [&>[data-radix-scroll-area-viewport]]:w-full [&>[data-radix-scroll-area-viewport]]:max-w-full [&>[data-radix-scroll-area-viewport]]:min-w-0 [&>[data-radix-scroll-area-viewport]>div]:w-full [&>[data-radix-scroll-area-viewport]>div]:max-w-full [&>[data-radix-scroll-area-viewport]>div]:min-w-0">
                                {loading && !items.length ? (
                                  <>
                                    <Skeleton className="aspect-square w-full rounded-md" />
                                    <Skeleton className="aspect-square mt-2 w-full rounded-md" />
                                    <Skeleton className="aspect-square mt-2 w-full rounded-md" />
                                  </>
                                ) : null}

                                {items.map((entry, idx) => (
                                  <div
                                    key={entry.id}
                                    className="min-w-0 mb-2 w-full max-w-full overflow-hidden"
                                  >
                                    <AudiovisualKanban
                                      {...entry}
                                      isImage={false}
                                    />
                                  </div>
                                ))}
                                <ScrollBar orientation="vertical" />
                              </ScrollArea>
                            </div>
                          </div>
                        </Alert>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="m-0">
                {(() => {
                  if (!expandedColumn) return null;

                  const items = board[expandedColumn] || [];
                  const totalForCol = items.length;
                  const getColumnMeta = (name: string) => {
                    switch (name) {
                      case "Disponível":
                        return {
                          Icon: BookMarked,
                        };
                      case "Pedido":
                        return { Icon: Calendar };
                      case "Emprestado":
                        return {
                          Icon: CalendarCheck,
                        };
                      case "Confirmados":
                        return {
                          Icon: Check,
                        };
                      case "Atrasado":
                        return {
                          Icon: LucideAlarmClockOff,
                        };
                      case "Manutenção":
                        return { Icon: Wrench };
                      default:
                        return {
                          Icon: HelpCircle,
                        };
                    }
                  };

                  const { Icon } = getColumnMeta(expandedColumn);

                  const itensFiltrados = items.filter((item) => {
                    if (!filtroHojeAtivo) return true;
                    if (expandedColumn !== "Emprestado") return true;

                    const emprestimoAtivo = item.loans?.find(
                      (l) => !l.is_returned,
                    );
                    if (!emprestimoAtivo || !emprestimoAtivo.end_at)
                      return false;

                    const dataFim = new Date(emprestimoAtivo.end_at);
                    const hoje = new Date();
                    return (
                      dataFim.getDate() === hoje.getDate() &&
                      dataFim.getMonth() === hoje.getMonth() &&
                      dataFim.getFullYear() === hoje.getFullYear()
                    );
                  });

                  return (
                    <div key={expandedColumn}>
                      <div
                        className={
                          isMobile
                            ? "flex flex-col items-center justify-between mb-4 mt-6"
                            : "flex items-center justify-between mb-4"
                        }
                      >
                        {isMobile && (
                          <div className="w-full flex justify-start mb-8 pl-1">
                            <Button
                              size="sm"
                              onClick={() => {
                                setExpandedColumn("");
                                setFiltroHojeAtivo(false);
                              }}
                              className="self-start"
                            >
                              <ChevronLeft size={16} className="mr-1" /> Voltar
                              ao quadro
                            </Button>
                          </div>
                        )}

                        <div className="flex items-center gap-1 mr-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Icon size={20} className={"text-eng-blue"} />
                            <h2
                              className={
                                isMobile
                                  ? "text-base text-center font-semibold"
                                  : "text-lg font-semibold"
                              }
                            >
                              {expandedColumn}
                            </h2>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              isMobile ? "w-6 items-center hidden" : ""
                            }
                          >
                            {totalForCol}
                          </Badge>
                          {expandedColumn === "Emprestado" ? (
                            <Button
                              size="default"
                              onClick={() =>
                                setFiltroHojeAtivo(!filtroHojeAtivo)
                              }
                              variant={filtroHojeAtivo ? "default" : "outline"}
                              className="ml-8"
                            >
                              Devolução hoje
                            </Button>
                          ) : null}
                        </div>

                        {/* Ações / Botões */}
                        <div
                          className={
                            isMobile ? "flex flex-row gap-3 mt-4" : "flex gap-3"
                          }
                        >
                          {!isMobile && (
                            <Button
                              size="default"
                              onClick={() => setExpandedColumn("")}
                            >
                              <ChevronLeft size={16} className="mr-1" /> Voltar
                              ao quadro
                            </Button>
                          )}
                        </div>
                      </div>

                      {loading && !items.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <Skeleton
                              key={i}
                              className="aspect-square w-full rounded-md"
                            />
                          ))}
                        </div>
                      ) : null}

                      <div
                        className={`grid grid-cols-1 ${expandedColumn === "Disponível" ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4 align-center overflow-x-auto`}
                      >
                        {itensFiltrados.map((item) => (
                          <AudiovisualCard
                            key={item.id}
                            {...item}
                            column={expandedColumn}
                            reload={reload}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        ) : (
          <></>
        )}
        {tab === "calendario" ? <LoanCalendar board={board} /> : <></>}
        {tab === "vistoria" ? (
          <VistoriaTab board={board} setTab={() => setTab("emprestimo")} />
        ) : (
          <></>
        )}
      </main>
    </div>
  );
}

export default Audiovisual;
