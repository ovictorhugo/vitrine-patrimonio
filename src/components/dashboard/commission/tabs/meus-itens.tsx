import { useContext, useEffect, useMemo, useState } from "react";
import { HeaderResultTypeHome } from "../../../header-result-type-home";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion";
import { Skeleton } from "../../../ui/skeleton";
import { File, ListTodo } from "lucide-react";
import { UserContext } from "../../../../context/context";
import { toast } from "sonner";
import { Button } from "../../../ui/button";
import { Rows, SquaresFour } from "phosphor-react";
import { CatalogEntriesResponse } from "../../../homepage/components/item-patrimonio";
import { PatrimonioItemComission } from "../components/patrimonio-item";
import { BlockItemsComissionScroll } from "../components/block-items-tinder";
import { CatalogEntry } from "../../itens-vitrine/card-item-dropdown";
import { Alert } from "../../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Link } from "react-router-dom";

export function MeusItens() {
  const [catalogs, setCatalogs] = useState<CatalogEntry[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [typeVisu, setTypeVisu] = useState<"block" | "rows">("block");

  const { urlGeral, user } = useContext(UserContext);
  const token = useMemo(() => localStorage.getItem("jwt_token"), []);

  const authHeaders: HeadersInit = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // ================================
  // GET catálogo filtrado pelo reviewer_id
  // ================================

  //?reviewer_id=${user?.id}&workflow_status=REVIEW_REQUESTED_COMISSION
  const fetchInventories = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${urlGeral}catalog/?reviewer_id=${user?.id}&workflow_status=REVIEW_REQUESTED_COMISSION`, {
        method: "GET",
        headers: authHeaders,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao carregar catálogo (HTTP ${res.status}).`);
      }

      const data: CatalogEntriesResponse = await res.json();
      setCatalogs(Array.isArray(data?.catalog_entries) ? data?.catalog_entries : []);
    } catch (e: any) {
      toast("Erro ao carregar catálogo", {
        description: e?.message || String(e),
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchInventories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlGeral]);

  // ================================
  // Remover item da lista localmente
  // ================================
  const handleRemove = (id: string) => {
    setCatalogs((prev) => prev.filter((c) => c.id !== id));
  };

  // ================================
  // Render
  // ================================
  return (
    <div className=" grid gap-4 ">
       <div className="p-8 pb-0">
        <Alert className="p-0  mb-0 ">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LTD - Lista Temporária de Desfazimento</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{catalogs.length}</div>
                <p className="text-xs text-muted-foreground">esperando avaliação</p>
              </CardContent>
            </Alert>

       </div>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <div className="flex px-8">
            <HeaderResultTypeHome
              title={"Lista Temporária de Desfazimento (LTD)"}
              icon={<ListTodo size={24} className="" />}
            >
              <div className="hidden md:flex gap-3 mr-3">
             <Link target="_blank" to={'https://1drv.ms/w/c/19cbb0e3f3a61d59/EVHqrzYOHn5JsW32vCVTc7kBHHsjW8GY7H-01b5OmcvYrQ?e=nYXS26'}>
             <Button><File size={16}/>Manual da comissão</Button>
             
             </Link>
                <Button
                  onClick={() => setTypeVisu("rows")}
                  variant={typeVisu === "block" ? "ghost" : "outline"}
                  size={"icon"}
                >
                  <Rows size={16} className="whitespace-nowrap" />
                </Button>
                <Button
                  onClick={() => setTypeVisu("block")}
                  variant={typeVisu === "block" ? "outline" : "ghost"}
                  size={"icon"}
                >
                  <SquaresFour size={16} className="whitespace-nowrap" />
                </Button>
              </div>
            </HeaderResultTypeHome>
            <AccordionTrigger className="px-0"></AccordionTrigger>
          </div>

          <AccordionContent className="p-0 mb-8">
            {typeVisu === "rows" ? (
              loadingList ? (
                <div className="flex gap-4 flex-col mx-8">
                  <Skeleton className="w-full h-32" />
                  <Skeleton className="w-full h-32" />
                  <Skeleton className="w-full h-32" />
                </div>
              ) : catalogs.length === 0 ? (
                <div className="items-center justify-center w-full flex text-center pt-6">
                  Nenhum item encontrado.
                </div>
              ) : (
                <div className="grid gap-4 px-8">
                  {catalogs.map((entry) => (
                    <PatrimonioItemComission key={entry.id} entry={entry} onRemove={handleRemove} />
                  ))}
                </div>
              )
            ) : loadingList ? (
              <div className="flex gap-4 flex-col">
                <Skeleton className="w-full h-[640px]  mx-auto max-w-[480px]" />

              </div>
            ) : catalogs.length === 0 ? (
              <div className="items-center justify-center w-full flex text-center pt-6">
                Nenhum item encontrado.
              </div>
            ) : (
              <BlockItemsComissionScroll catalogs={catalogs} onRemove={handleRemove} />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
