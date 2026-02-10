import {
  ArrowUUpLeft,
  FileCsv,
  FilePdf,
  FileXls,
  Plus,
  Upload,
} from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { UserContext } from "../../context/context";
import * as XLSX from "xlsx";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

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

import { v4 as uuidv4 } from "uuid";

export function AdicionarEmpenho() {
  const { onClose, isOpen, type: typeModal } = useModal();

  const isModalOpen = isOpen && typeModal === "adicionar-empenho";

  const { urlGeral } = useContext(UserContext);

  const [nome, setNome] = useState("");

  const [fileInfo, setFileInfo] = useState<{ name: string; size: number }>({
    name: "",
    size: 0,
  });

  const [pdfs, setPdfs] = useState<{
    pdf_empenho: File | null;
    pdf_nf: File | null;
    pdf_resumo: File | null;
  }>({
    pdf_empenho: null,
    pdf_nf: null,
    pdf_resumo: null,
  });

  const handleFileUpload = (files: any) => {
    const uploadedFile = files[0];
    if (uploadedFile) {
      setPdfs((prevState) => ({
        ...prevState,
        pdf_empenho: uploadedFile, // Assume that this handler is for pdf_empenho; update as needed for other files
      }));
      setFileInfo({
        name: uploadedFile.name,
        size: uploadedFile.size,
      });

      setNome(uploadedFile.name);
    }
  };

  const onDrop = useCallback((acceptedFiles: any) => {
    handleFileUpload(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const uuid = uuidv4();

  // Extract numbers from the UUID and join them into a single string
  const id = uuid.replace(/\D/g, "").slice(0, 10);
  const [cb, setCb] = useState("recebidos");

  const [formData, setFormData] = useState({
    id: id,
    coluna: cb,
    emp_nom: nome,
    status_tomb: "",
    tipo_emp: "",
    pdf_empenho: "",
    data_fornecedor: "",
    prazo_entrega: "",
    status_recebimento: "",
    loc_entrega: "",
    loc_entrega_confirmado: "",
    cnpj: "",
    loc_nom: "",
    des_nom: "",
    status_tombamento: "",
    data_tombamento: "",
    data_aviso: "",
    prazo_teste: "",
    atestado: "",
    loc_tom: "",
    status_nf: "",
    observacoes: "",
    data_agendamento: "",
    n_termo_processo: "",
    origem: "",
    valor_termo: "",
    n_projeto: "",
    data_tomb_sei: "",
    pdf_nf: "",
    pdf_resumo: "",
    created_at: "",
  });

  useEffect(() => {
    setFormData({
      id: id,
      coluna: cb,
      emp_nom: nome,
      status_tomb: "",
      tipo_emp: "",
      pdf_empenho: "",
      data_fornecedor: "",
      prazo_entrega: "",
      status_recebimento: "",
      loc_entrega: "",
      loc_entrega_confirmado: "",
      cnpj: "",
      loc_nom: "",
      des_nom: "",
      status_tombamento: "",
      data_tombamento: "",
      data_aviso: "",
      prazo_teste: "",
      atestado: "",
      loc_tom: "",
      status_nf: "",
      observacoes: "",
      data_agendamento: "",
      n_termo_processo: "",
      origem: "",
      valor_termo: "",
      n_projeto: "",
      data_tomb_sei: "",
      pdf_nf: "",
      pdf_resumo: "",
      created_at: "",
    });
  }, [nome]);

  const handleSubmitPatrimonio = async () => {
    try {
      if (!pdfs.pdf_empenho) {
        toast("Erro: Nenhum arquivo selecionado", {
          description: "Por favor, selecione um arquivo PDF para enviar.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
        return;
      }

      const urlPatrimonioInsert = urlGeral + `empenho`; // Atualize a URL conforme necessário

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      data.append("pdf_empenho", pdfs.pdf_empenho);

      const response = await axios.post(urlPatrimonioInsert, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        toast("Dados enviados com sucesso", {
          description: "Todos os dados foram enviados.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });

        setFormData({
          id: "",
          coluna: "",
          emp_nom: "",
          status_tomb: "",
          tipo_emp: "",
          pdf_empenho: "",
          data_fornecedor: "",
          prazo_entrega: "",
          status_recebimento: "",
          loc_entrega: "",
          loc_entrega_confirmado: "",
          cnpj: "",
          loc_nom: "",
          des_nom: "",
          status_tombamento: "",
          data_tombamento: "",
          data_aviso: "",
          prazo_teste: "",
          atestado: "",
          loc_tom: "",
          status_nf: "",
          observacoes: "",
          data_agendamento: "",
          n_termo_processo: "",
          origem: "",
          valor_termo: "",
          n_projeto: "",
          data_tomb_sei: "",
          pdf_nf: "",
          pdf_resumo: "",
          created_at: "",
        });
        setFileInfo({
          name: "",
          size: 0,
        });
        setPdfs({
          pdf_empenho: null,
          pdf_nf: null,
          pdf_resumo: null,
        });

        onClose();
      }
    } catch (error) {
      console.error("Erro ao processar a requisição:", error);
      toast("Erro ao processar a requisição", {
        description: "Tente novamente mais tarde.",
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[40vw] ">
        <DialogHeader className="pt-8 px-6 flex flex-col items-center">
          <DialogTitle className="text-2xl text-center font-medium">
            Adicionar nota de empenho
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500 max-w-[400px]">
            Prrencha o formulário e adicione o arquivo .pdf do empenho, todos os
            processos serão feitos na plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex  gap-6 my-6 items-end w-full">
            <div className="grid gap-3 w-full">
              <Label htmlFor="name">Nome do empenho</Label>
              <Input
                id="name"
                type="text"
                className="w-full"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="grid gap-3 ">
              <Label htmlFor="name">Coluna</Label>
              <Select value={cb} onValueChange={(value) => setCb(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recebidos">Recebidos</SelectItem>
                  <SelectItem value="projetos">Projetos</SelectItem>
                  <SelectItem value="tombamento">Tombamento</SelectItem>
                  <SelectItem value="agendamento">Agendamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div
            {...getRootProps()}
            className="border-dashed mb-6 flex-col border-2 border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm  cursor-pointer transition-all gap-3  w-full flex items-center justify-center hover:bg-neutral-100 mt-4"
          >
            <input {...getInputProps()} />
            <div className="p-4  border rounded-md">
              <FilePdf size={24} className=" whitespace-nowrap" />
            </div>
            {isDragActive ? (
              <p>Solte os arquivos aqui ...</p>
            ) : (
              <p>
                Arraste e solte o arquivo .pdf aqui ou clique para selecionar o
                arquivo
              </p>
            )}
          </div>

          <div>
            {fileInfo.name && (
              <div className="justify-center flex items-center gap-3">
                <FilePdf size={16} />
                <p className=" text-center  text-zinc-500 text-sm">
                  Arquivo selecionado: <strong>{fileInfo.name}</strong> (
                  {(fileInfo.size / 1024).toFixed(2)} KB)
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onClose()} variant={"ghost"}>
            <ArrowUUpLeft size={16} className="" />
            Cancelar
          </Button>
          <Button onClick={() => handleSubmitPatrimonio()}>
            <Plus size={16} className="" />
            Adicionar empenho
          </Button>
        </DialogFooter>

        <div></div>
      </DialogContent>
    </Dialog>
  );
}
