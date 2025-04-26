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
  const pathSegments = router.pathname.split('/').filter(Boolean); // Divide a URL em segmentos e remove a primeira parte vazia

  // Se a URL estiver vazia, mostramos "Página Inicial"
  const breadcrumbItems = pathSegments.length === 0 ? ['Página inicial'] : ['Página inicial', ...pathSegments];


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
                    {breadcrumbItems.map((segment, index) => {
                      const isLastItem = index === breadcrumbItems.length - 1;

                      // Construir o caminho parcial para cada segmento
                      const href = index === 0
                        ? '/' // O primeiro item sempre vai para a página inicial
                        : `/${pathSegments.slice(0, index + 1).join('/')}`;

                      return (
                        <React.Fragment key={index}>
                          <BreadcrumbItem className="hidden md:block capitalize">
                            {/* Se for o último item, não criamos um link, é apenas texto */}
                            {isLastItem ? (
                              <span>{segment}</span>
                            ) : (
                              <BreadcrumbLink to={href} className="capitalize">
                                {segment}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {!isLastItem && <BreadcrumbSeparator className="hidden md:block" />}
                        </React.Fragment>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
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
  
