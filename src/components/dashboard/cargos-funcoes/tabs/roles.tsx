import {
  Plus,
  Loader2,
  Trash,
  User,
  Briefcase,
  ChevronsUpDown,
  Check,
  GitBranchPlus,
  Pencil,
} from "lucide-react";
import { Alert } from "../../../ui/alert";
import { Button } from "../../../ui/button";
import { CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { UserContext } from "../../../../context/context";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { toast } from "sonner";
import { Skeleton } from "../../../ui/skeleton";
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
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { ArrowUUpLeft, MagnifyingGlass } from "phosphor-react";
import { Separator } from "../../../ui/separator";
import { Textarea } from "../../../ui/textarea";

/** shadcn combobox */
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../ui/command";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../ui/carousel";
import { usePermissions } from "../../../permissions";

/* ============================
   Types
   ============================ */
export type PermissionDTO = {
  id: string;
  name: string;
  code: string;
  description: string;
};

export type RoleSimpleDTO = {
  id: string;
  name: string;
  description: string;
};

export type SystemIdentityDTO = {
  id: string;
  legal_guardian: {
    legal_guardians_code: string;
    legal_guardians_name: string;
    id: string;
  };
};

export type UserInRoleDTO = {
  id: string;
  username: string;
  email: string;
  provider: string;
  linkedin: string;
  lattes_id: string;
  orcid: string;
  ramal: string;
  photo_url: string;
  background_url: string;
  matricula: string;
  verify: boolean;
  institution_id: string;
  roles: RoleSimpleDTO[];
  system_identity: SystemIdentityDTO;
};

export type RoleDTO = {
  id: string;
  name: string;
  description: string;
  permissions: PermissionDTO[];
};

export type RolesResponse = {
  roles: RoleDTO[];
};

export type UsersResponse = {
  users: UserInRoleDTO[];
};

/* ============================
   Helpers
   ============================ */
function generatePermissionCodeFromName(name: string): string {
  const noAccents = name.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return noAccents
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_")
    .toUpperCase();
}

// Helpers padronizados p/ evitar updates se falhar
async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
async function assertOk(res: Response, fallbackMsg = "Falha na requisição") {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${fallbackMsg} (HTTP ${res.status})`);
  }
}

type RolesProps = {
  openCreatePerm: boolean;
  setOpenCreatePerm: (open: boolean) => void;

  // NOVO: controle do modal de listar permissões vindo do pai
  openListPerm: boolean;
  setOpenListPerm: (open: boolean) => void;
};

/* ============================
   Component
   ============================ */
export function Roles({ openCreatePerm, setOpenCreatePerm, openListPerm, setOpenListPerm }: RolesProps) {
  // criação de role
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // listagem de roles
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // criar/excluir role
  const [creating, setCreating] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // editar role
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTarget, setEditTarget] = useState<RoleDTO | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // dialog principal de criação de role
  const [isOpen, setIsOpen] = useState(false);

  // usuários (para adicionar em um role)
  const [allUsers, setAllUsers] = useState<UserInRoleDTO[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [openUserDialogForRoleId, setOpenUserDialogForRoleId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserInRoleDTO | null>(null);
  const filteredUsers = allUsers.filter((u) =>
    [u.username, u.email].some((f) => f?.toLowerCase().includes(userSearch.toLowerCase()))
  );

  // permissões (popup por role)
  const [openPermissionsForRoleId, setOpenPermissionsForRoleId] = useState<string | null>(null);
  const [removingPermId, setRemovingPermId] = useState<string | null>(null);

  // catálogo global de permissões (para combobox)
  const [allPermissions, setAllPermissions] = useState<PermissionDTO[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [permPopoverOpen, setPermPopoverOpen] = useState(false);
  const [selectedPermissionId, setSelectedPermissionId] = useState<string>("");

  // criar permissão global
  const [creatingGlobalPerm, setCreatingGlobalPerm] = useState(false);
  const [newPermName, setNewPermName] = useState("");
  const [newPermDesc, setNewPermDesc] = useState("");

  // 🔹 Mapa de usuários por cargo e estados de loading por cargo
  const [roleUsers, setRoleUsers] = useState<Record<string, UserInRoleDTO[]>>({});
  const [loadingRoleUsers, setLoadingRoleUsers] = useState<Record<string, boolean>>({});

  const { urlGeral, permission } = useContext(UserContext);
  const token = useMemo(() => localStorage.getItem("jwt_token"), []);
  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  /* ============================
     API helpers
     ============================ */
  const fetchRoles = useCallback(async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${urlGeral}roles/`, { method: "GET", headers: authHeaders });
      await assertOk(res, "Falha ao carregar cargos");
      const data = await safeJson<RolesResponse>(res);
      setRoles(Array.isArray(data?.roles) ? data!.roles : []);
    } catch (e: any) {
      toast("Erro ao carregar cargos", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    } finally {
      setLoadingList(false);
    }
  }, [urlGeral, authHeaders]);

  // 🔹 Carrega usuários de UM cargo
  const fetchRoleUsers = useCallback(
    async (roleId: string) => {
      try {
        setLoadingRoleUsers((prev) => ({ ...prev, [roleId]: true }));
        const res = await fetch(`${urlGeral}roles/${roleId}/users`, { method: "GET", headers: authHeaders });
        await assertOk(res, "Falha ao carregar usuários do cargo");
        const data = await safeJson<UsersResponse>(res);
        setRoleUsers((prev) => ({ ...prev, [roleId]: Array.isArray(data?.users) ? data!.users : [] }));
      } catch (e: any) {
        toast("Erro ao carregar membros do cargo", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
        setRoleUsers((prev) => ({ ...prev, [roleId]: [] }));
      } finally {
        setLoadingRoleUsers((prev) => ({ ...prev, [roleId]: false }));
      }
    },
    [urlGeral, authHeaders]
  );

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(`${urlGeral}users/`, { method: "GET", headers: authHeaders });
      await assertOk(res, "Falha ao carregar usuários");
      const data = await safeJson<UsersResponse>(res);
      setAllUsers(Array.isArray(data?.users) ? data!.users : []);
    } catch (e: any) {
      toast("Erro ao carregar usuários", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    } finally {
      setLoadingUsers(false);
    }
  }, [urlGeral, authHeaders]);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoadingPerms(true);
      const res = await fetch(`${urlGeral}roles/permissions`, { method: "GET", headers: authHeaders });
      await assertOk(res, "Falha ao carregar permissões");
      const data = await safeJson<PermissionDTO[]>(res);
      setAllPermissions(Array.isArray(data) ? data! : []);
    } catch (e: any) {
      toast("Erro ao carregar permissões", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    } finally {
      setLoadingPerms(false);
    }
  }, [urlGeral, authHeaders]);

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlGeral]);

  // 🔹 Sempre que a lista de cargos mudar, buscar usuários por cargo (com skeleton por cargo)
  useEffect(() => {
    if (!roles?.length) return;
    roles.forEach((r) => {
      if (roleUsers[r.id] === undefined && loadingRoleUsers[r.id] !== true) {
        fetchRoleUsers(r.id);
      }
    });
  }, [roles, fetchRoleUsers, roleUsers, loadingRoleUsers]);

  /* ============================
     Create role
     ============================ */
  const handleCreateRole = async () => {
    try {
      if (!name.trim()) {
        toast("Informe o nome do cargo", { description: "O campo 'Nome' está vazio.", action: { label: "Fechar", onClick: () => {} } });
        return;
      }
      setCreating(true);
      const res = await fetch(`${urlGeral}roles/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      await assertOk(res, "Falha ao criar cargo");
      const created = await safeJson<RoleDTO>(res);

if (created && created.id) {
  setRoles((prev) => [
    ...prev,
    {
      ...created, // primeiro espalha o objeto vindo da API
      permissions: created.permissions ?? [], // depois garante o fallback seguro
    },
  ]);
} else {
  await fetchRoles();
}

      toast("Cargo criado com sucesso!", { description: `“${name.trim()}” foi adicionado.`, action: { label: "Fechar", onClick: () => {} } });
      setName(""); setDescription(""); setIsOpen(false);
    } catch (e: any) {
      toast("Erro ao criar cargo", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    } finally { setCreating(false); }
  };

  /* ============================
     Edit role (PATCH)
     ============================ */
  const openEditDialog = (role: RoleDTO) => {
    setEditTarget(role);
    setEditName(role.name);
    setEditDesc(role.description || "");
    setEditOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!editTarget) return;
    if (!editName.trim()) {
      toast("Informe o nome do cargo", { description: "O campo 'Nome' está vazio.", action: { label: "Fechar", onClick: () => {} } });
      return;
    }
    try {
      setEditing(true);
      const res = await fetch(`${urlGeral}roles/${editTarget.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() }),
      });
      await assertOk(res, "Falha ao editar cargo");
      const updated = await safeJson<RoleDTO>(res);

      // ✅ Atualiza localmente apenas após sucesso
      if (updated && updated.id) {
        setRoles((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
      } else {
        // Sem payload -> atualiza localmente com os campos editados
        setRoles((prev) =>
          prev.map((r) => (r.id === editTarget.id ? { ...r, name: editName.trim(), description: editDesc.trim() } : r))
        );
      }

      toast("Cargo atualizado", { description: `“${editName.trim()}” foi salvo.`, action: { label: "Fechar", onClick: () => {} } });
      setEditOpen(false);
      setEditTarget(null);
      setEditName("");
      setEditDesc("");
    } catch (e: any) {
      toast("Erro ao editar cargo", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    } finally {
      setEditing(false);
    }
  };

  /* ============================
     Delete role
     ============================ */
  const openDeleteDialog = (id: string, roleName: string) => {
    setDeleteTarget({ id, name: roleName }); setDeleteText(""); setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`${urlGeral}roles/${deleteTarget.id}`, { method: "DELETE", headers: authHeaders });
      await assertOk(res, "Falha ao excluir cargo");

      // ✅ Remove localmente após sucesso
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setRoleUsers((prev) => {
        const { [deleteTarget.id]: _, ...rest } = prev;
        return rest;
      });
      setLoadingRoleUsers((prev) => {
        const { [deleteTarget.id]: _, ...rest } = prev;
        return rest;
      });

      toast("Cargo excluído", { description: `“${deleteTarget.name}” foi removido.`, action: { label: "Fechar", onClick: () => {} } });
      setDeleteOpen(false); setDeleteTarget(null); setDeleteText("");
    } catch (e: any) {
      toast("Erro ao excluir cargo", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    } finally { setDeleting(false); }
  };

  const confirmEnabled = deleteTarget && deleteText.trim() === deleteTarget.name;

  /* ============================
     Users in role (add/remove)
     ============================ */
  const handleOpenAddUser = async (roleId: string) => {
    setOpenUserDialogForRoleId(roleId);
    setUserSearch(""); setSelectedUser(null);
    if (!allUsers.length) await fetchUsers();
  };

  const handleAddUserToRole = async (roleId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${urlGeral}roles/${roleId}/users/${selectedUser.id}`, { method: "POST", headers: authHeaders });
      await assertOk(res, "Falha ao adicionar usuário");

      // ✅ Atualiza localmente após sucesso
      setRoleUsers((prev) => {
        const current = prev[roleId] ?? [];
        const exists = current.some((u) => u.id === selectedUser.id);
        return { ...prev, [roleId]: exists ? current : [...current, selectedUser] };
      });

      toast("Usuário adicionado", { description: `${selectedUser.username} foi adicionado ao cargo.`, action: { label: "Fechar", onClick: () => {} } });
      setOpenUserDialogForRoleId(null); setSelectedUser(null);
    } catch (e: any) {
      toast("Erro ao adicionar usuário", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    }
  };

  const handleRemoveUserFromRole = async (roleId: string, userId: string) => {
    try {
      const res = await fetch(`${urlGeral}roles/${roleId}/users/${userId}`, { method: "DELETE", headers: authHeaders });
      await assertOk(res, "Falha ao remover usuário");

      // ✅ Remove localmente após sucesso
      setRoleUsers((prev) => {
        const current = prev[roleId] ?? [];
        return { ...prev, [roleId]: current.filter((u) => u.id !== userId) };
      });

      toast("Usuário removido", { description: `O usuário foi removido do cargo.`, action: { label: "Fechar", onClick: () => {} } });
    } catch (e: any) {
      toast("Erro ao remover usuário", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    }
  };

  /* ============================
     Permissions management
     ============================ */
  const handleOpenPermissionsForRole = async (open: boolean, roleId: string) => {
    setOpenPermissionsForRoleId(open ? roleId : null);
    setSelectedPermissionId("");
    if (open && !allPermissions.length) await fetchPermissions();
  };

  const handleLinkPermissionToRole = async (roleId: string) => {
    if (!selectedPermissionId.trim()) {
      toast("Selecione uma permissão", { description: "Escolha uma permissão no seletor para vincular.", action: { label: "Fechar", onClick: () => {} } });
      return;
    }
    try {
      const res = await fetch(`${urlGeral}roles/${roleId}/permissions?permission_id=${selectedPermissionId}`, {
        method: "POST",
        headers: authHeaders
      });
      await assertOk(res, "Falha ao vincular permissão");

      // ✅ Injeta localmente apenas se sucesso
      const perm = allPermissions.find((p) => p.id === selectedPermissionId);
      if (perm) {
        setRoles((prev) =>
          prev.map((r) =>
            r.id === roleId
              ? {
                  ...r,
                  permissions: r.permissions?.some((p) => p.id === perm.id)
                    ? r.permissions
                    : [...(r.permissions ?? []), perm],
                }
              : r
          )
        );
      } else {
        // Fallback raro: recarrega
        await fetchRoles();
      }

      toast("Permissão vinculada", { description: `Permissão associada ao cargo.`, action: { label: "Fechar", onClick: () => {} } });
      setSelectedPermissionId("");
    } catch (e: any) {
      toast("Erro ao vincular permissão", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    }
  };

  const handleRemovePermissionFromRole = async (roleId: string, permissionId: string) => {
    try {
      setRemovingPermId(permissionId);
      const res = await fetch(`${urlGeral}roles/${roleId}/permissions/${permissionId}`, { method: "DELETE", headers: authHeaders });
      await assertOk(res, "Falha ao remover permissão");

      // ✅ Remove localmente após sucesso
      setRoles((prev) =>
        prev.map((r) =>
          r.id === roleId ? { ...r, permissions: (r.permissions ?? []).filter((p) => p.id !== permissionId) } : r
        )
      );

      toast("Permissão removida", { description: `Permissão dissociada do cargo.`, action: { label: "Fechar", onClick: () => {} } });
    } catch (e: any) {
      toast("Erro ao remover permissão", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    } finally { setRemovingPermId(null); }
  };

  // Criar permissão global (fora de roles) — code gerado automaticamente
  const handleCreateGlobalPermission = async () => {
    try {
      if (!newPermName.trim()) {
        toast("Preencha o nome da permissão", { description: "Campo obrigatório.", action: { label: "Fechar", onClick: () => {} } });
        return;
      }
      const generatedCode = generatePermissionCodeFromName(newPermName.trim());
      setCreatingGlobalPerm(true);
      const res = await fetch(`${urlGeral}roles/permissions`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name: newPermName.trim(),
          code: generatedCode,
          description: newPermDesc.trim(),
        }),
      });
      await assertOk(res, "Falha ao criar permissão");
      const created = await safeJson<PermissionDTO>(res);

      // ✅ Atualiza localmente apenas se sucesso
      if (created && created.id) {
        setAllPermissions((prev) => {
          const exists = prev.some((p) => p.id === created.id);
          return exists ? prev : [...prev, created];
        });
      } else {
        await fetchPermissions();
      }

      toast("Permissão criada", { description: `“${newPermName.trim()}” (${generatedCode}) foi criada no catálogo global.`, action: { label: "Fechar", onClick: () => {} } });
      setNewPermName(""); setNewPermDesc(""); setOpenCreatePerm(false);
    } catch (e: any) {
      toast("Erro ao criar permissão", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    } finally { setCreatingGlobalPerm(false); }
  };

  const membersCount = (roleId: string) => roleUsers[roleId]?.length ?? 0;

  /* ===== Permissões: listar & deletar (modal global) ===== */
useEffect(() => {
  if (openListPerm) {
    // quando abrir, garantir catálogo atualizado
    fetchPermissions();
  } else {
    // limpamos a busca quando fechar
    setPermSearch("");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [openListPerm]);


const [permSearch, setPermSearch] = useState("");
const [deletingGlobalPermId, setDeletingGlobalPermId] = useState<string | null>(null);

// abrir modal e garantir que as permissões estejam carregadas
const openPermissionsModal = async (open: boolean) => {
  setOpenListPerm(open);
  if (open) {
    // Recarrega catálogo quando abrir (útil se houve mudanças)
    await fetchPermissions();
  } else {
    setPermSearch("");
  }
};

// exclusão global de permissão
const handleDeleteGlobalPermission = async (permissionId: string) => {
  try {
    setDeletingGlobalPermId(permissionId);
    const res = await fetch(`${urlGeral}roles/permissions/${permissionId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    await assertOk(res, "Falha ao excluir permissão");

    // ✅ Só atualiza o estado local se deu certo
    setAllPermissions((prev) => prev.filter((p) => p.id !== permissionId));

    toast("Permissão excluída", {
      description: "A permissão foi removida do catálogo global.",
      action: { label: "Fechar", onClick: () => {} },
    });
  } catch (e: any) {
    toast("Erro ao excluir permissão", {
      description: e?.message || String(e),
      action: { label: "Fechar", onClick: () => {} },
    });
  } finally {
    setDeletingGlobalPermId(null);
  }
};

// lista filtrada para o modal
const filteredAllPermissions = useMemo(() => {
  if (!permSearch.trim()) return allPermissions;
  const q = permSearch.toLowerCase();
  return allPermissions.filter(
    (p) =>
      p.name?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
  );
}, [allPermissions, permSearch]);

 const { hasPermissoes
} = usePermissions();


  return (
    <div className="p-8 gap-8 flex flex-col">
      <div className="w-full">
        <Carousel className="w-full flex gap-4 px-4 items-center">
          <div className="absolute left-0 z-[9]">
            <CarouselPrevious className="" />
          </div>
          <CarouselContent className="gap-4">
            {roles.map((role) => (
              <CarouselItem key={role.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{role.name}</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{membersCount(role.id)}</div>
                    <p className="text-xs text-muted-foreground">membros</p>
                  </CardContent>
                </Alert>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute right-0 z-[9]">
            <CarouselNext />
          </div>
        </Carousel>
      </div>

      {/* Criar cargo */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Alert className="flex items-center cursor-pointer gap-4 bg-transparent transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <div className="bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 rounded-md p-4 border ">
              <Plus size={20} />
            </div>
            <p className="font-medium">Adicionar cargo</p>
          </Alert>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Adicionar cargo</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Crie um perfil de acesso com nome e descrição.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">
                <ArrowUUpLeft size={16} /> Cancelar
              </Button>
            </DialogClose>
            <Button onClick={handleCreateRole} disabled={creating}>
              {creating ? <Loader2 className="animate-spin " size={16} /> : <Plus className="" size={16} />}
              Adicionar cargo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Criar permissão global */}
      <Dialog open={openCreatePerm} onOpenChange={setOpenCreatePerm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Criar permissão</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Adicione uma nova permissão ao catálogo.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Nome</Label>
              <Input value={newPermName} onChange={(e) => setNewPermName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Descrição (opcional)</Label>
              <Textarea value={newPermDesc} onChange={(e) => setNewPermDesc(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">
                <ArrowUUpLeft size={16} /> Cancelar
              </Button>
            </DialogClose>
            <Button onClick={handleCreateGlobalPermission} disabled={creatingGlobalPerm}>
              {creatingGlobalPerm ? <Loader2 className="animate-spin " size={16} /> : <Plus className="" size={16} />}
              Criar permissão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lista */}
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-0">
            <HeaderResultTypeHome title={"Todos os cargos"} icon={<Briefcase size={24} className="" />} />
          </AccordionTrigger>

          <AccordionContent className="p-0">
            {loadingList ? (
              <div className="flex gap-4 flex-col">
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
              </div>
            ) : roles.length === 0 ? (
              <div className="items-center justify-center w-full flex text-center pt-6">
                Nenhum cargo encontrado.
              </div>
            ) : (
              <div className="grid gap-4">
                {roles.map((role) => {
                  const usersForRole = roleUsers[role.id] || [];
                  const loadingRU = !!loadingRoleUsers[role.id];

                  return (
                    <Accordion type="single" collapsible key={role.id}>
                      <AccordionItem value={role.id}>
                        <Alert className="p-0">
                          <CardHeader className="flex group flex-row py-0 items-start bg-neutral-200 rounded-t-md dark:bg-neutral-700">
                            <div className="flex items-center justify-between w-full">
                              <CardTitle className="group flex items-center w-fit gap-2 text-lg py-6">
                                <div className="w-fit flex gap-2 items-center">{role.name}</div>
                              </CardTitle>
                              <div className="flex gap-3 items-center">
                                {/* Gestão de Permissões */}
                                <Dialog
                                  open={openPermissionsForRoleId === role.id}
                                  onOpenChange={(open) => handleOpenPermissionsForRole(open, role.id)}
                                >
                                  <DialogTrigger asChild>
                                    <Button variant="outline" className="hidden group-hover:flex transition-all">
                                      <GitBranchPlus size={16} className="" />
                                      Permissões
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Permissões do cargo</DialogTitle>
                                      <DialogDescription className="text-zinc-500 ">
                                        Adicione, exclua e edite as permissões do cargo {role.name}
                                      </DialogDescription>
                                    </DialogHeader>

                                    <Separator className="my-4" />

                                    {/* Lista permissões desse role */}
                                    <div className="space-y-3">
                                      <Label>Permissões vinculadas</Label>
                                      {role.permissions?.length ? (
                                        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto elementBarra">
                                          {role.permissions.map((p) => (
                                            <div
                                              key={p.id}
                                              className="flex group items-center justify-between border rounded-md px-3 py-2"
                                            >
                                              <div className="flex flex-col">
                                                <span className="font-medium min-h-8 items-center flex">
                                                  {p.name}
                                                </span>
                                                <span className="text-xs text-gray-500">{p.description}</span>
                                              </div>
                                              <Button
                                                size="icon"
                                                variant="destructive"
                                                disabled={removingPermId === p.id}
                                                onClick={() => handleRemovePermissionFromRole(role.id, p.id)}
                                                className="w-8 h-8 hidden group-hover:flex transition-all"
                                              >
                                                {removingPermId === p.id ? (
                                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                  <Trash className="h-3.5 w-3.5" />
                                                )}
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-sm text-gray-500 text-center">Nenhuma permissão vinculada.</div>
                                      )}
                                    </div>

                                    <Separator className="my-4" />

                                    {/* Vincular permissão existente — shadcn Combobox */}
                                    <div className="grid gap-2">
                                      <Label>Vincular permissão existente</Label>
                                      <div className="flex gap-2 items-center">
                                        <Popover modal open={permPopoverOpen} onOpenChange={setPermPopoverOpen}>
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="outline"
                                              role="combobox"
                                              aria-expanded={permPopoverOpen}
                                              className="w-[340px] justify-between"
                                              onClick={() => {
                                                fetchPermissions();
                                              }}
                                            >
                                              {selectedPermissionId
                                                ? allPermissions.find((p) => p.id === selectedPermissionId)?.name
                                                : loadingPerms
                                                  ? "Carregando permissões..."
                                                  : "Selecione uma permissão"}
                                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-[340px] p-0 z-[999]">
                                            <Command>
                                              <CommandInput />
                                              <CommandList>
                                                <CommandEmpty>Nenhuma permissão encontrada.</CommandEmpty>
                                                <CommandGroup>
                                                  {allPermissions.map((p) => (
                                                    <CommandItem
                                                      key={p.id}
                                                      value={`${p.name} ${p.code}`}
                                                      onSelect={() => {
                                                        setSelectedPermissionId(p.id);
                                                        setPermPopoverOpen(false);
                                                      }}
                                                    >
                                                      <Check
                                                        className={`mr-2 h-4 w-4 ${selectedPermissionId === p.id ? "opacity-100" : "opacity-0"}`}
                                                      />
                                                      <div className="flex flex-col">
                                                        <span className="font-medium">{p.name}</span>
                                                        <span className="text-xs text-gray-500">{p.code}</span>
                                                      </div>
                                                    </CommandItem>
                                                  ))}
                                                </CommandGroup>
                                              </CommandList>
                                            </Command>
                                          </PopoverContent>
                                        </Popover>

                                        <Button onClick={() => handleLinkPermissionToRole(role.id)} disabled={!selectedPermissionId}>
                                          <Plus size={16}/> Vincular
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                {/* Editar cargo */}
                                <Button
                                  variant="outline"
                                  className="hidden group-hover:flex transition-all"
                                  onClick={() => openEditDialog(role)}
                                >
                                  <Pencil size={16} />
                                  Editar
                                </Button>

                                {/* Adicionar membro */}
                                <Dialog
                                  open={openUserDialogForRoleId === role.id}
                                  onOpenChange={(open) => (open ? handleOpenAddUser(role.id) : setOpenUserDialogForRoleId(null))}
                                >
                                  <DialogTrigger asChild>
                                    <Button className="hidden group-hover:flex transition-all" onClick={() => handleOpenAddUser(role.id)}>
                                      <User size={16} className="" />
                                      Adicionar membro
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Adicionar usuário</DialogTitle>
                                      <DialogDescription className="text-zinc-500 ">
                                        Todos os usuários cadastrados no sistema
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Separator className="my-4" />

                                    <Alert className="p-0 flex gap-2 items-center px-4 h-12">
                                      <div><MagnifyingGlass size={16} /></div>
                                      <Input className="border-0" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                                    </Alert>

                                    <div className="max-h-[250px] overflow-y-auto elementBarra">
                                      <div className="flex flex-col gap-1 p-2">
                                        {loadingUsers ? (
                                          <div className="p-4 text-sm text-center text-gray-500">Carregando...</div>
                                        ) : filteredUsers.length > 0 ? (
                                          filteredUsers.map((u) => (
                                            <Button
                                              variant={"ghost"}
                                              key={u.id}
                                              className={`text-left justify-start h-auto ${selectedUser?.id === u.id ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
                                              onClick={() => setSelectedUser(u)}
                                            >
                                              <Avatar className="cursor-pointer rounded-md h-8 w-8 mr-2 ">
                                                <AvatarImage className="rounded-md h-8 w-8" src={`${urlGeral}user/upload/${u.id}/icon`} />
                                                <AvatarFallback className="flex items-center justify-center"><User size={12} /></AvatarFallback>
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
                                      <Button onClick={() => handleAddUserToRole(role.id)} disabled={!selectedUser}>
                                        <Plus size={16} className="mr-2" /> Adicionar
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                {/* Excluir role */}
                                <Button variant="destructive" className="hidden group-hover:flex transition-all" onClick={() => openDeleteDialog(role.id, role.name)}>
                                  <Trash size={16} />
                                  Excluir
                                </Button>

                                <AccordionTrigger></AccordionTrigger>
                              </div>
                            </div>
                          </CardHeader>

                          <AccordionContent>
                            <div className="p-6 text-sm flex flex-col gap-6">
                              {/* Descrição */}
                              {role.description && (
                                <div className="grid gap-1.5">
                                  <div className="text-gray-700 dark:text-gray-300">{role.description || "—"}</div>
                                  <Separator className="mt-4"/>
                                </div>
                              )}

                              {/* Membros do cargo */}
                              <div className="grid gap-3 w-full">
                                <Label>Membros cadastrados</Label>

                                {loadingRU ? (
                                  <div className="flex flex-col gap-3">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                  </div>
                                ) : usersForRole?.length > 0 ? (
                                  <div className="flex-col flex gap-3 overflow-y-auto max-h-[320px]">
                                    {usersForRole.map((u) => (
                                      <Alert key={u.id}>
                                        <div className="group flex items-center justify-between ">
                                          <div className="flex items-center gap-2">
                                            <Avatar className="cursor-pointer rounded-md h-8 w-8">
                                              <AvatarImage className="rounded-md h-8 w-8" src={`${urlGeral}user/upload/${u.id}/icon`} />
                                              <AvatarFallback className="flex items-center justify-center"><User size={12} /></AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-medium">{u.username}</p>
                                              <div className="text-xs text-gray-500">({u.email})</div>
                                            </div>
                                          </div>
                                          <Button
                                            onClick={() => handleRemoveUserFromRole(role.id, u.id)}
                                            variant={"destructive"}
                                            size={"icon"}
                                            className="w-8 h-8 hidden group-hover:flex transition-all"
                                          >
                                            <Trash size={16} className="" />
                                          </Button>
                                        </div>
                                      </Alert>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">Nenhum membro neste cargo.</div>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </Alert>
                      </AccordionItem>
                    </Accordion>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Excluir cargo</DialogTitle>
            <DialogDescription className="text-zinc-500 ">
              Esta ação é <span className="font-semibold">irreversível</span>. Para confirmar, digite exatamente o nome do cargo:{" "}
              <span className=" font-semibold ">{deleteTarget?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="space-y-4 mb-4">
            <Label>Digite o nome do cargo</Label>
            <Input value={deleteText} onChange={(e) => setDeleteText(e.target.value)} autoFocus />
            {!!deleteTarget && deleteText.trim() && deleteText.trim() !== deleteTarget.name && (
              <p className="text-xs text-red-500">O texto digitado não corresponde ao nome do cargo.</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteText("");
                setDeleteTarget(null);
              }}
              disabled={deleting}
            >
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={!confirmEnabled || deleting}>
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              <Trash size={16} /> Confirmar exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de edição de cargo */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Editar cargo</DialogTitle>
            <DialogDescription className="text-zinc-500 ">
              Atualize o nome e a descrição do cargo.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Nome</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Descrição</Label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setEditTarget(null);
                setEditName("");
                setEditDesc("");
              }}
              disabled={editing}
            >
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button onClick={handleEditConfirm} disabled={editing || !editName.trim()}>
              {editing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil size={16} className="mr-2" />}
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Listar & Deletar Permissões Globais */}
<Dialog  open={openListPerm}
  onOpenChange={(open) => setOpenListPerm(open)} >
  <DialogContent className="">
    <DialogHeader>
      <DialogTitle className="text-2xl mb-2 font-medium max-w-[520px]">
        Permissões do catálogo
      </DialogTitle>
      <DialogDescription className="text-zinc-500">
        Pesquise, visualize e exclua permissões do catálogo global.
      </DialogDescription>
    </DialogHeader>

    <Separator className="my-4" />

    {/* Busca */}
    <Alert className="p-0 flex gap-2 items-center px-4 h-12">
      <div><MagnifyingGlass size={16} /></div>
      <Input
        className="border-0"
    
        value={permSearch}
        onChange={(e) => setPermSearch(e.target.value)}
      />
    </Alert>

    {/* Lista */}
    <div className="max-h-[320px] overflow-y-auto elementBarra mt-4 space-y-2">
      {loadingPerms ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : filteredAllPermissions.length === 0 ? (
        <div className="text-sm text-center text-gray-500 py-6">
          Nenhuma permissão encontrada.
        </div>
      ) : (
        filteredAllPermissions.map((p) => (
          <Alert key={p.id} className="px-3 py-2">
            <div className="group flex items-center justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {p.code} {p.description ? "— " + p.description : ""}
                </div>
              </div>

              <Button
                size="icon"
                variant="destructive"
                className="w-8 h-8"
                onClick={() => handleDeleteGlobalPermission(p.id)}
                disabled={deletingGlobalPermId === p.id}
                title="Excluir permissão"
              >
                {deletingGlobalPermId === p.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </Alert>
        ))
      )}
    </div>

    <DialogFooter>
      <DialogClose asChild>
        <Button variant="ghost">
          <ArrowUUpLeft size={16} /> Cancelar
        </Button>
      </DialogClose>

    {hasPermissoes && (
          <Button onClick={() => {
          setOpenListPerm(false)
        setOpenCreatePerm(true)
        }}>
          <Plus size={16} /> Adicionar permissão
        </Button>
    )}
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
}
