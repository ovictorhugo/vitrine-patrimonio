import { Helmet } from "react-helmet";
import { Button } from "../ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Info,
  Loader2,
  Pencil,
  Plus,
  Trash,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { ArrowUUpLeft } from "phosphor-react";
import { UserContext } from "../../context/context";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";
import { CollectionDTO } from "../dashboard/collection/collection-page";
import { useQuery } from "../authentication/signIn";
import { CollectionPage } from "./collection-page";
import { CollectionItem } from "./components/collection-item";
import { Alert } from "../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { usePermissions } from "../permissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type CollectionResponse = { collections: CollectionDTO[] };

type StatusCount = {
  status: string;
  count: number;
};

export function Removiveis() {
  const navigate = useNavigate();
  const location = useLocation();
  const { urlGeral } = useContext(UserContext);

  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);

  const token = useMemo(() => localStorage.getItem("jwt_token"), []);
  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token],
  );

  const qs = new URLSearchParams(location.search);
  const initialOffset = Number(qs.get("offset") || "0");
  const initialLimit = Number(qs.get("limit") || "12");
  const [offset, setOffset] = useState<number>(initialOffset);
  const [limit, setLimit] = useState<number>(initialLimit);

  const isFirstPage = offset === 0;
  const isLastPage = collections.length < limit;

  const handleNavigate = (
    newOffset: number,
    newLimit: number,
    replace = false,
  ) => {
    const params = new URLSearchParams(location.search);
    params.set("offset", String(newOffset));
    params.set("limit", String(newLimit));
    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace },
    );
  };

  useEffect(() => {
    handleNavigate(offset, limit, true);
  }, [offset, limit]);

  const fetchInventories = async () => {
    try {
      setLoadingList(true);
      const url = `${urlGeral}collections/?type=REMOCAO_DISPONIVEIS&offset=${encodeURIComponent(
        offset,
      )}&limit=${encodeURIComponent(limit)}`;
      const res = await fetch(url, { method: "GET", headers: authHeaders });
      if (!res.ok)
        throw new Error(`Falha ao carregar coleções (HTTP ${res.status})`);
      const data: CollectionResponse = await res.json();
      setCollections(Array.isArray(data?.collections) ? data.collections : []);
    } catch (e: any) {
      toast.error("Erro ao carregar coleções", {
        description: e?.message || String(e),
      });
    } finally {
      setLoadingList(false);
    }
  };
  useEffect(() => {
    fetchInventories();
  }, [urlGeral, offset, limit]);
  const { hasAdministrativo } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const handleSubmit = async () => {
    try {
      if (!key.trim()) {
        toast("Informe o nome da coleção");
        return;
      }
      setCreating(true);
      const res = await fetch(`${urlGeral}collections/?admin=${hasAdministrativo}`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ description, name: key, type: "REMOCAO_DISPONIVEIS" }),
      });
      if (!res.ok) throw new Error(`Falha ao criar (HTTP ${res.status})`);
      await res.json().catch(() => null);
      toast.success("Coleção criada");
      setKey("");
      setDescription("");
      setIsOpen(false);
      setOffset(0);
      await fetchInventories();
    } catch (e: any) {
      toast.error("Erro ao criar", { description: e?.message || String(e) });
    } finally {
      setCreating(false);
    }
  };

  const [openAdd, setOpenAdd] = useState(false);
  const handleItemsAdded = (newItems: any[]) =>
    toast.success(`${newItems.length} item(ns) adicionado(s).`);

  const queryUrl = useQuery();
  const type_search = queryUrl.get("collection_id");

  /* ========= EDIT/DELETE COLLECTION ========= */
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newName, setNewName] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(
    null,
  );

  const currentCollection = useMemo(
    () => collections.find((c) => c.id === currentCollectionId) || null,
    [collections, currentCollectionId],
  );

  useEffect(() => {
    if (currentCollection) {
      setNewName(currentCollection.name ?? "");
      setNewDescription(currentCollection.description ?? "");
    }
  }, [currentCollection]);

  const openEditFor = (id: string) => {
    setCurrentCollectionId(id);
    setEditOpen(true);
  };
  const openDeleteFor = (id: string) => {
    setCurrentCollectionId(id);
    setDeleteOpen(true);
  };

  const handleUpdateCollection = async () => {
    if (!currentCollectionId) return;
    try {
      setUpdateLoading(true);
      const res = await fetch(`${urlGeral}collections/${currentCollectionId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ name: newName, description: newDescription }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao atualizar a coleção.");
      }
      setCollections((prev) =>
        prev.map((c) =>
          c.id === currentCollectionId
            ? { ...c, name: newName, description: newDescription }
            : c,
        ),
      );
      toast.success("Coleção atualizada com sucesso!");
      setEditOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Falha ao atualizar a coleção.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!currentCollectionId) return;

    if (currentCollection?.sei_process || currentCollection?.document_path) {
      toast.error("Não é possível deletar uma coleção com documentação ou número de processo");
      return;
    }
    try {
      setDeleteLoading(true);
      const res = await fetch(`${urlGeral}collections/${currentCollectionId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao deletar a coleção.");
      }
      setCollections((prev) =>
        prev.filter((c) => c.id !== currentCollectionId),
      );
      toast.success("Coleção deletada.");
      setDeleteOpen(false);
      setCurrentCollectionId(null);
      // opcional: se esvaziar página, você pode fazer:
      // await fetchInventories();
    } catch (e: any) {
      toast.error(e?.message || "Falha ao deletar a coleção.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (type_search) return <CollectionPage />;

  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full">
      <Helmet>
        <title>Disponíveis Remoção | Sistema Patrimônio</title>
      </Helmet>

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => {
              const path = location.pathname;
              if (location.search.length > 0) navigate(path);
              else {
                const seg = path.split("/").filter(Boolean);
                if (seg.length > 1) {
                  seg.pop();
                  navigate("/" + seg.join("/"));
                } else navigate("/");
              }
            }}
            variant="outline"
            size="icon"
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            Disponíveis Remoção
          </h1>
        </div>

        <div className="hidden gap-3 items-center xl:flex">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={16} /> Adicionar coleção
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
                  Adicionar coleção
                </DialogTitle>
                <DialogDescription className="text-zinc-500 ">
                  Crie uma coleção e agrupe itens
                </DialogDescription>
              </DialogHeader>
              <Separator className="my-4" />
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label>Nome*</Label>
                  <Input value={key} onChange={(e) => setKey(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Descrição</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">
                    <ArrowUUpLeft size={16} /> Cancelar
                  </Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={creating}>
                  {creating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}{" "}
                  Criar coleção
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* HERO + BUSCA */}
      <div className="justify-center w-full mx-auto flex flex-col items-center gap-2 py-8">
        <Link
          to={"/removiveis"}
          className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"
        >
          <Info size={12} />
          <div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>
          Aqui você verá os itens pronto para serem removidos
        </Link>

        <h1 className="z-[2] text-center max-w-[800px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
          Agrupe os itens para criar a sua lista de{" "}
          <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
            remoção
          </strong>
        </h1>
        <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>
      </div>


      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {loadingList ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-full">
              <Skeleton className="w-full aspect-square" />
            </div>
          ))
        ) : collections.length === 0 ? (
          <div className="col-span-full items-center justify-center w-full flex text-center pt-6">
            Nenhuma coleção encontrada.
          </div>
        ) : (
          collections.map((c) => (
            <CollectionItem
              key={c.id}
              props={c}
              type="Disponíveis Remoção"
              onEdit={() => openEditFor(c.id)}
              onDelete={() => openDeleteFor(c.id)}
            />
          ))
        )}
      </div>

      {/* ===== Paginação das Coleções ===== */}
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
            {[10, 20, 40, 80, 160, 320].map((val) => (
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

      {/* =================== Dialog EDITAR =================== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
              Editar coleção
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Altere o nome e a descrição da coleção.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Nome</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button onClick={handleUpdateCollection} disabled={updateLoading}>
              {updateLoading ? (
                <Loader2 className="animate-spin " size={16} />
              ) : (
                <Pencil className=" " size={16} />
              )}
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================== Dialog DELETAR =================== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[520px]">
              Deletar coleção
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Tem certeza que deseja excluir esta coleção? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCollection}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader2 className="animate-spin " size={16} />
              ) : (
                <Trash className=" " size={16} />
              )}
              Deletar coleção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
