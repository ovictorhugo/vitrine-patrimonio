import { useContext } from "react";
import { UserContext } from "../../context/context";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { TicketCount } from "../homepage/donation/ticket-count";
import { UserInformation } from "../homepage/donation/user-information";
import { ArrowLeft, ArrowRight } from "phosphor-react";



export function Cartao() {
    const { isOpen, type, onOpen } = useModalHomepage();
    const isModalOpen = isOpen && type === 'cartao';
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
                <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Pagamento com cartão</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-[550px]">Ao selecionar "Concordar e Assinar", você concorda em iniciar a assinatura imediatamente e que o pagamento mensal não é reembolsável. Cobraremos a mensalidade padrão de forma recorrente na sua forma de pagamento cadastrada. Você pode cancelar quando quiser e o cancelamento entrará em vigor no final do período de cobrança. ATENÇÃO: no caso de cartões múltiplos (crédito/débito), a cobrança será na função crédito.</p>
                    
                    <form id="form-checkout">
    <div id="form-checkout__cardNumber" className="container"></div>
    <div id="form-checkout__expirationDate" className="container"></div>
    <div id="form-checkout__securityCode" className="container"></div>
    <input type="text" id="form-checkout__cardholderName" />
    <select id="form-checkout__issuer"></select>
    <select id="form-checkout__installments"></select>
    <select id="form-checkout__identificationType"></select>
    <input type="text" id="form-checkout__identificationNumber" />
    <input type="email" id="form-checkout__cardholderEmail" />

    <button type="submit" id="form-checkout__submit">Pagar</button>
    <progress value="0" className="progress-bar">Carregando...</progress>
  </form>

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