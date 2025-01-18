import { Barcode, Check, ChevronsUpDown, ImageDown, Upload, Wrench, X } from "lucide-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Sheet, SheetContent } from "../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checks, MagnifyingGlass, Warning } from "phosphor-react";
import { useContext, useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { UserContext } from "../../context/context";
import { toast } from "sonner"

export function EditItem() {
    const { data, onClose, isOpen, type: typeModal } = useModal();
     const [locNomLista, setLocNomLista] = useState<loc_nom[]>([]);
     const {user, urlGeral} = useContext(UserContext)
    const[locState, setLocState] = useState(true)

    useEffect(() => {   
      const fetchDataLocNom = async () => {
        try {
         
          const response = await fetch( urlLocNom, {
            mode: "cors",
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Max-Age": "3600",
              "Content-Type": "text/plain",
            },
          });
          const data = await response.json();
          if (data) {
            setLocNomLista(data);
         
          } else {
            toast("Erro: Nenhum patrimônio encontrado", {
              description: "Revise o número",
              action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
              },
            });
          }
        } catch (err) {
          console.log(err);
        }
      };
  
      fetchDataLocNom()
    }, []);

    let urlLocNom = `${urlGeral}AllLocNom`;

      const [condicao, setCondicao] = useState("");
      const [descricao, setDescricao] = useState("");
       const [relevance, setRelevance] = useState(false);
        const [desfazimento, setDesfazimento] = useState(false);
    
    const isModalOpen = (isOpen && typeModal === 'edit-item')

    const [openPopo, setOpenPopo] = useState(false)
      const [localizacao, setLocalizacao] = useState("")
    
      useEffect(() => {   
       if(localizacao.length == 0 && patrimonio.length > 0) {
        setLocalizacao(patrimonio[0].loc_nom)
       }
          }, [patrimonio]);
    
      const handleRemoveImage = (index: number) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
      };
    
    //

    //images
const [images, setImages] = useState<string[]>([]);

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

const filteredList = locNomLista.filter((framework) =>
  normalizeString(framework.loc_nom).includes(normalizeString(searchTerm))
);


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
                      Patrimonio - 
                        </p>

                        <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                         Editar cadastro do item
                        </h1>
                        
                      </div>
                <div className="">
                <Alert className="p-0">
                <CardHeader>
                    <CardTitle>Condição do item</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="">
                    <Select value={condicao} onValueChange={(value) => setCondicao(value)}>
                      <SelectTrigger
                        id="model"
                        className="items-start [&_[data-description]]:hidden"
                      >
                        <SelectValue placeholder="Selecione a condição do bem" className={'whitespace-nowrap'} />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="Excelente estado">
                          <div className="flex items-start gap-3 text-muted-foreground ">
                            <Checks className="size-5" />
                            <div className="grid gap-0.5 ">
                              <p>
                              Excelente estado
                              </p>
                              <p className="text-xs" data-description>
                              Como novo. Inclui caixa original e todos os acessórios.

                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Semi-novo">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Check className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                              Semi-novo 

                              </p>
                              <p className="text-xs" data-description>
                              Em excelente estado, mas apresenta sinais de uso.

                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Quase novo">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Warning className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                              Quase novo
                              </p>
                              <p className="text-xs" data-description>
                              Funcional, mas falta cabos ou periféricos para uso pleno.

                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Necessita de pequenos reparos">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Wrench className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Necessita de pequenos reparos
                              </p>
                              <p className="text-xs" data-description>
                              Funciona, mas exige reparos que não comprometem totalmente seu uso.

                              </p>
                            </div>
                          </div>
                        </SelectItem>

                        <SelectItem value="Inutilizável">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <X className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                              Inutilizável
                              </p>
                              <p className="text-xs" data-description>
                              Sem condições de uso
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  </CardContent>
                </Alert>


                <Alert className="p-0">
      <CardHeader>
        <CardTitle>Imagens do item</CardTitle>
        <CardDescription>
        <Accordion type="single" collapsible>
  <AccordionItem value="item-1" className="border-none">
    <AccordionTrigger className="border-none">Instruções</AccordionTrigger>
    <AccordionContent>
    <Alert className="p-0 pl-4 border-none my-4">
                  <ImageDown className="h-4 w-4" />
                  <AlertTitle>Passo 1</AlertTitle>
                  <AlertDescription>Imagem frontal do patrimônio
                  </AlertDescription>
                </Alert>

                <Alert className="p-0 pl-4 border-none my-4">
                  <Barcode className="h-4 w-4" />
                  <AlertTitle>Passo 2</AlertTitle>
                  <AlertDescription>Imagem com a idetificação do item</AlertDescription>
                </Alert>

                <Alert className="p-0 pl-4 border-none my-4">
                  <Warning className="h-4 w-4" />
                  <AlertTitle>Passo 3</AlertTitle>
                  <AlertDescription>
                    Imagem lateral ou traseira
                  </AlertDescription>
                </Alert>

                <Alert className="p-0 pl-4 border-none my-4">
                  <Warning className="h-4 w-4" />
                  <AlertTitle>Passo 4</AlertTitle>
                  <AlertDescription>
                    Imagem com detalhe da condição
                  </AlertDescription>
                </Alert>
    </AccordionContent>
  </AccordionItem>
</Accordion>
       
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
         <div>
        {images.length == 0 ? (
          <div className="aspect-square w-full rounded-md object-cover border " >

          </div>
        ):(
          <div className="flex items-center justify-center group">
          <img
           
          className="aspect-square w-full rounded-md object-cover"
          height="300"
          src={images[0] || "/placeholder.svg"}
          width="300"
        />
        <Button onClick={() => handleRemoveImage(0)} variant={'destructive'} className="absolute z-[9] group-hover:flex hidden transition-all" size={'icon'}><Trash size={16}/></Button>
          </div>
        )}
         </div>
          <div className="grid grid-cols-3 gap-2">
            {images.slice(1, 4).map((image, index) => (
              <button key={index}>
              <div className="flex items-center justify-center group">
               <img
                
                className="aspect-square w-full rounded-md object-cover"
                height="84"
                src={image}
                width="84"
              />
                <Button onClick={() => handleRemoveImage(index+1)} variant={'destructive'} className="absolute z-[9] group-hover:flex hidden transition-all" size={'icon'}><Trash size={16}/></Button>
               </div>
             
              </button>
            ))}
            {images.length < 4 && (
              <button className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="upload"
                />
                <label htmlFor="upload" className="cursor-pointer w-full h-full flex items-center justify-center">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Upload</span>
                </label>
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Alert>

    <Alert  className="p-0" x-chunk="dashboard-01-chunk-4" >
                <CardHeader>
                    <CardTitle>Detalhes do item</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-6">
                     <div className={`grid gap-6 w-full  sm:grid-cols-2 grid-cols-1 ${typeCod == 'scod' ? ('md:grid-cols-3'):('')}`}>
                     <div className="grid gap-3 w-full ">
                        <Label htmlFor="name">Tipo do código</Label>
                        <Select defaultValue={typeCod} value={typeCod} onValueChange={(value) => setTypeCod(value)}>
                            <SelectTrigger className="">
                              <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value={'atm'}>Código ATM</SelectItem>
                            <SelectItem value={'cod'}>Número de patrimônio</SelectItem>
                            <SelectItem value={'scod'}>Sem código</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>

                      <div className="grid gap-3 w-full">
                      <Label htmlFor="name">Número do patrimônio</Label>
                     <div className="flex items-center gap-3">
                     <Input
                        id="name"
                        type="text"
                        className="w-ful"
                       
                        
                        disabled
                        />

                      <Button className="min-w-10" size={'icon'} onClick={onClickBuscaPatrimonio}><Funnel size={16}/></Button>
                     </div>
                    </div>

                  

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Material</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
                          value={patrimonio.length > 0 ? patrimonio[0].mat_nom : ''}
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Condição do bem</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
                          value={patrimonio.length > 0 ? (patrimonio[0].csv_cod == "BM" ? 'Bom': patrimonio[0].csv_cod == 'AE' ? 'Anti-Econômico': patrimonio[0].csv_cod == 'IR' ? 'Irrecuperável': patrimonio[0].csv_cod == 'OC' ? 'Ocioso': patrimonio[0].csv_cod == 'BX' ? 'Baixado': patrimonio[0].csv_cod == 'RE' ? 'Recuperável': ''):''}
                        />
                      </div>

                     
                     </div>

                     <div className="flex gap-6">
                      {(patrimonio.length > 0 && patrimonio[0].bem_val.length > 0) && (
                        <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Valor</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
                          value={patrimonio.length > 0 ? parseFloat(patrimonio[0].bem_val) : ''}
                        />
                      </div>
                      ) }
                     

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Responsável</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
                          value={patrimonio.length > 0 ? patrimonio[0].pes_nome : ''}
                        />
                      </div>

                     </div>

                     <div className="flex gap-6">
                     <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Situação</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
                          value={patrimonio.length > 0 ? (patrimonio[0].bem_sta == "NO" ? ('Normal'):('Não encontrado no local de guarda')):''}
                        />
                      </div>

                      <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Localização</Label>
                        <div className="flex gap-3">
                        {locState ? (
                          <Input
                         
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
                          value={localizacao}
                        />
                        ):(
                          <Dialog open={openPopo} onOpenChange={setOpenPopo}>
                        <DialogTrigger className="w-full">
                        <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openPopo}
                              className="w-full justify-between"
                            >
                              {localizacao
                                ? locNomLista.find((framework) => framework.loc_nom === localizacao)?.loc_nom
                                : 'Selecione um local'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
    <DialogHeader>
      <DialogTitle>Escolher localização</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>

    <div className="border rounded-md px-6 h-12 flex items-center gap-1 border-neutral-200 dark:border-neutral-800">
                                <MagnifyingGlass size={16} />
                                <Input
                                  className="border-0"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  placeholder="Buscar localização"
                                />
                              </div>

                              <div className={'max-h-[350px] overflow-y-auto elementBarra'}>
                              
                              <div className="flex flex-col gap-1 p-2">
                                {filteredList.length > 0 ? (
                                  filteredList.map((props, index) => (
                                    <Button
                                      variant={'ghost'}
                                      key={index}
                                      className="text-left justify-start"
                                      onClick={() => {
                                        setLocalizacao(props.loc_nom);
                                        setLocState(true);
                                        setOpenPopo(false); // Fechar o popover após a seleção
                                      }}
                                    >
                                      {props.loc_nom}
                                    </Button>
                                  ))
                                ) : (
                                  <div>Nenhuma sala encontrada</div>
                                )}
                              </div>
                            </div>
  </DialogContent>

                        </Dialog>

                        )}

                       

                      
                           <div className="flex gap-3">
                           <Button onClick={() => setLocState(false)} variant="outline" size={'icon'}><X size={16} /></Button>
                             <Button onClick={() => setLocState(true)}  size={'icon'}><Check size={16} /></Button>
                             </div>
                       
                        </div>
                      </div>
                     </div>

                     <div className="grid gap-3 w-full">
                        <Label htmlFor="name">Descrição</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          disabled={typeCod != 'scod'}
                          value={patrimonio.length > 0 ? (localizacao.length > 0 ? localizacao : patrimonio[0].bem_dsc_com) : ''}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="description">Observações</Label>
                        <Textarea
                          id="description"
                          value={descricao} onChange={(e) => setDescricao(e.target.value)}
                          className="min-h-32"
                        />
                      </div>
                    </div>
                    
                  </CardContent>
                  </Alert>
                </div>


                </ScrollArea>
    </SheetContent>
    </Sheet>
    )
}