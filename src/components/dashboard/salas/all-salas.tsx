import { ChevronLeft, ChevronRight, DoorClosed } from "lucide-react";
import { Button } from "../../ui/button";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";
import { Alert } from "../../ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { HeaderResultTypeHome } from "../../header-result-type-home";
import { LocationMy } from "../inventario/inventario-page";

export function AllSalas() {
          const navigate = useNavigate();
          const location = useLocation();
    
          
      const history = useNavigate();
          
         const handleVoltar = () => {
       history(-1)
      };
    
      const {user} = useContext(UserContext)


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

    return (
                 <div className="flex flex-col h-full">
      <Helmet>
        <title>Salas | Sistema Patrimônio</title>
       
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

            <h1 className="text-xl font-semibold tracking-tight">Salas</h1>
          </div>

          <div className="flex gap-3">
          
          </div>
        </div>

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
                <p className="text-sm text-center">Nenhuma sala encontrada.</p>
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
                             <div className="flex items-center gap-2">
  <div className="flex items-center gap-1 min-w-0">
    <p className="truncate text-sm text-gray-500 dark:text-gray-300 ">
      {room.sector.agency.agency_name}
    </p>
    <ChevronRight size={14} className="flex-shrink-0" />
    <p className="truncate text-sm text-gray-500 dark:text-gray-300">
      {room.sector.sector_name}
    </p>
  </div>
</div>

                         </div>
                          <p className="text-xl  font-semibold whitespace-normal">
                            {room.location_name}
                          </p>
                        </Alert>
                  </button>
                ))
              )}
            </div>
          </AccordionContent>
          </AccordionItem>
          </Accordion>

</main>
</div>
    );
}