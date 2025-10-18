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
  title: string; // título para o diálogo de membros
  className?: string;
};

export function RoleMembers({ roleId, title, className }: Props) {
  const { urlGeral } = useContext(UserContext);
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null), []);
  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // Estado de membros do cargo
  const [roleUsers, setRoleUsers] = useState<UserInRoleDTO[]>([]);
  const [loadingRoleUsers, setLoadingRoleUsers] = useState(false);

  // Estado de add usuário
  const [allUsers, setAllUsers] = useState<UserInRoleDTO[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInRoleDTO | null>(null);

  const filteredUsers = allUsers.filter((u) =>
    [u.username, u.email].some((f) => f?.toLowerCase().includes(userSearch.toLowerCase()))
  );

  // Carrega membros do cargo
  const fetchRoleUsers = useCallback(async () => {
    try {
      setLoadingRoleUsers(true);
      const res = await fetch(`${urlGeral}roles/${roleId}/users`, { method: "GET", headers: authHeaders });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `Falha ao carregar membros (HTTP ${res.status}).`);
      const data: UsersResponse = await res.json();
      setRoleUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (e: any) {
      toast("Erro ao carregar membros do cargo", { description: e?.message || String(e) });
      setRoleUsers([]);
    } finally {
      setLoadingRoleUsers(false);
    }
  }, [urlGeral, roleId, authHeaders]);

  // Carrega todos usuários
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(`${urlGeral}users/`, { method: "GET", headers: authHeaders });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `Falha ao carregar usuários (HTTP ${res.status}).`);
      const data: UsersResponse = await res.json();
      setAllUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (e: any) {
      toast("Erro ao carregar usuários", { description: e?.message || String(e) });
    } finally {
      setLoadingUsers(false);
    }
  }, [urlGeral, authHeaders]);

  // Ações: adicionar / remover
  const handleOpenAddUser = async () => {
    setOpenUserDialog(true);
    setUserSearch("");
    setSelectedUser(null);
    if (!allUsers.length) await fetchUsers();
  };

  const handleAddUserToRole = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${urlGeral}roles/${roleId}/users/${selectedUser.id}`, { method: "POST", headers: authHeaders });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `Falha ao adicionar usuário (HTTP ${res.status}).`);
      toast("Usuário adicionado", { description: `${selectedUser.username} foi adicionado ao cargo.` });
      setOpenUserDialog(false);
      setSelectedUser(null);
      await fetchRoleUsers();
    } catch (e: any) {
      toast("Erro ao adicionar usuário", { description: e?.message || String(e) });
    }
  };

  const handleRemoveUserFromRole = async (userId: string) => {
    try {
      const res = await fetch(`${urlGeral}roles/${roleId}/users/${userId}`, { method: "DELETE", headers: authHeaders });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `Falha ao remover usuário (HTTP ${res.status}).`);
      toast("Usuário removido", { description: `O usuário foi removido do cargo.` });
      await fetchRoleUsers();
    } catch (e: any) {
      toast("Erro ao remover usuário", { description: e?.message || String(e) });
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
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ) : (
          <>
            {roleUsers.slice(0, 5).map((m, index) => (
              <div key={m.id} className="relative group" style={{ marginLeft: index > 0 ? "-10px" : "0px" }}>
                <div className="relative group-hover:z-20">
                  <Avatar
                    className="cursor-pointer rounded-full relative border dark:border-neutral-800 h-8 w-8 transition-transform group-hover:scale-110"
                    title={m.username}
                  >
                    <AvatarImage className="rounded-md h-8 w-8" src={`${urlGeral}user/upload/${m.id}/icon`} alt={m.username} />
                    <AvatarFallback className="flex items-center justify-center">
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>

                  {/* Remover no hover */}
                  <div
                    className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/30 rounded-full cursor-pointer"
                    onClick={() => handleRemoveUserFromRole(m.id)}
                    title="Remover do cargo"
                  >
                    <Trash size={16} className="text-white" />
                  </div>
                </div>
              </div>
            ))}

            {/* +N → Dialog com todos */}
            {roleUsers.length > 5 && (
              <Dialog>
                <DialogTrigger asChild>
                  <div
                    className="h-8 w-8 flex items-center justify-center text-gray-500 bg-gray-100 dark:bg-neutral-800 rounded-full border dark:border-neutral-700 text-xs font-medium cursor-pointer"
                    style={{ marginLeft: "-10px" }}
                    title="Ver todos os membros"
                  >
                    +{roleUsers.length - 5}
                  </div>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">{title}</DialogTitle>
                    <DialogDescription className="text-zinc-500">Usuários vinculados ao cargo.</DialogDescription>
                  </DialogHeader>

                  <Separator className="my-4" />

                  <div className="grid gap-3 mb-4 w-full max-h-[300px] overflow-y-auto pr-2 ">
                    {loadingRoleUsers ? (
                      <div className="flex flex-col gap-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : roleUsers.length > 0 ? (
                      <div className="flex-col flex gap-3">
                        {roleUsers.map((u) => (
                          <Button key={u.id} variant="ghost" className="text-left justify-between h-auto">
                            <div className="flex items-center gap-2">
                              <Avatar className="cursor-pointer rounded-md h-8 w-8 ">
                                <AvatarImage className="h-8 w-8" src={`${urlGeral}user/upload/${u.id}/icon`} />
                                <AvatarFallback>
                                  <User size={12} />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{u.username}</p>
                                <div className="text-xs text-gray-500">({u.email})</div>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleRemoveUserFromRole(u.id)}
                              variant="destructive"
                              size="icon"
                              className="w-8 h-8"
                              title="Remover do cargo"
                            >
                              <Trash size={16} />
                            </Button>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Nenhum membro neste cargo.</div>
                    )}
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">
                        <ArrowUUpLeft size={16} /> Cancelar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </div>

      {/* Botão Adicionar usuário ao cargo */}
      <Button size="icon" variant="outline" onClick={handleOpenAddUser} className="rounded-full h-8 w-8">
        <Plus size={16} /> 
      </Button>

      {/* Dialog: Adicionar usuário ao cargo */}
      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Escolher usuário</DialogTitle>
            <DialogDescription className="text-zinc-500 ">Todos os usuários cadastrados no sistema.</DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <Alert className="p-0 flex gap-2 items-center px-4 h-12">
              <div><MagnifyingGlass size={16} /></div>
            <Input
              className="border-0"
              placeholder="Buscar por nome ou e-mail…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </Alert>

          <div className="max-h-[250px] overflow-y-auto">
            <div className="flex flex-col gap-1 p-2">
              {loadingUsers ? (
                <div className="p-4 text-sm text-center text-gray-500">Carregando…</div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <Button
                    key={u.id}
                    variant={"ghost"}
                    className={`text-left justify-start h-auto ${
                      selectedUser?.id === u.id ? "bg-neutral-100 dark:bg-neutral-800" : ""
                    }`}
                    onClick={() => setSelectedUser(u)}
                  >
                   <Avatar className="cursor-pointer rounded-md h-8 w-8 mr-2">
                      <AvatarImage className="h-8 w-8" src={`${urlGeral}user/upload/${u.id}/icon`} />
                      <AvatarFallback>
                        <User size={12} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{u.username}</p>
                      <div className="text-xs text-gray-500 font-normal">({u.email})</div>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center w-full text-sm">Nenhum usuário encontrado</div>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">
                <ArrowUUpLeft size={16} /> Cancelar
              </Button>
            </DialogClose>
            <Button disabled={!selectedUser} onClick={handleAddUserToRole}>
              <Plus size={16} /> Vincular usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
