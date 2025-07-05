import { Link, useNavigate } from "react-router-dom";
import { LogoConecteeWhite } from "../components/svg/LogoConecteeWhite";
import { LogoConectee } from "../components/svg/LogoConectee";

import { useTheme } from "next-themes";
import { useContext, useEffect } from "react";
import { UserContext } from "../context/context";
import { useQuery } from "../components/modal/search-modal-patrimonio";
import { SymbolEEWhite } from "../components/svg/SymbolEEWhite";
import { LogoVitrineWhite } from "../components/svg/LogoVitrineWhite";
import { SymbolEE } from "../components/svg/SymbolEE";
import { LogoVitrine } from "../components/svg/LogoVitrine";

export function AuthenticationToken() {
      const { urlGeral, setLoggedIn} = useContext(UserContext);
      const { theme } = useTheme();

      const queryUrl = useQuery();
      const token = queryUrl.get('token');
const navigate = useNavigate()
console.log(token)
  useEffect(() => {
      if (token) {
        localStorage.setItem('jwt_token', token);
      
        // (Opcional) Remove o token da URL, por segurança/estética
        queryUrl.delete('jwt_token');

        console.log('[Auth] Token salvo:', localStorage.getItem('jwt_token'));
        // Aguarda 100ms para garantir persistência
setTimeout(() => {
  window.location.href = '/';
}, 200);
      }


    }, [token]);



    return(
          <div className="h-screen w-full flex items-center justify-center">
              <Link to={'/'} className=' mb-24 absolute top-16 '>
                {theme == 'dark' ? (
                          <div className="flex items-center gap-2">
                          <div className=" h-12 flex items-center gap-2"><SymbolEEWhite/></div>
                          <div className="h-8 flex items-center gap-2"><LogoVitrineWhite /></div>
                          </div>
                        ):(
                         <div className="flex items-center gap-2">
                         <div className="h-12 flex items-center gap-2"><SymbolEE/></div>
                         <div className=" h-8 flex items-center gap-2"><LogoVitrine /></div>
                         </div>
                        )}
              </Link>
        
              <div className="w-full flex flex-col items-center justify-center">
                <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">{`U_U`}</p>
                <h1 className="text-2xl text-neutral-400 font-medium leading-tight text-center px-8 tracking-tighter lg:leading-[1.1]">
                  Carregando autenticação...
                </h1>
                <h1 className="text-2xl text-neutral-400 font-medium leading-tight text-center px-8 tracking-tighter lg:leading-[1.1]">
                
                </h1>
              </div>
            </div>
    )
}