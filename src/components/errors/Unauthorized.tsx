import { useTheme } from "next-themes";
import { LogoConectee } from "../svg/LogoConectee";
import { LogoConecteeWhite } from "../svg/LogoConecteeWhite";
import { useContext, useEffect, useState } from "react";
import bg_popup from '../../assets/bg_404.png';
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/context";

import { Button } from "../ui/button";
import { Home, Undo2 } from "lucide-react";
import { SymbolEEWhite } from "../svg/SymbolEEWhite";
import { LogoVitrineWhite } from "../svg/LogoVitrineWhite";
import { SymbolEE } from "../svg/SymbolEE";
import { LogoVitrine } from "../svg/LogoVitrine";

export function Unauthorized() {
    const { theme } = useTheme()
    const [clientId, setClientId] = useState<string | null>(null);
    const [provider, setProvider] = useState<string | null>(null);

    useEffect(() => {
        const url = new URL(window.location.href);
        const pathname = url.pathname.split('/');
        
        // Supondo que o ID do cliente seja o segundo segmento do caminho da URL
        const id = pathname[1] || null;
        setClientId(id);

        // Supondo que o provedor seja o hostname do URL
        const providerName = url.hostname;
        setProvider(providerName);
    }, []);

     const history = useNavigate();
        
          const handleVoltar = () => {
            history(-1);
          }

    return(
        <div style={{ backgroundImage: `url(${bg_popup})` }} className="h-screen bg-cover bg-no-repeat bg-center w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
                        <Link to={'/'} className='h-10 mb-24 absolute top-16 '>
          {theme == 'dark' ? (
                                                 <div className="flex items-center gap-2">
                                                 <div className=" h-8 flex items-center gap-2"><SymbolEEWhite/></div>
                                                 <div className="h-6 flex items-center gap-2"><LogoVitrineWhite /></div>
                                                 </div>
                                               ):(
                                                <div className="flex items-center gap-2">
                                                <div className="h-8 flex items-center gap-2"><SymbolEE/></div>
                                                <div className=" h-6 flex items-center gap-2"><LogoVitrine /></div>
                                                </div>
                                               )}
        </Link>
        <div className="w-full flex flex-col items-center justify-center">
                <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">{`(¬_¬")`}</p>
                <h1 className=" text-2xl md:text-4xl text-center text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">Você não tem permissão para acessar essa página</h1>
               
                <p className="font-medium text-sm mt-2">
                  Código do erro: 500
                </p>

                <p className="font-medium text-sm">
                Servidor: {provider}
                </p>

                <p className="font-medium text-sm ">
                  Caminho da URL: {clientId}
                </p>

                <div className="flex gap-3 mt-8">
                <Button  onClick={() => handleVoltar()} variant={'ghost'}><Undo2 size={16}/> Voltar</Button>
                 <Link to={'/'}> <Button><Home size={16}/> Página Inicial</Button></Link>

                </div>
              </div>
     
        </div>
    )
}