
import { useContext, useEffect } from "react";
import SearchLayout from "../layout/search-layout";
import { UserContext } from "../context/context";
import { GeralProvider } from "../components/provider/geral-provider";
import { useModalHomepage } from "../components/hooks/use-modal-homepage";
import { useLocation } from "react-router-dom";
import SimpleLayout from "../layout/simple-layout";
import { useModalBackground } from "../components/hooks/use-modal-background";

export function Fumpista() {
    const { onOpen } = useModalHomepage();
    const { onOpen:onOpenBg } = useModalBackground();

    const location = useLocation();

    useEffect(() => {
        if(location.pathname == '/fumpista') {
            onOpen('verificar-situacao-fumpista')
            onOpenBg('2')
        } else  if(location.pathname == '/fumpista/signIn') {
            onOpen('login-fumpista')
            onOpenBg('2')
        }  else  if(location.pathname == '/fumpista/signUp') {
            onOpen('criar-conta-fumpista')
            onOpenBg('2')
        } else  if(location.pathname == '/fumpista/nao-encontrado') {
            onOpen('nao-encontrado')
            onOpenBg('2')
        } 
    }, [location]);
  

    return(
        <>
        <SimpleLayout>
            <GeralProvider/>
        </SimpleLayout>
        </>
    )
}