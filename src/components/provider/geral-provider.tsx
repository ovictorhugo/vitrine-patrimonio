"use client";

import { useEffect, useState } from "react";
import { HomeInicial } from "../homepage/home-initial";

import { BuscaPatrimonio } from "../busca-patrimonio/busca-patrimonio";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { Join } from "../invite-join/join";


const ModalContent = () => {
  const { type } = useModalHomepage();

  switch (type) {
    case "initial-home":
      return <HomeInicial />;
    case "busca-patrimonio":
      return <BuscaPatrimonio />;
      case "join-sala":
      return <Join />;
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