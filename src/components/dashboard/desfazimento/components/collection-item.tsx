// src/pages/collection/collection-item.tsx
import { Droppable } from "@hello-pangea/dnd";
import { CollectionDTO } from "../../collection/collection-page";

type CollectionItemProps = { props: CollectionDTO; type: string };

export function CollectionItem({ props }: CollectionItemProps) {
  return (
    <Droppable droppableId={props.id} type="CATALOG_ITEM">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          data-collection-id={props.id}
          className={`collection-drop-target relative rounded-md overflow-hidden transition border
            ${snapshot.isDraggingOver ? "border-blue-600 ring-2 ring-blue-600" : "border-neutral-200"}
            bg-white dark:bg-neutral-900`}
          style={{ minHeight: 140, pointerEvents: 'auto' }}
        >
          <div className="p-4 pointer-events-none">
            <div className="text-xs text-muted-foreground mb-1">
              DESFAZIMENTO
            </div>
            <h3 className="font-medium line-clamp-1">
              {props.name}
            </h3>
            <div className="text-xs text-muted-foreground mt-1">
              {props.created_at ? new Date(props.created_at).toLocaleDateString() : ""}
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {props.description || "Solte itens aqui para adicionar nesta coleção."}
            </p>
            {snapshot.isDraggingOver && (
              <div className="mt-3 text-xs text-blue-700">
                Solte para adicionar
              </div>
            )}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}