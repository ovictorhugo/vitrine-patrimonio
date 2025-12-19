import {
  AlertCircle,
  ArrowRight,
  File,
  File as FileIcon,
  ScanEye,
  Trash,
} from "lucide-react";
import React, { useEffect, useState, useCallback, forwardRef } from "react";
import { Label } from "../../../ui/label";
import { Alert } from "../../../ui/alert";
import { Button } from "../../../ui/button";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { StepBaseProps } from "../emprestimo-audiovisual";
import { useIsMobile } from "../../../../hooks/use-mobile";

type ArquivosLocal = {
  docs?: File[];
};

// --- API para o pai disparar validação com toast só ao avançar ---
export type InformacoesAdicionaisRef = {
  validateBeforeNext: () => boolean;
};

export const ArquivosStep = forwardRef<
  InformacoesAdicionaisRef,
  StepBaseProps<"arquivos">
>(function ArquivosStep(
  { onValidityChange, step, onStateChange, docs, initialData },
  ref
) {
  // Upload de documentos (para idx 0 e 1)
  const [docsLocal, setDocsLocal] = useState<File[]>(
    () => docs ?? initialData ?? []
  );
  const MAX_MB = 5;

  // ===== Dropzone (substitui input; obrigatório em idx 0/1) =====
  const onDropDocs = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles?.length) return;
    const validExt = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".doc",
      ".docx",
      ".odt",
      ".xls",
      ".xlsx",
    ];
    const next: File[] = [];
    for (const f of acceptedFiles) {
      const okExt = validExt.some((e) => f.name.toLowerCase().endsWith(e));
      const okSize = f.size <= MAX_MB * 1024 * 1024;
      if (!okExt) {
        toast("Arquivo inválido", {
          description:
            "Formatos aceitos: PDF, imagens, DOC/DOCX/ODT, XLS/XLSX.",
        });
        continue;
      }
      if (!okSize) {
        toast("Arquivo muito grande", {
          description: `Cada arquivo deve ter até ${MAX_MB} MB.`,
        });
        continue;
      }
      next.push(f);
    }
    if (next.length) setDocsLocal((prev) => [...prev, ...next]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropDocs,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.oasis.opendocument.text": [".odt"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
  });

  const removeDoc = (i: number) =>
    setDocsLocal((prev) => prev.filter((_, idx) => idx !== i));

  // Sobe pro pai
  useEffect(() => {
    const payload: ArquivosLocal = {
      docs: docsLocal,
    };
    onStateChange?.(payload);
  }, [docsLocal, onStateChange]);

  const openDoc = useCallback(
    (i: number) => {
      const f = docsLocal[i];
      if (!f) return;

      const url = URL.createObjectURL(f);

      // abre PDF e imagens em nova aba; outros formatos baixam
      const isPreviewable =
        f.type === "application/pdf" ||
        f.type.startsWith("image/") ||
        f.name.toLowerCase().endsWith(".pdf") ||
        /\.(png|jpe?g)$/i.test(f.name);

      if (isPreviewable) {
        window.open(url, "_blank", "noopener,noreferrer");
        // libera o objeto depois de um tempo
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = f.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    },
    [docsLocal]
  );

  useEffect(() => {
    onValidityChange(true);
  }, [docsLocal, onValidityChange]);

  const isMobile = useIsMobile();

  return (
    <div
      className={
        isMobile
          ? "max-w-[936px] mt-8 mx-auto flex flex-col justify-center"
          : "max-w-[936px] h-full mx-auto flex flex-col justify-center"
      }
    >
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1
          className={
            isMobile
              ? "mb-8 text-2xl font-semibold max-w-[1000px]"
              : "mb-16 text-4xl font-semibold max-w-[1000px]"
          }
        >
          Enriqueça as informações do patrimônio
        </h1>
      </div>

      <div className={isMobile ? "" : "ml-8"}>
        <div className="flex gap-2 mb-8">
          <AlertCircle size={24} />
          <div>
            <p className="font-medium">Dados de patrimônio</p>
            <p className="text-gray-500 text-sm">
              Adicione detalhes que ajudem a entender o estado real do bem —
              como uso atual, funcionamento, defeitos, histórico de manutenção
              ou motivos de tombamento.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full">
          <div className="grid gap-2 w-full">
            <Label htmlFor="observacoes">Arquivos</Label>
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
                <p>Arraste e solte o arquivo aqui ou clique para selecionar</p>
              )}
            </div>

            {docsLocal.length > 0 && (
              <div className="">
                <ul className="text-xs space-y-2">
                  {docsLocal.map((f, i) => (
                    <Alert
                      key={i}
                      className=" flex group items-center justify-between"
                    >
                      <div className="flex items-center min-h-8 gap-2 w-full">
                        <File size={16} />
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
