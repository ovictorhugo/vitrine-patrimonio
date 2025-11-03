import React, { useContext, useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Hourglass,
  ListChecks,
  Pencil,
  Recycle,
  Store,
  Trash,
  Loader2,
  LoaderCircle,
  Home,
  Undo2,
  ChevronRight as ChevronRightIcon,
  DoorClosed,
  User,
  Check,
  BarChart,
  Copy,
  Calendar,
  Hash,
  DoorOpen,
  Plus,
} from "lucide-react";
import { Button } from "../../ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Alert } from "../../ui/alert";
import { UserContext } from "../../../context/context";
import { Tabs, TabsContent } from "../../ui/tabs";
import { useQuery } from "../../authentication/signIn";
import { Switch } from "../../ui/switch";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { ArrowUUpLeft } from "phosphor-react";
import { Statistics } from "./tabs/statistics";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { HeaderResultTypeHome } from "../../header-result-type-home";
import DialogPreencherSala from "./components/dialog-preencher-sala";
import { usePermissions } from "../../permissions";

/* ================= Tipos ================= */
type StatusCount = { status: string; count: number };

type Unit = { id: string; unit_name: string; unit_code: string; unit_siaf: string };
type Agency = { id: string; agency_name: string; agency_code: string; unit_id: string; unit: Unit };
type Sector = { id: string; sector_name: string; sector_code: string; agency_id: string; agency: Agency };
type LegalGuardian = { id: string; legal_guardians_code: string; legal_guardians_name: string };

type LocationMy = {
  id: string;
  location_name: string;
  location_code: string;
  sector_id: string;
  legal_guardian_id: string;
  sector: Sector;
  legal_guardian: LegalGuardian;
  location_inventories?: string[]; // array de inventory_id
};

type MyLocationsResponse = { locations: LocationMy[] };

type UserDTO = { id: string; username: string; email: string };
type InventoryDTO = { id: string; key: string; available: boolean; created_by?: UserDTO; created_at?: string };

type AssetDTO = { id: string; asset_code: string; asset_check_digit: string };
type InventoryAssetsResponse = { assets: AssetDTO[] } | AssetDTO[];

/* ============== Helpers de rede ============== */
async function getInventoryDetail(baseUrl: string, inventoryId: string, token?: string | null): Promise<InventoryDTO> {
  const res = await fetch(`${baseUrl}inventories/${inventoryId}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Falha ao buscar inventário (${res.status}): ${t}`);
  }
  const js = await res.json();
  // aceita available ou avaliable
  const available = typeof js.available === "boolean" ? js.available : !!js.avaliable;
  return { id: js.id, key: js.key, available, created_by: js.created_by, created_at: js.created_at };
}

async function putInventory(
  baseUrl: string,
  inventoryId: string,
  payload: { key: string; available: boolean },
  token?: string | null
) {
  const res = await fetch(`${baseUrl}inventories/${inventoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Falha ao atualizar inventário (${res.status}): ${t}`);
  }
  return res.json().catch(() => ({}));
}

async function deleteInventory(baseUrl: string, inventoryId: string, token?: string | null) {
  const res = await fetch(`${baseUrl}inventories/${inventoryId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Falha ao excluir (${res.status}): ${t}`);
  }
  return true;
}

async function getMyLocations(baseUrl: string, token?: string | null): Promise<LocationMy[]> {
  const res = await fetch(`${baseUrl}locations/my`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Falha ao buscar salas (${res.status}): ${t}`);
  }
  const js: MyLocationsResponse = await res.json();
  return js.locations || [];
}

async function getInventoryAssetsByLocation(
  baseUrl: string,
  inventoryId: string,
  locationId: string,
  token?: string | null
): Promise<AssetDTO[]> {
  const res = await fetch(
    `${baseUrl}inventories/${inventoryId}/assets?location_id=${encodeURIComponent(locationId)}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Falha ao buscar itens (${res.status}): ${t}`);
  }
  const js: InventoryAssetsResponse = await res.json();
  return Array.isArray(js) ? js : js.assets || [];
}

/* ============== Página ============== */
export function InventarioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { urlGeral } = useContext(UserContext);

  const tabs = [
    { id: "inventario", label: "Salas", icon: DoorClosed },
  { id: "guardian", label: "Responsáveis", icon:User },
   { id: "statistics", label: "Estatísticas", icon:BarChart }
  ];

  const [isOn, setIsOn] = useState(true);
  const queryUrl = useQuery();
  const tab = queryUrl.get("tab");
  const inv_id = queryUrl.get("inv_id") || ""; // ← INVENTORY_ID vem da URL
  const [value, setValue] = useState(tab || tabs[0].id);

  // ===== Scroll dos tabs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollAreaRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeftBtn = () => scrollAreaRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRightBtn = () => scrollAreaRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===== Auth headers
  const token = useMemo(() => localStorage.getItem("jwt_token"), []);
  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // ===== Estatísticas (independentes)
  const [statsMap, setStatsMap] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch(`${urlGeral}statistics/catalog/count-by-workflow-status`, {
        method: "GET",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`Falha ao carregar estatísticas (HTTP ${res.status}).`);
      const data: StatusCount[] = await res.json();
      const map: Record<string, number> = {};
      for (const row of data || []) {
        if (row?.status) map[row.status] = row?.count ?? 0;
      }
      setStatsMap(map);
    } catch {
      setStatsMap({});
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlGeral]);

  const countReview =
    (statsMap["REVIEW_REQUESTED_VITRINE"] || 0) + (statsMap["REVIEW_REQUESTED_DESFAZIMENTO"] || 0);
  const countVitrine = statsMap["VITRINE"] || 0;
  const countTransferidos = statsMap["TRANSFERIDOS"] || 0;
  const countDesfazimento = statsMap["DESFAZIMENTO"] || 0;
  const fmt = (n: number) => (loadingStats ? "…" : String(n));

  /* ===== LOADING MESSAGES (estilo exemplo) ===== */
  const [loadingMessage, setLoadingMessage] = useState(
    "Estamos procurando todas as informações no nosso banco de dados, aguarde."
  );
  useEffect(() => {
    const t1 = setTimeout(() => setLoadingMessage("Estamos quase lá, continue aguardando..."), 5000);
    const t2 = setTimeout(() => setLoadingMessage("Só mais um pouco..."), 10000);
    const t3 = setTimeout(
      () =>
        setLoadingMessage(
          "Está demorando mais que o normal... estamos tentando encontrar tudo."
        ),
      15000
    );
    const t4 = setTimeout(
      () =>
        setLoadingMessage(
          "Estamos empenhados em achar todos os dados, aguarde só mais um pouco"
        ),
      20000
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  /* ===== Inventário atual (1º fetch) ===== */
  const [currentInventory, setCurrentInventory] = useState<InventoryDTO | null>(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!inv_id) {
        setCurrentInventory(null);
        setInventoryError("Inventário não informado.");
        return;
      }
      try {
        setInventoryError(null);
        setLoadingInventory(true);
        const inv = await getInventoryDetail(urlGeral, inv_id, token);
        if (!active) return;
        setCurrentInventory(inv);
      } catch (e: any) {
        if (!active) return;
        setInventoryError(e?.message || "Não foi possível carregar o inventário.");
        setCurrentInventory(null);
      } finally {
        if (active) setLoadingInventory(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [inv_id, urlGeral, token]);

  /* ===== Switch / Edit / Delete ===== */
  const [updatingAvailable, setUpdatingAvailable] = useState(false);

  async function handleToggleAvailable(next: boolean) {
    if (!currentInventory) return;
    try {
      setUpdatingAvailable(true);
      await putInventory(urlGeral, currentInventory.id, { key: currentInventory.key, available: next }, token);
      setCurrentInventory((prev) => (prev ? { ...prev, available: next } : prev));
      toast("Disponibilidade atualizada", {
        description: `Inventário ${next ? "disponível" : "encerrado"} para uso.`,
      });
    } catch (e: any) {
      toast("Erro ao atualizar disponibilidade", { description: e?.message || "Tente novamente." });
    } finally {
      setUpdatingAvailable(false);
    }
  }

  // Deletar
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const confirmEnabled = !!currentInventory && deleteText.trim() === (currentInventory.key || "");

  async function handleDeleteConfirm() {
    if (!currentInventory) return;
    try {
      setDeleting(true);
      await deleteInventory(urlGeral, currentInventory.id, token);
      toast("Inventário excluído", { description: `Inventário ${currentInventory.key} removido com sucesso.` });
      setDeleteOpen(false);
      setDeleteText("");
      setCurrentInventory(null);
      navigate("/dashboard/administrativo");
    } catch (e: any) {
      toast("Erro ao excluir inventário", { description: e?.message || "Tente novamente." });
    } finally {
      setDeleting(false);
    }
  }

  // Editar
  const [editOpen, setEditOpen] = useState(false);
  const [editKey, setEditKey] = useState("");
  const [editAvailable, setEditAvailable] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  function openEditDialog() {
    if (!currentInventory) return;
    setEditKey(currentInventory.key || "");
    setEditAvailable(!!currentInventory.available);
    setEditOpen(true);
  }

  async function handleEditSave() {
    if (!currentInventory) return;
    try {
      setSavingEdit(true);
      await putInventory(urlGeral, currentInventory.id, { key: editKey, available: editAvailable }, token);
      setCurrentInventory((prev) => (prev ? { ...prev, key: editKey, available: editAvailable } : prev));
      toast("Inventário atualizado", { description: "Alterações salvas com sucesso." });
      setEditOpen(false);
    } catch (e: any) {
      toast("Erro ao salvar alterações", { description: e?.message || "Tente novamente." });
    } finally {
      setSavingEdit(false);
    }
  }

  /* ===== Salas e assets (2º/3º fetch) ===== */
  const [rooms, setRooms] = useState<LocationMy[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [assetsPreview, setAssetsPreview] = useState<Record<string, AssetDTO[]>>({}); // room.id -> assets

  // Carrega salas DEPOIS que o inventário foi carregado
  useEffect(() => {
    let active = true;
    (async () => {
      // só busca salas se o inventário existe
      if (!currentInventory) {
        setRooms([]);
        return;
      }
      try {
        setLoadingRooms(true);
        const list = await getMyLocations(urlGeral, token);
        if (!active) return;
        setRooms(list);
      } catch (e: any) {
        if (!active) return;
        toast("Erro ao carregar salas", { description: e?.message || "Tente novamente." });
      } finally {
        if (active) setLoadingRooms(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [currentInventory, urlGeral, token]);

  const handleClickRoom = useCallback(
    async (room: LocationMy) => {
      if (!currentInventory) {
        toast("Carregue um inventário primeiro.");
        return;
      }
      try {
        const assets = await getInventoryAssetsByLocation(urlGeral, currentInventory.id, room.id, token);
        setAssetsPreview((prev) => ({ ...prev, [room.id]: assets }));
        toast("Sala carregada", { description: `${room.location_name}: ${assets.length} item(ns).` });
      } catch (e: any) {
        toast("Erro ao buscar itens da sala", { description: e?.message || "Tente novamente." });
      }
    },
    [currentInventory, token, urlGeral]
  );

  /* ===== Voltar (usa o mesmo padrão do seu exemplo) ===== */

  const history = useNavigate()
  const handleVoltar = () => {
   history('/dashboard/administrativo')
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

// no topo do componente InventarioPage:
const [invenarioSalaOpen, setInvenarioSalaOpen] = useState(false);

     const { hasConfiguracoes,hasInventario
  } = usePermissions();

  /* ===== Telas de Loading / Not Found (para o INVENTÁRIO) ===== */
  if (loadingInventory) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-full flex flex-col items-center justify-center h-full">
          <div className="text-eng-blue mb-4 animate-pulse">
            <LoaderCircle size={108} className="animate-spin" />
          </div>
          <p className="font-medium text-lg max-w-[500px] text-center">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (!inv_id || inventoryError || !currentInventory || !hasInventario) {
    return (
      <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full flex flex-col items-center justify-center">
          <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">(⊙_⊙)</p>
          <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
            Não foi possível acessar as <br /> informações deste inventário.
          </h1>
         
          <div className="flex gap-3 mt-8">
            <Button onClick={handleVoltar} variant={"ghost"}>
              <Undo2 size={16} /> Voltar
            </Button>
            <Button onClick={() => navigate("/")}>
              <Home size={16} /> Página Inicial
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== UI principal (inventário OK) =====
  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>{currentInventory.key} | Sistema Patrimônio</title>
        <meta name="description" content={`${currentInventory.key} | Sistema Patrimônio`} />
      </Helmet>

      <main className="flex flex-col ">
        <div className="flex p-8 items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>

            <h1 className="text-xl font-semibold tracking-tight">Inventário</h1>
          </div>

          <div className="flex gap-3 items-center">
            {/* Switch: PUT /inventories/:id */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium">{currentInventory?.available ? ('Disponível'):('Encerrado')}</p>
              <Switch
                checked={!!currentInventory?.available}
                onCheckedChange={(c) => handleToggleAvailable(!!c)}
                disabled={!currentInventory || updatingAvailable}
              />
            </div>

            {/* Editar (Dialog) */}
            <Button variant={"outline"} size={"sm"} onClick={openEditDialog}>
              <Pencil size={16} /> Editar
            </Button>

            {/* Deletar (Dialog) */}
            <Button
              variant={"destructive"}
              size={"sm"}
              onClick={() => {
                setDeleteText("");
                setDeleteOpen(true);
              }}
            >
              <Trash size={16} /> Deletar
            </Button>


               {/* Novo inventario (Dialog) */}
            <Button
          
              size={"sm"}
              onClick={() => {
                setDeleteText("");
                setInvenarioSalaOpen(true);
              }}
            >
              <Plus size={16} /> Preencher inventário de sala
            </Button>
          </div>
        </div>

        {/* Cards de estatística */}
        <div className="gap-8 p-8 pt-0">
          <div className="justify-center  px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
                         <h3 className="z-[2] text-center max-w-[900px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">{currentInventory.key}</h3>
           
         <div className="mt-2 flex flex-wrap justify-center  gap-3 text-sm text-gray-500 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Criado por:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Avatar className="rounded-md h-5 w-5 shrink-0">
                        <AvatarImage
                          className="rounded-md h-5 w-5"
                          src={`${urlGeral}user/upload/${currentInventory?.created_by?.id}/icon`}
                        />
                        <AvatarFallback className="flex items-center justify-center">
                          <User size={10} />
                        </AvatarFallback>
                      </Avatar>
                      {currentInventory?.created_by?.username || "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-md ${currentInventory?.available ? "bg-green-500" : "bg-red-500"}`} />
                    {currentInventory?.available ? "Disponível" : "Encerrado"}
                  </div>

                  <div className="flex items-center gap-2">
                 <Calendar size={16} />   Início: {formatDateTimeBR(currentInventory?.created_at)}
                  </div>

                <div className="flex items-center gap-2">
    <Hash size={16} /> Identificador
  <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          navigator.clipboard.writeText(currentInventory.id);
          toast("Identificador copiado", {
            description: `O código ${currentInventory.id} foi copiado para a área de transferência.`,
          });
        }}
      >
        <Copy size={16} />
      </Button>
           
           </div>
                </div>
          </div>

          <div className={`grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4`}>
            <Alert className="p-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de itens ociosos</CardTitle>
                <Hourglass className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(countReview)}</div>
                <p className="text-xs text-muted-foreground">registrados</p>
              </CardContent>
            </Alert>

            <Alert className="p-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de itens quebrado</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(countVitrine)}</div>
                <p className="text-xs text-muted-foreground">registrados</p>
              </CardContent>
            </Alert>

            <Alert className="p-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de itens não encontrados</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(countTransferidos)}</div>
                <p className="text-xs text-muted-foreground">registrados</p>
              </CardContent>
            </Alert>

            <Alert className="p-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de itens sem plaqueta</CardTitle>
                <Recycle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(countDesfazimento)}</div>
                <p className="text-xs text-muted-foreground">registrados</p>
              </CardContent>
            </Alert>
          </div>
        </div>

        <Tabs defaultValue="inventario" value={value} className="relative ">
          {/* header das tabs, mantendo seu estilo */}
          <div className="sticky top-[68px]  z-[2] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur ">
            <div className={`w-full ${isOn ? "px-8" : "px-4"} border-b border-b-neutral-200 dark:border-b-neutral-800`}>
              {isOn && <div className="w-full  flex justify-between items-center"></div>}
              <div className={`flex pt-2 gap-8 justify-between  ${isOn ? "" : ""} `}>
                <div className="flex items-center gap-2">
                  <div className="relative grid grid-cols-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`absolute left-0 z-10 h-8 w-8 p-0 top-1 ${!canScrollLeft ? "opacity-30 cursor-not-allowed" : ""}`}
                      onClick={() => scrollAreaRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
                      disabled={!canScrollLeft}
                    >
                      <ChevronLeft size={16} />
                    </Button>

                    <div className=" mx-10 ">
                      <div ref={scrollAreaRef} className="overflow-x-auto scrollbar-hide scrollbar-hide" onScroll={checkScrollability}>
                        <div className="p-0 flex gap-2 h-auto bg-transparent dark:bg-transparent">
                          {tabs.map(({ id, label, icon: Icon }) => (
                            <div
                              key={id}
                              className={`pb-2 border-b-2 text-black dark:text-white transition-all ${
                                value === id ? "border-b-[#719CB8]" : "border-b-transparent"
                              }`}
                              onClick={() => {
                                setValue(id);
                                queryUrl.set("page", "1");
                                navigate({
                                  pathname: location.pathname,
                                  search: queryUrl.toString(),
                                });
                              }}
                            >
                              <Button variant="ghost" className="m-0">
                                <Icon size={16} />
                                {label}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className={`absolute right-0 z-10 h-8 w-8 p-0 rounded-md  top-1 ${
                        !canScrollRight ? "opacity-30 cursor-not-allowed" : ""
                      }`}
                      onClick={() => scrollAreaRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
                      disabled={!canScrollRight}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="hidden xl:flex xl:flex-nowrap gap-2">
                  <div className="md:flex md:flex-nowrap gap-2">i</div>
                </div>
              </div>
            </div>
          </div>

          <TabsContent value="inventario">


            {/* GALERIA DE SALAS (sem Link) */}
            
     <div className="p-8 grid gap-4">
       <Alert className="p-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de salas</CardTitle>
                <DoorClosed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rooms.length}</div>
                <p className="text-xs text-muted-foreground">registrados</p>
              </CardContent>
            </Alert>

       <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-0">
            <HeaderResultTypeHome
              title={'Todas as salas'}
              icon={<DoorClosed size={24} className="text-gray-400" />}
            />
          </AccordionTrigger>

          <AccordionContent className="p-0">
<div className="flex flex-wrap gap-4 p-8 pt-6">
              {loadingRooms ? (
                <div className="text-sm text-muted-foreground">Carregando salas…</div>
              ) : rooms.length === 0 ? (
                <Alert className="text-sm">Nenhuma sala encontrada.</Alert>
              ) : (
                rooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => handleClickRoom(room)}
                    className="w-64 text-left"
                    title={room.location_name}
                  >
                    <Alert className="w-64 flex justify-between flex-col aspect-square cursor-pointer">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1 flex-wrap">
                            {room.sector?.agency?.agency_name} <ChevronRightIcon size={14} /> {room.sector?.sector_name}
                          </div>
                        </div>
                      </div>
                      <p className="text-xl font-semibold whitespace-normal">{room.location_name}</p>
                    </Alert>
                  </button>
                ))
              )}
            </div>
          </AccordionContent>
          </AccordionItem>
          </Accordion>
            
     </div>

            {/* Prévia dos assets carregados por sala (opcional) */}
            {Object.keys(assetsPreview).length > 0 && (
              <div className="px-8 pb-8">
                <CardTitle className="text-sm mb-2">Prévia de itens carregados</CardTitle>
                {Object.entries(assetsPreview).map(([roomId, assets]) => {
                  const room = rooms.find((r) => r.id === roomId);
                  return (
                    <Alert key={roomId} className="mb-3 p-3">
                      <div className="text-sm font-medium mb-1">
                        {room?.location_name} — {assets.length} item(ns)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {assets.slice(0, 5).map((a) => (
                          <div key={a.id}>
                            {a.asset_code}-{a.asset_check_digit}
                          </div>
                        ))}
                        {assets.length > 5 && <div>…</div>}
                      </div>
                    </Alert>
                  );
                })}
              </div>
            )}
          </TabsContent>


          <TabsContent value='statistics' className="">
            <Statistics/>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog: Deletar */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Excluir inventário</DialogTitle>
            <DialogDescription className="text-zinc-500 ">
              Esta ação é <span className="font-semibold">irreversível</span>. Para confirmar, digite exatamente o nome do inventário:{" "}
              <span className="font-semibold">{currentInventory?.key}</span>
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="space-y-2 mb-4">
            <Label>Digite o nome do inventário</Label>
            <Input
              placeholder="Digite exatamente como aparece"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              autoFocus
            />
            {!!currentInventory && deleteText.trim() && deleteText.trim() !== currentInventory.key && (
              <p className="text-xs text-red-500">O texto digitado não corresponde ao nome do inventário.</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteText("");
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

      {/* Dialog: Editar (PUT) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium">Editar inventário</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Atualize as informações do inventário e confirme para salvar.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />  

          <div className="space-y-2 mb-4">
            <div className="grid gap-2">
              <Label>Nome do inventário</Label>
              <Input value={editKey} onChange={(e) => setEditKey(e.target.value)} />
            </div>
         
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingEdit}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button onClick={handleEditSave} disabled={savingEdit || !editKey.trim()}>
              {savingEdit ? <Loader2 className=" h-4 w-4 animate-spin" /> : <Check size={16} /> }
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DialogPreencherSala
  open={invenarioSalaOpen}
  onOpenChange={setInvenarioSalaOpen}
  invId={currentInventory.id}
  baseUrl={urlGeral}
  token={token}
/>
    </div>
  );
}
