import { useContext } from "react";
import { Alert } from "../../ui/alert";
import { UserContext } from "../../../context/context";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"

export function AssinaturaInformation() {
    const {doacao, planosSelecionados} = useContext(UserContext)
    return(
        <Alert className="flex gap-3 items-center">
           <div className="h-10">
            <p>Assinatura</p>
            <p>{planosSelecionados == 1 ? ('Único pagamento'):(`${planosSelecionados} x R$ ${doacao.toFixed(2)}`)}</p>
           </div>
        </Alert>
    )
}