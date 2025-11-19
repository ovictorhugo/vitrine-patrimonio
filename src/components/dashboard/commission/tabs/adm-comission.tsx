// src/pages/administrativo/admComission.tsx
import { Helmet } from "react-helmet";
import {
  ChevronDown,
  ChevronLeft,
  Maximize2,
  Plus,
  Store,
  Trash,
  SlidersHorizontal,
  Download,
  ChevronRight,
  LucideIcon,
  Hourglass,
  Wrench,
  Clock,
  Archive,
  XCircle,
  Recycle,
  HelpCircle,
  Check,
  X,
  Loader,
  ListTodo,
  User,
  Eye,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Button } from "../../../ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../../../context/context";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../../ui/command";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Badge } from "../../../ui/badge";
import { Separator } from "../../../ui/separator";
import { Skeleton } from "../../../ui/skeleton";
import { toast } from "sonner";
import { DragDropContext, DragUpdate, Droppable, DropResult } from "@hello-pangea/dnd";
import { Alert } from "../../../ui/alert";
import { ArrowUUpLeft, EyeClosed, MagnifyingGlass } from "phosphor-react";
import { ScrollArea, ScrollBar } from "../../../ui/scroll-area";
import { RoleMembers } from "../../cargos-funcoes/components/role-members";
import { CardItemDropdown } from "../../itens-vitrine/card-item-dropdown";
import { ItemPatrimonio } from "../../../homepage/components/item-patrimonio";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { handleDownloadXlsx } from "../../itens-vitrine/handle-download";
import { usePermissions } from "../../../permissions";

/* ========================= Tipos do backend ========================= */
type UUID = string;

type LegalGuardian = {
  legal_guardians_code: string;
  legal_guardians_name: string;
  id: UUID;
};

type UnitDTO = { id: UUID; unit_name: string; unit_code: string; unit_siaf: string };
type AgencyDTO = { id: UUID; agency_name: string; agency_code: string };
type SectorDTO = { id: UUID; sector_name: string; sector_code: string };
type LocationDTO = { id: UUID; location_name: string; location_code: string };

type Material = {
  material_code: string;
  material_name: string;
  id: UUID;
};

type CatalogAsset = {
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
  id: UUID;
  material: Material;
  legal_guardian: LegalGuardian;
  location: {
    legal_guardian_id: UUID;
    sector_id: UUID;
    location_name: string;
    location_code: string;
    id: UUID;
    sector: {
      agency_id: UUID;
      sector_name: string;
      sector_code: string;
      id: UUID;
      agency: {
        agency_name: string;
        agency_code: string;
        unit_id: UUID;
        id: UUID;
        unit: {
          unit_name: string;
          unit_code: string;
          unit_siaf: string;
          id: UUID;
        };
      };
    };
    legal_guardian: LegalGuardian;
  };
  is_official: boolean;
};

type UserDTO = {
  id: UUID;
  username: string;
  email: string;
  provider: string;
  linkedin: string | null;
  lattes_id: string | null;
  orcid: string | null;
  ramal: string | null;
  photo_url: string | null;
  background_url: string | null;
  matricula: string | null;
  verify: boolean;
  institution_id: UUID;
};

type ReviewerRef = {
  id: UUID;
  username: string;
};

type WorkflowHistoryItem = {
  workflow_status: string;
  detail?: {
    reviewers?: ReviewerRef[] | string[];
    [key: string]: any;
  };
  id: UUID;
  user: {
    id: UUID;
    username: string;
    email: string;
    provider: string;
    linkedin: string | null;
    lattes_id: string | null;
    orcid: string | null;
    ramal: string | null;
    photo_url: string | null;
    background_url: string | null;
    matricula: string | null;
    verify: boolean;
    institution_id: UUID;
  };
  catalog_id: UUID;
  created_at: string;
};

type CatalogImage = {
  id: UUID;
  catalog_id: UUID;
  file_path: string;
};

export type CatalogEntry = {
  situation: string;
  conservation_status: string;
  description: string;
  id: UUID;
  asset: CatalogAsset;
  user: WorkflowHistoryItem["user"];
  location: CatalogAsset["location"];
  images: CatalogImage[];
  workflow_history: WorkflowHistoryItem[];
  created_at: string;
};

type CatalogResponse = {
  catalog_entries: CatalogEntry[];
  total?: number;
};

type RoleUsersResponse = {
  users: UserDTO[];
};

/* ========================= Board ========================= */
const COL_SEM_REVISOR = "SEM_REVISOR";
const WF_FILTER = "REVIEW_REQUESTED_COMISSION";

const WORKFLOW_STATUS_META: Record<string, { Icon: LucideIcon; colorClass: string }> = {
  [COL_SEM_REVISOR]: { Icon: HelpCircle, colorClass: "text-zinc-500" },
};

/* ========================= Regras por coluna ========================= */
type ColumnRule = {
  requireJustification?: boolean;
  extraFields?: Array<{
    name: string;
    label: string;
    type: "text" | "textarea";
    placeholder?: string;
    required?: boolean;
  }>;
};

const COLUMN_RULES: Record<string, ColumnRule> = {
  [COL_SEM_REVISOR]: { requireJustification: false },
};

/* ========================= Utils ========================= */
const codeFrom = (e: CatalogEntry) =>
  [e?.asset?.asset_code, e?.asset?.asset_check_digit].filter(Boolean).join("-");

/* ========================= Combobox ========================= */
type ComboboxItem = { id: UUID; code?: string; label: string };

function Combobox({
  items,
  value,
  onChange,
  placeholder,
  emptyText = "Nenhum item encontrado",
  triggerClassName,
  disabled = false,
  onSearch,
  isLoading = false,
}: {
  items: ComboboxItem[];
  value?: UUID | null;
  onChange: (id: UUID | null) => void;
  placeholder: string;
  emptyText?: string;
  triggerClassName?: string;
  disabled?: boolean;
  onSearch?: (term: string) => void;
  isLoading?: boolean;
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
          className={triggerClassName ?? "w-[280px] min-w-[280px] justify-between"}
        >
          {selected ? (
            <span className="truncate text-left font-medium">{selected.label}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            onValueChange={(v) => onSearch?.(v)}
          />
          <CommandEmpty>{isLoading ? "Carregando..." : emptyText}</CommandEmpty>
          <CommandList className="gap-2 flex flex-col ">
            <CommandGroup className="gap-2 flex flex-col ">
              <CommandItem
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <span className="text-muted-foreground font-medium flex gap-2 items-center">
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
                  <span className="font-medium line-clamp-1 uppercase">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* ========================= Componente Principal ========================= */
export function AdmComission() {
  const ROLE_COMISSAO_ID = import.meta.env.VITE_ID_COMISSAO_PERMANENTE;
  const { urlGeral } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;

  // Helper de debounce
  function useDebounced<T>(value: T, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const id = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
  }

  // Hierarquia local
  const [unitQ, setUnitQ] = useState("");
  const [agencyQ, setAgencyQ] = useState("");
  const [sectorQ, setSectorQ] = useState("");
  const [locationQ, setLocationQ] = useState("");
  const [materialQ, setMaterialQ] = useState("");
  const [guardianQ, setGuardianQ] = useState("");

  const unitQd = useDebounced(unitQ);
  const agencyQd = useDebounced(agencyQ);
  const sectorQd = useDebounced(sectorQ);
  const locationQd = useDebounced(locationQ);
  const materialQd = useDebounced(materialQ);
  const guardianQd = useDebounced(guardianQ);

  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingGuardians, setLoadingGuardians] = useState(false);

  const [units, setUnits] = useState<UnitDTO[]>([]);
  const [agencies, setAgencies] = useState<AgencyDTO[]>([]);
  const [sectors, setSectors] = useState<SectorDTO[]>([]);
  const [locations, setLocations] = useState<LocationDTO[]>([]);

  const [unitId, setUnitId] = useState<UUID | null>(null);
  const [agencyId, setAgencyId] = useState<UUID | null>(null);
  const [sectorId, setSectorId] = useState<UUID | null>(null);
  const [locationId, setLocationId] = useState<UUID | null>(null);

  // Fetch hierarquia
  useEffect(() => {
    (async () => {
      try {
        setLoadingUnits(true);
        const qs = unitQd ? `?q=${encodeURIComponent(unitQd)}` : "";
        const res = await fetch(`${urlGeral}units/${qs}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const json = await res.json();
        setUnits(json?.units ?? []);
      } catch {
        setUnits([]);
      } finally {
        setLoadingUnits(false);
      }
    })();
  }, [urlGeral, token, unitQd]);

  const fetchAgencies = useCallback(
    async (uid: UUID, q?: string) => {
      if (!uid) {
        setAgencies([]);
        return;
      }
      try {
        setLoadingAgencies(true);
        const params = new URLSearchParams({ unit_id: uid });
        if (q) params.set("q", q);
        const res = await fetch(`${urlGeral}agencies/?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const json = await res.json();
        setAgencies(json?.agencies ?? []);
      } catch {
        setAgencies([]);
      } finally {
        setLoadingAgencies(false);
      }
    },
    [urlGeral, token]
  );

  const fetchSectors = useCallback(
    async (aid: UUID, q?: string) => {
      if (!aid) {
        setSectors([]);
        return;
      }
      try {
        setLoadingSectors(true);
        const params = new URLSearchParams({ agency_id: aid });
        if (q) params.set("q", q);
        const res = await fetch(`${urlGeral}sectors/?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const json = await res.json();
        setSectors(json?.sectors ?? []);
      } catch {
        setSectors([]);
      } finally {
        setLoadingSectors(false);
      }
    },
    [urlGeral, token]
  );

  const fetchLocations = useCallback(
    async (sid: UUID, q?: string) => {
      if (!sid) {
        setLocations([]);
        return;
      }
      try {
        setLoadingLocations(true);
        const params = new URLSearchParams({ sector_id: sid });
        if (q) params.set("q", q);
        const res = await fetch(`${urlGeral}locations/?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const json = await res.json();
        setLocations(json?.locations ?? []);
      } catch {
        setLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    },
    [urlGeral, token]
  );

  // Cascata
  useEffect(() => {
    setAgencyId(null);
    setSectorId(null);
    setLocationId(null);
    setAgencies([]);
    setSectors([]);
    setLocations([]);
    if (unitId) fetchAgencies(unitId, agencyQd);
  }, [unitId, fetchAgencies, agencyQd]);

  useEffect(() => {
    setSectorId(null);
    setLocationId(null);
    setSectors([]);
    setLocations([]);
    if (agencyId) fetchSectors(agencyId, sectorQd);
  }, [agencyId, fetchSectors, sectorQd]);

  useEffect(() => {
    setLocationId(null);
    setLocations([]);
    if (sectorId) fetchLocations(sectorId, locationQd);
  }, [sectorId, fetchLocations, locationQd]);

  const [showFilters, setShowFilters] = useState(true);

  // Filtros
  const [materials, setMaterials] = useState<Material[]>([]);
  const [guardians, setGuardians] = useState<LegalGuardian[]>([]);
  const [materialId, setMaterialId] = useState<UUID | null>(null);
  const [guardianId, setGuardianId] = useState<UUID | null>(null);
  const [q, setQ] = useState("");

  // Users da comissão
  const [commissionUsers, setCommissionUsers] = useState<UserDTO[]>([]);
  const [loadingCommissionUsers, setLoadingCommissionUsers] = useState(false);

  // Catálogo (agora organizado por coluna)
  const [loading, setLoading] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState<Record<string, boolean>>({});
  const [entries, setEntries] = useState<CatalogEntry[]>([]);

  // Colunas
  const columns = useMemo(
    () => [
      { key: COL_SEM_REVISOR, name: "Sem revisor" },
      ...commissionUsers.map((u) => ({
        key: (u.id ?? "").trim(),
        name: u.username ?? u.email ?? "Usuário",
      })),
    ],
    [commissionUsers]
  );

  // Board
  const [board, setBoard] = useState<Record<string, CatalogEntry[]>>({});
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);
  const [hasMoreByCol, setHasMoreByCol] = useState<Record<string, boolean>>({});

  // Modal
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{
    entry?: CatalogEntry;
    fromKey?: string;
    toKey?: string;
  }>({});
  const [justificativa, setJustificativa] = useState("");
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});
  const [posting, setPosting] = useState(false);

  // Snapshots
  const [snapshotBoard, setSnapshotBoard] = useState<Record<string, CatalogEntry[]> | null>(
    null
  );
  const [snapshotEntries, setSnapshotEntries] = useState<CatalogEntry[] | null>(null);

  // Paginação - offset por coluna
  const PAGE_SIZE = 24;
  const [offsetByCol, setOffsetByCol] = useState<Record<string, number>>({});
  const [totalByCol, setTotalByCol] = useState<Record<string, number>>({});
  const [expandedVisible, setExpandedVisible] = useState<number>(PAGE_SIZE);

  const rulesFor = (colKey?: string): ColumnRule => (!colKey ? {} : COLUMN_RULES[colKey] || {});

  useEffect(() => {
    const initial: Record<string, number> = {};
    for (const c of columns) {
      initial[c.key] = 0;
    }
    setOffsetByCol(initial);
  }, [columns]);

  const showMoreCol = (key: string) => {
    const k = (key ?? "").trim();
    const currentOffset = offsetByCol[k] ?? 0;
    const newOffset = currentOffset + PAGE_SIZE;
    fetchColumnData(k, newOffset, true);
  };

  const resetExpandedPagination = () => {
    setExpandedVisible(PAGE_SIZE);
    if (expandedColumn) {
      const currentItems = board[expandedColumn]?.length ?? 0;
      if (currentItems < PAGE_SIZE) {
        fetchColumnData(expandedColumn, 0, false);
      }
    }
  };

  const showMoreExpanded = () => {
    if (!expandedColumn) return;
    const currentItems = board[expandedColumn]?.length ?? 0;
    const newVisible = expandedVisible + PAGE_SIZE;
    setExpandedVisible(newVisible);

    // Se ainda tem mais no backend e o que já carregou é menor que o novo visível, busca mais
    if (hasMoreByCol[expandedColumn] && currentItems < newVisible) {
      fetchColumnData(expandedColumn, currentItems, true);
    }
  };

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

  // Fetch users comissão
  const fetchCommissionUsers = useCallback(async () => {
    try {
      setLoadingCommissionUsers(true);
      const res = await fetch(`${urlGeral}roles/${ROLE_COMISSAO_ID}/users`);
      if (!res.ok) throw new Error();
      const json: RoleUsersResponse = await res.json();
      setCommissionUsers(json?.users ?? []);
    } catch {
      toast.error("Falha ao carregar membros da comissão");
    } finally {
      setLoadingCommissionUsers(false);
    }
  }, [urlGeral, ROLE_COMISSAO_ID]);

  useEffect(() => {
    fetchCommissionUsers();
  }, [fetchCommissionUsers]);

  // Fetch por coluna
  const fetchColumnData = useCallback(
    async (colKey: string, offset = 0, append = false) => {
      if (!colKey) return;

      try {
        setLoadingColumns((prev) => ({ ...prev, [colKey]: true }));

        const params = new URLSearchParams();
        params.set("workflow_status", WF_FILTER);
        params.set("offset", offset.toString());
        params.set("limit", PAGE_SIZE.toString());

        if (colKey !== COL_SEM_REVISOR) {
          params.set("reviewer_id", colKey);
        } else {
          params.set("reviewer_id", "null");
        }

        if (materialId) params.set("material_id", materialId);
        if (guardianId) params.set("legal_guardian_id", guardianId);
        if (unitId) params.set("unit_id", unitId);
        if (agencyId) params.set("agency_id", agencyId);
        if (sectorId) params.set("sector_id", sectorId);
        if (locationId) params.set("location_id", locationId);

        const res = await fetch(`${urlGeral}catalog/?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error();

        const json: CatalogResponse & { total?: number } = await res.json();
        const newEntries = json?.catalog_entries ?? [];

        if (typeof json.total === "number") {
          setTotalByCol((prev) => ({
            ...prev,
            [colKey]: json.total as number,
          }));
        }

        // Só mostra "Mostrar mais" se veio um lote cheio
        setHasMoreByCol((prev) => ({
          ...prev,
          [colKey]: newEntries.length === PAGE_SIZE && newEntries.length > 0,
        }));

        if (append) {
          setBoard((prev) => ({
            ...prev,
            [colKey]: [...(prev[colKey] ?? []), ...newEntries],
          }));
          setEntries((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const filtered = newEntries.filter((e) => !existingIds.has(e.id));
            return [...prev, ...filtered];
          });
          setOffsetByCol((prev) => ({
            ...prev,
            [colKey]: offset + PAGE_SIZE,
          }));
        } else {
          setBoard((prev) => ({
            ...prev,
            [colKey]: newEntries,
          }));
          setEntries((prev) => {
            const otherCols = prev.filter(() => true);
            return [...otherCols, ...newEntries];
          });
          setOffsetByCol((prev) => ({
            ...prev,
            [colKey]: PAGE_SIZE,
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar coluna:", err);
        toast.error(`Falha ao carregar ${colKey}`);
      } finally {
        setLoadingColumns((prev) => ({ ...prev, [colKey]: false }));
      }
    },
    [
      urlGeral,
      token,
      materialId,
      guardianId,
      unitId,
      agencyId,
      sectorId,
      locationId,
      PAGE_SIZE,
    ]
  );

  /* ===== Estatísticas review-commission ===== */
  type ReviewCommissionStat = {
    reviewer_id: string | null;
    reviewer: string;
    total: number;
    d0: number;
    d3: number;
    w1: number;
  };

  const [reviewStats, setReviewStats] = useState<ReviewCommissionStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchReviewStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const params = new URLSearchParams();

      if (materialId) params.set("material_id", materialId);
      if (guardianId) params.set("legal_guardian_id", guardianId);
      if (unitId) params.set("unit_id", unitId);
      if (agencyId) params.set("agency_id", agencyId);
      if (sectorId) params.set("sector_id", sectorId);
      if (locationId) params.set("location_id", locationId);

      const query = params.toString();
      const url = query
        ? `${urlGeral}statistics/catalog/stats/review-commission?${query}`
        : `${urlGeral}statistics/catalog/stats/review-commission`;

      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error();

      const json: ReviewCommissionStat[] = await res.json();
      setReviewStats(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("Erro ao buscar estatísticas review-commission:", err);
      setReviewStats([]);
    } finally {
      setLoadingStats(false);
    }
  }, [
    urlGeral,
    token,
    materialId,
    guardianId,
    unitId,
    agencyId,
    sectorId,
    locationId,
  ]);

  // total geral esperando avaliação
  const totalWaiting = useMemo(
    () => reviewStats.reduce((sum, s) => sum + (s.total ?? 0), 0),
    [reviewStats]
  );

  // total por coluna (stats -> totalByCol -> fallback board)
  const getColumnTotal = useCallback(
    (colKey: string) => {
      const stat = reviewStats.find((row) => {
        if (colKey === COL_SEM_REVISOR) {
          return row.reviewer_id === null || row.reviewer_id === "null";
        }
        return (row.reviewer_id ?? "").trim() === colKey.trim();
      });

      if (stat) return stat.total ?? 0;

      const total = totalByCol[colKey];
      if (typeof total === "number") return total;

      return (board[colKey] ?? []).length;
    },
    [reviewStats, totalByCol, board]
  );

  // Fetch inicial/geral: colunas (sequencial) + stats
  const fetchAllColumns = useCallback(async () => {
    setLoading(true);
    setBoard({});
    setEntries([]);
    setOffsetByCol({});
    setTotalByCol({});
    setHasMoreByCol({});

    try {
      // Faz uma coluna de cada vez, na ordem
      for (const col of columns) {
        await fetchColumnData(col.key, 0, false);
      }
    } finally {
      setLoading(false);
    }
  }, [columns, fetchColumnData]);

  // Evita múltiplos refresh iniciais (StrictMode, etc.)
  const initialLoadRef = useRef(false);

  // Carregamento inicial (só depois que a comissão chegou)
  useEffect(() => {
    if (!commissionUsers.length) return;
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;
    setExpandedColumn(null);
    fetchAllColumns();
    fetchReviewStats();
  }, [commissionUsers, fetchAllColumns, fetchReviewStats]);

  // Recarregar board + estatística quando filtros mudam (após load inicial)
  useEffect(() => {
    if (!commissionUsers.length) return;
    if (!initialLoadRef.current) return;
    setExpandedColumn(null);
    fetchAllColumns();
    fetchReviewStats();
  }, [
    materialId,
    guardianId,
    unitId,
    agencyId,
    sectorId,
    locationId,
    fetchAllColumns,
    fetchReviewStats,
    commissionUsers.length,
  ]);

  // Atualiza URL com filtros
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (materialId) params.set("material_id", materialId);
    else params.delete("material_id");
    if (guardianId) params.set("legal_guardian_id", guardianId);
    else params.delete("legal_guardian_id");
    if (unitId) params.set("unit_id", unitId);
    else params.delete("unit_id");
    if (agencyId) params.set("agency_id", agencyId);
    else params.delete("agency_id");
    if (sectorId) params.set("sector_id", sectorId);
    else params.delete("sector_id");
    if (locationId) params.set("location_id", locationId);
    else params.delete("location_id");

    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId, guardianId, unitId, agencyId, sectorId, locationId]);

  // Filtro q (client-side) - aplicado sobre o board já carregado
  const filteredBoard = useMemo(() => {
    if (!q.trim()) return board;

    const term = q.trim().toLowerCase();
    const filtered: Record<string, CatalogEntry[]> = {};

    for (const [key, items] of Object.entries(board)) {
      filtered[key] = items.filter((e) => {
        const code = codeFrom(e);
        const haystack = [
          code,
          e?.asset?.atm_number,
          e?.asset?.asset_description,
          e?.asset?.material?.material_name,
          e?.asset?.item_brand,
          e?.asset?.item_model,
          e?.asset?.serial_number,
          e?.description,
          e?.asset?.legal_guardian?.legal_guardians_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      });
    }

    return filtered;
  }, [board, q]);

  // Drag & Drop -> PUT reviewers
  const putReviewers = async (entry: CatalogEntry | undefined, reviewers: string[]) => {
    if (!entry) return false;
    try {
      const res = await fetch(`${urlGeral}catalog/${entry.id}/reviewers`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(reviewers),
      });
      if (!res.ok) throw new Error();
      toast.success("Revisor atualizado com sucesso.");
      return true;
    } catch {
      toast.error("Não foi possível atualizar o revisor.");
      return false;
    }
  };

  const boardScrollRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const pointerXRef = useRef<number>(0);
  const currentDestinationRef = useRef<string | null>(null);

  const stopAutoScrollLoop = () => {
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  const EDGE_PX = 140;
  const MAX_STEP = 40;
  const BASE_STEP = 12;

  const autoScrollTick = useCallback(() => {
    if (!draggingRef.current) return stopAutoScrollLoop();
    const el = boardScrollRef.current;
    if (!el) return stopAutoScrollLoop();

    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const padL = parseFloat(style.paddingLeft || "0");
    const padR = parseFloat(style.paddingRight || "0");
    const rectLeft = rect.left + padL;
    const rectRight = rect.right - padR;
    const x = pointerXRef.current;

    let dx = 0;
    if (x - rectLeft < EDGE_PX) {
      const dist = Math.max(1, EDGE_PX - (x - rectLeft));
      dx = -Math.min(MAX_STEP, BASE_STEP + Math.floor(dist / 4));
    } else if (rectRight - x < EDGE_PX) {
      const dist = Math.max(1, EDGE_PX - (rectRight - x));
      dx = Math.min(MAX_STEP, BASE_STEP + Math.floor(dist / 4));
    }

    if (dx !== 0) {
      el.scrollBy({ left: dx, behavior: "auto" });
    }

    const destId = currentDestinationRef.current;
    if (destId) {
      const colEl = colRefs.current[destId];
      if (colEl) {
        const containerRect = el.getBoundingClientRect();
        const colRect = colEl.getBoundingClientRect();

        const colCenterX = colRect.left + colRect.width / 2;
        const containerCenterX = containerRect.left + containerRect.width / 2;

        const isNotVisible =
          colRect.right < containerRect.left || colRect.left > containerRect.right;
        const needsCenter = Math.abs(colCenterX - containerCenterX) > 100;

        if (isNotVisible || needsCenter) {
          const targetScroll =
            colEl.offsetLeft - containerRect.width / 2 + colRect.width / 2;
          el.scrollTo({
            left: Math.max(0, targetScroll),
            behavior: "auto",
          });
        }
      }
    }

    rafIdRef.current = requestAnimationFrame(autoScrollTick);
  }, []);

  const handlePointerMoveWhileDrag = useCallback(
    (ev: PointerEvent) => {
      pointerXRef.current = ev.clientX;
      if (rafIdRef.current == null && draggingRef.current) {
        rafIdRef.current = requestAnimationFrame(autoScrollTick);
      }
    },
    [autoScrollTick]
  );

  const handleDragStart = useCallback(() => {
    draggingRef.current = true;
    currentDestinationRef.current = null;
    document.addEventListener("pointermove", handlePointerMoveWhileDrag);
    stopAutoScrollLoop();
    rafIdRef.current = requestAnimationFrame(autoScrollTick);
  }, [handlePointerMoveWhileDrag, autoScrollTick]);

  const colRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleDragUpdate = useCallback((update: DragUpdate) => {
    const destId = update.destination?.droppableId?.trim();
    currentDestinationRef.current = destId || null;
  }, []);

  const handleDragEndDrop = useCallback(
    async (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;

      const fromKey = (source.droppableId ?? "").trim();
      const toKey = (destination.droppableId ?? "").trim();
      if (fromKey === toKey) return;

      const validTo =
        toKey === COL_SEM_REVISOR ||
        commissionUsers.some((u) => (u.id ?? "").trim() === toKey);

      if (!validTo) {
        toast.error("Destino inválido para reatribuição.");
        return;
      }

      const fromList = board[fromKey] ?? [];
      const entry = fromList[source.index];
      if (!entry) return;

      const prevBoard = board;
      const prevEntries = entries;

      let reviewersNew: string[] = [];
      if (toKey !== COL_SEM_REVISOR) {
        reviewersNew = [toKey];
      }

      const newFrom = fromList.filter((x) => x.id !== entry.id);
      const newTo = [entry, ...(board[toKey] ?? [])];

      setBoard((old) => ({
        ...old,
        [fromKey]: newFrom,
        [toKey]: newTo,
      }));

      setEntries((old) => [...old]);

      const ok = await putReviewers(entry, reviewersNew);
      if (!ok) {
        setBoard(prevBoard);
        setEntries(prevEntries);
      }
    },
    [board, entries, commissionUsers, putReviewers]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      draggingRef.current = false;
      currentDestinationRef.current = null;
      document.removeEventListener("pointermove", handlePointerMoveWhileDrag);
      stopAutoScrollLoop();
      void handleDragEndDrop(result);
    },
    [handlePointerMoveWhileDrag, handleDragEndDrop]
  );

  const closingActionRef = useRef<"confirm" | "cancel" | null>(null);

  const handleConfirmMove = async () => {
    closingActionRef.current = "confirm";
    setSnapshotBoard(null);
    setSnapshotEntries(null);
    setMoveModalOpen(false);
    setMoveTarget({});
    setJustificativa("");
    setExtraValues({});
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      const reason = closingActionRef.current;
      closingActionRef.current = null;

      if (reason !== "confirm" && snapshotBoard && snapshotEntries) {
        setBoard(snapshotBoard);
        setEntries(snapshotEntries);
      }

      setMoveModalOpen(false);
      setMoveTarget({});
      setJustificativa("");
      setExtraValues({});
      setSnapshotBoard(null);
      setSnapshotEntries(null);
    } else {
      setMoveModalOpen(true);
    }
  };

  const handleCancelMove = () => {
    closingActionRef.current = "cancel";
    setMoveModalOpen(false);
  };

  const clearFilters = () => {
    setMaterialId(null);
    setGuardianId(null);
    setQ("");
    setUnitId(null);
    setAgencyId(null);
    setSectorId(null);
    setLocationId(null);
    setAgencies([]);
    setSectors([]);
    setLocations([]);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const u = params.get("unit_id");
    const a = params.get("agency_id");
    const s = params.get("sector_id");
    const l = params.get("location_id");
    if (u) setUnitId(u);
    if (a) setAgencyId(a);
    if (s) setSectorId(s);
    if (l) setLocationId(l);
  }, []);

  const materialItems: ComboboxItem[] = (materials ?? []).map((m) => ({
    id: m.id,
    code: m.material_code,
    label: m.material_name || m.material_code,
  }));

  const guardianItems: ComboboxItem[] = (guardians ?? []).map((g) => ({
    id: g.id,
    code: g.legal_guardians_code,
    label: g.legal_guardians_name || g.legal_guardians_code,
  }));

  useEffect(() => {
    if (expandedColumn !== null) resetExpandedPagination();
  }, [expandedColumn]);

  const downloadXlsx = async (colKey?: string, onlyVisible = false) => {
    let itemsToExport: CatalogEntry[] = [];

    if (colKey) {
      const all = filteredBoard[colKey] ?? [];
      const isExpanded = expandedColumn === colKey;
      itemsToExport = onlyVisible && isExpanded ? all.slice(0, expandedVisible) : all;
    } else {
      itemsToExport = entries;
    }

    if (!Array.isArray(itemsToExport)) {
      console.error("downloadXlsx: itemsToExport não é array", itemsToExport);
      toast.error("Nada para exportar.");
      return;
    }

    await handleDownloadXlsx({
      items: itemsToExport,
      urlBase: urlGeral,
      sheetName: "Itens",
      filename:
        `itens_${(colKey && (columns.find((c) => c.key === colKey)?.name || colKey)) || "todos"}${onlyVisible ? "_visiveis" : ""}`
          .replace(/\s+/g, "_")
          .toLowerCase() + ".xlsx",
    });
  };

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

  useEffect(() => {
    const t = setTimeout(checkScrollability, 0);
    return () => clearTimeout(t);
  }, [columns, board]);

  useEffect(() => {
    return () => {
      document.removeEventListener("pointermove", handlePointerMoveWhileDrag);
      draggingRef.current = false;
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    };
  }, [handlePointerMoveWhileDrag]);

  const totalItems = useMemo(() => {
    return Object.values(totalByCol).reduce((sum, count) => sum + count, 0);
  }, [totalByCol]);

  const { hasAnunciarItem, hasCargosFuncoes } = usePermissions();
  const [isImage, setIsImage] = useState(false);

  return (
    <div className="p-4 md:p-8  gap-8 flex flex-col h-full">
      <main className="flex flex-col gap-4  flex-1 min-h-0 overflow-hidden">
        <Alert className="p-0 ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              LTD - Lista Temporária de Desfazimento
            </CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "…" : totalWaiting || 0}
            </div>
            <p className="text-xs text-muted-foreground">esperando avaliação</p>
          </CardContent>
        </Alert>

        {showFilters && (
          <div className="flex gap-4 items-center">
            <div className="relative grid grid-cols-1">
              <Button
                variant="outline"
                size="sm"
                className={`absolute left-0 z-10 h-10 w-10 p-0 ${!canScrollLeft ? "opacity-30 cursor-not-allowed" : ""}`}
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
                    <Alert className="w-[300px] min-w-[300px] py-0 h-10 rounded-md flex gap-3 items-center">
                      <div>
                        <MagnifyingGlass size={16} className="text-gray-500" />
                      </div>
                      <div className="relative w-full">
                        <Input
                          className="border-0 p-0 h-9 flex flex-1 w-full"
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          placeholder="Buscar por código, descrição, material, marca, modelo..."
                        />
                      </div>
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
                      items={(units ?? []).map((u) => ({
                        id: u.id,
                        code: u.unit_code,
                        label: u.unit_name || u.unit_code,
                      }))}
                      value={unitId}
                      onChange={(v) => setUnitId(v)}
                      onSearch={setUnitQ}
                      isLoading={loadingUnits}
                      placeholder="Unidade"
                    />

                    <Combobox
                      items={(agencies ?? []).map((a) => ({
                        id: a.id,
                        code: a.agency_code,
                        label: a.agency_name || a.agency_code,
                      }))}
                      value={agencyId}
                      onChange={(v) => setAgencyId(v)}
                      onSearch={setAgencyQ}
                      isLoading={loadingAgencies}
                      placeholder="Organização"
                      disabled={!unitId}
                    />

                    <Combobox
                      items={(sectors ?? []).map((s) => ({
                        id: s.id,
                        code: s.sector_code,
                        label: s.sector_name || s.sector_code,
                      }))}
                      value={sectorId}
                      onChange={(v) => setSectorId(v)}
                      onSearch={setSectorQ}
                      isLoading={loadingSectors}
                      placeholder="Setor"
                      disabled={!agencyId}
                    />

                    <Combobox
                      items={(locations ?? []).map((l) => ({
                        id: l.id,
                        code: l.location_code,
                        label: l.location_name || l.location_code,
                      }))}
                      value={locationId}
                      onChange={(v) => setLocationId(v)}
                      onSearch={setLocationQ}
                      isLoading={loadingLocations}
                      placeholder="Local de guarda"
                      disabled={!sectorId}
                    />

                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <Trash size={16} /> Limpar filtros
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className={`absolute right-0 z-10 h-10 w-10 p-0 rounded-md ${!canScrollRight ? "opacity-30 cursor-not-allowed" : ""}`}
                onClick={scrollRight}
                disabled={!canScrollRight}
              >
                <ChevronRight size={16} />
              </Button>
            </div>

            {hasCargosFuncoes && (
              <RoleMembers
                roleId={ROLE_COMISSAO_ID}
                title="Comissão de desfazimento"
              />
            )}

            {expandedColumn === null && (
              <Button
                onClick={() => setIsImage(!isImage)}
                variant={"outline"}
                size={"icon"}
                className="h-8 min-w-8 "
              >
                {isImage ? <EyeClosed size={16} /> : <Eye size={16} />}
              </Button>
            )}
          </div>
        )}

        {expandedColumn === null ? (
          <div className={`relative flex-1 `}>
            {/* Skeleton enquanto as colunas (comissão) ainda não chegaram */}
            {!commissionUsers.length && (loadingCommissionUsers || loading) ? (
              <div className="flex  gap-4 mt-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Alert
                    key={i}
                    className="w-[320px] min-w-[320px] h-full flex flex-col min-h-[260px] overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                    <Separator className="mb-2" />
                    <div className="flex-1 flex flex-col gap-2 pt-2">
                      <Skeleton className="w-full aspect-square rounded-md" />
                      <Skeleton className="w-full aspect-square rounded-md" />
                    </div>
                  </Alert>
                ))}
              </div>
            ) : (
              <div ref={boardScrollRef} className="h-full overflow-x-auto overflow-y-hidden pb-2">
                <DragDropContext
                  onDragStart={handleDragStart}
                  onDragUpdate={handleDragUpdate}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex gap-4 min-w-[980px] h-full">
                    {columns.map((col) => {
                      const items = filteredBoard[col.key] ?? [];
                      const meta = WORKFLOW_STATUS_META[col.key] ?? {
                        Icon: HelpCircle,
                        colorClass: "text-zinc-500",
                      };
                      const { Icon } = meta;

                      const totalCol = getColumnTotal(col.key);

                      return (
                        <Alert
                          key={col.key}
                          ref={(el) => (colRefs.current[col.key] = el)}
                          className="w-[320px] min-w-[320px]  h-full flex flex-col min-h-0 overflow-hidden"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Avatar className="h-8 w-8 rounded-md">
                                  <AvatarImage
                                    src={`${urlGeral}user/upload/${col.key}/icon`}
                                  />
                                  <AvatarFallback className="">
                                    <User className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <span title={col.name} className="font-semibold truncate">
                                  {col.name}
                                </span>
                              </div>
                              <Badge variant="outline" className="shrink-0">
                                {loadingStats ? "…" : totalCol}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 shrink-0 border"
                              onClick={() => setExpandedColumn(col.key)}
                              title="Expandir coluna"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <Separator className="mb-2" />

                          <Droppable droppableId={col.key}>
                            {(provided, snapshot) => (
                              <div className="flex-1 min-h-0">
                                <ScrollArea
                                  className={`relative flex h-[calc(100vh-348px)] ${
                                    snapshot.isDraggingOver
                                      ? "bg-neutral-200 dark:bg-neutral-800 rounded-md"
                                      : ""
                                  } [&>[data-radix-scroll-area-viewport]]:w-full [&>[data-radix-scroll-area-viewport]]:max-w-full [&>[data-radix-scroll-area-viewport]]:min-w-0 [&>[data-radix-scroll-area-viewport]>div]:w-full [&>[data-radix-scroll-area-viewport]>div]:max-w-full [&>[data-radix-scroll-area-viewport]>div]:min-w-0`}
                                >
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex flex-col gap-2 min-w-0 w-full max-w-full pt-2 pr-1"
                                  >
                                    {(loading || loadingColumns[col.key]) && !items.length ? (
                                      <>
                                        <Skeleton className="aspect-square w-full rounded-md" />
                                        <Skeleton className="aspect-square w-full rounded-md" />
                                      </>
                                    ) : null}

                                    {items.map((entry, idx) => (
                                      <div
                                        key={entry.id}
                                        className="min-w-0 w-full max-w-full overflow-hidden"
                                      >
                                        <CardItemDropdown
                                          entry={entry}
                                          index={idx}
                                          isImage={isImage}
                                        />
                                      </div>
                                    ))}

                                    {provided.placeholder}

                                    {(() => {
                                      const total = totalByCol[col.key];
                                      const hasMore = hasMoreByCol[col.key] ?? false;
                                      const loaded = items.length;

                                      // mostra "Mostrar mais" se ainda tem mais no backend
                                      // ou se ainda não carregamos tudo do total conhecido
                                      const shouldShowMore =
                                        hasMore ||
                                        (typeof total === "number" && loaded < total);

                                      return shouldShowMore ? (
                                        <div className="pt-2">
                                          <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => showMoreCol(col.key)}
                                            disabled={loadingColumns[col.key]}
                                          >
                                            {loadingColumns[col.key] ? (
                                              <>
                                                <Loader size={16} className="animate-spin" />
                                                Carregando...
                                              </>
                                            ) : (
                                              <>
                                                <Plus size={16} />
                                                Mostrar mais
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      ) : null;
                                    })()}
                                  </div>

                                  <ScrollBar orientation="vertical" />
                                </ScrollArea>
                              </div>
                            )}
                          </Droppable>
                        </Alert>
                      );
                    })}
                  </div>
                </DragDropContext>
              </div>
            )}
          </div>
        ) : (
          <div className="m-0">
            {columns.map((col) => {
              if (expandedColumn !== col.key) return null;
              const items = filteredBoard[col.key] ?? [];
              const slice = items.slice(0, expandedVisible);
              const meta = WORKFLOW_STATUS_META[col.key] ?? {
                Icon: HelpCircle,
                colorClass: "text-zinc-500",
              };
              const { Icon } = meta;

              const totalCol = getColumnTotal(col.key);
              const loaded = items.length;
              const hasMore = hasMoreByCol[col.key] ?? false;
              const hasHiddenLoaded = loaded > expandedVisible;

              const shouldShowMore = hasMore || hasHiddenLoaded;

              return (
                <div key={col.key}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 rounded-md">
                          <AvatarImage src={`${urlGeral}user/upload/${col.key}/icon`} />
                          <AvatarFallback className="">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <h2 className="text-lg font-semibold">{col.name}</h2>
                      </div>
                      <Badge variant="outline">
                        {loadingStats ? "…" : totalCol}
                      </Badge>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        size={"sm"}
                        variant="outline"
                        onClick={() => downloadXlsx(col.key, true)}
                      >
                        <Download size={16} /> Baixar visíveis
                      </Button>
                      <Button
                        size={"sm"}
                        variant="outline"
                        onClick={() => downloadXlsx(col.key)}
                      >
                        <Download size={16} /> Baixar resultado
                      </Button>
                      <Button size={"sm"} onClick={() => setExpandedColumn(null)}>
                        <ChevronLeft size={16} />
                        Voltar ao quadro
                      </Button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {slice.map((item) => (
                      <ItemPatrimonio key={item.id} {...item} onPromptDelete={() => {}} />
                    ))}
                  </div>

                  {shouldShowMore ? (
                    <div className="flex justify-center mt-8">
                      <Button
                        onClick={showMoreExpanded}
                        disabled={loadingColumns[col.key]}
                      >
                        {loadingColumns[col.key] ? (
                          <>
                            <Loader size={16} className="animate-spin" />
                            Carregando...
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            Mostrar mais
                          </>
                        )}
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={moveModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
              Confirmar reatribuição
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Você está reatribuindo o item{" "}
              <strong>
                {moveTarget.entry?.asset?.material.material_name ?? moveTarget.entry?.id} (
                {`${moveTarget.entry?.asset?.asset_code}-${moveTarget.entry?.asset?.asset_check_digit}`}
                )
              </strong>{" "}
              de:{" "}
              <strong>
                {columns.find((c) => c.key === moveTarget.fromKey)?.name ?? moveTarget.fromKey}
              </strong>{" "}
              para:{" "}
              <strong>
                {columns.find((c) => c.key === moveTarget.toKey)?.name ?? moveTarget.toKey}
              </strong>
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="just">Observação (opcional)</Label>
              <Textarea
                id="just"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Adicione observações, se necessário…"
              />
            </div>

            {(rulesFor(moveTarget.toKey)?.extraFields ?? []).map((f) => (
              <div className="grid gap-2" key={f.name}>
                <Label htmlFor={f.name}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.name}
                    value={extraValues[f.name] ?? ""}
                    onChange={(e) =>
                      setExtraValues((s) => ({ ...s, [f.name]: e.target.value }))
                    }
                  />
                ) : (
                  <Input
                    id={f.name}
                    placeholder={f.placeholder}
                    value={extraValues[f.name] ?? ""}
                    onChange={(e) =>
                      setExtraValues((s) => ({ ...s, [f.name]: e.target.value }))
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={handleCancelMove}>
              <X size={16} /> Cancelar
            </Button>
            <Button disabled={posting} onClick={handleConfirmMove}>
              {posting ? (
                <>
                  <Loader size={16} /> Salvando...
                </>
              ) : (
                <>
                  <Check size={16} /> Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdmComission;
