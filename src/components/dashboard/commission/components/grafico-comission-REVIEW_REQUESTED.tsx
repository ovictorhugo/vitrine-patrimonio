// src/components/administrativo/ChartTempoRevisaoComissao.tsx
import React, { useContext, useEffect, useState, useCallback } from "react";
import { Alert } from "../../../ui/alert";
import { CardHeader, CardTitle, CardDescription } from "../../../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../ui/chart";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  LabelList,
} from "recharts";
import { Skeleton } from "../../../ui/skeleton";
import { toast } from "sonner";
import { UserContext } from "../../../../context/context";
import { useLocation } from "react-router-dom";

type UUID = string;

/* ========================= Tipos ========================= */

const MAX_LABEL_LENGTH = 14;

const truncateLabel = (label: string) =>
  label.length > MAX_LABEL_LENGTH
    ? label.slice(0, MAX_LABEL_LENGTH) + "…"
    : label;

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

export function ChartTempoRevisaoComissao() {
  const { urlGeral } = useContext(UserContext);
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ChartRow[]>([]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;

  // lê filtros da URL e devolve só os permitidos
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

  /* --------- Fetch estatísticas agregadas --------- */
  useEffect(() => {
    if (!urlGeral) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const params = buildParamsFromUrl();
        const query = params.toString();
        const url = `${urlGeral}statistics/catalog/stats/review-commission${
          query ? `?${query}` : ""
        }`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

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
  }, [urlGeral, token, buildParamsFromUrl]);

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            Tempo em avaliação por revisor
          </CardTitle>
          <CardDescription>
            Quantidade de itens por faixa de tempo desde a entrada em revisão
            pela comissão (LTD).
          </CardDescription>
        </div>
      </CardHeader>

      <div className="flex flex-1 p-6 pt-0">
        <ChartContainer config={chartConfig} className="h-[320px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            >
           <XAxis
  dataKey="reviewerName"
  tickLine={false}

  axisLine={false}
 





/>

              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />

              <Bar
                dataKey="hoje"
                stackId="tempo"
                fill="var(--color-hoje)"
                radius={4}
              />
              <Bar
                dataKey="ate3dias"
                stackId="tempo"
                fill="var(--color-ate3dias)"
                radius={4}
              />
              <Bar
                dataKey="mais1semana"
                stackId="tempo"
                fill="var(--color-mais1semana)"
                radius={4}
              >
                <LabelList
                  dataKey="total"
                  position="top"
                  formatter={(value: number) =>
                    value && value > 0 ? value.toString() : ""
                  }
                  style={{ fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Alert>
  );
}

export default ChartTempoRevisaoComissao;
