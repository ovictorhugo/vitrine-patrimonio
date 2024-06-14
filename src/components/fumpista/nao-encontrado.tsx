import { ArrowRight, RadioButton } from "phosphor-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ContentFumpistas } from "../homepage/content-fumpistas";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { ArrowLeft } from "lucide-react";
import { Badge } from "../ui/badge";

export function NaoEncontradoFumpista() {
    const { isOpen, type, onOpen } = useModalHomepage();
    const isModalOpen = isOpen && type === 'nao-encontrado'
 
    
    return(
        <>
        {isModalOpen && (
             <div className="h-screen w-full flex items-center mx-16 relative">
                <ContentFumpistas/>
                
                    <div className="ml-8">
                    <Badge className="py-2 px-4 border text-gray-500 border-neutral-300 hover:bg-transparent bg-transparent mb-2">Passo 2 de 3</Badge>
                                    <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Não encontramos os seus dados, mas você pode fazer uma doação : )</h2>
                                        <p className="text-gray-500 text-sm mb-8 max-w-[550px]">Esta listagem inclui os estudantes que tiveram vínculo com a Fump até 2012 e possuem valores pendentes.</p>
                                        
                                        
                                        <div className="flex gap-3 mt-8">
                    <Link to={'/fumpista'}><Button variant={'outline'}  ><ArrowLeft size={16} />  Voltar</Button></Link>
                    <Link to={'/'}><Button ><ArrowRight size={16} />  Continuar</Button></Link>
                    </div>
                    </div>
               

               
                   
                </div>
             
        )}
        </>
    )
}