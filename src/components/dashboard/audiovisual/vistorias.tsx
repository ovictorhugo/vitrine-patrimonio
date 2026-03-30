import { useContext } from "react";
import { UserContext } from "../../../context/context"; // Ajuste o caminho se necessário
import { Calendar, ChevronLeft, Clock, Cog, CornerDownLeft, Loader2 } from "lucide-react";
import { useIsMobile } from "../../../hooks/use-mobile";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { LoanableItemDTO } from "./audiovisual";
import { Alert } from "../../ui/alert";
import { CardContent } from "../../ui/card";
import { Carousel, CarouselContent, CarouselItem } from "../../ui/carousel";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useModal } from "../../hooks/use-modal-store"; // Ajuste para o seu hook de modal
import { cn } from "../../../lib";

interface Props {
  board: Record<string, LoanableItemDTO[]>;
  setTab: () => void;
  reload?: () => void;
  loading?: boolean;
}

export default function VistoriaTab({
  board,
  setTab,
  reload = () => {},
  loading = false,
}: Props) {
  const isMobile = useIsMobile();
  const { urlGeral } = useContext(UserContext);
  const { onOpen } = useModal();

  // Tamanhos responsivos para a imagem
  const sizes =
    "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw";

  // 1. Achata (junta) todas as listas do board em um único array de itens
  const allItems = Object.values(board).flat();

  // 2. Processa as datas e filtra os itens
  const itemsFiltrados = allItems
    .map((item) => {
      if (!item.last_check) return null;

      const dataVistoria = new Date(item.last_check);
      const hoje = new Date();

      dataVistoria.setHours(0, 0, 0, 0);
      hoje.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(hoje.getTime() - dataVistoria.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (hoje < dataVistoria) return null;

      // Classifica baseado na quantidade de dias
      if (diffDays > 100) {
        return { ...item, computedColumn: "Atrasado" };
      } else if (diffDays >= 85 && diffDays <= 100) {
        return { ...item, computedColumn: "Manutenção" };
      }

      return null;
    })
    .filter((item) => item !== null) as (LoanableItemDTO & {
    computedColumn: string;
  })[];

  return (
    <div className="m-0">
      {/* Cabeçalho */}
      <div
        className={
          isMobile
            ? "flex flex-col items-center justify-between mb-4 mt-6"
            : "flex items-center justify-between mb-4"
        }
      >
        <div className="flex items-center gap-3 mr-2 mb-6">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Cog size={28} className={"text-eng-blue"} />
            <h2
              className={
                isMobile
                  ? "text-base text-center font-semibold"
                  : "text-2xl font-semibold"
              }
            >
              Vistorias pendentes
            </h2>
          </div>
          <Badge
            variant="outline"
            className={
              isMobile ? "hidden" : "w-8 flex justify-center items-center"
            }
          >
            {itemsFiltrados.length}
          </Badge>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && itemsFiltrados.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-md" />
          ))}
        </div>
      ) : null}

      {/* Empty State */}
      {!loading && itemsFiltrados.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground mt-4">
          Nenhum item com vistoria pendente ou próxima do vencimento!
        </div>
      ) : (
        /* Lista de Itens Customizada */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 align-center overflow-x-auto">
          {itemsFiltrados.map((item) => {
            // --- VARIÁVEIS DO CARD ---
            const isManutencao = item.computedColumn === "Manutenção";

            // Define as cores baseadas no status
            const statusColor = isManutencao ? "bg-amber-400" : "bg-red-500";
            const textColor = isManutencao
              ? "text-amber-600 dark:text-amber-500"
              : "text-red-600 dark:text-red-500";
            const buttonColor = isManutencao
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white";

            const materialNome =
              item.catalog?.asset?.material?.material_name ??
              item.catalog?.asset?.asset_description ??
              "Item";

            // Lógica de Datas e Cálculo de Dias
            let dataFormatada = "N/A";
            let diasPassados = 0;
            if (item.last_check) {
              const dataVistoria = new Date(item.last_check);
              dataVistoria.setHours(0, 0, 0, 0); // Zera as horas para precisão dos dias
              const hoje = new Date();
              hoje.setHours(0, 0, 0, 0);

              const diffTime = Math.abs(
                hoje.getTime() - dataVistoria.getTime(),
              );
              diasPassados = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              dataFormatada = dataVistoria.toLocaleDateString("pt-BR");
            }

            // Lógica de Imagem
            const firstImg = item.catalog?.images?.[0];
            let firstImgSrc = "";
            let firstImgSrcSet = "";
            let firstImgPlaceholder = "";

            if (firstImg) {
              const clean = firstImg.file_path.startsWith("/")
                ? firstImg.file_path.slice(1)
                : firstImg.file_path;
              const baseForSet = `${urlGeral}${clean}`;
              firstImgSrc = baseForSet;
              firstImgSrcSet = [320, 480, 640]
                .map(
                  (w) =>
                    `${baseForSet}${baseForSet.includes("?") ? "&" : "?"}w=${w}&q=75 ${w}w`,
                )
                .join(", ");
              firstImgPlaceholder = `${baseForSet}${baseForSet.includes("?") ? "&" : "?"}w=24&q=10`;
            }

            return (
              <div
                key={item.id}
                // IMPORTANTE: Adicionado a classe "group" para a transição de cor nos filhos funcionar
                className="group flex cursor-pointer rounded-md bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all"
                onClick={() => onOpen("audiovisual-modal", { ...item })}
              >
                {/* Barra Lateral Colorida */}
                <div
                  className={cn(
                    "w-2 min-w-[8px] shrink-0 rounded-l-md",
                    statusColor,
                  )}
                />

                <div className="flex flex-1 p-4 border-neutral-200 dark:border-neutral-800 transition-colors group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 rounded-r-md">
                  <div className="flex flex-col flex-1">
                    <div className="flex gap-4 mb-2">
                      <div className="w-[60%] flex flex-col">
                        {/* Título */}
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <p
                            className="font-bold text-sm line-clamp-2"
                            title={materialNome}
                          >
                            {materialNome}
                          </p>
                        </div>

                        {/* Informações da Vistoria */}
                        <div className="flex flex-col gap-1.5 mt-auto mb-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="size-3.5 shrink-0" />
                            <span>
                              Última vistoria:{" "}
                              <strong className="text-gray-700 dark:text-gray-300 font-medium">
                                {dataFormatada}
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="size-3.5 shrink-0" />
                            <span>
                              Dias passados:{" "}
                              <strong className={cn("font-bold", textColor)}>
                                {diasPassados} dias
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Carrossel de Imagem */}
                      <div className="w-[40%] ">
                        <Carousel className="w-full flex items-center ">
                          <CarouselContent>
                            {firstImg ? (
                              <CarouselItem>
                                <Alert className="rounded border-b-0 border-x-0 border-t-0 p-0">
                                  <CardContent className="aspect-square justify-end p-0">
                                    <LazyLoadImage
                                      src={firstImgSrc}
                                      srcSet={firstImgSrcSet}
                                      sizes={sizes}
                                      alt={materialNome}
                                      effect="blur"
                                      placeholderSrc={firstImgPlaceholder}
                                      width="100%"
                                      height="100%"
                                      wrapperClassName="w-full h-full"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                      className="rounded-t-md"
                                    />
                                  </CardContent>
                                </Alert>
                              </CarouselItem>
                            ) : (
                              <CarouselItem>
                                <Alert className="bg-center rounded-b-none border-0 bg-muted">
                                  <CardContent className="flex aspect-square justify-end p-0" />
                                </Alert>
                              </CarouselItem>
                            )}
                          </CarouselContent>
                        </Carousel>
                      </div>
                    </div>

                    {/* Botão de Abrir Item */}
                    <div className="flex gap-2 mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <Button
                        size="sm"
                        // Aqui a cor muda dinamicamente baseada na variável buttonColor
                        className={cn("w-full transition-colors", buttonColor)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen("audiovisual-modal", { ...item }); // Mantém a ação de abrir modal
                        }}
                      >
                        Ver item
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
