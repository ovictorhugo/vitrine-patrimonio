import { TabsContent } from "../../../ui/tabs";
import { Skeleton } from "../../../ui/skeleton";
import { CollectionItem } from "../../desfazimento/components/add-collection";
import { ItemPatrimonio } from "../components/item-patrimonio";

interface InCollectionTabProps {
  loadingItems: boolean;
  items: CollectionItem[];
  selectedItems?: Set<string>;
  toggleItem?: (id: string) => void;
}

export function InCollectionTab({
  loadingItems,
  items,
  selectedItems,
  toggleItem,
}: InCollectionTabProps) {
  const filteredItems = items.filter((e) => e.is_approved == null);

  return (
    <TabsContent value="in-collection">
      <div className="p-8 pt-0">
        {loadingItems ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-70" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="items-center justify-center w-full flex text-center pt-6">
            Nenhum item por aqui.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-1">
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
        )}
      </div>
    </TabsContent>
  );
}
