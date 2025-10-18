import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Package,
  SlidersHorizontal,
  TimerReset,
  Trash,
  X as XIcon,
} from "lucide-react";
import { Button } from "../../../ui/button";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UserContext } from "../../../../context/context";
import { Alert } from "../../../ui/alert";
import { SquaresFour, Rows } from "phosphor-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { useQuery } from "../../../authentication/signIn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Skeleton } from "../../../ui/skeleton";
import { PatrimonioItem } from "../../../busca-patrimonio/patrimonio-item";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Search } from "../../../search/search";
import { Badge } from "../../../ui/badge";
import { useModal } from "../../../hooks/use-modal-store";
import { FiltersSheetAssets } from "../../create-temp-asset/filters-sheet-assets";
import { Switch } from "../../../ui/switch";

/** Tipagens mínimas **/
type Material = { id: string; material_name: string; material_code: string };
type LegalGuardian = { id: string; legal_guardians_name: string; legal_guardians_code: string };
type LocationT = { id: string; location_name: string; location_code: string };

export type Asset = {
  asset_code: string;
  asset_check_digit: string;
  atm_number: string | null;
  serial_number: string | null;
  asset_status: string;
  asset_value: string | null;
  asset_description: string | null;
  csv_code: string | null;
  accounting_entry_code: string | null;
  item_brand: string | null;
  item_model: string | null;
  group_type_code: string | null;
  group_code: string | null;
  expense_element_code: string | null;
  subelement_code: string | null;
  id: string;
  material: Material | null;
  legal_guardian: LegalGuardian | null;
  location: LocationT | null;
  is_official: boolean;
};

type AssetsResponse = { assets: Asset[] };

const sanitizeBaseUrl = (u?: string) => (u || "").replace(/\/+$/, "");
const first = (v: string | null) => (v ? v.split(";").filter(Boolean)[0] ?? "" : "");

const URL_KEY_STATUS = "asset_statuses";
const URL_KEY_CSV = "csv_codes";
const URL_KEY_OFFICIAL = "is_official";

interface Props {
  type:string
}
export function Patrimonios({type}:Props) {
  const { urlGeral, user } = useContext(UserContext);
  const baseUrl = useMemo(() => sanitizeBaseUrl(urlGeral), [urlGeral]);

  const queryUrl = useQuery();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { onOpen } = useModal();

  const [jsonData, setJsonData] = useState<any[]>([]);
  const [isOn, setIsOn] = useState(true);

  /** ===== URL -> estado inicial ===== */
  const initialQ = queryUrl.get("q") ?? "";
  const [search, setSearch] = useState(initialQ);

  // filtros vindos do modal (PLURAL na URL -> SINGULAR na API via first())
  const [selectedMaterial, setSelectedMaterial] = useState(first(queryUrl.get("material_ids")));
  const [selectedLegalGuardian, setSelectedLegalGuardian] = useState(first(queryUrl.get("legal_guardian_ids")));
  const [selectedLocation, setSelectedLocation] = useState(first(queryUrl.get("location_ids")));
  const [selectedUnit, setSelectedUnit] = useState(first(queryUrl.get("unit_ids")));
  const [selectedAgency, setSelectedAgency] = useState(first(queryUrl.get("agency_ids")));
  const [selectedSector, setSelectedSector] = useState(first(queryUrl.get("sector_ids")));

  // filtros do sheet (PLURAL na URL)
  const [statusList, setStatusList] = useState<string[]>(
    queryUrl.get(URL_KEY_STATUS)?.split(";").filter(Boolean) || []
  );
  const [csvList, setCsvList] = useState<string[]>(
    queryUrl.get(URL_KEY_CSV)?.split(";").filter(Boolean) || []
  );

  // Switch is_official (default true)
  const initialOfficialStr = queryUrl.get(URL_KEY_OFFICIAL);
  const initialOfficial = initialOfficialStr === null ? true : initialOfficialStr === "true";
  const [isOfficial, setIsOfficial] = useState<boolean>(initialOfficial);

  // paginação
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState<number>(Number(queryUrl.get("offset") || "0"));
  const [limit, setLimit] = useState<number>(Number(queryUrl.get("limit") || "24"));
  const [items, setItems] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const isFirstPage = offset === 0;
  const isLastPage = items.length < limit;

  // CSV download
  const convertJsonToCsv = (json: any[]): string => {
    if (!json || json.length === 0) return "\uFEFF";
    const replacer = (_: string, value: any) => (value === null ? "" : value);
    const header = Object.keys(json[0]);
    const csv = [
      "\uFEFF" + header.join(";"),
      ...json.map((item) => header.map((fieldName) => JSON.stringify(item[fieldName], replacer)).join(";")),
    ].join("\r\n");
    return csv;
  };

  const handleDownloadJson = () => {
    try {
      const csvData = convertJsonToCsv(jsonData);
      const blob = new Blob([csvData], { type: "text/csv;charset=windows-1252;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `dados.csv`;
      link.href = url;
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  /** ========= URL helpers ========= */
// ===== URL helpers =====
const buildSearchString = (overrides?: Partial<{
  search: string;
  selectedMaterial: string;
  selectedLegalGuardian: string;
  selectedLocation: string;
  selectedUnit: string;
  selectedAgency: string;
  selectedSector: string;
  statusList: string[];
  csvList: string[];
  isOfficial: boolean;
  offset: number;
  limit: number;
}>) => {
  // 🔧 Começa clonando os parâmetros atuais para preservar os "desconhecidos" (ex: loc_id)
  const sp = new URLSearchParams(location.search);

  const _search   = overrides?.search ?? search;
  const _mat      = overrides?.selectedMaterial ?? selectedMaterial;
  const _lg       = overrides?.selectedLegalGuardian ?? selectedLegalGuardian;
  const _loc      = overrides?.selectedLocation ?? selectedLocation;
  const _unit     = overrides?.selectedUnit ?? selectedUnit;
  const _agency   = overrides?.selectedAgency ?? selectedAgency;
  const _sector   = overrides?.selectedSector ?? selectedSector;
  const _status   = overrides?.statusList ?? statusList;
  const _csv      = overrides?.csvList ?? csvList;
  const _official = overrides?.isOfficial ?? isOfficial;
  const _offset   = overrides?.offset ?? offset;
  const _limit    = overrides?.limit ?? limit;

  const setParamOrDelete = (key: string, val?: string) => {
    if (val && val.trim().length > 0) sp.set(key, val);
    else sp.delete(key);
  };

  // Só sobrescrevemos os parâmetros que este componente controla:
  setParamOrDelete("q", _search);
  setParamOrDelete("material_ids", _mat);
  setParamOrDelete("legal_guardian_ids", _lg);
  setParamOrDelete("location_ids", _loc);
  setParamOrDelete("unit_ids", _unit);
  setParamOrDelete("agency_ids", _agency);
  setParamOrDelete("sector_ids", _sector);

  if (_status.length > 0) sp.set(URL_KEY_STATUS, _status.join(";"));
  else sp.delete(URL_KEY_STATUS);

  if (_csv.length > 0) sp.set(URL_KEY_CSV, _csv.join(";"));
  else sp.delete(URL_KEY_CSV);

  // Mantém is_official sempre explícito para evitar ambiguidade
  sp.set(URL_KEY_OFFICIAL, String(_official));

  sp.set("offset", String(_offset));
  sp.set("limit", String(_limit));

  return sp.toString();
};


  const navigateWithParams = (overrides?: Partial<{
    search: string;
    selectedMaterial: string;
    selectedLegalGuardian: string;
    selectedLocation: string;
    selectedUnit: string;
    selectedAgency: string;
    selectedSector: string;
    statusList: string[];
    csvList: string[];
    isOfficial: boolean;
    offset: number;
    limit: number;
  }>) => {
    const newSearch = buildSearchString(overrides);
    const current = location.search.replace(/^\?/, "");
    if (newSearch !== current) {
      navigate({ pathname: location.pathname, search: newSearch }, { replace: true });
    }
  };

  /** ========= Sincroniza estados com a URL ao montar (e em back/forward) ========= */
  useEffect(() => {
    const sp = new URLSearchParams(location.search);

    setSearch(sp.get("q") ?? "");
    setSelectedMaterial(first(sp.get("material_ids")));
    setSelectedLegalGuardian(first(sp.get("legal_guardian_ids")));
    setSelectedLocation(first(sp.get("location_ids")));
    setSelectedUnit(first(sp.get("unit_ids")));
    setSelectedAgency(first(sp.get("agency_ids")));
    setSelectedSector(first(sp.get("sector_ids")));

    setStatusList(sp.get(URL_KEY_STATUS)?.split(";").filter(Boolean) || []);
    setCsvList(sp.get(URL_KEY_CSV)?.split(";").filter(Boolean) || []);

    const offStr = sp.get(URL_KEY_OFFICIAL);
    setIsOfficial(offStr === null ? true : offStr === "true");

    setOffset(Number(sp.get("offset") || "0"));
    setLimit(Number(sp.get("limit") || "24"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  /** ========= API ========= */
  const token = localStorage.getItem("jwt_token") || "";
  const baseHeaders: HeadersInit = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);


    const type_search = queryUrl.get("loc_id"); // location_id
  


  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = new URL(`${baseUrl}/assets/`);
        if (search) url.searchParams.set("q", search);

        if (selectedMaterial) url.searchParams.set("material_id", selectedMaterial);
        if (selectedLegalGuardian) url.searchParams.set("legal_guardian_id", selectedLegalGuardian);
        if (selectedLocation) url.searchParams.set("location_id", selectedLocation);
        if (selectedUnit) url.searchParams.set("unit_id", selectedUnit);
        if (selectedAgency) url.searchParams.set("agency_id", selectedAgency);
        if (selectedSector) url.searchParams.set("sector_id", selectedSector);

        // plural na URL -> singular na API
        if (statusList.length > 0) url.searchParams.set("asset_status", statusList[0]);
        if (csvList.length > 0) url.searchParams.set("csv_code", csvList[0]);

        if (type == 'temp') url.searchParams.set("is_official", String(isOfficial));
          if (type == 'loc' || type == 'user') url.searchParams.set("is_official", String('true'));
         if (type == 'loc') url.searchParams.set("location_id", String(type_search));
        if (type == 'user') url.searchParams.set("legal_guardian_id", String(user?.system_identity.legal_guardian.id));
       
        url.searchParams.set("offset", String(offset));
        url.searchParams.set("limit", String(limit));

        const res = await fetch(url.toString(), {
          method: "GET",
          signal: controller.signal,
          headers: baseHeaders,
        });

        if (!res.ok) throw new Error(`Erro ao buscar catálogo (${res.status})`);

        const data: AssetsResponse = await res.json();
        const assets = Array.isArray(data.assets) ? data.assets : [];
        setItems(assets);
        setJsonData(assets);
          setLoading(false);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e?.message || "Erro inesperado ao carregar itens.");
          setItems([]);
          setJsonData([]);
        }
      } 
    };

    run();
    return () => controller.abort();
  }, [
    baseUrl,
    baseHeaders,
    search,
    selectedMaterial,
    selectedLegalGuardian,
    selectedLocation,
    selectedUnit,
    selectedAgency,
    selectedSector,
    statusList,
    csvList,
    isOfficial,
    offset,
    limit,
  ]);

  const filteredItems = items;
  const [typeVisu, setTypeVisu] = useState<"block" | "rows">("block");

  /** ===== Busca (debounce) – atualiza q na URL ===== */
  const typingTimer = useRef<number | undefined>(undefined);
  const onChangeSearchDebounced = (val: string) => {
    setSearch(val);
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      setOffset(0);
      navigateWithParams({ search: val, offset: 0 });
    }, 300);
  };

  /** ===== Handlers que já navegam com valores “frescos” ===== */
  const goPrev = () => {
    const newOffset = Math.max(0, offset - limit);
    setOffset(newOffset);
    navigateWithParams({ offset: newOffset });
  };
  const goNext = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    navigateWithParams({ offset: newOffset });
  };
  const onChangeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setOffset(0);
    navigateWithParams({ limit: newLimit, offset: 0 });
  };
  const onChangeStatuses = (v: string[]) => {
    setStatusList(v);
    setOffset(0);
    navigateWithParams({ statusList: v, offset: 0 });
  };
  const onChangeCsv = (v: string[]) => {
    setCsvList(v);
    setOffset(0);
    navigateWithParams({ csvList: v, offset: 0 });
  };
  const onToggleOfficial = (checked: boolean) => {
    setIsOfficial(checked);
    setOffset(0);
    navigateWithParams({ isOfficial: checked, offset: 0 });
  };

  // Sheet controlado pelo pai
  const FiltersSheetUI = (
    <FiltersSheetAssets
      itemsBase={items}
      selectedStatuses={statusList}
      setSelectedStatuses={onChangeStatuses}
      selectedCsvCodes={csvList}
      setSelectedCsvCodes={onChangeCsv}
    />
  );

  return (
    <div className="flex flex-col h-full">
     

      <main className="flex flex-col ">
       
       

        {/* Barra superior */}
        <div className="top-[68px] sticky z-[9] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur">
          <div className="w-full px-8 border-b border-b-neutral-200 dark:border-b-neutral-800">
            {isOn && (
              <div className="w-full flex flex-col gap-3 pt-4">
                {/* se seu <Search /> aceitar onChange, passe onChangeSearchDebounced */}
                <Search />
              </div>
            )}

            <div className="flex w-full flex-wrap pt-2 pb-3 justify-between">
              <div />
              <div className="hidden xl:flex xl:flex-nowrap gap-2 items-center">
                <div className="md:flex md:flex-nowrap gap-2 items-center">
                       {/* Switch is_official (default true) */}
                                {type == 'temp' && (
                                     <div className="flex items-center gap-2 pl-2">
                                     <span className="text-sm text-muted-foreground">SICPAT</span>
                                     <Switch checked={isOfficial} onCheckedChange={onToggleOfficial} />
                                   </div>
                 
                                )}
                 
                  <Button onClick={handleDownloadJson} variant="ghost">
                    <Download size={16} />
                    Baixar resultado
                  </Button>

                
                  <Button onClick={() => onOpen("filters-assets")} variant="ghost">
                    <SlidersHorizontal size={16} />
                    Filtros
                  </Button>
                </div>

                <Button variant="ghost" size="icon" onClick={() => setIsOn(!isOn)}>
                  {isOn ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Chips dos filtros aplicados */}
        {(statusList.length > 0 || csvList.length > 0) && (
          <div className="px-8 mt-8">
            <div className="flex flex-wrap gap-3 items-center">
              <p className="text-sm font-medium">Filtros aplicados:</p>

              {statusList.map((code) => (
                <Badge
                  key={code}
                  className="bg-eng-blue rounded-md dark:bg-eng-blue dark:text-white py-2 px-3 font-normal gap-2 items-center flex"
                >
                  {code}
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      const next = statusList.filter((c) => c !== code);
                      setStatusList(next);
                      setOffset(0);
                      navigateWithParams({ statusList: next, offset: 0 });
                    }}
                  >
                    <XIcon size={16} />
                  </div>
                </Badge>
              ))}

              {csvList.map((code) => (
                <Badge
                  key={code}
                  className="bg-eng-blue rounded-md dark:bg-eng-blue  dark:text-white py-2 px-3 font-normal gap-2 items-center flex"
                >
                  {code}
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      const next = csvList.filter((c) => c !== code);
                      setCsvList(next);
                      setOffset(0);
                      navigateWithParams({ csvList: next, offset: 0 });
                    }}
                  >
                    <XIcon size={16} />
                  </div>
                </Badge>
              ))}

              <Badge
                variant={"secondary"}
                onClick={() => {
                  setStatusList([]);
                  setCsvList([]);
                  setOffset(0);
                  navigateWithParams({ statusList: [], csvList: [], offset: 0 });
                }}
                className="rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-900 border-0 py-2 px-3 font-normal flex items-center justify-center gap-2"
              >
                <Trash size={12} /> Limpar filtros
              </Badge>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="p-8 pt-2">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <div className="flex ">
                <div className="flex gap-4 w-full justify-between items-center ">
                  <HeaderResultTypeHome title="Todos os itens" icon={<Package size={24} className="text-gray-400" />} />

                  <div className="flex gap-3 mr-3 items-center h-full">
                    <Button onClick={() => setTypeVisu("rows")} variant={typeVisu == "block" ? "ghost" : "outline"} size={"icon"}>
                      <Rows size={16} className=" whitespace-nowrap" />
                    </Button>

                    <Button onClick={() => setTypeVisu("block")} variant={typeVisu == "block" ? "outline" : "ghost"} size={"icon"}>
                      <SquaresFour size={16} className=" whitespace-nowrap" />
                    </Button>
                  </div>
                </div>

                <AccordionTrigger />
              </div>

              <AccordionContent className="p-0">
                {typeVisu === "block" ? (
                  <div ref={containerRef}>
                    {loading && (
                      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4, 1700: 5 }}>
                        <Masonry gutter="16px">
                          {Array.from({ length: 12 }, (_, index) => (
                            <div className="w-full" key={index}>
                              <Skeleton className="w-full rounded-md aspect-square" />
                            </div>
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>
                    )}

                    {!loading && (
                      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4, 1700: 5 }}>
                        <Masonry gutter="16px">
                          {filteredItems.map((asset) => (
                            <PatrimonioItem key={asset.id} {...asset} />
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>
                    )}

                    {/* Itens por página */}
                    <div className="hidden md:flex md:justify-end mt-5 items-center gap-2">
                      <span className="text-sm text-muted-foreground">Itens por página:</span>
                      <Select
                        value={limit.toString()}
                        onValueChange={(value) => onChangeLimit(parseInt(value))}
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

                    {/* Paginação */}
                    <div className="w-full flex justify-center items-center gap-10 mt-8">
                      <div className="flex gap-4">
                        <Button variant="outline" onClick={goPrev} disabled={isFirstPage}>
                          <ChevronLeft size={16} className="mr-2" />
                          Anterior
                        </Button>

                        <Button onClick={goNext} disabled={isLastPage}>
                          Próximo
                          <ChevronRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div ref={containerRef}>
                    {loading && (
                      <div className="grid gap-4">
                        {Array.from({ length: 12 }, (_, index) => (
                          <div className="w-full" key={index}>
                            <Skeleton className="w-full rounded-md aspect-square" />
                          </div>
                        ))}
                      </div>
                    )}

                    {!loading && (
                      <div className="grid gap-4">
                        {filteredItems.map((asset) => (
                          <PatrimonioItem key={asset.id} {...asset} />
                        ))}
                      </div>
                    )}

                    {/* Itens por página */}
                    <div className="hidden md:flex md:justify-end mt-5 items-center gap-2">
                      <span className="text-sm text-muted-foreground">Itens por página:</span>
                      <Select
                        value={limit.toString()}
                        onValueChange={(value) => onChangeLimit(parseInt(value))}
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

                    {/* Paginação */}
                    <div className="w-full flex justify-center items-center gap-10 mt-8">
                      <div className="flex gap-4">
                        <Button variant="outline" onClick={goPrev} disabled={isFirstPage}>
                          <ChevronLeft size={16} className="mr-2" />
                          Anterior
                        </Button>

                        <Button onClick={goNext} disabled={isLastPage}>
                          Próximo
                          <ChevronRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>

      {/* Sheet de filtros */}
      {FiltersSheetUI}
    </div>
  );
}
