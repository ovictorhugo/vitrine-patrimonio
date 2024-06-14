
import { useContext, useEffect } from "react";
import SearchLayout from "../layout/search-layout";
import { UserContext } from "../context/context";
import { GeralProvider } from "../components/provider/geral-provider";
import { useModalHomepage } from "../components/hooks/use-modal-homepage";
import { useLocation } from "react-router-dom";
import SimpleLayout from "../layout/simple-layout";
import { useModalBackground } from "../components/hooks/use-modal-background";

export function Donation() {
    const { onOpen } = useModalHomepage();

    const location = useLocation();

    useEffect(() => {
        if(location.pathname == '/doacao') {
            onOpen('doacao')
            onOpenBg('2')
        } else if(location.pathname == '/doacao/assinatura') {
            onOpen('escolher-assinatura')
            onOpenBg('2')
        } else if(location.pathname == '/doacao/pagamento' ) {
            onOpen('pagamento')
            onOpenBg('2')
        } else if(location.pathname == '/doacao/pagamento/pix' ) {
            onOpen('pix')
            onOpenBg('2')
        } else if(location.pathname == '/doacao/pagamento/cartao' ) {
            onOpen('cartao')
            onOpenBg('2')
        } else if(location.pathname == '/doacao/pagamento/boleto' ) {
            onOpen('boleto')
            onOpenBg('2')
        } else if(location.pathname == '/doacao/signIn' ) {
            onOpen('login-donation')
            onOpenBg('2')
        } else if(location.pathname == '/doacao/signUp' ) {
            onOpen('criar-conta-donation')
            onOpenBg('2')
        } 
    }, [location]);

    const { onOpen:onOpenBg } = useModalBackground();



    
  

    return(
        <>
        <SimpleLayout>
            <GeralProvider/>
        </SimpleLayout>
        </>
    )
}