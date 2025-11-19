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
    "/dashboard/busca-avancada": "temp-asset",
    "/dashboard/sala": "visao-sala",
    "/dashboard/novo-item": "novo-item",
    "/dashboard/movimentacao": "itens-vitrine",
    "/dashboard/empenhos": "empenhos",
    "/dashboard/criar-etiqueta": "create-bar-bode",
     "/dashboard/administrativo": "administrativo-page",
      "/dashboard/inventario": "inventario",
    
    "/dashboard/painel": "painel",
     "/dashboard/cargos-funcoes": "cargos-funcoes",
      "/dashboard/desfazimento": "desfazimento",
    "/dashboard/assinaturee": "assinar-documento",
    "/dashboard/transferencias": "transferencia",
    "/dashboard/editar-item": "editar-item",
    "/dashboard/criar-patrimonio-temporario": "create-temp-asset",     
     "/dashboard/comissao-permanente": "commission",
          "/dashboard/alienacao": "alienacao",
              "/dashboard/setor-departamento": "departamento",
               "/dashboard/comissao-apoio-local": "comissao-apoio-local",
                "/user": "user-public-page",
                  "/dashboard/finalizados": "finalizados",
                    "/dashboard/audiovisual": "audiovisual",
                          "/dashboard/salas": "salas",
          
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
