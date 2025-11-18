// src/components/catalog/TransferTabCatalog.tsx
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
} from "react";
import { Alert } from "../../ui/alert";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Label } from "../../ui/label";
import { toast } from "sonner";
import {
  Archive,
  MapPin,
  Users,
  ChevronRight,
  LoaderCircle,
  CheckCircle,
  File as FileIcon,
  Image as ImageIcon,
  FileText as PdfIcon,
  Download as DownloadIcon,
  Eye as EyeIcon,
  ScanEye,
  Trash,
  Expand,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { saveAs } from "file-saver";
import { useDropzone } from "react-dropzone";

/* ===== Tipos mínimos para funcionar isolado ===== */
type UUID = string;

type UnitDTO = {
  id: UUID;
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
};
type AgencyDTO = {
  id: UUID;
  agency_name: string;
  agency_code: string;
  unit?: UnitDTO | null;
};
type SectorDTO = {
  id: UUID;
  sector_name: string;
  sector_code: string;
  agency?: AgencyDTO | null;
  unit?: UnitDTO | null;
};
type LegalGuardianDTO = {
  id: UUID;
  legal_guardians_code: string;
  legal_guardians_name: string;
};
type LocationDTO = {
  id: UUID;
  location_name: string;
  location_code: string;
  sector?: SectorDTO | null;
  legal_guardian?: LegalGuardianDTO | null;
};
type UserDTO = { id: UUID; username?: string; email?: string; photo_url?: string | null };

export type TransferRequestDTO = {
  id: UUID;
  status: "PENDING" | "DECLINED" | "ACCEPTABLE" | string;
  user: UserDTO;
  location: LocationDTO;
};

type WorkflowEvent = {
  id: UUID;
  workflow_status: string;
  created_at: string;
  transfer_requests?: TransferRequestDTO[];
};

export type Files = {
  id: string;
  catalog_id: string;
  file_path: string;
  file_name: string;
  content_type: string;
};

export type CatalogResponseDTO = {
  id: UUID;
  // Em alguns payloads vem como array; em outros, como objeto único.
  files: Files | Files[] | null | undefined;
  workflow_history?: WorkflowEvent[];
  user:WorkflowHistoryItem["user"]
};

export interface TransferTabCatalogProps {
  catalog: CatalogResponseDTO | null | undefined;
  urlGeral: string;
  token?: string;
  onChange?: (next: Partial<CatalogResponseDTO>) => void;
}

function isImage(mime?: string) {
  return !!mime && mime.startsWith("image/");
}
function isPdf(mime?: string) {
  return mime === "application/pdf" || (mime ?? "").includes("/pdf");
}

function buildFileUrl(base: string, path: string) {
  // Garante barra única entre base e caminho
  if (!base) return path;
  const a = base.endsWith("/") ? base.slice(0, -1) : base;
  const b = path.startsWith("/") ? path : `/${path}`;
  return `${a}${b}`;
}


// PdfThumbnail.tsx
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import { UserContext } from "../../../context/context";
import { usePermissions } from "../../permissions";
import { WorkflowHistoryItem } from "../../dashboard/itens-vitrine/card-item-dropdown";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc ||
  new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

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

        const viewport = page.getViewport({ scale: 1 });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        // ajusta tamanho do canvas (thumb pequena)
        const scale = 0.3; // ajuste fino depois
        const scaledViewport = page.getViewport({ scale });

        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
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
    // fallback pro ícone antigo se der ruim
    return (
      <div className="flex flex-col items-center justify-center text-neutral-500">
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


export function DocumentsTabCatalog({
  catalog,
  urlGeral,
  token: tokenProp,
  onChange,
}: TransferTabCatalogProps) {
  // Lista de arquivos do backend (para o grid)
  const [fileList, setFileList] = useState<Files[]>(() => {
    if (!catalog?.files) return [];
    return Array.isArray(catalog.files) ? catalog.files : [catalog.files];
  });

  // Sincroniza se o catálogo mudar externamente
  useEffect(() => {
    if (!catalog?.files) {
      setFileList([]);
      return;
    }
    setFileList(Array.isArray(catalog.files) ? catalog.files : [catalog.files]);
  }, [catalog]);

  const [pdfDialog, setPdfDialog] = useState<{
    open: boolean;
    file?: Files | null;
  }>({ open: false });

  const handleOpenPdf = useCallback((file: Files) => {
    setPdfDialog({ open: true, file });
  }, []);

  const handleClosePdf = useCallback(() => {
    setPdfDialog({ open: false, file: null });
  }, []);

  const downloadFile = useCallback(
    async (file: Files) => {
      try {
        const url = buildFileUrl(urlGeral, file.file_path);
        // Se não houver token, tenta baixar direto pelo link (útil para arquivos públicos/CDN)
        if (!tokenProp) {
          saveAs(url, file.file_name || "arquivo");
          return;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${tokenProp}` },
        });

        if (!res.ok) {
          throw new Error(`Falha ao baixar (${res.status})`);
        }

        const blob = await res.blob();
        const ext = file.file_name?.split(".").pop();
        const safeName = file.file_name || `arquivo.${ext || "bin"}`;
        saveAs(blob, safeName);
      } catch (e: any) {
        console.error(e);
        toast.error("Não foi possível baixar o arquivo.");
      }
    },
    [tokenProp, urlGeral]
  );

  /* ===================== WORKFLOW ===================== */

  const currentWorkflowStatus = useMemo(() => {
    const history = catalog?.workflow_history;
    if (!history || history.length === 0) return undefined;
    const sorted = [...history].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted[0]?.workflow_status;
  }, [catalog?.workflow_history]);

  const allowedUploadStatuses = useMemo(
    () => [
      "ADJUSTMENT_DESFAZIMENTO",
      "REJEITADOS_COMISSAO",
      "REVIEW_REQUESTED_DESFAZIMENTO",
    ],
    []
  );

  const {user} = useContext(UserContext)
  const {hasCatalogo} = usePermissions()

  const canUpload =
    !!catalog?.id &&
    !!tokenProp &&
    !!currentWorkflowStatus &&
    allowedUploadStatuses.includes(currentWorkflowStatus)
    && (!hasCatalogo || user?.id != catalog?.user.id);

  /* ===================== DROPZONE / UPLOAD ===================== */

  const [uploading, setUploading] = useState(false);

  // 🔹 Arquivos anexados localmente (AINDA NÃO enviados ao backend)
  const [docsLocal, setDocsLocal] = useState<File[]>([]);

  // 👉 Agora o onDrop NÃO faz fetch, só preenche docsLocal
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!canUpload) {
        toast.error("Não é possível anexar documentos neste status do fluxo.");
        return;
      }
      if (!catalog?.id) {
        toast.error("Catálogo não identificado.");
        return;
      }
      if (!tokenProp) {
        toast.error("Você precisa estar autenticado para anexar documentos.");
        return;
      }

      setDocsLocal((prev) => [...prev, ...acceptedFiles]);
    },
    [canUpload, catalog?.id, tokenProp]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const openDoc = useCallback(
    (index: number) => {
      const file = docsLocal[index];
      if (!file) return;
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
      // se quiser, pode revogar depois com setTimeout
    },
    [docsLocal]
  );

  const removeDoc = useCallback((index: number) => {
    setDocsLocal((prev) => prev.filter((_, i) => i !== index));
    // OBS: remove só da lista local (ainda não enviados).
  }, []);

  // 🔸 ÚNICO ponto que faz upload pro backend: botão "Enviar documentos"
  const handleUploadDocs = useCallback(async () => {
    if (!canUpload) {
      toast.error("Não é possível enviar documentos neste status do fluxo.");
      return;
    }
    if (!catalog?.id) {
      toast.error("Catálogo não identificado.");
      return;
    }
    if (!tokenProp) {
      toast.error("Você precisa estar autenticado para enviar documentos.");
      return;
    }
    if (!docsLocal.length) {
      toast("Nenhum documento selecionado para envio.");
      return;
    }

    try {
      setUploading(true);

      const createdFiles: Files[] = [];

      for (const f of docsLocal) {
        const fd = new FormData();
        fd.append("file", f, f.name);

        const upDoc = await fetch(`${urlGeral}catalog/${catalog.id}/files`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenProp}`,
            // NÃO definir Content-Type aqui (FormData cuida disso)
          },
          body: fd,
        });

        if (!upDoc.ok) {
          throw new Error(`Falha ao enviar documento (${upDoc.status})`);
        }

        const created: Files = await upDoc.json();
        createdFiles.push(created);
      }

      // Atualiza lista de arquivos do backend
      setFileList((prev) => {
        const next = [...prev, ...createdFiles];
        onChange?.({ files: next });
        return next;
      });

      // Limpa lista local após envio bem-sucedido
      setDocsLocal([]);

      toast.success("Documentos enviados com sucesso.", {
        description: "Comprovantes vinculados ao catálogo.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível enviar um ou mais documentos.");
    } finally {
      setUploading(false);
    }
  }, [canUpload, catalog?.id, tokenProp, urlGeral, docsLocal, onChange]);

  const handleDeleteFile = useCallback(
    async (file: Files) => {
      if (!catalog?.id || !tokenProp) {
        toast.error("Não foi possível excluir o arquivo.");
        return;
      }

      try {
        const res = await fetch(
          `${urlGeral}catalog/${catalog.id}/files/${file.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${tokenProp}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Erro ao excluir (${res.status})`);
        }

        // Atualiza UI instantaneamente
        setFileList((prev) => {
          const next = prev.filter((f) => f.id !== file.id);
          onChange?.({ files: next });
          return next;
        });

        toast.success("Arquivo excluído com sucesso.");
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível excluir o arquivo.");
      }
    },
    [catalog?.id, tokenProp, urlGeral, onChange]
  );



  /* ===================== RENDER ===================== */

  if (!fileList.length && !canUpload) {
    return (
      <Alert className="flex items-center justify-between">
          <div>
            <p className="font-medium">  Nenhum arquivo disponível para esse item.</p>
            <p className="text-sm text-muted-foreground">
              Quando houver envios, eles aparecem aqui.
            </p>
          </div>
        </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dropzone para comprovantes — só mostra se puder fazer upload */}
      {canUpload && (
        <div className="grid gap-2 w-full">
          <Label htmlFor="observacoes">Comprovantes*</Label>

          <div
            {...getRootProps()}
            className="border-dashed h-full mb-2 flex-col border bg-white dark:bg-black border-neutral-300 dark:border-neutral-800 p-6 text-center rounded-md text-neutral-400 text-sm cursor-pointer transition-all gap-3 w-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <input {...getInputProps()} />
            <div className="p-4 border rounded-md dark:border-neutral-800">
              <FileIcon size={24} className="whitespace-nowrap" />
            </div>
            {isDragActive ? (
              <p>Solte o arquivo aqui…</p>
            ) : (
              <p>
                Arraste e solte o arquivo aqui ou clique para selecionar
              </p>
            )}
          </div>

          {docsLocal.length > 0 && (
            <div>
              <ul className="text-xs space-y-2">
                {docsLocal.map((f, i) => (
                  <Alert
                    key={i}
                    className="flex group items-center justify-between"
                  >
                    <div className="flex items-center min-h-8 gap-2 w-full">
                      <FileIcon size={16} />
                      <span className="truncate max-w-[75%]">
                        {f.name} — {(f.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hidden group-hover:flex"
                        onClick={() => openDoc(i)}
                        title="Abrir em nova aba"
                      >
                        <ScanEye size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 hidden group-hover:flex"
                        onClick={() => removeDoc(i)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </Alert>
                ))}
              </ul>

              {/* Botão explícito para enviar os anexos */}
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handleUploadDocs}
                  disabled={uploading}
                  className="gap-2"
                >
                  {uploading ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      Enviando documentos...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Enviar documentos
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {fileList.length > 0 && <Separator />}

      {/* GRID de arquivos já anexados no backend */}
      {fileList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {fileList.map((file) => {
            const url = buildFileUrl(urlGeral, file.file_path);
            const mime = file.content_type ?? "";
            const showImg = isImage(mime);
            const showPdf = isPdf(mime);

            return (
              <Alert
                key={file.id}
                className="group p-0"
              >
                <div className="aspect-video border-b dark:border-b-neutral-800 rounded-t-lg w-full flex items-center justify-center overflow-hidden relative">
                  {canUpload && (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDeleteFile(file)}
                      className="gap-2 h-8 w-8 absolute top-4 right-4"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}

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
                        className="text-sm underline ml-auto opacity-80 hover:opacity-100"
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

      {/* Dialog para PDF */}
      <Dialog
        open={pdfDialog.open}
        onOpenChange={(open) => (open ? null : handleClosePdf())}
      >
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 r">
          <div className="flex justify-between items-cente">
              <p className="text-base flex items-center font-semibold h-auto">
              {pdfDialog.file?.file_name || "Documento PDF"}
            </p>

           <DialogClose>
             <Button className="h-8 w-8" size={'icon'} variant={'outline'}>
<X size={16}  />
            </Button>
           </DialogClose>
          </div>
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
