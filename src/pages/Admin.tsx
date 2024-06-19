
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
        if(location.pathname == '/dashboard') {
            onOpen('visao-geral-user')
  
        } else if (location.pathname == '/todos-os-patrimonios') {
            onOpen('lista-patrimonio')
        } else if (location.pathname == '/visao-sala') {
            onOpen('visao-sala')
        } else if (location.pathname == '/novo-item') {
            onOpen('novo-item')
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