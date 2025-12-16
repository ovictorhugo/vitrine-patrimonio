// src/pages/desfazimento/components/block-items-vitrine.tsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../../../context/context";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Trash } from "lucide-react";
import { Button } from "../../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Skeleton } from "../../../ui/skeleton";
import { useQuery } from "../../../authentication/signIn";
import { ItemPatrimonio } from "./item-patrimonio";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Portal } from "./portal";
import { Alert } from "../../../ui/alert";
import { ItemPatrimonioRows } from "./item-patrimonio-rows";

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
export interface CatalogResponse {
  catalog_entries: CatalogEntry[];
}

interface Props {
  workflow: string;
  selectedIds: Set<string>;
  onChangeSelected: (s: Set<string>) => void;
  registerRemove?: (fn: (ids: string[]) => void) => void;
}

const first = (v: string | null) =>
  v ? v.split(";").filter(Boolean)[0] ?? "" : "";
const sanitizeBaseUrl = (u?: string) => (u || "").replace(/\/+$/, "");
const setParamOrDelete = (sp: URLSearchParams, key: string, val?: string) => {
  if (val && val.trim().length > 0) sp.set(key, val);
  else sp.delete(key);
};

type Pt = { x: number; y: number };
const rectIntersects = (a: DOMRect, b: DOMRect) =>
  !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );

export function RowsItemsVitrine({
  workflow,
  selectedIds,
  onChangeSelected,
  registerRemove,
}: Props) {
  const { urlGeral } = useContext(UserContext);
  const baseUrl = useMemo(() => sanitizeBaseUrl(urlGeral), [urlGeral]);

  const queryUrl = useQuery();
  const navigate = useNavigate();
  const location = useLocation();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const initialQ = queryUrl.get("q") || "";
  const [q, setQ] = useState(initialQ);

  const [materialId, setMaterialId] = useState(
    first(queryUrl.get("material_ids"))
  );
  const [legalGuardianId, setLegalGuardianId] = useState(
    first(queryUrl.get("legal_guardian_ids"))
  );
  const [locationId, setLocationId] = useState(
    first(queryUrl.get("location_ids"))
  );
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
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const removeItemsById = (ids: string[]) => {
    if (!ids?.length) return;
    setItems((prev) => prev.filter((it) => !ids.includes(it.id)));
    onChangeSelected(
      new Set(Array.from(selectedIds).filter((id) => !ids.includes(id)))
    );
  };
  useEffect(() => {
    registerRemove?.(removeItemsById);
  }, [registerRemove]); // eslint-disable-line

  const handleNavigate = (
    newOffset: number,
    newLimit: number,
    doScroll = true
  ) => {
    const sp = new URLSearchParams(location.search);
    sp.set("offset", newOffset.toString());
    sp.set("limit", newLimit.toString());
    sp.set("only_uncollected", "true");
    setParamOrDelete(sp, "q", q);
    setParamOrDelete(sp, "material_ids", materialId);
    setParamOrDelete(sp, "legal_guardian_ids", legalGuardianId);
    setParamOrDelete(sp, "location_ids", locationId);
    setParamOrDelete(sp, "unit_ids", unitId);
    setParamOrDelete(sp, "agency_ids", agencyId);
    setParamOrDelete(sp, "sector_ids", sectorId);
    navigate({ pathname: location.pathname, search: sp.toString() });
    if (doScroll && containerRef.current)
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };
  useEffect(() => {
    handleNavigate(offset, limit, true); /* eslint-disable-next-line */
  }, [offset, limit]);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const qUrl = sp.get("q") ?? "";
    if (qUrl !== q) setQ(qUrl);
    const setFirst = (setter: (v: string) => void, key: string) =>
      setter(first(sp.get(key)));
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
  }, [location.search]); // eslint-disable-line

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const url = new URL(`${baseUrl}/catalog/`);
        if (workflow) url.searchParams.set("workflow_status", workflow);
        if (q) url.searchParams.set("q", q);
        if (materialId) url.searchParams.set("material_id", materialId);
        if (legalGuardianId)
          url.searchParams.set("legal_guardian_id", legalGuardianId);
        if (locationId) url.searchParams.set("location_id", locationId);
        if (unitId) url.searchParams.set("unit_id", unitId);
        if (agencyId) url.searchParams.set("agency_id", agencyId);
        if (sectorId) url.searchParams.set("sector_id", sectorId);
        url.searchParams.set("offset", String(offset));
        url.searchParams.set("only_uncollected", "true");
        url.searchParams.set("limit", String(limit));
        const res = await fetch(url.toString(), {
          method: "GET",
          signal: controller.signal,
          headers: baseHeaders,
        });
        if (!res.ok) throw new Error(`Erro ao buscar catálogo (${res.status})`);
        const data: { catalog_entries: CatalogEntry[] } = await res.json();
        setItems(
          Array.isArray(data.catalog_entries) ? data.catalog_entries : []
        );
        setLoading(false);
      } catch {
        setItems([]);
      }
    })();
    return () => controller.abort();
  }, [
    baseUrl,
    baseHeaders,
    workflow,
    q,
    materialId,
    legalGuardianId,
    locationId,
    unitId,
    agencyId,
    sectorId,
    offset,
    limit,
  ]);

  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((it, i) => m.set(it.id, i));
    return m;
  }, [items]);

  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);
  const isSelected = (id: string) => selectedIds.has(id);

  const selectRange = (a: number, b: number) => {
    const [i, j] = a < b ? [a, b] : [b, a];
    const ids = items.slice(i, j + 1).map((it) => it.id);
    const next = new Set(selectedIds);
    ids.forEach((id) => next.add(id));
    onChangeSelected(next);
  };

  const toggleSingle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChangeSelected(next);
  };

  const clearSelection = () => {
    onChangeSelected(new Set());
    setAnchorIndex(null);
  };

  // Lógica de seleção estilo Google Drive
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [startPt, setStartPt] = useState<Pt | null>(null);
  const [currentPt, setCurrentPt] = useState<Pt | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const baseSelectionRef = useRef<Set<string>>(new Set());
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const mouseDownTimeRef = useRef<number>(0);

  const registerItemRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  };

  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    const idx = indexById.get(id) ?? 0;

    // Shift + Click: seleção de range
    if (e.shiftKey && anchorIndex !== null) {
      selectRange(anchorIndex, idx);
      return;
    }

    // Ctrl/Cmd + Click: toggle individual
    if (e.metaKey || e.ctrlKey) {
      toggleSingle(id);
      setAnchorIndex(idx);
      return;
    }

    // Click simples: seleciona apenas este item
    onChangeSelected(new Set([id]));
    setAnchorIndex(idx);
  };

  // Iniciar seleção por arrastar
  const handleGridMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Apenas botão esquerdo do mouse
    if (e.button !== 0) return;

    // Verificar se clicou no próprio grid (não em um item)
    const target = e.target as HTMLElement;
    const clickedOnGrid =
      target === gridRef.current ||
      target.closest('[data-droppable-id="CATALOG"]') === gridRef.current;

    if (!clickedOnGrid) return;

    const grid = gridRef.current;
    if (!grid) return;

    mouseDownTimeRef.current = Date.now();
    hasMovedRef.current = false;

    const rect = grid.getBoundingClientRect();
    const x = e.clientX - rect.left + grid.scrollLeft;
    const y = e.clientY - rect.top + grid.scrollTop;

    // Salvar seleção base (para Ctrl + arrastar)
    baseSelectionRef.current = new Set(selectedIds);

    setStartPt({ x, y });
    setCurrentPt({ x, y });
    isDraggingRef.current = true;

    e.preventDefault();
  };

  // Atualizar seleção durante o arrasto
  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !startPt) return;

    hasMovedRef.current = true;

    const grid = gridRef.current;
    if (!grid) return;

    const rect = grid.getBoundingClientRect();
    const x = e.clientX - rect.left + grid.scrollLeft;
    const y = e.clientY - rect.top + grid.scrollTop;

    setCurrentPt({ x, y });

    // Calcular retângulo de seleção
    const left = Math.min(startPt.x, x);
    const top = Math.min(startPt.y, y);
    const width = Math.abs(x - startPt.x);
    const height = Math.abs(y - startPt.y);

    // Apenas mostrar box se moveu pelo menos 5px (evita seleção acidental)
    if (width > 5 || height > 5) {
      if (!isBoxSelecting) setIsBoxSelecting(true);
      setSelectionBox({ left, top, width, height });

      const selectionRect = new DOMRect(left, top, width, height);

      // Começar com seleção base (se Ctrl/Cmd pressionado)
      const isAdditive = e.ctrlKey || e.metaKey;
      let next = new Set<string>(isAdditive ? baseSelectionRef.current : []);

      // Verificar interseção com cada item
      itemRefs.current.forEach((el, id) => {
        const itemRect = el.getBoundingClientRect();
        const itemAbsRect = new DOMRect(
          itemRect.left - rect.left + grid.scrollLeft,
          itemRect.top - rect.top + grid.scrollTop,
          itemRect.width,
          itemRect.height
        );

        if (rectIntersects(selectionRect, itemAbsRect)) {
          next.add(id);
        } else if (!isAdditive) {
          next.delete(id);
        }
      });

      onChangeSelected(next);
    }
  };

  // Finalizar seleção
  const handleGridMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const clickDuration = Date.now() - mouseDownTimeRef.current;
    const wasQuickClick = clickDuration < 200 && !hasMovedRef.current;

    // Se foi um clique rápido sem movimento e sem Ctrl/Cmd, limpa seleção
    if (wasQuickClick && !e.ctrlKey && !e.metaKey) {
      clearSelection();
    }

    // Resetar estados
    isDraggingRef.current = false;
    setIsBoxSelecting(false);
    setStartPt(null);
    setCurrentPt(null);
    setSelectionBox(null);
    hasMovedRef.current = false;

    e.preventDefault();
    e.stopPropagation();
  };

  // Limpar seleção ao clicar fora
  useEffect(() => {
    const handleDocumentMouseDown = (e: MouseEvent) => {
      const grid = gridRef.current;
      if (!grid) return;

      const clickedInsideGrid = grid.contains(e.target as Node);
      const clickedOnAlert = (e.target as HTMLElement).closest(
        '[role="alert"]'
      );

      // Limpar seleção se clicou fora do grid e não no alert de seleção
      if (!clickedInsideGrid && !clickedOnAlert && selectedIds.size > 0) {
        clearSelection();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC limpa seleção
      if (e.key === "Escape" && selectedIds.size > 0) {
        clearSelection();
      }

      // Ctrl/Cmd + A seleciona todos
      if ((e.ctrlKey || e.metaKey) && e.key === "a" && gridRef.current) {
        e.preventDefault();
        const allIds = new Set(items.map((item) => item.id));
        onChangeSelected(allIds);
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIds, items, onChangeSelected]);

  // Cancelar seleção se mouse sair da janela
  useEffect(() => {
    const handleMouseLeave = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsBoxSelecting(false);
        setStartPt(null);
        setCurrentPt(null);
        setSelectionBox(null);
      }
    };

    window.addEventListener("mouseleave", handleMouseLeave);
    return () => window.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const isFirstPage = offset === 0;
  const isLastPage = items.length < limit;

  const skeletons = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => (
        <Skeleton
          key={i}
          className="w-full h-[200px] rounded-md aspect-square"
        />
      )),
    []
  );

  return (
    <div ref={containerRef}>
      {loading && (
        <div className="grid gap-4">
          {skeletons.map((s, i) => (
            <div key={i} className="w-full ">
              {s}
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <>
          {selectedIds.size > 0 && (
            <Alert className="flex items-center sticky top-0 z-10 mb-8 justify-between p-2 px-4 shadow-sm">
              <span className="text-sm font-medium">
                {selectedIds.size} item(ns) selecionado(s)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="px-3 h-9"
              >
                <Trash size={16} className="mr-2" />
                Limpar seleção
              </Button>
            </Alert>
          )}

          <Droppable
            droppableId="CATALOG"
            type="CATALOG_ITEM"
            isDropDisabled
            renderClone={(provided, snapshot, rubric) => {
              const entry = items[rubric.source.index];
              return (
                <Portal>
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="pointer-events-none"
                    style={{
                      ...(provided.draggableProps.style || {}),
                      zIndex: 9999,
                    }}
                  >
                    <div className="scale-[0.98] rounded-lg overflow-hidden shadow-2xl ">
                      <ItemPatrimonioRows {...(entry as any)} selected />
                    </div>
                  </div>
                </Portal>
              );
            }}
          >
            {(provided) => (
              <div className="relative">
                <div
                  ref={(el) => {
                    provided.innerRef(el);
                    gridRef.current = el;
                  }}
                  {...provided.droppableProps}
                  className={`grid  gap-4 ${
                    isBoxSelecting ? "select-none cursor-crosshair" : ""
                  }`}
                  onMouseDown={handleGridMouseDown}
                  onMouseMove={handleGridMouseMove}
                  onMouseUp={handleGridMouseUp}
                  style={{ position: "relative", minHeight: "200px" }}
                >
                  {items.map((item, index) => (
                    <Draggable
                      draggableId={item.id}
                      index={index}
                      key={item.id}
                    >
                      {(prov, snap) => (
                        <div
                          ref={(el) => {
                            prov.innerRef(el);
                            registerItemRef(item.id)(el);
                          }}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={
                            snap.isDragging ? "opacity-70 scale-[0.98]" : ""
                          }
                          data-item-id={item.id}
                        >
                          <ItemPatrimonioRows
                            {...(item as any)}
                            selected={isSelected(item.id)}
                            onItemClick={(e) => handleItemClick(e, item.id)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>

                {/* Box de seleção visual */}
                {isBoxSelecting && selectionBox && (
                  <div
                    className="absolute pointer-events-none border-2 border-primary/50 bg-primary/10 rounded-sm z-50"
                    style={{
                      left: `${selectionBox.left}px`,
                      top: `${selectionBox.top}px`,
                      width: `${selectionBox.width}px`,
                      height: `${selectionBox.height}px`,
                    }}
                  />
                )}
              </div>
            )}
          </Droppable>

          {!items.length && (
            <div className="pt-6 text-center text-muted-foreground">
              Nenhum item encontrado
            </div>
          )}
        </>
      )}

      <div className="hidden md:flex md:justify-end mt-5 items-center gap-2">
        <span className="text-sm text-muted-foreground">Itens por página:</span>
        <Select
          value={limit.toString()}
          onValueChange={(v) => {
            const nl = parseInt(v);
            setOffset(0);
            setLimit(nl);
            handleNavigate(0, nl);
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Itens" />
          </SelectTrigger>
          <SelectContent>
            {[12, 24, 36, 48, 84, 162].map((val) => (
              <SelectItem key={val} value={val.toString()}>
                {val}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full flex justify-center items-center gap-10 mt-8">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setOffset((p) => Math.max(0, p - limit))}
            disabled={isFirstPage}
          >
            <ChevronLeft size={16} className="mr-2" /> Anterior
          </Button>
          <Button
            onClick={() => !isLastPage && setOffset((p) => p + limit)}
            disabled={isLastPage}
          >
            Próximo <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
