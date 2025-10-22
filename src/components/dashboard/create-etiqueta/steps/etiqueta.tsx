import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { ArrowRight, Barcode, Download, LayoutDashboard, Plus } from "lucide-react";
import { Button } from "../../../ui/button";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { Alert } from "../../../ui/alert";
import { Patrimonio } from "../../novo-item/steps/formulario";
import { ToggleGroup, ToggleGroupItem } from "../../../ui/toggle-group";

/* ========== Tipos ========== */
type Props = {
  value: "etiqueta";
  data?: Patrimonio;
  onValidityChange: (valid: boolean) => void;
  onStateChange?: (state: Record<string, never>) => void;
  onNew: () => void;
  onHome: () => void;
  onDashboard: () => void;
  step: number;
};

/* ========== Utilidades ========= */
const fullCodeFrom = (d: Patrimonio) =>
  [d?.asset_code, d?.asset_check_digit].filter(Boolean).join("-");

const qrUrlFrom = (d: Patrimonio) => {
  const code = fullCodeFrom(d);
  return code
    ? `https://sistemapatrimonio.eng.ufmg.br/buscar-patrimonio?bem_cod=${d.asset_code}&bem_dgv=${d.asset_check_digit}`
    : d.atm_number || (d as any)?.id || "Sistema Patrimônio";
};

/* ========== CODE 128 (Subset B) — SVG inline ========== */
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
      throw new Error(`Caractere inválido para Code128B: ${JSON.stringify(ch)} (charCode ${cc})`);
    }
  }
  const startCode = 104, stopCode = 106;
  const codes: number[] = [];
  for (let i = 0; i < text.length; i++) codes.push(text.charCodeAt(i) - 32);
  let sum = startCode;
  for (let i = 0; i < codes.length; i++) sum += codes[i] * (i + 1);
  const check = sum % 103;
  const sequence = [startCode, ...codes, check, stopCode];
  return sequence.map(v => CODE128_PATTERNS[v]);
}
function modulesCount(patterns: string[]) {
  return patterns.reduce((acc, p) => acc + p.split("").reduce((a, d) => a + parseInt(d, 10), 0), 0);
}
export const Barcode128SVG: React.FC<{
  value: string; heightPx?: number; modulePx?: number; fullWidth?: boolean; className?: string;
}> = ({ value, heightPx = 35, modulePx = 1.5, fullWidth = false, className = "" }) => {
  if (!value) return null;
  let patterns: string[] = [];
  try { patterns = encodeCode128B(value); } catch { return null; }
  const totalModules = modulesCount(patterns);
  let x = 0;
  const bars: React.ReactNode[] = [];
  for (const p of patterns) {
    const widths = p.split("").map(n => parseInt(n, 10));
    let isBar = true;
    for (const w of widths) {
      if (isBar) bars.push(<rect key={`${x}`} x={x} y={0} width={w} height={1} fill="#000" />);
      x += w; isBar = !isBar;
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

/* ========== Variantes de etiqueta (sem depender do front) ========== */
type LabelProps = { data: Patrimonio } & React.HTMLAttributes<HTMLDivElement>;

export const MiniLabel: React.FC<LabelProps> = ({ data, className = "", ...rest }) => {
  const fullCode = fullCodeFrom(data);
  const qrValue = qrUrlFrom(data);
  return (
    <div className={`flex dark:text-black w-[260px] ${className}`} {...rest}>
      <div className="w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-black border-r-0 bg-eng-blue min-h-full" />
      <div className="dark:bg-white border rounded-r-md px-4 border-black rounded-l-none items-center flex gap-4 p-0">
        <div className="flex py-2 flex-col h-full justify-center w-full">
          <p className="dark:text-black uppercase text-center font-semibold text-sm relative -top-2">Engenharia UFMG</p>
          <div className="h-7">
            <Barcode128SVG value={fullCode} heightPx={28} modulePx={1.5} fullWidth />
          </div>
          <div className="font-bold dark:text-black relative -top-2 text-center">{fullCode}</div>
        </div>
      </div>
    </div>
  );
};

export const SmallLabel: React.FC<LabelProps> = ({ data, className = "", ...rest }) => {
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
          <p className="dark:text-black font-semibold text-sm uppercase relative -top-2">Engenharia UFMG</p>
          <div className="font-bold dark:text-black mb-2 text-xl relative -top-2">{fullCode}</div>
          <div className="h-8">
            <Barcode128SVG value={fullCode} heightPx={32} modulePx={1.4} fullWidth />
          </div>
        </div>
      </div>
    </div>
  );
};

export const MediumLabel: React.FC<LabelProps> = ({ data, className = "", ...rest }) => {
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
          <p className="dark:text-black font-semibold text-sm uppercase relative -top-2">Engenharia UFMG</p>
          <div className="font-bold text-2xl dark:text-black relative -top-2">{fullCode}</div>
          <div className="border-b border-black my-2" />
          <div className=" relative -top-2 ">
            <p className="font-bold  dark:text-black uppercase leading-tight">
              {data?.material.material_name}
            </p>
          </div>
          <div className="relative -top-2  mb-2 h-[34px] overflow-hidden">
            <p className="font-semibold text-xs text-gray-600 uppercase leading-tight  ">
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

/* ========== Impressão OFF-SCREEN com medidas exatas ========== */

/** Conversão: 1 mm ≈ 3.779528 px (96 DPI) */
const MM_TO_PX = (mm: number) => Math.round(mm * 3.779528);

/** Defina AQUI as medidas reais das etiquetas (em mm) */
const SIZE_PRESETS_MM: Record<"d" | "a" | "b", { w: number; h: number; label: string }> = {
  // d = Pequena, a = Média, b = Grande (ajuste conforme sua régua real)
  d: { w: 50,  h: 20, label: "Pequena" }, // antes 60x25mm
  a: { w: 70,  h: 30, label: "Média"   }, // antes 80x35mm
  b: { w: 90,  h: 45, label: "Grande"  }, // antes 100x50mm
};

/** Componente que garante LxA exatos em pixels e escala a etiqueta escolhida para caber */
const PrintableLabel: React.FC<{
  data: Patrimonio;
  sizeKey: "d" | "a" | "b";
}> = ({ data, sizeKey }) => {
  const { w, h } = SIZE_PRESETS_MM[sizeKey];
  const W = MM_TO_PX(w);
  const H = MM_TO_PX(h);

  // Larguras "naturais" das variantes (em px) para calcular escala
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

/** Renderiza OFF-SCREEN (fora da tela, mas visível) e captura com html2canvas */
async function renderOffscreenAndCapture(
  element: React.ReactElement,
  opts?: { scale?: number; foreignObjectRendering?: boolean }
): Promise<HTMLCanvasElement> {
  // Cria container fora da tela (NÃO usar display:none/visibility:hidden!)
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

  // Monta React Root
  const root = ReactDOM.createRoot(container);
  root.render(element);

  // Espera renderização completa + fontes carregarem
  await new Promise((r) => requestAnimationFrame(() => 
    requestAnimationFrame(() => r(null))
  )); // Double RAF para garantir layout completo
  
  if ((document as any).fonts?.ready) {
    try { 
      await (document as any).fonts.ready; 
      // Pequena espera extra após fontes carregarem
      await new Promise(r => setTimeout(r, 100));
    } catch {}
  }

  const html2canvas = (await import("html2canvas")).default;

  // Precisa capturar o primeiro filho real (nosso wrapper)
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
  
  // Force estilos para garantir renderização consistente
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
    scale: 2, // Escala fixa para consistência
    useCORS: true,
    allowTaint: true,
    logging: false,
    foreignObjectRendering: opts?.foreignObjectRendering ?? false,
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight,
    onclone: (clonedDoc) => {
      // Force fontes no documento clonado
      const style = clonedDoc.createElement('style');
      style.textContent = `
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
      `;
      clonedDoc.head.appendChild(style);
    }
  });

  // Restaura estilos
  Object.assign(target.style, prev);

  // Desmonta e limpa
  root.unmount();
  container.remove();

  return canvas;
}

/* ========== Componente principal ========== */
export function EtiquetaStepCB({
  data,
  onValidityChange,
  onNew,
  onDashboard,
  step,
}: Props) {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<"d" | "a" | "b">("b"); // d=Pequena, a=Média, b=Grande

  useEffect(() => {
    onValidityChange(true);
  }, [onValidityChange]);

  const fullCode = useMemo(() => (data ? fullCodeFrom(data) : ""), [data]);

  const handleDownload = async () => {
    if (!data) return;
    
    try {
      const { jsPDF } = await import("jspdf");

      // Renderiza a etiqueta com medidas EXATAS (mm) fora da tela:
      const canvas = await renderOffscreenAndCapture(
        <PrintableLabel data={data} sizeKey={selectedSize} />,
        { foreignObjectRendering: false }
      );

      // Gera PNG nítido
      const imgData = canvas.toDataURL("image/png");

      // Dimensões físicas da etiqueta (em mm) — o PDF usará exatamente isso
      const { w, h } = SIZE_PRESETS_MM[selectedSize];

      // Cria um PDF no formato A4 (ou o que preferir) e insere a etiqueta no centro com w x h mm
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const x = Math.round(((pageW - w) / 2) * 100) / 100;
      const y = Math.round(((pageH - h) / 2) * 100) / 100;

      pdf.addImage(imgData, "PNG", x, y, w, h, undefined, "MEDIUM");
      pdf.save(`etiqueta_${fullCode || (data as any)?.id}.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className="mb-10 text-4xl font-semibold max-w-[700px]">
          Tudo certo, você pode baixar a plaqueta em .pdf
        </h1>
      </div>

      <div className="ml-8">
        {/* Seletor de tamanho (apenas controla o PDF; nada aparece no front) */}
        <div className="grid gap-2">
          <div className="flex gap-3">
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
          </div>
        </div>

        {/* Card de ação */}
        <Alert className="flex items-center gap-8 mt-8">
          <div className="flex gap-2 flex-1">
            <Barcode size={24} />
            <div>
              <p className="font-medium">Plaqueta de identificação</p>
              <p className="text-gray-500 text-sm">
                Geramos a plaqueta com tamanho físico exato (mm). Clique para baixar em <strong>PDF</strong>.
              </p>
            </div>
          </div>
          <Button className="h-8 w-8" variant="ghost" size="icon" onClick={handleDownload} disabled={!data}>
            <Download size={16} />
          </Button>
        </Alert>

        {/* Ações */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button onClick={onNew}><Plus className="mr-2 h-4 w-4" /> Criar novo</Button>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <LayoutDashboard size={16} /> Ir para o dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}