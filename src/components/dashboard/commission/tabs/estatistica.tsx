import { useContext, useEffect, useMemo, useState } from "react";
import { Archive, Bell, Bug, ChevronLeft, ChevronRight, Clock, File, HelpCircle, Hourglass, ListChecks, ListTodo, Recycle, Settings, Store, Trash, Users, Wrench, XCircle } from "lucide-react";
import { UserContext } from "../../../../context/context";
import { GraficoStatusCatalogo } from "../../dashboard-page/components/chart-workflows";
import { ChartRadialDesfazimento } from "../../administrativo/components/chart-radial-desfazimento";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../ui/carousel";
import { Alert } from "../../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../../ui/card";
import ChartTempoRevisaoComissao from "../components/grafico-comission-REVIEW_REQUESTED";
import ChartTempoRevisaoComissaoPie from "../components/ChartTempoRevisaoComissao";

export type StatusCount = { status: string; count: number };
const WORKFLOWS = [
 
 { key: "REVIEW_REQUESTED_DESFAZIMENTO", name: "Avaliação S. Patrimônio - Desfazimento", Icon: Hourglass },
    { key: "ADJUSTMENT_DESFAZIMENTO", name: "Ajustes - Desfazimento", Icon: Wrench },
    { key: "REVIEW_REQUESTED_COMISSION", name: "LTD - Lista Temporária de Desfazimento", Icon: ListTodo },
    { key: "REJEITADOS_COMISSAO", name: "Recusados", Icon: XCircle },
    { key: "DESFAZIMENTO", name: "LFD - Lista Final de Desfazimento", Icon: Trash },
    { key: "DESCARTADOS", name: "Processo Finalizado", Icon: Recycle },
] as const;

export function Estatistica() {
  const { user, urlGeral } = useContext(UserContext);

      const [statsMap, setStatsMap] = useState<Record<string, number>>({});
      const [loadingStats, setLoadingStats] = useState(false);
    
        const token = useMemo(() => localStorage.getItem("jwt_token"), []);
        const authHeaders: HeadersInit = useMemo(
          () => ({
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          }),
          [token]
        );
      

      const fetchStats = async () => {
        try {
          setLoadingStats(true);
          const res = await fetch(`${urlGeral}statistics/catalog/count-by-workflow-status`, {
            method: "GET",
            headers: authHeaders,
          });
          if (!res.ok) throw new Error(`Falha ao carregar estatísticas (HTTP ${res.status}).`);
          const data: StatusCount[] = await res.json();
          const map: Record<string, number> = {};
          for (const row of data || []) {
            if (row?.status) map[row.status] = row?.count ?? 0;
          }
          setStatsMap(map);
        } catch {
          // Em caso de erro, mantemos zeros (UX silenciosa aqui)
          setStatsMap({});
        } finally {
          setLoadingStats(false);
        }
      };
    
      useEffect(() => {
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [urlGeral]);

      const WORKFLOW_STATUS_META: Record<
  string,
  { Icon: React.ComponentType<any>; colorClass: string }
> = {
  REVIEW_REQUESTED_VITRINE: { Icon: Hourglass, colorClass: "text-amber-500" },
  ADJUSTMENT_VITRINE: { Icon: Wrench, colorClass: "text-blue-500" },
  VITRINE: { Icon: Store, colorClass: "text-green-600" },
  AGUARDANDO_TRANSFERENCIA: { Icon: Clock, colorClass: "text-indigo-500" },
  TRANSFERIDOS: { Icon: Archive, colorClass: "text-zinc-500" },

  REVIEW_REQUESTED_DESFAZIMENTO: { Icon: Hourglass, colorClass: "text-amber-500" },
  ADJUSTMENT_DESFAZIMENTO: { Icon: Wrench, colorClass: "text-blue-500" },
  REVIEW_REQUESTED_COMISSION: { Icon: ListTodo, colorClass: "text-purple-500" },
  REJEITADOS_COMISSAO: { Icon: XCircle, colorClass: "text-red-500" },
  DESFAZIMENTO: { Icon: Trash, colorClass: "text-green-600" },
  DESCARTADOS: { Icon: Recycle, colorClass: "text-zinc-500" },
};

    
  const getMeta = (statusKey: string) =>
    WORKFLOW_STATUS_META[statusKey] ?? { Icon: HelpCircle, colorClass: "text-zinc-500" };

    return (
         <div className="p-4 md:p-8 gap-8 flex flex-col h-full">
             <Carousel className="w-full flex gap-4 px-4 items-center">
                      <div className="absolute left-0 z-[9]">
                        <CarouselPrevious />
                      </div>
                      <CarouselContent className="gap-4">
                        {WORKFLOWS.map(({ key, name }) => {
              const { Icon } = getMeta(key);
                          return (
                            <CarouselItem key={key} className="basis-1/4">
                              <Alert className="p-0">
                                <CardHeader className="flex gap-8 flex-row items-center justify-between space-y-0 pb-2">
                                  <CardTitle className="text-sm truncate font-medium">{name}</CardTitle>
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">{statsMap[key] || 0}</div>
                                  <p className="text-xs text-muted-foreground">registrados</p>
                                </CardContent>
                              </Alert>
                            </CarouselItem>
                          );
                        })}
                      </CarouselContent>
                      <div className="absolute right-0 z-[9]">
                        <CarouselNext />
                      </div>
                    </Carousel>

                     <div className="">
                                  <GraficoStatusCatalogo
                          stats={statsMap}
                          workflows={WORKFLOWS.map(({ key, name }) => ({ key, name }))}
                          title="Itens do Desfazimento"
                        />
                    
                    
                                 </div>

                                    <ChartTempoRevisaoComissao />


                                    <div className="grid md:grid-cols-2 gap-8">
                                      <ChartTempoRevisaoComissaoPie />
                                    </div>
        </div>
    );
}