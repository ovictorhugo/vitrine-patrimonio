import { ListChecks, Plus, Loader2, Trash, User } from "lucide-react";
import { Alert } from "../../../ui/alert";
import { Button } from "../../../ui/button";
import { CardDescription, CardFooter, CardHeader, CardTitle } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../../../context/context";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Skeleton } from "../../../ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogFooter as DialogFooterUI,
  DialogHeader,
  DialogHeader as DialogHeaderUI,
  DialogTitle,
  DialogTitle as DialogTitleUI,
  DialogTrigger,
} from "../../../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { ArrowUUpLeft } from "phosphor-react";
import { Separator } from "../../../ui/separator";

// ===== Tipos da API =====
type UserDTO = {
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
};

type OwnerDTO = {
  user: UserDTO;
};

export type InventoryDTO = {
  key: string;
  id: string;
  created_by: UserDTO;
  created_at: string;
  owners: OwnerDTO[];
  avaliable: boolean;
};

export type InventoriesResponse = {
  inventories: InventoryDTO[];
};

export function Inventario() {
  const [key, setKey] = useState("");
  const [inventories, setInventories] = useState<InventoryDTO[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);

  // Dialog de exclusão
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; key: string } | null>(null);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const { urlGeral } = useContext(UserContext);
  const token = useMemo(() => localStorage.getItem("jwt_token"), []);

  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // ===== GET /inventories/ =====
  const fetchInventories = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${urlGeral}inventories/`, {
        method: "GET",
        headers: authHeaders,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao carregar inventários (HTTP ${res.status}).`);
      }

      const data: InventoriesResponse = await res.json();
      setInventories(Array.isArray(data?.inventories) ? data.inventories : []);
    } catch (e: any) {
      toast("Erro ao carregar inventários", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchInventories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlGeral]);

  // ===== POST /inventories/ =====
  const handleSubmit = async () => {
    try {
      if (!key.trim()) {
        toast("Informe o nome do inventário", {
          description: "O campo 'Nome do inventário' está vazio.",
          action: { label: "Fechar", onClick: () => {} },
        });
        return;
      }

      setCreating(true);

      const res = await fetch(`${urlGeral}inventories/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ 
            key: key.trim() ,
            avaliable:true
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao criar inventário (HTTP ${res.status}).`);
      }

      toast("Inventário criado com sucesso!", {
        description: `“${key.trim()}” foi adicionado.`,
        action: { label: "Fechar", onClick: () => {} },
      });

      setKey("");
       setIsOpen(false)
      await fetchInventories();
    } catch (e: any) {
      toast("Erro ao criar inventário", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setCreating(false);
    }
  };

  // ===== DELETE /inventories/{inventory_id} =====
  const openDeleteDialog = (id: string, invKey: string) => {
    setDeleteTarget({ id, key: invKey });
    setDeleteText("");
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await fetch(`${urlGeral}inventories/${deleteTarget.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao excluir inventário (HTTP ${res.status}).`);
      }

      toast("Inventário excluído", {
        description: `“${deleteTarget.key}” foi removido.`,
        action: { label: "Fechar", onClick: () => {} },
      });

      setDeleteOpen(false);
      setDeleteTarget(null);
      setDeleteText("");
      await fetchInventories();
    } catch (e: any) {
      toast("Erro ao excluir inventário", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDateTimeBR = (iso?: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "short",
      timeStyle: "short",
      // exemplo: 18/09/2025 12:37
    }).format(d);
  } catch {
    return iso;
  }
};

  const confirmEnabled = deleteTarget && deleteText.trim() === deleteTarget.key;

  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 gap-8 flex flex-col">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger>
    <Alert onClick={() => setIsOpen(true)} className="flex items-center cursor-pointer gap-4 bg-transparent transition-all hover:bg-neutral-100 dark:bg-transparent dark:hover:bg-neutral-800">
<div className="bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 rounded-md p-4 border ">
      <Plus size={20} />
</div>

<p className="font-medium">Adicionar inventário</p>
    </Alert>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Adicionar inventário</DialogTitle>
    <DialogDescription className="text-zinc-500">
         Crie um inventário para organizar os registros de bens em todas as salas.
      </DialogDescription>
    </DialogHeader>

     <Separator className="my-4" />

       <div className="mb-4">
 <div className="flex flex-col space-y-1.5 w-full flex-1">
              <Label htmlFor="inventory-name">Nome do inventário</Label>
              <Input
                id="inventory-name"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                type="text"
              />
            </div>
       </div>

         <DialogFooter>
          <DialogClose>
 <Button  variant={"ghost"}>
            <ArrowUUpLeft size={16} /> Cancelar
          </Button>
          </DialogClose>

            <Button onClick={handleSubmit} disabled={creating}>
              {creating ? <Loader2 className=" animate-spin" size={16} /> : <Plus size={16} className="" />}
              Adicionar inventário
            </Button>
         
          </DialogFooter>
  </DialogContent>
</Dialog>
   

      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-0">
            <HeaderResultTypeHome
              title={'Todos os inventários'}
              icon={<ListChecks size={24} className="text-gray-400" />}
            />
          </AccordionTrigger>

          <AccordionContent className="p-0">
            {loadingList ? (
              <div className="flex gap-4 flex-col">
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
              </div>
            ) : inventories.length === 0 ? (
              <div className="items-center justify-center w-full flex text-center pt-6">Nenhum inventário encontrado.</div>
            ) : (
             <div className="grid gap-4 ">
          {inventories.map((inv) => (
           <Link to={`/dashboard/inventario?inv_id=${inv.id}`}>
            <div key={inv.id} className="relative group flex">
              <div className="w-2 min-w-2 rounded-l-md border dark:border-neutral-800 bg-eng-blue" />
              <Alert
                className="rounded-l-none items-center flex justify-between border-l-0 w-full cursor-pointer hover:shadow-sm transition"
               
              >
               <div>
                 <div className="flex items-center mb-2 justify-between min-h-8 ">
                  <span className="font-medium text-lg truncate">{inv.key}</span>
                 
                
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Criado por:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Avatar className="rounded-md h-5 w-5 shrink-0">
                        <AvatarImage
                          className="rounded-md h-5 w-5"
                          src={`${urlGeral}user/upload/${inv.created_by.id}/icon`}
                        />
                        <AvatarFallback className="flex items-center justify-center">
                          <User size={10} />
                        </AvatarFallback>
                      </Avatar>
                      {inv.created_by?.username || "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-md ${inv.avaliable ? "bg-green-500" : "bg-red-500"}`} />
                    {inv.avaliable ? "Disponível" : "Encerrado"}
                  </div>

                  <div className="flex items-center gap-2">
                    Início: {formatDateTimeBR(inv.created_at)}
                  </div>
                </div>

                 
               </div>
                 <Button
                        variant={"destructive"}
                        size={"icon"}
                        className="h-8 w-8 shrink-0 group-hover:flex hidden"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openDeleteDialog(inv.id, inv.key);
                        }}
                        title="Excluir inventário"
                      >
                        <Trash size={16} />
                      </Button>
              </Alert>
            </div></Link>
          ))}
        </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        
        <DialogContent>
            <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
 Excluir inventário
</DialogTitle>
<DialogDescription className="text-zinc-500 ">
 Esta ação é <span className="font-semibold">irreversível</span>. Para confirmar, digite exatamente o nome do inventário: <span className=" font-semibold ">{deleteTarget?.key}</span>
</DialogDescription>
            </DialogHeader>

                  
            <Separator className="my-4"/>
      
          <div className="space-y-2 mb-4">
            <Label >Digite o nome do inventário</Label>
            <Input
            
              placeholder="Digite exatamente como aparece"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              autoFocus
            />
            {!!deleteTarget && deleteText.trim() && deleteText.trim() !== deleteTarget.key && (
              <p className="text-xs text-red-500">O texto digitado não corresponde ao nome do inventário.</p>
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
            <ArrowUUpLeft size={16} />     Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={!confirmEnabled || deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                <Trash size={16} /> Confirmar exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
