"use client";

import { useEffect, useState } from "react";
import { AddBackground } from "../modal/add-background";
import { DeleteAcconunt } from "../modal/delete-account";
import { ImportCsv } from "../modal/import-csv";
import { ItensOciosos } from "../modal/itens-ociosos";
import { AdicionarEmpenho } from "../modal/adicionar-empenho";
import { ConfirmDeleteFornecedor } from "../modal/confirm-delete-fornecedor";



export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
    <AddBackground/>
    <DeleteAcconunt/>
    <ConfirmDeleteFornecedor/>

    <ImportCsv/>
    <AdicionarEmpenho/>
    
    </>
  )
}