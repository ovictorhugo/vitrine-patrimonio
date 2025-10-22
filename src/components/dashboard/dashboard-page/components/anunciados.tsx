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
import { Separator } from "../../../ui/separator";
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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../ui/carousel";

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
    { key: "DESCARTADOS", name: "Processo Finalizado",Icon: Recycle },
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

/* =========================
   Utils
========================= */
const lastWorkflow = (entry: CatalogEntry): WorkflowHistoryItem | undefined => {
  const hist = entry.workflow_history ?? [];
  if (!hist.length) return undefined;
  return hist[0];
};

const PAGE_SIZE = 24;

/* ===== Helpers para CSV ===== */
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
   Subcomponente: Accordion por status
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

  type ItemHandlers = { onPromptMove?: () => void; onPromptDelete?: () => void };
  const getItemHandlersForStatus = useCallback(
    (_statusKey: string): ItemHandlers => {
      switch (_statusKey) {
        case "AGUARDANDO_TRANSFERENCIA":
          return { onPromptMove: () => toast.info("Transferir item (implemente).") };
        case "ADJUSTMENT_VITRINE":
        case "ADJUSTMENT_DESFAZIMENTO":
          return { onPromptMove: () => toast.info("Resolver ajustes (implemente).") };
        case "DESFAZIMENTO":
          return { onPromptDelete: () => toast.info("Concluir desfazimento (implemente).") };
        default:
          return {};
      }
    },
    []
  );

  // Reset local se o accordion fechar enquanto estava expandido
  useEffect(() => {
    if (!isOpen && expanded) {
      setExpanded(false);
      onCollapseExpand();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <AccordionItem value={statusKey}>
    <div className="flex gap-4 w-full justify-between items-center ">
          {/* onClick no Trigger para fechar em 1 clique quando estiver expandido */}
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
                <Download size={16} className="" />
                Baixar resultado
              </Button>

              {/* Agora só aparece se o accordion estiver aberto E houver itens */}
              {isOpen && !expanded && items.length > 0 ? (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(true);
                    onExpand(statusKey); // entra no modo “somente este”
                    rafMeasure();
                  }}
                >
                  <Maximize2 size={16} className="" />
                  Expandir
                </Button>
              ) : null}

              {isOpen && expanded ? (
                <Button
                
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(false);
                    onCollapseExpand(); // sai do modo “somente este”
                    rafMeasure();
                  }}
                >
                  <ChevronLeft size={16} className="" />
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
            // se está expandido e o trigger for clicado, desfaz expandido
            setExpanded(false);
            onCollapseExpand(); // sai do modo “somente este”
          }
        }}
      >
       
      </AccordionTrigger>
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
                            {...getItemHandlersForStatus(statusKey)}
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
            // ======= MODO EXPANDIDO: grade com "Mostrar mais" =======
            <div className="">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                {(items || []).slice(0, visible).map((item) => (
                  <ItemPatrimonio
                    key={item.id}
                    {...item}
                    {...getItemHandlersForStatus(statusKey)}
                  />
                ))}
              </div>

              {(items || []).length > visible ? (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      showMore();
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
export function Anunciados() {
  const navigate = useNavigate();
  const location = useLocation();
  const { urlGeral, user } = useContext(UserContext);

  const token = useMemo(
    () => (typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null),
    []
  );
  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // Abas Vitrine / Desfazimento
  const [tab, setTab] = useState<BoardKind>("vitrine");

  // Catálogo
  const [loadingItems, setLoadingItems] = useState(false);
  const [entries, setEntries] = useState<CatalogEntry[]>([]);

  // Chaves padrão abertas
  const allVitrineKeys = WORKFLOWS.vitrine.map((w) => w.key);
  const allDesfazKeys = WORKFLOWS.desfazimento.map((w) => w.key);

  // Estado de abertura por aba (controlado só para sabermos se está aberto)
  const [openKeysVitrine, setOpenKeysVitrine] = useState<string[]>(allVitrineKeys);
  const [openKeysDesfaz, setOpenKeysDesfaz] = useState<string[]>(allDesfazKeys);

  // Qual está “focado” (Expandir → mostra só ele)
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  const keysForTab = (t: BoardKind) => (t === "vitrine" ? allVitrineKeys : allDesfazKeys);

  // ====== FETCH: Catálogo ======
  const fetchCatalog = useCallback(async () => {
    if (!urlGeral) return;
    setLoadingItems(true);
    try {
      const res = await fetch(`${urlGeral}catalog/?user_id=${user?.id}`, { headers: authHeaders });
      if (!res.ok) throw new Error();
      const json: CatalogResponse = await res.json();
      setEntries(json?.catalog_entries ?? []);
    } catch {
      toast.error("Falha ao carregar itens.");
    } finally {
      setLoadingItems(false);
    }
  }, [urlGeral, authHeaders]);

  useEffect(() => {
    fetchCatalog();
    setFocusedKey(null); // ao trocar de aba, sai do modo focado
    // reabre todos por padrão ao trocar de aba:
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

  // callbacks para focar/desfocar ao Expandir/Voltar
  const handleExpand = (key: string) => setFocusedKey(key);
  const handleCollapseExpand = () => setFocusedKey(null);

  // Qual conjunto de chaves abertas usar conforme a aba
  const openKeys = tab === "vitrine" ? openKeysVitrine : openKeysDesfaz;
  const setOpenKeys = tab === "vitrine" ? setOpenKeysVitrine : setOpenKeysDesfaz;

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
        {/* === Cards de resumo (sem clique) === */}
        <TabsContent value="vitrine" className="p-0 m-0">

            <Carousel className="w-full flex gap-4 px-4 items-center">
                    <div className="absolute left-0 z-[9]">
                      <CarouselPrevious className="" />
                    </div>
                    <CarouselContent className="gap-4">
                      {WORKFLOWS.vitrine.map(({key, name}) => {
                          const { Icon } = getMeta(key);
                const count = counts[key] ?? 0;
                      return(
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
                      )})}
                    </CarouselContent>
                    <div className="absolute right-0 z-[9]">
                      <CarouselNext />
                    </div>
                  </Carousel>

         

          {/* === Accordions (controlado só para sabermos quais estão abertos) === */}
          <Accordion
            type="multiple"
            value={
              focusedKey
                ? openKeys.filter((k) => k === focusedKey) // quando focado, só o aberto
                : openKeys
            }
            onValueChange={(v) => {
              const next = Array.isArray(v) ? v : [];
              // 🔁 RESET ao fechar o accordion focado
              if (focusedKey && !next.includes(focusedKey)) {
                setFocusedKey(null); // sai do modo focado
                setOpenKeysVitrine(allVitrineKeys); // reabre padrão dessa aba
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
              />
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="desfazimento" className="p-0 m-0">
            <Carousel className="w-full flex gap-4 px-4 items-center">
                    <div className="absolute left-0 z-[9]">
                      <CarouselPrevious className="" />
                    </div>
                    <CarouselContent className="gap-4">
                      {WORKFLOWS.desfazimento.map(({key, name}) => {
                          const { Icon } = getMeta(key);
                const count = counts[key] ?? 0;
                      return(
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
                      )})}
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
              // 🔁 RESET ao fechar o accordion focado
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
              />
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}
