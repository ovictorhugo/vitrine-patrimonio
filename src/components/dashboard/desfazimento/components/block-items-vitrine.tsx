// src/pages/desfazimento/components/block-items-vitrine.tsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../../../context/context";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Skeleton } from "../../../ui/skeleton";
import { useQuery } from "../../../authentication/signIn";
import { ItemPatrimonio } from "./item-patrimonio";
import { Droppable, Draggable } from "@hello-pangea/dnd";

export interface CatalogEntry {
  id: string;
  description: string;
  created_at?: string;
  images: { id: string; file_path: string }[];
  user: { id: string };
  asset: {
    asset_code: string;
    asset_check_digit: string;
    csv_code: string;
    asset_description: string;
    item_brand: string | null;
    item_model: string | null;
    material: { material_name: string };
  };
}
export interface CatalogResponse { catalog_entries: CatalogEntry[]; }

interface Props {
  workflow: string;
  selectedIds: Set<string>;
  onChangeSelected: (s: Set<string>) => void;
  registerRemove?: (fn: (ids: string[]) => void) => void;
}

const first = (v: string | null) => (v ? v.split(";").filter(Boolean)[0] ?? "" : "");
const sanitizeBaseUrl = (u?: string) => (u || "").replace(/\/+$/, "");
const setParamOrDelete = (sp: URLSearchParams, key: string, val?: string) => {
  if (val && val.trim().length > 0) sp.set(key, val);
  else sp.delete(key);
};

function DragGhost({ entry, count }: { entry: CatalogEntry; count: number }) {
  return (
    <div className="pointer-events-none select-none">
      <div className="relative w-[220px] rounded-lg overflow-hidden shadow-xl ring-1 ring-black/10 bg-background">
        <ItemPatrimonio {...entry as any} selected />
        {count > 1 && (
          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
            +{count - 1}
          </div>
        )}
      </div>
    </div>
  );
}

export function BlockItemsVitrine({ workflow, selectedIds, onChangeSelected, registerRemove }: Props) {
  const { urlGeral } = useContext(UserContext);
  const baseUrl = useMemo(() => sanitizeBaseUrl(urlGeral), [urlGeral]);

  const queryUrl = useQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const initialQ = queryUrl.get("q") || "";
  const [q, setQ] = useState(initialQ);

  const [materialId, setMaterialId] = useState(first(queryUrl.get("material_ids")));
  const [legalGuardianId, setLegalGuardianId] = useState(first(queryUrl.get("legal_guardian_ids")));
  const [locationId, setLocationId] = useState(first(queryUrl.get("location_ids")));
  const [unitId, setUnitId] = useState(first(queryUrl.get("unit_ids")));
  const [agencyId, setAgencyId] = useState(first(queryUrl.get("agency_ids")));
  const [sectorId, setSectorId] = useState(first(queryUrl.get("sector_ids")));

  const initialOffset = Number(queryUrl.get("offset") || "0");
  const initialLimit = Number(queryUrl.get("limit") || "24");
  const [offset, setOffset] = useState<number>(initialOffset);
  const [limit, setLimit] = useState<number>(initialLimit);

  const [items, setItems] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const token = localStorage.getItem("jwt_token") || "";
  const baseHeaders: HeadersInit = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const removeItemsById = (ids: string[]) => {
    if (!ids?.length) return;
    setItems((prev) => prev.filter((it) => !ids.includes(it.id)));
    onChangeSelected(new Set(Array.from(selectedIds).filter((id) => !ids.includes(id))));
  };
  useEffect(() => { registerRemove?.(removeItemsById); }, [registerRemove]); // eslint-disable-line

  const handleNavigate = (newOffset: number, newLimit: number, doScroll = true) => {
    const sp = new URLSearchParams(location.search);
    sp.set("offset", newOffset.toString());
    sp.set("limit", newLimit.toString());
    setParamOrDelete(sp, "q", q);
    setParamOrDelete(sp, "material_ids", materialId);
    setParamOrDelete(sp, "legal_guardian_ids", legalGuardianId);
    setParamOrDelete(sp, "location_ids", locationId);
    setParamOrDelete(sp, "unit_ids", unitId);
    setParamOrDelete(sp, "agency_ids", agencyId);
    setParamOrDelete(sp, "sector_ids", sectorId);
    navigate({ pathname: location.pathname, search: sp.toString() });
    if (doScroll && containerRef.current) containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  useEffect(() => { handleNavigate(offset, limit, true); /* eslint-disable-next-line */ }, [offset, limit]);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const qUrl = sp.get("q") ?? "";
    if (qUrl !== q) setQ(qUrl);

    const setFirst = (setter: (v: string) => void, key: string) => setter(first(sp.get(key)));
    setFirst(setMaterialId, "material_ids");
    setFirst(setLegalGuardianId, "legal_guardian_ids");
    setFirst(setLocationId, "location_ids");
    setFirst(setUnitId, "unit_ids");
    setFirst(setAgencyId, "agency_ids");
    setFirst(setSectorId, "sector_ids");

    const off = Number(sp.get("offset") ?? "0");
    const lim = Number(sp.get("limit") ?? String(limit));
    if (off !== offset) setOffset(off);
    if (lim !== limit) setLimit(lim);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // GET /catalog
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const url = new URL(`${baseUrl}/catalog/`);
        if (workflow) url.searchParams.set("workflow_status", workflow);
        if (q) url.searchParams.set("q", q);
        if (materialId) url.searchParams.set("material_id", materialId);
        if (legalGuardianId) url.searchParams.set("legal_guardian_id", legalGuardianId);
        if (locationId) url.searchParams.set("location_id", locationId);
        if (unitId) url.searchParams.set("unit_id", unitId);
        if (agencyId) url.searchParams.set("agency_id", agencyId);
        if (sectorId) url.searchParams.set("sector_id", sectorId);
        url.searchParams.set("offset", String(offset));
        url.searchParams.set("limit", String(limit));
        const res = await fetch(url.toString(), { method: "GET", signal: controller.signal, headers: baseHeaders });
        if (!res.ok) throw new Error(`Erro ao buscar catálogo (${res.status})`);
        const data: { catalog_entries: CatalogEntry[] } = await res.json();
        setItems(Array.isArray(data.catalog_entries) ? data.catalog_entries : []);
      } catch {
        setItems([]);
      } finally { setLoading(false); }
    })();
    return () => controller.abort();
  }, [baseUrl, baseHeaders, workflow, q, materialId, legalGuardianId, locationId, unitId, agencyId, sectorId, offset, limit]);

  // seleção tipo Drive
  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((it, i) => m.set(it.id, i));
    return m;
  }, [items]);

  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);
  const isSelected = (id: string) => selectedIds.has(id);
  const selectRange = (a: number, b: number) => {
    const [i,j] = a < b ? [a,b] : [b,a];
    const ids = items.slice(i, j+1).map((it)=>it.id);
    const next = new Set(selectedIds);
    ids.forEach((id)=>next.add(id));
    onChangeSelected(next);
  };
  const toggleSingle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChangeSelected(next);
  };
  const clearSelection = () => { onChangeSelected(new Set()); setAnchorIndex(null); };
  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    const idx = indexById.get(id) ?? 0;
    if (e.shiftKey && anchorIndex !== null) { selectRange(anchorIndex, idx); return; }
    if (e.metaKey || e.ctrlKey) { toggleSingle(id); setAnchorIndex(idx); return; }
    onChangeSelected(new Set([id])); setAnchorIndex(idx);
  };

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const selCount = Math.max(1, selectedIds.size);

  const isFirstPage = offset === 0;
  const isLastPage = items.length < limit;

  const skeletons = useMemo(
    () => Array.from({ length: 12 }, (_, i) => <Skeleton key={i} className="w-full rounded-md aspect-square" />),
    []
  );

  return (
    <div ref={containerRef}>
      {loading && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {skeletons.map((s,i)=><div key={i} className="w-full">{s}</div>)}
        </div>
      )}

      {!loading && (
        <>
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">{selectedIds.size} selecionado(s)</span>
              <Button variant="outline" size="sm" onClick={clearSelection}>Limpar seleção</Button>
            </div>
          )}

          <Droppable
            droppableId="CATALOG"
            type="CATALOG_ITEM"
            isDropDisabled
            renderClone={(provided, snapshot, rubric) => {
              const entry = items[rubric.source.index];
              return (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                  <DragGhost entry={entry} count={selCount} />
                </div>
              );
            }}
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4"
                onClick={(e)=>{ if (e.target === e.currentTarget) clearSelection(); }}
              >
                {items.map((item, index) => (
                  <Draggable draggableId={item.id} index={index} key={item.id}>
                    {(prov, snap) => {
                      if (snap.isDragging && draggingIndex !== index) setDraggingIndex(index);
                      return (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={snap.isDragging ? "opacity-0" : ""}
                        >
                          <ItemPatrimonio
                            {...(item as any)}
                            selected={isSelected(item.id)}
                            onItemClick={(e)=>handleItemClick(e, item.id)}
                          />
                        </div>
                      );
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {!items.length && <div className="pt-6 text-center">Nenhum item encontrado</div>}
        </>
      )}

      <div className="hidden md:flex md:justify-end mt-5 items-center gap-2">
        <span className="text-sm text-muted-foreground">Itens por página:</span>
        <Select
          value={limit.toString()}
          onValueChange={(v)=>{ const nl = parseInt(v); setOffset(0); setLimit(nl); handleNavigate(0, nl); }}
        >
          <SelectTrigger className="w-[100px]"><SelectValue placeholder="Itens" /></SelectTrigger>
          <SelectContent>{[12,24,36,48,84,162].map((val)=><SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="w-full flex justify-center items-center gap-10 mt-8">
        <div className="flex gap-4">
          <Button variant="outline" onClick={()=>setOffset((p)=>Math.max(0, p - limit))} disabled={isFirstPage}>
            <ChevronLeft size={16} className="mr-2"/> Anterior
          </Button>
          <Button onClick={()=>!isLastPage && setOffset((p)=>p + limit)} disabled={isLastPage}>
            Próximo <ChevronRight size={16} className="ml-2"/>
          </Button>
        </div>
      </div>
    </div>
  );
}
