import { useModalHomepage } from "../hooks/use-modal-homepage";

import { Link, useLocation,useNavigate } from 'react-router-dom';
import { Alert } from "../ui/alert";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { LogoVitrineWhite } from "../svg/LogoVitrineWhite";
import { SymbolEEWhite } from "../svg/SymbolEEWhite";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Plus, User } from "lucide-react";

interface TotalPatrimonios {
    total_patrimonio:string
    total_patrimonio_morto:string
    unique_values:unique_values
  }
  
  interface unique_values {
    loc_cod:string
    loc_nom:string
    org_nom:string
    org_cod:string
    pes_cod:string
    pes_nome:string
    set_cod:string
    set_nom:string
  }

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

import img15 from "/src/assets/bg_notification.png"
export function Join() {
    const { isOpen, type, onOpen } = useModalHomepage();
    const {urlGeral} = useContext(UserContext)
    //retorna url
    const query = useQuery();
     const navigate = useNavigate();
    const loc_nom = query.get('loc_nom');
    
    const tipo = query.get('tipo');
    const cod = query.get('cod');

  
    const isModalOpen = isOpen && type === "join-sala";

    const [total, setTotal] = useState<TotalPatrimonios[]>([]);

    const urlPatrimonioInsert = `${urlGeral}totalPatrimonio?loc_nom=${loc_nom}`;
console.log(urlPatrimonioInsert)

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(urlPatrimonioInsert , {
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
              setTotal(data)
          }
        } catch (err) {
          console.log(err);
        }
      };
      fetchData()
  
     
    }, [urlPatrimonioInsert]);


    return(
        <>
        {isModalOpen && (
             <main className="flex flex-1 flex-col h-full gap-4 p-4 md:gap-8 md:p-8 items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${img15})` }}>
                <Alert className="max-w-[450px] p-0 ">
                    <Link to={'/'} className="bg-eng-blue cursor-pointer gap-2 h-24 rounded-t-md flex items-center justify-center">
                    <div className="h-6"><SymbolEEWhite/></div> <div className="h-4"><LogoVitrineWhite/></div>
                    </Link>
                    <CardHeader>
                        <CardTitle>Olá,</CardTitle>
                        <CardDescription>A sala {loc_nom} convidou você para participar como {tipo}</CardDescription>
                    </CardHeader>

                    <CardContent>
                       {total.map((props) => (
                        props.unique_values.map((item) => (
                            <Alert className="mb-6 gap-3 flex flex-col">
                            <p className="font-semibold">{item.loc_cod} - {item.loc_nom}</p>

                            <p className="text-xs flex gap-1 mb-2 items-center">
                        <User size={12}/> Responsável: {item.pes_cod} - {item.pes_nome}
                       </p>
                            <Button> <Plus size={16}/>Participar</Button>
                        </Alert>
                        ))
                       ))}

                    <CardDescription>Se você aceitar, seus dados serão compartilhados com os participantes da sala e os sistemas integrados ao Vitrine Patrimônio</CardDescription>
                    </CardContent>
                </Alert>
             </main>
        )}
        </>
    )
}