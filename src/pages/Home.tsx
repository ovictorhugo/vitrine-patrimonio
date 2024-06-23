
import { useContext, useEffect } from "react";
import SearchLayout from "../layout/search-layout";
import { UserContext } from "../context/context";
import { GeralProvider } from "../components/provider/geral-provider";
import { useModalHomepage } from "../components/hooks/use-modal-homepage";
import { useLocation } from "react-router-dom";
import { useModalBackground } from "../components/hooks/use-modal-background";

export function Home() {
    const { onOpen } = useModalHomepage();
    const { onOpen:onOpenBg } = useModalBackground();
    const {isCollapsed, navCollapsedSize, defaultLayout} = useContext(UserContext)

    const location = useLocation();

    useEffect(() => {
        if(location.pathname == '/') {
            onOpen('initial-home')
        
        } else if(location.pathname == '/buscar-patrimonio') {
            onOpen('busca-patrimonio')
      
        } 
    }, [location]);

    





    return(
        <>
        <SearchLayout
         defaultLayout={defaultLayout}
         defaultCollapsed={isCollapsed}
         navCollapsedSize={navCollapsedSize}
        >
            <GeralProvider/>

        </SearchLayout>
        </>
    )
}