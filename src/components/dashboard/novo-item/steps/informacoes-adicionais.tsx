import { AlertTriangle, ArrowRight, CheckCircle, WrenchIcon } from "lucide-react";
import { StepBaseProps } from "../novo-item";
import { useEffect, useMemo, useState } from "react";
import { Textarea } from "../../../ui/textarea";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { CheckSquareOffset } from "phosphor-react";

type InfoAdicionaisLocal = {
  observacao?: string;
  situacao?: string;
};

type EstadoKind = "quebrado" | "ocioso" | "anti-economico" | "recuperavel";

export function InformacoesAdicionaisStep({
  onValidityChange,
  step,
  onStateChange,
  flowShort,     // recebido do pai (não influencia mais a regra)
  initialData,   // reidratação
  estadoAtual,   // estado vindo do passo "Estado"
}: StepBaseProps<"informacoes-adicionais"> & { estadoAtual?: EstadoKind }) {
  const [observacao, setObservacao] = useState(initialData?.observacao ?? "");
  const [situacao, setSituacao] = useState(initialData?.situacao ?? "");

  // ✅ Nova regra: exibe Select SOMENTE se estadoAtual for "ocioso" ou "recuperavel"
  const shouldShowSituacao = estadoAtual === "ocioso" || estadoAtual === "recuperavel";

  // Se deixar de exibir o select, limpamos a situação para não persistir valor oculto
  useEffect(() => {
    if (!shouldShowSituacao && situacao) setSituacao("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowSituacao]);

  // Validação condicional
  useEffect(() => {
    const obsOk = observacao.trim().length > 5;              // Observação obrigatória (mín. 6 caracteres)
    const sitOk = shouldShowSituacao ? situacao !== "" : true; // Situação obrigatória apenas quando o select aparece
    onValidityChange(obsOk && sitOk);
  }, [observacao, situacao, shouldShowSituacao, onValidityChange]);

  // Propaga para o pai
  useEffect(() => {
    onStateChange?.({ observacao, situacao });
  }, [observacao, situacao, onStateChange]);

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className="mb-16 text-4xl font-semibold max-w-[700px]">
         Forneça algumas informações adicionais...
        </h1>
      </div>

      <div className="ml-8">
        <div className="flex flex-col gap-4 w-full">
          {/* Estado de conservação — somente se shouldShowSituacao === true */}
          {shouldShowSituacao && (
            <div className="grid gap-3 w-full">
              <Label>Estado de conservação</Label>
              <div className="flex items-center gap-3">
                <Select value={situacao} onValueChange={setSituacao}>
                  <SelectTrigger id="condicao" className="items-start [&_[data-description]]:hidden">
                    <SelectValue 
                   />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excelente estado">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <CheckCircle className="size-5 text-green-500" />
                        <div className="grid gap-0.5">
                          <p className="font-medium whitespace-nowrap">Excelente estado</p>
                          <p className="text-xs text-muted-foreground" data-description>
                            Bem em perfeitas condições, completo, com todos os acessórios essenciais.
                          </p>
                        </div>
                      </div>
                    </SelectItem>

                    <SelectItem value="Semi-novo">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <CheckSquareOffset className="size-5 text-emerald-500" />
                        <div className="grid gap-0.5">
                          <p className="font-medium whitespace-nowrap">Semi-novo</p>
                          <p className="text-xs text-muted-foreground" data-description>
                            Bem em ótimo estado de funcionamento, com sinais leves de uso ou com acessório
                            secundário faltando, sem comprometer o uso principal.
                          </p>
                        </div>
                      </div>
                    </SelectItem>

                  

                    <SelectItem value="Necessita de pequenos reparos">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <WrenchIcon className="size-5 text-orange-500" />
                        <div className="grid gap-0.5">
                          <p className="font-medium whitespace-nowrap">Pequenos reparos</p>
                          <p className="text-xs text-muted-foreground" data-description>
                            Funcional, mas precisa de manutenção leve.
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="grid gap-3 w-full">
            <Label htmlFor="observacoes">Justificativa (por que o item está sendo disponibilizado?)*</Label>
            <div className="flex items-center">
              <Textarea
                id="observacoes"
                className="w-full"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
