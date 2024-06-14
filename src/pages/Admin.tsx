
import { useContext, useEffect } from "react";
import SearchLayout from "../layout/search-layout";

import { useModalHomepage } from "../components/hooks/use-modal-homepage";
import { useLocation } from "react-router-dom";
import { GeralDashboard } from "../components/dashboard/geral-dashboard";
import { DashboardProvider } from "../components/provider/dashboard-provider";
import SimpleLayout from "../layout/simple-layout";
import { useModalDashboard } from "../components/hooks/use-modal-dashboard";
import { useModalBackground } from "../components/hooks/use-modal-background";
import { UserContext } from "../context/context";

export function Admin() {
    const { onOpen } = useModalDashboard();
    const { onClose} = useModalBackground();
    const {isCollapsed} = useContext(UserContext)

    const location = useLocation();

    useEffect(() => {
        if(location.pathname == '/admin') {
            onOpen('general')
            onClose()
        } else if (location.pathname == '/admin/gerenciar-usuarios') {
            onOpen('gerenciar-usuarios')
            onClose()
        } else if (location.pathname == '/dashboard') {
            onOpen('visao-geral-user')
            onClose()
        } else if (location.pathname == '/dashboard/atualizar-dados') {
            onOpen('atualizar-dados')
            onClose()
        } else if (location.pathname == '/dashboard/configuracoes') {
            onOpen('configuracoes')
            onClose()
        }
    }, [location]);
  

    return(
        <>
        <SimpleLayout
         defaultLayout={[0,2, 0]}
         defaultCollapsed={isCollapsed}
         navCollapsedSize={0}
        >
           <DashboardProvider/>

        </SimpleLayout>
        </>
    )
}