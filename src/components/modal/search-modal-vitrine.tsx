import { Dialog, DialogContent } from "../ui/dialog";
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { MagnifyingGlass, X } from "phosphor-react";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/context";
import { useModal } from "../hooks/use-modal-store";

/* ========= Tipos ========= */
type SearchItem =
  | { kind: "cod"; bem_cod: string; bem_dgv: string }
  | { kind: "atm"; bem_num_atm: string }
  | { kind: "material"; id: string; material_code: string; material_name: string }
  | { kind: "guardian"; id: string; legal_guardians_code: string; legal_guardians_name: string };

type Kind = "cod" | "atm" | "material" | "guardian";
type Picked = { kind: Kind; id?: string; label: string; payload?: any };

const isCod = (i: SearchItem): i is Extract<SearchItem, { kind: "cod" }> => i.kind === "cod";
const isAtm = (i: SearchItem): i is Extract<SearchItem, { kind: "atm" }> => i.kind === "atm";
const isMaterial = (i: SearchItem): i is Extract<SearchItem, { kind: "material" }> => i.kind === "material";
const isGuardian = (i: SearchItem): i is Extract<SearchItem, { kind: "guardian" }> => i.kind === "guardian";

/* ========= Helpers ========= */
const useQuery = () => new URLSearchParams(useLocation().search);

const norm = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function buildUrl(base: string, params: Record<string, string | undefined>) {
  const url = new URL(base, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  });
  return url.toString();
}

/* ========= Cores por tipo (chip + botão pesquisar) ========= */
const KIND_BG: Record<Kind, string> = {
  cod: "bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700",
  atm: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700",
  material: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700",
  guardian: "bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700",
};

export function SearchModalVitrine() {
  const navigate = useNavigate();
  const query = useQuery();
  const { onClose, isOpen, type, data } = useModal();
  const isModalOpen = isOpen && type === "search-vitrine";

  const { urlGeral, user } = useContext(UserContext);
  const API_ASSETS = `${String(urlGeral).replace(/\/$/, "")}/assets/search`;
  const API_CATALOG = `${String(urlGeral).replace(/\/$/, "")}/catalog/search`;

  // filtros vindos do modal (se existirem) — preservamos no apply()
  const workflow_status = (data?.workflow_status ?? "").toString() || undefined;
  const user_id = (user?.id ?? "").toString() || undefined;

  // barra (igual ao primeiro: 1 input, 1 picked)
  const [input, setInput] = useState("");
  const [picked, setPicked] = useState<Picked | null>(null);

  // resultados + loading
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  // input focus ao abrir
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isModalOpen && inputRef.current) inputRef.current.focus();
  }, [isModalOpen]);

  /* ========= Fetch básico ========= */
  async function fetchJson<T>(fullUrl: string): Promise<T | null> {
    try {
      const res = await fetch(fullUrl, { headers: { Accept: "application/json" } });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }

  /* ========= Endpoints ========= */
  async function searchAssetIdentifier(q: string): Promise<SearchItem[]> {
    const clean = q.replace(/-/g, "");
    const fullUrl = buildUrl(`${API_ASSETS}/asset-identifier`, { q: clean, workflow_status, user_id });
    const data = await fetchJson<{ asset_identifier?: string[] }>(fullUrl);
    const ids = Array.isArray(data?.asset_identifier) ? data!.asset_identifier : [];
    return ids.map((id) => {
      const [bem_cod, bem_dgv = ""] = String(id).split("-");
      return { kind: "cod", bem_cod: String(bem_cod), bem_dgv: String(bem_dgv) };
    });
  }

  async function searchAtmNumber(q: string): Promise<SearchItem[]> {
    const clean = q.replace(/-/g, "");
    const fullUrl = buildUrl(`${API_ASSETS}/atm-number`, { q: clean, workflow_status, user_id });
    const data = await fetchJson<{ atm_number?: string[] }>(fullUrl);
    const nums = Array.isArray(data?.atm_number) ? data!.atm_number : [];
    return nums.map((atm) => ({ kind: "atm", bem_num_atm: String(atm) }));
  }

  async function searchMaterials(q: string): Promise<SearchItem[]> {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    const fullUrl = buildUrl(`${API_CATALOG}/materials`, { q, workflow_status, user_id });
    const data = await fetchJson<{ materials?: Array<{ id: string; material_code: string; material_name: string }> }>(fullUrl);
    const arr = Array.isArray(data?.materials) ? data!.materials : [];
    return arr.map((m) => ({
      kind: "material",
      id: String(m.id),
      material_code: String(m.material_code),
      material_name: String(m.material_name),
    }));
  }

  async function searchGuardians(q: string): Promise<SearchItem[]> {
    const fullUrl = buildUrl(`${API_CATALOG}/legal_guardians`, { q, workflow_status, user_id });
    const data = await fetchJson<{
      legal_guardians?: Array<{ id: string; legal_guardians_code: string; legal_guardians_name: string }>;
    }>(fullUrl);
    const arr = Array.isArray(data?.legal_guardians) ? data!.legal_guardians : [];
    return arr.map((g) => ({
      kind: "guardian",
      id: String(g.id),
      legal_guardians_code: String(g.legal_guardians_code),
      legal_guardians_name: String(g.legal_guardians_name),
    }));
  }

  /* ========= Busca unificada (como no modelo: sugestões com 3+ letras) ========= */
  const term = norm(input);
  const showSuggestions = term.length >= 3;

  useEffect(() => {
    let active = true;

    async function run() {
      if (!showSuggestions) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const [cods, atms, mats, guards] = await Promise.all([
          searchAssetIdentifier(term),
          searchAtmNumber(term),
          searchMaterials(term),
          searchGuardians(term),
        ]);

        if (!active) return;

        const uniq = new Map<string, SearchItem>();
        [...cods, ...atms, ...mats, ...guards].forEach((it) => {
          let key = "";
          if (isCod(it)) key = `cod:${it.bem_cod}-${it.bem_dgv}`;
          else if (isAtm(it)) key = `atm:${it.bem_num_atm}`;
          else if (isMaterial(it)) key = `mat:${it.id}`;
          else if (isGuardian(it)) key = `guard:${it.id}`;
          if (key && !uniq.has(key)) uniq.set(key, it);
        });

        setResults(Array.from(uniq.values()));
      } finally {
        if (active) setLoading(false);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [showSuggestions, term, API_ASSETS, API_CATALOG, workflow_status, user_id]);

  /* ========= Agrupamento para render ========= */
  const groups = useMemo(() => {
    return {
      cods: results.filter(isCod).slice(0, 30),
      atms: results.filter(isAtm).slice(0, 30),
      materials: results.filter(isMaterial).slice(0, 30),
      guardians: results.filter(isGuardian).slice(0, 30),
    };
  }, [results]);

  /* ========= Seleção (apenas 1, como no primeiro) ========= */
  const choose = (k: Kind, item: SearchItem) => {
    if (k === "cod" && isCod(item)) {
      setPicked({ kind: "cod", label: `${item.bem_cod}-${item.bem_dgv}`, payload: { bem_cod: item.bem_cod, bem_dgv: item.bem_dgv } });
    } else if (k === "atm" && isAtm(item)) {
      setPicked({ kind: "atm", label: item.bem_num_atm, payload: { bem_num_atm: item.bem_num_atm } });
    } else if (k === "material" && isMaterial(item)) {
      setPicked({ kind: "material", id: item.id, label: `${item.material_code} • ${item.material_name}` });
    } else if (k === "guardian" && isGuardian(item)) {
      setPicked({ kind: "guardian", id: item.id, label: `${item.legal_guardians_code} • ${item.legal_guardians_name}` });
    }
    setInput("");
  };

  const clearPicked = () => setPicked(null);

  /* ========= Aplicar (modelo do primeiro: grava só o tipo selecionado) ========= */
  const location = useLocation();
  const apply = () => {
    const sp = new URLSearchParams(location.search);

    // limpa equivalentes
    sp.delete("cod");
    sp.delete("atm");
    sp.delete("material_id");
    sp.delete("legal_guardian_id");

    if (picked) {
      if (picked.kind === "cod" && picked.payload) {
        const label = `${picked.payload.bem_cod}-${picked.payload.bem_dgv}`;
        sp.set("cod", label);
      } else if (picked.kind === "atm" && picked.payload) {
        sp.set("atm", picked.payload.bem_num_atm);
      } else if (picked.kind === "material" && picked.id) {
        sp.set("material_id", picked.id);
      } else if (picked.kind === "guardian" && picked.id) {
        sp.set("legal_guardian_id", picked.id);
      }
      sp.set("offset", "0");
    }

    // preserva filtros vindos do modal
    if (workflow_status) sp.set("workflow_status", workflow_status);
    if (user_id) sp.set("user_id", user_id);

    navigate({ pathname: location.pathname, search: sp.toString() });
    onClose();
  };

  // teclado
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") apply();
  };

  const btnColor = picked ? KIND_BG[picked.kind] : "bg-eng-blue hover:bg-eng-dark-blue dark:bg-eng-blue dark:hover:bg-eng-dark-blue";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent onKeyDown={onKeyDown} className="p-0 border-none min-w-[63vw] px-4 mx-auto md:px-0 bg-transparent dark:bg-transparent">
        {/* Barra (igual ao primeiro) */}
        <Alert className="h-14 bg-white p-2 min-w-[40%] flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2 w-full flex-1">
            <div className="flex gap-2 w-full items-center">
              <div className="flex flex-1 w-full">
                <ScrollArea className="max-h-[40px] w-full">
                  <div className="flex whitespace-nowrap gap-2 items-center">
                    {picked && (
                      <div className={`flex gap-2 items-center h-10 p-2 px-4 rounded-md text-xs text-white ${KIND_BG[picked.kind]}`}>
                        {picked.label}
                        <X size={12} onClick={clearPicked} className="cursor-pointer" />
                      </div>
                    )}
                    <Input
                      ref={inputRef}
                      value={input}
                      maxLength={20}
                      onChange={(e) => setInput(e.target.value)}
                      type="text"
                      placeholder="Busque por Código-Dígito, ATM, Material ou Responsável"
                      className="border-0 w-full bg-transparent max-h-[40px] h-[40px] flex-1 p-0 inline-block"
                    />
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </div>
          </div>

          <div className="w-fit flex gap-2">
            {picked && (
              <Button size={"icon"} variant={"ghost"} onClick={clearPicked}>
                <X size={16} />
              </Button>
            )}
            <Button onClick={apply} variant="outline" className={`${btnColor} hover:text-white text-white border-0`} size={"icon"}>
              <MagnifyingGlass size={16} />
            </Button>
          </div>
        </Alert>

        {/* Sugestões – como no primeiro: só quando 3+ letras */}
        {showSuggestions && (
          <Alert className="w-full border-t-0">
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 2, 1200: 3 }}>
              <Masonry className="max-h-[70vh] md:overflow-y-auto overflow-y-scroll" gutter="20px">
                {/* Identificador */}
                {groups.cods.length > 0 && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">Identificador (código–dígito)</p>
                    <div className="flex flex-wrap gap-3">
                      {groups.cods.map((it, idx) => {
                        const label = `${it.bem_cod}-${it.bem_dgv}`;
                        return (
                          <div
                            key={`cod-${label}-${idx}`}
                            onClick={() => choose("cod", it)}
                            className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ATM */}
                {groups.atms.length > 0 && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">Código ATM</p>
                    <div className="flex flex-wrap gap-3">
                      {groups.atms.map((it, idx) => (
                        <div
                          key={`atm-${it.bem_num_atm}-${idx}`}
                          onClick={() => choose("atm", it)}
                          className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                        >
                          {it.bem_num_atm}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Materiais */}
                {groups.materials.length > 0 && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">Materiais</p>
                    <div className="flex flex-wrap gap-3">
                      {groups.materials.map((m, idx) => (
                        <div
                          key={`mat-${m.id}-${idx}`}
                          onClick={() => choose("material", m)}
                          title={`${m.material_code} • ${m.material_name}`}
                          className="flex gap-2 h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                        >
                          <span className="font-mono">{m.material_code}</span>
                          <span className="opacity-70">•</span>
                          <span className="capitalize">{m.material_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Responsáveis */}
                {groups.guardians.length > 0 && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">Responsáveis (guardiões legais)</p>
                    <div className="flex flex-wrap gap-3">
                      {groups.guardians.map((g, idx) => (
                        <div
                          key={`guard-${g.id}-${idx}`}
                          onClick={() => choose("guardian", g)}
                          title={`${g.legal_guardians_code} • ${g.legal_guardians_name}`}
                          className="flex gap-2 h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                        >
                          <span className="font-mono">{g.legal_guardians_code}</span>
                          <span className="opacity-70">•</span>
                          <span className="capitalize">{g.legal_guardians_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vazio */}
                {!loading &&
                  groups.cods.length === 0 &&
                  groups.atms.length === 0 &&
                  groups.materials.length === 0 &&
                  groups.guardians.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      Nenhuma sugestão para “<b>{input}</b>”. Digite ao menos 3 letras ou tente outro termo.
                    </div>
                  )}
              </Masonry>
            </ResponsiveMasonry>
          </Alert>
        )}

        {/* Mensagem durante busca quando há termo suficiente */}
        {showSuggestions && loading && (
          <Alert className="mt-3">
            <div className="text-sm text-neutral-600">Buscando…</div>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
