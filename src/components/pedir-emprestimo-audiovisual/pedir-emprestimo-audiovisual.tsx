import { ArrowRight, ChevronLeft, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BlockItemsVitrine } from "../homepage/components/block-items-vitrine";
import { Search } from "../search/search";

export function PedirEmprestimoAudiovisual() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>Solicitar Empréstimo | Sistema Patrimônio</title>
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

            <h1 className="text-xl font-semibold tracking-tight">
              Solicitar Empréstimo
            </h1>
          </div>

          <div className="flex gap-3"></div>
        </div>

        <div className="bg-cover   bg-no-repeat bg-center w-full">
          <div className="justify-center  px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
            <Link
              to={"/informacoes"}
              className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"
            >
              <Info size={12} />
              <div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>
              Saiba o que é e como utilizar a plataforma
              <ArrowRight size={12} />
            </Link>
            <h1 className="z-[2] text-center max-w-[930px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
              Todos os itens preservados pelo seu{" "}
              <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
                valor histórico
              </strong>
              , simbólico ou antiguidade.
            </h1>
            <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>

            <div className="lg:max-w-[60vw] lg:w-[60vw] w-full">
              <Search />
            </div>
          </div>
        </div>

        <div className=" w-full md:px-8 gap-8 flex flex-col px-4 mb-4 md:mb-8">
          <BlockItemsVitrine workflow="AUDIOVISUAL_EMPRESTIMO" />
        </div>
      </main>
    </div>
  );
}
