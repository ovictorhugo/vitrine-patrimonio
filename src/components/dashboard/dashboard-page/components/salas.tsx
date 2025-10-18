import { ChevronLeft, ChevronRight, DoorClosed } from "lucide-react";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion";
// Removidos ScrollArea/ScrollBar porque não estão sendo usados
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { UserContext } from "../../../../context/context";
import { Skeleton } from "../../../ui/skeleton";
import { Alert } from "../../../ui/alert";
import { Link } from "react-router-dom";
import { Button } from "../../../ui/button";

type Unit = { unit_name: string; unit_code: string; unit_siaf: string; id: string };
type Agency = { agency_name: string; agency_code: string; unit_id: string; id: string; unit: Unit };
type Sector = { agency_id: string; sector_name: string; sector_code: string; id: string; agency: Agency };
type LegalGuardian = { legal_guardians_code: string; legal_guardians_name: string; id: string };

type LocationDTO = {
  legal_guardian_id: string;
  sector_id: string;
  location_name: string;
  location_code: string;
  id: string;
  sector: Sector;
  legal_guardian: LegalGuardian;
};

type LocationsResponse = { locations: LocationDTO[] };

export function Salas() {
  const { urlGeral } = useContext(UserContext);

  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [errorLoc, setErrorLoc] = useState<string | null>(null);

  
  // ====== Fetch com abort e estados ======
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        setLoadingLoc(true);
        setErrorLoc(null);
        const token = localStorage.getItem("jwt_token");
        const res = await fetch(`${urlGeral}/locations/my`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Falha ao carregar locais (${res.status})`);
        const data: LocationsResponse = await res.json();
        if (cancelled) return;
        setLocations(data.locations ?? []);
      } catch (e: any) {
        if (cancelled) return;
        // Ignora abort
        if (e?.name === "AbortError") return;
        setErrorLoc(e?.message ?? "Erro ao carregar locais");
      } finally {
        if (!cancelled) setLoadingLoc(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [urlGeral]);

  // ===== Scroll / Navegação =====
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const measureScrollability = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxLeft = Math.max(0, scrollWidth - clientWidth);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(maxLeft - scrollLeft > 1);
  }, []);

  const rafMeasure = useCallback(() => {
    requestAnimationFrame(measureScrollability);
  }, [measureScrollability]);

  // mede antes do primeiro paint para ativar corretamente o botão da direita se houver overflow
  useLayoutEffect(() => {
    measureScrollability();
  }, [measureScrollability]);

  // re-mede quando dados/estado mudam
  useEffect(() => {
    rafMeasure();
  }, [locations.length, loadingLoc, rafMeasure]);

  // re-mede em resize de janela
  useEffect(() => {
    const onResize = () => rafMeasure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [rafMeasure]);

  // observa mudanças no container/filhos (imagens, fontes, etc.)
  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => rafMeasure());
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild as Element);
    return () => ro.disconnect();
  }, [rafMeasure]);

  const scrollByAmount = (dir: "left" | "right") => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.8) * (dir === "left" ? -1 : 1);
    el.scrollBy({ left: delta, behavior: "smooth" });
    // garante atualização mesmo se o evento 'scroll' atrasar
    setTimeout(measureScrollability, 200);
  };

  const scrollLeft = () => scrollByAmount("left");
  const scrollRight = () => scrollByAmount("right");

  const disableNav = loadingLoc || locations.length === 0;

  return (
    <Accordion type="single" collapsible defaultValue="item-1">
      <AccordionItem value="item-1">
        {/* Header clicável vira o trigger do accordion */}
        <AccordionTrigger className="px-0">
          <HeaderResultTypeHome
            title="Minhas salas"
            icon={<DoorClosed size={24} className="text-gray-400" />}
          />
        </AccordionTrigger>

        <AccordionContent className="p-0">
          <div className="relative grid grid-cols-1">
            {/* Botão Esquerda */}
            <Button
              aria-label="Rolar para a esquerda"
              variant="outline"
              size="sm"
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 ${
                !canScrollLeft || disableNav ? "opacity-30 cursor-not-allowed" : ""
              }`}
              onClick={(event) => {
  event.stopPropagation();
                scrollLeft();
              }}
              disabled={!canScrollLeft || disableNav}
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="mx-4">
              <div
                ref={scrollAreaRef}
                className="overflow-x-auto scrollbar-hide"
                onScroll={measureScrollability}
              >
                <div className="flex whitespace-nowrap gap-6 py-2">
                  {loadingLoc ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="w-64 aspect-square rounded-lg" />
                    ))
                  ) : errorLoc ? (
                    <div className="w-full pr-4">
                      <Alert variant="destructive">{errorLoc}</Alert>
                    </div>
                  ) : locations.length === 0 ? (
                    <div className="w-full pr-4">
                      <Alert variant="default">Você ainda não tem salas.</Alert>
                    </div>
                  ) : (
                    locations.map((location) => (
                      <Link key={location.id} to={`/dashboard/sala?loc_id=${location.id}`} className="w-64">
                        <Alert className="w-64 flex justify-between flex-col aspect-square cursor-pointer">
                         <div>
                               <div className="flex items-center gap-2 flex-wrap">
                                  
                                      <div
                                      
                                        className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1 flex-wrap"
                                      >
                                  {location.sector.agency.agency_name}  <ChevronRight size={14} /> {location.sector.sector_name}
                                      </div>
                                   
                                  </div>
                         </div>
                          <p className="text-xl  font-semibold whitespace-normal">
                            {location.location_name}
                          </p>
                        </Alert>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Botão Direita */}
            <Button
              aria-label="Rolar para a direita"
              variant="outline"
              size="sm"
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 ${
                !canScrollRight || disableNav ? "opacity-30 cursor-not-allowed" : ""
              }`}
              onClick={(event) => {
                  event.stopPropagation();
                scrollRight();
              }}
              disabled={!canScrollRight || disableNav}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
