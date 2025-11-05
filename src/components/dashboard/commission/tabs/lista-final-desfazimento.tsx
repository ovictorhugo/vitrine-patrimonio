import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Download, Trash } from "lucide-react";
import { toast } from "sonner";

import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { BlockItemsVitrine } from "../../../homepage/components/block-items-vitrine";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion";
import { Button } from "../../../ui/button";
import { UserContext } from "../../../../context/context";
import { handleDownloadXlsx } from "../../itens-vitrine/handle-download";
import { CatalogEntry } from "./adm-comission";
import { DownloadPdfButton } from "../../../download/download-pdf-button";



/* Tipos mínimos do fetch */
type UUID = string;

type CatalogResponse = {
  catalog_entries: CatalogEntry[];
};

const ensureTrailingSlash = (u: string) => (u.endsWith("/") ? u : `${u}/`);

export function ListaFinalDesfazimento() {
  const { urlGeral } = useContext(UserContext);
  const baseUrl = useMemo(() => ensureTrailingSlash(urlGeral || ""), [urlGeral]);
  const token = useMemo(
    () => (typeof window !== "undefined" ? localStorage.getItem("jwt_token") || "" : ""),
    []
  );

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CatalogEntry[]>([]);

  const fetchLFD = useCallback(async () => {
    if (!baseUrl) return;
    setLoading(true);
    try {
      const url = `${baseUrl}catalog/?workflow_status=DESFAZIMENTO`;
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
    } catch (e) {
      console.error(e);
      toast.error("Falha ao carregar a Lista Final de Desfazimento.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token]);

  useEffect(() => {
    fetchLFD();
  }, [fetchLFD]);

  const onDownload = async () => {
    if (!items.length) {
      toast.error("Nada para exportar.");
      return;
    }
    await handleDownloadXlsx({
      items,
      urlBase: baseUrl,                // o util já concatena corretamente
      sheetName: "LFD",
      filename: "lista_final_desfazimento.xlsx",
    });
  };

  return (
    <div className="flex flex-col gap-8 p-8 pt-4">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <div className="flex items-center justify-between">
            <HeaderResultTypeHome
              title={`Lista Final de Desfazimento (LFD)`}
              icon={<Trash size={24} className="text-gray-400" />}
            />
            <div className="flex items-center gap-2">
              
              {/* NOVO: botão de PDF */}
              <DownloadPdfButton
                workflowStatus="DESFAZIMENTO"
                filename="lista_final_desfazimento.pdf"
                label="Baixar PDF"
              
              />

              <Button variant={'outline'} onClick={onDownload} disabled={loading || items.length === 0}>
                <Download size={16} />
                Download CSV
              </Button>
              <AccordionTrigger className="px-0" />
            </div>
          </div>

          <AccordionContent className="p-0">
            <div>
              {/* Se o BlockItemsVitrine já busca por si (via prop workflow), mantemos.
                  Se quiser renderizar os itens carregados aqui, adapte o componente para aceitar `items`. */}
              <BlockItemsVitrine workflow="DESFAZIMENTO" />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
