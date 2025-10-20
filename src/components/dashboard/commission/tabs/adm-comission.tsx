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
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Alert } from "../../../ui/alert";
import { ArrowUUpLeft, MagnifyingGlass } from "phosphor-react";

import { ScrollArea, ScrollBar } from "../../../ui/scroll-area";
import { RoleMembers } from "../../cargos-funcoes/components/role-members";
import { CardItemDropdown } from "../../itens-vitrine/card-item-dropdown";
import { ItemPatrimonio } from "../../../homepage/components/item-patrimonio";

/* =========================
   Tipos do backend
========================= */
type UUID = string;

type LegalGuardian = {
  legal_guardians_code: string;
  legal_guardians_name: string;
  id: UUID;
};

/* =========================
   Tipos hierarquia local
========================= */
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

type WorkflowHistoryItem = {
  workflow_status: string;
  detail?: Record<string, any>;
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
};

type RoleUsersResponse = {
  users: UserDTO[];
};

/* =========================
   Board (colunas dinâmicas por usuário + "Sem revisor")
========================= */
const COL_SEM_REVISOR = "SEM_REVISOR";
const ROLE_COMISSAO_ID = "16c957d6-e66a-42a4-a48a-1e4ca77e6266";
const WF_FILTER = "REVIEW_REQUESTED_COMISSION";
const WF_DETAIL_SOURCE_A = "REVIEW_REQUESTED_COMISSION";


// Mantemos o objeto e o tipo para seguir o *mesmo padrão* estrutural do exemplo.
const WORKFLOWS = {
  admComission: [] as Array<{ key: string; name: string }>,
} as const;
type BoardKind = keyof typeof WORKFLOWS;

const WORKFLOW_STATUS_META: Record<string, { Icon: LucideIcon; colorClass: string }> = {
  [COL_SEM_REVISOR]: { Icon: HelpCircle, colorClass: "text-zinc-500" },
};

/* =========================
   Presets (mantidos por paridade visual com o modal, não usados aqui)
========================= */
type JustPreset = { id: string; label: string; build: (e: CatalogEntry) => string };
const JUSTIFICATIVAS_DESFAZIMENTO: JustPreset[] = []; // vazio aqui

/* =========================
   Regras por coluna (nenhuma exige justificativa nesta página)
========================= */
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

// Todas as colunas sem exigência (modal fica inoperante)
const COLUMN_RULES: Record<string, ColumnRule> = {
  [COL_SEM_REVISOR]: { requireJustification: false },
};

/* =========================
   Utils de board
========================= */
const lastWorkflow = (entry: CatalogEntry): WorkflowHistoryItem | undefined => {
  const hist = entry.workflow_history ?? [];
  if (!hist.length) return undefined;
  return hist[hist.length - 1];
};

const codeFrom = (e: CatalogEntry) => [e?.asset?.asset_code, e?.asset?.asset_check_digit].filter(Boolean).join("-");

// Pega a *última* entrada relevante que contenha reviewers
const lastReviewersDetail = (entry: CatalogEntry): string[] => {
  const hist = entry.workflow_history ?? [];
  const isTarget = (h: WorkflowHistoryItem) =>
    (h.workflow_status ?? "").trim() === WF_DETAIL_SOURCE_A 

  const relevant = hist.filter(isTarget);
  if (!relevant.length) return [];
  const last = relevant[relevant.length - 1];
  const reviewers = (last?.detail?.reviewers ?? []) as string[];
  return Array.isArray(reviewers) ? reviewers.filter(Boolean) : [];
};

const groupByReviewer = (
  data: CatalogEntry[],
  columns: { key: string; name: string }[],
  users: UserDTO[]
) => {
  const map: Record<string, CatalogEntry[]> = {};
  const valid = new Set(columns.map((c) => (c.key ?? "").trim()));
  for (const col of columns) map[(col.key ?? "").trim()] = [];

  const userIds = new Set(users.map((u) => u.id));

  for (const entry of data) {
    const reviewers = lastReviewersDetail(entry).filter((id) => userIds.has(id));
    if (!reviewers.length) {
      map[COL_SEM_REVISOR]?.push(entry);
      continue;
    }
    // Se houver múltiplos revisores, duplicamos visualmente (mesma lógica de colunas independentes).
    for (const rid of reviewers) {
      if (valid.has(rid)) map[rid].push(entry);
      else console.warn(`[Board] Revisor ${rid} não está em 'users'. Omitindo.`);
    }
  }
  return map;
};

/* =========================
   Combobox (idêntico ao exemplo)
========================= */
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
          className={triggerClassName ?? "w-[280px] min-w-[280px] justify-between"}
        >
          {selected ? <span className="truncate text-left font-medium">{selected.label}</span> : <span className="text-muted-foreground">{placeholder}</span>}
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
                  onChange(null);
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

/* =========================
   Componente Principal
========================= */
export function AdmComission() {
  const { urlGeral } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Hierarquia local (idêntico ao exemplo)
  const [units, setUnits] = useState<UnitDTO[]>([]);
  const [agencies, setAgencies] = useState<AgencyDTO[]>([]);
  const [sectors, setSectors] = useState<SectorDTO[]>([]);
  const [locations, setLocations] = useState<LocationDTO[]>([]);

  // Seleções
  const [unitId, setUnitId] = useState<UUID | null>(null);
  const [agencyId, setAgencyId] = useState<UUID | null>(null);
  const [sectorId, setSectorId] = useState<UUID | null>(null);
  const [locationId, setLocationId] = useState<UUID | null>(null);

  // Fetch listas hierarquia
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${urlGeral}units/`);
        const json = await res.json();
        setUnits(json?.units ?? []);
      } catch {}
    })();
  }, [urlGeral]);

  const fetchAgencies = useCallback(
    async (uid: UUID) => {
      if (!uid) return setAgencies([]);
      try {
        const res = await fetch(`${urlGeral}agencies/?unit_id=${encodeURIComponent(uid)}`);
        const json = await res.json();
        setAgencies(json?.agencies ?? []);
      } catch {
        setAgencies([]);
      }
    },
    [urlGeral]
  );

  const fetchSectors = useCallback(
    async (aid: UUID) => {
      if (!aid) return setSectors([]);
      try {
        const res = await fetch(`${urlGeral}sectors/?agency_id=${encodeURIComponent(aid)}`);
        const json = await res.json();
        setSectors(json?.sectors ?? []);
      } catch {
        setSectors([]);
      }
    },
    [urlGeral]
  );

  const fetchLocations = useCallback(
    async (sid: UUID) => {
      if (!sid) return setLocations([]);
      try {
        const res = await fetch(`${urlGeral}locations/?sector_id=${encodeURIComponent(sid)}`);
        const json = await res.json();
        setLocations(json?.locations ?? []);
      } catch {
        setLocations([]);
      }
    },
    [urlGeral]
  );

  // Cascata
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

  const [tab, setTab] = useState<BoardKind>("admComission"); // mantém o mesmo conceito de "tab"
  const [showFilters, setShowFilters] = useState(true);

  // Filtros
  const [materials, setMaterials] = useState<Material[]>([]);
  const [guardians, setGuardians] = useState<LegalGuardian[]>([]);
  const [materialId, setMaterialId] = useState<UUID | null>(null);
  const [guardianId, setGuardianId] = useState<UUID | null>(null);
  const [q, setQ] = useState("");

  // Users da comissão (para formar colunas)
  const [commissionUsers, setCommissionUsers] = useState<UserDTO[]>([]);

  // Catálogo
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<CatalogEntry[]>([]);

  // Colunas = Sem revisor + usuários (mesmo shape do exemplo)
  const columns = useMemo(
    () =>
      [{ key: COL_SEM_REVISOR, name: "Sem revisor" }, ...commissionUsers.map((u) => ({ key: (u.id ?? "").trim(), name: u.username ?? u.email ?? "Usuário" }))],
    [commissionUsers]
  );

  // Board
  const [board, setBoard] = useState<Record<string, CatalogEntry[]>>({});
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);

  // Modal de mudança de coluna (mantido)
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{ entry?: CatalogEntry; fromKey?: string; toKey?: string }>({});
  const [justificativa, setJustificativa] = useState("");
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});
  const [posting, setPosting] = useState(false);

  // Snapshots
  const [snapshotBoard, setSnapshotBoard] = useState<Record<string, CatalogEntry[]> | null>(null);
  const [snapshotEntries, setSnapshotEntries] = useState<CatalogEntry[] | null>(null);

  // Paginação
  const PAGE_SIZE = 10000;
  const [visibleByCol, setVisibleByCol] = useState<Record<string, number>>({});
  const [expandedVisible, setExpandedVisible] = useState<number>(PAGE_SIZE);

  const rulesFor = (colKey?: string): ColumnRule => (!colKey ? {} : COLUMN_RULES[colKey] || {});

  useEffect(() => {
    setVisibleByCol((prev) => {
      const next = { ...prev };
      for (const c of columns) {
        const k = (c.key ?? "").trim();
        if (typeof next[k] !== "number") next[k] = PAGE_SIZE;
      }
      return next;
    });
  }, [columns]);

  const showMoreCol = (key: string) => {
    const k = (key ?? "").trim();
    setVisibleByCol((prev) => ({ ...prev, [k]: (prev[k] ?? PAGE_SIZE) + PAGE_SIZE }));
  };

  const resetExpandedPagination = () => setExpandedVisible(PAGE_SIZE);
  const showMoreExpanded = () => setExpandedVisible((n) => n + PAGE_SIZE);

  // Fetch filtros (idêntico ao exemplo)
  useEffect(() => {
    const run = async () => {
      try {
        const [mRes, gRes] = await Promise.all([fetch(`${urlGeral}materials/`), fetch(`${urlGeral}legal-guardians/`)]);
        const mJson = await mRes.json();
        const gJson = await gRes.json();
        setMaterials(mJson?.materials ?? []);
        setGuardians(gJson?.legal_guardians ?? []);
      } catch {
        toast.error("Falha ao carregar filtros");
      }
    };
    run();
  }, [urlGeral]);

  // Fetch users comissão
  const fetchCommissionUsers = useCallback(async () => {
    try {
      const res = await fetch(`${urlGeral}roles/${ROLE_COMISSAO_ID}/users`);
      if (!res.ok) throw new Error();
      const json: RoleUsersResponse = await res.json();
      setCommissionUsers(json?.users ?? []);
    } catch {
      toast.error("Falha ao carregar membros da comissão");
    }
  }, [urlGeral]);

  // Fetch catálogo (com filtros + workflow_status=REVIEWER_COMISSION)
  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("workflow_status", WF_FILTER);
      if (materialId) params.set("material_id", materialId);
      if (guardianId) params.set("legal_guardian_id", guardianId);
      if (unitId) params.set("unit_id", unitId);
      if (agencyId) params.set("agency_id", agencyId);
      if (sectorId) params.set("sector_id", sectorId);
      if (locationId) params.set("location_id", locationId);

      const res = await fetch(`${urlGeral}catalog/?${params.toString()}`);
      if (!res.ok) throw new Error();
      const json: CatalogResponse = await res.json();
      setEntries(json?.catalog_entries ?? []);
    } catch {
      toast.error("Falha ao carregar catálogo");
    } finally {
      setLoading(false);
    }
  }, [urlGeral, materialId, guardianId, unitId, agencyId, sectorId, locationId]);

  useEffect(() => {
    fetchCommissionUsers();
  }, [fetchCommissionUsers]);

  useEffect(() => {
    setExpandedColumn(null);
    fetchCatalog();
  }, [fetchCatalog, tab]);

  // Atualiza URL com filtros (idêntico)
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

  // Filtro q (client) (idêntico)
  const filteredEntries = useMemo(() => {
    if (!q.trim()) return entries;
    const term = q.trim().toLowerCase();
    return entries.filter((e) => {
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
  }, [entries, q]);

  // Board agrupado por revisor
  useEffect(() => {
    setBoard(groupByReviewer(filteredEntries, columns, commissionUsers));
  }, [filteredEntries, columns, commissionUsers]);

  // Drag & Drop -> PUT reviewers
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;

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

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    const fromKey = (source.droppableId ?? "").trim();
    const toKey = (destination.droppableId ?? "").trim();
    if (fromKey === toKey) return;

    const fromList = board[fromKey] ?? [];
    const entry = fromList[source.index];
    if (!entry) return;

    const prevBoard = board;
    const prevEntries = entries;

    // Otimismo: atualiza reviewers no último histórico relevante
    const reviewersNew = toKey === COL_SEM_REVISOR ? [] : [toKey];

    const patchEntry = (it: CatalogEntry): CatalogEntry => {
      const hist = [...(it.workflow_history ?? [])];
      // Procuramos a última ocorrência que carrega reviewers
      const idx = [...hist]
        .map((h, i) => ({ h, i }))
        .filter(({ h }) => (h.workflow_status ?? "").trim() === WF_DETAIL_SOURCE_A)
        .map(({ i }) => i)
        .pop();

      if (idx == null) return it;

      const last = hist[idx];
      const newDetail = { ...(last.detail ?? {}), reviewers: reviewersNew };
      const updated = { ...last, detail: newDetail };
      hist[idx] = updated;

      return { ...it, workflow_history: hist };
    };

    const patched = patchEntry(entry);

    // Remove da origem e adiciona no destino no board
    const newFrom = Array.from(prevBoard[fromKey] ?? []);
    const i = newFrom.findIndex((x) => x.id === entry.id);
    if (i >= 0) newFrom.splice(i, 1);

    const newTo = [patched, ...Array.from(prevBoard[toKey] ?? [])];

    setBoard({ ...prevBoard, [fromKey]: newFrom, [toKey]: newTo });
    setEntries((old) => old.map((it) => (it.id === entry.id ? patched : it)));

    // PUT real
    const ok = await putReviewers(entry, reviewersNew);
    if (!ok) {
      // rollback
      setBoard(prevBoard);
      setEntries(prevEntries);
    }
  };

  const handleConfirmMove = async () => {
    // Aqui, nenhuma coluna exige justificativa; modal mantido por paridade visual.
    setMoveModalOpen(false);
    setMoveTarget({});
    setJustificativa("");
    setExtraValues({});
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      if (snapshotBoard && snapshotEntries) {
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
  }, []); // eslint-disable-line

  const materialItems: ComboboxItem[] = (materials ?? []).map((m) => ({ id: m.id, code: m.material_code, label: m.material_name || m.material_code }));
  const guardianItems: ComboboxItem[] = (guardians ?? []).map((g) => ({ id: g.id, code: g.legal_guardians_code, label: g.legal_guardians_name || g.legal_guardians_code }));

  useEffect(() => {
    if (expandedColumn !== null) resetExpandedPagination();
  }, [expandedColumn]);

  const getItemsForExport = (colKey?: string, onlyVisible = false) => {
    let items: CatalogEntry[] = [];
    if (colKey) {
      const all = board[colKey] ?? [];
      const isExpanded = expandedColumn === colKey;
      items = onlyVisible && isExpanded ? all.slice(0, expandedVisible) : all;
    } else {
      items = filteredEntries;
    }
    return items.map(({ workflow_history, ...rest }) => rest);
  };

  const handleDownloadJson = (colKey?: string, onlyVisible = false) => {
    try {
      const jsonData = getItemsForExport(colKey, onlyVisible);
      const csvData = convertJsonToCsv(jsonData);
      const blob = new Blob([csvData], { type: "text/csv;charset=windows-1252;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const colName = (colKey && (columns.find((c) => c.key === colKey)?.name || colKey)) || "todos";
      link.download = `itens_${colName.replace(/\s+/g, "_").toLowerCase()}${onlyVisible ? "_visiveis" : ""}.csv`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Falha ao gerar CSV");
    }
  };

  const stripWorkflow = (obj: any) => {
    if (obj && typeof obj === "object" && "workflow_history" in obj) {
      const { workflow_history, ...rest } = obj;
      return rest;
    }
    return obj;
  };

  const flattenObject = (obj: any, prefix = "", out: Record<string, any> = {}): Record<string, any> => {
    if (obj == null) return out;
    if (Array.isArray(obj)) {
      const key = prefix.slice(0, -1);
      if (obj.every((v) => typeof v !== "object" || v === null)) out[key] = obj.join("|");
      else if (/(\.|^)images$/.test(key)) out[key] = obj.map((it: any) => it?.file_path ?? JSON.stringify(it)).join("|");
      else out[key] = JSON.stringify(obj);
      return out;
    }
    if (typeof obj === "object") {
      for (const [k, v] of Object.entries(obj)) {
        if (k === "workflow_history") continue;
        flattenObject(v, `${prefix}${k}.`, out);
      }
      return out;
    }
    out[prefix.slice(0, -1)] = obj;
    return out;
  };

  const convertJsonToCsv = (data: any[]): string => {
    const flattened = data.map((d) => flattenObject(stripWorkflow(d)));
    const headerSet = new Set<string>();
    flattened.forEach((row) => Object.keys(row).forEach((k) => headerSet.add(k)));
    const headers = Array.from(headerSet).sort();
    const esc = (val: unknown) => {
      const s = String(val ?? "");
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(";"), ...flattened.map((row) => headers.map((h) => esc((row as any)[h])).join(";"))];
    return lines.join("\n");
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
  const scrollLeft = () => scrollAreaRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () => scrollAreaRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [selectedPreset, setSelectedPreset] = useState<string>("");

  // ====== token já usado acima ======

  return (
    <div className="p-4 md:p-8 pt-0 md:pt-0 gap-8 flex flex-col h-full">

      <main className="flex flex-col gap-4  flex-1 min-h-0 overflow-hidden">
   

        {/* Filtros */}
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
                <div ref={scrollAreaRef} className="overflow-x-auto scrollbar-hide" onScroll={checkScrollability}>
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

                    <Combobox items={materialItems} value={materialId} onChange={(v) => setMaterialId(v)} placeholder="Material" />
                    <Combobox items={guardianItems} value={guardianId} onChange={(v) => setGuardianId(v)} placeholder="Responsável" />

                    <Separator className="h-8" orientation="vertical" />

                    {/* ====== NOVOS SELECTS EM CADEIA ====== */}
                    <Combobox
                      items={(units ?? []).map((u) => ({ id: u.id, code: u.unit_code, label: u.unit_name || u.unit_code }))}
                      value={unitId}
                      onChange={(v) => setUnitId(v)}
                      placeholder="Unidade"
                    />

                    <Combobox
                      items={(agencies ?? []).map((a) => ({ id: a.id, code: a.agency_code, label: a.agency_name || a.agency_code }))}
                      value={agencyId}
                      onChange={(v) => setAgencyId(v)}
                      placeholder={"Organização"}
                      disabled={!unitId}
                    />

                    <Combobox
                      items={(sectors ?? []).map((s) => ({ id: s.id, code: s.sector_code, label: s.sector_name || s.sector_code }))}
                      value={sectorId}
                      onChange={(v) => setSectorId(v)}
                      placeholder={"Setor"}
                      disabled={!agencyId}
                    />

                    <Combobox
                      items={(locations ?? []).map((l) => ({ id: l.id, code: l.location_code, label: l.location_name || l.location_code }))}
                      value={locationId}
                      onChange={(v) => setLocationId(v)}
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

            {/* ====== Membros do cargo (componente igual ao exemplo) ====== */}
            <RoleMembers
              roleId={ROLE_COMISSAO_ID}
              title="Comissão de desfazimento"
            />
          </div>
        )}

        {/* Board / Expandido */}
        {expandedColumn === null ? (
          <div
            className={`relative flex-1 ${
              showFilters ? "max-h-[calc(100vh-248px)] sm:max-h-[calc(100vh-306px)]" : "max-h-[calc(100vh-248px)] sm:max-h-[calc(100vh-250px)] "
            }`}
          >
            <div className="h-full overflow-x-auto overflow-y-hidden pb-2">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 min-w-[980px] h-full">
                  {columns.map((col) => {
                    const items = board[col.key] ?? [];
                    const take = visibleByCol[col.key] ?? PAGE_SIZE;
                    const slice = items.slice(0, take);
                    const meta = WORKFLOW_STATUS_META[col.key] ?? { Icon: HelpCircle, colorClass: "text-zinc-500" };
                    const { Icon } = meta;

                    return (
                      <Alert key={col.key} className="w-[320px] min-w-[320px] h-full flex flex-col min-h-0 overflow-hidden">
                        <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Icon size={16} />
                              <span title={col.name} className="font-semibold truncate">
                                {col.name}
                              </span>
                            </div>
                            <Badge variant="outline" className="shrink-0">
                              {items.length}
                            </Badge>
                          </div>
                          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => setExpandedColumn(col.key)} title="Expandir coluna">
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <Separator className="mb-2" />

                        <Droppable droppableId={col.key}>
                          {(provided, snapshot) => (
                            <div className="flex-1 min-h-0">
                              <ScrollArea
                                className={`h-full relative flex ${
                                  snapshot.isDraggingOver ? "bg-neutral-200 dark:bg-neutral-800 rounded-md" : ""
                                } [&>[data-radix-scroll-area-viewport]]:w-full [&>[data-radix-scroll-area-viewport]]:max-w-full [&>[data-radix-scroll-area-viewport]]:min-w-0 [&>[data-radix-scroll-area-viewport]>div]:w-full [&>[data-radix-scroll-area-viewport]>div]:max-w-full [&>[data-radix-scroll-area-viewport]>div]:min-w-0`}
                              >
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="flex flex-col gap-2 min-w-0 w-full max-w-full pt-2 pr-1"
                                >
                                  {loading && !items.length ? (
                                    <>
                                      <Skeleton className="aspect-square w-full rounded-md" />
                                      <Skeleton className="aspect-square w-full rounded-md" />
                                    </>
                                  ) : null}

                                  {slice.map((entry, idx) => (
                                    <div key={entry.id} className="min-w-0 w-full max-w-full overflow-hidden">
                                      <CardItemDropdown entry={entry} index={idx} />
                                    </div>
                                  ))}

                                  {provided.placeholder}

                                  {items.length > slice.length ? (
                                    <div className="pt-2">
                                      <Button variant="outline" className="w-full" onClick={() => showMoreCol(col.key)}>
                                        <Plus size={16} /> Mostrar mais
                                      </Button>
                                    </div>
                                  ) : null}
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
          </div>
        ) : (
          <div className="m-0">
            {columns.map((col) => {
              if (expandedColumn !== col.key) return null;
              const items = board[col.key] ?? [];
              const slice = items.slice(0, expandedVisible);
              const meta = WORKFLOW_STATUS_META[col.key] ?? { Icon: HelpCircle, colorClass: "text-zinc-500" };
              const { Icon } = meta;
              return (
                <div key={col.key}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Icon size={16} />
                        <h2 className="text-lg font-semibold">{col.name}</h2>
                      </div>

                      <Badge variant="outline">{items.length}</Badge>
                    </div>

                    <div className="flex gap-3">
                      <Button size={"sm"} variant="outline" onClick={() => handleDownloadJson(col.key)}>
                        <Download size={16} /> Baixar resultado
                      </Button>
                      <Button size={"sm"} onClick={() => setExpandedColumn(null)}>
                        <ChevronLeft size={16} />
                        Voltar ao quadro
                      </Button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {items.map((item) => (
                      <ItemPatrimonio key={item.id} {...item} onPromptDelete={() => {}} />
                    ))}
                  </div>

                  {items.length > slice.length ? (
                    <div className="flex justify-center mt-8">
                      <Button onClick={showMoreExpanded}>
                        <Plus size={16} /> Mostrar mais
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de mudança de revisor (mantido para paridade, não exigido) */}
      <Dialog open={moveModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Confirmar reatribuição</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Você está reatribuindo o item{" "}
              <strong>
                {moveTarget.entry?.asset?.material.material_name ?? moveTarget.entry?.id} (
                {`${moveTarget.entry?.asset?.asset_code}-${moveTarget.entry?.asset?.asset_check_digit}`})
              </strong>{" "}
              de: <strong>{columns.find((c) => c.key === moveTarget.fromKey)?.name ?? moveTarget.fromKey}</strong> para:{" "}
              <strong>{columns.find((c) => c.key === moveTarget.toKey)?.name ?? moveTarget.toKey}</strong>
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="space-y-4">
            {/* Mantemos a área por compatibilidade visual */}
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
                    onChange={(e) => setExtraValues((s) => ({ ...s, [f.name]: e.target.value }))}
                  />
                ) : (
                  <Input
                    id={f.name}
                    placeholder={f.placeholder}
                    value={extraValues[f.name] ?? ""}
                    onChange={(e) => setExtraValues((s) => ({ ...s, [f.name]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => handleModalOpenChange(false)}>
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
