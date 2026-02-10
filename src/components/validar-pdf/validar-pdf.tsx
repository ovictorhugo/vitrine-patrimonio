import {
  ArrowRight,
  Check,
  ChevronLeft,
  File,
  FileIcon,
  ScanEye,
  Trash,
  CheckIcon, // Adicionado para tela de sucesso
  XCircle, // Adicionado para tela de erro
  AlertTriangle, // Adicionado para tela de aviso
  LoaderCircle, // Adicionado para loading
  Home,
  RefreshCcw,
  Info, // Ícone para "Tentar novamente"
} from "lucide-react";
import { Button } from "../ui/button";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useContext, useState } from "react";
import { toast } from "sonner";
import { UserContext } from "../../context/context";
import { useDropzone } from "react-dropzone";
import { Alert } from "../ui/alert";
import { useIsMobile } from "../../hooks/use-mobile";

type ExistingFileDTO = {
  id: string;
  file_path: string;
  file_name: string;
  content_type: string;
};

// Tipos de status possíveis
type VerificationStatus =
  | "idle"
  | "loading"
  | "success"
  | "unsigned"
  | "invalid";

export function ValidarPDF() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [docsLocal, setDocsLocal] = useState<File[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [serverFiles, setServerFiles] = useState<ExistingFileDTO[]>([]);

  // --- NOVOS ESTADOS PARA O RESULTADO DA VERIFICAÇÃO ---
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("idle");
  const [resultMessage, setResultMessage] = useState("");

  const MAX_MB = 5;
  const { urlGeral } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token") || "";

  /** ========= 3) BACKEND: POST/DELETE/REFRESH ========= */
  const [busy, setBusy] = useState(false);

  const uploadFileToServer = useCallback(
    async (file: File) => {
      // (Sua lógica original mantida, caso precise usar em outro lugar)
      const fd = new FormData();
      fd.append("file", file, file.name);
      // ... fetch original ...
    },
    [urlGeral, token],
  );

  const refreshFiles = useCallback(async () => {
    // (Lógica original mantida)
    return [];
  }, [urlGeral, token]);

  /** ========= 4) DROPZONE ========= */
  const onDropDocs = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles?.length) return;

      const validExt = [".pdf"]; // Para validar assinatura, focamos em PDF

      const toUpload: File[] = [];

      for (const f of acceptedFiles) {
        const okExt = validExt.some((e) => f.name.toLowerCase().endsWith(e));
        const okSize = f.size <= MAX_MB * 1024 * 1024;

        if (!okExt) {
          toast("Arquivo inválido", {
            description: "Apenas arquivos PDF podem ser validados.",
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

      // Resetamos status ao adicionar novo arquivo e limpamos anteriores (valida 1 por vez)
      setVerificationStatus("idle");
      setDocsLocal([toUpload[0]]);
    },
    [MAX_MB],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropDocs,
    multiple: false, // Força 1 arquivo para validação
    accept: {
      "application/pdf": [".pdf"],
    },
    disabled: busy || verificationStatus === "loading",
  });

  const removeDoc = (i: number) => {
    setDocsLocal((prev) => prev.filter((_, idx2) => idx2 !== i));
    setVerificationStatus("idle"); // Reseta status se remover
  };

  /** ========= 5) OPEN PREVIEW LOCAL ========= */
  const openDoc = useCallback(
    (i: number) => {
      const f = docsLocal[i];
      if (!f) return;
      const url = URL.createObjectURL(f);
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [docsLocal],
  );

  // --- FUNÇÃO DE RESET (Para botão "Verificar outro") ---
  const handleReset = () => {
    setDocsLocal([]);
    setVerificationStatus("idle");
    setResultMessage("");
  };

  // --- LÓGICA DE VERIFICAÇÃO IMPLEMENTADA ---
  async function handleVerify() {
    if (docsLocal.length === 0) return;

    setBusy(true);
    setVerificationStatus("loading");

    try {
      const file = docsLocal[0];
      const formData = new FormData();
      formData.append("file", file);

      // Chamada ao endpoint
      const response = await fetch(`${urlGeral}transfers/verify_pdf`, {
        method: "POST",
        // headers: { Authorization: `Bearer ${token}` }, // Descomente se precisar de auth
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        setVerificationStatus("invalid");
        setResultMessage(data.detail || "Erro ao processar arquivo.");
        return;
      }

      // Tratamento dos 3 tipos de resposta esperados
      // Ajuste as strings ('valid', 'unsigned', 'invalid') conforme o retorno exato do seu Python
      switch (data.valid) {
        case true:
          setVerificationStatus("success");
          break;
        case false:
          setVerificationStatus("invalid");
          setResultMessage(data.message);
          break;
        default:
          setVerificationStatus("invalid");
          setResultMessage(
            data.message || "A integridade do arquivo foi comprometida.",
          );
          break;
      }
    } catch (error) {
      console.error(error);
      setVerificationStatus("invalid");
      setResultMessage("Erro de conexão com o servidor.");
    } finally {
      setBusy(false);
    }
  }

  // =========================================================
  // RENDERIZAÇÃO CONDICIONAL DAS MENSAGENS (RETORNOS)
  // =========================================================

  // 1. Loading
  if (verificationStatus === "loading") {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <LoaderCircle size={64} className="animate-spin text-eng-blue mb-4" />
        <h2 className="text-xl font-semibold text-neutral-600 dark:text-neutral-300">
          Verificando assinatura digital...
        </h2>
      </div>
    );
  }

  // 2. Sucesso (Verde) - Baseado no seu exemplo
  if (verificationStatus === "success") {
    return (
      <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full flex flex-col items-center justify-center px-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6">
            <CheckIcon
              size={48}
              className="text-green-600 dark:text-green-400"
            />
          </div>

          <h1 className="text-center text-2xl md:text-4xl text-neutral-800 dark:text-neutral-200 font-bold mb-4">
            Arquivo Autêntico!
          </h1>

          <p className="text-center text-neutral-500 dark:text-neutral-400 max-w-[500px] mb-8 text-lg">
            A integridade do arquivo foi validada com sucesso. Este documento
            foi assinado pelo sistema e não sofreu alterações.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleReset}
            >
              <RefreshCcw size={18} className="mr-2" />
              Verificar outro arquivo
            </Button>

            <Link to={"/"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                <Home size={18} className="mr-2" /> Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Não Assinado (Amarelo)
  if (verificationStatus === "unsigned") {
    return (
      <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full flex flex-col items-center justify-center px-4">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-6 rounded-full mb-6">
            <AlertTriangle
              size={48}
              className="text-yellow-600 dark:text-yellow-400"
            />
          </div>

          <h1 className="text-center text-2xl md:text-4xl text-neutral-800 dark:text-neutral-200 font-bold mb-4">
            Arquivo Não Assinado
          </h1>

          <p className="text-center text-neutral-500 dark:text-neutral-400 max-w-[500px] mb-8 text-lg">
            {resultMessage ||
              "Este PDF não contém a assinatura digital de validação do sistema."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={handleReset}
            >
              <ArrowRight size={18} className="mr-2" />
              Tentar outro arquivo
            </Button>

            <Link to={"/"} className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Inválido (Vermelho)
  if (verificationStatus === "invalid") {
    return (
      <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full flex flex-col items-center justify-center px-4">
          <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full mb-6">
            <XCircle size={48} className="text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-center text-2xl md:text-4xl text-neutral-800 dark:text-neutral-200 font-bold mb-4">
            Arquivo Inválido
          </h1>

          <p className="text-center text-neutral-500 dark:text-neutral-400 max-w-[500px] mb-8 text-lg">
            {resultMessage ||
              "O arquivo está corrompido ou foi modificado externamente."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              variant="destructive"
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleReset}
            >
              <RefreshCcw size={18} className="mr-2" />
              Tentar Novamente
            </Button>

            <Link to={"/"} className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Cancelar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDERIZAÇÃO ORIGINAL DO FORMULÁRIO (Estado Idle)
  // =========================================================
  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>Validação PDF | Sistema Patrimônio</title>
      </Helmet>

      <main className="flex flex-col">
        <div className="flex p-8 items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const path = location.pathname;
                const hasQuery = location.search.length > 0;
                if (hasQuery) navigate(path);
                else {
                  const seg = path.split("/").filter(Boolean);
                  if (seg.length > 1) {
                    seg.pop();
                    navigate("/" + seg.join("/"));
                  } else navigate("/");
                }
              }}
              variant="outline"
              size="icon"
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>
            <h1 className="text-xl font-semibold tracking-tight">
              Validação PDF
            </h1>
          </div>
        </div>
        <div className="bg-cover bg-no-repeat bg-center w-full">
          <div className="justify-center w-full flex flex-col items-center mb-8">
            <Link
              to={""}
              className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 my-8 py-1 text-sm font-medium"
            >
              <Info size={12} />
              <div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>
              Faça o upload do arquivo PDF assinado para confirmar sua
              autenticidade e integridade.
            </Link>
            <h1 className="z-[2] text-center max-w-[930px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
              Verifique aqui seus documentos de{" "}
              <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
                transferências de bens.
              </strong>
            </h1>
          </div>
        </div>
        {docsLocal.length === 0 ? (
          <div className="flex flex-col w-full jusitfy-center items-center">
            <div
              {...getRootProps()}
              className={`border-dashed h-full mb-2 flex-col border bg-white dark:bg-black border-neutral-300 dark:border-neutral-800 p-6 text-center rounded-md text-neutral-400 text-sm cursor-pointer transition-all gap-3
                ${
                  isMobile
                    ? "text-xs space-y-2 w-[95%]"
                    : "text-xs space-y-2 w-[700px]"
                } flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800"`}
            >
              <input {...getInputProps()} />
              <div className="p-4 border rounded-md dark:border-neutral-800">
                <FileIcon size={24} />
              </div>
              {isDragActive ? (
                <p>Solte o arquivo aqui…</p>
              ) : (
                <p>
                  Arraste e solte o arquivo aqui ou clique para selecionar (até{" "}
                  {MAX_MB} MB)
                </p>
              )}
            </div>
          </div>
        ) : (
          <></>
        )}
        {/* Arquivos locais */}
        {docsLocal.length > 0 && (
          <div className="flex flex-col w-full jusitfy-center items-center">
            <ul
              className={
                isMobile
                  ? "text-xs space-y-2 w-[95%]"
                  : "text-xs space-y-2 w-[700px]"
              }
            >
              {docsLocal.map((f, i) => (
                <Alert key={i} className="flex group justify-between">
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
        <div className="w-full flex justify-center pr-8 pt-8">
          <Button
            size="default"
            className="rounded max-w-[150px]"
            onClick={() => handleVerify()}
            disabled={docsLocal.length === 0 || busy}
          >
            Verificar <Check size={16} className="ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
