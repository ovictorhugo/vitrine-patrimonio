import { useEffect, useState } from "react";
import { StepBaseProps, FlowMode } from "../novo-item";
import { ArrowRight, Plus } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../../../ui/toggle-group";
import { Alert } from "../../../ui/alert";

type InicioProps = StepBaseProps<"inicio"> & {
  initialData?: { flowShort?: FlowMode }; // já vem do pai via stepProps.inicio
};

export function InicioStep({
  onValidityChange,
  onStateChange,
  onFlowChange,
  initialData,
  step
}: InicioProps) {
  // 1) estado local começa pelo que veio do pai, senão 'vitrine'
  const [flowShort, setFlowShort] = useState<FlowMode>(
    initialData?.flowShort ?? "vitrine"
  );

  // 2) validade sempre true
  useEffect(() => {
    onValidityChange(true);
  }, [onValidityChange]);

  // 3) reidratar UI se o pai atualizar/possuir flow salvo
  useEffect(() => {
    if (
      initialData?.flowShort &&
      initialData.flowShort !== flowShort
    ) {
      setFlowShort(initialData.flowShort);
    }
  }, [initialData?.flowShort]); // eslint-disable-line react-hooks/exhaustive-deps

  // 4) ao montar: se o pai ainda NÃO tem nada salvo, persistir o valor inicial no pai
  useEffect(() => {
    if (initialData?.flowShort === undefined) {
      onStateChange?.({ flowShort });
      onFlowChange?.(flowShort);
    }
    // montou -> checa só uma vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 5) mudar imediatamente no pai quando o usuário clicar
  const handleChange = (val: string) => {
    if (val === "vitrine" || val === "desfazimento") {
      const next = val as FlowMode;
      setFlowShort(next);
      onStateChange?.({ flowShort: next }); // salva no wizard.inicio
      onFlowChange?.(next);                  // troca a ordem das abas no pai
    }
  };

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className="mb-16 text-4xl font-semibold max-w-[700px]">
          Vamos começar! O item possui plaqueta de identificação?
        </h1>
      </div>

      <div className="ml-8">
      <div className="flex gap-2 mb-8">
  <Plus size={24}/>
  <div>
  <p className="font-medium">Anúncio de Itens Patrimoniados</p>
    <p className="text-gray-600 text-sm">
      Este formulário deve ser utilizado para cadastrar bens que serão anunciados
      no processo de <span className="font-semibold">desfazimento</span> ou na
      <span className="font-semibold"> vitrine de patrimônio</span>.
    </p>
  </div>
</div>
        <ToggleGroup
          type="single"
          value={flowShort}
          onValueChange={handleChange}
          className="gap-2 justify-start"
          variant="outline"
        >
          <ToggleGroupItem value="vitrine" aria-label="Fluxo vitrine">
            Sim, possui plaqueta
          </ToggleGroupItem>
          <ToggleGroupItem value="desfazimento" aria-label="Fluxo desfazimento">
            Não, terei que cadastrar as informações manualmente
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
