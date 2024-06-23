import { ArrowUUpLeft, FileCsv, FilePdf, FileXls, Plus, Upload } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCallback, useContext, useState } from "react";
import { toast } from "sonner"
import { UserContext } from "../../context/context";
import * as XLSX from 'xlsx';
import {useDropzone} from 'react-dropzone'
import axios from 'axios';

interface Patrimonio {
    bem_cod:string
    bem_dgv:string
    bem_num_atm:string
    csv_cod:string
    bem_serie:string
    bem_sta:string
    bem_val:string
    tre_cod:string
    bem_dsc_com:string
    uge_cod:string
    uge_nom:string
    org_cod:string
    uge_siaf:string
    org_nom:string
    set_cod:string
    set_nom:string
    loc_cod:string
    loc_nom:string
    ite_mar:string
    ite_mod:string
    tgr_cod:string
    grp_cod:string
    ele_cod:string
    sbe_cod:string
    mat_cod:string
    mat_nom:string
    pes_cod:string
    pes_nome:string
}

export function AdicionarEmpenho() {
    const { onClose, isOpen, type: typeModal } = useModal();
    
    const isModalOpen = (isOpen && typeModal === 'adicionar-empenho')

    const {urlGeral} = useContext(UserContext)


    const [formData, setFormData] = useState({
      id: 'TESTE',
      status_tomb: '',
      data_tombamento: '',
      data_aviso: '',
      prazo_teste: '',
      atestado: '',
      solicitante: '',
      n_termo_processo: '',
      origem: '',
      cnpj: '',
      valor_termo: '',
      n_projeto: '',
      data_tomb_sei: '',
      nome: '',
      email: '',
      telefone: '',
      nf_enviada: '',
      loc_tom: '',
      des_nom: '',
      observacoes: '',
      type_emp: ''
    });
  
    const [fileInfo, setFileInfo] = useState<{ name: string; size: number }>({
      name: '',
      size: 0
    });
  
    const [pdfs, setPdfs] = useState<{
      pdf_empenho: File | null;
      pdf_nf: File | null;
      pdf_resumo: File | null;
    }>({
      pdf_empenho: null,
      pdf_nf: null,
      pdf_resumo: null
    });
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };
  
    const handleFileUpload = (files: any) => {
      const uploadedFile = files[0];
      if (uploadedFile) {
        setPdfs((prevState) => ({
          ...prevState,
          pdf_empenho: uploadedFile // Assume that this handler is for pdf_empenho; update as needed for other files
        }));
        setFileInfo({
          name: uploadedFile.name,
          size: uploadedFile.size
        });
      }
    };
  
    const onDrop = useCallback((acceptedFiles: any) => {
      handleFileUpload(acceptedFiles);
    }, []);
  
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop
    });
  
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
        data.append('pdf_empenho', pdfs.pdf_empenho);
  
        const response = await axios.post(urlPatrimonioInsert, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
  
        if (response.status === 201) {
          toast("Dados enviados com sucesso", {
            description: "Todos os dados foram enviados.",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
  
          setFormData({
            id: '',
            status_tomb: '',
            data_tombamento: '',
            data_aviso: '',
            prazo_teste: '',
            atestado: '',
            solicitante: '',
            n_termo_processo: '',
            origem: '',
            cnpj: '',
            valor_termo: '',
            n_projeto: '',
            data_tomb_sei: '',
            nome: '',
            email: '',
            telefone: '',
            nf_enviada: '',
            loc_tom: '',
            des_nom: '',
            observacoes: '',
            type_emp: ''
          });
          setFileInfo({
            name: '',
            size: 0
          });
          setPdfs({
            pdf_empenho: null,
            pdf_nf: null,
            pdf_resumo: null
          });
        }
      } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        toast("Erro ao processar a requisição", {
          description: "Tente novamente mais tarde.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
      }
    };



    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}> 
        <DialogContent className="min-w-[40vw] ">
        <DialogHeader className="pt-8 px-6 flex flex-col items-center">
                 <DialogTitle className="text-2xl text-center font-medium">
                Adicionar nota de empenho
                 </DialogTitle>
                 <DialogDescription className="text-center text-zinc-500 max-w-[350px]">
                 Atualize os itens do {typeModal == 'import-csv' ? ('patrimônio'):('patrimônio baixado')} na Vitrine com a planilha .xls gerada no SICPAT
                 </DialogDescription>
               </DialogHeader>

               <div className="mb-4">
               <div {...getRootProps()} className="border-dashed mb-6 flex-col border-2 border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm  cursor-pointer transition-all gap-3  w-full flex items-center justify-center hover:bg-neutral-100 mt-4">
          <input {...getInputProps()} />
          <div className="p-4  border rounded-md">
            <FilePdf size={24} className=" whitespace-nowrap" />
          </div>
          {isDragActive ? (
            <p>Solte os arquivos aqui ...</p>
          ) : (
            <p>Arraste e solte o arquivo .pdf aqui ou clique para selecionar o arquivo</p>
          )}
        </div>

    <div >
    {fileInfo.name && (
      <div className="justify-center flex items-center gap-3">
        <FilePdf size={16 }  />
        <p className=" text-center  text-zinc-500 text-sm">
          Arquivo selecionado: <strong>{fileInfo.name}</strong> ({(fileInfo.size / 1024).toFixed(2)} KB)
        </p>
      </div>
      )}
    </div>
               </div>


               <DialogFooter>
                <Button onClick={() => onClose()} variant={'ghost'}><ArrowUUpLeft size={16} className="" />Cancelar</Button>
                <Button  onClick={() => handleSubmitPatrimonio()} ><Plus size={16} className="" />Adicionar empenho</Button>

                </DialogFooter>

                <div>
              
               </div>

               </DialogContent>
               
               </Dialog>
    )
}