"use client";

import { useEffect, useState } from "react";

import { VisaoGeralUser } from "../dashboard/dashboard-page/visao-geral-user";



import { NovoItem } from "../dashboard/novo-item/novo-item";
import { VisaoSala } from "../dashboard/visao-sala";
import { ItensVitrine } from "../dashboard/itens-vitrine/itens-vitrine";
import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { CreateBarCode } from "../dashboard/create-etiqueta/create-bar-code";

import { Assinaturee } from "../dashboard/assinaturee";
import { ItensDesfazimento } from "../dashboard/itens-desfazimento/itens-desfazimento";

import { EditItemVitrine } from "../dashboard/edit-item/edit-item";
import { CreateTempAsset } from "../dashboard/create-temp-asset/create-temp-asset";




const ModalContent = () => {
  const { type } = useModalDashboard();

  switch (type) {
    case "visao-geral-user":
      return <VisaoGeralUser />;
    case "novo-item":
      return <NovoItem />;
    case "visao-sala":
      return <VisaoSala />;
    case "itens-vitrine":
      return <ItensVitrine />;
      case "create-bar-bode":
      return <CreateBarCode />;
    case 'assinar-documento':
      return <Assinaturee/>
    case 'itens-desfazimento':
      return <ItensDesfazimento/>
    case 'editar-item':
      return <EditItemVitrine/>
      case 'create-temp-asset':
        return <CreateTempAsset/>
    default:
      return null;
  }
};

export const DashboardProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <ModalContent />;
};