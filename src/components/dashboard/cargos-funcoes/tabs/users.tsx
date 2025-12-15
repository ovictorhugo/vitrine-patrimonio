import { useContext, useEffect, useMemo, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion";
import {
  Check,
  RefreshCcw,
  Trash,
  Users,
  X,
  Loader2,
  Plus,
  EyeOff,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Alert } from "../../../ui/alert";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { CardContent, CardHeader, CardTitle } from "../../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import { toast } from "sonner";
import { UserContext } from "../../../../context/context";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Separator } from "../../../ui/separator";
import { ArrowUUpLeft, MagnifyingGlass } from "phosphor-react";
import { Skeleton } from "../../../ui/skeleton";
import { usePermissions } from "../../../permissions";
import { set } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";

/** ====== TIPOS conforme os schemas enviados ====== **/

type Role = {
  id: string;
  name: string;
  description: string;
};

type LegalGuardian = {
  legal_guardians_code: string;
  legal_guardians_name: string;
  id: string;
};

type SystemIdentity = {
  id: string;
  legal_guardian: LegalGuardian;
};

export type APIUser = {
  password?: string;
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
  roles: Role[];
  system_identity: SystemIdentity;
};

type GetUsersResponse = {
  users: APIUser[];
};

type PutUserPayload = {
  password: string;
  username: string;
  id: string;
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
};

/** ====== COMPONENTE ====== **/

export function UsersPage() {
  const { urlGeral, role } = useContext(UserContext);
  const [users, setUsers] = useState<APIUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pesquisaInput, setPesquisaInput] = useState("");

  // Controle do Dialog de edição
  const [open, setOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Form do Dialog (PUT)
  const [form, setForm] = useState<PutUserPayload>({
    password: "",
    username: "",
    id: "",
    email: "",
    provider: "",
    linkedin: "",
    lattes_id: "",
    orcid: "",
    ramal: "",
    photo_url: "",
    background_url: "",
    matricula: "",
    verify: true,
    institution_id: "",
  });

  // ---- Estados para exclusão ----
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<APIUser | null>(null);
  const [deleteText, setDeleteText] = useState<string>("");
  const [deleting, setDeleting] = useState<boolean>(false);

  const token = useMemo(() => localStorage.getItem("jwt_token") ?? "", []);

  // ===== navegação & paginação por querystring =====
  const navigate = useNavigate();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const initialOffset = Number(qs.get("offset") || "0");
  const initialLimit = Number(qs.get("limit") || "24");

  const [offset, setOffset] = useState<number>(initialOffset);
  const [limit, setLimit] = useState<number>(initialLimit);

  const isFirstPage = offset === 0;
  const isLastPage = users.length < limit;

  const handleNavigate = (
    newOffset: number,
    newLimit: number,
    replace = false
  ) => {
    const params = new URLSearchParams(location.search);
    params.set("offset", String(newOffset));
    params.set("limit", String(newLimit));
    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace }
    );
  };

  useEffect(() => {
    handleNavigate(offset, limit, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit]);

  /** ========== FETCH (GET) ========== **/
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // padrão: /users/?offset=...&limit=...
      const url = `${urlGeral}users/?offset=${encodeURIComponent(
        offset
      )}&limit=${encodeURIComponent(limit)}&q=${pesquisaInput}`;

      const resp = await fetch(url, {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(
          text || `Falha ao carregar usuários (HTTP ${resp.status}).`
        );
      }

      const data: GetUsersResponse = await resp.json();
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (err: any) {
      console.error(err);
      toast("Falha ao carregar usuários", {
        description: err?.message || "Tente novamente em instantes.",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlGeral, offset, limit, pesquisaInput]);

  /** ========== HANDLERS EDIÇÃO ========== **/
  const openEditDialog = (u: APIUser) => {
    setSelectedUserId(u.id);
    setForm({
      password: u.password ?? "",
      id: u.id,
      username: u.username ?? "",
      email: u.email ?? "",
      provider: u.provider ?? "",
      linkedin: u.linkedin ?? "",
      lattes_id: u.lattes_id ?? "",
      orcid: u.orcid ?? "",
      ramal: u.ramal ?? "",
      photo_url: u.photo_url ?? "",
      background_url: u.background_url ?? "",
      matricula: u.matricula ?? "",
      verify: !!u.verify,
      institution_id: u.institution_id ?? "",
    });
    setOpen(true);
  };

  const handleFormChange = <K extends keyof PutUserPayload>(
    key: K,
    value: PutUserPayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /** ========== SUBMIT (PUT) ========== **/
  const onSubmit = async () => {
    if (!selectedUserId) return;

    if (!form.username?.trim()) {
      toast("O nome não pode ser vazio", {
        description: "Por favor, preencha o campo Nome completo.",
      });
      return;
    }
    if (!form.email?.trim()) {
      toast("O e-mail não pode ser vazio", {
        description: "Por favor, preencha o campo E-mail.",
      });
      return;
    }

    try {
      const url = `${urlGeral}users/${selectedUserId}`;
      const resp = await fetch(url, {
        method: "PUT",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(form),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(text || `HTTP ${resp.status}`);
      }

      toast("Dados atualizados com sucesso!", {
        description: "As informações do usuário foram salvas.",
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUserId ? ({ ...u, ...form } as APIUser) : u
        )
      );

      setOpen(false);
      setSelectedUserId(null);
    } catch (error) {
      console.error(error);
      toast("Erro ao atualizar", {
        description: "Não foi possível salvar as alterações.",
      });
    }
  };

  /** ========== HANDLERS EXCLUSÃO ========== **/
  const openDeleteDialog = (u: APIUser) => {
    setDeleteTarget(u);
    setDeleteText("");
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const url = `${urlGeral}users/${deleteTarget.id}`;
      const resp = await fetch(url, {
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(text || `HTTP ${resp.status}`);
      }

      toast("Usuário excluído", {
        description: `O usuário ${
          deleteTarget.email || deleteTarget.username
        } foi removido.`,
      });

      setDeleteOpen(false);
      setDeleteTarget(null);
      setDeleteText("");

      // refetch da página atual (mantém paginação coerente)
      await fetchUsers();
    } catch (error) {
      console.error(error);
      toast("Erro ao excluir", {
        description: "Não foi possível excluir este usuário.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const deleteCheckValue = deleteTarget?.email?.trim()
    ? deleteTarget.email.trim()
    : deleteTarget?.username?.trim() ?? "";

  const confirmEnabled =
    !!deleteTarget &&
    !!deleteText.trim() &&
    deleteText.trim() === deleteCheckValue;

  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[300px]" />
  ));

  const { hasDeletarUsuarios } = usePermissions();

  // dialog principal de criação de usuario
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleCreateUser = async () => {
    if (!name.trim()) {
      toast("Nome obrigatório", { description: "Preencha o nome do usuário." });
      return;
    }
    if (!email.trim()) {
      toast("E-mail obrigatório", {
        description: "Preencha o e-mail do usuário.",
      });
      return;
    }
    if (!password.trim() || !confirmPassword.trim()) {
      toast("Senha obrigatória", {
        description: "Preencha e confirme a senha.",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast("Senhas não conferem", {
        description: "A confirmação precisa ser igual à senha.",
      });
      return;
    }

    try {
      setCreating(true);

      const resp = await fetch(`${urlGeral}users/`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          username: name.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(text || `HTTP ${resp.status}`);
      }

      let created: Partial<APIUser> & { id?: string } = {};
      try {
        created = await resp.json();
      } catch {
        created = {};
      }

      const createdUser: APIUser = {
        id: (created as any)?.id || crypto.randomUUID(),
        username: (created as any)?.username ?? name.trim(),
        email: (created as any)?.email ?? email.trim(),
        provider: (created as any)?.provider ?? "",
        linkedin: (created as any)?.linkedin ?? "",
        lattes_id: (created as any)?.lattes_id ?? "",
        orcid: (created as any)?.orcid ?? "",
        ramal: (created as any)?.ramal ?? "",
        photo_url: (created as any)?.photo_url ?? "",
        background_url: (created as any)?.background_url ?? "",
        matricula: (created as any)?.matricula ?? "",
        verify: (created as any)?.verify ?? true,
        institution_id: (created as any)?.institution_id ?? "",
        roles: (created as any)?.roles ?? [],
        system_identity: (created as any)?.system_identity ?? {
          id: "",
          legal_guardian: {
            id: "",
            legal_guardians_code: "",
            legal_guardians_name: "",
          },
        },
      };

      // adiciona localmente (apenas para feedback imediato)
      setUsers((prev) => [createdUser, ...prev]);

      toast("Usuário criado com sucesso!", {
        description: `${
          createdUser.email || createdUser.username
        } adicionado à lista.`,
      });

      // limpa e fecha modal
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsOpen(false);

      // ✅ volta para a primeira página e refaz busca (padrão do seu exemplo)
      setOffset(0);
      await fetchUsers();
    } catch (error: any) {
      console.error(error);
      const msg = String(error?.message || "");
      const conflict =
        msg.includes("409") || msg.toLowerCase().includes("conflict");
      toast(conflict ? "E-mail já cadastrado" : "Erro ao criar usuário", {
        description: conflict
          ? "Este e-mail já está em uso. Tente outro endereço."
          : "Não foi possível concluir o cadastro agora.",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col  p-8 pt-6">
      <Alert className="p-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {/* Contagem da página atual */}
          <div className="text-2xl font-bold">{users.length}</div>
          <p className="text-xs text-muted-foreground">registrados</p>
        </CardContent>
      </Alert>

      <Alert className="h-14 mt-8 p-2 flex items-center justify-between w-full">
        <div className="flex items-center gap-2 w-full flex-1">
          <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />
          <Input
            value={pesquisaInput}
            onChange={(e) => setPesquisaInput(e.target.value)}
            type="text"
            className="border-0 w-full"
          />
        </div>
        <div className="w-fit" />
      </Alert>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Alert className="flex mt-8 items-center cursor-pointer gap-4 bg-transparent transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <div className="bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 rounded-md p-4 border ">
              <Plus size={20} />
            </div>
            <p className="font-medium">Adicionar usuário externo</p>
          </Alert>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
              Adicionar usuário externo
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Adicione usuários que não possuem Minha UFMG para acesso na
              plataforma
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <Label>Senha</Label>

              <div className="relative">
                <Input
                  id="current"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Confirmar senha</Label>

              <div className="relative">
                <Input
                  id="current"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>

            <Button onClick={handleCreateUser} disabled={creating}>
              {creating ? (
                <Loader2 className="animate-spin " size={16} />
              ) : (
                <Plus className="" size={16} />
              )}
              Adicionar usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Accordion
        type="single"
        defaultValue="usuarios"
        collapsible
        className="flex flex-col mt-4 gap-4"
      >
        <AccordionItem value="usuarios">
          <AccordionTrigger className="px-0">
            <HeaderResultTypeHome
              title={"Todos os usuários"}
              icon={<Users size={24} className="text-gray-400" />}
            />
          </AccordionTrigger>

          <AccordionContent className="p-0">
            {loading && (
              <ResponsiveMasonry
                columnsCountBreakPoints={{
                  350: 2,
                  750: 3,
                  900: 4,
                  1200: 6,
                  1500: 6,
                  1700: 7,
                }}
              >
                <Masonry gutter="16px">
                  {items.map((item, index) => (
                    <div key={index}>{item}</div>
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            )}

            {!loading && users.length === 0 && (
              <div className="text-sm text-muted-foreground p-4 text-center">
                Nenhum usuário encontrado.
              </div>
            )}

            {!loading && users.length > 0 && (
              <ResponsiveMasonry
                columnsCountBreakPoints={{
                  350: 2,
                  750: 3,
                  900: 4,
                  1200: 6,
                  1500: 6,
                  1700: 7,
                }}
              >
                <Masonry gutter="16px">
                  {users.map((u) => {
                    const bgImage = `${urlGeral}user/upload/${encodeURIComponent(
                      u.id || ""
                    )}/icon`;

                    return (
                      <div
                        key={u.id}
                        onClick={() => openEditDialog(u)}
                        className="flex group min-h-[300px] w-full cursor-pointer relative"
                      >
                        <Alert
                          className="flex p-0 flex-col flex-1 gap-4 bg-cover bg-no-repeat bg-center rounded-md overflow-hidden"
                          style={{ backgroundImage: `url("${bgImage}")` }}
                        >
                          <div className="bg-[#000000] bg-opacity-30 hover:bg-opacity-70 transition-all absolute inset-0" />
                          <div className="relative flex flex-col justify-between h-full">
                            <div className="p-4 flex justify-between items-start">
                              <div className="z-[1] w-full flex gap-3 justify-end">
                                <div className="flex gap-3">
                                  {hasDeletarUsuarios && (
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteDialog(u);
                                      }}
                                      variant="destructive"
                                      className="h-8 w-8 p-0 text-white hidden group-hover:flex"
                                      title="Excluir usuário"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 px-6 flex-col pb-6 w-full h-full text-white justify-end">
                              <div className="flex gap-1 flex-col">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg font-medium">
                                    {u.username || "(sem nome)"}
                                  </CardTitle>
                                </div>

                                <div className="group-hover:flex hidden items-center flex-wrap gap-1  mb-2">
                                  <div className="flex gap-1 text-sm  items-center truncate ">
                                    {u.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Alert>
                      </div>
                    );
                  })}
                </Masonry>
              </ResponsiveMasonry>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* ===== Paginação ===== */}
      <div className="hidden md:flex md:justify-end mt-5 items-center gap-2">
        <span className="text-sm text-muted-foreground">Itens por página:</span>
        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            const newLimit = parseInt(value);
            setOffset(0);
            setLimit(newLimit);
            handleNavigate(0, newLimit);
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Itens" />
          </SelectTrigger>
          <SelectContent>
            {[12, 24, 36, 48, 84, 162].map((val) => (
              <SelectItem key={val} value={val.toString()}>
                {val}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full flex justify-center items-center gap-10 mt-8">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
            disabled={isFirstPage}
          >
            <ChevronLeft size={16} className="mr-2" />
            Anterior
          </Button>
          <Button
            onClick={() => !isLastPage && setOffset((prev) => prev + limit)}
            disabled={isLastPage}
          >
            Próximo
            <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* ===== Dialog de Edição ===== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
              Editar informações de {form.username}
            </DialogTitle>

            <DialogDescription className="text-zinc-500 ">
              Atualize os campos e clique em <b>Salvar</b>.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="grid  gap-4">
            <div className="flex flex-col gap-2">
              <Label>Nome completo</Label>
              <Input
                value={form.username}
                onChange={(e) => handleFormChange("username", e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>E-mail</Label>
              <Input
                value={form.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                placeholder="user@example.com"
                type="email"
                disabled
              />
            </div>

            <div className="flex gap-4 w-full">
              <div className="flex flex-col gap-2 w-full">
                <Label>Ramal</Label>
                <Input
                  value={form.ramal}
                  onChange={(e) => handleFormChange("ramal", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Label>Matrícula</Label>
                <Input
                  value={form.matricula}
                  onChange={(e) =>
                    handleFormChange("matricula", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={"outline"}
                  onClick={() => handleFormChange("verify", !form.verify)}
                  className={` w-full`}
                >
                  {form.verify ? (
                    <Check size={16} className="" />
                  ) : (
                    <X size={16} className="" />
                  )}{" "}
                  {form.verify ? "Verificado" : "Não verificado"}
                </Button>
              </div>
            </div>

            {role == "Administrador" && (
              <div className="flex flex-col gap-2 w-full">
                <Label>Identificador</Label>
                <Input disabled value={form.id} />
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button onClick={onSubmit}>
              <RefreshCcw size={16} className="" />
              Salvar informações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Dialog de Exclusão ===== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
              Excluir usuário
            </DialogTitle>
            <DialogDescription className="text-zinc-500 ">
              Esta ação é <span className="font-semibold">irreversível</span>.
              Para confirmar, digite exatamente:{" "}
              <span className="font-semibold">{deleteCheckValue || "—"}</span>
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="space-y-2 mb-4">
            <Label>Digite para confirmar</Label>
            <Input
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              autoFocus
            />
            {!!deleteTarget &&
              deleteText.trim() &&
              deleteText.trim() !== deleteCheckValue && (
                <p className="text-xs text-red-500">
                  O texto digitado não corresponde.
                </p>
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
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={!confirmEnabled || deleting}
            >
              {deleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash size={16} />
              )}
              Confirmar exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
