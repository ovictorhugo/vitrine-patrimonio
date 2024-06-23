
import { useContext, useEffect } from "react";
import SearchLayout from "../layout/search-layout";
import { UserContext } from "../context/context";
import { GeralProvider } from "../components/provider/geral-provider";
import { useModalHomepage } from "../components/hooks/use-modal-homepage";
import { useLocation } from "react-router-dom";
import { useModalBackground } from "../components/hooks/use-modal-background";
import NotificationLayout from "../layout/notification-layout";

export function Notification() {
    const { onOpen } = useModalHomepage();
    const { onOpen:onOpenBg } = useModalBackground();
    const {isCollapsed, navCollapsedSize, defaultLayout} = useContext(UserContext)

    const location = useLocation();

    useEffect(() => {
         if(location.pathname == '/join-room') {
            onOpen('join-sala')
      
        } 
    }, [location]);

    





    return(
        <>
        <NotificationLayout
        
        >
            <GeralProvider/>

        </NotificationLayout>
        </>
    )
}