import { useContext, useEffect, useRef, useState } from "react";
import { ArrowRight, Trash, X } from "lucide-react";
import { MagnifyingGlass } from "phosphor-react";
import { Alert } from "../../../ui/alert";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { toast } from "sonner";

import { UserContext } from "../../../../context/context";
import { StepBaseProps } from "../../novo-item/novo-item";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "../../../authentication/signIn";
import { useIsMobile } from "../../../../hooks/use-mobile";

export interface PatrimoniosSelecionados {
  term: string;
  type: "cod" | "atm";
}

// 🔎 Tipo interno só para a UI (não depende do formato da API)
type SearchItem =
  | { type: "cod"; bem_cod: string; bem_dgv: string }
  | { type: "atm"; bem_num_atm: string };

const isCod = (i: SearchItem): i is Extract<SearchItem, { type: "cod" }> =>
  i.type === "cod";
const isAtm = (i: SearchItem): i is Extract<SearchItem, { type: "atm" }> =>
  i.type === "atm";

export function PesquisaStepCB({
  value_item, // controlado pelo pai
  onValidityChange, // avisa se há seleção
  onStateChange, // envia nova seleção
  type, // controlado pelo pai
  step,
}: StepBaseProps<"pesquisa">) {
  // Estado APENAS do input e resultados
  const [input, setInput] = useState("");
  const [filteredItems, setFilteredItems] = useState<SearchItem[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

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
    fetchArrayByKey(
      `${API_BASE}/asset-identifier?q=${encodeURIComponent(
        q.replace(/-/g, "")
      )}`,
      "asset_identifier"
    );
  const searchAtmNumber = (q: string) =>
    fetchArrayByKey(
      `${API_BASE}/atm-number?q=${encodeURIComponent(q.replace(/-/g, ""))}`,
      "atm_number"
    );

  // ========= Normalização de input =========
  const normalizeInput = (value: string): string => {
    value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    value = value.replace(/[^A-Za-z0-9\s-]/g, ""); // permite números/letras/hífen
    return value;
  };

  // Controle de validade vem 100% do props (se tem seleção do pai)
  useEffect(() => {
    onValidityChange(!!value_item);
  }, [value_item, onValidityChange]);

  // ========= Busca via API =========
  const searchFilesByTermPrefix = async (rawInput: string) => {
    const input = normalizeInput(rawInput).trim();
    if (input.replace(/-/g, "").length < 1) {
      setFilteredItems([]);
      return;
    }

    try {
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
    } catch (error) {
      console.error("Erro ao buscar na API:", error);
      setFilteredItems([]);
    }
  };

  // ===== Debounce =====
  const debounceRef = useRef<number | null>(null);
  const debouncedSearch = (q: string) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      searchFilesByTermPrefix(q);
    }, 200);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  // Entrada para COD (formata com hífen no último char)
  const handleChangeInputCod = (value: string) => {
    let cleanValue = value.replace(/[^a-zA-Z0-9]/g, "");
    const before = cleanValue;
    cleanValue = cleanValue.replace(/^0+/, "");
    if (before !== cleanValue) toast.info("Zeros à esquerda foram removidos.");

    let formatted = cleanValue;
    if (cleanValue.length > 1) {
      formatted = cleanValue.slice(0, -1) + "-" + cleanValue.slice(-1);
    }

    setInput(formatted);
    debouncedSearch(formatted);
  };

  // Entrada “livre” (se quiser aceitar ATM também no mesmo campo)
  const handleChangeInput = (value: string) => {
    const normalized = normalizeInput(value);
    setInput(value);
    debouncedSearch(normalized);
  };

  // --- Helpers de URL: remover parâmetros ---
  const removeSearchParams = (keys: string[]) => {
    const sp = new URLSearchParams(location.search);
    keys.forEach((k) => sp.delete(k));
    const next = sp.toString();
    navigate(
      { pathname: location.pathname, search: next ? `?${next}` : "" },
      { replace: true }
    );
  };

  // Selecionou um resultado -> comunica o PAI e limpa a lista
  const handlePesquisa = (value: string, newType: "cod" | "atm") => {
    onStateChange?.({ value_item: value, type: newType });
    setInput("");
    setFilteredItems([]);
    // (Opcional) Atualizar a URL AQUI, se você quiser escrever os params ao selecionar.
    // if (newType === "atm") { ... } else { ... }
  };

  // Remover seleção -> comunica o PAI E LIMPA A URL
  const handleClearSelection = () => {
    onStateChange?.({ value_item: undefined, type: undefined });
    setInput("");
    setFilteredItems([]);

    // remove os parâmetros relacionados de forma segura
    if (type === "atm") {
      removeSearchParams(["bem_num_atm", "cod", "bem_cod", "bem_dgv"]);
    } else if (type === "cod") {
      removeSearchParams(["bem_cod", "bem_dgv", "cod", "bem_num_atm"]);
    } else {
      // fallback: remove todos que usamos
      removeSearchParams(["bem_cod", "bem_dgv", "bem_num_atm", "cod"]);
    }
  };

  // Suporte a query param "cod" (se você usa isso em alguma rota)
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
              {/* Chip da seleção atual (controlado pelo pai) */}
              {value_item ? (
                <div className="flex whitespace-nowrap gap-2 items-center">
                  <div
                    className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs ${
                      type === "cod"
                        ? "bg-teal-600"
                        : type === "atm"
                        ? "bg-amber-600"
                        : "bg-indigo-600"
                    } text-white border-0`}
                  >
                    {String(value_item).replace(/[|;]/g, "")}
                    <X
                      size={12}
                      onClick={handleClearSelection}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                // Sem seleção -> mostra input
                <Input
                  onChange={(e) => {
                    // Se quiser forçar formato COD use handleChangeInputCod
                    // Se quiser aceitar ambos no mesmo campo, use handleChangeInput
                    handleChangeInputCod(e.target.value);
                  }}
                  type="text"
                  ref={inputRef}
                  value={input}
                  autoFocus={true}
                  className="border-0 w-full bg-transparent max-h-[40px] h-[40px] flex-1 p-0 inline-block"
                />
              )}
            </div>
          </div>

          <div className="w-fit flex gap-2">
            {value_item && (
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={handleClearSelection}
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
                  <p className="uppercase font-medium text-xs mb-3">
                    Código ATM
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {filteredItems
                      .filter(isAtm)
                      .slice(0, 15)
                      .map((props, index) => (
                        <div
                          key={index}
                          onClick={() =>
                            handlePesquisa(props.bem_num_atm, "atm")
                          }
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
