import { Dialog, DialogContent } from "../ui/dialog";
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { MagnifyingGlass, X } from "phosphor-react";
import { Play, Trash } from "lucide-react";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../context/context";
import { useModal } from "../hooks/use-modal-store";
import { useLocation } from "react-router-dom";

// ========= Tipos =========
type Kind = "cod" | "atm";
type Picked = { kind: Kind; id: string; label: string };

// Helpers
const normalize = (v: string) =>
  String(v || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9-\s]/g, "")
    .trim();

// cores por tipo (chip + botão pesquisar)
const KIND_BG: Record<Kind, string> = {
  cod: "bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700",
  atm: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700",
};

export const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

export function SearchModalPatrimonio() {
  const { urlGeral } = useContext(UserContext);
  const baseUrl = useMemo(() => (urlGeral || "").replace(/\/+$/, ""), [urlGeral]);

  const { onClose, onOpen, isOpen, type, data } = useModal();
  const isModalOpen = isOpen && type === "search-patrimonio";

  // barra
  const [input, setInput] = useState("");
  const term = normalize(input);
  // apenas UM item selecionado (cod ou atm)
  const [picked, setPicked] = useState<Picked | null>(null);

  // resultados
  const [codList, setCodList] = useState<string[]>([]);
  const [atmList, setAtmList] = useState<string[]>([]);

  // headers (JWT opcional)
  const token = localStorage.getItem("jwt_token") || "";
  const baseHeaders: HeadersInit = useMemo(() => {
    const h: Record<string, string> = { Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  // ======= API helpers =======
  const API_BASE = `${baseUrl}/assets/search`;

  async function fetchArrayByKey(url: string, key: "asset_identifier" | "atm_number"): Promise<string[]> {
    try {
      const res = await fetch(url, { headers: baseHeaders });
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

  // ======= Buscar sugestões quando digitar (>=1 char) =======
  useEffect(() => {
    let abort = false;
    (async () => {
      if (!isModalOpen) return;
      if (term.length < 1) {
        setCodList([]);
        setAtmList([]);
        return;
      }
      const [cods, atms] = await Promise.all([searchAssetIdentifier(term), searchAtmNumber(term)]);
      if (!abort) {
        setCodList(cods.slice(0, 30));
        setAtmList(atms.slice(0, 30));
      }
    })();
    return () => {
      abort = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, isModalOpen]);

  // ======= Hidratar seleção inicial a partir de data do modal (se vier pré-carregado) =======
  useEffect(() => {
    if (!isModalOpen) return;
    // Se vierem campos no data, prioriza COD > ATM
    const preCod = String((data as any)?.asset_code || "");
    const preDgv = String((data as any)?.asset_check_digit || "");
    const preAtm = String((data as any)?.atm_number || "");

    if (preCod) {
      const label = preDgv ? `${preCod}-${preDgv}` : preCod;
      setPicked({ kind: "cod", id: label, label });
      setInput("");
      return;
    }
    if (preAtm) {
      setPicked({ kind: "atm", id: preAtm, label: preAtm });
      setInput("");
      return;
    }
    setPicked(null);
  }, [isModalOpen, data]);

  // ======= Selecionar item =======
  const choose = (k: Kind, value: string) => {
    const label = value;
    setPicked({ kind: k, id: value, label });
    setInput("");
  };

  // ======= Aplicar no data do modal (Zustand) =======
  const apply = () => {
    // Mescla no data atual e fecha
    if (picked) {
      if (picked.kind === "cod") {
        const [asset_code, asset_check_digit = ""] = String(picked.id).split("-");
        onOpen("search-patrimonio", {
          ...(data || {}),
          asset_code,
          asset_check_digit,
          atm_number: undefined, // limpa outro campo
        });
      } else {
        onOpen("search-patrimonio", {
          ...(data || {}),
          atm_number: picked.id,
          asset_code: undefined,
          asset_check_digit: undefined,
        });
      }
    }
    onClose();
  };

  const clearPicked = () => setPicked(null);

  // teclado
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isModalOpen && inputRef.current) inputRef.current.focus();
  }, [isModalOpen]);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") apply();
  };

  const btnColor = picked ? KIND_BG[picked.kind] : "bg-eng-blue hover:bg-eng-dark-blue dark:bg-eng-blue dark:hover:bg-eng-dark-blue";
  const showSuggestions = normalize(input).length >= 1;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent onKeyDown={onKeyDown} className="p-0 border-none min-w-[63vw] px-4 mx-auto md:px-0 bg-transparent dark:bg-transparent">
        {/* Barra */}
        <Alert className="h-14 bg-white p-2 min-w-[40%] flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2 w-full flex-1">
            <Play size={16} className="hidden md:block whitespace-nowrap w-10" />
            <div className="flex gap-2 w-full items-center">
              <div className="flex flex-1 w-full">
                <ScrollArea className="max-h-[40px] w-full">
                  <div className="flex whitespace-nowrap gap-2 items-center">
                    {picked && (
                      <div
                        className={`flex gap-2 items-center h-10 p-2 px-4 rounded-md text-xs text-white ${
                          KIND_BG[picked.kind]
                        }`}
                      >
                        {picked.label}
                        <X size={12} onClick={clearPicked} className="cursor-pointer" />
                      </div>
                    )}

                    {!picked && (
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        type="text"

                        className="border-0 w-full bg-transparent max-h-[40px] h-[40px] flex-1 p-0 inline-block"
                      />
                    )}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </div>
          </div>

          <div className="w-fit flex gap-2">
            {picked && (
              <Button size={"icon"} variant={"ghost"} onClick={clearPicked}>
                <Trash size={16} />
              </Button>
            )}
            <Button onClick={apply} variant="outline" className={`${btnColor} hover:text-white text-white border-0`} size={"icon"}>
              <MagnifyingGlass size={16} />
            </Button>
          </div>
        </Alert>

        {/* Sugestões – a partir de 1+ caractere */}
        {showSuggestions && (codList.length > 0 || atmList.length > 0) && (
          <Alert className="w-full border-t-0">
          <div className="max-h-[70vh] gap-8 grid md:overflow-y-auto overflow-y-scroll">
                {codList.length > 0 && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">Identificador (código-dígito)</p>
                    <div className="flex flex-wrap gap-3">
                      {codList.slice(0, 30).map((v) => (
                        <div
                          key={v}
                          onClick={() => choose("cod", v)}
                          className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {atmList.length > 0 && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">Código ATM</p>
                    <div className="flex flex-wrap gap-3">
                      {atmList.slice(0, 30).map((v) => (
                        <div
                          key={v}
                          onClick={() => choose("atm", v)}
                          className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
          </Alert>
        )}

        {/* Vazio */}
        {showSuggestions && codList.length === 0 && atmList.length === 0 && (
          <Alert className="w-full border-t-0">
            <div className="text-sm text-muted-foreground">
              Nenhuma sugestão para “<b>{input}</b>”. Digite o identificador (ex.: 12345-6) ou o código ATM.
            </div>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
