import { Archive, Bell, Bug, ChevronLeft, ChevronRight, Hourglass, ListChecks, Recycle, Settings, Store } from "lucide-react";
import { Button } from "../../ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Alert } from "../../ui/alert";
import { useContext, useEffect, useRef, useState, useMemo } from "react";
import { UserContext } from "../../../context/context";
import { Tabs, TabsContent } from "../../ui/tabs";
import { useQuery } from "../../authentication/signIn";
import { Inventario } from "./tabs/inventario";
import { FileXls } from "phosphor-react";
import { useModal } from "../../hooks/use-modal-store";
import { Notification } from "./tabs/notification";
import { Feedback } from "./tabs/feedback";
import { Configuration } from "./tabs/configuration";

export type StatusCount = { status: string; count: number };

export function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, urlGeral } = useContext(UserContext);

  const tabs = [
    { id: "inventario", label: "Inventário", icon: ListChecks },
        { id: "notification", label: "Notificações", icon: Bell },
         { id: "feedback", label: "Feedback", icon:Bug },
          { id: 'configuration', label: "Configurações", icon: Settings },
  ];

  const [isOn, setIsOn] = useState(true);
  const queryUrl = useQuery();
  const tab = queryUrl.get("tab");
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

  // ===== Estatísticas: GET /statistics/catalog/count-by-workflow-status
  const token = useMemo(() => localStorage.getItem("jwt_token"), []);
  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

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
      // Em caso de erro, mantemos zeros (UX silenciosa aqui)
      setStatsMap({});
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlGeral]);

  // Derivações dos cards
  const countReview =
    (statsMap["REVIEW_REQUESTED_VITRINE"] || 0) + (statsMap["REVIEW_REQUESTED_DESFAZIMENTO"] || 0);
  const countVitrine = statsMap["VITRINE"] || 0;
  const countTransferidos = statsMap["TRANSFERIDOS"] || 0;
  const countDesfazimento = statsMap["DESFAZIMENTO"] || 0;

  const fmt = (n: number) => (loadingStats ? "…" : String(n));

  const {onOpen} = useModal()
  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>Administrativo | Sistema Patrimônio</title>
       
      </Helmet>

      <main className="flex flex-col ">
        <div className="flex p-8 items-center justify-between">
          <div className="flex gap-2">
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
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>

            <h1 className="text-xl font-semibold tracking-tight">Módulo Administrativo</h1>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => onOpen('import-csv')} size={'sm'}>
              <FileXls size={16} /> Importar patrimônios
            </Button>
          </div>
        </div>

        <div className="gap-8 p-8 pt-0">
          <div className={`grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4`}>
            <Alert className="p-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Esperando revisão</CardTitle>
                <Hourglass className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(countReview)}</div>
                <p className="text-xs text-muted-foreground">registrados</p>
              </CardContent>
            </Alert>

            <Alert className="p-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anunciados</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(countVitrine)}</div>
                <p className="text-xs text-muted-foreground">registrados</p>
              </CardContent>
            </Alert>

            <Alert className="p-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transferidos</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(countTransferidos)}</div>
                <p className="text-xs text-muted-foreground">registrados</p>
              </CardContent>
            </Alert>

            <Alert className="p-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Desfeitos</CardTitle>
                <Recycle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(countDesfazimento)}</div>
                <p className="text-xs text-muted-foreground">registrados</p>
              </CardContent>
            </Alert>
          </div>
        </div>

        <Tabs defaultValue="articles" value={value} className="relative ">
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
                      onClick={scrollLeftBtn}
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
                      onClick={scrollRightBtn}
                      disabled={!canScrollRight}
                    >
                      <ChevronRight size={16} />
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
            <Inventario />
          </TabsContent>

            <TabsContent value="notification">
            <Notification />
          </TabsContent>

              <TabsContent value='feedback'>
            <Feedback />
          </TabsContent>

           <TabsContent value='configuration'>
            <Configuration />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
