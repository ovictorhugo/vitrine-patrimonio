import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../../../context/context";

import { Alert } from "../../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Tabs, TabsContent } from "../../../ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion";
import { Skeleton } from "../../../ui/skeleton";
import { Badge } from "../../../ui/badge";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { ItemPatrimonio } from "../../../homepage/components/item-patrimonio";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  HelpCircle,
  Hourglass,
  ListTodo,
  Maximize2,
  Plus,
  Recycle,
  Store,
  Trash,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Input } from "../../../ui/input";
import { ArrowUUpLeft, Repeat } from "phosphor-react";

/* =========================
   Tipos mínimos do backend
========================= */
type UUID = string;

type Material = { material_code: string; material_name: string; id: UUID };
type LegalGuardian = { legal_guardians_code: string; legal_guardians_name: string; id: UUID };

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
        unit: { unit_name: string; unit_code: string; unit_siaf: string; id: UUID };
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
  created_at: string;
};

export type CatalogEntry = {
  situation: string;
  conservation_status: string;
  description: string;
  id: UUID;
  asset: CatalogAsset;
  user: WorkflowHistoryItem["user"];
  location: CatalogAsset["location"];
  images: { id: UUID; catalog_id: UUID; file_path: string }[];
  workflow_history: WorkflowHistoryItem[];
  created_at: string;
};

type CatalogResponse = { catalog_entries: CatalogEntry[] };

/* =========================
   Metadados de workflow
========================= */
const WORKFLOWS = {
  vitrine: [
    { key: "REVIEW_REQUESTED_VITRINE", name: "Avaliação S. Patrimônio - Vitrine", Icon: Hourglass },
    { key: "ADJUSTMENT_VITRINE", name: "Ajustes - Vitrine", Icon: Wrench },
    { key: "VITRINE", name: "Anunciados", Icon: Store },
    { key: "AGUARDANDO_TRANSFERENCIA", name: "Aguardando transferência", Icon: Clock },
    { key: "TRANSFERIDOS", name: "Transferidos", Icon: Archive },
  ],
  desfazimento: [
    { key: "REVIEW_REQUESTED_DESFAZIMENTO", name: "Avaliação S. Patrimônio - Desfazimento", Icon: Hourglass },
    { key: "ADJUSTMENT_DESFAZIMENTO", name: "Ajustes - Desfazimento", Icon: Wrench },
    { key: "REVIEW_REQUESTED_COMISSION", name: "LTD - Lista Temporária de Desfazimento", Icon: ListTodo },
    { key: "REJEITADOS_COMISSAO", name: "Recusados", Icon: XCircle },
    { key: "DESFAZIMENTO", name: "LFD - Lista Final de Desfazimento", Icon: Trash },
    { key: "DESCARTADOS", name: "Processo Finalizado", Icon: Recycle },
  ],
} as const;
type BoardKind = keyof typeof WORKFLOWS;

const WORKFLOW_STATUS_META: Record<
  string,
  { Icon: React.ComponentType<any>; colorClass: string }
> = {
  REVIEW_REQUESTED_VITRINE: { Icon: Hourglass, colorClass: "text-amber-500" },
  ADJUSTMENT_VITRINE: { Icon: Wrench, colorClass: "text-blue-500" },
  VITRINE: { Icon: Store, colorClass: "text-green-600" },
  AGUARDANDO_TRANSFERENCIA: { Icon: Clock, colorClass: "text-indigo-500" },
  TRANSFERIDOS: { Icon: Archive, colorClass: "text-zinc-500" },

  REVIEW_REQUESTED_DESFAZIMENTO: { Icon: Hourglass, colorClass: "text-amber-500" },
  ADJUSTMENT_DESFAZIMENTO: { Icon: Wrench, colorClass: "text-blue-500" },
  REVIEW_REQUESTED_COMISSION: { Icon: Users, colorClass: "text-purple-500" },
  REJEITADOS_COMISSAO: { Icon: HelpCircle, colorClass: "text-red-500" },
  DESFAZIMENTO: { Icon: Recycle, colorClass: "text-green-600" },
};

const lastWorkflow = (entry: CatalogEntry): WorkflowHistoryItem | undefined => {
  const hist = entry.workflow_history ?? [];
  if (!hist.length) return undefined;
  return hist[0];
};

const PAGE_SIZE = 24;

/* ===== Helpers URL/filtro ===== */
type CatalogFilter = { type: string; value: string };
const sanitizeBaseUrl = (u?: string) => (u || "").replace(/\/+$/, "");

/* ===== Helpers CSV ===== */
const flattenObject = (obj: any, prefix = "", out: Record<string, any> = {}): Record<string, any> => {
  if (obj == null) return out;
  if (Array.isArray(obj)) {
    const key = prefix.slice(0, -1);
    out[key] = obj.every(v => typeof v !== "object" || v === null) ? obj.join("|") : JSON.stringify(obj);
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
  const flattened = data.map((d) => {
    const { workflow_history, ...rest } = d || {};
    return flattenObject(rest);
  });
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

/* =========================
   Subcomponente: Accordion
========================= */
function StatusAccordion({
  statusKey,
  title,
  icon: IconComp,
  items,
  loading,
  onDownloadCsv,
  isOpen,
  onExpand,
  onCollapseExpand,
  // novo: handlers vindos do pai
  onPromptDelete,
  onPromptMove,
}: {
  statusKey: string;
  title: string;
  icon: React.ComponentType<any>;
  items: CatalogEntry[];
  loading: boolean;
  onDownloadCsv: () => void;
  isOpen: boolean;
  onExpand: (key: string) => void;
  onCollapseExpand: () => void;
  onPromptDelete: (catalogId: string) => void;
  onPromptMove: (catalogId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!expanded) setVisible(PAGE_SIZE);
  }, [expanded]);

  const showMore = () => setVisible((n) => n + PAGE_SIZE);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const contentWrapRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const measureScrollability = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxLeft = Math.max(0, scrollWidth - clientWidth);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(maxLeft - scrollLeft > 1);
  }, []);

  const rafMeasure = useCallback(() => {
    requestAnimationFrame(() => {
      measureScrollability();
      requestAnimationFrame(() => setTimeout(measureScrollability, 0));
    });
  }, [measureScrollability]);

  useLayoutEffect(() => {
    if (isOpen) rafMeasure();
  }, [rafMeasure, isOpen]);

  useEffect(() => {
    if (isOpen) rafMeasure();
  }, [items.length, loading, expanded, rafMeasure, isOpen]);

  useEffect(() => {
    const target =
      contentWrapRef.current?.parentElement ?? contentWrapRef.current ?? null;
    if (!target) return;
    const handler = () => rafMeasure();
    target.addEventListener("transitionend", handler, true);
    return () => target.removeEventListener("transitionend", handler, true);
  }, [rafMeasure]);

  useEffect(() => {
    const onResize = () => isOpen && rafMeasure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [rafMeasure, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const el = scrollAreaRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => rafMeasure());
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild as Element);
    return () => ro.disconnect();
  }, [rafMeasure, isOpen]);

  const scrollByAmount = (dir: "left" | "right") => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.8) * (dir === "left" ? -1 : 1);
    el.scrollBy({ left: delta, behavior: "smooth" });
    setTimeout(measureScrollability, 120);
  };

  const disableNav = loading || items.length === 0;

  return (
    <AccordionItem value={statusKey}>
      <div className="flex gap-4 w-full justify-between items-center ">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HeaderResultTypeHome
                title={title}
                icon={<IconComp size={24} className="text-gray-400" />}
              />
              <Badge variant="outline">{loading ? "…" : items.length}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadCsv();
                }}
              >
                <Download size={16} />
                Baixar resultado
              </Button>

              {isOpen && !expanded && items.length > 0 ? (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(true);
                    onExpand(statusKey);
                    rafMeasure();
                  }}
                >
                  <Maximize2 size={16} />
                  Expandir
                </Button>
              ) : null}

              {isOpen && expanded ? (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(false);
                    onCollapseExpand();
                    rafMeasure();
                  }}
                >
                  <ChevronLeft size={16} />
                  Voltar ao quadro
                </Button>
              ) : null}
            </div>
          </div>
        </div>
        <AccordionTrigger
          className=""
          onClick={() => {
            if (isOpen && expanded) {
              setExpanded(false);
              onCollapseExpand();
            }
          }}
        />
      </div>

      <AccordionContent className="p-0">
        <div ref={contentWrapRef}>
          {!expanded ? (
            // ======= MODO COMPACTO: carrossel horizontal =======
            <div className="relative grid grid-cols-1">
              <Button
                aria-label="Rolar para a esquerda"
                variant="outline"
                size="sm"
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 ${
                  !canScrollLeft || disableNav ? "opacity-30 cursor-not-allowed" : ""
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  scrollByAmount("left");
                }}
                disabled={!canScrollLeft || disableNav}
              >
                <ChevronLeft size={16} />
              </Button>

              <div className="mx-4">
                <div
                  ref={scrollAreaRef}
                  className="overflow-x-auto scrollbar-hide"
                  onScroll={measureScrollability}
                >
                  <div className="flex gap-6 whitespace-nowrap py-2">
                    {loading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="w-64 aspect-square rounded-lg" />
                      ))
                    ) : items.length === 0 ? (
                      <div className="w-full pr-4">
                        <Alert variant="default">Nenhum item para este status.</Alert>
                      </div>
                    ) : (
                      items.map((item) => (
                        <div className="w-64 min-w-64" key={item.id}>
                          <ItemPatrimonio
                            {...item}
                            onPromptDelete={() => onPromptDelete(item.id)}
                            onPromptMove={() => onPromptMove(item.id)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <Button
                aria-label="Rolar para a direita"
                variant="outline"
                size="sm"
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 ${
                  !canScrollRight || disableNav ? "opacity-30 cursor-not-allowed" : ""
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  scrollByAmount("right");
                }}
                disabled={!canScrollRight || disableNav}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          ) : (
            // ======= MODO EXPANDIDO: grid com "Mostrar mais"
            <div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                {(items || []).slice(0, visible).map((item) => (
                  <ItemPatrimonio
                    key={item.id}
                    {...item}
                    onPromptDelete={() => onPromptDelete(item.id)}
                    onPromptMove={() => onPromptMove(item.id)}
                  />
                ))}
              </div>

              {(items || []).length > visible ? (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVisible((n) => n + PAGE_SIZE);
                    }}
                  >
                    <Plus size={16} /> Mostrar mais
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

/* =========================
   Componente Principal
========================= */
export function Anunciados(props: {
  filter?: CatalogFilter;           // { type, value } vindo do pai
  workflowOptions?: string[];       // opções do diálogo de movimentar
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { urlGeral, user } = useContext(UserContext);
  const baseUrl = useMemo(() => sanitizeBaseUrl(urlGeral), [urlGeral]);

  // token / headers
  const token = useMemo(
    () => (typeof window !== "undefined" ? localStorage.getItem("jwt_token") || "" : ""),
    []
  );
  const authHeaders: HeadersInit = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  // Abas
  type BoardState = BoardKind;
  const [tab, setTab] = useState<BoardState>("vitrine");

  // Filtro vindo do pai OU querystring
  const qs = new URLSearchParams(location.search);
  const urlType = qs.get("type") ?? undefined;
  const urlValue = qs.get("value") ?? undefined;
  const filter: CatalogFilter | undefined = props.filter ?? (urlType && urlValue ? { type: urlType, value: urlValue } : undefined);

  // Catálogo
  const [loadingItems, setLoadingItems] = useState(false);
  const [entries, setEntries] = useState<CatalogEntry[]>([]);

  // Aberturas padrão
  const allVitrineKeys = WORKFLOWS.vitrine.map((w) => w.key);
  const allDesfazKeys = WORKFLOWS.desfazimento.map((w) => w.key);
  const [openKeysVitrine, setOpenKeysVitrine] = useState<string[]>(allVitrineKeys);
  const [openKeysDesfaz, setOpenKeysDesfaz] = useState<string[]>(allDesfazKeys);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  // ===== DELETE (diálogo no padrão do seu exemplo) =====
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openDelete = (catalogId: string) => { setDeleteTargetId(catalogId); setIsDeleteOpen(true); };
  const closeDelete = () => { setIsDeleteOpen(false); setDeleteTargetId(null); };

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    try {
      setDeleting(true);
      const r = await fetch(`${baseUrl}/catalog/${deleteTargetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`Falha ao excluir (${r.status}): ${t}`);
      }
      setEntries((prev) => prev.filter((it) => it.id !== deleteTargetId));
      toast("Item excluído com sucesso.");
      closeDelete();
      try {
  window.dispatchEvent(
    new CustomEvent("catalog:deleted", { detail: { id: deleteTargetId } })
  );
} catch {}
    } catch (e: any) {
      toast("Erro ao excluir", { description: e?.message || "Tente novamente." });
    } finally {
      setDeleting(false);
    }
  }, [deleteTargetId, baseUrl, token]);

  // ===== MOVIMENTAR (opcional) =====
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const [moveStatus, setMoveStatus] = useState<string>("");
  const [moveObs, setMoveObs] = useState<string>("");
  const [moving, setMoving] = useState(false);

  const openMove = (catalogId: string) => {
    setMoveTargetId(catalogId);
    setMoveStatus(props.workflowOptions?.[0] || "");
    setMoveObs("");
    setIsMoveOpen(true);
  };
  const closeMove = () => { setIsMoveOpen(false); setMoveTargetId(null); setMoveStatus(""); setMoveObs(""); };

  const handleConfirmMove = useCallback(async () => {
    if (!moveTargetId || !moveStatus) return;
    try {
      setMoving(true);
      const payload = {
        workflow_status: moveStatus,
        detail: { observation: { text: moveObs } },
      };
      const r = await fetch(`${baseUrl}/catalog/${moveTargetId}/workflow`, {
        method: "POST",
        headers: { ...authHeaders },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`Falha ao movimentar (${r.status}): ${t}`);
      }

      // Remove da lista se sair do status-original-visualizado (não há bloco único aqui, então apenas sinalizamos global)
      try {
        window.dispatchEvent(
          new CustomEvent("catalog:workflow-updated", {
            detail: { id: moveTargetId, newStatus: moveStatus },
          })
        );
      } catch {}

      toast("Movimentação registrada!");
      closeMove();
      // refresh leve: se quiser, refaça o fetchCatalog(); aqui deixei sem para manter instantâneo.
      setEntries((prev) => prev.filter((it) => it.id !== moveTargetId));
    } catch (e: any) {
      toast("Erro ao movimentar", { description: e?.message || "Tente novamente." });
    } finally {
      setMoving(false);
    }
  }, [moveTargetId, moveStatus, moveObs, baseUrl, authHeaders]);

  // ====== FETCH: Catálogo com {type,value} ou user_id
  const buildCatalogListUrl = useCallback((
    base: string,
    board: BoardKind,
    f?: CatalogFilter,
    fallbackUserId?: string | null | undefined
  ) => {
    const url = new URL(`${base}/catalog/`);
    if (f?.type && typeof f.value === "string") {
      url.searchParams.set(f.type, f.value);
    } else if (fallbackUserId) {
      url.searchParams.set("user_id", fallbackUserId);
    }
    // opcional: se o backend aceitar informar o board
    url.searchParams.set("board", board);
    return url.toString();
  }, []);

  const fetchCatalog = useCallback(async () => {
    if (!baseUrl) return;
    setLoadingItems(true);
    try {
      const listUrl = buildCatalogListUrl(baseUrl, tab, filter, user?.id);
      const res = await fetch(listUrl, { headers: authHeaders });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: CatalogResponse = await res.json();
      setEntries(json?.catalog_entries ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Falha ao carregar itens.");
      setEntries([]);
    } finally {
      setLoadingItems(false);
    }
  }, [baseUrl, authHeaders, tab, filter, user?.id, buildCatalogListUrl]);

  useEffect(() => {
    fetchCatalog();
    setFocusedKey(null); // reset foco ao trocar aba
    setOpenKeysVitrine(allVitrineKeys);
    setOpenKeysDesfaz(allDesfazKeys);
  }, [fetchCatalog, tab]);

  // Agrupamento por status
  const grouped = useMemo(() => {
    const m: Record<string, CatalogEntry[]> = {};
    for (const e of entries) {
      const k = (lastWorkflow(e)?.workflow_status ?? "").trim();
      if (!k) continue;
      if (!m[k]) m[k] = [];
      m[k].push(e);
    }
    return m;
  }, [entries]);

  // Contagens
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    Object.keys(grouped).forEach((k) => (c[k] = grouped[k].length));
    return c;
  }, [grouped]);

  const getMeta = (statusKey: string) =>
    WORKFLOW_STATUS_META[statusKey] ?? { Icon: HelpCircle, colorClass: "text-zinc-500" };

  const downloadCsvFor = (statusKey: string, statusName: string) => {
    try {
      const data = (grouped[statusKey] ?? []).map(({ workflow_history, ...rest }) => rest);
      const csv = convertJsonToCsv(data);
      const blob = new Blob([csv], { type: "text/csv;charset=windows-1252;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `itens_${statusName.replace(/\s+/g, "_").toLowerCase()}.csv`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Falha ao gerar CSV.");
    }
  };

  // foco expand/voltar
  const handleExpand = (key: string) => setFocusedKey(key);
  const handleCollapseExpand = () => setFocusedKey(null);

  const openKeys = tab === "vitrine" ? openKeysVitrine : openKeysDesfaz;
  const setOpenKeys = tab === "vitrine" ? setOpenKeysVitrine : setOpenKeysDesfaz;

  // Remover localmente quando outro lugar mover status
useEffect(() => {
  const handler = (e: any) => {
    const detail = e?.detail as { id?: string; newStatus?: string } | undefined;
    const id = detail?.id;
    const newStatus = detail?.newStatus?.trim();
    if (!id || !newStatus) return;

    setEntries((prev) => {
      let touched = false;

      const next = prev.map((it) => {
        if (it.id !== id) return it;

        // se já está no status informado, não muda nada
        const current = it.workflow_history?.[0]?.workflow_status?.trim();
        if (current === newStatus) return it;

        touched = true;

        const newHistoryItem: WorkflowHistoryItem = {
          id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
          catalog_id: it.id,
          workflow_status: newStatus,
          detail: {},
          created_at: new Date().toISOString(),
          user: it.user ?? null, // opcional: mantém o mesmo usuário ou null
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
  return () => window.removeEventListener("catalog:workflow-updated" as any, handler as any);
}, []);



   
// Remover item da lista quando for excluído em outro lugar (ex.: CatalogModal)
useEffect(() => {
  const handler = (e: any) => {
    const id = e?.detail?.id as string | undefined;
    if (!id) return;
    setEntries((prev) => prev.filter((it) => it.id !== id));
  };

  window.addEventListener("catalog:deleted" as any, handler as any);
  return () => window.removeEventListener("catalog:deleted" as any, handler as any);
}, []);

  return (
    <div className="flex flex-col gap-8 p-8 pt-0">
      {/* Header com toggle de abas */}
      <div className="flex justify-between items-center">
        <div />
        <div>
          <div className="flex">
            <Button
              size="sm"
              onClick={() => setTab("vitrine")}
              variant={tab === "vitrine" ? "default" : "outline"}
              className="rounded-r-none"
            >
              <Store size={16} className="mr-2" />
              Vitrine
            </Button>
            <Button
              onClick={() => setTab("desfazimento")}
              size="sm"
              variant={tab !== "vitrine" ? "default" : "outline"}
              className="rounded-l-none"
            >
              <Trash size={16} className="mr-2" />
              Desfazimento
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as BoardKind)}>
        {/* === Cards de resumo === */}
        <TabsContent value="vitrine" className="p-0 m-0">
          <Carousel className="w-full flex gap-4 px-4 items-center">
            <div className="absolute left-0 z-[9]">
              <CarouselPrevious />
            </div>
            <CarouselContent className="gap-4">
              {WORKFLOWS.vitrine.map(({ key, name }) => {
                const { Icon } = getMeta(key);
                const count = counts[key] ?? 0;
                return (
                  <CarouselItem key={key} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <Alert className="p-0">
                      <CardHeader className="flex gap-8 flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm truncate font-medium">{name}</CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{loadingItems ? "0" : count}</div>
                        <p className="text-xs text-muted-foreground">registrados</p>
                      </CardContent>
                    </Alert>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="absolute right-0 z-[9]">
              <CarouselNext />
            </div>
          </Carousel>

          {/* === Accordions === */}
          <Accordion
            type="multiple"
            value={focusedKey ? openKeys.filter((k) => k === focusedKey) : openKeys}
            onValueChange={(v) => {
              const next = Array.isArray(v) ? v : [];
              if (focusedKey && !next.includes(focusedKey)) {
                setFocusedKey(null);
                setOpenKeysVitrine(allVitrineKeys);
                setOpenKeysDesfaz(allDesfazKeys);
                return;
              }
              setOpenKeys(next);
            }}
            className="mt-4 grid gap-8"
          >
            {(focusedKey
              ? WORKFLOWS.vitrine.filter(({ key }) => key === focusedKey)
              : WORKFLOWS.vitrine
            ).map(({ key, name, Icon }) => (
              <StatusAccordion
                key={key}
                statusKey={key}
                title={name}
                icon={Icon}
                items={grouped[key] ?? []}
                loading={loadingItems}
                onDownloadCsv={() => downloadCsvFor(key, name)}
                isOpen={openKeys.includes(key)}
                onExpand={handleExpand}
                onCollapseExpand={handleCollapseExpand}
                onPromptDelete={openDelete}
                onPromptMove={openMove}
              />
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="desfazimento" className="p-0 m-0">
          <Carousel className="w-full flex gap-4 px-4 items-center">
            <div className="absolute left-0 z-[9]">
              <CarouselPrevious />
            </div>
            <CarouselContent className="gap-4">
              {WORKFLOWS.desfazimento.map(({ key, name }) => {
                const { Icon } = getMeta(key);
                const count = counts[key] ?? 0;
                return (
                  <CarouselItem key={key} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <Alert className="p-0">
                      <CardHeader className="flex gap-8 flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm truncate font-medium">{name}</CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{loadingItems ? "0" : count}</div>
                        <p className="text-xs text-muted-foreground">registrados</p>
                      </CardContent>
                    </Alert>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="absolute right-0 z-[9]">
              <CarouselNext />
            </div>
          </Carousel>

          <Accordion
            type="multiple"
            value={focusedKey ? openKeys.filter((k) => k === focusedKey) : openKeys}
            onValueChange={(v) => {
              const next = Array.isArray(v) ? v : [];
              if (focusedKey && !next.includes(focusedKey)) {
                setFocusedKey(null);
                setOpenKeysVitrine(allVitrineKeys);
                setOpenKeysDesfaz(allDesfazKeys);
                return;
              }
              setOpenKeys(next);
            }}
            className="mt-4 grid gap-8"
          >
            {(focusedKey
              ? WORKFLOWS.desfazimento.filter(({ key }) => key === focusedKey)
              : WORKFLOWS.desfazimento
            ).map(({ key, name, Icon }) => (
              <StatusAccordion
                key={key}
                statusKey={key}
                title={name}
                icon={Icon}
                items={grouped[key] ?? []}
                loading={loadingItems}
                onDownloadCsv={() => downloadCsvFor(key, name)}
                isOpen={openKeys.includes(key)}
                onExpand={handleExpand}
                onCollapseExpand={handleCollapseExpand}
                onPromptDelete={openDelete}
                onPromptMove={openMove}
              />
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>

      {/* ===================== DIALOG: EXCLUIR ===================== */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
              Deletar item do catálogo
            </DialogTitle>
            <DialogDescription className="text-zinc-500 ">
              Esta ação é irreversível. Ao deletar, todas as informações deste item no catálogo serão perdidas.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="">
            <Button variant="ghost" onClick={closeDelete}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
              <Trash size={16} /> {deleting ? "Deletando…" : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== DIALOG: MOVIMENTAR (opcional) ===================== */}
      <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <DialogContent>
          <DialogHeader className="pt-8 px-6 flex flex-col items-center">
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[520px] text-center">
              Movimentar item do catálogo
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-center">
              Selecione um status e (opcionalmente) escreva uma observação para registrar no histórico do item.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={moveStatus} onValueChange={setMoveStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {(props.workflowOptions || []).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observação</label>
              <Input
                value={moveObs}
                onChange={(e) => setMoveObs(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <DialogFooter className="py-4 px-6">
            <Button variant="ghost" onClick={closeMove}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button onClick={handleConfirmMove} disabled={!moveStatus || moving}>
              <Repeat size={16} /> {moving ? "Salvando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
