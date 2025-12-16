import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Label } from "../../../ui/label";
import { StepBaseProps } from "../emprestimo-audiovisual";
import {
  Archive,
  ArrowRight,
  CheckIcon,
  HelpCircle,
  Hourglass,
  LoaderCircle,
  MoveRight,
  XIcon,
} from "lucide-react";
import { Input } from "../../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { User } from "phosphor-react";
import { UserContext } from "../../../../context/context";
import { Separator } from "../../../ui/separator";
import { Alert } from "../../../ui/alert";
import { Badge } from "../../../ui/badge";
import { useModal } from "../../../hooks/use-modal-store";
import { useIsMobile } from "../../../../hooks/use-mobile";

/** ====== Tipos ====== */
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
  material: { material_code: string; material_name: string; id: string };
  legal_guardian: {
    legal_guardians_code: string;
    legal_guardians_name: string;
    id: string;
  };
  is_official: boolean;
}

const blankPatrimonio = (): Patrimonio => ({
  asset_code: "",
  asset_check_digit: "",
  atm_number: "",
  serial_number: "",
  asset_status: "",
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
  material: { material_code: "", material_name: "", id: "" },
  legal_guardian: {
    legal_guardians_code: "",
    legal_guardians_name: "",
    id: "",
  },
  is_official: false,
});

/** ====== Hook de debounce ====== */
function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** ====== Normalizador da resposta (formato novo com nesting) ====== */
function normalizeAsset(raw: any): Patrimonio {
  const safeStr = (v: any) => (v == null ? "" : String(v));

  // caminhos aninhados do novo payload
  const loc = raw?.location ?? null;
  const sect = loc?.sector ?? null;
  const ag = sect?.agency ?? null;
  const unit = ag?.unit ?? null;

  return {
    asset_code: safeStr(raw?.asset_code),
    asset_check_digit: safeStr(raw?.asset_check_digit),
    atm_number: safeStr(raw?.atm_number),
    serial_number: safeStr(raw?.serial_number),
    asset_status: safeStr(raw?.asset_status),
    asset_value: safeStr(raw?.asset_value),
    asset_description: safeStr(raw?.asset_description),
    csv_code: safeStr(raw?.csv_code),
    accounting_entry_code: safeStr(raw?.accounting_entry_code),
    item_brand: safeStr(raw?.item_brand),
    item_model: safeStr(raw?.item_model),
    group_type_code: safeStr(raw?.group_type_code),
    group_code: safeStr(raw?.group_code),
    expense_element_code: safeStr(raw?.expense_element_code),
    subelement_code: safeStr(raw?.subelement_code),
    id: safeStr(raw?.id),

    agency: {
      agency_name: safeStr(ag?.agency_name),
      agency_code: safeStr(ag?.agency_code),
      id: safeStr(ag?.id),
    },
    unit: {
      unit_name: safeStr(unit?.unit_name),
      unit_code: safeStr(unit?.unit_code),
      unit_siaf: safeStr(unit?.unit_siaf),
      id: safeStr(unit?.id),
    },
    sector: {
      sector_name: safeStr(sect?.sector_name),
      sector_code: safeStr(sect?.sector_code),
      id: safeStr(sect?.id),
    },
    location: {
      location_code: safeStr(loc?.location_code),
      location_name: safeStr(loc?.location_name),
      id: safeStr(loc?.id),
    },

    material: {
      material_code: safeStr(raw?.material?.material_code),
      material_name: safeStr(raw?.material?.material_name),
      id: safeStr(raw?.material?.id),
    },
    legal_guardian: {
      legal_guardians_code: safeStr(raw?.legal_guardian?.legal_guardians_code),
      legal_guardians_name: safeStr(raw?.legal_guardian?.legal_guardians_name),
      id: safeStr(raw?.legal_guardian?.id),
    },

    is_official: Boolean(raw?.is_official),
  };
}

export function FormularioStep({
  value_item,
  onValidityChange,
  onStateChange,
  type,
  step,
  initialData,
  showLocation,
}: StepBaseProps<"formulario"> & {
  initialData?: Patrimonio;
  showLocation?: boolean;
}) {
  const { urlGeral, loggedIn } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Patrimonio>(
    initialData ? normalizeAsset(initialData as any) : blankPatrimonio()
  );
  // Debounce do valor vindo do passo anterior
  const debouncedValue = useDebounced(value_item ?? "", 500);

  // separa código e dígito *a partir do valor debounced*
  const { code, check } = useMemo(() => {
    const [c = "", d = ""] = String(value_item ?? "").split("-");
    return { code: c, check: d };
  }, [debouncedValue]);

  // Monta URL estável para busca
  const url = useMemo(() => {
    if (!urlGeral) return "";
    const base = `${urlGeral}`;

    if (type === "cod") {
      if (!code || !check) return "";
      return `${base}assets/?asset_identifier=${value_item}`;
    }

    // type === "atm"
    if (!debouncedValue) return "";
    return `${base}assets/?atm_number=${value_item}`;
  }, [type, code, check, debouncedValue, urlGeral]);

  /** ====== Validação (evita disparos redundantes no pai) ====== */
  const lastValidityRef = useRef<boolean | null>(null);
  useEffect(() => {
    const ok =
      (data.asset_code?.trim().length ?? 0) > 0 ||
      (data.asset_description?.trim().length ?? 0) > 0 ||
      (data.material?.material_name?.trim().length ?? 0) > 0;

    if (lastValidityRef.current !== ok) {
      lastValidityRef.current = ok;
      onValidityChange(ok);
    }
  }, [data, onValidityChange]);

  // Propaga data ao pai
  useEffect(() => {
    onStateChange?.(data);
  }, [data, onStateChange]);

  /** ====== Requisição sempre que a URL mudar ====== */
  const abortRef = useRef<AbortController | null>(null);
  const token = useMemo(() => localStorage.getItem("jwt_token") ?? "", []);

  useEffect(() => {
    if (!url) return;

    // aborta anterior se houver
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        setLoading(true);

        const response = await fetch(url, {
          signal: ac.signal,
          headers: {
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();
        // backend retorna { assets: [...] }
        const raw = Array.isArray(json?.assets) ? json.assets[0] : null;

        if (raw) {
          setData(normalizeAsset(raw));
        } else {
          // se não veio nada, zera para não “congelar” dados antigos
          setData(blankPatrimonio());
        }

        if (abortRef.current === ac) {
          setLoading(false);
          abortRef.current = null;
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Erro ao buscar patrimônio:", err);
        }
      }
    })();

    return () => {
      ac.abort();
    };
  }, [url]);

  const qualisColor: Record<string, string> = {
    BM: "bg-green-500",
    AE: "bg-red-500",
    IR: "bg-yellow-500",
    OC: "bg-blue-500",
    RE: "bg-purple-500",
  };

  const csvCodToText: Record<string, string> = {
    BM: "Bom",
    AE: "Anti-Econômico",
    IR: "Irrecuperável",
    OC: "Ocioso",
    RE: "Recuperável",
  };

  const statusMap: Record<string, { text: string; icon: JSX.Element }> = {
    NO: { text: "Normal", icon: <CheckIcon size={12} /> },
    NI: { text: "Não inventariado", icon: (<HelpCircle size={12} />) as any }, // HelpCircle (phosphor) opcional
    CA: { text: "Cadastrado", icon: <Archive size={12} /> },
    TS: { text: "Aguardando aceite", icon: <Hourglass size={12} /> },
    MV: { text: "Movimentado", icon: <MoveRight size={12} /> },
    BX: { text: "Baixado", icon: <XIcon size={12} /> },
  };

  const csvCodTrimmed = (data.csv_code || "").trim();
  const bemStaTrimmed = (data.asset_status || "").trim();

  const status = statusMap[bemStaTrimmed];

  const showCard = Boolean(data.asset_code);

  const [loadingMessage, setLoadingMessage] = useState(
    "Estamos procurando todas as informações no nosso banco de dados, aguarde."
  );

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    setLoadingMessage(
      "Estamos procurando todas as informações no nosso banco de dados, aguarde."
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Estamos quase lá, continue aguardando...");
      }, 5000)
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage("Só mais um pouco...");
      }, 10000)
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Está demorando mais que o normal... estamos tentando encontrar tudo."
        );
      }, 15000)
    );

    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          "Estamos empenhados em achar todos os dados, aguarde só mais um pouco"
        );
      }, 15000)
    );

    return () => {
      // Limpa os timeouts ao desmontar ou quando isOpen mudar
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const { onOpen } = useModal();

  const isMobile = useIsMobile();

  if (loading) {
    if (isMobile) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="text-eng-blue mb-4 animate-pulse">
              <LoaderCircle size={54} className="animate-spin" />
            </div>
            <p className="font-medium text-lg max-w-[400px] text-center">
              {loadingMessage}
            </p>
          </div>
        </div>
      );
    } else
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="text-eng-blue mb-4 animate-pulse">
              <LoaderCircle size={108} className="animate-spin" />
            </div>
            <p className="font-medium text-lg max-w-[500px] text-center">
              {loadingMessage}
            </p>
          </div>
        </div>
      );
  }

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
          Agora, confira se as informações estão corretas:
        </h1>
      </div>

      <div className="ml-8">
        {showCard && (
          <>
            <div
              className="flex group cursor-pointer "
              onClick={() => onOpen("patrimonio", { ...data })}
            >
              <div
                className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${
                  qualisColor[csvCodTrimmed as keyof typeof qualisColor] ||
                  "bg-zinc-300"
                } min-h-full`}
              />
              <Alert className="flex flex-col flex-1 h-fit rounded-l-none p-0">
                <div className="flex mb-1 gap-3 justify-between p-4 pb-0">
                  <p className="font-semibold flex gap-3 items-center text-left mb-4 flex-1">
                    {data.asset_code?.trim()} - {data.asset_check_digit}
                    {!!data.atm_number && data.atm_number !== "None" && (
                      <Badge variant="outline">ATM: {data.atm_number}</Badge>
                    )}
                  </p>
                </div>

                <div className="flex flex-col p-4 pt-0 justify-between">
                  <div>
                    <div className="text-lg mb-2 font-bold">
                      {data.material.material_name || "Sem nome"}
                    </div>
                    <p className="text-left mb-4 uppercase">
                      {data.asset_description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {!!data.csv_code && data.csv_code !== "None" && (
                        <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                          <div
                            className={`w-4 h-4 rounded-md ${
                              qualisColor[
                                csvCodTrimmed as keyof typeof qualisColor
                              ] || "bg-zinc-300"
                            }`}
                          />
                          {csvCodToText[
                            csvCodTrimmed as keyof typeof csvCodToText
                          ] || "—"}
                        </div>
                      )}

                      {status && (
                        <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                          {status.icon}
                          {status.text}
                        </div>
                      )}

                      {loggedIn && (
                        <>
                          {!!data.legal_guardian.legal_guardians_name &&
                            data.legal_guardian.legal_guardians_name !==
                              "None" && (
                              <div className="flex gap-1 items-center">
                                <Avatar className="rounded-md h-5 w-5">
                                  <AvatarImage
                                    className="rounded-md h-5 w-5"
                                    src={`${urlGeral}ResearcherData/Image?name=${data.legal_guardian.legal_guardians_name}`}
                                  />
                                  <AvatarFallback className="flex items-center justify-center">
                                    <User size={10} />
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-sm text-gray-500 dark:text-gray-300 font-normal">
                                  {data.legal_guardian.legal_guardians_name}
                                </p>
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            </div>

            <Separator className="my-8" />
          </>
        )}

        <div className="flex gap-2 w-full">
          <div className="flex flex-col gap-4 w-full ">
            <div className="flex gap-4 w-full flex-col lg:flex-row ">
              {data.asset_code !== "" && (
                <div className="grid gap-3 w-full">
                  <Label htmlFor="asset_code">Código</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      disabled
                      id="asset_code"
                      className="w-full"
                      value={data.asset_code}
                      readOnly
                    />
                  </div>
                </div>
              )}

              {data.asset_check_digit !== "" && (
                <div className="grid gap-3 w-full">
                  <Label htmlFor="asset_check_digit">Díg. Verificador</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      disabled
                      id="asset_check_digit"
                      className="w-full"
                      value={data.asset_check_digit}
                      readOnly
                    />
                  </div>
                </div>
              )}

              {data.atm_number && (
                <div className="grid gap-3 w-full">
                  <Label htmlFor="atm_number">Número ATM</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      disabled
                      id="atm_number"
                      className="w-full"
                      value={data.atm_number}
                      readOnly
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-3 w-full">
                <Label htmlFor="material_name">Material</Label>
                <div className="flex items-center gap-3">
                  <Input
                    disabled
                    id="material_name"
                    className="w-full"
                    value={data.material.material_name}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 w-full flex-col lg:flex-row ">
              <div className="grid gap-3 w-full">
                <Label htmlFor="asset_status">Situação</Label>
                <div className="flex items-center gap-3">
                  <Select value={data.asset_status || ""} disabled>
                    <SelectTrigger id="asset_status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO">Normal</SelectItem>
                      <SelectItem value="NI">Não inventariado</SelectItem>
                      <SelectItem value="CA">Cadastrado</SelectItem>
                      <SelectItem value="TS">Aguardando aceite</SelectItem>
                      <SelectItem value="MV">Movimentado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 w-full">
                <Label htmlFor="asset_value">Valor</Label>
                <div className="flex items-center gap-3">
                  <Input
                    disabled
                    id="asset_value"
                    className="w-full"
                    value={data.asset_value}
                    readOnly
                  />
                </div>
              </div>

              {data.accounting_entry_code && (
                <div className="grid gap-3 w-full">
                  <Label htmlFor="accounting_entry_code">Termo de resp.</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      disabled
                      id="accounting_entry_code"
                      className="w-full"
                      value={data.accounting_entry_code}
                      readOnly
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 w-full">
              <Label htmlFor="asset_description">Descrição </Label>
              <div className="flex items-center gap-3">
                <Input
                  disabled
                  id="asset_description"
                  className="w-full"
                  value={data.asset_description}
                  readOnly
                />
              </div>
            </div>

            {loggedIn && (
              <div className="grid gap-3 w-full">
                <Label htmlFor="pes_nome">Responsável (nome completo)</Label>
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
                  <Input
                    id="pes_nome"
                    className="w-full"
                    value={data.legal_guardian.legal_guardians_name}
                    disabled
                  />
                </div>
              </div>
            )}

            {showLocation && (
              <div
                className={`grid gap-4 w-full grid-cols-1 ${
                  loggedIn ? "md:grid-cols-4" : "md:grid-cols-2"
                }`}
              >
                <div className="grid gap-2">
                  <Label>Unidade</Label>
                  <Input disabled value={data.unit.unit_name} />
                </div>
                <div className="grid gap-2">
                  <Label>Organização</Label>
                  <Input disabled value={data.agency.agency_name} />
                </div>
                {loggedIn && (
                  <div className="grid gap-2">
                    <Label>Setor / Departamento</Label>
                    <Input disabled value={data.sector.sector_name} />
                  </div>
                )}

                {loggedIn && (
                  <div className="grid gap-2">
                    <Label>Local de guarda</Label>
                    <Input disabled value={data.location.location_name} />
                  </div>
                )}
              </div>
            )}

            {!loggedIn && (
              <p className="mt-4 text-sm ">
                Para mais informações, acesse com o Minha UFMG
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
