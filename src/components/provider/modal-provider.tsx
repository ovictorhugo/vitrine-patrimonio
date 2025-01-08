"use client";

import { useEffect, useState } from "react";

import { ImportCsv } from "../modal/import-csv";

import { AdicionarEmpenho } from "../modal/adicionar-empenho";
import { ConfirmDeleteFornecedor } from "../modal/confirm-delete-fornecedor";
import { InformacoesEmpenhos } from "../modal/informacoes-empenho";
import { useModal } from "../hooks/use-modal-store";
import { SearchModal } from "../modal/search-modal";
import { MinhaArea } from "../minha-area/minha-area";
import { SearchModalVitrine } from "../modal/search-modal-vitrine";
import { EditAdminItem } from "../modal/edit-admin-item";
import { EditItem } from "../modal/edit-item";

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
    case 'search-vitrine':
      return <SearchModalVitrine/>
    case 'edit-admin-item':
      return <EditAdminItem/>
    case 'edit-item':
      return <EditItem/>
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