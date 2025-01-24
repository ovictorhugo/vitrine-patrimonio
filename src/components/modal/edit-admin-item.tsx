import { Barcode, Check, ChevronsUpDown, ImageDown, RefreshCcw, Trash, Upload, Wrench, X } from "lucide-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Sheet, SheetContent } from "../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checks, Funnel, MagnifyingGlass, Warning } from "phosphor-react";
import { useContext, useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { UserContext } from "../../context/context";
import { toast } from "sonner"
import { Switch } from "../ui/switch";

export function EditAdminItem() {
    const { data, onClose, isOpen, type: typeModal } = useModal();

     const {user, urlGeral} = useContext(UserContext)
    const[locState, setLocState] = useState(true)

  

    let urlLocNom = `${urlGeral}AllLocNom`;

      const [condicao, setCondicao] = useState(data.condicao);
      const [descricao, setDescricao] = useState(data.observacao);
       const [relevance, setRelevance] = useState(data.vitrine);
       const [verificado, setVerificado] = useState(data.verificado);
        const [desfazimento, setDesfazimento] = useState(data.desfazimento);
    const [estadoTransferencia, setEstadoTransferencia] = useState(data.estado_transferencia)
    const isModalOpen = (isOpen && typeModal === 'edit-admin-item')

    const [openPopo, setOpenPopo] = useState(false)
      const [localizacao, setLocalizacao] = useState(data.loc)
    
   
    
      const handleRemoveImage = (index: number) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
      };
    
    //

    //images
    const [images, setImages] = useState<string[]>(data?.imagens ?? []);

const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (files) {
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setImages(prevImages => [...prevImages, ...newImages]);
  }
};


const [searchTerm, setSearchTerm] = useState('');

const normalizeString = (str:any) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};




///enviar

const newImageNames: string[] = [];

const handleSubmit = async () => {

  try {
    const dataPut = [
      {
        patrimonio_id:data.patrimonio_id,
        vitrine:relevance,
        desfazimento:desfazimento,
        verificado:verificado,
        estado_transferencia:estadoTransferencia
      }
    ]

    console.log(dataPut)

    let urlProgram = urlGeral + '/formulario'


    const fetchData = async () => {
    
   
      try {
       
        const response = await fetch(urlProgram, {
          mode: 'cors',
          method: 'PUT',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataPut),
        });

        if (response.ok) {
         
          toast("Dados atualizados com sucesso", {
              description: "Item atualizado no Vitrine",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            })

         
        } else {
          console.error('Erro ao enviar dados para o servidor.');
          toast("Tente novamente!", {
              description: "Tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            })
        }
        
      } catch (err) {
        console.log(err);
      } 
     }

    fetchData();


  } catch (error) {
      toast("Erro ao processar requisição", {
          description: "Tente novamente",
          action: {
            label: "Fechar",
            onClick: () => console.log("Undo"),
          },
        })
  }
}

 // Constante para armazenar os nomes gerados
//imagemns



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
                      Patrimônio - ({data.bem_cod} - {data.bem_dgv})
                        </p>

                        <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                         Editar cadastro do item
                        </h1>
                        
                      </div>
                <div className="flex flex-col gap-8">
               

              
                 <Alert className="p-0">
                 <CardHeader>
                     <CardTitle>Destinação do item</CardTitle>
                     <CardDescription>
                      jsdfgsdfgsdfg
                     </CardDescription>
                   </CardHeader>
                   <CardContent className="flex flex-col gap-4">
                     <div className="">
                     <div className="grid gap-3 w-full">
                         <Label htmlFor="name">Alocação no Vitrine (sala 4301)</Label>
                         <CardDescription>
                       Caso haja a disponibilidade, gostaria que o item seja guardado na sala física do Vitrine?
                     </CardDescription>
                         <div className="flex gap-2 items-center ">
             <Switch checked={relevance} onCheckedChange={(e) => {
               setRelevance(e)
               setDesfazimento(false)
             }} />
             <p className="text-sm">{relevance ? "Sim, preciso da alocação" : "Não, não preciso"} </p>
           </div>
                       </div>
                     
                     </div>
 
                     <div className="">
                     <div className="grid gap-3 w-full">
                         <Label htmlFor="name">Desfazimento</Label>
                         <CardDescription>
                     Este é um item elegível para o desfazimento?
                     </CardDescription>
                         <div className="flex gap-2 items-center ">
             <Switch disabled={relevance} checked={desfazimento} onCheckedChange={(e) => setDesfazimento(e)} />
             <p className="text-sm">{desfazimento ? "Não, não preciso" : "Sim, preciso da alocação"} </p>
           </div>
                       </div>
                     
                     </div>
                   </CardContent>
                 </Alert>

                 <Alert className="p-0">
                 <CardHeader>
                     <CardTitle>Validação na plataforma</CardTitle>
                     <CardDescription>
                      jsdfgsdfgsdfg
                     </CardDescription>
                   </CardHeader>
                   <CardContent className="flex flex-col gap-4">
                     <div className="">
                     <div className="grid gap-3 w-full">
                        
                         <div className="flex gap-2 items-center ">
             <Switch checked={verificado} onCheckedChange={(e) => {
               setVerificado(e)
               
             }} />
             <p className="text-sm">{verificado ? "Item na plataforma" : "Esperando aprovação"} </p>
           </div>
                       </div>
                     
                     </div>
 
                    
                   </CardContent>
                 </Alert>


                 <Alert className="p-0">
                 <CardHeader>
                     <CardTitle>Estado de transferência</CardTitle>
                     <CardDescription>
                      jsdfgsdfgsdfg
                     </CardDescription>
                   </CardHeader>
                   <CardContent className="flex flex-col gap-4">
                     <div className="">
                     <Select value={estadoTransferencia}  onValueChange={(value) => setEstadoTransferencia(value)}>
            <SelectTrigger className="w-full">
                <SelectValue  />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="NÃO VERIFICADO">Não veridicado</SelectItem>
                <SelectItem value="EM ANDAMENTO">Em andamento</SelectItem>
                <SelectItem value="CONCLUÍDO">Concluído</SelectItem>
                <SelectItem value="RECUSADO">Recusado</SelectItem>

            </SelectContent>
            </Select>
                     
                     </div>
 
                    
                   </CardContent>
                 </Alert>
            



    <div className="flex justify-end">
      <Button onClick={handleSubmit }><RefreshCcw size={16}/> Atualizar item</Button>
    </div>

    
                </div>


                </ScrollArea>
    </SheetContent>
    </Sheet>
    )
}