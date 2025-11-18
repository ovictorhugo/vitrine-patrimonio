"use client";

import { Label, Legend, PolarRadiusAxis, RadialBar, RadialBarChart, Tooltip } from "recharts";

import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "../../../ui/chart";
import { Alert } from "../../../ui/alert";

type DesfazimentoRadialProps = {
  // Record com os counts por status, ex:
  // { REVIEW_REQUESTED_DESFAZIMENTO: 3, DESFAZIMENTO: 10, DESCARTADOS: 5, ... }
  counts: Record<string, number>;
};

const chartConfig = {
  andamento: {
    label: "Em andamento",
    color: "#579eba", // cinza/azulado
  },
  concluidos: {
    label: "Concluídos",
    color: "#064471", // azul forte
  },
} satisfies ChartConfig;

export function ChartRadialDesfazimento({ counts }: DesfazimentoRadialProps) {
  const emAndamentoKeys = [
    "REVIEW_REQUESTED_DESFAZIMENTO",
    "ADJUSTMENT_DESFAZIMENTO",
    "REVIEW_REQUESTED_COMISSION",
    "REJEITADOS_COMISSAO",
  ];

  const concluidosKeys = ["DESFAZIMENTO", "DESCARTADOS"];

  const emAndamento = emAndamentoKeys.reduce(
    (acc, key) => acc + (counts[key] ?? 0),
    0
  );

  const concluidos = concluidosKeys.reduce(
    (acc, key) => acc + (counts[key] ?? 0),
    0
  );

  const total = emAndamento + concluidos;

  const chartData = [
    {
      name: "desfazimento",
      andamento: emAndamento,
      concluidos: concluidos,
    },
  ];

  return (
   <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            Desfazimento
          </CardTitle>
          <CardDescription>
            Distribuição dos itens por status
          </CardDescription>
        </div>
      </CardHeader>

      {/* Gráfico ocupando o máximo do espaço */}
      <div className="flex-1 px-2 pb-4">
        <ChartContainer
          config={chartConfig}
          className="w-full mx-auto aspect-square max-h-[320px]"
        >
          <RadialBarChart
            data={chartData}
            innerRadius="60%"   // inner < outer, senão some
            outerRadius="100%"
          >
            {/* Tooltip nativo do Recharts usando seu conteúdo customizado */}
            <Tooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                   hideLabel
                />
              }
            />

           

            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy || 0}
                          className="dark:fill-white text-3xl font-bold"
                        >
                          {total.toLocaleString("pt-BR")}
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

            {/* Em andamento */}
            <RadialBar
              dataKey="andamento"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.andamento.color}
              className="stroke-transparent stroke-2"
              name="andamento"
            />

            {/* Concluídos */}
            <RadialBar
              dataKey="concluidos"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.concluidos.color}
              className="stroke-transparent stroke-2"
              name="concluidos"
            />
          </RadialBarChart>
        </ChartContainer>
      </div>
    </Alert>
  );
}
