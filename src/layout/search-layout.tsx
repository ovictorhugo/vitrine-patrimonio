import { Toaster } from "sonner";
import { Header } from "../components/header/Header";
import { NavigationSidebar } from "../components/navigation/navigation-sidebar";
import React, { useContext, useEffect, useRef, useState} from "react";
import { useModalHomepage } from "../components/hooks/use-modal-homepage";
import { TooltipProvider } from "../components/ui/tooltip"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/ui/resizable"
import { cn } from "../lib"
import { Link, useLocation} from "react-router-dom";


import { UserContext } from "../context/context";

import { AlertCircle, BarChartBig, GraduationCap, Home, Info, LayoutDashboard, List, Package, SearchCheck, X, MapPin } from "lucide-react";


import { SidebarInset, SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { Separator } from "../components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { useQuery } from "../components/modal/search-modal-patrimonio";
import { useModal } from "../components/hooks/use-modal-store";
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
  
    
  const router = useLocation();
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

    return (
    <div>
      
         
      <SidebarProvider className="    " defaultOpen={true} open={isCollapsed} onOpenChange={() => setIsCollapsed((prev) => !prev)} >

<AppSidebar />

       

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

    <div className="flex items-center gap-2">
   

    </div>
           </div>
          
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
  
