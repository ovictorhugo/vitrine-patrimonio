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
  

  


      const handleFileUpload = (files:any) => {
        const uploadedFile = files[0];
        if (uploadedFile) {
          setFileInfo({
            name: uploadedFile.name,
            size: uploadedFile.size,
          });
          readExcelFile(uploadedFile);
        }
      };
  
    const readExcelFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
  
        // Convert the worksheet to JSON, starting from the third row
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
        // Extract headers from the first row
        const headers: string[] = json[0] as string[];
  
        // Remove the first row (headers themselves)
        const rows = json.slice(1);
  
        // Map headers to your interface keys
        const headerMap: { [key: string]: keyof Patrimonio } = {
          'bem_cod': 'bem_cod',
          'bem_dgv': 'bem_dgv',
          'bem_num_atm': 'bem_num_atm',
          'csv_cod': 'csv_cod',
          'bem_serie': 'bem_serie',
          'bem_sta': 'bem_sta',
          'bem_val': 'bem_val',
          'tre_cod': 'tre_cod',
          'bem_dsc_com': 'bem_dsc_com',
          'uge_cod': 'uge_cod',
          'uge_nom': 'uge_nom',
          'org_cod': 'org_cod',
          'uge_siaf': 'uge_siaf',
          'org_nom': 'org_nom',
          'set_cod': 'set_cod',
          'set_nom': 'set_nom',
          'loc_cod': 'loc_cod',
          'loc_nom': 'loc_nom',
          'ite_mar': 'ite_mar',
          'ite_mod': 'ite_mod',
          'tgr_cod': 'tgr_cod',
          'grp_cod': 'grp_cod',
          'ele_cod': 'ele_cod',
          'sbe_cod': 'sbe_cod',
          'mat_cod': 'mat_cod',
          'mat_nom': 'mat_nom',
          'pes_cod': 'pes_cod',
          'pes_nome': 'pes_nome'
        };
  
        // Convert rows to an array of objects
        const jsonData = rows.map((row: any) => {
          const obj: Patrimonio = {
            bem_cod: row[0] || "",
            bem_dgv: row[1] || "",
            bem_num_atm: row[2] || "",
            csv_cod: row[3] || "",
            bem_serie: row[4] || "",
            bem_sta: row[5] || "",
            bem_val: row[6] || "",
            tre_cod: row[7] || "",
            bem_dsc_com: row[8] || "",
            uge_cod: row[9] || "",
            uge_nom: row[10] || "",
            org_cod: row[11] || "",
            uge_siaf: row[12] || "",
            org_nom: row[13] || "",
            set_cod: row[14] || "",
            set_nom: row[15] || "",
            loc_cod: row[16] || "",
            loc_nom: row[17] || "",
            ite_mar: row[18] || "",
            ite_mod: row[19] || "",
            tgr_cod: row[20] || "",
            grp_cod: row[21] || "",
            ele_cod: row[22] || "",
            sbe_cod: row[23] || "",
            mat_cod: row[24] || "",
            mat_nom: row[25] || "",
            pes_cod: row[26] || "",
            pes_nome: row[27] || ""
          };
          headers.forEach((header, index) => {
            const key = headerMap[header];
            if (key) {
              obj[key] = row[index] || "";
            }
          });
          return obj;
        });
  
        setData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    };
  

    const [uploadProgress, setUploadProgress] = useState(false);



    const handleSubmitPatrimonio = async () => {
      try {
        if (data.length === 0) {
          toast("Erro: Nenhum arquivo selecionado", {
            description: "Por favor, selecione um arquivo csv para enviar.",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
          return;
        }
        setUploadProgress(true)
    
        let urlPatrimonioInsert = ``;

        if(typeModal == 'import-csv') {
          urlPatrimonioInsert = `${urlGeral}insertPatrimonio`;
        } else if(typeModal == 'import-csv-morto') {
          urlPatrimonioInsert = `${urlGeral}insertPatrimonioMorto`;
        }
    
        
          const response = await fetch(urlPatrimonioInsert, {
            mode: 'cors',
            method: 'POST',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Max-Age': '3600',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            toast("Dados enviados com sucesso", {
              description: "Todos os dados foram enviados.",
              action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
              },
            });
            setUploadProgress(false)
          }

        setData([])
        setFileInfo({
          name: '',
          size: 0,
        });
    
      } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        toast("Erro ao processar a requisição", {
          description: "Tente novamente mais tarde.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
        setUploadProgress(false)
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

               <div className="">
               <div {...getRootProps()} className="border-dashed mb-3 flex-col border border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm  cursor-pointer transition-all gap-3  w-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 mt-4">
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

    {data.length > 0 && (
                    <div className="">
                        <div className="my-6 border-b dark:border-b-neutral-800"></div>
                        <h5 className="font-medium text-xl mb-4">Tabela de dados</h5>
                    <DataTableModal columns={columnsPatrimonio} data={data} />
                    <div className="mt-2 mb-6 border-b dark:border-b-neutral-800"></div>

                    
                    </div>
                )}

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