import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../../context/context";

export function HomepageListTempAsset() {
      const { urlGeral } = useContext(UserContext);
      const navigate = useNavigate();
      const location = useLocation();

    return (
        <div className="p-4 md:p-8 gap-8 flex flex-col h-full ">
             <Helmet>
               <title>Patrimônio temporário | Vitrine Patrimônio</title>
               <meta name="description" content="Patrimônio temporário | Vitrine Patrimônio" />
             </Helmet>

              <main className="flex flex-col gap-8">
<div className="flex items-center justify-between">
    <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const path = location.pathname;
                    const hasQuery = location.search.length > 0;
                    if (hasQuery) navigate(path);
                    else {
                      const seg = path.split("/").filter(Boolean);
                      if (seg.length > 1) { seg.pop(); navigate("/" + seg.join("/")); }
                      else navigate("/");
                    }
                  }}
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Voltar</span>
                </Button>
    
                <h1 className="text-xl font-semibold tracking-tight">Patrimônio temporário</h1>
              </div>

              <div>
              <Link to={'/dashboard/criar-patrimonio-temporario'}>  <Button size={'sm'}><Plus size={16}/>Adicionar</Button></Link>
              </div>
</div>
              </main>
             </div>
    )
}