import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../ui/carousel";
import { Alert } from "../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Armchair, Barcode, Check, MapPin, Plus, Rows, X } from "lucide-react";
import { Button } from "../../ui/button";
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import { MagnifyingGlass } from "phosphor-react";
import { Input } from "../../ui/input";

interface Salas {
    bem_cod:string
    bem_dgv:string
    bem_dsc_com:string
    bem_num_atm:string
    bem_serie:string
    bem_sta:string
    bem_val:string
    created_at:string
    csv_cod:string
    ele_cod:string
    grp_cod:string
    ite_mar:string
    ite_mod:string
    loc_cod:string
    loc_nom:string
    mat_cod:string
    mat_nom:string
    org_cod:string
    org_nom:string
    pes_cod:string
    pes_nome:string
    set_cod:string
    set_nom:string
    tgr_cod:string
    uge_nom:string
    uge_siaf:string
}
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { SquaresFour } from "phosphor-react";
import { HeaderResultTypeHome } from "../../header-result-type-home";


export function MeusBens() {

    const {urlGeral, user} = useContext(UserContext)
    const [sala, setSala] = useState<Salas[]>([]); 

     const handleGetFavorites = async () => {
      const urlGetFavorites = `${urlGeral}bens/${user?.user_id}`;
    console.log(urlGetFavorites)
      try {
        const response = await fetch(urlGetFavorites, {
          mode: 'cors',
          method: 'GET',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'application/json',
          },
        });
    
        if (response.ok) {
          const data = await response.json();
          setSala(data);
        } else {
         
        }
      } catch (err) {
       
      }
    };
    
    useEffect(() => {
      handleGetFavorites()
      }, [user?.user_id])

      const csvCodToText = {
        'BM': 'Bom',
        'AE': 'Anti-Econômico',
        'IR': 'Irrecuperável',
        'OC': 'Ocioso',
        'BX': 'Baixado',
        'RE': 'Recuperável'
      };

      const qualisColor = {
        'BM': 'bg-green-500',
        'AE': 'bg-red-500',
        'IR': 'bg-yellow-500',
        'OC': 'bg-blue-500',
        'BX': 'bg-gray-500',
        'RE': 'bg-purple-500'
      };

      const [count, setCount] = useState(4)
      const [search, setSearch] = useState('')
      const [typeVisu, setTypeVisu] = useState('block');

      const filteredTotal = Array.isArray(sala) 
  ? sala.filter(item => {
      // Função para normalizar strings
      const normalizeString = (str: any) => str
        .normalize("NFD") // Decompõe caracteres acentuados
        .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos
        .toLowerCase(); // Converte para minúsculas

      // Normaliza os campos para comparação
      const searchStringMatNom = normalizeString(item.mat_nom);
      const searchStringBem = normalizeString(`${item.bem_cod}`);
      const normalizedSearch = normalizeString(search);

      // Verifica se a busca corresponde a mat_nom ou bem_cod-bem_dgv
      return searchStringMatNom.includes(normalizedSearch) || searchStringBem.includes(normalizedSearch);
    })
  : [];
   
      return(
      <div className="w-full">
         <Accordion defaultValue="item-1" type="single" collapsible>
              <AccordionItem value="item-1">
              <div className="flex mb-2">
              <HeaderResultTypeHome title="Meus bens patrimoniados" icon={<Armchair size={24} className="text-gray-400" />}>
                <div className="flex gap-3 mr-3">
                <Button onClick={() => setTypeVisu('rows')}  variant={typeVisu === 'block' ? 'ghost' : 'outline'} size={'icon'}>
                  <Rows size={16} className="whitespace-nowrap" />
                </Button>
                <Button onClick={() => setTypeVisu('block')} variant={typeVisu === 'block' ? 'outline' : 'ghost'}  size={'icon'}>
                  <SquaresFour size={16} className="whitespace-nowrap" />
                </Button>
                </div>
              </HeaderResultTypeHome>
              <AccordionTrigger>
  
              </AccordionTrigger>
              </div>


              <AccordionContent>
              {typeVisu === 'block' ? (
                <div>
                  <Alert  className="h-14 mb-8 p-2 flex items-center justify-between  w-full ">
           <div className="flex items-center gap-2 w-full flex-1">
           <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
           <Input  onChange={(e) => setSearch(e.target.value)} value={search}  type="text" className="border-0 w-full "/>
               </div>

               <div className="w-fit">
      
          
           </div>
               </Alert>

               
    <ResponsiveMasonry
    columnsCountBreakPoints={{
        350: 1,
        750: 2,
        900: 3,
        1200: 5
    }}
>
                 <Masonry gutter="16px">
    {filteredTotal.slice(0, count).map((props) => {
   const csvCodTrimmed = props.csv_cod ? props.csv_cod.trim() : '';
  
   // Verificar se props.bem_sta está definido antes de usar .trim()
   const bemStaTrimmed = props.bem_sta ? props.bem_sta.trim() : '';
 
  return(
    <div className="flex flex-1">
          <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border min-h-[250px]  border-neutral-200 border-r-0 ${qualisColor[csvCodTrimmed as keyof typeof qualisColor]} min-h-full relative `}></div>
          <Alert className="flex flex-col  gap-4 rounded-l-none  ">
 <CardHeader className="flex p-2 flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {props.bem_cod}- {props.bem_dgv}
              </CardTitle>
              <Barcode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent className="p-2 pt-0 flex flex-col justify-between h-full">
            <div>
                <div className="text-2xl font-bold">{props.mat_nom}</div>
               
              </div>
  
              <div className="flex mt-2 flex-wrap gap-4">
                
                <div className="flex gap-2 items-center text-xs font-medium uppercase">
                  <div className={`w-4 h-4 rounded-md ${qualisColor[csvCodTrimmed as keyof typeof qualisColor]}`}></div>
                  {csvCodToText[csvCodTrimmed as keyof typeof csvCodToText]}
                </div>
                <div className="flex gap-2 items-center text-xs font-medium uppercase">
                  {bemStaTrimmed === "NO" ? (<Check size={12} />) : (<X size={12} />)}
                  {bemStaTrimmed === "NO" ? 'Normal' : 'Não encontrado no local de guarda'}
                </div>
                <div className="flex gap-2 items-center text-xs font-medium"><MapPin size={12} />{props.loc_nom}</div>
              </div>
            </CardContent>

   
 </Alert>
 </div>
  )
})}
        </Masonry>
    </ResponsiveMasonry>
{filteredTotal.length > count && (
            <div className="w-full flex justify-center mt-8"><Button onClick={() => setCount(count + 24)}><Plus size={16} />Mostrar mais</Button></div>
        )}
                </div>
              ):(
                <div>

                </div>
              )}
              </AccordionContent>
              </AccordionItem>
              </Accordion>
         

      </div>
    )
}