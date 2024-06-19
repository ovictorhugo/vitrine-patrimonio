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

import { useBarcode } from '@createnextapp/react-barcode';

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
      fetchData
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

    useEffect(() => {
      if (bem_dgv?.length !== 0 && bem_cod?.length !== 0) {
        setInput(`${bem_cod}-${bem_dgv}`);
        onClickBuscaPatrimonio();
      }
    }, [bem_cod, bem_dgv]);

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
<>
{isModalOpen && (

<div className="h-full  justify-center  items-center w-full flex flex-col   ">

<div className="bg-cover h-full bg-no-repeat px-8 bg-right w-full flex gap-3 items-center" style={{ backgroundImage: `url(${bg_vitrine})` }} >
<div className=" w-full  mx-auto flex flex-col  gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20" >
<Link to={''}  className="inline-flex w-fit items-center rounded-lg  bg-gray-200 dark:bg-neutral-800  gap-2 mb-3 px-3 py-1 text-sm font-medium"><Info size={12}/><div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>Saiba como utilizar a plataforma<ArrowRight size={12}/></Link>
<h1 className="z-[2] text-left max-w-[600px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]  md:block mb-4 ">
             
              <strong className="bg-[#709CB6]  rounded-md px-3 pb-2 text-white font-medium">
                {" "}
                Digite o código
              </strong>{" "}
              para realizar a consulta patrimonial
            </h1>
            <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>

            <Alert  className="h-14 p-2 max-w-[500px] flex items-center justify-between">
            <div className="flex items-center gap-2 w-full flex-1">
            <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
            <Input placeholder="Digite o número do patrimônio"  onKeyDown={handleKeyDown} onChange={(e) => handleChange(e.target.value)} value={input}  type="text" className="border-0 w-full flex flex-1 "/>
                </div>
                <div className="w-fit gap-2 flex">
                <Dialog>
                <DialogTrigger>
                <Button variant={'ghost'}  size={'icon'}>
                <Camera  size={16} className="" /> 
                
                  </Button>
                </DialogTrigger>

                <DialogContent >
                <p>{result ? result : "Scanning..."}</p>
        <button onClick={() => setCamera(!camera)}>
          {camera ? "Stop" : "Start"}
        </button>
        <div className="h-fit">
          {camera && <Scanner onDetected={onDetected} />}
        </div>
                </DialogContent>
                </Dialog>
                
                <Button  size={'icon'} onClick={() =>  onClickBuscaPatrimonio()}>
       <Funnel size={16} className="" /> 
       
        </Button>
            </div>
            </Alert>
</div>

{patrimonio.map((props) => {
  return(
    <div className="flex w-full gap-3 flex-1 flex-col">
    <div className="w-[350px] p-4 rounded-md bg-gray-200 dark:bg-zinc-800 border border-neutral-200 dark:border-neutral-800  flex gap-3 items-center">
    <img src={logo_eng} alt="" className="h-20" />
    <div>
   
    </div>
    </div>

    <div className=" flex flex-1">
               
               <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border min-h-[250px]  border-neutral-200 border-r-0 ${qualisColor[props.csv_cod.trim() as keyof typeof qualisColor]} min-h-full relative `}></div>
                
            <Alert className="flex flex-col flex-1 gap-4 rounded-l-none p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {props.bem_cod}-{props.bem_dgv}
              </CardTitle>
              <Barcode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-full">
              <div>
              <div className="text-2xl font-bold">{props.mat_nom}</div>
              <p className="text-xs text-muted-foreground">
                {props.bem_dsc_com} {props.ite_mar !== "" && (`| ${props.ite_mar}`)}
              </p>
              </div>

              <div className="flex mt-8 flex-wrap gap-4">
                <div className="flex gap-2 items-center text-xs font-medium"><User size={12}/>{props.pes_nome}</div>
                <div className="flex gap-2 items-center text-xs font-medium uppercase"><div className={`w-4 h-4 rounded-md ${qualisColor[props.csv_cod.trim() as keyof typeof qualisColor]}`}></div>  {props.csv_cod.trim() == "BM" ? 'Bom': props.csv_cod.trim() == 'AE' ? 'Anti-Econômico': props.csv_cod.trim() == 'IR' ? 'Irrecuperável': props.csv_cod.trim() == 'OC' ? 'Ocioso': props.csv_cod.trim() == 'BX' ? 'Baixado': props.csv_cod.trim() == 'RE' ? 'Recuperável': ''}</div>
                <div className="flex gap-2 items-center text-xs font-medium uppercase">{props.bem_sta.trim() == "NO" ? (<Check size={12}/>):(<X size={12}/>)}{props.bem_sta.trim() == "NO" ? ('Normal'):('Não encontrado no local de guarda')}</div>
                <div className="flex gap-2 items-center text-xs font-medium"><MapPin size={12}/>{props.loc_nom}</div>
              </div>

              
            </CardContent>
            </Alert>
            </div>
</div>
  )
})}


</div>
    </div>
)}
</>
    )
}