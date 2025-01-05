"use client";

import { useEffect, useState } from "react";
import { GeralDashboard } from "../dashboard/geral-dashboard";
import { VisaoGeralUser } from "../dashboard/visao-geral-user";
import { AtualizarDados } from "../dashboard/atualizar-dados";
import { GerenciarUsuarios } from "../dashboard/gerenciar-usuarios";
import { ConfiguracoesDashboard } from "../dashboard/configuracoes";
import { ListaPatrimonios } from "../dashboard/lista-patrimonios";
import { NovoItem } from "../dashboard/novo-item";
import { VisaoSala } from "../dashboard/visao-sala";
import { ItensVitrine } from "../dashboard/itens-vitrine";
import { useModalDashboard } from "../hooks/use-modal-dashboard";
import { Empenhos } from "../dashboard/empenhos";
import { CreateBarCode } from "../dashboard/create-bar-code";
import {  PainelGeral } from "../dashboard/painel";
import { Assinaturee } from "../dashboard/assinaturee";




const ModalContent = () => {
  const { type } = useModalDashboard();

  switch (type) {
    case "visao-geral-user":
      return <VisaoGeralUser />;
    case "lista-patrimonio":
      return <ListaPatrimonios />;
    case "novo-item":
      return <NovoItem />;
    case "visao-sala":
      return <VisaoSala />;
    case "itens-vitrine":
      return <ItensVitrine />;
    case "general":
      return <GeralDashboard />;
    case "atualizar-dados":
      return <AtualizarDados />;
    case "gerenciar-usuarios":
      return <GerenciarUsuarios />;
    case "configuracoes":
      return <ConfiguracoesDashboard />;
    case "empenhos":
      return <Empenhos />;
      case "create-bar-bode":
      return <CreateBarCode />;
    case "painel":
      return <PainelGeral />;
    case 'assinar-documento':
      return <Assinaturee/>
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