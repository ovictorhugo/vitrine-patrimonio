import { Toaster } from "sonner";
import { Header } from "../components/header/Header";
import { NavigationSidebar } from "../components/navigation/navigation-sidebar";

import { useModalHomepage } from "../components/hooks/use-modal-homepage";
import { TooltipProvider } from "../components/ui/tooltip"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/ui/resizable"
import { cn } from "../lib"
import { Link, useLocation} from "react-router-dom";

import React, { useContext, useState } from "react";
import { UserContext } from "../context/context";


import { SidebarInset, SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";

import { AppSidebarAdmin } from "../components/app-sidebar-admin";
import { Separator } from "../components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../components/ui/breadcrumb";
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
  
  const router = useLocation();
   // Função para formatar o texto dos segmentos
    const formatSegment = (segment) => {
      return segment
        .replace(/-/g, ' ') // Substitui hífens por espaços
        .replace(/_/g, ' ') // Substitui underscores por espaços
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
  
    

  // Função para criar os itens do breadcrumb
  const createBreadcrumbItems = (pathname) => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      return [{ label: 'Página Inicial', href: '/', isLast: true }];
    }
  
    const items = [
      { label: 'Página Inicial', href: '/', isLast: false }
    ];
  
    pathSegments.forEach((segment, index) => {
      const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
      const isLast = index === pathSegments.length - 1;
      
      items.push({
        label: formatSegment(segment),
        href,
        isLast
      });
    });
  
    return items;
  };
  
  const breadcrumbItems = createBreadcrumbItems(router.pathname);
  
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
  
