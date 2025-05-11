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
        <div className="grid gap-8 w-full">
  <h3 className="text-2xl font-medium ">Meus bens</h3>
  </div>
    )
}