// src/components/movimentacao/MovimentacaoModalCatalog.tsx
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Check, CheckIcon, ChevronsUpDown, LoaderCircle, Trash, Undo2 } from "lucide-react";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Alert } from "../../ui/alert";
import { useModal } from "../../hooks/use-modal-store";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../ui/command";
import { cn } from "../../../lib";
import { JUSTIFICATIVAS_DESFAZIMENTO } from "../../dashboard/itens-vitrine/JUSTIFICATIVAS_DESFAZIMENTO";
import { CatalogEntry } from "../../dashboard/itens-vitrine/itens-vitrine";

/* ===== Tipos mínimos ===== */
type UUID = string;
type MaterialDTO = { id: UUID; material_code: string; material_name: string };
type AssetDTO = {
  id: UUID;
  asset_code: string;
  asset_check_digit: string;
  atm_number?: string | null;
  asset_description?: string | null;
  item_brand?: string | null;
  item_model?: string | null;
  serial_number?: string | null;
  material?: MaterialDTO | null;
};
export type WorkflowEvent = {
  id: UUID;
  detail?: Record<string, any>;
  workflow_status: string;
  created_at: string;
  user?: { id: UUID; username?: string; email?: string; photo_url?: string | null } | null;
};
export type CatalogResponseDTO = {
  id: UUID;
  created_at: string;
  situation: string;
  conservation_status?: string | null;
  description?: string | null;
  asset: AssetDTO;
  user?: { id: UUID; username: string; email: string } | null;
  images?: Array<{ id: UUID; catalog_id: UUID; file_path: string }>;
  workflow_history?: WorkflowEvent[];
};

/* ===== Labels ===== */
const WORKFLOW_STATUS_LABELS: Record<string, string> = {
  STARTED: "Iniciado",
  REVIEW_REQUESTED_VITRINE: "Avaliação S. Patrimônio - Vitrine",
  ADJUSTMENT_VITRINE: "Ajustes - Vitrine",
  VITRINE: "Anunciados",
  AGUARDANDO_TRANSFERENCIA: "Aguardando Transferência",
  TRANSFERIDOS: "Transferidos",
  REVIEW_REQUESTED_DESFAZIMENTO: "Avaliação S. Patrimônio - Desfazimento",
  ADJUSTMENT_DESFAZIMENTO: "Ajustes - Desfazimento",
  REVIEW_REQUESTED_COMISSION: "LTD - Lista Temporária de Desfazimento",
  REJEITADOS_COMISSAO: "Recusados",
  DESFAZIMENTO: "LFD - Lista Final de Desfazimento",
  DESCARTADOS: "Processo Finalizado",
};

/* ===== Regras por workflow ===== */
type ColumnRule = {
  requireJustification?: boolean;
  extraFields?: Array<{ name: string; label: string; type: "text" | "textarea"; placeholder?: string; required?: boolean }>;
};
const COLUMN_RULES_MODAL: Record<string, ColumnRule> = {
  REVIEW_REQUESTED_VITRINE: { requireJustification: false },
  ADJUSTMENT_VITRINE: { requireJustification: true },
  VITRINE: { requireJustification: false },
  AGUARDANDO_TRANSFERENCIA: {
    requireJustification: true,
    extraFields: [{ name: "contato", label: "Contato Solicitante", type: "text", placeholder: "Nome/ramal/e-mail" }],
  },
  TRANSFERIDOS: { requireJustification: true },
  REVIEW_REQUESTED_DESFAZIMENTO: { requireJustification: false },
  ADJUSTMENT_DESFAZIMENTO: { requireJustification: true },
  REVIEW_REQUESTED_COMISSION: { requireJustification: true },
  REJEITADOS_COMISSAO: { requireJustification: true },
  DESFAZIMENTO: { requireJustification: true },
  DESCARTADOS: { requireJustification: true },
};

/* ===== Lista para o Select ===== */
const WORKFLOWS_ALL: Array<{ key: string; name: string }> = [
  { key: "REVIEW_REQUESTED_VITRINE", name: WORKFLOW_STATUS_LABELS.REVIEW_REQUESTED_VITRINE },
  { key: "ADJUSTMENT_VITRINE", name: WORKFLOW_STATUS_LABELS.ADJUSTMENT_VITRINE },
  { key: "VITRINE", name: WORKFLOW_STATUS_LABELS.VITRINE },
  { key: "AGUARDANDO_TRANSFERENCIA", name: WORKFLOW_STATUS_LABELS.AGUARDANDO_TRANSFERENCIA },
  { key: "TRANSFERIDOS", name: WORKFLOW_STATUS_LABELS.TRANSFERIDOS },
  { key: "REVIEW_REQUESTED_DESFAZIMENTO", name: WORKFLOW_STATUS_LABELS.REVIEW_REQUESTED_DESFAZIMENTO },
  { key: "ADJUSTMENT_DESFAZIMENTO", name: WORKFLOW_STATUS_LABELS.ADJUSTMENT_DESFAZIMENTO },
  { key: "REVIEW_REQUESTED_COMISSION", name: WORKFLOW_STATUS_LABELS.REVIEW_REQUESTED_COMISSION },
  { key: "REJEITADOS_COMISSAO", name: WORKFLOW_STATUS_LABELS.REJEITADOS_COMISSAO },
  { key: "DESFAZIMENTO", name: WORKFLOW_STATUS_LABELS.DESFAZIMENTO },
  { key: "DESCARTADOS", name: WORKFLOW_STATUS_LABELS.DESCARTADOS },
];

/* ===== Presets de justificativa (para DESFAZIMENTO) ===== */
type JustPreset = { id: string; label: string; build: (c: CatalogResponseDTO) => string };
const safeTxt = (v?: string | null) => (v ?? "").toString().trim();
const varsFromCatalog = (d: CatalogResponseDTO) => {
  const material = safeTxt(d.asset?.material?.material_name);
  const desc = safeTxt(d.asset?.asset_description);
  const isEletronico = /comput|monitor|notebook|impressora/i.test(desc);
  const ano = (() => {
    const m = desc.match(/(?:19|20)\d{2}/)?.[0];
    try { return m || new Date(d.created_at).getFullYear().toString(); } catch { return m || ""; }
  })();
  return { material, isEletronico, ano };
};

type WorkflowOption = { key: string; name: string };

function WorkflowCombobox({
  items,
  value,
  onChange,
  placeholder = "Selecione o status de destino...",
  triggerClassName = "w-full justify-between",
  disabled = false,
}: {
  items: WorkflowOption[];
  value?: string | null;
  onChange: (key: string | null) => void;
  placeholder?: string;
  triggerClassName?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = items.find((i) => i.key === value) || null;

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={triggerClassName}
        >
          <span className="truncate text-left">
            {selected ? selected.name : <span className="text-muted-foreground">{placeholder}</span>}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent   className="z-[99999] p-0 w-full"  side="bottom" >
        <Command>
          <CommandInput  />
          <CommandList className="max-h-64">
            <CommandEmpty>Nenhum status encontrado</CommandEmpty>

            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Trash className="mr-2 h-4 w-4 opacity-60" />
                <span className="text-muted-foreground">Limpar seleção</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup>
              {items.map((it) => {
                const isSelected = it.key === value;
                return (
                  <CommandItem
                    key={it.key}
                    value={`${it.name} ${it.key}`}
                    onSelect={() => {
                      onChange(it.key);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn?.(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      ) ?? (isSelected ? "mr-2 h-4 w-4 opacity-100" : "mr-2 h-4 w-4 opacity-0")}
                    />
                    <span className="truncate">{it.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


/* ===== Props ===== */
export interface MovimentacaoModalCatalogProps {
  catalog: CatalogEntry
  urlGeral: string;
  token?: string;
  onUpdated?: (updated: CatalogResponseDTO) => void;
}

/* ===== Componente ===== */
export function MovimentacaoModalCatalog({ catalog, urlGeral, token: tokenProp, onUpdated }: MovimentacaoModalCatalogProps) {
  const token = useMemo(() => tokenProp ?? (typeof window !== "undefined" ? localStorage.getItem("jwt_token") ?? "" : ""), [tokenProp]);

  const lastWorkflow = useMemo<WorkflowEvent | null>(() => {
    const hist = catalog?.workflow_history ?? [];
    if (!hist.length) return null;
    return hist.reduce((a, b) => (new Date(a.created_at) > new Date(b.created_at) ? a : b));
  }, [catalog?.workflow_history]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [justModal, setJustModal] = useState("");
  const [extraValuesModal, setExtraValuesModal] = useState<Record<string, string>>({});
  const [selectedPresetModal, setSelectedPresetModal] = useState("");
  const [postingMove, setPostingMove] = useState(false);

  const rulesForModal = (key?: string): ColumnRule => (!key ? {} : COLUMN_RULES_MODAL[key] || {});

  useEffect(() => {
    if (lastWorkflow?.workflow_status) {
      setSelectedWorkflow(lastWorkflow.workflow_status);
      setJustModal("");
      setExtraValuesModal({});
      setSelectedPresetModal("");
    } else {
      setSelectedWorkflow("");
    }
  }, [lastWorkflow?.workflow_status]);

  const postWorkflowChangeInline = useCallback(async () => {
    if (!catalog || !selectedWorkflow) return false;
    try {
      const payload = {
        workflow_status: selectedWorkflow.trim(),
        detail: { justificativa: justModal || undefined, ...extraValuesModal },
      };
      const res = await fetch(`${urlGeral}catalog/${catalog.id}/workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Erro ao atualizar workflow");
      }
      return true;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }, [catalog?.id, selectedWorkflow, justModal, extraValuesModal, token, urlGeral]);

  const {onClose} = useModal()
  const handleConfirmMoveInline = async () => {
    setPostingMove(true);
    const ok = await postWorkflowChangeInline();
    setPostingMove(false);

    if (ok) {
      // cria evento local
      const ev: WorkflowEvent = {
        id: crypto.randomUUID() as UUID,
        workflow_status: selectedWorkflow,
        created_at: new Date().toISOString(),
        detail: { justificativa: justModal || undefined, ...extraValuesModal },
        user: null,
      };
      const updated: CatalogResponseDTO = {
        ...catalog,
        workflow_history: [ev, ...(catalog.workflow_history ?? [])],
      };

      // 1) atualiza o catálogo no pai
      onUpdated?.(updated);

      // 2) notifica todas as listas/boards para remover o item do bloco atual
      try {
        window.dispatchEvent(
          new CustomEvent("catalog:workflow-updated", {
            detail: { id: catalog.id, newStatus: selectedWorkflow },
          })
        );
      } catch {}

      toast.success("Movimentação realizada com sucesso.");
      setJustModal("");
      setExtraValuesModal({});
      setSelectedPresetModal("");
      onClose()
    } else {
      toast.error("Não foi possível mover o item.");
    }
  };

  const handleResetInline = () => {
    setSelectedWorkflow(lastWorkflow?.workflow_status ?? "");
    setJustModal("");
    setExtraValuesModal({});
    setSelectedPresetModal("");
  };

  return (
    <div className="space-y-4">
   
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Movimentação</Label>
          <WorkflowCombobox
    items={WORKFLOWS_ALL}
    value={selectedWorkflow}
    onChange={(val) => {
      setSelectedWorkflow(val ?? "");
      setJustModal("");
      setExtraValuesModal({});
      setSelectedPresetModal("");
    }}
    placeholder="Selecione o status de destino..."
  />
        </div>

        {selectedWorkflow === "DESFAZIMENTO" && (
          <div className="grid gap-2">
            <Label>Modelos de justificativa (opcional)</Label>
            <Select
              value={selectedPresetModal}
              onValueChange={(val) => {
                setSelectedPresetModal(val);
                const preset = JUSTIFICATIVAS_DESFAZIMENTO.find((p) => p.id === val);
                if (preset && catalog) setJustModal(preset.build(catalog));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue  />
              </SelectTrigger>
              <SelectContent position="popper" align="start" sideOffset={6} className="z-[99999]">
                {JUSTIFICATIVAS_DESFAZIMENTO.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {rulesForModal(selectedWorkflow).requireJustification && (
          <div className="grid gap-2">
            <Label htmlFor="just-inline">Justificativa</Label>
            <Textarea
              id="just-inline"
              value={justModal}
              onChange={(e) => setJustModal(e.target.value)}
              placeholder={selectedWorkflow === "DESFAZIMENTO" ? "Você pode escolher um modelo acima e ajustar aqui…" : "Descreva a justificativa para a movimentação…"}
            />
          </div>
        )}

        {(rulesForModal(selectedWorkflow).extraFields ?? []).map((f) => (
          <div className="grid gap-2" key={f.name}>
            <Label htmlFor={`extra-${f.name}`}>{f.label}</Label>
            {f.type === "textarea" ? (
              <Textarea
                id={`extra-${f.name}`}
                value={extraValuesModal[f.name] ?? ""}
                onChange={(e) => setExtraValuesModal((s) => ({ ...s, [f.name]: e.target.value }))}
                placeholder={f.placeholder}
              />
            ) : (
              <Input
                id={`extra-${f.name}`}
                value={extraValuesModal[f.name] ?? ""}
                onChange={(e) => setExtraValuesModal((s) => ({ ...s, [f.name]: e.target.value }))}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="ghost" onClick={handleResetInline}>
            <Undo2 className="mr-2 h-4 w-4" /> Limpar alterações
          </Button>
          <Button disabled={postingMove || !selectedWorkflow} onClick={handleConfirmMoveInline}>
            {postingMove ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Salvando…
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Confirmar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MovimentacaoModalCatalog;
