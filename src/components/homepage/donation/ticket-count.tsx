import { useContext, useState } from "react"
import { UserContext } from "../../../context/context"
import { Button } from "../../ui/button"
import { Check, PencilLine, QrCode } from "phosphor-react"
import { Input } from "../../ui/input"
import PixQrCodeGenerator from "../../donation/qrcode"
import { v4 as uuidv4 } from 'uuid'; // Import the uuid library
import { useLocation } from "react-router-dom"

export function TicketCount() {
    const {doacao, planosSelecionados, setDoacao} = useContext(UserContext)
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation();

    const uuid = uuidv4().replace(/[^a-zA-Z0-9]/g, '').substring(0, 15)
    
    return(
        <div className="min-h-[410px] w-[280px] flex flex-col relative">
            <div className="bg-[#A2D45E] text-white h-20 rounded-t-md flex items-center justify-center w-full font-medium uppercase">Seu ticket</div>
            <div className="h-full flex flex-1 flex-col bg-[#02A8A8] items-center ">
                <div className="justify-between w-full flex relative -top-4">
                <div className="h-8 w-4 rounded-r-full bg-neutral-50 "></div>
                    <div className="h-8 w-4 rounded-l-full bg-neutral-50 "></div>
                    
                </div>

                <div className=" rounded-md w-48 h-48 mb-10 mt-2 flex items-center justify-center relative">
                

        {location.pathname != '/doacao/pagamento/pix' ? (
            <div className="h-[190px] w-[190px] rounded-md flex items-center justify-center">
                <QrCode    size={200} className="text-white" />
            </div>
        ): (
<PixQrCodeGenerator
          chave="victorhugodejesusoliveira@gmail.com"
          name="Victor Hugo"
          city="Belo Horizonte"
          message={uuid}
        
          amount={doacao}

          isRecurrent={true}
        startDate="2024-06-01" // Data de início dos pagamentos recorrentes
        frequency="monthly" // Frequência dos pagamentos recorrentes (mensalmente)
        duration={planosSelecionados}
        />
        )}

                </div>
                <div className="w-full border border-dashed"></div>

               
            </div>

            <div className="rounded-b-md h-16 justify-center  flex flex-col bg-[#02A8A8] items-center ">
            
{isOpen ? (
    <div className="flex gap-3 items-center">
       {planosSelecionados != 1 && (
         <p className="font-medium uppercase  text-white">{planosSelecionados} x</p>
       )}
    <div className="flex">
        
                        <div className="h-10 bg-neutral-200 w-10 rounded-l-md flex items-center justify-center font-medium text-xs text-gray-600">R$</div>
                        <Input onChange={(e) => setDoacao(Number(e.target.value))} type="number" value={doacao} className="rounded-l-none w-16"/>
                    </div>
    <Check onClick={() => setIsOpen(false)}  size={16} className="text-white cursor-pointer" />
    </div>
):(
    <div className="flex gap-3 items-center">
    <p className="font-medium uppercase  text-white">{planosSelecionados == 1 ? (`R$ ${doacao.toFixed(2)}`):(`${planosSelecionados} x R$ ${doacao.toFixed(2)}`)}</p>
    <PencilLine  onClick={() => setIsOpen(true)}  size={16} className="text-white cursor-pointer" />
    </div>
)}
            </div>
        </div>
    )
}