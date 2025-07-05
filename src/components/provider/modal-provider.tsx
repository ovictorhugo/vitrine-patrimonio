"use client";

import { useEffect, useState } from "react";

import { ImportCsv } from "../modal/import-csv";

import { AdicionarEmpenho } from "../modal/adicionar-empenho";
import { ConfirmDeleteFornecedor } from "../modal/confirm-delete-fornecedor";

import { useModal } from "../hooks/use-modal-store";
import { SearchModal } from "../modal/search-modal";
import { MinhaArea } from "../minha-area/minha-area";
import { SearchModalVitrine } from "../modal/search-modal-vitrine";
import { EditAdminItem } from "../modal/edit-admin-item";
import { EditItem } from "../modal/edit-item";
import { SearchPatrimonio } from "../search/search-patrimonio";
import { SearchModalPatrimonio } from "../modal/search-modal-patrimonio";
import { PatrimonioModal } from "../modal/patrimonio-modal";
import { AddPatrimonioModal } from "../modal/add-patrimonio-modal";
import { SearchCodAtmModal } from "../modal/search-modal-cod-atm";
import { SearchLocNomModal } from "../modal/search-modal-loc-nom";
import { RelatarBug } from "../modal/relatar-bug";

const ModalContent = () => {
  const { type } = useModal();
  switch (type) {
    case 'confirm-delete-fornecedor':
      return <ConfirmDeleteFornecedor/>

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
    case 'search-patrimonio':
      return <SearchModalPatrimonio/>
    case 'patrimonio':
      return <PatrimonioModal/>
    case 'add-patrimonio':
      return <AddPatrimonioModal/>
    case 'search-cod-atm':
      return <SearchCodAtmModal/>
    case 'search-loc-nom':
      return <SearchLocNomModal/>
    case 'relatar-problema':
      return <RelatarBug/>
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