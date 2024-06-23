"use client";

import { useEffect, useState } from "react";
import { HomeInicial } from "../homepage/home-initial";
import { HomeAuthentication } from "../homepage/home-authentication";
import { HomePayment } from "../homepage/home-payment";
import { EscolherValores } from "../donation/escolher-valores";
import { EscolherAssinatura } from "../donation/escolher-assinatura";
import { AtualizarCadastro } from "../donation/atualizar-cadastro";
import { Pagamento } from "../donation/pagamento";
import { VerificarSituacaoFumpista } from "../fumpista/verificar-situacao";
import { CriarContaFumpista } from "../fumpista/criar-conta-fumpista";
import { LoginFumpista } from "../fumpista/login-fumpista";
import { NaoEncontradoFumpista } from "../fumpista/nao-encontrado";
import { Cartao } from "../donation/cartao";
import { Pix } from "../donation/pix";
import { LoginDonation } from "../donation/login-donation";
import { CriarContaDonation } from "../donation/criar-conta-donation";
import { BuscaPatrimonio } from "../busca-patrimonio/busca-patrimonio";
import { useModalHomepage } from "../hooks/use-modal-homepage";


const ModalContent = () => {
  const { type } = useModalHomepage();

  switch (type) {
    case "initial-home":
      return <HomeInicial />;
    case "busca-patrimonio":
      return <BuscaPatrimonio />;
    case "home-authentication":
      return <HomeAuthentication />;
    case "home-payment":
      return <HomePayment />;
    case "escolher-valores":
      return <EscolherValores />;
    case "escolher-assinatura":
      return <EscolherAssinatura />;
    case "atualizar-cadastro":
      return <AtualizarCadastro />;
    case "pagamento":
      return <Pagamento />;
    case "cartao":
      return <Cartao />;
    case "pix":
      return <Pix />;
    case "login-donation":
      return <LoginDonation />;
    case "criar-conta-donation":
      return <CriarContaDonation />;
    case "verificar-situacao-fumpista":
      return <VerificarSituacaoFumpista />;
    case "criar-conta-fumpista":
      return <CriarContaFumpista />;
    case "login-fumpista":
      return <LoginFumpista />;
    case "nao-encontrado-fumpista":
      return <NaoEncontradoFumpista />;
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