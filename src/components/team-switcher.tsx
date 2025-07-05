import * as React from "react"
import { ChevronsUpDown, GalleryVerticalEnd, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar"
import { toast } from "sonner";
import { useTheme } from "next-themes"
import { UserContext } from "../context/context"
import { SymbolEEWhite } from "./svg/SymbolEEWhite"
import { Button } from "./ui/button";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    id: string
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

    const {user,   setPermission,  setRole, role, loggedIn, urlGeral} = React.useContext(UserContext)
    const { theme } = useTheme()
  
  
  
    React.useEffect(() => {
      // Obtém o role do localStorage
      const storedRole = localStorage.getItem("role");
      if (storedRole) {
        const parsedRole = JSON.parse(storedRole);
        const initialTeam = teams.find((team) => team.name === parsedRole);
        if (initialTeam) {
          setRole(initialTeam.name);
        }
      }
    }, [teams]); // Executa novamente se a lista de teams mudar
  
  
  
  const fetchDataPerm = async (role_id:any) => {
    let urlPermission = urlGeral + `s/permission?role_id=${role_id.id}`
       console.log(urlPermission)

       if (role_id.id == '') {
        setPermission([])
        setRole('')
        localStorage.removeItem('role');
        localStorage.removeItem('permission');
     
       }

   else {
    try {
      const response = await fetch(urlPermission , {
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "3600",
          "Content-Type": "text/plain",
        },
      });
      const data = await response.json();
      if (data) {
        console.log(data)
        setPermission(data)
        setActiveTeam(role_id)
        localStorage.setItem('permission', JSON.stringify(data));
        toast("Você alternou as permissões", {
          description: `Acessando como ${role_id.name}`,
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
      }
    } catch (err) {
      console.log(err);
    }
   }
  };
  

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!loggedIn && (teams.length > 0)}>
            <SidebarMenuButton
              size="lg"
              className=" data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-eng-dark-blue text-sidebar-primary-foreground">
                <div className="h-4">
                  <SymbolEEWhite />
                </div>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {teams.find((team) => team.name === role)?.name || "Selecionar"}
                </span>
                <span className="truncate text-xs">
                  {teams.find((team) => team.name === role)?.plan || ""}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">
              Cargos
            </DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => {
                  fetchDataPerm(team);
                  localStorage.setItem("role", JSON.stringify(team.name));
                  setRole(team.name);
                }}
                className={`gap-2 p-2 ${
                  role === team.name ? "bg-neutral-50 dark:bg-neutral-700" : ""
                }`}
              >
                <Button className="w-6 h-6" variant={'outline'} size={'icon'}>
                <GalleryVerticalEnd className="size-4 shrink-0" />
                </Button>
                {team.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
