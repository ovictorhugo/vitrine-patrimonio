import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, LabelList, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../ui/chart";
import { Alert } from "../../../ui/alert";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip";
import { Info } from "lucide-react";

interface Patrimonio {
  bem_cod: string;
  csv_cod: string;
  bem_sta: string;
}

const statusConfig = {
  NO: { label: "Normal", color: "#22C55E" },          // verde
  NI: { label: "Não inventariado", color: "#EF4444" }, // vermelho
  CA: { label: "Cadastrado", color: "#3B82F6" },       // azul
  TS: { label: "Aguardando aceite", color: "#EAB308" },// amarelo
  MV: { label: "Movimentado", color: "#8B5CF6" },      // roxo
  BX: { label: "Baixado", color: "#8B5CF6" },  
} as const;

export function GraficoBemSta({ patrimoniolist }: { patrimoniolist: Patrimonio[] }) {
  const [chartData, setChartData] = useState<{ bem_sta: string; count: number }[]>([]);

  useEffect(() => {
    const counts: { [key: string]: number } = {
      NO: 0,
      NI: 0,
      CA: 0,
      TS: 0,
      MV: 0,
      BX: 0
    };

    patrimoniolist.forEach((item) => {
      const bemSta = item.bem_sta;
      if (counts.hasOwnProperty(bemSta)) {
        counts[bemSta]++;
      }
    });

    const data = Object.entries(counts).map(([bem_sta, count]) => ({
      bem_sta,
      count,
    }));

    setChartData(data);
  }, [patrimoniolist]);

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Quantidade de bens por status</CardTitle>
          <CardDescription>Status de inventário de cada bem</CardDescription>
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
        <ChartContainer config={statusConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="bem_sta" tickLine={false} tickMargin={10} axisLine={false} />
              <CartesianGrid vertical={false} horizontal={false} />
          
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />

              <Bar dataKey="count" radius={4}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={'#559FB8'}
                  />
                ))}
                <LabelList dataKey="count" position="top"  fill="#8C8C8C"  offset={12} className="fill-foreground" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Alert>
  );
}
