import { SignIn, UserPlus, Detective } from "phosphor-react";
import { TicketCount } from "../homepage/donation/ticket-count";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export function EscolherValores() {
    const { isOpen, type, onOpen } = useModalHomepage();
    const isModalOpen = isOpen && type === 'doacao';
    return(
        <>
        {isModalOpen && (
             <div className="h-screen w-full flex items-center mx-16 relative">
                <TicketCount/>
                

                <div className="ml-8">
                <Badge className="py-2 px-4 border text-gray-500 border-neutral-300 hover:bg-transparent bg-transparent mb-2">Passo 2 de 3</Badge>
                <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Faça login ou continue como anônimo para prosseguir.</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-[550px] min-w-[450px]">Com doações de qualquer valor, podem fazem a diferença, possibilitando que a Fump continue apoiando os estudantes e promovendo projetos acadêmicos e sociais.</p>

                    <div className="flex gap-3 items-center max-w-[550px]">
                    <Link to={'/doacao/signIn'}><Button ><SignIn size={16} className="" />Fazer login</Button></Link>
                        <Link to={'/doacao/signUp'}><Button ><UserPlus size={16} className="" />Criar conta</Button></Link>

                        ou

                       <Link to={'/doacao/assinatura'}> <Button variant={'outline'} ><Detective size={16} className="" />Continuar como anônimo</Button></Link>
                    </div>
                </div>
             </div>
        )}
        </>
    )
}