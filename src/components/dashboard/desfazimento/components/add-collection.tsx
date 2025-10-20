import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drawer, DrawerContent } from "../../../ui/drawer";
import { Button } from "../../../ui/button";
import { Separator } from "../../../ui/separator";
import { Alert } from "../../../ui/alert";
import { Input } from "../../../ui/input";
import { Skeleton } from "../../../ui/skeleton";
import { toast } from "sonner";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../ui/dialog";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  Trash,
} from "lucide-react";
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

/* ================== Tipos compartilhados ================== */
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

export type Catalog = {
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

export type CollectionItem = { id: UUID; status: boolean; comment: string; catalog: Catalog };

type CollectionsListResponse = {
  collections: { id: UUID; name: string; description: string; created_at: string }[];
};

type CatalogListResponse =
  | { catalog_entries?: Catalog[] }
  | { results?: Catalog[] }
  | Catalog[];

/* ================== Combobox genérico ================== */
type ComboboxItem = { id: UUID | null; code?: string; label: string };

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

  // Scroll da barra de filtros (lista principal)
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

  return (
   <Popover open={open} onOpenChange={setOpen} modal={false}>
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

  <PopoverContent
    className="w-[320px] p-0 z-[9999] pointer-events-auto"
    align="start"
    sideOffset={6}
    // evita que o Drawer “coma” o ponteiro/foco
    onOpenAutoFocus={(e) => e.preventDefault()}
    onCloseAutoFocus={(e) => e.preventDefault()}
    onPointerDownOutside={(e) => e.preventDefault()}
    onInteractOutside={(e) => e.preventDefault()}
  >
    <Command>
      <CommandInput />
      <CommandEmpty>{emptyText}</CommandEmpty>

      <CommandList className="gap-2 flex flex-col">
        <CommandGroup className="gap-2 flex flex-col">
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
              key={String(item.id)}
              // dica: garanta que os itens não estejam com pointer-events: none por CSS
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

/* ================== Props do Drawer ================== */
export function AddToCollectionDrawer({
  open,
  onOpenChange,
  baseUrl,
  headers,
  collectionId, // opcional
  onItemsAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseUrl: string;                // ex: urlGeral
  headers: HeadersInit;           // ex: authHeaders
  collectionId?: string | null;
  onItemsAdded: (newItems: CollectionItem[]) => void;
}) {
  /* ================== Estado de coleção ================== */
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(collectionId ?? null);
  const [collections, setCollections] = useState<ComboboxItem[]>([]);
  const needsCollectionSelect = !collectionId;

  useEffect(() => {
    setSelectedCollectionId(collectionId ?? null);
  }, [collectionId]);

  useEffect(() => {
    if (!needsCollectionSelect || !open) return;
    (async () => {
      try {
        const res = await fetch(`${baseUrl}collections/`, { headers });
        if (!res.ok) throw new Error(`Falha ao carregar coleções (HTTP ${res.status})`);
        const data: CollectionsListResponse = await res.json();
        setCollections(
          (data?.collections ?? []).map((c) => ({
            id: c.id,
            label: c.name || c.id,
          }))
        );
      } catch (e: any) {
        toast("Erro ao listar coleções", { description: e?.message || String(e) });
      }
    })();
  }, [baseUrl, headers, needsCollectionSelect, open]);

  /* ================== Filtros Pop-up ================== */
  const [showFilters, setShowFilters] = useState(true);
  const [q, setQ] = useState("");
  const [materialItems, setMaterialItems] = useState<ComboboxItem[]>([]);
  const [guardianItems, setGuardianItems] = useState<ComboboxItem[]>([]);
  const [materialId, setMaterialId] = useState<UUID | null>(null);
  const [guardianId, setGuardianId] = useState<UUID | null>(null);

  const token = useMemo(() => localStorage.getItem("jwt_token"), []);
    const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const [units, setUnits] = useState<Unit[]>([]);
  const [agenciesP, setAgenciesP] = useState<Agency[]>([]);
  const [sectorsP, setSectorsP] = useState<Sector[]>([]);
  const [locationsP, setLocationsP] = useState<LocationEE[]>([]);
  const [unitIdP, setUnitIdP] = useState<UUID | null>(null);
  const [agencyIdP, setAgencyIdP] = useState<UUID | null>(null);
  const [sectorIdP, setSectorIdP] = useState<UUID | null>(null);
  const [locationIdP, setLocationIdP] = useState<UUID | null>(null);
// bases de materiais / responsáveis
useEffect(() => {
  if (!open) return;
  (async () => {
    try {
      const [matRes, guardRes, unitsRes] = await Promise.all([
        fetch(`${baseUrl}materials/`, { method: "GET", headers: authHeaders }), // ✅ token
        fetch(`${baseUrl}legal-guardians/`, { method: "GET", headers: authHeaders }), // ✅ token
        fetch(`${baseUrl}units/`, { method: "GET", headers: authHeaders }), // ✅ token
      ]);

      const matJson = await matRes.json().catch(() => ({}));
      const guardJson = await guardRes.json().catch(() => ({}));
      const unitsJson = await unitsRes.json().catch(() => ({}));

      const mats: Material[] = matJson?.materials ?? matJson ?? [];
      const guards: LegalGuardian[] = guardJson?.legal_guardians ?? guardJson ?? [];

      setMaterialItems(
        mats.map((m) => ({
          id: m.id,
          code: m.material_code,
          label: m.material_name || m.material_code,
        }))
      );

      setGuardianItems(
        guards.map((g) => ({
          id: g.id,
          code: g.legal_guardians_code,
          label: g.legal_guardians_name || g.legal_guardians_code,
        }))
      );

      setUnits(unitsJson?.units ?? []);
    } catch (e) {
      console.error("Erro ao carregar bases principais:", e);
    }
  })();
}, [open, baseUrl, authHeaders]);

// encadeamento hierarquia (popup)
const fetchAgenciesP = useCallback(
  async (uid: UUID) => {
    if (!uid) return setAgenciesP([]);
    try {
      const res = await fetch(`${baseUrl}agencies/?unit_id=${encodeURIComponent(uid)}`, {
        method: "GET",
        headers: authHeaders, // ✅ token
      });
      const json = await res.json();
      setAgenciesP(json?.agencies ?? []);
    } catch {
      setAgenciesP([]);
    }
  },
  [baseUrl, authHeaders]
);

const fetchSectorsP = useCallback(
  async (aid: UUID) => {
    if (!aid) return setSectorsP([]);
    try {
      const res = await fetch(`${baseUrl}sectors/?agency_id=${encodeURIComponent(aid)}`, {
        method: "GET",
        headers: authHeaders, // ✅ token
      });
      const json = await res.json();
      setSectorsP(json?.sectors ?? []);
    } catch {
      setSectorsP([]);
    }
  },
  [baseUrl, authHeaders]
);

const fetchLocationsP = useCallback(
  async (sid: UUID) => {
    if (!sid) return setLocationsP([]);
    try {
      const res = await fetch(`${baseUrl}locations/?sector_id=${encodeURIComponent(sid)}`, {
        method: "GET",
        headers: authHeaders, // ✅ token
      });
      const json = await res.json();
      setLocationsP(json?.locations ?? []);
    } catch {
      setLocationsP([]);
    }
  },
  [baseUrl, authHeaders]
);

  useEffect(() => {
    setAgencyIdP(null); setSectorIdP(null); setLocationIdP(null);
    setAgenciesP([]); setSectorsP([]); setLocationsP([]);
    if (unitIdP) fetchAgenciesP(unitIdP);
  }, [unitIdP, fetchAgenciesP]);

  useEffect(() => {
    setSectorIdP(null); setLocationIdP(null);
    setSectorsP([]); setLocationsP([]);
    if (agencyIdP) fetchSectorsP(agencyIdP);
  }, [agencyIdP, fetchSectorsP]);

  useEffect(() => {
    setLocationIdP(null);
    setLocationsP([]);
    if (sectorIdP) fetchLocationsP(sectorIdP);
  }, [sectorIdP, fetchLocationsP]);

  const clearPopupFilters = () => {
    setQ("");
    setMaterialId(null);
    setGuardianId(null);
    setUnitIdP(null);
    setAgencyIdP(null);
    setSectorIdP(null);
    setLocationIdP(null);
    setAgenciesP([]); setSectorsP([]); setLocationsP([]);
  };

  /* ================== Lista de catálogo + seleção ================== */
  const [loadingAddList, setLoadingAddList] = useState(false);
  const [catalogList, setCatalogList] = useState<Catalog[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<UUID>>(new Set());
  const [addingItems, setAddingItems] = useState(false);

  const toggleSelect = (id: UUID) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchCatalogForPopup = useCallback(async () => {
    try {
      setLoadingAddList(true);
      const params = new URLSearchParams();
      params.set("only_uncollected", "true");
      params.set("workflow_status", "DESFAZIMENTO");
      if (q) params.set("q", q);
      if (materialId) params.set("material_id", materialId);
      if (guardianId) params.set("legal_guardian_id", guardianId);
      if (unitIdP) params.set("unit_id", unitIdP);
      if (agencyIdP) params.set("agency_id", agencyIdP);
      if (sectorIdP) params.set("sector_id", sectorIdP);
      if (locationIdP) params.set("location_id", locationIdP);

      const url = `${baseUrl}catalog/?${params.toString()}`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao carregar catálogo (HTTP ${res.status}).`);
      }
      const data: CatalogListResponse = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.catalog_entries)
        ? (data as any).catalog_entries
        : Array.isArray((data as any)?.results)
        ? (data as any).results
        : [];
      setCatalogList(list as Catalog[]);
    } catch (e: any) {
      toast("Erro ao listar catálogo", { description: e?.message || String(e) });
      setCatalogList([]);
    } finally {
      setLoadingAddList(false);
    }
  }, [baseUrl, headers, q, materialId, guardianId, unitIdP, agencyIdP, sectorIdP, locationIdP]);

  // Carrega a lista ao abrir e quando filtros mudarem
  useEffect(() => {
    if (open) fetchCatalogForPopup();
  }, [open, fetchCatalogForPopup]);

  /* ================== Adicionar selecionados ================== */
  const addSelectedToCollection = async () => {
    const cid = selectedCollectionId ?? collectionId ?? null;
    if (!cid) {
      toast("Selecione uma coleção para adicionar os itens.");
      return;
    }
    if (selectedIds.size === 0) {
      toast("Selecione ao menos um item do catálogo.");
      return;
    }

    try {
      setAddingItems(true);

      const selectedCatalogs = catalogList.filter((c) => selectedIds.has(c.id));
      const createdItems: CollectionItem[] = [];

      // POST em paralelo (com captura de resposta quando houver)
      await Promise.all(
        selectedCatalogs.map(async (cat) => {
          const payload = { catalog_id: cat.id, status: false, comment: "" };

          const r = await fetch(`${baseUrl}collections/${encodeURIComponent(cid)}/items/`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          });

          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Falha ao adicionar item (HTTP ${r.status})`);
          }

          // tenta ler o item criado
          let createdId: UUID | null = null;
          try {
            const j = await r.json();
            createdId = j?.id ?? j?.item?.id ?? null;
          } catch {
            // sem corpo -> segue com fallback
          }

          const newItem: CollectionItem = {
            id: createdId ?? (globalThis.crypto?.randomUUID?.() ?? `${cat.id}::temp`),
            status: false,
            comment: "",
            catalog: cat,
          };
          createdItems.push(newItem);
        })
      );

      toast.success("Itens adicionados à coleção.");

      // Entrega ao pai para inserir localmente (sem refetch)
      onItemsAdded(createdItems);

      // Reset UI
      setSelectedIds(new Set());
      onOpenChange(false);
    } catch (e: any) {
      toast("Erro ao adicionar itens", { description: e?.message || String(e) });
    } finally {
      setAddingItems(false);
    }
  };

  // Quando fecha, limpa seleção
  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
    }
  }, [open]);


  // Scroll da barra de filtros (lista principal)
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2 font-medium">Adicionar itens à coleção de desfazimento</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Selecione itens do catálogo para inserir na coleção.
          </DialogDescription>
        </DialogHeader>

        {/* Se não veio collectionId, mostrar seletor de coleção */}
        {needsCollectionSelect && (
          <>
            <Separator className="my-4" />
            <div className="mb-4">
              <Combobox
                items={collections}
                value={selectedCollectionId}
                onChange={(v) => setSelectedCollectionId(v)}
                placeholder="Selecione a coleção"
                emptyText="Nenhuma coleção encontrada"
              />
            </div>
          </>
        )}

        <Separator className="my-4" />

        {/* Filtros */}
        <div className="space-y-4 mb-4">
      

          {showFilters && (
            <div className="relative grid grid-cols-1">
              <div className="mx-0">
                <div className="overflow-x-auto scrollbar-hide">
                 
        {/* Barra de filtros da lista principal */}
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
                        <Search size={16} className="text-gray-500" />
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

                    <Combobox items={materialItems} value={materialId} onChange={setMaterialId} placeholder="Material" />

                    <Combobox
                      items={guardianItems}
                      value={guardianId}
                      onChange={setGuardianId}
                      placeholder="Responsável"
                    />

                    <Separator className="h-8" orientation="vertical" />

                    {/* Hierarquia */}
                    <Combobox
                      items={(units ?? []).map((u) => ({
                        id: u.id,
                        code: u.unit_code,
                        label: u.unit_name || u.unit_code,
                      }))}
                      value={unitIdP}
                      onChange={(v) => setUnitIdP(v)}
                      placeholder="Unidade"
                    />

                    <Combobox
                      items={(agenciesP ?? []).map((a) => ({
                        id: a.id,
                        code: a.agency_code,
                        label: a.agency_name || a.agency_code,
                      }))}
                      value={agencyIdP}
                      onChange={(v) => setAgencyIdP(v)}
                      placeholder={"Organização"}
                      disabled={!unitIdP}
                    />

                    <Combobox
                      items={(sectorsP ?? []).map((s) => ({
                        id: s.id,
                        code: s.sector_code,
                        label: s.sector_name || s.sector_code,
                      }))}
                      value={sectorIdP}
                      onChange={(v) => setSectorIdP(v)}
                      placeholder={"Setor"}
                      disabled={!agencyIdP}
                    />

                    <Combobox
                      items={(locationsP ?? []).map((l) => ({
                        id: l.id,
                        code: l.location_code,
                        label: l.location_name || l.location_code,
                      }))}
                      value={locationIdP}
                      onChange={(v) => setLocationIdP(v)}
                      placeholder="Local de guarda"
                      disabled={!sectorIdP}
                    />

                          <Button variant="outline" size="sm" onClick={clearPopupFilters}>
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
              </div>
            </div>
          )}
        </div>

        {/* Lista do catálogo com checkboxes */}
        <div className=" max-h-[50vh] overflow-auto">
          {loadingAddList ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : catalogList.length === 0 ? (
            <div className="text-center text-muted-foreground py-6 text-sm">Nenhum item encontrado no catálogo.</div>
          ) : (
            <ul className="space-y-2">
              {catalogList.map((cat) => {
                const checked = selectedIds.has(cat.id);
                const a = cat.asset;
                return (
                  <li key={cat.id} className="flex items-center gap-3 p-2 rounded-md border hover:bg-muted/40">
                    <input type="checkbox" className="h-4 w-4" checked={checked} onChange={() => toggleSelect(cat.id)} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {a?.asset_code ?? "—"} {a?.asset_check_digit ? `- ${a.asset_check_digit}` : ""} •{" "}
                        {a?.asset_description || cat.description || "Sem descrição"}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {a?.item_brand || "S/ marca"} · {a?.item_model || "S/ modelo"} ·{" "}
                        {a?.material?.material_name || a?.material?.material_code || "S/ material"}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 mt-4">
          <div className="text-sm text-muted-foreground">{selectedIds.size} selecionado(s)</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={addSelectedToCollection} disabled={addingItems || selectedIds.size === 0}>
              {addingItems ? <Loader2 size={16} className=" animate-spin" /> : <Plus size={16} />
              }
              Adicionar selecionados
            </Button>
          </div>
        </DialogFooter>
      </DrawerContent>
    </Drawer>
  );
}
