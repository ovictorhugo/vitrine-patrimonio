
import { useContext, useEffect } from "react";

import { useLocation } from "react-router-dom";

import { DashboardProvider } from "../components/provider/dashboard-provider";
import SimpleLayout from "../layout/simple-layout";
import { useModalDashboard } from "../components/hooks/use-modal-dashboard";
import { useModalBackground } from "../components/hooks/use-modal-background";
import { UserContext } from "../context/context";

export function Admin() {
    const { onOpen } = useModalDashboard();
    const { onClose} = useModalBackground();
    const {isCollapsed, navCollapsedSize, defaultLayout} = useContext(UserContext)

    const location = useLocation();

    useEffect(() => {
        if(location.pathname == '/dashboard') {
            onOpen('visao-geral-user')
  
        } else if (location.pathname == '/dashboard/todos-os-patrimonios') {
            onOpen('lista-patrimonio')
        } else if (location.pathname == '/dashboard/visao-sala') {
            onOpen('visao-sala')
        } else if (location.pathname == '/dashboard/novo-item') {
            onOpen('novo-item')
        } else if (location.pathname == '/dashboard/itens-vitrine') {
            onOpen('itens-vitrine')
        } else if (location.pathname == '/dashboard/empenhos') {
            onOpen('empenhos')
        } else if (location.pathname == '/dashboard/criar-etiqueta') {
            onOpen('create-bar-bode')
        } else if (location.pathname == '/dashboard/painel') {
            onOpen('painel')
        }  else if (location.pathname == '/dashboard/assinaturee') {
            onOpen('assinar-documento')
        }  else if (location.pathname == '/dashboard/itens-desfazimento') {
            onOpen('itens-desfazimento')
        }  else if (location.pathname == '/dashboard/transferencias') {
            onOpen('transferencia')
        }



    }, [location]);
  

    return(
        <>
        <SimpleLayout
         defaultLayout={defaultLayout}
         defaultCollapsed={isCollapsed}
         navCollapsedSize={navCollapsedSize}
        >
           <DashboardProvider/>

        </SimpleLayout>
        </>
    )
}