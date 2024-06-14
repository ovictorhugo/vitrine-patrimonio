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




export const GeralProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
<HomeInicial/>
<BuscaPatrimonio/>



<HomeAuthentication/>
<HomePayment/>
<EscolherValores/>
<EscolherAssinatura/>
<AtualizarCadastro/>
<Pagamento/>
<Cartao/>
<Pix/>
<LoginDonation/>
<CriarContaDonation/>

<VerificarSituacaoFumpista/>
<CriarContaFumpista/>
<LoginFumpista/>
<NaoEncontradoFumpista/>
    </>
  )
}