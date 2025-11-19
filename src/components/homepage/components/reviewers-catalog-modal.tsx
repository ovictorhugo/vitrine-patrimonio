import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CatalogResponseDTO } from "../../modal/catalog-modal";

import { Button } from "../../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Label } from "../../ui/label";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../ui/command";

import {
  ChevronsUpDown,
  Loader2,
  RefreshCcw,
  Trash,
  User as UserIcon,
  Check,
  CheckIcon,
} from "lucide-react";

import { toast } from "sonner";
import { cn } from "../../../lib";
import { UserContext } from "../../../context/context";

type UUID = string;

type RoleUser = {
  id: UUID;
  username: string;
  email: string;
  photo_url?: string | null;
};

interface Props {
  catalog: CatalogResponseDTO;
  roleId: string; // role usado em /roles/{role_id}/users
}

export function ReviewersCatalogModal({ catalog, roleId }: Props) {
  const { urlGeral } = useContext(UserContext);
 const token = localStorage.getItem("jwt_token") || "";
  const [users, setUsers] = useState<RoleUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<RoleUser | null>(null);
  const [open, setOpen] = useState(false);

  /* ==================== Revisor inicial do histórico ==================== */

  const initialReviewer = useMemo(() => {
    const history = (catalog as any)?.workflow_history ?? [];

    const requested = history.find(
      (h: any) => h?.workflow_status === "REVIEW_REQUESTED_COMISSION"
    );

    const reviewers = requested?.detail?.reviewers as
      | { id: string; username: string }[]
      | undefined;

    if (!reviewers || reviewers.length === 0) return null;

    return reviewers[0]; // { id, username }
  }, [catalog]);

  /* ==================== Buscar usuários da role ==================== */

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      setError(null);

      const res = await fetch(`${urlGeral}roles/${roleId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao buscar usuários da comissão.");
      }

      const data: { users: any[] } = await res.json();

      const mapped: RoleUser[] = (data.users ?? []).map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        photo_url: u.photo_url,
      }));

      setUsers(mapped);

      // Ajusta o selecionado com base no revisor inicial, se existir
      if (initialReviewer) {
        const found = mapped.find((u) => u.id === initialReviewer.id);
        if (found) {
          setSelectedUser(found);
        } else if (mapped.length > 0 && !selectedUser) {
          setSelectedUser(mapped[0]);
        }
      } else if (mapped.length > 0 && !selectedUser) {
        setSelectedUser(mapped[0]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Não foi possível carregar os usuários.");
      toast.error("Não foi possível carregar os usuários da comissão.");
    } finally {
      setIsLoadingUsers(false);
    }
  }, [urlGeral, roleId, token, initialReviewer, selectedUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ==================== PUT para mudar o reviewer ==================== */

  const handleChangeReviewer = async () => {
    if (!selectedUser) {
      toast.error("Selecione um revisor antes de salvar.");
      return;
    }

    try {
      setIsSaving(true);

      const res = await fetch(`${urlGeral}catalog/${catalog.id}/reviewers`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([selectedUser.id]),
      });

      if (!res.ok) {
        throw new Error("Erro ao atualizar o revisor.");
      }

      toast.success("Revisor atualizado com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.error("Não foi possível atualizar o revisor.");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerLabel =
    selectedUser?.username ??
    (isLoadingUsers ? "Carregando usuários..." : "Selecione um revisor");

  const triggerClassName =
    "w-full justify-between";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <Label className="text-sm font-medium">
            Revisor responsável pela comissão
          </Label>
          {initialReviewer && (
            <p className="text-xs text-muted-foreground">
              Revisor atual no histórico:{" "}
              <span className="font-medium">{initialReviewer.username}</span>
            </p>
          )}
        </div>

      </div>

      {/* ============ Combobox no padrão do Popover + Command que você mandou ============ */}
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild disabled={isLoadingUsers || users.length === 0}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={triggerClassName}
          >
            <span className="truncate text-left flex items-center gap-2">
              {selectedUser ? (
                <>
                  <Avatar className="h-6 w-6 rounded-md">
                    <AvatarImage
                      className="h-6 w-6 rounded-md"
                      src={
                        selectedUser.photo_url ||
                        `${urlGeral}user/upload/${selectedUser.id}/icon`
                      }
                    />
                    <AvatarFallback className="flex items-center justify-center">
                      <UserIcon size={12} />
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {selectedUser.username}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({selectedUser.email})
                    </span>
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">{triggerLabel}</span>
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="z-[99999] p-0 w-full" side="bottom">
          <Command>
            <CommandInput placeholder="Buscar revisor..." />
            <CommandList className="max-h-64">
              <CommandEmpty>Nenhum usuário encontrado</CommandEmpty>

              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setSelectedUser(null);
                    setOpen(false);
                  }}
                >
                  <Trash className="mr-2 h-4 w-4 opacity-60" />
                  <span className="text-muted-foreground">
                    Limpar seleção
                  </span>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup>
                {users.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <CommandItem
                      key={u.id}
                      value={`${u.username} ${u.email}`}
                      onSelect={() => {
                        setSelectedUser(u);
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <Avatar className="h-7 w-7 rounded-md mr-2">
                        <AvatarImage
                          className="h-7 w-7 rounded-md"
                          src={
                            u.photo_url ||
                            `${urlGeral}user/upload/${u.id}/icon`
                          }
                        />
                        <AvatarFallback className="flex items-center justify-center">
                          <UserIcon size={12} />
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm">
                        {u.username}{" "}
                        <span className="text-[11px] text-muted-foreground">
                          ({u.email})
                        </span>
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleChangeReviewer}
          disabled={!selectedUser || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Atualizar revisor
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
