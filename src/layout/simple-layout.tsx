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

import { AlertCircle, BarChartBig, GraduationCap, Home, Info, LayoutDashboard, List, ListTodo, Package, Plus, SearchCheck, X, Trash, WalletCards, Stamp, Barcode, ArrowLeftRight, LayoutPanelLeft, FilePenLine } from "lucide-react";

import { ScrollArea } from "../components/ui/scroll-area";
import { UserConfigHeader } from "../components/header/user-config-header";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { AppSidebarAdmin } from "../components/app-sidebar-admin";
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
      
      <SidebarProvider className="    " defaultOpen={true} open={isCollapsed} onOpenChange={() => setIsCollapsed((prev) => !prev)} >

      <AppSidebarAdmin />



    
      <SidebarInset className=" ">
      <main className="h-full flex flex-col flex-1 ">
            {/* Assuming Header is another component */}
          
            <div className="h-full ">
            {children}
            </div>

          
          </main>

          </SidebarInset >

        

        <Toaster/>
     
      </SidebarProvider>
    </div>
    );
  };
  
