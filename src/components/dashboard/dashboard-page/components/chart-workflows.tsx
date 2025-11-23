import React, { useEffect, useState } from "react";
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

type WorkflowMeta = {
  key: string;
  name: string;
};

const chartConfig = {
  count: {
    label: "Itens",
    color: "#579eba",
  },
} satisfies ChartConfig;

type GraficoStatusCatalogoProps = {
  stats: Record<string, number>;
  workflows: WorkflowMeta[];
  title?: string;
};

type ChartItem = {
  status: string;
  label: string;
  count: number | undefined;
};

const MAX_LABEL_LENGTH = 14;

const truncateLabel = (label: string) =>
  label.length > MAX_LABEL_LENGTH
    ? label.slice(0, MAX_LABEL_LENGTH) + "…"
    : label;

export function GraficoStatusCatalogo({
  stats,
  workflows,
  title = "Itens por status",
}: GraficoStatusCatalogoProps) {
  const [chartData, setChartData] = useState<ChartItem[]>([]);

  useEffect(() => {
    const data = workflows.map((w) => ({
      status: w.key,
      label: w.name,
      count: stats[w.key] ?? 0,
    }));

    setChartData(data);
  }, [stats, workflows]);

  const filteredChartData = chartData.map((d) => ({
    ...d,
    count: d.count === 0 ? undefined : d.count,
  }));

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          {title && (
            <CardTitle className="text-sm font-medium">
              {title}
            </CardTitle>
          )}
          <CardDescription>
            Distribuição dos itens por status
          </CardDescription>
        </div>
      </CardHeader>

      <div className="flex flex-1 p-6 pt-0">
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={filteredChartData}
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
      </div>
    </Alert>
  );
}
