import { useContext, useState } from "react";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { ObjectFump } from "../svg/object-fump";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft, ArrowRight } from "phosphor-react";
import { UserContext } from "../../context/context";
import fump_bg from '../../assets/fump_bg.png';

export function HomeInicial() {
    const { isOpen, type, onOpen } = useModalHomepage();

    const [isOpenModal, setIsOpenModal] = useState(false)
    const [doacao, setDoacao] = useState(0)
    const isModalOpen = isOpen && type === "initial-home";
    const {loggedIn} = useContext(UserContext)
    return(
<>
{isModalOpen && (
    <div className="h-screen w-full pt-20 mx-16">
         

            <div className="w-full pb-20 z-[9] flex gap-6 h-full">
              {!isOpenModal && (
                  <div className="h-full bg-cover bg-center bg-no-repeat   bg-[#02A8A8] flex-col  w-[400px] rounded-xl flex justify-center p-6" style={{ backgroundImage: `url(${fump_bg})` }}>
                  <h2 className="text-white text-3xl font-bold mb-1">É ex ben?</h2>
                  <p className="text-white mb-4">Verifique a sua situação cadastral</p>

                  <div className="flex gap-3">
                     
                  <Input placeholder="Nome completo" className="border-white placeholder-white text-white bg-transparent"/>
                  <Button className="text-[#02A8A8]" variant={'outline'}>Verificar</Button>
                  </div>
              </div>
              )}

                <div className={`${isOpenModal ? ('justify-between'):('border-neutral-300 border p-6 justify-center')} flex flex-col   flex-1  rounded-xl w-full h-full `}>
                {isOpenModal && (
                    <div className="flex items-center gap-3 font-medium text-gray-500">
                    <Button variant={'ghost'} size={'icon'} onClick={() => setIsOpenModal(!isOpenModal)}> <ArrowLeft size={16}  /></Button>Fazer doação <Badge className="py-2 px-4 border text-gray-500 border-neutral-300 hover:bg-transparent bg-transparent">Passo 1 de 3</Badge>
                        </div>
                )}

                <div>
                <h2 className=" text-3xl font-bold mb-1 max-w-[600px]">Contribua para a Fump com valores pequenos, sua doação faz a diferença.</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-[650px]">Com doações de qualquer valor, podem fazem a diferença, possibilitando que a Fump continue apoiando os estudantes e promovendo projetos acadêmicos e sociais.</p>

                    <div className="flex flex-wrap gap-3">
                        <Badge onClick={() => {
                            setIsOpenModal(true)
                            setDoacao(doacao+5)
                        }} className="py-2 px-4 bg-[#02A8A8] hover:bg-cyan-700 cursor-pointer">+ 5 reais</Badge>
                        <Badge onClick={() => {
                            setIsOpenModal(true)
                            setDoacao(doacao+10)
                        }} className="py-2 px-4 bg-[#02A8A8] hover:bg-cyan-700 cursor-pointer">+ 10reais</Badge>

                        <Badge onClick={() => {
                            setIsOpenModal(true)
                            setDoacao(doacao+30)
                        }} className="py-2 px-4 bg-[#02A8A8] hover:bg-cyan-700 cursor-pointer">+ 30 reais</Badge>

<Badge onClick={() => {
                            setIsOpenModal(true)
                            setDoacao(doacao+50)
                        }} className="py-2 px-4 bg-[#02A8A8] hover:bg-cyan-700 cursor-pointer">+ 50 reais</Badge>
                    </div>

                    {isOpenModal && (
                        <div className="flex mt-4">
                        <div className="h-10 bg-neutral-200 w-10 rounded-l-md flex items-center justify-center font-medium text-xs text-gray-600">R$</div>
                        <Input onChange={(e) => setDoacao(Number(e.target.value))} type="number" value={doacao} className="rounded-l-none w-fit"/>
                    </div>
                    )}
                </div>

              {isOpenModal && (
                  <div className="flex items-center gap-3">

<Button onClick={() => loggedIn ? onOpen('payment-home') : onOpen('authentication-home')}>
  <ArrowRight size={16} /> Continuar
</Button>

                  </div>
              )}
                </div>
            </div>
    </div>
)}
</>
    )
}