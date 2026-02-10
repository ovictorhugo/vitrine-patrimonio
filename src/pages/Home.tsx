import { useContext, useEffect } from "react";
import { UserContext } from "../context/context";
import { GeralProvider } from "../components/provider/geral-provider";
import { useModalHomepage } from "../components/hooks/use-modal-homepage";
import { useLocation } from "react-router-dom";

import SimpleLayout from "../layout/simple-layout";
export function Home() {
  const { onOpen } = useModalHomepage();
  const { isCollapsed, navCollapsedSize, defaultLayout } =
    useContext(UserContext);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname == "/") {
      onOpen("initial-home");
    } else if (location.pathname == "/buscar-patrimonio") {
      onOpen("busca-patrimonio");
    } else if (location.pathname == "/buscar-catalogo") {
      onOpen("buscar-catalogo");
    } else if (location.pathname == "/item") {
      onOpen("item-page");
    } else if (location.pathname == "/informacoes") {
      onOpen("informacoes");
    } else if (location.pathname == "/assinar-transferencia/") {
      onOpen("assinar-transferência");
    } else if (location.pathname == "/validar-pdf") {
      onOpen("validar-pdf");
    } else if (location.pathname == "/pedir-emprestimo-audiovisual") {
      onOpen("pedir-emprestimo-audiovisual");
    }
  }, [location]);

  return (
    <>
      <SimpleLayout
        defaultLayout={defaultLayout}
        defaultCollapsed={isCollapsed}
        navCollapsedSize={navCollapsedSize}
      >
        <GeralProvider />
      </SimpleLayout>
    </>
  );
}
