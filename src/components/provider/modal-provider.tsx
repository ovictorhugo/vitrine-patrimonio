"use client";

import { useEffect, useState } from "react";
import { AddBackground } from "../modal/add-background";
import { DeleteAcconunt } from "../modal/delete-account";
import { ImportCsv } from "../modal/import-csv";



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
    <ImportCsv/>
    </>
  )
}