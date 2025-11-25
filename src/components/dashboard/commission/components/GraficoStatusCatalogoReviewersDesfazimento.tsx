import React, { useEffect, useState, useContext } from "react";
import { Alert } from "../../../ui/alert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../ui/chart";
import { CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { UserContext } from "../../../../context/context";

// Definindo o tipo do gráfico
const chartConfig = {
  count: {
    label: "Itens",
    color: "#579eba",
  },
};

type ChartItem = {
  name: string;  // Nome do revisor
  label: string;
  count: number | undefined;
};

const MAX_LABEL_LENGTH = 14;

const truncateLabel = (label: string) =>
  label.length > MAX_LABEL_LENGTH
    ? label.slice(0, MAX_LABEL_LENGTH) + "…"
    : label;

export function GraficoStatusCatalogoReviewersDesfazimento() {
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { urlGeral } = useContext(UserContext); // Obtém a URL base da API
  const token = localStorage.getItem("jwt_token");

  // Obtém os filtros da URL
  const sp = new URLSearchParams(window.location.search);
  const q = sp.get("q");
  const materialId = pickParam(sp, "material_ids", "material_id");
  const guardianId = pickParam(sp, "legal_guardian_ids", "legal_guardian_id");
  const locationId = pickParam(sp, "location_ids", "location_id");
  const unitId = pickParam(sp, "unit_ids", "unit_id");
  const agencyId = pickParam(sp, "agency_ids", "agency_id");
  const sectorId = pickParam(sp, "sector_ids", "sector_id");
  const workflowStatus = "DESFAZIMENTO"; // Status fixo, mas pode ser dinâmico se necessário

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // Adiciona os parâmetros de filtro na URL
        if (materialId) params.set("material_id", materialId);
        if (guardianId) params.set("legal_guardian_id", guardianId);
        if (locationId) params.set("location_id", locationId);
        if (unitId) params.set("unit_id", unitId);
        if (agencyId) params.set("agency_id", agencyId);
        if (sectorId) params.set("sector_id", sectorId);
        if (q) params.set("q", q);

        // Monta a URL completa com parâmetros
        const url = `${urlGeral}statistics/catalog/stats/review-commission?workflow_status=${workflowStatus}&${params.toString()}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Erro ao buscar os dados");

        const data = await res.json();
        const stats = data.reduce((acc: Record<string, number>, item: any) => {
          acc[item.reviewer_id] = item.total; // Assume-se que "total" é a quantidade total de itens
          return acc;
        }, {});

        const chartFormattedData = data.map((item: any) => ({
          name: item.reviewer, // Agora estamos utilizando 'reviewer' como o nome da coluna
          label: item.reviewer, // Nome do revisor como rótulo da barra
          count: item.total, // O total de itens avaliados
        }));

        setChartData(chartFormattedData);
      } catch (error) {
        console.error("Erro ao carregar os dados do gráfico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlGeral, token, materialId, guardianId, locationId, unitId, agencyId, sectorId, q]);

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Distribuição dos itens por revisor</CardTitle>
          <CardDescription>
            Total de itens avaliados por cada revisor
          </CardDescription>
        </div>
      </CardHeader>

      <div className="flex flex-1 p-6 pt-0">
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                />
                <CartesianGrid vertical={false} horizontal={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="count"
                  name={chartConfig.count.label}
                  fill={chartConfig.count.color}
                  radius={4}
                >
                  <LabelList
                    dataKey="count"
                    position="top"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </Alert>
  );
}

// Função pickParam para buscar os parâmetros da URL
function pickParam(sp: URLSearchParams, primaryKey: string, fallbackKey: string) {
  const value = sp.get(primaryKey);
  return value ? value : sp.get(fallbackKey);
}
