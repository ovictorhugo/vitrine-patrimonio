// src/components/modals/catalog-modal.tsx
import { useContext, useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSignature,
  Home,
  Link2,
  LoaderCircle,
  MapPin,
  Undo2,
  User,
  Users,
} from "lucide-react";
import { ArrowSquareOut } from "phosphor-react";

import { useModal } from "../hooks/use-modal-store";
import { useIsMobile } from "../../hooks/use-mobile";
import { Drawer, DrawerContent } from "../ui/drawer";
import { UserContext } from "../../context/context";
import { ScrollArea } from "../ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Alert } from "../ui/alert";
import { Badge } from "../ui/badge";
import { CatalogEntry } from "../dashboard/itens-vitrine/card-item-dropdown";
import { Card, Carousel } from "../ui/apple-cards-carousel";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type UUID = string;

type Unit = {
  unit_name: string;
  unit_code: string;
  unit_siaf: string;
  id: string;
};
type Agency = {
  agency_name: string;
  agency_code: string;
  unit_id: string;
  id: string;
  unit: Unit;
};
type Sector = {
  agency_id: string;
  sector_name: string;
  sector_code: string;
  id: string;
  agency: Agency;
};
type LegalGuardian = {
  legal_guardians_code: string;
  legal_guardians_name: string;
  id: string;
};

type LocationDTO = {
  legal_guardian_id: string;
  sector_id: string;
  location_name: string;
  location_code: string;
  id: string;
  sector: Sector;
  legal_guardian: LegalGuardian;
};

// ... (Tipos LocationDTO, UnitDTO, etc mantidos para brevidade) ...

/* ===== Utils ===== */

export type SignerData = {
  user: string;
  document: string;
  isSigned: boolean;
  signedAt: Date;
  token: string;
};

export type DocumentData = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  catalog_id: string;
  file_path: string;
  signers: SignerData[];
};

interface DocumentModalProps {
  catalog?: CatalogEntry;
  document_data?: DocumentData;
}

export function DocumentModal({
  catalog: propCatalog,
  document_data: document_data,
}: DocumentModalProps) {
  const isMobile = useIsMobile();
  const { onClose, isOpen, type: typeModal, data } = useModal();
  const isModalOpen = isOpen && typeModal === "document-signers";
  const navigate = useNavigate();

  const { urlGeral, user } = useContext(UserContext);
  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("jwt_token") || ""
        : "",
    [],
  );
  const handleVoltar = () => onClose();
  const catalog = (data as any)?.catalog ?? (data as CatalogEntry | null);
  const document =
    (data as any)?.document_data ?? (data as DocumentData | null);

  // 1. Estado para armazenar os usuários buscados
  const [fetchedSigners, setFetchedSigners] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const asset = catalog?.asset;
  const titulo =
    asset?.material?.material_name ||
    asset?.item_model ||
    asset?.item_brand ||
    "Item sem nome";

  // Helpers
  const buildImgUrl = (p: string) => {
    const cleanPath = p?.startsWith("/") ? p.slice(1) : p;
    return `${urlGeral}${cleanPath}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const chain = (loc?: LocationDTO | null) => {
    if (!loc || !loc.sector) return [];
    const s = loc.sector;
    const a = s.agency;
    const u = a?.unit ?? s.agency.unit;
    const parts: string[] = [];
    if (u) parts.push(`${u.unit_code} - ${u.unit_name}`);
    if (a) parts.push(`${a.agency_code} - ${a.agency_name}`);
    parts.push(`${s.sector_code} - ${s.sector_name}`);
    parts.push(`${loc.location_code} - ${loc.location_name}`);
    return parts;
  };

  const origin = chain(catalog?.location) ?? [];
  const destination = chain(document?.location) ?? [];

  // 2. Efeito para buscar os dados dos assinantes em paralelo
  useEffect(() => {
    // Só executa se o modal estiver aberto e houver assinantes
    if (isModalOpen && document?.signers && urlGeral) {
      const fetchAllSigners = async () => {
        try {
          // Cria um array de Promises de fetch
          const promises = document.signers.map((signer) =>
            fetch(`${urlGeral}users/${signer.user.id}`).then((res) => {
              if (!res.ok)
                throw new Error(`Erro ao buscar user ${signer.user}`);
              return res.json();
            }),
          );

          // Aguarda todas resolverem
          const results = await Promise.all(promises);
          setFetchedSigners(results);
        } catch (error) {
          console.error("Erro ao carregar detalhes dos assinantes:", error);
        }
      };

      fetchAllSigners();
    } else {
      // Limpa se fechar
      setFetchedSigners([]);
    }
  }, [document, isModalOpen, urlGeral]);

  const images = useMemo(
    () =>
      (catalog?.images ?? []).slice(0, 4).map((img, index) => ({
        category: "",
        title: img.id || `${index}-${img.file_path}`,
        src: buildImgUrl(img.file_path),
      })),
    [catalog?.images, buildImgUrl],
  );

  const cards = useMemo(
    () =>
      images.map((card, index) => (
        <Card key={card.src} card={card} index={index} layout={true} />
      )),
    [images],
  );

  async function handleDownload() {
    setLoading(true);
    if (!document) return;
    const res = await fetch(`${urlGeral}transfers/pdf/${document.id}`, {
      headers: {
        Accept: "application/pdf",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      setLoading(true);
      toast.error("Não foi possível gerar o PDF.");
      throw new Error(`HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const pdf = URL.createObjectURL(blob);
    window.open(pdf, "_blank");
    if ((pdf ?? []).length === 0) {
      toast.error("Nada encontrado para gerar o PDF.");
    }
    setLoading(false);
  }

  const content = () => {
    if (!catalog) {
      return (
        <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-8">
          <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
            (⊙_⊙)
          </p>
          <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight">
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

          <h1 className="flex-1 flex flex-wrap gap-2 items-center text-2xl font-semibold">
            <p>Documento de transferência de bem</p>
          </h1>

          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={() => handleDownload()}
            >
              {loading ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Baixar documento
            </Button>
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
          <div className="px-8 pb-4">
            <div className="grid grid-cols-1 px-4">
              <Carousel items={cards} />
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
                        : "mb-4 mt-2 text-gray-500"
                    }
                  >
                    {asset?.asset_description || "Sem descrição."}
                  </p>
                </div>
              </div>

              {/* Guardião Atual (Dono do Catálogo) */}
              <Alert>
                <div className="flex gap-3 items-center">
                  <Avatar className="rounded-md h-12 w-12">
                    <AvatarImage
                      className=""
                      src={`${urlGeral}user/upload/${catalog.user?.id}/icon`}
                    />
                    <AvatarFallback className="flex items-center justify-center">
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm w-fit text-gray-500">
                      Atual guardião
                    </p>
                    <p className="text-black dark:text-white font-medium text-lg truncate">
                      {catalog.user?.username}
                    </p>
                  </div>
                </div>
              </Alert>
              <Alert className="flex my-4 flex-col rounded-md">
                <div className="flex items-center gap-2 flex-wrap">
                  <MapPin size={16} />
                  <p className="text-sm uppercase font-bold">
                    Local de origem:
                  </p>
                </div>
                <div className="flex items-center flex-wrap pl-4 pt-1">
                  {origin.map((p, i) => (
                    <div
                      key={i}
                      className={
                        isMobile
                          ? "text-xs text-gray-500 dark:text-gray-300 flex items-center gap-2"
                          : "text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2"
                      }
                    >
                      {i > 0 && <ChevronRight size={14} />} {p}
                    </div>
                  ))}
                </div>
              </Alert>
              <Alert className="flex flex-col rounded-md">
                <div className="flex items-center gap-2 flex-wrap">
                  <MapPin size={16} />
                  <p className="text-sm uppercase font-bold">
                    Local de destino:
                  </p>
                </div>
                <div className="flex items-center flex-wrap pl-4 pt-1">
                  {destination.map((p, i) => (
                    <div
                      key={i}
                      className={
                        isMobile
                          ? "text-xs text-gray-500 dark:text-gray-300 flex items-center gap-2"
                          : "text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2"
                      }
                    >
                      {i > 0 && <ChevronRight size={14} />} {p}
                    </div>
                  ))}
                </div>
              </Alert>
              <h3 className="text-lg font-semibold flex items-center gap-2 uppercase font-bold mt-6 mb-2">
                <Users className="text-gray-600" size={20} />
                Status das Assinaturas
              </h3>
            </div>

            {/* Lista de Assinantes */}
            <div className="grid gap-3 px-4">
              {Array.from({ length: 4 }).map((_, index) => {
                const signer = document?.signers?.[index];
                const hasSignerData = signer.user ? true : false;
                const displayName = hasSignerData
                  ? signer.user.username
                  : "Chefe de departamento";
                const displayEmail = hasSignerData
                  ? signer.user.email
                  : "Não identificado";

                const isSigned = signer?.isSigned ?? false;

                return (
                  <Alert
                    key={index}
                    className="flex flex-wrap items-center justify-between p-4 mb-2"
                  >
                    <div className="flex gap-3 ">
                      <Avatar className="rounded-md h-16 w-16">
                        {hasSignerData && (
                          <AvatarImage
                            src={`${urlGeral}user/upload/${signer.user.id}/icon`}
                            alt={displayName}
                          />
                        )}
                        <AvatarFallback className="flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <User size={16} className="text-gray-500" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <p className="text-black dark:text-white font-medium text-xl truncate">
                          {displayName}
                        </p>
                        <p className="text-gray-400 dark:text-gray-300 font-medium text-lg truncate">
                          {displayEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-8 m-0 items-center">
                      {!signer.isSigned && signer?.user?.id !== user?.id ? (
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => {
                            const link = `sistemapatrimonio.eng.ufmg.br/assinar-transferencia/?token=${signer.token}`;
                            navigator.clipboard.writeText(link);
                            toast.success("Url copiada com sucesso");
                          }}
                        >
                          <Link2 size={16} /> Gerar Link
                        </Button>
                      ) : (
                        <></>
                      )}
                      {signer?.user?.id === user?.id && !signer.isSigned ? (
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => {
                            onClose();
                            navigate(`/assinar-transferencia/`, {
                              state: {
                                CatalogData: catalog,
                                DocumentData: document,
                              },
                            });
                          }}
                        >
                          <FileSignature size={16} /> Assinar
                        </Button>
                      ) : (
                        <></>
                      )}

                      <div className="flex flex-col items-end">
                        {isSigned ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-400 border-green-200 flex gap-1">
                            Assinado
                          </Badge>
                        ) : (
                          <Badge className="bg-eng-blue text-white flex gap-1">
                            Pendente
                          </Badge>
                        )}

                        {isSigned && signer?.signedAt && (
                          <span className="text-[10px] text-gray-400 mt-1">
                            {formatDate(signer.signedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Alert>
                );
              })}
            </div>
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

export default DocumentModal;
