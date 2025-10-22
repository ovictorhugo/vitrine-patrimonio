// src/pages/novo-item/index.tsx
import { Helmet } from "react-helmet";
import { Button } from "../../ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Barcode,
  Check,
  ChevronLeft,
  Download,
  File,
  LayoutDashboard,
  LoaderCircle,
  Plus,
} from "lucide-react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom/client";
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
import { Alert } from "../../ui/alert";

/* =======================================================================================
   ⬇⬇⬇  BLOCO DE UTILIDADES DE PLAQUETA (mesmo esquema do componente Etiqueta)  ⬇⬇⬇
   ======================================================================================= */

import QRCode from "react-qr-code";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";

/* Código de Barras Code128B (SVG inline) */
const CODE128_PATTERNS = [
  "212222","222122","222221","121223","121322","131222","122213","122312","132212","221213",
  "221312","231212","112232","122132","122231","113222","123122","123221","223211","221132",
  "221231","213212","223112","312131","311222","321122","321221","312212","322112","322211",
  "212123","212321","232121","111323","131123","131321","112313","132113","132311","211313",
  "231113","231311","112133","112331","132131","113123","113321","133121","313121","211331",
  "231131","213113","213311","213131","311123","311321","331121","312113","312311","332111",
  "314111","221411","431111","111224","111422","121124","121421","141122","141221","112214",
  "112412","122114","122411","142112","142211","241211","221114","413111","241112","134111",
  "111242","121142","121241","114212","124112","124211","411212","421112","421211","212141",
  "214121","412121","111143","111341","131141","114113","114311","411113","411311","113141",
  "114131","311141","411131","211412","211214","211232","2331112"
];

function encodeCode128B(text: string) {
  for (const ch of text) {
    const cc = ch.charCodeAt(0);
    if (cc < 32 || cc > 126) {
      throw new Error(
        `Caractere inválido para Code128B: ${JSON.stringify(ch)} (charCode ${cc})`
      );
    }
  }
  const startCode = 104,
    stopCode = 106;
  const codes: number[] = [];
  for (let i = 0; i < text.length; i++) codes.push(text.charCodeAt(i) - 32);
  let sum = startCode;
  for (let i = 0; i < codes.length; i++) sum += codes[i] * (i + 1);
  const check = sum % 103;
  const sequence = [startCode, ...codes, check, stopCode];
  return sequence.map((v) => CODE128_PATTERNS[v]);
}
function modulesCount(patterns: string[]) {
  return patterns.reduce(
    (acc, p) =>
      acc +
      p.split("").reduce((a, d) => a + parseInt(d, 10), 0),
    0
  );
}
const Barcode128SVG: React.FC<{
  value: string;
  heightPx?: number;
  modulePx?: number;
  fullWidth?: boolean;
  className?: string;
}> = ({
  value,
  heightPx = 35,
  modulePx = 1.5,
  fullWidth = false,
  className = "",
}) => {
  if (!value) return null;
  let patterns: string[] = [];
  try {
    patterns = encodeCode128B(value);
  } catch {
    return null;
  }
  const totalModules = modulesCount(patterns);
  let x = 0;
  const bars: React.ReactNode[] = [];
  for (const p of patterns) {
    const widths = p.split("").map((n) => parseInt(n, 10));
    let isBar = true;
    for (const w of widths) {
      if (isBar)
        bars.push(<rect key={`${x}`} x={x} y={0} width={w} height={1} fill="#000" />);
      x += w;
      isBar = !isBar;
    }
  }
  const svgWidth = fullWidth ? "100%" : totalModules * modulePx;
  return (
    <svg
      viewBox={`0 0 ${totalModules} 1`}
      width={svgWidth}
      height={heightPx}
      preserveAspectRatio={fullWidth ? "none" : "xMidYMid meet"}
      className={className}
      shapeRendering="crispEdges"
    >
      <rect x={0} y={0} width={totalModules} height={1} fill="#fff" />
      {bars}
    </svg>
  );
};

/* Helpers de dados da plaqueta */
const fullCodeFrom = (d: Patrimonio) =>
  [d?.asset_code, d?.asset_check_digit].filter(Boolean).join("-");

const qrUrlFrom = (d: Patrimonio) => {
  const code = fullCodeFrom(d);
  return code
    ? `https://sistemapatrimonio.eng.ufmg.br/buscar-patrimonio?bem_cod=${d.asset_code}&bem_dgv=${d.asset_check_digit}`
    : d.atm_number || (d as any)?.id || "Sistema Patrimônio";
};

/* Variantes de etiqueta (iguais às do componente Etiqueta) */
type LabelProps = { data: Patrimonio } & React.HTMLAttributes<HTMLDivElement>;

const MiniLabel: React.FC<LabelProps> = ({ data, className = "", ...rest }) => {
  const fullCode = fullCodeFrom(data);
  return (
    <div className={`flex dark:text-black w-[260px] ${className}`} {...rest}>
      <div className="w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-black border-r-0 bg-eng-blue min-h-full" />
      <div className="dark:bg-white border rounded-r-md px-4 border-black rounded-l-none items-center flex gap-4 p-0">
        <div className="flex py-2 flex-col h-full justify-center w-full">
          <p className="dark:text-black uppercase text-center font-semibold text-sm relative -top-2">
            Engenharia UFMG
          </p>
          <div className="h-7">
            <Barcode128SVG value={fullCode} heightPx={28} modulePx={1.5} fullWidth />
          </div>
          <div className="font-bold dark:text-black relative -top-2 text-center">
            {fullCode}
          </div>
        </div>
      </div>
    </div>
  );
};

const SmallLabel: React.FC<LabelProps> = ({ data, className = "", ...rest }) => {
  const fullCode = fullCodeFrom(data);
  const qrValue = qrUrlFrom(data);
  return (
    <div className={`flex dark:text-black w-[320px] ${className}`} {...rest}>
      <div className="w-3 min-w-3 rounded-l-md dark:border-neutral-800 border border-black border-r-0 bg-eng-blue min-h-full" />
      <div className="dark:bg-white border border-black rounded-l-none items-center flex gap-4 p-4 rounded-r-md">
        <div className="w-fit">
          <QRCode size={96} value={qrValue} />
        </div>
        <div className="flex flex-col h-full justify-center">
          <p className="dark:text-black font-semibold text-sm uppercase relative -top-2">
            Engenharia UFMG
          </p>
          <div className="font-bold dark:text-black mb-2 text-xl relative -top-2">
            {fullCode}
          </div>
          <div className="h-8">
            <Barcode128SVG value={fullCode} heightPx={32} modulePx={1.4} fullWidth />
          </div>
        </div>
      </div>
    </div>
  );
};

const MediumLabel: React.FC<LabelProps> = ({ data, className = "", ...rest }) => {
  const fullCode = fullCodeFrom(data);
  const qrValue = qrUrlFrom(data);
  return (
    <div className={`flex dark:text-black w-[480px] ${className}`} {...rest}>
      <div className="w-4 min-w-4 rounded-l-md dark:border-neutral-800 border border-black border-r-0 bg-eng-blue min-h-full" />
      <div className="dark:bg-white border rounded-r-md border-black rounded-l-none items-center flex gap-4 p-4">
        <div className="w-fit">
          <QRCode size={180} value={qrValue} />
        </div>
        <div className="flex flex-col h-full justify-center flex-1">
          <p className="dark:text-black font-semibold text-sm uppercase relative -top-2">
            Engenharia UFMG
          </p>
          <div className="font-bold text-2xl dark:text-black relative -top-2">
            {fullCode}
          </div>
          <div className="border-b border-black my-2" />
          <div className=" relative -top-2 ">
            <p className="font-bold  dark:text-black uppercase leading-tight">
              {data?.material?.material_name}
            </p>
          </div>
          <div className="relative -top-2  mb-2 h-[34px] overflow-hidden">
            <p className="font-semibold text-xs text-gray-600 uppercase leading-tight">
              {data?.asset_description}
            </p>
          </div>
          <div className="h-9">
            <Barcode128SVG value={fullCode} heightPx={36} fullWidth />
          </div>
        </div>
      </div>
    </div>
  );
};

/** Conversão: 1 mm ≈ 3.779528 px (96 DPI) */
const MM_TO_PX = (mm: number) => Math.round(mm * 3.779528);

/** Medidas físicas (mm) – mesmas do exemplo Etiqueta */
const SIZE_PRESETS_MM: Record<"d" | "a" | "b", { w: number; h: number; label: string }> = {
  d: { w: 50, h: 20, label: "Pequena" },
  a: { w: 70, h: 30, label: "Média" },
  b: { w: 90, h: 45, label: "Grande" },
};

/** Wrapper que garante LxA exatos e escala o conteúdo */
const PrintableLabel: React.FC<{ data: Patrimonio; sizeKey: "d" | "a" | "b" }> = ({
  data,
  sizeKey,
}) => {
  const { w, h } = SIZE_PRESETS_MM[sizeKey];
  const W = MM_TO_PX(w);
  const H = MM_TO_PX(h);

  const NATURAL: Record<"d" | "a" | "b", { w: number; h: number }> = {
    d: { w: 260, h: 80 },
    a: { w: 320, h: 140 },
    b: { w: 480, h: 220 },
  };
  const { w: natW, h: natH } = NATURAL[sizeKey];
  const scale = Math.min(W / natW, H / natH);

  return (
    <div
      style={{
        width: `${W}px`,
        height: `${H}px`,
        background: "#ffffff",
        padding: 0,
        margin: 0,
        overflow: "hidden",
        position: "relative",
        boxSizing: "border-box",
        display: "block",
      }}
    >
      <div
        style={{
          width: `${natW}px`,
          height: `${natH}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative",
          display: "block",
        }}
      >
        {sizeKey === "d" ? (
          <MiniLabel data={data} />
        ) : sizeKey === "a" ? (
          <SmallLabel data={data} />
        ) : (
          <MediumLabel data={data} />
        )}
      </div>
    </div>
  );
};

/** Renderiza off-screen e captura com html2canvas */
async function renderOffscreenAndCapture(
  element: React.ReactElement,
  opts?: { foreignObjectRendering?: boolean }
): Promise<HTMLCanvasElement> {
  const container = document.createElement("div");
  container.setAttribute("data-print-container", "true");
  Object.assign(container.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "0px",
    height: "0px",
    overflow: "visible",
    background: "transparent",
    zIndex: "0",
    margin: "0",
    padding: "0",
    border: "none",
    outline: "none",
  });
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(element);

  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r(null)))
  );

  if ((document as any).fonts?.ready) {
    try {
      await (document as any).fonts.ready;
      await new Promise((r) => setTimeout(r, 100));
    } catch {}
  }

  const html2canvas = (await import("html2canvas")).default;
  const target = container.firstElementChild as HTMLElement;

  const prev = {
    bg: target.style.backgroundColor,
    transform: target.style.transform,
    filter: target.style.filter,
    margin: target.style.margin,
    padding: target.style.padding,
    border: target.style.border,
    boxSizing: target.style.boxSizing,
  };
  Object.assign(target.style, {
    backgroundColor: "#ffffff",
    transform: "none",
    filter: "none",
    margin: "0",
    padding: "0",
    border: "none",
    boxSizing: "border-box",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    textRendering: "optimizeLegibility",
  });

  const canvas = await html2canvas(target, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    foreignObjectRendering: opts?.foreignObjectRendering ?? false,
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight,
    onclone: (clonedDoc) => {
      const style = clonedDoc.createElement("style");
      style.textContent = `
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
      `;
      clonedDoc.head.appendChild(style);
    },
  });

  Object.assign(target.style, prev);
  root.unmount();
  container.remove();

  return canvas;
}

/* =======================================================================================
   ⬆⬆⬆  FIM DO BLOCO DE PLAQUETA  ⬆⬆⬆
   ======================================================================================= */

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
  imagens?: { images_wizard: string[] };
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

/** Snapshot para INPUTs readonly do trocar-local */
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

  // ========== ESTADO LOCAL PARA GERAR PLAQUETA NO FINISHED ==========
  const [selectedSize, setSelectedSize] = useState<"d" | "a" | "b">("b"); // d=Pequena, a=Média, b=Grande

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
      final: {},
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

        for (const [k, v] of Object.entries(st as Record<string, unknown>)) {
          if (v === undefined) delete nextForKey[k];
          else nextForKey[k] = v;
        }

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
    [onValidityChangeFactory, onStateChangeFactory, stepProps, idx]
  );

  ///////// FINALIZAR

  type EstadoKind = "quebrado" | "ocioso" | "anti-economico" | "recuperavel";

  const mapSituation = (s?: EstadoKind): string => {
    switch (s) {
      case "quebrado":        return "BROKEN";
      case "ocioso":          return "UNUSED";
      case "anti-economico":  return "UNECONOMICAL";
      case "recuperavel":     return "RECOVERABLE";
      default:                return "UNUSED";
    }
  };

  const pickLocationId = (flow: FlowMode, w: WizardState): string | undefined => {
    const useTroca =
      (w["trocar-local"]?.isOpen ?? (flow !== "vitrine")) === true;

    if (useTroca) {
      return w["trocar-local"]?.location_id || undefined;
    }

    const formLoc =
      (flow === "desfazimento" ? w["formulario-sp"]?.location?.id : w.formulario?.location?.id);

    return formLoc || undefined;
  };

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
      setActive("final");

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

  /* ======== DOWNLOAD DA PLAQUETA NO FINISHED (mesma lógica da EtiquetaStepCB) ======== */
  const handleDownloadPlaqueta = useCallback(async () => {
    // Decide qual "data" usar para montar a plaqueta:
    const dataForLabel: Patrimonio | undefined =
      flow === "desfazimento" ? wizard["formulario-sp"] : wizard.formulario;

    if (!dataForLabel) {
      toast("Dados da plaqueta indisponíveis", {
        description: "Não foi possível obter os dados para gerar a etiqueta.",
      });
      return;
    }

    try {
      const { jsPDF } = await import("jspdf");

      // Render off-screen a etiqueta com medidas físicas exatas
      const canvas = await renderOffscreenAndCapture(
        <PrintableLabel data={dataForLabel} sizeKey={selectedSize} />,
        { foreignObjectRendering: false }
      );

      const imgData = canvas.toDataURL("image/png");
      const { w, h } = SIZE_PRESETS_MM[selectedSize];

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const x = Math.round(((pageW - w) / 2) * 100) / 100;
      const y = Math.round(((pageH - h) / 2) * 100) / 100;

      const fullCode = fullCodeFrom(dataForLabel);
      pdf.addImage(imgData, "PNG", x, y, w, h, undefined, "MEDIUM");
      pdf.save(`etiqueta_${fullCode || (dataForLabel as any)?.id || "bem"}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF da plaqueta:", error);
      toast("Erro ao gerar PDF", { description: "Tente novamente." });
    }
  }, [flow, wizard, selectedSize]);

  /* ===================== RENDER ===================== */
  const [loadingMessage, setLoadingMessage] = useState(
    "Estamos procurando todas as informações no nosso banco de dados, aguarde."
  );

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    setLoadingMessage(
      " Estamos criando o registro, gerando o catálogo e enviando as imagens."
    );

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

    return () => { timeouts.forEach(clearTimeout); };
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

  // Tela de SUCESSO (após finalizar) — agora com o MESMO esquema de plaqueta do "etiqueta"
  if (finished) {
    // Descobre se temos dados válidos para mostrar o card de plaqueta
    const dataForLabel: Patrimonio | undefined =
      flow === "desfazimento" ? wizard["formulario-sp"] : wizard.formulario;
    const canShowPlaqueta = !!(dataForLabel && (dataForLabel.asset_code || dataForLabel.atm_number));

    return (
      <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
        <div className="flex gap-2">
          <div className="flex justify-between items-center h-fit mt-2 w-8">
            <p className="text-lg">{(STEPS.findIndex(s => s.key === "final") + 1) || 0}</p>
            <ArrowRight size={16} />
          </div>
          <h1 className="mb-10 text-4xl font-semibold max-w-[700px]">
            Parabéns, cadastro concluído!
          </h1>
        </div>

        {/* PREVIEW + AÇÕES */}
        <div className="ml-8 grid gap-4">

          {/* Seletor de tamanho da plaqueta (exatamente como em EtiquetaStepCB) */}
          {canShowPlaqueta && (
            <ToggleGroup
              type="single"
              variant="outline"
              className="w-full gap-3"
              onValueChange={(v) => v && setSelectedSize(v as any)}
              value={selectedSize}
            >
              <ToggleGroupItem className="w-full" value="d">Pequena ({SIZE_PRESETS_MM.d.w}×{SIZE_PRESETS_MM.d.h} mm)</ToggleGroupItem>
              <ToggleGroupItem className="w-full" value="a">Média ({SIZE_PRESETS_MM.a.w}×{SIZE_PRESETS_MM.a.h} mm)</ToggleGroupItem>
              <ToggleGroupItem className="w-full" value="b">Grande ({SIZE_PRESETS_MM.b.w}×{SIZE_PRESETS_MM.b.h} mm)</ToggleGroupItem>
            </ToggleGroup>
          )}

          {/* Card de Plaqueta (idêntico em UX ao de EtiquetaStepCB) */}
          {canShowPlaqueta && (
            <Alert className="flex items-center gap-8">
              <div className="flex gap-2 flex-1">
                <Barcode size={24} />
                <div>
                  <p className="font-medium">Plaqueta de identificação</p>
                  <p className="text-gray-500 text-sm">
                    Geramos a plaqueta com tamanho físico exato (mm). Clique para baixar em <strong>PDF</strong>.
                  </p>
                </div>
              </div>
              <Button
                className="h-8 w-8"
                variant={"ghost"}
                size={"icon"}
                onClick={handleDownloadPlaqueta}
              >
                <Download size={16} />
              </Button>
            </Alert>
          )}

          {/* Documento de comprovação (mantido do seu layout) */}
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

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
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
 
  // Wizard normal (fim do componente)
return (
  <div className="p-4 md:p-8 gap-8 flex flex-col h-full ">
    <Helmet>
      <title>Anunciar item | Sistema Patrimônio</title>
      <meta name="description" content={`Anunciar item | Sistema Patrimônio`} />
      <meta name="robots" content="index, follow" />
    </Helmet>

    <Progress className="absolute top-0 left-0  h-1 z-[5]" value={((idx + 1) / total) * 100} />

    <main className="flex flex-1 h-full lg:flex-row flex-col-reverse gap-8">
      <div className="w-full flex flex-col gap-8">
        <div className="flex justify-between items-center">
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

        <div>
          <Button size={'sm'}><File size={16}/> Baixar manual</Button>
        </div>
        </div>

        <div className="flex flex-col h-full w-full gap-8">
          <Tabs
            value={active}
            onValueChange={(v) => {
              const targetIndex = STEPS.findIndex((s) => s.key === (v as StepKey));
              if (targetIndex !== -1 && (targetIndex <= idx || STEPS.slice(0, targetIndex).every((s) => valid[s.key] === true))) {
                setActive(v as StepKey);
              }
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
