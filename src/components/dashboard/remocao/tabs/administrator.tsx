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
import { Loader2, Trash2, FileMinus, FileX, Undo } from "lucide-react";

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
  collection: any;
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
  collection,
}: AdministratorTabProps) {
  const { hasAdministrativo } = usePermissions();
  const { urlGeral } = useContext(UserContext);
  const [clearingSei, setClearingSei] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  if (!hasAdministrativo) {
    return null;
  }

  const handleClearSei = async () => {
    try {
      setClearingSei(true);
      const token = localStorage.getItem("jwt_token");
      const res = await fetch(
        `${urlGeral}collections/add-sei/${collection_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ sei_process: null }),
        },
      );

      if (!res.ok) throw new Error("Erro ao limpar processo SEI");

      toast.success("Processo SEI limpo com sucesso!");
      reload();
    } catch (e: any) {
      toast.error(e.message || "Erro inesperado ao limpar SEI");
    } finally {
      setClearingSei(false);
    }
  };

  const handleAdminAction = async (actionId: number) => {
    try {
      setActionLoading(actionId);
      const token = localStorage.getItem("jwt_token");
      const res = await fetch(
        `${urlGeral}collections/admin/action/${collection_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ action: actionId }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Erro ao executar ação administrativa",
        );
      }

      const data = await res.json();
      toast.success(data.message || "Ação executada com sucesso!");
      reload();
    } catch (e: any) {
      toast.error(e.message || "Erro inesperado ao executar ação");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <TabsContent value="administrator">
      <div className="p-8 pt-0">
        <div className="m-6 ml-0 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {collection?.document_path
            ? "Parecer adicionado"
            : "Parecer não adicionado"}
        </div>
        <div className="flex flex-col flex-wrap gap-4 mb-6 max-w-[300px]">
          <Button
            variant="destructive"
            onClick={() => handleAdminAction(2)}
            disabled={actionLoading === 2 || !collection_id || !items.some((item) => item.is_approved === true)}
          >
            {actionLoading === 2 ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Undo size={16} className="mr-2" />
            )}
            Desfazer aprovação de itens
          </Button>

          <Button
            variant="destructive"
            onClick={() => handleAdminAction(4)}
            disabled={
              actionLoading === 4 ||
              !collection_id ||
              items.some((item) => item.is_approved === true) ||
              !collection?.document_path
            }
          >
            {actionLoading === 4 ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <FileX size={16} className="mr-2" />
            )}
            Apagar parecer
          </Button>

          <Button
            variant="destructive"
            onClick={handleClearSei}
            disabled={
              clearingSei ||
              !collection_id ||
              !!collection?.document_path ||
              !collection?.sei_process
            }
          >
            {clearingSei ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <FileMinus size={16} className="mr-2" />
            )}
            Apagar processo SEI
          </Button>

          <Button
            variant="destructive"
            onClick={() => handleAdminAction(1)}
            disabled={actionLoading === 1 || !collection_id || !!collection?.sei_process}
          >
            {actionLoading === 1 ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Trash2 size={16} className="mr-2" />
            )}
            Remover itens não aprovados
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
