
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "next-themes";

import { UserContext } from "../../context/context";
import fump_bg from "../../assets/fump_bg.png";

import {
  Armchair,
  ArrowRight,
  Camera,
  ChalkboardSimple,
  ComputerTower,
  Desktop,
  DotsThree,
  Folder,
  Ladder,
  Laptop,
  MagnifyingGlass,
  Phone,
  Printer,
  ProjectorScreen,
  Scales,
  Television,
  Timer,
  Wrench as WrenchPhosphor,
} from "phosphor-react";

import {
  Archive,
  Clock,
  Fan,
  Heart,
  Hourglass,
  Info,
  ListTodo,
  Package,
  RefreshCcw,
  Recycle,
  Store,
  Trash,
  User,
  WalletCards,
  XCircle,
  // se seus ícones vierem de outro lugar, mantenha os seus imports originais
} from "lucide-react";

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { ItemPatrimonio } from "./components/item-patrimonio";
import { Search } from "../search/search";
import { BlockItemsVitrine } from "./components/block-items-vitrine";

import { useModal } from "../hooks/use-modal-store";
import { useQuery } from "../authentication/signIn";
import { StatusCount, WORKFLOWS } from "../dashboard/administrativo/admin";

type Material = {
  material_code: string;
  material_name: string;
  id: string;
};

type MaterialsResponse = {
  materials: Material[];
};

export function HomeInicial() {
  const [words, setWords] = useState<MaterialsResponse | null>(null);
  const { urlGeral } = useContext(UserContext);

  const urlPalavrasChaves = useMemo(() => {
    return `${urlGeral}catalog/search/materials?workflow_status=VITRINE`;
  }, [urlGeral]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlPalavrasChaves, {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: MaterialsResponse = await response.json();
        console.log("URL:", urlPalavrasChaves);
        console.log("DATA:", data);

        if (data && Array.isArray(data.materials)) {
          setWords(data);
        }
      } catch (err) {
        console.error("Erro ao buscar palavras-chave:", err);
      }
    };

    fetchData();
  }, [urlPalavrasChaves]);

  const setParamOrDelete = (sp: URLSearchParams, key: string, val?: string) => {
    if (val && val.trim().length > 0) sp.set(key, val);
    else sp.delete(key);
  };

  const location = useLocation();
  const navigate = useNavigate();
  const queryUrl = useQuery();

  function handlePesquisaChange(material: Material) {
    const params = new URLSearchParams(queryUrl.toString());
    setParamOrDelete(params, "material_ids", material.id);

    navigate({
      pathname: location.pathname,
      search: `?${params.toString()}`,
    });
  }

  const { onOpen } = useModal();
  const { theme } = useTheme();

  // ================== STATS POR WORKFLOW ==================
  const [statsMap, setStatsMap] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(false);

  const buildStatsParamsFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);

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

  const token = useMemo(() => localStorage.getItem("jwt_token"), []);

  const baseUrl = useMemo(
    () => (urlGeral || "").replace(/\/+$/, ""),
    [urlGeral]
  );

  const authHeaders: HeadersInit = useMemo(() => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

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

  useEffect(() => {
    fetchStats();
  }, [fetchStats, location.search]);

  // ================== GRUPOS DE WORKFLOW PARA TABS ==================
  const FLOW_VITRINE_KEYS = [
    "REVIEW_REQUESTED_VITRINE",
    "VITRINE",
    "AGUARDANDO_TRANSFERENCIA",
    "TRANSFERIDOS",
  ] as const;

  const FLOW_DESFAZIMENTO_KEYS = [
    "REVIEW_REQUESTED_DESFAZIMENTO",
    "REVIEW_REQUESTED_COMISSION",
    "REJEITADOS_COMISSAO",
    "DESFAZIMENTO",
  ] as const;

  const workflowMeta = useMemo(() => {
    const m: Record<string, (typeof WORKFLOWS)[number]> = {};
    for (const w of WORKFLOWS) m[w.key] = w;
    return m;
  }, []);

  const getCount = (key: string) => statsMap?.[key] ?? 0;


  const [tab, setTab] = useState('vitrine');
  return (
    <div className="    ">
      <Helmet>
        <title>{`Página Inicial | Sistema Patrimônio`}</title>
        <meta name="description" content={`Página Inicial | Sistema Patrimônio`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="absolute top-0 left-0 flex min-h-screen w-full z-[0] " />

      <div className="bg-cover bg-no-repeat bg-center w-full">
        <div className="justify-center px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
          <Link
            to={"/informacoes"}
            className="inline-flex z-[2] items-center rounded-lg bg-neutral-100 dark:bg-neutral-700 gap-2 mb-3 px-3 py-1 text-sm font-medium"
          >
            <Info size={12} />
            <div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>
            Saiba o que é e como utilizar a plataforma
            <ArrowRight size={12} />
          </Link>

          <h1 className="z-[2] text-center max-w-[900px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
            Encontre, disponibilize e contribua para a reutilização de{" "}
            <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
              bens patrimoniais
            </strong>
          </h1>

          <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>

          <div className="lg:max-w-[60vw] lg:w-[60vw] w-full">
            <Search />
          </div>

          <div className="hidden md:flex flex-wrap gap-3 z-[2] w-full lg:w-[60vw]">
            {(words?.materials ?? []).slice(0, 5).map((material, index) => (
              <div
                key={material.id ?? index}
                className="flex gap-2 capitalize h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                onClick={() => handlePesquisaChange(material)}
              >
                {material.material_name}
              </div>
            ))}
          </div>

          <div className="flex md:hiddeen justify-center md:hidden flex-wrap gap-3 z-[3] w-full lg:hidden">
            {(words?.materials ?? []).slice(0, 10).map((material, index) => (
              <div
                key={material.id ?? index}
                className="flex gap-2 capitalize h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                onClick={() => handlePesquisaChange(material)}
              >
                {material.material_name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full md:px-8 gap-8 flex flex-col px-4 mb-4 md:mb-8">
        <div>
          <Alert className="rounded-b-none items-center flex gap-4 justify-between border-b-0 dark:bg-neutral-700 bg-neutral-100">
           <div>
            <div className=" gap-3 flex">
             <Info className="h-4 w-4" />
           <div>
             <AlertTitle>Interpretação dos dados</AlertTitle>
            <AlertDescription className="text-xs hidden  md:block">
              Os dados exibidos na plataforma consideram apenas os{" "}
              <strong>cadastrados</strong>. As contagens abaixo refletem o
              estado atual conforme os fluxos.
            </AlertDescription>
           </div>

           </div>
           </div>
            <div className="flex">
                        <Button
                          size="sm"
                          onClick={() => setTab("vitrine")}
                          variant={tab === "vitrine" ? "default" : "outline"}
                          className="rounded-r-none"
                        >
                          <Store size={16} className="" />
                          Vitrine
                        </Button>
                        <Button
                          onClick={() => setTab("desfazimento")}
                          size="sm"
                          variant={tab !== "vitrine" ? "default" : "outline"}
                          className="rounded-l-none"
                        >
                          <Trash size={16} className="" />
                          Desfazimento
                        </Button>
                      </div>
          </Alert>

          {/* ====== NOVO BLOCO COM TABS DE WORKFLOW ====== */}

            <Tabs defaultValue={tab} value={tab} className="w-full">
                  

              {/* ===== TAB VITRINE ===== */}
              <TabsContent value="vitrine" className="m-0">
                  <Alert className="flex rounded-t-none flex-col md:grid gap-3 lg:grid-cols-4 grid-cols-2">
              
                  {FLOW_VITRINE_KEYS.map((key) => {
                    const meta = workflowMeta[key];
                    const Icon = meta?.Icon;
                    const count = getCount(key);

                    return (
                     <div
    key={key}
    className=""
  >
    <CardHeader className="flex flex-row items-center pb-2 justify-between space-y-0">
      <div className="min-w-0">
        <CardTitle className="text-[0.9rem] md:text-sm font-medium truncate">
          {meta?.name ?? key}
        </CardTitle>
      </div>

      {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
    </CardHeader>

    <CardContent>
      <span className="font-bold leading-none text-3xl">
        {loadingStats ? "…" : count}
      </span>
    </CardContent>
  </div>
                    );
                  })}
               
                </Alert>
              </TabsContent>

              {/* ===== TAB DESFAZIMENTO ===== */}
              <TabsContent value="desfazimento" className="m-0">
               <Alert className="flex rounded-t-none flex-col md:grid gap-3 lg:grid-cols-4 grid-cols-2">
                  {FLOW_DESFAZIMENTO_KEYS.map((key) => {
                    const meta = workflowMeta[key];
                    const Icon = meta?.Icon;
                    const count = getCount(key);

                   return (
  <div
    key={key}
    className=""
  >
    <CardHeader className="flex flex-row items-center pb-2 justify-between space-y-0">
      <div className="min-w-0">
        <CardTitle className="text-[0.9rem] md:text-sm font-medium truncate">
          {meta?.name ?? key}
        </CardTitle>
      </div>

      {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
    </CardHeader>

    <CardContent>
      <span className="font-bold leading-none text-3xl">
        {loadingStats ? "…" : count}
      </span>
    </CardContent>
  </div>
);

                  })}
                </Alert>
              </TabsContent>
       
            </Tabs>
         
        </div>

        <BlockItemsVitrine workflow="VITRINE" />
      </div>
    </div>
  );
}
