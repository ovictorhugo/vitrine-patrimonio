"use client";

import { useEffect, useState } from "react";
import { HomeInicial } from "../homepage/home-initial";

import { BuscaPatrimonio } from "../busca-patrimonio/busca-patrimonio";
import { useModalHomepage } from "../hooks/use-modal-homepage";

import { ItemPage } from "../item-page/item-page";
import { Informacoes } from "../info/informacoes";
import { EmprestimoAudiovisual } from "../emprestimo-audiovisual.tsx/emprestimo-audiovisual";


const ModalContent = () => {
  const { type } = useModalHomepage();

  switch (type) {
    case "initial-home":
      return <HomeInicial />;
    case "busca-patrimonio":
      return <BuscaPatrimonio />;
    case 'item-page':
      return <ItemPage/>
    case 'informacoes':
      return <Informacoes/>
    case 'emprestimo-audivisual':
      return <EmprestimoAudiovisual/>
    default:
      return null;
  }
};

export const GeralProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <ModalContent />;
};