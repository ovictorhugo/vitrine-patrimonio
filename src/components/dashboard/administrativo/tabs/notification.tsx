import { ListChecks, Plus, Loader2, Trash, User, Send, Bell, X, ArrowRight } from "lucide-react";
import { Alert } from "../../../ui/alert";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { useContext, useEffect, useMemo, useState } from "react";
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
import IconPicker from "../components/icon-picker";
import { NotificationItem } from "../components/notification-item";
import { notificationsTypes } from "../../../header/notifications";
import { Checkbox } from "../../../ui/checkbox";
import { Badge } from "../../../ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Tabs, TabsContent } from "../../../ui/tabs";
import { UsersResponse } from "../../cargos-funcoes/tabs/roles";

// ===== Tipos da API =====
export type RoleDTO = { id: string; name: string; description: string };
export type LegalGuardianDTO = { id: string; legal_guardians_code: string; legal_guardians_name: string };
export type SystemIdentityDTO = { id: string; legal_guardian: LegalGuardianDTO };
export type RoleSimpleDTO = { id: string; name: string };

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

export type SourceUserDTO = {
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
  roles: RoleDTO[];
  system_identity: SystemIdentityDTO;
};

export type NotificationDetailDTO = {
  title?: string;
  description?: string;
  link?: string;
  icon?: string;
  [key: string]: any;
};

export type NotificationDTO = {
  id: string;
  type: string;
  detail: NotificationDetailDTO;
  read_at: string | null;
  created_at: string;
  source_user: SourceUserDTO;
};

export type NotificationsResponse = { notifications: NotificationDTO[] };

// ===== Modelos de mensagem =====
type Template = { id: string; label: string; title: string; description: string; link?: string; icon?: string };

const MESSAGE_TEMPLATES: Template[] = [
  { id: "boasvindas", label: "Boas-vindas", title: "Bem-vindo(a) à plataforma", description: "Sua conta foi criada com sucesso. Explore os recursos e personalize seu perfil.", icon: "hand" },
  { id: "atualizacao", label: "Atualização de sistema", title: "Atualização disponível", description: "Lançamos novas funcionalidades. Veja as notas da versão no link.", link: "/changelog", icon: "sparkles" },
  { id: "manutencao", label: "Janela de manutenção", title: "Manutenção programada", description: "O sistema ficará indisponível hoje das 22h às 23h59 (BRT) para melhorias.", icon: "wrench" },
];

export function Notification() {
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [icon, setIcon] = useState<string | undefined>(undefined);

  const [notification, setNotification] = useState<NotificationDTO[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);

  // wizard (passo atual)
  const [wizardStep, setWizardStep] = useState<"conteudo" | "destinatarios">("conteudo");

  // público-alvo
  const [sendToAll, setSendToAll] = useState<boolean>(true);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [allUsers, setAllUsers] = useState<UserInRoleDTO[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserInRoleDTO[]>([]);

  const filteredUsers = allUsers.filter((u) =>
    [u.username, u.email].some((f) => f?.toLowerCase().includes(userSearch.toLowerCase()))
  );

  // exclusão
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; key: string } | null>(null);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const { urlGeral } = useContext(UserContext);
  const token = useMemo(() => localStorage.getItem("jwt_token"), []);
  const authHeaders: HeadersInit = useMemo(
    () => ({ "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }),
    [token]
  );

  // ===== buscas =====
  const fetchInventories = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${urlGeral}notifications/`, { method: "GET", headers: authHeaders });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `Falha ao carregar notificações (HTTP ${res.status}).`);
      const data: NotificationsResponse = await res.json();
      setNotification(Array.isArray(data?.notifications) ? data.notifications : []);
    } catch (e: any) {
      toast("Erro ao carregar notificações", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    } finally {
      setLoadingList(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(`${urlGeral}users/`, { method: "GET", headers: authHeaders });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `Falha ao carregar usuários (HTTP ${res.status}).`);
      const data: UsersResponse = await res.json();
      setAllUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (e: any) {
      toast("Erro ao carregar usuários", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { fetchInventories(); /* eslint-disable-next-line */ }, [urlGeral]);

  // ===== templates =====
  const applyTemplate = (templateId: string) => {
    const t = MESSAGE_TEMPLATES.find((m) => m.id === templateId);
    if (!t) return;
    setKey(t.title);
    setDescription(t.description);
    if (t.link !== undefined) setLink(t.link);
    if (t.icon !== undefined) setIcon(t.icon);
  };

  // ===== seleção multiusuário =====
  const isSelected = (id: string) => selectedUsers.some((s) => s.id === id);
  const toggleUser = (u: UserInRoleDTO) =>
    setSelectedUsers((prev) => (prev.some((s) => s.id === u.id) ? prev.filter((s) => s.id !== u.id) : [...prev, u]));
  const removeSelected = (id: string) => setSelectedUsers((prev) => prev.filter((s) => s.id !== id));

  // ===== submit =====
  const handleSubmit = async () => {
    try {
      if (!key.trim()) {
        toast("Informe o título da notificação", { description: "O campo 'Título' está vazio.", action: { label: "Fechar", onClick: () => {} } });
        // foca no passo de conteúdo se estiver no segundo
        setWizardStep("conteudo");
        return;
      }

      let target_user_id = "*";
      if (!sendToAll) {
        if (selectedUsers.length === 0) {
          toast("Selecione ao menos um usuário", { description: "Desative 'Enviar para todos' e escolha os destinatários.", action: { label: "Fechar", onClick: () => {} } });
          setWizardStep("destinatarios");
          return;
        }
        target_user_id = selectedUsers.map((u) => u.id).join(";");
      }

      setCreating(true);
      const res = await fetch(`${urlGeral}notifications/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          target_user_id,
          type: "SYSTEM",
          detail: { title: key, description, link: link || undefined, icon: icon || undefined },
        }),
      });

      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `Falha ao enviar notificação (HTTP ${res.status}).`);

      toast("Notificação enviada com sucesso!", { description: `“${key.trim()}” foi enviada.`, action: { label: "Fechar", onClick: () => {} } });

      // reset
      setKey(""); setDescription(""); setLink(""); setIcon(undefined);
      setSelectedUsers([]); setSendToAll(true); setIsOpen(false);
    } catch (e: any) {
      toast("Erro ao enviar notificação", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    } finally {
      setCreating(false);
      await fetchInventories();
    }
  };

  // ===== exclusão =====
  const openDeleteDialog = (id: string, invKey: string) => {
    setDeleteTarget({ id, key: invKey || id });
    setDeleteText("");
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`${urlGeral}notifications/${deleteTarget.id}`, { method: "DELETE", headers: authHeaders });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `Falha ao excluir notificação (HTTP ${res.status}).`);

      toast("Notificação excluída", { description: `“${deleteTarget.key}” foi removida.`, action: { label: "Fechar", onClick: () => {} } });
      setDeleteOpen(false); setDeleteTarget(null); setDeleteText("");
      await fetchInventories();
    } catch (e: any) {
      toast("Erro ao excluir notificação", { description: e?.message || String(e), action: { label: "Fechar", onClick: () => {} } });
    } finally {
      setDeleting(false);
    }
  };

  const formatDateTimeBR = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(d);
    } catch { return iso; }
  };

  const confirmEnabled = deleteTarget && deleteText.trim() === deleteTarget.key;
  const [isOpen, setIsOpen] = useState(false);
  const baseUrl = `${urlGeral}notifications`;

  return (
    <div className="p-8 gap-8 flex flex-col">
      {/* ===== Dialog Enviar Notificação (Wizard sem TabsList) ===== */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) setWizardStep("conteudo");
        }}
      >
        <DialogTrigger asChild>
          <Alert
            onClick={() => setIsOpen(true)}
            className="flex items-center cursor-pointer gap-4 bg-transparent transition-all hover:bg-neutral-100 dark:bg-transparent dark:hover:bg-neutral-800"
          >
            <div className="bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 rounded-md p-4 border">
              <Send size={20} />
            </div>
            <p className="font-medium">Enviar notificação</p>
          </Alert>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[600px]">Enviar notificação</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Preencha o conteúdo e defina os destinatários no passo a passo.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <Tabs value={wizardStep} onValueChange={(v) => setWizardStep(v as any)} className="w-full">
            {/* --- Passo Conteúdo --- */}
            <TabsContent value="conteudo" className="mt-0 space-y-4">
              {/* Templates */}
              <div className="flex flex-col gap-2">
                <Label>Modelo de mensagem (opcional)</Label>
                <Select onValueChange={applyTemplate}>
                  <SelectTrigger className="w-full">
                    <SelectValue  />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectGroup>
                      {MESSAGE_TEMPLATES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Título */}
              <div className="flex flex-col space-y-1.5 w-full">
                <Label htmlFor="notif-title">Título</Label>
                <Input id="notif-title"  value={key} onChange={(e) => setKey(e.target.value)} />
              </div>

              {/* Ícone + Link */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col w-fit space-y-1.5">
                  <Label htmlFor="icon">Ícone</Label>
                  <IconPicker value={icon} onChange={setIcon} placeholder="" />
                </div>
                <div className="flex flex-col space-y-1.5 w-full">
                  <Label htmlFor="notif-link">Link</Label>
                  <Input id="notif-link" value={link} onChange={(e) => setLink(e.target.value)} />
                </div>
              </div>

              {/* Mensagem */}
              <div className="flex flex-col space-y-1.5 w-full">
                <Label htmlFor="notif-desc">Mensagem</Label>
                <Textarea id="notif-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </TabsContent>

            {/* --- Passo Destinatários --- */}
            <TabsContent value="destinatarios" className="mt-0 space-y-4">
              <div className="space-y-3 mb-4">
                <Alert className="mb-4">
                  <div className="flex items-center gap-2 ">
                  <Checkbox id="sendToAll" checked={sendToAll} onCheckedChange={(v) => setSendToAll(Boolean(v))} />
                  <Label htmlFor="sendToAll">Enviar para todos os usuários</Label>
                </div>
                </Alert>

                {!sendToAll && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Destinatários</Label>
                      <Button
                        variant="outline"
                        onClick={() => { setOpenUserDialog(true); fetchUsers(); }}
                      >
                        <User size={16} className="mr-2" />
                        Selecionar usuários
                      </Button>
                    </div>

                    {/* Chips de selecionados */}
                    {selectedUsers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((u) => (
                          <Badge key={u.id} variant='outline' className="flex rounded-md py-2 px-4 items-center gap-1">
                            <span>{u.username}</span>
                            <button type="button" onClick={() => removeSelected(u.id)} aria-label={`Remover ${u.username}`} className="ml-1 inline-flex">
                              <X size={12} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Nenhum usuário selecionado.</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
           

             {wizardStep === "conteudo" && (
              <DialogClose asChild>
              <Button variant="ghost">
                <ArrowUUpLeft size={16} /> Cancelar
              </Button>
            </DialogClose>
            )}


            {wizardStep === "destinatarios" && (
              <Button variant="ghost" onClick={() => setWizardStep("conteudo")}>
              <ArrowUUpLeft size={16} />    Voltar
              </Button>
            )}

            {wizardStep === "conteudo" ? (
              <Button
                onClick={() => setWizardStep("destinatarios")}
                disabled={!key.trim()} // opcional: só deixa avançar se tiver título
              >
          <ArrowRight size={16} className="" />      Próximo 
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={creating}>
                {creating ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send size={16} className="mr-2" />}
                Enviar notificação
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Dialog Seleção de Usuários ===== */}
      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[600px]">Escolher usuários</DialogTitle>
            <DialogDescription className="text-zinc-500 ">
              Pesquise e marque os usuários que receberão esta notificação.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="space-y-3">
            <Alert className="p-0 flex gap-2 items-center px-4 h-12">
              <div><MagnifyingGlass size={16} /></div>
              <Input
                className="border-0"
                placeholder="Buscar por nome ou e-mail"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </Alert>

            <div className="max-h-[320px] overflow-y-auto elementBarra">
              {loadingUsers ? (
                <div className="p-4 text-sm text-center text-gray-500">Carregando usuários...</div>
              ) : filteredUsers.length > 0 ? (
                <div className="flex flex-col gap-1 p-2">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => toggleUser(u)}
                      className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                        isSelected(u.id) ? "bg-neutral-100 dark:bg-neutral-800" : ""
                      }`}
                    >
                      <Avatar className="rounded-md h-8 w-8">
                        <AvatarImage className="rounded-md h-8 w-8" src={`${urlGeral}user/upload/${u.id}/icon`} />
                        <AvatarFallback><User size={12} /></AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{u.username}</p>
                        <div className="text-xs text-gray-500 font-normal truncate">({u.email})</div>
                      </div>
                     
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center w-full text-sm p-4">Nenhum usuário encontrado</div>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost"><ArrowUUpLeft size={16} /> Concluir</Button>
            </DialogClose>
           
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Lista de Notificações (com botão Excluir em cada item) ===== */}
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-0">
            <HeaderResultTypeHome title={"Últimas notificações"} icon={<Bell size={24} className="text-gray-400" />} />
          </AccordionTrigger>

          <AccordionContent className="p-0">
            {loadingList ? (
              <div className="flex gap-4 flex-col">
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
              </div>
            ) : notification.length === 0 ? (
              <div className="items-center justify-center w-full flex text-center pt-6">Nenhuma notificação encontrada.</div>
            ) : (
              <div className="grid gap-3">
                {notification.map((n) => (
                  <Alert key={n.id} className="flex items-center p-0 pr-6 group">
                    <div className="flex-1">
                      <NotificationItem
                        notification={n}
                        baseUrl={baseUrl}
                        token={token!}
                        notificationsTypes={notificationsTypes}
                      />
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Button
                        variant='destructive'
                        size="icon"
                        className="h-8 w-8 hidden group-hover:flex"
                        onClick={() => openDeleteDialog(n.id, n?.detail?.title || n.id)}
                        title="Excluir notificação"
                      >
                        <Trash size={16} className="" />
                    
                      </Button>
                   
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* ===== Dialog de confirmação de exclusão ===== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Excluir notificação</DialogTitle>
            <DialogDescription className="text-zinc-500 ">
              Esta ação é <span className="font-semibold">irreversível</span>. Para confirmar, digite exatamente o título da notificação:
              <span className="font-semibold"> {deleteTarget?.key}</span>
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="space-y-2 mb-4">
            <Label>Título da notificação</Label>
            <Input
              placeholder="Digite exatamente como aparece"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              autoFocus
            />
            {!!deleteTarget && deleteText.trim() && deleteText.trim() !== deleteTarget.key && (
              <p className="text-xs text-red-500">O texto digitado não corresponde ao título.</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => { setDeleteOpen(false); setDeleteText(""); setDeleteTarget(null); }}
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
    </div>
  );
}
