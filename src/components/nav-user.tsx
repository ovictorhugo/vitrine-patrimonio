"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Shield,
  Sparkles,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

import { Badge } from "./ui/badge";
import { useModal } from "./hooks/use-modal-store";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/context";
import { useSessionCountdown } from "../context/useSessionCountdown";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { onOpen } = useModal();
  const {
    setUser,
    setLoggedIn,
    user: userContext,
    urlGeral,
    loggedIn,
  } = useContext(UserContext);
  const history = useNavigate();

  const logOut = async () => {
    try {
      localStorage.removeItem("jwt_token");
      setUser(null);
      setLoggedIn(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const remainingMs = useSessionCountdown();
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-eng-blue/10"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={`${urlGeral}user/upload/${userContext?.id}/icon`}
                  alt={user.name}
                />
                <AvatarFallback className="rounded-lg">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight hover:text-eng-blue">
                <span className="truncate font-semibold">{user.name}</span>
              </div>
              <ChevronsRight className="ml-auto size-4 hover:text-eng-blue" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) p-0 min-w-[300px] rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div
                className="bg-eng-blue rounded-sm h-[100px] bg- bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${urlGeral}user/upload/${userContext?.id}/cover) `,
                }}
              />

              <div className="flex items-center flex-col px-1 pt-1.5 text-left text-sm">
                <Avatar className="h-16 w-16 rounded-lg -top-12">
                  <AvatarImage
                    src={`${urlGeral}user/upload/${userContext?.id}/icon`}
                    alt={user.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
                <div className="grid -top-8 text-center text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>{" "}
                  <div className="flex flex-1 justify-center my-4">
                    <Badge variant={"outline"} className="text-gray-500">
                      Sessão restante: {formatRemaining(remainingMs)}
                    </Badge>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup className="px-1">
              <Link to={"/dashboard"}>
                <DropdownMenuItem className="gap-2 hover:text-eng-blue">
                  <User size={16} />
                  Minha página
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="px-1">
              <Link to={"/dashboard?pagina_user=perfil_seguranca"}>
                <DropdownMenuItem className="gap-2 hover:text-eng-blue">
                  <Shield size={16} />
                  Perfil e segurança
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="px-1 pb-1">
              <DropdownMenuItem
                onClick={() => {
                  logOut();
                  history(`/`);

                  localStorage.removeItem("permission");
                  localStorage.removeItem("role");
                }}
                className="gap-2 hover:text-eng-blue"
              >
                <LogOut size={16} />
                Sair da sessão
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
