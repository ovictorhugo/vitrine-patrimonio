import { Droppable } from "@hello-pangea/dnd";
import { CollectionDTO } from "../../collection/collection-page";
import { Button } from "../../../ui/button";
import { Pencil, Trash, Calendar } from "lucide-react";
import { Alert } from "../../../ui/alert";
import { CardContent } from "../../../ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "../../../authentication/signIn";
import { useRef } from "react";

type CollectionItemProps = {
  props: CollectionDTO;
  type: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function CollectionItem({ props, type, onEdit, onDelete }: CollectionItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryUrl = useQuery();

  const wasDraggingOverRef = useRef(false);

  const handleOpen = (dep_id: string) => {
    // Se estava em estado de drag-over, evita navegação acidental por click bubbling
    if (wasDraggingOverRef.current) return;
    queryUrl.set("collection_id", dep_id);
    navigate({ pathname: location.pathname, search: queryUrl.toString() });
  };

  return (
    <Droppable droppableId={props.id} type="CATALOG_ITEM">
      {(provided, snapshot) => {
        // memoriza se esteve em drag-over neste frame
        wasDraggingOverRef.current = snapshot.isDraggingOver;

        return (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            data-collection-id={props.id}
            className="collection-drop-target group relative rounded-md overflow-hidden border border-neutral-200 bg-white dark:bg-neutral-900"
            style={{
              // tamanho estável (sem “pular” ao arrastar)
              minHeight: 180,
              pointerEvents: "auto",
            }}
            onClick={() => handleOpen(props.id)}
          >
            {/* conteúdo clicável (mantém layout fixo) */}
            <div className="w-full">
              <Alert className="bg-center cursor-pointer bg-cover bg-no-repeat">
                <CardContent className="flex aspect-square justify-between flex-col p-4">
                  <p className="font-medium uppercase flex items-center gap-1 text-xs text-gray-500">
                    {type}
                  </p>
                  <div>
                    <p className="font-bold text-2xl truncate" title={props.name}>
                      {props.name}
                    </p>
                    <p className="font-medium flex items-center gap-1 text-xs mt-1 text-gray-500">
                      <Calendar size={12} />
                      {props.created_at
                        ? new Date(props.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                </CardContent>
              </Alert>
            </div>

            {/* botões (não alteram o tamanho) */}
            <div className="absolute top-2 right-2 hidden group-hover:flex gap-2 z-[2]">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              >
                <Pencil size={16} />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              >
                <Trash size={16} />
              </Button>
            </div>

            {/* highlight azul cobrindo TODO o card, sem empurrar layout */}
            {snapshot.isDraggingOver && (
              <div className="pointer-events-none absolute inset-0 rounded-md outline outline-2 outline-blue-600" />
            )}

            {/* IMPORTANTE: NÃO renderizar placeholder aqui
                Como esse Droppable é apenas alvo (sem lista interna de Draggables),
                o placeholder adiciona altura extra durante o drag.
            */}
          </div>
        );
      }}
    </Droppable>
  );
}
