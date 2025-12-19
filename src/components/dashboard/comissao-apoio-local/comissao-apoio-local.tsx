import { ChevronLeft, Home, Undo2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Anunciados } from "../dashboard-page/components/anunciados";
import { useContext } from "react";
import { UserContext } from "../../../context/context";
import { useIsMobile } from "../../../hooks/use-mobile";
export function ComissaoApoioLocal() {
  const navigate = useNavigate();
  const location = useLocation();

  const history = useNavigate();
  const isMobile = useIsMobile();

  const handleVoltar = () => {
    history(-1);
  };

  const { user } = useContext(UserContext);

  // Filtra apenas os que tiverem "Comissão" no nome (case-insensitive)
  const normalize = (text: string) =>
    text
      .normalize("NFD") // separa acentos
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/[^a-zA-Z0-9\s]/g, "") // remove caracteres especiais
      .toUpperCase(); // tudo maiúsculo

  const comissaoRoles = (user?.roles ?? []).filter(({ name }) => {
    const n = normalize(name).toUpperCase(); // ex.: "Comissão Apoio Local" -> "COMISSAO APOIO LOCAL"
    const tokens = n.split(/[^A-Z0-9]+/).filter(Boolean); // ["COMISSAO","APOIO","LOCAL"]
    return tokens.includes("CAL");
  });

  if (comissaoRoles?.length == 0) {
    if (isMobile) {
      return (
        <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
          <div className="w-[90%] flex flex-col items-center justify-center">
            <p className="text-6xl text-[#719CB8] font-bold mb-16 animate-pulse">
              U_U
            </p>
            <h1 className="text-center text-xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
              Você não está credenciado em nenhuma
              <br /> CAL - Comissão de Apoio Local
            </h1>

            <div className="flex gap-3 mt-8">
              <Button onClick={handleVoltar} variant={"ghost"}>
                <Undo2 size={16} /> Voltar
              </Button>
              <Link to={"/"}>
                {" "}
                <Button>
                  <Home size={16} /> Página Inicial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    } else
      return (
        <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
          <div className="w-full flex flex-col items-center justify-center">
            <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
              U_U
            </p>
            <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
              Você não está credenciado em nenhuma
              <br /> CAL - Comissão de Apoio Local
            </h1>

            <div className="flex gap-3 mt-8">
              <Button onClick={handleVoltar} variant={"ghost"}>
                <Undo2 size={16} /> Voltar
              </Button>
              <Link to={"/"}>
                {" "}
                <Button>
                  <Home size={16} /> Página Inicial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>Comissão de Apoio Local | Sistema Patrimônio</title>
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
              Comissão de Apoio Local
            </h1>
          </div>

          <div className="flex gap-3"></div>
        </div>

        <Anunciados filter={{ type: "role_id", value: "" }} />
      </main>
    </div>
  );
}
