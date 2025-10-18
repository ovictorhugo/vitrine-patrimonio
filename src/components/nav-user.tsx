"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Shield,
  Sparkles,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar"
import { useModal } from "./hooks/use-modal-store"
import { Link, useNavigate } from "react-router-dom"
import { useContext } from "react"
import { UserContext } from "../context/context"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
const {onOpen} = useModal()
const {  setUser, setLoggedIn, user:userContext, urlGeral  } = useContext(UserContext)
const history = useNavigate();

    const logOut = async () => {
        try {
          localStorage.removeItem('jwt_token');
            setUser(null);
            setLoggedIn(false);
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <SidebarMenuButton
     
     size="lg"
     className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
   >
     <Avatar className="h-8 w-8 rounded-lg">
       <AvatarImage src={`${urlGeral}user/upload/${userContext?.id}/icon`} alt={user.name} />
       <AvatarFallback className="rounded-lg"><User size={16}/></AvatarFallback>
     </Avatar>
     <div className="grid flex-1 text-left text-sm leading-tight">
       <span className="truncate font-semibold">{user.name}</span>
       <span className="truncate text-xs">{user.email}</span>
     </div>
     <ChevronsUpDown className="ml-auto size-4" />
   </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) p-0 min-w-[300px] rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
  <DropdownMenuLabel className="p-0 font-normal">
           <div className="bg-eng-blue rounded-sm h-[100px] bg- bg-cover bg-center bg-no-repeat"  style={{ backgroundImage: `url(${urlGeral}user/upload/${userContext?.id}/cover) ` }}>
            
           </div>

           <div className="flex items-center  flex-col  px-1 py-1.5 text-left text-sm">
               <div>
               <Avatar className="h-16 w-16 rounded-lg -top-8 relative">
                  <AvatarImage src={`${urlGeral}user/upload/${userContext?.id}/icon`}  alt={user.name} />
                  <AvatarFallback className="rounded-lg"><User size={16}/></AvatarFallback>
                </Avatar>
               </div>
                <div className="grid flex-1 -top-3 relative text-center text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="px-1">
           <Link to={'/dashboard'}>
           <DropdownMenuItem className="gap-2">
              <LayoutDashboard size={16} />
              Minha área
            </DropdownMenuItem></Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="px-1">
         
            <Link to={'/dashboard?pagina_user=perfil_seguranca'}>
            <DropdownMenuItem className="gap-2">
                <Shield size={16} />
                Perfil e segurança
              </DropdownMenuItem></Link>

              <DropdownMenuItem className="gap-2">
                <Bell size={16} />
                Notificações
              </DropdownMenuItem>
            
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="px-1 pb-1">
            <DropdownMenuItem onClick={() => {
               logOut()
               history(`/`)

               localStorage.removeItem('permission');
               localStorage.removeItem('role');
            }} className="gap-2">
              <LogOut size={16} />
              Sair da sessão
            </DropdownMenuItem>
              </DropdownMenuGroup>
          
            </DropdownMenuContent>


      </DropdownMenu>


 
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
