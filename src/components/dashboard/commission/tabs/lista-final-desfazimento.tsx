import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  Download,
  Trash,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Blocks,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";

import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { BlockItemsVitrine } from "../../../homepage/components/block-items-vitrine";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion";
import { Button } from "../../../ui/button";
import { UserContext } from "../../../../context/context";
import { handleDownloadXlsx } from "../../itens-vitrine/handle-download";
import { CatalogEntry } from "./adm-comission";
import { DownloadPdfButton } from "../../../download/download-pdf-button";
import { Tabs, TabsContent } from "../../../ui/tabs";

import { Alert } from "../../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { MagnifyingGlass } from "phosphor-react";
import { Input } from "../../../ui/input";
import { Combobox } from "../../itens-vitrine/itens-vitrine";
import { Separator } from "../../../ui/separator";
import { useIsMobile } from "../../../../hooks/use-mobile";

/* Tipos mínimos do fetch */
type UUID = string;

type CatalogResponse = {
  catalog_entries: CatalogEntry[];
};

type StatusCount = { status: string; count: number };

const ensureTrailingSlash = (u: string) => (u.endsWith("/") ? u : `${u}/`);

export function ListaFinalDesfazimento() {
  const { urlGeral, user } = useContext(UserContext);
  const baseUrl = useMemo(
    () => ensureTrailingSlash(urlGeral || ""),
    [urlGeral]
  );

  const navigate = useNavigate();
  const location = useLocation();

  const didInitFromUrl = useRef(false);

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("jwt_token") || ""
        : "",
    []
  );

  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const [tab, setTab] = useState<"vitrine" | "desfazimento">("vitrine");

  // =========================
  // filtros (estado)
  // =========================
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

  // listas do backend
  const [materials, setMaterials] = useState<any[]>([]);
  const [guardians, setGuardians] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // loadings combobox
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingGuardians, setLoadingGuardians] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // =========================
  // scroll horizontal filtros
  // =========================
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

  // =========================
  // limpar filtros
  // =========================
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

  // =========================
  // fetch combobox
  // =========================
  const fetchMaterials = useCallback(
    async (search = "") => {
      if (!baseUrl) return;
      try {
        setLoadingMaterials(true);
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        const res = await fetch(`${baseUrl}materials/?${params.toString()}`, {
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
          `${baseUrl}legal-guardians/?${params.toString()}`,
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
        const res = await fetch(`${baseUrl}units/?${params.toString()}`, {
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
        const res = await fetch(`${baseUrl}agencies/?${params.toString()}`, {
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
        const res = await fetch(`${baseUrl}sectors/?${params.toString()}`, {
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
        const res = await fetch(`${baseUrl}locations/?${params.toString()}`, {
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

  // items para Combobox
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

  // =========================
  // monta params com filtros
  // + reviewer_id se tab=desfazimento
  // =========================
  const buildParams = useCallback(() => {
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (materialId) params.set("material_id", materialId);
    if (guardianId) params.set("legal_guardian_id", guardianId);
    if (unitId) params.set("unit_id", unitId);
    if (agencyId) params.set("agency_id", agencyId);
    if (sectorId) params.set("sector_id", sectorId);
    if (locationId) params.set("location_id", locationId);

    if (tab === "desfazimento" && user?.id) {
      params.set("reviewer_id", String(user.id));
    }

    return params;
  }, [
    q,
    materialId,
    guardianId,
    unitId,
    agencyId,
    sectorId,
    locationId,
    tab,
    user?.id,
  ]);

  // =========================
  // URL -> estado (hidratação inicial)
  // =========================
  useEffect(() => {
    const sp = new URLSearchParams(location.search);

    const tabFromUrl = sp.get("tab");
    if (tabFromUrl === "desfazimento" || tabFromUrl === "vitrine") {
      setTab(tabFromUrl);
    }

    setQ(sp.get("q") || "");
    setMaterialId(sp.get("material_id"));
    setGuardianId(sp.get("legal_guardian_id"));
    setUnitId(sp.get("unit_id"));
    setAgencyId(sp.get("agency_id"));
    setSectorId(sp.get("sector_id"));
    setLocationId(sp.get("location_id"));

    didInitFromUrl.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // estado -> URL (sincroniza filtros)
  // =========================
  useEffect(() => {
    if (!didInitFromUrl.current) return;

    const t = setTimeout(() => {
      // começa com o que já existe na URL
      const sp = new URLSearchParams(location.search);

      // atualiza os filtros controlados
      if (tab) sp.set("tab", tab);
      else sp.delete("tab");
      if (q) sp.set("q", q);
      else sp.delete("q");
      if (materialId) sp.set("material_id", materialId);
      else sp.delete("material_id");
      if (guardianId) sp.set("legal_guardian_id", guardianId);
      else sp.delete("legal_guardian_id");
      if (unitId) sp.set("unit_id", unitId);
      else sp.delete("unit_id");
      if (agencyId) sp.set("agency_id", agencyId);
      else sp.delete("agency_id");
      if (sectorId) sp.set("sector_id", sectorId);
      else sp.delete("sector_id");
      if (locationId) sp.set("location_id", locationId);
      else sp.delete("location_id");

      // pronto: offset/limit permanecem intactos
      const nextSearch = `?${sp.toString()}`;
      if (nextSearch !== location.search) {
        navigate({ search: nextSearch }, { replace: true });
      }
    }, 300);

    return () => clearTimeout(t);
  }, [
    tab,
    q,
    materialId,
    guardianId,
    unitId,
    agencyId,
    sectorId,
    locationId,
    navigate,
    location.search,
  ]);

  // =========================
  // Fetch LFD (catalog) com filtros
  // =========================
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CatalogEntry[]>([]);

  const fetchLFD = useCallback(async () => {
    if (!baseUrl) return;
    setLoading(true);
    try {
      const params = buildParams();
      params.set("workflow_status", "DESFAZIMENTO");

      const url = `${baseUrl}catalog/?${params.toString()}`;

      const res = await fetch(url, { headers: authHeaders });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: CatalogResponse = await res.json();
      setItems(json?.catalog_entries ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao carregar a Lista Final de Desfazimento.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, authHeaders, buildParams]);

  useEffect(() => {
    fetchLFD();
  }, [fetchLFD]);

  // =========================
  // Fetch stats filtradas
  // /statistics/catalog/count-by-workflow-status
  // mostrando só DESFAZIMENTO
  // =========================
  const [statsMap, setStatsMap] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!baseUrl) return;
    try {
      setLoadingStats(true);

      const params = buildParams();
      const url = `${baseUrl}statistics/catalog/count-by-workflow-status?${params.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: authHeaders,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: StatusCount[] = await res.json();

      const map: Record<string, number> = {};
      for (const row of data || []) {
        if (row?.status) map[row.status] = row?.count ?? 0;
      }
      setStatsMap(map);
    } catch (e) {
      console.error(e);
      setStatsMap({});
    } finally {
      setLoadingStats(false);
    }
  }, [baseUrl, authHeaders, buildParams]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const desfazimentoCount = statsMap["DESFAZIMENTO"] ?? 0;

  // =========================
  // download
  // =========================
  const onDownload = async () => {
    if (!items.length) {
      toast.error("Nada para exportar.");
      return;
    }
    await handleDownloadXlsx({
      items,
      urlBase: baseUrl,
      sheetName: "LFD",
      filename: "lista_final_desfazimento.xlsx",
    });
  };

  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-8 p-8 ">
      {/* topo */}
      <div
        className={
          isMobile
            ? "flex flex-col-reverse gap-4 justify-between items-center"
            : "flex justify-between items-center"
        }
      >
        <div className="flex items-center gap-3">
          <DownloadPdfButton
            filters={{ workflow_status: "DESFAZIMENTO" }}
            method="catalog"
            label="Baixar PDF"
          />

          <Button
            variant="outline"
            onClick={onDownload}
            disabled={loading || items.length === 0}
          >
            <Download size={16} />
            Download CSV
          </Button>
        </div>

        <div className="flex">
          <Button
            size="sm"
            onClick={() => setTab("vitrine")}
            variant={tab === "vitrine" ? "default" : "outline"}
            className="rounded-r-none"
          >
            <Blocks size={16} />
            Todos os itens
          </Button>
          <Button
            onClick={() => setTab("desfazimento")}
            size="sm"
            variant={tab !== "vitrine" ? "default" : "outline"}
            className="rounded-l-none"
          >
            <ListTodo size={16} />
            Meus itens avaliados
          </Button>
        </div>
      </div>

      {/* ===== filtros scrolláveis */}
      {isMobile ? (
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
      ) : (
        <div className="relative grid grid-cols-1">
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
      )}

      {/* ===== card único DESFAZIMENTO */}
      <Alert className="p-0">
        <CardHeader className="flex gap-8 flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm truncate font-medium">
            LFD - Lista Final de Desfazimento
          </CardTitle>
          <Trash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loadingStats ? "0" : desfazimentoCount}
          </div>
          <p className="text-xs text-muted-foreground">registrados</p>
        </CardContent>
      </Alert>

      {/* ===== tabs */}
      <Tabs value={tab}>
        <TabsContent value="vitrine" className="p-0 m-0">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <div className="flex items-center justify-between">
                <HeaderResultTypeHome
                  title={`Lista Final de Desfazimento (LFD)`}
                  icon={<Trash size={24} className="text-gray-400" />}
                />
                <AccordionTrigger className="px-0" />
              </div>

              <AccordionContent className="p-0">
                <BlockItemsVitrine workflow={["DESFAZIMENTO"]} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="desfazimento" className="p-0 m-0">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <div className="flex items-center justify-between">
                <HeaderResultTypeHome
                  title={`Lista Final de Desfazimento (LFD)`}
                  icon={<Trash size={24} className="text-gray-400" />}
                />
                <AccordionTrigger className="px-0" />
              </div>

              <AccordionContent className="p-0">
                <BlockItemsVitrine
                  workflow={["DESFAZIMENTO"]}
                  type="reviewer_id"
                  value={user?.id}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}
