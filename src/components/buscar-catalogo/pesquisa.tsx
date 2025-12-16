import { useContext, useEffect, useRef, useState } from "react";
import { ArrowRight, Trash, X } from "lucide-react";
import { MagnifyingGlass } from "phosphor-react";
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useQuery } from "../modal/search-modal-patrimonio";
import { UserContext } from "../../context/context";
import { useIsMobile } from "../../hooks/use-mobile";
export type StepBaseProps<K extends keyof StepPropsMap> = {
  value: K;
  step: number;
  onValidityChange: (valid: boolean) => void;
  onStateChange?: (state: unknown) => void;
} & StepPropsMap[K];

export type StepPropsMap = {
  pesquisa: { value_item?: string; type?: string };
};

export interface PatrimoniosSelecionados {
  term: string;
  type: "cod" | "atm";
}

// 🔎 Tipos internos só para UI
type SearchItem =
  | { type: "cod"; bem_cod: string; bem_dgv: string }
  | { type: "atm"; bem_num_atm: string };

const isCod = (i: SearchItem): i is Extract<SearchItem, { type: "cod" }> =>
  i.type === "cod";
const isAtm = (i: SearchItem): i is Extract<SearchItem, { type: "atm" }> =>
  i.type === "atm";

export function PesquisaStep({
  value_item,
  onValidityChange,
  onStateChange,
  type,
  step,
}: StepBaseProps<"pesquisa">) {
  const [itemType, setItemType] = useState<"cod" | "atm">(
    (type as any) ?? "cod"
  );
  const [itemsSelecionadosPopUp, setItensSelecionadosPopUp] = useState<
    PatrimoniosSelecionados[]
  >(
    value_item && type
      ? [{ term: String(value_item), type: String(type) as "cod" | "atm" }]
      : []
  );
  const [input, setInput] = useState("");

  // ========= API base =========
  const { urlGeral } = useContext(UserContext);

  // ========= Controle de busca avançada =========
  const [advanced, setAdvanced] = useState(false);

  // ========= Helpers da API =========
  async function fetchArray(): Promise<string[]> {
    try {
      const res = await fetch(`${urlGeral}catalog/search/asset-identifier`, {
        headers: {
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "3600",
          "Content-Type": "text/plain",
        },
      });
      if (!res.ok) return [];
      const json = await res.json();
      const arr = json?.catalogs;

      const identifiers = arr.map(
        (c: { asset_identifier: string }) => c.asset_identifier
      );

      return Array.isArray(identifiers) ? identifiers : [];
    } catch {
      return [];
    }
  }

  // ========= Normalização de input =========
  const normalizeInput = (value: string): string => {
    value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    value = value.replace(/[^A-Za-z0-9\s-]/g, ""); // permite 'X' para ATM também
    return value;
  };

  // Estados de resultados
  const [filteredItems, setFilteredItems] = useState<SearchItem[]>([]);

  // Rehidrata quando o Wizard já tem valor salvo
  useEffect(() => {
    if (!value_item || !type) return;
    if (didHydrate.current) return;
    setItemType(String(type) as "cod" | "atm");
    setItensSelecionadosPopUp([
      { term: String(value_item), type: String(type) as "cod" | "atm" },
    ]);
    didHydrate.current = true;
  }, [value_item, type]);

  useEffect(() => {
    const has = itemsSelecionadosPopUp.length > 0;
    onValidityChange(has);
    if (has) {
      const { type, term } = itemsSelecionadosPopUp[0];
      onStateChange?.({ type, value_item: term });
    }
  }, [itemsSelecionadosPopUp, onValidityChange, onStateChange]);

  // ========= Busca por input =========
  const runSearch = async (rawInput: string) => {
    const input = normalizeInput(rawInput).trim();
    const inputClean = input.replace(/-/g, ""); // remove o hífen do que o usuário digitou

    if (inputClean.length < 1) {
      setFilteredItems([]);
      return;
    }

    // Busca simples
    const [assetIdentifiers] = await Promise.all([fetchArray()]);

    // Filtra os asset_identifiers pelo que o usuário digitou
    const filteredIds = (assetIdentifiers || []).filter((id) => {
      const idStr = String(id); // ex: "1234567-8"
      const [bem_cod, bem_dgv = ""] = idStr.split("-");
      const idClean = `${bem_cod}${bem_dgv}`.replace(/-/g, ""); // "12345678"
      return idClean.startsWith(inputClean); // ou .includes(inputClean) se quiser busca em qualquer posição
    });

    // Mapeia só os que passaram no filtro
    const codItems: SearchItem[] = filteredIds.map((id) => {
      const [bem_cod, bem_dgv = ""] = String(id).split("-");
      return { type: "cod", bem_cod, bem_dgv };
    });

    const uniq = new Map<string, SearchItem>();
    for (const it of codItems) {
      const key = isAtm(it) ? it.bem_num_atm : `${it.bem_cod}-${it.bem_dgv}`;
      if (!uniq.has(key)) uniq.set(key, it);
    }

    setFilteredItems(Array.from(uniq.values()));
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChangeInput = (value: string) => {
    runSearch(value);
    setInput(value);
  };

  const handleChangeInputCod = (value: string) => {
    let cleanValue = value.replace(/[^a-zA-Z0-9]/g, "");

    const originalValue = cleanValue;
    cleanValue = cleanValue.replace(/^0+/, "");
    if (originalValue !== cleanValue) {
      toast.info("Zeros à esquerda foram removidos.");
    }

    // Formata com hífen no último dígito (ex.: 12345-7)
    let formattedValue = cleanValue;
    if (cleanValue.length > 1) {
      formattedValue = cleanValue.slice(0, -1) + "-" + cleanValue.slice(-1);
    }
    runSearch(formattedValue);
    setInput(formattedValue);
  };

  // evita rehidratar várias vezes a partir das props
  const didHydrate = useRef(false);

  const handleRemoveItem = (index: number) => {
    setItensSelecionadosPopUp((prev) => {
      const arr = prev.filter((_, i) => i !== index);
      if (arr.length === 0) {
        // limpa no pai também
        onStateChange?.({
          type: undefined as any,
          value_item: undefined as any,
        });
        onValidityChange(false);
      }
      return arr;
    });
  };

  useEffect(() => {
    const has = itemsSelecionadosPopUp.length > 0;
    onValidityChange(has);
    if (has) {
      const { type, term } = itemsSelecionadosPopUp[0];
      onStateChange?.({ type, value_item: term });
    }
  }, [itemsSelecionadosPopUp, onValidityChange, onStateChange]);

  // 🔗 Seleção no modo simples
  const handleSelectItemSimple = (it: SearchItem) => {
    const label = isCod(it) ? `${it.bem_cod}-${it.bem_dgv}` : it.bem_num_atm;
    const finalType: "cod" | "atm" = isCod(it) ? "cod" : "atm";
    handlePesquisa(label, finalType);
  };

  const handlePesquisa = (value: string, type: "cod" | "atm") => {
    setInput("");

    const nextItems =
      type === itemType
        ? [...itemsSelecionadosPopUp, { term: value, type }]
        : [{ term: value, type }];

    setItemType(type);
    setItensSelecionadosPopUp(nextItems);
  };

  const queryUrl = useQuery();
  const cod = queryUrl.get("cod");

  useEffect(() => {
    if (cod) setInput(cod);
  }, [cod]);

  const isMobile = useIsMobile();

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1
          className={
            isMobile
              ? "mb-16 text-2xl font-semibold max-w-[1000px]"
              : "mb-16 text-4xl font-semibold max-w-[1000px]"
          }
        >
          Pesquise pelo identificador (código-dígito) do patrimônio:
        </h1>
      </div>

      <div className="ml-8">
        <Alert className="h-14 bg-white p-2 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2 w-full flex-1">
            <div className="w-10 min-w-10">
              <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
            </div>

            <div className="flex w-full whitespace-nowrap gap-2 items-center">
              {itemsSelecionadosPopUp.map((valor, index) => (
                <div
                  key={`${valor.term}-${index}`}
                  className="flex whitespace-nowrap gap-2 items-center"
                >
                  <div
                    className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs ${
                      valor.type === "cod"
                        ? "bg-teal-600"
                        : valor.type === "atm"
                        ? "bg-amber-600"
                        : "bg-indigo-600"
                    } text-white border-0`}
                  >
                    {valor.term.replace(/[|;]/g, "")}
                    <X
                      size={12}
                      onClick={() => handleRemoveItem(index)}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              ))}

              {itemsSelecionadosPopUp.length === 0 && (
                <Input
                  onChange={(e) => {
                    if (!advanced && itemType === "cod") {
                      handleChangeInputCod(e.target.value);
                    } else {
                      handleChangeInput(e.target.value);
                    }
                  }}
                  type="text"
                  ref={inputRef}
                  value={input}
                  autoFocus={true}
                  maxLength={20} // 👈 limite de 10 caracteres
                  className="border-0 w-full bg-transparent max-h-[40px] h-[40px]  flex-1 p-0  inline-block"
                />
              )}
            </div>
          </div>

          <div className="w-fit flex gap-2 items-center">
            {itemsSelecionadosPopUp.length > 0 && (
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={() => setItensSelecionadosPopUp([])}
              >
                <Trash size={16} />
              </Button>
            )}
          </div>
        </Alert>

        {/* MODO SIMPLES: duas sessões (cod/atm) */}
        {!advanced &&
          input.trim().length >= 1 &&
          filteredItems.length !== 0 && (
            <div className="w-full mt-4">
              <div className="flex flex-col gap-8">
                {filteredItems.some(isCod) && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">
                      Identificador (código-dígito)
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {filteredItems
                        .filter(isCod)
                        .slice(0, 15)
                        .map((props, index) => {
                          const label = `${props.bem_cod}-${props.bem_dgv}`;
                          return (
                            <div
                              key={index}
                              onClick={() => handleSelectItemSimple(props)}
                              className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                            >
                              {label}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
