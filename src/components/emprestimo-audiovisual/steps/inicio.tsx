import { useEffect, useState } from "react";
import { StepBaseProps, FlowMode } from "../novo-item";
import { ArrowRight, Barcode, Plus } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";
import { Alert } from "../../ui/alert";
import { Separator } from "../../ui/separator";

type InicioProps = StepBaseProps<"inicio"> & {
  initialData?: { flowShort?: FlowMode }; // já vem do pai via stepProps.inicio
};

export function InicioStep({
  onValidityChange,
  onStateChange,
  onFlowChange,
  initialData,
  step,
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
    if (initialData?.flowShort && initialData.flowShort !== flowShort) {
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
      onFlowChange?.(next); // troca a ordem das abas no pai
    }
  };

  const generateBars = (): JSX.Element[] => {
    const bars: JSX.Element[] = [];
    const widths = [1, 2, 3]; // larguras das barras em pixels

    for (let i = 0; i < 80; i++) {
      const width = widths[Math.floor(Math.random() * widths.length)];
      const isBlack = Math.random() > 0.5;
      bars.push(
        <div
          key={i}
          className={`h-8 ${isBlack ? "bg-neutral-300" : "bg-transparent"}`}
          style={{ width: `${width}px` }}
        />
      );
    }
    return bars;
  };

  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className="mb-16 text-4xl font-semibold max-w-[1000px]">
          Vamos começar! O item possui plaqueta de identificação?
        </h1>
      </div>

      <div className="ml-8">
        <Alert
          className="mb-8 flex gap-2 flex-col cursor-pointer"
          onClick={toggleOpen}
        >
          <div className="flex  gap-2 ">
            <div>
              {" "}
              <Barcode size={16} />
            </div>
            <p className="text-gray-500 text-sm">
              Não sabe o que é uma plaqueta? Clique aqui
            </p>
          </div>

          {isOpen && (
            <div className="mt-2 flex gap-4">
              <div className="p-2 border w-min rounded-xl flex flex-col items-center border-neutral-300 ">
                <p className="whitespace-nowrap font-bold text-sm uppercase px-4 text-neutral-300">
                  UFMG - Patrimônio
                </p>
                <div className="px-2 py-1 w-full">
                  <div className="flex items-center justify-center ">
                    {generateBars()}
                  </div>
                </div>
                <p className="whitespace-nowrap font-bold text- uppercase text-neutral-300">
                  xxxxxxxx-x
                </p>
              </div>

              <div className="border border-neutral-300  p-2">
                <div className=" border border-neutral-300  w-min rounded-xl flex flex-col items-center">
                  <div className="px-10  flex flex-col items-center">
                    <p className="whitespace-nowrap font-bold text-neutral-300">
                      UFMG
                    </p>
                    <p className="whitespace-nowrap font-medium text-neutral-300 text-sm">
                      Patrimônio
                    </p>
                  </div>
                  <Separator className="border-neutral-300 dark:bg-neutral-300 " />
                  <div className="px-8 py-2">
                    <p className="whitespace-nowrap font-medium text-sm text-neutral-300">
                      XXXX XXXXX X
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Alert>
        <div className="flex gap-2 mb-8">
          <Plus size={24} />
          <div>
            <p className="font-medium">Empréstimos de Itens Patrimoniados</p>
            <p className="text-gray-600 text-sm">
              Este formulário deve ser utilizado para realizar empréstimos de bens.
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
