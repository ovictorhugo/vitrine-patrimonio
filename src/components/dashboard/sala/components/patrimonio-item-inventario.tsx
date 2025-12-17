import { Alert } from "../../../ui/alert";
import {
  Archive,
  HelpCircle,
  Hourglass,
  MoveRight,
  User,
  X,
  Check,
  Maximize2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { ToggleGroup, ToggleGroupItem } from "../../../ui/toggle-group";
import { Textarea } from "../../../ui/textarea";
import { useContext, useState } from "react";
import { UserContext } from "../../../../context/context";
// ajuste o caminho se necessário
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { useModal } from "../../../hooks/use-modal-store";
import { AssetDTO } from "../../collection/collection-page";

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

const statusMap: Record<string, { text: string; icon: JSX.Element }> = {
  NO: { text: "Normal", icon: <Check size={12} /> },
  NI: { text: "Não inventariado", icon: <HelpCircle size={12} /> },
  CA: { text: "Cadastrado", icon: <Archive size={12} /> },
  TS: { text: "Aguardando aceite", icon: <Hourglass size={12} /> },
  MV: { text: "Movimentado", icon: <MoveRight size={12} /> },
  BX: { text: "Baixado", icon: <X size={12} /> },
};

type Props = {
  invId: string;
  asset: AssetDTO;
  sel: string; // "OC" | "QB" | "NE" | "SP" | ""
  comm: string;
  isLocked: boolean;
  onStatusChange: (value: string) => void;
  onCommentChange: (value: string) => void;
};

export function PatrimonioItem({
  invId,
  asset,
  sel,
  comm,
  isLocked,
  onStatusChange,
  onCommentChange,
}: Props) {
  if (!asset) return null;

  const { urlGeral } = useContext(UserContext);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const csvCodTrimmed = (asset.csv_code || "").toString().trim();
  const bemStaTrimmed = (asset.asset_status || "").toString().trim();
  const status = statusMap[bemStaTrimmed];

  const materialName = asset.material?.material_name || "Sem nome";
  const hasAtm = !!(
    asset.atm_number &&
    asset.atm_number !== "None" &&
    asset.atm_number !== ""
  );
  const csvText = csvCodToText[csvCodTrimmed] || csvCodTrimmed;

  const { onOpen } = useModal();
  return (
    <div className="flex group">
      <div
        className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${
          qualisColor[csvCodTrimmed] || "bg-neutral-300"
        } min-h-full relative`}
      />
      <Alert className="flex flex-col flex-1 h-fit rounded-l-none p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[220px]">Nº Patrim.</TableHead>
              <TableHead className="w-[140px]">nº ATM</TableHead>
              <TableHead className="w-[220px]">Material</TableHead>
              <TableHead className="w-[360px]">Descrição</TableHead>
              <TableHead className="w-[140px]">TR</TableHead>
              <TableHead className="w-[140px]">Conservação</TableHead>
              <TableHead className="w-[140px]">Valor</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell className="font-medium whitespace-nowrap">
                {asset.asset_code?.toString().trim()} -{" "}
                {asset.asset_check_digit}
              </TableCell>

              <TableCell className="whitespace-nowrap">
                {hasAtm ? asset.atm_number : "—"}
              </TableCell>

              <TableCell className="">{materialName}</TableCell>

              <TableCell className="">
                {asset.asset_description || "—"}
              </TableCell>

              <TableCell className="whitespace-nowrap">
                {asset.accounting_entry_code || "—"}
              </TableCell>

              <TableCell className="whitespace-nowrap">
                {csvText || "—"}
              </TableCell>

              <TableCell className="whitespace-nowrap">
                R$ {asset.asset_value || "—"}
              </TableCell>
            </TableRow>
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={7}>
                <div className="flex gap-2 items-center h-full whitespace-nowrap">
                  <p>Condição:</p>
                  <ToggleGroup
                    type="single"
                    value={sel}
                    onValueChange={(v) => v && onStatusChange(v)}
                    disabled={isLocked}
                    className="flex  gap-2"
                    variant={"outline"}
                  >
                    <ToggleGroupItem
                      className="w-10 h-10"
                      value="OC"
                      aria-label="Ocioso"
                    >
                      OC
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      className="w-10 h-10"
                      value="QB"
                      aria-label="Quebrado"
                    >
                      QB
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      className="w-10 h-10"
                      value="NE"
                      aria-label="Não encontrado"
                    >
                      NE
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      className="w-10 h-10"
                      value="SP"
                      aria-label="Sem plaqueta"
                    >
                      SP
                    </ToggleGroupItem>
                  </ToggleGroup>

                  <Input
                    placeholder="Observações"
                    value={comm}
                    onChange={(e) => onCommentChange(e.target.value)}
                    disabled={isLocked}
                    className=""
                  />

                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpen("patrimonio", { ...asset }); // envia o Asset direto para o modal
                    }}
                    variant="outline"
                    size="icon"
                    className=" text-sm h-10 w-10 min-w-10"
                  >
                    <Maximize2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Alert>
    </div>
  );
}
