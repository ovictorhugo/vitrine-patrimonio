import * as React from "react"
import {
  AudioWaveform,
  BarChartBig,
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
  Link2,
  List,
  Map,
  PieChart,
  SearchCheck,
  Settings2,
  Sparkles,
  SquareTerminal,
  UserPlus,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
 const {urlGeral, user,  loggedIn} = useContext(UserContext)
 
  const data = {
    user: {
      name: user?.display_name || '',
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
            title: "Mapa da instituição",
            url: "/mapa",
            icon: Map
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
            url: "/relatar-problema",
            icon: Bug
          },
          {
            title: "Informações",
            url: "/informacoes",
            icon: Info
          },
        ],
      },
   
      
     
    ],
    projects: [
      {
        name: "Página Inicial",
        url: "/",
        icon: Home,
      },
      {
        name: "Buscar patrimônio",
        url: "/buscar-patrimonio",
        icon: SearchCheck,
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
