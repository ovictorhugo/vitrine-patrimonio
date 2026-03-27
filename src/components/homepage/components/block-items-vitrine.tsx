import {
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { UserContext } from "../../../context/context";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Repeat, Trash } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { ItemPatrimonio } from "./item-patrimonio";
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
import { useQuery } from "../../authentication/signIn";
import { CatalogEntry } from "../../dashboard/itens-vitrine/card-item-dropdown";

/* ===== Resposta da API ===== */
export interface CatalogResponse {
  catalog_entries: CatalogEntry[];
}

/* ===== Props ===== */
interface Props {
  workflow: string[];
  type?: string;
  value?: string; // filtro workflow que vem do pai
  workflowOptions?: string[];
  user_id?: string; // lista para o popup de movimentação
}

/* ===== Helpers de URL/filtros (compatível com seu modal) ===== */
const first = (v: string | null) =>
  v ? (v.split(";").filter(Boolean)[0] ?? "") : "";
const sanitizeBaseUrl = (u?: string) => (u || "").replace(/\/+$/, "");
const setParamOrDelete = (sp: URLSearchParams, key: string, val?: string) => {
  if (val && val.trim().length > 0) sp.set(key, val);
  else sp.delete(key);
};

// aceita tanto plural quanto singular (prioriza plural)
const getPluralOrSingular = (
  sp: URLSearchParams,
  pluralKey: string,
  singularKey: string,
) => sp.get(pluralKey) ?? sp.get(singularKey);

const firstFromPluralOrSingular = (
  sp: URLSearchParams,
  pluralKey: string,
  singularKey: string,
) => first(getPluralOrSingular(sp, pluralKey, singularKey));

export function BlockItemsVitrine(props: Props) {
  const { urlGeral } = useContext(UserContext);
  const baseUrl = useMemo(() => sanitizeBaseUrl(urlGeral), [urlGeral]);

  const queryUrl = useQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ===== Lê PLURAL OU SINGULAR na URL =====
  const initialQ = queryUrl.get("q") || "";
  const sp = new URLSearchParams(location.search);
  const offset = Number(sp.get("offset") || "0");
  const limit = Number(sp.get("limit") || "24");
  const q = sp.get("q") || "";

  const [items, setItems] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  const baseHeaders: HeadersInit = useMemo(() => {
    const token = localStorage.getItem("jwt_token") || "";
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

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
      const token = localStorage.getItem("jwt_token") || "";
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
      try {
        window.dispatchEvent(
          new CustomEvent("catalog:deleted", {
            detail: { id: deleteTargetId },
          }),
        );
      } catch {}
      closeDelete();
    } catch (e: any) {
      toast("Erro ao excluir", {
        description: e?.message || "Tente novamente.",
      });
    } finally {
      setDeleting(false);
    }
  }, [deleteTargetId, baseUrl]);

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

      // --- CORREÇÃO AQUI ---

      setItems((prev) => {
        // 1. Normaliza os workflows permitidos nesta lista para um Array
        // Se props.workflow for string, vira [string]. Se for array, mantém.
        const allowedWorkflows = Array.isArray(props.workflow)
          ? props.workflow
          : [props.workflow];

        // 2. Verifica se o NOVO status deve continuar visível nesta tela
        const shouldStayInList = allowedWorkflows.includes(moveStatus);

        if (!shouldStayInList) {
          // CASO A: O item foi para um status que esta lista não exibe -> REMOVE
          return prev.filter((it) => it.id !== moveTargetId);
        } else {
          // CASO B: O item mudou de status, mas continua nesta lista -> ATUALIZA
          return prev.map((it) => {
            if (it.id === moveTargetId) {
              // Atualiza o workflow_status localmente para refletir a mudança visual
              // Nota: Ajuste a estrutura abaixo conforme seu objeto 'CatalogEntry' real
              return {
                ...it,
                workflow_status: moveStatus, // Se estiver na raiz
                // Se estiver dentro de um objeto aninhado (ex: last_workflow), atualize lá:
                // last_workflow: { ...it.last_workflow, workflow_status: moveStatus }
              };
            }
            return it;
          });
        }
      });

      // ---------------------

      // Emite o evento global para outras partes da tela se atualizarem
      try {
        window.dispatchEvent(
          new CustomEvent("catalog:workflow-updated", {
            detail: { id: moveTargetId, newStatus: moveStatus },
          }),
        );
      } catch {}

      toast("Movimentação registrada!");
      closeMove();
    } catch (e: any) {
      toast("Erro ao movimentar", {
        description: e?.message || "Tente novamente.",
      });
    } finally {
      setMoving(false);
    }
  }, [moveTargetId, moveStatus, moveObs, baseUrl, baseHeaders, props.workflow]); // Dependências ok
  // ===== Atualiza URL (mantendo PLURAL do modal) e scroll =====
  const handleNavigate = (
    newOffset: number,
    newLimit: number,
    doScroll = true,
  ) => {
    // 1. Pega a URL exatamente como está agora (com todos os filtros já aplicados)
    const currentSp = new URLSearchParams(location.search);

    // 2. Altera apenas a paginação
    currentSp.set("offset", newOffset.toString());
    currentSp.set("limit", newLimit.toString());

    // 3. Navega! (Não precisa dar setParamOrDelete para as outras coisas, elas já estão na URL)
    navigate({ pathname: location.pathname, search: currentSp.toString() });

    if (doScroll && hasNavigated && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setHasNavigated(true);
  };

  useEffect(() => {
    const controller = new AbortController();

    // Lemos a URL diretamente AQUI, no momento exato em que o efeito roda
    const sp = new URLSearchParams(location.search);

    // Capturamos os valores da URL (com fallbacks se estiverem vazios)
    const currentQ = sp.get("q") || "";
    const currentOffset = sp.get("offset") || "0";
    const currentLimit = sp.get("limit") || "24";

    const currentMaterialId = firstFromPluralOrSingular(
      sp,
      "material_ids",
      "material_id",
    );
    const currentLegalGuardianId = firstFromPluralOrSingular(
      sp,
      "legal_guardian_ids",
      "legal_guardian_id",
    );
    const currentLocationId = firstFromPluralOrSingular(
      sp,
      "location_ids",
      "location_id",
    );
    const currentUnitId = firstFromPluralOrSingular(sp, "unit_ids", "unit_id");
    const currentAgencyId = firstFromPluralOrSingular(
      sp,
      "agency_ids",
      "agency_id",
    );
    const currentSectorId = firstFromPluralOrSingular(
      sp,
      "sector_ids",
      "sector_id",
    );

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const workflowsToFetch = Array.isArray(props.workflow)
          ? props.workflow
          : props.workflow
            ? [props.workflow]
            : [null];

        const requests = workflowsToFetch.map(async (wfStatus) => {
          // Lembre-se de usar o seu endpoint OTIMIZADO aqui: /catalog/simple
          const url = new URL(`${baseUrl}/catalog/cards`);

          if (wfStatus) url.searchParams.set("workflow_status", wfStatus);

          // Usamos as variáveis locais que lemos direto da URL, e não o State do React!
          if (currentQ) url.searchParams.set("q", currentQ);
          if (currentMaterialId)
            url.searchParams.set("material_id", currentMaterialId);
          if (currentLegalGuardianId)
            url.searchParams.set("legal_guardian_id", currentLegalGuardianId);
          if (currentLocationId)
            url.searchParams.set("location_id", currentLocationId);
          if (currentUnitId) url.searchParams.set("unit_id", currentUnitId);
          if (currentAgencyId)
            url.searchParams.set("agency_id", currentAgencyId);
          if (currentSectorId)
            url.searchParams.set("sector_id", currentSectorId);

          if (props.user_id) url.searchParams.set("user_id", props.user_id);

          if (props.type === "user_id")
            url.searchParams.set("user_id", props.value || "");
          if (props.type === "location_id")
            url.searchParams.set("location_id", props.value || "");
          if (props.type === "reviewer_id")
            url.searchParams.set("reviewer_id", props.value || "");

          url.searchParams.set("offset", currentOffset);
          url.searchParams.set("limit", currentLimit);

          const res = await fetch(url.toString(), {
            method: "GET",
            signal: controller.signal,
            headers: baseHeaders,
          });

          if (!res.ok)
            throw new Error(`Erro ao buscar catálogo (${res.status})`);
          return res.json() as Promise<CatalogResponse>;
        });

        const responses = await Promise.all(requests);
        const combinedItems = responses.flatMap((data) =>
          Array.isArray(data.catalog_entries) ? data.catalog_entries : [],
        );

        setItems(combinedItems);
        setLoading(false);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e?.message || "Erro inesperado ao carregar itens.");
          setItems([]);
          setLoading(false);
        }
      }
    };

    run();
    return () => controller.abort();

    // As dependências agora são a URL e as props.
    // Removemos os estados (q, offset, limit, materialId, etc) daqui!
  }, [
    location.search,
    baseUrl,
    baseHeaders,
    props.workflow,
    props.type,
    props.value,
    props.user_id,
  ]);
  // paginação
  const isFirstPage = offset === 0;
  const isLastPage = items.length < limit;

  const skeletons = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md aspect-square" />
      )),
    [],
  );

  // Remover ou Atualizar item da lista quando algum outro lugar mover o workflow
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as
        | { id?: string; newStatus?: string }
        | undefined;

      if (!detail?.id) return;

      setItems((prev) => {
        // 1. Verifica se o item existe nesta lista
        const exists = prev.some((it) => it.id === detail.id);
        if (!exists) return prev;

        // 2. Normaliza os workflows permitidos nesta lista (String -> Array)
        const allowedWorkflows = Array.isArray(props.workflow)
          ? props.workflow
          : [props.workflow];

        // 3. Verifica se o item deve permanecer na lista
        // (Se newStatus não vier definido, assumimos que não deve filtrar, ou removemos por segurança.
        //  Aqui assumi que se tiver newStatus, checamos. Se não tiver, mantém.)
        const shouldStay = detail.newStatus
          ? allowedWorkflows.includes(detail.newStatus)
          : true; // Ou false, dependendo de quão estrito você quer ser

        if (!shouldStay) {
          // CASO A: O novo status não pertence a esta lista -> REMOVE
          return prev.filter((it) => it.id !== detail.id);
        }

        // CASO B: O item mudou de status mas continua aqui -> ATUALIZA
        // Isso evita que o item fique com a cor/status "velho" até recarregar
        if (detail.newStatus) {
          return prev.map((it) =>
            it.id === detail.id
              ? { ...it, workflow_status: detail.newStatus }
              : it,
          );
        }

        return prev;
      });
    };

    window.addEventListener("catalog:workflow-updated" as any, handler as any);
    return () =>
      window.removeEventListener(
        "catalog:workflow-updated" as any,
        handler as any,
      );
  }, [props.workflow]);

  // Remover item quando for excluído em outro lugar (ex.: modal de item)
  useEffect(() => {
    const handler = (e: any) => {
      const id = e?.detail?.id as string | undefined;
      if (!id) return;
      setItems((prev) => prev.filter((it) => it.id !== id));
    };

    window.addEventListener("catalog:deleted" as any, handler as any);
    return () =>
      window.removeEventListener("catalog:deleted" as any, handler as any);
  }, []);

  return (
    <div ref={containerRef}>
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-2   md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {skeletons.map((item, index) => (
            <div className="w-full" key={index}>
              {item}
            </div>
          ))}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
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

      {!loading && items.length === 0 && (
        <div>
          <p className="items-center justify-center w-full flex text-center pt-6">
            Nenhum item encontrado na busca
          </p>
          {error && (
            <p className="items-center justify-center w-full flex text-center pt-2 text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Controle "itens por página" */}
      <div className="hidden md:flex md:justify-end mt-5 items-center gap-2">
        <span className="text-sm text-muted-foreground">Itens por página:</span>
        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            const newLimit = parseInt(value);
            handleNavigate(0, newLimit, true);
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
            onClick={() => {
              // Calcula o novo offset e joga direto para a função que muda a URL
              const novoOffset = Math.max(0, offset - limit);
              handleNavigate(novoOffset, limit, true);
            }}
            disabled={isFirstPage}
          >
            <ChevronLeft size={16} className="mr-2" />
            Anterior
          </Button>

          <Button
            onClick={() => {
              const novoOffset = offset + limit;
              handleNavigate(novoOffset, limit, true);
            }}
            disabled={isLastPage}
          >
            Próximo
            <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* ===================== DIALOG: EXCLUIR ===================== */}
      {isDeleteOpen && (
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
      )}

      {/* ===================== DIALOG: MOVIMENTAR ===================== */}
      {isMoveOpen && (
        <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
          <DialogContent>
            <DialogHeader className="pt-8 px-6 flex flex-col items-center">
              <DialogTitle className="text-2xl mb-2 font-medium max-w-[520px] text-center">
                Movimentar item do catálogo
              </DialogTitle>
              <DialogDescription className="text-zinc-500 text-center">
                Selecione um status e (opcionalmente) escreva uma observação
                para registrar no histórico do item.
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
              <Button
                onClick={handleConfirmMove}
                disabled={!moveStatus || moving}
              >
                <Repeat size={16} /> {moving ? "Salvando…" : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
