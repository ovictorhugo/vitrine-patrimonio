import { Alert } from "../ui/alert";
import { Archive, HelpCircle, Hourglass, Maximize2, MoveRight, User, X, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useContext, useState } from "react";
import { useModal } from "../hooks/use-modal-store";
import { UserContext } from "../../context/context";
import { Asset } from "../homepage/components/item-patrimonio";

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

export function PatrimonioItem(props: any) {
  if (!props) return null;

  const csvCodTrimmed = (props.csv_code || "").toString().trim();
  const bemStaTrimmed = (props.asset_status || "").toString().trim();

  const conectee = import.meta.env.VITE_BACKEND_CONECTEE || "";
  const { onOpen } = useModal();
  const { urlGeral } = useContext(UserContext);

  const statusMap: Record<
    string,
    { text: string; icon: JSX.Element }
  > = {
    NO: { text: "Normal", icon: <Check size={12} /> },
    NI: { text: "Não inventariado", icon: <HelpCircle size={12} /> },
    CA: { text: "Cadastrado", icon: <Archive size={12} /> },
    TS: { text: "Aguardando aceite", icon: <Hourglass size={12} /> },
    MV: { text: "Movimentado", icon: <MoveRight size={12} /> },
    BX: { text: "Baixado", icon: <X size={12} /> },
  };

  const status = statusMap[bemStaTrimmed];
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const materialName = props.material?.material_name || "Sem nome";
  const legalGuardianName = props.legal_guardian?.legal_guardians_name || "";
  const hasAtm = !!(props.atm_number && props.atm_number !== "None" && props.atm_number !== "");

  return (
    <div className="flex group cursor-pointer"  onClick={(event) => {
            event.stopPropagation();
            onOpen("patrimonio", { ...props }); // envia o Asset direto para o modal
          }}>
  <div
    className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${
      qualisColor[csvCodTrimmed] || "bg-neutral-300"
    } min-h-full relative`}
  />
  <Alert className="flex flex-col flex-1 h-fit rounded-l-none p-0">
    {/* HEADER */}
    <div className="flex items-center gap-3 p-4 pb-0">
      {/* Código + dígito (sempre juntos e sem quebrar) */}
     <div className="flex items-center gap-2 mb-4">
       <p className="font-semibold text-left  whitespace-nowrap shrink-0">
        {props.asset_code?.toString().trim()} - {props.asset_check_digit}
      </p>

      {/* ATM ao lado, truncando automaticamente */}
      {hasAtm && (
        <div className="min-w-0 flex-1">
          <Badge
            variant="outline"
            className="truncate min-w-0"
            title={props.atm_number || ''}
          >
            ATM: {props.atm_number}
          </Badge>
        </div>
      )}
     </div>

   
    </div>

    {/* BODY */}
    <div className="flex flex-col p-4 pt-0 justify-between">
      <div className="min-w-0">
        <div className="text-lg mb-2 font-bold">{materialName}</div>
        <p className="text-left mb-4 uppercase">{props.asset_description || ""}</p>

        <div className="flex flex-wrap gap-3 min-w-0">
          {!!csvCodTrimmed && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              <div
                className={`w-4 h-4 rounded-md ${
                  qualisColor[csvCodTrimmed] || "bg-neutral-300"
                }`}
              />
              {csvCodToText[csvCodTrimmed] || csvCodTrimmed}
            </div>
          )}

          {status && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              {status.icon}
              {status.text}
            </div>
          )}

          {!!legalGuardianName && (
            <div className="flex gap-1 items-center min-w-0">
              <Avatar className="rounded-md h-5 w-5 shrink-0">
                <AvatarImage
                  className="rounded-md h-5 w-5"
                  src={`${conectee}ResearcherData/Image?name=${encodeURIComponent(
                    legalGuardianName
                  )}`}
                />
                <AvatarFallback className="flex items-center justify-center">
                  <User size={10} />
                </AvatarFallback>
              </Avatar>

              {/* Nome ocupa espaço natural, só trunca se não couber */}
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
  </Alert>
</div>


  );
}
