// src/components/roles/RoleMembers.tsx
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Button } from "../../../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import { Separator } from "../../../ui/separator";
import { Input } from "../../../ui/input";
import { Alert } from "../../../ui/alert";
import { Skeleton } from "../../../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { ArrowUUpLeft, MagnifyingGlass } from "phosphor-react";
import { Plus, Trash, User } from "lucide-react";
import { toast } from "sonner";
import { UserContext } from "../../../../context/context";

type UserInRoleDTO = {
  id: string;
  username: string;
  email: string;
  photo_url?: string | null;
};

type UsersResponse = {
  users: UserInRoleDTO[];
};

type Props = {
  roleId: string;
  title: string;
  className?: string;
};

export function RoleMembers({ roleId, title, className }: Props) {
  const { urlGeral } = useContext(UserContext);

  // Otimização: Evitar ler localStorage a cada render, apenas na montagem ou quando necessário
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;

  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const [roleUsers, setRoleUsers] = useState<UserInRoleDTO[]>([]);
  const [loadingRoleUsers, setLoadingRoleUsers] = useState(false);

  // Estado de add usuário
  const [allUsers, setAllUsers] = useState<UserInRoleDTO[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInRoleDTO | null>(null);

  // Estados para o Modal de Exclusão
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserInRoleDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  // MELHORIA 1: Filtrar usuários que JÁ estão no cargo para não aparecerem na lista de adicionar
  // MELHORIA 2: Filtro de busca (case insensitive)
  const availableUsers = useMemo(() => {
    return allUsers.filter((u) => {
      // Remove usuários que já estão no cargo
      const isAlreadyInRole = roleUsers.some((roleUser) => roleUser.id === u.id);
      if (isAlreadyInRole) return false;

      // Aplica o filtro de texto
      if (!userSearch) return true;
      return [u.username, u.email].some((f) => f?.toLowerCase().includes(userSearch.toLowerCase()));
    });
  }, [allUsers, roleUsers, userSearch]);

  const fetchRoleUsers = useCallback(async () => {
    try {
      setLoadingRoleUsers(true);
      const res = await fetch(`${urlGeral}roles/${roleId}/users`, {
        method: "GET",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`); // Simplificado msg de erro
      const data: UsersResponse = await res.json();
      setRoleUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (e: any) {
      toast.error("Erro ao carregar membros", { description: e?.message }); // Usando toast.error se disponível no sonner
      setRoleUsers([]);
    } finally {
      setLoadingRoleUsers(false);
    }
  }, [urlGeral, roleId, authHeaders]);

  const fetchUsers = useCallback(async () => {
    // Evita refetch se já tiver carregado (Opcional: remover se quiser dados sempre frescos)
    if (allUsers.length > 0) return;

    try {
      setLoadingUsers(true);
      const res = await fetch(`${urlGeral}users/`, { method: "GET", headers: authHeaders });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data: UsersResponse = await res.json();
      setAllUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (e: any) {
      toast.error("Erro ao carregar lista de usuários");
    } finally {
      setLoadingUsers(false);
    }
  }, [urlGeral, authHeaders, allUsers.length]);

  const handleOpenAddUser = async () => {
    setOpenUserDialog(true);
    setUserSearch("");
    setSelectedUser(null);
    await fetchUsers();
  };

  const handleAddUserToRole = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${urlGeral}roles/${roleId}/users/${selectedUser.id}`, {
        method: "POST",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`Falha ao adicionar (HTTP ${res.status}).`);

      toast.success("Usuário adicionado", {
        description: `${selectedUser.username} vinculado com sucesso.`,
      });

      setOpenUserDialog(false);
      setSelectedUser(null);
      await fetchRoleUsers(); // Atualiza a lista principal
    } catch (e: any) {
      toast.error("Erro ao adicionar usuário", { description: e?.message });
    }
  };

  // Abre o modal preparando o usuário alvo
  const handleOpenDelete = (user: UserInRoleDTO) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  // Fecha o modal e limpa o estado
  const closeDelete = () => {
    setIsDeleteOpen(false);
    setUserToDelete(null);
  };

  // Executa a exclusão confirmada
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      const res = await fetch(`${urlGeral}roles/${roleId}/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`Falha ao remover (HTTP ${res.status}).`);

      toast.success("Usuário removido", {
        description: `${userToDelete.username} removido do cargo.`,
      });
      await fetchRoleUsers();
      closeDelete();
    } catch (e: any) {
      toast.error("Erro ao remover usuário", { description: e?.message });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchRoleUsers();
  }, [fetchRoleUsers]);

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      {/* Avatares sobrepostos (até 5) */}
      <div className="flex items-center">
        {loadingRoleUsers ? (
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        ) : (
          <>
            {roleUsers.slice(0, 5).map((m, index) => (
              <div
                key={m.id}
                className="relative group"
                style={{ marginLeft: index > 0 ? "-10px" : "0px", zIndex: 5 - index }}
              >
                <div className="relative group-hover:z-50 transition-all">
                  {" "}
                  {/* Ajuste de Z-Index no hover */}
                  <Avatar
                    className="cursor-pointer rounded-full relative border-2 border-white dark:border-neutral-900 h-8 w-8 transition-transform group-hover:scale-110"
                    title={m.username}
                  >
                    <AvatarImage
                      className="rounded-md h-8 w-8 object-cover"
                      src={`${urlGeral}user/upload/${m.id}/icon`}
                      alt={m.username}
                    />
                    <AvatarFallback className="flex items-center justify-center bg-muted">
                      <User size={14} />
                    </AvatarFallback>
                  </Avatar>
                  {/* Botão Remover (Hover rápido) */}
                  <div
                    className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/50 rounded-full cursor-pointer z-50"
                    onClick={() => handleOpenDelete(m)} // <--- ALTERADO AQUI
                    title="Remover do cargo"
                  >
                    <Trash size={14} className="text-white" />
                  </div>
                </div>
              </div>
            ))}

            {/* Contador +N */}
            {roleUsers.length > 5 && (
              <Dialog>
                <DialogTrigger asChild>
                  <div
                    className="h-8 w-8 flex items-center justify-center text-gray-500 bg-gray-100 dark:bg-neutral-800 rounded-full border-2 border-white dark:border-neutral-900 text-xs font-medium cursor-pointer relative z-0 hover:bg-gray-200 transition-colors"
                    style={{ marginLeft: "-10px" }}
                    title="Ver todos os membros"
                  >
                    +{roleUsers.length - 5}
                  </div>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Gerenciar membros deste cargo.</DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col gap-2 mt-4 max-h-[300px] overflow-y-auto pr-1">
                    {roleUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`${urlGeral}user/upload/${u.id}/icon`} />
                            <AvatarFallback>
                              <User size={14} />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-none">{u.username}</span>
                            <span className="text-xs text-muted-foreground">{u.email}</span>
                          </div>
                        </div>
                        <div
                          className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/50 rounded-full cursor-pointer z-50"
                          onClick={() => handleOpenDelete(u)} // 
                          title="Remover do cargo"
                        >
                          <Trash size={14} className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </div>

      {/* Botão Adicionar */}
      <Button
        size="icon"
        variant="outline"
        onClick={handleOpenAddUser}
        className="rounded-full h-8 w-8 shrink-0 ml-1"
      >
        <Plus size={16} />
      </Button>

      {/* Dialog Adicionar Usuário */}
      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Vincular Usuário</DialogTitle>
            <DialogDescription>Busque usuários para adicionar a este cargo.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center border rounded-md px-3 py-2 bg-muted/50 mt-2">
            <MagnifyingGlass className="mr-2 h-4 w-4 text-muted-foreground" />
            <input
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
              placeholder="Buscar por nome ou e-mail..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          <div className="max-h-[250px] overflow-y-auto mt-2 space-y-1">
            {loadingUsers ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Carregando usuários...
              </div>
            ) : availableUsers.length > 0 ? (
              availableUsers.map((u) => (
                <button
                  key={u.id}
                  className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors text-sm ${
                    selectedUser?.id === u.id
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                  onClick={() => setSelectedUser(u)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`${urlGeral}user/upload/${u.id}/icon`} />
                    <AvatarFallback>
                      <User size={14} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium truncate">{u.username}</span>
                    <span className="text-xs text-muted-foreground truncate">{u.email}</span>
                  </div>
                  {selectedUser?.id === u.id && (
                    <div className="ml-auto text-xs font-semibold">Selecionado</div>
                  )}
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {userSearch
                  ? "Nenhum usuário encontrado."
                  : "Todos os usuários já estão neste cargo."}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenUserDialog(false)}>
              Cancelar
            </Button>
            <Button disabled={!selectedUser} onClick={handleAddUserToRole}>
              Adicionar Selecionado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog: Confirmar Exclusão */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
              Remover membro?
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Tem certeza que deseja remover <strong>{userToDelete?.username}</strong> deste cargo?
              O usuário perderá as permissões associadas imediatamente.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={closeDelete} disabled={deleting}>
              <ArrowUUpLeft size={16} className="mr-2" />
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
              <Trash size={16} className="mr-2" />
              {deleting ? "Removendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
