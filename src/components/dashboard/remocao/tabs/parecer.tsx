import {
  Check,
  File,
  FileIcon,
  ScanEye,
  Trash,
  CheckIcon,
  XCircle,
  LoaderCircle,
  RefreshCcw,
  Info,
  Download,
} from "lucide-react";
import { Button } from "../../../ui/button";
import { useCallback, useContext, useState } from "react";
import { toast } from "sonner";
import { UserContext } from "../../../../context/context";
import { useDropzone } from "react-dropzone";
import { Alert } from "../../../ui/alert";
import { useIsMobile } from "../../../../hooks/use-mobile";
import { TabsContent } from "../../../ui/tabs";
import React from "react";

type VerificationStatus =
  | "idle"
  | "loading"
  | "success"
  | "invalid";

interface ParecerTabProps {
  collection_id: string | null;
  collection: any;
  reload: () => void;
}

export function ParecerTab({ collection_id, collection, reload }: ParecerTabProps) {
  const isMobile = useIsMobile();
  const [docsLocal, setDocsLocal] = useState<File[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [resultMessage, setResultMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  const MAX_MB = 100;
  const { urlGeral } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token") || "";

  const onDropDocs = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles?.length) return;
      const validExt = [".pdf"];
      const toUpload: File[] = [];

      for (const f of acceptedFiles) {
        const okExt = validExt.some((e) => f.name.toLowerCase().endsWith(e));
        const okSize = f.size <= MAX_MB * 1024 * 1024;

        if (!okExt) {
          toast("Arquivo inválido", {
            description: "Apenas arquivos PDF podem ser enviados.",
          });
          continue;
        }
        if (!okSize) {
          toast("Arquivo muito grande", {
            description: `Cada arquivo deve ter até ${MAX_MB} MB.`,
          });
          continue;
        }

        toUpload.push(f);
      }

      if (!toUpload.length) return;
      setVerificationStatus("idle");
      setDocsLocal([toUpload[0]]);
    },
    [MAX_MB],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropDocs,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
    },
    disabled: busy || verificationStatus === "loading",
  });

  const removeDoc = (i: number) => {
    setDocsLocal((prev) => prev.filter((_, idx2) => idx2 !== i));
    setVerificationStatus("idle");
  };

  const openDoc = useCallback(
    (i: number) => {
      const f = docsLocal[i];
      if (!f) return;
      const url = URL.createObjectURL(f);
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [docsLocal],
  );

  const handleReset = () => {
    setDocsLocal([]);
    setVerificationStatus("idle");
    setResultMessage("");
    setIsReplacing(true);
  };

  async function handleVerify() {
    if (docsLocal.length === 0 || !collection_id) return;

    setBusy(true);
    setVerificationStatus("loading");

    try {
      const file = docsLocal[0];
      const formData = new FormData();
      formData.append("file", file);

      // Endpoint especificado pelo usuário
      const response = await fetch(`${urlGeral}collections/enviar-parecer/${collection_id}`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setVerificationStatus("invalid");
        setResultMessage(data?.detail || data?.message || "Erro ao processar arquivo.");
        return;
      }

      setVerificationStatus("success");
      setIsReplacing(false);
      reload();
    } catch (error) {
      console.error(error);
      setVerificationStatus("invalid");
      setResultMessage("Erro de conexão com o servidor.");
    } finally {
      setBusy(false);
    }
  }

  const handleDownloadParecer = async () => {
    try {
      const url = `${urlGeral}collections/baixar-parecer/${collection_id}`;
      const response = await fetch(url, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!response.ok) {
        toast.error("Erro ao baixar o parecer.");
        return;
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = collection?.document_path || "parecer.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao baixar o parecer.");
    }
  };

  const renderContent = () => {
    const hasSavedParecer = !!collection?.document_path && docsLocal.length === 0 && !isReplacing;
    if (verificationStatus === "loading") {
      return (
        <div className="flex flex-col h-64 items-center justify-center">
          <LoaderCircle size={64} className="animate-spin text-eng-blue mb-4" />
          <h2 className="text-xl font-semibold text-neutral-600 dark:text-neutral-300">
            Enviando parecer...
          </h2>
        </div>
      );
    }

    if (verificationStatus === "success" || (hasSavedParecer && verificationStatus === "idle")) {
      const isJustUploaded = verificationStatus === "success";
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6">
            <CheckIcon size={48} className="text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-center text-2xl font-bold mb-4">
            {isJustUploaded ? "Parecer enviado com sucesso!" : "Parecer já salvo na coleção!"}
          </h1>
          <p className="text-center text-neutral-500 max-w-[500px] mb-8">
            {isJustUploaded
              ? "O arquivo PDF foi anexado à coleção."
              : `O arquivo ${collection.document_path} encontra-se salvo no sistema.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="default" onClick={handleDownloadParecer}>
              <Download size={18} className="mr-2" />
              Baixar Parecer
            </Button>

          </div>
        </div>
      );
    }

    if (verificationStatus === "invalid") {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full mb-6">
            <XCircle size={48} className="text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-center text-2xl font-bold mb-4">
            Erro ao enviar parecer
          </h1>
          <p className="text-center text-neutral-500 max-w-[500px] mb-8">
            {resultMessage}
          </p>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCcw size={18} className="mr-2" />
            Tentar novamente
          </Button>
        </div>
      );
    }

    // "idle"
    return (
      <div className="flex flex-col items-center w-full">
        <div className="justify-center w-full flex flex-col items-center mb-8">
          <div className="inline-flex z-[2] items-center rounded-lg bg-amber-100/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-500 gap-2 mb-3 px-3 my-8 py-1 text-sm font-medium border border-amber-200 dark:border-amber-800/30">
            <Info size={16} className="min-w-fit" />
            <div className="h-full w-[1px] bg-amber-200 dark:bg-amber-800/30"></div>
            Faça o upload do parecer técnico em PDF. Atenção: Esta ação é IRREVERSÍVEL. O arquivo não poderá ser substituído.
          </div>
        </div>

        {docsLocal.length === 0 ? (
          <div className="flex flex-col w-full justify-center items-center">
            <div
              {...getRootProps()}
              className={`border-dashed h-full mb-2 flex-col border bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 p-6 text-center rounded-md text-neutral-400 text-sm cursor-pointer transition-all gap-3 ${isMobile ? "w-full" : "w-[600px]"
                } flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800`}
            >
              <input {...getInputProps()} />
              <div className="p-4 border rounded-md dark:border-neutral-700">
                <FileIcon size={24} />
              </div>
              {isDragActive ? (
                <p>Solte o arquivo aqui…</p>
              ) : (
                <p>
                  Arraste e solte o arquivo aqui ou clique para selecionar (até {MAX_MB} MB)
                </p>
              )}
            </div>
          </div>
        ) : null}

        {docsLocal.length > 0 && (
          <div className="flex flex-col w-full justify-center items-center">
            <ul className={isMobile ? "w-full space-y-2" : "w-[600px] space-y-2"}>
              {docsLocal.map((f, i) => (
                <Alert key={i} className="flex group justify-between items-center bg-white dark:bg-neutral-900">
                  <div className="flex items-center min-h-8 gap-2 w-full">
                    <File size={16} />
                    <span className="truncate max-w-[85%]">
                      {f.name} — {(f.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hidden group-hover:flex"
                      onClick={() => openDoc(i)}
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

        <div className="w-full flex justify-center pt-8">
          <Button
            size="default"
            className="rounded"
            onClick={handleVerify}
            disabled={docsLocal.length === 0 || busy || !collection_id}
          >
            Enviar Parecer <Check size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <TabsContent value="parecer">
      <div className="p-8 pt-0 w-full">
        {renderContent()}
      </div>
    </TabsContent>
  );
}
