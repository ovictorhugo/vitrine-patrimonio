import { useState } from "react";
import { useModal } from "../hooks/use-modal-store";
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
  } from "../ui/dialog";
  import { v4 as uuidv4 } from 'uuid';

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowUUpLeft, Plus, Upload } from "phosphor-react";
import { Button } from "../ui/button";
import { storage } from "../../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore,  collection, addDoc } from 'firebase/firestore';
import { Progress } from "../ui/progress";

export function AddBackground() {
    const { onClose, isOpen, type: typeModal } = useModal();
    const isModalOpen = isOpen && typeModal === 'add-background';

    const [titulo, setTitulo] = useState('');
    const [imgURL, setImgURL] = useState('');
    const [progress, setProgress] = useState(0);
    

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setSelectedFile(file);
  } else {
    return
  }
};

    const handleSubmit = async (event: any) => {
        try {
          event.preventDefault();
      
          if (!selectedFile) {
            toast("Por favor, selecione a imagem", {
              description: "Nenhuma imagem selecionada",
              action: {
                label: "Undo",
                onClick: () => console.log("Undo"),
              },
            })
            return;
          }
      
          const storageRef = ref(storage, `images/${selectedFile.name}`);
          const uploadTask = uploadBytesResumable(storageRef, selectedFile);
      
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(progress);
            },
            (error) => {
              alert(error);
               toast("Erro ao carregar imagem", {
                    description: "Tente novamente",
                    action: {
                      label: "Undo",
                      onClick: () => console.log("Undo"),
                    },
                  })
            },
            async () => {
              try {
                // Aguarde a obtenção da URL de download
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                
                // Atualize o estado com a URL da imagem
                setImgURL(url);
      
                // Aqui você pode adicionar a lógica para tratar os tipos de programa selecionados
                // programTypes é um array com os tipos selecionados
                const docId = uuidv4();
                
                // Crie um objeto com os dados do formulário
                const formData = {
                  id: docId,
                  titulo, 
                  imgURL: url,
                };
      
                // Submeta os dados para o Firestore
               if( titulo != '' ) {
                const db = getFirestore();
                const programRef = collection(db, 'background');
                await addDoc(programRef, formData);
    
                toast("Enviado com sucesso!", {
                  description: "Adicionado ao banco de dados",
                  action: {
                    label: "Fechar",
                    onClick: () => console.log("Undo"),
                  },
                })
    
                  // Limpe os campos após a conclusão
                  setTitulo('');
                  setImgURL('');
                  setProgress(0);
                  onClose()
               } else {
                toast("Falta preencher algum dado", {
                  description: "Revise antes de enviar",
                  action: {
                    label: "Fechar",
                    onClick: () => console.log("Undo"),
                  },
                })
               }

      
              } catch (error) {
                console.error('Erro ao enviar os dados para o Firestore:', error);
              }
            }
          );
      
        } catch (error) {
          console.error('Erro ao enviar os dados:', error);
        }
      };


    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}> 
        <DialogContent className="min-w-[40vw] ">
        <DialogHeader className="pt-8 px-6">
                 <DialogTitle className="text-2xl text-center font-medium">
                 Adicionar background da página inicial
                 </DialogTitle>
                 <DialogDescription className="text-center text-zinc-500">
                 Adicione as informações básicas do programa de pós-graduação como o nome, classificação e modalidade.
                 </DialogDescription>
               </DialogHeader>

               <div>
               {!imgURL && <Progress value={progress} max={100} className="w-full  mb-4 h-2 color-gray-400"/>}
               <div className="flex flex-col space-y-1.5 w-full">
                <Label htmlFor="name">Título do background</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full" id="email" placeholder="Título do background" />
                </div>

                <div className="flex flex-col space-y-1.5 ">
            <label  htmlFor="fileInput"    className="h-10 bg-[#02A8A8] font-medium text-sm gap-3  transition-all cursor-pointer text-white rounded-md flex items-center whitespace-nowrap justify-center hover:bg-cyan-700 mt-3 w-full">
            <input hidden id="fileInput" type="file"  onChange={handleImageUpload} placeholder="Upload" />
                 <Upload size={16} className="" />Upload do arquivo
              </label>
           
            
            </div>
               </div>

               <DialogFooter>
                <Button onClick={() => onClose()} variant={'ghost'}><ArrowUUpLeft size={16} className="" />Cancelar</Button>
                <Button  onClick={handleSubmit}><Plus size={16} className="" />Publicar</Button>
                </DialogFooter>

               </DialogContent>
               
               </Dialog>
        
    )
}