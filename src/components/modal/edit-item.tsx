import { Check, Wrench, X } from "lucide-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { DialogHeader } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Sheet, SheetContent } from "../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Alert } from "../ui/alert";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checks, Warning } from "phosphor-react";
import { useState } from "react";

export function EditItem() {
    const { onClose, isOpen, type: typeModal } = useModal();

      const [condicao, setCondicao] = useState("");
      const [descricao, setDescricao] = useState("");
       const [relevance, setRelevance] = useState(false);
        const [desfazimento, setDesfazimento] = useState(false);
    
    const isModalOpen = (isOpen && typeModal === 'edit-item')

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
                      <SelectItem value="Em boas condições">
                          <div className="flex items-start gap-3 text-muted-foreground ">
                            <Checks className="size-5" />
                            <div className="grid gap-0.5 ">
                              <p>
                                Em boas condições
                              </p>
                              <p className="text-xs" data-description>
                                Não necessita de qualquer tipo de reparo
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Semi-novo ou em excelente estado ">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Check className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                              Semi-novo ou em excelente estado 

                              </p>
                              <p className="text-xs" data-description>
                              possui todos acessórios necessários para uso (se tiver ou não )
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Semi-novo">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Warning className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                              Semi-novo
                              </p>
                              <p className="text-xs" data-description>
                                mas e necessário algum acessório para o completo uso
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
                                The most powerful model for complex
                                computations.
                              </p>
                            </div>
                          </div>
                        </SelectItem>

                        <SelectItem value="Sem condição de uso">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <X className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                               Sem condição de uso
                              </p>
                              <p className="text-xs" data-description>
                                The most powerful model for complex
                                computations.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  </CardContent>
                </Alert>
                </div>


                </ScrollArea>
    </SheetContent>
    </Sheet>
    )
}