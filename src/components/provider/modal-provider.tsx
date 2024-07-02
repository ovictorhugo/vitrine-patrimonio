"use client";

import { useEffect, useState } from "react";
import { AddBackground } from "../modal/add-background";
import { DeleteAcconunt } from "../modal/delete-account";
import { ImportCsv } from "../modal/import-csv";
import { ItensOciosos } from "../modal/itens-ociosos";
import { AdicionarEmpenho } from "../modal/adicionar-empenho";
import { ConfirmDeleteFornecedor } from "../modal/confirm-delete-fornecedor";
import { InformacoesEmpenhos } from "../modal/informacoes-empenho";
import { useModal } from "../hooks/use-modal-store";

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