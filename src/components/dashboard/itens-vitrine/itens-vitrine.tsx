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
} from "lucide-react";
import { Button } from "../../ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/context";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  created_at: string; // ISO-ish
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
   Utilidades
========================= */

const robustLastWorkflow = (entry: CatalogEntry): WorkflowHistoryItem | undefined => {
  const hist = entry.workflow_history ?? [];
  if (!hist.length) return undefined;

  const byTime = [...hist].sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    const va = Number.isNaN(da) ? 0 : da;
    const vb = Number.isNaN(db) ? 0 : db;
    if (va !== vb) return vb - va;
    return (b.created_at || "").localeCompare(a.created_at || "");
  });

  return byTime[0];
};

const groupByLastWorkflow = (
  data: CatalogEntry[],
  columns: { key: string; name: string }[]
) => {
  const map: Record<string, CatalogEntry[]> = {};
  const validKeys = new Set(columns.map(c => (c.key ?? "").trim()));
  for (const col of columns) map[(col.key ?? "").trim()] = [];

  for (const entry of data) {
    const lastStatusRaw = robustLastWorkflow(entry)?.workflow_status ?? "";
    const lastStatus = (lastStatusRaw ?? "").trim();
    if (validKeys.has(lastStatus)) {
      map[lastStatus].push(entry);
    } else {
      map[columns[0].key].push(entry);
      if (lastStatusRaw) {
        console.warn(`[Board] Status não mapeado: "${lastStatusRaw}". Caiu na 1ª coluna.`);
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

    // 2) Atualização OTIMISTA: adiciona history com destino e move visualmente
    const optimisticHistory: WorkflowHistoryItem = {
      id: crypto.randomUUID(),
      catalog_id: entry.id,
      user: entry.user,
      workflow_status: toKey,
      detail: {},
      created_at: new Date().toISOString(),
    };
    const optimisticEntry: CatalogEntry = {
      ...entry,
      workflow_history: [...(entry.workflow_history ?? []), optimisticHistory],
    };

    // tira do from e coloca no topo do to
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

  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full">
      <Helmet>
        <title>Movimentação | Vitrine Patrimônio</title>
        <meta name="description" content="Movimentação temporário | Vitrine Patrimônio" />
      </Helmet>

      <main className="flex flex-col gap-6">
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

          <div className="flex gap-2 items-center">
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
          <div>
            <div className="flex flex-wrap gap-3 items-center">
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
        )}

        {/* Board / Expandido */}
        {expandedColumn === null ? (
          // BOARD com scroll horizontal
          <div className="relative">
            <div className="overflow-x-auto pb-2">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 min-w-[980px]">
                  {columns.map((col) => {
                    const items = board[col.key] ?? [];
                    const take = visibleByCol[col.key] ?? PAGE_SIZE;
                    const slice = items.slice(0, take);

                    return (
                      <Alert
                        key={col.key}
                        className="w-[320px] min-w-[320px] flex flex-col"
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
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex flex-col gap-2 min-h-[120px] transition-all ${
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
                                  <Button variant="outline" size="sm" onClick={() => showMoreCol(col.key)}>
                                    Mostrar mais
                                  </Button>
                                </div>
                              ) : null}
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
                    <Button variant="outline" onClick={() => setExpandedColumn(null)}>
                      <ChevronLeft className="" size={16} />
                      Voltar ao quadro
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slice.map((entry) => (
                      <Card key={entry.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">
                              {entry.asset?.asset_description || "Sem descrição"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {codeFrom(entry)} •{" "}
                              {entry.asset?.material?.material_name ?? "—"} •{" "}
                              {entry.asset?.legal_guardian?.legal_guardians_name ?? "—"}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/item/${entry.id}`} title="Abrir item">
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                        <Separator />
                        <div className="text-sm whitespace-pre-wrap">
                          {entry.description || "—"}
                        </div>
                        {entry.images?.length ? (
                          <div className="grid grid-cols-4 gap-2">
                            {entry.images.map((img) => (
                              <div
                                key={img.id}
                                className="aspect-square rounded-md overflow-hidden border bg-muted"
                              >
                                <img
                                  src={img.file_path}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </Card>
                    ))}
                  </div>

                  {items.length > slice.length ? (
                    <div className="flex justify-center mt-4">
                      <Button variant="outline" onClick={showMoreExpanded}>
                        Mostrar mais
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
