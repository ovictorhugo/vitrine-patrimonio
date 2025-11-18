// src/components/catalog/Documento.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Alert } from "../../../ui/alert";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Separator } from "../../../ui/separator";

import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Download as DownloadIcon,
  File as FileIcon,
  FileText as PdfIcon,
  Image as ImageIcon,
  Expand,
  Trash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";

import { useLocation, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";

// ===== PDF.js =====
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc =
  pdfjsLib.GlobalWorkerOptions.workerSrc ||
  new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

/* ========= Tipos ========= */

type UUID = string;

export type Files = {
  id: string;
  catalog_id: string;
  file_path: string;
  file_name: string;
  content_type: string;
};

type FilesResponse = {
  files: Files[];
};

interface DocumentoProps {
  urlGeral: string;
  token?: string;
}

/* ========= Helpers ========= */

function isImage(mime?: string) {
  return !!mime && mime.startsWith("image/");
}
function isPdf(mime?: string) {
  return mime === "application/pdf" || (mime ?? "").includes("/pdf");
}

function buildFileUrl(base: string, path: string) {
  if (!base) return path;
  const a = base.endsWith("/") ? base.slice(0, -1) : base;
  const b = path.startsWith("/") ? path : `/${path}`;
  return `${a}${b}`;
}

/* ========= Thumbnail de PDF ========= */

interface PdfThumbnailProps {
  url: string;
}

export function PdfThumbnail({ url }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const scale = 0.3; // ajuste fino do tamanho da thumb
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
      } catch (e) {
        console.error("Erro ao renderizar PDF:", e);
        setError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-neutral-500">
        <PdfIcon className="w-10 h-10" />
        <span className="text-xs mt-1">PDF</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
    </div>
  );
}

/* ========= Componente principal ========= */

export function Documentos({ urlGeral, token }: DocumentoProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Offset e limit lidos da URL na montagem
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const initialOffset = Number(searchParams.get("offset") ?? 0) || 0;
  const initialLimit = Number(searchParams.get("limit") ?? 12) || 12;

  const [offset, setOffset] = useState(initialOffset);
  const [limit, setLimit] = useState(initialLimit);
  const [fileList, setFileList] = useState<Files[]>([]);
  const [loading, setLoading] = useState(false);

  const [pdfDialog, setPdfDialog] = useState<{
    open: boolean;
    file?: Files | null;
  }>({ open: false });

  const isFirstPage = offset === 0;
  const isLastPage = useMemo(
    () => fileList.length < limit || fileList.length === 0,
    [fileList.length, limit]
  );

  const handleNavigate = useCallback(
    (newOffset: number, newLimit: number, replace = false) => {
      const params = new URLSearchParams(location.search);
      params.set("offset", String(newOffset));
      params.set("limit", String(newLimit));
      navigate(
        { pathname: location.pathname, search: params.toString() },
        { replace }
      );
    },
    [location.pathname, location.search, navigate]
  );

  // Mantém offset/limit refletidos na URL
  useEffect(() => {
    handleNavigate(offset, limit, true);
  }, [offset, limit, handleNavigate]);

  // Buscar arquivos da API sempre que offset/limit mudarem
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("offset", String(offset));
      params.set("limit", String(limit));

      const res = await fetch(
        `${urlGeral}catalog/files?${params.toString()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        throw new Error(`Erro ao buscar arquivos (${res.status})`);
      }

      const data: FilesResponse = await res.json();
      setFileList(data.files ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar os documentos.");
      setFileList([]);
    } finally {
      setLoading(false);
    }
  }, [offset, limit, token, urlGeral]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const downloadFile = useCallback(
    async (file: Files) => {
      try {
        const url = buildFileUrl(urlGeral, file.file_path);

        if (!token) {
          // Caso comum: arquivo público/CDN
          saveAs(url, file.file_name || "arquivo");
          return;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Falha ao baixar (${res.status})`);
        }

        const blob = await res.blob();
        const ext = file.file_name?.split(".").pop();
        const safeName = file.file_name || `arquivo.${ext || "bin"}`;
        saveAs(blob, safeName);
      } catch (e) {
        console.error(e);
        toast.error("Não foi possível baixar o arquivo.");
      }
    },
    [token, urlGeral]
  );

  const handleDeleteFile = useCallback(
    async (file: Files) => {
      if (!token) {
        toast.error("Você precisa estar autenticado para excluir arquivos.");
        return;
      }

      if (!file.catalog_id) {
        toast.error("Catálogo do arquivo não identificado.");
        return;
      }

      try {
        const res = await fetch(
          `${urlGeral}catalog/${file.catalog_id}/files/${file.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Erro ao excluir (${res.status})`);
        }

        setFileList((prev) => prev.filter((f) => f.id !== file.id));
        toast.success("Arquivo excluído com sucesso.");
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível excluir o arquivo.");
      }
    },
    [token, urlGeral]
  );

  const handleOpenPdf = useCallback((file: Files) => {
    setPdfDialog({ open: true, file });
  }, []);

  const handleClosePdf = useCallback(() => {
    setPdfDialog({ open: false, file: null });
  }, []);

  /* ===================== RENDER ===================== */

  if (!loading && fileList.length === 0) {
    return (
      <Alert variant="default" className="mt-2">
        Nenhum arquivo disponível.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles de paginação (itens por página) */}
      <div className="hidden md:flex md:justify-end mt-5 items-center gap-2">
        <span className="text-sm text-muted-foreground">Itens por página:</span>
        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            const newLimit = parseInt(value);
            setOffset(0);
            setLimit(newLimit);
            handleNavigate(0, newLimit);
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Itens" />
          </SelectTrigger>
          <SelectContent>
            {[12, 24, 36, 48, 84, 162].map((val) => (
              <SelectItem key={val} value={val.toString()}>
                {val}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* GRID de arquivos */}
      {loading ? (
        <div className="w-full flex items-center justify-center py-10 text-sm text-muted-foreground">
          Carregando documentos…
        </div>
      ) : (
        <>
          {fileList.length > 0 && <Separator />}

          {fileList.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              {fileList.map((file) => {
                const url = buildFileUrl(urlGeral, file.file_path);
                const mime = file.content_type ?? "";
                const showImg = isImage(mime);
                const showPdf = isPdf(mime);

                return (
                  <Alert key={file.id} className="group p-0 relative">
                    {/* Botão excluir (canto superior direito) */}
                    {token && (
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDeleteFile(file)}
                        className="gap-2 h-8 w-8 absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}

                    <div className="aspect-video border-b dark:border-b-neutral-800 rounded-t-lg w-full flex items-center justify-center overflow-hidden">
                      {showImg ? (
                        <img
                          src={url}
                          alt={file.file_name}
                          className="w-full h-full object-cover"
                        />
                      ) : showPdf ? (
                        <PdfThumbnail url={url} />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-neutral-500">
                          {mime.includes("image") ? (
                            <ImageIcon className="w-10 h-10" />
                          ) : (
                            <FileIcon className="w-10 h-10" />
                          )}
                          <span className="text-xs mt-1">
                            {mime || "arquivo"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 space-y-2">
                      <div
                        className="text-sm font-medium line-clamp-2"
                        title={file.file_name}
                      >
                        {file.file_name || "Arquivo"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {mime || "desconhecido"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => downloadFile(file)}
                          className="gap-2 w-full"
                        >
                          <DownloadIcon className="w-4 h-4" />
                          Baixar
                        </Button>

                        {showPdf && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenPdf(file)}
                            className="gap-2 w-full"
                          >
                            <Expand className="w-4 h-4" />
                            Abrir
                          </Button>
                        )}

                        {!showPdf && !showImg && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline ml-auto opacity-80 hover:opacity-100"
                          >
                            Abrir em nova aba
                          </a>
                        )}
                      </div>
                    </div>
                  </Alert>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Controles de paginação (Anterior / Próximo) */}
      <div className="w-full flex justify-center items-center gap-10 mt-4">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
            disabled={isFirstPage || loading}
          >
            <ChevronLeft size={16} className="mr-2" />
            Anterior
          </Button>

          <Button
            onClick={() => !isLastPage && setOffset((prev) => prev + limit)}
            disabled={isLastPage || loading}
          >
            Próximo
            <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Dialog para PDF */}
      <Dialog
        open={pdfDialog.open}
        onOpenChange={(open) => (open ? null : handleClosePdf())}
      >
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle className="text-base font-semibold">
              {pdfDialog.file?.file_name || "Documento PDF"}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-full">
            {pdfDialog.file ? (
              <iframe
                title={pdfDialog.file.file_name}
                src={buildFileUrl(urlGeral, pdfDialog.file.file_path)}
                className="w-full h-[calc(85vh-56px)] border-0"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-neutral-500">
                Carregando…
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
