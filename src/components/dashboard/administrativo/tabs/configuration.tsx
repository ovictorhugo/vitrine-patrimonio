import { ListChecks, Plus, Loader2, Trash, Pencil, RefreshCcw, Settings } from "lucide-react";
import { Alert } from "../../../ui/alert";
import { Button } from "../../../ui/button";
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
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { Separator } from "../../../ui/separator";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../../../context/context";
import { ArrowUUpLeft } from "phosphor-react";

/* ======== NOVO: AlertDialog para confirmação de exclusão ======== */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";

/* =======================================================
 * Types
 * ======================================================= */
export type SettingDTO = {
  key: string;
  value: string;
  description: string | null;
  id: string;
  created_at: string;
  updated_at: string | null;
};

export type SettingsResponse = {
  settings: SettingDTO[];
};

/* =======================================================
 * Utils
 * ======================================================= */
// Força padrão UPPER_SNAKE_CASE ao digitar (ex.: COMISSION_SAMPLE_SIZE)
function toSettingKey(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9]+/g, "_") // troca separadores por _
    .replace(/^_+|_+$/g, "") // tira _ no início/fim
    .replace(/_{2,}/g, "_") // colapsa múltiplos _
    .toUpperCase();
}

/* =======================================================
 * Component
 * ======================================================= */
export function Configuration() {
  // Create dialog state
  const [keyNew, setKeyNew] = useState("");
  const [valueNew, setValueNew] = useState("");
  const [descriptionNew, setDescriptionNew] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // List & loading
  const [settings, setSettings] = useState<SettingDTO[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);

  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<SettingDTO | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Per-item action states
  const [deletingKeys, setDeletingKeys] = useState<Record<string, boolean>>({});

  /* ======== NOVO: estado para confirmação de delete ======== */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDelKey, setConfirmDelKey] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { urlGeral } = useContext(UserContext);

  const token = useMemo(() => localStorage.getItem("jwt_token"), []);

  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  /* ======================== API Calls ======================== */
  const fetchSettings = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${urlGeral}settings/`, { method: "GET", headers: authHeaders });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao carregar configurações (HTTP ${res.status}).`);
      }
      const data: SettingsResponse = await res.json();
      setSettings(Array.isArray(data?.settings) ? data.settings : []);
    } catch (e: any) {
      toast("Erro ao carregar configurações", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlGeral]);

  const handleCreate = async () => {
    try {
      if (!keyNew.trim()) {
        toast("Informe a chave", { description: "O campo 'Chave' está vazio.", action: { label: "Fechar", onClick: () => {} } });
        return;
      }
      if (!valueNew.trim()) {
        toast("Informe o valor", { description: "O campo 'Valor' está vazio.", action: { label: "Fechar", onClick: () => {} } });
        return;
      }

      setCreating(true);
      const body = { key: keyNew.trim(), value: valueNew.trim(), description: descriptionNew || null };
      const res = await fetch(`${urlGeral}settings/`, { method: "POST", headers: authHeaders, body: JSON.stringify(body) });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao criar configuração (HTTP ${res.status}).`);
      }

      // Alguns backends retornam o item criado; se não, criamos um stub coerente
      let created: SettingDTO | null = null;
      try { created = await res.json(); } catch {}
      if (!created) {
        created = {
          key: body.key,
          value: body.value,
          description: body.description,
          id: (globalThis.crypto?.randomUUID?.() ?? `tmp-${Date.now()}`),
          created_at: new Date().toISOString(),
          updated_at: null,
        };
      }

      // ✅ Atualiza estado local (sem novo GET)
      setSettings(prev => [created as SettingDTO, ...prev.filter(s => s.key !== created!.key)]);

      toast("Configuração criada com sucesso!", {
        description: `“${body.key}” foi adicionada.`,
        action: { label: "Fechar", onClick: () => {} },
      });

      setIsCreateOpen(false);
      setKeyNew("");
      setValueNew("");
      setDescriptionNew("");
    } catch (e: any) {
      toast("Erro ao criar configuração", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (s: SettingDTO) => {
    setEditing(s);
    setEditValue(s.value ?? "");
    setEditDescription(s.description ?? "");
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      setSavingEdit(true);
      const body = { value: editValue, description: editDescription || null };
      const res = await fetch(`${urlGeral}settings/${encodeURIComponent(editing.key)}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao atualizar configuração (HTTP ${res.status}).`);
      }

      let updated: SettingDTO | null = null;
      try { updated = await res.json(); } catch {}

      // ✅ Atualiza estado local (sem novo GET)
      setSettings(prev => prev.map(s =>
        s.key === editing.key
          ? (updated ?? { ...s, value: body.value, description: body.description, updated_at: new Date().toISOString() })
          : s
      ));

      toast("Configuração atualizada!", {
        description: `“${editing.key}” foi atualizada com sucesso.`,
        action: { label: "Fechar", onClick: () => {} },
      });

      setIsEditOpen(false);
      setEditing(null);
    } catch (e: any) {
      toast("Erro ao atualizar configuração", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (key: string) => {
    try {
      setDeletingKeys(prev => ({ ...prev, [key]: true }));
      const res = await fetch(`${urlGeral}settings/${encodeURIComponent(key)}`, { method: "DELETE", headers: authHeaders });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao deletar configuração (HTTP ${res.status}).`);
      }

      // ✅ Atualiza estado local (sem novo GET)
      setSettings(prev => prev.filter(s => s.key !== key));

      toast("Configuração removida", {
        description: `“${key}” foi excluída.`,
        action: { label: "Fechar", onClick: () => {} },
      });
    } catch (e: any) {
      toast("Erro ao excluir configuração", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setDeletingKeys(prev => ({ ...prev, [key]: false }));
    }
  };

  /* ======== NOVO: abrir modal de confirmação de delete ======== */
  const openConfirmDelete = (key: string) => {
    setConfirmDelKey(key);
    setConfirmOpen(true);
  };

  /* ======== NOVO: confirmar no modal e executar DELETE ======== */
  const confirmAndDelete = async () => {
    if (!confirmDelKey) return;
    try {
      setConfirmLoading(true);
      await handleDelete(confirmDelKey); // front só muda se o fetch der certo
      setConfirmOpen(false);
      setConfirmDelKey(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  /* ======================== Render ======================== */
  return (
    <div className="p-8 grid gap-8">
      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Alert onClick={() => setIsCreateOpen(true)} className="flex items-center cursor-pointer gap-4 bg-transparent transition-all hover:bg-neutral-100 dark:bg-transparent dark:hover:bg-neutral-800">
            <div className="bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 rounded-md p-4 border ">
              <Plus size={20} />
            </div>
            <p className="font-medium">Adicionar configuração</p>
          </Alert>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Adicionar configuração</DialogTitle>
            <DialogDescription className="text-zinc-500">Crie uma chave de configuração para personalizar o comportamento do sistema.</DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="mb-4 grid gap-4">
            <div className="flex flex-col space-y-1.5 w-full flex-1">
              <Label htmlFor="setting-key">Chave</Label>
              <Input
                id="setting-key"
                value={keyNew}
                onChange={(e) => setKeyNew(toSettingKey(e.target.value))}
                type="text"
              />
            </div>

            <div className="flex flex-col space-y-1.5 w-full flex-1">
              <Label htmlFor="setting-value">Valor</Label>
              <Input id="setting-value" value={valueNew} onChange={(e) => setValueNew(e.target.value)} type="text"  />
            </div>

            <div className="flex flex-col space-y-1.5 w-full flex-1">
              <Label htmlFor="setting-description">Descrição</Label>
              <Textarea id="setting-description" value={descriptionNew} onChange={(e) => setDescriptionNew(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"ghost"}>
                <ArrowUUpLeft size={16} /> Cancelar
              </Button>
            </DialogClose>

            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-0">
            <HeaderResultTypeHome title={"Todas as configurações"} icon={<Settings size={24} className="text-gray-400" />} />
          </AccordionTrigger>

          <AccordionContent className="p-0">
            {loadingList ? (
              <div className="flex gap-4 flex-col">
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
              </div>
            ) : settings.length === 0 ? (
              <div className="items-center justify-center w-full flex text-center pt-6">Nenhuma configuração encontrada.</div>
            ) : (
              <div className="grid gap-3">
                {settings.map((s) => (
                  <Alert key={s.id} className="flex group items-start  gap-4 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold break-all">{s.key}</div>
                      <div className="text-sm text-muted-foreground break-all text-gray-500 tesxt-sm">Valor da variável: {s.value}</div>
                      {s.description ? (
                        <div className="text-sm  text-gray-500 text-muted-foreground mt-8 break-words">{s.description}</div>
                      ) : null}
                      
                    </div>

                    <div className="group-hover:flex items-center gap-2 shrink-0 hidden ">
                      <Button className="w-8 h-8"  variant="outline" size="icon" onClick={() => openEdit(s)}>
                        <Pencil size={16} className="" /> 
                      </Button>
                      <Button
                        variant='destructive'
                        size="icon"
                        onClick={() => openConfirmDelete(s.key)} // <<< abre modal
                        disabled={!!deletingKeys[s.key]}
                       className="w-8 h-8"
                        aria-label={`Excluir ${s.key}`}
                      >
                        {deletingKeys[s.key] ? <Loader2 size={16} className="animate-spin" /> : <Trash size={16} />}
                      </Button>
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Editar configuração</DialogTitle>
            <DialogDescription className="text-zinc-500">Atualize o valor e a descrição da chave selecionada.</DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          {editing ? (
            <div className="grid gap-4">
              <div className="flex flex-col space-y-1.5 w-full flex-1">
                <Label>Chave</Label>
                <Input value={editing.key} disabled />
              </div>

              <div className="flex flex-col space-y-1.5 w-full flex-1">
                <Label htmlFor="edit-value">Valor</Label>
                <Input id="edit-value" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
              </div>

              <div className="flex flex-col space-y-1.5 w-full flex-1">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea id="edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">
                <ArrowUUpLeft size={16} /> Cancelar
              </Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={savingEdit || !editing}>
              {savingEdit ? <Loader2 className="animate-spin" size={16} /> : <Pencil size={16} />} Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======== NOVO: Modal de confirmação de exclusão ======== */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
             <DialogHeader>
                        <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Excluir configuração</DialogTitle>
                        <DialogDescription className="text-zinc-500">
                         Tem certeza que deseja excluir <span className="font-mono font-medium">{confirmDelKey}</span>? Essa ação não pode ser desfeita.
                        </DialogDescription>
                      </DialogHeader>
        
          <DialogFooter>
            <DialogClose disabled={confirmLoading}>
                <Button variant="ghost">
                <ArrowUUpLeft size={16} /> Cancelar
              </Button>
            </DialogClose>
            <Button variant={'destructive'} onClick={confirmAndDelete} disabled={confirmLoading}>
              {confirmLoading ? <Loader2 size={16} className=" animate-spin" /> : <Trash size={16} className="" />}
              Excluir definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
