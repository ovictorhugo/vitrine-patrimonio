import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  Check,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Tabs, TabsContent } from "../../ui/tabs";
import { Progress } from "../../ui/progress";
import { cn } from "../../../lib";
import { toast } from "sonner";

import { UserContext } from "../../../context/context";

// Reuso dos steps existentes
import { FormularioSpStep } from "../novo-item/steps/formulario-sp";
import { TrocarLocalStep } from "../novo-item/steps/trocar-local";
import { EtiquetaStepCB } from "../create-etiqueta/steps/etiqueta";
import { useIsMobile } from "../../../hooks/use-mobile";

// === Tipos locais ===
type StepKey = "formulario-sp" | "trocar-local" | "etiqueta";
type StepDef = { key: StepKey; label: string };
const STEPS: StepDef[] = [
  { key: "formulario-sp", label: "Formulário" },
  { key: "trocar-local", label: "Trocar local" },
  { key: "etiqueta", label: "Etiqueta" },
];

type ValidMap = Partial<Record<StepKey, boolean>>;

// Esses tipos espelham o que os seus steps emitem
interface Agency {
  id: string;
  agency_name: string;
  agency_code: string;
}
interface Unit {
  id: string;
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
  agency_id: string;
  agency?: Agency;
}
interface Sector {
  id: string;
  sector_name: string;
  sector_code: string;
  unit_id: string;
  unit: Unit;
}
interface Location {
  id: string;
  location_name: string;
  location_code: string;
  sector_id: string;
  sector: Sector;
}

// Patrimônio (mesmo shape do seu FormularioSpStep)
export interface PatrimonioSP {
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
  id: string;
  agency: { agency_name: string; agency_code: string; id: string };
  unit: { unit_name: string; unit_code: string; unit_siaf: string; id: string };
  sector: { sector_name: string; sector_code: string; id: string };
  location: { location_code: string; location_name: string; id: string };
  material: { id: string; material_code: string; material_name: string };
  legal_guardian: {
    id: string;
    legal_guardians_code: string;
    legal_guardians_name: string;
  };
  is_official: boolean;
}

// Estado do wizard desta página
type WizardState = {
  "formulario-sp"?: PatrimonioSP;
  "trocar-local"?: {
    agency_id?: string;
    unit_id?: string;
    sector_id?: string;
    location_id?: string;
    agency?: Agency | null;
    unit?: Unit | null;
    sector?: Sector | null;
    location?: Location | null;
    isOpen?: boolean;
  };
  created_asset_id?: string;
};

// helpers
const shallowEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
};

// === payload p/ /assets (mesma lógica do NovoItem) ===
const buildAssetsPayload = (
  form: PatrimonioSP,
  tl?: WizardState["trocar-local"]
) => ({
  bem_cod: form.asset_code || "",
  bem_dgv: form.asset_check_digit || "",
  bem_num_atm: form.atm_number || "",
  bem_serie: form.serial_number || "",
  bem_sta: form.asset_status || "",
  bem_val: form.asset_value || "",
  bem_dsc_com: form.asset_description || "",
  csv_cod: form.csv_code || "",
  tre_cod: form.accounting_entry_code || "",
  agency_id: tl?.agency_id || "",
  unit_id: tl?.unit_id || "",
  sector_id: tl?.sector_id || "",
  location_id: tl?.location_id || "",
  material_id: form.material?.id || "",
  legal_guardian_id: form.legal_guardian?.id || "",
  ite_mar: form.item_brand || "",
  ite_mod: form.item_model || "",
  tgr_cod: form.group_type_code || "",
  grp_cod: form.group_code || "",
  ele_cod: form.expense_element_code || "",
  sbe_cod: form.subelement_code || "",
});

// === monta objeto só para a Etiqueta (usa form + trocar-local) ===
const buildEtiquetaData = (
  form?: PatrimonioSP,
  tl?: WizardState["trocar-local"]
) => {
  // mínimos usados em EtiquetaStepCB
  return {
    asset_code: form?.asset_code || "",
    asset_check_digit: form?.asset_check_digit || "",
    atm_number: form?.atm_number || "",
    asset_description: form?.asset_description || "",
    id: form?.id || "",
    material: {
      material_name: form?.material?.material_name || "",
      material_code: form?.material?.material_code || "",
      id: form?.material?.id || "",
    },
    unit: {
      unit_name: tl?.unit?.unit_name || "",
      unit_siaf: tl?.unit?.unit_siaf || "",
      unit_code: tl?.unit?.unit_code || "",
      id: tl?.unit?.id || "",
    },
    agency: {
      agency_name: tl?.agency?.agency_name || "",
      agency_code: tl?.agency?.agency_code || "",
      id: tl?.agency?.id || "",
    },
    sector: {
      sector_name: tl?.sector?.sector_name || "",
      sector_code: tl?.sector?.sector_code || "",
      id: tl?.sector?.id || "",
    },
    location: {
      location_name: tl?.location?.location_name || "",
      location_code: tl?.location?.location_code || "",
      id: tl?.location?.id || "",
    },
  } as any; // compatível com o esperado por EtiquetaStepCB
};

export function CreateTempAsset() {
  const { urlGeral } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // wizard
  const [active, setActive] = useState<StepKey>("formulario-sp");
  const [valid, setValid] = useState<ValidMap>({});
  const [wizard, setWizard] = useState<WizardState>({});

  const idx = useMemo(() => STEPS.findIndex((s) => s.key === active), [active]);
  const total = STEPS.length;
  const isLast = idx === total - 1;
  const isPenultimate = idx === total - 2;
  const pct = ((idx + 1) / total) * 100;

  // barra de progresso/validações iniciais
  useEffect(() => {
    setValid((prev) => {
      const next: ValidMap = { ...prev };
      for (const s of STEPS) {
        if (next[s.key] === undefined)
          next[s.key] = s.key === "formulario-sp" ? false : undefined;
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
    []
  );
  const setWizardIfChanged = useCallback(
    (producer: (prev: WizardState) => WizardState) => {
      setWizard((prev) => {
        const next = producer(prev);
        return shallowEqual(prev, next) ? prev : next;
      });
    },
    []
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
    [idx, valid]
  );

  const goPrev = useCallback(() => {
    if (idx > 0) setActive(STEPS[idx - 1].key);
  }, [idx]);
  const goNext = useCallback(() => {
    if (idx < total - 1 && canGoNext) setActive(STEPS[idx + 1].key);
  }, [idx, total, canGoNext]);

  const onValidityChangeFactory = useCallback(
    (key: StepKey) => (v: boolean) => {
      setValidIfChanged((prev) =>
        prev[key] === v ? prev : { ...prev, [key]: v }
      );
    },
    [setValidIfChanged]
  );

  // coleta states dos steps
  const onStateChangeFormularioSP = useCallback(
    (st: PatrimonioSP) => {
      setWizardIfChanged((prev) => ({ ...prev, "formulario-sp": st }));
    },
    [setWizardIfChanged]
  );

  const onStateChangeTrocarLocal = useCallback(
    (st: any) => {
      setWizardIfChanged((prev) => ({
        ...prev,
        "trocar-local": { ...(prev["trocar-local"] || {}), ...st },
      }));
    },
    [setWizardIfChanged]
  );

  // navegação
  const handleBack = () => {
    const path = location.pathname;
    const hasQuery = location.search.length > 0;
    if (hasQuery) navigate(path);
    else {
      const seg = path.split("/").filter(Boolean);
      if (seg.length > 1) {
        seg.pop();
        navigate("/" + seg.join("/"));
      } else navigate("/");
    }
  };

  // === Loading de finalização ===
  const [isFinishing, setIsFinishing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Estamos procurando todas as informações no nosso banco de dados, aguarde."
  );

  useEffect(() => {
    if (!isFinishing) return;
    const timeouts: NodeJS.Timeout[] = [];

    setLoadingMessage("Estamos criando o registro no sistema.");
    timeouts.push(
      setTimeout(
        () => setLoadingMessage("Gerando o patrimônio temporário..."),
        4000
      )
    );
    timeouts.push(
      setTimeout(
        () => setLoadingMessage("Estamos quase lá, continue aguardando..."),
        8000
      )
    );
    timeouts.push(
      setTimeout(() => setLoadingMessage("Só mais um pouco..."), 12000)
    );
    timeouts.push(
      setTimeout(
        () =>
          setLoadingMessage(
            "Está demorando mais que o normal... finalizando o envio."
          ),
        16000
      )
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isFinishing]);

  // === Finalizar (POST /assets) e ir para Etiqueta ===
  const handleFinish = useCallback(async () => {
    try {
      const formSP = wizard["formulario-sp"];
      const troca = wizard["trocar-local"];
      const token = localStorage.getItem("jwt_token");

      if (!formSP) {
        toast("Dados incompletos", {
          description: "Preencha o formulário antes de finalizar.",
        });
        return;
      }
      if (
        !troca?.agency_id ||
        !troca?.unit_id ||
        !troca?.sector_id ||
        !troca?.location_id
      ) {
        toast("Localização incompleta", {
          description:
            "Selecione Unidade/Organização/Setor/Local em Trocar Local.",
        });
        return;
      }

      setIsFinishing(true);

      const assetsPayload = buildAssetsPayload(formSP, troca);
      const resp = await fetch(`${urlGeral}assets/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(assetsPayload),
      });

      if (resp.status !== 201) {
        const txt = await resp.text().catch(() => "");
        throw new Error(`Falha ao criar asset (${resp.status}): ${txt}`);
      }

      const assetJson = await resp.json();
      const assetId: string | undefined = assetJson?.id;
      if (!assetId) throw new Error("Resposta /assets/ sem ID.");

      // salva no wizard (e no form, para a etiqueta mostrar ID)
      setWizardIfChanged((prev) => ({
        ...prev,
        "formulario-sp": {
          ...(prev["formulario-sp"] as PatrimonioSP),
          id: assetId,
        },
        created_asset_id: assetId,
      }));

      toast.success("Patrimônio temporário criado com sucesso!");

      // segue para a última etapa (Etiqueta)
      setActive("etiqueta");
    } catch (err: any) {
      console.error(err);
      toast("Erro ao finalizar", {
        description: err?.message || "Tente novamente.",
      });
    } finally {
      setIsFinishing(false);
    }
  }, [wizard, urlGeral, setWizardIfChanged]);

  // === Tela de LOADING (finalização) ===
  if (isFinishing) {
    const isMobile = useIsMobile();

    if (isMobile) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="text-eng-blue mb-4 animate-pulse">
              <LoaderCircle size={54} className="animate-spin" />
            </div>
            <p className="font-medium text-lg max-w-[400px] text-center">
              {loadingMessage}
            </p>
          </div>
        </div>
      );
    } else
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="text-eng-blue mb-4 animate-pulse">
              <LoaderCircle size={108} className="animate-spin" />
            </div>
            <p className="font-medium text-lg max-w-[500px] text-center">
              {loadingMessage}
            </p>
          </div>
        </div>
      );
  }

  // === Render página ===
  const etiquetaData = buildEtiquetaData(
    wizard["formulario-sp"],
    wizard["trocar-local"]
  );

  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full ">
      <Helmet>
        <title>Criar patrimônio temporário | Sistema Patrimônio</title>
        <meta
          name="description"
          content="Criar patrimônio temporário | Sistema Patrimônio"
        />
      </Helmet>

      {/* progresso */}
      <Progress
        className="absolute top-0 left-0 rounded-b-none rounded-t-lg h-1 z-[5]"
        value={pct}
      />

      <main className="flex flex-1 h-full lg:flex-row flex-col-reverse gap-8">
        <div className="w-full flex h-full flex-col gap-8">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const path = location.pathname;
                const hasQuery = location.search.length > 0;
                if (hasQuery) navigate(path);
                else {
                  const seg = path.split("/").filter(Boolean);
                  if (seg.length > 1) {
                    seg.pop();
                    navigate("/" + seg.join("/"));
                  } else navigate("/");
                }
              }}
              variant="outline"
              size="icon"
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>

            <h1 className="text-xl font-semibold tracking-tight">
              Criar patrimônio temporário
            </h1>
          </div>

          <div className="flex flex-col h-full w-full gap-8">
            <Tabs
              value={active}
              onValueChange={(v) => {
                const targetIndex = STEPS.findIndex(
                  (s) => s.key === (v as StepKey)
                );
                if (targetIndex !== -1 && canActivateIndex(targetIndex))
                  setActive(v as StepKey);
              }}
              className="h-full"
            >
              {STEPS.map((s) => (
                <TabsContent key={s.key} value={s.key} className="m-0 h-full">
                  {s.key === "formulario-sp" && (
                    <FormularioSpStep
                      value={"formulario-sp" as any}
                      onValidityChange={onValidityChangeFactory(
                        "formulario-sp"
                      )}
                      onStateChange={onStateChangeFormularioSP as any}
                      initialData={wizard["formulario-sp"]}
                      step={idx + 1}
                    />
                  )}

                  {s.key === "trocar-local" && (
                    <TrocarLocalStep
                      value={"trocar-local" as any}
                      flowShort={
                        "desfazimento" /* mantemos aberto por padrão */
                      }
                      initialData={wizard["trocar-local"]}
                      formSnapshot={undefined /* sem snapshot aqui */}
                      isActive={active === "trocar-local"}
                      onValidityChange={onValidityChangeFactory("trocar-local")}
                      onStateChange={onStateChangeTrocarLocal as any}
                      step={idx + 1}
                    />
                  )}

                  {s.key === "etiqueta" && (
                    <EtiquetaStepCB
                      value={"etiqueta" as any}
                      onValidityChange={onValidityChangeFactory("etiqueta")}
                      data={etiquetaData as any}
                      onNew={() => {
                        setWizard({});
                        setValid({});
                        setActive("formulario-sp");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      onHome={() => setActive("formulario-sp")}
                      onDashboard={() => navigate("/dashboard")}
                      step={idx + 1}
                    />
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {/* Barra inferior:
               - some no último passo (etiqueta)
               - no penúltimo ("trocar-local"), botão direito = "Finalizar" (faz POST /assets e vai para etiqueta)
            */}
            {!isLast && (
              <div className="flex justify-between items-center h-fit">
                <div>
                  {STEPS.slice(0, idx + 1).map((s) => (
                    <span
                      key={s.key}
                      className={cn(
                        "mr-2",
                        valid[s.key] ? "text-emerald-600" : "text-amber-600"
                      )}
                    >
                      ●
                    </span>
                  ))}
                </div>

                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-r-none"
                    onClick={goPrev}
                    disabled={idx === 0}
                  >
                    <ArrowLeft size={16} /> Anterior
                  </Button>

                  {/* se está no penúltimo, o clique finaliza (POST /assets) */}
                  <Button
                    size="lg"
                    className="rounded-l-none"
                    onClick={isPenultimate ? handleFinish : goNext}
                    disabled={
                      isPenultimate
                        ? !(valid["formulario-sp"] && valid["trocar-local"])
                        : !canGoNext
                    }
                  >
                    {isPenultimate ? (
                      <>
                        Finalizar <Check size={16} />
                      </>
                    ) : (
                      <>
                        Próximo <ArrowRight size={16} />
                      </>
                    )}
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
