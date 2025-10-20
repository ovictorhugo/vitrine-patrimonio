import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion";
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { UserContext } from "../../../../context/context";
import { Skeleton } from "../../../ui/skeleton";
import { Alert } from "../../../ui/alert";

import { toast } from "sonner";
import axios from "axios";
import { CatalogEntriesResponse, ItemPatrimonio } from "../../../homepage/components/item-patrimonio";
import { Button } from "../../../ui/button";
import { CatalogEntry } from "../tabs/anunciados";


export function Favoritos() {
  const { urlGeral } = useContext(UserContext);
  const token = (typeof window !== "undefined" && localStorage.getItem("jwt_token")) || "";

  const [favorites, setFavorites] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Normaliza payloads possíveis do endpoint
  const normalizeFavorites = (data: any): CatalogEntry[] => {
    if (Array.isArray(data)) {
      if (data.length && typeof data[0] === "object" && data[0]?.item) {
        return data.map((x: any) => x.item as CatalogEntry);
      }
      return data as CatalogEntry[];
    }

    if (data && typeof data === "object" && Array.isArray(data.favorites)) {
      const favs = data.favorites;
      if (favs.length && typeof favs[0] === "object" && favs[0]?.item) {
        return favs.map((x: any) => x.item as CatalogEntry);
      }
      return favs as CatalogEntry[];
    }

    return [];
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${urlGeral}favorites/`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!cancelled && res.status === 200) {
          setFavorites(normalizeFavorites(res.data));
        }
      } catch (err: any) {
        if (!axios.isCancel(err)) {
          console.error("Erro ao buscar favoritos:", err);
          toast.error("Erro ao carregar favoritos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!urlGeral) {
      setLoading(false);
      return;
    }

    fetchCatalog();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [urlGeral, token]);

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

  useLayoutEffect(() => {
    // mede antes do primeiro paint para ativar os botões corretamente
    measureScrollability();
  }, [measureScrollability]);

  useEffect(() => {
    // re-mede quando dados ou estado de loading mudam
    rafMeasure();
  }, [favorites.length, loading, rafMeasure]);

  useEffect(() => {
    const onResize = () => rafMeasure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [rafMeasure]);

  useEffect(() => {
    // observa mudanças de tamanho do container/filhos (imagens, fontes, etc.)
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

  const disableNav = loading || favorites.length === 0;

  return (
    <Accordion type="single" collapsible defaultValue="item-1">
      <AccordionItem value="item-1">
        {/* Header clicável como trigger */}
        <AccordionTrigger className="px-0">
          <HeaderResultTypeHome
            title="Favoritos"
            icon={<Star size={24} className="text-gray-400" />}
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
                scrollLeft()
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
                <div className="flex gap-6 whitespace-nowrap py-2">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="w-64 aspect-square rounded-lg" />
                    ))
                  ) : favorites.length === 0 ? (
                    <div className="w-full pr-4">
                      <Alert variant="default">Você ainda não tem favoritos.</Alert>
                    </div>
                  ) : (
                    favorites.map((item) => (
                      <div className="w-64" key={item.id}>
                        <ItemPatrimonio {...item} />
                      </div>
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
                  scrollRight()
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
