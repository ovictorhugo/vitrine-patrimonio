import { useContext } from "react"
import { UserContext } from "../../../context/context"
import { Badge } from "../../ui/badge"
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { ArrowRight } from "phosphor-react"
import { useModalHomepage } from "../../hooks/use-modal-homepage"
import { Link } from "react-router-dom"
import { toast } from "sonner"

export function Step1() {
    const {doacao, setDoacao, loggedIn} = useContext(UserContext)
    const {onOpen} = useModalHomepage()

    const handleClick = () => {
        if(doacao <= 0) {
            toast("Você precisa digitar algum valor", {
                description: "Preencha o campo",
                action: {
                  label: "Fechar",
                  onClick: () => console.log("Undo"),
                },
              })
        }
    }
    return(
        <div>
            <Badge className="py-2 px-4 border text-white border-white hover:bg-transparent bg-transparent mb-2">Passo 1 de 3</Badge>
            <h2 className="text-white text-3xl font-bold mb-1 max-w-[450px]">Contribua para a Fump com valores pequenos, sua doação faz a diferença.</h2>
                    <p className="text-white text-sm mb-8 max-w-[550px]">Com doações de qualquer valor, podem fazem a diferença, possibilitando que a Fump continue apoiando os estudantes e promovendo projetos acadêmicos e sociais.</p>

                    <div className="flex flex-wrap gap-3">
                        <Badge onClick={() => {
                            setDoacao(doacao+5)
                        }} className="py-2 px-4  bg-white hover:bg-neutral-100 text-[#02A8A8] cursor-pointer">+ 5 reais</Badge>
                        <Badge onClick={() => {
                         
                            setDoacao(doacao+10)
                        }} className="py-2 px-4  bg-white hover:bg-neutral-100 text-[#02A8A8] cursor-pointer">+ 10 reais</Badge>

                        <Badge onClick={() => {
                          
                            setDoacao(doacao+30)
                        }} className="py-2 px-4 bg-white hover:bg-neutral-100 text-[#02A8A8] cursor-pointer">+ 30 reais</Badge>

<Badge onClick={() => {
                           
                            setDoacao(doacao+50)
                        }} className="py-2 px-4 bg-white hover:bg-neutral-100 text-[#02A8A8] cursor-pointer">+ 50 reais</Badge>
                    </div>

                    <div className="flex gap-3 mt-8">
                    <div className="flex">
                        <div className="h-10 bg-neutral-200 w-10 rounded-l-md flex items-center justify-center font-medium text-xs text-gray-600">R$</div>
                        <Input onChange={(e) => setDoacao(Number(e.target.value))} type="number" value={doacao} className="rounded-l-none w-fit"/>
                    </div>

                    <Link to={loggedIn ? (doacao > 0 ? '/doacao/assinatura' : '/') : (doacao > 0 ? '/doacao' : '/')}>
                   <Button variant={'outline'} onClick={() => handleClick()}  className="text-[#02A8A8] hover:text-[#02A8A8] "><ArrowRight size={16} />  Continuar</Button></Link>
                    </div>
        </div>
    )
}