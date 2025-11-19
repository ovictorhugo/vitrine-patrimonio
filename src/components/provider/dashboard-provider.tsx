"use client";

import { useEffect, useState } from "react";

import { VisaoGeralUser } from "../dashboard/dashboard-page/visao-geral-user";



import { NovoItem } from "../dashboard/novo-item/novo-item";
import { VisaoSala } from "../dashboard/sala/visao-sala";
import { ItensVitrine } from "../dashboard/itens-vitrine/itens-vitrine";
import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { CreateBarCode } from "../dashboard/create-etiqueta/create-bar-code";

import { Assinaturee } from "../dashboard/assinaturee";

import { EditItemVitrine } from "../dashboard/edit-item/edit-item";
import { CreateTempAsset } from "../dashboard/create-temp-asset/create-temp-asset";
import { HomepageListTempAsset } from "../dashboard/create-temp-asset/homepage-list-temp-asset";
import { Comission } from "../dashboard/commission/comission";
import { Admin } from "../dashboard/administrativo/admin";
import { InventarioPage } from "../dashboard/inventario/inventario-page";
import { Desfazimento } from "../dashboard/desfazimento/desfazimento";
import { CargosFuncoes } from "../dashboard/cargos-funcoes/cargos-funcoes";
import { Alienacao } from "../dashboard/alienacao/alienacao";
import { DepartamentPage } from "../dashboard/departament/departament-page";
import { ComissaoApoioLocal } from "../dashboard/comissao-apoio-local/comissao-apoio-local";
import { UserPublicPage } from "../user-public-page/user-public-page";
import { Finalizados } from "../dashboard/finalizados/finalizados-page";
import { Audiovisual } from "../dashboard/audiovisual/audiovisual";
import { AllSalas } from "../dashboard/salas/all-salas";




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
    case 'editar-item':
      return <EditItemVitrine/>
      case 'create-temp-asset':
        return <CreateTempAsset/>
      case 'temp-asset':
        return <HomepageListTempAsset/>
      case 'commission':
        return <Comission/>
      case 'administrativo-page':
        return <Admin/>
       case 'inventario':
        return <InventarioPage/>
      case 'desfazimento':
      return <Desfazimento/>
      case 'cargos-funcoes':
      return <CargosFuncoes/>
      case 'alienacao':
        return <Alienacao/>
      case 'departamento':
        return <DepartamentPage/>
      case 'comissao-apoio-local':
        return <ComissaoApoioLocal/>
      case 'user-public-page':
        return <UserPublicPage/>
             case 'finalizados':
        return <Finalizados/>
      case 'audiovisual':
        return <Audiovisual/>
      case 'salas':
      return <AllSalas/>
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