// src/pages/vitrine/ItensVitrine.tsx
import { Helmet } from "react-helmet";
import {
  ChevronDown,
  ChevronLeft,
  Maximize2,
  Plus,
  Store,
  Trash,
  ArrowUpRight,
  SlidersHorizontal,
  Download,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { Card } from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { toast } from "sonner";
import {
  DragDropContext,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { Alert } from "../../ui/alert";
import { MagnifyingGlass } from "phosphor-react";
import { CardItemDropdown } from "./card-item-dropdown";
import { ItemPatrimonio } from "../../homepage/components/item-patrimonio";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";

/* =========================
   Tipos vindos do backend
========================= */
type UUID = string;

type LegalGuardian = {
  legal_guardians_code: string;
  legal_guardians_name: string;
  id: UUID;
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
  created_at: string; // pode vir com microssegundos, mas NÃO vamos parsear
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

/* =========================
   Configuração do Board
========================= */

const WORKFLOWS = {
  vitrine: [
    { key: "REVIEW_REQUESTED_VITRINE", name: "Revisão para Vitrine" },
    { key: "ADJUSTMENT_VITRINE", name: "Ajustes Vitrine" },
    { key: "VITRINE", name: "Anunciados" },
    { key: "AGUARDANDO_TRANSFERENCIA", name: "Aguardando Transferência" },
    { key: "TRANSFERIDOS", name: "Transferidos" },
  ],
  desfazimento: [
    { key: "REVIEW_REQUESTED_DESFAZIMENTO", name: "Revisão Desfazimento" },
    { key: "ADJUSTMENT_DESFAZIMENTO", name: "Ajustes Desfazimento" },
    { key: "REVIEW_REQUESTED_COMISSION", name: "Revisão Comissão" },
    { key: "REJEITADOS_COMISSAO", name: "Rejeitados Comissão" },
    { key: "DESFAZIMENTO", name: "Desfazimento" },
  ],
} as const;
type BoardKind = keyof typeof WORKFLOWS;

// Regras por coluna (se exige justificativa e campos extras do modal)
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
  // Vitrine
  REVIEW_REQUESTED_VITRINE: { requireJustification: false },
  ADJUSTMENT_VITRINE: {
    requireJustification: true,
    extraFields: [
      {
        name: "ajuste",
        label: "Ajuste solicitado",
        type: "textarea",
        placeholder: "Descreva o ajuste",
      },
    ],
  },
  VITRINE: { requireJustification: false },
  AGUARDANDO_TRANSFERENCIA: {
    requireJustification: true,
    extraFields: [
      {
        name: "contato",
        label: "Contato Solicitante",
        type: "text",
        placeholder: "Nome/ramal/e-mail",
      },
    ],
  },
  TRANSFERIDOS: { requireJustification: true },

  // Desfazimento
  REVIEW_REQUESTED_DESFAZIMENTO: { requireJustification: false },
  ADJUSTMENT_DESFAZIMENTO: {
    requireJustification: true,
    extraFields: [
      { name: "motivoAjuste", label: "Motivo do ajuste", type: "textarea" },
    ],
  },
  REVIEW_REQUESTED_COMISSION: {
    requireJustification: true,
    extraFields: [{ name: "processo", label: "Nº Processo/Protocolo", type: "text" }],
  },
  REJEITADOS_COMISSAO: {
    requireJustification: true,
    extraFields: [{ name: "parecer", label: "Parecer", type: "textarea" }],
  },
  DESFAZIMENTO: {
    requireJustification: true,
    extraFields: [
      {
        name: "destino",
        label: "Destino",
        type: "text",
        placeholder: "Doação/Reciclagem/Leilão etc.",
      },
    ],
  },
};

/* =========================
   Utilidades (NÃO depende de date parsing)
========================= */

// Pega o ÚLTIMO elemento do array workflow_history.
// Isso garante que, quando adicionamos um novo workflow no FINAL,
// ele é considerado "o último" instantaneamente.
const lastWorkflow = (entry: CatalogEntry): WorkflowHistoryItem | undefined => {
  const hist = entry.workflow_history ?? [];
  if (!hist.length) return undefined;
  return hist[hist.length - 1];
};

const groupByLastWorkflow = (
  data: CatalogEntry[],
  columns: { key: string; name: string }[]
) => {
  const map: Record<string, CatalogEntry[]> = {};
  const valid = new Set(columns.map(c => (c.key ?? "").trim()));
  for (const col of columns) map[(col.key ?? "").trim()] = [];

  for (const entry of data) {
    const lw = lastWorkflow(entry);
    const key = (lw?.workflow_status ?? "").trim();
    if (valid.has(key)) {
      map[key].push(entry);
    } else {
      // Status não pertence ao board atual: omite neste board
      if (key) {
        console.warn(`[Board] Status fora do board atual: "${key}". Item omitido nesta aba.`);
      }
    }
  }
  return map;
};

const codeFrom = (e: CatalogEntry) =>
  [e?.asset?.asset_code, e?.asset?.asset_check_digit].filter(Boolean).join("-");

/* =========================
   Combobox (Command + Popover)
========================= */

type ComboboxItem = { id: UUID; code?: string; label: string };

function Combobox({
  items,
  value,
  onChange,
  placeholder,
  emptyText = "Nenhum item encontrado",
  triggerClassName,
}: {
  items: ComboboxItem[];
  value?: UUID | null;
  onChange: (id: UUID | null) => void;
  placeholder: string;
  emptyText?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id === value) || null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={triggerClassName ?? "w-[280px] justify-between"}
        >
          {selected ? (
            <span className="truncate text-left">
              <span className="font-medium">{selected.label}</span>
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
                  onChange(null);
                  setOpen(false);
                }}
              >
                <span className="text-muted-foreground font-medium  flex gap-2 items-center">
                  <Trash size={16}/> Limpar filtro
                </span>
              </CommandItem>

              <CommandSeparator className="my-1"/>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.code ?? ""}`}
                  onSelect={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium  line-clamp-1 uppercase">{item.label}</span>
                  </div>
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

export function ItensVitrine() {
  const { urlGeral } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState<BoardKind>("vitrine");
  const [showFilters, setShowFilters] = useState(true);

  // Filtros
  const [materials, setMaterials] = useState<Material[]>([]);
  const [guardians, setGuardians] = useState<LegalGuardian[]>([]);
  const [materialId, setMaterialId] = useState<UUID | null>(null);
  const [guardianId, setGuardianId] = useState<UUID | null>(null);
  const [q, setQ] = useState("");

  // Catálogo
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<CatalogEntry[]>([]);

  // Colunas (usa a key como está; apenas trim defensivo)
  const columns = useMemo(() => {
    const base = WORKFLOWS[tab];
    return base.map((c) => ({ ...c, key: (c.key ?? "").trim() }));
  }, [tab]);

  // Board
  const [board, setBoard] = useState<Record<string, CatalogEntry[]>>({});
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);

  // Modal de mudança de coluna
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{
    entry?: CatalogEntry;
    fromKey?: string;
    toKey?: string;
  }>({});
  const [justificativa, setJustificativa] = useState("");
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});
  const [posting, setPosting] = useState(false);

  // Snapshots para rollback (quando há modal ou erro no POST)
  const [snapshotBoard, setSnapshotBoard] = useState<Record<string, CatalogEntry[]> | null>(null);
  const [snapshotEntries, setSnapshotEntries] = useState<CatalogEntry[] | null>(null);

  // Paginação por coluna (board) e expandida
  const PAGE_SIZE = 24;
  const [visibleByCol, setVisibleByCol] = useState<Record<string, number>>({});
  const [expandedVisible, setExpandedVisible] = useState<number>(PAGE_SIZE);

  const resetMoveModal = () => {
    setMoveModalOpen(false);
    setMoveTarget({});
    setJustificativa("");
    setExtraValues({});
    setPosting(false);
    setSnapshotBoard(null);
    setSnapshotEntries(null);
  };

  const rulesFor = (colKey?: string): ColumnRule => {
    if (!colKey) return {};
    return COLUMN_RULES[colKey] || {};
  };

  // Inicializa visibleByCol quando as colunas mudarem
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

  // Fetch dos filtros
  useEffect(() => {
    const run = async () => {
      try {
        const [mRes, gRes] = await Promise.all([
          fetch(`${urlGeral}materials/`),
          fetch(`${urlGeral}legal-guardians/`),
        ]);
        const mJson = await mRes.json();
        const gJson = await gRes.json();
        setMaterials(mJson?.materials ?? []);
        setGuardians(gJson?.legal_guardians ?? []);
      } catch (e) {
        console.error("Erro ao buscar filtros:", e);
        toast.error("Falha ao carregar filtros");
      }
    };
    run();
  }, [urlGeral]);

  // Fetch do catálogo conforme filtros (material/guardian apenas; q é client-side)
  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (materialId) params.set("material_id", materialId);
      if (guardianId) params.set("legal_guardian_id", guardianId);
      const url = `${urlGeral}catalog/?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Erro ao carregar catálogo");
      const json: CatalogResponse = await res.json();
      const list = json?.catalog_entries ?? [];
      setEntries(list);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao carregar catálogo");
    } finally {
      setLoading(false);
    }
  }, [urlGeral, materialId, guardianId]);

  // Recarrega ao trocar filtros ou tab; ao trocar tab, sai do expandido
  useEffect(() => {
    setExpandedColumn(null);
    fetchCatalog();
  }, [fetchCatalog, tab]);

  // Atualiza URL com filtros (opcional)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (materialId) params.set("material_id", materialId);
    else params.delete("material_id");
    if (guardianId) params.set("legal_guardian_id", guardianId);
    else params.delete("legal_guardian_id");
    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId, guardianId]);

  // Filtragem livre (q) client-side
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

  // Board agrupado (sempre a partir do filtro atual)
  useEffect(() => {
    const grouped = groupByLastWorkflow(filteredEntries, columns);
    setBoard(grouped);
  }, [filteredEntries, columns]);

  // === Drag & Drop com atualização OTIMISTA + rollback ===
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;

  const postWorkflowChange = async (
    entry: CatalogEntry | undefined,
    toKey: string | undefined,
    detailsExtra: Record<string, any>
  ) => {
    if (!entry || !toKey) return false;
    try {
      const payload = {
        workflow_status: (toKey ?? "").trim(),
        detail: {
          justificativa: justificativa || undefined,
          ...detailsExtra,
        },
      };
      const res = await fetch(`${urlGeral}catalog/${entry.id}/workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Falha ao salvar workflow");
      toast.success("Movimentação realizada com sucesso.");
      return true;
    } catch (e) {
      console.error("Falha ao mover item:", e);
      toast.error("Não foi possível mover o item.");
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

    const needs = rulesFor(toKey);

    // 1) Snapshots para rollback
    const prevBoard = board;
    const prevEntries = entries;

    // 2) Atualização OTIMISTA:
    //    - adiciona NOVO workflow no FINAL do array
    //    - move o item de 'from' para 'to' no board
    const optimisticHistory: WorkflowHistoryItem = {
      id: crypto.randomUUID(),
      catalog_id: entry.id,
      user: entry.user,
      workflow_status: toKey,
      detail: {},
      created_at: new Date().toISOString(), // ISO válido, mas não dependemos dele
    };

    const optimisticEntry: CatalogEntry = {
      ...entry,
      workflow_history: [...(entry.workflow_history ?? []), optimisticHistory], // <<< FINAL
    };

    const newFrom = Array.from(prevBoard[fromKey] ?? []);
    const idx = newFrom.findIndex((x) => x.id === entry.id);
    if (idx >= 0) newFrom.splice(idx, 1);
    const newTo = [optimisticEntry, ...Array.from(prevBoard[toKey] ?? [])];

    setBoard({ ...prevBoard, [fromKey]: newFrom, [toKey]: newTo });
    setEntries((old) => old.map((it) => (it.id === entry.id ? optimisticEntry : it)));

    // 3) Se precisa de modal (justificativa/campos), abrir modal e guardar snapshots
    if (needs.requireJustification || (needs.extraFields?.length)) {
      setSnapshotBoard(prevBoard);
      setSnapshotEntries(prevEntries);
      setMoveTarget({ entry: optimisticEntry, fromKey, toKey });
      setMoveModalOpen(true);
      return;
    }

    // 4) Caso simples (sem modal): POST e rollback se falhar
    const ok = await postWorkflowChange(optimisticEntry, toKey, {});
    if (!ok) {
      setBoard(prevBoard);
      setEntries(prevEntries);
    }
  };

  // Confirmação do modal (mantém otimista; faz POST; rollback se falhar)
  const handleConfirmMove = async () => {
    if (!moveTarget.entry || !moveTarget.fromKey || !moveTarget.toKey) return;

    const needs = rulesFor(moveTarget.toKey);
    const extra: Record<string, any> = {};
    for (const f of needs.extraFields ?? []) {
      extra[f.name] = extraValues[f.name] ?? "";
    }

    const prevBoard = snapshotBoard ?? board;
    const prevEntries = snapshotEntries ?? entries;

    setPosting(true);
    const ok = await postWorkflowChange(moveTarget.entry, moveTarget.toKey, extra);
    setPosting(false);

    if (!ok) {
      // rollback total
      setBoard(prevBoard);
      setEntries(prevEntries);
    }

    resetMoveModal();
  };

  // Fechou modal SEM confirmar: rollback para snapshots (se existirem)
  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      if (snapshotBoard && snapshotEntries) {
        setBoard(snapshotBoard);
        setEntries(snapshotEntries);
      }
      resetMoveModal();
    } else {
      setMoveModalOpen(true);
    }
  };

  const clearFilters = () => {
    setMaterialId(null);
    setGuardianId(null);
    setQ("");
  };

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

  // resetar paginação ao entrar/alternar expandido
  useEffect(() => {
    if (expandedColumn !== null) resetExpandedPagination();
  }, [expandedColumn]);

  // Gera CSV simples (com cabeçalho) e baixa
// ---- CSV: flatten completo de catalog (inclui user, location, images, etc), EXCETO workflow_history ----
const getItemsForExport = (colKey?: string, onlyVisible = false) => {
  let items: CatalogEntry[] = [];

  if (colKey) {
    const all = board[colKey] ?? [];
    const isExpanded = expandedColumn === colKey;
    items = onlyVisible && isExpanded ? all.slice(0, expandedVisible) : all;
  } else {
    // fallback: todos os itens filtrados no board atual
    items = filteredEntries;
  }

  // Remove workflow_history para ficar “só os itens”
  return items.map(({ workflow_history, ...rest }) => rest);
};
// + adiciona colunas derivadas: codigo, last_status, last_status_at, images_count
const handleDownloadJson = (colKey?: string, onlyVisible = false) => {
  try {
    const jsonData = getItemsForExport(colKey, onlyVisible); // <<< SÓ ITENS
    const csvData = convertJsonToCsv(jsonData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=windows-1252;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const colName =
      (colKey && (columns.find(c => c.key === colKey)?.name || colKey)) || 'todos';
    link.download = `itens_${colName.replace(/\s+/g,'_').toLowerCase()}${onlyVisible ? '_visiveis' : ''}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    toast.error('Falha ao gerar CSV');
  }
};

// Remove workflow_history do objeto raiz (se existir)
const stripWorkflow = (obj: any) => {
  if (obj && typeof obj === "object" && "workflow_history" in obj) {
    const { workflow_history, ...rest } = obj;
    return rest;
  }
  return obj;
};

// Achata profundamente usando "chave.subchave.outrachave"
const flattenObject = (
  obj: any,
  prefix = "",
  out: Record<string, any> = {}
): Record<string, any> => {
  if (obj == null) return out;

  if (Array.isArray(obj)) {
    // Arrays:
    // - se todos são primitivos: junta com "|"
    // - se for "images": une file_path com "|"
    // - caso misto/objetos: salva como JSON
    const key = prefix.slice(0, -1);
    if (obj.every(v => typeof v !== "object" || v === null)) {
      out[key] = obj.join("|");
    } else if (/(\.|^)images$/.test(key)) {
      out[key] = obj.map((it: any) => it?.file_path ?? JSON.stringify(it)).join("|");
    } else {
      out[key] = JSON.stringify(obj);
    }
    return out;
  }

  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (k === "workflow_history") continue; // EXCLUI
      flattenObject(v, `${prefix}${k}.`, out);
    }
    return out;
  }

  // Primitivo
  out[prefix.slice(0, -1)] = obj;
  return out;
};

// Converte a lista de objetos para CSV com ; como separador
const convertJsonToCsv = (data: any[]): string => {
  const flattened = data.map((d) => flattenObject(stripWorkflow(d)));

  // Cabeçalho: união de todas as chaves, ordenadas
  const headerSet = new Set<string>();
  flattened.forEach(row => Object.keys(row).forEach(k => headerSet.add(k)));
  const headers = Array.from(headerSet).sort();

  const esc = (val: unknown) => {
    const s = String(val ?? "");
    // usa aspas se tiver ; , " ou quebra de linha
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [
    headers.join(";"),
    ...flattened.map(row => headers.map(h => esc((row as any)[h])).join(";")),
  ];
  return lines.join("\n");
};

        // Componente principal
              const scrollAreaRef = useRef<HTMLDivElement>(null);
              const [canScrollLeft, setCanScrollLeft] = useState(false);
              const [canScrollRight, setCanScrollRight] = useState(true);
              
              // Adicione estas funções:
              const checkScrollability = () => {
                if (scrollAreaRef.current) {
                  const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
                  setCanScrollLeft(scrollLeft > 0);
                  setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
                }
              };
              
              const scrollLeft = () => {
                if (scrollAreaRef.current) {
                  scrollAreaRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                }
              };
              
              const scrollRight = () => {
                if (scrollAreaRef.current) {
                  scrollAreaRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                }
              };
              
              // Adicione este useEffect:
              useEffect(() => {
                checkScrollability();
                const handleResize = () => checkScrollability();
                window.addEventListener('resize', handleResize);
                return () => window.removeEventListener('resize', handleResize);
              }, []);

  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full">
      <Helmet>
        <title>Movimentação | Vitrine Patrimônio</title>
        <meta name="description" content="Movimentação temporário | Vitrine Patrimônio" />
      </Helmet>

      <main className="flex flex-col gap-4  flex-1 min-h-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
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

            <h1 className="text-xl font-semibold tracking-tight">Movimentação</h1>
          </div>

          <div className="hidden gap-2 items-center xl:flex">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters((s) => !s)}
            >
              <SlidersHorizontal size={16}/>  {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>

            <div className="flex">
              <Button
                size="sm"
                onClick={() => {
                  setTab("vitrine");
                  setExpandedColumn(null);
                }}
                variant={tab === "vitrine" ? "default" : "outline"}
                className="rounded-r-none"
              >
                <Store size={16} className="mr-2" />
                Vitrine
              </Button>
              <Button
                onClick={() => {
                  setTab("desfazimento");
                  setExpandedColumn(null);
                }}
                size="sm"
                variant={tab !== "vitrine" ? "default" : "outline"}
                className="rounded-l-none"
              >
                <Trash size={16} className="mr-2" />
                Desfazimento
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8 mx-2" />

            <Link to={"/dashboard/novo-item"}>
              <Button size="sm">
                <Plus size={16} className="mr-2" />
                Anunciar item
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
            <div className="relative grid grid-cols-1">

                  <Button
        variant='outline'
        size="sm"
        className={`absolute left-0 z-10 h-10 w-10 p-0  ${
          !canScrollLeft ? 'opacity-30 cursor-not-allowed' : ''
        }`}
        onClick={scrollLeft}
        disabled={!canScrollLeft}
      >
        <ChevronLeft size={16} />
      </Button>

       <div className=" mx-14 ">
 <div ref={scrollAreaRef} className="overflow-x-auto scrollbar-hide scrollbar-hide" onScroll={checkScrollability}>
 <div className="flex  gap-3 items-center ">
              <Alert className="w-[300px] py-0 h-10 rounded-md flex gap-3 items-center">
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
                placeholder="Material"
              />
              <Combobox
                items={guardianItems}
                value={guardianId}
                onChange={(v) => setGuardianId(v)}
                placeholder="Responsável"
              />

              <Button variant={"outline"} size={"sm"} onClick={clearFilters}>
                <Trash size={16} /> Limpar filtros
              </Button>
            </div>
 </div>
 </div>

  {/* Botão Direita */}
      <Button
        variant='outline'
        size="sm"
        className={`absolute right-0 z-10 h-10 w-10 p-0 rounded-md  ${
          !canScrollRight ? 'opacity-30 cursor-not-allowed' : ''
        }`}
        onClick={scrollRight}
        disabled={!canScrollRight}
      >
        <ChevronRight size={16} />
      </Button>
      </div>
           
   
        )}


        {/* Board / Expandido */}
        {expandedColumn === null ? (
          // BOARD com scroll horizontal
         <div className={`relative flex-1 ${showFilters ? ('max-h-[calc(100vh-248px)] sm:max-h-[calc(100vh-306px)]'):('max-h-[calc(100vh-248px)] sm:max-h-[calc(100vh-250px)] ')}`}>
  <div className="h-full overflow-x-auto overflow-y-hidden pb-2">
              <DragDropContext onDragEnd={handleDragEnd}>
                   <div className="flex gap-4 min-w-[980px] h-full">

                  {columns.map((col) => {
                    const items = board[col.key] ?? [];
                    const take = visibleByCol[col.key] ?? PAGE_SIZE;
                    const slice = items.slice(0, take);

                    return (
                      <Alert
                        key={col.key}
                    className="w-[320px] min-w-[320px] h-full flex flex-col min-h-0"
                      >
                        <div className="flex items-center justify-between gap-8 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="block font-semibold truncate max-w-full">
                              {col.name}
                            </span>
                            <Badge variant="outline" className="shrink-0">
                              {items.length}
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

                     <Droppable droppableId={col.key}>
  {(provided, snapshot) => (
    <div className="flex-1 min-h-0">
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={`flex flex-col gap-2 h-full overflow-y-auto pr-1 transition-all ${
          snapshot.isDraggingOver
            ? "bg-neutral-200 dark:bg-neutral-800 rounded-md p-2"
            : ""
        }`}
      >
        {loading && !items.length ? (
          <>
            <Skeleton className="h-20 w-full rounded-md aspect-square" />
            <Skeleton className="h-20 w-full rounded-md aspect-square" />
          </>
        ) : null}

        {slice.map((entry, idx) => (
          <CardItemDropdown key={entry.id} entry={entry} index={idx} />
        ))}
        {provided.placeholder}

        {items.length > slice.length ? (
          <div className="pt-2">
            <Button variant="outline" className="w-full" onClick={() => showMoreCol(col.key)}>
              <Plus size={16}/> Mostrar mais
            </Button>
          </div>
        ) : null}
      </div>
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
          // EXPANDIDO
          <div className="m-0">
            {columns.map((col) => {
              if (expandedColumn !== col.key) return null;
              const items = board[col.key] ?? [];
              const slice = items.slice(0, expandedVisible);

              return (
                <div key={col.key}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        {col.name}
                      </h2>
                      <Badge variant="outline">{items.length}</Badge>
                    </div>

                    <div className="flex gap-3">
                       <Button variant="outline"  onClick={() => handleDownloadJson(col.key)}>
<Download size={16}/>      Baixar resultado
    </Button>
                    <Button onClick={() => setExpandedColumn(null)}>
                      <ChevronLeft className="" size={16} />
                      Voltar ao quadro
                    </Button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5  gap-4">
                             {items.map((item) => (
                               <ItemPatrimonio
                                 key={item.id}
                                 {...item}
                                 // o filho só dispara os diálogos do pai:
                                 onPromptDelete={() => openDelete(item.id)}
                                 onPromptMove={() => openMove(item.id)}
                               
                               />
                             ))}
                        </div>

                  {items.length > slice.length ? (
                    <div className="flex justify-center mt-8">
                      <Button  onClick={showMoreExpanded}>
                     <Plus size={16}/>     Mostrar mais
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      
      </main>

      {/* Modal de mudança de workflow (justificativa/extra fields) */}
      <Dialog open={moveModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Confirmar movimentação</DialogTitle>
            <DialogDescription>
              Você está movendo o item{" "}
              <strong>
                {moveTarget.entry?.asset?.asset_description ?? moveTarget.entry?.id}
              </strong>
              <br />
              <span className="text-xs">
                De:{" "}
                <strong>
                  {columns.find((c) => c.key === moveTarget.fromKey)?.name ?? moveTarget.fromKey}
                </strong>{" "}
                • Para:{" "}
                <strong>
                  {columns.find((c) => c.key === moveTarget.toKey)?.name ?? moveTarget.toKey}
                </strong>
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {(() => {
              const needs = rulesFor(moveTarget.toKey);
              return needs.requireJustification ? (
                <div className="grid gap-2">
                  <Label htmlFor="just">Justificativa</Label>
                  <Textarea
                    id="just"
                    placeholder="Explique a motivação da mudança (se aplicável)"
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                  />
                </div>
              ) : null;
            })()}

            {(rulesFor(moveTarget.toKey)?.extraFields ?? []).map((f) => (
              <div className="grid gap-2" key={f.name}>
                <Label htmlFor={f.name}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.name}
                    placeholder={f.placeholder}
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

            <Card className="p-3">
              <div className="text-xs text-muted-foreground">
                <strong>Observação:</strong> Os campos exibidos dependem da coluna de destino e são configuráveis em
                <code className="ml-1"> COLUMN_RULES</code>.
              </div>
            </Card>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => handleModalOpenChange(false)}>
              Cancelar
            </Button>
            <Button disabled={posting} onClick={handleConfirmMove}>
              {posting ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
