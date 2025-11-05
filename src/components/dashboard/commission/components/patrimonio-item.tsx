import { Alert } from "../../../ui/alert";
import {
  Archive, HelpCircle, Hourglass, MoveRight, User, X, Check, Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { useContext, useMemo, useState, MouseEvent, useCallback } from "react";
import { useModal } from "../../../hooks/use-modal-store";
import { UserContext } from "../../../../context/context";
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "../../../ui/carousel";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "../../../ui/dialog";
import { Textarea } from "../../../ui/textarea";
import { Button } from "../../../ui/button";
import { toast } from "sonner";
import { CatalogEntry } from "../../../dashboard/itens-vitrine/card-item-dropdown";
import { Label } from "../../../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../ui/select";
import { Separator } from "../../../ui/separator";
import { ArrowUUpLeft } from "phosphor-react";
import { JUSTIFICATIVAS_DESFAZIMENTO } from "../../itens-vitrine/JUSTIFICATIVAS_DESFAZIMENTO";

export const qualisColor: Record<string, string> = {
  BM: "bg-green-500",
  AE: "bg-red-500",
  IR: "bg-yellow-500",
  OC: "bg-blue-500",
  RE: "bg-purple-500",
};

export const csvCodToText: Record<string, string> = {
  BM: "Bom",
  AE: "Anti-Econômico",
  IR: "Irrecuperável",
  OC: "Ocioso",
  RE: "Recuperável",
};

type Props = {
  entry: CatalogEntry;
  /** Remover do pai sem refetch ao concluir o workflow */
  onRemove?: (id: string) => void;
};

type WorkflowTarget = "DESFAZIMENTO" | "REJEITADOS_COMISSAO";



export function PatrimonioItemComission({ entry, onRemove }: Props) {
  if (!entry) return null;

  const { onOpen } = useModal();
  const { urlGeral } = useContext(UserContext);

  const conectee = import.meta.env.VITE_BACKEND_CONECTEE || "";
  const asset = entry.asset;
  if (!asset) return null;

  const csvCodTrimmed = (asset.csv_code || "").toString().trim();
  const bemStaTrimmed = (asset.asset_status || "").toString().trim();

  const statusMap: Record<string, { text: string; icon: JSX.Element }> = {
    NO: { text: "Normal", icon: <Check size={12} /> },
    NI: { text: "Não inventariado", icon: <HelpCircle size={12} /> },
    CA: { text: "Cadastrado", icon: <Archive size={12} /> },
    TS: { text: "Aguardando aceite", icon: <Hourglass size={12} /> },
    MV: { text: "Movimentado", icon: <MoveRight size={12} /> },
    BX: { text: "Baixado", icon: <X size={12} /> },
  };

  const statusInfo = statusMap[bemStaTrimmed];
  const materialName = asset.material?.material_name || "Sem nome";
  const legalGuardianName = asset.legal_guardian?.legal_guardians_name || "";
  const hasAtm = !!(asset.atm_number && asset.atm_number !== "None" && asset.atm_number !== "");

  const buildImgUrl = (p: string) => {
    const cleanPath = p?.startsWith("/") ? p.slice(1) : p || "";
    return `${urlGeral}${cleanPath}`;
  };

  // =========== dialog imagem ===========
  const [openImage, setOpenImage] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const openImageDialog = (e: MouseEvent, url: string) => {
    e.stopPropagation();
    setSelectedImg(url);
    setOpenImage(true);
  };
  const stop = (e: MouseEvent) => e.stopPropagation();

  // abre modal patrimônio (card)
  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onOpen('catalog-modal', { ...entry });
  };

  // urls das imagens
  const imageUrls = useMemo(
    () => (entry.images || []).map((img) => buildImgUrl(img.file_path)),
    [entry.images, urlGeral]
  );

  // =========== Dialog workflow (aceitar/recusar) ===========
  const [wfOpen, setWfOpen] = useState(false);
  const [wfTarget, setWfTarget] = useState<WorkflowTarget>("DESFAZIMENTO");
  const [posting, setPosting] = useState(false);
const [presetId, setPresetId] = useState<string>("");
const [justTxt, setJustTxt] = useState<string>("");


const fillPreset = useCallback((id: string) => {
  const p = JUSTIFICATIVAS_DESFAZIMENTO.find((x) => x.id === id);
  // se quiser limpar quando "nenhum" for escolhido (id vazio):
  if (!p) {
    setJustTxt("");
    return;
  }
  const texto = p.build(entry);
  setJustTxt(texto); // <-- sobrescreve SEMPRE
}, [entry]);

  const handleClickAction = (target: WorkflowTarget) => {
    setWfTarget(target);
setPresetId("");
setJustTxt("");
    setWfOpen(true);
  };

  const submitWorkflow = useCallback(async () => {
    try {
      setPosting(true);
      const token = localStorage.getItem("jwt_token");
      const res = await fetch(`${urlGeral}catalog/${entry.id}/workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          workflow_status: wfTarget,
          detail: { justificativa: justTxt?.trim() || undefined, preset: presetId || undefined },
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Falha ao movimentar (HTTP ${res.status}).`);
      }

      toast.success(
        wfTarget === "DESFAZIMENTO"
          ? "Item aceito e movido para DESFAZIMENTO."
          : "Item recusado e movido para REJEITADOS_COMISSAO."
      );

      // remove da lista sem refetch
      onRemove?.(entry.id);
      setWfOpen(false);
    } catch (e: any) {
      toast("Erro ao movimentar item", { description: e?.message || String(e) });
    } finally {
      setPosting(false);
    }
  }, [urlGeral, entry.id, wfTarget, justTxt, presetId, onRemove]);

  return (
    <>
      <div className="flex group cursor-pointer" onClick={handleOpen}>
        {/* Barra colorida */}
        <div
          className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${
            qualisColor[csvCodTrimmed] || "bg-neutral-300"
          } min-h-full relative`}
        />

        {/* Card */}
        <div className="w-full">
          <Alert className="rounded-l-none items-center p-0 flex w-full rounded-b-none border-b-0">
            {/* Coluna info */}
            <div className="flex-1 min-w-0">
              {/* HEADER */}
              <div className="flex items-center gap-3 p-4 pb-0">
                <div className="flex items-center gap-2 mb-4 min-w-0 w-full">
                  <p className="font-semibold text-left whitespace-nowrap shrink-0">
                    {asset.asset_code?.toString().trim()} - {asset.asset_check_digit}
                  </p>

                  {hasAtm && (
                    <div className="min-w-0 flex-1">
                      <Badge variant="outline" className="truncate min-w-0" title={asset.atm_number || ""}>
                        ATM: {asset.atm_number}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* BODY */}
              <div className="flex flex-col p-4 pt-0 justify-between">
                <div className="min-w-0">
                  <div className="text-lg mb-2 font-bold">{materialName}</div>
                  <p className="text-left mb-4 uppercase">
                    {asset.asset_description || ""}
                  </p>

                  <div className="flex flex-wrap gap-3 min-w-0">
                    {!!csvCodTrimmed && (
                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                        <div
                          className={`w-4 h-4 rounded-md ${qualisColor[csvCodTrimmed] || "bg-neutral-300"}`}
                        />
                        {csvCodToText[csvCodTrimmed] || csvCodTrimmed}
                      </div>
                    )}

                    {statusInfo && (
                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                        {statusInfo.icon}
                        {statusInfo.text}
                      </div>
                    )}

                    {!!legalGuardianName && (
                      <div className="flex gap-1 items-center min-w-0">
                        <Avatar className="rounded-md h-5 w-5 shrink-0">
                          <AvatarImage
                            className="rounded-md h-5 w-5"
                            src={`${conectee}ResearcherData/Image?name=${encodeURIComponent(legalGuardianName)}`}
                          />
                          <AvatarFallback className="flex items-center justify-center">
                            <User size={10} />
                          </AvatarFallback>
                        </Avatar>

                        <p
                          className="text-sm text-gray-500 dark:text-gray-300 font-normal flex-1 min-w-0 truncate"
                          title={legalGuardianName}
                        >
                          {legalGuardianName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna carrossel */}
            <div className="p-4 w-full flex-1 max-w-[600px]">
              <div className="w-full select-none">
                <Carousel className="w-full flex gap-4 items-center">
                  <div onClick={stop}>
                    <CarouselPrevious variant="outline" />
                  </div>

                  <CarouselContent>
                    {(imageUrls.length ? imageUrls : [undefined]).map((url, index) => (
                      <CarouselItem key={url ?? index} className="w-full sm:basis-full lg:basis-1/2 xl:basis-1/3">
                        <div className="relative w-full aspect-square rounded-md overflow-hidden bg-muted" onClick={stop}>
                          {url ? (
                            <Alert
                              style={{ backgroundImage: `url(${url})` }}
                              className="absolute inset-0 h-full w-full object-cover bg-center bg-cover bg-no-repeat"
                              onClick={(e) => openImageDialog(e, url)}
                              draggable={false}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                              Sem imagens
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  <div onClick={stop}>
                    <CarouselNext variant="outline" />
                  </div>
                </Carousel>
              </div>
            </div>
          </Alert>

          {/* Barra de ações (Aceitar/Recusar) */}
          <Alert className="rounded-t-none rounded-l-none dark:bg-neutral-800/50 bg-neutral-100/50">
            <div className="flex gap-2 items-center h-full whitespace-nowrap flex-wrap">
              <p className="text-sm mr-2">Avaliação:</p>

              <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleClickAction("REJEITADOS_COMISSAO"); }}>
                <X className="h-4 w-4" /> Recusar
              </Button>

              <Button size="sm" className="bg-green-700 hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-800" onClick={(e) => { e.stopPropagation(); handleClickAction("DESFAZIMENTO"); }}>
                <Check className="h-4 w-4" /> Aceitar
              </Button>
            </div>
          </Alert>
        </div>
      </div>

      {/* Dialog de imagem */}
      <Dialog open={openImage} onOpenChange={setOpenImage}>
        <DialogContent className="max-w-5xl p-0" onClick={stop}>
          <div className="w-full">
            <div className="relative w-full max-h-[80vh]">
              {selectedImg ? (
                <img
                  src={selectedImg}
                  alt="Imagem do patrimônio"
                  className="mx-auto max-h-[75vh] w-auto object-contain"
                  draggable={false}
                />
              ) : (
                <div className="p-8 text-center text-sm text-gray-500">Nenhuma imagem selecionada</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de workflow (Aceitar/Recusar) */}
      <Dialog open={wfOpen} onOpenChange={setWfOpen}>
        <DialogContent className="">

          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium max-w-[520px]">Confirmar {wfTarget === "DESFAZIMENTO" ? "ACEITE" : "RECUSA"} do item</DialogTitle>
     
              <DialogDescription className="text-zinc-500">
                          Você está movendo o item{" "}
                          <strong>
                            {asset?.material.material_name} (
                            {`${asset?.asset_code}-${asset?.asset_check_digit}`})
                          </strong>{" "}
                          de: <strong>LTD - Lista Temporária de Desfazimento</strong> para:{" "}
                          <strong>{!(wfTarget === "DESFAZIMENTO") ? "Recusados" : "LFD - Lista Final de Desfazimento"}</strong>
                        </DialogDescription>
          </DialogHeader>

             <Separator className="my-4" />

          <div className="grid gap-4 ">
           {(wfTarget === "DESFAZIMENTO") && (
              <div className="grid gap-2">
              <Label>Modelos de justificativa (opcional)</Label>
             <Select
  value={presetId}
  onValueChange={(val) => {
    setPresetId(val);
    fillPreset(val); // atualiza imediatamente o textarea
  }}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Selecione um modelo para preencher a justificativa..." />
  </SelectTrigger>
  <SelectContent position="popper" className="z-[99999]" align="center" side="bottom" sideOffset={6}>
    {JUSTIFICATIVAS_DESFAZIMENTO.map((p) => (
      <SelectItem key={p.id} value={p.id}>
        {p.label}
      </SelectItem>
    ))}
    {/* opcional: item para “limpar” */}
    {/* <SelectItem value="">Nenhum (limpar justificativa)</SelectItem> */}
  </SelectContent>
</Select>

            </div>
           )}

            <div className="grid gap-2">
              <Label htmlFor="just">Justificativa</Label>
              <Textarea
                id="just"
                value={justTxt}
                onChange={(e) => setJustTxt(e.target.value)}
                placeholder={!(wfTarget === "DESFAZIMENTO") ? "" : "Você pode escolher um modelo acima para pré-preencher e depois ajustar aqui…"}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setWfOpen(false)}>
           <ArrowUUpLeft size={16} />       Cancelar
            </Button>
            <Button onClick={submitWorkflow} disabled={posting}>
              {posting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Salvando…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
