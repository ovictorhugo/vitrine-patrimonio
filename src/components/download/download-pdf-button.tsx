import React, { useCallback, useMemo, useState, useContext } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { UserContext } from "../../context/context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

function buildUrl(base: string, params: Record<string, string | undefined>) {
  const url = new URL(base, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  });
  return url.toString();
}

const ensureTrailingSlash = (u: string) => (u.endsWith("/") ? u : `${u}/`);

type DownloadPdfButtonProps = {
  filters: Record<string, string | undefined>;
  label?: string;
  method?: string;
  id?: string;
  size?: "default" | "sm" | "xs" | "lg" | "icon" | null | undefined;
};

/**
 * Agora os cards ocupam mais largura (≈1100 px),
 * mantendo proporção e qualidade em PDF A4 vertical.
 */
export function DownloadPdfButton({
  filters,
  label = "Baixar PDF",
  method = "catalog",
  id = "",
  size = "default",
}: DownloadPdfButtonProps) {
  const { urlGeral } = useContext(UserContext);

  const baseUrl = useMemo(
    () => ensureTrailingSlash(urlGeral || ""),
    [urlGeral],
  );
  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("jwt_token") || ""
        : "",
    [],
  );

  const [loading, setLoading] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);

  const fetchData = useCallback(async () => {
    if (!baseUrl || !filters) return;
    try {
      setLoading(true);
      let reqBaseUrl =
        method === "catalog"
          ? `${urlGeral}catalog/playwright`
          : `${urlGeral}${method}/pdf`;
      let downloadUrl = buildUrl(reqBaseUrl, filters);
      if (method === "collections") {
        reqBaseUrl = `${urlGeral}${method}/${filters.collection_id}/items/pdf`;
        downloadUrl = buildUrl(reqBaseUrl, {});
      } else if (method === "item") {
        reqBaseUrl = `${urlGeral}catalog/pdf/${id}`;
        downloadUrl = buildUrl(reqBaseUrl, {});
      } else if (method === "loan_item") {
        reqBaseUrl = `${urlGeral}loans/pdf/${id}`;
        downloadUrl = buildUrl(reqBaseUrl, {});
      } else if (method === "loan_all") {
        reqBaseUrl = `${urlGeral}loans/all_pdf`;
        downloadUrl = buildUrl(reqBaseUrl, {});
      } else if (method === "loan_terms") {
        reqBaseUrl = `${urlGeral}loans/terms_pdf/${id}`;
        downloadUrl = buildUrl(reqBaseUrl, {});
      }

      const res = await fetch(downloadUrl, {
        headers: {
          Accept: method === "catalog" ? "application/json" : "application/pdf",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      if (method === "catalog") {
        setLoading(false);
        setOpenEmailDialog(true);
        return;
      }

      const blob = await res.blob();
      const pdf = URL.createObjectURL(blob);
      setLoading(false);
      window.open(pdf, "_blank");
      if ((pdf ?? []).length === 0) {
        toast.error("Nada encontrado para gerar o PDF.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Falha ao buscar itens para o PDF.");
      setLoading(false);
    }
  }, [baseUrl, token, filters, method, urlGeral, id]);

  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          fetchData();
        }}
        disabled={loading}
        variant="outline"
        size={size}
      >
        {loading ? (
          <Loader2 className="mr-2 animate-spin" />
        ) : (
          <Download size={16} className="mr-2" />
        )}
        {label}
      </Button>
      {method === "catalog" && (
        <Dialog open={openEmailDialog} onOpenChange={setOpenEmailDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Envio por email</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-300">
                O relatório será gerado pelo sistema e um link enviado por
                email. Por favor aguarde alguns minutos até a geração completa
                do seu documento.
                <br />
                <br /> Não clique várias vezes para baixar o PDF!
              </p>
            </div>

            <DialogFooter>
              <Button onClick={() => setOpenEmailDialog(false)}>Ok</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
