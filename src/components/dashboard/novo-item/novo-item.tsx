// src/pages/novo-item/index.tsx
import { Helmet } from "react-helmet";
import { Button } from "../../ui/button";
import { ArrowLeft, ArrowRight, Barcode, Check, ChevronLeft, Download, File, LayoutDashboard, Loader2, LoaderCircle, Plus } from "lucide-react";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent } from "../../ui/tabs";
import { Progress } from "../../ui/progress";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../../lib";

import { InicioStep } from "./steps/inicio";
import { InformacoesStep } from "./steps/informacoes";
import { PesquisaStep } from "./steps/pesquisa";
import { FormularioStep, Patrimonio } from "./steps/formulario";
import { FormularioSpStep } from "./steps/formulario-sp";
import { TrocarLocalStep } from "./steps/trocar-local";
import { InformacoesAdicionaisStep } from "./steps/informacoes-adicionais";
import { EstadoStep } from "./steps/estado";
import { ImagemStep } from "./steps/imagem";
import { FinalStep } from "./steps/final";
import { UserContext } from "../../../context/context";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";

/* ---- Tipos locais para trocar-local ---- */
interface Agency { id: string; agency_name: string; agency_code: string; }
interface Unit {
  id: string; unit_name: string; unit_code: string; unit_siaf: string;
  agency_id: string; agency?: Agency;
}
interface Sector { id: string; sector_name: string; sector_code: string; unit_id: string; unit: Unit; }
interface Location { id: string; location_name: string; location_code: string; sector_id: string; sector: Sector; }

/* ---- Wizard ---- */
export type StepKey =
  | "inicio" | "informacoes" | "pesquisa" | "formulario" | "formulario-sp"
  | "informacoes-adicionais" | "trocar-local" | "estado" | "imagens" | "final";
export type StepDef = { key: StepKey; label: string };
export type FlowMode = "vitrine" | "desfazimento";

const getSteps = (mode: FlowMode): StepDef[] =>
  mode === "desfazimento"
    ? [
        { key: "inicio", label: "Início" },
        { key: "informacoes", label: "Informações" },
        { key: "formulario-sp", label: "Formulário" },
        { key: "trocar-local", label: "Trocar local" },
        { key: "estado", label: "Estado" },
        { key: "informacoes-adicionais", label: "Informações adicionais" },
        { key: "imagens", label: "Imagens" },
        { key: "final", label: "Final" },
      ]
    : [
        { key: "inicio", label: "Início" },
        { key: "informacoes", label: "Informações" },
        { key: "pesquisa", label: "Pesquisa" },
        { key: "formulario", label: "Formulário" },
        { key: "trocar-local", label: "Trocar local" },
        { key: "estado", label: "Estado" },
        { key: "informacoes-adicionais", label: "Informações adicionais" },
        { key: "imagens", label: "Imagens" },
        { key: "final", label: "Final" },
      ];

export type ValidMap = Partial<Record<StepKey, boolean>>;
export type StepBaseProps<K extends keyof StepPropsMap> = {
  value: K;
  step:number
  onValidityChange: (valid: boolean) => void;
  onStateChange?: (state: unknown) => void;
} & StepPropsMap[K];

export type StepPropsMap = {
  inicio: { onFlowChange: (flow: FlowMode) => void; initialData?: { flowShort?: FlowMode } };
  informacoes: {};
  "informacoes-adicionais": { 
    flowShort: FlowMode; 
    initialData?: { observacao?: string; situacao?: string };
    estadoAtual?: "quebrado" | "ocioso" | "anti-economico" | "recuperavel";
  };
  "trocar-local": {
    flowShort: FlowMode;
    initialData?: {
      agency_id?: string; unit_id?: string; sector_id?: string; location_id?: string;
      agency?: Agency | null; unit?: Unit | null; sector?: Sector | null; location?: Location | null;
      isOpen?: boolean;
    };
    formSnapshot?: {
      agency_id?: string; unit_id?: string; sector_id?: string; location_id?: string;
      agency?: Agency | null; unit?: Unit | null; sector?: Sector | null; location?: Location | null;
    };
    isActive: boolean;
  };
  pesquisa: { value_item?: string; type?: string };
  formulario: { value_item?: string; type?: string; initialData?: Patrimonio };
  "formulario-sp": { value_item?: string; type?: string; initialData?: Patrimonio };
  estado: { estado_previo?: "quebrado" | "ocioso" | "anti-economico" | "recuperavel" };
  imagens: { imagens?: string[] };
  final: {}
};

type WizardState = {
  inicio?: { flowShort?: FlowMode };
  pesquisa?: { value_item?: string; type?: "cod" | "atm" | "nom" | "dsc" | "pes" | "loc" };
  informacoes?: Record<string, unknown>;
  "informacoes-adicionais"?: { observacao?: string; situacao?: string };
  formulario?: Patrimonio;
  "formulario-sp"?: Patrimonio;
  estado?: { estado_previo: "quebrado" | "ocioso" | "anti-economico" | "recuperavel" };
  imagens?: { images_wizard: string[] }; // ⬅️ use sempre plural
  "trocar-local"?: {
    agency_id?: string; unit_id?: string; sector_id?: string; location_id?: string;
    agency?: Agency | null; unit?: Unit | null; sector?: Sector | null; location?: Location | null;
    isOpen?: boolean;
  };
};

/* ===== Utils ===== */
const DEV_LOGS = false;

const shallowEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a); const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
};

/** Snapshot para INPUTs readonly do trocar-local (não alimenta selects) */
function deriveTrocarLocalFromFormulario(form?: Patrimonio) {
  if (!form) return undefined;
  const agency   = (form as any)?.agency ?? null;
  const unit     = (form as any)?.unit ?? null;
  const sector   = (form as any)?.sector ?? null;
  const location = (form as any)?.location ?? null;

  const agency_id   = (form as any)?.agency?.id   ?? "";
  const unit_id     = (form as any)?.unit?.id     ?? "";
  const sector_id   = (form as any)?.sector?.id   ?? "";
  const location_id = (form as any)?.location?.id ?? "";

  if (!(agency_id || unit_id || sector_id || location_id || agency || unit || sector || location)) {
    return undefined;
  }
  return { agency_id, unit_id, sector_id, location_id, agency, unit, sector, location };
}

export function NovoItem() {
  const location = useLocation();
  const navigate = useNavigate();
  const { urlGeral } = useContext(UserContext); 
  /* ---- Wizard state ---- */
  const [flow, setFlow] = useState<FlowMode>("vitrine");
  const STEPS = useMemo(() => getSteps(flow), [flow]);

  const [active, setActive] = useState<StepKey>(STEPS[0].key);
  const [valid, setValid] = useState<ValidMap>({});
  const [wizard, setWizard] = useState<WizardState>({});
  const token = localStorage.getItem("jwt_token");

  // NEW: estados de finalização e ids gerados
  const [isFinishing, setIsFinishing] = useState(false);
  const [finished, setFinished] = useState(false);
  const [createdAssetId, setCreatedAssetId] = useState<string | null>(null);
  const [createdCatalogId, setCreatedCatalogId] = useState<string | null>(null);

  // Confetes (lazy import)
  const launchConfetti = useCallback(async () => {
    try {
      const mod = await import("canvas-confetti");
      const confetti = mod.default;
      confetti({ spread: 70, origin: { y: 0.7 } });
      const end = Date.now() + 900;
      (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    } catch {
      // silencioso se a lib não estiver disponível
    }
  }, []);
  useEffect(() => { if (finished) launchConfetti(); }, [finished, launchConfetti]);

  /* ===== Helpers para evitar setState desnecessário ===== */
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

  /* ---- Props por etapa ---- */
  const pesquisaType = wizard.pesquisa?.type === "atm" ? "atm" : "cod";

  const stepProps: StepPropsMap = useMemo(
    () => ({
      inicio: { onFlowChange: (f) => setFlow(f), initialData: wizard.inicio },
      informacoes: {},
      pesquisa: {
        value_item: wizard.pesquisa?.value_item,
        type: pesquisaType,
      },
      formulario: {
        value_item: wizard.pesquisa?.value_item,
        type: pesquisaType,
        initialData: wizard.formulario,
      },
      "formulario-sp": {
        value_item: wizard.pesquisa?.value_item,
        type: pesquisaType,
        initialData: wizard["formulario-sp"],
      },
      estado: { estado_previo: wizard.estado?.estado_previo },
      imagens: { imagens: wizard.imagens?.images_wizard },
      "informacoes-adicionais": {
        flowShort: flow,
        initialData: wizard["informacoes-adicionais"],
        estadoAtual: wizard.estado?.estado_previo,
      },
      "trocar-local": {
        flowShort: flow,
        initialData: wizard["trocar-local"],
        formSnapshot: deriveTrocarLocalFromFormulario(wizard.formulario),
        isActive: active === "trocar-local",
      },
      final: {

      }
    }),
    [wizard, flow, active, pesquisaType]
  );

  /* ---- sincroniza validações e aba ativa quando o flow muda ---- */
  useEffect(() => {
    if (!STEPS.some((s) => s.key === active)) setActive(STEPS[0].key);
    setValidIfChanged((prev) => {
      const next: ValidMap = {};
      for (const s of STEPS) next[s.key] = prev[s.key] ?? (s.key === STEPS[0].key ? false : undefined);
      return next;
    });
  }, [STEPS, active, setValidIfChanged]);

  /* ---- reidrata o flow salvo (init once) ---- */
  const initFlowOnce = useRef(false);
  useEffect(() => {
    if (initFlowOnce.current) return;
    const saved = wizard.inicio?.flowShort;
    if (saved && saved !== flow) setFlow(saved);
    initFlowOnce.current = true;
  }, [wizard.inicio?.flowShort, flow]);

  /* ---- índice e total ---- */
  const idx = useMemo(() => STEPS.findIndex((s) => s.key === active), [active, STEPS]);
  const total = STEPS.length;
  const isLast = idx === total - 1;

  /* ---- progresso e navegação ---- */
  const pct = ((idx + 1) / total) * 100;

  const canGoNext = useMemo(() => {
    const upto = STEPS.slice(0, idx + 1).every((s) => valid[s.key] === true);
    return upto && idx < total - 1;
  }, [idx, total, valid, STEPS]);

  const canFinish = useMemo(() => STEPS.every((s) => valid[s.key] === true), [STEPS, valid]);

  const canActivateIndex = useCallback((targetIndex: number) => {
    if (targetIndex <= idx) return true;
    return STEPS.slice(0, targetIndex).every((s) => valid[s.key] === true);
  }, [idx, STEPS, valid]);

  const goPrev = useCallback(() => { if (idx > 0) setActive(STEPS[idx - 1].key); }, [idx, STEPS]);
  const goNext = useCallback(() => { if (!isLast && canGoNext) setActive(STEPS[idx + 1].key); }, [idx, STEPS, isLast, canGoNext]);

  /* ---- attachCommon com callbacks estáveis ---- */
  const onValidityChangeFactory = useCallback(
    (key: StepKey) => (v: boolean) => {
      setValidIfChanged(prev => (prev[key] === v ? prev : { ...prev, [key]: v }));
    },
    [setValidIfChanged]
  );

  const onStateChangeFactory = useCallback(
    (key: StepKey) => (st: unknown) => {
      setWizardIfChanged(prev => {
        const current = ((prev as any)[key] as Record<string, unknown>) || {};
        const nextForKey: Record<string, unknown> = { ...current };

        // undefined = remover; demais = sobrescrever
        for (const [k, v] of Object.entries(st as Record<string, unknown>)) {
          if (v === undefined) delete nextForKey[k];
          else nextForKey[k] = v;
        }

        // remove seção vazia
        if (Object.keys(nextForKey).length === 0) {
          if (!(key in (prev as any))) return prev;
          const { [key]: _removed, ...rest } = prev as any;
          return rest as WizardState;
        }

        if (shallowEqual(current, nextForKey)) return prev;
        return { ...prev, [key]: nextForKey } as WizardState;
      });
    },
    [setWizardIfChanged]
  );

  const attachCommon = useCallback(
    <K extends StepKey>(key: K) => ({
      value: key,
      step: idx,
      onValidityChange: onValidityChangeFactory(key),
      onStateChange: onStateChangeFactory(key),
      ...(stepProps as any)[key],
    }),
    [onValidityChangeFactory, onStateChangeFactory, stepProps]
  );

  ///////// FINALIZAR

  type EstadoKind = "quebrado" | "ocioso" | "anti-economico" | "recuperavel";

  // mapeia o estado salvo no passo "estado" para o expected do backend (ex.: "UNUSED")
  const mapSituation = (s?: EstadoKind): string => {
    switch (s) {
      case "quebrado":        return "BROKEN";
      case "ocioso":          return "UNUSED";
      case "anti-economico":  return "UNECONOMICAL";
      case "recuperavel":     return "RECOVERABLE";
      default:                return "UNUSED";
    }
  };

  // escolhe de onde vem o location_id para o POST /catalog
  const pickLocationId = (flow: FlowMode, w: WizardState): string | undefined => {
    const useTroca =
      (w["trocar-local"]?.isOpen ?? (flow !== "vitrine")) === true;

    if (useTroca) {
      return w["trocar-local"]?.location_id || undefined;
    }

    // quando NÃO usa a troca, pega do formulário do fluxo ativo
    const formLoc =
      (flow === "desfazimento" ? w["formulario-sp"]?.location?.id : w.formulario?.location?.id);

    return formLoc || undefined;
  };

  // monta payload do /assets a partir do formulário-sp + trocar-local
  const buildAssetsPayload = (form: Patrimonio, tl?: WizardState["trocar-local"]) => ({
    bem_cod:        form.asset_code || "",
    bem_dgv:        form.asset_check_digit || "",
    bem_num_atm:    form.atm_number || "",
    bem_serie:      form.serial_number || "",
    bem_sta:        form.asset_status || "",
    bem_val:        form.asset_value || "",
    bem_dsc_com:    form.asset_description || "",
    csv_cod:        form.csv_code || "",
    tre_cod:        form.accounting_entry_code || "",
    agency_id:      tl?.agency_id || "",
    unit_id:        tl?.unit_id || "",
    sector_id:      tl?.sector_id || "",
    location_id:    tl?.location_id || "",
    material_id:    form.material?.id || "",
    legal_guardian_id: form.legal_guardian?.id || "",
    ite_mar:        form.item_brand || "",
    ite_mod:        form.item_model || "",
    tgr_cod:        form.group_type_code || "",
    grp_cod:        form.group_code || "",
    ele_cod:        form.expense_element_code || "",
    sbe_cod:        form.subelement_code || "",
  });

  // envia as 4 imagens para POST /catalog/{catalog_id}/images
  const uploadImages = async (catalogId: string, imgs: string[], urlBase: string) => {
    if (!Array.isArray(imgs) || imgs.length < 4) {
      toast("Você precisa submeter 4 imagens", {
        description: "Em caso de dúvida, acesse as instruções de como tirar as fotos",
        action: { label: "Fechar", onClick: () => {} },
      });
      return false;
    }

    const first4 = imgs.slice(0, 4);
    const endpoint = `${urlGeral}catalog/${catalogId}/images`;

    const uploads = first4.map(async (image, idx) => {
      const blob = await fetch(image).then((r) => r.blob());
      const formData = new FormData();
      formData.append("file", blob, `catalog_${catalogId}_${idx + 1}.jpg`);

      const resp = await fetch(endpoint, { method: "POST", body: formData });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(`Falha ao enviar imagem ${idx + 1}: ${resp.status} ${txt}`);
      }
    });

    await Promise.all(uploads);
    return true;
  };

  // RESET rápido para "novo formulário"
  const resetToNewForm = useCallback(() => {
    // mantém o flow atual
    setWizard({});
    setValid({});
    setActive("inicio");
    setFinished(false);
    setCreatedAssetId(null);
    setCreatedCatalogId(null);
  }, []);

  // +++ SUBSTITUI o handleFinish por este +++
  const handleFinish = useCallback(async () => {
    setIsFinishing(true);
    setFinished(false);
    setCreatedAssetId(null);
    setCreatedCatalogId(null);

    try {
      // 1) coleta peças do wizard
      const formSP   = wizard["formulario-sp"];
      const formVit  = wizard.formulario;
      const troca    = wizard["trocar-local"];
      const infoAdic = wizard["informacoes-adicionais"];
      const estado   = wizard.estado?.estado_previo as EstadoKind | undefined;
      const imgs     = wizard.imagens?.images_wizard || [];

      // 2) se for DESFAZIMENTO: cria asset em /assets/
      let assetId: string | undefined;
      if (flow === "desfazimento") {
        if (!formSP) {
          toast("Dados incompletos", { description: "Preencha o formulário (SP) antes de finalizar." });
          return;
        }
        if (!troca?.agency_id || !troca?.unit_id || !troca?.sector_id || !troca?.location_id) {
          toast("Localização incompleta", { description: "Selecione Unidade/Organização/Setor/Local em Trocar Local." });
          return;
        }

        const assetsPayload = buildAssetsPayload(formSP, troca);
        const createAsset = await fetch(`${urlGeral}assets/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            Accept: "application/json",
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(assetsPayload),
        });

        if (createAsset.status !== 201) {
          const txt = await createAsset.text();
          throw new Error(`Falha ao criar asset (${createAsset.status}): ${txt}`);
        }

        const assetJson = await createAsset.json();
        assetId = assetJson?.id as string | undefined;
        if (!assetId) throw new Error("Resposta /assets/ sem ID.");
      } else {
        // vitrine: asset vem da aba "formulário" (já existente)
        assetId = formVit?.id;
        if (!assetId) {
          toast("Item não encontrado", { description: "Abra o passo Formulário e selecione um item existente." });
          return;
        }
      }

      // 3) decide qual location_id vai para /catalog/
      const locationId = pickLocationId(flow, wizard);
      if (!locationId) {
        toast("Local não definido", { description: "Defina o local no formulário ou em Trocar Local." });
        return;
      }

      // 4) cria entrada no catálogo
      const catalogPayload = {
        asset_id: assetId!,
        location_id: locationId,
        situation: mapSituation(estado),
        conservation_status: infoAdic?.situacao || "",
        description: infoAdic?.observacao || "",
      };

      const createCatalog = await fetch(`${urlGeral}catalog/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Accept: "application/json",
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(catalogPayload),
      });

      if (createCatalog.status !== 201) {
        const txt = await createCatalog.text();
        throw new Error(`Falha ao criar catálogo (${createCatalog.status}): ${txt}`);
      }

      const catalogJson = await createCatalog.json();
      const catalogId = catalogJson?.id as string | undefined;
      if (!catalogId) throw new Error("Resposta /catalog/ sem ID.");

      // 5) upload das imagens
      const ok = await uploadImages(catalogId, imgs, urlGeral);
      if (!ok) return;

      // sucesso 🎉
      setCreatedAssetId(assetId || null);
      setCreatedCatalogId(catalogId || null);
      setFinished(true);
      setActive("final"); // opcional: manter navegação coerente

      toast("Tudo certo!", {
        description: "Bem cadastrado e imagens enviadas com sucesso.",
        action: { label: "Fechar", onClick: () => {} },
      });

    } catch (err: any) {
      console.error(err);
      toast("Erro ao finalizar", {
        description: err?.message || "Tente novamente.",
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setIsFinishing(false);
    }
  }, [flow, wizard, urlGeral, token]);

  /* ===================== RENDER ===================== */
  const [loadingMessage, setLoadingMessage] = useState("Estamos procurando todas as informações no nosso banco de dados, aguarde.");

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
  
   
      setLoadingMessage(" Estamos criando o registro, gerando o catálogo e enviando as imagens.");
  
      timeouts.push(setTimeout(() => {
        setLoadingMessage("Estamos quase lá, continue aguardando...");
      }, 5000));
  
      timeouts.push(setTimeout(() => {
        setLoadingMessage("Só mais um pouco...");
      }, 10000));
  
      timeouts.push(setTimeout(() => {
        setLoadingMessage("Está demorando mais que o normal... estamos tentando enviar tudo.");
      }, 15000));
  
      timeouts.push(setTimeout(() => {
        setLoadingMessage("Estamos empenhados em concluir, aguarde só mais um pouco");
      }, 15000));
    
  
    return () => {
      // Limpa os timeouts ao desmontar ou quando isOpen mudar
      timeouts.forEach(clearTimeout);
    };
  }, []);


  // Tela de LOADING (finalização)
  if (isFinishing) {
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

  // Tela de SUCESSO (após finalizar)
  if (finished) {
    return (
      <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
           <div className="flex gap-2">
             <div className="flex justify-between items-center h-fit mt-2 w-8">
               <p className="text-lg">{idx + 1}</p>
               <ArrowRight size={16} />
             </div>
             <h1 className="mb-10 text-4xl font-semibold max-w-[700px]">
               Parabéns, cadastro concluído!
             </h1>
           </div>
     
           {/* PREVIEW */}
           <div className="ml-8">
          <div className="grid gap-4">
         {flow === 'desfazimento' && (
            <Alert className="flex items-center gap-8">
            <div className="flex gap-2 flex-1">
              <Barcode size={24} className="" />
              <div>
                <p className="font-medium">Plaqueta de identificação</p>
                <p className="text-gray-500 text-sm">
                  Como o bem foi registrado sem número de plaqueta, esta será utilizada como
                  identificação provisória. Você pode baixar o arquivo em formato <strong>.pdf</strong>.
                </p>
              </div>
            </div>
            <Button className="h-8 w-8" variant={"ghost"} size={"icon"}>
              <Download size={16} />
            </Button>
          </Alert>
         )}

<Alert className="flex items-center gap-8 ">
  <div className="flex gap-2 flex-1">
    <File size={24} className="" />
    <div>
      <p className="font-medium">Documento de comprovação</p>
      <p className="text-gray-500 text-sm">
  Comprovante de submissão do item para avaliação na plataforma.  
  Este documento confirma o envio, mas não substitui a documentação oficial do bem.
</p>

    </div>
  </div>
  <Button className="h-8 w-8" variant={"ghost"} size={"icon"}>
    <Download size={16} />
  </Button>
</Alert>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button onClick={resetToNewForm}><Plus size={16} />Cadastrar outro item</Button>

          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
           <LayoutDashboard size={16} /> Ir para o dashboard
          </Button>
        </div>


            </div>
            </div>
    );
  }

  // Wizard normal
  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full ">
      <Helmet>
        <title>Anunciar item | Vitrine Patrimônio</title>
        <meta name="description" content={`Anunciar item | Vitrine Patrimônio`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <Progress className="absolute top-0 left-0  h-1 z-[5]" value={pct} />

      <main className="flex flex-1 h-full lg:flex-row flex-col-reverse gap-8">
        <div className="w-full flex flex-col gap-8">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const path = location.pathname;
                const hasQuery = location.search.length > 0;
                if (hasQuery) navigate(path);
                else {
                  const seg = path.split("/").filter(Boolean);
                  if (seg.length > 1) { seg.pop(); navigate("/" + seg.join("/")); }
                  else navigate("/");
                }
              }}
              variant="outline"
              size="icon"
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>

            <h1 className="text-xl font-semibold tracking-tight">Anunciar item</h1>
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
                  {s.key === "inicio" && <InicioStep    {...attachCommon("inicio")} step={idx + 1} />}
                  {s.key === "informacoes" && <InformacoesStep  {...attachCommon("informacoes")}  step={idx + 1} />}

                  {s.key === "pesquisa" && (
                    <PesquisaStep
                      {...attachCommon("pesquisa")}
                      value_item={wizard.pesquisa?.value_item}
                      type={wizard.pesquisa?.type}
                      step={idx + 1}
                    />
                  )}

                  {s.key === "formulario" && (
                    <FormularioStep
                      {...attachCommon("formulario")}
                      value_item={wizard.pesquisa?.value_item}
                      type={wizard.pesquisa?.type}
                      initialData={wizard.formulario}
                      step={idx + 1}
                    />
                  )}

                  {s.key === "formulario-sp" && (
                    <FormularioSpStep
                      {...attachCommon("formulario-sp")}
                      value_item={wizard.pesquisa?.value_item}
                      type={wizard.pesquisa?.type}
                      initialData={wizard["formulario-sp"]}
                      step={idx + 1}
                    />
                  )}

                  {s.key === "trocar-local" && (
                    <TrocarLocalStep {...attachCommon("trocar-local")} step={idx + 1} />
                  )}

                  {s.key === "informacoes-adicionais" && (
                    <InformacoesAdicionaisStep {...attachCommon("informacoes-adicionais")} step={idx + 1}/>
                  )}

                  {s.key === "estado" && <EstadoStep {...attachCommon("estado")} step={idx + 1}/>}

                  {s.key === "imagens" && (
                    <ImagemStep
                      {...attachCommon("imagens")}
                      imagens={wizard.imagens?.images_wizard}
                      step={idx + 1}
                    />
                  )}

                  {s.key === "final" && <FinalStep {...attachCommon("final")} allData={wizard} step={idx + 1} />}
                </TabsContent>
              ))}
            </Tabs>

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
                  onClick={isLast ? handleFinish : goNext}
                  disabled={isLast ? !canFinish : !canGoNext}
                >
                  {isLast ? <>Finalizar <Check size={16} /></> : <>Próximo <ArrowRight size={16} /></>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
