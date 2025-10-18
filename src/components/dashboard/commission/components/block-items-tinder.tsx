import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../../../context/context";
import { Button } from "../../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Textarea } from "../../../ui/textarea";
import { Alert } from "../../../ui/alert";
import { Badge } from "../../../ui/badge";
import { Separator } from "../../../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Check, ChevronLeft, Repeat, X, Loader2, Barcode, User, Calendar } from "lucide-react";
import { toast } from "sonner";

/* ===== Tipos ===== */
type UUID = string;

export interface Material { id: UUID; material_name: string; }
export interface LegalGuardian { id: UUID; legal_guardians_name: string; }
export interface LocationDTO {
  id: UUID; location_name: string;
  sector?: { sector_name?: string; agency?: { unit?: { unit_name?: string } } };
  legal_guardian?: LegalGuardian;
}
export interface CatalogAsset {
  id: UUID;
  asset_code: string; asset_check_digit: string;
  atm_number?: string | null; serial_number?: string | null;
  asset_description?: string; item_brand?: string | null; item_model?: string | null;
  csv_code?: string;
  material?: Material; legal_guardian?: LegalGuardian; location?: LocationDTO;
}
export interface WorkflowHistoryItem {
  id: UUID;
  workflow_status: string;
  detail?: Record<string, any>;
  user?: { id: UUID; username: string; photo_url?: string | null };
  catalog_id: UUID;
  created_at: string;
}
export interface CatalogImage { id: UUID; file_path: string; }
export interface CatalogEntry {
  id: UUID;
  situation?: string;
  conservation_status?: string;
  description?: string;
  asset: CatalogAsset;
  user?: WorkflowHistoryItem["user"];
  location?: LocationDTO;
  images?: CatalogImage[];
  workflow_history: WorkflowHistoryItem[];
  created_at?: string;
}

type Props = {
  catalogs: CatalogEntry[];
  onRemove?: (catalogId: string) => void;
};

/* ===== Utils ===== */
const codeFrom = (e: CatalogEntry) =>
  [e?.asset?.asset_code, e?.asset?.asset_check_digit].filter(Boolean).join("-");

const safe = (v?: string | null) => (v ?? "").toString().trim();
const inferYear = (e?: CatalogEntry): string => {
  if (!e) return "";
  const tryYear = (s?: string | null) => safe(s).match(/(?:19|20)\d{2}/)?.[0] ?? "";
  const fromDesc = tryYear(e.asset?.asset_description);
  const fromSerial = tryYear(e.asset?.serial_number);
  const fromCreated = safe(e.created_at) ? new Date(e.created_at!).getFullYear().toString() : "";
  return fromDesc || fromSerial || fromCreated || "";
};

const varsFrom = (e: CatalogEntry) => {
  const material = safe(e.asset?.material?.material_name);
  const descricao = safe(e.asset?.asset_description);
  const marca = safe(e.asset?.item_brand);
  const modelo = safe(e.asset?.item_model);
  const patrimonio = safe(e.asset?.asset_code);
  const dgv = safe(e.asset?.asset_check_digit);
  const codigo = [patrimonio, dgv].filter(Boolean).join("-");
  const serial = safe(e.asset?.serial_number);
  const responsavel = safe(e.asset?.legal_guardian?.legal_guardians_name) || safe(e.location?.legal_guardian?.legal_guardians_name);
  const setor = safe(e.location?.sector?.sector_name);
  const unidade = safe(e.location?.sector?.agency?.unit?.unit_name);
  const ano = inferYear(e);
  const isEletronico = descricao.toLowerCase().includes("comput")
    || descricao.toLowerCase().includes("monitor")
    || descricao.toLowerCase().includes("notebook");
  return { material, descricao, marca, modelo, patrimonio, dgv, codigo, serial, responsavel, setor, unidade, ano, isEletronico };
};

/* ===== Presets de justificativa ===== */
type JustPreset = { id: string; label: string; build: (e: CatalogEntry) => string };
const JUSTIFICATIVAS_DESFAZIMENTO: JustPreset[] = [
  {
    id: "sicpat-baixado-ou-nao-localizado",
    label: "Número patrimonial baixado / não localizado no SICPAT",
    build: (e) => {
      const { material } = varsFrom(e);
      const alvo = material ? `um(a) ${material}` : "um bem";
      return `Trata-se de ${alvo} cujo número patrimonial já foi baixado ou não se encontra disponível no SICPAT; recomenda-se a baixa por não possuir valor de uso nem de venda.`;
    },
  },
  {
    id: "antigo-depreciado-in-rfb-1700-2017",
    label: "Item antigo/depreciado (≥10 anos, IN RFB nº 1.700/2017)",
    build: (e) => {
      const { material, ano } = varsFrom(e);
      const alvo = material || "bem";
      const anoTxt = ano || "[ano]";
      return `Trata-se de ${alvo} de ${anoTxt}, com mais de 10 anos de uso; conforme a IN RFB nº 1.700/2017 (depreciação por desgaste, obsolescência e uso), recomenda-se a baixa.`;
    },
  },
  {
    id: "danificado-ou-quebrado",
    label: "Item danificado/quebrado (sem condições de uso)",
    build: (e) => {
      const { material } = varsFrom(e);
      const alvo = material || "bem (mesa, armário, monitor, etc.)";
      return `Trata-se de ${alvo} danificado/quebrado, sem valor de uso ou venda. Recomenda-se o descarte.`;
    },
  },
  {
    id: "fragmento-ou-parte-de-bem",
    label: "Parte/fragmento de bem (resto de móvel/equipamento)",
    build: (e) => {
      const { material } = varsFrom(e);
      const alvo = material || "pedaço/resto de equipamento";
      return `Trata-se de ${alvo} sem patrimônio, sem valor de uso nem de venda. Recomenda-se a baixa.`;
    },
  },
  {
    id: "eletronico-antigo-ou-obsoleto",
    label: "Equipamento eletrônico antigo/obsoleto e/ou quebrado",
    build: (e) => {
      const { material, isEletronico } = varsFrom(e);
      const alvo = material || (isEletronico ? "equipamento eletrônico" : "equipamento");
      return `Trata-se de ${alvo} obsoleto/danificado, sem valor de uso nem de venda. Recomenda-se a baixa.`;
    },
  },
  {
    id: "destinacao-doacao",
    label: "Destinação: Doação",
    build: (e) => {
      const { material } = varsFrom(e);
      const alvo = material || "item";
      return `Trata-se de ${alvo} sem valor de uso para a unidade. Recomenda-se a baixa do acervo e a destinação do bem para Doação.`;
    },
  },
];

/* ===== SwipeCard ===== */
function SwipeCard({
  children,
  onSwiped,
  onCancel,
}: {
  children: (ctx: { progress: number; dragging: boolean }) => React.ReactNode;
  onSwiped: (dir: "left" | "right") => void;
  onCancel?: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [exiting, setExiting] = useState<null | "left" | "right">(null);

  const threshold = 120;

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setDx(0);
    setDy(0);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDx(e.clientX - startX);
    setDy(e.clientY - startY);
  };
  const endDrag = (vx: number) => {
    if (Math.abs(vx) > threshold) {
      const dir = vx > 0 ? "right" : "left";
      setExiting(dir);
      setTimeout(() => onSwiped(dir), 160);
    } else {
      setDragging(false);
      setDx(0);
      setDy(0);
      onCancel?.();
    }
  };
  const onPointerUp = () => endDrag(dx);

  const rotate = Math.max(Math.min(dx / 14, 18), -18);
  const style: React.CSSProperties = {
    transform: exiting
      ? `translate3d(${exiting === "right" ? 1200 : -1200}px, ${dy}px, 0) rotate(${rotate}deg)`
      : `translate3d(${dx}px, ${dy * 0.3}px, 0) rotate(${rotate}deg)`,
    transition: dragging ? "none" : exiting ? "transform 200ms ease" : "transform 200ms ease",
    touchAction: "none",
  };

  const progress = Math.max(-1, Math.min(1, dx / threshold));
  return (
    <div
      className="absolute inset-0 will-change-transform"
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {children({ progress, dragging })}
    </div>
  );
}

/* ===== Componente Principal ===== */
export function BlockItemsComissionScroll({ catalogs, onRemove }: Props) {
  const { urlGeral } = useContext(UserContext);
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") || "" : "";

  const [index, setIndex] = useState(0);
  const items = catalogs ?? [];
  const top = items[index];

  const [moveOpen, setMoveOpen] = useState(false);
  const [target, setTarget] = useState<CatalogEntry | null>(null);
  const [toKey, setToKey] = useState<"DESFAZIMENTO" | "REJEITADOS_COMISSAO" | "">("");
  const [justificativa, setJustificativa] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (moveOpen && toKey === "DESFAZIMENTO" && selectedPreset && target) {
      const preset = JUSTIFICATIVAS_DESFAZIMENTO.find(p => p.id === selectedPreset);
      if (preset) setJustificativa(preset.build(target));
    }
  }, [moveOpen, selectedPreset, target, toKey]);

  const openMove = (entry: CatalogEntry, dest: "DESFAZIMENTO" | "REJEITADOS_COMISSAO") => {
    setTarget(entry);
    setToKey(dest);
    setSelectedPreset("");
    setJustificativa("");
    setMoveOpen(true);
  };

  const closeMove = () => {
    setMoveOpen(false);
    // Se o usuário cancelar, volta o índice
    if (target) {
      setIndex((i) => Math.max(0, i - 1));
    }
    setTarget(null);
    setToKey("");
    setSelectedPreset("");
    setJustificativa("");
  };

  const postWorkflowChange = useCallback(async (entry: CatalogEntry, status: string, detail: Record<string, any>) => {
    try {
      const res = await fetch(`${urlGeral}catalog/${entry.id}/workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ workflow_status: status, detail }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Falha ao movimentar (${res.status}): ${t}`);
      }
      return true;
    } catch (e: any) {
      toast.error("Não foi possível mover o item.", { description: e?.message || "Tente novamente." });
      return false;
    }
  }, [token, urlGeral]);

  const handleConfirmMove = async () => {
    if (!target || !toKey) return;
    setPosting(true);
    const detail = { justificativa: justificativa || undefined };
    const ok = await postWorkflowChange(target, toKey, detail);
    setPosting(false);
    if (!ok) {
      // Se falhou, volta o índice
      setIndex((i) => Math.max(0, i - 1));
      return;
    }

    toast.success("Movimentação realizada com sucesso.");
    onRemove?.(target.id);
    // Não precisa avançar o índice aqui pois já foi avançado no swipe
    closeMove();
  };

  const handleSwiped = (dir: "left" | "right") => {
    const current = items[index];
    if (!current) return;
    
    // Avança o índice imediatamente para não bloquear o próximo card
    setIndex((i) => i + 1);
    
    if (dir === "right") openMove(current, "DESFAZIMENTO");
    else openMove(current, "REJEITADOS_COMISSAO");
  };

  const reject = () => top && openMove(top, "REJEITADOS_COMISSAO");
  const approve = () => top && openMove(top, "DESFAZIMENTO");
  const back = () => setIndex((i) => Math.max(0, i - 1));

  const visible = useMemo(() => items.slice(index, index + 3), [items, index]);

  const formatDateTimeBR = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return iso;
    }
  };

  const calculateDifference = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDiff = Math.abs(currentDate.getTime() - createdDate.getTime());
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const months = Math.floor(daysDiff / 30);
    const days = daysDiff % 30;

    let bgColor = "";
    if (months < 3) bgColor = "bg-green-700";
    else if (months < 6) bgColor = "bg-yellow-500";
    else bgColor = "bg-red-500";

    return { months, days, bgColor };
  };

  const buildImgUrl = (p: string) => {
    const cleanPath = p.startsWith("/") ? p.slice(1) : p;
    return `${urlGeral}${cleanPath}`;
  };

  const qualisColor: Record<string, string> = {
    BM: "bg-green-500",
    AE: "bg-red-500",
    IR: "bg-yellow-500",
    OC: "bg-blue-500",
    RE: "bg-purple-500",
  };

  const renderCardBody = (entry: CatalogEntry) => {
    const code = codeFrom(entry);
    const mat = entry.asset?.material?.material_name ?? "—";
    const desc = entry.asset?.asset_description ?? entry.description ?? "Sem descrição";
    const loc = entry.location?.location_name || entry.asset?.location?.location_name || "Sem local";
    const resp = entry.asset?.legal_guardian?.legal_guardians_name || entry.location?.legal_guardian?.legal_guardians_name || "Sem responsável";
    const imgs = entry.images ?? [];
    const csvCodTrimmed = (entry.asset?.csv_code || "").trim();
    const diff = entry.created_at ? calculateDifference(entry.created_at) : null;

    return (
      <div className="rounded-xl border bg-background shadow-lg overflow-hidden h-full flex flex-col">
        {/* Imagem com badge de tempo */}
        <div className="relative aspect-video w-full bg-zinc-100">
          {imgs.length > 0 ? (
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${buildImgUrl(imgs[0].file_path)})` }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-zinc-400">
              <Calendar size={48} />
            </div>
          )}
          
          {/* Badge de tempo no canto superior esquerdo */}
          {diff && (
            <div className="absolute top-3 left-3">
              <Badge className={`text-white h-7 px-3 text-xs font-medium ${diff.bgColor}`}>
                {diff.months > 0
                  ? `${diff.months} ${diff.months === 1 ? "mês" : "meses"} e ${diff.days} ${diff.days === 1 ? "dia" : "dias"}`
                  : `${diff.days} ${diff.days === 1 ? "dia" : "dias"}`}
              </Badge>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          {/* Cabeçalho: Material + Código + Avatar */}
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
            <p className="font-semibold text-lg truncate" title={mat}>
              {mat}
            </p>
            
            <p className="text-sm flex items-center gap-1 whitespace-nowrap text-zinc-600">
              <Barcode size={16} /> {code || entry.id.slice(0, 8)}
            </p>

            <Avatar className="h-7 w-7 rounded-md border">
              <AvatarImage src={entry.user?.photo_url ? `${urlGeral}user/upload/${entry.user.id}/icon` : undefined} />
              <AvatarFallback className="text-xs">
                <User size={14} />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Descrição */}
          <p className="text-sm text-zinc-600 line-clamp-2">
            {desc}
          </p>

          <Separator />

          {/* Informações em grid */}
          <div className="grid grid-cols-2 gap-2 text-xs flex-1">
            <div className="truncate">
              <span className="font-medium text-zinc-700">Local:</span>
              <span className="ml-1 text-zinc-600">{loc}</span>
            </div>
            <div className="truncate">
              <span className="font-medium text-zinc-700">Resp.:</span>
              <span className="ml-1 text-zinc-600">{resp}</span>
            </div>
          </div>

          {/* Data de criação */}
          {entry.created_at && (
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <Calendar size={12} />
              {formatDateTimeBR(entry.created_at)}
            </p>
          )}
        </div>

        {/* Barra colorida inferior (código CSV) */}
        <div
          className={`h-2 ${qualisColor[csvCodTrimmed as keyof typeof qualisColor] || "bg-zinc-300"}`}
        />
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Deck Tinder */}
      <div className="relative mx-auto max-w-[480px] w-full" style={{ height: 640 }}>
        {visible.length === 0 && (
          <Alert className="h-full flex items-center justify-center text-center">
            <div>
              <p className="font-medium mb-2">Nenhum item disponível</p>
              <p className="text-sm text-zinc-500">Todos os itens foram processados</p>
            </div>
          </Alert>
        )}

        {visible.map((item, i) => {
          const isTop = i === 0;
          const depth = visible.length - i;
          const scale = 1 - i * 0.04;
          const translateY = i * 12;

          return (
            <div
              key={item.id}
              className="absolute inset-0 flex items-center justify-center"
              style={{ zIndex: 10 + depth }}
            >
              <div
                className="w-full h-full"
                style={{
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  transition: "transform 200ms ease",
                }}
              >
                {isTop ? (
                  <SwipeCard onSwiped={handleSwiped}>
                    {({ progress }) => (
                      <div className="relative select-none h-full">
                        {/* Badges de swipe */}
                        {progress > 0.2 && (
                          <div className="absolute left-6 top-6 rotate-[-12deg] z-10">
                            <div className="px-4 py-2 border-4 border-green-500 text-green-600 font-bold text-xl rounded-lg bg-white/90 shadow-lg">
                              APROVAR
                            </div>
                          </div>
                        )}
                        {progress < -0.2 && (
                          <div className="absolute right-6 top-6 rotate-[12deg] z-10">
                            <div className="px-4 py-2 border-4 border-red-500 text-red-600 font-bold text-xl rounded-lg bg-white/90 shadow-lg">
                              REJEITAR
                            </div>
                          </div>
                        )}

                        {renderCardBody(item)}
                      </div>
                    )}
                  </SwipeCard>
                ) : (
                  <div className="select-none opacity-80 h-full">
                    {renderCardBody(item)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controles */}
      {top && (
        <div className="flex justify-center gap-4 mt-6">
          <Button 
            variant="outline" 
            onClick={back} 
            disabled={index === 0}
            className="h-12 px-6"
          >
            <ChevronLeft size={18} className="mr-2" /> Voltar
          </Button>
          <Button 
            variant="destructive" 
            onClick={reject}
            className="h-12 px-6"
            size="lg"
          >
            <X size={20} className="mr-2" /> Rejeitar
          </Button>
          <Button 
            onClick={approve}
            className="h-12 px-6 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Check size={20} className="mr-2" /> Aprovar
          </Button>
        </div>
      )}

      {/* Modal */}
      <Dialog open={moveOpen} onOpenChange={(open) => (open ? setMoveOpen(true) : closeMove())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2">
              Confirmar movimentação
            </DialogTitle>
            <DialogDescription className="text-base">
              Você está movendo o item{" "}
              <strong>
                {target?.asset?.material?.material_name ?? target?.id}{" "}
                {target ? `(${target.asset?.asset_code}-${target.asset?.asset_check_digit})` : ""}
              </strong>{" "}
              para:{" "}
              <strong className={toKey === "DESFAZIMENTO" ? "text-green-600" : "text-red-600"}>
                {toKey === "DESFAZIMENTO" ? "Lista Final de Desfazimento" : "Rejeitados Comissão"}
              </strong>
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="space-y-4">
            {toKey === "DESFAZIMENTO" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Modelos de justificativa (opcional)</label>
                <Select
                  value={selectedPreset}
                  onValueChange={(val) => {
                    setSelectedPreset(val);
                    if (target) {
                      const preset = JUSTIFICATIVAS_DESFAZIMENTO.find(p => p.id === val);
                      if (preset) setJustificativa(preset.build(target));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {JUSTIFICATIVAS_DESFAZIMENTO.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <label htmlFor="just" className="text-sm font-medium">
                Justificativa {toKey && <span className="text-red-500">*</span>}
              </label>
              <Textarea
                id="just"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder={toKey === "DESFAZIMENTO"
                  ? "Você pode escolher um modelo acima para pré-preencher e depois ajustar aqui…"
                  : "Descreva a justificativa da rejeição…"}
                rows={6}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="ghost" onClick={closeMove}>
              <X size={16} className="mr-2" /> Cancelar
            </Button>
            <Button 
              disabled={posting || !justificativa.trim()} 
              onClick={handleConfirmMove}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {posting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando…
                </>
              ) : (
                <>
                  <Repeat size={16} className="mr-2" /> Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}