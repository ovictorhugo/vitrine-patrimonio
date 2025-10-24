import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  RefreshCcw,
  Bookmark,
  BookmarkPlus,
  Trash2,
  Download,
  Expand,
} from "lucide-react";
import { Tabs, TabsContent } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { cn } from "../../lib";

import { FormularioStep as FormularioStepView, Patrimonio } from "../dashboard/novo-item/steps/formulario";
import { useQuery } from "../authentication/signIn";
import { PesquisaStep } from "../dashboard/novo-item/steps/pesquisa";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

// ➕ importar o componente que renderiza o Asset completo
import { PatrimonioItem } from "../busca-patrimonio/patrimonio-item";
import { Asset } from "../dashboard/dashboard-page/tabs/patrimonios";
import { ArrowUUpLeft } from "phosphor-react";


type StepKey = "pesquisa" | "formulario";
type StepDef = { key: StepKey; label: string };

const STEPS: StepDef[] = [
  { key: "pesquisa", label: "Pesquisa" },
  { key: "formulario", label: "Formulário" },
];

type SavedItem = {
  id: string;
  pesquisa: { value_item: string; type: "cod" | "atm" };
  asset?: Asset; // armazenamos o Asset completo para renderizar no Dialog
  createdAt: string; // ISO
};

type ValidMap = Partial<Record<StepKey, boolean>>;

type WizardState = {
  pesquisa?: { value_item?: string; type?: "cod" | "atm" };
  formulario?: Patrimonio; // sua estrutura original; mapearemos para Asset ao salvar
};

const shallowEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
};

const eqPesquisa = (
  a?: { value_item?: string; type?: "cod" | "atm" },
  b?: { value_item?: string; type?: "cod" | "atm" }
) => (a?.value_item ?? "") === (b?.value_item ?? "") && (a?.type ?? "") === (b?.type ?? "");

export function BuscaPatrimonio() {
  const navigate = useNavigate();
  const location = useLocation();

  const query = useQuery();
  const bem_cod = query.get("bem_cod") ?? undefined;
  const bem_dgv = query.get("bem_dgv") ?? undefined;
  const bem_num_atm = query.get("bem_num_atm") ?? undefined;

  const [active, setActive] = useState<StepKey>("pesquisa");
  const [valid, setValid] = useState<ValidMap>({});
  const [wizard, setWizard] = useState<WizardState>({});
  const [resetKey, setResetKey] = useState(0); // força re-mount dos passos

  const idx = useMemo(() => STEPS.findIndex((s) => s.key === active), [active]);
  const total = STEPS.length;
  const isLast = idx === total - 1;
  const pct = ((idx + 1) / total) * 100;

  // inicializa mapa de validade
  useEffect(() => {
    setValid((prev) => {
      const next: ValidMap = { ...prev };
      for (const s of STEPS) {
        if (next[s.key] === undefined) next[s.key] = s.key === "pesquisa" ? false : (undefined as any);
      }
      return next;
    });
  }, []);

  const setValidIfChanged = useCallback((producer: (prev: ValidMap) => ValidMap) => {
    setValid((prev) => {
      const next = producer(prev);
      return shallowEqual(prev, next) ? prev : next;
    });
  }, []);

  // Só atualiza wizard se conteúdo mudar de verdade
  const setWizardIfChanged = useCallback((producer: (prev: WizardState) => WizardState) => {
    setWizard((prev) => {
      const next = producer(prev);
      if (eqPesquisa(prev.pesquisa, next.pesquisa) && prev.formulario === next.formulario) {
        return prev;
      }
      return next;
    });
  }, []);

  const canGoNext = useMemo(() => {
    const upto = STEPS.slice(0, idx + 1).every((s) => valid[s.key] === true);
    return upto && idx < total - 1;
  }, [idx, total, valid]);

  const canActivateIndex = useCallback((targetIndex: number) => {
    if (targetIndex <= idx) return true;
    return STEPS.slice(0, targetIndex).every((s) => valid[s.key] === true);
  }, [idx, valid]);

  const goPrev = useCallback(() => { if (idx > 0) setActive(STEPS[idx - 1].key); }, [idx]);
  const goNext = useCallback(() => { if (idx < total - 1 && canGoNext) setActive(STEPS[idx + 1].key); }, [idx, total, canGoNext]);

  const onValidityChangeFactory = useCallback(
    (key: StepKey) => (v: boolean) => {
      setValidIfChanged(prev => (prev[key] === v ? prev : { ...prev, [key]: v }));
    },
    [setValidIfChanged]
  );

  const onStateChangePesquisa = useCallback((st: { value_item?: string; type?: "cod" | "atm" }) => {
    setWizardIfChanged(prev => ({ ...prev, pesquisa: { ...prev.pesquisa, ...st } }));
  }, [setWizardIfChanged]);

  const onStateChangeFormulario = useCallback((st: Patrimonio) => {
    setWizardIfChanged(prev => ({ ...prev, formulario: st }));
  }, [setWizardIfChanged]);

  const handleBack = () => {
    const path = location.pathname;
    const hasQuery = location.search.length > 0;
    if (hasQuery) navigate(path);
    else {
      const seg = path.split("/").filter(Boolean);
      if (seg.length > 1) { seg.pop(); navigate("/" + seg.join("/")); }
      else navigate("/");
    }
  };

  // Preenche automaticamente a pesquisa com base nos query params
  useEffect(() => {
    // prioriza ATM se existir; senão tenta COD-DGV
    if (bem_num_atm && bem_num_atm.trim()) {
      setWizardIfChanged(prev => ({
        ...prev,
        pesquisa: { value_item: bem_num_atm.trim(), type: "atm" }
      }));
      setValidIfChanged(prev => ({ ...prev, pesquisa: true }));
      return;
    }

    if (bem_cod && bem_dgv && `${bem_cod}`.trim() && `${bem_dgv}`.trim()) {
      const composed = `${bem_cod.trim()}-${bem_dgv.trim()}`;
      setWizardIfChanged(prev => ({
        ...prev,
        pesquisa: { value_item: composed, type: "cod" }
      }));
      setValidIfChanged(prev => ({ ...prev, pesquisa: true }));
    }
  }, [bem_num_atm, bem_cod, bem_dgv, setWizardIfChanged, setValidIfChanged]);

  // Reinicia tudo e volta para o primeiro passo
  const resetAll = useCallback(() => {
    // limpa URL de possíveis query params
    navigate(location.pathname, { replace: true });

    // volta para o step inicial
    setActive("pesquisa");

    // limpa estados do wizard e validade
    setWizard({});
    setValid(() => {
      const next: ValidMap = {};
      for (const s of STEPS) (next as any)[s.key] = s.key === "pesquisa" ? false : undefined;
      return next;
    });

    // força re-mount dos componentes de passo (zera estados internos)
    setResetKey((k) => k + 1);
  }, [location.pathname, navigate]);

  // ======================= SALVOS EM MEMÓRIA =======================
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [openSavedDialog, setOpenSavedDialog] = useState(false);
  const [showNewSavedDot, setShowNewSavedDot] = useState(false);

  const canSaveCurrent = Boolean(
    wizard.pesquisa?.value_item && wizard.pesquisa?.type && valid.pesquisa
  );

  // chave do item atual e verificação se já está salvo
  const currentKey = `${wizard.pesquisa?.type ?? ""}::${wizard.pesquisa?.value_item ?? ""}`;
  const existingIndex = useMemo(
    () => saved.findIndex(s => `${s.pesquisa.type}::${s.pesquisa.value_item}` === currentKey),
    [saved, currentKey]
  );
  const isCurrentSaved = existingIndex >= 0;

  // mapeia (se necessário) os dados do formulário para Asset
  const mapFormularioToAsset = (form?: Patrimonio): Asset | undefined => {
    if (!form) return undefined;
    // ⚠️ Ajuste este mapper conforme o shape real de `Patrimonio`
    // Abaixo, tentamos casar os campos com base no que você forneceu de Asset
    const asset: Partial<Asset> = {
      id: (form as any)?.id ?? "",
      asset_code: (form as any)?.asset_code ?? (form as any)?.bem_cod ?? "",
      asset_check_digit: (form as any)?.asset_check_digit ?? (form as any)?.bem_dgv ?? "",
      atm_number: (form as any)?.atm_number ?? (form as any)?.bem_num_atm ?? null,
      serial_number: (form as any)?.serial_number ?? null,
      asset_status: (form as any)?.asset_status ?? "",
      asset_value: (form as any)?.asset_value ?? "",
      asset_description: (form as any)?.asset_description ?? (form as any)?.descricao ?? "",
      csv_code: (form as any)?.csv_code ?? "",
      accounting_entry_code: (form as any)?.accounting_entry_code ?? "",
      item_brand: (form as any)?.item_brand ?? null,
      item_model: (form as any)?.item_model ?? null,
      group_type_code: (form as any)?.group_type_code ?? "",
      group_code: (form as any)?.group_code ?? "",
      expense_element_code: (form as any)?.expense_element_code ?? "",
      subelement_code: (form as any)?.subelement_code ?? "",
      is_official: Boolean((form as any)?.is_official),
      material: (form as any)?.material ?? {},
      legal_guardian: (form as any)?.legal_guardian ?? {},
      location: (form as any)?.location ?? {},
    };

    // validação mínima
    if (!asset.asset_code && !asset.atm_number) return undefined;
    return asset as Asset;
  };

  // salvar/remover (toggle) o resultado atual
  const toggleSaveCurrent = useCallback(() => {
    if (!canSaveCurrent || !wizard.pesquisa?.value_item || !wizard.pesquisa?.type) return;

    if (isCurrentSaved) {
      const id = saved[existingIndex].id;
      setSaved(prev => prev.filter(s => s.id !== id));
      return;
    }

    const maybeAsset = mapFormularioToAsset(wizard.formulario);

    const item: SavedItem = {
      id: `${Date.now()}`,
      pesquisa: { value_item: wizard.pesquisa.value_item, type: wizard.pesquisa.type },
      asset: maybeAsset,
      createdAt: new Date().toISOString(),
    };
    setSaved(prev => [item, ...prev]);
    setShowNewSavedDot(true);
  }, [canSaveCurrent, wizard.pesquisa, wizard.formulario, isCurrentSaved, saved, existingIndex]);

  // abrir item salvo (carrega no wizard e vai para o formulário)
  const openSavedItem = useCallback((s: SavedItem) => {
    setWizard({ pesquisa: { ...s.pesquisa }, formulario: (s.asset as unknown as Patrimonio) ?? wizard.formulario });
    setValid(prev => ({ ...prev, pesquisa: true }));
    setActive("formulario");
    setOpenSavedDialog(false);
    setResetKey(k => k + 1);
  }, [wizard.formulario]);

  // excluir um salvo
  const removeSaved = useCallback((id: string) => {
    setSaved(prev => prev.filter(s => s.id !== id));
  }, []);

  // limpar todos
  const clearAllSaved = useCallback(() => setSaved([]), []);

  // baixar CSV de todos os salvos
  const downloadCSV = useCallback(() => {
    if (!saved.length) return;

    const headers = [
      "id","asset_code","asset_check_digit","atm_number","serial_number","asset_status",
      "asset_value","asset_description","csv_code","accounting_entry_code",
      "item_brand","item_model","group_type_code","group_code",
      "expense_element_code","subelement_code","is_official",
      "material_id","material_name",
      "legal_guardian_id","legal_guardian_name",
      "location_id","location_name",
      "search_type","search_value","saved_at"
    ];

    const rows = saved.map((s) => {
      const a = s.asset;
      return [
        a?.id ?? "",
        a?.asset_code ?? "",
        a?.asset_check_digit ?? "",
        a?.atm_number ?? "",
        a?.serial_number ?? "",
        a?.asset_status ?? "",
        a?.asset_value ?? "",
        a?.asset_description ?? "",
        a?.csv_code ?? "",
        a?.accounting_entry_code ?? "",
        a?.item_brand ?? "",
        a?.item_model ?? "",
        a?.group_type_code ?? "",
        a?.group_code ?? "",
        a?.expense_element_code ?? "",
        a?.subelement_code ?? "",
        String(a?.is_official ?? ""),
        (a as any)?.material?.id ?? "",
        (a as any)?.material?.name ?? "",
        (a as any)?.legal_guardian?.id ?? "",
        (a as any)?.legal_guardian?.name ?? "",
        (a as any)?.location?.id ?? "",
        (a as any)?.location?.name ?? "",
        s.pesquisa.type,
        s.pesquisa.value_item,
        new Date(s.createdAt).toISOString()
      ].map((v) => {
        const str = `${v ?? ""}`;
        return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement("a");
    aEl.href = url;
    aEl.download = `resultados-salvos-${new Date().toISOString().slice(0,19)}.csv`;
    document.body.appendChild(aEl);
    aEl.click();
    document.body.removeChild(aEl);
    URL.revokeObjectURL(url);
  }, [saved]);

  // ========================= RENDER =========================
  return (
    <div className="p-4 md:p-8 gap-8 flex flex-col h-full ">
      <Helmet>
        <title>Buscar patrimônio | Sistema Patrimônio</title>
        <meta name="description" content="Buscar patrimônio | Sistema Patrimônio" />
      </Helmet>

      <Progress className="absolute top-0 left-0 rounded-b-none rounded-t-lg h-1 z-[5]" value={pct} />

      <main className="flex flex-1 h-full lg:flex-row flex-col-reverse gap-8">
        <div className="w-full flex flex-col gap-8 h-full">
          <div className="items-center flex justify-between">
            <div className="flex gap-2">
              <Button onClick={handleBack} variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
              <h1 className="text-xl font-semibold tracking-tight">Buscar patrimônio</h1>
            </div>

            <div>
              {/* topo -> lado direito */}
              <Button
                variant="outline"
                onClick={() => {
                  setOpenSavedDialog(true);
                  setShowNewSavedDot(false); // apaga a bolinha ao abrir a lista
                }}
                className="relative"
                title="Ver resultados salvos"
              >
                <Bookmark size={16} className="" />
                Resultados salvos
                <Badge variant='outline' className="ml-2">{saved.length}</Badge>

                {showNewSavedDot && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-eng-blue rounded-full animate-pulse" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-col h-full w-full gap-8">
            <Tabs
              key={resetKey}
              value={active}
              onValueChange={(v) => {
                const targetIndex = STEPS.findIndex((s) => s.key === (v as StepKey));
                if (targetIndex !== -1 && canActivateIndex(targetIndex)) setActive(v as StepKey);
              }}
              className="h-full"
            >
              {STEPS.map((s) => (
                <TabsContent key={s.key} value={s.key} className="m-0 h-full">
                  {s.key === "pesquisa" && (
                    <PesquisaStep
                      key={`pesquisa-${resetKey}`}
                      value={"pesquisa" as any}
                      onValidityChange={onValidityChangeFactory("pesquisa")}
                      onStateChange={onStateChangePesquisa as any}
                      value_item={wizard.pesquisa?.value_item}
                      type={wizard.pesquisa?.type}
                      step={idx + 1}
                    />
                  )}

                  {s.key === "formulario" && (
                    <FormularioStepView
                      key={`formulario-${resetKey}`}
                      value={"formulario" as any}
                      onValidityChange={onValidityChangeFactory("formulario")}
                      onStateChange={onStateChangeFormulario as any}
                      value_item={wizard.pesquisa?.value_item}
                      type={wizard.pesquisa?.type}
                      initialData={wizard.formulario}
                      step={idx + 1}
                    />
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {!isLast && (
              <div className="flex justify-between items-center h-fit">
                <div>
                  {STEPS.slice(0, idx + 1).map((s) => (
                    <span key={s.key} className={cn("mr-2", valid[s.key] ? "text-emerald-600" : "text-amber-600")}>●</span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {/* Salvar/Remover atual */}
                

                  <div className="flex">
                    <Button variant="outline" size="lg" className="rounded-r-none" onClick={goPrev} disabled={idx === 0}>
                      <ArrowLeft size={16} /> Anterior
                    </Button>
                    <Button
                      size="lg"
                      className="rounded-l-none"
                      onClick={goNext}
                      disabled={!canGoNext}
                    >
                      Próximo <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isLast && (
              <div className="flex justify-between items-center h-fit">
                <div>
                  {STEPS.slice(0, idx + 1).map((s) => (
                    <span key={s.key} className={cn("mr-2", valid[s.key] ? "text-emerald-600" : "text-amber-600")}>●</span>
                  ))}
                </div>

              <div className="flex items-center h-fit">
                <Button
                  variant="outline"
                  size={'lg'}
                  className="rounded-r-none"
                  onClick={toggleSaveCurrent}
                  disabled={!canSaveCurrent && !isCurrentSaved}
                >
                  {isCurrentSaved ? (
                    <>
                      <Trash2 size={16} />
                      Remover dos salvos
                    </>
                  ) : (
                    <>
                      <BookmarkPlus size={16}  />
                      Salvar este resultado
                    </>
                  )}
                </Button>

                <div className="flex justify-end">
                  <Button size="lg" className="rounded-l-none" onClick={resetAll}>
                    <RefreshCcw size={16} className="" />
                    Fazer nova busca
                  </Button>
                </div>
              </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Dialog: lista e ações sobre resultados salvos */}
      <Dialog open={openSavedDialog} onOpenChange={setOpenSavedDialog}>
        <DialogContent className="max-w-3xl" >
             <DialogHeader>
                      <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">Resultados salvos</DialogTitle>
                      <DialogDescription className="text-zinc-500 ">
                     Acesse pesquisas salvas nesta sessão.
                      </DialogDescription>
                    </DialogHeader>
       

          <Separator className="my-4" />

          {/* Cabeçalho com ações */}
          <div className="flex items-center justify-between ">
            <Badge variant={'outline'} className="">
              Total: {saved.length} itens
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCSV}
                disabled={!saved.length}
                title="Baixar CSV de todos os resultados"
              >
                <Download className="h-4 w-4 mr-1" />
                Baixar CSV
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearAllSaved}
                disabled={saved.length === 0}
                title="Remover todos"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar todos
              </Button>
            </div>
          </div>

        

          <ScrollArea className="h-[360px] mt-3">
            <div className="">
              {saved.length === 0 && (
                <div className="text-center mt-8" >
                  <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">^_^</p>
          <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
 Nenhum resultado salvo ainda.
          </h1>
             
                </div>
              )}

              {saved.map((s) => (
                <div key={s.id}>
                 

                  {/* Renderização completa do Asset */}
                   <PatrimonioItem {...s.asset} />

                  <div className="flex items-center gap-2 my-4">
                    <Button className="w-full" size="sm" onClick={() => openSavedItem(s)}>
                      <Expand className="h-4 w-4 mr-2" />
                      Abrir
                    </Button>
                    <Button className="w-full" size="sm" variant="outline" onClick={() => removeSaved(s.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenSavedDialog(false)}>
          <ArrowUUpLeft size={16} /> Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
