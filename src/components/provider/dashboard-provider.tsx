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



export const DashboardProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
    <VisaoGeralUser/>
    <ListaPatrimonios/>
    <NovoItem/>
    <VisaoSala/>

   <GeralDashboard/>
   
   <AtualizarDados/>
   <GerenciarUsuarios/>
   <ConfiguracoesDashboard/>
    </>
  )
}