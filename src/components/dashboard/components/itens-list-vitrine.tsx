import { ComponentProps, useContext, useEffect, useState } from "react";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { ScrollArea } from "../../ui/scroll-area";
import { Badge } from "../../ui/badge";
import { cn } from "../../../lib";
import { UserContext } from "../../../context/context";
import { Check, MapPin, User, X } from "phosphor-react";
import { Barcode, Plus } from "lucide-react";

interface Patrimonio {
  bem_cod: string;
  bem_dgv: string;
  bem_num_atm: string;
  csv_cod: string;
  bem_serie: string;
  bem_sta: string;
  bem_val: string;
  tre_cod: string;
  bem_dsc_com: string;
  uge_cod: string;
  uge_nom: string;
  org_cod: string;
  uge_siaf: string;
  org_nom: string;
  set_cod: string;
  set_nom: string;
  loc_cod: string;
  loc_nom: string;
  ite_mar: string;
  ite_mod: string;
  tgr_cod: string;
  grp_cod: string;
  ele_cod: string;
  sbe_cod: string;
  mat_cod: string;
  mat_nom: string;
  pes_cod: string;
  pes_nome: string;
  created_at: string;
}

interface Props {
  onResearcherUpdate: (newResearcher: Patrimonio) => void;
  url: string;
  search: string;
}

import { format, differenceInDays } from "date-fns";
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";

export function ItensListVitrine(props: Props) {
  const [total, setTotal] = useState<Patrimonio[]>([]);

  // Atualize essa função para chamar a propriedade `onResearcherUpdate`
  const updateResearcher = (newResearcher: Patrimonio) => {
    if (props.onResearcherUpdate) {
      props.onResearcherUpdate(newResearcher);
    }
  };
  const [isLoading, setIsLoading] = useState(false);

  const { urlGeral } = useContext(UserContext);

  const urlPatrimonioInsert = props.url;

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(urlPatrimonioInsert, {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
            "Content-Type": "text/plain",
          },
        });
        const data = await response.json();
        if (data) {
          setTotal(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlPatrimonioInsert]);

  const qualisColor = {
    BM: "bg-green-500",
    AE: "bg-red-500",
    IR: "bg-yellow-500",
    OC: "bg-blue-500",
    BX: "bg-gray-500",
    RE: "bg-purple-500",
    QB: "bg-red-500",
    NE: "bg-yellow-500",
    SP: "bg-orange-500",
  };

  const csvCodToText = {
    BM: "Bom",
    AE: "Anti-Econômico",
    IR: "Irrecuperável",
    OC: "Ocioso",
    BX: "Baixado",
    RE: "Recuperável",
  };

  //console.log(total)
  const [count, setCount] = useState(12);

  const search = props.search;

  const filteredTotal = Array.isArray(total)
    ? total.filter((item) => {
        const searchString = `${item.bem_cod}-${item.bem_dgv}`;
        return searchString.toLowerCase().includes(search.toLowerCase());
      })
    : [];

  return (
    <ScrollArea className="h-[calc(100vh-180px)]">
      {isLoading ? (
        <div className="flex flex-col gap-2 p-4 pt-0">
          <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
          <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
          <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
          <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
          <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>

          <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
          <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4 pt-0">
          {filteredTotal.slice(0, count).map((item) => {
            const currentDate = new Date();
            const itemDate = new Date(item.created_at);

            // Calcula a diferença em dias entre a data atual e a data do item
            const daysDifference = differenceInDays(currentDate, itemDate);
            return (
              <div className="flex" onClick={() => updateResearcher(item)}>
                {item.csv_cod != undefined && (
                  <div
                    className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border min-h-[250px]  border-neutral-200 border-r-0 ${
                      qualisColor[
                        item.csv_cod.trim() as keyof typeof qualisColor
                      ]
                    } min-h-full relative `}
                  ></div>
                )}

                <button
                  key={item.bem_cod}
                  className={cn(
                    "flex flex-col rounded-lg w-full rounded-l-none bg-white dark:bg-neutral-800 dark:border-neutral-700 items-start gap-2  border p-3 text-left text-sm transition-all hover:bg-accent"
                  )}
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-medium mb-2 flex items-center gap-2">
                        {item.bem_cod}-{item.bem_dgv}
                        {daysDifference <= 5 && (
                          <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <Barcode size={16} />
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-lg">
                          {item.mat_nom}
                        </div>
                      </div>
                      <div></div>
                    </div>
                  </div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">
                    {item.bem_dsc_com}
                  </div>
                </button>
              </div>
            );
          })}

          {filteredTotal.length >= count && (
            <Button variant={"outline"} onClick={() => setCount(count + 12)}>
              <Plus size={16} />
              Mostrar mais
            </Button>
          )}
        </div>
      )}
    </ScrollArea>
  );
}
