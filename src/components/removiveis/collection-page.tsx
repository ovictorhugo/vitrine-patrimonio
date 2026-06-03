import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Helmet } from "react-helmet";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  Trash,
  Plus,
  Loader2,
  Search,
  Recycle,
  XCircle,
  Home,
  Undo2,
  LoaderCircle,
  Pencil,
  CheckCircle,
  Download,
  List,
  FileArchive,
  PlusCircle,
  Check,
  SlidersHorizontal,
  LayoutGrid,
  CheckSquare,
  BookmarkCheck,
  FileText,
  X,
  Trash2,
  Info,
} from "lucide-react";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UserContext } from "../../context/context";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";

// shadcn/ui
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Alert } from "../ui/alert";
import { Separator } from "../ui/separator";
import { useQuery } from "../authentication/signIn";
import { CardHeader, CardTitle, CardContent } from "../ui/card";
import { CollectionDTO } from "../dashboard/collection/collection-page";

import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ArrowUUpLeft } from "phosphor-react";
import { usePermissions } from "../permissions";
import { Tabs, TabsContent } from "../ui/tabs";
import { ItemPatrimonio } from "./components/item-patrimonio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DownloadPdfButton } from "../download/download-pdf-button";
import { useIsMobile } from "../../hooks/use-mobile";
import { InCollectionTab } from "./tabs/in-collection";
import { DocumentacaoTab } from "./tabs/parecer";
import { AdministratorTab } from "./tabs/administrator";
import { CollectionItem } from "../dashboard/desfazimento/components/add-collection";
import { PatrimonioItemCollection } from "./components/patrimonio-item-inventario";

// ================== Types ==================
type UUID = string;

type Unit = {
  id: UUID;
  unit_name: string;
  unit_code: string;
  unit_siaf?: string;
};
type Agency = {
  id: UUID;
  agency_name: string;
  agency_code: string;
  unit_id: UUID;
};
type Sector = {
  id: UUID;
  sector_name: string;
  sector_code: string;
  agency_id: UUID;
};
type LocationEE = {
  id: UUID;
  location_name: string;
  location_code: string;
  sector_id: UUID;
};

type Material = {
  id: UUID;
  material_code: string;
  material_name: string;
};
type LegalGuardian = {
  id: UUID;
  legal_guardians_code: string;
  legal_guardians_name: string;
};

type LocationNested = {
  id: UUID;
  location_name: string;
  location_code: string;
  sector_id: UUID;
  legal_guardian_id?: UUID;
  sector?: {
    id: UUID;
    sector_name: string;
    sector_code: string;
    agency_id: UUID;
    agency?: {
      id: UUID;
      agency_name: string;
      agency_code: string;
      unit_id: UUID;
      unit?: Unit;
    };
  };
  legal_guardian?: LegalGuardian;
};

type Asset = {
  id: UUID;
  asset_code: string;
  asset_check_digit: string;
  atm_number: string;
  serial_number: string;
  asset_status: string;
  asset_value: string;
  asset_description: string;
  csv_code: string;
  accounting_entry_code: string;
  item_brand: string;
  item_model: string;
  group_type_code: string;
  group_code: string;
  expense_element_code: string;
  subelement_code: string;
  material?: Material;
  legal_guardian?: LegalGuardian;
  location?: LocationNested;
  is_official: boolean;
};

type CatalogImage = { id: UUID; catalog_id: UUID; file_path: string };

type WorkflowUser = {
  id: UUID;
  username: string;
  email: string;
  provider: string;
  linkedin: string;
  lattes_id: string;
  orcid: string;
  ramal: string;
  photo_url: string;
  background_url: string;
  matricula: string;
  verify: boolean;
  institution_id: UUID;
  roles: Array<{
    id: UUID;
    name: string;
    description: string;
    permissions: Array<{
      id: UUID;
      name: string;
      code: string;
      description: string;
    }>;
  }>;
  system_identity?: { id: UUID; legal_guardian?: LegalGuardian };
};

type WorkflowHistoryItem = {
  id: UUID;
  workflow_status: string;
  detail?: Record<string, unknown>;
  user?: WorkflowUser;
  transfer_requests?: Array<{
    id: UUID;
    status: string;
    user?: WorkflowUser;
    location?: LocationNested;
  }>;
  catalog_id: UUID;
  created_at: string;
};

type Catalog = {
  id: UUID;
  situation: "UNUSED" | "IN_USE" | "DAMAGED" | string;
  conservation_status: string;
  description: string;
  asset: Asset;
  user?: WorkflowUser;
  location?: LocationNested;
  images?: CatalogImage[];
  workflow_history?: WorkflowHistoryItem[];
  created_at: string;
  current_workflow_status: string;
};

type CollectionItemsResponse = { collection_items: CollectionItem[] };
type CatalogListResponse =
  | { catalog_entries?: Catalog[] }
  | { results?: Catalog[] }
  | Catalog[];

// ================== Combobox ==================
type ComboboxItem = { id: UUID; code?: string; label: string };

function Combobox({
  items,
  value,
  onChange,
  placeholder,
  emptyText = "Nenhum item encontrado",
  triggerClassName,
  disabled = false,
}: {
  items: ComboboxItem[];
  value?: UUID | null;
  onChange: (id: UUID | null) => void;
  placeholder: string;
  emptyText?: string;
  triggerClassName?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id === value) || null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={
            triggerClassName ?? "w-[280px] min-w-[280px] justify-between"
          }
        >
          {selected ? (
            <span className="truncate text-left font-medium">
              {selected.label}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <Command>
          <CommandInput />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandList className="gap-2 flex flex-col ">
            <CommandGroup className="gap-2 flex flex-col ">
              <CommandItem
                onSelect={() => {
                  onChange(null as unknown as UUID | null);
                  setOpen(false);
                }}
              >
                <span className="text-muted-foreground font-medium  flex gap-2 items-center">
                  <Trash size={16} /> Limpar filtro
                </span>
              </CommandItem>
              <CommandSeparator className="my-1" />
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.code ?? ""}`}
                  onSelect={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  <span className="font-medium line-clamp-1 uppercase">
                    {item.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ================== Página ==================
export function CollectionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = useIsMobile();

  const queryUrl = useQuery();
  const collection_id = queryUrl.get("collection_id");

  const [items, setItems] = useState<CollectionItem[]>([]);
  const [lfdItems, setLfdItems] = useState<Catalog[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [selectedLfdItems, setSelectedLfdItems] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCollectionItems, setSelectedCollectionItems] = useState<
    Set<string>
  >(new Set());
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // loading da coleção (nome, descrição, etc.)
  const [loadingCollection, setLoadingCollection] = useState(false);

  // loading só da lista (grid) paginada
  const [loadingItems, setLoadingItems] = useState(false);

  // estatísticas agregadas vindas da API
  const [countDesfazimento, setCountDesfazimento] = useState(0); // coletados
  const [countNaoDesfazimento, setCountNaoDesfazimento] = useState(0); // pendentes

  const { urlGeral } = useContext(UserContext);
  const token = useMemo(() => localStorage.getItem("jwt_token"), []);
  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token],
  );

  // ===== navegação & paginação por querystring (offset/limit) =====
  const qs = new URLSearchParams(location.search);
  const initialOffset = Number(qs.get("offset") || "0");
  const initialLimit = Number(qs.get("limit") || "10");

  const [offset, setOffset] = useState<number>(
    Number.isFinite(initialOffset) && initialOffset >= 0 ? initialOffset : 0,
  );
  const [limit, setLimit] = useState<number>(
    Number.isFinite(initialLimit) && initialLimit > 0 ? initialLimit : 10,
  );

  const isFirstPage = offset === 0;
  const isLastPage = items.length < limit;

  const handleNavigate = (
    newOffset: number,
    newLimit: number,
    replace = false,
  ) => {
    const params = new URLSearchParams(location.search);
    params.set("offset", String(newOffset));
    params.set("limit", String(newLimit));
    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace },
    );
  };

  useEffect(() => {
    handleNavigate(offset, limit, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit]);

  // ======= Filtros hierárquicos E adicionais da LISTA da coleção =======
  const [units, setUnits] = useState<Unit[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [locations, setLocations] = useState<LocationEE[]>([]);
  const [unitId, setUnitId] = useState<UUID | null>(null);
  const [agencyId, setAgencyId] = useState<UUID | null>(null);
  const [sectorId, setSectorId] = useState<UUID | null>(null);
  const [locationId, setLocationId] = useState<UUID | null>(null);

  // pesquisa, material e responsável (para a LISTA principal)
  const [qMain, setQMain] = useState("");
  const [materialItemsMain, setMaterialItemsMain] = useState<ComboboxItem[]>(
    [],
  );
  const [guardianItemsMain, setGuardianItemsMain] = useState<ComboboxItem[]>(
    [],
  );
  const [materialIdMain, setMaterialIdMain] = useState<UUID | null>(null);
  const [guardianIdMain, setGuardianIdMain] = useState<UUID | null>(null);

  // carregar materiais e responsáveis para filtros principais
  useEffect(() => {
    (async () => {
      try {
        const [matRes, guardRes] = await Promise.all([
          fetch(`${urlGeral}materials/`, {
            method: "GET",
            headers: authHeaders,
          }),
          fetch(`${urlGeral}legal-guardians/`, {
            method: "GET",
            headers: authHeaders,
          }),
        ]);

        const matJson = await matRes.json().catch(() => ({}));
        const guardJson = await guardRes.json().catch(() => ({}));

        const mats: Material[] = matJson?.materials ?? matJson ?? [];
        const guards: LegalGuardian[] =
          guardJson?.legal_guardians ?? guardJson ?? [];

        setMaterialItemsMain(
          mats.map((m) => ({
            id: m.id,
            code: m.material_code,
            label: m.material_name || m.material_code,
          })),
        );

        setGuardianItemsMain(
          guards.map((g) => ({
            id: g.id,
            code: g.legal_guardians_code,
            label: g.legal_guardians_name || g.legal_guardians_code,
          })),
        );
      } catch (e) {
        console.error("Erro ao carregar materiais ou responsáveis:", e);
      }
    })();
  }, [urlGeral, authHeaders]);

  const { hasAdministrativo } = usePermissions();

  const tabs = [
    { id: "available", label: "Disponíveis para remoção", icon: Trash },
    { id: "in-collection", label: "Itens da coleção", icon: Package },
    { id: "docs", label: "Documentação", icon: FileText },
    ...(hasAdministrativo
      ? [{ id: "administrator", label: "Administrador", icon: Package }]
      : []),
  ];

  const [value, setValue] = useState(tabs[0].id);

  // ===== GET /collection_items/ (com filtros + offset/limit) =====
  const fetchCollectionItems = useCallback(async () => {
    try {
      setLoadingItems(true);

      const params = new URLSearchParams();
      if (unitId) params.set("unit_id", unitId);
      if (agencyId) params.set("agency_id", agencyId);
      if (sectorId) params.set("sector_id", sectorId);
      if (locationId) params.set("location_id", locationId);
      if (qMain) params.set("q", qMain);
      if (materialIdMain) params.set("material_id", materialIdMain);
      if (guardianIdMain) params.set("legal_guardian_id", guardianIdMain);

      params.set("offset", String(offset));
      params.set("limit", String(limit));

      if (value === "available") {
        params.set("workflow_status", "EM_REMOCAO");
        const url = `${urlGeral}catalog/cards${params.toString() ? `?${params.toString()}` : ""
          }`;

        const res = await fetch(url, { method: "GET", headers: authHeaders });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            text || `Falha ao carregar itens da LFD (HTTP ${res.status}).`,
          );
        }

        const data = await res.json();

        setLfdItems(data.catalog_entries);
      } else {
        const url = `${urlGeral}collection_items/${collection_id}${params.toString() ? `?${params.toString()}` : ""
          }`;

        const res = await fetch(url, { method: "GET", headers: authHeaders });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            text || `Falha ao carregar coleção (HTTP ${res.status}).`,
          );
        }

        const data: CollectionItemsResponse = await res.json();
        const list = Array.isArray((data as any)?.collection_items)
          ? (data as any).collection_items
          : [];
        setItems(list);
      }
    } catch (e: any) {
      toast("Erro ao carregar coleção de desfazimento", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => { } },
      });
    } finally {
      setLoadingItems(false);
    }
  }, [
    urlGeral,
    authHeaders,
    unitId,
    agencyId,
    sectorId,
    locationId,
    qMain,
    materialIdMain,
    guardianIdMain,
    collection_id,
    value,
    offset,
    limit,
  ]);

  useEffect(() => {
    fetchCollectionItems();
  }, [fetchCollectionItems]);

  // ===== Estatísticas agregadas por status (API) =====
  const fetchStatistics = useCallback(async () => {
    if (!collection_id) return;
    try {
      const url = `${urlGeral}collections/stats/${encodeURIComponent(
        collection_id,
      )}`;
      const res = await fetch(url, { method: "GET", headers: authHeaders });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          text || `Falha ao carregar estatísticas (HTTP ${res.status}).`,
        );
      }

      const json = await res.json();
      setCountDesfazimento(json?.total ?? 0);
      setCountNaoDesfazimento(json?.approved ?? 0);
    } catch (e) {
      console.error("Erro ao buscar estatísticas da coleção:", e);
    }
  }, [urlGeral, authHeaders, collection_id]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // carregar unidades
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${urlGeral}units/`, {
          method: "GET",
          headers: authHeaders,
        });
        const json = await res.json();
        setUnits(json?.units ?? []);
      } catch {
        setUnits([]);
      }
    })();
  }, [urlGeral, authHeaders]);

  // carregar agências
  const fetchAgencies = useCallback(
    async (uid: UUID) => {
      if (!uid) return setAgencies([]);
      try {
        const res = await fetch(
          `${urlGeral}agencies/?unit_id=${encodeURIComponent(uid)}`,
          {
            method: "GET",
            headers: authHeaders,
          },
        );
        const json = await res.json();
        setAgencies(json?.agencies ?? []);
      } catch {
        setAgencies([]);
      }
    },
    [urlGeral, authHeaders],
  );

  // carregar setores
  const fetchSectors = useCallback(
    async (aid: UUID) => {
      if (!aid) return setSectors([]);
      try {
        const res = await fetch(
          `${urlGeral}sectors/?agency_id=${encodeURIComponent(aid)}`,
          {
            method: "GET",
            headers: authHeaders,
          },
        );
        const json = await res.json();
        setSectors(json?.sectors ?? []);
      } catch {
        setSectors([]);
      }
    },
    [urlGeral, authHeaders],
  );

  // carregar locais
  const fetchLocations = useCallback(
    async (sid: UUID) => {
      if (!sid) return setLocations([]);
      try {
        const res = await fetch(
          `${urlGeral}locations/?sector_id=${encodeURIComponent(sid)}`,
          {
            method: "GET",
            headers: authHeaders,
          },
        );
        const json = await res.json();
        setLocations(json?.locations ?? []);
      } catch {
        setLocations([]);
      }
    },
    [urlGeral, authHeaders],
  );

  // encadeamento filtros
  useEffect(() => {
    setAgencyId(null);
    setSectorId(null);
    setLocationId(null);
    setAgencies([]);
    setSectors([]);
    setLocations([]);
    if (unitId) fetchAgencies(unitId);
  }, [unitId, fetchAgencies]);

  useEffect(() => {
    setSectorId(null);
    setLocationId(null);
    setSectors([]);
    setLocations([]);
    if (agencyId) fetchSectors(agencyId);
  }, [agencyId, fetchSectors]);

  useEffect(() => {
    setLocationId(null);
    setLocations([]);
    if (sectorId) fetchLocations(sectorId);
  }, [sectorId, fetchLocations]);

  // Scroll filtros / tabs
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

  const clearFilters = () => {
    setUnitId(null);
    setAgencyId(null);
    setSectorId(null);
    setLocationId(null);
    setAgencies([]);
    setSectors([]);
    setLocations([]);
    setQMain("");
    setMaterialIdMain(null);
    setGuardianIdMain(null);
    setOffset(0);
  };

  const toggleLfdItem = (id: string) => {
    setSelectedLfdItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCollectionItem = (id: string) => {
    setSelectedCollectionItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddSelectedToCollection = async () => {
    if (selectedLfdItems.size === 0) return;
    try {
      setAddingToCollection(true);
      const res = await fetch(
        `${urlGeral}collection_items/add_new/${collection_id}`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ catalog_ids: Array.from(selectedLfdItems) }),
        },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao adicionar itens à coleção");
      }
      toast.success("Itens adicionados com sucesso!", {
        duration: 12000,
      });
      setSelectedLfdItems(new Set());
      fetchCollectionItems();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao adicionar itens");
    } finally {
      setAddingToCollection(false);
      fetchStatistics();
    }
  };

  const [approveOpen, setApproveOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  const [refuseOpen, setRefuseOpen] = useState(false);
  const [refusing, setRefusing] = useState(false);

  const handleRefuseSelected = async () => {
    if (selectedCollectionItems.size === 0) return;
    try {
      setRefusing(true);
      const res = await fetch(
        `${urlGeral}collection_items/refused/${collection_id}`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            catalog_ids: Array.from(selectedCollectionItems),
          }),
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao recusar itens");
      }
      toast.success("Itens recusados com sucesso!", {
        duration: 12000,
      });
      setSelectedCollectionItems(new Set());
      setRefuseOpen(false);
      fetchCollectionItems();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao recusar itens");
    } finally {
      setRefusing(false);
      fetchStatistics();
      fetchCollection();
    }
  };

  const [removeSelectedOpen, setRemoveSelectedOpen] = useState(false);
  const [removingSelected, setRemovingSelected] = useState(false);

  const [tipsOpen, setTipsOpen] = useState(false);

  const handleRemoveSelected = async () => {
    if (selectedCollectionItems.size === 0) return;
    try {
      setRemovingSelected(true);

      let failCount = 0;
      let successCount = 0;

      const token = localStorage.getItem("jwt_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      for (const catalog_id of Array.from(selectedCollectionItems)) {
        const item_id = items.find((i) => i.catalog.id === catalog_id)?.id;
        if (!item_id) continue;

        try {
          const res = await fetch(
            `${urlGeral}collection_items/${collection_id}/${item_id}`,
            { method: "DELETE", headers },
          );
          if (res.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      if (failCount > 0) {
        toast.warning(
          `${successCount} itens removidos, mas ${failCount} falharam.`,
        );
      } else {
        toast.success("Itens removidos com sucesso!", {
          duration: 12000,
        });
      }

      setSelectedCollectionItems(new Set());
      setRemoveSelectedOpen(false);
      fetchCollectionItems();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao remover itens");
    } finally {
      setRemovingSelected(false);
      fetchStatistics();
      fetchCollection();
    }
  };

  const fmt = (n: number) => n.toLocaleString("pt-BR");

  // GET COLLECTION
  const type_search = queryUrl.get("collection_id");
  const [collection, setCollection] = useState<CollectionDTO | null>(null);

  const fetchCollection = async () => {
    try {
      setLoadingCollection(true);
      const res = await fetch(
        `${urlGeral}collections/${type_search}?admin=${hasAdministrativo}`,
        {
          method: "GET",
          headers: authHeaders,
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          text || `Falha ao carregar coleção (HTTP ${res.status}).`,
        );
      }

      const data: CollectionDTO = await res.json();
      setCollection(data);
    } catch (e: any) {
      toast("Erro ao carregar coleção", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => { } },
      });
    } finally {
      setLoadingCollection(false);
      fetchStatistics();
    }
  };

  useEffect(() => {
    fetchCollection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlGeral]);

  const [loadingMessage, setLoadingMessage] = useState(
    "Estamos procurando todas as informações no nosso banco de dados, aguarde.",
  );

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    setLoadingMessage(
      "Estamos procurando todas as informações no nosso banco de dados, aguarde.",
    );
    timeouts.push(
      setTimeout(
        () => setLoadingMessage("Estamos quase lá, continue aguardando..."),
        5000,
      ),
    );
    timeouts.push(
      setTimeout(() => setLoadingMessage("Só mais um pouco..."), 10000),
    );
    timeouts.push(
      setTimeout(
        () =>
          setLoadingMessage(
            "Está demorando mais que o normal... estamos tentando encontrar tudo.",
          ),
        15000,
      ),
    );
    timeouts.push(
      setTimeout(
        () =>
          setLoadingMessage(
            "Estamos empenhados em achar todos os dados, aguarde só mais um pouco",
          ),
        15000,
      ),
    );
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const handleVoltar = () => {
    const currentPath = location.pathname;
    const hasQueryParams = location.search.length > 0;
    if (hasQueryParams) {
      navigate(currentPath);
    } else {
      const pathSegments = currentPath
        .split("/")
        .filter((segment) => segment !== "");
      if (pathSegments.length > 1) {
        pathSegments.pop();
        const previousPath = "/" + pathSegments.join("/");
        navigate(previousPath);
      } else navigate("/");
    }
  };

  // Dialogs: Editar / Deletar
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newName, setNewName] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");

  const [seiOpen, setSeiOpen] = useState(false);
  const [seiProcess, setSeiProcess] = useState("");
  const [seiLoading, setSeiLoading] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [addingByFilter, setAddingByFilter] = useState(false);

  const handleAddByFilter = async () => {
    try {
      setAddingByFilter(true);
      const params = new URLSearchParams();
      if (qMain) params.set("q", qMain);
      if (materialIdMain) params.set("material_id", materialIdMain);
      if (guardianIdMain) params.set("legal_guardian_id", guardianIdMain);
      if (unitId) params.set("unit_id", unitId);
      if (agencyId) params.set("agency_id", agencyId);
      if (sectorId) params.set("sector_id", sectorId);
      if (locationId) params.set("location_id", locationId);

      const res = await fetch(
        `${urlGeral}collection_items/add_by_filters/${collection_id}?${params.toString()}`,
        {
          method: "POST",
          headers: authHeaders,
        },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao adicionar itens por filtro");
      }
      toast.success("Itens adicionados com sucesso!", {
        duration: 12000,
      });
      setFilterOpen(false);
      fetchCollectionItems();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao adicionar itens");
    } finally {
      setAddingByFilter(false);
      fetchStatistics();
    }
  };

  const [removeFilterOpen, setRemoveFilterOpen] = useState(false);
  const [removingByFilter, setRemovingByFilter] = useState(false);

  const handleRemoveByFilter = async () => {
    try {
      setRemovingByFilter(true);
      const params = new URLSearchParams();
      if (qMain) params.set("q", qMain);
      if (materialIdMain) params.set("material_id", materialIdMain);
      if (guardianIdMain) params.set("legal_guardian_id", guardianIdMain);
      if (unitId) params.set("unit_id", unitId);
      if (agencyId) params.set("agency_id", agencyId);
      if (sectorId) params.set("sector_id", sectorId);
      if (locationId) params.set("location_id", locationId);

      const res = await fetch(
        `${urlGeral}collection_items/remove_by_filters/${collection_id}?${params.toString()}`,
        {
          method: "DELETE",
          headers: authHeaders,
        },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao remover itens por filtro");
      }
      toast.success("Itens removidos com sucesso!", {
        duration: 12000,
      });
      setRemoveFilterOpen(false);
      fetchCollectionItems();
      fetchStatistics();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao remover itens");
    } finally {
      setRemovingByFilter(false);
      fetchStatistics();
    }
  };

  const handleSaveSei = async () => {
    if (!seiProcess.trim()) {
      toast.error("Por favor, digite o texto do processo.");
      return;
    }

    try {
      setSeiLoading(true);
      const res = await fetch(
        `${urlGeral}collections/add-sei/${collection_id}`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ sei_process: seiProcess }),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error || data?.message || "Erro ao adicionar nome do processo.",
        );
      }

      toast.success(
        data?.message || "Nome do processo adicionado com sucesso!", {
        duration: 12000,
      });

      setCollection((prev) =>
        prev ? { ...prev, sei_process: seiProcess } : prev,
      );
      setSeiOpen(false);
      setSeiProcess("");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao adicionar nome do processo.");
    } finally {
      setSeiLoading(false);
      fetchCollection();
    }
  };

  useEffect(() => {
    if (collection) {
      setNewName(collection.name ?? "");
      setNewDescription(collection.description ?? "");
    }
  }, [collection]);

  const handleUpdateCollection = async () => {
    try {
      setUpdateLoading(true);
      const res = await fetch(`${urlGeral}collections/${collection_id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ name: newName, description: newDescription }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao atualizar a coleção.");
      }
      setCollection((prev) =>
        prev ? { ...prev, name: newName, description: newDescription } : prev,
      );
      toast.success("Coleção atualizada com sucesso!", {
        duration: 12000,
      });
      setEditOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Falha ao atualizar a coleção.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    try {
      setDeleteLoading(true);
      const res = await fetch(`${urlGeral}collections/${collection_id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Falha ao deletar a coleção.");
      }
      toast.success("Coleção deletada com sucesso.", {
        duration: 12000,
      });
      navigate("/dashboard/desfazimento");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao deletar a coleção.");
    } finally {
      setDeleteLoading(false);
    }
  };

  function handleItemDeleted(item_id: string) {
    const itemToDelete = items.find((i) => i.id === item_id);
    if (itemToDelete) {
      setCountDesfazimento((prev) => (prev > 0 ? prev - 1 : 0));
      if (itemToDelete.status === true) {
        setCountNaoDesfazimento((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }
    setItems((prev) => prev.filter((item) => item.id !== item_id));
  }

  const { hasColecoes } = usePermissions();

  const skeletons = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md aspect-square" />
      )),
    [],
  );

  // ===== loading somente da coleção (primeiro acesso) =====
  if (loadingCollection && !collection) {
    if (isMobile) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="text-eng-blue mb-4 animate-pulse">
              <LoaderCircle size={54} className="animate-spin" />
            </div>
            <p className="font-medium text-lg max-w-[400px] text-center">
              {loadingMessage}
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="text-eng-blue mb-4 animate-pulse">
              <LoaderCircle size={108} className="animate-spin" />
            </div>
            <p className="font-medium text-lg max-w-[500px] text-center">
              {loadingMessage}
            </p>
          </div>
        </div>
      );
    }
  }

  if (!collection) {
    return (
      <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full flex flex-col items-center justify-center">
          <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
            (⊙_⊙)
          </p>
          <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
            Não foi possível acessar as <br /> informações desta coleção.
          </h1>

          <div className="flex gap-3 mt-8">
            <Button onClick={handleVoltar} variant={"ghost"}>
              <Undo2 size={16} /> Voltar
            </Button>
            <Link to={"/"}>
              <Button>
                <Home size={16} /> Página Inicial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" gap-8 flex flex-col h-full">
      <Helmet>
        <title>{collection?.name || ""} | Sistema Patrimônio</title>
        <meta
          name="description"
          content={`${collection?.name || ""} | Sistema Patrimônio`}
        />
      </Helmet>
      <main className="flex flex-col gap-8  flex-1 min-h-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center p-8 pb-0 justify-between flex-wrap gap-3">
          <div className="flex gap-2 items-center">
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

            <h1 className="text-xl font-semibold tracking-tight">
              Resgate de itens
            </h1>
          </div>

          {hasColecoes && (
            <div
              className={
                isMobile
                  ? "flex flex-col items-center gap-4 w-full"
                  : "flex items-start gap-4"
              }
            >
              <div className="flex gap-2 w-full">
                <Button
                  className="flex-1"
                  variant="outline"
                  disabled={!!collection.sei_process}
                  onClick={() => setSeiOpen(true)}
                >
                  <FileArchive size={16} />
                  {collection.sei_process
                    ? collection.sei_process
                    : "Travar coleção"}
                </Button>

                {collection.sei_process ? (
                  collection.parecer_pdf ? (
                    <Button
                      onClick={(e) => e.stopPropagation()}
                      disabled={true}
                      variant="outline"
                    >
                      Processo finalizado
                    </Button>
                  ) : (
                    <DownloadPdfButton
                      filters={{ collection_id: collection_id || undefined }}
                      id={collection_id || undefined}
                      label="Baixar documentação"
                      method="colecao_removiveis"
                    />
                  )
                ) : (
                  <Button
                    onClick={(e) => e.stopPropagation()}
                    disabled={true}
                    variant="outline"
                  >
                    <Download size={16} className="mr-2" /> Baixar documentação
                  </Button>
                )}
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 ">
          <div className="justify-center px-4 md:px-8 w-full mx-auto flex flex-col items-center gap-2 mt-4">
            <h3 className="z-[2] text-center text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
              {collection.name}
            </h3>
            <div className="mt-2 flex flex-wrap justify-center  gap-3 text-sm text-gray-500 items-center">
              <span className="text-muted-foreground text-justify">
                {collection.description}
              </span>
            </div>
          </div>
          {/* Cards de status (usando estatísticas agregadas) */}
          <div className="flex flex-col sm:flex-row justify-end gap-8 px-8">
            <Alert className="p-0 w-[30%]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Itens na coleção
                </CardTitle>
                <List className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fmt(countDesfazimento)}
                </div>
              </CardContent>
            </Alert>
          </div>
        </div>
        <Tabs defaultValue="in-collection" value={value}>
          {/* header das tabs */}
          <div className="dark:bg-neutral-900/60 bg-neutral-50/60 px-4 border-b border-b-neutral-200 dark:border-b-neutral-800">
            <div className="p-0 flex gap-2 h-auto bg-transparent dark:bg-transparent">
              {tabs.map(({ id, label, icon: Icon }) => (
                <div
                  key={id}
                  className={`pb-2 border-b-2 text-black dark:text-white transition-all ${value === id ? "border-b-[#719CB8]" : "border-b-transparent"
                    }`}
                  onClick={() => {
                    setValue(id);
                    setOffset(0);
                    const params = new URLSearchParams(location.search);
                    params.set("tab", id);
                    params.set("offset", "0");
                    params.set("limit", String(limit));
                    navigate({
                      pathname: location.pathname,
                      search: params.toString(),
                    });
                  }}
                >
                  <Button variant="ghost" className="m-0">
                    <Icon size={16} />
                    {label}
                  </Button>
                </div>
              ))}
              <div className="ml-auto pr-4 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTipsOpen(true)}
                  title="Regras do resgate de itens"
                >
                  <Info size={20} className="text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>

          {value !== "administrator" && value !== "docs" && (
            <>
              <div className="flex justify-start gap-4 mb-4 px-8 pt-4">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setViewMode((prev) => (prev === "list" ? "grid" : "list"))
                  }
                >
                  {viewMode === "list" ? (
                    <List size={16} className="mr-2" />
                  ) : (
                    <LayoutGrid size={16} className="mr-2" />
                  )}
                  {viewMode === "list" ? "Lista" : "Grade"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (value === "in-collection") {
                      const allIds = new Set(items.map((i) => i.catalog.id));
                      if (
                        selectedCollectionItems.size === allIds.size &&
                        allIds.size > 0
                      ) {
                        setSelectedCollectionItems(new Set());
                      } else {
                        setSelectedCollectionItems(allIds);
                      }
                    } else if (value === "available") {
                      const allIds = new Set(lfdItems.map((i) => i.id));
                      if (
                        selectedLfdItems.size === allIds.size &&
                        allIds.size > 0
                      ) {
                        setSelectedLfdItems(new Set());
                      } else {
                        setSelectedLfdItems(allIds);
                      }
                    }
                  }}
                >
                  <CheckSquare size={16} className="mr-2" />
                  Selecionar todos
                </Button>

                {value === "available" && (
                  <Button
                    onClick={handleAddSelectedToCollection}
                    disabled={
                      addingToCollection ||
                      selectedLfdItems.size === 0 ||
                      !!collection?.parecer_pdf ||
                      !!collection?.sei_process
                    }
                    className="h-9"
                    title={
                      !!collection?.parecer_pdf
                        ? "Ações desabilitadas: Parecer técnico já enviado"
                        : "Adicionar à coleção"
                    }
                  >
                    {addingToCollection ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {selectedLfdItems.size > 0
                      ? `Adicionar ${selectedLfdItems.size} ${selectedLfdItems.size === 1 ? "item" : "itens"} à coleção`
                      : "Adicionar à coleção"}
                  </Button>
                )}
                {value === "in-collection" && (
                  <div className="flex gap-2">
                    <Button
                      className="px-3 min-w-fit h-9"
                      variant="destructive"
                      onClick={() => setRemoveSelectedOpen(true)}
                      title={
                        !!collection?.parecer_pdf || !!collection?.sei_process
                          ? "Ações desabilitadas: Parecer técnico ou nome do processo já enviado"
                          : "Remover selecionados da coleção"
                      }
                      disabled={
                        selectedCollectionItems.size === 0 ||
                        !!collection?.parecer_pdf ||
                        !!collection?.sei_process
                      }
                    >
                      <Trash2 size={16} className="mr-2" /> Remover itens
                    </Button>
                  </div>
                )}

                <div className="ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowFilters((s) => !s)}
                  >
                    <SlidersHorizontal size={16} className="mr-2" />
                    {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                  </Button>
                </div>
              </div>

              {/* Barra de filtros da lista principal */}
              {showFilters && (
                <div className="p-8 pt-0 pb-4">
                  <div className="relative grid grid-cols-1 ">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`absolute left-0 z-10 h-10 ${isMobile ? "w-5" : "w-10"
                        } p-0 ${!canScrollLeft ? "opacity-30 cursor-not-allowed" : ""}`}
                      onClick={scrollLeft}
                      disabled={!canScrollLeft}
                    >
                      <ChevronLeft size={16} />
                    </Button>

                    <div className={isMobile ? "mx-8" : "mx-14"}>
                      <div
                        ref={scrollAreaRef}
                        className="overflow-x-auto scrollbar-hide"
                        onScroll={checkScrollability}
                      >
                        <div className="flex gap-3 items-center">
                          {value === "available" && (
                            <Button
                              variant="default"
                              className="px-3 min-w-fit h-10"
                              onClick={() => setFilterOpen(true)}
                              title="Adicionar por filtros"
                            >
                              <PlusCircle size={16} />
                            </Button>
                          )}
                          {value === "in-collection" && (
                            <Button
                              variant="destructive"
                              className="px-3 min-w-fit h-10"
                              onClick={() => setRemoveFilterOpen(true)}
                              title="Remover por filtros"
                            >
                              <Trash size={16} />
                            </Button>
                          )}
                          {/* Pesquisa */}
                          <Alert className="w-[300px] min-w-[300px] py-0 h-10 rounded-md flex gap-3 items-center">
                            <div>
                              <Search size={16} className="text-gray-500" />
                            </div>
                            <div className="relative w-full">
                              <Input
                                className="border-0 p-0 h-9 flex flex-1 w-full"
                                value={qMain}
                                onChange={(e) => {
                                  setQMain(e.target.value);
                                  setOffset(0);
                                }}
                                placeholder="Buscar por código, descrição, material, marca, modelo..."
                              />
                            </div>
                          </Alert>

                          {/* Material e Responsável */}
                          <Combobox
                            items={materialItemsMain}
                            value={materialIdMain}
                            onChange={(v) => {
                              setMaterialIdMain(v);
                              setOffset(0);
                            }}
                            placeholder="Material"
                          />
                          <Combobox
                            items={guardianItemsMain}
                            value={guardianIdMain}
                            onChange={(v) => {
                              setGuardianIdMain(v);
                              setOffset(0);
                            }}
                            placeholder="Responsável"
                          />

                          <Separator className="h-8" orientation="vertical" />

                          {/* SELECTS EM CADEIA */}
                          <Combobox
                            items={(units ?? []).map((u) => ({
                              id: u.id,
                              code: u.unit_code,
                              label: u.unit_name || u.unit_code,
                            }))}
                            value={unitId}
                            onChange={(v) => {
                              setUnitId(v);
                              setOffset(0);
                            }}
                            placeholder="Unidade"
                          />

                          <Combobox
                            items={(agencies ?? []).map((a) => ({
                              id: a.id,
                              code: a.agency_code,
                              label: a.agency_name || a.agency_code,
                            }))}
                            value={agencyId}
                            onChange={(v) => {
                              setAgencyId(v);
                              setOffset(0);
                            }}
                            placeholder={"Organização"}
                            disabled={!unitId}
                          />

                          <Combobox
                            items={(sectors ?? []).map((s) => ({
                              id: s.id,
                              code: s.sector_code,
                              label: s.sector_name || s.sector_code,
                            }))}
                            value={sectorId}
                            onChange={(v) => {
                              setSectorId(v);
                              setOffset(0);
                            }}
                            placeholder={"Setor"}
                            disabled={!agencyId}
                          />

                          <Combobox
                            items={(locations ?? []).map((l) => ({
                              id: l.id,
                              code: l.location_code,
                              label: l.location_name || l.location_code,
                            }))}
                            value={locationId}
                            onChange={(v) => {
                              setLocationId(v);
                              setOffset(0);
                            }}
                            placeholder="Local de guarda"
                            disabled={!sectorId}
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                          >
                            <Trash size={16} /> Limpar filtros
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className={`absolute right-0 z-10 h-10 ${isMobile ? "w-5" : "w-10"
                        } p-0 rounded-md ${!canScrollRight ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                      onClick={scrollRight}
                      disabled={!canScrollRight}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB ITENS DA COLEÇÃO */}
          <InCollectionTab
            loadingItems={loadingItems}
            items={items}
            collection_id={collection_id}
            setCountDesfazimento={setCountDesfazimento}
            setCountNaoDesfazimento={setCountNaoDesfazimento}
            setItems={setItems}
            handleItemDeleted={handleItemDeleted}
            viewMode={viewMode}
            selectedItems={selectedCollectionItems}
            toggleItem={toggleCollectionItem}
            collection={collection}
          />

          <AdministratorTab
            loadingItems={loadingItems}
            items={items}
            collection_id={collection_id}
            setCountDesfazimento={setCountDesfazimento}
            setCountNaoDesfazimento={setCountNaoDesfazimento}
            setItems={setItems}
            handleItemDeleted={handleItemDeleted}
            viewMode={viewMode}
            selectedItems={selectedCollectionItems}
            toggleItem={toggleCollectionItem}
            reload={fetchCollection}
            collection={collection}
          />

          {/* TAB LFD */}
          <TabsContent value="available">
            <div className="p-8 pt-0">
              {loadingItems ? (
                <div
                  className={
                    viewMode === "list"
                      ? "grid sm:grid-cols-2 gap-4"
                      : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4"
                  }
                >
                  {skeletons.map((item, index) => (
                    <div className="w-full" key={index}>
                      {item}
                    </div>
                  ))}
                </div>
              ) : lfdItems.length === 0 ? (
                <div className="items-center justify-center w-full flex text-center pt-6">
                  Nenhum item adicionado.
                </div>
              ) : (
                <div
                  className={
                    viewMode === "list"
                      ? "grid sm:grid-cols-2 gap-4"
                      : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4"
                  }
                >
                  {lfdItems.map((item) =>
                    viewMode === "list" ? (
                      <PatrimonioItemCollection
                        key={item.id}
                        invId={item.id}
                        entry={item as any}
                        collectionId=""
                        itemId={item.id}
                        sel="false"
                        comm=""
                        selected={selectedLfdItems.has(item.id)}
                        onItemClick={toggleLfdItem}
                      />
                    ) : (
                      <ItemPatrimonio
                        key={item.id}
                        {...(item as any)}
                        selected={selectedLfdItems.has(item.id)}
                        onItemClick={toggleLfdItem}
                      />
                    ),
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB PARECER */}
          <DocumentacaoTab
            collection_id={collection_id ?? null}
            collection={collection}
            reload={fetchCollection}
          />

          {value !== "administrator" && value !== "docs" && (
            <>
              {/* ===== Paginação (offset/limit) ===== */}
              <div className="hidden md:flex md:justify-end mt-5 items-center gap-2 px-8 pb-4">
                <span className="text-sm text-muted-foreground">
                  Itens por página:
                </span>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => {
                    const newLimit = parseInt(value);
                    setOffset(0);
                    setLimit(newLimit);
                    handleNavigate(0, newLimit);
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Itens" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 40, 80, 160].map((val) => (
                      <SelectItem key={val} value={val.toString()}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full flex justify-center items-center gap-10 mt-4 pb-8">
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
            </>
          )}
        </Tabs>
      </main>

      {/* Dialog EDITAR */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
              Editar coleção
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Altere o nome e a descrição da coleção.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Nome</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={50}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                maxLength={200}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button onClick={handleUpdateCollection} disabled={updateLoading}>
              {updateLoading ? (
                <Loader2 className="animate-spin " size={16} />
              ) : (
                <Pencil size={16} className="" />
              )}
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog DELETAR */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[520px]">
              Deletar coleção
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Tem certeza que deseja excluir esta coleção? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCollection}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader2 className="animate-spin " size={16} />
              ) : (
                <Trash size={16} />
              )}
              Deletar coleção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog SEI */}
      <Dialog open={seiOpen} onOpenChange={setSeiOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
              Travar coleção
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Adicione um nome para este processo para travar a coleção. Esse
              processo não é reversível
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Número do processo</Label>
              <Input
                value={seiProcess}
                onChange={(e) => setSeiProcess(e.target.value)}
                maxLength={50}
                type="number"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSeiOpen(false)}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button onClick={handleSaveSei} disabled={seiLoading}>
              {seiLoading ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog Filtro */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
              Adicionar por filtro
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Observação: Alguns itens que já estejam em outras coleções podem
              não ser adicionados
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>Os seguintes filtros selecionados serão aplicados:</p>
            {qMain && (
              <p>
                <strong>Busca:</strong> {qMain}
              </p>
            )}
            {materialIdMain && (
              <p>
                <strong>Material:</strong>{" "}
                {materialItemsMain.find((m) => m.id === materialIdMain)
                  ?.label || materialIdMain}
              </p>
            )}
            {guardianIdMain && (
              <p>
                <strong>Responsável:</strong>{" "}
                {guardianItemsMain.find((g) => g.id === guardianIdMain)
                  ?.label || guardianIdMain}
              </p>
            )}
            {unitId && (
              <p>
                <strong>Unidade:</strong>{" "}
                {units?.find((u) => u.id === unitId)?.unit_code || unitId}
              </p>
            )}
            {agencyId && (
              <p>
                <strong>Organização:</strong>{" "}
                {agencies?.find((a) => a.id === agencyId)?.agency_code ||
                  agencyId}
              </p>
            )}
            {sectorId && (
              <p>
                <strong>Setor:</strong>{" "}
                {sectors?.find((s) => s.id === sectorId)?.sector_code ||
                  sectorId}
              </p>
            )}
            {locationId && (
              <p>
                <strong>Local de guarda:</strong>{" "}
                {locations?.find((l) => l.id === locationId)?.location_code ||
                  locationId}
              </p>
            )}
            {!qMain &&
              !materialIdMain &&
              !guardianIdMain &&
              !unitId &&
              !agencyId &&
              !sectorId &&
              !locationId && (
                <p>
                  Nenhum filtro aplicado. Todos os itens disponíveis serão
                  adicionados.
                </p>
              )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setFilterOpen(false)}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button onClick={handleAddByFilter} disabled={addingByFilter}>
              {addingByFilter ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : null}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog Remover por Filtro */}
      <Dialog open={removeFilterOpen} onOpenChange={setRemoveFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
              Remover por filtro
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Observação: Isso removerá os itens desta coleção baseando-se nos
              filtros selecionados.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              Os seguintes filtros selecionados serão aplicados para remoção:
            </p>
            {qMain && (
              <p>
                <strong>Busca:</strong> {qMain}
              </p>
            )}
            {materialIdMain && (
              <p>
                <strong>Material:</strong>{" "}
                {materialItemsMain.find((m) => m.id === materialIdMain)
                  ?.label || materialIdMain}
              </p>
            )}
            {guardianIdMain && (
              <p>
                <strong>Responsável:</strong>{" "}
                {guardianItemsMain.find((g) => g.id === guardianIdMain)
                  ?.label || guardianIdMain}
              </p>
            )}
            {unitId && (
              <p>
                <strong>Unidade:</strong>{" "}
                {units?.find((u) => u.id === unitId)?.unit_code || unitId}
              </p>
            )}
            {agencyId && (
              <p>
                <strong>Organização:</strong>{" "}
                {agencies?.find((a) => a.id === agencyId)?.agency_code ||
                  agencyId}
              </p>
            )}
            {sectorId && (
              <p>
                <strong>Setor:</strong>{" "}
                {sectors?.find((s) => s.id === sectorId)?.sector_code ||
                  sectorId}
              </p>
            )}
            {locationId && (
              <p>
                <strong>Local de guarda:</strong>{" "}
                {locations?.find((l) => l.id === locationId)?.location_code ||
                  locationId}
              </p>
            )}
            {!qMain &&
              !materialIdMain &&
              !guardianIdMain &&
              !unitId &&
              !agencyId &&
              !sectorId &&
              !locationId && (
                <p className="text-red-500 font-medium">
                  Cuidado: Nenhum filtro aplicado. Todos os itens disponíveis
                  nesta visão serão removidos da coleção.
                </p>
              )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveFilterOpen(false)}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveByFilter}
              disabled={removingByFilter}
            >
              {removingByFilter ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : null}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Remover Itens Selecionados */}
      <Dialog open={removeSelectedOpen} onOpenChange={setRemoveSelectedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Itens Selecionados</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {selectedCollectionItems.size}{" "}
              item(ns) da coleção?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={removingSelected}
              variant="outline"
              onClick={() => setRemoveSelectedOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={removingSelected}
              onClick={handleRemoveSelected}
              variant="destructive"
            >
              {removingSelected ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Recusar Itens */}
      <Dialog open={refuseOpen} onOpenChange={setRefuseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar Itens Selecionados</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja recusar {selectedCollectionItems.size}{" "}
              item(ns)? Esta é uma ação irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={refusing}
              variant="outline"
              onClick={() => setRefuseOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={refusing}
              onClick={handleRefuseSelected}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {refusing ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Regras de remoção */}
      <Dialog open={tipsOpen} onOpenChange={setTipsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regras do resgate de itens</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm mt-2 text-justify">
            <p>
              • A coleção de itens a serem resgatados fica aberta para alterações
              até que um nome para o processo seja adicionado à coleção.
            </p>
            <p>
              • Assim que o nome é adicionado, é possível gerar o pdf com a
              documentação a ser preenchida e assinada.
            </p>
            <p>
              • Deve ser feito upload da documentação após assinada para a
              finalização do processo.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setTipsOpen(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
