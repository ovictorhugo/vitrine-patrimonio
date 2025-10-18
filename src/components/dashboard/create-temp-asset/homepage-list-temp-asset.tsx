import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Package,
  SlidersHorizontal,
  TimerReset,
  Trash,
  X as XIcon,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UserContext } from "../../../context/context";
import { Alert } from "../../ui/alert";
import { SquaresFour, Rows } from "phosphor-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { HeaderResultTypeHome } from "../../header-result-type-home";
import { useQuery } from "../../authentication/signIn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Skeleton } from "../../ui/skeleton";
import { PatrimonioItem } from "../../busca-patrimonio/patrimonio-item";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Search } from "../../search/search";
import { Badge } from "../../ui/badge";
import { useModal } from "../../hooks/use-modal-store";
import { FiltersSheetAssets } from "./filters-sheet-assets";
import { Switch } from "../../ui/switch";
import { Patrimonios } from "../dashboard-page/tabs/patrimonios";


export function HomepageListTempAsset() {
  const { urlGeral } = useContext(UserContext);
 const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>Patrimônio temporário | Sistema Patrimônio</title>
        <meta name="description" content="Patrimônio temporário | Sistema Patrimônio" />
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

            <h1 className="text-xl font-semibold tracking-tight">Busca avançada</h1>
          </div>

          <div className="flex gap-2">
            <Link to={"/dashboard/criar-patrimonio-temporario"}>
              <Button size={"sm"}>
                <TimerReset size={16} />
                Adicionar patrimônio temporário
              </Button>
            </Link>
          </div>
        </div>

           <div className="p-8 py-0">
          <Alert className="w-full h-72 bg-eng-blue p-0 md:flex-row gap-8 flex-col flex">
            <div className="md:w-1/2 w-full gap-1 flex flex-col h-full justify-center p-8">
              <p className="font-semibold text-2xl text-white">Entenda melhor</p>
              <p className="text-white">
                Bens cadastrados na plataforma que perderam sua plaqueta original ou foram registrados apenas de forma provisória.
              </p>
            </div>
            <div className="md:w-1/2 w-full gap-2 flex flex-col h-full justify-center" />
          </Alert>
        </div>


<Patrimonios
type="temp"

/>
       </main>
    </div>
  );
}
