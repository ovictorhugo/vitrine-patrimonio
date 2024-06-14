import { Toaster } from "sonner";
import { Header } from "../components/header/Header";
import { NavigationSidebar } from "../components/navigation/navigation-sidebar";

import { useModalHomepage } from "../components/hooks/use-modal-homepage";
import { TooltipProvider } from "../components/ui/tooltip"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/ui/resizable"
import { cn } from "../lib"
import { Link} from "react-router-dom";

import { useContext, useState } from "react";
import { UserContext } from "../context/context";
import { AccountSwitcher } from "../components/navigation/user-list";
import { AlertCircle, BarChartBig, GraduationCap, Home, Info, LayoutDashboard, List, SearchCheck, X } from "lucide-react";

import { ScrollArea } from "../components/ui/scroll-area";
import { UserConfigHeader } from "../components/header/user-config-header";
interface MailProps {
 
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
  children:React.ReactNode
}
export default function SearchLayout({

  defaultLayout = [265, 440, 655],
  defaultCollapsed = true,
  navCollapsedSize,
  children
}: MailProps) {
  
  const {isCollapsed, setIsCollapsed, loggedIn,user} = useContext(UserContext)
  
  const { isOpen: isOpenHomepage, type: typeHomepage } = useModalHomepage();
  const isModalOpen = isOpenHomepage && typeHomepage === "initial-home";
  
  
    return (
    <div>
      
        <TooltipProvider delayDuration={0}>

       

<ResizablePanelGroup

        direction="horizontal"
        onLayout={() => defaultLayout}
        className="h-full  items-stretch"
      >

<ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => { // Função sem parâmetros
            setIsCollapsed(true);
          }}
          onExpand={() => { // Função para expandir também sem parâmetros
            setIsCollapsed(false);
          }}
          className={cn('flex flex-col justify-between', isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out ")}
        >

<div>
<div className={cn("flex h-[50px] items-center justify-center border-b border-b-neutral-200 dark:border-b-neutral-800", isCollapsed ? 'h-[50px]': 'px-2')}>
<AccountSwitcher isCollapsed={isCollapsed}  />
          </div>

          


          <NavigationSidebar
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Páginas inicial",
                label: "",
                icon: Home,
                link: "/",
              },
              {
                title: "Pesquisar",
                label: "",
                icon: SearchCheck,
                link: "/buscar-patrimonio",
              },
              {
                title: "PDashboard",
                label: "",
                icon: LayoutDashboard,
                link: "/dashboard",
              },
            
            ]}
          />

          <div className="w-full h-[0.5px] bg-neutral-200 dark:bg-neutral-800"></div>
  

          <NavigationSidebar
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Pós-graduação",
                label: "",
                icon: GraduationCap,
                link: "/pos-graduacao",
              },
     
             
            ]}
          />
</div>

          <div className="">
          <NavigationSidebar
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Informações",
                label: "",
                icon: Info,
                link: "/informacoes",
              },
           
             
            ]}
          />

           {loggedIn && (
             <UserConfigHeader/>
           )}
          </div>
          
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={defaultLayout[1]} minSize={30} className="h-screen">
            <main className="flex-1  flex flex-col h-full">
            {/* Assuming Header is another component */}
            <Header />
          
            <ScrollArea className="flex flex-1 testetetse">
       
           
           {children}
        
            </ScrollArea>

          
          </main>

          </ResizablePanel>

        

        <Toaster/>
        </ResizablePanelGroup>
      </TooltipProvider >
    </div>
    );
  };
  
