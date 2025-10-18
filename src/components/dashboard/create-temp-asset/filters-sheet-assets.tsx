import { useMemo, useState } from "react";
import { Sheet, SheetContent } from "../../ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { ScrollArea } from "../../ui/scroll-area";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Alert } from "../../ui/alert";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { Label } from "../../ui/label";
import { FadersHorizontal, MagnifyingGlass, Trash, X } from "phosphor-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

import { useModal } from "../../hooks/use-modal-store";
import { Separator } from "../../ui/separator";

export const STATUS_MAP: Record<string, { text: string }> = {
  NO: { text: "Normal" },
  NI: { text: "Não inventariado" },
  CA: { text: "Cadastrado" },
  TS: { text: "Aguardando aceite" },
  MV: { text: "Movimentado" },
  BX: { text: "Baixado" },
};

export const CSV_TEXT: Record<string, string> = {
  BM: "Bom",
  AE: "Anti-Econômico",
  IR: "Irrecuperável",
  OC: "Ocioso",
  RE: "Recuperável",
};

// Listas fixas para exibir SEMPRE
const ALL_STATUS_CODES = Object.keys(STATUS_MAP);
const ALL_CSV_CODES = Object.keys(CSV_TEXT);

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

type AssetForFilter = { asset_status?: string | null; csv_code?: string | null };

type Props = {
  itemsBase: AssetForFilter[]; // só para contagem
  selectedStatuses: string[];
  setSelectedStatuses: (v: string[]) => void;
  selectedCsvCodes: string[];
  setSelectedCsvCodes: (v: string[]) => void;
};

export function FiltersSheetAssets({
  itemsBase,
  selectedStatuses,
  setSelectedStatuses,
  selectedCsvCodes,
  setSelectedCsvCodes,
}: Props) {
  const { onClose, isOpen, type } = useModal();
  const isModalOpen = isOpen && type === "filters-assets";

  const [searchStatus, setSearchStatus] = useState("");
  const [searchCsv, setSearchCsv] = useState("");

  const filteredStatuses = useMemo(() => {
    const q = normalize(searchStatus);
    if (!q) return ALL_STATUS_CODES;
    return ALL_STATUS_CODES.filter((code) =>
      normalize(STATUS_MAP[code]?.text || code).includes(q)
    );
  }, [searchStatus]);

  const filteredCsv = useMemo(() => {
    const q = normalize(searchCsv);
    if (!q) return ALL_CSV_CODES;
    return ALL_CSV_CODES.filter((code) =>
      normalize(CSV_TEXT[code] || code).includes(q)
    );
  }, [searchCsv]);

  const filteredCount = useMemo(() => {
    return itemsBase.filter((it) => {
      const okStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes((it.asset_status || "").trim());
      const okCsv =
        selectedCsvCodes.length === 0 ||
        selectedCsvCodes.includes((it.csv_code || "").trim());
      return okStatus && okCsv;
    }).length;
  }, [itemsBase, selectedStatuses, selectedCsvCodes]);

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedCsvCodes([]);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="">
      
  <DialogHeader>
     <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
  Filtros de pesquisa 
</DialogTitle>
<DialogDescription className="text-zinc-500">
  Utilize os campos abaixo para refinar a busca por bens patrimoniais.
</DialogDescription>

    </DialogHeader>

         <Separator className="mt-4" />
        <div className="relative flex">
          <ScrollArea className="relative whitespace-nowrap  w-full ">
          

            <div className="w-full">
              <Accordion defaultValue="status" type="single" collapsible className="w-full">
                {/* STATUS */}
                <AccordionItem value="status" className="w-full">
                  <div className="flex items-center justify-between">
                    <Label>Status do bem</Label>
                    <div className="flex gap-2 items-center">
                      {selectedStatuses.length > 0 && (
                        <Button onClick={() => setSelectedStatuses([])} variant={"destructive"} size={"icon"}>
                          <Trash size={16} />
                        </Button>
                      )}
                      <AccordionTrigger />
                    </div>
                  </div>
                  <AccordionContent>
                    <Alert className="h-12 p-2 mb-4 flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 w-full flex-1">
                        <MagnifyingGlass size={16} className="w-10" />
                        <Input
                          onChange={(e) => setSearchStatus(e.target.value)}
                          value={searchStatus}
                          type="text"
                          className="border-0 w-full"
                          placeholder="Buscar status…"
                        />
                      </div>
                    </Alert>

                    <ToggleGroup
                      type="multiple"
                      variant={"outline"}
                      value={selectedStatuses}
                      onValueChange={setSelectedStatuses}
                      className="aspect-auto flex flex-wrap items-start justify-start gap-2"
                    >
                      {filteredStatuses.map((code) => (
                        <ToggleGroupItem key={code} value={code} className="px-3 gap-2 flex py-2">
                          {STATUS_MAP[code]?.text || code}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </AccordionContent>
                </AccordionItem>

                {/* CSV */}
                <AccordionItem value="csv">
                  <div className="flex items-center justify-between">
                    <Label>Condição (CSV)</Label>
                    <div className="flex gap-2 items-center">
                      {selectedCsvCodes.length > 0 && (
                        <Button onClick={() => setSelectedCsvCodes([])} variant={"destructive"} size={"icon"}>
                          <Trash size={16} />
                        </Button>
                      )}
                      <AccordionTrigger />
                    </div>
                  </div>
                  <AccordionContent>
                    <Alert className="h-12 p-2 mb-4 flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 w-full flex-1">
                        <MagnifyingGlass size={16} className="w-10" />
                        <Input
                          onChange={(e) => setSearchCsv(e.target.value)}
                          value={searchCsv}
                          type="text"
                          className="border-0 w-full"
                          placeholder="Buscar condição…"
                        />
                      </div>
                    </Alert>

                    <ToggleGroup
                      type="multiple"
                      variant={"outline"}
                      value={selectedCsvCodes}
                      onValueChange={setSelectedCsvCodes}
                      className="aspect-auto flex flex-wrap items-start justify-start gap-2"
                    >
                      {ALL_CSV_CODES.filter((code) =>
                        filteredCsv.includes(code)
                      ).map((code) => (
                        <ToggleGroupItem key={code} value={code} className="px-3 py-2">
                          {CSV_TEXT[code] || code}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <DialogFooter className="">
              <Button variant="ghost" onClick={clearFilters} className="gap-2">
                <Trash size={16} />
                Limpar Filtros
              </Button>

              {/* Não navega: pai percebe e atualiza URL */}
              <Button onClick={onClose} className="gap-2">
                <FadersHorizontal size={16} />
                Mostrar resultados
              </Button>
            </DialogFooter>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
