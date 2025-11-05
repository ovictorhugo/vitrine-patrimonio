// src/pages/desfazimento/index.tsx
import { Helmet } from "react-helmet";
import { Button } from "../../ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle, ChevronLeft, ChevronRight, Combine, Inbox, Info, Loader2, Package, PackageOpen, Pencil, Plus,  Trash, XCircle } from "lucide-react";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Separator } from "../../ui/separator";
import { ArrowUUpLeft, Rows, SquaresFour } from "phosphor-react";
import { UserContext } from "../../../context/context";
import { toast } from "sonner";
import { Textarea } from "../../ui/textarea";
import { Skeleton } from "../../ui/skeleton";

import { CollectionDTO } from "../collection/collection-page";
import { useQuery } from "../../authentication/signIn";

import { RoleMembers } from "../cargos-funcoes/components/role-members";

import { Search } from "../../search/search";

import { DragDropContext, DropResult, BeforeCapture, OnBeforeCaptureResponder } from "@hello-pangea/dnd";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { HeaderResultTypeHome } from "../../header-result-type-home";

import { Alert } from "../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../ui/card";
import { usePermissions } from "../../permissions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { AddToCollectionDrawer } from "../desfazimento/components/add-collection";
import { BlockItemsVitrine } from "../desfazimento/components/block-items-vitrine";
import { RowsItemsVitrine } from "../desfazimento/components/rows-items-vitrine";
import { CollectionItem } from "../desfazimento/components/collection-item";
import { CollectionPage } from "./tabs/collection-page";

type CollectionResponse = { collections: CollectionDTO[] };

type StatusCount = {
  status: string
  count: number;
};

export function Alienacao() {
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
    [token]
  );

  // ===== paginação via querystring (padrão offset/limit)
  const qs = new URLSearchParams(location.search);
  const initialOffset = Number(qs.get("offset") || "0");
  const initialLimit = Number(qs.get("limit") || "24");
  const [offset, setOffset] = useState<number>(initialOffset);
  const [limit, setLimit] = useState<number>(initialLimit);

  const isFirstPage = offset === 0;
  const isLastPage = collections.length < limit;

  const handleNavigate = (newOffset: number, newLimit: number, replace = false) => {
    const params = new URLSearchParams(location.search);
    params.set("offset", String(newOffset));
    params.set("limit", String(newLimit));
    navigate({ pathname: location.pathname, search: params.toString() }, { replace });
  };

  useEffect(() => {
    handleNavigate(offset, limit, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit]);

  // seleção da grade
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // função registrada pela grade para remover itens após POST
  const [removeFromGrid, setRemoveFromGrid] = useState<(ids: string[]) => void>(() => () => {});

  // ===== coleções (com paginação)
  const fetchInventories = async () => {
    try {
      setLoadingList(true);
      const url = `${urlGeral}collections/?type=COMPRAS&offset=${encodeURIComponent(offset)}&limit=${encodeURIComponent(limit)}`;
      const res = await fetch(url, { method: "GET", headers: authHeaders });
      if (!res.ok) throw new Error(`Falha ao carregar coleções (HTTP ${res.status})`);
      const data: CollectionResponse = await res.json();
      setCollections(Array.isArray(data?.collections) ? data.collections : []);
    } catch (e: any) {
      toast.error("Erro ao carregar coleções", { description: e?.message || String(e) });
    } finally {
      setLoadingList(false);
    }
  };
  useEffect(() => { fetchInventories(); /* eslint-disable-next-line */ }, [urlGeral, offset, limit]);

  // criar coleção
  const [isOpen, setIsOpen] = useState(false);
  const handleSubmit = async () => {
    try {
      if (!key.trim()) { toast("Informe o nome da coleção"); return; }
      setCreating(true);
      const res = await fetch(`${urlGeral}collections/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ description, name: key, type: "COMPRAS" }),
      });
      if (!res.ok) throw new Error(`Falha ao criar (HTTP ${res.status})`);
      await res.json().catch(()=>null);
      toast.success("Coleção criada");
      setKey(""); setDescription(""); setIsOpen(false);
      // ✅ volta para a primeira página e refaz busca
      setOffset(0);
      await fetchInventories();
    } catch (e: any) {
      toast.error("Erro ao criar", { description: e?.message || String(e) });
    } finally { setCreating(false); }
  };

  const [openAdd, setOpenAdd] = useState(false);
  const handleItemsAdded = (newItems: any[]) => toast.success(`${newItems.length} item(ns) adicionado(s).`);

  const queryUrl = useQuery();
  const type_search = queryUrl.get("collection_id");

  /* ===========================
     Fallback de DROP por hit-test
  ============================ */
  const collectionsGridRef = useRef<HTMLDivElement | null>(null);
  type XY = { x: number; y: number };
  const lastPoint = useRef<XY>({ x: 0, y: 0 });
  const draggingRef = useRef(false);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      lastPoint.current = { x: e.clientX, y: e.clientY };
    };
    const onTouch = (e: TouchEvent) => {
      if (!draggingRef.current) return;
      const t = e.touches[0] || e.changedTouches[0];
      if (!t) return;
      lastPoint.current = { x: t.clientX, y: t.clientY };
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  const hitTestCollection = (): string | null => {
    const root = collectionsGridRef.current;
    if (!root) return null;
    const { x, y } = lastPoint.current;
    const els = document.elementsFromPoint(x, y) as HTMLElement[];
    for (const el of els) {
      if (el.classList.contains('collection-drop-target') && root.contains(el)) {
        const collectionId = el.getAttribute('data-collection-id');
        if (collectionId) return collectionId;
      }
      let cur: HTMLElement | null = el;
      while (cur && cur !== document.body) {
        if (cur.classList.contains('collection-drop-target') && root.contains(cur)) {
          const collectionId = cur.getAttribute('data-collection-id');
          if (collectionId) return collectionId;
        }
        cur = cur.parentElement as HTMLElement | null;
      }
    }
    return null;
  };

  /* ============ DnD ============ */
  const onBeforeCapture: OnBeforeCaptureResponder = (start) => {
    if (!selectedIds.has(start.draggableId)) {
      setSelectedIds(new Set<string>([start.draggableId]));
    }
    draggingRef.current = true;
  };

  const onDragEnd = async (result: DropResult) => {
    draggingRef.current = false;
    const { destination, draggableId } = result;

    let targetCollectionId = destination?.droppableId || null;
    if (!targetCollectionId) targetCollectionId = hitTestCollection();

    if (!targetCollectionId) {
      return;
    }

    const targetCollection = collections.find((c) => c.id === targetCollectionId);
    if (!targetCollection) {
      toast.message("Alvo não é uma coleção conhecida.");
      return;
    }

    const ids = (selectedIds.size ? Array.from(selectedIds) : [draggableId]).filter(Boolean);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const responses = await Promise.allSettled(
      ids.map((catalogId) =>
        fetch(`${urlGeral}collections/${targetCollection.id}/items/`, {
          method: "POST",
          headers,
          body: JSON.stringify({ catalog_id: catalogId, status: false, comment: "" }),
        })
      )
    );

    const okIds: string[] = [];
    let failed = 0;
    responses.forEach((r, i) => {
      if (r.status === "fulfilled" && r.value.ok) okIds.push(ids[i]);
      else failed++;
    });

    if (okIds.length) {
      toast.success(`${okIds.length} item(ns) adicionados em "${targetCollection.name}"`);
      removeFromGrid(okIds);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        okIds.forEach((id) => next.delete(id));
        return next;
      });
    }

    if (failed > 0) toast.error(`${failed} item(ns) falharam ao adicionar`);
  };

  const [typeVisu, setTypeVisu] = useState<"block" | "rows">("block");

  /* ========= EDIT/DELETE COLLECTION ========= */
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newName, setNewName] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);

  const currentCollection = useMemo(
    () => collections.find((c) => c.id === currentCollectionId) || null,
    [collections, currentCollectionId]
  );

  useEffect(() => {
    if (currentCollection) {
      setNewName(currentCollection.name ?? "");
      setNewDescription(currentCollection.description ?? "");
    }
  }, [currentCollection]);

  const openEditFor = (id: string) => { setCurrentCollectionId(id); setEditOpen(true); };
  const openDeleteFor = (id: string) => { setCurrentCollectionId(id); setDeleteOpen(true); };

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
        prev.map((c) => (c.id === currentCollectionId ? { ...c, name: newName, description: newDescription } : c))
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
      setCollections((prev) => prev.filter((c) => c.id !== currentCollectionId));
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

  const [stats, setStats] = useState<StatusCount[]>([
    { status: "TRUE", count: 0 },
    { status: "FALSE", count: 0 },
    { status: "NOT_IN_COLLECTION", count: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(
          `${urlGeral}statistics/catalog/count-by-collection-status?workflow_status=DESFAZIMENTO`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Erro ao carregar estatísticas");

        const data: StatusCount[] = await res.json();

        const expectedStatuses = ["TRUE", "FALSE", "NOT_IN_COLLECTION"];
        const normalized = expectedStatuses.map((status) => {
          const found = data.find((d) => d.status === status);
          return { status, count: found ? found.count : 0 };
        });

        setStats(normalized);
      } catch (err) {
        console.error(err);
        setStats([
          { status: "TRUE", count: 0 },
          { status: "FALSE", count: 0 },
          { status: "NOT_IN_COLLECTION", count: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [urlGeral, token]);

  const getIcon = (status: string) => {
    switch (status) {
      case "TRUE":
        return <CheckCircle className="h-4 w-4 " />;
      case "FALSE":
        return <XCircle className="h-4 w-4 " />;
      case "NOT_IN_COLLECTION":
        return <Inbox className="h-4 w-4 " />;
      default:
        return <XCircle className="h-4 w-4 " />;
    }
  };

  const { hasColecoes } = usePermissions();

  const ROLE_COMISSAO_ID = import.meta.env.VITE_ID_SESSAO_DE_MANUTENCAO_E_LOGISTICA;


  if (type_search) return <CollectionPage />;

  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full">
      <Helmet><title>Alienação | Sistema Patrimônio</title></Helmet>

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => {
              const path = location.pathname;
              if (location.search.length > 0) navigate(path);
              else {
                const seg = path.split("/").filter(Boolean);
                if (seg.length > 1) { seg.pop(); navigate("/" + seg.join("/")); } else navigate("/");
              }
            }}
            variant="outline" size="icon" className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">Alienação</h1>
        </div>

        <div className="hidden gap-3 items-center xl:flex">
          {hasColecoes && (
            <Button size="sm" variant='outline' onClick={()=>setOpenAdd(true)}><Plus size={16}/> Adicionar itens</Button>
          )}

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {hasColecoes && (
              <DialogTrigger asChild>
                <Button size="sm"><Plus size={16}/> Adicionar coleção</Button>
              </DialogTrigger>
            )}
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Adicionar coleção</DialogTitle>
                <DialogDescription className="text-zinc-500 ">
                  Crie uma coleção e agrupe dos Itens da Alienação
                </DialogDescription>
              </DialogHeader>
              <Separator className="my-4" />
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label>Nome*</Label>
                  <Input value={key} onChange={(e)=>setKey(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Descrição</Label>
                  <Textarea value={description} onChange={(e)=>setDescription(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost"><ArrowUUpLeft size={16}/> Cancelar</Button></DialogClose>
                <Button onClick={handleSubmit} disabled={creating}>
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Criar coleção
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {hasColecoes && (
            <RoleMembers roleId={ROLE_COMISSAO_ID} title="Seção de Manutenção e Apoio Logístico" />
          )}
        </div>
      </div>

      {/* HERO + BUSCA */}
      <div className="justify-center  px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20" >
        <Link to={'/informacoes'} className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"><Info size={12} /><div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>Saiba o que é e como utilizar a plataforma<ArrowRight size={12} /></Link>

      <h1 className="z-[2] text-center max-w-[900px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
Agrupe os itens em coleções para o  controle e <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">alienação</strong>
</h1>
        <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>

        <div className="lg:max-w-[60vw] lg:w-[60vw] w-full">
          <Search />
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-3">
        {stats?.map((item) => (
          <Alert key={item.status} className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.status === "TRUE"
                  ? "Coletados"
                  : item.status === "FALSE"
                  ? "Pendentes"
                  : "Sem coleção"}
              </CardTitle>
              {getIcon(item.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.count}</div>
              <p className="text-xs text-muted-foreground">registrados</p>
            </CardContent>
          </Alert>
        ))}
      </div>

      {/* ============ DND CONTEXT ============ */}
      <DragDropContext onBeforeCapture={onBeforeCapture} onDragEnd={onDragEnd}>

        {/* ===== Coleções (com paginação) ===== */}
        <Accordion
          type="single"
          defaultValue="usuarios"
          collapsible
          className="flex flex-col mt-4 gap-4"
        >
          <AccordionItem value="usuarios">
            <AccordionTrigger className="px-0">
              <HeaderResultTypeHome
                title={"Coleções"}
                icon={<Combine size={24} className="text-gray-400" />}
              />
            </AccordionTrigger>

            <AccordionContent className="p-0">
              <div
                ref={collectionsGridRef}
                className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 "
              >
                {loadingList ? (
                  Array.from({length:8}).map((_,i)=> <div key={i} className="w-full"><Skeleton className="w-full aspect-square" /></div>)
                ) : collections.length === 0 ? (
                  <div className="col-span-full items-center justify-center w-full flex text-center pt-6">Nenhuma coleção encontrada.</div>
                ) : (
                  collections.map((c)=> (
                    <CollectionItem
                      key={c.id}
                      props={c}
                      type="ALIENAÇÃO"
                      onEdit={()=>openEditFor(c.id)}
                      onDelete={()=>openDeleteFor(c.id)}
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
            </AccordionContent>

          </AccordionItem>
        </Accordion>

        {/* ===== Itens ===== */}
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <div className="flex ">
              <div className="flex gap-4 w-full justify-between items-center ">
                <HeaderResultTypeHome title="Todos os itens" icon={<Package size={24} className="text-gray-400" />} />

                <div className="flex gap-3 mr-3 items-center h-full">
                  <Button onClick={() => setTypeVisu("rows")} variant={typeVisu == "block" ? "ghost" : "outline"} size={"icon"}>
                    <Rows size={16} className=" whitespace-nowrap" />
                  </Button>

                  <Button onClick={() => setTypeVisu("block")} variant={typeVisu == "block" ? "outline" : "ghost"} size={"icon"}>
                    <SquaresFour size={16} className=" whitespace-nowrap" />
                  </Button>
                </div>
              </div>

              <AccordionTrigger />
            </div>

            <AccordionContent className="p-0">
              {typeVisu === "block" ? (
                <BlockItemsVitrine
                  workflow="ALIENACAO"
                  selectedIds={selectedIds}
                  onChangeSelected={setSelectedIds}
                  registerRemove={(fn)=>setRemoveFromGrid(()=>fn)}
                />
              ) : (
                <RowsItemsVitrine
                  workflow="ALIENACAO"
                  selectedIds={selectedIds}
                  onChangeSelected={setSelectedIds}
                  registerRemove={(fn)=>setRemoveFromGrid(()=>fn)}
                />
              )}
            </AccordionContent>

          </AccordionItem>
        </Accordion>
      </DragDropContext>

      <AddToCollectionDrawer
      type={'COMPRAS'}
        open={openAdd} onOpenChange={(o)=>setOpenAdd(o)}
        baseUrl={urlGeral} headers={authHeaders}
        collectionId={null} onItemsAdded={handleItemsAdded}
      />

      {/* =================== Dialog EDITAR =================== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Editar coleção</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Altere o nome e a descrição da coleção.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Nome</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Descrição</Label>
              <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              <ArrowUUpLeft size={16} />  Cancelar
            </Button>
            <Button onClick={handleUpdateCollection} disabled={updateLoading}>
              {updateLoading ? <Loader2 className="animate-spin " size={16} /> : <Pencil className=" " size={16} />}
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================== Dialog DELETAR =================== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[520px]">Deletar coleção</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              <ArrowUUpLeft size={16} />    Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCollection} disabled={deleteLoading}>
              {deleteLoading ? <Loader2 className="animate-spin " size={16} /> : <Trash className=" " size={16} />}
              Deletar coleção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
