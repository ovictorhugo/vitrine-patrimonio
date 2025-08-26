import React, { useMemo, useRef } from "react";
import { ArrowRight, Barcode, Download, Home, LayoutDashboard, Plus, SquareArrowOutUpRight } from "lucide-react";
import { Label } from "../../../ui/label";
import { Button } from "../../../ui/button";
import QRCode from "react-qr-code";
import html2pdf from "html2pdf.js";

import { useNavigate } from "react-router-dom";
import { Alert } from "../../../ui/alert";
import { Patrimonio } from "../../novo-item/steps/formulario";

type Props = {
  value: "etiqueta";
  data?: Patrimonio;
  onValidityChange: (valid: boolean) => void;
  onStateChange?: (state: Record<string, never>) => void;
  onNew: () => void;
  onHome: () => void;
  onDashboard: () => void;
  step:number
};

export function EtiquetaStepCB({
  data,
  onValidityChange,
  onNew,
  onHome,
  onDashboard,
  step
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    onValidityChange(true); // sempre pode concluir nesta tela
  }, [onValidityChange]);

  const qrValue = useMemo(() => {
    // Link ou payload da sua preferência:
    const code = [data?.asset_code, data?.asset_check_digit].filter(Boolean).join("-");
    return code || data?.atm_number || data?.id || "Vitrine Patrimônio";
  }, [data]);

  const handleDownload = async () => {
    if (!ref.current) return;
    const opt = {
      margin:       [5, 5, 5, 5], // mm
      filename:     `etiqueta_${data?.asset_code || "patrimonio"}.pdf`,
      image:        { type: "jpeg", quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" as const },
      pagebreak:    { mode: ["avoid-all"] as const },
    };
    await html2pdf().set(opt).from(ref.current).save();
  };

    const navigate = useNavigate();

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

      {/* PREVIEW */}
      <div className="ml-8">
      <Alert className="flex items-center gap-8">
  <div className="flex gap-2 flex-1">
    <Barcode size={24} className="" />
    <div>
      <p className="font-medium">Plaqueta de identificação</p>
      <p className="text-gray-500 text-sm">
  A plaqueta de identificação foi gerada com sucesso.  
  Você pode baixá-la em formato <strong>.pdf</strong>.
</p>
    </div>
  </div>
  <Button className="h-8 w-8" variant={"ghost"} size={"icon"} onClick={handleDownload}>
    <Download size={16} />
  </Button>
</Alert>
        {/* Conteúdo que será convertido em PDF */}
        <div ref={ref} className="w-full max-w-[380px] border rounded-lg p-4 bg-white shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold leading-tight">
              {data?.material.material_name || "Material"}
              <div className="text-xs font-normal opacity-70">{data?.asset_description}</div>
            </div>
            <div className="bg-white p-1 rounded">
              <QRCode value={qrValue} size={68} />
            </div>
          </div>

          <div className="text-xs grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div><span className="font-semibold">Cód.:</span> {data?.asset_code}</div>
              <div><span className="font-semibold">DV:</span> {data?.asset_check_digit}</div>
              {data?.atm_number && <div><span className="font-semibold">ATM:</span> {data?.atm_number}</div>}
              <div><span className="font-semibold">SIAF:</span> {data?.unit.unit_siaf}</div>
            </div>
            <div className="space-y-1">
              <div className="line-clamp-2"><span className="font-semibold">Unidade:</span> {data?.unit.unit_name}</div>
              <div className="line-clamp-2"><span className="font-semibold">Org.:</span> {data?.agency.agency_name}</div>
              <div className="line-clamp-2"><span className="font-semibold">Setor:</span> {data?.sector.sector_name}</div>
              <div className="line-clamp-2"><span className="font-semibold">Local:</span> {data?.location.location_name}</div>
            </div>
          </div>

          <div className="text-[10px] opacity-70">
            ID: {data?.id}
          </div>
        </div>

        {/* Ações */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
      
          <Button  onClick={onNew}>
            <Plus className="mr-2 h-4 w-4" /> Criar novo
          </Button>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
           <LayoutDashboard size={16} /> Ir para o dashboard
          </Button>
         
        </div>
      </div>
    </div>
  );
}
