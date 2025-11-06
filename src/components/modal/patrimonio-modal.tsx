import {
  Archive,
  Check,
  ChevronRight,
  CircleDollarSign,
  File,
  HelpCircle,
  Hourglass,
  MoveRight,
  User,
  X,
} from "lucide-react";
import { useIsMobile } from "../../hooks/use-mobile";
import { csvCodToText, qualisColor } from "../busca-patrimonio/patrimonio-item"; // mantém seu mapeamento BM/AE/IR/OC/RE
import { useModal } from "../hooks/use-modal-store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent } from "../ui/dialog";
import { Drawer, DrawerContent } from "../ui/drawer";
import { Button } from "../ui/button";
import { Alert } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import QRCode from "react-qr-code";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../context/context";
import { GaleriaImagens } from "./galeria-images";
import { Barcode128SVG } from "../dashboard/create-etiqueta/steps/etiqueta";
import { log } from "console";

export interface Images {
  imagens: string[];
  num_patrimonio: string;
}

// formata valor vindo como string/number
function formatCurrencyBR(value?: string | number) {
  if (value == null || value === "") return "—";
  const num = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// status do bem (campo asset_status)
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

export function PatrimonioModal() {
  const isMobile = useIsMobile();
  const { onClose, isOpen, type: typeModal, data } = useModal();
  const isModalOpen = isOpen && typeModal === "patrimonio";

  
  const { urlGeral, loggedIn } = useContext(UserContext);
  const [images, setImages] = useState<Images[]>([]);

  // ---- campos já no novo schema
  const assetCode = (data.asset_code || "").trim();
  const checkDigit = (data.asset_check_digit || "").trim();
  const atmNumber = (data.atm_number || "").trim();
  const assetStatus = (data.asset_status || "").trim();
  const assetValue = data.asset_value;
  const description = data.asset_description || "";
  const csvCode = (data.csv_code || "").trim();
  const accountingEntry = data.accounting_entry_code || "";

  const materialName = data.material?.material_name || "Sem nome";
  const materialCode = data.material?.material_code || null;

  const legalGuardianName = data.legal_guardian?.legal_guardians_name || null;
  const legalGuardianCode = data.legal_guardian?.legal_guardians_code || null;

  const unit = data.location?.sector?.agency?.unit;
  const agency = data.location?.sector?.agency;
  const sector = data.location?.sector;
  const location = data.location;

  // texto do CSV
  const csvText = csvCodToText[csvCode as keyof typeof csvCodToText] || csvCode || "—";
  const statusObj = statusMap[assetStatus];

  // cor da barrinha lateral pela classificação csv_code
  const colorClass = qualisColor[csvCode as keyof typeof qualisColor] || "bg-neutral-300";

  // URL do QR
  const qrValue = useMemo(() => {
    const codigo = assetCode ? `${assetCode}-${checkDigit}` : "";
    return `https://sistemapatrimonio.eng.ufmg.br/buscar-patrimonio?bem_cod=${data.asset_code}&bem_dgv=${data.asset_check_digit}`;
  }, [assetCode, checkDigit]);

  // Endpoint de imagens (ajuste conforme sua API real)
  // Preferi usar por ID; se não houver id, tenta por code + digit
  const imagesUrl = useMemo(() => {
    if (data?.id) return `${urlGeral}/assets/${data.id}/images`;
    if (assetCode && checkDigit)
      return `${urlGeral}/assets/images?asset_code=${encodeURIComponent(
        assetCode
      )}&asset_check_digit=${encodeURIComponent(checkDigit)}`;
    return "";
  }, [urlGeral, data?.id, assetCode, checkDigit]);

  useEffect(() => {
    let active = true;
    async function fetchImages() {
      if (!imagesUrl) return;
      try {
        const response = await fetch(imagesUrl, {
          headers: { "Content-Type": "application/json" },
        });
        const j = await response.json().catch(() => null);
        if (!active) return;
        if (j) setImages(j);
      } catch (err) {
        // silencia erros de imagem para não quebrar o modal
        console.error(err);
      }
    }
    fetchImages();
    return () => {
      active = false;
    };
  }, [imagesUrl]);

  const fullCodeFrom = (d) =>
    [d?.asset_code, d?.asset_check_digit].filter(Boolean).join("-");
  

    const fullCode = fullCodeFrom(data);

  const content = () => {
    return (
      <div className={`flex group ${isMobile ? "flex-col" : ""}`}>
        <div
          className={`${
            isMobile ? "h-3 min-h-3 rounded-t-md" : "w-3 min-w-3 rounded-l-md border-r-0"
          } dark:border-neutral-800 border border-neutral-200 ${colorClass} min-h-full relative`}
        />
        <Alert className={`${isMobile ? "rounded-t-none rounded-b-none" : "rounded-l-none"} flex flex-col flex-1 h-fit p-0`}>
          {/* Cabeçalho */}
          <div className="flex mb-1 gap-3 justify-between p-4 pb-0">
            <p className="font-semibold flex gap-3 items-center text-left mb-4 flex-1">
              {assetCode || "—"} {assetCode && " - "} {checkDigit || ""}
              {atmNumber && atmNumber !== "None" && <Badge variant={"outline"}>ATM: {atmNumber}</Badge>}
            </p>

            {!isMobile && (
              <div className="flex items-start justify-end min-w-20 gap-3">
                <Button className="h-8 w-8" variant={"outline"} onClick={() => onClose()} size={"icon"}>
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col p-4 pt-0 justify-between">
            {/* Título e descrição */}
            <div className="flex items-center gap-8 justify-between">
              <div className="flex flex-col flex-1">
                <div className="text-2xl mb-2 font-bold flex gap-2 items-center">
                  {materialName}
                 
                </div>
                <p className="text-left mb-4 uppercase">{description || "—"}</p>

                <div className="flex flex-wrap gap-3">
                  {csvCode && csvCode !== "None" && (
                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                      <div className={`w-4 h-4 rounded-md ${colorClass}`} />
                      {csvText}
                    </div>
                  )}

                  {statusObj && (
                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                      {statusObj.icon}
                      {statusObj.text}
                    </div>
                  )}

                  <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                    <CircleDollarSign size={12} />
                    Valor estimado {formatCurrencyBR(assetValue)}
                  </div>

                  {accountingEntry && (
                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                      <File size={12} />
                      Termo Resp.: {accountingEntry}
                    </div>
                  )}
                </div>

               
              </div>

              {!isMobile && <QRCode className="w-fit h-28" value={qrValue} />}
            </div>

            {/* Responsável (legal guardian) */}
            {((legalGuardianName || legalGuardianCode) && loggedIn) && (
              <>
                <Separator className="my-4" />
                <div className="flex gap-3 items-center">
                  <Avatar className="rounded-md h-10 w-10">
                    <AvatarImage className={"rounded-md h-10 w-10"} src={"" /* sem endpoint de foto */} />
                    <AvatarFallback className="flex items-center justify-center">
                      <User size={10} />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm w-fit text-gray-500">Responsável</p>
                    <p className="text-black dark:text-white font-medium text-lg">
                      {legalGuardianName}
                   
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Cadeia de localização */}
            {(unit || agency || ((sector || location) && loggedIn)) && (
              <div>
                <Separator className="my-4" />
                <div className="flex items-center flex-wrap gap-3">
                  <p className="text-sm uppercase font-bold">Localização:</p>

                  {unit && (
                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                      {unit.unit_code} - {unit.unit_name}
                    </div>
                  )}

                  {agency && (
                    <>
                      <ChevronRight size={16} />
                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                        {agency.agency_code} - {agency.agency_name}
                      </div>
                    </>
                  )}

                  {(sector && loggedIn) && (
                    <>
                      <ChevronRight size={16} />
                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                        {sector.sector_code} - {sector.sector_name}
                      </div>
                    </>
                  )}

                  {(location && loggedIn) && (
                    <>
                      <ChevronRight size={16} />
                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                        {location.location_code} - {location.location_name}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

          

            {/* Galeria de imagens */}
            <div>
              {Array.isArray(images) && images.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex gap-3">
                    <GaleriaImagens images={images} urlGeral={urlGeral} />
                  </div>
                </>
              )}

              {isMobile && (
                <>
                  <Separator className="mb-8 mt-4" />
                  <QRCode className="w-full" value={qrValue} />
                </>
              )}
            </div>
          </div>
        </Alert>
      </div>
    );
  };

  if (isMobile) {
    return (
      <Drawer open={isModalOpen} onOpenChange={onClose}>
        <DrawerContent className="p-0 m-0 border-0">{content()}</DrawerContent>
      </Drawer>
    );
  } else {
    return (
      <Dialog open={isModalOpen} onOpenChange={onClose}>
        <DialogContent className="p-0 min-w-[50vw] bg-transparent border-0">{content()}</DialogContent>
      </Dialog>
    );
  }
}
