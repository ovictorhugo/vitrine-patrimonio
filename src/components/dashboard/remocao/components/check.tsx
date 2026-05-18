import { useEffect, useState } from "react";
import { StepBaseProps } from "../../novo-item/novo-item";
import { ArrowRight } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../../../ui/toggle-group";
import { useIsMobile } from "../../../../hooks/use-mobile";
import { Input } from "../../../ui/input";

type InicioProps = StepBaseProps<"check"> & {
  initialData?: { isChecked: boolean; comment: string };
  onFlowChange?: (val: boolean) => void;
};

export function CheckStep({
  onValidityChange,
  onStateChange,
  onFlowChange,
  initialData,
  step,
}: InicioProps) {
  const [checked, setChecked] = useState<boolean>(
    initialData?.isChecked ?? false,
  );
  const [commentValue, setCommentValue] = useState<string>(
    initialData?.comment ?? "",
  );

  useEffect(() => {
    onValidityChange(true);
  }, [onValidityChange]);

  useEffect(() => {
    if (initialData === undefined) {
      onStateChange?.({ isChecked: false, comment: "" });
      onFlowChange?.(false);
    }
  }, [initialData, onStateChange, onFlowChange]);

  const handleToggleChange = (val: string) => {
    if (!val) return;

    const newCheckedValue = val === "true";

    setChecked(newCheckedValue);
    onStateChange?.({ isChecked: newCheckedValue, comment: commentValue });
    onFlowChange?.(newCheckedValue);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newComment = e.target.value;

    setCommentValue(newComment);
    onStateChange?.({ isChecked: checked, comment: newComment });
  };

  return (
    <div className={"px-8 mx-auto flex flex-col justify-center h-full"}>
      <div className="flex gap-3">
        <div className="flex justify-center items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className={"text-4xl font-semibold"}>
          Último passo! Este item já foi coletado?
        </h1>
      </div>

      <div className="justify-center w-full flex flex-col h-full">
        <ToggleGroup
          type="single"
          value={checked ? "true" : "false"}
          onValueChange={handleToggleChange}
          className="gap-2 justify-center"
          variant="outline"
        >
          <ToggleGroupItem
            value="true"
            aria-label="Coletado"
          >
            Sim, já foi coletado
          </ToggleGroupItem>
          <ToggleGroupItem
            value="false"
            aria-label="Não coletado"
          >
            Não, ainda terei que coletar
          </ToggleGroupItem>
        </ToggleGroup>

        <Input
          placeholder="Observações"
          value={commentValue}
          onChange={handleCommentChange}
          className="my-8 justify-center"
        />
      </div>
    </div>
  );
}
