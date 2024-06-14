import { SignUpModal } from "../authentication/signUpModal";
import { ContentFumpistas } from "../homepage/content-fumpistas";
import { TicketCount } from "../homepage/donation/ticket-count";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { Badge } from "../ui/badge";

export function CriarContaDonation() {
    const { isOpen, type, onOpen } = useModalHomepage();
    const isModalOpen = isOpen && type === 'criar-conta-donation'
    
    
    return(
        <>
        {isModalOpen && (
             <div className="h-screen w-full flex items-center mx-16 relative">
                 <div className="flex flex-col gap-3">
                <TicketCount/>
             

              
                </div>
                

                <div className="ml-8 relative">
                <Badge className="py-2 px-4 border text-gray-500 border-neutral-300 hover:bg-transparent bg-transparent mb-2">Passo 2 de 3</Badge>
                <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Criar conta</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-[400px]">Esta listagem inclui os estudantes que tiveram vínculo com a Fump até 2012 e possuem valores pendentes.</p>

              
                    <div className="max-w-[400px]">
                        <SignUpModal
                        route="/doacao/signIn"/>
                    </div>
               
                 
                </div>
             </div>
        )}
        </>
    )
}