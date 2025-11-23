import React, { useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "../../ui/alert";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import { CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { UserContext } from "../../../context/context";
import { useLocation } from "react-router-dom";

// ====== Tipos do retorno da API ======
type ApiItem = {
  id: string;
  name: string;   // eixo X
  status: string; // chave do workflow/status
  count: number;
};

// ====== Workflows (ordem e nomes amigáveis) ======
export const WORKFLOWS = [
  { key: "REVIEW_REQUESTED_VITRINE", name: "Avaliação S. Patrimônio - Vitrine" },
  { key: "ADJUSTMENT_VITRINE", name: "Ajustes - Vitrine" },
  { key: "VITRINE", name: "Anunciados" },
  { key: "AGUARDANDO_TRANSFERENCIA", name: "Aguardando transferência" },
  { key: "TRANSFERIDOS", name: "Transferidos" },

  { key: "REVIEW_REQUESTED_DESFAZIMENTO", name: "Avaliação S. Patrimônio - Desfazimento" },
  { key: "ADJUSTMENT_DESFAZIMENTO", name: "Ajustes - Desfazimento" },
  { key: "REVIEW_REQUESTED_COMISSION", name: "LTD - Lista Temporária de Desfazimento" },
  { key: "REJEITADOS_COMISSAO", name: "Recusados" },
  { key: "DESFAZIMENTO", name: "LFD - Lista Final de Desfazimento" },
  { key: "DESCARTADOS", name: "Processo Finalizado" },
] as const;

type WorkflowKey = typeof WORKFLOWS[number]["key"];

// ====== Cores configuráveis por status ======
export const STATUS_COLORS: Record<WorkflowKey, string> = {
  REVIEW_REQUESTED_VITRINE: "#579eba",
  ADJUSTMENT_VITRINE: "#8fbf7f",
  VITRINE: "#f2c94c",
  AGUARDANDO_TRANSFERENCIA: "#bb6bd9",
  TRANSFERIDOS: "#27ae60",

  REVIEW_REQUESTED_DESFAZIMENTO: "#2d9cdb",
  ADJUSTMENT_DESFAZIMENTO: "#f2994a",
  REVIEW_REQUESTED_COMISSION: "#56ccf2",
  REJEITADOS_COMISSAO: "#eb5757",
  DESFAZIMENTO: "#9b51e0",
  DESCARTADOS: "#6fcf97",
};

// ====== ChartConfig dinâmico baseado nos workflows ======
const chartConfig: ChartConfig = WORKFLOWS.reduce((acc, w) => {
  acc[w.key] = {
    label: w.name,
    color: STATUS_COLORS[w.key],
  };
  return acc;
}, {} as ChartConfig);

// ====== Helpers de label ======
const MAX_LABEL_LENGTH = 14;
const truncateLabel = (label: string) =>
  label.length > MAX_LABEL_LENGTH
    ? label.slice(0, MAX_LABEL_LENGTH) + "…"
    : label;

// ====== Tipo do item do gráfico ======
// adicionamos "total" pra mostrar no topo
type ChartRow = {
  label: string; // name
  total?: number | undefined;
} & Partial<Record<WorkflowKey, number | undefined>>;

// ====== Helpers URL ======
const first = (v: string | null) => (v ? v.split(";").filter(Boolean)[0] ?? "" : "");
const sanitizeBaseUrl = (u?: string) => (u || "").replace(/\/+$/, "");
const pickParam = (sp: URLSearchParams, pluralKey: string, singularKey: string) =>
  first(sp.get(pluralKey) || sp.get(singularKey));

export function GraficoStatusCatalogoPorAgencia() {
  const { urlGeral } = useContext(UserContext);
  const location = useLocation();

  const baseUrl = useMemo(() => sanitizeBaseUrl(urlGeral), [urlGeral]);

  const token = useMemo(() => localStorage.getItem("jwt_token"), []);

  const authHeaders: HeadersInit = useMemo(() => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [rows, setRows] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ lê filtros atuais da URL e cria params singulares pro backend
  const filtersParams = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const params = new URLSearchParams();

    const q = sp.get("q");
    const materialId = pickParam(sp, "material_ids", "material_id");
    const guardianId = pickParam(sp, "legal_guardian_ids", "legal_guardian_id");
    const locationId = pickParam(sp, "location_ids", "location_id");
    const unitId = pickParam(sp, "unit_ids", "unit_id");
    const agencyId = pickParam(sp, "agency_ids", "agency_id");
    const sectorId = pickParam(sp, "sector_ids", "sector_id");

    // extras
    const reviewerId = pickParam(sp, "reviewer_ids", "reviewer_id");
    const userId = pickParam(sp, "user_ids", "user_id");

    if (q) params.set("q", q);
    if (materialId) params.set("material_id", materialId);
    if (guardianId) params.set("legal_guardian_id", guardianId);
    if (locationId) params.set("location_id", locationId);
    if (unitId) params.set("unit_id", unitId);
    if (agencyId) params.set("agency_id", agencyId);
    if (sectorId) params.set("sector_id", sectorId);
    if (reviewerId) params.set("reviewer_id", reviewerId);
    if (userId) params.set("user_id", userId);

    return params;
  }, [location.search]);

  // ====== Fetch ======
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const url = new URL(
          `${baseUrl}/statistics/catalog/workflow-status-grouped/agency`
        );
        filtersParams.forEach((v, k) => url.searchParams.set(k, v));

        const res = await fetch(url.toString(), {
          headers: authHeaders,
        });

        if (!res.ok) {
          throw new Error(`Erro ${res.status} ao buscar estatísticas`);
        }

        const data: ApiItem[] = await res.json();
        if (!isMounted) return;

        // ====== Agrupa por name, separando status ======
        const map = new Map<string, ChartRow>();

        data.forEach((item) => {
          const name = item.name?.trim() || "Sem nome";
          const status = item.status as WorkflowKey;

          if (!map.has(name)) {
            map.set(name, { label: name });
          }

          const row = map.get(name)!;
          row[status] = item.count === 0 ? undefined : item.count;
        });

        const finalRows = Array.from(map.values()).map((r) => {
          const filled: ChartRow = { label: r.label };

          let total = 0;
          WORKFLOWS.forEach((w) => {
            const v = r[w.key] ?? 0;
            // se for undefined, conta como 0
            total += v;
            filled[w.key] = r[w.key] ?? undefined;
          });

          filled.total = total === 0 ? undefined : total;
          return filled;
        });

        setRows(finalRows);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Erro ao carregar dados");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (baseUrl) fetchData();

    return () => {
      isMounted = false;
    };
  }, [baseUrl, authHeaders, filtersParams]);

  const filteredChartData = useMemo(() => rows, [rows]);

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
          Visualização por departamento/setor
          </CardTitle>
          <CardDescription>
            Cada coluna representa um departamento/setor com os status empilhados
          </CardDescription>
        </div>
      </CardHeader>

      <div className="flex flex-1 p-6 pt-0">
        {loading && (
          <div className="w-full h-[320px] flex items-center justify-center text-sm text-muted-foreground">
            Carregando gráfico...
          </div>
        )}

        {!loading && error && (
          <div className="w-full h-[320px] flex items-center justify-center text-sm text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && (
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
                  tickFormatter={truncateLabel}
                />

                <CartesianGrid vertical={false} horizontal={false} />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />

                {WORKFLOWS.map((w, idx) => (
                  <Bar
                    key={w.key}
                    dataKey={w.key}
                    fill={chartConfig[w.key].color}
                    radius={4}
                    stackId="a"
                  >
                    {/* ✅ total somente no topo da pilha */}
                    {idx === WORKFLOWS.length - 1 && (
                      <LabelList
                        dataKey="total"
                        position="top"
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    )}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </Alert>
  );
}
