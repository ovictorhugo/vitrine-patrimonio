import { useContext, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { UserContext } from "../../../context/context";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Repeat, Trash } from "lucide-react";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import {  ItemPatrimonio } from "./item-patrimonio";
import { Skeleton } from "../../ui/skeleton";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { ArrowUUpLeft } from "phosphor-react";
import { useQuery } from "../../authentication/signIn";
import { CatalogEntry } from "../../dashboard/itens-vitrine/card-item-dropdown";


/* ===== Resposta da API ===== */
export interface CatalogResponse {
  catalog_entries: CatalogEntry[];
}

/* ===== Props ===== */
interface Props {
  workflow: string;              // filtro workflow que vem do pai
  workflowOptions?: string[];    // lista para o popup de movimentação
}

/* ===== Helpers de URL/filtros (compatível com seu modal) ===== */
const first = (v: string | null) => (v ? v.split(";").filter(Boolean)[0] ?? "" : "");
const sanitizeBaseUrl = (u?: string) => (u || "").replace(/\/+$/, "");
const setParamOrDelete = (sp: URLSearchParams, key: string, val?: string) => {
  if (val && val.trim().length > 0) sp.set(key, val);
  else sp.delete(key);
};

export function BlockItemsVitrine(props: Props) {
  const { urlGeral } = useContext(UserContext);
  const baseUrl = useMemo(() => sanitizeBaseUrl(urlGeral), [urlGeral]);

  const queryUrl = useQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ===== Lê PLURAL do modal na URL =====
  const initialQ = queryUrl.get("q") || "";
  const [q, setQ] = useState(initialQ);

  const [materialId, setMaterialId] = useState(first(queryUrl.get("material_ids")));
  const [legalGuardianId, setLegalGuardianId] = useState(first(queryUrl.get("legal_guardian_ids")));
  const [locationId, setLocationId] = useState(first(queryUrl.get("location_ids")));
  const [unitId, setUnitId] = useState(first(queryUrl.get("unit_ids")));
  const [agencyId, setAgencyId] = useState(first(queryUrl.get("agency_ids")));
  const [sectorId, setSectorId] = useState(first(queryUrl.get("sector_ids")));

  // paginação
  const initialOffset = Number(queryUrl.get("offset") || "0");
  const initialLimit = Number(queryUrl.get("limit") || "24");
  const [offset, setOffset] = useState<number>(initialOffset);
  const [limit, setLimit] = useState<number>(initialLimit);

  const [items, setItems] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  const token = localStorage.getItem("jwt_token") || "";
  const baseHeaders: HeadersInit = useMemo(() => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

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
      const r = await fetch(`${baseUrl}/catalog/${deleteTargetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`Falha ao excluir (${r.status}): ${t}`);
      }
      setItems((prev) => prev.filter((it) => it.id !== deleteTargetId));
      toast("Item excluído com sucesso.");
      closeDelete();
    } catch (e: any) {
      toast("Erro ao excluir", { description: e?.message || "Tente novamente." });
    } finally {
      setDeleting(false);
    }
  }, [deleteTargetId, baseUrl, token]);

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
        headers: { ...baseHeaders },
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
  }, [moveTargetId, moveStatus, moveObs, baseUrl, baseHeaders]);

  // ===== Atualiza URL (mantendo PLURAL do modal) e scroll =====
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

    if (doScroll && hasNavigated && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setHasNavigated(true);
  };

  // reflete mudanças de paginação na URL
  useEffect(() => {
    handleNavigate(offset, limit, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit]);

  // ===== Sincroniza estado quando a URL muda (ex.: modal abriu/fechou) =====
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const qUrl = sp.get("q") ?? "";

    setQ((prev) => (prev !== qUrl ? qUrl : prev));
    setMaterialId((prev) => (prev !== first(sp.get("material_ids")) ? first(sp.get("material_ids")) : prev));
    setLegalGuardianId((prev) => (prev !== first(sp.get("legal_guardian_ids")) ? first(sp.get("legal_guardian_ids")) : prev));
    setLocationId((prev) => (prev !== first(sp.get("location_ids")) ? first(sp.get("location_ids")) : prev));
    setUnitId((prev) => (prev !== first(sp.get("unit_ids")) ? first(sp.get("unit_ids")) : prev));
    setAgencyId((prev) => (prev !== first(sp.get("agency_ids")) ? first(sp.get("agency_ids")) : prev));
    setSectorId((prev) => (prev !== first(sp.get("sector_ids")) ? first(sp.get("sector_ids")) : prev));

    const off = Number(sp.get("offset") ?? "0");
    const lim = Number(sp.get("limit") ?? String(limit));
    setOffset((prev) => (prev !== off ? off : prev));
    setLimit((prev) => (prev !== lim ? lim : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // ===== GET /catalog/ com filtros (SINGULARES para o backend) =====
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = new URL(`${baseUrl}/catalog/`);
        // filtro de workflow (obrigatório)
        if (props.workflow) url.searchParams.set("workflow_status", props.workflow);

        // busca textual
        if (q) url.searchParams.set("q", q);

        // converte plural->singular
        if (materialId) url.searchParams.set("material_id", materialId);
        if (legalGuardianId) url.searchParams.set("legal_guardian_id", legalGuardianId);
        if (locationId) url.searchParams.set("location_id", locationId);
        if (unitId) url.searchParams.set("unit_id", unitId);
        if (agencyId) url.searchParams.set("agency_id", agencyId);
        if (sectorId) url.searchParams.set("sector_id", sectorId);

        url.searchParams.set("offset", String(offset));
        url.searchParams.set("limit", String(limit));

        const res = await fetch(url.toString(), {
          method: "GET",
          signal: controller.signal,
          headers: baseHeaders,
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
  }, [
    baseUrl,
    baseHeaders,
    props.workflow,
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

  // paginação
  const isFirstPage = offset === 0;
  const isLastPage = items.length < limit;

  const skeletons = useMemo(
    () => Array.from({ length: 12 }, (_, index) => <Skeleton key={index} className="w-full rounded-md aspect-square" />),
    []
  );

  return (
    <div ref={containerRef}>
      {loading && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {skeletons.map((item, index) => (
            <div className="w-full" key={index}>
              {item}
            </div>
          ))}
        </div>
      )}

      {(!loading && items.length > 0) && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {items.map((item: CatalogEntry) => (
            <ItemPatrimonio
              key={item.id}
              {...item}
              onPromptDelete={() => openDelete(item.id)}
              onPromptMove={() => openMove(item.id)}
            />
          ))}
        </div>
      )}

      {(!loading && items.length == 0) && (
        <div>
          <p className="items-center justify-center w-full flex text-center pt-6">Nenhum item encontrado na busca</p>
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
