import {
  ArrowRight,
  BadgePercent,
  Hammer,
  LucideIcon,
  MousePointerClick,
  PackageOpen,
  Recycle,
} from "lucide-react";
import { StepBaseProps } from "../novo-item";
import { useEffect, useMemo, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../../../ui/toggle-group";
import { Alert } from "../../../ui/alert";

// Use o mesmo union do StepPropsMap["estado"].estado_previo
type EstadoKind = "quebrado" | "ocioso" | "anti-economico" | "recuperavel";

const DESCRICOES: Record<
  EstadoKind,
  { titulo: string; exemplo: string; texto: string; Icon: LucideIcon }
> = {
  ocioso: {
    titulo: "Bom Estado",
    exemplo:
      "Computadores novos e semi-novos. Mesas e cadeiras em bom estado mas sem uso.",
    texto:
      "Bem permanente em condições de uso, porém sem aproveitamento funcional no setor em que se encontra, carecendo de realocação ou destinação.",
    Icon: PackageOpen,
  },
  recuperavel: {
    titulo: "Recuperável",
    exemplo:
      "Projetor com lâmpada queimada (troca barata em relação ao preço do projetor). Cadeira com estofado rasgado, mas estrutura em bom estado.",
    texto:
      "É um bem que não pode ser usado no momento, mas que pode ser consertado com um custo viável.",
    Icon: Recycle,
  },
  "anti-economico": {
    titulo: "Antieconômico",
    exemplo:
      "Impressora antiga que consome toners caros ou peças raras. Equipamento de laboratório ultrapassado, que funciona mas gera custos altos de manutenção em comparação a um modelo novo.",
    texto:
      "É um bem que funciona, mas cujo uso não compensa economicamente porque a manutenção é cara, a eficiência é baixa ou o equipamento ficou obsoleto.",
    Icon: BadgePercent,
  },
  quebrado: {
    titulo: "Irrecuperável",
    exemplo:
      "Monitores de tubo. Microcomputador queimado com placa-mãe inutilizada. Móveis quebrados, sem possibilidade de reparo seguro. Equipamentos enferrujados, com estrutura comprometida.",
    texto:
      "É um bem que não tem mais condições de uso, porque perdeu suas características essenciais ou porque o reparo custaria mais de 50% do valor de mercado.",
    Icon: Hammer,
  },
};

export function EstadoStep({
  onValidityChange,
  onStateChange,
  estado_previo, // reidratação vem daqui
  step,
}: StepBaseProps<"estado">) {
  // estado local sempre refletindo o pai
  const [estado, setEstado] = useState<EstadoKind>(estado_previo ?? "ocioso");

  // Re-hidrata quando o pai muda (ex.: usuário volta de outra aba)
  useEffect(() => {
    if (estado_previo && estado_previo !== estado) {
      setEstado(estado_previo);
    }
  }, [estado_previo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Etapa válida (sempre há um estado selecionado)
  useEffect(() => {
    onValidityChange(true);
  }, [onValidityChange]);

  // Propaga no formato esperado pelo Wizard: { estado_previo: '...' }
  useEffect(() => {
    onStateChange?.({ estado_previo: estado });
  }, [estado, onStateChange]);

  const info = useMemo(() => DESCRICOES[estado], [estado]);
  const ItIcon = info.Icon;

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      {/* Cabeçalho */}
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1 className="mb-16 text-4xl font-semibold max-w-[1000px]">
          Indique qual a situação atual do item de acordo com as definições
          abaixo:
        </h1>
      </div>

      {/* Descrição dinâmica */}
      <div className="ml-8">
        {isOpen && (
          <Alert className="mb-8 flex items-center gap-2">
            <div>
              {" "}
              <MousePointerClick size={16} />
            </div>
            <p className="text-gray-500 text-sm">
              Clique em uma situação de conservação para ver mais detalhes.
            </p>
          </Alert>
        )}

        <div className="flex gap-4 flex-col mb-8">
          <div className="flex gap-2">
            <ItIcon size={24} />
            <div>
              <p className="font-medium">{info.titulo}</p>
              <p className="text-gray-500 text-sm">{info.texto}</p>

              <Alert className="p-4 mt-4">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Exemplos:</span> {info.exemplo}
                </p>
              </Alert>
            </div>
          </div>
        </div>

        {/* Opções */}
        <ToggleGroup
          type="single"
          value={estado}
          onValueChange={(val) => {
            if (
              val === "anti-economico" ||
              val === "recuperavel" ||
              val === "quebrado" ||
              val === "ocioso"
            ) {
              setEstado(val as EstadoKind);
              setIsOpen(false);
            }
          }}
          className="grid grid-cols-2 md:grid-cols-4 w-full gap-2"
          variant="outline"
        >
          <ToggleGroupItem
            className="aspect-square w-full flex flex-col items-center justify-center gap-2 h-auto text-center"
            value="ocioso"
            aria-label="Bem ocioso"
          >
            <PackageOpen size={32} />
            <div className="flex gap-1 items-center">
              <div className="h-3 w-3 rounded-sm bg-green-500"></div>
              <p className="text-sm">Bom estado</p>
            </div>
          </ToggleGroupItem>

          <ToggleGroupItem
            className="aspect-square w-full flex flex-col items-center justify-center gap-2 h-auto text-center"
            value="recuperavel"
            aria-label="Bem recuperável"
          >
            <Recycle size={32} />
            <div className="flex gap-1 items-center">
              <div className="h-3 w-3 rounded-sm bg-green-500"></div>
              <p className="text-sm">Recuperável</p>
            </div>
          </ToggleGroupItem>

          <ToggleGroupItem
            className="aspect-square w-full flex flex-col items-center justify-center gap-2 h-auto text-center"
            value="anti-economico"
            aria-label="Bem antieconômico"
          >
            <BadgePercent size={32} />
            <div className="flex gap-1 items-center">
              <div className="h-3 w-3 rounded-sm bg-red-500"></div>
              <p className="text-sm">Antieconômico</p>
            </div>
          </ToggleGroupItem>

          <ToggleGroupItem
            className="aspect-square w-full flex flex-col items-center justify-center gap-2 h-auto text-center"
            value="quebrado"
            aria-label="Bem quebrado/inservível"
          >
            <Hammer size={32} />
            <div className="flex gap-1 items-center">
              <div className="h-3 w-3 rounded-sm bg-red-500"></div>
              <p className="text-sm">Irrecuperável</p>
            </div>
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex gap-4 mt-8">
          <div className="flex gap-1 items-center">
            <div className="h-3 w-3 rounded-sm bg-green-500"></div>
            <p className="text-sm font-medium text-gray-500">
              Avaliação para Vitrine
            </p>
          </div>

          <div className="flex gap-1 items-center">
            <div className="h-3 w-3 rounded-sm bg-red-500"></div>
            <p className="text-sm font-medium text-gray-500">
              Avaliação para Desfazimento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
