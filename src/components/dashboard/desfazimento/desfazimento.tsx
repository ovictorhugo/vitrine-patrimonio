// src/pages/desfazimento/index.tsx
import { Helmet } from "react-helmet";
import { Button } from "../../ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, Combine, Info, Loader2, Package, Plus } from "lucide-react";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Separator } from "../../ui/separator";
import { ArrowUUpLeft } from "phosphor-react";
import { UserContext } from "../../../context/context";
import { toast } from "sonner";
import { Textarea } from "../../ui/textarea";
import { Skeleton } from "../../ui/skeleton";
import { CollectionItem } from "../collection/collection-item";
import { CollectionDTO } from "../collection/collection-page";
import { useQuery } from "../../authentication/signIn";
import { CollectionPage } from "./tabs/collection-page";
import { RoleMembers } from "../cargos-funcoes/components/role-members";
import { AddToCollectionDrawer } from "./components/add-collection";
import { Search } from "../../search/search";
import { BlockItemsVitrine } from "./components/block-items-vitrine";
import { DragDropContext, DropResult, BeforeCapture } from "@hello-pangea/dnd";

type CollectionResponse = { collections: CollectionDTO[] };

export function Desfazimento() {
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

  // seleção da grade
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // função registrada pela grade para remover itens após POST
  const [removeFromGrid, setRemoveFromGrid] = useState<(ids: string[]) => void>(() => () => {});

  // ===== coleções
  const fetchInventories = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${urlGeral}collections/?type=SMAL`, { method: "GET", headers: authHeaders });
      if (!res.ok) throw new Error(`Falha ao carregar coleções (HTTP ${res.status})`);
      const data: CollectionResponse = await res.json();
      setCollections(Array.isArray(data?.collections) ? data.collections : []);
    } catch (e: any) {
      toast.error("Erro ao carregar coleções", { description: e?.message || String(e) });
    } finally {
      setLoadingList(false);
    }
  };
  useEffect(() => { fetchInventories(); /* eslint-disable-next-line */ }, [urlGeral]);

  // criar coleção
  const [isOpen, setIsOpen] = useState(false);
  const handleSubmit = async () => {
    try {
      if (!key.trim()) { toast("Informe o nome da coleção"); return; }
      setCreating(true);
      const res = await fetch(`${urlGeral}collections/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ description, name: key, type: "SMAL" }),
      });
      if (!res.ok) throw new Error(`Falha ao criar (HTTP ${res.status})`);
      toast.success("Coleção criada");
      setKey(""); setDescription(""); setIsOpen(false);
      await fetchInventories();
    } catch (e: any) {
      toast.error("Erro ao criar", { description: e?.message || String(e) });
    } finally { setCreating(false); }
  };

  const [openAdd, setOpenAdd] = useState(false);
  const handleItemsAdded = (newItems: any[]) => toast.success(`${newItems.length} item(ns) adicionado(s).`);

  const queryUrl = useQuery();
  const type_search = queryUrl.get("collection_id");
  if (type_search) return <CollectionPage />;

  /* ===========================
     Fallback de DROP por hit-test
  ============================ */
  const collectionsGridRef = useRef<HTMLDivElement | null>(null);
  type XY = { x: number; y: number };
  const lastPoint = useRef<XY>({ x: 0, y: 0 });
  const draggingRef = useRef(false);

  // atualiza posição via pointer/touch (robusto)
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

// Substitua a função hitTestCollection no arquivo src/pages/desfazimento/index.tsx

const hitTestCollection = (): string | null => {
  const root = collectionsGridRef.current;
  if (!root) return null;
  
  const { x, y } = lastPoint.current;
  
  // Pega todos os elementos na posição
  const els = document.elementsFromPoint(x, y) as HTMLElement[];
  
  // Procura por um elemento com a classe collection-drop-target
  for (const el of els) {
    if (el.classList.contains('collection-drop-target') && root.contains(el)) {
      const collectionId = el.getAttribute('data-collection-id');
      if (collectionId) {
        console.log('✅ Hit-test encontrou coleção:', collectionId);
        return collectionId;
      }
    }
    
    // Também tenta encontrar um ancestral com a classe
    let cur: HTMLElement | null = el;
    while (cur && cur !== document.body) {
      if (cur.classList.contains('collection-drop-target') && root.contains(cur)) {
        const collectionId = cur.getAttribute('data-collection-id');
        if (collectionId) {
          console.log('✅ Hit-test encontrou coleção (ancestral):', collectionId);
          return collectionId;
        }
      }
      cur = cur.parentElement as HTMLElement | null;
    }
  }
  
  console.log('❌ Hit-test não encontrou coleção válida');
  return null;
};

  /* ============ DnD ============ */
  const onBeforeCapture: BeforeCapture = (start) => {
    if (!selectedIds.has(start.draggableId)) {
      setSelectedIds(new Set([start.draggableId]));
    }
    draggingRef.current = true;
  };

  const onDragEnd = async (result: DropResult) => {
    draggingRef.current = false;

    const { destination, draggableId } = result;

    // 1) destino oficial
    let targetCollectionId = destination?.droppableId || null;
    // 2) fallback por hit-test
    if (!targetCollectionId) targetCollectionId = hitTestCollection();

    if (!targetCollectionId) {
      toast.message("Soltou fora de um alvo válido");
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
          body: JSON.stringify({ catalog_id: catalogId, status: true, comment: "" }),
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

  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full">
      <Helmet><title>Desfazimento | Sistema Patrimônio</title></Helmet>

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
          <h1 className="text-xl font-semibold tracking-tight">Desfazimento</h1>
        </div>

        <div className="hidden gap-3 items-center xl:flex">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus size={16}/> Adicionar coleção</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar coleção</DialogTitle>
                <DialogDescription>Crie uma coleção para a LFD.</DialogDescription>
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
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button size="sm" variant="secondary" onClick={()=>setOpenAdd(true)}><Plus size={16}/> Adicionar itens</Button>
          <RoleMembers roleId="16c957d6-e66a-42a4-a48a-1e4ca77e6266" title="Comissão de desfazimento" />
        </div>
      </div>

      {/* HERO + BUSCA */}
      <div className="justify-center px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-8 md:py-12">
        <Link to={"/informacoes"} className="inline-flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-700 gap-2 mb-3 px-3 py-1 text-sm font-medium">
          <Info size={12}/> <div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800" /> Saiba como usar <ArrowRight size={12}/>
        </Link>
        <h1 className="text-center max-w-[900px] text-3xl font-bold">Arraste itens para coleções</h1>
        <div className="lg:max-w-[60vw] lg:w-[60vw] w-full"><Search /></div>
      </div>

      {/* ============ DND CONTEXT ============ */}
      <DragDropContext onBeforeCapture={onBeforeCapture} onDragEnd={onDragEnd}>
        {/* COLEÇÕES (ALVOS) */}
        <div className="flex items-center gap-2 mb-2">
          <Combine size={18}/> <span className="font-semibold">Coleções (solte aqui)</span>
        </div>

        <div
          ref={collectionsGridRef}
          className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-2"
        >
          {loadingList ? (
            Array.from({length:8}).map((_,i)=> <div key={i} className="w-full"><Skeleton className="w-full aspect-[4/3]" /></div>)
          ) : collections.length === 0 ? (
            <div className="col-span-full items-center justify-center w-full flex text-center pt-6">Nenhuma coleção encontrada.</div>
          ) : (
            collections.map((props)=> <CollectionItem key={props.id} props={props} type="desfazimento" />)
          )}
        </div>

        {/* ITENS (FONTES) */}
        <div className="flex items-center gap-2 mt-6 mb-2">
          <Package size={18}/> <span className="font-semibold">Todos os itens (arraste para uma coleção)</span>
        </div>
        <BlockItemsVitrine
          workflow="DESFAZIMENTO"
          selectedIds={selectedIds}
          onChangeSelected={setSelectedIds}
          registerRemove={(fn)=>setRemoveFromGrid(()=>fn)}
        />
      </DragDropContext>

      <AddToCollectionDrawer
        open={openAdd} onOpenChange={(o)=>setOpenAdd(o)}
        baseUrl={urlGeral} headers={authHeaders}
        collectionId={null} onItemsAdded={handleItemsAdded}
      />
    </div>
  );
}
