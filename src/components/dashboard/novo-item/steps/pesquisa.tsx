import { useContext, useEffect, useRef, useState } from "react";
import { ArrowRight, Trash, X } from "lucide-react";
import { MagnifyingGlass } from "phosphor-react";
import { Alert } from "../../../ui/alert";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { toast } from "sonner";
import type { StepBaseProps } from "../novo-item";
import { useQuery } from "../../../modal/search-modal-patrimonio";
import { UserContext } from "../../../../context/context";

export interface PatrimoniosSelecionados {
  term: string;
  type: "cod" | "atm";
}

// 🔎 Tipo interno só para a UI (não depende do formato da API)
type SearchItem =
  | { type: "cod"; bem_cod: string; bem_dgv: string }
  | { type: "atm"; bem_num_atm: string };

const isCod = (i: SearchItem): i is Extract<SearchItem, { type: "cod" }> => i.type === "cod";
const isAtm = (i: SearchItem): i is Extract<SearchItem, { type: "atm" }> => i.type === "atm";

export function PesquisaStep({
  value_item, // reidratado pelo Wizard
  onValidityChange,
  onStateChange,
  type, // reidratado pelo Wizard
  step
}: StepBaseProps<"pesquisa">) {
  const [itemType, setItemType] = useState<"cod" | "atm">((type as any) ?? "cod");
  const [itemsSelecionadosPopUp, setItensSelecionadosPopUp] =
    useState<PatrimoniosSelecionados[]>(
      value_item && type ? [{ term: String(value_item), type: String(type) as "cod" | "atm" }] : []
    );
  const [input, setInput] = useState("");

  // ========= API base =========
  const { urlGeral } = useContext(UserContext);
  const API_BASE = `${String(urlGeral).replace(/\/$/, "")}/assets/search`;

  // ========= Helpers da API =========
  async function fetchArrayByKey(
    url: string,
    key: "asset_identifier" | "atm_number"
  ): Promise<string[]> {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return [];
      const json = await res.json();
      const arr = json?.[key];
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
      return [];
    }
  }

  const searchAssetIdentifier = (q: string) =>
    fetchArrayByKey(`${API_BASE}/asset-identifier?q=${encodeURIComponent(q.replace(/-/g, ""))}`, "asset_identifier");
  const searchAtmNumber = (q: string) =>
    fetchArrayByKey(`${API_BASE}/atm-number?q=${encodeURIComponent(q.replace(/-/g, ""))}`, "atm_number");

  // ========= Normalização de input =========
  const normalizeInput = (value: string): string => {
    value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // mantém maiúsculas/minúsculas para permitir "X" em ATM
    value = value.replace(/[^A-Za-z0-9\s-]/g, "");
    return value;
  };

  const [filteredItems, setFilteredItems] = useState<SearchItem[]>([]);

  // Rehidrata quando o Wizard já tem valor salvo e o usuário volta para a aba
  useEffect(() => {
    if (value_item && type) {
      setItemType(String(type) as "cod" | "atm");
      setItensSelecionadosPopUp([{ term: String(value_item), type: String(type) as "cod" | "atm" }]);
    } else if (!value_item) {
      setItensSelecionadosPopUp([]);
    }
  }, [value_item, type]);

  useEffect(() => {
    onValidityChange(itemsSelecionadosPopUp.length > 0);
  }, [itemsSelecionadosPopUp, onValidityChange]);

  useEffect(() => {
    if (itemsSelecionadosPopUp.length > 0) {
      onStateChange?.({
        type: itemsSelecionadosPopUp[0].type,
        value_item: itemsSelecionadosPopUp[0].term,
      });
    } else {
      onStateChange?.({ type: undefined, value_item: undefined });
    }
  }, [itemsSelecionadosPopUp, onStateChange]);

  // ========= Busca via API (somente IDENTIFICADOR como "cod" e ATM) =========
  const searchFilesByTermPrefix = async (rawInput: string) => {
    const input = normalizeInput(rawInput).trim();
    if (input.replace(/-/g, "").length < 1) return;

    // "cod" usa possível hífen (asset-identifier); ATM pode conter números e 'X'
    const qIdentifier = input;
    const qAtm = input;

    try {
      const [assetIdentifiers, atmNumbers] = await Promise.all([
        searchAssetIdentifier(qIdentifier),
        searchAtmNumber(qAtm),
      ]);

      // Mapear respostas da API para o tipo interno SearchItem
      const codItems: SearchItem[] = (assetIdentifiers || []).map((id) => {
        const [bem_cod, bem_dgv = ""] = String(id).split("-");
        return { type: "cod", bem_cod, bem_dgv };
      });

      const atmItems: SearchItem[] = (atmNumbers || []).map((atm) => ({
        type: "atm",
        bem_num_atm: String(atm),
      }));

      // De-duplica
      const uniq = new Map<string, SearchItem>();
      for (const it of [...codItems, ...atmItems]) {
        const key = isAtm(it) ? it.bem_num_atm : `${it.bem_cod}-${it.bem_dgv}`;
        if (!uniq.has(key)) uniq.set(key, it);
      }

      setFilteredItems(Array.from(uniq.values()));
    } catch (error) {
      console.error("Erro ao buscar na API:", error);
      setFilteredItems([]);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChangeInput = (value: string) => {
    const normalizedValue = normalizeInput(value);
    console.log(value, normalizedValue);
    searchFilesByTermPrefix(value);
    setInput(value);
  };

  const handleChangeInputCod = (value: string) => {
    // Somente números
    let cleanValue = value.replace(/[^0-9]/g, "");

    // Remove zeros à esquerda
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

    // Busca com o valor formatado (asset-identifier)
    searchFilesByTermPrefix(formattedValue);

    // Exibe formatado
    setInput(formattedValue);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...itemsSelecionadosPopUp];
    newItems.splice(index, 1);
    setItensSelecionadosPopUp(newItems);
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
    if (cod) {
      setInput(cod);
    }
  }, [cod]);

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className="mb-16 text-4xl font-semibold max-w-[700px]">
          Pesquise pelo identificador ou ATM do patrimônio:
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
                    if (itemType === "cod") {
                      handleChangeInputCod(e.target.value);
                    } else {
                      handleChangeInput(e.target.value);
                    }
                  }}
                  type="text"
                  ref={inputRef}
                  value={input}
                  autoFocus={true}
                  className="border-0 w-full bg-transparent max-h-[40px] h-[40px]  flex-1 p-0  inline-block"
                />
              )}
            </div>
          </div>

          <div className="w-fit flex gap-2">
            {itemsSelecionadosPopUp.length > 0 && (
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={() => {
                  setItensSelecionadosPopUp([]);
                }}
              >
                <Trash size={16} />
              </Button>
            )}
          </div>
        </Alert>

        {/* Resultados */}
        {input.trim().length >= 1 && filteredItems.length !== 0 && (
          <div className="w-full mt-4">
            <div className="flex flex-col gap-8">
              {filteredItems.some(isCod) && (
                <div>
                  <p className="uppercase font-medium text-xs mb-3">Identificador (código-dígito)</p>
                  <div className="flex flex-wrap gap-3">
                    {filteredItems
                      .filter(isCod)
                      .slice(0, 15)
                      .map((props, index) => {
                        const label = `${props.bem_cod}-${props.bem_dgv}`;
                        return (
                          <div
                            key={index}
                            onClick={() => handlePesquisa(label, "cod")}
                            className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                          >
                            {label}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {filteredItems.some(isAtm) && (
                <div>
                  <p className="uppercase font-medium text-xs mb-3">Código ATM</p>
                  <div className="flex flex-wrap gap-3">
                    {filteredItems
                      .filter(isAtm)
                      .slice(0, 15)
                      .map((props, index) => (
                        <div
                          key={index}
                          onClick={() => handlePesquisa(props.bem_num_atm, "atm")}
                          className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover.bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                        >
                          {props.bem_num_atm}
                        </div>
                      ))}
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
