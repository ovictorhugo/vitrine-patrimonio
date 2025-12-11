import {
  Archive,
  BarChart,
  Bell,
  Bug,
  ChevronLeft,
  ChevronRight,
  Clock,
  File,
  HelpCircle,
  Hourglass,
  ListChecks,
  ListTodo,
  Recycle,
  Settings,
  Store,
  TimerReset,
  Trash,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { Button } from "../../ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Alert } from "../../ui/alert";
import {
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { UserContext } from "../../../context/context";
import { Tabs, TabsContent } from "../../ui/tabs";
import { useQuery } from "../../authentication/signIn";
import { Inventario } from "./tabs/inventario";
import { FileXls } from "phosphor-react";
import { useModal } from "../../hooks/use-modal-store";
import { Notification } from "./tabs/notification";
import { Feedback } from "./tabs/feedback";
import { Configuration } from "./tabs/configuration";
import { usePermissions } from "../../permissions";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../ui/carousel";
import { Documentos } from "./tabs/documentos";
import { Statistics } from "./tabs/statistcs";
import { useIsMobile } from "../../../hooks/use-mobile";

export type StatusCount = { status: string; count: number };

export const WORKFLOWS = [
  {
    key: "REVIEW_REQUESTED_VITRINE",
    name: "Avaliação S. Patrimônio - Vitrine",
    Icon: Hourglass,
  },
  { key: "ADJUSTMENT_VITRINE", name: "Ajustes - Vitrine", Icon: Wrench },
  { key: "VITRINE", name: "Anunciados", Icon: Store },
  {
    key: "AGUARDANDO_TRANSFERENCIA",
    name: "Aguardando transferência",
    Icon: Clock,
  },
  { key: "TRANSFERIDOS", name: "Transferidos", Icon: Archive },

  {
    key: "REVIEW_REQUESTED_DESFAZIMENTO",
    name: "Avaliação S. Patrimônio - Desfazimento",
    Icon: Hourglass,
  },
  {
    key: "ADJUSTMENT_DESFAZIMENTO",
    name: "Ajustes - Desfazimento",
    Icon: Wrench,
  },
  {
    key: "REVIEW_REQUESTED_COMISSION",
    name: "LTD - Lista Temporária de Desfazimento",
    Icon: ListTodo,
  },
  { key: "REJEITADOS_COMISSAO", name: "Recusados", Icon: XCircle },
  {
    key: "DESFAZIMENTO",
    name: "LFD - Lista Final de Desfazimento",
    Icon: Trash,
  },
  { key: "DESCARTADOS", name: "Processo Finalizado", Icon: Recycle },
] as const;

export function Admin() {
  const { hasConfiguracoes, hasInventario } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, urlGeral } = useContext(UserContext);

  const tabs = [
    {
      id: "inventario",
      label: "Inventário",
      icon: ListChecks,
      condition: !hasInventario,
    },
    { id: "notification", label: "Notificações", icon: Bell },
    { id: "feedback", label: "Feedback", icon: Bug },
    { id: "estatisticas", label: "Estatísticas", icon: BarChart },
    { id: "documentos", label: "Documentos", icon: File },
    {
      id: "configuration",
      label: "Configurações",
      icon: Settings,
      condition: !hasConfiguracoes,
    },
  ];

  const visibleTabs = useMemo(() => tabs.filter((t) => !t.condition), [tabs]);

  const baseUrl = useMemo(
    () => (urlGeral || "").replace(/\/+$/, ""),
    [urlGeral]
  );

  const token = useMemo(() => localStorage.getItem("jwt_token"), []);

  const authHeaders: HeadersInit = useMemo(() => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  // ===== TAB inicial
  const queryUrl = useQuery();
  const rawTab = queryUrl.get("tab");

  const firstAvailableTabId = visibleTabs[0]?.id ?? tabs[0].id;

  const initialTab = useMemo(() => {
    return visibleTabs.some((t) => t.id === rawTab)
      ? (rawTab as string)
      : firstAvailableTabId;
  }, [rawTab, visibleTabs, firstAvailableTabId]);

  const [value, setValue] = useState<string>(initialTab);

  // ===== Scroll dos tabs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!scrollAreaRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const scrollLeftBtn = () =>
    scrollAreaRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRightBtn = () =>
    scrollAreaRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===== Estatísticas (continua no pai, mas filtrando pela URL)

  const [statsMap, setStatsMap] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(false);

  const buildStatsParamsFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);

    // só repassa se existirem na URL
    const allowedKeys = [
      "q",
      "material_id",
      "legal_guardian_id",
      "unit_id",
      "agency_id",
      "sector_id",
      "location_id",
    ];

    const out = new URLSearchParams();
    for (const k of allowedKeys) {
      const v = params.get(k);
      if (v) out.set(k, v);
    }
    return out;
  }, [location.search]);

  const fetchStats = useCallback(async () => {
    if (!baseUrl) return;
    try {
      setLoadingStats(true);

      const params = buildStatsParamsFromUrl();
      const url = `${baseUrl}/statistics/catalog/count-by-workflow-status?${params.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: authHeaders,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

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
  }, [baseUrl, authHeaders, buildStatsParamsFromUrl]);

  // refaz sempre que a URL mudar
  useEffect(() => {
    fetchStats();
  }, [fetchStats, location.search]);

  // ===== Meta dos cards
  const WORKFLOW_STATUS_META: Record<
    string,
    { Icon: React.ComponentType<any>; colorClass: string }
  > = {
    REVIEW_REQUESTED_VITRINE: { Icon: Hourglass, colorClass: "text-amber-500" },
    ADJUSTMENT_VITRINE: { Icon: Wrench, colorClass: "text-blue-500" },
    VITRINE: { Icon: Store, colorClass: "text-green-600" },
    AGUARDANDO_TRANSFERENCIA: { Icon: Clock, colorClass: "text-indigo-500" },
    TRANSFERIDOS: { Icon: Archive, colorClass: "text-zinc-500" },

    REVIEW_REQUESTED_DESFAZIMENTO: {
      Icon: Hourglass,
      colorClass: "text-amber-500",
    },
    ADJUSTMENT_DESFAZIMENTO: { Icon: Wrench, colorClass: "text-blue-500" },
    REVIEW_REQUESTED_COMISSION: {
      Icon: ListTodo,
      colorClass: "text-purple-500",
    },
    REJEITADOS_COMISSAO: { Icon: XCircle, colorClass: "text-red-500" },
    DESFAZIMENTO: { Icon: Trash, colorClass: "text-green-600" },
    DESCARTADOS: { Icon: Recycle, colorClass: "text-zinc-500" },
  };

  const getMeta = (statusKey: string) =>
    WORKFLOW_STATUS_META[statusKey] ?? {
      Icon: HelpCircle,
      colorClass: "text-zinc-500",
    };

  const { onOpen } = useModal();
  const [isOn, setIsOn] = useState(true);

  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>Administrativo | Sistema Patrimônio</title>
      </Helmet>

      <main className="flex flex-col ">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              onClick={() => {
                const path = location.pathname;
                const hasQuery = location.search.length > 0;
                if (hasQuery) navigate(path);
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
              className="h-7 w-7 shrink-0" // shrink-0 evita que o botão amasse
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>

            <h1 className="text-xl font-semibold tracking-tight truncate">
              Módulo Administrativo
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button
              onClick={() => navigate("/dashboard/criar-patrimonio-temporario")}
              size="sm"
              className="w-full sm:w-auto" // Botão largura total no mobile
            >
              <TimerReset size={16} className="mr-2" />
              Adicionar patrimônio temporário
            </Button>

            <Button
              onClick={() => onOpen("import-csv")}
              size="sm"
              className="w-full sm:w-auto"
            >
              <FileXls size={16} className="mr-2" />
              Importar patrimônios
            </Button>
          </div>
        </div>

        <div className="gap-8 p-8 pt-0">
          <Carousel className="w-full flex gap-4 px-4 items-center">
            <div className="absolute left-0 z-[9]">
              <CarouselPrevious />
            </div>
            <CarouselContent className="gap-4">
              {WORKFLOWS.map(({ key, name }) => {
                const { Icon } = getMeta(key);
                return (
                  <CarouselItem
                    key={key}
                    className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <Alert className="p-0">
                      <CardHeader className="flex gap-8 flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm truncate font-medium">
                          {name}
                        </CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsMap[key] || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          registrados
                        </p>
                      </CardContent>
                    </Alert>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="absolute right-0 z-[9]">
              <CarouselNext />
            </div>
          </Carousel>
        </div>

        <Tabs defaultValue="articles" value={value} className="relative ">
          <div className="sticky top-[68px] z-[2] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur ">
            <div
              className={`w-full ${
                isOn ? "px-8" : "px-4"
              } border-b border-b-neutral-200 dark:border-b-neutral-800`}
            >
              {isOn && (
                <div className="w-full flex justify-between items-center"></div>
              )}
              <div className={`flex pt-2 gap-8 justify-between`}>
                <div className="flex items-center gap-2">
                  <div className="relative grid grid-cols-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`absolute left-0 z-10 h-8 w-8 p-0 top-1 ${
                        !canScrollLeft ? "opacity-30 cursor-not-allowed" : ""
                      }`}
                      onClick={scrollLeftBtn}
                      disabled={!canScrollLeft}
                    >
                      <ChevronLeft size={16} />
                    </Button>

                    <div className="mx-10">
                      <div
                        ref={scrollAreaRef}
                        className="overflow-x-auto scrollbar-hide"
                        onScroll={checkScrollability}
                      >
                        <div className="p-0 flex gap-2 h-auto bg-transparent">
                          {tabs.map(
                            ({ id, label, icon: Icon, condition }) =>
                              !condition && (
                                <div
                                  key={id}
                                  className={`pb-2 border-b-2 text-black dark:text-white transition-all ${
                                    value === id
                                      ? "border-b-[#719CB8]"
                                      : "border-b-transparent"
                                  }`}
                                  onClick={() => {
                                    setValue(id);
                                    queryUrl.set("page", "1");
                                    queryUrl.set("tab", id);
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
                              )
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className={`absolute right-0 z-10 h-8 w-8 p-0 rounded-md top-1 ${
                        !canScrollRight ? "opacity-30 cursor-not-allowed" : ""
                      }`}
                      onClick={scrollRightBtn}
                      disabled={!canScrollRight}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <TabsContent value="inventario">
            <Inventario />
          </TabsContent>

          <TabsContent value="notification">
            <Notification />
          </TabsContent>

          <TabsContent value="feedback">
            <Feedback />
          </TabsContent>

          <TabsContent value="documentos">
            <Documentos urlGeral={urlGeral} token={token || ""} />
          </TabsContent>

          <TabsContent value="estatisticas">
            <Statistics
              statsMap={statsMap}
              baseUrl={baseUrl}
              authHeaders={authHeaders}
            />
          </TabsContent>

          {hasConfiguracoes && (
            <TabsContent value="configuration">
              <Configuration />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
