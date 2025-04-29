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
  set_nom: string;
  org_nom: string;
}

// Definindo configuração para o ChartContainer (se quiser personalizar mais depois)
const chartConfig = {
    org_nom: {
        label: "Organização",
        color: "#559FB8",
      },
};

export function GraficoOrgNom({ patrimoniolist }: { patrimoniolist: Patrimonio[] }) {
  const [chartData, setChartData] = useState<{ org_nom: string; count: number }[]>([]);

  useEffect(() => {
    const counts: { [key: string]: number } = {};

    patrimoniolist.forEach((item) => {
      const orgNom = item.org_nom || "Não informado";
      counts[orgNom] = (counts[orgNom] || 0) + 1;
    });

    const data = Object.entries(counts).map(([org_nom, count]) => ({
      org_nom,
      count,
    }));

    setChartData(data);
  }, [patrimoniolist]);

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Quantidade de bens por órgão</CardTitle>
          <CardDescription>Órgão associado a cada bem inventariado</CardDescription>
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
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="org_nom" tickLine={false} tickMargin={10} axisLine={false} />
              <CartesianGrid vertical={false} horizontal={false} />
           
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />

              <Bar dataKey="count" radius={4}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="#004A75"
                  />
                ))}
                <LabelList dataKey="count" position="top" fill="#8C8C8C" fontSize={12} offset={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Alert>
  );
}
