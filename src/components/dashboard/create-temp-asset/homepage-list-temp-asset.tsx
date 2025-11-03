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
        <title>Busca avançada | Sistema Patrimônio</title>
       
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

           <div className="justify-center px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
  <h3 className="z-[2] text-center max-w-[900px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
    Encontre bens patrimoniados de forma rápida e inteligente
  </h3>

  <div className="mt-2 text-center flex flex-wrap justify-center gap-3 text-sm text-gray-500 items-center">
    <span className="text-muted-foreground max-w-[900px] text-center">
      Utilize os filtros de busca para localizar bens cadastrados na plataforma, 
      incluindo aqueles com plaquetas extraviadas ou registros provisórios. 
      Simplifique o acompanhamento e mantenha o controle patrimonial atualizado.
    </span>
  </div>
</div>




<Patrimonios
type="temp"

/>
       </main>
    </div>
  );
}
