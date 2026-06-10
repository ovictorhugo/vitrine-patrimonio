import { TabsContent } from "../../../ui/tabs";
import { Skeleton } from "../../../ui/skeleton";
import { PatrimonioItemCollection } from "../components/patrimonio-item-inventario";
import React from "react";
import { CollectionItem } from "../../desfazimento/components/add-collection";
import { ItemPatrimonio } from "../components/item-patrimonio";

interface ApprovedTabProps {
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
  collection?: any;
}

export function ApprovedTab({
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
  collection,
}: ApprovedTabProps) {
  const filteredItems = items.filter((e) => e.is_approved === true);


  return (
    <TabsContent value="aprovados">
      <div className="p-8 pt-0">
        {loadingItems ? (
          <div className="flex gap-4 flex-col">
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="items-center justify-center w-full flex text-center pt-6">
            Nenhum item aprovado.
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredItems.map((ci) => (
              <ItemPatrimonio
                key={ci.id}
                {...(ci.catalog as any)}
                selected={selectedItems?.has(ci.catalog.id)}
                isApproved={ci.is_approved === true}
                onItemClick={toggleItem}
              />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredItems.map((ci) => (
              <PatrimonioItemCollection
                key={ci.id}
                invId={ci.catalog?.id ?? ci.id}
                entry={ci.catalog as any}
                collectionId={String(collection_id)}
                itemId={ci.id}
                sel={ci.status ? "true" : "false"}
                comm={ci.comment ?? ""}
                isLocked={!!collection?.document_path || !!collection?.sei_process}
                onUpdated={(patch) => {
                  const prevStatus = ci.status;
                  const hasNewStatus = typeof patch.status === "boolean";

                  if (hasNewStatus && patch.status !== prevStatus) {
                    if (patch.status === true) {
                      // pendente -> coletado (aprovado)
                      setCountNaoDesfazimento((prev) => prev + 1);
                    } else {
                      // coletado (aprovado) -> pendente
                      setCountNaoDesfazimento((prev) =>
                        prev > 0 ? prev - 1 : prev,
                      );
                    }
                  }

                  setItems((prev) =>
                    prev.map((it) =>
                      it.id === ci.id
                        ? {
                          ...it,
                          status:
                            typeof patch.status === "boolean"
                              ? patch.status
                              : it.status,
                          comment:
                            typeof patch.comment === "string"
                              ? patch.comment
                              : it.comment,
                        }
                        : it,
                    ),
                  );
                }}
                onDeleted={handleItemDeleted}
                selected={selectedItems?.has(ci.catalog.id)}
                onItemClick={toggleItem}
              />
            ))}
          </div>
        )}
      </div>
    </TabsContent>
  );
}
