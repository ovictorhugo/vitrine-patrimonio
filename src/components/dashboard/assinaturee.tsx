import { ArrowLeft, ArrowRight, Check, ChevronLeft, File } from "lucide-react";
import { Button } from "../ui/button";

import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import { Tabs, TabsContent, TabsList } from "../ui/tabs";
import { useDropzone } from "react-dropzone";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { LinhaTempo } from "./components/linha-tempo";

export function Assinaturee() {

    const history = useNavigate();

    const handleVoltar = () => {
      history(-3);
    };

    const [tab, setTab] = useState('1')

    const [fileInfo, setFileInfo] = useState({ name: '', size: 0, pdfBase64: '', pdfSigned: '' });

    const onDrop = useCallback((acceptedFiles: any) => {
        handleFileUpload(acceptedFiles);
    }, []);
  
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });
  
    const handleFileUpload = (files: any) => {
        const uploadedFile = files[0];
        if (uploadedFile) {
            const reader = new FileReader();
            reader.readAsDataURL(uploadedFile);
            reader.onloadend = () => {
                const base64data = reader.result;
                setFileInfo({
                    name: uploadedFile.name,
                    size: uploadedFile.size,
                    pdfBase64: base64data, // Adicione aqui para exibir
                    pdfSigned: '' // Inicie sem o PDF assinado
                });
            };
        }
    };

    return(
        <main className="flex flex-1 flex-col ">
             <div className="gap-4 flex w-full flex-col p-4 md:gap-8 md:p-8 ">
             <div className="  gap-4">
            <div className="flex items-center gap-4">
         
           <Button  onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
               Assinatura de documento
              </h1>
           
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button variant="outline" size="sm">
                  Discard
                </Button>
                <Button size="sm"><Check size={16} />Publicar item</Button>
              </div>
            </div>

            </div>

            <div className="">
                <LinhaTempo
                links={[
                    {
                        title:'Escolher arquivo',
                        selected:tab == '1'? true : false
                    },
                    {
                        title:'Assinar arquivo',
                        selected:tab == '2'? true : false
                    },
                    {
                        title:'Baixar arquivo',
                        selected:(tab ==  '3') ? true : false
                    }
                ]}
                />
            </div>

             </div>

           <div className="gap-4 p-4 md:gap-8 md:p-8">
           <Tabs defaultValue={tab} value={tab} >
 
 <TabsContent value="1">
 <div className="">
               
                    {!fileInfo.name && (
                             <div {...getRootProps()} className="border-dashed mb-3 flex-col border border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm  cursor-pointer transition-all gap-3 h-[300px] w-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 ">
                             <input {...getInputProps()} />
                             <div className="p-4  border rounded-md">
                                 <File size={24} className=" whitespace-nowrap" />
                             </div>
                             {isDragActive ? (
                                 <p>Solte os arquivos aqui ...</p>
                             ) : (
                                 <p>Arraste e solte o arquivo .xls aqui ou clique para selecionar o arquivo</p>
                             )}
                         </div>
                       )}

                

                   <div>
                       {fileInfo.name && (
                           <div className="justify-center flex items-center gap-3">
                               <File size={16} />
                               <p className=" text-center  text-zinc-500 text-sm">
                                   Arquivo selecionado: <strong>{fileInfo.name}</strong> ({(fileInfo.size / 1024).toFixed(2)} KB)
                               </p>
                           </div>
                       )}
                   </div>

                    {/* Exibir o PDF */}
           {fileInfo.pdfBase64 && (
               <div className="pdf-viewer">
                   <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.2.146/build/pdf.worker.min.js`}>
                       <div style={{ height: '500px' }}>
                           <Viewer fileUrl={fileInfo.pdfBase64} />
                       </div>
                   </Worker>
               </div>
           )}


                   {fileInfo.name && (
                          <div className="flex justify-between items-center">
                           <Button variant={'ghost'} onClick={() => {
                               setFileInfo({ name: '', size: 0 })
                           }}><ArrowLeft size={16}/>Voltar</Button>
                           <Button onClick={() => setTab('2')}><ArrowRight size={16}/>Continuar</Button>
                          </div>
                       )}
               </div>
 </TabsContent>

 <TabsContent value="2">
 {fileInfo.name && (
                          <div className="flex justify-between items-center">
                           <Button variant={'ghost'} onClick={() => setTab('1')}><ArrowLeft size={16}/>Voltar</Button>
                           <Button onClick={() => setTab('3')}><ArrowRight size={16}/>Continuar</Button>
                          </div>
                       )}
 </TabsContent>

 <TabsContent value="3">
 {fileInfo.name && (
                          <div className="flex justify-between items-center">
                           <Button variant={'ghost'} onClick={() => setTab('2')}><ArrowLeft size={16}/>Voltar</Button>
                           <Button ><ArrowRight size={16}/>Continuar</Button>
                          </div>
                       )}
 </TabsContent>

</Tabs>
           </div>


        </main>
    )
}