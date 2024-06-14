import { SignIn, UserPlus, Detective, ArrowRight, ArrowLeft, CreditCard, Barcode } from "phosphor-react";
import { TicketCount } from "../homepage/donation/ticket-count";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Link, useLocation } from "react-router-dom";
import { UserInformation } from "../homepage/donation/user-information";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Alert } from "../ui/alert";
import { QrCodePix } from 'qrcode-pix';
import { AssinaturaInformation } from "../homepage/donation/assinatura-information";
import {PaymentElement} from '@stripe/react-stripe-js';



import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "../ui/tabs"
import { Logo } from "../svg/logo";
import getStripe from "../../lib/getStripe";
import { Cartao } from "./cartao";
import { Pix } from "../svg/pix";

export function Pagamento() {
    const { isOpen, type, onOpen } = useModalHomepage();
    const isModalOpen = isOpen && type === 'pagamento';
    const {loggedIn, doacao, planosSelecionados, setPlanosSelecionados} = useContext(UserContext)

const [value, setValue] = useState('pix')
     // '00020101021126510014BR.GOV.BCB.PIX...'
    
   
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
                <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Escolha o método de pagamento</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-[550px]">Com doações de qualquer valor, podem fazem a diferença, possibilitando que a Fump continue apoiando os estudantes e promovendo projetos acadêmicos e sociais.</p>
                    
                    <div className="flex gap-3">
                    <Button  onClick={() => setValue('pix')} variant={value == 'pix' ? 'outline' : 'ghost'}>  Pix</Button>     
                    <Button onClick={() => setValue('cartao')} variant={value == 'cartao' ? 'outline' : 'ghost'}><CreditCard size={16}/>Cartão</Button>
                    <Button onClick={() => setValue('boleto')} variant={value == 'boleto' ? 'outline' : 'ghost'}><Barcode size={16}/>Boleto</Button>
                    </div>
                    

                    <div className="flex gap-3 mt-8">
                    <Link to={'/doacao/assinatura'}><Button variant={'outline'}  ><ArrowLeft size={16} />  Voltar</Button></Link>
                    <Link to={`/doacao/pagamento/${value}`}><Button  ><ArrowRight size={16} />  Continuar</Button></Link>
                    </div>
                </div>
             </div>
        )}
        </>
    )
}