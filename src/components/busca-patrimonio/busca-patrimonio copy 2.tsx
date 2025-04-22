import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useModalHomepage } from "../hooks/use-modal-homepage";

import { UserContext } from "../../context/context";
import fump_bg from '../../assets/fump_bg.png';
import logo_eng from '../../assets/logo_eng.png';
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import bg_vitrine from '../../assets/bg_vitrine.png';
import { ArrowRight, Camera, Check, Funnel, Info, MagnifyingGlass, X, MapPin } from "phosphor-react";

import { Link } from "react-router-dom";
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Barcode, Locate, User } from "lucide-react";

import Scanner from "../busca-patrimonio/Scanner.jsx"


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"

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

import { useLocation,useNavigate } from 'react-router-dom';
import { PatrimonioItem } from "./patrimonio-item.js";
import { SearchPatrimonio } from "../search/search-patrimonio.js";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

export function BuscaPatrimonio() {
    const { isOpen, type, onOpen } = useModalHomepage();

    //retorna url
    const query = useQuery();
     const navigate = useNavigate();
  const bem_cod = query.get('bem_cod');
  const bem_dgv = query.get('bem_dgv');

  let bemCod = bem_cod ?? '';  // Default value if bem_cod is null
  let bemDgv = bem_dgv ?? '';  // Default value if bem_dgv is null

    const [input, setInput] = useState("");
    const isModalOpen = isOpen && type === "busca-patrimonio";
    const {loggedIn, urlGeral} = useContext(UserContext)

    const [camera, setCamera] = useState(false);
    const [result, setResult] = useState<string | null>(null);

  const onDetected = (code: string) => {
    setResult(code);
    handleChange(code);

    console.log(code);
  };

    const handleChange = (value:any) => {

        // Remover caracteres não numéricos
        value = value.replace(/[^0-9]/g, '');
    
        if (value.length > 1) {
          // Inserir "-" antes do último caractere
          value = value.slice(0, -1) + "-" + value.slice(-1);
        }
    
        setInput(value);
      };

      const [patrimonio, setPatrimonio] = useState<Patrimonio[]>([])

      useEffect(() => {   
        if(type != 'busca-patrimonio') {
          setPatrimonio([])
        
        }
          }, [type]);

       bemCod = parseInt(input.split('-')[0], 10).toString();
       bemDgv = input.split('-')[1];
      let urlPatrimonio = `${urlGeral}checkoutPatrimonio?bem_cod=${bemCod}&bem_dgv=${bemDgv}`;
          console.log(urlPatrimonio)
      const fetchData = async () => {
        try {
         
          const response = await fetch( urlPatrimonio, {
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
            setInput('')
         
          } else {
            toast("Erro: Nenhum patrimônio encontrado", {
              description: "Revise o número",
              action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
              },
            });
          }
        } catch (err) {
          console.log(err);
        }
      };


    
    const onClickBuscaPatrimonio = () => {
      fetchData()
     if (bemCod && bemDgv) {
      query.set('bem_cod', bemCod);
      query.set('bem_dgv', bemDgv);
      navigate({
        pathname: '/buscar-patrimonio',
        search: query.toString(),
      });
    }
      
    }

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onClickBuscaPatrimonio();
      }
    }, [onClickBuscaPatrimonio]);

    useEffect(() => {   
  if(result != null && result.length != 0) {
    handleChange(result)
  
  }
    }, [result]);

 

    const qualisColor = {
      'BM': 'bg-green-500', // exemplo de classe de cor para "BM"
      'AE': 'bg-red-500',   // exemplo de classe de cor para "AE"
      'IR': 'bg-yellow-500', // exemplo de classe de cor para "IR"
      'OC': 'bg-blue-500',   // exemplo de classe de cor para "OC"
      'BX': 'bg-gray-500',   // exemplo de classe de cor para "BX"
      'RE': 'bg-purple-500'  // exemplo de classe de cor para "RE"
    };

    const [barcode, setBarcode] = useState('lintangwisesa');

    const csvCodToText = {
      'BM': 'Bom',
      'AE': 'Anti-Econômico',
      'IR': 'Irrecuperável',
      'OC': 'Ocioso',
      'BX': 'Baixado',
      'RE': 'Recuperável'
    };

    return(
<main className="items-center w-full flex flex-col ">
<div className="bg-cover bg-no-repeat bg-center w-full">
<div className="justify-center px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20" >      
   
     
         <Link to={'/informacoes'}  className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"><Info size={12}/><div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>Saiba como utilizar a plataforma<ArrowRight size={12}/></Link>

        <h1 className="z-[2] text-center max-w-[680px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
        
          <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
            {' '} Digite o código
           
          </strong>{' '} para realizar a consulta patrimonial
        </h1>
        <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>

        <div className="lg:max-w-[60vw] lg:w-[60vw] w-full ">
          
          <SearchPatrimonio/>
         </div>

             
  
  </div>
</div>
</main>
    )
}