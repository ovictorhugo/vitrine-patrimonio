// src/pages/desfazimento/CollectionPage.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../ui/button";
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
  PackageOpen,
  CheckCircle,
  Coins,
} from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion";
import { UserContext } from "../../../../context/context";
import { Skeleton } from "../../../ui/skeleton";
import { toast } from "sonner";

// shadcn/ui
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Alert } from "../../../ui/alert";
import { Separator } from "../../../ui/separator";
import { useQuery } from "../../../authentication/signIn";

import { CardHeader, CardTitle, CardContent } from "../../../ui/card";
import { CollectionDTO } from "../../collection/collection-page";

import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { ArrowUUpLeft } from "phosphor-react";
import { usePermissions } from "../../../permissions";
import { Badge } from "../../../ui/badge";
import { Tabs, TabsContent } from "../../../ui/tabs";
import { ItemPatrimonio } from "../../../homepage/components/item-patrimonio";
import { AddToCollectionDrawer, CollectionItem } from "../../desfazimento/components/add-collection";
import { PatrimonioItemCollection } from "../../desfazimento/components/patrimonio-item-inventario";

// ================== Types ==================
type UUID = string;

type Unit = { id: UUID; unit_name: string; unit_code: string; unit_siaf?: string };
type Agency = { id: UUID; agency_name: string; agency_code: string; unit_id: UUID };
type Sector = { id: UUID; sector_name: string; sector_code: string; agency_id: UUID };
type LocationEE = { id: UUID; location_name: string; location_code: string; sector_id: UUID };

type Material = { id: UUID; material_code: string; material_name: string };
type LegalGuardian = { id: UUID; legal_guardians_code: string; legal_guardians_name: string };

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
    agency?: { id: UUID; agency_name: string; agency_code: string; unit_id: UUID; unit?: Unit };
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
    permissions: Array<{ id: UUID; name: string; code: string; description: string }>;
  }>;
  system_identity?: { id: UUID; legal_guardian?: LegalGuardian };
};

type WorkflowHistoryItem = {
  id: UUID;
  workflow_status: string;
  detail?: Record<string, unknown>;
  user?: WorkflowUser;
  transfer_requests?: Array<{ id: UUID; status: string; user?: WorkflowUser; location?: LocationNested }>;
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
};


type CollectionItemsResponse = { collection_items: CollectionItem[] };
type CatalogListResponse = { catalog_entries?: Catalog[] } | { results?: Catalog[] } | Catalog[]; // flexibiliza backend

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

// ================== Página ==================
export function CollectionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryUrl = useQuery();
  const collection_id = queryUrl.get("collection_id");

  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const { urlGeral } = useContext(UserContext);
  const token = useMemo(() => localStorage.getItem("jwt_token"), []);
  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // ======= Filtros hierárquicos E adicionais da LISTA da coleção =======
  const [units, setUnits] = useState<Unit[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [locations, setLocations] = useState<LocationEE[]>([]);
  const [unitId, setUnitId] = useState<UUID | null>(null);
  const [agencyId, setAgencyId] = useState<UUID | null>(null);
  const [sectorId, setSectorId] = useState<UUID | null>(null);
  const [locationId, setLocationId] = useState<UUID | null>(null);

  // novos: pesquisa, material e responsável (para a LISTA principal)
  const [qMain, setQMain] = useState("");
  const [materialItemsMain, setMaterialItemsMain] = useState<ComboboxItem[]>([]);
  const [guardianItemsMain, setGuardianItemsMain] = useState<ComboboxItem[]>([]);
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
        const guards: LegalGuardian[] = guardJson?.legal_guardians ?? guardJson ?? [];

        setMaterialItemsMain(
          mats.map((m) => ({
            id: m.id,
            code: m.material_code,
            label: m.material_name || m.material_code,
          }))
        );

        setGuardianItemsMain(
          guards.map((g) => ({
            id: g.id,
            code: g.legal_guardians_code,
            label: g.legal_guardians_name || g.legal_guardians_code,
          }))
        );
      } catch (e) {
        console.error("Erro ao carregar materiais ou responsáveis:", e);
      }
    })();
  }, [urlGeral, authHeaders]);

    const tabs = [
    { id: "lfd", label: "Alienação", icon: Coins },
  { id: "finalizados", label: "Processos finalizados", icon:Recycle },

  ];


    const tab = queryUrl.get("tab");
  const inv_id = queryUrl.get("inv_id") || ""; // ← INVENTORY_ID vem da URL
  const [value, setValue] = useState(tab || tabs[0].id);

 

  // ===== GET /collection_items/ (com filtros) =====
  const fetchCollectionItems = useCallback(async () => {
    try {
      setLoadingList(true);

      const params = new URLSearchParams();
      if (unitId) params.set("unit_id", unitId);
      if (agencyId) params.set("agency_id", agencyId);
      if (sectorId) params.set("sector_id", sectorId);
      if (locationId) params.set("location_id", locationId);
      if (qMain) params.set("q", qMain);
      if (materialIdMain) params.set("material_id", materialIdMain);
      if (guardianIdMain) params.set("legal_guardian_id", guardianIdMain);
 if (value == 'finalizados') params.set("workflow_status",'DESCARTADOS');
if (value == 'lfd') params.set("workflow_status",'DESFAZIMENTO');
    

      const url = `${urlGeral}collections/${collection_id}/items/${params.toString() ? `?${params.toString()}` : ""}`;

      const res = await fetch(url, { method: "GET", headers: authHeaders });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao carregar coleção (HTTP ${res.status}).`);
      }

      const data: CollectionItemsResponse = await res.json();
      setItems(Array.isArray((data as any)?.collection_items) ? (data as any).collection_items : []);
    } catch (e: any) {
      toast("Erro ao carregar coleção de desfazimento", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setLoadingList(false);
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
    value
  ]);

  useEffect(() => {
    fetchCollectionItems();
  }, [fetchCollectionItems]);

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
        const res = await fetch(`${urlGeral}agencies/?unit_id=${encodeURIComponent(uid)}`, {
          method: "GET",
          headers: authHeaders,
        });
        const json = await res.json();
        setAgencies(json?.agencies ?? []);
      } catch {
        setAgencies([]);
      }
    },
    [urlGeral, authHeaders]
  );

  // carregar setores
  const fetchSectors = useCallback(
    async (aid: UUID) => {
      if (!aid) return setSectors([]);
      try {
        const res = await fetch(`${urlGeral}sectors/?agency_id=${encodeURIComponent(aid)}`, {
          method: "GET",
          headers: authHeaders,
        });
        const json = await res.json();
        setSectors(json?.sectors ?? []);
      } catch {
        setSectors([]);
      }
    },
    [urlGeral, authHeaders]
  );

  // carregar locais
  const fetchLocations = useCallback(
    async (sid: UUID) => {
      if (!sid) return setLocations([]);
      try {
        const res = await fetch(`${urlGeral}locations/?sector_id=${encodeURIComponent(sid)}`, {
          method: "GET",
          headers: authHeaders,
        });
        const json = await res.json();
        setLocations(json?.locations ?? []);
      } catch {
        setLocations([]);
      }
    },
    [urlGeral, authHeaders]
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

  useEffect(() => {
    fetchCollectionItems();
  }, [unitId, agencyId, sectorId, locationId, qMain, materialIdMain, guardianIdMain, fetchCollectionItems]);

  // Scroll filtros
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
  };

  // Drawer adicionar
  const [openAdd, setOpenAdd] = useState(false);

  const handleItemsAdded = (newItems: CollectionItem[]) => {
    setItems((prev) => {
      const ids = new Set(prev.map((p) => p.id));
      const filtered = newItems.filter((ni) => !ids.has(ni.id));
      return [...filtered, ...prev];
    });
  };

  const fmt = (n: number) => n.toLocaleString("pt-BR");
  const countDesfazimento = useMemo(() => items.filter((i) => i.status === true).length, [items]);
  const countNaoDesfazimento = useMemo(() => items.filter((i) => i.status === false).length, [items]);

  // GET COLLECTION
  const type_search = queryUrl.get("collection_id");
  const [collection, setCollection] = useState<CollectionDTO | null>(null);

  const fetchInventories = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${urlGeral}collections/${type_search}`, {
        method: "GET",
        headers: authHeaders,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao carregar coleção (HTTP ${res.status}).`);
      }

      const data: CollectionDTO = await res.json();
      setCollection(data);
      setLoadingList(false);
    } catch (e: any) {
      toast("Erro ao carregar coleção", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => {} },
      });
    }
  };

  useEffect(() => {
    fetchInventories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlGeral]);

  const [loadingMessage, setLoadingMessage] = useState("Estamos procurando todas as informações no nosso banco de dados, aguarde.");

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    setLoadingMessage("Estamos procurando todas as informações no nosso banco de dados, aguarde.");
    timeouts.push(setTimeout(() => setLoadingMessage("Estamos quase lá, continue aguardando..."), 5000));
    timeouts.push(setTimeout(() => setLoadingMessage("Só mais um pouco..."), 10000));
    timeouts.push(setTimeout(() => setLoadingMessage("Está demorando mais que o normal... estamos tentando encontrar tudo."), 15000));
    timeouts.push(setTimeout(() => setLoadingMessage("Estamos empenhados em achar todos os dados, aguarde só mais um pouco"), 15000));
    return () => { timeouts.forEach(clearTimeout); };
  }, []);

  const handleVoltar = () => {
    const currentPath = location.pathname;
    const hasQueryParams = location.search.length > 0;
    if (hasQueryParams) {
      navigate(currentPath);
    } else {
      const pathSegments = currentPath.split("/").filter((segment) => segment !== "");
      if (pathSegments.length > 1) {
        pathSegments.pop();
        const previousPath = "/" + pathSegments.join("/");
        navigate(previousPath);
      } else navigate("/");
    }
  };

  // ------------------ Dialogs: Editar / Deletar ------------------
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newName, setNewName] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");

  // Pré-carrega os campos quando abrir o Editar ou quando collection mudar
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
      // Atualiza estado local sem refazer fetch
      setCollection((prev) => (prev ? { ...prev, name: newName, description: newDescription } : prev));
      toast.success("Coleção atualizada com sucesso!");
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
    } catch (e: any) {
      toast.error(e?.message || "Falha ao deletar a coleção.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ----- handler robusto para remoção de item -----
  const handleItemDeleted = useCallback((deletedId: UUID) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== deletedId);
      // fallback: se nada saiu localmente, re-sincroniza com o backend
      if (next.length === prev.length) {
        fetchCollectionItems();
      }
      return next;
    });
  }, [fetchCollectionItems]);

     const { hasColecoes
  } = usePermissions();
  
  // ... estados existentes ...

  // 🆕 Modal de descarte em lote
  const [discardOpen, setDiscardOpen] = useState(false);
  const [discardLoading, setDiscardLoading] = useState(false);
  const [discardProcessed, setDiscardProcessed] = useState(0);
  const [discardErrors, setDiscardErrors] = useState<number>(0);

  // ... resto do estado, effects, etc.
  // 🆕 handler do descarte em lote
  const handleDiscardSelected = useCallback(async () => {
    const toDiscard = items.filter((it) => it.status === true);
    if (toDiscard.length === 0) {
      toast("Nada para enviar ao fluxo de descarte.", {
        description: "Marque itens como coletados (status = true) primeiro.",
      });
      return;
    }

    setDiscardLoading(true);
    setDiscardProcessed(0);
    setDiscardErrors(0);

    // processa item a item, removendo da lista conforme sucesso
    for (const it of toDiscard) {
      const catalogId = it.catalog?.id;
      if (!catalogId) {
        // sem catalog_id — não dá para registrar workflow
        setDiscardErrors((e) => e + 1);
        setDiscardProcessed((p) => p + 1);
        continue;
      }

      try {
        const res = await fetch(`${urlGeral}catalog/${catalogId}/workflow`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            workflow_status: "FINALIZADOS_ALIENACAO",
            detail: { additionalProp1: {} },
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Falha HTTP ${res.status}`);
        }

        // ✅ remove da lista somente se deu certo
        setItems((prev) => prev.filter((p) => p.id !== it.id));
      } catch (err) {
        setDiscardErrors((e) => e + 1);
      } finally {
        setDiscardProcessed((p) => p + 1);
      }
    }

    setDiscardLoading(false);

    // feedback final
    const ok = toDiscard.length - discardErrors - 0; // discardErrors será atualizado, mas para garantir:
    const total = toDiscard.length;
    toast.success("Processo de descarte concluído", {
      description: `${total - discardErrors} de ${total} itens enviados com sucesso.`,
      action: { label: "Fechar", onClick: () => {} },
    });

    setDiscardOpen(false);
  }, [items, urlGeral, authHeaders, discardErrors]);
  

  

  const [isOn, setIsOn] = useState(true);

    const skeletons = useMemo(
      () => Array.from({ length: 12 }, (_, index) => <Skeleton key={index} className="w-full rounded-md aspect-square" />),
      []
    );

  if (loadingList && !collection) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-full flex flex-col items-center justify-center h-full">
          <div className="text-eng-blue mb-4 animate-pulse">
            <LoaderCircle size={108} className="animate-spin" />
          </div>
          <p className="font-medium text-lg max-w-[500px] text-center">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full flex flex-col items-center justify-center">
          <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">(⊙_⊙)</p>
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
        <meta name="description" content={`${collection?.name || ""} | Sistema Patrimônio`} />
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

            <h1 className="text-xl font-semibold tracking-tight">Coleção de alienação</h1>
          </div>

         {hasColecoes && (
            <div className="flex items-center gap-2">

                

            {/* editar / deletar */}
            <Button size={'icon'} variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil size={16}  /> 
            </Button>
            <Button size={'icon'} variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash size={16} /> 
            </Button>

             <Button
                variant={'outline'}
                onClick={() => setDiscardOpen(true)}
                disabled={countDesfazimento === 0}
                title={countDesfazimento === 0 ? "Nenhum item coletado para descartar" : "Enviar coletados para DESCARTADOS"}
              >
                <Recycle size={16} className="mr-1" />
                Descartar coletados <Badge variant={'outline'}>{countDesfazimento}</Badge>
              </Button>

            {/* botão abrir pop-up adicionar item */}
            <Button onClick={() => setOpenAdd(true)}>
              <Plus size={16}  /> Adicionar item
            </Button>

         
          </div>
         )}
        </div>

         <div className="justify-center  px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
                                 <h3 className="z-[2] text-center max-w-[900px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">{collection.name}</h3>
                   
                 <div className="mt-2 flex flex-wrap justify-center  gap-3 text-sm text-gray-500 items-center">
                          <span className="text-muted-foreground max-w-[900px] text-justify">{collection.description}</span>
                        </div>
                  </div>


        {/* Cards de status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 px-8">
          <Alert className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coletados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(countDesfazimento)}</div>
              <p className="text-xs text-muted-foreground">registrados</p>
            </CardContent>
          </Alert>

          <Alert className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(countNaoDesfazimento)}</div>
              <p className="text-xs text-muted-foreground">a realizar</p>
            </CardContent>
          </Alert>
        </div>

        <Tabs defaultValue="inventario" value={value} className="relative ">
                  {/* header das tabs, mantendo seu estilo */}
                  <div className="sticky top-[68px]  z-[2] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur ">
                    <div className={`w-full ${isOn ? "px-8" : "px-4"} border-b border-b-neutral-200 dark:border-b-neutral-800`}>
                      {isOn && <div className="w-full  flex justify-between items-center"></div>}
                      <div className={`flex pt-2 gap-8 justify-between  ${isOn ? "" : ""} `}>
                        <div className="flex items-center gap-2">
                          <div className="relative grid grid-cols-1">
                          
        
                            <div className="  ">
                              <div ref={scrollAreaRef} className="overflow-x-auto scrollbar-hide scrollbar-hide" onScroll={checkScrollability}>
                                <div className="p-0 flex gap-2 h-auto bg-transparent dark:bg-transparent">
                                  {tabs.map(({ id, label, icon: Icon }) => (
                                    <div
                                      key={id}
                                      className={`pb-2 border-b-2 text-black dark:text-white transition-all ${
                                        value === id ? "border-b-[#719CB8]" : "border-b-transparent"
                                      }`}
                                      onClick={() => {
                                        setValue(id);
                                        queryUrl.set("page", "1");
                                        navigate({
                                          pathname: location.pathname,
                                          search: queryUrl.toString(),
                                        });
                                      }}
                                    >
                                      <Button variant="ghost" className="m-0">
                                        <Icon size={16} />
                                        {label}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
        
                        
                          </div>
                        </div>
        
                        <div className="hidden xl:flex xl:flex-nowrap gap-2">
                          <div className="md:flex md:flex-nowrap gap-2">i</div>
                        </div>
                      </div>
                    </div>
                  </div>

                      {/* Barra de filtros da lista principal */}
       <div className="p-8 pb-4">
         <div className="relative grid grid-cols-1 ">
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
                {/* Pesquisa */}
                <Alert className="w-[300px] min-w-[300px] py-0 h-10 rounded-md flex gap-3 items-center">
                  <div>
                    <Search size={16} className="text-gray-500" />
                  </div>
                  <div className="relative w-full">
                    <Input
                      className="border-0 p-0 h-9 flex flex-1 w-full"
                      value={qMain}
                      onChange={(e) => setQMain(e.target.value)}
                      placeholder="Buscar por código, descrição, material, marca, modelo..."
                    />
                  </div>
                </Alert>

                {/* Material e Responsável */}
                <Combobox items={materialItemsMain} value={materialIdMain} onChange={setMaterialIdMain} placeholder="Material" />
                <Combobox items={guardianItemsMain} value={guardianIdMain} onChange={setGuardianIdMain} placeholder="Responsável" />

                <Separator className="h-8" orientation="vertical" />

                {/* ====== NOVOS SELECTS EM CADEIA ====== */}
                <Combobox
                  items={(units ?? []).map((u) => ({
                    id: u.id,
                    code: u.unit_code,
                    label: u.unit_name || u.unit_code,
                  }))}
                  value={unitId}
                  onChange={(v) => setUnitId(v)}
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
       </div>

        
                  <TabsContent value="lfd">
<div className="p-8 pt-0">
   <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="px-0">
              <HeaderResultTypeHome title={"Todos os itens"} icon={<Package size={24} className="text-gray-400" />} />
            </AccordionTrigger>

            <AccordionContent className="p-0">
              {loadingList ? (
                <div className="flex gap-4 flex-col">
                  <Skeleton className="w-full h-32" />
                  <Skeleton className="w-full h-32" />
                  <Skeleton className="w-full h-32" />
                </div>
              ) : items.length === 0 ? (
                <div className="items-center justify-center w-full flex text-center pt-6">Nenhum item adicionado.</div>
              ) : (
                <div className="grid gap-4">
                  {items.map((ci) => (
                    <PatrimonioItemCollection
                      key={ci.id}
                      invId={ci.catalog?.id ?? ci.id}
                      entry={ci.catalog as any}
                      collectionId={String(collection_id)}
                      itemId={ci.id}
                      sel={ci.status ? "true" : "false"}
                      comm={ci.comment ?? ""}
                      onUpdated={(patch) => {
                        setItems((prev) =>
                          prev.map((it) =>
                            it.id === ci.id
                              ? {
                                  ...it,
                                  status: typeof patch.status === "boolean" ? patch.status : it.status,
                                  comment: typeof patch.comment === "string" ? patch.comment : it.comment,
                                }
                              : it
                          )
                        );
                      }}

                      // ✅ remove o item da lista após DELETE OK (id vem do filho)
                      onDeleted={(deletedId) => {
                        const next = items.filter((it) => it.id !== deletedId);
                        if (!(next.length === items.length)) {
                          setItems(next);
                        } 
                      }}
                    />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
</div>
                  </TabsContent>

                  <TabsContent value="finalizados">
<div className="p-8 pt-0">
   <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="px-0">
              <HeaderResultTypeHome title={"Todos os itens"} icon={<Package size={24} className="text-gray-400" />} />
            </AccordionTrigger>

            <AccordionContent className="p-0">
              {loadingList ? (
               <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {skeletons.map((item, index) => (
            <div className="w-full" key={index}>
              {item}
            </div>
          ))}
                </div>
              ) : items.length === 0 ? (
                <div className="items-center justify-center w-full flex text-center pt-6">Nenhum item adicionado.</div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {items.map((item) => (
                     <ItemPatrimonio
                                  key={item.id}
                                  {...item.catalog}
                               
                                />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
</div>
                  </TabsContent>
                  </Tabs>

    
       
      </main>

      {/* =================== Dialog EDITAR =================== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Editar coleção</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Altere o nome e a descrição da coleção.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Nome</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Descrição</Label>
              <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
               <ArrowUUpLeft size={16} />  Cancelar
            </Button>
            <Button onClick={handleUpdateCollection} disabled={updateLoading}>
              {updateLoading ? <Loader2 className="animate-spin " size={16} /> : <Pencil size={16} className="" />}
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================== Dialog DELETAR =================== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[520px]">Deletar coleção</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
             <ArrowUUpLeft size={16} />    Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCollection} disabled={deleteLoading}>
              {deleteLoading ? <Loader2 className="animate-spin " size={16} /> : <Trash size={16}  />}
              Deletar coleção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* 🆕 Dialog: Descarte em lote */}
      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[520px]">
              Atualizar itens coletados para descartados
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              {countDesfazimento > 0
                ? `Você está prestes a enviar ${countDesfazimento} ${Number(countDesfazimento) === 1 ? "item coletado" : "itens coletados"} para o fluxo 'Processos Finalizados'.`
                : "Nenhum item coletado encontrado."}
            </DialogDescription>
          </DialogHeader>

          {discardLoading ? (
            <div className="flex items-center gap-3 text-gray-500">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm text-muted-foreground">
                Processando {discardProcessed} de {countDesfazimento}…
              </span>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDiscardOpen(false)} disabled={discardLoading}>
            <ArrowUUpLeft size={16} />      Cancelar
            </Button>
            <Button onClick={handleDiscardSelected} disabled={countDesfazimento === 0 || discardLoading}>
              {discardLoading ? <Loader2 className="animate-spin" size={16} /> : <Recycle size={16} className="" />}
              {discardLoading ? "Enviando…" : "Confirmar descarte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================== Drawer Adicionar (componente separado) =================== */}
      <AddToCollectionDrawer
        open={openAdd}
        onOpenChange={(o) => setOpenAdd(o)}
        baseUrl={urlGeral}
        headers={authHeaders}
        collectionId={String(collection_id) || null}
        onItemsAdded={handleItemsAdded}
      />
    </div>
  );
}
