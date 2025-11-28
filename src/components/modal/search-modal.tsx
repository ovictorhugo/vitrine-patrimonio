import { Dialog, DialogContent } from "../ui/dialog";
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { MagnifyingGlass, X } from "phosphor-react";
import { Play, Trash } from "lucide-react";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/context";
import { useModal } from "../hooks/use-modal-store";

type Material = { id: string; material_name: string; material_code: string };
type LegalGuardian = {
  id: string;
  legal_guardians_name: string;
  legal_guardians_code: string;
};
type LocationT = { id: string; location_name: string; location_code: string };
type Unit = { id: string; unit_name: string; unit_code: string };
type Agency = { id: string; agency_name: string; agency_code: string };
type Sector = { id: string; sector_name: string; sector_code: string };

type Picked = { kind: Kind; id: string; label: string };

const useQuery = () => new URLSearchParams(useLocation().search);

const norm = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// cores por tipo (chip + botão pesquisar)
type Kind = "material" | "guardian" | "location" | "unit" | "agency" | "sector";

export const KIND_BG: Record<Kind, string> = {
  material:
    "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
  guardian:
    "bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700",
  location:
    "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700",
  unit: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700",
  agency:
    "bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700",
  sector:
    "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700",
};

export function SearchModal() {
  const { urlGeral } = useContext(UserContext);
  const baseUrl = useMemo(
    () => (urlGeral || "").replace(/\/+$/, ""),
    [urlGeral]
  );
  const { onClose, isOpen, type } = useModal();
  const navigate = useNavigate();
  const queryUrl = useQuery();
  const location = useLocation();

  // listas
  const [materials, setMaterials] = useState<Material[]>([]);
  const [guardians, setGuardians] = useState<LegalGuardian[]>([]);
  const [locations, setLocations] = useState<LocationT[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);

  const token = localStorage.getItem("jwt_token") || "";
  const baseHeaders: HeadersInit = useMemo(() => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  // barra
  const [input, setInput] = useState("");
  // apenas UM item selecionado (de um ÚNICO tipo)
  const [picked, setPicked] = useState<Picked | null>(null);

  // carregar listas e hidratar seleção a partir da URL (pega o primeiro que encontrar na ordem abaixo)
  useEffect(() => {
    (async () => {
      try {
        const [mres, gres, lres, ures, ares, sres] = await Promise.all([
          fetch(`${baseUrl}/catalog/search/materials`, {
            headers: baseHeaders,
          }).then((r) => r.json()),
          fetch(`${baseUrl}/legal-guardians/`, { headers: baseHeaders }).then(
            (r) => r.json()
          ),
          fetch(`${baseUrl}/locations/`, { headers: baseHeaders }).then((r) =>
            r.json()
          ),
          fetch(`${baseUrl}/units/`, { headers: baseHeaders }).then((r) =>
            r.json()
          ),
          fetch(`${baseUrl}/agencies/`, { headers: baseHeaders }).then((r) =>
            r.json()
          ),
          fetch(`${baseUrl}/sectors/`, { headers: baseHeaders }).then((r) =>
            r.json()
          ),
        ]);

        const _materials: Material[] = Array.isArray(mres?.materials)
          ? mres.materials
          : Array.isArray(mres)
          ? mres
          : [];
        const _guards: LegalGuardian[] = Array.isArray(gres?.legal_guardians)
          ? gres.legal_guardians
          : Array.isArray(gres)
          ? gres
          : [];
        const _locs: LocationT[] = Array.isArray(lres?.locations)
          ? lres.locations
          : Array.isArray(lres)
          ? lres
          : [];
        const _units: Unit[] = Array.isArray(ures?.units)
          ? ures.units
          : Array.isArray(ures)
          ? ures
          : [];
        const _agencies: Agency[] = Array.isArray(ares?.agencies)
          ? ares.agencies
          : Array.isArray(ares)
          ? ares
          : [];
        const _sectors: Sector[] = Array.isArray(sres?.sectors)
          ? sres.sectors
          : Array.isArray(sres)
          ? sres
          : [];

        setMaterials(_materials);
        setGuardians(_guards);
        setLocations(_locs);
        setUnits(_units);
        setAgencies(_agencies);
        setSectors(_sectors);

        const first = (arr: string[]) => arr.filter(Boolean)[0];

        const fromUrl =
          first((queryUrl.get("material_ids") || "").split(";")) ||
          first((queryUrl.get("legal_guardian_ids") || "").split(";")) ||
          first((queryUrl.get("location_ids") || "").split(";")) ||
          first((queryUrl.get("unit_ids") || "").split(";")) ||
          first((queryUrl.get("agency_ids") || "").split(";")) ||
          first((queryUrl.get("sector_ids") || "").split(";"));

        if (fromUrl) {
          const m = _materials.find((x) => x.id === fromUrl);
          if (m)
            return setPicked({
              kind: "material",
              id: m.id,
              label: m.material_name,
            });
          const g = _guards.find((x) => x.id === fromUrl);
          if (g)
            return setPicked({
              kind: "guardian",
              id: g.id,
              label: g.legal_guardians_name,
            });
          const l = _locs.find((x) => x.id === fromUrl);
          if (l)
            return setPicked({
              kind: "location",
              id: l.id,
              label: l.location_name,
            });
          const u = _units.find((x) => x.id === fromUrl);
          if (u)
            return setPicked({ kind: "unit", id: u.id, label: u.unit_name });
          const a = _agencies.find((x) => x.id === fromUrl);
          if (a)
            return setPicked({
              kind: "agency",
              id: a.id,
              label: a.agency_name,
            });
          const s = _sectors.find((x) => x.id === fromUrl);
          if (s)
            return setPicked({
              kind: "sector",
              id: s.id,
              label: s.sector_name,
            });
        }
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  // refletir mudanças externas na URL (caso outro lugar aplique)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const first = (key: string) =>
      (sp.get(key) || "").split(";").filter(Boolean)[0];

    const trySet = <T,>(
      id: string | undefined,
      list: T[],
      get: (t: T) => { id: string; label: string },
      kind: Kind
    ) => {
      if (!id) return false;
      const found = (list as any[]).find((x) => (x as any).id === id);
      if (found) {
        const v = get(found);
        setPicked({ kind, id: v.id, label: v.label });
        return true;
      }
      return false;
    };

    const mid = first("material_ids");
    const gid = first("legal_guardian_ids");
    const lid = first("location_ids");
    const uid = first("unit_ids");
    const aid = first("agency_ids");
    const sid = first("sector_ids");

    if (
      trySet(
        mid,
        materials,
        (m: any) => ({ id: m.id, label: m.material_name }),
        "material"
      )
    )
      return;
    if (
      trySet(
        gid,
        guardians,
        (g: any) => ({ id: g.id, label: g.legal_guardians_name }),
        "guardian"
      )
    )
      return;
    if (
      trySet(
        lid,
        locations,
        (l: any) => ({ id: l.id, label: l.location_name }),
        "location"
      )
    )
      return;
    if (
      trySet(uid, units, (u: any) => ({ id: u.id, label: u.unit_name }), "unit")
    )
      return;
    if (
      trySet(
        aid,
        agencies,
        (a: any) => ({ id: a.id, label: a.agency_name }),
        "agency"
      )
    )
      return;
    if (
      trySet(
        sid,
        sectors,
        (s: any) => ({ id: s.id, label: s.sector_name }),
        "sector"
      )
    )
      return;

    // se nada na URL, zera
    setPicked(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    location.search,
    materials,
    guardians,
    locations,
    units,
    agencies,
    sectors,
  ]);

  // sugestões (somente com 3+ letras)
  const term = norm(input);
  const showSuggestions = term.length >= 3;

  const matsView = useMemo(
    () =>
      showSuggestions
        ? materials
            .filter(
              (m) =>
                norm(m.material_name).includes(term) ||
                norm(m.material_code).includes(term)
            )
            .slice(0, 30)
        : [],
    [materials, term, showSuggestions]
  );
  const guardsView = useMemo(
    () =>
      showSuggestions
        ? guardians
            .filter(
              (g) =>
                norm(g.legal_guardians_name).includes(term) ||
                norm(g.legal_guardians_code).includes(term)
            )
            .slice(0, 30)
        : [],
    [guardians, term, showSuggestions]
  );
  const locsView = useMemo(
    () =>
      showSuggestions
        ? locations
            .filter(
              (l) =>
                norm(l.location_name).includes(term) ||
                norm(l.location_code).includes(term)
            )
            .slice(0, 30)
        : [],
    [locations, term, showSuggestions]
  );
  const unitsView = useMemo(
    () =>
      showSuggestions
        ? units
            .filter(
              (u) =>
                norm(u.unit_name).includes(term) ||
                norm(u.unit_code).includes(term)
            )
            .slice(0, 30)
        : [],
    [units, term, showSuggestions]
  );
  const agenciesView = useMemo(
    () =>
      showSuggestions
        ? agencies
            .filter(
              (a) =>
                norm(a.agency_name).includes(term) ||
                norm(a.agency_code).includes(term)
            )
            .slice(0, 30)
        : [],
    [agencies, term, showSuggestions]
  );
  const sectorsView = useMemo(
    () =>
      showSuggestions
        ? sectors
            .filter(
              (s) =>
                norm(s.sector_name).includes(term) ||
                norm(s.sector_code).includes(term)
            )
            .slice(0, 30)
        : [],
    [sectors, term, showSuggestions]
  );

  // selecionar (troca qualquer seleção anterior — mantém sempre 1 item/1 tipo)
  const choose = (k: Kind, id: string, label: string) => {
    setPicked({ kind: k, id, label });
    setInput("");
  };

  // aplicar = escreve somente o tipo selecionado e limpa os demais
  const apply = () => {
    const sp = new URLSearchParams(location.search);
    // limpa todos
    sp.delete("material_ids");
    sp.delete("legal_guardian_ids");
    sp.delete("location_ids");
    sp.delete("unit_ids");
    sp.delete("agency_ids");
    sp.delete("sector_ids");

    if (picked) {
      const param =
        picked.kind === "material"
          ? "material_ids"
          : picked.kind === "guardian"
          ? "legal_guardian_ids"
          : picked.kind === "location"
          ? "location_ids"
          : picked.kind === "unit"
          ? "unit_ids"
          : picked.kind === "agency"
          ? "agency_ids"
          : "sector_ids";
      sp.set(param, picked.id);
      sp.set("offset", "0");
    }

    navigate({ pathname: location.pathname, search: sp.toString() });
    onClose();
  };

  // limpar seleção (não altera URL até aplicar)
  const clearPicked = () => setPicked(null);

  // teclado
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") apply();
  };

  const isModalOpen = isOpen && type === "search";
  const btnColor = picked
    ? KIND_BG[picked.kind]
    : "bg-eng-blue hover:bg-eng-dark-blue dark:bg-eng-blue dark:hover:bg-eng-dark-blue";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent
        onKeyDown={onKeyDown}
        className="p-0 border-none min-w-[63vw] px-4 mx-auto md:px-0 bg-transparent dark:bg-transparent"
      >
        {/* Barra */}
        <Alert className="h-14 bg-white p-2 min-w-[40%] flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2 w-full flex-1">
            <Play
              size={16}
              className="hidden md:block whitespace-nowrap w-10"
            />
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
                        <X
                          size={12}
                          onClick={clearPicked}
                          className="cursor-pointer"
                        />
                      </div>
                    )}
                    <Input
                      ref={inputRef}
                      value={input}
                      maxLength={20}
                      onChange={(e) => setInput(e.target.value)}
                      type="text"
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
                <Trash size={16} />
              </Button>
            )}
            <Button
              onClick={apply}
              variant="outline"
              className={`${btnColor} hover:text-white text-white border-0`}
              size={"icon"}
            >
              <MagnifyingGlass size={16} />
            </Button>
          </div>
        </Alert>

        {/* Sugestões – só quando 3+ letras */}
        {showSuggestions && (
          <Alert className="w-full border-t-0">
            <ResponsiveMasonry
              columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 2, 1200: 3 }}
            >
              <Masonry
                className="max-h-[70vh] md:overflow-y-auto overflow-y-scroll"
                gutter="20px"
              >
                {matsView.length > 0 && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">
                      Materiais
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {matsView.map((m) => (
                        <div
                          key={m.id}
                          onClick={() =>
                            choose("material", m.id, m.material_name)
                          }
                          className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                        >
                          {m.material_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {guardsView.length > 0 && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">
                      Responsáveis
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {guardsView.map((g) => (
                        <div
                          key={g.id}
                          onClick={() =>
                            choose("guardian", g.id, g.legal_guardians_name)
                          }
                          className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                        >
                          {g.legal_guardians_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {locsView.length > 0 && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">Locais</p>
                    <div className="flex flex-wrap gap-3">
                      {locsView.map((l) => (
                        <div
                          key={l.id}
                          onClick={() =>
                            choose("location", l.id, l.location_name)
                          }
                          className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                        >
                          {l.location_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {unitsView.length > 0 && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">
                      Unidades
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {unitsView.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => choose("unit", u.id, u.unit_name)}
                          className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                        >
                          {u.unit_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {agenciesView.length > 0 && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">
                      Organizações
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {agenciesView.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => choose("agency", a.id, a.agency_name)}
                          className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                        >
                          {a.agency_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sectorsView.length > 0 && (
                  <div>
                    <p className="uppercase font-medium text-xs mb-3">
                      Setores
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {sectorsView.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => choose("sector", s.id, s.sector_name)}
                          className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                        >
                          {s.sector_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vazio */}
                {matsView.length === 0 &&
                  guardsView.length === 0 &&
                  locsView.length === 0 &&
                  unitsView.length === 0 &&
                  agenciesView.length === 0 &&
                  sectorsView.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      Nenhuma sugestão para “<b>{input}</b>”. Digite ao menos 3
                      letras ou tente outro termo.
                    </div>
                  )}
              </Masonry>
            </ResponsiveMasonry>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
