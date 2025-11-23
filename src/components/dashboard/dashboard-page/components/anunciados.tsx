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
  Loader,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Input } from "../../../ui/input";
import { ArrowUUpLeft, MagnifyingGlass, Repeat } from "phosphor-react";
import { handleDownloadXlsx } from "../../itens-vitrine/handle-download";
import { GraficoStatusCatalogo } from "./chart-workflows";
import { Combobox, ComboboxItem } from "../../itens-vitrine/itens-vitrine";
import { Separator } from "../../../ui/separator";

/* =========================
   Tipos mínimos do backend
========================= */
type UUID = string;

type Material = { material_code: string; material_name: string; id: UUID };
type LegalGuardian = {
  legal_guardians_code: string;
  legal_guardians_name: string;
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

type CatalogResponse = { catalog_entries: CatalogEntry[]; total?: number };

/* =========================
   Metadados de workflow
========================= */
const WORKFLOWS = {
  vitrine: [
    {
      key: "REVIEW_REQUESTED_VITRINE",
      name: "Avaliação S. Patrimônio - Vitrine",
      Icon: Hourglass,
    },
    { key: "ADJUSTMENT_VITRINE", name: "Ajustes - Vitrine", Icon: Wrench },
    { key: "VITRINE", name: "Anunciados", Icon: Store },
    {
      key: "AGUARDANDO_TRANSFERENCIA",
      name: "Aguardando transferência",
      Icon: Clock,
    },
    { key: "TRANSFERIDOS", name: "Transferidos", Icon: Archive },
  ],
  desfazimento: [
    {
      key: "REVIEW_REQUESTED_DESFAZIMENTO",
      name: "Avaliação S. Patrimônio - Desfazimento",
      Icon: Hourglass,
    },
    { key: "ADJUSTMENT_DESFAZIMENTO", name: "Ajustes - Desfazimento", Icon: Wrench },
    {
      key: "REVIEW_REQUESTED_COMISSION",
      name: "LTD - Lista Temporária de Desfazimento",
      Icon: ListTodo,
    },
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

const PAGE_SIZE = 24;

/* ===== Helpers URL/filtro ===== */
type CatalogFilter = { type: string; value: string };
const sanitizeBaseUrl = (u?: string) => (u || "").replace(/\/+$/, "");

/* ===== Helpers CSV ===== */
const flattenObject = (
  obj: any,
  prefix = "",
  out: Record<string, any> = {}
): Record<string, any> => {
  if (obj == null) return out;
  if (Array.isArray(obj)) {
    const key = prefix.slice(0, -1);
    out[key] = obj.every((v) => typeof v !== "object" || v === null)
      ? obj.join("|")
      : JSON.stringify(obj);
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
  const lines = [
    headers.join(";"),
    ...flattened.map((row) =>
      headers.map((h) => esc((row as any)[h])).join(";")
    ),
  ];
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
  onDownloadXlsx,
  isOpen,
  onExpand,
  onCollapseExpand,
  onPromptDelete,
  onPromptMove,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  total,
}: {
  statusKey: string;
  title: string;
  icon: React.ComponentType<any>;
  items: CatalogEntry[];
  loading: boolean;
  onDownloadXlsx: () => void;
  isOpen: boolean;
  onExpand: (key: string) => void;
  onCollapseExpand: () => void;
  onPromptDelete: (catalogId: string) => void;
  onPromptMove: (catalogId: string) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: (key: string) => void;
  total?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const effectiveTotal =
    typeof total === "number" ? total : (items?.length ?? 0);

  useEffect(() => {
    if (!expanded) setVisible(PAGE_SIZE);
  }, [expanded]);

  const showMoreLocal = () => {
    const nextVisible = visible + PAGE_SIZE;

    // Se já consumimos todos os itens carregados e ainda há mais no backend, pede mais
    if (nextVisible > items.length && hasMore && onLoadMore) {
      onLoadMore(statusKey);
    }

    setVisible(nextVisible);
  };

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
              <Badge variant="outline">
                {loading ? "…" : effectiveTotal}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadXlsx();
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
                  !canScrollLeft || disableNav
                    ? "opacity-30 cursor-not-allowed"
                    : ""
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
                        <Skeleton
                          key={i}
                          className="w-64 aspect-square rounded-lg"
                        />
                      ))
                    ) : items.length === 0 ? (
                      <div className="w-full pr-4">
                        <Alert variant="default">
                          Nenhum item para este status.
                        </Alert>
                      </div>
                    ) : (
                      <>
                        {items.map((item) => (
                          <div className="w-64 min-w-64" key={item.id}>
                            <ItemPatrimonio
                              {...item}
                              onPromptDelete={() => onPromptDelete(item.id)}
                              onPromptMove={() => onPromptMove(item.id)}
                            />
                          </div>
                        ))}

                        {/* Card extra: Carregar mais */}
                        {hasMore && (
                          <div className="">
                            <Alert
                          className="w-64 min-w-64 flex-col gap-2 dark:hover:bg-neutral-800 h-full flex items-center justify-center hover:bg-neutral-100 transition-all cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!loadingMore && onLoadMore) {
                                  onLoadMore(statusKey);
                                }
                              }}
                             
                            >
                             <div >
                               {loadingMore ? (
                            
                                  <Loader size={32} className="animate-spin" />
                               
                              ) : (
                            
                                  <Plus size={32} className="" />
                            
                             
                              )}
                             </div>

                              <div>
                               {loadingMore ? (
                                <>
                               
                                  Carregando…
                                </>
                              ) : (
                                <>
                                
                                  Carregar mais
                                </>
                              )}
                             </div>
                            </Alert>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button
                aria-label="Rolar para a direita"
                variant="outline"
                size="sm"
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 ${
                  !canScrollRight || disableNav
                    ? "opacity-30 cursor-not-allowed"
                    : ""
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
            // ======= MODO EXPANDIDO: grid com "Mostrar mais" / "Carregar mais"
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

           

              <div className="flex justify-center mt-8">
                {loadingMore ? (
                  <Button disabled>
                    <Loader size={16} className="animate-spin" /> Carregando…
                  </Button>
                ) : (items || []).length > visible || hasMore ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      showMoreLocal();
                    }}
                  >
                    <Plus size={16} /> Mostrar mais
                  </Button>
                ) : null}
              </div>
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
  filter?: CatalogFilter;
  workflowOptions?: string[];
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { urlGeral, user } = useContext(UserContext);
  const baseUrl = useMemo(() => sanitizeBaseUrl(urlGeral), [urlGeral]);

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("jwt_token") || ""
        : "",
    []
  );
  const authHeaders: HeadersInit = useMemo(() => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);


  // ===== debounce helper =====
function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// buscas (texto)
const [q, setQ] = useState("");

// queries dos combobox
const [materialQ, setMaterialQ] = useState("");
const [guardianQ, setGuardianQ] = useState("");
const [unitQ, setUnitQ] = useState("");
const [agencyQ, setAgencyQ] = useState("");
const [sectorQ, setSectorQ] = useState("");
const [locationQ, setLocationQ] = useState("");

const materialQd = useDebounced(materialQ);
const guardianQd = useDebounced(guardianQ);
const unitQd = useDebounced(unitQ);
const agencyQd = useDebounced(agencyQ);
const sectorQd = useDebounced(sectorQ);
const locationQd = useDebounced(locationQ);

const [materials, setMaterials] = useState<Material[]>([]);
const [loadingMaterials, setLoadingMaterials] = useState(false);
const [materialId, setMaterialId] = useState<UUID | null>(null);

useEffect(() => {
  (async () => {
    try {
      setLoadingMaterials(true);
      const qs = materialQd ? `?q=${encodeURIComponent(materialQd)}` : "";
      const res = await fetch(`${baseUrl}/materials/${qs}`, {
        headers: authHeaders,
      });
      const json = await res.json();
      setMaterials(json?.materials ?? []);
    } catch {
      setMaterials([]);
      toast.error("Falha ao carregar materiais");
    } finally {
      setLoadingMaterials(false);
    }
  })();
}, [baseUrl, authHeaders, materialQd]);

const [guardians, setGuardians] = useState<LegalGuardian[]>([]);
const [loadingGuardians, setLoadingGuardians] = useState(false);
const [guardianId, setGuardianId] = useState<UUID | null>(null);

useEffect(() => {
  (async () => {
    try {
      setLoadingGuardians(true);
      const qs = guardianQd ? `?q=${encodeURIComponent(guardianQd)}` : "";
      const res = await fetch(`${baseUrl}/legal-guardians/${qs}`, {
        headers: authHeaders,
      });
      const json = await res.json();
      setGuardians(json?.legal_guardians ?? []);
    } catch {
      setGuardians([]);
      toast.error("Falha ao carregar responsáveis");
    } finally {
      setLoadingGuardians(false);
    }
  })();
}, [baseUrl, authHeaders, guardianQd]);

type UnitDTO = { id: UUID; unit_name: string; unit_code: string; unit_siaf: string };
type AgencyDTO = { id: UUID; agency_name: string; agency_code: string };
type SectorDTO = { id: UUID; sector_name: string; sector_code: string };
type LocationDTO = { id: UUID; location_name: string; location_code: string };

const [units, setUnits] = useState<UnitDTO[]>([]);
const [agencies, setAgencies] = useState<AgencyDTO[]>([]);
const [sectors, setSectors] = useState<SectorDTO[]>([]);
const [locations, setLocations] = useState<LocationDTO[]>([]);

const [loadingUnits, setLoadingUnits] = useState(false);
const [loadingAgencies, setLoadingAgencies] = useState(false);
const [loadingSectors, setLoadingSectors] = useState(false);
const [loadingLocations, setLoadingLocations] = useState(false);

const [unitId, setUnitId] = useState<UUID | null>(null);
const [agencyId, setAgencyId] = useState<UUID | null>(null);
const [sectorId, setSectorId] = useState<UUID | null>(null);
const [locationId, setLocationId] = useState<UUID | null>(null);


// 🔹 itens do Combobox de materiais
const materialItems: ComboboxItem[] = (materials ?? []).map((m) => ({
  id: m.id,
  code: m.material_code,
  label: m.material_name || m.material_code,
}));

// 🔹 itens do Combobox de responsáveis legais
const guardianItems: ComboboxItem[] = (guardians ?? []).map((g) => ({
  id: g.id,
  code: g.legal_guardians_code,
  label: g.legal_guardians_name || g.legal_guardians_code,
}));
// Units
useEffect(() => {
  (async () => {
    try {
      setLoadingUnits(true);
      const qs = unitQd ? `?q=${encodeURIComponent(unitQd)}` : "";
      const res = await fetch(`${baseUrl}/units/${qs}`, { headers: authHeaders });
      const json = await res.json();
      setUnits(json?.units ?? []);
    } catch {
      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  })();
}, [baseUrl, authHeaders, unitQd]);

// Agencies
const fetchAgencies = useCallback(async (uid: UUID, q?: string) => {
  if (!uid) return setAgencies([]);
  try {
    setLoadingAgencies(true);
    const params = new URLSearchParams({ unit_id: uid });
    if (q) params.set("q", q);
    const res = await fetch(`${baseUrl}/agencies/?${params.toString()}`, {
      headers: authHeaders,
    });
    const json = await res.json();
    setAgencies(json?.agencies ?? []);
  } catch {
    setAgencies([]);
  } finally {
    setLoadingAgencies(false);
  }
}, [baseUrl, authHeaders]);

// Sectors
const fetchSectors = useCallback(async (aid: UUID, q?: string) => {
  if (!aid) return setSectors([]);
  try {
    setLoadingSectors(true);
    const params = new URLSearchParams({ agency_id: aid });
    if (q) params.set("q", q);
    const res = await fetch(`${baseUrl}/sectors/?${params.toString()}`, {
      headers: authHeaders,
    });
    const json = await res.json();
    setSectors(json?.sectors ?? []);
  } catch {
    setSectors([]);
  } finally {
    setLoadingSectors(false);
  }
}, [baseUrl, authHeaders]);

// Locations
const fetchLocations = useCallback(async (sid: UUID, q?: string) => {
  if (!sid) return setLocations([]);
  try {
    setLoadingLocations(true);
    const params = new URLSearchParams({ sector_id: sid });
    if (q) params.set("q", q);
    const res = await fetch(`${baseUrl}/locations/?${params.toString()}`, {
      headers: authHeaders,
    });
    const json = await res.json();
    setLocations(json?.locations ?? []);
  } catch {
    setLocations([]);
  } finally {
    setLoadingLocations(false);
  }
}, [baseUrl, authHeaders]);

// Cascata
useEffect(() => {
  setAgencyId(null);
  setSectorId(null);
  setLocationId(null);
  setAgencies([]);
  setSectors([]);
  setLocations([]);
  if (unitId) fetchAgencies(unitId, agencyQd);
}, [unitId, agencyQd, fetchAgencies]);

useEffect(() => {
  setSectorId(null);
  setLocationId(null);
  setSectors([]);
  setLocations([]);
  if (agencyId) fetchSectors(agencyId, sectorQd);
}, [agencyId, sectorQd, fetchSectors]);

useEffect(() => {
  setLocationId(null);
  setLocations([]);
  if (sectorId) fetchLocations(sectorId, locationQd);
}, [sectorId, locationQd, fetchLocations]);


  type BoardState = BoardKind;
  const [tab, setTab] = useState<BoardState>("desfazimento");

  // Querystring / filtro vinda da URL
  const qs = new URLSearchParams(location.search);
  const urlType = qs.get("type") ?? undefined;
  const urlValue = qs.get("value") ?? undefined;

  const filter: CatalogFilter | undefined =
    props.filter ??
    (urlType && urlValue ? { type: urlType, value: urlValue } : undefined);

  // ===== Roles (comissão) filtráveis =====
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .toUpperCase();

  const comissaoRoles = user?.roles?.filter((role) =>
    normalize(role.name).includes("CAL")
  );

  // role_id derivado da URL / props / primeira comissão disponível
  const selectedRoleId = useMemo(() => {
    const urlRoleId =
      urlType === "role_id" && urlValue ? urlValue : undefined;

    const propRoleId =
      props.filter?.type === "role_id" && props.filter.value
        ? props.filter.value
        : undefined;

    // Prioridade:
    // 1) role_id da URL (se tiver e não for vazio)
    // 2) role_id vindo por props (se tiver e não for vazio)
    // 3) primeiro item de comissaoRoles (fallback padrão)
    return urlRoleId || propRoleId || (comissaoRoles?.[0]?.id ?? "");
  }, [urlType, urlValue, props.filter, comissaoRoles]);

  const isRoleFilterActive =
    props.filter?.type === "role_id" || urlType === "role_id";

  const handleChangeRole = (value: string) => {
    const params = new URLSearchParams(location.search);
    params.set("type", "role_id");
    params.set("value", value);
    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  // Assinatura estável dos filtros
const filtersSignature = useMemo(() => {
  const effectiveType = props.filter?.type ?? urlType;
  const effectiveValue = props.filter?.value ?? urlValue;

  const roleIdToUse =
    effectiveType === "role_id"
      ? selectedRoleId || effectiveValue || ""
      : "";

  return JSON.stringify({
    type: effectiveType ?? null,
    value: effectiveValue ?? null,
    roleId: roleIdToUse || null,

    materialId: materialId || null,
    guardianId: guardianId || null,
    unitId: unitId || null,
    agencyId: agencyId || null,
    sectorId: sectorId || null,
    locationId: locationId || null,
    q: q?.trim() || null,
  });
}, [
  props.filter,
  urlType,
  urlValue,
  selectedRoleId,
  materialId,
  guardianId,
  unitId,
  agencyId,
  sectorId,
  locationId,
  q,
]);

  // ---------- estado por workflow (board) ----------
  const [board, setBoard] = useState<Record<string, CatalogEntry[]>>({});
  const [loadingByStatus, setLoadingByStatus] = useState<
    Record<string, boolean>
  >({});
  const [loadingPageByStatus, setLoadingPageByStatus] = useState<
    Record<string, boolean>
  >({});
  const [offsetByStatus, setOffsetByStatus] = useState<Record<string, number>>(
    {}
  );
  const [totalByStatus, setTotalByStatus] = useState<Record<string, number>>(
    {}
  );
  const [loadingAny, setLoadingAny] = useState(false);

  // Estatísticas globais por status
  const [statsCounts, setStatsCounts] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(false);

  // Aberturas padrão
  const allVitrineKeys = WORKFLOWS.vitrine.map((w) => w.key);
  const allDesfazKeys = WORKFLOWS.desfazimento.map((w) => w.key);
  const [openKeysVitrine, setOpenKeysVitrine] =
    useState<string[]>(allVitrineKeys);
  const [openKeysDesfaz, setOpenKeysDesfaz] =
    useState<string[]>(allDesfazKeys);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  // ===== DELETE =====
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openDelete = (catalogId: string) => {
    setDeleteTargetId(catalogId);
    setIsDeleteOpen(true);
  };
  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeleteTargetId(null);
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTargetId || !baseUrl) return;
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
      let fromKeyLocal: string | undefined;
      setBoard((prev) => {
        const next: Record<string, CatalogEntry[]> = {};
        for (const [k, arr] of Object.entries(prev)) {
          const exists = arr.some((it) => it.id === deleteTargetId);
          if (exists) {
            fromKeyLocal = k;
            next[k] = arr.filter((it) => it.id !== deleteTargetId);
          } else {
            next[k] = arr;
          }
        }
        return next;
      });
      if (fromKeyLocal) {
        adjustCountsOnMove(fromKeyLocal, undefined);
      }
      toast("Item excluído com sucesso.");
      closeDelete();
      try {
        window.dispatchEvent(
          new CustomEvent("catalog:deleted", { detail: { id: deleteTargetId } })
        );
      } catch {}
    } catch (e: any) {
      toast("Erro ao excluir", {
        description: e?.message || "Tente novamente.",
      });
    } finally {
      setDeleting(false);
    }
  }, [deleteTargetId, baseUrl, token]);

  // ===== MOVIMENTAR =====
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
  const closeMove = () => {
    setIsMoveOpen(false);
    setMoveTargetId(null);
    setMoveStatus("");
    setMoveObs("");
  };

  /* ====== Helpers de filtros comuns ====== */
 const buildCommonParams = useCallback(() => {
  const params = new URLSearchParams();

  // filtros vindos de props/URL continuam valendo
  const effectiveType = props.filter?.type ?? urlType;
  const effectiveValue = props.filter?.value ?? urlValue;

  if (effectiveType === "user_id" && effectiveValue) {
    params.set("user_id", effectiveValue);
  }

  if (effectiveType === "location_id" && effectiveValue) {
    params.set("location_id", effectiveValue);
  }

  const roleIdToUse =
    effectiveType === "role_id"
      ? selectedRoleId || effectiveValue || ""
      : "";

  if (roleIdToUse) {
    params.set("role_id", roleIdToUse);
  }

  // ✅ NOVOS filtros (iguais ao ItensVitrine)
  if (materialId) params.set("material_id", materialId);
  if (guardianId) params.set("legal_guardian_id", guardianId);
  if (unitId) params.set("unit_id", unitId);
  if (agencyId) params.set("agency_id", agencyId);
  if (sectorId) params.set("sector_id", sectorId);
  if (locationId) params.set("location_id", locationId);
  if (q?.trim()) params.set("q", q.trim());

  return params;
}, [
  props.filter,
  selectedRoleId,
  urlType,
  urlValue,
  materialId,
  guardianId,
  unitId,
  agencyId,
  sectorId,
  locationId,
  q,
]);

  const buildParamsForStatus = useCallback(
    (statusKey: string, offset = 0, limit = PAGE_SIZE) => {
      const params = buildCommonParams();
      params.set("workflow_status", statusKey);
      params.set("offset", String(offset));
      params.set("limit", String(limit));
      return params;
    },
    [buildCommonParams]
  );

  /* ====== Fetch por status ====== */
  const fetchStatus = useCallback(
    async (statusKey: string, offset = 0, append = false) => {
      if (!baseUrl || !statusKey) return;
      try {
        setLoadingByStatus((prev) => ({ ...prev, [statusKey]: !append }));
        setLoadingPageByStatus((prev) => ({ ...prev, [statusKey]: append }));

        const params = buildParamsForStatus(statusKey, offset, PAGE_SIZE);
        const url = `${baseUrl}/catalog/?${params.toString()}`;
        const res = await fetch(url, { headers: authHeaders });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: CatalogResponse = await res.json();
        const newEntries = json?.catalog_entries ?? [];

        setBoard((prev) => ({
          ...prev,
          [statusKey]: append
            ? [...(prev[statusKey] ?? []), ...newEntries]
            : newEntries,
        }));

        setOffsetByStatus((prev) => ({
          ...prev,
          [statusKey]: append ? offset + PAGE_SIZE : PAGE_SIZE,
        }));
        if (typeof json.total === "number") {
          setTotalByStatus((prev) => ({
            ...prev,
            [statusKey]: json.total as number,
          }));
        }
      } catch (e) {
        console.error(e);
        toast.error(`Falha ao carregar ${statusKey}.`);
      } finally {
        setLoadingByStatus((prev) => ({ ...prev, [statusKey]: false }));
        setLoadingPageByStatus((prev) => ({ ...prev, [statusKey]: false }));
      }
    },
    [baseUrl, authHeaders, buildParamsForStatus]
  );

  /* ====== Fetch das estatísticas (counts) ====== */
  const fetchCounts = useCallback(async () => {
    if (!baseUrl) return;
    try {
      setLoadingStats(true);
      const params = buildCommonParams();
      const url = `${baseUrl}/statistics/catalog/count-by-workflow-status?${params.toString()}`;

      const res = await fetch(url, { headers: authHeaders });

      if (res.status === 503) {
        console.warn(
          "API de estatísticas indisponível (503). Mantendo contadores atuais."
        );
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: { status: string; count: number }[] = await res.json();
      const map: Record<string, number> = {};
      json.forEach((item) => {
        if (!item?.status) return;
        map[item.status] = item.count ?? 0;
      });

      setStatsCounts(map);
      // Mescla também em totalByStatus, para usar no hasMore
      setTotalByStatus((prev) => ({ ...prev, ...map }));
    } catch (e) {
      console.error(e);
      toast.error("Falha ao carregar estatísticas.");
    } finally {
      setLoadingStats(false);
    }
  }, [baseUrl, authHeaders, buildCommonParams]);

  /* ====== Ajustar contadores localmente em movimentações ====== */
  const adjustCountsOnMove = useCallback(
    (fromKey?: string, toKey?: string) => {
      if (!fromKey && !toKey) return;

      setStatsCounts((prev) => {
        const next = { ...prev };
        if (fromKey) {
          const current = next[fromKey] ?? 0;
          next[fromKey] = Math.max(current - 1, 0);
        }
        if (toKey) {
          const current = next[toKey] ?? 0;
          next[toKey] = current + 1;
        }
        return next;
      });

      setTotalByStatus((prev) => {
        const next = { ...prev };
        if (fromKey) {
          const current = next[fromKey] ?? 0;
          next[fromKey] = Math.max(current - 1, 0);
        }
        if (toKey) {
          const current = next[toKey] ?? 0;
          next[toKey] = current + 1;
        }
        return next;
      });
    },
    []
  );

  const handleConfirmMove = useCallback(async () => {
    if (!moveTargetId || !moveStatus || !baseUrl) return;
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

      let fromStatusKey: string | undefined;
      setBoard((prev) => {
        let movedItem: CatalogEntry | null = null;
        const cleaned: Record<string, CatalogEntry[]> = {};
        for (const [k, arr] of Object.entries(prev)) {
          const idx = arr.findIndex((e) => e.id === moveTargetId);
          if (idx >= 0) {
            fromStatusKey = k;
            movedItem = arr[idx];
            cleaned[k] = [...arr.slice(0, idx), ...arr.slice(idx + 1)];
          } else {
            cleaned[k] = arr;
          }
        }
        if (movedItem) {
          const newHistory: WorkflowHistoryItem = {
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,
            catalog_id: movedItem.id,
            workflow_status: moveStatus,
            detail: {},
            created_at: new Date().toISOString(),
            user: movedItem.user ?? null,
          };
          const updated = {
            ...movedItem,
            workflow_history: [newHistory, ...(movedItem.workflow_history ?? [])],
          };
          cleaned[moveStatus] = [updated, ...(cleaned[moveStatus] ?? [])];
        }
        return cleaned;
      });

      if (fromStatusKey) {
        adjustCountsOnMove(fromStatusKey, moveStatus);
      }

      try {
        window.dispatchEvent(
          new CustomEvent("catalog:workflow-updated", {
            detail: { id: moveTargetId, newStatus: moveStatus },
          })
        );
      } catch {}

      toast("Movimentação registrada!");
      closeMove();
    } catch (e: any) {
      toast("Erro ao movimentar", { description: e?.message || "Tente novamente." });
    } finally {
      setMoving(false);
    }
  }, [moveTargetId, moveStatus, moveObs, baseUrl, authHeaders, adjustCountsOnMove]);

  /* ====== Efeito principal: carregar quando tab/filtros mudam ====== */
  useEffect(() => {
    if (!baseUrl) return;

    setFocusedKey(null);
    setOpenKeysVitrine(allVitrineKeys);
    setOpenKeysDesfaz(allDesfazKeys);

    let cancelled = false;

    const load = async () => {
      setLoadingAny(true);
      setBoard({});
      setOffsetByStatus({});
      setTotalByStatus({});

      const keys = (
        tab === "vitrine" ? WORKFLOWS.vitrine : WORKFLOWS.desfazimento
      ).map((w) => w.key);

      try {
        // 👉 carrega uma coluna por vez, para evitar sobrecarga/503
        for (const key of keys) {
          if (cancelled) break;
          await fetchStatus(key, 0, false);
        }
        if (!cancelled) {
          await fetchCounts();
        }
      } finally {
        if (!cancelled) {
          setLoadingAny(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filtersSignature, baseUrl, fetchStatus, fetchCounts]);

  const counts = useMemo(() => statsCounts, [statsCounts]);

  const getMeta = (statusKey: string) =>
    WORKFLOW_STATUS_META[statusKey] ?? {
      Icon: HelpCircle,
      colorClass: "text-zinc-500",
    };

  // ====== Exportações ======
  const downloadCsvFor = (statusKey: string, statusName: string) => {
    try {
      const data = (board[statusKey] ?? []).map(
        ({ workflow_history, ...rest }) => rest
      );
      const csv = convertJsonToCsv(data);
      const blob = new Blob([csv], {
        type: "text/csv;charset=windows-1252;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `itens_${statusName
        .replace(/\s+/g, "_")
        .toLowerCase()}.csv`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Falha ao gerar CSV.");
    }
  };

  const downloadXlsxFor = async (statusKey: string, statusName: string) => {
    const itemsToExport = board[statusKey] ?? [];
    if (!Array.isArray(itemsToExport) || itemsToExport.length === 0) {
      toast.error("Nada para exportar.");
      return;
    }
    const urlBaseWithSlash = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    await handleDownloadXlsx({
      items: itemsToExport,
      urlBase: urlBaseWithSlash,
      sheetName: "Itens",
      filename: `itens_${statusName
        .replace(/\s+/g, "_")
        .toLowerCase()}.xlsx`,
    });
  };

  const downloadAllXlsx = async () => {
    const allItems = Object.values(board).flat();
    if (!allItems.length) {
      toast.error("Nada para exportar.");
      return;
    }
    const urlBaseWithSlash = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    await handleDownloadXlsx({
      items: allItems,
      urlBase: urlBaseWithSlash,
      sheetName: "Itens",
      filename: "itens_todos.xlsx",
    });
  };

  // foco expand/voltar
  const handleExpand = (key: string) => setFocusedKey(key);
  const handleCollapseExpand = () => setFocusedKey(null);

  const openKeys = tab === "vitrine" ? openKeysVitrine : openKeysDesfaz;
  const setOpenKeys =
    tab === "vitrine" ? setOpenKeysVitrine : setOpenKeysDesfaz;

  // Eventos globais para sincronizar remoções/movimentações oriundas de outros componentes
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { id?: string; newStatus?: string } | undefined;
      const id = detail?.id;
      const newStatus = (detail?.newStatus || "").trim();
      if (!id) return;

      let fromKeyLocal: string | undefined;

      setBoard((prev) => {
        let moved: CatalogEntry | null = null;
        const next: Record<string, CatalogEntry[]> = {};
        for (const [k, arr] of Object.entries(prev)) {
          const idx = arr.findIndex((it) => it.id === id);
          if (idx >= 0) {
            fromKeyLocal = k;
            moved = arr[idx];
            next[k] = [...arr.slice(0, idx), ...arr.slice(idx + 1)];
          } else {
            next[k] = arr;
          }
        }
        if (moved && newStatus) {
          const newHistoryItem: WorkflowHistoryItem = {
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,
            catalog_id: moved.id,
            workflow_status: newStatus,
            detail: {},
            created_at: new Date().toISOString(),
            user: moved.user ?? null,
          };
          const updated = {
            ...moved,
            workflow_history: [newHistoryItem, ...(moved.workflow_history ?? [])],
          };
          next[newStatus] = [updated, ...(next[newStatus] ?? [])];
        }
        return next;
      });

      if (fromKeyLocal && newStatus) {
        adjustCountsOnMove(fromKeyLocal, newStatus);
      }
    };

    window.addEventListener(
      "catalog:workflow-updated" as any,
      handler as any
    );
    return () =>
      window.removeEventListener(
        "catalog:workflow-updated" as any,
        handler as any
      );
  }, [adjustCountsOnMove]);

  useEffect(() => {
    const handler = (e: any) => {
      const id = e?.detail?.id as string | undefined;
      if (!id) return;

      let fromKeyLocal: string | undefined;

      setBoard((prev) => {
        const next: Record<string, CatalogEntry[]> = {};
        for (const [k, arr] of Object.entries(prev)) {
          const exists = arr.some((it) => it.id === id);
          if (exists) {
            fromKeyLocal = k;
            next[k] = arr.filter((it) => it.id !== id);
          } else {
            next[k] = arr;
          }
        }
        return next;
      });

      if (fromKeyLocal) {
        adjustCountsOnMove(fromKeyLocal, undefined);
      }
    };
    window.addEventListener("catalog:deleted" as any, handler as any);
    return () =>
      window.removeEventListener("catalog:deleted" as any, handler as any);
  }, [adjustCountsOnMove]);

  // hasMore por status usando totalByStatus + statsCounts + fallback
  const hasMoreFor = (statusKey: string) => {
    const totalFromBackend = totalByStatus[statusKey];
    const totalFromStats = statsCounts[statusKey];
    const loaded = board[statusKey]?.length ?? 0;

    let effectiveTotal: number | undefined;
    if (
      typeof totalFromBackend === "number" &&
      totalFromBackend >= loaded
    ) {
      effectiveTotal = totalFromBackend;
    } else if (
      typeof totalFromStats === "number" &&
      totalFromStats >= loaded
    ) {
      effectiveTotal = totalFromStats;
    }

    if (effectiveTotal != null) {
      return loaded < effectiveTotal;
    }

    // fallback: se não sabemos o total, mas o número de itens é múltiplo da página,
    // ainda pode haver mais
    return loaded > 0 && loaded % PAGE_SIZE === 0;
  };

const onLoadMoreStatus = (statusKey: string) => {
  const currentOffset = offsetByStatus[statusKey] ?? 0;
  fetchStatus(statusKey, currentOffset, true);
};


/////////scrool
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
  return (
    <div className="flex flex-col gap-8 p-8 pt-0">
      {/* Header com toggle de abas */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {isRoleFilterActive && (
            <Select onValueChange={handleChangeRole} value={selectedRoleId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Selecione uma Comissão" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {comissaoRoles?.length ? (
                  comissaoRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 px-3 py-2">
                    Nenhuma comissão encontrada
                  </div>
                )}
              </SelectContent>
            </Select>
          )}

          <Button variant={"outline"} onClick={() => downloadAllXlsx()}>
            <Download size={16} />
            Baixar todos
          </Button>
        </div>
        <div>
          <div className="flex">
            <Button
              size="sm"
              onClick={() => setTab("vitrine")}
              variant={tab === "vitrine" ? "default" : "outline"}
              className="rounded-r-none"
            >
              <Store size={16} className="" />
              Vitrine
            </Button>
            <Button
              onClick={() => setTab("desfazimento")}
              size="sm"
              variant={tab !== "vitrine" ? "default" : "outline"}
              className="rounded-l-none"
            >
              <Trash size={16} className="" />
              Desfazimento
            </Button>
          </div>
        </div>
      </div>

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
      
                          <Button variant="outline" size="sm" onClick={clearFilters}>
                            <Trash size={16} />
                            Limpar filtros
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
                  <CarouselItem
                    key={key}
                    className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <Alert className="p-0">
                      <CardHeader className="flex gap-8 flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm truncate font-medium">
                          {name}
                        </CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {loadingStats ? "0" : count}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          registrados
                        </p>
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

          <div className="mt-8">
            <GraficoStatusCatalogo
              stats={counts}
              workflows={WORKFLOWS.vitrine.map(({ key, name }) => ({
                key,
                name,
              }))}
              title="Itens da Vitrine"
            />
          </div>
          {/* === Accordions === */}
          <Accordion
            type="multiple"
            value={
              focusedKey ? openKeys.filter((k) => k === focusedKey) : openKeys
            }
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
                items={board[key] ?? []}
                loading={!!loadingByStatus[key] && !(board[key]?.length)}
                onDownloadXlsx={() => downloadXlsxFor(key, name)}
                isOpen={openKeys.includes(key)}
                onExpand={handleExpand}
                onCollapseExpand={handleCollapseExpand}
                onPromptDelete={openDelete}
                onPromptMove={openMove}
                hasMore={hasMoreFor(key)}
                loadingMore={!!loadingPageByStatus[key]}
                onLoadMore={onLoadMoreStatus}
                total={counts[key] ?? totalByStatus[key]}
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
                  <CarouselItem
                    key={key}
                    className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <Alert className="p-0">
                      <CardHeader className="flex gap-8 flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm truncate font-medium">
                          {name}
                        </CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {loadingStats ? "0" : count}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          registrados
                        </p>
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

          <div className="mt-8">
            <GraficoStatusCatalogo
              stats={counts}
              workflows={WORKFLOWS.desfazimento.map(({ key, name }) => ({
                key,
                name,
              }))}
              title="Itens do Desfazimento"
            />
          </div>

          <Accordion
            type="multiple"
            value={
              focusedKey ? openKeys.filter((k) => k === focusedKey) : openKeys
            }
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
                items={board[key] ?? []}
                loading={!!loadingByStatus[key] && !(board[key]?.length)}
                onDownloadXlsx={() => downloadXlsxFor(key, name)}
                isOpen={openKeys.includes(key)}
                onExpand={handleExpand}
                onCollapseExpand={handleCollapseExpand}
                onPromptDelete={openDelete}
                onPromptMove={openMove}
                hasMore={hasMoreFor(key)}
                loadingMore={!!loadingPageByStatus[key]}
                onLoadMore={onLoadMoreStatus}
                total={counts[key] ?? totalByStatus[key]}
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
              Esta ação é irreversível. Ao deletar, todas as informações deste
              item no catálogo serão perdidas.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="">
            <Button variant="ghost" onClick={closeDelete}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              <Trash size={16} /> {deleting ? "Deletando…" : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== DIALOG: MOVIMENTAR ===================== */}
      <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <DialogContent>
          <DialogHeader className="pt-8 px-6 flex flex-col items-center">
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[520px] text-center">
              Movimentar item do catálogo
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-center">
              Selecione um status e (opcionalmente) escreva uma observação para
              registrar no histórico do item.
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
