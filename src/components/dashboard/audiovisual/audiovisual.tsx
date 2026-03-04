import { Helmet } from "react-helmet";
import {
  ChevronDown,
  ChevronLeft,
  Maximize2,
  Plus,
  Trash,
  SlidersHorizontal,
  ChevronRight,
  LucideIcon,
  HelpCircle,
  Check,
  X,
  Loader,
  Eye,
  Calendar,
  SquareKanban,
  BookMarked,
  LucideAlarmClockOff,
  CalendarCheck,
  Wrench,
} from "lucide-react";
import { Button } from "../../ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/context";
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
} from "../../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../ui/command";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { Skeleton } from "../../ui/skeleton";
import { toast } from "sonner";
import { Alert } from "../../ui/alert";
import { ArrowUUpLeft, EyeClosed, MagnifyingGlass } from "phosphor-react";
import { CardItemDropdown } from "./card-item-dropdown";
import { ItemPatrimonio } from "../../homepage/components/item-patrimonio";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { RoleMembers } from "../cargos-funcoes/components/role-members";
import { usePermissions } from "../../permissions";
import { useIsMobile } from "../../../hooks/use-mobile";
import { DownloadPdfButton } from "../../download/download-pdf-button";
import LoanCalendar from "./calendario";
import { ItemPatrimonioKanban } from "../../homepage/components/item-patrimonio-kanban";

/* ========================= Tipos do backend ========================= */
type UUID = string;

type LegalGuardian = {
  legal_guardians_code: string;
  legal_guardians_name: string;
  id: UUID;
};

/* ========================= Tipos hierarquia local ========================= */
type UnitDTO = {
  id: UUID;
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
};

type AgencyDTO = {
  id: UUID;
  agency_name: string;
  agency_code: string;
};

type SectorDTO = {
  id: UUID;
  sector_name: string;
  sector_code: string;
};

type LocationDTO = {
  id: UUID;
  location_name: string;
  location_code: string;
};

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

type ReviewerRef = {
  id: UUID;
  username: string;
};

interface WorkflowDetail {
  inicio?: string;
  fim?: string;
  observation?: string;
}

type WorkflowHistoryItem = {
  workflow_status: string;
  detail?: WorkflowDetail;
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

/* ========================= Board ========================= */
export const WORKFLOWS = {
  calendario: [
    {
      key: "REVIEW_REQUESTED_VITRINE",
      name: "Nenhum",
    },
  ],
  emprestimo: [
    {
      key: "AUDIOVISUAL_ANUNCIADO",
      name: "Disponíveis",
    },
    { key: "AUDIOVISUAL_EMPRESTIMO", name: "Empréstimo em breve" },
    { key: "AUDIOVISUAL_ATRASADO", name: "Atrasado" },
    { key: "AUDIOVISUAL_QUEBRADO", name: "Quebrado" },
  ],
} as const;

type BoardKind = keyof typeof WORKFLOWS;

export const WORKFLOW_STATUS_META: Record<
  string,
  { Icon: LucideIcon; colorClass: string }
> = {
  AUDIOVISUAL_ANUNCIADO: { Icon: BookMarked, colorClass: "text-amber-500" },
  AUDIOVISUAL_EMPRESTIMO: { Icon: CalendarCheck, colorClass: "text-blue-500" },
  AUDIOVISUAL_ATRASADO: {
    Icon: LucideAlarmClockOff,
    colorClass: "text-green-600",
  },
  AUDIOVISUAL_QUEBRADO: { Icon: Wrench, colorClass: "text-indigo-500" },
};

/* ========================= Utils de board ========================= */
const lastWorkflow = (entry: CatalogEntry): WorkflowHistoryItem | undefined => {
  const hist = entry.workflow_history ?? [];
  if (!hist.length) return undefined;
  return hist[0];
};

/* ========================= Combobox ========================= */
export type ComboboxItem = { id: UUID; code?: string; label: string };

export function Combobox({
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
          className={
            triggerClassName ?? "w-[200px] min-w-[200px] justify-between"
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
                  <Trash size={16} />
                  Limpar filtro
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

/* ========================= Componente Principal ========================= */
export function Audiovisual() {
  const { urlGeral } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;

  // ====== helper de debounce ======
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

  // Fetch listas hierarquia
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
    [urlGeral, token],
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
    [urlGeral, token],
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
    [urlGeral, token],
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

  const isMobile = useIsMobile();
  const [tab, setTab] = useState<BoardKind>("emprestimo");
  const [showFilters, setShowFilters] = useState(isMobile ? false : true);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [guardians, setGuardians] = useState<LegalGuardian[]>([]);
  const [materialId, setMaterialId] = useState<UUID | null>(null);
  const [guardianId, setGuardianId] = useState<UUID | null>(null);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q);
    }, 1000); // tempo do debounce (ms)

    return () => clearTimeout(handler);
  }, [q]);

  // Catálogo (agora organizado por coluna)
  const [loading, setLoading] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState<Record<string, boolean>>(
    {},
  );
  const [entries, setEntries] = useState<CatalogEntry[]>([]);

  const columns = useMemo(
    () => WORKFLOWS[tab].map((c) => ({ ...c, key: (c.key ?? "").trim() })),
    [tab],
  );

  const [board, setBoard] = useState<Record<string, CatalogEntry[]>>({});
  const [itemsFlat, setItemsFlat] = useState<CatalogEntry[]>([]);
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Snapshots
  const [snapshotBoard, setSnapshotBoard] = useState<Record<
    string,
    CatalogEntry[]
  > | null>(null);
  const [snapshotEntries, setSnapshotEntries] = useState<CatalogEntry[] | null>(
    null,
  );

  // Paginação - agora com offset por coluna
  // Paginação
  const PAGE_SIZE = 24;
  const [totalByCol, setTotalByCol] = useState<Record<string, number>>({});
  const [expandedVisible, setExpandedVisible] = useState<number>(PAGE_SIZE);

  const showMoreCol = (key: string) => {
    const k = (key ?? "").trim();
    const currentItems = board[k]?.length ?? 0;
    const newOffset = currentItems;

    // Busca mais itens para esta coluna
    fetchColumnData(k, newOffset, true);
  };
  const resetExpandedPagination = () => {
    // Só controla quantos aparecem na visão expandida,
    // não mexe mais em board nem refaz fetch.
    setExpandedVisible(PAGE_SIZE);
  };

  const showMoreExpanded = () => {
    if (!expandedColumn) return;
    const newVisible = expandedVisible + PAGE_SIZE;
    setExpandedVisible(newVisible);

    // Se precisar buscar mais dados
    const currentItems = board[expandedColumn]?.length ?? 0;
    if (currentItems < newVisible) {
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

  // Fetch por coluna (nova lógica)
  const fetchColumnData = useCallback(
    async (workflowStatus: string, offset = 0, append = false) => {
      if (!workflowStatus) return;

      try {
        setLoadingColumns((prev) => ({ ...prev, [workflowStatus]: true }));

        const params = new URLSearchParams();
        params.set("workflow_status", workflowStatus);
        params.set("offset", offset.toString());
        params.set("limit", PAGE_SIZE.toString());

        // Filtros adicionais
        if (materialId) params.set("material_id", materialId);
        if (guardianId) params.set("legal_guardian_id", guardianId);
        if (unitId) params.set("unit_id", unitId);
        if (agencyId) params.set("agency_id", agencyId);
        if (sectorId) params.set("sector_id", sectorId);
        if (locationId) params.set("location_id", locationId);
        if (debouncedQ) params.set("q", debouncedQ);

        const res = await fetch(`${urlGeral}catalog/?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error();

        const json: CatalogResponse & { total?: number } = await res.json();
        const newEntries = json?.catalog_entries ?? [];

        setItemsFlat((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          const uniqueNewEntries = newEntries.filter(
            (e) => !existingIds.has(e.id),
          );
          return [...prev, ...uniqueNewEntries];
        });

        // Atualiza total
        if (typeof json.total === "number") {
          setTotalByCol(
            (prev) =>
              ({ ...prev, [workflowStatus as string]: json.total }) as Record<
                string,
                number
              >,
          );
        }

        if (
          workflowStatus === "AUDIOVISUAL_ANUNCIADO" ||
          workflowStatus === "AUDIOVISUAL_EMPRESTIMO"
        ) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const result = newEntries.reduce<{
            disponivel: CatalogEntry[];
            emprestimo: CatalogEntry[];
          }>(
            (acc, entry) => {
              const emprestimos = entry.workflow_history.filter(
                (h) => h.workflow_status === "AUDIOVISUAL_EMPRESTIMO",
              );

              const seraEmprestado =
                (emprestimos.length > 0 &&
                  emprestimos.every((h) => {
                    // 1. Se não tiver 'detail', retorna false (considera inválido para a lógica)
                    if (!h.detail) return false;

                    // 2. CORREÇÃO: Fallback para 'created_at'
                    // Se h.detail.inicio for undefined, usa h.created_at (que é obrigatório na interface)
                    const dataReferencia = h.detail.inicio ?? h.created_at;

                    const dataInicio = new Date(dataReferencia);

                    return dataInicio < today;
                  })) ||
                emprestimos.length === 0;
              // ------------------------------------

              if (seraEmprestado) {
                acc.disponivel.push(entry);
              } else {
                acc.emprestimo.push(entry);
              }

              return acc;
            },
            { disponivel: [], emprestimo: [] },
          );

          // Agora você pode acessar os dois arrays separadamente:
          const { disponivel, emprestimo } = result;

          setBoard((prev) => {
            const currentList = prev["AUDIOVISUAL_ANUNCIADO"] ?? [];

            // 1. Cria um conjunto com os IDs que JÁ estão na coluna
            const existingIds = new Set(currentList.map((e) => e.id));

            // 2. Filtra os novos itens, mantendo apenas os que NÃO tem ID na lista atual
            const uniqueNewEntries = disponivel.filter(
              (e) => !existingIds.has(e.id),
            );

            return {
              ...prev,
              ["AUDIOVISUAL_ANUNCIADO"]: [
                ...currentList, // Mantém os antigos
                ...uniqueNewEntries, // Adiciona apenas os realmente novos
              ],
            };
          });

          (prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const filtered = disponivel.filter((e) => !existingIds.has(e.id));
            return [...prev, ...filtered];
          };

          setBoard((prev) => {
            const currentList = prev["AUDIOVISUAL_EMPRESTIMO"] ?? [];

            // 1. Cria um conjunto com os IDs que JÁ estão na coluna
            const existingIds = new Set(currentList.map((e) => e.id));

            // 2. Filtra os novos itens, mantendo apenas os que NÃO tem ID na lista atual
            const uniqueNewEntries = emprestimo.filter(
              (e) => !existingIds.has(e.id),
            );

            return {
              ...prev,
              ["AUDIOVISUAL_EMPRESTIMO"]: [
                ...currentList, // Mantém os antigos
                ...uniqueNewEntries, // Adiciona apenas os realmente novos
              ],
            };
          });

          setEntries((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const filtered = emprestimo.filter((e) => !existingIds.has(e.id));
            return [...prev, ...filtered];
          });
        } else {
          // Atualiza entries globais e board
          if (append) {
            // Adiciona aos existentes
            setBoard((prev) => ({
              ...prev,
              [workflowStatus]: [
                ...(prev[workflowStatus] ?? []),
                ...newEntries,
              ],
            }));
            setEntries((prev) => {
              const existingIds = new Set(prev.map((e) => e.id));
              const filtered = newEntries.filter((e) => !existingIds.has(e.id));
              return [...prev, ...filtered];
            });
          } else {
            // Substitui
            setBoard((prev) => ({
              ...prev,
              [workflowStatus]: newEntries,
            }));
            setEntries((prev) => {
              const otherCols = prev.filter(
                (e) => lastWorkflow(e)?.workflow_status !== workflowStatus,
              );
              return [...otherCols, ...newEntries];
            });
          }
        }
      } catch (err) {
        console.error("Erro ao buscar coluna:", err);
        toast.error(`Falha ao carregar ${workflowStatus}`);
      } finally {
        setLoadingColumns((prev) => ({ ...prev, [workflowStatus]: false }));
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
      debouncedQ,
    ],
  );

  // Fetch inicial: busca todas as colunas
  const fetchAllColumns = useCallback(async () => {
    setLoading(true);
    setBoard({});
    setEntries([]);

    try {
      // 1. Cria o array de promessas para todas as colunas
      const promises = columns.map((col) => {
        const key = (col.key ?? "").trim();

        // Se não tiver chave, retorna promessa resolvida (pula sem erro)
        if (!key) return Promise.resolve();

        // Dispara a requisição imediatamente
        return fetchColumnData(key, 0, false);
      });

      // 2. Aguarda todas terminarem (paralelismo)
      await Promise.all(promises);
    } finally {
      setLoading(false);
    }
  }, [columns, fetchColumnData]);

  useEffect(() => {
    setExpandedColumn(null);
    fetchAllColumns();
  }, [fetchAllColumns, tab]);

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
    if (debouncedQ) params.set("q", debouncedQ);
    else params.delete("q");
    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    materialId,
    guardianId,
    unitId,
    agencyId,
    sectorId,
    locationId,
    debouncedQ,
  ]);

  const boardScrollRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const pointerXRef = useRef<number>(0);

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

    if (dx !== 0) el.scrollBy({ left: dx, behavior: "auto" });
    rafIdRef.current = requestAnimationFrame(autoScrollTick);
  }, []);

  const colRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const { hasAnunciarItem, hasCargosFuncoes } = usePermissions();

  useEffect(() => {
    const handler = (e: any) => {
      const id = e?.detail?.id as string | undefined;
      if (!id) return;
      setEntries((prev) => prev.filter((it) => it.id !== id));
    };
    window.addEventListener("catalog:deleted" as any, handler as any);
    return () =>
      window.removeEventListener("catalog:deleted" as any, handler as any);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as
        | { id?: string; newStatus?: string }
        | undefined;
      const id = detail?.id;
      const newStatus = detail?.newStatus?.trim();
      if (!id || !newStatus) return;

      setEntries((prev) => {
        let touched = false;
        const next = prev.map((it) => {
          if (it.id !== id) return it;
          const current = it.workflow_history?.[0]?.workflow_status?.trim();
          if (current === newStatus) return it;
          touched = true;

          const newHistoryItem: WorkflowHistoryItem = {
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,
            catalog_id: it.id,
            workflow_status: newStatus,
            detail: {},
            created_at: new Date().toISOString(),
            user: it.user ?? null,
          };

          return {
            ...it,
            workflow_history: [newHistoryItem, ...(it.workflow_history ?? [])],
          };
        });
        return touched ? next : prev;
      });
    };
    window.addEventListener("catalog:workflow-updated" as any, handler as any);
    return () =>
      window.removeEventListener(
        "catalog:workflow-updated" as any,
        handler as any,
      );
  }, []);

  const ROLE_COMISSAO_ID = import.meta.env.VITE_ID_COMISSAO_PERMANENTE;

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

  const [isImage, setIsImage] = useState(false);

  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full">
      <Helmet>
        <title>Empréstimo Audiovisual | Sistema Patrimônio</title>
        <meta
          name="description"
          content="Empréstimo Audiovisual temporário | Sistema Patrimônio"
        />
      </Helmet>

      <main className="flex flex-col gap-4 flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-4 justify-between">
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
                Empréstimo Audiovisual
              </h1>
            </div>
            {hasAnunciarItem && isMobile ? (
              <Button
                size="sm"
                onClick={() =>
                  navigate("/dashboard/emprestimo-audiovisual", {
                    replace: true,
                  })
                }
              >
                <Plus size={16} className="" />
                Anunciar item
              </Button>
            ) : (
              <></>
            )}
          </div>
          <div className="flex gap-2 items-center mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters((s) => !s)}
            >
              <SlidersHorizontal size={16} />
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>

            <div className="flex">
              <Button
                size="sm"
                onClick={() => {
                  setTab("emprestimo");
                  setExpandedColumn(null);
                }}
                variant={tab === "emprestimo" ? "default" : "outline"}
                className="rounded-r-none"
              >
                <SquareKanban size={16} className="" />
                Empréstimo
              </Button>
              <Button
                onClick={() => {
                  setTab("calendario");
                  setExpandedColumn(null);
                }}
                size="sm"
                className="rounded-l-none"
                variant={tab === "calendario" ? "default" : "outline"}
              >
                <Calendar size={16} className="" />
                Calendário
              </Button>
            </div>

            {isMobile ? (
              <></>
            ) : (
              <Separator orientation="vertical" className="h-8 mx-2" />
            )}

            {hasAnunciarItem && !isMobile ? (
              <Button
                size="sm"
                onClick={() =>
                  navigate("/dashboard/emprestimo-audiovisual", {
                    replace: true,
                  })
                }
              >
                <Plus size={16} className="" />
                Anunciar item
              </Button>
            ) : (
              <></>
            )}
          </div>
        </div>

        {tab === "emprestimo" ? (
          <>
            {/* Filtros */}
            {showFilters && !isMobile && (
              <div className="flex gap-4 items-center">
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
                        <Alert className="w-[300px] min-w-[300px] py-0 h-10 rounded-md flex gap-3 items-center">
                          <div>
                            <MagnifyingGlass
                              size={16}
                              className="text-gray-500"
                            />
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
                          onChange={(v) => setSectorId(v)}
                          onSearch={setSectorQ}
                          isLoading={loadingSectors}
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
                          onChange={(v) => setLocationId(v)}
                          onSearch={setLocationQ}
                          isLoading={loadingLocations}
                          placeholder="Local de guarda"
                          disabled={!sectorId}
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                        >
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
                    {isImage ? <Eye size={16} /> : <EyeClosed size={16} />}
                  </Button>
                )}
              </div>
            )}

            {showFilters && isMobile && (
              <div className="flex flex-col gap-4 items-center">
                <div className="relative grid grid-cols-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`absolute left-0 z-10 h-10 w-5 p-0 ${
                      !canScrollLeft ? "opacity-30 cursor-not-allowed" : ""
                    }`}
                    onClick={scrollLeft}
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
                        <Alert className="w-auto min-w-[250px] py-0 h-10 rounded-md flex gap-3 items-center">
                          <div>
                            <MagnifyingGlass
                              size={16}
                              className="text-gray-500"
                            />
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
                          onChange={(v) => setSectorId(v)}
                          onSearch={setSectorQ}
                          isLoading={loadingSectors}
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
                          onChange={(v) => setLocationId(v)}
                          onSearch={setLocationQ}
                          isLoading={loadingLocations}
                          placeholder="Local de guarda"
                          disabled={!sectorId}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className={`absolute right-0 z-10 h-10 w-5 p-0 rounded-md ${
                      !canScrollRight ? "opacity-30 cursor-not-allowed" : ""
                    }`}
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
                <div className="flex gap-3">
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
                      className="h-9"
                    >
                      {isImage ? <Eye size={16} /> : <EyeClosed size={16} />}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <Trash size={16} />
                    Limpar filtros
                  </Button>
                </div>
              </div>
            )}

            {/* Board / Expandido */}
            {expandedColumn === null ? (
              <div
                className={`relative flex-1 ${
                  showFilters
                    ? "max-h-[calc(100vh-248px)] sm:max-h-[calc(100vh-306px)]"
                    : "max-h-[calc(100vh-248px)] sm:max-h-[calc(100vh-250px)] "
                }`}
              >
                <div
                  ref={boardScrollRef}
                  className="h-full overflow-x-auto overflow-y-hidden pb-2"
                >
                  {isMobile ? (
                    <div className="flex flex-col gap-4 w-full h-full overflow-y-auto pb-10">
                      {columns.map((col) => {
                        const items = board[col.key] ?? [];
                        const meta = WORKFLOW_STATUS_META[col.key] ?? {
                          Icon: HelpCircle,
                          colorClass: "text-zinc-500",
                        };
                        const { Icon } = meta;
                        const totalForCol =
                          statusCounts[col.key] ?? items.length;

                        return (
                          <Alert
                            key={col.key}
                            ref={(el) => (colRefs.current[col.key] = el)}
                            className="h-[320px] min-h-[320px] w-full flex flex-col min-w-0 overflow-hidden mb-8"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Icon size={16} />
                                  <span
                                    title={col.name}
                                    className="font-semibold truncate"
                                  >
                                    {col.name}
                                  </span>
                                </div>
                                <Badge variant="outline" className="shrink-0">
                                  {totalForCol}
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => setExpandedColumn(col.key)}
                                title="Expandir coluna"
                              >
                                <Maximize2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <Separator className="mb-2" />

                            <div className="flex-1 min-h-0">
                              <div className="flex flex-col min-h-0 w-full max-w-full relative h-full">
                                <ScrollArea className="h-full relative flex [&>[data-radix-scroll-area-viewport]]:w-full [&>[data-radix-scroll-area-viewport]]:max-w-full [&>[data-radix-scroll-area-viewport]]:min-w-0 [&>[data-radix-scroll-area-viewport]>div]:w-full [&>[data-radix-scroll-area-viewport]>div]:max-w-full [&>[data-radix-scroll-area-viewport]>div]:min-w-0">
                                  {(loading || loadingColumns[col.key]) &&
                                  !items.length ? (
                                    <>
                                      <Skeleton className="aspect-square w-full rounded-md" />
                                      <Skeleton className="aspect-square mt-2 w-full rounded-md" />
                                      <Skeleton className="aspect-square mt-2 w-full rounded-md" />
                                    </>
                                  ) : null}

                                  {items.map((entry, idx) => (
                                    <div
                                      key={entry.id}
                                      className="min-w-0 mb-2 w-full max-w-full overflow-hidden"
                                    >
                                      {/* Chamada direta do componente de UI, sem o wrapper de Draggable */}
                                      <ItemPatrimonioKanban
                                        {...entry}
                                        isImage={isImage}
                                      />
                                    </div>
                                  ))}

                                  {(() => {
                                    const totalFromTotals = totalByCol[col.key];
                                    const totalFromStats =
                                      statusCounts[col.key];

                                    let effectiveTotal: number | undefined;

                                    if (
                                      typeof totalFromTotals === "number" &&
                                      totalFromTotals >= items.length
                                    ) {
                                      effectiveTotal = totalFromTotals;
                                    } else if (
                                      typeof totalFromStats === "number" &&
                                      totalFromStats >= items.length
                                    ) {
                                      effectiveTotal = totalFromStats;
                                    }

                                    const loaded = items.length;
                                    const isInitialLoading =
                                      (loading || loadingColumns[col.key]) &&
                                      loaded === 0;

                                    if (isInitialLoading) return null;

                                    let hasMore = false;

                                    if (effectiveTotal != null) {
                                      hasMore = loaded < effectiveTotal;
                                    } else if (!q.trim()) {
                                      hasMore =
                                        loaded > 0 && loaded % PAGE_SIZE === 0;
                                    }

                                    if (!hasMore) return null;

                                    return (
                                      <div className="pt-2">
                                        <Button
                                          variant="outline"
                                          className="w-full"
                                          onClick={() => showMoreCol(col.key)}
                                          disabled={loadingColumns[col.key]}
                                        >
                                          {loadingColumns[col.key] ? (
                                            <>
                                              <Loader
                                                size={16}
                                                className="animate-spin"
                                              />
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
                                    );
                                  })()}

                                  <ScrollBar orientation="vertical" />
                                </ScrollArea>
                              </div>
                            </div>
                          </Alert>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex gap-4 min-w-[980px] h-full">
                      {columns.map((col) => {
                        const items = board[col.key] ?? [];
                        const slice = items.slice(0, expandedVisible);
                        const meta = WORKFLOW_STATUS_META[col.key] ?? {
                          Icon: HelpCircle,
                          colorClass: "text-zinc-500",
                        };
                        const { Icon } = meta;

                        const totalForCol =
                          statusCounts[col.key] ?? items.length;
                        return (
                          <Alert
                            key={col.key}
                            ref={(el) => (colRefs.current[col.key] = el)}
                            className="w-[320px] min-w-[320px] h-full flex flex-col min-h-0 overflow-hidden"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Icon size={16} />
                                  <span
                                    title={col.name}
                                    className="font-semibold truncate"
                                  >
                                    {col.name}
                                  </span>
                                </div>
                                <Badge variant="outline" className="shrink-0">
                                  {totalForCol}
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => setExpandedColumn(col.key)}
                                title="Expandir coluna"
                              >
                                <Maximize2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <Separator className="mb-2" />

                            <div className="flex-1 min-h-0">
                              {/* Removido o Droppable e a div de referência do DnD */}
                              <div className="flex flex-col min-h-0 w-full max-w-full relative h-full">
                                <ScrollArea className="h-full relative flex [&>[data-radix-scroll-area-viewport]]:w-full [&>[data-radix-scroll-area-viewport]]:max-w-full [&>[data-radix-scroll-area-viewport]]:min-w-0 [&>[data-radix-scroll-area-viewport]>div]:w-full [&>[data-radix-scroll-area-viewport]>div]:max-w-full [&>[data-radix-scroll-area-viewport]>div]:min-w-0">
                                  {(loading || loadingColumns[col.key]) &&
                                  !items.length ? (
                                    <>
                                      <Skeleton className="aspect-square w-full rounded-md" />
                                      <Skeleton className="aspect-square mt-2 w-full rounded-md" />
                                      <Skeleton className="aspect-square mt-2 w-full rounded-md" />
                                    </>
                                  ) : null}

                                  {items.map((entry, idx) => (
                                    <div
                                      key={entry.id}
                                      className="min-w-0 mb-2 w-full max-w-full overflow-hidden"
                                    >
                                      <CardItemDropdown
                                        entry={entry}
                                        index={idx}
                                        isImage={isImage}
                                      />
                                    </div>
                                  ))}

                                  {(() => {
                                    const totalFromTotals = totalByCol[col.key];
                                    const totalFromStats =
                                      statusCounts[col.key];

                                    let effectiveTotal: number | undefined;

                                    if (
                                      typeof totalFromTotals === "number" &&
                                      totalFromTotals >= items.length
                                    ) {
                                      effectiveTotal = totalFromTotals;
                                    } else if (
                                      typeof totalFromStats === "number" &&
                                      totalFromStats >= items.length
                                    ) {
                                      effectiveTotal = totalFromStats;
                                    }

                                    const loaded = items.length;
                                    const isInitialLoading =
                                      (loading || loadingColumns[col.key]) &&
                                      loaded === 0;

                                    if (isInitialLoading) return null;

                                    let hasMore = false;
                                    if (effectiveTotal != null) {
                                      hasMore = loaded < effectiveTotal;
                                    } else if (!q.trim()) {
                                      hasMore =
                                        loaded > 0 && loaded % PAGE_SIZE === 0;
                                    }

                                    if (!hasMore) return null;

                                    return (
                                      <div className="pt-2">
                                        <Button
                                          variant="outline"
                                          className="w-full"
                                          onClick={() => showMoreCol(col.key)}
                                          disabled={loadingColumns[col.key]}
                                        >
                                          {loadingColumns[col.key] ? (
                                            <>
                                              <Loader
                                                size={16}
                                                className="animate-spin"
                                              />
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
                                    );
                                  })()}

                                  <ScrollBar orientation="vertical" />
                                </ScrollArea>
                              </div>
                            </div>
                          </Alert>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="m-0">
                {columns.map((col) => {
                  if (expandedColumn !== col.key) return null;

                  const items = board[col.key] ?? [];
                  const slice = items.slice(0, expandedVisible);
                  const meta = WORKFLOW_STATUS_META[col.key] ?? {
                    Icon: HelpCircle,
                    colorClass: "text-zinc-500",
                  };
                  const { Icon } = meta;

                  // 👇 NOVO
                  const totalForCol = statusCounts[col.key] ?? items.length;

                  return (
                    <div key={col.key}>
                      <div
                        className={
                          isMobile
                            ? "flex flex-col items-center justify-between mb-4 mt-6"
                            : "flex items-center justify-between mb-4"
                        }
                      >
                        {isMobile ? (
                          <div className="w-full flex justify-start mb-8 pl-1">
                            <Button
                              size="sm"
                              onClick={() => setExpandedColumn(null)}
                              className="self-start"
                            >
                              <ChevronLeft size={16} />
                              Voltar ao quadro
                            </Button>
                          </div>
                        ) : (
                          <></>
                        )}
                        <div className="flex items-center gap-1 mr-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Icon size={16} />
                            <h2
                              className={
                                isMobile
                                  ? "text-base text-center font-semibold"
                                  : "text-lg font-semibold"
                              }
                            >
                              {col.name}
                            </h2>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              isMobile ? "w-6 items-center hidden" : ""
                            }
                          >
                            {totalForCol}
                          </Badge>
                        </div>

                        <div
                          className={
                            isMobile
                              ? "flex flex-row-reverse  gap-3 mt-4 "
                              : "flex gap-3"
                          }
                        >
                          <DownloadPdfButton
                            filters={{
                              material_id: materialId || undefined,
                              agency_id: agencyId || undefined,
                              unit_id: unitId || undefined,
                              legal_guardian_id: guardianId || undefined,
                              sector_id: locationId || undefined,
                              location_id: sectorId || undefined,
                              workflow_status: expandedColumn,
                            }}
                            label="Baixar PDF"
                            method="catalog"
                            size="sm"
                          />
                          {isMobile ? (
                            <></>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => setExpandedColumn(null)}
                            >
                              <ChevronLeft size={16} />
                              Voltar ao quadro
                            </Button>
                          )}
                        </div>
                      </div>

                      {(loading || loadingColumns[col.key]) && !items.length ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                          <Skeleton className="aspect-square w-full rounded-md" />

                          <Skeleton className="aspect-square w-full rounded-md" />
                          <Skeleton className="aspect-square w-full rounded-md" />
                          <Skeleton className="aspect-square w-full rounded-md" />
                          <Skeleton className="aspect-square w-full rounded-md" />
                          <Skeleton className="aspect-square w-full rounded-md" />
                          <Skeleton className="aspect-square w-full rounded-md" />
                          <Skeleton className="aspect-square w-full rounded-md" />
                          <Skeleton className="aspect-square w-full rounded-md" />
                          <Skeleton className="aspect-square w-full rounded-md" />
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {slice.map((item) => (
                          <ItemPatrimonio key={item.id} {...item} />
                        ))}
                      </div>

                      {(() => {
                        const totalFromTotals = totalByCol[col.key];
                        const totalFromStats = statusCounts[col.key];

                        // Tenta usar algum total "confiável"
                        let effectiveTotal: number | undefined;
                        if (
                          typeof totalFromTotals === "number" &&
                          totalFromTotals >= items.length
                        ) {
                          effectiveTotal = totalFromTotals;
                        } else if (
                          typeof totalFromStats === "number" &&
                          totalFromStats >= items.length
                        ) {
                          effectiveTotal = totalFromStats;
                        }

                        const loaded = items.length;
                        const visible = slice.length;

                        let hasMore = false;

                        // 1) Já tem itens carregados além dos visíveis (só mostrar mais do que já veio do backend)
                        if (loaded > visible) {
                          hasMore = true;
                        }
                        // 2) Temos um total confiável vindo da API: compara direto
                        else if (effectiveTotal != null) {
                          hasMore = loaded < effectiveTotal;
                        }
                        // 3) Fallback: não sabemos o total, mas
                        //    - não tem filtro de texto
                        //    - quantidade é múltiplo de PAGE_SIZE (padrão de paginação)
                        else if (!q.trim()) {
                          hasMore = loaded > 0 && loaded % PAGE_SIZE === 0;
                        }

                        if (!hasMore) return null;

                        return hasMore ? (
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
                        ) : null;
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <LoanCalendar rentedItems={itemsFlat} />
        )}
      </main>
    </div>
  );
}
