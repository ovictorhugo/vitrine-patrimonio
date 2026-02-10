import { useModal } from "../hooks/use-modal-store";
import { Sheet, SheetContent } from "../../components/ui/sheet";
import { Bug, Megaphone, Send, X } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertDescription, AlertTitle } from "../ui/alert";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useContext, useState } from "react";
import { UserContext } from "../../context/context";
import { Textarea } from "../ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Separator } from "../ui/separator";
import { ArrowUUpLeft } from "phosphor-react";

export function RelatarBug() {
    const { onClose, isOpen, type: typeModal } = useModal();
    const { user, loggedIn, urlGeral} = useContext(UserContext)
    const isModalOpen = (isOpen && typeModal === "relatar-problema")

    const history = useNavigate();

    const location = useLocation();
    const navigate = useNavigate();



    const close = () => {

        onClose()
    }

    const [nome, setNome] = useState(loggedIn ? (user?.username) : (''))
    const [email, setEmail] = useState(loggedIn ? (user?.email) : (''))
    const [avaliacao, setAvaliacao] = useState(0)
    const [descricao, setDescricao] = useState('')

    const handleSubmit = async () => {
        try {
            const data =
            {
                name: nome,
                email: email,
                rating: avaliacao,
                description: descricao
            }

            if (!nome) {
                toast("Erro ao enviar", {
                    description: "O campo Nome é obrigatório.",
                    action: {
                        label: "Fechar",
                        onClick: () => console.log("Fechar"),
                    },
                });
                return;
            }

            if (!email) {
                toast("Erro ao enviar", {
                    description: "O campo E-mail é obrigatório.",
                    action: {
                        label: "Fechar",
                        onClick: () => console.log("Fechar"),
                    },
                });
                return;
            }

            if (!avaliacao) {
                toast("Erro ao enviar", {
                    description: "O campo Avaliação é obrigatório.",
                    action: {
                        label: "Fechar",
                        onClick: () => console.log("Fechar"),
                    },
                });
                return;
            }

            if (!descricao) {
                toast("Erro ao enviar", {
                    description: "O campo Descrição é obrigatório.",
                    action: {
                        label: "Fechar",
                        onClick: () => console.log("Fechar"),
                    },
                });
                return;
            }

            if (!nome || !email || !avaliacao || !descricao) {
                toast("Erro ao enviar", {
                    description: "Por favor, preencha todos os campos.",
                    action: {
                        label: "Fechar",
                        onClick: () => console.log("Fechar"),
                    },
                });
                return; // Impede que o código continue
            }


            let urlProgram = urlGeral + 'feedback/'

            const token = localStorage.getItem('jwt_token');
            const fetchData = async () => {

                try {
                    const response = await fetch(urlProgram, {
                        mode: 'cors',
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
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
                            description: "Agradecemos o feedback",
                            action: {
                                label: "Fechar",
                                onClick: () => console.log("Undo"),
                            },
                        })

                        onClose()

                    } else {

                        toast("Tente novamente!", {
                            description: "Não conseguimos adiciona seu feedback",
                            action: {
                                label: "Fechar",
                                onClick: () => console.log("Undo"),
                            },
                        })
                    }

                } catch (err) {
                    console.error(err);
                }
            };
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
    };




    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
              Feedback
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
        Compartilhe sua opinião sobre a plataforma — elogios, sugestões ou relatos de erros. Sua colaboração é fundamental para continuarmos evoluindo!
          </DialogDescription>
        </DialogHeader>


  
                            <Separator className="" />
                <div>
                    <div className="">
              

                        <div className="flex flex-col w-full">
                         

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex flex-col gap-2 w-full md:w-1/2">
                                    <Label>Nome completo*</Label>
                                    <Input className="w-full" disabled={loggedIn} value={nome} onChange={(e) => setNome(e.target.value)} type="text" />
                                </div>

                                <div className="flex flex-col gap-2 w-full md:w-1/2">
                                    <Label>Email*</Label>
                                    <Input className="w-full" disabled={loggedIn} value={email} defaultValue={loggedIn ? (user?.email) : ('')} onChange={(e) => setEmail(e.target.value)} type="text" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mt-4 ">
                                <Label>Avaliação do sistema*</Label>
                                <ToggleGroup onValueChange={(value) => setAvaliacao(Number(value))} type="single" variant={'outline'} className="grid grid-cols-5 md:flex md:flex-wrap gap-3">
                                    {Array.from({ length: 10 }, (_, index) => (
                                        <ToggleGroupItem className="flex flex-1" key={index + 1} value={`${index + 1}`}>
                                            {index + 1}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>

                            </div>

                            <div className="flex flex-col gap-2 mt-4 ">
                                <Label>Comentário*</Label>
                                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                            </div>

                        </div>
                    </div>
                </div>

                 <DialogFooter>

                           <Button onClick={onClose} variant={"ghost"}>
            <ArrowUUpLeft size={16} /> Cancelar
          </Button>

                      <Button onClick={() => handleSubmit()}  className=" ">
                                <Send size={16} className="" />Enviar avaliação
                            </Button>
                 </DialogFooter>
             </DialogContent>
    </Dialog>
    )
}