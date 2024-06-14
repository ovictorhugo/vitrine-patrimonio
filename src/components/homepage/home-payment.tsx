import { ArrowLeft } from "phosphor-react";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowRight } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "../../context/context";

export function HomePayment() {
    const { isOpen, type, onOpen } = useModalHomepage();


    const isModalOpen = isOpen && type === "payment-home";
    const {loggedIn} = useContext(UserContext)
    return(
        <>
        {isModalOpen && (
            <div className="h-screen w-full py-20 mx-16">
                <div className="justify-between flex flex-col w-full h-full">
                
                <div className="flex items-center gap-3 font-medium text-gray-500">
                    <Button variant={'ghost'} size={'icon'}  onClick={() => loggedIn ? onOpen('initial-home') : onOpen('authentication-home')}> <ArrowLeft size={16}  /></Button>Fazer doação <Badge className="py-2 px-4 border text-gray-500 border-neutral-300 hover:bg-transparent bg-transparent">Passo 3 de 3</Badge>
                        </div>

            

                        <div className="flex items-center gap-3">
                <Button variant={'ghost'} onClick={() => loggedIn ? onOpen('initial-home') : onOpen('authentication-home')}>  <ArrowLeft size={16}  />Voltar</Button>
                  <Button >  <ArrowRight size={16}  />Continuar</Button>
                  </div>
                </div>
     
            </div>
        )}
        </>
    )
}