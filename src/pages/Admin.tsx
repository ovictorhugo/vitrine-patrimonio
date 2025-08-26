import { useContext, useEffect } from "react";
import { DashboardProvider } from "../components/provider/dashboard-provider";
import SimpleLayout from "../layout/simple-layout";
import { useLocation } from "react-router-dom";
import { ModalType, useModalDashboard } from "../components/hooks/use-modal-dashboard";
import { UserContext } from "../context/context";

export function Admin() {
  const { onOpen } = useModalDashboard();
  const { isCollapsed, navCollapsedSize, defaultLayout } = useContext(UserContext);
  const location = useLocation();

  const routeMap: Record<string, ModalType> = {
    "/dashboard": "visao-geral-user",
    "/dashboard/patrimonios": "lista-patrimonio",
    "/dashboard/visao-sala": "visao-sala",
    "/dashboard/novo-item": "novo-item",
    "/dashboard/itens-vitrine": "itens-vitrine",
    "/dashboard/empenhos": "empenhos",
    "/dashboard/criar-etiqueta": "create-bar-bode",
    "/dashboard/painel": "painel",
    "/dashboard/assinaturee": "assinar-documento",
    "/dashboard/itens-desfazimento": "itens-desfazimento",
    "/dashboard/transferencias": "transferencia",
    "/dashboard/editar-item": "editar-item",
    "/dashboard/criar-patrimonio-temporario": "create-temp-asset",
  };

  useEffect(() => {
    const modalKey: ModalType | undefined = routeMap[location.pathname];

    if (modalKey) {
      onOpen(modalKey);
    }
  }, [location]);

  return (
    <SimpleLayout
      defaultLayout={defaultLayout}
      defaultCollapsed={isCollapsed}
      navCollapsedSize={navCollapsedSize}
    >
      <DashboardProvider />
    </SimpleLayout>
  );
}
