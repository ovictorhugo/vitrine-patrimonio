import { SignInModal } from "../authentication/signInModal";
import { ContentFumpistas } from "../homepage/content-fumpistas";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { Badge } from "../ui/badge";

export function LoginFumpista() {
    const { isOpen, type, onOpen } = useModalHomepage();
    const isModalOpen = isOpen && type === 'login-fumpista'
    
    
    return(
        <>
        {isModalOpen && (
             <div className="h-screen w-full flex items-center mx-16 relative">
                <ContentFumpistas/>
                

                <div className="ml-8 ">
                <Badge className="py-2 px-4 border text-gray-500 border-neutral-300 hover:bg-transparent bg-transparent mb-2">Passo 2 de 3</Badge>
                <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Encontramos os seus dados, faça login para continuar</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-[400px]">Esta listagem inclui os estudantes que tiveram vínculo com a Fump até 2012 e possuem valores pendentes.</p>

                    <div className="max-w-[400px]">
                        <SignInModal
                        route="/dashboard"/>
                    </div>
               

               
                 
                </div>
             </div>
        )}
        </>
    )
}