import { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { UserContext } from "../../context/context";
import { Input } from "../ui/input";
import { useModal } from "../hooks/use-modal-store";
import { Label } from "../ui/label";
import { useQuery } from "../modal/search-modal-patrimonio";
import { ArrowRightLeft, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { CatalogResponseDTO } from "./item-page";
import { Alert } from "../ui/alert";


// shadcn/ui combobox primitives
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "../../lib";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface Props {
  catalog: CatalogResponseDTO;
}

// Tipos de resposta (ajuste se necessário)
type Unit = { unit_name: string; unit_code: string; unit_siaf: string; id: string };
type Agency = { agency_name: string; agency_code: string; unit_id: string; id: string; unit: Unit };
type Sector = { agency_id: string; sector_name: string; sector_code: string; id: string; agency: Agency };
type LegalGuardian = { legal_guardians_code: string; legal_guardians_name: string; id: string };

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

  const { user, urlGeral, loggedIn } = useContext(UserContext);

  // === NOVO: estado para seleção de local ===
  const [open, setOpen] = useState(false);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [errorLoc, setErrorLoc] = useState<string | null>(null);

  // carrega /locations/my
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
        if (!res.ok) throw new Error(`Falha ao carregar locais (${res.status})`);
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

  // formata label rico para exibição e busca
  const getLabel = (loc: LocationDTO) => {
    const parts: string[] = [];
    if (loc.sector?.sector_name) parts.push(loc.sector.sector_name);
    if (loc.sector?.agency?.agency_name) parts.push(loc.sector.agency.agency_name);
    if (loc.sector?.agency?.unit?.unit_name) parts.push(loc.sector.agency.unit.unit_name);
    const trilha = parts.length ? ` — ${parts.join(" · ")}` : "";
    return `${loc.location_name}${trilha}`;
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
      const data = [
        {
          location_id: locationId, // <-- NOVO: enviando o id selecionado
        },
      ];

      const urlProgram = `${urlGeral}/catalog/${catalog?.id}/transfer`;
      const token = localStorage.getItem("jwt_token");

      const response = await fetch(urlProgram, {
        mode: "cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast("Solicitação enviada", {
          description: "Transferência solicitada com sucesso.",
          action: { label: "Fechar", onClick: () => {} },
        });
      } else {
        console.error("Erro ao enviar dados para o servidor.");
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
    }
  };

  const { onOpen } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Alert>
      <div className="flex gap-4 flex-col">
        <CardHeader>
  <CardTitle>Solicitar transferência</CardTitle>
  <CardDescription>
    Escolha uma das salas sob sua responsabilidade para solicitar a transferência. 
    Após o envio, o pedido será analisado e validado pela Seção de Patrimônio.
  </CardDescription>
</CardHeader>
      <CardContent>
          <div className="grid gap-3 w-full">
          <Label htmlFor="loc_nom">Minhas salas</Label>

          {/* === Combobox com busca (shadcn/ui) === */}
          <Popover open={open} onOpenChange={setOpen} >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between mb-4"
                disabled={!loggedIn}
              >
                <p>
                  {loadingLoc ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando locais...
                  </span>
                ) : selectedLoc ? (
                  getLabel(selectedLoc)
                ) : (
                  ""
                )}
                </p>
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandInput/>
                <CommandList>
                  {errorLoc ? (
                    <CommandEmpty>{errorLoc}</CommandEmpty>
                  ) : (
                    <>
                      <CommandEmpty>Nenhum local encontrado.</CommandEmpty>
                      <CommandGroup>
                        {locations.map((loc) => {
                          const label = getLabel(loc);
                          return (
                            <CommandItem
                              key={loc.id}
                              value={label}
                              onSelect={() => {
                                const newId = loc.id === locationId ? null : loc.id;
                                setLocationId(newId);
                                setLocNom(newId ? label : "");
                                setOpen(false);
                              }}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <Check
                                  className={cn(
                                    "h-4 w-4",
                                    locationId === loc.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{loc.location_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {[
                                      loc.sector?.sector_code && `Setor: ${loc.sector.sector_code}`,
                                      loc.sector?.agency?.agency_code && `Agência: ${loc.sector.agency.agency_code}`,
                                      loc.sector?.agency?.unit?.unit_code && `Unidade: ${loc.sector.agency.unit.unit_code}`,
                                    ]
                                      .filter(Boolean)
                                      .join(" • ")}
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

        <Button
          onClick={handleSubmit}
          disabled={!loggedIn || !locationId}
          className="w-full"
        >
          <ArrowRightLeft size={16} />
          Solicitar transferência
        </Button>
      </CardContent>
      </div>
    </Alert>
  );
}
