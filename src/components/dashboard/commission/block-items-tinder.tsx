import { useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { UserContext } from "../../../context/context";
import { useQuery } from "../../modal/search-modal-patrimonio";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Skeleton } from "../../ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { ArrowUUpLeft } from "phosphor-react";
import { ChevronLeft, ChevronRight, Repeat, Trash } from "lucide-react";
import { ItemPatrimonioTinder } from "./item-patrimonio";

/* ===== Tipos auxiliares ===== */
export interface Unit { id: string; unit_name: string; unit_code: string; unit_siaf: string; }
export interface Agency { id: string; agency_name: string; agency_code: string; unit_id: string; unit: Unit; }
export interface Sector { id: string; sector_name: string; sector_code: string; agency_id: string; agency: Agency; }
export interface Location { id: string; location_name: string; location_code: string; sector_id: string; sector: Sector; }
export interface Material { id: string; material_name: string; material_code: string; }
export interface LegalGuardian { id: string; legal_guardians_name: string; legal_guardians_code: string; }
export interface Asset {
  id: string;
  asset_code: string;
  asset_check_digit: string;
  atm_number: string | null;
  serial_number: string | null;
  asset_status: string;
  asset_value: string;
  asset_description: string;
  csv_code: string;
  accounting_entry_code: string;
  item_brand: string | null;
  item_model: string | null;
  group_type_code: string;
  group_code: string;
  expense_element_code: string;
  subelement_code: string;
  is_official: boolean;
  material: Material;
  legal_guardian: LegalGuardian;
  location: Location;
}
export interface User {
  id: string; username: string; email: string; provider: string;
  linkedin: string | null; lattes_id: string | null; orcid: string | null; ramal: string | null;
  photo_url: string | null; background_url: string | null; matricula: string | null;
  verify: boolean; institution_id: string;
}
export interface Image { id: string; catalog_id: string; file_path: string; }
export interface WorkflowHistory {
  id: string; workflow_status: string; catalog_id: string; user_id: string;
  detail: { message?: string };
}

/* ===== Tipo principal ===== */
export interface CatalogEntry {
  id: string;
  situation: string;
  conservation_status: string;
  description: string;
  asset: Asset;
  user: User;
  location: Location;
  images: Image[];
  workflow_history: WorkflowHistory[];
  created_at?: string;
}

/* ===== Resposta da API ===== */
export interface CatalogResponse {
  catalog_entries: CatalogEntry[];
}

/* ===== Props ===== */
interface Props {
  workflow: string;              // filtro workflow que vem do pai (opcional de uso)
  workflowOptions?: string[];    // lista de status para o popup de movimentação
}

/* ====== SwipeCard: card arrastável estilo Tinder (render-prop) ====== */
function SwipeCard({
  children,       // render-prop: ({progress, dragging}) => ReactNode
  onSwiped,
  onCancel,
}: {
  children: (ctx: { progress: number; dragging: boolean }) => React.ReactNode;
  onSwiped: (dir: "left" | "right") => void;
  onCancel?: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [exiting, setExiting] = useState<null | "left" | "right">(null);

  const threshold = 120;

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setDx(0);
    setDy(0);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDx(e.clientX - startX);
    setDy(e.clientY - startY);
  };
  const endDrag = (vx: number) => {
    if (Math.abs(vx) > threshold) {
      const dir = vx > 0 ? "right" : "left";
      setExiting(dir);
      setTimeout(() => onSwiped(dir), 150);
    } else {
      setDragging(false);
      setDx(0);
      setDy(0);
      onCancel?.();
    }
  };
  const onPointerUp = () => endDrag(dx);

  const rotate = Math.max(Math.min(dx / 12, 20), -20);
  const style: React.CSSProperties = {
    transform: exiting
      ? `translate3d(${exiting === "right" ? 1200 : -1200}px, ${dy}px, 0) rotate(${rotate}deg)`
      : `translate3d(${dx}px, ${dy * 0.3}px, 0) rotate(${rotate}deg)`,
    transition: dragging ? "none" : exiting ? "transform 200ms ease" : "transform 200ms ease",
    touchAction: "none",
  };

  const progress = Math.max(-1, Math.min(1, dx / threshold));

  return (
    <div
      className="absolute inset-0 will-change-transform"
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {children({ progress, dragging })}
    </div>
  );
}

/* ===================== Componente Pai ===================== */
export function BlockItemsVitrine(props: Props) {
  const { urlGeral } = useContext(UserContext);

  const queryUrl = useQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const materialId = queryUrl.get("material_id") || "";
  const legalGuardianId = queryUrl.get("legal_guardian_id") || "";

  const initialOffset = Number(queryUrl.get("offset") || "0");
  const initialLimit = Number(queryUrl.get("limit") || "24");

  const [offset, setOffset] = useState<number>(initialOffset);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [items, setItems] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  const [index, setIndex] = useState(0); // card atual do deck
  const token = localStorage.getItem("jwt_token") || "";

  // ====== Dialog: EXCLUIR ======
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const openDelete = (catalogId: string) => { setDeleteTargetId(catalogId); setIsDeleteOpen(true); };
  const closeDelete = () => { setIsDeleteOpen(false); setDeleteTargetId(null); };

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    try {
      setDeleting(true);
      const r = await fetch(`${urlGeral}catalog/${deleteTargetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`Falha ao excluir (${r.status}): ${t}`);
      }
      // remove localmente e ajusta índice
      setItems((prev) => prev.filter((it) => it.id !== deleteTargetId));
      setIndex((prev) => (prev >= items.length - 1 ? Math.max(0, prev - 1) : prev));
      toast("Item excluído com sucesso.");
      closeDelete();
    } catch (e: any) {
      toast("Erro ao excluir", { description: e?.message || "Tente novamente." });
    } finally {
      setDeleting(false);
    }
  }, [deleteTargetId, urlGeral, token, items.length]);

  // ====== Dialog: MOVIMENTAR ======
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

  const handleConfirmMove = useCallback(async () => {
    if (!moveTargetId || !moveStatus) return;
    try {
      setMoving(true);
      const payload = {
        workflow_status: moveStatus,
        detail: { observation: moveObs }, // observação no corpo
      };
      const r = await fetch(`${urlGeral}catalog/${moveTargetId}/workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`Falha ao movimentar (${r.status}): ${t}`);
      }
      toast("Movimentação registrada!");
      closeMove();
    } catch (e: any) {
      toast("Erro ao movimentar", { description: e?.message || "Tente novamente." });
    } finally {
      setMoving(false);
    }
  }, [moveTargetId, moveStatus, moveObs, urlGeral, token]);

  // Atualiza URL e faz scroll suave
  const handleNavigate = (newOffset: number, newLimit: number, doScroll = true) => {
    queryUrl.set("offset", newOffset.toString());
    queryUrl.set("limit", newLimit.toString());

    if (materialId) queryUrl.set("material_id", materialId);
    else queryUrl.delete("material_id");

    if (legalGuardianId) queryUrl.set("legal_guardian_id", legalGuardianId);
    else queryUrl.delete("legal_guardian_id");

    if (props.workflow) queryUrl.set("workflow", props.workflow);
    else queryUrl.delete("workflow");

    navigate({ pathname: location.pathname, search: queryUrl.toString() });

    if (doScroll && hasNavigated && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setHasNavigated(true);
  };

  // Reset índice quando filtros mudarem
  useEffect(() => { setIndex(0); }, [materialId, legalGuardianId, props.workflow]);

  useEffect(() => {
    handleNavigate(offset, limit, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit, props.workflow, materialId, legalGuardianId]);

  // GET /catalog/ com filtros
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = new URL(`${urlGeral}catalog/`);
        if (materialId) url.searchParams.set("material_id", materialId);
        if (legalGuardianId) url.searchParams.set("legal_guardian_id", legalGuardianId);
        if (props.workflow) url.searchParams.set("workflow", props.workflow);
        url.searchParams.set("offset", String(offset));
        url.searchParams.set("limit", String(limit));

        const res = await fetch(url.toString(), {
          method: "GET",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error(`Erro ao buscar catálogo (${res.status})`);

        const data: CatalogResponse = await res.json();
        setItems(Array.isArray(data.catalog_entries) ? data.catalog_entries : []);
        setIndex(0);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e?.message || "Erro inesperado ao carregar itens.");
          setItems([]);
          setIndex(0);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [urlGeral, materialId, legalGuardianId, offset, limit, props.workflow]);

  // paginação baseada em offset/limit para “carregar mais”
  const isFirstPage = offset === 0;
  const canLoadMore = items.length < limit ? false : true;

  // Cards visíveis (stack)
  const visible = useMemo(() => items.slice(index, index + 3), [items, index]);

  // Swipe handler: sempre abre popup de movimento e avança o deck
  const handleSwiped = (dir: "left" | "right") => {
    const current = items[index];
    if (!current) return;
    openMove(current.id);
    setIndex((i) => Math.min(items.length, i + 1));
  };

  // Ações de UI para avançar/voltar manualmente
  const nextCard = () => {
    const current = items[index];
    if (!current) return;
    openMove(current.id);
    setIndex((i) => Math.min(items.length, i + 1));
  };
  const prevCard = () => setIndex((i) => Math.max(0, i - 1));

  // Skeleton do topo
  const skeletons = useMemo(
    () => [<Skeleton key="s1" className="w-full rounded-xl h-[520px]" />],
    []
  );

  return (
    <div ref={containerRef} className="w-full">
      {/* Status */}
      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

      {/* Controle "itens por página" */}
      <div className="hidden md:flex md:justify-end mb-4 items-center gap-2">
        <span className="text-sm text-muted-foreground">Itens por página:</span>
        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            const newLimit = parseInt(value);
            setOffset(0);
            setLimit(newLimit);
            handleNavigate(0, newLimit);
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

      {/* Deck Tinder */}
      <div className="relative mx-auto max-w-[680px] w-full" style={{ height: 560 }}>
        {loading && !error && skeletons}

        {!loading && !error && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-sm text-muted-foreground">Sem mais itens nesta página.</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
                disabled={isFirstPage}
              >
                <ChevronLeft size={16} className="mr-2" />
                Página anterior
              </Button>
              <Button
                onClick={() => canLoadMore && setOffset((prev) => prev + limit)}
                disabled={!canLoadMore}
              >
                Próxima página
                <ChevronRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Stack de 3 cards (topo é arrastável) */}
        {!loading && !error && visible.map((item, i) => {
          const isTop = i === 0;
          const depth = visible.length - i; // 3,2,1
          const scale = 1 - i * 0.04;
          const translateY = i * 8;

          return (
            <div
              key={item.id}
              className="absolute inset-0 flex items-center justify-center"
              style={{ zIndex: 10 + depth }}
            >
              <div
                className="w-full"
                style={{
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  transition: "transform 200ms ease",
                }}
              >
                {isTop ? (
                  <SwipeCard onSwiped={handleSwiped} onCancel={() => {}}>
                    {({ progress }) => (
                      <div className="select-none rounded-xl border bg-background shadow-sm overflow-hidden">
                       
                      </div>
                    )}
                  </SwipeCard>
                ) : (
                  <div className="select-none rounded-xl border bg-background shadow-sm overflow-hidden opacity-90">
                   
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controles abaixo do deck */}
      {!loading && !error && items[index] && (
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="outline" onClick={prevCard} disabled={index === 0}>
            <ChevronLeft size={16} className="mr-2" /> Voltar
          </Button>
          <Button onClick={nextCard}>
            Mover <Repeat size={16} className="ml-2" />
          </Button>
        </div>
      )}

      {/* ===================== DIALOG: EXCLUIR ===================== */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader className="pt-8 px-6 flex flex-col items-center">
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px] text-center">
              <strong className="bg-red-500 text-white px-1 rounded">Deletar</strong> item do catálogo
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-center">
              Esta ação é irreversível. Ao deletar, todas as informações deste item no catálogo serão perdidas.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="py-4">
            <Button variant="ghost" onClick={closeDelete}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
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
                  {(props.workflowOptions || ["STARTED", "UNDER_REVIEW", "APPROVED", "REJECTED"]).map((opt) => (
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
