import { ArrowRight, ChevronLeft, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BlockItems } from "../CardComponents/block-items";
import { Search } from "../search/search";
import { MaterialDTO } from "../dashboard/departament/departament-page";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { toast } from "sonner";
import { useQuery } from "../authentication/signIn";
import { Input } from "../ui/input";

export function PedirEmprestimoAudiovisual() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryUrl = useQuery();
  const { urlGeral } = useContext(UserContext);

  const [materials, setMaterials] = useState<MaterialDTO[]>([]);
  const [materialsFiltered, setMaterialsFiltered] = useState<MaterialDTO[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const mRes = await fetch(`${urlGeral}materials?limit=1000`);
        const mJson = await mRes.json();
        setMaterials(mJson?.materials ?? []);
        setMaterialsFiltered(mJson?.materials ?? []);
      } catch {
        toast.error("Falha ao carregar materiais");
        setMaterials([]);
      }
    })();
  }, [urlGeral]);

  const setParamOrDelete = (sp: URLSearchParams, key: string, val?: string) => {
    if (val && val.trim().length > 0) sp.set(key, val);
    else sp.delete(key);
  };

  function handlePesquisaChange(material: MaterialDTO) {
    const params = new URLSearchParams(queryUrl.toString());

    const searched = params.get("material_ids");
    if (searched !== material.id)
      setParamOrDelete(params, "material_ids", material.id);
    else params.delete("material_ids");

    navigate({
      pathname: location.pathname,
      search: `?${params.toString()}`,
    });
  }

  function changeSearch(value) {
    const onlyLettersRegex = /^[a-zA-ZÀ-ÿ\s]*$/;

    if (onlyLettersRegex.test(value)) {
      setMaterialsFiltered(
        materials.filter((m) =>
          m.material_name.toLowerCase().includes(value.toLowerCase()),
        ),
      );
      setSearch(value);
    } else toast.error("Busca apenas com letras");
  }

  function getMaterialSearch() {
    const params = new URLSearchParams(queryUrl.toString());
    return params.get("material_ids") || "";
  }

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

        <div className="bg-cover bg-no-repeat bg-center w-full">
          <div className="flex flex-col items-center gap-2 py-2">
            <h1 className="z-[2] text-center max-w-[700px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
              Todos os itens disponíveis em{" "}
              <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
                um só lugar
              </strong>
              , simples e prático.
            </h1>
            <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>

            <div className="lg:max-w-[60vw] lg:w-[60vw] w-full">
              <Input
                onChange={(e) => changeSearch(e.target.value)}
                value={search}
                type="text"
                className="border-0 w-full flex flex-1 m-2 border"
                placeholder="Busque por tipo de item"
              />
              <div className="hidden md:flex flex-wrap gap-3 justify-center">
                {(() => {
                  const params = new URLSearchParams(queryUrl.toString());
                  const searched = params.get("material_ids");

                  return materialsFiltered.slice(0, 8).map((material) => (
                    <div
                      key={material.id}
                      className={`flex gap-2 capitalize h-8 cursor-pointer transition-all ${searched === material.id ? "bg-eng-blue text-white dark:bg-eng-blue" : "bg-neutral-100 dark:bg-neutral-800"} hover:bg-neutral-200 dark:hover:bg-neutral-900 items-center p-2 px-3 rounded-md text-xs`}
                      onClick={() => handlePesquisaChange(material)}
                    >
                      {material.material_name}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className=" w-full md:px-8 gap-8 flex flex-col px-4 mb-4 md:mb-8">
          <BlockItems
            workflow={["AUDIOVISUAL_ANUNCIADO"]}
            materialIdFilter={getMaterialSearch()}
          />
        </div>
      </main>
    </div>
  );
}
