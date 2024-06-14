import { useContext } from "react";
import { UserContext } from "../../context/context";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { TicketCount } from "../homepage/donation/ticket-count";
import { UserInformation } from "../homepage/donation/user-information";
import { ArrowLeft, ArrowRight } from "phosphor-react";

export function Pix() {
    const { isOpen, type, onOpen } = useModalHomepage();
    const isModalOpen = isOpen && type === 'pix';
    const {loggedIn, doacao, planosSelecionados, setPlanosSelecionados} = useContext(UserContext)
    return(
        <>
        {isModalOpen && (
             <div className="h-screen w-full flex items-center mx-16 relative">
                <div className="flex flex-col gap-3">
                <TicketCount/>
                {loggedIn && (
                    <UserInformation/>
                )}

              
                </div>
                

                <div className="ml-8 w-full ">
                <Badge className="py-2 px-4 border text-gray-500 border-neutral-300 hover:bg-transparent bg-transparent mb-2">Passo 2 de 3</Badge>
                <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Pagamento com Pix</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-[550px]">Com doações de qualquer valor, podem fazem a diferença, possibilitando que a Fump continue apoiando os estudantes e promovendo projetos acadêmicos e sociais.</p>
                    
                    

                    <div className="flex gap-3 mt-8">
                    <Link to={'/doacao/pagamento'}><Button variant={'outline'}  ><ArrowLeft size={16} />  Voltar</Button></Link>
                    <Link to={''}><Button  ><ArrowRight size={16} />  Continuar</Button></Link>
                    </div>
                </div>
             </div>
        )}
        </>
    )
}