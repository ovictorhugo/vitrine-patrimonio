import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import bg_user from '../../assets/bg_admin.png';
import { UserContext } from "../../context/context";
import fump_bg from '../../assets/fump_bg.png';
import logo_eng from '../../assets/logo_eng.png';
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import bg_vitrine from '../../assets/bg_vitrine.png';
import { ArrowRight, Camera, Check, Funnel, Info, MagnifyingGlass, X, MapPin, Rows, SquaresFour } from "phosphor-react";

import { Link } from "react-router-dom";
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Barcode, ChevronDown, ChevronUp, Download, File, Locate, Package, SlidersHorizontal, Trash, User } from "lucide-react";

import Scanner from "../busca-patrimonio/Scanner.jsx"
import { Helmet } from "react-helmet";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"

export interface Patrimonio {
      bem_cod:string
      bem_dgv:string
      bem_num_atm:string
      csv_cod:string
      bem_serie:string
      bem_sta:string
      bem_val:string
      tre_cod:string
      bem_dsc_com:string
      uge_cod:string
      uge_nom:string
      org_cod:string
      uge_siaf:string
      org_nom:string
      set_cod:string
      set_nom:string
      loc_cod:string
      loc_nom:string
      ite_mar:string
      ite_mod:string
      tgr_cod:string
      grp_cod:string
      ele_cod:string
      sbe_cod:string
      mat_cod:string
      mat_nom:string
      pes_cod:string
      pes_nome:string
}

import { useLocation,useNavigate } from 'react-router-dom';
import { PatrimonioItem } from "./patrimonio-item.js";
import { SearchPatrimonio } from "../search/search-patrimonio.js";
import { Skeleton } from "../ui/skeleton.js";
import { Sheet, SheetContent } from "../ui/sheet.js";
import { useModal } from "../hooks/use-modal-store.js";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion.js";
import { HeaderResultTypeHome } from "../header-result-type-home.js";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip.js";
import { ScrollArea, ScrollBar } from "../ui/scroll-area.js";
import { Label } from "../ui/label.js";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group.js";
import { DataTable } from "../dashboard/data-table.js";
import { columnsPatrimonio } from "./columns-patrimonio.js";
import { Badge } from "../ui/badge.js";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

type FiltersModalProps = {
  patrimonio: Patrimonio[];
  setPatrimonio: React.Dispatch<React.SetStateAction<Patrimonio[]>>;
};

export function FiltersModal({ patrimonio, setPatrimonio }: FiltersModalProps) {
  const { onClose, isOpen, type: typeModal } = useModal();
  const isModalOpen = isOpen && typeModal === "filters-patrimonio";
  const queryUrl = useQuery();
  const navigate = useNavigate();

  // Função para pegar os valores da URL, com fallback para array vazio
  const getArrayFromUrl = (key: string) => queryUrl.get(key)?.split(";") || [];
  

  const normalizeString = (str: string): string => {
    return str
      .normalize("NFD") // Decompõe caracteres acentuados
      .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos (acentos)
      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove caracteres especiais
      .toUpperCase(); // Converte para maiúsculas
  };

  const [selectedOrgNom, setSelectedOrgNom] = useState<string[]>(getArrayFromUrl("org_nom"));
  const [selectedBemSta, setSelectedBemSta] = useState<string[]>(getArrayFromUrl("bem_sta"));
  const [selectedPesNom, setSelectedPesNom] = useState<string[]>(getArrayFromUrl("pes_nome"));
  const [selectedLocNom, setSelectedLocNom] = useState<string[]>(getArrayFromUrl("loc_nom"));
  const [selectedSetNom, setSelectedSetNom] = useState<string[]>(getArrayFromUrl("set_nom"));

 // Atualiza a URL com os filtros selecionados
 const updateFilters = (category: string, values: string[]) => {
  if (values.length > 0) {
    queryUrl.set(category, values.join(";"));
    setPatrimonio(filteredPrograms)
  } else {
    queryUrl.delete(category)
  }

};

useEffect(() => {
  const orgNomFromUrl = getArrayFromUrl("org_nom");
  const bemStaFromUrl = getArrayFromUrl("bem_sta");
  const pesNomFromUrl = getArrayFromUrl("pes_nome");
  const locNomFromUrl = getArrayFromUrl("loc_nom");
  const setNomFromUrl = getArrayFromUrl("set_nom");


  setSelectedOrgNom(orgNomFromUrl);
  setSelectedBemSta(bemStaFromUrl);
  setSelectedPesNom(pesNomFromUrl);
  setSelectedLocNom(locNomFromUrl);
  setSelectedSetNom(setNomFromUrl);

}, []);

const [filteredCount, setFilteredCount] = useState<number>(0);

useEffect(() => {
  updateFilters("org_nom", selectedOrgNom);
  updateFilters("bem_sta", selectedBemSta);
  updateFilters("pes_nome", selectedPesNom);
  updateFilters("loc_nom", selectedLocNom);
  updateFilters("set_nom", selectedSetNom);

  navigate({
    pathname: '/buscar-patrimonio',
    search: queryUrl.toString(),
  });

  setPatrimonio(filteredPrograms);
}, [
  selectedOrgNom,
  selectedBemSta,
  selectedPesNom,
  selectedLocNom,
  selectedSetNom,
]);

const clearFilters = () => {
  setSelectedOrgNom([]);
  setSelectedBemSta([]);
  setSelectedPesNom([]);
  setSelectedLocNom([]);
  setSelectedSetNom([]);
  setPatrimonio(patrimonio); // Restaura os programas originais
  onClose();
};

const uniqueOrgNoms = Array.from(new Set(patrimonio.map((res) => res.org_nom))).filter(Boolean);
const uniqueBemStas = Array.from(new Set(patrimonio.map((res) => res.bem_sta))).filter(Boolean);
const uniquePesNoms = Array.from(new Set(patrimonio.map((res) => res.pes_nome))).filter(Boolean);
const uniqueLocNoms = Array.from(new Set(patrimonio.map((res) => res.loc_nom))).filter(Boolean);
const uniqueSetNoms = Array.from(new Set(patrimonio.map((res) => res.set_nom))).filter(Boolean);

const handleOrgNomToggle = (value: string[]) => {
  setSelectedOrgNom(value);
};

const handleBemStaToggle = (value: string[]) => {
  setSelectedBemSta(value);
};

const handlePesNomToggle = (value: string[]) => {
  setSelectedPesNom(value);
};

const handleLocNomToggle = (value: string[]) => {
  setSelectedLocNom(value);
};

const handleSetNomToggle = (value: string[]) => {
  setSelectedSetNom(value);
};


useEffect(() => {
  let filtered = [...patrimonio];

  if (selectedOrgNom.length > 0) {
    filtered = filtered.filter((r) => selectedOrgNom.includes(r.org_nom));
  }
  if (selectedBemSta.length > 0) {
    filtered = filtered.filter((r) => selectedBemSta.includes(r.bem_sta));
  }
  if (selectedPesNom.length > 0) {
    filtered = filtered.filter((r) => selectedPesNom.includes(r.pes_nome));
  }
  if (selectedLocNom.length > 0) {
    filtered = filtered.filter((r) => selectedLocNom.includes(r.loc_nom));
  }
  if (selectedSetNom.length > 0) {
    filtered = filtered.filter((r) => selectedSetNom.includes(r.set_nom));
  }

  setFilteredCount(filtered.length);
  setPatrimonio(filtered); // Aplica os filtros corretamente aqui
}, [
  selectedOrgNom,
  selectedBemSta,
  selectedPesNom,
  selectedLocNom,
  selectedSetNom,
]);

const filteredPrograms = patrimonio.filter((res) => {

  const hasSelectedOrgNom = selectedOrgNom.length === 0 || selectedOrgNom.includes(res.org_nom);
  const hasSelectedBemSta = selectedBemSta.length === 0 || selectedBemSta.includes(res.bem_sta);
  const hasSelectedPesNom = selectedPesNom.length === 0 || selectedPesNom.includes(res.pes_nome);
  const hasSelectedLocNom = selectedLocNom.length === 0 || selectedLocNom.includes(res.loc_nom);
  const hasSelectedSetNom = selectedSetNom.length === 0 || selectedSetNom.includes(res.set_nom);

  return (
    hasSelectedOrgNom &&
    hasSelectedBemSta &&
    hasSelectedPesNom &&
    hasSelectedLocNom &&
    hasSelectedSetNom
  );
});

useEffect(() => {
  const noFiltersActive = !(

    selectedOrgNom.length > 0 ||
    selectedBemSta.length > 0 ||
    selectedPesNom.length > 0 ||
    selectedLocNom.length > 0 ||
    selectedSetNom.length > 0
  );

  if (noFiltersActive) {
    setPatrimonio(patrimonio);
  }
}, [

  selectedOrgNom,
  selectedBemSta,
  selectedPesNom,
  selectedLocNom,
  selectedSetNom,
]);


  return {
    selectedOrgNom,
  selectedBemSta,
  selectedPesNom,
  selectedLocNom,
  selectedSetNom,
    clearFilters,
    setSelectedBemSta,
    setSelectedLocNom,
    setSelectedOrgNom,
    setSelectedPesNom,
    setSelectedSetNom,
    component: (
    <Sheet open={isModalOpen} onOpenChange={onClose}>
      <SheetContent className={`p-0 dark:bg-neutral-900 dark:border-gray-600 min-w-[60vw]`}>
      <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-gray-600">

<div className="flex items-center gap-3">

  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className="h-8 w-8" variant={'outline'} onClick={() => {
          onClose()
        }} size={'icon'}><X size={16} /></Button>
      </TooltipTrigger>
      <TooltipContent> Fechar</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>

</DialogHeader>
<div className="relative flex">
<div>
            <div className="hidden lg:block p-8 pr-0 h-full">
              <div style={{ backgroundImage: `url(${bg_user})` }} className=" h-full w-[270px]  bg-cover bg-no-repeat bg-left rounded-md bg-eng-blue p-8"></div>

            </div>

          </div>
          <ScrollArea className="relative whitespace-nowrap h-[calc(100vh-50px)] p-8 w-full ">
          <div>
              <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                Pesquisadores
              </p>

              <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] mb-8 md:block">
                Filtros de pesquisa
              </h1>
            </div>

            <Accordion defaultValue="item-1" type="single" collapsible className="w-full">
           

<AccordionItem value="item-bem-sta">
  <div className="flex items-center justify-between">
    <Label>Situação</Label>
    <div className="flex gap-2 items-center">
      {selectedBemSta.length > 0 && (
        <Button onClick={() => setSelectedBemSta([])} variant="destructive" size="icon">
          <Trash size={16} />
        </Button>
      )}
      <AccordionTrigger />
    </div>
  </div>
  <AccordionContent>
    <ToggleGroup
      type="multiple"
      variant="outline"
      value={selectedBemSta}
      onValueChange={handleBemStaToggle}
      className="aspect-auto flex flex-wrap items-start justify-start gap-2"
    >
      {uniqueBemStas.map((sta) => (
        <ToggleGroupItem key={sta} value={sta} className="px-3 py-2">
          {sta}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  </AccordionContent>
</AccordionItem>

<AccordionItem value="item-pes-nom">
  <div className="flex items-center justify-between">
    <Label>Responsável</Label>
    <div className="flex gap-2 items-center">
      {selectedPesNom.length > 0 && (
        <Button onClick={() => setSelectedPesNom([])} variant="destructive" size="icon">
          <Trash size={16} />
        </Button>
      )}
      <AccordionTrigger />
    </div>
  </div>
  <AccordionContent>
    <ToggleGroup
      type="multiple"
      variant="outline"
      value={selectedPesNom}
      onValueChange={handlePesNomToggle}
      className="aspect-auto flex flex-wrap items-start justify-start gap-2"
    >
      {uniquePesNoms.map((pes) => (
        <ToggleGroupItem key={pes} value={pes} className="px-3 py-2">
          {pes}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  </AccordionContent>
</AccordionItem>

<AccordionItem value="item-org-nom">
  <div className="flex items-center justify-between">
    <Label>Orgão de guarda</Label>
    <div className="flex gap-2 items-center">
      {selectedOrgNom.length > 0 && (
        <Button onClick={() => setSelectedOrgNom([])} variant="destructive" size="icon">
          <Trash size={16} />
        </Button>
      )}
      <AccordionTrigger />
    </div>
  </div>
  <AccordionContent>
    <ToggleGroup
      type="multiple"
      variant="outline"
      value={selectedOrgNom}
      onValueChange={handleOrgNomToggle}
      className="aspect-auto flex flex-wrap items-start justify-start gap-2"
    >
      {uniqueOrgNoms.map((org) => (
        <ToggleGroupItem key={org} value={org} className="px-3 py-2">
          {org}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  </AccordionContent>
</AccordionItem>

<AccordionItem value="item-set-nom">
  <div className="flex items-center justify-between">
    <Label>Setor de guarda</Label>
    <div className="flex gap-2 items-center">
      {selectedSetNom.length > 0 && (
        <Button onClick={() => setSelectedSetNom([])} variant="destructive" size="icon">
          <Trash size={16} />
        </Button>
      )}
      <AccordionTrigger />
    </div>
  </div>
  <AccordionContent>
    <ToggleGroup
      type="multiple"
      variant="outline"
      value={selectedSetNom}
      onValueChange={handleSetNomToggle}
      className="aspect-auto flex flex-wrap items-start justify-start gap-2"
    >
      {uniqueSetNoms.map((setor) => (
        <ToggleGroupItem key={setor} value={setor} className="px-3 py-2">
          {setor}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  </AccordionContent>
</AccordionItem>



<AccordionItem value="item-loc-nom">
  <div className="flex items-center justify-between">
    <Label>Local de guarda</Label>
    <div className="flex gap-2 items-center">
      {selectedLocNom.length > 0 && (
        <Button onClick={() => setSelectedLocNom([])} variant="destructive" size="icon">
          <Trash size={16} />
        </Button>
      )}
      <AccordionTrigger />
    </div>
  </div>
  <AccordionContent>
    <ToggleGroup
      type="multiple"
      variant="outline"
      value={selectedLocNom}
      onValueChange={handleLocNomToggle}
      className="aspect-auto flex flex-wrap items-start justify-start gap-2"
    >
      {uniqueLocNoms.map((loc) => (
        <ToggleGroupItem key={loc} value={loc} className="px-3 py-2">
          {loc}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  </AccordionContent>
</AccordionItem>


            </Accordion>


            <ScrollBar orientation='vertical'/>
          </ScrollArea>

          </div>
      </SheetContent>
      </Sheet>
  )
}
}

export function BuscaPatrimonio() {

  const [patrimonio, setPatrimonio] = useState<Patrimonio[]>([]);
  const [originalPatrimonio, setOriginalPatrimonio] = useState<Patrimonio[]>([]);
  const [jsonData, setJsonData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
const {urlGeral, searchType, patrimoniosSelecionados} = useContext(UserContext)
  let url = urlGeral + ``

  
  const queryUrl = useQuery();

  const type_search = queryUrl.get('type_search');
  const terms = queryUrl.get('terms');

 if(terms != undefined && terms?.length > 0 ) {
  if (searchType == 'dsc') {
    url = urlGeral + `search_by_nom?bem_dsc_com=${terms}`
} else if (searchType == 'pes') {
  url = urlGeral + `search_by_nom?pes_nome=${terms}`
} else if (searchType == 'nom') {
url = urlGeral + `search_by_nom?mat_nom=${terms}`
} else if (searchType == 'atm') {
url = urlGeral + `checkoutPatrimonio?bem_num_atm=${terms}`
} else if (searchType == 'loc') {
url = urlGeral + `search_by_nom?loc_nom=${terms}`
} else if (searchType == 'cod') {
url = urlGeral + `checkoutPatrimonio?etiqueta=${terms}`
}

 }


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url, {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
            "Content-Type": "text/plain",
          },
        });
        const data = await response.json();
        if (data) {
          setPatrimonio(data);
          setOriginalPatrimonio(data);
          setJsonData(data)
          setLoading(false);
        }
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);
console.log(url)
  console.log(patrimonio)

  const [isOn, setIsOn] = useState(true);

  const convertJsonToCsv = (json: any[]): string => {
    const items = json;
    const replacer = (_: string, value: any) => (value === null ? '' : value); // Handle null values
    const header = Object.keys(items[0]);
    const csv = [
      '\uFEFF' + header.join(';'), // Add BOM and CSV header
      ...items.map((item) =>
        header.map((fieldName) => JSON.stringify(item[fieldName], replacer)).join(';')
      ) // CSV data
    ].join('\r\n');

    return csv;
  };

  const handleDownloadJson = async () => {
    try {
      const csvData = convertJsonToCsv(jsonData);
      const blob = new Blob([csvData], { type: 'text/csv;charset=windows-1252;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `dados.csv`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[300px]" />
  ));

  const [typeVisu, setTypeVisu] = useState('block');
  const { onOpen } = useModal();

  const {   setSelectedBemSta,
    setSelectedLocNom,
    setSelectedOrgNom,
    setSelectedPesNom,
    setSelectedSetNom,component, clearFilters, selectedBemSta, selectedLocNom, selectedOrgNom, selectedPesNom, selectedSetNom } = FiltersModal({
    patrimonio: originalPatrimonio,
    setPatrimonio,
  });

    return(
<main className="w-full relative">
<Helmet>
        <title>
          Busca de patrimônio | Patrimônio
        </title>
        <meta name="description" content={`Busca de patrimônio | Patrimônio`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

       {patrimoniosSelecionados.length > 0 ? (
        <div className="relative">
       
       <div className="top-[68px] sticky z-[9] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur">
<div className={`w-full px-8  border-b border-b-neutral-200 dark:border-b-neutral-800`}>


        {isOn && (
           <div className="w-full   flex justify-between items-center">
 
                      <div className="w-full pt-4  flex justify-between items-center">
                          <SearchPatrimonio/>
                      </div>
                         </div>
                    )}

              
           

              <div className={`flex w-full flex-wrap pt-2 pb-3 justify-between `}>
                    <div>

                    </div>

                    <div className="hidden xl:flex xl:flex-nowrap gap-2">
                <div className="md:flex md:flex-nowrap gap-2">
                  <Link to={`${urlGeral}dictionary.pdf`} target="_blank">
                  <Button variant="ghost" className="">
                    <File size={16} className="" />
                    Dicionário de dados
                  </Button>
                  </Link>
                  <Button onClick={() => handleDownloadJson()} variant="ghost" className="">
                    <Download size={16} className="" />
                    Baixar resultado
                  </Button>
                </div>

                <div>
                <Button onClick={() => onOpen('filters-patrimonio')}  variant="ghost" className="">
                      <SlidersHorizontal size={16} className="" />
                      Filtros
                    </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOn(!isOn)}>
                  {isOn ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
                  </div>
</div>
</div>



    

       <div className="mt-8 px-4 md:px-8">

       <div
  className={`${
    selectedOrgNom.length > 0 ||
    selectedBemSta.length > 0 ||
    selectedPesNom.length > 0 ||
    selectedLocNom.length > 0 ||
    selectedSetNom.length > 0
      ? "flex"
      : "hidden"
  } flex flex-wrap gap-3 mb-6 items-center`}
>
<p className="text-sm font-medium">Filtros aplicados:</p>

{selectedBemSta.map((item) => (
  <Badge
    key={item}
    className="bg-eng-blue gap-2 items-center flex  rounded-md dark:bg-eng-blue dark:text-white py-2 px-3 font-normal"
  >
    {item}
    <div
      className="cursor-pointer"
      onClick={() => setSelectedBemSta(selectedBemSta.filter(i => i !== item))}
    >
      <X size={16} />
    </div>
  </Badge>
))}

{selectedOrgNom.map((item) => (
  <Badge
    key={item}
    className="bg-eng-blue gap-2 items-center flex  rounded-md dark:bg-eng-blue  dark:text-white py-2 px-3 font-normal"
  >
    {item}
    <div
      className="cursor-pointer"
      onClick={() => setSelectedOrgNom(selectedOrgNom.filter(i => i !== item))}
    >
      <X size={16} />
    </div>
  </Badge>
))}

{selectedSetNom.map((item) => (
  <Badge
    key={item}
    className="bg-eng-blue gap-2 items-center flex  rounded-md dark:bg-eng-blue  dark:text-white py-2 px-3 font-normal"
  >
    {item}
    <div
      className="cursor-pointer"
      onClick={() => setSelectedSetNom(selectedSetNom.filter(i => i !== item))}
    >
      <X size={16} />
    </div>
  </Badge>
))}

{selectedLocNom.map((item) => (
  <Badge
    key={item}
    className="bg-eng-blue gap-2 items-center flex  rounded-md dark:bg-eng-blue  dark:text-white py-2 px-3 font-normal"
  >
    {item}
    <div
      className="cursor-pointer"
      onClick={() => setSelectedLocNom(selectedLocNom.filter(i => i !== item))}
    >
      <X size={16} />
    </div>
  </Badge>
))}

{selectedPesNom.map((item) => (
  <Badge
    key={item}
    className="bg-eng-blue gap-2 items-center flex  rounded-md dark:bg-eng-blue  dark:text-white py-2 px-3 font-normal"
  >
    {item}
    <div
      className="cursor-pointer"
      onClick={() => setSelectedPesNom(selectedPesNom.filter(i => i !== item))}
    >
      <X size={16} />
    </div>
  </Badge>
))}

<Badge variant={'secondary'} onClick={() => clearFilters()} className=" rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-900 border-0  py-2 px-3 font-normal flex items-center justify-center gap-2"><Trash size={12}/>Limpar filtros</Badge>
    


</div>
  
<Alert className={`p-0 mb-6 bg-cover bg-no-repeat bg-center `}  >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de bens
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{patrimonio.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {patrimonio.length > 1 ? ('encontrados'):('encontrado')} na busca
                  </p>
                </CardContent>
              </Alert>

              <Accordion defaultValue="item-1" type="single" collapsible>
                <AccordionItem value="item-1">
                  <div className="flex mb-2">
                    <HeaderResultTypeHome title="Patrimônios" icon={<Package size={24} className="text-gray-400" />}>
                      <div className="hidden md:flex gap-3 mr-3">
                        <Button onClick={() => setTypeVisu('rows')} variant={typeVisu === 'block' ? 'ghost' : 'outline'} size={'icon'}>
                          <Rows size={16} className="whitespace-nowrap" />
                        </Button>
                        <Button onClick={() => setTypeVisu('block')} variant={typeVisu === 'block' ? 'outline' : 'ghost'} size={'icon'}>
                          <SquaresFour size={16} className="whitespace-nowrap" />
                        </Button>
                      </div>
                    </HeaderResultTypeHome>
                    <AccordionTrigger>

                    </AccordionTrigger>
                  </div>
                  <AccordionContent>
                    {typeVisu === 'block' ? (
                      loading ? (
                        <ResponsiveMasonry
                          columnsCountBreakPoints={{
                            350: 1,
                          750: 2,
                          900: 2,
                          1200: 4,
                          1700: 5
                          }}
                        >
                          <Masonry gutter="16px">
                            {items.map((item, index) => (
                              <div className="w-full" key={index}>{item}</div>
                            ))}
                          </Masonry>
                        </ResponsiveMasonry>
                      ) : (
                        <ResponsiveMasonry
                        columnsCountBreakPoints={{
                          350: 1,
                          750: 2,
                          900: 2,
                          1200: 4,
                          1700: 5
                        }}
                      >
                        <Masonry gutter="16px" className="w-full">
                        {patrimonio
                            .map((props, index) => (
                                <PatrimonioItem
                                key={index} {...props}
                                />
                            ))}
                        </Masonry>
                      </ResponsiveMasonry>
                      )
                    ) : (
                      loading ? (
                        <Skeleton className="w-full rounded-md h-[400px]" />
                      ) : (
                        <DataTable columns={columnsPatrimonio} data={patrimonio} />
                      )
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>       

</div>
        </div>
       ):(
        <div>
           <div className="justify-center px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20" >
          <Link to={'/informacoes'} className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"><Info size={12} /><div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>Saiba como utilizar a plataforma<ArrowRight size={12} /></Link>

          <h1 className="z-[2] text-center max-w-[980px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]  md:block mb-4 ">
            Experimente{" "}
            <strong className="bg-eng-blue  rounded-md px-3 pb-2 text-white font-medium">
              {" "}
             digitar um código
            </strong>{" "}
            e veja o que a plataforma pode filtrar para você.
          </h1>
          <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>

          <div className="lg:max-w-[60vw] lg:w-[60vw] w-full">
            <SearchPatrimonio />
          </div>

         
        
        </div>
        </div>
       )}
{component}
</main>
    )
}