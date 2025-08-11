import { Separator } from "../components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { SidebarTrigger } from "./ui/sidebar";

import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";

export function BreadcrumbHeaderCustom() {

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
      

    return(
         <div className="flex p-8 px-0 pt-0 pb-2  items-center justify-between top-0 sticky z-[3] supports-[backdrop-filter]:bg-neutral-50/60 supports-[backdrop-filter]:dark:bg-neutral-900/60 backdrop-blur ">
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

             
            </div>
    )
}