import React, { useCallback, useMemo, useRef, useState, useContext } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { UserContext } from "../../context/context";
import { ItemPatrimonioDownload } from "./item-patrimonio-download";

type UUID = string;

export interface AssetDTO {
  asset_code?: string;
  asset_check_digit?: string;
  asset_status?: string;
  asset_description?: string;
  csv_code?: string;
  legal_guardian?: { id: UUID; legal_guardians_name?: string };
  material?: { material_name?: string };
}

export interface CatalogEntry {
  id: UUID;
  description?: string;
  created_at?: string;
  images: { id: UUID; file_path: string }[];
  user: { id: UUID };
  asset: AssetDTO;
}

type CatalogResponse = {
  catalog_entries: CatalogEntry[];
};

const ensureTrailingSlash = (u: string) => (u.endsWith("/") ? u : `${u}/`);

type DownloadPdfButtonProps = {
  workflowStatus: string;
  filename?: string;
  label?: string;
  html2CanvasScale?: number;
  pageWidthPx?: number;
};

/**
 * Agora os cards ocupam mais largura (≈1100 px),
 * mantendo proporção e qualidade em PDF A4 vertical.
 */
export function DownloadPdfButton({
  workflowStatus,
  filename = "lfd.pdf",
  label = "Baixar PDF",
  html2CanvasScale = 3,
  pageWidthPx = 1100, // largura ampliada padrão
}: DownloadPdfButtonProps) {
  const { urlGeral } = useContext(UserContext);
  const baseUrl = useMemo(() => ensureTrailingSlash(urlGeral || ""), [urlGeral]);
  const token = useMemo(
    () => (typeof window !== "undefined" ? localStorage.getItem("jwt_token") || "" : ""),
    []
  );

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CatalogEntry[]>([]);
  const renderRef = useRef<HTMLDivElement | null>(null);

  const A4_WIDTH_PT = 595.28;
  const A4_HEIGHT_PT = 841.89;

  const fetchData = useCallback(async () => {
    if (!baseUrl || !workflowStatus) return;
    try {
      const url = `${baseUrl}catalog/?workflow_status=${encodeURIComponent(workflowStatus)}`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: CatalogResponse = await res.json();
      setItems(json?.catalog_entries ?? []);
      if ((json?.catalog_entries ?? []).length === 0) {
        toast.error("Nada encontrado para gerar o PDF.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Falha ao buscar itens para o PDF.");
      setItems([]);
    }
  }, [baseUrl, token, workflowStatus]);

  const handleDownload = useCallback(async () => {
    try {
      setLoading(true);
      await fetchData();
      if (!items.length) return;

      const container = renderRef.current;
      if (!container) {
        toast.error("Falha ao preparar o render para PDF.");
        return;
      }
      await new Promise((r) => setTimeout(r, 0));

      const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
      let cursorY = 36;
      const marginX = 24;
      const usableWidthPt = A4_WIDTH_PT - marginX * 2;
      const bottomMargin = 36;

      const wrappers = Array.from(container.querySelectorAll<HTMLElement>("[data-pdf-item='true']"));
      if (!wrappers.length) {
        toast.error("Nada para renderizar no PDF.");
        return;
      }

      for (let i = 0; i < wrappers.length; i++) {
        const el = wrappers[i];

        const canvas = await html2canvas(el, {
          scale: html2CanvasScale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          removeContainer: true,
          windowWidth: pageWidthPx, // aumenta a base de renderização
        });

        const imgPxWidth = canvas.width;
        const imgPxHeight = canvas.height;
        const imgAspect = imgPxWidth / imgPxHeight;
        const renderWidthPt = usableWidthPt;
        const renderHeightPt = renderWidthPt / imgAspect;

        if (cursorY + renderHeightPt > A4_HEIGHT_PT - bottomMargin) {
          doc.addPage();
          cursorY = 36;
        }

        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", marginX, cursorY, renderWidthPt, renderHeightPt);
        cursorY += renderHeightPt + 12;
      }

      doc.save(filename);
      toast.success("PDF gerado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao gerar o PDF.");
    } finally {
      setLoading(false);
    }
  }, [fetchData, items.length, filename, html2CanvasScale, pageWidthPx]);

  return (
    <>
      <Button onClick={handleDownload} disabled={loading} variant="outline">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download size={16} className="mr-2" />}
        {label}
      </Button>

      {/* Área off-screen com cards mais largos */}
      <div
        ref={renderRef}
        aria-hidden
        style={{
          position: "fixed",
          left: -10000,
          top: 0,
          width: pageWidthPx, // largura maior (≈1100 px)
          padding: 16,
          background: "#fff",
          zIndex: -1,
        }}
      >
        {items.map((it) => (
          <div
            key={it.id}
            data-pdf-item="true"
            style={{
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <ItemPatrimonioDownload {...it} />
          </div>
        ))}
      </div>
    </>
  );
}
