import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, LabelList, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../ui/chart";
import { Alert } from "../../../ui/alert";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip";
import { Info } from "lucide-react";

interface Patrimonio {
  bem_cod: string;
  csv_cod: string;
}

const chartConfig = {
  BM: {
    label: "Bom",
    color: "#22C55E",
  },
  AE: {
    label: "Anti-Econômico",
    color: "#EF4444",
  },
  IR: {
    label: "Irrecuperável",
    color: "#EAB308",
  },
  OC: {
    label: "Ocioso",
    color: "#3B82F6",
  },

} satisfies ChartConfig;

export function GraficoCsvCod({ patrimoniolist }: { patrimoniolist: Patrimonio[] }) {
  const [chartData, setChartData] = useState<{ csv_cod: string; count: number }[]>([]);

  useEffect(() => {
    const counts: { [key: string]: number } = {
      BM: 0,
      AE: 0,
      IR: 0,
      OC: 0,

    };

    patrimoniolist.forEach((item) => {
      const csvCod = item.csv_cod;
      if (counts.hasOwnProperty(csvCod)) {
        counts[csvCod]++;
      }
    });

    const data = Object.entries(counts).map(([csv_cod, count]) => ({
      csv_cod,
      count,
    }));

    setChartData(data);
  }, [patrimoniolist]);

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Quantidade de bens por código de conservação</CardTitle>
          <CardDescription>Conservação de cada bem</CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Fonte: SICPAT</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 25, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="csv_cod" tickLine={false} tickMargin={10} axisLine={false} />
              <CartesianGrid vertical={false} horizontal={false} />
        
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />

              <Bar dataKey="count" radius={4}>
                {/* Aqui cada coluna recebe a cor correta */}
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartConfig[entry.csv_cod as keyof typeof chartConfig]?.color || "#CCCCCC"}
                  />
                ))}
                <LabelList dataKey="count" position="top" offset={12} className="fill-foreground"    fill="#8C8C8C" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Alert>
  );
}
