import { Toaster } from "sonner";

import { useModalHomepage } from "../components/hooks/use-modal-homepage";
import { cn } from "../lib";
import { Link, useLocation } from "react-router-dom";

import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/context";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";

import { AppSidebarAdmin } from "../components/app-sidebar-admin";
import { Separator } from "../components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { useModal } from "../components/hooks/use-modal-store";
import { Badge } from "../components/ui/badge";
import { useSessionCountdown } from "../context/useSessionCountdown";
import { useIsMobile } from "../hooks/use-mobile";
interface MailProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
  children: React.ReactNode;
}
export default function SimpleLayout({
  defaultLayout = [265, 440, 655],
  defaultCollapsed = true,
  navCollapsedSize,
  children,
}: MailProps) {
  const { isCollapsed, setIsCollapsed, loggedIn, user, timeLoggedIn } =
    useContext(UserContext);

  const { isOpen: isOpenHomepage, type: typeHomepage } = useModalHomepage();
  const isModalOpen = isOpenHomepage && typeHomepage === "initial-home";
  const isMobile = useIsMobile();

  const router = useLocation();
  // Função para formatar o texto dos segmentos
  const formatSegment = (segment) => {
    return segment
      .replace(/-/g, " ") // Substitui hífens por espaços
      .replace(/_/g, " ") // Substitui underscores por espaços
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Função para criar os itens do breadcrumb
  const createBreadcrumbItems = (pathname) => {
    const pathSegments = pathname.split("/").filter(Boolean);

    if (pathSegments.length === 0) {
      return [{ label: "Página Inicial", href: "/", isLast: true }];
    }

    const items = [{ label: "Página Inicial", href: "/", isLast: false }];

    pathSegments.forEach((segment, index) => {
      const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
      const isLast = index === pathSegments.length - 1;

      items.push({
        label: formatSegment(segment),
        href,
        isLast,
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



  if (isMobile) {
    return (
      <div>
        <SidebarProvider
          className=""
          defaultOpen={true}
          open={isCollapsed}
          onOpenChange={() => setIsCollapsed((prev) => !prev)}
        >
          <AppSidebarAdmin />

          <SidebarInset className=" ">
            <main className="h-full flex flex-col flex-1 ">
              <div className="flex pl-4 pt-2 h-[48px] items-center justify-between top-0 sticky z-[3] supports-[backdrop-filter]:bg-neutral-50/60 supports-[backdrop-filter]:dark:bg-neutral-900/60 backdrop-blur ">
                <div className="flex  pb-0 items-center gap-2">
                  <SidebarTrigger className="" />
                  <Separator orientation="vertical" className="mr-2 h-4" />

                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbItems.map((item, index) => (
                        <React.Fragment key={`breadcrumb-${index}`}>
                          <BreadcrumbItem className="hidden block">
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
                            <BreadcrumbSeparator className="hidden block" />
                          )}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>

              <div className="h-full">{children}</div>
            </main>
          </SidebarInset>

          <Toaster />
        </SidebarProvider>
      </div>
    );
  } else
    return (
      <div>
        <SidebarProvider
          className=""
          defaultOpen={true}
          open={isCollapsed}
          onOpenChange={() => setIsCollapsed((prev) => !prev)}
        >
          <AppSidebarAdmin />

          <SidebarInset className=" ">
            <main className="h-full flex flex-col">
              <div className="flex p-0 px-8 border-b border-r border-solid border-eng-blue rounded-br-[20px] h-[60px] w-fit  items-center justify-between sticky top-0 z-[3] supports-[backdrop-filter]:bg-neutral-50/60 supports-[backdrop-filter]:dark:bg-neutral-900/60 backdrop-blur">
                <div className="flex pb-0 items-center gap-2">
                  <SidebarTrigger />
                  <Separator orientation="vertical" className="h-4" />

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
              <div className="h-full ">{children}</div>
            </main>
          </SidebarInset>

          <Toaster />
        </SidebarProvider>
      </div>
    );
}
