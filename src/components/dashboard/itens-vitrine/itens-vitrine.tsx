import { useContext, useEffect, useMemo, useState } from "react";
import { useModalDashboard } from "../../hooks/use-modal-dashboard";
import { UserContext } from "../../../context/context";
import { useModal } from "../../hooks/use-modal-store";
import { TooltipProvider } from "../../ui/tooltip";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Input } from "../../ui/input";
import { CheckCheck, ChevronDown, ChevronLeft, ChevronUp, Download, Search, Store, X } from "lucide-react";
import { ItensListVitrine } from "../components/itens-list-vitrine";
import { DisplayItemVitrine } from "../components/display-item-vitrine";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import { ItemPatrimonio } from "../../homepage/components/item-patrimonio";
import { BlockItem } from "./block-itens";
import { Skeleton } from "../../ui/skeleton";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { MagnifyingGlass } from "phosphor-react";
import { Alert } from "../../ui/alert";
import { EsperandoAprovacao } from "./esperando-aprovacao";
import { toast } from "sonner";
import { Anunciados } from "./anunciados";
import { BlockItemsVitrine } from "../commission/block-items-tinder";


export function ItensVitrine() {
   
          
    return(
      <main  className="flex flex-1 flex-col  ">
        <BlockItemsVitrine/>
            </main>

    )
}