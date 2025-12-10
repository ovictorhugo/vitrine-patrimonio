// src/pages/novo-item/steps/trocar-local/index.tsx
import { AlertCircle, ArrowRight, Pencil, Check, ChevronsUpDown, X } from "lucide-react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Label } from "../../../ui/label";
import { UserContext } from "../../../../context/context";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Separator } from "../../../ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../ui/command";
import { cn } from "../../../../lib";

/* ===== Tipos ===== */
type FlowMode = "vitrine" | "desfazimento";

interface Agency { id: string; agency_name: string; agency_code: string; }
interface Unit   { id: string; unit_name: string; unit_code: string; unit_siaf: string; agency_id: string; agency?: Agency; }
interface Sector { id: string; sector_name: string; sector_code: string; unit_id: string; unit: Unit; }
interface Location { id: string; location_name: string; location_code: string; sector_id: string; sector: Sector; }

type TL = {
  agency_id?: string; unit_id?: string; sector_id?: string; location_id?: string;
  agency?: Agency | null; unit?: Unit | null; sector?: Sector | null; location?: Location | null;
  isOpen?: boolean;
};

type TrocarLocalStepProps = {
  value: "trocar-local";
  step:number
  flowShort: FlowMode;
  initialData?: TL;         // persistidos no pai
  formSnapshot?: TL;        // apenas para inputs readonly
  isActive: boolean;
  onValidityChange: (valid: boolean) => void;
  onStateChange?: (state: TL & { isOpen?: boolean }) => void;
};

/* ===== Utils ===== */
const sanitizeBaseUrl = (u?: string) => (u || "").replace(/\/+$/, "");
const hasValidId = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

/** Debounce simples */
function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function LocalStep({
  flowShort,
  initialData,
  formSnapshot,
  isActive,
  onValidityChange,
  onStateChange,
  step
}: TrocarLocalStepProps) {
  const { urlGeral } = useContext(UserContext);
  const baseUrl = useMemo(() => sanitizeBaseUrl(urlGeral), [urlGeral]);

  // Modo edição: preferimos o valor persistido; se não existir, vitrine começa fechado e desfazimento aberto
  const initialIsOpen = initialData?.isOpen ?? (flowShort !== "vitrine");
  const [isOpen, setIsOpen] = useState<boolean>(initialIsOpen);

  // Sincroniza quando o pai atualizar isOpen
  useEffect(() => {
    if (typeof initialData?.isOpen === "boolean" && initialData.isOpen !== isOpen) {
      setIsOpen(initialData.isOpen);
    }
  }, [initialData?.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== Listas =====
  const [units, setUnits] = useState<Unit[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // ===== Loading =====
  const [loading, setLoading] = useState({ units: false, agencies: false, sectors: false, locations: false });

  // ===== Seleções =====
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // ===== popovers =====
  const [openUnit, setOpenUnit] = useState(false);
  const [openAgency, setOpenAgency] = useState(false);
  const [openSector, setOpenSector] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);

  // ===== termos de busca (com debounce) =====
  const [unitQ, setUnitQ] = useState("");
  const [agencyQ, setAgencyQ] = useState("");
  const [sectorQ, setSectorQ] = useState("");
  const [locationQ, setLocationQ] = useState("");

  const unitQd = useDebounced(unitQ);
  const agencyQd = useDebounced(agencyQ);
  const sectorQd = useDebounced(sectorQ);
  const locationQd = useDebounced(locationQ);

  // Objetos atuais (derivados das listas)
  const selectedUnitObj = useMemo(() => units.find(u => u.id === selectedUnit) ?? null, [units, selectedUnit]);
  const selectedAgencyObj = useMemo(() => agencies.find(a => a.id === selectedAgency) ?? null, [agencies, selectedAgency]);
  const selectedSectorObj = useMemo(() => sectors.find(s => s.id === selectedSector) ?? null, [sectors, selectedSector]);
  const selectedLocationObj = useMemo(() => locations.find(l => l.id === selectedLocation) ?? null, [locations, selectedLocation]);

  // ===== Labels readonly do formulário (não mudam com select) =====
  const { unit_label, agency_label, sector_label, location_label } = useMemo(() => {
    const agency   = (formSnapshot as any)?.agency ?? null as Agency | null;
    const unit     = (formSnapshot as any)?.unit ?? null as Unit | null;
    const sector   = (formSnapshot as any)?.sector ?? null as Sector | null;
    const location = (formSnapshot as any)?.location ?? null as Location | null;

    const agency_id   = (formSnapshot as any)?.agency_id   ?? agency?.id   ?? unit?.agency?.id ?? (unit as any)?.agency_id ?? "";
    const unit_id     = (formSnapshot as any)?.unit_id     ?? unit?.id     ?? "";
    const sector_id   = (formSnapshot as any)?.sector_id   ?? sector?.id   ?? "";
    const location_id = (formSnapshot as any)?.location_id ?? location?.id ?? "";

    const agency_label   = agency?.agency_name     || (agency_id   ? `#${agency_id}`   : "");
    const unit_label     = unit?.unit_name         || (unit_id     ? `#${unit_id}`     : "");
    const sector_label   = sector?.sector_name     || (sector_id   ? `#${sector_id}`   : "");
    const location_label = location?.location_name || (location_id ? `#${location_id}` : "");

    return { unit_label, agency_label, sector_label, location_label };
  }, [formSnapshot]);

  /* ====== Hidratação (quando abrir a aba com dados salvos) ====== */
  const applyingRef = useRef(false);
  const appliedKeyRef = useRef<string>("");

  const persistedKey = useMemo(() => {
    const a = (initialData as any)?.agency_id ?? "";
    const u = (initialData as any)?.unit_id ?? "";
    const s = (initialData as any)?.sector_id ?? "";
    const l = (initialData as any)?.location_id ?? "";
    return [a, u, s, l].join("|");
  }, [initialData]);

  useEffect(() => {
    if (!isActive) return;
    if (!initialData) return;
    if (appliedKeyRef.current === persistedKey) return;

    const { agency_id = "", unit_id = "", sector_id = "", location_id = "" } = initialData;

    applyingRef.current = true;
    if (!selectedUnit && unit_id) setSelectedUnit(unit_id);
    if (!selectedAgency && agency_id) setSelectedAgency(agency_id);
    if (!selectedSector && sector_id) setSelectedSector(sector_id);
    if (!selectedLocation && location_id) setSelectedLocation(location_id);
    applyingRef.current = false;

    appliedKeyRef.current = persistedKey;
  }, [isActive, initialData, persistedKey, selectedUnit, selectedAgency, selectedSector, selectedLocation]);

  /* ====== Proteção contra fetch fora de ordem ====== */
  const unitReqIdRef = useRef(0);
  const agencyReqIdRef = useRef(0);
  const sectorReqIdRef = useRef(0);

  const token = localStorage.getItem("jwt_token");

  /* ===== Fetchers (com ?q=) ===== */
  const fetchUnits = useCallback(async (q?: string) => {
    setLoading(p => ({ ...p, units: true }));
    try {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`${baseUrl}/units/${qs}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const json: { units: Unit[] } = await res.json();
      const list = Array.isArray(json?.units) ? json.units.filter(u => hasValidId(u?.id)) : [];
      setUnits(list);
    } catch (e) {
      console.error("Erro ao buscar unidades:", e);
      setUnits([]);
    } finally {
      setLoading(p => ({ ...p, units: false }));
    }
  }, [baseUrl, token]);
  
  const fetchAgenciesByUnit = useCallback(async (unitId: string, q?: string) => {
    if (!hasValidId(unitId)) return;
    const myReq = ++unitReqIdRef.current; // versão desta chamada
    setLoading(p => ({ ...p, agencies: true }));
    try {
      const params = new URLSearchParams({ unit_id: unitId });
      if (q) params.set("q", q);
      const res = await fetch(`${baseUrl}/agencies/?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const json: { agencies: Agency[] } = await res.json();
      if (unitReqIdRef.current !== myReq) return; // resposta antiga → ignora
      const list = Array.isArray(json?.agencies) ? json.agencies.filter(a => hasValidId(a?.id)) : [];
      setAgencies(list);
    } catch (e) {
      if (unitReqIdRef.current === myReq) console.error("Erro ao buscar organizações da unidade:", e);
      if (unitReqIdRef.current === myReq) setAgencies([]);
    } finally {
      if (unitReqIdRef.current === myReq) setLoading(p => ({ ...p, agencies: false }));
    }
  }, [baseUrl, token]);
  
  const fetchSectorsByAgency = useCallback(async (agencyId: string, q?: string) => {
    if (!hasValidId(agencyId)) return;
    const myReq = ++agencyReqIdRef.current;
    setLoading(p => ({ ...p, sectors: true }));
    try {
      const params = new URLSearchParams({ agency_id: agencyId });
      if (q) params.set("q", q);
      const res = await fetch(`${baseUrl}/sectors/?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const json: { sectors: Sector[] } = await res.json();
      if (agencyReqIdRef.current !== myReq) return;
      const list = Array.isArray(json?.sectors) ? json.sectors.filter(s => hasValidId(s?.id)) : [];
      setSectors(list);
    } catch (e) {
      if (agencyReqIdRef.current === myReq) console.error("Erro ao buscar setores:", e);
      if (agencyReqIdRef.current === myReq) setSectors([]);
    } finally {
      if (agencyReqIdRef.current === myReq) setLoading(p => ({ ...p, sectors: false }));
    }
  }, [baseUrl, token]);
  
  const fetchLocationsBySector = useCallback(async (sectorId: string, q?: string) => {
    if (!hasValidId(sectorId)) return;
    const myReq = ++sectorReqIdRef.current;
    setLoading(p => ({ ...p, locations: true }));
    try {
      const params = new URLSearchParams({ sector_id: sectorId });
      if (q) params.set("q", q);
      const res = await fetch(`${baseUrl}/locations/?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const json: { locations: Location[] } = await res.json();
      if (sectorReqIdRef.current !== myReq) return;
      const list = Array.isArray(json?.locations) ? json.locations.filter(l => hasValidId(l?.id)) : [];
      setLocations(list);
    } catch (e) {
      if (sectorReqIdRef.current === myReq) console.error("Erro ao buscar localizações:", e);
      if (sectorReqIdRef.current === myReq) setLocations([]);
    } finally {
      if (sectorReqIdRef.current === myReq) setLoading(p => ({ ...p, locations: false }));
    }
  }, [baseUrl, token]);
  
  // Montagem/Atualização: unidades conforme busca
  useEffect(() => { fetchUnits(unitQd); }, [fetchUnits, unitQd]);

  /* ===== Reset util ===== */
  const resetBelow = useCallback((level: "unit" | "agency" | "sector") => {
    if (level === "unit") {
      setSelectedAgency("");
      setSelectedSector("");
      setSelectedLocation("");
      setAgencies([]);
      setSectors([]);
      setLocations([]);
      setOpenAgency(false);
      setOpenSector(false);
      setOpenLocation(false);
      // invalida requisições pendentes
      agencyReqIdRef.current++;
      sectorReqIdRef.current++;
    } else if (level === "agency") {
      setSelectedSector("");
      setSelectedLocation("");
      setSectors([]);
      setLocations([]);
      setOpenSector(false);
      setOpenLocation(false);
      // invalida requisições pendentes
      sectorReqIdRef.current++;
    } else {
      setSelectedLocation("");
      setLocations([]);
      setOpenLocation(false);
    }
  }, []);

  /* ===== Handlers (reset IMEDIATO) ===== */
  const handleUnitChange = (unitId: string) => {
    if (unitId === selectedUnit) return;
    if (!applyingRef.current) resetBelow("unit");
    setSelectedUnit(unitId);
    fetchAgenciesByUnit(unitId, agencyQd);
  };

  const handleAgencyChange = (agencyId: string) => {
    if (agencyId === selectedAgency) return;
    if (!applyingRef.current) resetBelow("agency");
    setSelectedAgency(agencyId);
    fetchSectorsByAgency(agencyId, sectorQd);
  };

  const handleSectorChange = (sectorId: string) => {
    if (sectorId === selectedSector) return;
    if (!applyingRef.current) resetBelow("sector");
    setSelectedSector(sectorId);
    fetchLocationsBySector(sectorId, locationQd);
  };

  const handleLocationChange = (locationId: string) => {
    if (locationId !== selectedLocation) setSelectedLocation(locationId);
  };

  // ===== Efeitos defensivos (caso seleção mude sem passar pelos handlers) =====
  useEffect(() => {
    if (!selectedUnit) return;
    if (!applyingRef.current) {
      fetchAgenciesByUnit(selectedUnit, agencyQd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnit, fetchAgenciesByUnit, agencyQd]);

  useEffect(() => {
    if (!selectedAgency) return;
    if (!applyingRef.current) {
      fetchSectorsByAgency(selectedAgency, sectorQd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgency, fetchSectorsByAgency, sectorQd]);

  useEffect(() => {
    if (!selectedSector) return;
    if (!applyingRef.current) {
      fetchLocationsBySector(selectedSector, locationQd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSector, fetchLocationsBySector, locationQd]);

  // Emissão para o pai
  const emitReadyRef = useRef(false);
  useLayoutEffect(() => { emitReadyRef.current = true; }, []);
  useEffect(() => {
    if (!emitReadyRef.current) return;
    const isValid = Boolean(selectedUnit && selectedAgency && selectedSector && selectedLocation);
    onValidityChange(!isOpen || isValid);
    onStateChange?.({
      agency_id: selectedAgency || undefined,
      unit_id: selectedUnit || undefined,
      sector_id: selectedSector || undefined,
      location_id: selectedLocation || undefined,
      agency: selectedAgencyObj ?? null,
      unit: selectedUnitObj ?? null,
      sector: selectedSectorObj ?? null,
      location: selectedLocationObj ?? null,
      isOpen,
    });
  }, [
    selectedAgency, selectedUnit, selectedSector, selectedLocation,
    selectedAgencyObj, selectedUnitObj, selectedSectorObj, selectedLocationObj,
    onValidityChange, onStateChange, isOpen,
  ]);

  const showResumoVitrine = flowShort === "vitrine";

  // helpers de rótulo para evitar "vazios" em transições
  const unitButtonText = () => {
    if (selectedUnit) {
      const name = units.find(u => u.id === selectedUnit)?.unit_name;
      return name ?? "Selecione uma unidade";
    }
    return loading.units ? "Carregando..." : "Selecione uma unidade";
  };

  const agencyButtonText = () => {
    if (!selectedUnit) return "Selecione uma unidade primeiro";
    if (selectedAgency) {
      const name = agencies.find(a => a.id === selectedAgency)?.agency_name;
      return name ?? "Selecione uma organização";
    }
    return loading.agencies ? "Carregando..." : "Selecione uma organização";
  };

  const sectorButtonText = () => {
    if (!selectedAgency) return "Selecione uma organização";
    if (selectedSector) {
      const name = sectors.find(s => s.id === selectedSector)?.sector_name;
      return name ?? "Selecione um setor";
    }
    return loading.sectors ? "Carregando..." : "Selecione um setor";
  };

  const locationButtonText = () => {
    if (!selectedSector) return "Selecione um setor primeiro";
    if (selectedLocation) {
      const name = locations.find(l => l.id === selectedLocation)?.location_name;
      return name ?? "Selecione um local";
    }
    return loading.locations ? "Carregando..." : "Selecione um local";
  };

  /* ===== UI ===== */
  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className="mb-16 text-4xl font-semibold max-w-[1000px]">
          {flowShort === "vitrine"
            ? "Caso o item não esteja  no local de guarda indicado abaixo, informe a localização atual."
            : "Qual a localização atual do bem?"}
        </h1>
      </div>

      <div className="ml-8">
        <div className="flex gap-2 mb-8">
          <AlertCircle size={24} />
          <div>
            <p className="font-medium">Localização do patrimônio</p>
            <p className="text-gray-500 text-sm">
              Informar o local de guarda atual do bem não altera imediatamente sua
              localização ou seu responsável/guardião legal no SICPAT. Essa informação será utilizada apenas como orientação para
              a Seção de Patrimônio localizar o item para conferência/avaliação.
            </p>
          </div>
        </div>

        {/* Resumo somente-leitura (do formulário) */}
        {showResumoVitrine && (
          <>
            <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-4">
              <div className="grid gap-2">
                <Label>Unidade</Label>
                <Input disabled value={unit_label} />
              </div>
              <div className="grid gap-2">
                <Label>Organização</Label>
                <Input disabled value={agency_label} />
              </div>
              <div className="grid gap-2">
                <Label>Setor / Departamento</Label>
                <Input disabled value={sector_label} />
              </div>
              <div className="grid gap-2">
                <Label>Local de guarda</Label>
                <Input disabled value={location_label} />
              </div>
            </div>
            <Separator className="my-8" />
            <Button
              className="w-full mb-8"
              onClick={() => setIsOpen(prev => !prev)}
              variant="outline"
            >
              {isOpen ? <X size={16} /> : <Pencil size={16} />}
              {isOpen ? "Cancelar alteração" : "Informar localização"}
            </Button>
          </>
        )}

        {/* Edição */}
        {isOpen && (
          <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 lg:flex-row mt-4">
            {/* Unidade */}
            <div className="grid gap-3 w-full">
              <Label>Unidade</Label>
              <Popover open={openUnit} onOpenChange={setOpenUnit}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openUnit}
                    className="w-full justify-between"
                    disabled={loading.units}
                  >
                    {unitButtonText()}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Buscar unidade (nome/código/SIAF)..."
                      onValueChange={setUnitQ}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {loading.units ? "Carregando..." : "Nenhuma unidade encontrada."}
                      </CommandEmpty>
                      <CommandGroup>
                        {units.map(u => (
                          <CommandItem
                            key={u.id}
                            value={`${u.unit_name} ${u.unit_code} ${u.unit_siaf}`}
                            onSelect={() => { handleUnitChange(u.id); setOpenUnit(false); }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedUnit === u.id ? "opacity-100" : "opacity-0")} />
                            <div className="flex flex-col">
                              <span className="text-sm">{u.unit_name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Organização */}
            <div className="grid gap-3 w-full">
              <Label>Organização</Label>
              <Popover open={openAgency} onOpenChange={setOpenAgency}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openAgency}
                    className="w-full justify-between"
                    disabled={!selectedUnit || loading.agencies}
                  >
                    {agencyButtonText()}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Buscar organização (nome/código)..."
                      onValueChange={(v) => {
                        setAgencyQ(v);
                        // busca incremental enquanto digita (com debounce)
                        if (selectedUnit) fetchAgenciesByUnit(selectedUnit, v);
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {loading.agencies ? "Carregando..." : "Nenhuma organização encontrado(a)."}
                      </CommandEmpty>
                      <CommandGroup>
                        {agencies.map(a => (
                          <CommandItem
                            key={a.id}
                            value={`${a.agency_name} ${a.agency_code}`}
                            onSelect={() => { handleAgencyChange(a.id); setOpenAgency(false); }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedAgency === a.id ? "opacity-100" : "opacity-0")} />
                            <div className="flex flex-col">
                              <span className="text-sm">{a.agency_name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Setor */}
            <div className="grid gap-3 w-full">
              <Label>Setor / Departamento</Label>
              <Popover open={openSector} onOpenChange={setOpenSector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSector}
                    className="w-full justify-between"
                    disabled={!selectedAgency || loading.sectors}
                  >
                    {sectorButtonText()}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Buscar setor (nome/código)..."
                      onValueChange={(v) => {
                        setSectorQ(v);
                        if (selectedAgency) fetchSectorsByAgency(selectedAgency, v);
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {loading.sectors ? "Carregando..." : "Nenhum setor encontrado."}
                      </CommandEmpty>
                      <CommandGroup>
                        {sectors.map(s => (
                          <CommandItem
                            key={s.id}
                            value={`${s.sector_name} ${s.sector_code}`}
                            onSelect={() => { handleSectorChange(s.id); setOpenSector(false); }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedSector === s.id ? "opacity-100" : "opacity-0")} />
                            <div className="flex flex-col">
                              <span className="text-sm">{s.sector_name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Local */}
            <div className="grid gap-3 w-full">
              <Label>Local de guarda</Label>
              <Popover open={openLocation} onOpenChange={setOpenLocation}>
                <PopoverTrigger asChild>
                  <Button
                    key={`${selectedAgency}-${selectedSector}`} // força remount ao trocar agência/setor
                    variant="outline"
                    role="combobox"
                    aria-expanded={openLocation}
                    className="w-full justify-between"
                    disabled={!selectedSector || loading.locations}
                  >
                    {locationButtonText()}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Buscar local (nome/código)..."
                      onValueChange={(v) => {
                        setLocationQ(v);
                        if (selectedSector) fetchLocationsBySector(selectedSector, v);
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {loading.locations ? "Carregando..." : "Nenhum local encontrado."}
                      </CommandEmpty>
                      <CommandGroup>
                        {locations.map(l => (
                          <CommandItem
                            key={l.id}
                            value={`${l.location_name} ${l.location_code}`}
                            onSelect={() => { handleLocationChange(l.id); setOpenLocation(false); }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedLocation === l.id ? "opacity-100" : "opacity-0")} />
                            <div className="flex flex-col">
                              <span className="text-sm">{l.location_name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
