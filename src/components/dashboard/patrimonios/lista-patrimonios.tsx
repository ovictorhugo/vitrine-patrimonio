import { useModalDashboard } from "../../hooks/use-modal-dashboard";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"

import { Alert } from "../../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { ChartBar, FileXls, Rows, SquaresFour } from "phosphor-react";
import { TabelaPatrimonio } from "../components/tabela-patrimonios";
import { ScrollArea } from "../../ui/scroll-area";
import { useModal } from "../../hooks/use-modal-store";
import { TabelaPatrimonioMorto } from "../components/tabela-patrimonios-morto";
import { Input } from "../../ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../ui/resizable";
import { TooltipProvider } from "../../ui/tooltip";
import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";
import { ItensListVitrine } from "../components/itens-list-vitrine";
import { DisplayItemPatrimonio } from "../components/display-item-patrimonio";
import { ChevronDown, ChevronLeft, ChevronUp, Download, File, LoaderCircle, Package, Plus, Search, SlidersHorizontal, Trash, Upload, X } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { DataTable } from "../data-table";
import { columnsPatrimonio } from "../../busca-patrimonio/columns-patrimonio";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { PatrimonioItem } from "../../busca-patrimonio/patrimonio-item";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { HeaderResultTypeHome } from "../../header-result-type-home";
import { SearchPatrimonio } from "../../search/search-patrimonio";
import { FiltersModal } from "../../busca-patrimonio/busca-patrimonio";
import { DataTableModal } from "../../componentsModal/data-table";
import { useDropzone } from "react-dropzone";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { useQuery } from "../../modal/search-modal-patrimonio";
import { HeaderResult } from "../../busca-patrimonio/header-results";
import { GraficoCsvCod } from "./graficos/grafico-csv-cod";
import { GraficoBemSta } from "./graficos/grafico-bem-sta";
import { GraficoOrgNom } from "./graficos/grafico-set-nom";
import { Separator } from "../../ui/separator";

interface Patrimonio {
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

export function ListaPatrimonios() {
  const { isOpen, type} = useModalDashboard();
  const {user, urlGeral, defaultLayout, searchType} = useContext(UserContext)
  const {onOpen} = useModal();

  const isModalOpen = isOpen && type === 'lista-patrimonio';

  const [total, setTotal] = useState<Patrimonio | null>(null);


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

  const [patrimonio, setPatrimonio] = useState<Patrimonio[]>([]);
  const [originalPatrimonio, setOriginalPatrimonio] = useState<Patrimonio[]>([]);
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  let url = urlGeral + `search_by_nom?institution_id=${user?.institution_id}`

  const queryUrl = useQuery();

  const type_search = queryUrl.get('type_search');
  const terms = queryUrl.get('terms');

  if(terms != undefined && terms?.length > 0) {
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

      useEffect(() => {
        fetchData();
      }, [url]);
    
    
  console.log(url)
    console.log(patrimonio)

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

  const [count, setCount] = useState(100)

  
  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[300px]" />
  ));

  const [typeVisu, setTypeVisu] = useState('block');

    const {   setSelectedBemSta,
      setSelectedLocNom,
      setSelectedOrgNom,
      setSelectedPesNom,
      setSelectedSetNom,component, clearFilters, selectedBemSta, selectedLocNom, selectedOrgNom, selectedPesNom, selectedSetNom } = FiltersModal({
      patrimonio: originalPatrimonio,
      setPatrimonio,
    page: '/dashboard/patrimonios'
    });

    const history = useNavigate();

    const handleVoltar = () => {
      history(-1);
    }

    const [uploadProgress, setUploadProgress] = useState(false);

      const [fileInfo, setFileInfo] = useState({ name: '', size: 0 });
    
        const [data, setData] = useState<Patrimonio[]>([]);
    
        const onDrop = useCallback((acceptedFiles:any) => {
          handleFileUpload(acceptedFiles);
        }, []);
      
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop,
         
        });

        const [file, setFile] = useState<File | null>(null);

        const handleFileUpload = (files: any) => {
          const uploadedFile = files[0];
          if (uploadedFile) {
            setFile(uploadedFile); // salva o arquivo
            setFileInfo({
              name: uploadedFile.name,
              size: uploadedFile.size,
            });
          }
        };

  
      

     
  
  return(
    <main className="w-full relative">
      <Helmet>
              <title>
                Patrimônios | Módulo Administrativo | Vitrine Patrimônio
              </title>
              <meta name="description" content={`Busca de patrimônio | Patrimônio`} />
              <meta name="robots" content="index, follow" />
            </Helmet>


            <div className="relative">
          <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 md:pb-0">
          <div className="w-full  gap-4">
            <div className="flex items-center gap-4">
          
            <Button onClick={handleVoltar } variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Bens patrimoniados
              </h1>
             

                
            
              <div className="hidden items-center h-10 gap-2 md:ml-auto md:flex">
            <Button onClick={() => onOpen('add-patrimonio')} variant={'outline'}><Package size={16}/>Adicionar patrimônio temporário</Button>
            <Button onClick={() => onOpen('import-csv')}><FileXls size={16}/>Atualizar dados</Button>
          
              </div>
            </div>

            </div>

            

         
          </div>

  

            <div className="top-[68px] sticky z-[9] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur">
<div className={`w-full px-8  border-b border-b-neutral-200 dark:border-b-neutral-800`}>


        {isOn && (
           <div className="w-full   flex justify-between items-center">
 
                      <div className="w-full pt-4  flex justify-between items-center">
                         <SearchPatrimonio page={'/dashboard/patrimonios'}/>
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


<div className="mt-8 px-4 md:px-8 gap-4 flex flex-col ">

  <HeaderResult/>
<div
  className={`${
    selectedOrgNom.length > 0 ||
    selectedBemSta.length > 0 ||
    selectedPesNom.length > 0 ||
    selectedLocNom.length > 0 ||
    selectedSetNom.length > 0
      ? "flex"
      : "hidden"
  }  flex-wrap   mb-4  flex-col gap-4 w-full flex`}
>

<Separator/>

<div className="flex flex-wrap gap-3 items-center">
  
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

</div>


<div className="grid  gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
<Alert className={`p-0  bg-cover bg-no-repeat bg-center `}  >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de patrimônios
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{patrimonio.filter(item => item.bem_sta != 'BX').length}</div>
                  <p className="text-xs text-muted-foreground">
                    {patrimonio.filter(item => item.bem_sta != 'BX').length > 1 ? ('encontrados'):('encontrado')} na busca
                  </p>
                </CardContent>
              </Alert>

              <Alert className="p-0  bg-cover bg-no-repeat bg-center">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">
      Total de patrimônios baixados
    </CardTitle>
    <Trash className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{patrimonio.filter(item => item.bem_sta === 'BX').length}</div>
    <p className="text-xs text-muted-foreground">
      {patrimonio.filter(item => item.bem_sta === 'BX').length > 1 ? 'encontrados' : 'encontrado'} na busca
    </p>
  </CardContent>
</Alert>

              <Alert className={`p-0  bg-cover bg-no-repeat bg-center `}  >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Bens 
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

              <Alert className={`p-0  bg-cover bg-no-repeat bg-center `}  >
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
</div>

{patrimonio.length > 1 && (
  <Accordion defaultValue="item-1" type="single" collapsible className="hidden md:flex ">
  <AccordionItem value="item-1" className="w-full ">
    <div className="flex mb-2">
      <HeaderResultTypeHome title="Gráficos dos bens patrimoniados" icon={<ChartBar size={24} className="text-gray-400" />}>
      </HeaderResultTypeHome>

      <AccordionTrigger>

      </AccordionTrigger>
    </div>
    <AccordionContent className="p-0">
    {loading ? (
       <div className="grid gap-8">
<Skeleton className="rounded-md w-full h-[300px] " />

       </div>

) : (
<div className="grid gap-8">
<GraficoCsvCod patrimoniolist={patrimonio}/>

<div className="grid gap-8 md:grid-cols-2">
<GraficoBemSta patrimoniolist={patrimonio}/>
<GraficoOrgNom patrimoniolist={patrimonio}/>
</div>
</div>
)}
    </AccordionContent>

    </AccordionItem>
  </Accordion>
)}

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
                            1200: 3,
                            1700: 4
                          }}
                        >
                          <Masonry gutter="16px">
                            {items.map((item, index) => (
                              <div className="w-full" key={index}>{item}</div>
                            ))}
                          </Masonry>
                        </ResponsiveMasonry>
                      ) : (
                      <div className="">
                          <ResponsiveMasonry
                        columnsCountBreakPoints={{
                          350: 1,
                          750: 2,
                          900: 2,
                          1200: 3,
                          1700: 4
                        }}
                      >
                        <Masonry gutter="16px" className="w-full">
                        {patrimonio.slice(0, count)
                            .map((props, index) => (
                                <PatrimonioItem
                                key={index} {...props}
                                />
                            ))}
                        </Masonry>
                      </ResponsiveMasonry>

{patrimonio.length > count && (
  <div className="w-full flex justify-center my-8"><Button onClick={() => setCount(count + 24)}><Plus size={16} />Mostrar mais</Button></div>
)}
                      </div>
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

{component}


            </div>
    </main>
    )
}