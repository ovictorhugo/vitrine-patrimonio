"use client";

import { useEffect, useState } from "react";
import { GeralDashboard } from "../dashboard/geral-dashboard";
import { VisaoGeralUser } from "../dashboard/visao-geral-user";
import { AtualizarDados } from "../dashboard/atualizar-dados";
import { GerenciarUsuarios } from "../dashboard/gerenciar-usuarios";
import { ConfiguracoesDashboard } from "../dashboard/configuracoes";



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
   <GeralDashboard/>
   <VisaoGeralUser/>
   <AtualizarDados/>
   <GerenciarUsuarios/>
   <ConfiguracoesDashboard/>
    </>
  )
}