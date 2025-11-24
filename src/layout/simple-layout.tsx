import { Toaster } from "sonner";
import { Header } from "../components/header/Header";
import { NavigationSidebar } from "../components/navigation/navigation-sidebar";

import { useModalHomepage } from "../components/hooks/use-modal-homepage";
import { TooltipProvider } from "../components/ui/tooltip"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/ui/resizable"
import { cn } from "../lib"
import { Link, useLocation} from "react-router-dom";

import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/context";


import { SidebarInset, SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";

import { AppSidebarAdmin } from "../components/app-sidebar-admin";
import { Separator } from "../components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { useModal } from "../components/hooks/use-modal-store";
import { Badge } from "../components/ui/badge";
interface MailProps {
 
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
  children:React.ReactNode
}
export default function SimpleLayout({

  defaultLayout = [265, 440, 655],
  defaultCollapsed = true,
  navCollapsedSize,
  children
}: MailProps) {
  
  const {isCollapsed, setIsCollapsed, loggedIn,user, timeLoggedIn} = useContext(UserContext)
  
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
  const { onOpen } = useModal();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return; // já passou pela "primeira entrada"
    didRunRef.current = true;

    if (!loggedIn) {
      onOpen("sign-in"); // abre só na primeira entrada
    }
  }, [loggedIn, onOpen]);


  const formatRemaining = (totalMs: number) => {
  const totalSec = Math.max(0, Math.floor(totalMs / 1000));

  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} dia${days > 1 ? "s" : ""}`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${String(minutes).padStart(2, "0")}m`);
  parts.push(`${String(seconds).padStart(2, "0")}s`);

  return parts.join(" ");
};


    return (
    <div>
      
      <SidebarProvider className="    " defaultOpen={true} open={isCollapsed} onOpenChange={() => setIsCollapsed((prev) => !prev)} >

      <AppSidebarAdmin />



    
      <SidebarInset className=" ">
      <main className="h-full flex flex-col flex-1 ">
      <div className="flex p-8 pt-8 pb-2 h-[68px] items-center justify-between top-0 sticky z-[3] supports-[backdrop-filter]:bg-neutral-50/60 supports-[backdrop-filter]:dark:bg-neutral-900/60 backdrop-blur ">
              <div className="flex  pb-0 items-center gap-2">
                <SidebarTrigger className="" />
                <Separator orientation="vertical" className="mr-2 h-4" />


              <Breadcrumb>
                   <BreadcrumbList>
                     {breadcrumbItems.map((item, index) => (
                       <React.Fragment key={`breadcrumb-${index}`}>
                         <BreadcrumbItem className="hidden md:block">
                           {item.isLast ? (
                             <span className="text-foreground font-medium capitalize">
                               {item.label}
                             </span>
                           ) : (
                             <BreadcrumbLink 
                               to={item.href} 
                               className="capitalize text-muted-foreground hover:text-foreground transition-colors"
                             >
                               {item.label}
                             </BreadcrumbLink>
                           )}
                         </BreadcrumbItem>
                         
                         {!item.isLast && (
                           <BreadcrumbSeparator className="hidden md:block" />
                         )}
                       </React.Fragment>
                     ))}
                   </BreadcrumbList>
                 </Breadcrumb>
              </div>


<div>
    {(loggedIn && timeLoggedIn) && (
       <Badge variant={'outline'} className="text-gray-500">
       Sessão restante: {formatRemaining(Number(timeLoggedIn))}
       </Badge>
    )}
 
</div>
             
            </div>
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
  