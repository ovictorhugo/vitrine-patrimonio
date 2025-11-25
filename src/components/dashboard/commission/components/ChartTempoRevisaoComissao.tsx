// src/components/administrativo/ChartTempoRevisaoComissaoPie.tsx
import React, {
  useCallback,
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
  ChartTooltipContent,
} from "../../../ui/chart";
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Tooltip,
} from "recharts";
import { Skeleton } from "../../../ui/skeleton";
import { toast } from "sonner";
import { UserContext } from "../../../../context/context";
import { useLocation } from "react-router-dom";

type UUID = string;

type ReviewCommissionStat = {
  reviewer_id: UUID;
  reviewer: string;
  total: number;
  d0: number;
  d3: number;
  w1: number;
};

type ChartRow = {
  reviewerId: string;
  reviewerName: string;
  hoje: number;
  ate3dias: number;
  mais1semana: number;
  total: number;
};

const chartConfig = {
  hoje: { label: "Hoje", color: "#15803d" },
  ate3dias: { label: "Até 3 dias", color: "#f9a826" },
  mais1semana: { label: "Acima de 3 dias", color: "#e11d48" },
} satisfies ChartConfig;

export function ChartTempoRevisaoComissaoPie() {
  const { urlGeral } = useContext(UserContext);
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ChartRow[]>([]);

  // ✅ memoiza token pra não disparar refetch “do nada”
  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("jwt_token");
  }, []);

  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const buildParamsFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const allowedKeys = [
      "q",
      "material_id",
      "legal_guardian_id",
      "unit_id",
      "agency_id",
      "sector_id",
      "location_id",
    ];
    const out = new URLSearchParams();
    for (const k of allowedKeys) {
      const v = params.get(k);
      if (v) out.set(k, v);
    }
    return out;
  }, [location.search]);

  useEffect(() => {
    if (!urlGeral) return;

    const controller = new AbortController();

    const fetchStats = async () => {
      setLoading(true);
      try {
        const params = buildParamsFromUrl();
        const query = params.toString();

        const url = `${urlGeral}statistics/catalog/stats/review-commission?workflow_status=REVIEW_REQUESTED_COMISSION${
          query ? `&${query}` : ""
        }`;

        const res = await fetch(url, {
          method: "GET",
          headers: authHeaders,
          signal: controller.signal,
        });

        if (!res.ok) throw new Error();

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
      } catch (err: any) {
        // ✅ se foi abort, ignora sem limpar nada
        if (err?.name === "AbortError") return;

        console.error(err);
        toast.error("Falha ao carregar gráfico de tempo geral.");
        // ✅ NÃO zera data aqui → evita “some depois”
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();

    return () => controller.abort();
  }, [urlGeral, authHeaders, buildParamsFromUrl]);

  // ===== agregação das faixas (para o gráfico)
  const totalsByBucket = useMemo(() => {
    if (!data.length) return { hoje: 0, ate3dias: 0, mais1semana: 0 };

    return data.reduce(
      (acc, row) => {
        acc.hoje += row.hoje;
        acc.ate3dias += row.ate3dias;
        acc.mais1semana += row.mais1semana;
        return acc;
      },
      { hoje: 0, ate3dias: 0, mais1semana: 0 }
    );
  }, [data]);

  // ✅ total geral agora vem do backend
  const totalGeral = useMemo(
    () => data.reduce((sum, row) => sum + (row.total ?? 0), 0),
    [data]
  );

  const chartData = [
    {
      name: "tempo-comissao",
      hoje: totalsByBucket.hoje,
      ate3dias: totalsByBucket.ate3dias,
      mais1semana: totalsByBucket.mais1semana,
    },
  ];

  if (loading && data.length === 0) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            Tempo em avaliação geral
          </CardTitle>
          <CardDescription className="line-clamp-1">
            Distribuição dos itens por faixa de tempo desde a entrada em revisão
            pela comissão (LTD).
          </CardDescription>
        </div>
      </CardHeader>

      <div className="p-6 pt-0">
        <ChartContainer
          config={chartConfig}
          className="w-full mx-auto aspect-square max-h-[320px]"
        >
          <RadialBarChart data={chartData} innerRadius="60%" outerRadius="100%">
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" hideLabel />}
            />

            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy || 0}
                          className="dark:fill-white text-3xl font-bold"
                        >
                          {totalGeral.toLocaleString("pt-BR")}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="dark:fill-white text-xs"
                        >
                          Total de itens
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>

            <RadialBar
              dataKey="hoje"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.hoje.color}
              className="stroke-transparent stroke-2"
              name="hoje"
            />
            <RadialBar
              dataKey="ate3dias"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.ate3dias.color}
              className="stroke-transparent stroke-2"
              name="ate3dias"
            />
            <RadialBar
              dataKey="mais1semana"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.mais1semana.color}
              className="stroke-transparent stroke-2"
              name="mais1semana"
            />
          </RadialBarChart>
        </ChartContainer>
      </div>
    </Alert>
  );
}

export default ChartTempoRevisaoComissaoPie;
