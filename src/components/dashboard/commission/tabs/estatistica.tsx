import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Archive,
  Clock,
  HelpCircle,
  Hourglass,
  ListTodo,
  Recycle,
  Store,
  Trash,
  Wrench,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { UserContext } from "../../../../context/context";
import { GraficoStatusCatalogo } from "../../dashboard-page/components/chart-workflows";
import { ChartRadialDesfazimento } from "../../administrativo/components/chart-radial-desfazimento";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../ui/carousel";
import { Alert } from "../../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../../ui/card";
import ChartTempoRevisaoComissao from "../components/grafico-comission-REVIEW_REQUESTED";
import ChartTempoRevisaoComissaoPie from "../components/ChartTempoRevisaoComissao";

import { Combobox } from "../../itens-vitrine/itens-vitrine";
import { Separator } from "../../../ui/separator";
import { Input } from "../../../ui/input";
import { MagnifyingGlass } from "phosphor-react";
import { Button } from "../../../ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "../../../../hooks/use-mobile";

export type StatusCount = { status: string; count: number };

const WORKFLOWS = [
  {
    key: "REVIEW_REQUESTED_DESFAZIMENTO",
    name: "Avaliação S. Patrimônio - Desfazimento",
    Icon: Hourglass,
  },
  {
    key: "ADJUSTMENT_DESFAZIMENTO",
    name: "Ajustes - Desfazimento",
    Icon: Wrench,
  },
  {
    key: "REVIEW_REQUESTED_COMISSION",
    name: "LTD - Lista Temporária de Desfazimento",
    Icon: ListTodo,
  },
  { key: "REJEITADOS_COMISSAO", name: "Recusados", Icon: XCircle },
  {
    key: "DESFAZIMENTO",
    name: "LFD - Lista Final de Desfazimento",
    Icon: Trash,
  },
  { key: "DESCARTADOS", name: "Processo Finalizado", Icon: Recycle },
] as const;

export function Estatistica() {
  const { user, urlGeral } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const baseUrl = useMemo(
    () => (urlGeral || "").replace(/\/+$/, ""),
    [urlGeral]
  );

  // ===== token + headers (do jeito que você pediu)
  const token = useMemo(() => localStorage.getItem("jwt_token"), []);
  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // ===== filtros (estado)
  const [q, setQ] = useState("");
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [guardianId, setGuardianId] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [sectorId, setSectorId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);

  // queries dos combobox
  const [materialQ, setMaterialQ] = useState("");
  const [guardianQ, setGuardianQ] = useState("");
  const [unitQ, setUnitQ] = useState("");
  const [agencyQ, setAgencyQ] = useState("");
  const [sectorQ, setSectorQ] = useState("");
  const [locationQ, setLocationQ] = useState("");

  // listas
  const [materials, setMaterials] = useState<any[]>([]);
  const [guardians, setGuardians] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // loadings
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingGuardians, setLoadingGuardians] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // ===== inicializa lendo URL (1x)
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    setQ(params.get("q") || "");
    setMaterialId(params.get("material_id"));
    setGuardianId(params.get("legal_guardian_id"));
    setUnitId(params.get("unit_id"));
    setAgencyId(params.get("agency_id"));
    setSectorId(params.get("sector_id"));
    setLocationId(params.get("location_id"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== filtros -> URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const setOrDelete = (key: string, val: string | null) => {
      if (val && val !== "") params.set(key, val);
      else params.delete(key);
    };

    setOrDelete("q", q);
    setOrDelete("material_id", materialId);
    setOrDelete("legal_guardian_id", guardianId);
    setOrDelete("unit_id", unitId);
    setOrDelete("agency_id", agencyId);
    setOrDelete("sector_id", sectorId);
    setOrDelete("location_id", locationId);

    params.set("page", "1");

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, materialId, guardianId, unitId, agencyId, sectorId, locationId]);

  // ===== limpar filtros
  const clearFilters = () => {
    setQ("");
    setMaterialId(null);
    setGuardianId(null);
    setUnitId(null);
    setAgencyId(null);
    setSectorId(null);
    setLocationId(null);

    setMaterialQ("");
    setGuardianQ("");
    setUnitQ("");
    setAgencyQ("");
    setSectorQ("");
    setLocationQ("");
  };

  // ===== fetches dos combobox
  const fetchMaterials = useCallback(
    async (search = "") => {
      if (!baseUrl) return;
      try {
        setLoadingMaterials(true);
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        const res = await fetch(`${baseUrl}/materials/?${params.toString()}`, {
          headers: authHeaders,
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setMaterials(json?.materials ?? json ?? []);
      } catch {
        setMaterials([]);
      } finally {
        setLoadingMaterials(false);
      }
    },
    [baseUrl, authHeaders]
  );

  const fetchGuardians = useCallback(
    async (search = "") => {
      if (!baseUrl) return;
      try {
        setLoadingGuardians(true);
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        const res = await fetch(
          `${baseUrl}/legal-guardians/?${params.toString()}`,
          { headers: authHeaders }
        );
        if (!res.ok) throw new Error();
        const json = await res.json();
        setGuardians(json?.legal_guardians ?? json ?? []);
      } catch {
        setGuardians([]);
      } finally {
        setLoadingGuardians(false);
      }
    },
    [baseUrl, authHeaders]
  );

  const fetchUnits = useCallback(
    async (search = "") => {
      if (!baseUrl) return;
      try {
        setLoadingUnits(true);
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        const res = await fetch(`${baseUrl}/units/?${params.toString()}`, {
          headers: authHeaders,
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setUnits(json?.units ?? json ?? []);
      } catch {
        setUnits([]);
      } finally {
        setLoadingUnits(false);
      }
    },
    [baseUrl, authHeaders]
  );

  const fetchAgencies = useCallback(
    async (search = "") => {
      if (!baseUrl || !unitId) return;
      try {
        setLoadingAgencies(true);
        const params = new URLSearchParams();
        params.set("unit_id", unitId);
        if (search) params.set("q", search);
        const res = await fetch(`${baseUrl}/agencies/?${params.toString()}`, {
          headers: authHeaders,
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setAgencies(json?.agencies ?? json ?? []);
      } catch {
        setAgencies([]);
      } finally {
        setLoadingAgencies(false);
      }
    },
    [baseUrl, authHeaders, unitId]
  );

  const fetchSectors = useCallback(
    async (search = "") => {
      if (!baseUrl || !agencyId) return;
      try {
        setLoadingSectors(true);
        const params = new URLSearchParams();
        params.set("agency_id", agencyId);
        if (search) params.set("q", search);
        const res = await fetch(`${baseUrl}/sectors/?${params.toString()}`, {
          headers: authHeaders,
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setSectors(json?.sectors ?? json ?? []);
      } catch {
        setSectors([]);
      } finally {
        setLoadingSectors(false);
      }
    },
    [baseUrl, authHeaders, agencyId]
  );

  const fetchLocations = useCallback(
    async (search = "") => {
      if (!baseUrl || !sectorId) return;
      try {
        setLoadingLocations(true);
        const params = new URLSearchParams();
        params.set("sector_id", sectorId);
        if (search) params.set("q", search);
        const res = await fetch(`${baseUrl}/locations/?${params.toString()}`, {
          headers: authHeaders,
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setLocations(json?.locations ?? json ?? []);
      } catch {
        setLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    },
    [baseUrl, authHeaders, sectorId]
  );

  // efeitos de carregamento + cascata
  useEffect(() => {
    fetchMaterials(materialQ);
  }, [fetchMaterials, materialQ]);
  useEffect(() => {
    fetchGuardians(guardianQ);
  }, [fetchGuardians, guardianQ]);
  useEffect(() => {
    fetchUnits(unitQ);
  }, [fetchUnits, unitQ]);

  useEffect(() => {
    setAgencyId(null);
    setSectorId(null);
    setLocationId(null);
    setAgencies([]);
    setSectors([]);
    setLocations([]);
    if (unitId) fetchAgencies(agencyQ);
  }, [unitId, fetchAgencies, agencyQ]);

  useEffect(() => {
    setSectorId(null);
    setLocationId(null);
    setSectors([]);
    setLocations([]);
    if (agencyId) fetchSectors(sectorQ);
  }, [agencyId, fetchSectors, sectorQ]);

  useEffect(() => {
    setLocationId(null);
    setLocations([]);
    if (sectorId) fetchLocations(locationQ);
  }, [sectorId, fetchLocations, locationQ]);

  // items para o combobox
  const materialItems = useMemo(
    () =>
      (materials ?? []).map((m) => ({
        id: m.id,
        code: m.material_code,
        label: m.material_name || m.material_code,
      })),
    [materials]
  );

  const guardianItems = useMemo(
    () =>
      (guardians ?? []).map((g) => ({
        id: g.id,
        code: g.legal_guardians_code,
        label: g.legal_guardians_name || g.legal_guardians_code,
      })),
    [guardians]
  );

  const unitItems = useMemo(
    () =>
      (units ?? []).map((u) => ({
        id: u.id,
        code: u.unit_code,
        label: u.unit_name || u.unit_code,
      })),
    [units]
  );

  const agencyItems = useMemo(
    () =>
      (agencies ?? []).map((a) => ({
        id: a.id,
        code: a.agency_code,
        label: a.agency_name || a.agency_code,
      })),
    [agencies]
  );

  const sectorItems = useMemo(
    () =>
      (sectors ?? []).map((s) => ({
        id: s.id,
        code: s.sector_code,
        label: s.sector_name || s.sector_code,
      })),
    [sectors]
  );

  const locationItems = useMemo(
    () =>
      (locations ?? []).map((l) => ({
        id: l.id,
        code: l.location_code,
        label: l.location_name || l.location_code,
      })),
    [locations]
  );

  // ===== stats filtradas pela URL
  const [statsMap, setStatsMap] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(false);

  const buildStatsParamsFromUrl = useCallback(() => {
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

  const fetchStats = useCallback(async () => {
    if (!baseUrl) return;
    try {
      setLoadingStats(true);
      const params = buildStatsParamsFromUrl();
      const res = await fetch(
        `${baseUrl}/statistics/catalog/count-by-workflow-status?${params.toString()}`,
        {
          method: "GET",
          headers: authHeaders,
        }
      );
      if (!res.ok) throw new Error();
      const data: StatusCount[] = await res.json();
      const map: Record<string, number> = {};
      for (const row of data || []) {
        if (row?.status) map[row.status] = row?.count ?? 0;
      }
      setStatsMap(map);
    } catch {
      setStatsMap({});
    } finally {
      setLoadingStats(false);
    }
  }, [baseUrl, authHeaders, buildStatsParamsFromUrl]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, location.search]);

  // ===== meta para ícones/cards
  const WORKFLOW_STATUS_META: Record<
    string,
    { Icon: React.ComponentType<any>; colorClass: string }
  > = {
    REVIEW_REQUESTED_VITRINE: { Icon: Hourglass, colorClass: "text-amber-500" },
    ADJUSTMENT_VITRINE: { Icon: Wrench, colorClass: "text-blue-500" },
    VITRINE: { Icon: Store, colorClass: "text-green-600" },
    AGUARDANDO_TRANSFERENCIA: { Icon: Clock, colorClass: "text-indigo-500" },
    TRANSFERIDOS: { Icon: Archive, colorClass: "text-zinc-500" },

    REVIEW_REQUESTED_DESFAZIMENTO: {
      Icon: Hourglass,
      colorClass: "text-amber-500",
    },
    ADJUSTMENT_DESFAZIMENTO: { Icon: Wrench, colorClass: "text-blue-500" },
    REVIEW_REQUESTED_COMISSION: {
      Icon: ListTodo,
      colorClass: "text-purple-500",
    },
    REJEITADOS_COMISSAO: { Icon: XCircle, colorClass: "text-red-500" },
    DESFAZIMENTO: { Icon: Trash, colorClass: "text-green-600" },
    DESCARTADOS: { Icon: Recycle, colorClass: "text-zinc-500" },
  };

  const getMeta = (statusKey: string) =>
    WORKFLOW_STATUS_META[statusKey] ?? {
      Icon: HelpCircle,
      colorClass: "text-zinc-500",
    };

  // ===== scroll horizontal dos filtros
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!scrollAreaRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const scrollLeftBtn = () =>
    scrollAreaRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRightBtn = () =>
    scrollAreaRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = useIsMobile();

  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full">
      {/* ===== FILTROS */}
      {isMobile ? (
        <div className="flex gap-4 items-center mb-2">
          <div className="relative grid grid-cols-1">
            <Button
              variant="outline"
              size="sm"
              className={`absolute left-0 z-10 h-10 w-5 p-0 ${
                !canScrollLeft ? "opacity-30 cursor-not-allowed" : ""
              }`}
              onClick={scrollLeftBtn}
              disabled={!canScrollLeft}
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="mx-8">
              <div
                ref={scrollAreaRef}
                className="overflow-x-auto scrollbar-hide"
                onScroll={checkScrollability}
              >
                <div className="flex gap-3 items-center">
                  <Alert className="w-[300px] min-w-[300px] py-0 h-10 rounded-md flex gap-3 items-center">
                    <div>
                      <MagnifyingGlass size={16} className="text-gray-500" />
                    </div>
                    <Input
                      className="border-0 p-0 h-9 flex flex-1 w-full"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar por código, descrição, material, marca, modelo..."
                    />
                  </Alert>

                  <Combobox
                    items={materialItems}
                    value={materialId}
                    onChange={(v) => setMaterialId(v)}
                    onSearch={setMaterialQ}
                    isLoading={loadingMaterials}
                    placeholder="Material"
                  />

                  <Combobox
                    items={guardianItems}
                    value={guardianId}
                    onChange={(v) => setGuardianId(v)}
                    onSearch={setGuardianQ}
                    isLoading={loadingGuardians}
                    placeholder="Responsável"
                  />

                  <Separator className="h-8" orientation="vertical" />

                  <Combobox
                    items={unitItems}
                    value={unitId}
                    onChange={(v) => setUnitId(v)}
                    onSearch={setUnitQ}
                    isLoading={loadingUnits}
                    placeholder="Unidade"
                  />

                  <Combobox
                    items={agencyItems}
                    value={agencyId}
                    onChange={(v) => setAgencyId(v)}
                    onSearch={setAgencyQ}
                    isLoading={loadingAgencies}
                    placeholder="Organização"
                    disabled={!unitId}
                  />

                  <Combobox
                    items={sectorItems}
                    value={sectorId}
                    onChange={(v) => setSectorId(v)}
                    onSearch={setSectorQ}
                    isLoading={loadingSectors}
                    placeholder="Setor"
                    disabled={!agencyId}
                  />

                  <Combobox
                    items={locationItems}
                    value={locationId}
                    onChange={(v) => setLocationId(v)}
                    onSearch={setLocationQ}
                    isLoading={loadingLocations}
                    placeholder="Local de guarda"
                    disabled={!sectorId}
                  />

                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <Trash size={16} />
                    Limpar filtros
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className={`absolute right-0 z-10 h-10 w-5 p-0 rounded-md ${
                !canScrollRight ? "opacity-30 cursor-not-allowed" : ""
              }`}
              onClick={scrollRightBtn}
              disabled={!canScrollRight}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 items-center mb-2">
          <div className="relative grid grid-cols-1 w-full">
            <Button
              variant="outline"
              size="sm"
              className={`absolute left-0 z-10 h-10 w-10 p-0 ${
                !canScrollLeft ? "opacity-30 cursor-not-allowed" : ""
              }`}
              onClick={scrollLeftBtn}
              disabled={!canScrollLeft}
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="mx-14">
              <div
                ref={scrollAreaRef}
                className="overflow-x-auto scrollbar-hide"
                onScroll={checkScrollability}
              >
                <div className="flex gap-3 items-center">
                  <Alert className="w-[300px] min-w-[300px] py-0 h-10 rounded-md flex gap-3 items-center">
                    <div>
                      <MagnifyingGlass size={16} className="text-gray-500" />
                    </div>
                    <Input
                      className="border-0 p-0 h-9 flex flex-1 w-full"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar por código, descrição, material, marca, modelo..."
                    />
                  </Alert>

                  <Combobox
                    items={materialItems}
                    value={materialId}
                    onChange={(v) => setMaterialId(v)}
                    onSearch={setMaterialQ}
                    isLoading={loadingMaterials}
                    placeholder="Material"
                  />

                  <Combobox
                    items={guardianItems}
                    value={guardianId}
                    onChange={(v) => setGuardianId(v)}
                    onSearch={setGuardianQ}
                    isLoading={loadingGuardians}
                    placeholder="Responsável"
                  />

                  <Separator className="h-8" orientation="vertical" />

                  <Combobox
                    items={unitItems}
                    value={unitId}
                    onChange={(v) => setUnitId(v)}
                    onSearch={setUnitQ}
                    isLoading={loadingUnits}
                    placeholder="Unidade"
                  />

                  <Combobox
                    items={agencyItems}
                    value={agencyId}
                    onChange={(v) => setAgencyId(v)}
                    onSearch={setAgencyQ}
                    isLoading={loadingAgencies}
                    placeholder="Organização"
                    disabled={!unitId}
                  />

                  <Combobox
                    items={sectorItems}
                    value={sectorId}
                    onChange={(v) => setSectorId(v)}
                    onSearch={setSectorQ}
                    isLoading={loadingSectors}
                    placeholder="Setor"
                    disabled={!agencyId}
                  />

                  <Combobox
                    items={locationItems}
                    value={locationId}
                    onChange={(v) => setLocationId(v)}
                    onSearch={setLocationQ}
                    isLoading={loadingLocations}
                    placeholder="Local de guarda"
                    disabled={!sectorId}
                  />

                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <Trash size={16} />
                    Limpar filtros
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className={`absolute right-0 z-10 h-10 w-10 p-0 rounded-md ${
                !canScrollRight ? "opacity-30 cursor-not-allowed" : ""
              }`}
              onClick={scrollRightBtn}
              disabled={!canScrollRight}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ===== CARDS/WORKFLOWS */}
      <Carousel className="w-full flex gap-4 px-4 items-center">
        <div className="absolute left-0 z-[9]">
          <CarouselPrevious />
        </div>
        <CarouselContent className="gap-4">
          {WORKFLOWS.map(({ key, name }) => {
            const { Icon } = getMeta(key);
            return (
              <CarouselItem
                key={key}
                className={isMobile ? "basis-1/2" : "basis-1/4"}
              >
                <Alert className="p-0">
                  <CardHeader className="flex gap-8 flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm truncate font-medium">
                      {name}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsMap[key] || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">registrados</p>
                  </CardContent>
                </Alert>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="absolute right-0 z-[9]">
          <CarouselNext />
        </div>
      </Carousel>

      {/* ===== GRÁFICOS */}
      <GraficoStatusCatalogo
        stats={statsMap}
        workflows={WORKFLOWS.map(({ key, name }) => ({ key, name }))}
        title="Itens do Desfazimento"
      />

      <ChartTempoRevisaoComissao />

      <div className="grid md:grid-cols-2 gap-8">
        <ChartTempoRevisaoComissaoPie />
      </div>
    </div>
  );
}
