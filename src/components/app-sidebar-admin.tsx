import * as React from "react";
import { useContext, useMemo } from "react";
import {
  ArrowRightLeft,
  Barcode,
  Coins,
  ContactRound,
  Info,
  LayoutDashboard,
  Plus,
  Recycle,
  SearchCheck,
  SlidersHorizontal,
  TextSearch,
  Trash2,
  Building2,
  Wrench,
  Home,
  Users,
  ClipboardCheck,
  Bug,
} from "lucide-react";
import { DotsThree } from "phosphor-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "./ui/sidebar";
import { UserContext } from "../context/context";
import { AccountSwitcher } from "./navigation/user-list";
import { useModal } from "./hooks/use-modal-store";
import { usePermissions } from "./permissions";

export function AppSidebarAdmin({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loggedIn, role, permission } = useContext(UserContext);
  const { onOpen } = useModal();

  const {
    hasCriarEtiqueta,
    hasAdministrativo,
    hasAnunciarItem,
    hasBuscaAvancada,
    hasCargosFuncoes,
    hasAlienacao,
    hasDesfazimento,
    hasMovimentacao,
    hasComissaoPermanente,
    hasDepartamento,
    hasComissaoApoioLocal,
    hasFinalizados,
  } = usePermissions();

  // true quando permission já foi preenchido (mesmo que vazio)
  const permissionsLoaded = useMemo(
    () => permission !== undefined && permission !== null,
    [permission]
  );

  const isDefaultRole = !String(role ?? "").trim();

  // helpers para rótulo/ícone, aplicados apenas quando permissões estiverem carregadas
  const adminLabel = (labelIfAdmin: string, fallback = "Dashboard") =>
    permissionsLoaded && role === "Administrador" ? labelIfAdmin : fallback;

  const adminIcon = (IconIfAdmin: any, FallbackIcon: any) =>
    permissionsLoaded && role === "Administrador" ? IconIfAdmin : FallbackIcon;

  const data = useMemo(() => {
    return {
      user: {
        name: user?.username || "",
        email: user?.email || "",
        avatar: user?.photo_url || "",
      },
      navMain: [
        {
          title: "Ferramentas",
          url: "/",
          icon: Wrench,
          isActive: true,
          items: [
            ...(hasCriarEtiqueta
              ? [{ title: "Criar etiqueta", url: "/dashboard/criar-etiqueta", icon: Barcode }]
              : []),
            ...(hasAnunciarItem
              ? [{ title: "Anunciar item", url: "/dashboard/novo-item", icon: Plus }]
              : []),
            { title: "Busca patrimônio", url: "/buscar-patrimonio", icon: SearchCheck },
            ...(hasBuscaAvancada
              ? [{ title: "Busca avançada", url: "/dashboard/busca-avancada", icon: TextSearch }]
              : []),
          ],
        },
        {
          title: "Outros",
          url: "/",
          icon: DotsThree,
          isActive: true,
          items: [
            { title: "Feedback", icon: Bug, onClick: () => onOpen("relatar-problema") },
            { title: "Informações", url: "/informacoes", icon: Info },
          ],
        },
      ],
      projects: [
        { name: "Página Inicial", url: "/", icon: Home },
        ...(loggedIn && isDefaultRole
          ? [{ name: "Dashboard", url: "/dashboard", icon: LayoutDashboard }]
          : []),
        ...(hasAdministrativo
          ? [{ name: "Administrativo", url: "/dashboard/administrativo", icon: SlidersHorizontal }]
          : []),

        ...(hasMovimentacao
          ? [
              {
                name: adminLabel("Movimentação"),
                url: "/dashboard/movimentacao",
                icon: adminIcon(ArrowRightLeft, LayoutDashboard),
              },
            ]
          : []),

        ...(hasComissaoApoioLocal
          ? [
              {
                name: adminLabel("Comissão de Apoio Local"),
                url: "/dashboard/comissao-apoio-local",
                icon: adminIcon(ContactRound, LayoutDashboard),
              },
            ]
          : []),

        ...(hasCargosFuncoes
          ? [{ name: "Cargos e funções", url: "/dashboard/cargos-funcoes", icon: Users }]
          : []),

        ...(hasComissaoPermanente
          ? [
              {
                name: adminLabel("Comissão Permanente"),
                url: "/dashboard/comissao-permanente",
                icon: adminIcon(ClipboardCheck, LayoutDashboard),
              },
            ]
          : []),

        ...(hasDesfazimento
          ? [
              {
                name: adminLabel("Desfazimento"),
                url: "/dashboard/desfazimento",
                icon: adminIcon(Trash2, LayoutDashboard),
              },
            ]
          : []),

        ...(hasAlienacao
          ? [
              {
                name: adminLabel("Alienação"),
                url: "/dashboard/alienacao",
                icon: adminIcon(Coins, LayoutDashboard),
              },
            ]
          : []),

        ...(hasDepartamento
          ? [
              {
                name: adminLabel("Setor/Departamento"),
                url: "/dashboard/setor-departamento",
                icon: adminIcon(Building2, LayoutDashboard),
              },
            ]
          : []),

        ...(hasFinalizados
          ? [{ name: "Finalizados", url: "/dashboard/finalizados", icon: Recycle }]
          : []),
      ],
    };
  }, [
    user?.username,
    user?.email,
    user?.photo_url,
    loggedIn,
    role,
    isDefaultRole,
    permissionsLoaded,
    hasCriarEtiqueta,
    hasAdministrativo,
    hasAnunciarItem,
    hasBuscaAvancada,
    hasCargosFuncoes,
    hasAlienacao,
    hasDesfazimento,
    hasMovimentacao,
    hasComissaoPermanente,
    hasDepartamento,
    hasComissaoApoioLocal,
    hasFinalizados,
  ]);

  // “cinto de segurança”: se algum menu for memoizado demais, remonta ao mudar papel/permissões
  const navKey = [
    role || "no-role",
    loggedIn ? "in" : "out",
    permissionsLoaded ? "pl-1" : "pl-0",
    hasCriarEtiqueta,
    hasAdministrativo,
    hasAnunciarItem,
    hasBuscaAvancada,
    hasCargosFuncoes,
    hasAlienacao,
    hasDesfazimento,
    hasMovimentacao,
    hasComissaoPermanente,
    hasDepartamento,
    hasComissaoApoioLocal,
    hasFinalizados,
  ]
    .map((v) => (typeof v === "boolean" ? Number(v) : v))
    .join("-");

  return (
    <Sidebar collapsible="icon" className="border-0" {...props}>
      <SidebarHeader>
        <AccountSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavProjects key={`projects-${navKey}`} projects={data.projects} />
        <NavMain key={`main-${navKey}`} items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>{loggedIn && <NavUser user={data.user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
