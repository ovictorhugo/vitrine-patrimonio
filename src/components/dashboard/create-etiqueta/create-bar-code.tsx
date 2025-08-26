import { Helmet } from "react-helmet";
import { Button } from "../../ui/button";
import { ArrowLeft, ArrowRight, Check, ChevronLeft } from "lucide-react";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent } from "../../ui/tabs";
import { Progress } from "../../ui/progress";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../../lib";
import { UserContext } from "../../../context/context";

import { PesquisaStepCB } from "./steps/pesquisa";

import { EtiquetaStepCB } from "./steps/etiqueta";
import { FormularioStep, Patrimonio } from "../novo-item/steps/formulario";

type StepKey = "pesquisa" | "formulario" | "etiqueta";
type StepDef = { key: StepKey; label: string };

const STEPS: StepDef[] = [
  { key: "pesquisa", label: "Pesquisa" },
  { key: "formulario", label: "Formulário" },
  { key: "etiqueta", label: "Etiqueta" },
];

type ValidMap = Partial<Record<StepKey, boolean>>;

type WizardState = {
  pesquisa?: { value_item?: string; type?: "cod" | "atm" };
  formulario?: Patrimonio;
};

const shallowEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a); const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
};

export function CreateBarCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { urlGeral } = useContext(UserContext);

  const [active, setActive] = useState<StepKey>("pesquisa");
  const [valid, setValid] = useState<ValidMap>({});
  const [wizard, setWizard] = useState<WizardState>({});

  const idx = useMemo(() => STEPS.findIndex((s) => s.key === active), [active]);
  const total = STEPS.length;
  const isLast = idx === total - 1;
  const isPenultimate = idx === total - 2;
  const pct = ((idx + 1) / total) * 100;

  // init validações
  useEffect(() => {
    setValid((prev) => {
      const next: ValidMap = { ...prev };
      for (const s of STEPS) {
        if (next[s.key] === undefined) next[s.key] = s.key === "pesquisa" ? false : undefined;
      }
      return next;
    });
  }, []);

  const setValidIfChanged = useCallback((producer: (prev: ValidMap) => ValidMap) => {
    setValid((prev) => {
      const next = producer(prev);
      return shallowEqual(prev, next) ? prev : next;
    });
  }, []);

  const setWizardIfChanged = useCallback((producer: (prev: WizardState) => WizardState) => {
    setWizard((prev) => {
      const next = producer(prev);
      return shallowEqual(prev, next) ? prev : next;
    });
  }, []);

  const canGoNext = useMemo(() => {
    const upto = STEPS.slice(0, idx + 1).every((s) => valid[s.key] === true);
    return upto && idx < total - 1;
  }, [idx, total, valid]);

  const canActivateIndex = useCallback((targetIndex: number) => {
    if (targetIndex <= idx) return true;
    return STEPS.slice(0, targetIndex).every((s) => valid[s.key] === true);
  }, [idx, valid]);

  const goPrev = useCallback(() => { if (idx > 0) setActive(STEPS[idx - 1].key); }, [idx]);
  const goNext = useCallback(() => { if (idx < total - 1 && canGoNext) setActive(STEPS[idx + 1].key); }, [idx, total, canGoNext]);

  const onValidityChangeFactory = useCallback(
    (key: StepKey) => (v: boolean) => {
      setValidIfChanged(prev => (prev[key] === v ? prev : { ...prev, [key]: v }));
    },
    [setValidIfChanged]
  );

  const onStateChangePesquisa = useCallback((st: { value_item?: string; type?: "cod" | "atm" }) => {
    setWizardIfChanged(prev => ({ ...prev, pesquisa: { ...prev.pesquisa, ...st } }));
  }, [setWizardIfChanged]);

  const onStateChangeFormulario = useCallback((st: Patrimonio) => {
    setWizardIfChanged(prev => ({ ...prev, formulario: st }));
  }, [setWizardIfChanged]);

  const handleBack = () => {
    const path = location.pathname;
    const hasQuery = location.search.length > 0;
    if (hasQuery) navigate(path);
    else {
      const seg = path.split("/").filter(Boolean);
      if (seg.length > 1) { seg.pop(); navigate("/" + seg.join("/")); }
      else navigate("/");
    }
  };

  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full ">
      <Helmet>
        <title>Criar etiqueta | Vitrine Patrimônio</title>
        <meta name="description" content="Criar etiqueta | Vitrine Patrimônio" />
      </Helmet>

      <Progress className="absolute top-0 left-0 rounded-b-none rounded-t-lg h-1 z-[5]" value={pct} />

      <main className="flex flex-1 h-full lg:flex-row flex-col-reverse gap-8">
        <div className="w-full flex flex-col gap-8">
          <div className="flex gap-2">
            <Button onClick={handleBack} variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>
            <h1 className="text-xl font-semibold tracking-tight">Criar etiqueta</h1>
          </div>

          <div className="flex flex-col h-full w-full gap-8">
            <Tabs
              value={active}
              onValueChange={(v) => {
                const targetIndex = STEPS.findIndex((s) => s.key === (v as StepKey));
                if (targetIndex !== -1 && canActivateIndex(targetIndex)) setActive(v as StepKey);
              }}
              className="h-full"
            >
              {STEPS.map((s) => (
                <TabsContent key={s.key} value={s.key} className="m-0 h-full">
                  {s.key === "pesquisa" && (
                    <PesquisaStepCB
                      value={"pesquisa" as any}
                      onValidityChange={onValidityChangeFactory("pesquisa")}
                      onStateChange={onStateChangePesquisa as any}
                      value_item={wizard.pesquisa?.value_item}
                      type={wizard.pesquisa?.type}
                      step={idx + 1}
                    />
                  )}

                  {s.key === "formulario" && (
                    <FormularioStep
                      value={"formulario" as any}
                      onValidityChange={onValidityChangeFactory("formulario")}
                      onStateChange={onStateChangeFormulario as any}
                      value_item={wizard.pesquisa?.value_item}
                      type={wizard.pesquisa?.type}
                      initialData={wizard.formulario}
                      step={idx + 1}
                    />
                  )}

                  {s.key === "etiqueta" && (
                    <EtiquetaStepCB
                      value={"etiqueta" as any}
                      onValidityChange={onValidityChangeFactory("etiqueta")}
                      data={wizard.formulario}
                      onNew={() => {
                        setWizard({});
                        setValid({});
                        setActive("pesquisa");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      onHome={() => { setActive("pesquisa"); }}
                      onDashboard={() => navigate("/dashboard")}
                      step={idx + 1}
                    />
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {/* === Barra inferior de navegação ===
                - some no último passo
                - no penúltimo, o botão da direita mostra "Finalizar"
            */}
            {!isLast && (
              <div className="flex justify-between items-center h-fit">
                <div>
                  {STEPS.slice(0, idx + 1).map((s) => (
                    <span key={s.key} className={cn("mr-2", valid[s.key] ? "text-emerald-600" : "text-amber-600")}>●</span>
                  ))}
                </div>

                <div className="flex items-center">
                  <Button variant="outline" size="lg" className="rounded-r-none" onClick={goPrev} disabled={idx === 0}>
                    <ArrowLeft size={16} /> Anterior
                  </Button>
                  <Button
                    size="lg"
                    className="rounded-l-none"
                    onClick={goNext}
                    disabled={!canGoNext}
                  >
                    {isPenultimate ? <>Finalizar <Check size={16} /></> : <>Próximo <ArrowRight size={16} /></>}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
