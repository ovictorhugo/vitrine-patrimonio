import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, X } from "lucide-react";
import { Tabs, TabsContent } from "../../../ui/tabs";
import { Progress } from "../../../ui/progress";
import { Button } from "../../../ui/button";
import { FormularioStep as FormularioStepView, Patrimonio } from "./formulario";
import { useQuery } from "../../../authentication/signIn";
import { PesquisaStep } from "./pesquisa";
import { Dialog, DialogContent } from "../../../ui/dialog";
import { CatalogEntry } from "../../itens-vitrine/itens-vitrine";
import { toast } from "sonner";
import { UserContext } from "../../../../context/context";
import { is } from "date-fns/locale";

type StepKey = "pesquisa" | "formulario";
type StepDef = { key: StepKey; label: string };

const STEPS: StepDef[] = [
  { key: "pesquisa", label: "Pesquisa" },
  { key: "formulario", label: "Formulário" },
];

type ValidMap = Partial<Record<StepKey, boolean>>;

type WizardState = {
  pesquisa?: { value_item?: string; type?: "cod" | "atm" };
  formulario?: Patrimonio; // sua estrutura original; mapearemos para Asset ao salvar
};

const shallowEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
};

const eqPesquisa = (
  a?: { value_item?: string; type?: "cod" | "atm" },
  b?: { value_item?: string; type?: "cod" | "atm" },
) =>
  (a?.value_item ?? "") === (b?.value_item ?? "") &&
  (a?.type ?? "") === (b?.type ?? "");

export type CollectionItem = {
  id: string;
  status: boolean;
  comment: string;
  catalog: CatalogEntry;
};

export function AddPatrimonioModal({
  open,
  onOpenChange,
  addItem,
  collection,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addItem: (newItems: CollectionItem[]) => void;
  collection: string | null;
}) {
  const query = useQuery();
  const bem_cod = query.get("bem_cod") ?? undefined;
  const bem_dgv = query.get("bem_dgv") ?? undefined;
  const bem_num_atm = query.get("bem_num_atm") ?? undefined;

  const [active, setActive] = useState<StepKey>("pesquisa");
  const [valid, setValid] = useState<ValidMap>({});
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [wizard, setWizard] = useState<WizardState>({});
  const [resetKey, setResetKey] = useState(0);

  const idx = useMemo(() => STEPS.findIndex((s) => s.key === active), [active]);
  const total = STEPS.length;
  const isLast = idx === total - 1;
  const pct = ((idx + 1) / total) * 100;
  const { urlGeral } = useContext(UserContext);
  const token = useMemo(() => localStorage.getItem("jwt_token"), []);
  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token],
  );

  // inicializa mapa de validade
  useEffect(() => {
    setValid((prev) => {
      const next: ValidMap = { ...prev };
      for (const s of STEPS) {
        if (next[s.key] === undefined)
          next[s.key] = s.key === "pesquisa" ? false : (undefined as any);
      }
      return next;
    });
  }, []);

  const setValidIfChanged = useCallback(
    (producer: (prev: ValidMap) => ValidMap) => {
      setValid((prev) => {
        const next = producer(prev);
        return shallowEqual(prev, next) ? prev : next;
      });
    },
    [],
  );

  // Só atualiza wizard se conteúdo mudar de verdade
  const setWizardIfChanged = useCallback(
    (producer: (prev: WizardState) => WizardState) => {
      setWizard((prev) => {
        const next = producer(prev);
        if (
          eqPesquisa(prev.pesquisa, next.pesquisa) &&
          prev.formulario === next.formulario
        ) {
          return prev;
        }
        return next;
      });
    },
    [],
  );

  const canGoNext = useMemo(() => {
    const upto = STEPS.slice(0, idx + 1).every((s) => valid[s.key] === true);
    return upto && idx < total - 1;
  }, [idx, total, valid]);

  const canActivateIndex = useCallback(
    (targetIndex: number) => {
      if (targetIndex <= idx) return true;
      return STEPS.slice(0, targetIndex).every((s) => valid[s.key] === true);
    },
    [idx, valid],
  );

  const goPrev = useCallback(() => {
    setBlocked(false);
    if (idx > 0) setActive(STEPS[idx - 1].key);
  }, [idx]);
  const goNext = useCallback(() => {
    if (idx < total - 1 && canGoNext) setActive(STEPS[idx + 1].key);
  }, [idx, total, canGoNext, active]);

  const onValidityChangeFactory = useCallback(
    (key: StepKey) => (v: boolean) => {
      setValidIfChanged((prev) =>
        prev[key] === v ? prev : { ...prev, [key]: v },
      );
    },
    [setValidIfChanged],
  );

  const onStateChangePesquisa = useCallback(
    (st: { value_item?: string; type?: "cod" | "atm" }) => {
      setWizardIfChanged((prev) => ({
        ...prev,
        pesquisa: {
          value_item: st.value_item ?? prev.pesquisa?.value_item,
          type: st.type ?? prev.pesquisa?.type,
        },
      }));
    },
    [setWizardIfChanged],
  );

  const onStateChangeFormulario = useCallback(
    (st: Patrimonio) => {
      setWizardIfChanged((prev) => ({ ...prev, formulario: st }));
    },
    [setWizardIfChanged],
  );

  const didInitFromURL = useRef(false);
  // Preenche automaticamente a pesquisa com base nos query params
  useEffect(() => {
    // prioriza ATM se existir; senão tenta COD-DGV
    if (didInitFromURL.current) return;
    if (bem_num_atm && bem_num_atm.trim()) {
      didInitFromURL.current = true;
      setWizardIfChanged((prev) => ({
        ...prev,
        pesquisa: { value_item: bem_num_atm.trim(), type: "atm" },
      }));
      setValidIfChanged((prev) => ({ ...prev, pesquisa: true }));
      return;
    }

    if (bem_cod && bem_dgv && `${bem_cod}`.trim() && `${bem_dgv}`.trim()) {
      didInitFromURL.current = true;
      const composed = `${bem_cod.trim()}-${bem_dgv.trim()}`;
      setWizardIfChanged((prev) => ({
        ...prev,
        pesquisa: { value_item: composed, type: "cod" },
      }));
      setValidIfChanged((prev) => ({ ...prev, pesquisa: true }));
    }
  }, [bem_num_atm, bem_cod, bem_dgv, setWizardIfChanged, setValidIfChanged]);

  async function handleAddItem() {
    // 1. Verificação da coleção
    if (!collection) {
      toast("Selecione uma coleção para adicionar os itens.");
      return;
    }

    const assetCode = wizard.formulario?.asset_code;

    // Verificação de segurança caso o código não exista no formulário
    if (!assetCode) {
      toast.error("Código do patrimônio não informado.");
      return;
    }

    try {
      setLoading(true);
      const searchResponse = await fetch(
        `${urlGeral}catalog/search/asset-identifier?q=${assetCode}`,
      );

      if (!searchResponse.ok) {
        throw new Error("Falha na requisição de busca do identificador.");
      }

      const searchData = await searchResponse.json();

      if (!searchData.catalogs || searchData.catalogs.length === 0) {
        toast.error("Nenhum patrimônio encontrado com esse código.");
        return;
      }

      const catalogId = searchData.catalogs[0].catalog_id;
      const catalogResponse = await fetch(`${urlGeral}catalog/${catalogId}`);

      if (!catalogResponse.ok) {
        toast.error(`Falha ao buscar detalhes do catálogo: ${catalogId}`);
        throw new Error(`Falha ao buscar detalhes do catálogo: ${catalogId}`);
      }

      const catalogData = await catalogResponse.json();

      const isLFD = catalogData.workflow_history.some(
        (e) => e.workflow_status === "DESFAZIMENTO",
      );

      if (!isLFD) {
        toast.error("Este item não está em DESFAZIMENTO");
        setBlocked(true);
        setLoading(false);
        return;
      }

      const payload = {
        catalog_id: catalogData.id,
        status: false,
        comment: "",
      };

      const r = await fetch(
        `${urlGeral}collections/${encodeURIComponent(collection)}/items/`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        },
      );

      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Falha ao adicionar item (HTTP ${r.status})`);
      }

      let createdId = "";
      try {
        const j = await r.json();
        createdId = j?.id ?? j?.item?.id ?? null;
      } catch {}

      const newItem: CollectionItem = {
        id:
          createdId ??
          globalThis.crypto?.randomUUID?.() ??
          `${catalogData.id}::temp`,
        status: false,
        comment: "",
        catalog: catalogData,
      };

      const createdItems: CollectionItem[] = [];
      createdItems.push(newItem);

      toast.success("Item adicionado à coleção.");
      onOpenChange(false);
      addItem(createdItems);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Ocorreu um erro ao buscar os dados do patrimônio.");
    }
  }
  // ========================= RENDER =========================
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={"w-[96vw] min-w-[70vw] h-[80vh] overflow-hidden"}
      >
        <Progress
          className="absolute top-0 left-0 rounded-b-none rounded-t-lg h-1 z-[5]"
          value={pct}
        />
        <div className=" flex justify-end w-full">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onOpenChange(false)}
              title={"Fechar"}
            >
              <X size={16} />
            </Button>
          </div>
        </div>
        <div className="flex flex-col h-full w-full gap-8">
          <Tabs
            key={resetKey}
            value={active}
            onValueChange={(v) => {
              const targetIndex = STEPS.findIndex(
                (s) => s.key === (v as StepKey),
              );
              if (targetIndex !== -1 && canActivateIndex(targetIndex))
                setActive(v as StepKey);
            }}
            className="h-full"
          >
            {STEPS.map((s) => (
              <TabsContent key={s.key} value={s.key} className="m-0 h-full">
                {s.key === "pesquisa" && (
                  <PesquisaStep
                    key={`pesquisa-${resetKey}`}
                    value={"pesquisa" as any}
                    onValidityChange={onValidityChangeFactory("pesquisa")}
                    onStateChange={onStateChangePesquisa as any}
                    value_item={wizard.pesquisa?.value_item}
                    type={wizard.pesquisa?.type}
                    step={idx + 1}
                  />
                )}

                {s.key === "formulario" && (
                  <FormularioStepView
                    key={`formulario-${resetKey}`}
                    value={"formulario" as any}
                    onValidityChange={onValidityChangeFactory("formulario")}
                    onStateChange={onStateChangeFormulario as any}
                    value_item={wizard.pesquisa?.value_item}
                    type={wizard.pesquisa?.type}
                    initialData={wizard.formulario}
                    step={idx + 1}
                    showLocation={true}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>

          {!isLast ? (
            <div className="flex justify-end items-center h-fit">
              <div className="flex items-center gap-2">
                <div className="flex">
                  <Button
                    size="lg"
                    className="rounded"
                    onClick={goNext}
                    disabled={!canGoNext}
                  >
                    Próximo <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-end items-center h-fit">
              <div className="flex items-center gap-2">
                <div className="flex">
                  <Button
                    size="lg"
                    variant={"outline"}
                    className="rounded-r-none"
                    onClick={goPrev}
                  >
                    <ArrowLeft size={16} />
                    Voltar
                  </Button>
                  <Button
                    size="lg"
                    className="rounded-l-none"
                    onClick={handleAddItem}
                    disabled={loading || blocked}
                  >
                    Adicionar à coleção{" "}
                    {loading ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <ArrowRight size={16} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
