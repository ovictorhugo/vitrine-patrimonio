// src/pages/edit-item-vitrine/index.tsx
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent } from "../../ui/tabs";
import { Progress } from "../../ui/progress";
import { Button } from "../../ui/button";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Home, LoaderCircle, Undo2 } from "lucide-react";
import { cn } from "../../../lib";
import { UserContext } from "../../../context/context";
import { toast } from "sonner";

/* Steps reaproveitados */
import { FormularioStep, Patrimonio } from "../novo-item/steps/formulario";
import { TrocarLocalStep } from "../novo-item/steps/trocar-local";
import { EstadoStep } from "../novo-item/steps/estado";
import { InformacoesAdicionaisStep } from "../novo-item/steps/informacoes-adicionais";
import { FinalStep } from "../novo-item/steps/final";

/* Aba de imagens (edição) */
import { ImagemStepEdit } from "./steps/imagem";

/* ===================== Tipos locais (DTO) ===================== */
/** Renomeados para evitar colisão estrutural com tipos internos dos steps */
type StepKey =
  | "formulario"
  | "trocar-local"
  | "estado"
  | "informacoes-adicionais"
  | "imagens"
  | "final";

type ValidMap = Partial<Record<StepKey, boolean>>;
type EstadoKind = "quebrado" | "ocioso" | "anti-economico" | "recuperavel";

interface AgencyDTO { id: string; agency_name: string; agency_code: string; }
interface UnitDTO   { id: string; unit_name: string; unit_code: string; unit_siaf: string; agency_id?: string; agency?: AgencyDTO; }
interface SectorDTO { id: string; sector_name: string; sector_code: string; unit_id?: string; unit?: UnitDTO; agency_id?: string; agency?: AgencyDTO; }
interface LocationDTO { id: string; location_name: string; location_code: string; sector_id?: string; sector?: SectorDTO; }

interface CatalogImageDTO {
  id: string;
  catalog_id: string;
  file_path: string;
}

interface CatalogResponseDTO {
  id: string;
  situation: "UNUSED" | "BROKEN" | "UNECONOMICAL" | "RECOVERABLE";
  conservation_status: string;
  description: string;
  asset: Patrimonio & {
    is_official?: boolean;
    location?: LocationDTO | null;
  };
  user?: any;
  location?: LocationDTO | null;
  images: CatalogImageDTO[];
  workflow_history?: any[];
}

type WizardState = {
  formulario?: Patrimonio;
  "trocar-local"?: {
    agency_id?: string; unit_id?: string; sector_id?: string; location_id?: string;
    agency?: AgencyDTO | null; unit?: UnitDTO | null; sector?: SectorDTO | null; location?: LocationDTO | null;
    isOpen?: boolean;
  };
  estado?: { estado_previo: EstadoKind };
  "informacoes-adicionais"?: { observacao?: string; situacao?: string };
  imagens?: { image_ids: string[] };
};

/* ===================== Utils ===================== */
const shallowEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a), bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
};

const apiSituationToWizard = (s?: CatalogResponseDTO["situation"]): EstadoKind => {
  switch (s) {
    case "BROKEN": return "quebrado";
    case "UNUSED": return "ocioso";
    case "UNECONOMICAL": return "anti-economico";
    case "RECOVERABLE": return "recuperavel";
    default: return "ocioso";
  }
};

const wizardSituationToApi = (s?: EstadoKind): CatalogResponseDTO["situation"] => {
  switch (s) {
    case "quebrado":        return "BROKEN";
    case "ocioso":          return "UNUSED";
    case "anti-economico":  return "UNECONOMICAL";
    case "recuperavel":     return "RECOVERABLE";
    default:                return "UNUSED";
  }
};

/** Escolhe o location_id final para o PUT */
const pickLocationIdForPut = (wizard: WizardState, catalog: CatalogResponseDTO): string | undefined => {
  const troca = wizard["trocar-local"];
  if (troca?.location_id) return troca.location_id;
  if (catalog.location?.id) return catalog.location.id;
  if (catalog.asset?.location?.id) return catalog.asset.location.id;
  return undefined;
};

/** Para SELECTs do TrocarLocal: usa catalog.location */
function deriveTLFromCatalogLocation(loc?: LocationDTO | null) {
  if (!loc || !loc.sector) return undefined;
  const sector = loc.sector;
  const agency = sector?.agency;
  const unit   = sector?.unit;

  return {
    location_id: loc.id || "",
    sector_id:   sector?.id || "",
    unit_id:     unit?.id || "",
    agency_id:   agency?.id || "",
    location: loc || null,
    sector:   sector || null,
    unit:     unit || null,
    agency:   agency || null,
  };
}

/** Para inputs readonly do TrocarLocal: usa asset.location */
function deriveTLFromAssetLocation(loc?: LocationDTO | null) {
  if (!loc || !loc.sector) return undefined;
  const sector = loc.sector;
  const agency = sector?.agency;
  const unit   = sector?.unit;

  return {
    location_id: loc.id || "",
    sector_id:   sector?.id || "",
    unit_id:     unit?.id || "",
    agency_id:   agency?.id || "",
    location: loc || null,
    sector:   sector || null,
    unit:     unit || null,
    agency:   agency || null,
  };
}

/* ===================== Componente ===================== */
export function EditItemVitrine() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { urlGeral } = useContext(UserContext);
  const token = localStorage.getItem("jwt_token");

  const searchParams = new URLSearchParams(routerLocation.search);
  const catalogId = searchParams.get("id") || "";

  const STEPS: { key: StepKey; label: string }[] = [
    { key: "formulario",             label: "Formulário" },
    { key: "trocar-local",           label: "Trocar local" },
    { key: "estado",                 label: "Estado" },
    { key: "informacoes-adicionais", label: "Informações adicionais" },
    { key: "imagens",                label: "Imagens" },
    { key: "final",                  label: "Final" },
  ];

  const [active, setActive] = useState<StepKey>("formulario");
  const [valid, setValid]   = useState<ValidMap>({});
  const [wizard, setWizard] = useState<WizardState>({});
  const [catalogData, setCatalogData] = useState<CatalogResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ==== GET /catalog/{id} ==== */
  useEffect(() => {
    if (!catalogId) return;
    setLoading(true);
    fetch(`${urlGeral}catalog/${catalogId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then((data: CatalogResponseDTO) => {
        setCatalogData(data);

        // hidrata wizard com fontes corretas
        setWizard({
          formulario: data.asset,
          // SELECTs <- catalog.location
          "trocar-local": deriveTLFromCatalogLocation(data.location || undefined),
          estado: { estado_previo: apiSituationToWizard(data.situation) },
          "informacoes-adicionais": {
            situacao: data.conservation_status || "",
            observacao: data.description || "",
          },
          imagens: { image_ids: (data.images || []).map((i) => i.id) },
        });

        // marca como válidos (ajuste caso precise validação real por field)
        setValid({
          formulario: true,
          "trocar-local": true,
          estado: true,
          "informacoes-adicionais": true,
          imagens: true,
          final: false,
        });
      })
      .catch((err) => {
        console.error(err);
        toast("Erro ao carregar dados", { description: err?.message || "Tente novamente." });
      })
      .finally(() => setLoading(false));
  }, [catalogId, urlGeral, token]);

  /* ==== helpers para estado/validação ==== */
  const setWizardIfChanged = useCallback((producer: (prev: WizardState) => WizardState) => {
    setWizard((prev) => {
      const next = producer(prev);
      return shallowEqual(prev, next) ? prev : next;
    });
  }, []);

  const onStateChangeFactory = useCallback(
    (key: StepKey) => (st: unknown) => {
      setWizardIfChanged((prev) => {
        const cur = ((prev as any)[key] as Record<string, unknown>) || {};
        const nextForKey: Record<string, unknown> = { ...cur };
        for (const [k, v] of Object.entries(st as Record<string, unknown>)) {
          if (v === undefined) delete nextForKey[k];
          else nextForKey[k] = v;
        }
        return { ...(prev as any), [key]: nextForKey } as WizardState;
      });
    },
    [setWizardIfChanged]
  );

  const onValidityChangeFactory = useCallback(
    (key: StepKey) => (v: boolean) => setValid((prev) => (prev[key] === v ? prev : { ...prev, [key]: v })),
    []
  );

  /* ==== navegação/progresso ==== */
  const idx = useMemo(() => STEPS.findIndex((s) => s.key === active), [active]);
  const total = STEPS.length;
  const pct = ((idx + 1) / total) * 100;

  const canActivateIndex = useCallback(
    (targetIndex: number) => targetIndex <= idx || STEPS.slice(0, targetIndex).every((s) => valid[s.key] === true),
    [idx, STEPS, valid]
  );

  const goPrev = useCallback(() => { if (idx > 0) setActive(STEPS[idx - 1].key); }, [idx, STEPS]);
  const goNext = useCallback(() => { if (idx < total - 1) setActive(STEPS[idx + 1].key); }, [idx, STEPS]);
  const canFinish = useMemo(() => STEPS.slice(0, total - 1).every((s) => valid[s.key] === true), [STEPS, total, valid]);

  /* ==== PUT /catalog/{id} ==== */
  const handleSave = useCallback(async () => {
    if (!catalogData) return;
    setSaving(true);
    try {
      const assetId = (wizard.formulario?.id as string) || (catalogData.asset?.id as string);
      const locationId = pickLocationIdForPut(wizard, catalogData);
      const situation = wizardSituationToApi(wizard.estado?.estado_previo);
      const conservation_status = wizard["informacoes-adicionais"]?.situacao || "";
      const description = wizard["informacoes-adicionais"]?.observacao || "";

      if (!assetId) throw new Error("Asset ID ausente.");
      if (!locationId) throw new Error("Localização não definida.");

      const payload = { asset_id: assetId, location_id: locationId, situation, conservation_status, description };

      const resp = await fetch(`${urlGeral}catalog/${catalogData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(`Falha ao atualizar catálogo (${resp.status}): ${txt}`);
      }

      toast("Item atualizado com sucesso!", { description: "As alterações foram salvas." });
      setActive("final");
    } catch (err: any) {
      console.error(err);
      toast("Erro ao salvar", { description: err?.message || "Tente novamente." });
    } finally {
      setSaving(false);
    }
  }, [catalogData, wizard, urlGeral, token]);

  const [loadingMessage, setLoadingMessage] = useState("Estamos procurando todas as informações no nosso banco de dados, aguarde.");
      
          useEffect(() => {
            let timeouts: NodeJS.Timeout[] = [];
          
           
              setLoadingMessage("Estamos procurando todas as informações no nosso banco de dados, aguarde.");
          
              timeouts.push(setTimeout(() => {
                setLoadingMessage("Estamos quase lá, continue aguardando...");
              }, 5000));
          
              timeouts.push(setTimeout(() => {
                setLoadingMessage("Só mais um pouco...");
              }, 10000));
          
              timeouts.push(setTimeout(() => {
                setLoadingMessage("Está demorando mais que o normal... estamos tentando encontrar tudo.");
              }, 15000));
          
              timeouts.push(setTimeout(() => {
                setLoadingMessage("Estamos empenhados em achar todos os dados, aguarde só mais um pouco");
              }, 15000));
            
          
            return () => {
              // Limpa os timeouts ao desmontar ou quando isOpen mudar
              timeouts.forEach(clearTimeout);
            };
          }, []);

          const location = useLocation()

            const handleVoltar = () => {
  
      const currentPath = location.pathname;
      const hasQueryParams = location.search.length > 0;
      
      if (hasQueryParams) {
        // Se tem query parameters, remove apenas eles
        navigate(currentPath);
      } else {
        // Se não tem query parameters, remove o último segmento do path
        const pathSegments = currentPath.split('/').filter(segment => segment !== '');
        
        if (pathSegments.length > 1) {
          pathSegments.pop();
          const previousPath = '/' + pathSegments.join('/');
          navigate(previousPath);
        } else {
          // Se estiver na raiz ou com apenas um segmento, vai para raiz
          navigate('/');
        }
      }
    };

        if (loading) {
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

  if (!catalogData) {
    return (
     <div
                className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900"
                
              >
           
          
                <div className="w-full flex flex-col items-center justify-center">
                <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
                   X﹏X
                  </p>
                  <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
                    Não foi possível acessar as <br/>  informações deste item.
                  </h1>
                 
          
                  <div className="flex gap-3 mt-8">
                          <Button  onClick={handleVoltar} variant={'ghost'}><Undo2 size={16}/> Voltar</Button>
                           <Link to={'/'}> <Button><Home size={16}/> Página Inicial</Button></Link>
          
                          </div>
                </div>
              </div>
    );
  }

  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full">
      <Helmet>
        <title>Editar item | Sistema Patrimônio</title>
        <meta name="description" content="Edição de item da Sistema Patrimônio" />
      </Helmet>

      <Progress className="absolute top-0 left-0  h-1 z-[5]" value={pct} />

      <main className="flex flex-1 h-full flex-col gap-8">
        <div className="flex gap-2">
          <Button onClick={() => navigate("/dashboard")} variant="outline" size="icon" className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">Editar item</h1>
        </div>

        <div className="flex flex-col h-full w-full gap-8">
          <Tabs
            value={active}
            onValueChange={(v) => {
              const targetIndex = STEPS.findIndex((s) => s.key === (v as StepKey));
              if (targetIndex !== -1 && canActivateIndex(targetIndex)) setActive(v as StepKey);
            }}
            className="h-full"
          >
            {STEPS.map((s) => (
              <TabsContent key={s.key} value={s.key} className="m-0 h-full">
                {/* FORMULÁRIO */}
                {s.key === "formulario" && (
                  <FormularioStep
                    value="formulario"
                    step={STEPS.findIndex(st => st.key === "formulario") + 1}
                    initialData={wizard.formulario}
                    onStateChange={onStateChangeFactory("formulario")}
                    onValidityChange={onValidityChangeFactory("formulario")}
                  />
                )}

                {/* TROCAR LOCAL */}
                {s.key === "trocar-local" && (
                  <TrocarLocalStep
                    value="trocar-local"
                    step={STEPS.findIndex(st => st.key === "trocar-local") + 1}
                    /* SELECTs: catalog.location */
                    initialData={deriveTLFromCatalogLocation(catalogData.location) as any}
                    /* inputs readonly: asset.location */
                    formSnapshot={deriveTLFromAssetLocation(catalogData.asset?.location || undefined) as any}
                    isActive={active === "trocar-local"}
                    onStateChange={onStateChangeFactory("trocar-local")}
                    onValidityChange={onValidityChangeFactory("trocar-local")}
                    flowShort="vitrine"
                  />
                )}

                {/* ESTADO */}
                {s.key === "estado" && (
                  <EstadoStep
                    value="estado"
                    step={STEPS.findIndex(st => st.key === "estado") + 1}
                    estado_previo={wizard.estado?.estado_previo}
                    onStateChange={onStateChangeFactory("estado")}
                    onValidityChange={onValidityChangeFactory("estado")}
                  />
                )}

                {/* INFORMAÇÕES ADICIONAIS */}
                {s.key === "informacoes-adicionais" && (
                  <InformacoesAdicionaisStep
                    value="informacoes-adicionais"
                    step={STEPS.findIndex(st => st.key === "informacoes-adicionais") + 1}
                    initialData={wizard["informacoes-adicionais"]}
                    estadoAtual={wizard.estado?.estado_previo}
                    flowShort="vitrine"
                    onStateChange={onStateChangeFactory("informacoes-adicionais")}
                    onValidityChange={onValidityChangeFactory("informacoes-adicionais")}
                  />
                )}

                {/* IMAGENS */}
                {s.key === "imagens" && (
                  <ImagemStepEdit
                    step={STEPS.findIndex(st => st.key === "imagens") + 1}
                    catalogId={catalogId}
                    urlGeral={urlGeral}
                    token={token}
                    existingImageIds={wizard.imagens?.image_ids}
                    onValidityChange={onValidityChangeFactory("imagens")}
                    onStateChange={onStateChangeFactory("imagens")}
                  />
                )}

                {/* FINAL */}
                {s.key === "final" && (
                  <FinalStep
                    value="final"
                    step={STEPS.findIndex(st => st.key === "final") + 1}
                    onValidityChange={() => {}}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-between items-center h-fit">
            <div>
              {STEPS.slice(0, idx + 1).map((st) => (
                <span key={st.key} className={cn("mr-2", valid[st.key] ? "text-emerald-600" : "text-amber-600")}>●</span>
              ))}
            </div>

            <div className="flex items-center">
              <Button variant="outline" size="lg" className="rounded-r-none" onClick={goPrev} disabled={idx === 0}>
                <ArrowLeft size={16} /> Anterior
              </Button>

              {active !== "final" ? (
                <Button size="lg" className="rounded-l-none" onClick={goNext} disabled={!valid[active]}>
                  Próximo <ArrowRight size={16} />
                </Button>
              ) : (
                <Button size="lg" className="rounded-l-none" onClick={handleSave} disabled={!canFinish || saving}>
                  {saving ? "Salvando…" : <>Salvar <Check size={16} /></>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditItemVitrine;
