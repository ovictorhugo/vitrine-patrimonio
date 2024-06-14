import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import { ModeToggle } from "../../components/mode-toggle";
import { Button } from "../ui/button";
import { Info, List, Users } from "phosphor-react";
import { useContext,useState } from "react";
import { useModalSidebar } from "../hooks/use-modal-sidebar";
import { UserContext } from "../../context/context";

import { UserConfigHeader } from "../header/user-config-header";
import { useModal } from "../hooks/use-modal-store";

export function NavigationSidebar() {
    const { onOpen, onClose } = useModalSidebar();
    const { onOpen:onOpenModal} = useModal();

    const {navbar, setNavbar, loggedIn, user} = useContext(UserContext)

    const [filterState, setFilterState] = useState(""); // Inicialmente, sem filtro

    const handleButtonClickInfo = () => {
        if (filterState === "info") {
          onClose();
          setFilterState("");
        } else {
          onOpen("info");
          setFilterState("info");
        }
      };

     
  
    return (
     <div className={`whitespace-nowrap sticky left-0  top-0 z-[1]  flex h-screen   flex-col transition-all  ${navbar ? ('w-[278px]'):('w-[72px]')}`}> 
         <div
        className={`space-y-4 flex flex-col sticky left-0  top-0  h-full text-primary w-full pb-3 ${navbar ? ('px-4'):('items-center')}`}
      >
       <div className={`flex items-center  h-20 `}>
       <Button onClick={() => setNavbar(!navbar)} variant="outline" className="bg-transparent border-0" size="icon">
       <List size={16} className="" /> 
        </Button>
       </div>
      
        <ScrollArea className="flex-1 w-full">
        
        </ScrollArea>
        <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <Button onClick={() => handleButtonClickInfo()} variant="outline" className={`bg-transparent border-0 ${navbar ? ('w-full justify-start'):('')}`} size={navbar ? ('default'):('icon')}>
       <Info size={16} className=" whitespace-nowrap" /> {navbar && (<span className="">Informações</span>)}
       
        </Button>

          <ModeToggle />

          <Button onClick={() => onOpenModal('pesquisadores-selecionados')} variant="outline" className={`bg-blue-700 hover:text-white hover:bg-blue-800 dark:hover:bg-blue-800 dark:bg-blue-700 text-white border-0 ${navbar ? ('w-full justify-start'):('')}`} size={navbar ? ('default'):('icon')}>
       <Users size={16} className="" /> 
       {navbar && (<span className="">Pesquisadores selecionados</span>)}
        </Button>

        {loggedIn && (
          <div className="flex gap-4 items-center w-full">
          <UserConfigHeader/>
          {navbar && (
            <div>
            <p className="text-xs truncate font-bold max-w-[160px]">{user.displayName}</p>
            <p className="text-xs truncate max-w-[160px]">{user.email}</p>
            </div>
          )}
        </div>
        )}

       
          
        </div>
      </div>
     </div>
    )
  }