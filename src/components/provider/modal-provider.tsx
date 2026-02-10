"use client";

import { useEffect, useState } from "react";
import { ImportCsv } from "../modal/import-csv";
import { AdicionarEmpenho } from "../modal/adicionar-empenho";
import { useModal } from "../hooks/use-modal-store";
import { SearchModal } from "../modal/search-modal";
import { SearchModalVitrine } from "../modal/search-modal-vitrine";
import { SearchModalPatrimonio } from "../modal/search-modal-patrimonio";
import { PatrimonioModal } from "../modal/patrimonio-modal";
import { SearchCodAtmModal } from "../modal/search-modal-cod-atm";
import { SearchLocNomModal } from "../modal/search-modal-loc-nom";
import { RelatarBug } from "../modal/relatar-bug";
import { CatalogModal } from "../modal/catalog-modal";
import { SignInModal } from "../modal/sign-in-modal";
import SearchCodAtmModalExact from "../modal/search-modal-patrimonio-exact";
import TransferModal from "../modal/transfer-modal";
import DocumentModal from "../modal/document_modal";

const ModalContent = () => {
  const { type } = useModal();
  switch (type) {
    case "import-csv":
      return <ImportCsv />;
    case "import-csv-morto":
      return <ImportCsv />;
    case "adicionar-empenho":
      return <AdicionarEmpenho />;
    case "search":
      return <SearchModal />;
    case "search-vitrine":
      return <SearchModalVitrine />;
    case "search-patrimonio":
      return <SearchModalPatrimonio />;
    case "patrimonio":
      return <PatrimonioModal />;
    case "search-cod-atm":
      return <SearchCodAtmModal />;
    case "search-loc-nom":
      return <SearchLocNomModal />;
    case "relatar-problema":
      return <RelatarBug />;
    case "catalog-modal":
      return <CatalogModal />;
    case "transfer-modal":
      return <TransferModal />;
    case "document-signers":
      return <DocumentModal />;
    case "sign-in":
      return <SignInModal />;
    case "search-patrimonio-exact":
      return <SearchCodAtmModalExact />;
    default:
      return null;
  }
};

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <ModalContent />;
};
