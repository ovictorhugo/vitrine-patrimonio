import { useContext, useMemo, useState } from "react";
import { useModalHomepage } from "../hooks/use-modal-homepage";

import { UserContext } from "../../context/context";
import fump_bg from '../../assets/fump_bg.png';
import logo_eng from '../../assets/logo_eng.png';
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowRight, Camera, Funnel, Info, MagnifyingGlass } from "phosphor-react";

import { Link } from "react-router-dom";



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

export function BuscaPatrimonio() {
    const { isOpen, type, onOpen } = useModalHomepage();

    const [input, setInput] = useState("");
    const isModalOpen = isOpen && type === "busca-patrimonio";
    const {loggedIn} = useContext(UserContext)

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

      let urlPatrimonio = ''

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
         
          }
        } catch (err) {
          console.log(err);
        }
      };

      useMemo(() => {
      fetchData();
    }, [ urlPatrimonio]);

    return(
<>
{isModalOpen && (

<div className="  justify-center  items-center w-full flex flex-col   max-sm:ml-4">

<div className="bg-cover bg-no-repeat px-8 bg-center w-full flex gap-3 items-center" >
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
            <Input onChange={(e) => handleChange(e.target.value)} value={input}  type="text" className="border-0 w-full flex flex-1 "/>
                </div>
                <div className="w-fit gap-2 flex">

                <Button variant={'ghost'}  size={'icon'}>
       <Camera  size={16} className="" /> 
       
        </Button>
                <Button  size={'icon'}>
       <Funnel size={16} className="" /> 
       
        </Button>
            </div>
            </Alert>
</div>

{patrimonio.map((props) => {
  return(
    <div className="flex w-full gap-3 flex-1 flex-col">
    <div className="w-[350px] p-4 rounded-md bg-gray-200  flex gap-3 items-center">
    <img src={logo_eng} alt="" className="h-20" />
    </div>

    <div className="flex items-center">
               
               <div
            className={` bg-[#719CB8] flex h-full w-2 min-w-2 rounded-l-md dark:border-neutral-800 border whitespace-nowrap border-neutral-200 border-r-0 `}
          >  
                </div>
            <Alert className="flex flex-1 gap-4 rounded-l-none">
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