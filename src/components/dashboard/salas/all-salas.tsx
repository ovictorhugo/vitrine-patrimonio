import {
  ChevronLeft,
  ChevronRight,
  DoorClosed,
  Trash,
} from "lucide-react";
import { MagnifyingGlass } from "phosphor-react";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";
import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { UserContext } from "../../../context/context";
import { Button } from "../../ui/button";
import { Alert } from "../../ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { HeaderResultTypeHome } from "../../header-result-type-home";
import { Input } from "../../ui/input";
import { Separator } from "../../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { toast } from "sonner";
import { Combobox } from "../itens-vitrine/itens-vitrine";
import { Skeleton } from "../../ui/skeleton";

/* =========================
   Tipos (ajuste se necessário)
========================= */
type UUID = string;

type Material = {
  id: UUID;
  material_code: string;
  material_name?: string;
};

type LegalGuardian = {
  id: UUID;
  legal_guardians_code: string;
  legal_guardians_name?: string;
};

type Unit = {
  id: UUID;
  unit_code: string;
  unit_name?: string;
};

type Agency = {
  id: UUID;
  agency_code: string;
  agency_name?: string;
  unit_id: UUID;
};

type Sector = {
  id: UUID;
  sector_code: string;
  sector_name?: string;
  agency_id: UUID;
};

export type LocationMy = {
  id: UUID;
  location_name: string;
  location_code: string;
  legal_guardian_id: UUID;
  sector_id: UUID;
  sector: {
    id: UUID;
    sector_name: string;
    sector_code: string;
    agency: {
      id: UUID;
      agency_name: string;
      agency_code: string;
      unit: {
        id: UUID;
        unit_name: string;
        unit_code: string;
      };
    };
  };
  legal_guardian: {
    id: UUID;
    legal_guardians_code: string;
    legal_guardians_name: string;
  };
};

type ComboboxItem = {
  id: UUID;
  code: string;
  label: string;
};

/* =========================
   Helpers
========================= */

// Debounce simples
function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Monta URLSearchParams removendo nulos/vazios
function buildParams(obj: Record<string, any>) {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== null && v !== undefined && String(v).trim() !== "") {
      params.set(k, String(v));
    }
  });
  return params;
}

/* =========================
   Componente
========================= */

export function AllSalas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { urlGeral, user } = useContext(UserContext);

  const token = (user as any)?.token as string | undefined;

  /* ===== filtros ===== */
  const [q, setQ] = useState("");
  const qd = useDebounce(q);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [guardians, setGuardians] = useState<LegalGuardian[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [locations, setLocations] = useState<LocationMy[]>([]);

  const [materialId, setMaterialId] = useState<UUID | null>(null);
  const [guardianId, setGuardianId] = useState<UUID | null>(null);
  const [unitId, setUnitId] = useState<UUID | null>(null);
  const [agencyId, setAgencyId] = useState<UUID | null>(null);
  const [sectorId, setSectorId] = useState<UUID | null>(null);
  const [locationId, setLocationId] = useState<UUID | null>(null);

  // buscas dos combobox
  const [materialQ, setMaterialQ] = useState("");
  const [guardianQ, setGuardianQ] = useState("");
  const [unitQ, setUnitQ] = useState("");
  const [agencyQ, setAgencyQ] = useState("");
  const [sectorQ, setSectorQ] = useState("");
  const [locationQ, setLocationQ] = useState("");

  const materialQd = useDebounce(materialQ);
  const guardianQd = useDebounce(guardianQ);
  const unitQd = useDebounce(unitQ);
  const agencyQd = useDebounce(agencyQ);
  const sectorQd = useDebounce(sectorQ);
  const locationQd = useDebounce(locationQ);

  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingGuardians, setLoadingGuardians] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  /* ===== paginação ===== */
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(84);
  const [isLastPage, setIsLastPage] = useState(false);

  const isFirstPage = offset === 0;

  /* ===== salas ===== */
  const [rooms, setRooms] = useState<LocationMy[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  /* =========================
     Init a partir da URL
  ========================= */
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const urlOffset = Number(params.get("offset") || 0);
    const urlLimit = Number(params.get("limit") || 12);

    const u = params.get("unit_id");
    const a = params.get("agency_id");
    const s = params.get("sector_id");
    const l = params.get("location_id");
    const m = params.get("material_id");
    const g = params.get("legal_guardian_id");
    const qq = params.get("q");

    setOffset(Number.isFinite(urlOffset) ? urlOffset : 0);
    setLimit(Number.isFinite(urlLimit) ? urlLimit : 12);

    if (u) setUnitId(u);
    if (a) setAgencyId(a);
    if (s) setSectorId(s);
    if (l) setLocationId(l);
    if (m) setMaterialId(m);
    if (g) setGuardianId(g);
    if (qq) setQ(qq);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     Atualiza URL quando filtros/paginação mudam
  ========================= */
  const handleNavigate = (newOffset = offset, newLimit = limit) => {
    const params = buildParams({
      q: qd,
      material_id: materialId,
      legal_guardian_id: guardianId,
      unit_id: unitId,
      agency_id: agencyId,
      sector_id: sectorId,
      location_id: locationId,
      offset: newOffset,
      limit: newLimit,
    });

    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace: true }
    );
  };

  useEffect(() => {
    handleNavigate(offset, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    qd,
    materialId,
    guardianId,
    unitId,
    agencyId,
    sectorId,
    locationId,
    offset,
    limit,
  ]);

  /* =========================
     Carregamentos dos filtros
  ========================= */

  // Materials
  useEffect(() => {
    (async () => {
      try {
        setLoadingMaterials(true);
        const qs = materialQd ? `?q=${encodeURIComponent(materialQd)}` : "";
        const mRes = await fetch(`${urlGeral}materials/${qs}`);
        const mJson = await mRes.json();
        setMaterials(mJson?.materials ?? []);
      } catch {
        toast.error("Falha ao carregar materiais");
        setMaterials([]);
      } finally {
        setLoadingMaterials(false);
      }
    })();
  }, [urlGeral, materialQd]);

  // Legal guardians
  useEffect(() => {
    (async () => {
      try {
        setLoadingGuardians(true);
        const qs = guardianQd ? `?q=${encodeURIComponent(guardianQd)}` : "";
        const gRes = await fetch(`${urlGeral}legal-guardians/${qs}`);
        const gJson = await gRes.json();
        setGuardians(gJson?.legal_guardians ?? []);
      } catch {
        toast.error("Falha ao carregar responsáveis");
        setGuardians([]);
      } finally {
        setLoadingGuardians(false);
      }
    })();
  }, [urlGeral, guardianQd]);

  // Units
  useEffect(() => {
    (async () => {
      try {
        setLoadingUnits(true);
        const qs = unitQd ? `?q=${encodeURIComponent(unitQd)}` : "";
        const uRes = await fetch(`${urlGeral}units/${qs}`);
        const uJson = await uRes.json();
        setUnits(uJson?.units ?? []);
      } catch {
        toast.error("Falha ao carregar unidades");
        setUnits([]);
      } finally {
        setLoadingUnits(false);
      }
    })();
  }, [urlGeral, unitQd]);

  // Agencies (depende de unitId)
  useEffect(() => {
    (async () => {
      if (!unitId) {
        setAgencies([]);
        return;
      }
      try {
        setLoadingAgencies(true);
        const params = buildParams({
          unit_id: unitId,
          q: agencyQd,
        });
        const aRes = await fetch(`${urlGeral}agencies/?${params.toString()}`);
        const aJson = await aRes.json();
        setAgencies(aJson?.agencies ?? []);
      } catch {
        toast.error("Falha ao carregar organizações");
        setAgencies([]);
      } finally {
        setLoadingAgencies(false);
      }
    })();
  }, [urlGeral, unitId, agencyQd]);

  // Sectors (depende de agencyId)
  useEffect(() => {
    (async () => {
      if (!agencyId) {
        setSectors([]);
        return;
      }
      try {
        setLoadingSectors(true);
        const params = buildParams({
          agency_id: agencyId,
          q: sectorQd,
        });
        const sRes = await fetch(`${urlGeral}sectors/?${params.toString()}`);
        const sJson = await sRes.json();
        setSectors(sJson?.sectors ?? []);
      } catch {
        toast.error("Falha ao carregar setores");
        setSectors([]);
      } finally {
        setLoadingSectors(false);
      }
    })();
  }, [urlGeral, agencyId, sectorQd]);

  // Locations filtro (depende de sectorId)
  useEffect(() => {
    (async () => {
      if (!sectorId) {
        setLocations([]);
        return;
      }
      try {
        setLoadingLocations(true);
        const params = buildParams({
          sector_id: sectorId,
          q: locationQd,
        });
        const lRes = await fetch(`${urlGeral}locations/?${params.toString()}`);
        const lJson = await lRes.json();
        setLocations(lJson?.locations ?? []);
      } catch {
        toast.error("Falha ao carregar locais de guarda");
        setLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    })();
  }, [urlGeral, sectorId, locationQd]);

  /* =========================
     Fetch principal: SALAS (/locations)
     com filtros + offset/limit
  ========================= */
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoadingRooms(true);

        const params = buildParams({
          q: qd,
          material_id: materialId,
          legal_guardian_id: guardianId,
          unit_id: unitId,
          agency_id: agencyId,
          sector_id: sectorId,
          location_id: locationId,
          offset,
          limit,
        });

        const res = await fetch(`${urlGeral}locations/?${params.toString()}`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const json = await res.json();

        const list: LocationMy[] = json?.locations ?? [];
        setRooms(list);

        // última página quando retorna menos que limit
        setIsLastPage(list.length < limit);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        toast("Erro ao carregar salas", {
          description: e?.message || "Tente novamente.",
        });
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    })();

    return () => controller.abort();
  }, [
    urlGeral,
    token,
    qd,
    materialId,
    guardianId,
    unitId,
    agencyId,
    sectorId,
    locationId,
    offset,
    limit,
  ]);

  /* =========================
     Combobox items
  ========================= */
  const materialItems: ComboboxItem[] = useMemo(
    () =>
      (materials ?? []).map((m) => ({
        id: m.id,
        code: m.material_code,
        label: m.material_name || m.material_code,
      })),
    [materials]
  );

  const guardianItems: ComboboxItem[] = useMemo(
    () =>
      (guardians ?? []).map((g) => ({
        id: g.id,
        code: g.legal_guardians_code,
        label: g.legal_guardians_name || g.legal_guardians_code,
      })),
    [guardians]
  );

  /* =========================
     Clear filters
  ========================= */
  const clearFilters = () => {
    setMaterialId(null);
    setGuardianId(null);
    setQ("");
    setUnitId(null);
    setAgencyId(null);
    setSectorId(null);
    setLocationId(null);

    // reset dependentes
    setAgencies([]);
    setSectors([]);
    setLocations([]);

    setOffset(0);
  };

  /* =========================
     Scroll horizontal dos filtros
  ========================= */
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!scrollAreaRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const scrollLeft = () =>
    scrollAreaRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () =>
    scrollAreaRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* =========================
     Clique na sala
     (ajuste o destino se quiser)
  ========================= */
  const handleClickRoom = (room: LocationMy) => {
    // exemplo: navegar pra uma rota de detalhes da sala
    navigate(`/dashboard/sala?loc_id=${room.id}`);
  };

  /* =========================
     Render
  ========================= */

  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>Salas | Sistema Patrimônio</title>
      </Helmet>

      <main className="flex flex-col  ">
        {/* Header */}
        <div className="flex p-8 items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const path = location.pathname;
                const hasQuery = location.search.length > 0;
                if (hasQuery) navigate(path);
                else {
                  const seg = path.split("/").filter(Boolean);
                  if (seg.length > 1) {
                    seg.pop();
                    navigate("/" + seg.join("/"));
                  } else navigate("/");
                }
              }}
              variant="outline"
              size="icon"
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>

            <h1 className="text-xl font-semibold tracking-tight">Salas</h1>
          </div>
        </div>

        <div className="p-8 pt-0 grid gap-8">
            {/* Barra horizontal de filtros */}
        <div className="relative grid grid-cols-1">
          <Button
            variant="outline"
            size="sm"
            className={`absolute left-0 z-10 h-10 w-10 p-0 ${
              !canScrollLeft ? "opacity-30 cursor-not-allowed" : ""
            }`}
            onClick={scrollLeft}
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
                {/* Busca geral */}
                <Alert className="w-[300px] min-w-[300px] py-0 h-10 rounded-md flex gap-3 items-center">
                  <div>
                    <MagnifyingGlass size={16} className="text-gray-500" />
                  </div>
                  <div className="relative w-full">
                    <Input
                      className="border-0 p-0 h-9 flex flex-1 w-full"
                      value={q}
                      onChange={(e) => {
                        setOffset(0);
                        setQ(e.target.value);
                      }}
                      placeholder="Buscar por nome/código da sala, setor, organização..."
                    />
                  </div>
                </Alert>

         

                {/* Responsável */}
                <Combobox
                  items={guardianItems}
                  value={guardianId}
                  onChange={(v) => {
                    setOffset(0);
                    setGuardianId(v);
                  }}
                  onSearch={setGuardianQ}
                  isLoading={loadingGuardians}
                  placeholder="Responsável"
                />

                <Separator className="h-8" orientation="vertical" />

                {/* Unidade */}
                <Combobox
                  items={(units ?? []).map((u) => ({
                    id: u.id,
                    code: u.unit_code,
                    label: u.unit_name || u.unit_code,
                  }))}
                  value={unitId}
                  onChange={(v) => {
                    setOffset(0);
                    setUnitId(v);
                    setAgencyId(null);
                    setSectorId(null);
                    setLocationId(null);
                  }}
                  onSearch={setUnitQ}
                  isLoading={loadingUnits}
                  placeholder="Unidade"
                />

                {/* Organização */}
                <Combobox
                  items={(agencies ?? []).map((a) => ({
                    id: a.id,
                    code: a.agency_code,
                    label: a.agency_name || a.agency_code,
                  }))}
                  value={agencyId}
                  onChange={(v) => {
                    setOffset(0);
                    setAgencyId(v);
                    setSectorId(null);
                    setLocationId(null);
                  }}
                  onSearch={setAgencyQ}
                  isLoading={loadingAgencies}
                  placeholder="Organização"
                  disabled={!unitId}
                />

                {/* Setor */}
                <Combobox
                  items={(sectors ?? []).map((s) => ({
                    id: s.id,
                    code: s.sector_code,
                    label: s.sector_name || s.sector_code,
                  }))}
                  value={sectorId}
                  onChange={(v) => {
                    setOffset(0);
                    setSectorId(v);
                    setLocationId(null);
                  }}
                  onSearch={setSectorQ}
                  isLoading={loadingSectors}
                  placeholder="Setor"
                  disabled={!agencyId}
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
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="px-0">
              <HeaderResultTypeHome
                title={"Todas as salas"}
                icon={<DoorClosed size={24} className="text-gray-400" />}
              />
            </AccordionTrigger>

            <AccordionContent className="p-0">
              <div className="">
                {loadingRooms ? (
                   <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                  <Skeleton className="aspect-square w-full rounded-lg"></Skeleton>
                  <Skeleton className="aspect-square w-full rounded-lg"></Skeleton>
                  <Skeleton className="aspect-square w-full rounded-lg"></Skeleton>
                  <Skeleton className="aspect-square w-full rounded-lg"></Skeleton>
                  <Skeleton className="aspect-square w-full rounded-lg"></Skeleton>
                  <Skeleton className="aspect-square w-full rounded-lg"></Skeleton>
                  <Skeleton className="aspect-square w-full rounded-lg"></Skeleton>
                  <Skeleton className="aspect-square w-full rounded-lg"></Skeleton>
                  <Skeleton className="aspect-square w-full rounded-lg"></Skeleton>
                  <Skeleton className="aspect-square w-full rounded-lg"></Skeleton>
                  <Skeleton className="aspect-square w-full rounded-lg"></Skeleton>

                  <Skeleton className="aspect-square w-full rounded-lg"></Skeleton>
                  </div>
                ) : rooms.length === 0 ? (
                  <p className="text-sm text-center">
                    Nenhuma sala encontrada.
                  </p>
                ) : (
                 <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                    {
                         rooms.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => handleClickRoom(room)}
                      className="w-full aspect-square text-left"
                      title={room.location_name}
                    >
                      <Alert className=" flex justify-between flex-col aspect-square cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 min-w-0">
                            <p className="truncate text-sm text-gray-500 dark:text-gray-300">
                              {room.sector?.agency?.agency_name}
                            </p>
                            <ChevronRight
                              size={14}
                              className="flex-shrink-0"
                            />
                            <p className="truncate text-sm text-gray-500 dark:text-gray-300">
                              {room.sector?.sector_name}
                            </p>
                          </div>
                        </div>

                        <p className="text-xl font-semibold whitespace-normal">
                          {room.location_name}
                        </p>
                      </Alert>
                    </button>
                  ))
                    }
                 </div>
                )}
              </div>

              {/* ===== Paginação ===== */}
              <div className="hidden md:flex md:justify-end mt-5 items-center gap-2 px-8">
                <span className="text-sm text-muted-foreground">
                  Itens por página:
                </span>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => {
                    const newLimit = parseInt(value);
                    const newOffset = 0;
                    setOffset(newOffset);
                    setLimit(newLimit);
                    handleNavigate(newOffset, newLimit);
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Itens" />
                  </SelectTrigger>
                  <SelectContent>
                    {[12, 24, 36, 48, 84, 162].map((val) => (
                      <SelectItem key={val} value={val.toString()}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full flex justify-center items-center gap-10 mt-8 pb-8">
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setOffset((prev) => Math.max(0, prev - limit))
                    }
                    disabled={isFirstPage}
                  >
                    <ChevronLeft size={16} className="mr-2" />
                    Anterior
                  </Button>

                  <Button
                    onClick={() =>
                      !isLastPage && setOffset((prev) => prev + limit)
                    }
                    disabled={isLastPage}
                  >
                    Próximo
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </div>

        
      </main>
    </div>
  );
}
