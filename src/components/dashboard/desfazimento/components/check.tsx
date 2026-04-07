import { useEffect, useState } from "react";
import { StepBaseProps } from "./pesquisa";
import { ArrowRight } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../../../ui/toggle-group";
import { useIsMobile } from "../../../../hooks/use-mobile";

type InicioProps = StepBaseProps<"check"> & {
  initialData?: boolean;
  onFlowChange?: (val: boolean) => void;
};

export function CheckStep({
  onValidityChange,
  onStateChange,
  onFlowChange,
  initialData,
  step,
}: InicioProps) {
  const [checked, setChecked] = useState<boolean>(initialData ?? false);

  useEffect(() => {
    onValidityChange(true);
  }, [onValidityChange]);

  // Ao montar: se o pai ainda NÃO tem nada salvo, persistir o valor inicial no pai
  useEffect(() => {
    if (initialData === undefined) {
      onStateChange?.(false);
      onFlowChange?.(false);
    }
  }, [initialData, onStateChange, onFlowChange]);

  // Mudar imediatamente no pai quando o usuário clicar
  const handleChange = (val: string) => {
    // Evita que o usuário "desmarque" a opção clicando nela novamente (comportamento padrão do Radix)
    if (!val) return;

    // Transforma a string recebida de volta em booleano
    const newCheckedValue = val === "true";

    setChecked(newCheckedValue);
    onStateChange?.(newCheckedValue);
    onFlowChange?.(newCheckedValue);
  };

  const isMobile = useIsMobile();

  return (
    <div className={"mt-8 mx-auto flex flex-col justify-center"}>
      <div className="flex gap-2">
        <div className="flex justify-center items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className={"mb-8 text-4xl font-semibold"}>
          Último passo! Este item já foi coletado?
        </h1>
      </div>

      <div className="justify-center">
        <ToggleGroup
          type="single"
          // Convertendo o estado booleano para string apenas para o ToggleGroup ler
          value={checked ? "true" : "false"}
          onValueChange={handleChange}
          className="gap-2 justify-center"
          variant="outline"
        >
          {/* Values em formato de string correspondendo aos booleanos */}
          <ToggleGroupItem value="true" aria-label="Coletado">
            Sim, já foi coletado
          </ToggleGroupItem>
          <ToggleGroupItem value="false" aria-label="Não coletado">
            Não, ainda terei que coletar
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
