// src/components/catalog/TransferTabCatalog.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Alert } from "../../ui/alert";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { toast } from "sonner";
import {
  Archive,
  MapPin,
  Users,
  ChevronRight,
  LoaderCircle,
  CheckCircle,
} from "lucide-react";

/* ===== Tipos mínimos para funcionar isolado ===== */
type UUID = string;

type UnitDTO = { id: UUID; unit_name: string; unit_code: string; unit_siaf: string };
type AgencyDTO = { id: UUID; agency_name: string; agency_code: string; unit?: UnitDTO | null };
type SectorDTO = { id: UUID; sector_name: string; sector_code: string; agency?: AgencyDTO | null; unit?: UnitDTO | null };
type LegalGuardianDTO = { id: UUID; legal_guardians_code: string; legal_guardians_name: string };
type LocationDTO = {
  id: UUID;
  location_name: string;
  location_code: string;
  sector?: SectorDTO | null;
  legal_guardian?: LegalGuardianDTO | null;
};
type UserDTO = { id: UUID; username?: string; email?: string; photo_url?: string | null };

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

type WorkflowEvent = {
  id: UUID;
  workflow_status: string;
  created_at: string;
  transfer_requests?: TransferRequestDTO[];
};

export type CatalogResponseDTO = {
  id: UUID;
  workflow_history?: WorkflowEvent[];
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

/* ===== Props ===== */
export interface TransferTabCatalogProps {
  catalog: CatalogResponseDTO | null | undefined;
  urlGeral: string;
  token?: string;
  /** Opcional: permita o pai sincronizar o catálogo (ex.: refetch) */
  onChange?: (next: Partial<CatalogResponseDTO>) => void;
}

/* ===== Componente ===== */
export function TransferTabCatalog({ catalog, urlGeral, token: tokenProp, onChange }: TransferTabCatalogProps) {
  const token =
    tokenProp ??
    (typeof window !== "undefined" ? localStorage.getItem("jwt_token") ?? "" : "");

  // Extrai transferências apenas dos eventos com status "VITRINE"
  const initialTransfers = useMemo<TransferRequestDTO[]>(() => {
    const hist = catalog?.workflow_history ?? [];
    return hist
      .filter((ev) => ev.workflow_status === "VITRINE")
      .flatMap((ev) => ev.transfer_requests ?? []);
  }, [catalog?.workflow_history]);

  const [transfers, setTransfers] = useState<TransferRequestDTO[]>(initialTransfers);
  const [acceptingId, setAcceptingId] = useState<UUID | null>(null);

  // Rehidrata se o catálogo mudar
  useEffect(() => {
    setTransfers(initialTransfers);
  }, [initialTransfers]);

  const handleAcceptTransfer = useCallback(
    async (tr: TransferRequestDTO) => {
      if (!tr?.id) return;
      try {
        setAcceptingId(tr.id);

        const endpoint = `${urlGeral}catalog/transfer/${tr.id}?new_status=ACCEPTABLE`;
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `Falha ao aceitar transferência (${res.status}): ${text || "Erro desconhecido"}`
          );
        }

        // Atualiza UI local: marca escolhida como ACCEPTABLE e as demais como DECLINED
        setTransfers((prev) =>
          prev.map((t) => ({
            ...t,
            status: t.id === tr.id ? "ACCEPTABLE" : "DECLINED",
          }))
        );

        // Notifica o pai se quiser sincronizar (ex.: revalidar catálogo)
        onChange?.({});

        toast("Transferência aceita", {
          description:
            "Esta solicitação foi marcada como ACEITA. As demais foram marcadas como RECUSADAS.",
        });
      } catch (e: any) {
        toast("Erro ao aceitar transferência", {
          description: e?.message || "Tente novamente.",
        });
      } finally {
        setAcceptingId(null);
      }
    },
    [onChange, token, urlGeral]
  );

  return (
    <div className="space-y-4">
      {(!transfers || transfers.length === 0) && (
        <Alert className="flex items-center justify-between">
          <div>
            <p className="font-medium">Nenhuma transferência registrada em “VITRINE”.</p>
            <p className="text-sm text-muted-foreground">
              Quando houver pedidos, eles aparecem aqui.
            </p>
          </div>
        </Alert>
      )}

      {transfers?.map((tr) => {
        const requesterName =
          tr.user?.username || tr.user?.email?.split("@")[0] || "Usuário";
        const statusText = TRANSFER_STATUS_LABEL[tr.status] ?? tr.status;
        const color = TRANSFER_STATUS_COLOR[tr.status] ?? "bg-zinc-500";
        const cadeia = chain(tr.location);
        const isAccepting = acceptingId === tr.id;
        const alreadyAccepted = tr.status === "ACCEPTABLE";

        return (
          <div key={tr.id} className="flex">
            <div className={`w-2 min-w-2 rounded-l-md ${color}`} />
            <Alert className="flex-1 rounded-l-none">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Archive className="size-4" />
                  <p className="font-medium">Pedido de Transferência</p>
                  <Badge variant="outline">#{tr.id.slice(0, 8)}</Badge>
                </div>

                <div className="flex gap-2 items-center">
                  <Badge className={`text-white ${color}`}>{statusText}</Badge>

                  <Button
                    variant={alreadyAccepted ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleAcceptTransfer(tr)}
                    disabled={isAccepting || alreadyAccepted}
                    className="gap-2"
                  >
                    {isAccepting ? (
                      <>
                        <LoaderCircle className="animate-spin size-4" />
                        Processando…
                      </>
                    ) : (
                      <>
                        <CheckCircle className="size-4" />
                        Escolher esta transferência
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <p className="text-sm text-muted-foreground">
                    Solicitante:{" "}
                    <span className="text-foreground font-medium">{requesterName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <MapPin className="size-4" />
                  <p className="text-sm font-semibold uppercase">Destino:</p>
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
                    <span className="text-sm text-muted-foreground">Local não informado</span>
                  )}
                </div>
              </div>
            </Alert>
          </div>
        );
      })}
    </div>
  );
}

export default TransferTabCatalog;
