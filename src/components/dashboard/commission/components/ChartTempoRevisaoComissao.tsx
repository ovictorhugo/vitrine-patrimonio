// src/components/administrativo/ChartTempoRevisaoComissao.tsx
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert } from "../../../ui/alert";
import { CardHeader, CardTitle, CardDescription } from "../../../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "../../../ui/skeleton";
import { toast } from "sonner";
import { UserContext } from "../../../../context/context";

type UUID = string;

/* ========================= Tipos ========================= */

// Resposta do endpoint /statistics/catalog/stats/review-commission
type ReviewCommissionStat = {
  reviewer_id: UUID;
  reviewer: string;
  total: number;
  d0: number; // Hoje
  d3: number; // Até 3 dias
  w1: number; // Acima de 3 dias
};

type ChartRow = {
  reviewerId: string;
  reviewerName: string;
  hoje: number;
  ate3dias: number;
  mais1semana: number;
  total: number;
};

type PieDataItem = {
  browser: "hoje" | "ate3dias" | "mais1semana";
  visitors: number;
};

/* ========================= Config do gráfico ========================= */

const chartConfig = {
  hoje: {
    label: "Hoje",
    color: "#15803d",
  },
  ate3dias: {
    label: "Até 3 dias",
    color: "#f9a826",
  },
  mais1semana: {
    label: "Acima de 3 dias",
    color: "#e11d48",
  },
} satisfies ChartConfig;

/* ========================= Componente ========================= */

export function ChartTempoRevisaoComissaoPie() {
  const { urlGeral } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ChartRow[]>([]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;

  /* --------- Fetch estatísticas agregadas --------- */
  useEffect(() => {
    if (!urlGeral) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${urlGeral}statistics/catalog/stats/review-commission`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Falha ao carregar estatísticas da comissão");
        }

        const json: ReviewCommissionStat[] = await res.json();

        const rows: ChartRow[] = (json ?? []).map((item) => {
          const hoje = item.d0 ?? 0;
          const ate3dias = item.d3 ?? 0;
          const mais1semana = item.w1 ?? 0;
          const total =
            typeof item.total === "number"
              ? item.total
              : hoje + ate3dias + mais1semana;

          return {
            reviewerId: item.reviewer_id,
            reviewerName: item.reviewer || "Usuário",
            hoje,
            ate3dias,
            mais1semana,
            total,
          };
        });

        setData(rows);
      } catch (err) {
        console.error(err);
        toast.error("Falha ao carregar gráfico de tempo por revisor.");
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, [urlGeral, token]);

  /* --------- Dados agregados para o gráfico de pizza --------- */
  const chartData: PieDataItem[] = useMemo(() => {
    if (!data.length) {
      return [
        { browser: "hoje",        visitors: 0 },
        { browser: "ate3dias",    visitors: 0 },
        { browser: "mais1semana", visitors: 0 },
      ];
    }

    const totals = data.reduce(
      (acc, row) => {
        acc.hoje += row.hoje;
        acc.ate3dias += row.ate3dias;
        acc.mais1semana += row.mais1semana;
        return acc;
      },
      { hoje: 0, ate3dias: 0, mais1semana: 0 }
    );

    return [
      { browser: "hoje",        visitors: totals.hoje },
      { browser: "ate3dias",    visitors: totals.ate3dias },
      { browser: "mais1semana", visitors: totals.mais1semana },
    ];
  }, [data]);

  const totalGeral = useMemo(
    () => chartData.reduce((sum, item) => sum + item.visitors, 0),
    [chartData]
  );

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            Tempo em avaliação geral
          </CardTitle>
          <CardDescription>
            Distribuição dos itens por faixa de tempo desde a entrada em revisão
            pela comissão (LTD).
          </CardDescription>
        </div>
       
      </CardHeader>

      <div className="p-6 pt-0">


        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
            >
              {chartData.map((slice) => (
                <Cell
                  key={slice.browser}
                  fill={
                    chartConfig[slice.browser].color
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    </Alert>
  );
}

export default ChartTempoRevisaoComissaoPie;
