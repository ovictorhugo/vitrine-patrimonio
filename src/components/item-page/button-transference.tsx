import { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { UserContext } from "../../context/context";
import { useModal } from "../hooks/use-modal-store";
import { useQuery } from "../modal/search-modal-patrimonio";
import { ArrowRightLeft, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { CatalogResponseDTO } from "./item-page";
import { Alert } from "../ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "../../lib";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";

/* Dialog */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ArrowUUpLeft } from "phosphor-react";
import { useIsMobile } from "../../hooks/use-mobile";

interface Props {
  catalog: CatalogResponseDTO;
}

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

type LocationsResponse = { locations: LocationDTO[] };

export function ButtonTransference({ catalog }: Props) {
  const queryUrl = useQuery();
  const loc_nom = queryUrl.get("loc_nom");

  const [locNom, setLocNom] = useState(loc_nom || "");
  useEffect(() => {
    setLocNom(loc_nom || "");
  }, [loc_nom]);

  const { urlGeral, loggedIn } = useContext(UserContext);

  const [open, setOpen] = useState(false);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [errorLoc, setErrorLoc] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // === ÚLTIMO STATUS DO WORKFLOW ===
  const lastStatus = useMemo(() => {
    const hist = catalog?.workflow_history ?? [];
    if (hist.length === 0) return undefined;
    // Pega o evento mais recente por created_at (seguro mesmo se a API não vier ordenada)
    const latest = hist.reduce((acc, cur) =>
      new Date(cur.created_at) > new Date(acc.created_at) ? cur : acc
    );
    return latest.workflow_status;
  }, [catalog?.workflow_history]);

  const canTransfer = lastStatus === "VITRINE";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingLoc(true);
        setErrorLoc(null);
        const token = localStorage.getItem("jwt_token");
        const res = await fetch(`${urlGeral}/locations/my`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok)
          throw new Error(`Falha ao carregar locais (${res.status})`);
        const data: LocationsResponse = await res.json();
        if (!active) return;
        setLocations(data.locations ?? []);
      } catch (e: any) {
        if (!active) return;
        setErrorLoc(e?.message ?? "Erro ao carregar locais");
      } finally {
        if (active) setLoadingLoc(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [urlGeral]);

  const getTrail = (loc: LocationDTO) => {
    const parts: string[] = [];
    if (loc.sector?.sector_name) parts.push(loc.sector.sector_name);
    if (loc.sector?.agency?.agency_name)
      parts.push(loc.sector.agency.agency_name);
    if (loc.sector?.agency?.unit?.unit_name)
      parts.push(loc.sector.agency.unit.unit_name);
    return parts.join(" · ");
  };

  const selectedLoc = useMemo(
    () => locations.find((l) => l.id === locationId) || null,
    [locations, locationId]
  );

  const handleSubmit = async () => {
    if (!locationId) {
      toast("Selecione o local de transferência", {
        description: "Escolha um local na lista antes de enviar.",
      });
      return;
    }

    try {
      setSending(true);

      const payload = { location_id: locationId };
      const urlProgram = `${urlGeral}/catalog/${catalog?.id}/transfer`;
      const token = localStorage.getItem("jwt_token");

      const response = await fetch(urlProgram, {
        mode: "cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast("Solicitação enviada", {
          description: "Transferência solicitada com sucesso.",
          action: { label: "Fechar", onClick: () => {} },
        });
        setConfirmOpen(false);
      } else {
        const errTxt = await response.text().catch(() => "");
        console.error("Erro ao enviar dados:", errTxt);
        toast("Tente novamente!", {
          description: "Ocorreu um erro ao solicitar a transferência.",
          action: { label: "Fechar", onClick: () => {} },
        });
      }
    } catch (error) {
      console.log(error);
      toast("Erro ao processar requisição", {
        description: "Verifique sua conexão e tente novamente.",
        action: { label: "Fechar", onClick: () => {} },
      });
    } finally {
      setSending(false);
    }
  };

  const isMobile = useIsMobile();

  // UI
  return (
    <Alert>
      <div className="flex gap-4 flex-col p-0">
        <CardHeader className={isMobile ?"p-2" : ""}>
          <CardTitle>Solicitar transferência</CardTitle>
          <CardDescription>
            Escolha uma das salas sob sua responsabilidade para solicitar a
            transferência. Após o envio, o pedido será analisado e validado pela
            Seção de Patrimônio.
          </CardDescription>
        </CardHeader>

        <CardContent className={isMobile ? "p-2" : ""}>
          <div className="grid gap-3 w-full">
            <Label htmlFor="loc_nom">Minhas salas</Label>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between mb-4"
                  disabled={!loggedIn && !canTransfer} // <<< DESABILITA QUANDO NÃO ESTÁ EM VITRINE
                >
                  <span className="truncate">
                    {loadingLoc ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando locais...
                      </span>
                    ) : (
                      selectedLoc?.location_name || "Selecione um local"
                    )}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Buscar por sala, setor, unidade..." />
                  <CommandList>
                    {errorLoc ? (
                      <CommandEmpty>{errorLoc}</CommandEmpty>
                    ) : (
                      <>
                        <CommandEmpty>Nenhum local encontrado.</CommandEmpty>
                        <CommandGroup>
                          {locations.map((loc) => {
                            const trail = getTrail(loc);
                            return (
                              <CommandItem
                                key={loc.id}
                                value={`${loc.location_name} ${trail}`}
                                onSelect={() => {
                                  if (!canTransfer) return;
                                  const newId =
                                    loc.id === locationId ? null : loc.id;
                                  setLocationId(newId);
                                  setLocNom(newId ? loc.location_name : "");
                                  setOpen(false);
                                }}
                              >
                                <div className="flex items-start gap-2 w-full">
                                  <Check
                                    className={cn(
                                      "h-4 w-4 mt-0.5",
                                      locationId === loc.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium leading-tight">
                                      {loc.location_name}
                                    </span>
                                  </div>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Botão que abre o Dialog de confirmação */}
          <Button
            onClick={() => {
              if (!loggedIn) {
                toast("Ação não permitida", {
                  description:
                    "Você precisa estar logado para solicitar transferência.",
                });
                return;
              }
              if (!canTransfer) {
                toast("Indisponível", {
                  description:
                    "A solicitação de transferência só é permitida quando o item está em VITRINE.",
                });
                return;
              }
              if (!locationId) {
                toast("Selecione o local de transferência", {
                  description: "Escolha um local na lista antes de continuar.",
                });
                return;
              }
              setConfirmOpen(true);
            }}
            disabled={!loggedIn || !locationId || !canTransfer} // <<< DESABILITA QUANDO NÃO ESTÁ EM VITRINE
            className="w-full"
          >
            <ArrowRightLeft size={16} />
            Solicitar transferência
          </Button>
        </CardContent>
      </div>

      {/* Dialog de confirmação */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2 font-medium">
              Confirmar transferência
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Você está prestes a solicitar a transferência do item
              {catalog?.asset?.asset_code ? (
                <>
                  {" "}
                  <strong>
                    {" "}
                    {catalog.asset.asset_code}-{catalog.asset.asset_check_digit}
                  </strong>
                </>
              ) : null}
              {selectedLoc ? (
                <>
                  {" "}
                  para a sala <strong>{selectedLoc.location_name}</strong>.
                </>
              ) : null}{" "}
              Após o envio, o pedido será analisado pela Seção de Patrimônio.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={sending}>
              <ArrowRightLeft size={16} />
              {sending ? "Enviando…" : "Confirmar transferência"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Alert>
  );
}
