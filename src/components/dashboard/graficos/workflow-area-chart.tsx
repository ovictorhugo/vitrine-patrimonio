"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import { useTheme } from "next-themes";

type WorkflowMetaItem = {
  key: string;
  name: string;
  Icon?: React.ComponentType<{ className?: string }>;
};

type Props = {
  tab: "vitrine" | "desfazimento";
  statsMap: Record<string, number>;
  loading?: boolean;

  workflowMeta: Record<string, WorkflowMetaItem | undefined>;
  flowVitrineKeys: readonly string[];
  flowDesfazimentoKeys: readonly string[];

  className?: string;
};

export function WorkflowAreaChart({
  tab,
  statsMap,
  loading = false,
  workflowMeta,
  flowVitrineKeys,
  flowDesfazimentoKeys,
  className,
}: Props) {
  const { theme } = useTheme();

  // ===== União de todos os status das duas abas =====
  const allKeys = React.useMemo(() => {
    const set = new Set<string>([
      ...flowVitrineKeys,
      ...flowDesfazimentoKeys,
    ]);
    return Array.from(set);
  }, [flowVitrineKeys, flowDesfazimentoKeys]);

  // ===== Monta dados com 2 séries: vitrine e desfazimento =====
  const chartData = React.useMemo(() => {
    return allKeys.map((key) => {
      const meta = workflowMeta[key];
      const label = meta?.name ?? key;

      return {
        status: label,
        vitrine: flowVitrineKeys.includes(key) ? (statsMap[key] ?? 0) : 0,
        desfazimento: flowDesfazimentoKeys.includes(key)
          ? (statsMap[key] ?? 0)
          : 0,
      };
    });
  }, [
    allKeys,
    statsMap,
    workflowMeta,
    flowVitrineKeys,
    flowDesfazimentoKeys,
  ]);

  const chartConfig = React.useMemo(
    () =>
      ({
        vitrine: {
          label: "Vitrine",
          color: "#579eba",
        },
        desfazimento: {
          label: "Desfazimento",
          color: "#579eba",
        },
      }) satisfies ChartConfig,
    []
  );

  // ===== Qual série fica em área (destacada) =====
  const visibleKey = tab === "vitrine" ? "vitrine" : "desfazimento";
  const hiddenKey = tab === "vitrine" ? "desfazimento" : "vitrine";

  // linha de fundo fica mais neutra no claro/escuro
  const backgroundStroke = theme === "dark" ? "#404040" : "#A3A3A3";

  return (
           <div className="h-[0vh] z-[-1] ">
      <div className="relative h-[55vh] w-full opacity-45">
        {/* ===== 1) FUNDO: LINE CHART com a série não destacada ===== */}
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart data={chartData} margin={{ left: 0, right: 0, bottom: 50 }}>
      

         
            {/* Série de fundo (linha) */}
            <Line
              dataKey={hiddenKey}
              type="monotone"
              stroke={backgroundStroke}
              strokeWidth={6}
              strokeOpacity={0.55}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>

        {/* ===== 2) TOPO: AREA CHART com a série destacada ===== */}
        <ChartContainer
          config={chartConfig}
          className="absolute inset-0 h-full w-full pointer-events-none"
        >
          <AreaChart data={chartData} margin={{ left: 0, right: 0, bottom: 50 }}>
            <defs>
              <linearGradient id="fillMain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#579eba" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#579eba" stopOpacity={0} />
              </linearGradient>
            </defs>

            <Area
              dataKey={visibleKey}
              type="monotone"
              stroke="#579eba"
              fill="url(#fillMain)"
              fillOpacity={0.5}
              strokeWidth={6}
              dot={false}
              isAnimationActive={false}
            />

          
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
