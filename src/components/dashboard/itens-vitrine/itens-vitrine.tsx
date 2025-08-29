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


export function ItensVitrine() {
     const navigate = useNavigate();
          
    return(
      <main  className="flex flex-1 flex-col  ">
       <div className="w-full flex flex-col gap-8 justify-between">
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const path = location.pathname;
                      const hasQuery = location.search.length > 0;
                      if (hasQuery) navigate(path);
                      else {
                        const seg = path.split("/").filter(Boolean);
                        if (seg.length > 1) { seg.pop(); navigate("/" + seg.join("/")); }
                        else navigate("/");
                      }
                    }}
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar</span>
                  </Button>
      
                  <h1 className="text-xl font-semibold tracking-tight">Itens do vitrine</h1>
                </div>
                </div>
            </main>

    )
}