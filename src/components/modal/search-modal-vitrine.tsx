import { Funnel, MagnifyingGlass } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Input } from "../ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../context/context";
import { X } from "lucide-react";

/* ========= Tipos ========= */
type SearchItem =
  | { kind: "cod"; bem_cod: string; bem_dgv: string }
  | { kind: "atm"; bem_num_atm: string }
  | { kind: "material"; id: string; material_code: string; material_name: string }
  | { kind: "guardian"; id: string; legal_guardians_code: string; legal_guardians_name: string };

type ChipItem = {
  term: string; // rótulo exibido no chip
  type: "cod" | "atm" | "material" | "legal_guardian";
  id?: string; // para material/legal_guardian
};

const isCod = (i: SearchItem): i is Extract<SearchItem, { kind: "cod" }> => i.kind === "cod";
const isAtm = (i: SearchItem): i is Extract<SearchItem, { kind: "atm" }> => i.kind === "atm";
const isMaterial = (i: SearchItem): i is Extract<SearchItem, { kind: "material" }> => i.kind === "material";
const isGuardian = (i: SearchItem): i is Extract<SearchItem, { kind: "guardian" }> => i.kind === "guardian";

/* ========= Helpers ========= */
const useQuery = () => new URLSearchParams(useLocation().search);

const normalizeInput = (value: string): string => {
  let v = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  v = v.replace(/[^A-Za-z0-9\s-]/g, "");
  return v;
};

function buildUrl(base: string, params: Record<string, string | undefined>) {
  const url = new URL(base, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  });
  return url.toString();
}

export function SearchModalVitrine() {
  const navigate = useNavigate();
  const query = useQuery();
  const { onClose, isOpen, type, data } = useModal();
  const isModalOpen = isOpen && type === "search-vitrine";

  const { urlGeral } = useContext(UserContext);
  const API_ASSETS = `${String(urlGeral).replace(/\/$/, "")}/assets/search`;
  const API_CATALOG = `${String(urlGeral).replace(/\/$/, "")}/catalog/search`;

  // filtros vindos do modal (se existirem)
  const workflow_status = (data?.workflow_status ?? "").toString() || undefined;
  const user_id = (data?.user_id ?? "").toString() || undefined;

  const [input, setInput] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  // múltipla seleção de chips
  const [itemsSelecionadosPopUp, setItensSelecionadosPopUp] = useState<ChipItem[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  /* ========= Fetch genérico ========= */
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
    const fullUrl = buildUrl(`${API_ASSETS}/asset-identifier`, {
      q: clean,
      workflow_status,
      user_id,
    });
    const data = await fetchJson<{ asset_identifier?: string[] }>(fullUrl);
    const ids = Array.isArray(data?.asset_identifier) ? data!.asset_identifier : [];
    return ids.map((id) => {
      const [bem_cod, bem_dgv = ""] = String(id).split("-");
      return { kind: "cod", bem_cod: String(bem_cod), bem_dgv: String(bem_dgv) };
    });
  }

  async function searchAtmNumber(q: string): Promise<SearchItem[]> {
    const clean = q.replace(/-/g, "");
    const fullUrl = buildUrl(`${API_ASSETS}/atm-number`, {
      q: clean,
      workflow_status,
      user_id,
    });
    const data = await fetchJson<{ atm_number?: string[] }>(fullUrl);
    const nums = Array.isArray(data?.atm_number) ? data!.atm_number : [];
    return nums.map((atm) => ({ kind: "atm", bem_num_atm: String(atm) }));
  }

  async function searchMaterials(q: string): Promise<SearchItem[]> {
    const fullUrl = buildUrl(`${API_CATALOG}/materials`, {
      q,
      workflow_status,
      user_id,
    });
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
    const fullUrl = buildUrl(`${API_CATALOG}/legal_guardians`, {
      q,
      workflow_status,
      user_id,
    });
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

  /* ========= Busca unificada ========= */
  useEffect(() => {
    let active = true;

    async function run() {
      const q = normalizeInput(input).trim();
      if (q.length < 1) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const [cods, atms, mats, guards] = await Promise.all([
          searchAssetIdentifier(q),
          searchAtmNumber(q),
          searchMaterials(q),
          searchGuardians(q),
        ]);

        if (!active) return;

        // De-duplica por chave composta
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
  }, [input, API_ASSETS, API_CATALOG, workflow_status, user_id]);

  /* ========= Agrupamento ========= */
  const groups = useMemo(() => {
    return {
      cods: results.filter(isCod).slice(0, 30),
      atms: results.filter(isAtm).slice(0, 30),
      materials: results.filter(isMaterial).slice(0, 30),
      guardians: results.filter(isGuardian).slice(0, 30),
    };
  }, [results]);

  /* ========= Seleção (chips) ========= */
  const handleAddItem = (item: SearchItem) => {
    // Evita duplicar o MESMO item (por rótulo) no array
    if (isCod(item)) {
      const label = `${item.bem_cod}-${item.bem_dgv}`;
      setItensSelecionadosPopUp((prev) =>
        prev.some((p) => p.type === "cod" && p.term === label) ? prev : [...prev, { term: label, type: "cod" }]
      );
    } else if (isAtm(item)) {
      const label = item.bem_num_atm;
      setItensSelecionadosPopUp((prev) =>
        prev.some((p) => p.type === "atm" && p.term === label) ? prev : [...prev, { term: label, type: "atm" }]
      );
    } else if (isMaterial(item)) {
      const label = `${item.material_code} • ${item.material_name}`;
      setItensSelecionadosPopUp((prev) =>
        prev.some((p) => p.type === "material" && p.id === item.id)
          ? prev
          : [...prev, { term: label, type: "material", id: item.id }]
      );
    } else if (isGuardian(item)) {
      const label = `${item.legal_guardians_code} • ${item.legal_guardians_name}`;
      setItensSelecionadosPopUp((prev) =>
        prev.some((p) => p.type === "legal_guardian" && p.id === item.id)
          ? prev
          : [...prev, { term: label, type: "legal_guardian", id: item.id }]
      );
    }
  };

  const handleRemoveItem = (index: number) => {
    setItensSelecionadosPopUp((prev) => prev.filter((_, i) => i !== index));
  };

  /* ========= Aplicar na URL (apenas no funil) ========= */
  const confirmSelection = () => {
    const params = new URLSearchParams(window.location.search);

    // Limpa todos os parâmetros de filtro que vamos setar aqui
    params.delete("cod");
    params.delete("atm");
    params.delete("material_id");
    params.delete("legal_guardian_id");

    // Por padrão, setamos no singular: o último de cada tipo "vence".
    // Se quiser múltiplos por tipo, mude para params.append(...)
    itemsSelecionadosPopUp.forEach((it) => {
      if (it.type === "cod") params.set("cod", it.term);
      if (it.type === "atm") params.set("atm", it.term);
      if (it.type === "material" && it.id) params.set("material_id", it.id);
      if (it.type === "legal_guardian" && it.id) params.set("legal_guardian_id", it.id);
    });

    // Mantém filtros vindos do modal (se existirem)
    if (workflow_status) params.set("workflow_status", workflow_status);
    if (user_id) params.set("user_id", user_id);

    navigate({ search: `?${params.toString()}` });
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none min-w-[60vw] bg-transparent dark:bg-transparent">
        {/* Barra de busca + chips + ações */}
        <Alert className="h-14 bg-white p-2 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2 w-full flex-1">
            <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />

            <div className="flex w-full whitespace-nowrap gap-2 items-center">
              {itemsSelecionadosPopUp.map((valor, index) => (
                <div key={`${valor.term}-${index}`} className="flex whitespace-nowrap gap-2 items-center">
                  <div
                    className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs ${
                      valor.type === "cod"
                        ? "bg-teal-600"
                        : valor.type === "atm"
                        ? "bg-amber-600"
                        : valor.type === "material"
                        ? "bg-indigo-600"
                        : "bg-rose-600"
                    } text-white border-0`}
                  >
                    {valor.term.replace(/[|;]/g, "")}
                    <X size={12} onClick={() => handleRemoveItem(index)} className="cursor-pointer" />
                  </div>
                </div>
              ))}

              {itemsSelecionadosPopUp.length === 0 && (
                <Input
                  onChange={(e) => setInput(e.target.value)}
                  type="text"
                  ref={inputRef}
                  value={input}
                  autoFocus
                  placeholder="Busque por Código-Dígito, ATM, Material ou Responsável"
                  className="border-0 w-full bg-transparent max-h-[40px] h-[40px] flex-1 p-0 inline-block"
                />
              )}
            </div>
          </div>

          <div className="w-fit flex gap-2">
            {itemsSelecionadosPopUp.length > 0 && (
              <Button size={"icon"} variant={"ghost"} onClick={() => setItensSelecionadosPopUp([])}>
                <X size={16} />
              </Button>
            )}

            <Button
              className="text-white border-0 z-[9999]"
              size={"icon"}
              variant="default"
              onClick={confirmSelection}
              disabled={itemsSelecionadosPopUp.length === 0}
              title={itemsSelecionadosPopUp.length === 0 ? "Selecione itens nos resultados" : "Aplicar filtros na URL"}
            >
              <Funnel size={16} />
            </Button>
          </div>
        </Alert>

        {/* Resultados */}
        {normalizeInput(input).trim().length >= 1 && (
          <div className="mt-3 space-y-6">
            {/* Loading */}
            {loading && (
              <Alert>
                <div className="text-sm text-neutral-600">Buscando…</div>
              </Alert>
            )}

            {/* Identificador */}
            {groups.cods.length > 0 && (
              <Alert>
                <div className="mb-2 uppercase font-medium text-xs">Identificador (código–dígito)</div>
                <div className="flex flex-wrap gap-3">
                  {groups.cods.map((it, idx) => {
                    const label = `${it.bem_cod}-${it.bem_dgv}`;
                    return (
                      <div
                        key={`cod-${label}-${idx}`}
                        onClick={() => handleAddItem(it)}
                        className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </Alert>
            )}

            {/* ATM */}
            {groups.atms.length > 0 && (
              <Alert>
                <div className="mb-2 uppercase font-medium text-xs">Código ATM</div>
                <div className="flex flex-wrap gap-3">
                  {groups.atms.map((it, idx) => (
                    <div
                      key={`atm-${it.bem_num_atm}-${idx}`}
                      onClick={() => handleAddItem(it)}
                      className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                    >
                      {it.bem_num_atm}
                    </div>
                  ))}
                </div>
              </Alert>
            )}

            {/* Materiais */}
            {groups.materials.length > 0 && (
              <Alert>
                <div className="mb-2 uppercase font-medium text-xs">Materiais</div>
                <div className="flex flex-wrap gap-3">
                  {groups.materials.map((m, idx) => (
                    <div
                      key={`mat-${m.id}-${idx}`}
                      onClick={() => handleAddItem(m)}
                      title={`${m.material_code} • ${m.material_name}`}
                      className="flex gap-2 h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                    >
                      <span className="font-mono">{m.material_code}</span>
                      <span className="opacity-70">•</span>
                      <span className="capitalize">{m.material_name}</span>
                    </div>
                  ))}
                </div>
              </Alert>
            )}

            {/* Responsáveis legais */}
            {groups.guardians.length > 0 && (
              <Alert>
                <div className="mb-2 uppercase font-medium text-xs">Responsáveis (guardiões legais)</div>
                <div className="flex flex-wrap gap-3">
                  {groups.guardians.map((g, idx) => (
                    <div
                      key={`guard-${g.id}-${idx}`}
                      onClick={() => handleAddItem(g)}
                      title={`${g.legal_guardians_code} • ${g.legal_guardians_name}`}
                      className="flex gap-2 h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                    >
                      <span className="font-mono">{g.legal_guardians_code}</span>
                      <span className="opacity-70">•</span>
                      <span className="capitalize">{g.legal_guardians_name}</span>
                    </div>
                  ))}
                </div>
              </Alert>
            )}

            {/* Sem resultados */}
            {!loading && results.length === 0 && (
              <Alert>
                <div className="text-sm text-neutral-600">Nenhum resultado encontrado para “{input}”.</div>
              </Alert>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
