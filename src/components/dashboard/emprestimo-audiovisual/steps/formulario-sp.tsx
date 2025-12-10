import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Label } from "../../../ui/label";
import { StepBaseProps } from "../emprestimo-audiovisual";
import { AlertCircle, ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { Input } from "../../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { User } from "phosphor-react";
import { UserContext } from "../../../../context/context";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Button } from "../../../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../ui/command";
import { cn } from "../../../../lib";

/** ================= Tipos ================= */

export interface Patrimonio {
  asset_code: string;
  asset_check_digit: string;
  atm_number: string;
  serial_number: string;
  asset_status: string;
  asset_value: string;
  asset_description: string;
  csv_code: string;
  accounting_entry_code: string;
  item_brand: string;
  item_model: string;
  group_type_code: string;
  group_code: string;
  expense_element_code: string;
  subelement_code: string;
  id: string;
  agency: { agency_name: string; agency_code: string; id: string };
  unit: { unit_name: string; unit_code: string; unit_siaf: string; id: string };
  sector: { sector_name: string; sector_code: string; id: string };
  location: { location_code: string; location_name: string; id: string };
  material: { id: string; material_code: string; material_name: string };
  legal_guardian: { id: string; legal_guardians_code: string; legal_guardians_name: string };
  is_official: boolean;
}

type Material = {
  id: string;
  material_name: string;
  material_code: string;
};

type LegalGuardian = {
  id: string;
  legal_guardians_name: string;
  legal_guardians_code: string;
};

/** objeto “em branco” seguro */
const blankPatrimonio = (): Patrimonio => ({
  asset_code: "",
  asset_check_digit: "",
  atm_number: "",
  serial_number: "",
  asset_status: "NI",
  asset_value: "",
  asset_description: "",
  csv_code: "",
  accounting_entry_code: "",
  item_brand: "",
  item_model: "",
  group_type_code: "",
  group_code: "",
  expense_element_code: "",
  subelement_code: "",
  id: "",
  agency: { agency_name: "", agency_code: "", id: "" },
  unit: { unit_name: "", unit_code: "", unit_siaf: "", id: "" },
  sector: { sector_name: "", sector_code: "", id: "" },
  location: { location_code: "", location_name: "", id: "" },
  material: { id: "", material_code: "", material_name: "" },
  legal_guardian: { id: "", legal_guardians_code: "", legal_guardians_name: "" },
  is_official: false,
});

/** ================= Utils ================= */

// código: AMDDLLNN
function gerarCodigo(): string {
  const d = new Date();
  const A = d.getFullYear().toString().slice(-1);
  const M = (d.getMonth() + 1).toString().slice(-1);
  const DD = String(d.getDate()).padStart(2, "0");
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randLetra = () => letras[Math.floor(Math.random() * letras.length)];
  const LL = randLetra() + randLetra();
  const NN = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return A + M + DD + LL + NN; // AMDDLLNN
}

// dgv simples
function gerarDgv(code: string): string {
  let sum = 0;
  for (const ch of code.toUpperCase()) {
    if (/[0-9]/.test(ch)) sum += Number(ch);
    else if (/[A-Z]/.test(ch)) sum += 10 + (ch.charCodeAt(0) - 65); // A=10 ... Z=35
  }
  return String(sum % 10);
}

/** debounce hook */
function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** ================= Componente ================= */

type Props = StepBaseProps<"formulario-sp"> & {
  initialData?: Patrimonio;
  value_item?: string;
  type?: string;
};

export function FormularioSpStep({
  value_item,
  onValidityChange,
  onStateChange,
  type,
  initialData,
  step
}: Props) {
  const { urlGeral } = useContext(UserContext);

  // estado principal
  const [data, setData] = useState<Patrimonio>(initialData ?? blankPatrimonio());

  // listas e seleção (Material/Responsável)
  const [materials, setMaterials] = useState<Material[]>([]);
  const [legalGuardians, setLegalGuardians] = useState<LegalGuardian[]>([]);
  const selectedMaterialId = data.material.id ?? "";
  const selectedGuardianId = data.legal_guardian.id ?? "";

  // termos de busca
  const [materialQ, setMaterialQ] = useState("");
  const [guardianQ, setGuardianQ] = useState("");
  const materialQd = useDebounced(materialQ, 300);
  const guardianQd = useDebounced(guardianQ, 300);

  // loading
  const [loading, setLoading] = useState({
    materials: false,
    guardians: false,
  });

  // proteção contra respostas fora de ordem
  const materialReqIdRef = useRef(0);
  const guardianReqIdRef = useRef(0);

  /** ---------- Inicializações (NI + geração de código/DGV) ---------- */
  useEffect(() => {
    setData((prev) => {
      const next = { ...prev };
      if (next.asset_status !== "NI") next.asset_status = "NI";
      if (!next.asset_code) next.asset_code = gerarCodigo();
      if (!next.asset_check_digit) next.asset_check_digit = gerarDgv(next.asset_code);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ---------- Validação + Propagação ---------- */
  useEffect(() => {
    const ok =
      (data.asset_description?.trim()?.length ?? 0) > 0 &&
      (data.material?.material_name?.trim()?.length ?? 0) > 0 &&
      (data.legal_guardian?.legal_guardians_name?.trim()?.length ?? 0) > 0 &&
      data.asset_status === "NI";
    onValidityChange(ok);
  }, [data, onValidityChange]);

  useEffect(() => {
    onStateChange?.(data);
  }, [data, onStateChange]);

  /** ---------- Fetches das listas (com ?q=) ---------- */

  const fetchMaterials = useCallback(async (q?: string) => {
    const reqId = ++materialReqIdRef.current;
    setLoading((p) => ({ ...p, materials: true }));
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`${urlGeral}materials/${params}`, { headers: { Accept: "application/json" } });
      const json: { materials: Material[] } = await res.json();
      if (materialReqIdRef.current !== reqId) return; // resposta antiga
      setMaterials(Array.isArray(json?.materials) ? json.materials : []);
    } catch (e) {
      if (materialReqIdRef.current === reqId) setMaterials([]);
      console.error("Erro ao buscar materiais:", e);
    } finally {
      if (materialReqIdRef.current === reqId) setLoading((p) => ({ ...p, materials: false }));
    }
  }, [urlGeral]);

  const fetchLegalGuardians = useCallback(async (q?: string) => {
    const reqId = ++guardianReqIdRef.current;
    setLoading((p) => ({ ...p, guardians: true }));
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`${urlGeral}legal-guardians/${params}`, { headers: { Accept: "application/json" } });
      const json: { legal_guardians: LegalGuardian[] } = await res.json();
      if (guardianReqIdRef.current !== reqId) return; // resposta antiga
      setLegalGuardians(Array.isArray(json?.legal_guardians) ? json.legal_guardians : []);
    } catch (e) {
      if (guardianReqIdRef.current === reqId) setLegalGuardians([]);
      console.error("Erro ao buscar responsáveis:", e);
    } finally {
      if (guardianReqIdRef.current === reqId) setLoading((p) => ({ ...p, guardians: false }));
    }
  }, [urlGeral]);

  // carregar inicialmente
  useEffect(() => {
    fetchMaterials(materialQd);
    fetchLegalGuardians(guardianQd);
  }, [fetchMaterials, fetchLegalGuardians, materialQd, guardianQd]);

  /** ---------- Handlers ---------- */

  const patch = (partial: Partial<Patrimonio>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const handleChange =
    (field: keyof Patrimonio) => (e: React.ChangeEvent<HTMLInputElement>) => {
      patch({ [field]: e.target.value } as Partial<Patrimonio>);
    };

  const handleMaterialSelect = (id: string) => {
    const m = materials.find((x) => x.id === id);
    patch({
      material: m
        ? { id: m.id, material_code: m.material_code, material_name: m.material_name }
        : { id: "", material_code: "", material_name: "" },
    });
  };

  const handleGuardianSelect = (id: string) => {
    const g = legalGuardians.find((x) => x.id === id);
    patch({
      legal_guardian: g
        ? {
            id: g.id,
            legal_guardians_code: g.legal_guardians_code,
            legal_guardians_name: g.legal_guardians_name,
          }
        : { id: "", legal_guardians_code: "", legal_guardians_name: "" },
    });
  };

  // Recalcular DGV se o usuário editar manualmente o código
  useEffect(() => {
    setData((prev) =>
      prev.asset_check_digit !== gerarDgv(prev.asset_code)
        ? { ...prev, asset_check_digit: gerarDgv(prev.asset_code) }
        : prev
    );
  }, [data.asset_code]);

  /** ---------- UI ---------- */

  const [openGuardian, setOpenGuardian] = useState(false);
  const [openMaterial, setOpenMaterial] = useState(false);

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className="mb-16 text-4xl font-semibold max-w-[1000px]">
          Adicione os dados de patrimônio:
        </h1>
      </div>

      <div className="ml-8">
        <div className="flex gap-2 mb-8">
          <AlertCircle size={24} />
          <div>
            <p className="font-medium">Dados de patrimônio</p>
            <p className="text-gray-500 text-sm">
              O cadastro do item na plataforma não caracteriza o processo de tombamento.
              Significa apenas que o bem está registrado no sistema, ainda que não possua plaqueta de identificação.
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <div className="flex flex-col gap-4 w-full ">

            {/* Linha 1 */}
            <div className="flex gap-4 w-full flex-col lg:flex-row ">
              {/* Código (somente leitura) */}
              <div className="grid gap-3 w-full">
                <Label htmlFor="asset_code">Código</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="asset_code"
                    className="w-full"
                    value={data.asset_code}
                    onChange={handleChange("asset_code")}
                    disabled
                  />
                </div>
              </div>

              {/* Dígito Verificador */}
              <div className="grid gap-3 w-full">
                <Label htmlFor="asset_check_digit">Díg. Verificador</Label>
                <div className="flex items-center gap-3">
                  <Input id="asset_check_digit" className="w-full" value={data.asset_check_digit} disabled />
                </div>
              </div>

              {/* Material (Combobox com busca server-side) */}
              <div className="grid gap-3 w-full">
                <Label>Material</Label>

                <Popover open={openMaterial} onOpenChange={setOpenMaterial}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openMaterial}
                      className="w-full justify-between"
                      disabled={loading.materials}
                    >
                      {selectedMaterialId
                        ? materials.find((m) => m.id === selectedMaterialId)?.material_name
                        : loading.materials ? "Carregando..." : "Selecione o material"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[360px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Buscar material (nome ou código)..."
                        onValueChange={(v) => {
                          setMaterialQ(v);
                          fetchMaterials(v); // busca incremental com debounce efetivo pelo hook (último vence)
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>{loading.materials ? "Carregando..." : "Nenhum material encontrado."}</CommandEmpty>
                        <CommandGroup>
                          {materials
                            .slice()
                            .sort((a, b) => a.material_name.localeCompare(b.material_name, "pt-BR", { sensitivity: "base" }))
                            .map((m) => (
                              <CommandItem
                                key={m.id}
                                value={`${m.material_name} ${m.material_code}`}
                                onSelect={() => {
                                  handleMaterialSelect(m.id);
                                  setOpenMaterial(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedMaterialId === m.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm">{m.material_name}</span>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Linha 2 */}
            <div className="flex gap-4 w-full flex-col lg:flex-row ">
              {/* Situação - sempre NI (fixo/readonly) */}
              <div className="grid gap-3 w-full">
                <Label htmlFor="asset_status">Situação</Label>
                <Select value="NI" disabled>
                  <SelectTrigger id="asset_status" className="w-full">
                    <SelectValue placeholder="Não inventariado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NI">Não inventariado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div className="grid gap-3 w-full">
              <Label htmlFor="asset_description">Descrição</Label>
              <Input
                id="asset_description"
                className="w-full"
                value={data.asset_description}
                onChange={handleChange("asset_description")}
              />
            </div>

            {/* Responsável (Combobox com busca server-side) */}
            <div className="grid gap-3 w-full">
              <Label>Responsável (nome completo)</Label>
              <div className="flex items-center gap-3">
                {data.legal_guardian.legal_guardians_name && (
                  <Avatar className="rounded-md h-10 w-10 border dark:border-neutral-800">
                    <AvatarImage
                      className="rounded-md h-10 w-10"
                      src={`ResearcherData/Image?name=${data.legal_guardian.legal_guardians_name}`}
                    />
                    <AvatarFallback className="flex items-center justify-center">
                      <User size={10} />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="flex-1">
                  <Popover open={openGuardian} onOpenChange={setOpenGuardian}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openGuardian}
                        className="w-full justify-between"
                        disabled={loading.guardians}
                      >
                        {selectedGuardianId
                          ? legalGuardians.find((g) => g.id === selectedGuardianId)?.legal_guardians_name
                          : loading.guardians ? "Carregando..." : "Selecione o responsável"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[360px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Buscar responsável (nome ou código)..."
                          onValueChange={(v) => {
                            setGuardianQ(v);
                            fetchLegalGuardians(v); // incremental
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>{loading.guardians ? "Carregando..." : "Nenhum responsável encontrado."}</CommandEmpty>
                          <CommandGroup>
                            {legalGuardians
                              .slice()
                              .sort((a, b) =>
                                a.legal_guardians_name.localeCompare(b.legal_guardians_name, "pt-BR", { sensitivity: "base" })
                              )
                              .map((g) => (
                                <CommandItem
                                  key={g.id}
                                  value={`${g.legal_guardians_name} ${g.legal_guardians_code}`}
                                  onSelect={() => {
                                    handleGuardianSelect(g.id);
                                    setOpenGuardian(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedGuardianId === g.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm">{g.legal_guardians_name}</span>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
