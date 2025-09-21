import * as React from "react"
import {
  ArrowLeftRight,
  AudioWaveform,
  BarChartBig,
  Barcode,
  Blocks,
  BookOpen,
  Bot,
  Bug,
  Building2,
  Command,
  Download,
  Frame,
  GalleryVerticalEnd,
  GraduationCap,
  Home,
  Info,
  LayoutDashboard,
  LayoutTemplate,
  Link2,
  List,
  Map,
  PieChart,
  Plus,
  SearchCheck,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  SquareTerminal,
  TimerReset,
  UserPlus,
  WalletCards,
  Wrench,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "./ui/sidebar"
import { UserContext } from "../context/context"
import { useContext} from "react";
import { AccountSwitcher } from "./navigation/user-list"
import { DotsThree } from "phosphor-react"
// This is sample data.

export function AppSidebarAdmin({ ...props }: React.ComponentProps<typeof Sidebar>) {
 const {urlGeral, user,  loggedIn} = useContext(UserContext)
 
  const data = {
    user: {
      name: user?.username || '',
      email: user?.email || '',
      avatar: user?.photo_url || '',
    },
   
    navMain: [
      {
        title: "Ferramentas",
        url: "/",
        icon: Wrench,
        isActive: true,
        items: [
          {
            title: "Criar etiqueta",
            url: "/dashboard/criar-etiqueta",
            icon: Barcode
          },
          {
            title: "Patrimonio temporário",
            url: "/dashboard/patrimonio-temporario",
            icon: TimerReset
          },
          {
            title: "Anunciar item",
            url: "/dashboard/novo-item",
            icon: Plus
          },
       
        ],
      },
      {
        title: "Vitrine",
        url: "/",
        icon: DotsThree,
        isActive: true,
        items: [

          {
            title: "Itens do vitrine",
            url: "/dashboard/itens-vitrine",
            icon: WalletCards
          },
          {
            title: "Transferências",
            url: "/dashboard/transferencias",
            icon: ArrowLeftRight
          },
         
        ],
      },

      {
        title: "Desfazimento",
        url: "/",
        icon: DotsThree,
        isActive: true,
        items: [

          {
            title: "Itens do desfazimento",
            url: "/dashboard/itens-desfazimento",
            icon: WalletCards
          },
         
        ],
      },

      {
        title: "Outros",
        url: "/",
        icon: DotsThree,
        isActive: true,
        items: [

          {
            title: "Relatar problema",
            url: "/dashboard/relatar-problema",
            icon: Bug
          },
          {
            title: "Informações",
            url: "/dashboard/informacoes",
            icon: Info
          },
        ],
      },
   
      
     
    ],
    projects: [
      {
        name: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Administrativo",
        url: "/dashboard/administrativo",
        icon: SlidersHorizontal,
      },

      {
        name: "Painel do usuário",
        url: "/dashboard/painel",
        icon: LayoutTemplate,
      },
     
      
    ],
  }
  
  return (
    <Sidebar  collapsible='icon' className="border-0" {...props}>
      <SidebarHeader>
        <AccountSwitcher/>
      </SidebarHeader>
      <SidebarContent >
      <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
      
      </SidebarContent>
      <SidebarFooter>
        {loggedIn && (
          <NavUser user={data.user} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
