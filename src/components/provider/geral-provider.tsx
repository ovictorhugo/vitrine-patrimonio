"use client";

import { useEffect, useState } from "react";
import { HomeInicial } from "../homepage/home-initial";

import { BuscaPatrimonio } from "../busca-patrimonio/busca-patrimonio";
import { useModalHomepage } from "../hooks/use-modal-homepage";

import { ItemPage } from "../item-page/item-page";
import { Informacoes } from "../info/informacoes";
import { PedirEmprestimoAudiovisual } from "../pedir-emprestimo-audiovisual/pedir-emprestimo-audiovisual";
import { BuscaCatalogo } from "../buscar-catalogo/buscar-catalogo";
import { AssinarTransferencia } from "../assinar-transferencia/assinar-transferencia";
import { ValidarPDF } from "../validar-pdf/validar-pdf";

const ModalContent = () => {
  const { type } = useModalHomepage();

  switch (type) {
    case "initial-home":
      return <HomeInicial />;
    case "busca-patrimonio":
      return <BuscaPatrimonio />;
    case "buscar-catalogo":
      return <BuscaCatalogo />;
    case "item-page":
      return <ItemPage />;
    case "informacoes":
      return <Informacoes />;
    case "assinar-transferência":
      return <AssinarTransferencia />;
    case "validar-pdf":
      return <ValidarPDF />;
    case "pedir-emprestimo-audiovisual":
      return <PedirEmprestimoAudiovisual />;
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
