import { ChevronLeft, ChevronRight, Package, Trash } from "lucide-react";
import { Button } from "../../../ui/button";
import ChartTempoRevisaoComissaoPie from "../../commission/components/ChartTempoRevisaoComissao";
import ChartTempoRevisaoComissao from "../../commission/components/grafico-comission-REVIEW_REQUESTED";
import { GraficoStatusCatalogo } from "../../dashboard-page/components/chart-workflows";
import { ChartRadialDesfazimento } from "../components/chart-radial-desfazimento";
import { Combobox } from "../../itens-vitrine/itens-vitrine";
import { WORKFLOWS } from "../admin";
import { Alert } from "../../../ui/alert";
import { MagnifyingGlass } from "phosphor-react";
import { Input } from "../../../ui/input";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Separator } from "../../../ui/separator";
import { useLocation, useNavigate } from "react-router-dom";
import { GraficoStatusCatalogoPorAgencia } from "../../graficos/GraficoStatusCatalogoPorAgencia";
import { GraficoStatusCatalogoPorLocation } from "../../graficos/GraficoStatusCatalogoPorLocation";
import { GraficoStatusCatalogoPorLocationTreemap } from "../../graficos/GraficoStatusCatalogoPorLocationTreeMap";
import { CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { CarrosselReviewerDesfazimento } from "../../commission/components/carrossel-reviewer-desfazimento";

interface Props {
  statsMap: Record<string, number>;
  baseUrl: string;
  authHeaders: HeadersInit;
}

export function Statistics({ statsMap, baseUrl, authHeaders }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== filtros (estado local)
  const [q, setQ] = useState("");
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [guardianId, setGuardianId] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [sectorId, setSectorId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);

  // queries dos combobox (busca remota)
  const [materialQ, setMaterialQ] = useState("");
  const [guardianQ, setGuardianQ] = useState("");
  const [unitQ, setUnitQ] = useState("");
  const [agencyQ, setAgencyQ] = useState("");
  const [sectorQ, setSectorQ] = useState("");
  const [locationQ, setLocationQ] = useState("");

  // listas vindas do backend
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

  // ===== inicializa filtros lendo a URL (1x ao montar)
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

  // ===== sincroniza filtros -> URL (pai refaz stats)
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

    // reseta pagina quando muda filtro
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

  // ===== fetches remotos dos combobox

  const fetchMaterials = useCallback(
    async (search = "") => {
      if (!baseUrl) return;
      try {
        setLoadingMaterials(true);
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        const res = await fetch(
          `${baseUrl}/materials/?${params.toString()}`,
          { headers: authHeaders }
        );
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
        const res = await fetch(
          `${baseUrl}/agencies/?${params.toString()}`,
          { headers: authHeaders }
        );
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
        params.set("agency_id/", agencyId);
        if (search) params.set("q", search);
        const res = await fetch(
          `${baseUrl}/sectors/?${params.toString()}`,
          { headers: authHeaders }
        );
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
        const res = await fetch(
          `${baseUrl}/locations/?${params.toString()}`,
          { headers: authHeaders }
        );
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
  useEffect(() => { fetchMaterials(materialQ); }, [fetchMaterials, materialQ]);
  useEffect(() => { fetchGuardians(guardianQ); }, [fetchGuardians, guardianQ]);
  useEffect(() => { fetchUnits(unitQ); }, [fetchUnits, unitQ]);

  useEffect(() => {
    setAgencyId(null); setSectorId(null); setLocationId(null);
    setAgencies([]); setSectors([]); setLocations([]);
    if (unitId) fetchAgencies(agencyQ);
  }, [unitId, fetchAgencies, agencyQ]);

  useEffect(() => {
    setSectorId(null); setLocationId(null);
    setSectors([]); setLocations([]);
    if (agencyId) fetchSectors(sectorQ);
  }, [agencyId, fetchSectors, sectorQ]);

  useEffect(() => {
    setLocationId(null);
    setLocations([]);
    if (sectorId) fetchLocations(locationQ);
  }, [sectorId, fetchLocations, locationQ]);

  // transforma em items
  const materialItems = useMemo(
    () => (materials ?? []).map((m) => ({
      id: m.id,
      code: m.material_code,
      label: m.material_name || m.material_code,
    })),
    [materials]
  );

  const guardianItems = useMemo(
    () => (guardians ?? []).map((g) => ({
      id: g.id,
      code: g.legal_guardians_code,
      label: g.legal_guardians_name || g.legal_guardians_code,
    })),
    [guardians]
  );

  const unitItems = useMemo(
    () => (units ?? []).map((u) => ({
      id: u.id,
      code: u.unit_code,
      label: u.unit_name || u.unit_code,
    })),
    [units]
  );

  const agencyItems = useMemo(
    () => (agencies ?? []).map((a) => ({
      id: a.id,
      code: a.agency_code,
      label: a.agency_name || a.agency_code,
    })),
    [agencies]
  );

  const sectorItems = useMemo(
    () => (sectors ?? []).map((s) => ({
      id: s.id,
      code: s.sector_code,
      label: s.sector_name || s.sector_code,
    })),
    [sectors]
  );

  const locationItems = useMemo(
    () => (locations ?? []).map((l) => ({
      id: l.id,
      code: l.location_code,
      label: l.location_name || l.location_code,
    })),
    [locations]
  );

  // ===== Scroll horizontal dos filtros
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

  const totalItens = useMemo(() => {
  if (!statsMap) return 0;

  return Object.values(statsMap).reduce((acc, value) => {
    const n = typeof value === "number" ? value : Number(value) || 0;
    return acc + n;
  }, 0);
}, [statsMap]);

  return (
    <div className="m-8">
      {/* FILTROS */}
      <div className="flex gap-4 items-center mb-6">
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

       <Alert className="p-0 mb-8">
                            <CardHeader className="flex gap-8 flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm truncate font-medium">
                                Total de itens
                              </CardTitle>
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {totalItens}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                registrados em toda plataforma
                              </p>
                            </CardContent>
                          </Alert>

      {/* GRÁFICOS */}
      <GraficoStatusCatalogo
        stats={statsMap}
        workflows={WORKFLOWS.map(({ key, name }) => ({ key, name }))}
        title="Todos os itens da plataforma"
      />

        <div className="mt-8">
        <GraficoStatusCatalogoPorAgencia />
      </div>



       <div className="mt-8">
        <GraficoStatusCatalogoPorLocationTreemap />
      </div>


      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <ChartRadialDesfazimento counts={statsMap} />
        <ChartTempoRevisaoComissaoPie />
      </div>

      <div className="mt-8">
<CarrosselReviewerDesfazimento/>
      </div>

      <div className="mt-8">
        <ChartTempoRevisaoComissao />
      </div>

      
    </div>
  );
}
