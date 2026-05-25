import { TabsContent } from "../../../ui/tabs";
import { Skeleton } from "../../../ui/skeleton";
import { PatrimonioItemCollection } from "../components/patrimonio-item-inventario";
import React from "react";
import { CollectionItem } from "../../desfazimento/components/add-collection";
import { ItemPatrimonio } from "../components/item-patrimonio";
import { usePermissions } from "../../../permissions";
import { UserContext } from "../../../../context/context";
import { toast } from "sonner";
import { Button } from "../../../ui/button";
import { useContext, useState } from "react";
import { Loader2, Trash2, FileMinus } from "lucide-react";

interface AdministratorTabProps {
  loadingItems: boolean;
  items: CollectionItem[];
  collection_id: string | null;
  setCountDesfazimento: React.Dispatch<React.SetStateAction<number>>;
  setCountNaoDesfazimento: React.Dispatch<React.SetStateAction<number>>;
  setItems: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
  handleItemDeleted: (deletedId: string) => void;
  viewMode: "list" | "grid";
  selectedItems?: Set<string>;
  toggleItem?: (id: string) => void;
  reload: () => void;
}

export function AdministratorTab({
  loadingItems,
  items,
  collection_id,
  setCountDesfazimento,
  setCountNaoDesfazimento,
  setItems,
  handleItemDeleted,
  viewMode,
  selectedItems,
  toggleItem,
  reload,
}: AdministratorTabProps) {
  const { hasAdministrativo } = usePermissions();
  const { urlGeral } = useContext(UserContext);
  const [clearingSei, setClearingSei] = useState(false);
  const [clearingItems, setClearingItems] = useState(false);

  if (!hasAdministrativo) {
    return null;
  }

  const handleClearSei = async () => {
    try {
      setClearingSei(true);
      const token = localStorage.getItem("jwt_token");
      const res = await fetch(`${urlGeral}collections/add-sei/${collection_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ sei_process: null }),
      });
      
      if (!res.ok) throw new Error("Erro ao limpar processo SEI");
      
      toast.success("Processo SEI limpo com sucesso!");
      reload();
    } catch (e: any) {
      toast.error(e.message || "Erro inesperado ao limpar SEI");
    } finally {
      setClearingSei(false);
    }
  };

  const handleClearItems = async () => {
    try {
      setClearingItems(true);
      const token = localStorage.getItem("jwt_token");
      const res = await fetch(`${urlGeral}collection_items/remove_by_filters/${collection_id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      if (!res.ok) throw new Error("Erro ao remover itens da coleção");
      
      toast.success("Todos os itens foram removidos com sucesso!");
      setItems([]);
      setCountDesfazimento(0);
      setCountNaoDesfazimento(0);
      reload();
    } catch (e: any) {
      toast.error(e.message || "Erro inesperado ao remover itens");
    } finally {
      setClearingItems(false);
    }
  };

  return (
    <TabsContent value="administrator">
      <div className="p-8 pt-0">
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            variant="destructive"
            onClick={handleClearSei}
            disabled={clearingSei || !collection_id}
          >
            {clearingSei ? <Loader2 size={16} className="mr-2 animate-spin" /> : <FileMinus size={16} className="mr-2" />}
            Apagar processo SEI
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearItems}
            disabled={clearingItems || !collection_id || items.length === 0}
          >
            {clearingItems ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Trash2 size={16} className="mr-2" />}
            Remover todos os itens
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
