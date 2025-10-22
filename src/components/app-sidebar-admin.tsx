import * as React from "react"
import {
  ArrowLeftRight,
  ArrowRightLeft,
  AudioWaveform,
  BarChartBig,
  Barcode,
  Blocks,
  BookOpen,
  Bot,
  Bug,
  Building,
  Building2,
  ClipboardCheck,
  Coins,
  Command,
  Download,
  File,
  Frame,
  GalleryVerticalEnd,
  Gift,
  GraduationCap,
  Handshake,
  Home,
  Info,
  LayoutDashboard,
  LayoutTemplate,
  Link2,
  List,
  Lock,
  Map,
  PieChart,
  Plus,
  Search,
  SearchCheck,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  SquareTerminal,
  TextSearch,
  TimerReset,
  Trash2,
  UserPlus,
  Users,
  UserSquare,
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
import { useModal } from "./hooks/use-modal-store"
import { usePermissions } from "./permissions"
// This is sample data.

export function AppSidebarAdmin({ ...props }: React.ComponentProps<typeof Sidebar>) {
 const {urlGeral, user,  loggedIn, permission} = useContext(UserContext)
 const {onOpen} = useModal()  

    const { hasCriarEtiqueta, 
     hasAdministrativo, 
     hasAnunciarItem,
     hasBuscaAvancada,
     hasCargosFuncoes,
     hasAlienacao,
     hasDesfazimento,
     hasMovimentacao,
     hasComissaoPermanente,
     hasDepartamento,
     hasComissaoApoioLocal
   } = usePermissions();





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
       
             ...(hasCriarEtiqueta
                        ? [
                              {
            title: "Criar etiqueta",
            url: "/dashboard/criar-etiqueta",
            icon: Barcode
          },
                        ]
                        : []),

                         ...(hasAnunciarItem
                        ? [
                                {
            title: "Anunciar item",
            url: "/dashboard/novo-item",
            icon: Plus
          },
                        ]
                        : []),
       
           {
              title: "Busca patrimônio",
              url: "/buscar-patrimonio",
              icon: SearchCheck,
            },

              ...(hasBuscaAvancada
                        ? [
                             {
            title: "Busca avançada",
            url: "/dashboard/busca-avancada",
            icon: TextSearch
          },
                        ]
                        : []),

          
       
        ],
      },




      {
        title: "Outros",
        url: "/",
        icon: DotsThree,
        isActive: true,
        items: [

          {
                        title: "Feedback",
                        icon: Bug,
                        onClick: () => onOpen('relatar-problema'), // Chama a função onOpen() ao clicar
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

              ...(loggedIn
                        ? [
                    {
        name: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
                        ]
                        : []),
           
    

        ...(hasAdministrativo
                        ? [
                    {
        name: "Administrativo",
        url: "/dashboard/administrativo",
        icon: SlidersHorizontal,
      },
                        ]
                        : []),
     

  ...(hasMovimentacao
                        ? [
                           {
        name: "Movimentação",
        url: "/dashboard/movimentacao",
        icon: ArrowRightLeft,
      },
                        ]
                        : []),

                          ...(hasComissaoApoioLocal
                        ? [
                           {
        name: "Comissão de apoio local",
        url: "/dashboard/comissao-apoio-local",
        icon: Users,
      },
                        ]
                        : []),


    


  ...(hasCargosFuncoes
                        ? [
                             {
        name: "Cargos e funções",
        url: "/dashboard/cargos-funcoes",
        icon: Users,
      },
                        ]
                        : []),

        ...(hasComissaoPermanente
                        ? [
                          {
        name: "Comissão permanente",
        url: "/dashboard/comissao-permanente",
        icon: ClipboardCheck,
      },
                        ]
                        : []),


     

        ...(hasDesfazimento
                        ? [
                      {
        name: "Desfazimento",
        url: "/dashboard/desfazimento",
        icon: Trash2,
      },
                        ]
                        : []),

                        
        ...(hasAlienacao
                        ? [
                      {
        name: "Alienação",
        url: "/dashboard/alienacao",
        icon: Coins,
      },
                        ]
                        : []),

     
     ...(hasDepartamento
                        ? [
                     {
        name: "Setor/Departamento",
        url: "/dashboard/setor-departamento",
        icon: Building2,
      },
                        ]
                        : []),
      

      
     
      
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
