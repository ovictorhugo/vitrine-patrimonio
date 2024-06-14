import { SignIn, UserPlus, Detective, ArrowRight, ArrowLeft } from "phosphor-react";
import { TicketCount } from "../homepage/donation/ticket-count";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { UserInformation } from "../homepage/donation/user-information";
import { useContext, useState } from "react";
import { UserContext } from "../../context/context";
import { Alert } from "../ui/alert";
import { AssinaturaInformation } from "../homepage/donation/assinatura-information";

export function EscolherAssinatura() {
    const { isOpen, type, onOpen } = useModalHomepage();
    const isModalOpen = isOpen && type === 'escolher-assinatura';
    const {loggedIn, doacao, planosSelecionados, setPlanosSelecionados} = useContext(UserContext)
    const [planos, setPlanos] = useState([
        {id:1},
        {id:3},
        {id:6},
        {id:12},
        {id:13}
    ])
   
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
                

                <div className="ml-8 w-full">
                <Badge className="py-2 px-4 border text-gray-500 border-neutral-300 hover:bg-transparent bg-transparent mb-2">Passo 2 de 3</Badge>
                <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Faça um plano de assinatura</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-[550px]">Com doações de qualquer valor, podem fazem a diferença, possibilitando que a Fump continue apoiando os estudantes e promovendo projetos acadêmicos e sociais.</p>

                    <div className="grid gap-3 grid-cols-3">
                       {planos.map((props) => {
                        return(
                            <Alert onClick={() => setPlanosSelecionados(props.id)} className={`w-full min-h-[140px] flex-col flex justify-between border-2 cursor-pointer  ${props.id == planosSelecionados && ('border-[#02A8A8]')}`}>
                          {props.id == 3 && (
                              <div className="bg-[#02A8A8] uppercase text-white text-xs font-medium w-fit p-1 px-2 absolute right-0 top-0 rounded-tr-md rounded-bl-md">Recomendado</div>
                          )}
                          <div>
                          {props.id == 13 ? (<div className="text-lg font-semibold">Plano vitalício</div>):(<div className="text-lg font-semibold">{props.id == 1 ? ('1 mês'):(`${props.id} meses`)}</div>)}
                            {props.id == 1 && (<p className="text-gray-500 text-xs">Pagamento único</p>)}
                            {props.id == 13 && (<p className="text-gray-500 text-xs">Cancele quando quiser</p>)}

                          </div>
                            <div>
                                <p className="text-xl font-medium">{props.id} x de R$ {doacao.toFixed(2)}</p>
                                <p className="text-gray-500">R$ {(doacao * props.id).toFixed(2)}</p>
                            </div>

                        </Alert>
                        )
                       })}
                    </div>

                    <div className="flex gap-3 mt-8">
                    <Link to={loggedIn ? ('/'):('/doacao')}><Button variant={'outline'}  ><ArrowLeft size={16} />  Voltar</Button></Link>
                    <Link to={'/doacao/pagamento'}><Button  ><ArrowRight size={16} />  Continuar</Button></Link>
                    </div>
                </div>
             </div>
        )}
        </>
    )
}