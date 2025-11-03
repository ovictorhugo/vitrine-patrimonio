import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../ui/tabs";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Button } from "../../../ui/button";
import { Separator } from "../../../ui/separator";
import { Alert } from "../../../ui/alert";
import { Badge } from "../../../ui/badge";
import { Loader2, Home, Hash, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PatrimonioItem } from "../../sala/components/patrimonio-item-inventario";
import { ArrowUUpLeft } from "phosphor-react";
import { ScrollArea } from "../../../ui/scroll-area";

/* ================= Tipos ================= */
type UUID = string;

type Unit = { id: UUID; unit_name: string; unit_code: string; unit_siaf: string };
type Agency = { id: UUID; agency_name: string; agency_code: string; unit_id: UUID };
type Sector = { id: UUID; sector_name: string; sector_code: string; agency_id: UUID };
type LocationMy = {
  id: UUID;
  location_name: string;
  location_code: string;
  sector_id: UUID;
};

type AssetDTO = {
  id: UUID;
  asset_code: string;
  asset_check_digit: string;
  asset_status?: string;
  csv_code?: string;
  material?: { material_name?: string };
  asset_description?: string;
  accounting_entry_code?: string;
  asset_value?: number | string;
  atm_number?: string;
};

/* ====================== Props ====================== */
type DialogPreencherSalaProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  invId: UUID;
  baseUrl: string;     // ex.: https://api/...  (com ou sem / no final)
  token?: string | null;
};

export default function DialogPreencherSala({
  open,
  onOpenChange,
  invId,
  baseUrl,
  token,
}: DialogPreencherSalaProps) {
  // Normaliza baseUrl para SEMPRE terminar com "/"
  const urlGeral = useMemo(() => (baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"), [baseUrl]);

  const headers = useMemo<HeadersInit>(
    () => ({
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // Abas/Etapas
  const [tab, setTab] = useState<"selecionar" | "itens">("selecionar");

  // Listas hierárquicas
  const [units, setUnits] = useState<Unit[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [locations, setLocations] = useState<LocationMy[]>([]);

  // Seleções
  const [unitId, setUnitId] = useState<UUID | null>(null);
  const [agencyId, setAgencyId] = useState<UUID | null>(null);
  const [sectorId, setSectorId] = useState<UUID | null>(null);
  const [locationId, setLocationId] = useState<UUID | null>(null);

  // Loaders (opcional: mantive para melhor UX)
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Itens da sala
  const [assets, setAssets] = useState<AssetDTO[]>([]);

  /* =================== Fetchers no modelo pedido =================== */

  // Unidades (load na abertura do Dialog)
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingUnits(true);
        const res = await fetch(`${urlGeral}units/`, { headers });
        const json = await res.json();
        setUnits(json?.units ?? json?.results ?? json?.data ?? []);
      } catch (e: any) {
        setUnits([]);
        toast("Erro ao carregar Unidades (Units).", { description: e?.message || "Tente novamente." });
      } finally {
        setLoadingUnits(false);
      }
    })();
  }, [open, urlGeral, headers]);

  const fetchAgencies = useCallback(
    async (uid: UUID | null) => {
      if (!uid) return setAgencies([]);
      try {
        const res = await fetch(`${urlGeral}agencies/?unit_id=${encodeURIComponent(uid)}`, { headers });
        const json = await res.json();
        setAgencies(json?.agencies ?? json?.results ?? json?.data ?? []);
      } catch {
        setAgencies([]);
      }
    },
    [urlGeral, headers]
  );

  const fetchSectors = useCallback(
    async (aid: UUID | null) => {
      if (!aid) return setSectors([]);
      try {
        const res = await fetch(`${urlGeral}sectors/?agency_id=${encodeURIComponent(aid)}`, { headers });
        const json = await res.json();
        setSectors(json?.sectors ?? json?.results ?? json?.data ?? []);
      } catch {
        setSectors([]);
      }
    },
    [urlGeral, headers]
  );

  const fetchLocations = useCallback(
    async (sid: UUID | null) => {
      if (!sid) return setLocations([]);
      try {
        const res = await fetch(`${urlGeral}locations/?sector_id=${encodeURIComponent(sid)}`, { headers });
        const json = await res.json();
        setLocations(json?.locations ?? json?.results ?? json?.data ?? []);
      } catch {
        setLocations([]);
      }
    },
    [urlGeral, headers]
  );

  // Cascata (exatamente como seu modelo)
  useEffect(() => {
    setAgencyId(null);
    setSectorId(null);
    setLocationId(null);
    setAgencies([]);
    setSectors([]);
    setLocations([]);
    if (unitId) fetchAgencies(unitId);
  }, [unitId, fetchAgencies]);

  useEffect(() => {
    setSectorId(null);
    setLocationId(null);
    setSectors([]);
    setLocations([]);
    if (agencyId) fetchSectors(agencyId);
  }, [agencyId, fetchSectors]);

  useEffect(() => {
    setLocationId(null);
    setLocations([]);
    if (sectorId) fetchLocations(sectorId);
  }, [sectorId, fetchLocations]);

  // Reset total ao abrir (mantive)
  useEffect(() => {
    if (!open) return;
    setTab("selecionar");
    setUnitId(null);
    setAgencyId(null);
    setSectorId(null);
    setLocationId(null);
    setAgencies([]);
    setSectors([]);
    setLocations([]);
    setAssets([]);
  }, [open]);

  // Buscar itens da sala ao clicar "Próximo"
  const goToItens = useCallback(async () => {
    if (!invId || !locationId) return;
    try {
      setLoadingAssets(true);
      setAssets([]);
      const res = await fetch(
        `${urlGeral}assets/?location_id=${encodeURIComponent(locationId)}`,
        { headers }
      );
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Falha ao buscar itens (${res.status}).`);
      }
      const js = await res.json();
      const list: AssetDTO[] = js?.assets ?? [];
      setAssets(list);
      setTab("itens");
      toast("Sala carregada", { description: `${list.length} item(ns) encontrados.` });
    } catch (e: any) {
      toast("Erro ao buscar itens da sala", { description: e?.message || "Tente novamente." });
    } finally {
      setLoadingAssets(false);
    }
  }, [invId, locationId, urlGeral, headers]);

  const canNext = Boolean(unitId && agencyId && sectorId && locationId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2 font-medium max-w-[520px]">
            Preencher inventário de sala
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Selecione a sala navegando por Unidade → Órgão → Setor → Sala e visualize os itens em inventário.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <TabsContent value="selecionar" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unit */}
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select
                  value={unitId ?? ""}
                  onValueChange={(v) => setUnitId(v as UUID)}
                  disabled={loadingUnits}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUnits ? "Carregando..." : "Selecione a unidade"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[99999]" align="start" side="bottom" sideOffset={6}>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.unit_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Agency */}
              <div className="space-y-2">
                <Label>Órgão</Label>
                <Select
                  value={agencyId ?? ""}
                  onValueChange={(v) => setAgencyId(v as UUID)}
                  disabled={!unitId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!unitId ? "Selecione a unidade primeiro" : "Selecione o órgão"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[99999]" align="start" side="bottom" sideOffset={6}>
                    {agencies.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.agency_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sector */}
              <div className="space-y-2">
                <Label>Setor</Label>
                <Select
                  value={sectorId ?? ""}
                  onValueChange={(v) => setSectorId(v as UUID)}
                  disabled={!agencyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!agencyId ? "Selecione o órgão primeiro" : "Selecione o setor"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[99999]" align="start" side="bottom" sideOffset={6}>
                    {sectors.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.sector_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Sala</Label>
                <Select
                  value={locationId ?? ""}
                  onValueChange={(v) => setLocationId(v as UUID)}
                  disabled={!sectorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!sectorId ? "Selecione o setor primeiro" : "Selecione a sala"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[99999]" align="start" side="bottom" sideOffset={6}>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.location_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="itens">
            {loadingAssets ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Carregando itens da sala…
              </div>
            ) : assets.length === 0 ? (
              <Alert>Nenhum item encontrado nesta sala.</Alert>
            ) : (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{assets.length}</Badge>
                    <span className="text-sm text-muted-foreground">item(ns) encontrados</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  
                    <span>Sala selecionada</span>
                    <Hash size={14} />
                    <span>{locations.find((x) => x.id === (locationId ?? ""))?.location_name || "—"}</span>
                  </div>
                </div>

               <ScrollArea className="h-[320px]">
                 {assets.map((asset) => (
                 <div className="flex flex-col gap-4">
                  
                 </div>
                ))}
               </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer com navegação */}
        <DialogFooter className="w-full flex justify-between">
          <div>
            {tab === "itens" && (
              <Button variant="ghost" onClick={() => setTab("selecionar")}>
                <ArrowUUpLeft size={16} /> Voltar
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              <ArrowUUpLeft size={16} /> Cancelar
            </Button>
            {tab === "selecionar" && (
              <Button onClick={goToItens} disabled={!canNext || loadingAssets}>
                {loadingAssets ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight size={16} />}
                Próximo
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
