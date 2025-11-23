import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ResponsiveContainer, Treemap } from "recharts";
import { Alert } from "../../ui/alert";
import { CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { UserContext } from "../../../context/context";
import {
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import { STATUS_COLORS, WORKFLOWS } from "./GraficoStatusCatalogoPorAgencia";

// ====== Tipos do retorno da API ======
type ApiItem = {
  id: string;
  name: string;   // sala
  status: string; // workflow/status
  count: number;
};

type WorkflowKey = typeof WORKFLOWS[number]["key"];

// ====== Helpers URL ======
const first = (v: string | null) =>
  v ? v.split(";").filter(Boolean)[0] ?? "" : "";

const sanitizeBaseUrl = (u?: string) => (u || "").replace(/\/+$/, "");

const pickParam = (sp: URLSearchParams, pluralKey: string, singularKey: string) =>
  first(sp.get(pluralKey) || sp.get(singularKey));

// ====== Tipos do Treemap ======
type TreemapChild = {
  name: string;     // nome amigável do status
  size: number;     // SEMPRE number
  statusKey: WorkflowKey;
  fill: string;

  // metadata p/ tooltip
  parentName: string;
  parentTotal: number;
  breakdown: {
    name: string;
    size: number;
    fill: string;
    statusKey: WorkflowKey;
  }[];
};

type TreemapNode = {
  name: string;           // sala
  children: TreemapChild[]; // status agrupados dentro da sala
  total: number;
};

// ====== Tooltip shadcn custom ======
function TreemapTooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const node = payload[0]?.payload as any;
  if (!node) return null;

  const isLeaf = node.statusKey !== undefined;

  const sala = isLeaf ? node.parentName : node.name;
  const total = isLeaf ? node.parentTotal : node.total;
  const breakdown = isLeaf ? node.breakdown : node.children;

  return (
    <div className="space-y-2">
      <div className="font-medium">{sala}</div>
      <div className="text-muted-foreground">Total: {total}</div>

      {Array.isArray(breakdown) && breakdown.length > 0 && (
        <div className="space-y-1">
          {breakdown
            .filter((b: any) => (b.size ?? 0) > 0)
            .map((b: any) => (
              <div key={b.statusKey || b.name} className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ background: b.fill }}
                />
                <span className="flex-1 truncate">{b.name}</span>
                <span className="tabular-nums">{b.size}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ====== Conteúdo custom (defensivo) ======
function TreemapContent(props: any) {
  const { depth, x, y, width, height, name, payload } = props;

  if (width <= 2 || height <= 2) return null;

  const isParent = depth === 1;
  const isLeaf = depth >= 2;

  // ✅ payload pode ser undefined em alguns níveis
  const leafFill =
    payload?.fill ||
    payload?.color ||
    "var(--primary, #8884d8)";

  const fill = isLeaf ? leafFill : "var(--muted, #11182722)";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        ry={6}
        style={{
          fill,
          stroke: "var(--border, #ffffff)",
          strokeWidth: 1,
        }}
      />

      {/* Label só nos pais (salas) */}
      {isParent && width > 80 && height > 36 && (
        <>
          <text
            x={x + 8}
            y={y + 18}
            fill="var(--foreground, #111827)"
            fontSize={12}
            fontWeight={600}
          >
            {String(name).length > 24 ? String(name).slice(0, 24) + "…" : name}
          </text>

          <text
            x={x + 8}
            y={y + 34}
            fill="var(--muted-foreground, #6b7280)"
            fontSize={11}
          >
            Total: {payload?.total ?? 0}
          </text>
        </>
      )}
    </g>
  );
}

export function GraficoStatusCatalogoPorLocationTreemap() {
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

  const [treeData, setTreeData] = useState<TreemapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ filtros atuais da URL (singularizados)
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

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const url = new URL(
          `${baseUrl}/statistics/catalog/workflow-status-grouped/location`
        );
        filtersParams.forEach((v, k) => url.searchParams.set(k, v));

        const res = await fetch(url.toString(), { headers: authHeaders });
        if (!res.ok) {
          throw new Error(`Erro ${res.status} ao buscar estatísticas`);
        }

        const data: ApiItem[] = await res.json();
        if (!isMounted) return;

        // ====== AGRUPA STATUS POR NAME (sala) ======
        const bySala = new Map<string, Map<WorkflowKey, number>>();

        data.forEach((item) => {
          const sala = item.name?.trim() || "Sem nome";
          const status = item.status as WorkflowKey;

          if (!bySala.has(sala)) bySala.set(sala, new Map());
          const m = bySala.get(sala)!;
          m.set(status, (m.get(status) ?? 0) + Number(item.count ?? 0));
        });

        // ====== Monta hierarquia: 1 nó por sala, filhos por status ======
        const nodes: TreemapNode[] = Array.from(bySala.entries())
          .map(([sala, stMap]) => {
            const childrenBase = WORKFLOWS
              .map((w) => {
                const size = Number(stMap.get(w.key) ?? 0);
                return {
                  name: w.name,
                  size,
                  statusKey: w.key,
                  fill: STATUS_COLORS[w.key],
                };
              })
              .filter((c) => c.size > 0);

            const total = childrenBase.reduce((s, c) => s + c.size, 0);

            const children: TreemapChild[] = childrenBase.map((c) => ({
              ...c,
              parentName: sala,
              parentTotal: total,
              breakdown: childrenBase,
            }));

            return { name: sala, children, total };
          })
          .filter((n) => n.total > 0);

        setTreeData(nodes);
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

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            Visualização por sala (Treemap)
          </CardTitle>
          <CardDescription>
            Cada bloco é uma sala proporcional ao total, com status internos
          </CardDescription>
        </div>
      </CardHeader>

      <div className="flex flex-1 p-6 pt-0">
        {loading && (
          <div className="w-full h-[420px] flex items-center justify-center text-sm text-muted-foreground">
            Carregando gráfico...
          </div>
        )}

        {!loading && error && (
          <div className="w-full h-[420px] flex items-center justify-center text-sm text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && treeData.length === 0 && (
          <div className="w-full h-[420px] flex items-center justify-center text-sm text-muted-foreground">
            Nenhum dado para exibir com os filtros atuais.
          </div>
        )}

        {!loading && !error && treeData.length > 0 && (
          <div style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treeData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
                content={<TreemapContent />}
                isAnimationActive={false}   // ✅ sem animação inicial
              >
              
              </Treemap>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Alert>
  );
}
