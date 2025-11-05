import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { useTheme } from "next-themes";
import { UserContext } from "../context/context";
import { SymbolEEWhite } from "./svg/SymbolEEWhite";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Team = {
  name: string;
  id: string;
  plan: string;
};

export function TeamSwitcher({ teams }: { teams: Team[] }) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState<Team | undefined>(teams?.[0]);
  const { setPermission, urlGeral, setRole, role, loggedIn } = React.useContext(UserContext);
  const { theme } = useTheme();
  const navigate = useNavigate()

  // carrega role inicial do localStorage, se existir
  React.useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      const parsedRole = JSON.parse(storedRole);
      const initialTeam = teams.find((team) => team.name === parsedRole);
      if (initialTeam) {
        setRole(initialTeam.name);
        setActiveTeam(initialTeam);
      }
    }
  }, [teams, setRole]);

  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;

  const fetchDataPerm = async (team: Team) => {
    // VISITANTE / MODO PADRÃO
    if (!team.id) {
      setPermission([]);
      setRole("");
      setActiveTeam(undefined);
      localStorage.removeItem("role");
      localStorage.removeItem("permission");
      toast("Você alternou as permissões", {
        description: `Acessando no modo padrão`,
        action: { label: "Fechar", onClick: () => {} },
      });
      return;
    }

    const urlPermission = `${urlGeral}roles/${team.id}/permissions`;
    try {
      const response = await fetch(urlPermission, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "3600",
          "Content-Type": "text/plain",
        },
      });

      navigate('/')

      const data = await response.json();
      if (data) {
        // aplica primeiro as permissões, depois o papel (evita corrida visual)
        setPermission(data);
        setRole(team.name);
        setActiveTeam(team);
        localStorage.setItem("permission", JSON.stringify(data));
        localStorage.setItem("role", JSON.stringify(team.name));
        
        toast("Você alternou as permissões", {
          description: `Acessando como ${team.name}`,
          action: { label: "Fechar", onClick: () => {} },
        });
      }
    } catch (err) {
      console.error(err);
      toast("Não foi possível carregar as permissões", {
        description: "Tente novamente em instantes.",
      });
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!loggedIn && teams.length === 0}>
            <SidebarMenuButton size="lg" className="data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-eng-dark-blue text-sidebar-primary-foreground">
                <div className="h-4">
                  <SymbolEEWhite />
                </div>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {teams.find((t) => t.name === role)?.name || "Selecionar"}
                </span>
                <span className="truncate text-xs">
                  {teams.find((t) => t.name === role)?.plan || ""}
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
                key={team.id || team.name}
                onClick={() => {
                  // não setar role/LS aqui: deixe fetchDataPerm orquestrar tudo
                  fetchDataPerm(team);
                }}
                className={`gap-2 p-2 ${role === team.name ? "bg-neutral-50 dark:bg-neutral-700" : ""}`}
              >
                <p className="truncate">{team.name}</p>
              </DropdownMenuItem>
            ))}

            <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

            <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">
              Usuário
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => {
                // Modo padrão (sem cargo/permissão)
                fetchDataPerm({ name: "Visitante", id: "", plan: "Usuário" });
                 toast("Você alternou as permissões", {
          description: `Acessando como Modo padrão`,
          action: { label: "Fechar", onClick: () => {} },
        });
         navigate('/')
              }}
              className="gap-2 p-2"
            >
              <p className="truncate">Modo padrão</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
