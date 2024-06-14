"use client";

import { useEffect, useState } from "react";
import { Background1 } from "../background/Background1";
import { Background2 } from "../background/Background2";



export const ModalBackground = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
    <Background1/>
    <Background2/>
    </>
  )
}