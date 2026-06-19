import { CollectionDTO } from "../../collection/collection-page";
import { Button } from "../../../ui/button";
import { Pencil, Trash, Calendar, UserIcon } from "lucide-react";
import { Alert } from "../../../ui/alert";
import { CardContent } from "../../../ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "../../../authentication/signIn";
import { useContext, useRef } from "react";
import { usePermissions } from "../../../permissions";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { UserContext } from "../../../../context/context";

type CollectionItemProps = {
  props: CollectionDTO;
  type: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function CollectionItem({
  props,
  type,
  onEdit,
  onDelete,
}: CollectionItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryUrl = useQuery();

  const wasDraggingOverRef = useRef(false);

  const handleOpen = (dep_id: string) => {
    if (wasDraggingOverRef.current) return;
    queryUrl.set("collection_id", dep_id);
    navigate({ pathname: location.pathname, search: queryUrl.toString() });
  };

  const { hasColecoes } = usePermissions();
  const { urlGeral } = useContext(UserContext);
  const requesterName = props?.user?.username || "N/A";

  return (
    <div
      data-collection-id={props.id}
      className="collection-drop-target group relative"
      style={{
        pointerEvents: "auto",
      }}
      onClick={() => handleOpen(props.id)}
    >
      <div className="absolute top-4 right-4 hidden group-hover:flex gap-2 z-[2]">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
        >
          <Pencil size={16} />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          <Trash size={16} />
        </Button>
      </div>

      <div className="absolute top-4 left-4 hidden group-hover:flex gap-2 z-[2]">
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className="rounded-md h-8 w-8 shrink-0">
              <AvatarImage
                src={`${urlGeral}user/upload/${props?.user_id}/icon`}
              />
              <AvatarFallback>
                <UserIcon size={12} />
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{requesterName}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="w-full">
        <Alert className="bg-center cursor-pointer bg-cover bg-no-repeat p-0">
          <CardContent className="flex aspect-square justify-end flex-col p-4">
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
    </div>
  );
}
