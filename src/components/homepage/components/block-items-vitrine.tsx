import { useContext, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { UserContext } from "../../../context/context";
import { useQuery } from "../../modal/search-modal-patrimonio";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Repeat, Trash } from "lucide-react";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ItemPatrimonio } from "./item-patrimonio";
import { Skeleton } from "../../ui/skeleton";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { ArrowUUpLeft } from "phosphor-react";

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
  detail: { message: string };
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
}

/* ===== Resposta da API ===== */
export interface CatalogResponse {
  catalog_entries: CatalogEntry[];
}

/* ===== Props ===== */
interface Props {
  workflow: string;              // filtro workflow que vem do pai (opcional de uso)
  workflowOptions?: string[];    // lista de status que será renderizada no popup de movimentação
}

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

  const token = localStorage.getItem("jwt_token") || "";

  // ====== Dialog: EXCLUIR ======
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
      // remove localmente
      setItems((prev) => prev.filter((it) => it.id !== deleteTargetId));
      toast("Item excluído com sucesso.");
      closeDelete();
    } catch (e: any) {
      toast("Erro ao excluir", { description: e?.message || "Tente novamente." });
    } finally {
      setDeleting(false);
    }
  }, [deleteTargetId, urlGeral, token]);

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
        detail: { observation: { text: moveObs } }, // objeto com texto de observação
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
      // se quiser atualizar algum campo do card, faça aqui (ex: refetch desse item)
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

    if (props.workflow) queryUrl.set("workflow__status", props.workflow);
    else queryUrl.delete("workflow__status");

    navigate({ pathname: location.pathname, search: queryUrl.toString() });

    if (doScroll && hasNavigated && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setHasNavigated(true);
  };

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
        if (props.workflow) url.searchParams.set("workflow__status", props.workflow);
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
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e?.message || "Erro inesperado ao carregar itens.");
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [urlGeral, materialId, legalGuardianId, offset, limit, props.workflow]);

  // paginação
  const isFirstPage = offset === 0;
  const isLastPage = items.length < limit;
  const breakpoints = { 350: 1, 750: 2, 900: 3, 1200: 4, 1700: 5 };

  const skeletons = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md h-[250px]" />
      )),
    []
  );

  const Workflors = [
    {
      value: 'REVIEW_REQUESTED_VITRINE',
      name: 'Revisão para Vitrine'
    },
    {
      value: 'REVIEW_REQUESTED_DESFAZIMENTO',
      name: 'Revisão para Desfazimento'
    },
    {
      value: 'REVIEW_REQUESTED_COMISSION',
      name: 'Revisão para Comissão'
    },
  ]

   
  return (
    <div ref={containerRef}>

      {loading && (
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4, 1700: 5 }}>
          <Masonry gutter="16px">
            {skeletons.map((item, index) => (
              <div className="w-full" key={index}>
                {item}
              </div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      )}

      {/* Grid */}
      {!loading && (
       <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5  gap-4">
            {items.map((item: CatalogEntry) => (
              <ItemPatrimonio
                key={item.id}
                {...item}
                // o filho só dispara os diálogos do pai:
                onPromptDelete={() => openDelete(item.id)}
                onPromptMove={() => openMove(item.id)}
              
              />
            ))}
       </div>
      )}

      {/* Controle "itens por página" */}
      <div className="hidden md:flex md:justify-end mt-5 items-center gap-2">
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

      {/* Paginação */}
      <div className="w-full flex justify-center items-center gap-10 mt-8">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
            disabled={isFirstPage}
          >
            <ChevronLeft size={16} className="mr-2" />
            Anterior
          </Button>

          <Button onClick={() => !isLastPage && setOffset((prev) => prev + limit)} disabled={isLastPage}>
            Próximo
            <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>

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
