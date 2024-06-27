import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import {useDropzone} from 'react-dropzone'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "../../components/ui/accordion"
import { PencilLine } from "lucide-react";
import { FilePdf } from "phosphor-react";
import { useCallback, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

  
export function InformacoesEmpenhos() {
    const { onClose, isOpen, type: typeModal, data } = useModal();
    
    const isModalOpen = (isOpen && typeModal === 'informacoes-empenhos')

    
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

      const [formData, setFormData] = useState([
        {
          sigla: '',
          nome: '',
          endereco: '',
          cep: '',
          cidade: '',
          cnpj: '',
          telefone: '',
          email: '',
          observacoes: ''
        }
      ]);

         // Função para atualizar um item específico no formData
  const updateItem = (index:any, field:any, value:any) => {
    const newFormData = formData.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData(newFormData);
  };

    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}> 
        <DialogContent className="min-w-[60vw] ">
        <DialogHeader className="pt-8 px-6 flex flex-col items-center">
                 <DialogTitle className="text-2xl text-center font-medium">
                Atualizar informações do empenho {data.emp_nom}
                 </DialogTitle>
                 <DialogDescription className="text-center text-zinc-500 ">
                 Atualize os itens do {typeModal == 'import-csv' ? ('patrimônio'):('patrimônio baixado')} na Vitrine com a planilha .xls gerada no SICPAT
                 </DialogDescription>
               </DialogHeader>

               <Tabs defaultValue="account" className="flex gap-3 items-center w-full" orientation='vertical'>
  <TabsList className="flex flex-col h-fit">
    <TabsTrigger className="h-10 rounded-md" value="account"><PencilLine size={16}/></TabsTrigger>
    <TabsTrigger className="h-10 rounded-md" value="password"><PencilLine size={16}/></TabsTrigger>
    <TabsTrigger className="h-10 rounded-md" value="pdf"><PencilLine size={16}/></TabsTrigger>
  </TabsList>
  <TabsContent value="account" className="w-full m-0">
  <Accordion type="single" collapsible className="w-full m-0">
  <AccordionItem value="item-1" className="m-0">
    <AccordionTrigger>Informações de controle</AccordionTrigger>
    <AccordionContent>
    <fieldset className="grid xl:col-span-2 gap-6 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 ">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Todos os fornecedores
                  </legend>
                  {formData.map((item, index) => (
                 <div className="flex flex-col gap-6">

                 <div className="flex w-full gap-6">
                <div className="grid gap-3 w-full">
                    <Label htmlFor="model">Nome do empenho</Label>
                    <Input name="sigla" value={item.sigla}
                    onChange={(e) => updateItem(index, 'sigla', e.target.value)} id="temperature" type="text" className="flex flex-1" />
                  </div>
                </div>
                 </div>
                   ))}
                </fieldset>
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionTrigger>Nota fiscal</AccordionTrigger>
    <AccordionContent>
    <fieldset className="grid xl:col-span-2 gap-6 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 ">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Todos os fornecedores
                  </legend>
                  <div {...getRootProps()} className="border-dashed  flex-col border-2 border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm  cursor-pointer transition-all gap-3  w-full flex items-center justify-center hover:bg-neutral-100 ">
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
                 
                  
                </fieldset>
    </AccordionContent>
  </AccordionItem>
</Accordion>
  </TabsContent>
  <TabsContent value="password">Change your password here.</TabsContent>
</Tabs>

              
               </DialogContent>
               </Dialog>
    )
}