import { useEffect, useState } from "react";
import { Label } from "../../../ui/label";
import { FlowMode, StepBaseProps } from "../novo-item";
import { Toggle } from "../../../ui/toggle";
import { Badge } from "../../../ui/badge";
import {
  AlertCircle,
  ArrowRight,
  Barcode,
  FormInput,
  Image,
  MapPin,
  X,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../../../ui/toggle-group";
import { useIsMobile } from "../../../../hooks/use-mobile";

export function InformacoesStep({
  onValidityChange,
  step,
}: StepBaseProps<"informacoes">) {
  useEffect(() => {
    onValidityChange(true);
  }, []);
  const isMobile = useIsMobile();

  return (
    <div className="max-w-[936px] h-full mx-auto flex flex-col justify-center">
      {/* seletor do fluxo */}
      <div className="flex gap-2">
        <div className="flex justify-between items-center h-fit mt-2 w-8">
          <p className="text-lg">{step}</p>
          <ArrowRight size={16} />
        </div>
        <h1
          className={
            isMobile
              ? "mb-16 text-2xl font-semibold max-w-[1000px]"
              : "mb-16 text-4xl font-semibold max-w-[1000px]"
          }
        >
          Antes de continuar, <br />
          leia as informações abaixo:
        </h1>
      </div>

      <div className="ml-8">
        <div className="flex gap-4 flex-col">
          <div className="flex gap-2">
            <Barcode size={24} />
            <div>
              <p className="font-medium">Dados de patrimônio</p>
              <p className="text-gray-500 text-sm">
                Informe corretamente os dados do bem quando necessário. Essas
                informações serão utilizadas para validação na plataforma.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <X size={24} />
            <div>
              <p className="font-medium">Identificação do item</p>
              <p className="text-gray-500 text-sm">
                Preencha os dados manualmente apenas quando o item não possuir
                plaqueta de identificação (código ou ATM).
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <MapPin size={24} />
            <div>
              <p className="font-medium">Localização do bem</p>
              <p className="text-gray-500 text-sm">
                Caso o item não esteja no local indicado pela plataforma,
                informe sua localização (sala) atual.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Image size={24} />
            <div>
              <p className="font-medium">Imagens do patrimônio</p>
              <p className="text-gray-500 text-sm">
                Será obrigatório o envio de 4 fotos do item em diferentes
                ângulos. As orientações detalhadas serão fornecidas
                posteriormente.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <AlertCircle size={24} />
            <div>
              <p className="font-medium">Responsabilidade das informações</p>
              <p className="text-gray-500 text-sm">
                O fornecimento de dados incorretos ou imprecisos pode atrasar ou
                até inviabilizar o processo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
