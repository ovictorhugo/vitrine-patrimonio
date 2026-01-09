import React, { useCallback, useMemo, useState, useContext } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { UserContext } from "../../context/context";

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
  size = "sm",
}: DownloadPdfButtonProps) {
  const { urlGeral } = useContext(UserContext);

  const baseUrl = useMemo(
    () => ensureTrailingSlash(urlGeral || ""),
    [urlGeral]
  );
  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("jwt_token") || ""
        : "",
    []
  );

  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!baseUrl || !filters) return;
    try {
      setLoading(true); //${urlGeral}
      let baseUrl = `http://localhost:5055/v2/api/${method}/pdf/`;
      let downloadUrl = buildUrl(baseUrl, filters);
      if (method === "collections") {
        baseUrl = `${urlGeral}/${method}/${filters.collection_id}/items/pdf`;
        downloadUrl = buildUrl(baseUrl, {});
      } else if (method === "item") {
        baseUrl = `${urlGeral}/catalog/pdf/${id}`;
        downloadUrl = buildUrl(baseUrl, {});
      }
      const res = await fetch(downloadUrl, {
        headers: {
          Accept: "application/pdf",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  }, [baseUrl, token, filters]);

  return (
    <>
      <Button
        onClick={fetchData}
        disabled={loading}
        variant="outline"
        size={size}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download size={16} className="mr-2" />
        )}
        {label}
      </Button>
    </>
  );
}
