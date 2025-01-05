"use client";

import { useEffect, useState } from "react";

import { ImportCsv } from "../modal/import-csv";

import { AdicionarEmpenho } from "../modal/adicionar-empenho";
import { ConfirmDeleteFornecedor } from "../modal/confirm-delete-fornecedor";
import { InformacoesEmpenhos } from "../modal/informacoes-empenho";
import { useModal } from "../hooks/use-modal-store";
import { SearchModal } from "../modal/search-modal";
import { MinhaArea } from "../minha-area/minha-area";

const ModalContent = () => {
  const { type } = useModal();
  switch (type) {
    case 'confirm-delete-fornecedor':
      return <ConfirmDeleteFornecedor/>
    case 'informacoes-empenhos':
      return <InformacoesEmpenhos/>
    case 'import-csv':
      return <ImportCsv/>
    case 'import-csv-morto':
      return <ImportCsv/>
    case 'adicionar-empenho':
      return <AdicionarEmpenho/>
    case 'search':
      return <SearchModal/>
    case 'minha-area':
      return <MinhaArea/>
    default:
      return null
  }

}

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <ModalContent/>
}