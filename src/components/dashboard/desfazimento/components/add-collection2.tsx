import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, Plus, X } from "lucide-react";
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
import { CheckStep } from "./check";

type StepKey = "pesquisa" | "formulario" | "check";
type StepDef = { key: StepKey; label: string };

const STEPS: StepDef[] = [
  { key: "pesquisa", label: "Pesquisa" },
  { key: "formulario", label: "Formulário" },
  { key: "check", label: "Check" },
];

type ValidMap = Partial<Record<StepKey, boolean>>;

type WizardState = {
  pesquisa?: { value_item?: string; type?: "cod" | "atm" };
  formulario?: Patrimonio;
  catalog?: CatalogEntry;
  check?: { isChecked: boolean; comment: string };
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
  const [isLFD, setIsLFD] = useState(true);
  const [finished, setFinished] = useState(false);

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
          prev.formulario === next.formulario &&
          prev.check === next.check &&
          prev.catalog === next.catalog
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
    return upto && idx < total - 1 && (isLFD || idx != 1);
  }, [idx, total, valid, isLFD]);

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

  const onStateChangeCheck = useCallback(
    (st) => {
      setWizardIfChanged((prev) => ({ ...prev, check: st }));
    },
    [setWizardIfChanged],
  );

  const onStateChangeCatalog = useCallback(
    (st: CatalogEntry) => {
      console.log(st);
      setWizardIfChanged((prev) => ({ ...prev, catalog: st }));
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

    console.log(wizard);

    if (!wizard?.catalog?.id) {
      toast.error("Código do patrimônio não informado.");
      return;
    }

    try {
      setLoading(true);

      const isLFD = wizard?.catalog?.workflow_history.some(
        (e) => e.workflow_status === "DESFAZIMENTO",
      );

      if (!isLFD) {
        toast.error("Este item não está em DESFAZIMENTO");
        setBlocked(true);
        setLoading(false);
        return;
      }

      const payload = {
        catalog_id: wizard.catalog.id,
        status: wizard?.check?.isChecked || false,
        comment: wizard.check?.comment || "",
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
          `${wizard.catalog.id}::temp`,
        status: wizard?.check?.isChecked || false,
        comment: wizard.check?.comment || "",
        catalog: wizard.catalog,
      };

      const createdItems: CollectionItem[] = [];
      createdItems.push(newItem);

      toast.success("Item adicionado à coleção.");
      addItem(createdItems);
      setLoading(false);
      setFinished(true);
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Ocorreu um erro ao buscar os dados do patrimônio.");
    }
  }

  useEffect(() => {
    const isLFDHook = wizard?.catalog?.workflow_history.some(
      (e) => e.workflow_status === "DESFAZIMENTO",
    );
    setIsLFD(isLFDHook ?? true);
  }, [wizard?.catalog?.workflow_history]);

  // ========================= RENDER =========================
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          "w-[96vw] min-w-[75vw] h-[80vh] overflow-hidden flex flex-col p-4"
        }
      >
        <Progress
          className="absolute top-0 left-0 rounded-b-none rounded-t-lg h-1 z-[5]"
          value={pct}
        />
        <div className=" flex justify-end w-full max-h-[60px]">
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
        {finished ? (
          <div className="max-w-[936px] mx-auto flex flex-col justify-center h-full w-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2 items-center pl-4">
                <div className="flex justify-between items-center h-fit mt-2 w-8">
                  <p className="text-lg">{idx + 1}</p>
                  <ArrowRight size={16} />
                </div>
                <h1 className="text-2xl md:text-4xl font-semibold max-w-[1000px]">
                  Parabéns, item adicionado com sucesso!
                </h1>
              </div>
            </div>

            <div className="ml-8 grid gap-4 justify-start">
              <p className="text-xl text-neutral-600 dark:text-neutral-400 font-medium leading-tight tracking-tighter mb-4">
                Deseja adicionar um novo item à coleção?
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    setWizard({});
                    setActive("pesquisa");
                    setFinished(false);
                    setResetKey((k) => k + 1);
                  }}
                  className="max-w-[250px]"
                >
                  <Plus size={16} className="mr-2" />
                  Adicionar outro item
                </Button>

                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
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
          className="flex-1"
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
                  onCatalogChange={onStateChangeCatalog as any}
                  value_item={wizard.pesquisa?.value_item}
                  type={wizard.pesquisa?.type}
                  initialData={wizard.formulario}
                  step={idx + 1}
                  showLocation={true}
                />
              )}

              {s.key === "check" && (
                <CheckStep
                  key={`check-${resetKey}`}
                  value={"check" as any}
                  onValidityChange={onValidityChangeFactory("check")}
                  onStateChange={onStateChangeCheck}
                  initialData={wizard.check}
                  step={idx + 1}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>

        {!isLast ? (
          <div className="grid justify-end items-end max-h-[50px]">
            <div className="flex items-center gap-2">
              <div className="flex">
                <Button
                  size="lg"
                  variant={"outline"}
                  className="rounded-r-none"
                  onClick={goPrev}
                  disabled={active === "pesquisa"}
                >
                  <ArrowLeft size={16} />
                  Voltar
                </Button>
                <Button
                  size="lg"
                  className="rounded-l-none"
                  onClick={goNext}
                  disabled={!canGoNext}
                >
                  Próximo <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid justify-end items-end max-h-[50px]">
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
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
