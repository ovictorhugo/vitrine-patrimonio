import { useContext, useEffect, useRef, useState } from "react";
import { ArrowRight, Trash, X } from "lucide-react";
import { MagnifyingGlass } from "phosphor-react";
import { Alert } from "../../../ui/alert";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { toast } from "sonner";
import type { StepBaseProps } from "../emprestimo-audiovisual";
import { useQuery } from "../../../modal/search-modal-patrimonio";
import { UserContext } from "../../../../context/context";
import { Switch } from "../../../ui/switch";

export interface PatrimoniosSelecionados {
  term: string;
  type: "cod" | "atm";
}

// 🔎 Tipos internos só para UI
type SearchItem =
  | { type: "cod"; bem_cod: string; bem_dgv: string }
  | { type: "atm"; bem_num_atm: string };

type AdvancedItem = {
  type: "advanced";
  cod_label?: string;   // asset_code-asset_check_digit
  display: string;      // rótulo mostrado no chip
  id?: string;          // para de-dup
};

const isCod = (i: SearchItem): i is Extract<SearchItem, { type: "cod" }> => i.type === "cod";
const isAtm = (i: SearchItem): i is Extract<SearchItem, { type: "atm" }> => i.type === "atm";

export function PesquisaStep({
  value_item,
  onValidityChange,
  onStateChange,
  type,
  step
}: StepBaseProps<"pesquisa">) {
  const [itemType, setItemType] = useState<"cod" | "atm">((type as any) ?? "cod");
  const [itemsSelecionadosPopUp, setItensSelecionadosPopUp] =
    useState<PatrimoniosSelecionados[]>(
      value_item && type ? [{ term: String(value_item), type: String(type) as "cod" | "atm" }] : []
    );
  const [input, setInput] = useState("");

  // ========= API base =========
  const { urlGeral, loggedIn } = useContext(UserContext);
  const API_SEARCH_BASE = `${String(urlGeral).replace(/\/$/, "")}/assets/search`;
  const API_ADV_BASE = `${String(urlGeral).replace(/\/$/, "")}/assets/?q=`;

  // ========= Controle de busca avançada =========
  const [advanced, setAdvanced] = useState(false);

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
    fetchArrayByKey(`${API_SEARCH_BASE}/asset-identifier?q=${encodeURIComponent(q.replace(/-/g, ""))}`, "asset_identifier");
  const searchAtmNumber = (q: string) =>
    fetchArrayByKey(`${API_SEARCH_BASE}/atm-number?q=${encodeURIComponent(q.replace(/-/g, ""))}`, "atm_number");

  // ========= Busca avançada (GET /assets/q=) =========
  const searchAdvanced = async (q: string): Promise<AdvancedItem[]> => {
    if (!q.trim()) return [];
    try {
      const res = await fetch(`${API_ADV_BASE}${encodeURIComponent(q)}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return [];
      const json = await res.json();
      const assets: any[] = Array.isArray(json?.assets) ? json.assets : [];

      const items: AdvancedItem[] = assets.map((a) => {
        const asset_code = a?.asset_code ? String(a.asset_code).trim() : "";
        const asset_check_digit = a?.asset_check_digit ? String(a.asset_check_digit).trim() : "";
        const atm_number = a?.atm_number ? String(a.atm_number).trim() : "";
        const serial_number = a?.serial_number ? String(a.serial_number).trim() : "";
        const asset_description = a?.asset_description ? String(a.asset_description).trim() : "";
        const brand = a?.item_brand ? String(a.item_brand).trim() : "";
        const model = a?.item_model ? String(a.item_model).trim() : "";

        const cod_label = asset_code && asset_check_digit ? `${asset_code}-${asset_check_digit}` : undefined;

        // Monta um label amigável (ajuste conforme preferir)
        const parts: string[] = [];
        if (cod_label) parts.push(cod_label);
        if (atm_number) parts.push(`ATM ${atm_number}`);
        if (serial_number) parts.push(`S/N ${serial_number}`);
        const bm = [brand, model].filter(Boolean).join(" ");
        if (bm) parts.push(bm);
        if (asset_description) parts.push(asset_description);

        const display = parts.join(" • ") || "(sem dados)";

        return {
          type: "advanced",
          cod_label,
          display,
          id: a?.id ? String(a.id) : cod_label || `${atm_number}|${serial_number}|${asset_description}`
        };
      });

      // De-dup por id
      const uniq = new Map<string, AdvancedItem>();
      for (const it of items) {
        const k = it.id || it.display;
        if (!uniq.has(k)) uniq.set(k, it);
      }
      return Array.from(uniq.values());
    } catch {
      return [];
    }
  };

  // ========= Normalização de input =========
  const normalizeInput = (value: string): string => {
    value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    value = value.replace(/[^A-Za-z0-9\s-]/g, ""); // permite 'X' para ATM também
    return value;
  };

  // Estados de resultados
  const [filteredItems, setFilteredItems] = useState<SearchItem[]>([]);
  const [advancedResults, setAdvancedResults] = useState<AdvancedItem[]>([]);

  // Rehidrata quando o Wizard já tem valor salvo
useEffect(() => {
  if (!value_item || !type) return;
  if (didHydrate.current) return;
  setItemType(String(type) as "cod" | "atm");
  setItensSelecionadosPopUp([{ term: String(value_item), type: String(type) as "cod" | "atm" }]);
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
  const runSearch = async (rawInput: string, forceTreatAsCodFormatter = false) => {
    const input = normalizeInput(rawInput).trim();
    if (input.replace(/-/g, "").length < 1) {
      setFilteredItems([]);
      setAdvancedResults([]);
      return;
    }

    if (advanced) {
      const adv = await searchAdvanced(input);
      setAdvancedResults(adv);
      setFilteredItems([]);
      return;
    }

    // Busca simples
    const [assetIdentifiers, atmNumbers] = await Promise.all([
      searchAssetIdentifier(input),
      searchAtmNumber(input),
    ]);

    const codItems: SearchItem[] = (assetIdentifiers || []).map((id) => {
      const [bem_cod, bem_dgv = ""] = String(id).split("-");
      return { type: "cod", bem_cod, bem_dgv };
    });

    const atmItems: SearchItem[] = (atmNumbers || []).map((atm) => ({
      type: "atm",
      bem_num_atm: String(atm),
    }));

    const uniq = new Map<string, SearchItem>();
    for (const it of [...codItems, ...atmItems]) {
      const key = isAtm(it) ? it.bem_num_atm : `${it.bem_cod}-${it.bem_dgv}`;
      if (!uniq.has(key)) uniq.set(key, it);
    }

    setFilteredItems(Array.from(uniq.values()));
    setAdvancedResults([]);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChangeInput = (value: string) => {
    runSearch(value);
    setInput(value);
  };

  const handleChangeInputCod = (value: string) => {
    // Somente números
    let cleanValue = value.replace(/[^0-9]/g, "");

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

    runSearch(formattedValue, true);
    setInput(formattedValue);
  };

  // evita rehidratar várias vezes a partir das props
const didHydrate = useRef(false);


const handleRemoveItem = (index: number) => {
  setItensSelecionadosPopUp(prev => {
    const arr = prev.filter((_, i) => i !== index);
    if (arr.length === 0) {
      // limpa no pai também
      onStateChange?.({ type: undefined as any, value_item: undefined as any });
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

  // 🔗 Seleção no modo avançado (sempre vai como COD)
  const handleSelectItemAdvanced = (it: AdvancedItem) => {
    if (!it.cod_label) {
      toast.error("Este item não possui identificador (código-dígito).");
      return;
    }
    handlePesquisa(it.cod_label, "cod");
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

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className="mb-16 text-4xl font-semibold max-w-[1000px]">
          Pesquise pelo identificador (código-dígito) ou ATM do patrimônio:
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
          {loggedIn && (
            <>
              <p className="text-xs font-medium">Busca avançada</p>
            <Switch checked={advanced} onCheckedChange={setAdvanced} />
            </>
          )}
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

{filteredItems.length == 0 && (
<p className="mt-8 text-xs font-medium text-gray-500">*Para códigos ATM que começam com "A", substituir por 19 ou 20</p>
)}
        

        {/* Resultados */}
        {/* MODO AVANÇADO: uma única sessão */}
        {advanced && input.trim().length >= 1 && advancedResults.length !== 0 && (
          <div className="w-full mt-4">
            <div className="flex flex-col gap-8">
              <div>
                <p className="uppercase font-medium text-xs mb-3">Busca avançada</p>
                <div className="flex flex-wrap gap-3">
                  {advancedResults.slice(0, 30).map((it, index) => (
                    <div
                      key={it.id ?? index}
                      title={it.display}
                      onClick={() => handleSelectItemAdvanced(it)}
                      className={`flex gap-2 h-8 cursor-pointer transition-all
                                  bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800
                                  items-center p-2 px-3 rounded-md text-xs
                                  ${it.cod_label ? "" : "opacity-60"}`}
                    >
                      {it.display}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODO SIMPLES: duas sessões (cod/atm) */}
        {!advanced && input.trim().length >= 1 && filteredItems.length !== 0 && (
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
                          onClick={() => handleSelectItemSimple(props)}
                          className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
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
