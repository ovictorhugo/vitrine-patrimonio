import { ArrowUUpLeft, FileXls, Upload } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import { UserContext } from "../../context/context";
import { useDropzone } from "react-dropzone";
import { LoaderCircle } from "lucide-react";
import { Separator } from "../ui/separator";

interface Patrimonio {
  bem_cod: string;
  bem_dgv: string;
  bem_num_atm: string;
  csv_cod: string;
  bem_serie: string;
  bem_sta: string;
  bem_val: string;
  tre_cod: string;
  bem_dsc_com: string;
  uge_cod: string;
  uge_nom: string;
  org_cod: string;
  uge_siaf: string;
  org_nom: string;
  set_cod: string;
  set_nom: string;
  loc_cod: string;
  loc_nom: string;
  ite_mar: string;
  ite_mod: string;
  tgr_cod: string;
  grp_cod: string;
  ele_cod: string;
  sbe_cod: string;
  mat_cod: string;
  mat_nom: string;
  pes_cod: string;
  pes_nome: string;
}

export function ImportCsv() {
  const { onClose, isOpen, type: typeModal } = useModal();
  const isModalOpen = (isOpen && typeModal === "import-csv") || (isOpen && typeModal === "import-csv-morto");

  const { urlGeral } = useContext(UserContext);

  const [fileInfo, setFileInfo] = useState({ name: "", size: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("jwt_token");

  // Headers genéricos para JSON (se você precisar para outras requisições)
  const jsonHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // Headers específicos para upload: NÃO definir Content-Type
  const uploadHeaders = useMemo(
    () => ({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const handleFilePicked = (files: File[]) => {
    const uploadedFile = files?.[0];
    if (!uploadedFile) return;

    // validações simples
    const ext = uploadedFile.name.toLowerCase();
    if (!ext.endsWith(".xls") && !ext.endsWith(".xlsx") && !ext.endsWith(".csv")) {
      toast("Arquivo inválido", {
        description: "Use .xls, .xlsx ou .csv.",
        action: { label: "Fechar", onClick: () => {} },
      });
      return;
    }

    setFile(uploadedFile);
    setFileInfo({ name: uploadedFile.name, size: uploadedFile.size });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFilePicked(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
  });

  const handleSubmitPatrimonio = async () => {
    try {
      if (!file) {
        toast("Erro: Nenhum arquivo selecionado", {
          description: "Por favor, selecione um .xls, .xlsx ou .csv.",
          action: { label: "Fechar", onClick: () => {} },
        });
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append("file", file); // nome do campo deve ser 'file'

      // garante a / entre base e caminho
      const base = urlGeral.endsWith("/") ? urlGeral : `${urlGeral}/`;
      const urlPatrimonioInsert = `${base}assets/upload`;

      const response = await fetch(urlPatrimonioInsert, {
        method: "POST",
        headers: uploadHeaders, // sem Content-Type aqui!
        body: formData,
      });

      if (response.ok) {
        toast("Arquivo enviado com sucesso", {
          description: "O arquivo foi enviado para o servidor.",
          action: { label: "Fechar", onClick: () => {} },
        });
        // limpa estado
        setFile(null);
        setFileInfo({ name: "", size: 0 });
        onClose();
      } else {
        const maybeJson = await response.json().catch(() => null);
        const detail =
          (maybeJson && JSON.stringify(maybeJson)) ||
          `${response.status} ${response.statusText}`;
        toast("Erro no envio", {
          description: detail,
          action: { label: "Fechar", onClick: () => {} },
        });
      }
    } catch (error: any) {
      toast("Erro ao processar a requisição", {
        description: error?.message || "Tente novamente mais tarde.",
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
            Atualizar patrimônios
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Envie um arquivo (.xls, .xlsx ou .csv) para atualizar os registros.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

       <div className="mb-4">
         <div
          {...getRootProps()}
          className="border-dashed h-full mb-4 flex-col border border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm cursor-pointer transition-all gap-3 w-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <input {...getInputProps()} />
          <div className="p-4 border rounded-md">
            <FileXls size={24} className="whitespace-nowrap" />
          </div>
          {isDragActive ? (
            <p>Solte o arquivo aqui…</p>
          ) : (
            <p>Arraste e solte o arquivo aqui ou clique para selecionar</p>
          )}
        </div>

        {fileInfo.name && (
          <div className="justify-center  flex items-center gap-3">
            <FileXls size={16} />
            <p className="text-center text-zinc-500 text-sm">
              Arquivo selecionado: <strong>{fileInfo.name}</strong> (
              {(fileInfo.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}

       </div>

     <Separator className="my-4" />
     

        <DialogFooter>
          <Button onClick={onClose} variant={"ghost"}>
            <ArrowUUpLeft size={16} /> Cancelar
          </Button>

          <Button onClick={handleSubmitPatrimonio} disabled={uploading || !file}>
            {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
            <span className="ml-2">{uploading ? "Atualizando dados" : "Atualizar dados"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
