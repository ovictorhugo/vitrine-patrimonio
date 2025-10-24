import { ChevronLeft } from "lucide-react";
import { Button } from "../../ui/button";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";
import { Anunciados } from "../dashboard-page/components/anunciados";
export function ComissaoApoioLocal() {
      const navigate = useNavigate();
      const location = useLocation();
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

            <h1 className="text-xl font-semibold tracking-tight">Comissão de Apoio Local</h1>
          </div>

          <div className="flex gap-3">
          
          </div>
        </div>

        <Anunciados
               filter={{ type: "role_id", value: '' }}
               />

</main>
</div>
    )
}