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
} from "../../../ui/dialog";
import { toast } from "sonner";
import { UserContext } from "../../../../context/context";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Separator } from "../../../ui/separator";
import { ArrowUUpLeft } from "phosphor-react";
import { Skeleton } from "../../../ui/skeleton";

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
};

/** ====== COMPONENTE ====== **/

export function UsersPage() {
  const { urlGeral } = useContext(UserContext);
  const [users, setUsers] = useState<APIUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Controle do Dialog de edição
  const [open, setOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Form do Dialog (PUT)
  const [form, setForm] = useState<PutUserPayload>({
    username: "",
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

  const listUrl = `${urlGeral}users/`; // Ajuste se sua rota de listagem for diferente

  /** ========== FETCH (GET) ========== **/
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const resp = await fetch(listUrl, {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data: GetUsersResponse = await resp.json();
      if (data?.users) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      toast("Falha ao carregar usuários", {
        description: "Tente novamente em instantes.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl]);

  /** ========== HANDLERS EDIÇÃO ========== **/
  const openEditDialog = (u: APIUser) => {
    setSelectedUserId(u.id);
    setForm({
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

    // validações simples
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
      const url = `${urlGeral}users/${selectedUserId}`; // Path param com o id
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

      // Atualiza lista local rapidamente
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUserId ? ({ ...u, ...form } as APIUser) : u))
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

      // Remover da lista local
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));

      toast("Usuário excluído", {
        description: `O usuário ${deleteTarget.email || deleteTarget.username} foi removido.`,
      });

      setDeleteOpen(false);
      setDeleteTarget(null);
      setDeleteText("");
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
    : (deleteTarget?.username?.trim() ?? "");

  const confirmEnabled =
    !!deleteTarget &&
    !!deleteText.trim() &&
    deleteText.trim() === deleteCheckValue;

      const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[200px]" />
  ));

  /** ========== RENDER ========== **/
  return (
    <div className="flex flex-col  p-8 pt-6">
      <Alert className="p-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.length}</div>
          <p className="text-xs text-muted-foreground">registrados</p>
        </CardContent>
      </Alert>

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
              icon={<Users size={24} />}
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
                  // const status = u.verify ? "Ativo" : "Inativo";

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
                          {/* Header do card */}
                          <div className="p-4 flex justify-between items-start">
                            {/* Botões no canto superior direito */}
                            <div className="z-[1] w-full flex gap-3 justify-end">
                              <div className="flex gap-3">
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
                              </div>
                            </div>
                          </div>

                          {/* Rodapé / Infos */}
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
                  onChange={(e) => handleFormChange("matricula", e.target.value)}
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
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={onSubmit}>
              <RefreshCcw size={16} className="mr-2" />
              Salvar
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
              <span className="font-semibold">
                {deleteCheckValue || "—"}
              </span>
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
              ) : <Trash size={16} />}
               Confirmar exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
