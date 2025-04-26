import { ArrowUUpLeft, FileCsv, FileXls, Upload } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCallback, useContext, useState } from "react";
import { toast } from "sonner"
import { UserContext } from "../../context/context";
import * as XLSX from 'xlsx';
import {useDropzone} from 'react-dropzone'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

import {
  Sheet,
  SheetContent,

} from "../../components/ui/sheet"
import { LoaderCircle, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { DataTableModal } from "../componentsModal/data-table";
import { columnsPatrimonio } from "../componentsModal/columns-patrimonio";

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

export function ImportCsv() {
    const { onClose, isOpen, type: typeModal } = useModal();
    
    const isModalOpen = (isOpen && typeModal === 'import-csv')|| (isOpen && typeModal === 'import-csv-morto')

    const {urlGeral} = useContext(UserContext)
    const [fileInfo, setFileInfo] = useState({ name: '', size: 0 });

    const [data, setData] = useState<Patrimonio[]>([]);

    const onDrop = useCallback((acceptedFiles:any) => {
      handleFileUpload(acceptedFiles);
    }, []);
  
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
     
    });
  

  
    const [file, setFile] = useState<File | null>(null);

    const handleFileUpload = (files: any) => {
      const uploadedFile = files[0];
      if (uploadedFile) {
        setFile(uploadedFile); // salva o arquivo
        setFileInfo({
          name: uploadedFile.name,
          size: uploadedFile.size,
        });
      }
    };


   
  

    const [uploadProgress, setUploadProgress] = useState(false);



    const handleSubmitPatrimonio = async () => {
      try {
        if (!fileInfo.name) {
          toast("Erro: Nenhum arquivo selecionado", {
            description: "Por favor, selecione um arquivo .xls para enviar.",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
          return;
        }
    
        if (!file) {
          toast("Erro: Nenhum arquivo encontrado", {
            description: "Tente selecionar o arquivo novamente.",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
          return;
        }
    
        setUploadProgress(true);
    
        const formData = new FormData();
        formData.append('file', file); // 'file' é o nome que o servidor espera
    
        let urlPatrimonioInsert = `${urlGeral}insertPatrimonio`;
    
        const response = await fetch(urlPatrimonioInsert, {
          method: 'POST',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'multipart/form-data'
          },
          body: formData,
        });
    
        if (response.ok) {
          toast("Arquivo enviado com sucesso", {
            description: "O arquivo foi enviado para o servidor.",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });

        } else {
          toast("Erro no envio", {
            description: "O servidor retornou um erro.",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
        }
    
        setFile(null);
        setFileInfo({ name: '', size: 0 });
        setUploadProgress(false);
    
      } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        toast("Erro ao processar a requisição", {
          description: "Tente novamente mais tarde.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
        setUploadProgress(false);
      }
    };

    console.log(data)
  
    return(
      <Sheet open={isModalOpen} onOpenChange={onClose}>
      <SheetContent className={`p-0 dark:bg-neutral-900 dark:border-gray-600 min-w-[50vw]`}>
      <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-b-neutral-600">

<div className="flex items-center gap-3">
<TooltipProvider>
<Tooltip>
<TooltipTrigger asChild>
<Button className="h-8 w-8" variant={'outline'}  onClick={() => onClose()} size={'icon'}><X size={16}/></Button>
</TooltipTrigger>
<TooltipContent> Fechar</TooltipContent>
</Tooltip>
</TooltipProvider>

<div className="flex ml-auto items-center w-full justify-between">

 <div className="flex ml-auto items-center gap-3">


    </div>
</div>

</div>

</DialogHeader>

<ScrollArea className="relative pb-4 whitespace-nowrap h-[calc(100vh-50px)] p-8 ">
        <div className="mb-8">
                      <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                      Patrimômio
                        </p>

                        <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                          {typeModal == 'import-csv' ? ('Atualizar patrimônios'):('Importar patrimônios baixados')}
                        </h1>
                        
                      </div>

               <div className="flex flex-1 flex-col ">
               <div {...getRootProps()} className="border-dashed h-full mb-3 flex-col border border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm  cursor-pointer transition-all gap-3  w-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 mt-4">
                        <input {...getInputProps()} />
                        <div className="p-4  border rounded-md">
                            <FileXls size={24} className=" whitespace-nowrap" />
                        </div>
                        {isDragActive ? (
                            <p>Solte os arquivos aqui ...</p>
                        ) : (
                            <p>Arraste e solte o arquivo .xls aqui ou clique para selecionar o arquivo</p>
                        )}
                    </div>

    <div >
    {fileInfo.name && (
                            <div className="justify-center flex items-center gap-3">
                                <FileXls size={16} />
                                <p className=" text-center  text-zinc-500 text-sm">
                                    Arquivo selecionado: <strong>{fileInfo.name}</strong> ({(fileInfo.size / 1024).toFixed(2)} KB)
                                </p>
                            </div>
                        )}
    </div>


<div className="flex items-center justify-between">
    <div className="text-sm font-gray-500">
    {uploadProgress ? ('Isso pode demorar bastante, não feche a página.'):('')}
    </div>
<Button onClick={() => handleSubmitPatrimonio()} className="ml-auto flex mt-3">
                        {uploadProgress ? (<LoaderCircle size={16} className="an animate-spin" />):(<Upload size={16} className="" />)}  {uploadProgress ? ('Atualizando dados'):('Atualizar dados')} 
                    </Button>

</div>
               </div>

</ScrollArea>
               <DialogFooter>
                <Button onClick={() => onClose()} variant={'ghost'}><ArrowUUpLeft size={16} className="" />Cancelar</Button>
            

                </DialogFooter>

    

               </SheetContent>
               </Sheet>
    )
}