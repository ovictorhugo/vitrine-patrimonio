import { Funnel, MagnifyingGlass } from "phosphor-react";
import { Alert } from "../ui/alert";
import { useModal } from "../hooks/use-modal-store";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UserContext } from "../../context/context";
import { Play, Trash, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useQuery } from "../authentication/signIn";
import { useLocation, useNavigate } from "react-router-dom";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
const sanitizeBaseUrl = (u?: string) => (u || "").replace(/\/+$/, "");
const first = (v: string | null) =>
  v ? v.split(";").filter(Boolean)[0] ?? "" : ("" as string);
type Picked = { kind: Kind; id: string; label: string };

/** Tipagens mínimas **/
type LegalGuardian = {
  id: string;
  legal_guardians_name: string;
  legal_guardians_code: string;
};
type Material = { id: string; material_name: string; material_code: string };
type LocationT = { id: string; location_name: string; location_code: string };
type Unit = { id: string; unit_name: string; unit_code: string };
type Agency = { id: string; agency_name: string; agency_code: string };
type Sector = { id: string; sector_name: string; sector_code: string };

type Kind = "material" | "guardian" | "location" | "unit" | "agency" | "sector";

export const KIND_BG: Record<Kind, string> = {
  material:
    "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
  guardian:
    "bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700",
  location:
    "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700",
  unit: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700",
  agency:
    "bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700",
  sector:
    "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700",
};

export function Search() {
  const { onOpen } = useModal();
  const { urlGeral } = useContext(UserContext);
  const baseUrl = useMemo(() => sanitizeBaseUrl(urlGeral), [urlGeral]);

  const queryUrl = useQuery();

  const navigate = useNavigate();
  const location = useLocation();

  /** ===== URL -> estado inicial ===== */
  const initialQ = queryUrl.get("q") ?? "";
  const [search, setSearch] = useState(initialQ);

  // Lê PLURAL da URL (vindo do modal)
  const [selectedMaterial, setSelectedMaterial] = useState(
    first(queryUrl.get("material_ids"))
  );
  const [selectedLegalGuardian, setSelectedLegalGuardian] = useState(
    first(queryUrl.get("legal_guardian_ids"))
  );
  const [selectedLocation, setSelectedLocation] = useState(
    first(queryUrl.get("location_ids"))
  );
  const [selectedUnit, setSelectedUnit] = useState(
    first(queryUrl.get("unit_ids"))
  );
  const [selectedAgency, setSelectedAgency] = useState(
    first(queryUrl.get("agency_ids"))
  );
  const [selectedSector, setSelectedSector] = useState(
    first(queryUrl.get("sector_ids"))
  );

  // paginação
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState<number>(
    Number(queryUrl.get("offset") || "0")
  );
  const [limit, setLimit] = useState<number>(
    Number(queryUrl.get("limit") || "24")
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  /** ===== Helpers URL ===== */
  const setParamOrDelete = (sp: URLSearchParams, key: string, val?: string) => {
    if (val && val.trim().length > 0) sp.set(key, val);
    else sp.delete(key);
  };

  const handleNavigate = (
    newOffset: number,
    newLimit: number,
    doScroll = true
  ) => {
    const sp = new URLSearchParams(location.search);
    sp.set("offset", String(newOffset));
    sp.set("limit", String(newLimit));

    // manter q
    setParamOrDelete(sp, "q", search);

    // escrever PLURAL na URL (alinha com o modal)
    setParamOrDelete(sp, "material_ids", selectedMaterial);
    setParamOrDelete(sp, "legal_guardian_ids", selectedLegalGuardian);
    setParamOrDelete(sp, "location_ids", selectedLocation);
    setParamOrDelete(sp, "unit_ids", selectedUnit);
    setParamOrDelete(sp, "agency_ids", selectedAgency);
    setParamOrDelete(sp, "sector_ids", selectedSector);

    navigate({ pathname: location.pathname, search: sp.toString() });

    if (doScroll && hasNavigated && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setHasNavigated(true);
  };

  useEffect(() => {
    handleNavigate(offset, limit, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit]);

  /** ===== Listas para nomes dos chips ===== */
  const token = localStorage.getItem("jwt_token") || "";
  const [materials, setMaterials] = useState<Material[]>([]);
  const [guardians, setGuardians] = useState<LegalGuardian[]>([]);
  const [locations, setLocations] = useState<LocationT[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);

  const baseHeaders: HeadersInit = useMemo(() => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/catalog/search/materials`, {
        headers: baseHeaders,
      });
      const json = await res.json();
      const list: Material[] = Array.isArray(json?.materials)
        ? json.materials
        : Array.isArray(json)
        ? json
        : [];
      console.log(list);
      setMaterials(list);
    } catch {}
  }, [baseUrl, baseHeaders]);

  const fetchGuardians = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/legal-guardians/`, {
        headers: baseHeaders,
      });
      const json = await res.json();
      const list: LegalGuardian[] = Array.isArray(json?.legal_guardians)
        ? json.legal_guardians
        : Array.isArray(json)
        ? json
        : [];
      setGuardians(list);
    } catch {}
  }, [baseUrl, baseHeaders]);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/locations/`, {
        headers: baseHeaders,
      });
      const json = await res.json();
      const list: LocationT[] = Array.isArray(json?.locations)
        ? json.locations
        : Array.isArray(json)
        ? json
        : [];
      setLocations(list);
    } catch {}
  }, [baseUrl, baseHeaders]);

  const fetchUnits = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/units/`, { headers: baseHeaders });
      const json = await res.json();
      const list: Unit[] = Array.isArray(json?.units)
        ? json.units
        : Array.isArray(json)
        ? json
        : [];
      setUnits(list);
    } catch {}
  }, [baseUrl, baseHeaders]);

  const fetchAgencies = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/agencies/`, { headers: baseHeaders });
      const json = await res.json();
      const list: Agency[] = Array.isArray(json?.agencies)
        ? json.agencies
        : Array.isArray(json)
        ? json
        : [];
      setAgencies(list);
    } catch {}
  }, [baseUrl, baseHeaders]);

  const fetchSectors = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/sectors/`, { headers: baseHeaders });
      const json = await res.json();
      const list: Sector[] = Array.isArray(json?.sectors)
        ? json.sectors
        : Array.isArray(json)
        ? json
        : [];
      setSectors(list);
    } catch {}
  }, [baseUrl, baseHeaders]);

  useEffect(() => {
    fetchMaterials();
    fetchGuardians();
    fetchLocations();
    fetchUnits();
    fetchAgencies();
    fetchSectors();
  }, [
    fetchMaterials,
    fetchGuardians,
    fetchLocations,
    fetchUnits,
    fetchAgencies,
    fetchSectors,
  ]);

  /** ===== URL -> Estado (escuta mudanças do modal/plural) ===== */
  useEffect(() => {
    const sp = new URLSearchParams(location.search);

    const q = sp.get("q") ?? "";
    const m = first(sp.get("material_ids"));
    const g = first(sp.get("legal_guardian_ids"));
    const l = first(sp.get("location_ids"));
    const u = first(sp.get("unit_ids"));
    const a = first(sp.get("agency_ids"));
    const s = first(sp.get("sector_ids"));
    const off = Number(sp.get("offset") ?? "0");
    const lim = Number(sp.get("limit") ?? String(limit));

    setSearch((prev) => (prev !== q ? q : prev));
    setSelectedMaterial((prev) => (prev !== m ? m : prev));
    setSelectedLegalGuardian((prev) => (prev !== g ? g : prev));
    setSelectedLocation((prev) => (prev !== l ? l : prev));
    setSelectedUnit((prev) => (prev !== u ? u : prev));
    setSelectedAgency((prev) => (prev !== a ? a : prev));
    setSelectedSector((prev) => (prev !== s ? s : prev));

    setLimit((prev) => (prev !== lim ? lim : prev));
    setOffset((prev) => (prev !== off ? off : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  /** ===== Nomes para chips ===== */
  const materialName = useMemo(
    () => materials.find((m) => m.id === selectedMaterial)?.material_name || "",
    [materials, selectedMaterial]
  );
  const guardianName = useMemo(
    () =>
      guardians.find((g) => g.id === selectedLegalGuardian)
        ?.legal_guardians_name || "",
    [guardians, selectedLegalGuardian]
  );
  const locationName = useMemo(
    () => locations.find((l) => l.id === selectedLocation)?.location_name || "",
    [locations, selectedLocation]
  );
  const unitName = useMemo(
    () => units.find((u) => u.id === selectedUnit)?.unit_name || "",
    [units, selectedUnit]
  );
  const agencyName = useMemo(
    () => agencies.find((a) => a.id === selectedAgency)?.agency_name || "",
    [agencies, selectedAgency]
  );
  const sectorName = useMemo(
    () => sectors.find((s) => s.id === selectedSector)?.sector_name || "",
    [sectors, selectedSector]
  );

  /** ===== Limpar ===== */
  const clearAllFilters = () => {
    const sp = new URLSearchParams(location.search);
    sp.delete("q");
    sp.delete("material_ids");
    sp.delete("legal_guardian_ids");
    sp.delete("location_ids");
    sp.delete("unit_ids");
    sp.delete("agency_ids");
    sp.delete("sector_ids");
    sp.set("offset", "0");
    sp.set("limit", String(limit));

    setSearch("");
    setSelectedMaterial("");
    setSelectedLegalGuardian("");
    setSelectedLocation("");
    setSelectedUnit("");
    setSelectedAgency("");
    setSelectedSector("");
    setOffset(0);

    navigate({ pathname: location.pathname, search: sp.toString() });
  };

  const clearOne = (
    key: "material" | "guardian" | "location" | "unit" | "agency" | "sector"
  ) => {
    const sp = new URLSearchParams(location.search);
    if (key === "material") {
      setSelectedMaterial("");
      sp.delete("material_ids");
    }
    if (key === "guardian") {
      setSelectedLegalGuardian("");
      sp.delete("legal_guardian_ids");
    }
    if (key === "location") {
      setSelectedLocation("");
      sp.delete("location_ids");
    }
    if (key === "unit") {
      setSelectedUnit("");
      sp.delete("unit_ids");
    }
    if (key === "agency") {
      setSelectedAgency("");
      sp.delete("agency_ids");
    }
    if (key === "sector") {
      setSelectedSector("");
      sp.delete("sector_ids");
    }
    sp.set("offset", "0");
    setOffset(0);
    navigate({ pathname: location.pathname, search: sp.toString() });
  };

  /** ===== Barra de busca no padrão do seu modelo ===== */
  const [maria, setMaria] = useState(false);
  const [version, setVersion] = useState(false);
  const [searchType, setSearchType] = useState<string>("");

  // tipo ativo para cor do botão (prioriza o que estiver setado)
  const activeKind =
    (selectedMaterial && "material") ||
    (selectedLegalGuardian && "guardian") ||
    (selectedLocation && "location") ||
    (selectedUnit && "unit") ||
    (selectedAgency && "agency") ||
    (selectedSector && "sector") ||
    "";

  type Kind =
    | "material"
    | "guardian"
    | "location"
    | "unit"
    | "agency"
    | "sector";

  const DEFAULT_BTN =
    "bg-eng-blue hover:bg-eng-dark-blue dark:bg-eng-blue dark:hover:bg-eng-dark-blue";

  const BTN_COLOR = (activeKind?: Kind | "") =>
    activeKind && KIND_BG[activeKind] ? KIND_BG[activeKind] : DEFAULT_BTN;

  /** ===== Busca (debounce) – atualiza q na URL ===== */
  const typingTimer = useRef<number | undefined>(undefined);
  const onChangeSearch = (val: string) => {
    setSearch(val);
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      setOffset(0);
      handleNavigate(0, limit);
    }, 300);
  };

  const [input, setInput] = useState("");
  // apenas UM item selecionado (de um ÚNICO tipo)
  const [picked, setPicked] = useState<Picked | null>(null);

  // selecionar (troca qualquer seleção anterior — mantém sempre 1 item/1 tipo)
  const choose = (k: Kind, id: string, label: string) => {
    setPicked({ kind: k, id, label });
    setInput("");
  };

  // aplicar = escreve somente o tipo selecionado e limpa os demais
  const apply = () => {
    const sp = new URLSearchParams(location.search);
    // limpa todos
    sp.delete("material_ids");
    sp.delete("legal_guardian_ids");
    sp.delete("location_ids");
    sp.delete("unit_ids");
    sp.delete("agency_ids");
    sp.delete("sector_ids");

    if (picked) {
      const param =
        picked.kind === "material"
          ? "material_ids"
          : picked.kind === "guardian"
          ? "legal_guardian_ids"
          : picked.kind === "location"
          ? "location_ids"
          : picked.kind === "unit"
          ? "unit_ids"
          : picked.kind === "agency"
          ? "agency_ids"
          : "sector_ids";
      sp.set(param, picked.id);
      sp.set("offset", "0");
    }

    navigate({ pathname: location.pathname, search: sp.toString() });
  };

  // limpar seleção (não altera URL até aplicar)
  const clearPicked = () => setPicked(null);

  return (
    <Alert className="h-14 mt-4 mb-2 p-2 flex items-center justify-between">
      <div className="flex items-center gap-2 w-full flex-1">
        <Play
          size={16}
          className="hidden md:flex md:whitespace-nowrap md:w-10"
        />

        <div className="hidden md:flex gap-2 w-fit items-center">
          {/* chips do item selecionado (apenas 1 no desenho atual) */}
          {(selectedMaterial ||
            selectedLegalGuardian ||
            selectedLocation ||
            selectedUnit ||
            selectedAgency ||
            selectedSector) && (
            <div className="flex gap-2 mx-2 items-center">
              {[
                {
                  kind: "material",
                  value: selectedMaterial,
                  label: materialName,
                },
                {
                  kind: "guardian",
                  value: selectedLegalGuardian,
                  label: guardianName,
                },
                {
                  kind: "location",
                  value: selectedLocation,
                  label: locationName,
                },
                { kind: "unit", value: selectedUnit, label: unitName },
                { kind: "agency", value: selectedAgency, label: agencyName },
                { kind: "sector", value: selectedSector, label: sectorName },
              ].map(
                ({ kind, value, label }) =>
                  value && (
                    <div
                      key={kind}
                      className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs text-white ${
                        KIND_BG[kind as Kind]
                      }`}
                    >
                      {label || value}
                      <X
                        size={12}
                        onClick={() => clearOne(kind as Kind)}
                        className="cursor-pointer"
                      />
                    </div>
                  )
              )}
            </div>
          )}
        </div>

        {/* input: abre o modal ao clicar e também atualiza "q" enquanto digita */}
        <Input
          onClick={() => onOpen("search")}
          onChange={(e) => onChangeSearch(e.target.value)}
          value={search}
          type="text"
          className="border-0 w-full flex flex-1"
        />
      </div>

      <div className="w-fit flex gap-2">
        {(selectedMaterial ||
          selectedLegalGuardian ||
          selectedLocation ||
          selectedUnit ||
          selectedAgency ||
          selectedSector) && (
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={() => clearAllFilters()}
          >
            <Trash size={16} />
          </Button>
        )}

        <Button
          variant="outline"
          className={`${BTN_COLOR(
            activeKind
          )} text-white hover:text-white  border-0`}
          size="icon"
        >
          <MagnifyingGlass size={16} />
        </Button>
      </div>
    </Alert>
  );
}
