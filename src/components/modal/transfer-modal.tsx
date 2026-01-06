// src/components/modals/catalog-modal.tsx
import {
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import {
  Archive,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  LoaderCircle,
  MapPin,
  SquareArrowLeft,
  SquareArrowRight,
  Undo2,
  Users,
} from "lucide-react";
import { ArrowSquareOut } from "phosphor-react";

import { useModal } from "../hooks/use-modal-store";
import { useIsMobile } from "../../hooks/use-mobile";
import { Drawer, DrawerContent } from "../ui/drawer";
import { UserContext } from "../../context/context";
import { ScrollArea } from "../ui/scroll-area";
import { LikeButton } from "../item-page/like-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { DownloadPdfButton } from "../download/download-pdf-button";
import { CatalogResponseDTO } from "./catalog-modal";
import { Alert } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

export type TransferRequestDTO = {
  id: string;
  status: string;
  user: {
    id: string;
    username: string;
    email: string;
    provider: string;
    linkedin: string;
    lattes_id: string;
    orcid: string;
    ramal: string;
    photo_url: string;
    background_url: string;
    matricula: string;
    verify: boolean;
    institution_id: string;
  };
  location: {
    legal_guardian_id: string;
    sector_id: string;
    location_name: string;
    location_code: string;
    id: string;
    sector: {
      agency_id: string;
      sector_name: string;
      sector_code: string;
      id: string;
      agency: {
        agency_name: string;
        agency_code: string;
        unit_id: string;
        id: string;
        unit: {
          unit_name: string;
          unit_code: string;
          unit_siaf: string;
          id: string;
        };
      };
    };
    legal_guardian: {
      legal_guardians_code: string;
      legal_guardians_name: string;
      id: string;
    };
  };
};

/* ===== Labels/Cores ===== */
const TRANSFER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  ACCEPTABLE: "Aceita",
  DECLINED: "Recusada",
};
const TRANSFER_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-500",
  ACCEPTABLE: "bg-green-600",
  DECLINED: "bg-red-600",
};

type UUID = string;

type UnitDTO = {
  id: UUID;
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
};
type AgencyDTO = {
  id: UUID;
  agency_name: string;
  agency_code: string;
  unit?: UnitDTO | null;
};
type SectorDTO = {
  id: UUID;
  sector_name: string;
  sector_code: string;
  agency?: AgencyDTO | null;
  unit?: UnitDTO | null;
};
type LegalGuardianDTO = {
  id: UUID;
  legal_guardians_code: string;
  legal_guardians_name: string;
};
type LocationDTO = {
  id: UUID;
  location_name: string;
  location_code: string;
  sector?: SectorDTO | null;
  legal_guardian?: LegalGuardianDTO | null;
};

/* ===== Utils ===== */
const chain = (loc?: LocationDTO | null) => {
  if (!loc || !loc.sector) return [];
  const s = loc.sector;
  const a = s.agency;
  const u = a?.unit ?? s.unit;
  const parts: string[] = [];
  if (u) parts.push(`${u.unit_code} - ${u.unit_name}`);
  if (a) parts.push(`${a.agency_code} - ${a.agency_name}`);
  parts.push(`${s.sector_code} - ${s.sector_name}`);
  parts.push(`${loc.location_code} - ${loc.location_name}`);
  return parts;
};

export function TransferModal() {
  const isMobile = useIsMobile();
  const { onClose, isOpen, type: typeModal, data } = useModal();
  const isModalOpen = isOpen && typeModal === "transfer-modal";
  const { urlGeral } = useContext(UserContext);
  const token = useMemo(() => localStorage.getItem("jwt_token") ?? "", []);

  const handleVoltar = () => onClose();

  const catalog = (data as any)?.catalog ?? (data as CatalogResponseDTO | null);
  const transfer_request =
    (data as any)?.transfer_request ?? (data as TransferRequestDTO | null);

  const [acceptingId, setAcceptingId] = useState<UUID | boolean>(false);

  const asset = catalog?.asset;
  const titulo =
    asset?.material?.material_name ||
    asset?.item_model ||
    asset?.item_brand ||
    "Item sem nome";

  const requesterName =
    transfer_request.user?.username ||
    transfer_request.user?.email?.split("@")[0] ||
    "Usuário";
  const statusText =
    TRANSFER_STATUS_LABEL[transfer_request.status] ?? transfer_request.status;
  const color = TRANSFER_STATUS_COLOR[transfer_request.status] ?? "bg-zinc-500";
  const cadeia = chain(transfer_request.location);
  const isAccepting = acceptingId === transfer_request.id;
  const alreadyAccepted = transfer_request.status === "ACCEPTABLE";

  async function handleAcceptTransfer(tr: TransferRequestDTO) {
    if (!tr?.id) return;

    const res = await fetch(
      `${urlGeral}catalog/transfer/${tr.id}?new_status=ACCEPTABLE`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      throw new Error(`Falha ao carregar items (HTTP ${res.status}).`);
    } else {
      toast.success("Transferência aceita com sucesso!");
    }
  }

  const content = () => {
    if (!catalog) {
      return (
        <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-8">
          <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
            (⊙_⊙)
          </p>
          <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1]">
            Não foi possível acessar as <br /> informações deste item.
          </h1>
          <div className="flex gap-3 mt-8">
            <Button onClick={handleVoltar} variant={"ghost"}>
              <Undo2 size={16} /> Voltar
            </Button>
            <Link to={"/"}>
              <Button>
                <Home size={16} /> Página Inicial
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    const header = (
      <>
        <div className="flex items-center gap-4 p-8 pb-0">
          <Button
            onClick={handleVoltar}
            variant="outline"
            size="icon"
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>

          <h1 className="flex-1 flex flex-wrap gap-2 items-center text-xl font-semibold tracking-tight">
            <p>Detalhes da transferência </p>
          </h1>

          <div className="hidden md:flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link target="_blank" to={`/item?id=${catalog.id}`}>
                    <Button variant="outline" size="icon">
                      <ArrowSquareOut size={16} />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="z-[99]">Ir a página</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </>
    );

    return (
      <main
        className={`grid flex-col gap-4 md:gap-8 border-b-[12px] max-h-[80vh] rounded-b-lg overflow-hidden`}
      >
        {header}
        <ScrollArea className="border-solid flex-1 w-full">
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1">
              <div className="flex lg:flex-row flex-col-reverse gap-4">
                <div className="flex w-full flex-col">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2 justify-between w-full">
                      <h2 className="text-3xl font-semibold leading-none tracking-tight ">
                        {titulo}
                      </h2>
                    </div>
                  </div>

                  <p
                    className={
                      isMobile
                        ? "mb-4 mt-6 text-gray-500 text-sm"
                        : "mb-4 mt-6 text-gray-500"
                    }
                  >
                    {asset?.asset_description || "Sem descrição."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="flex-1 p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Archive className="size-6" />
                  <p className="font-medium">Pedido de Transferência</p>
                  <Badge variant="outline">
                    #{transfer_request.id.slice(0, 8)}
                  </Badge>
                </div>

                <div className="flex gap-2 items-center">
                  <Badge className={`text-white ${color}`}>{statusText}</Badge>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <p className="text-md  text-muted-foreground">
                    Solicitante:{" "}
                    <span className="text-foreground font-medium">
                      {requesterName}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <MapPin className="size-4" />
                  <p className="text font-semibold uppercase">Destino:</p>
                  {cadeia.length ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {cadeia.map((p, i) => (
                        <div
                          key={i}
                          className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2"
                        >
                          {i > 0 && <ChevronRight size={14} />}
                          {p}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Local não informado
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-end p-4">
            <Button
              variant={alreadyAccepted ? "outline" : "default"}
              size="sm"
              onClick={() => handleAcceptTransfer(transfer_request)}
              disabled={isAccepting || alreadyAccepted}
              className="gap-2 flex-end"
            >
              {isAccepting ? (
                <>
                  <LoaderCircle className="animate-spin size-4" />
                  Processando…
                </>
              ) : (
                <>
                  <SquareArrowRight className="size-4" />
                  Escolher esta transferência
                </>
              )}
            </Button>
          </div>
        </ScrollArea>
      </main>
    );
  };

  if (isMobile) {
    return (
      <Drawer open={isModalOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[80vh] flex flex-col">
          {content()}
        </DrawerContent>
      </Drawer>
    );
  } else {
    return (
      <Dialog open={isModalOpen} onOpenChange={onClose}>
        <DialogContent className="p-0 min-w-[65vw]">{content()}</DialogContent>
      </Dialog>
    );
  }
}

export default TransferModal;
