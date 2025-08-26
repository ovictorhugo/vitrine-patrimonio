import React, { useState, useEffect, useContext } from 'react';
import { useTheme } from 'next-themes';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/context';

import { SymbolEEWhite } from './svg/SymbolEEWhite';
import { LogoVitrineWhite } from './svg/LogoVitrineWhite';
import { SymbolEE } from './svg/SymbolEE';
import { LogoVitrine } from './svg/LogoVitrine';


interface LoadingWrapperProps {
  children: React.ReactNode;
}

interface JwtPayload {
  exp: number;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const {
    setLoggedIn,
    setUser,
    setPermission,
    setRole,
urlGeral
  } = useContext(UserContext);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt_token");


  useEffect(() => {
 
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleLogout = async () => {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("permission");
      localStorage.removeItem("role");

      setLoggedIn(false);
      setUser({} as any);
      setPermission([]);
      setRole('');

      await delay(1000);
      setLoading(false);
    
    };

    const fetchUser = async (token: string) => {
      try {
        const response = await fetch(`${urlGeral}users/my`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
console.log('OIIIIIIIIIIIIIIIIIII')
        const data = await response.json();
console.log('dataaaaaaaaaaaaa', data)
        if (data) {
          const user = data;
          user.roles = user.roles || [];

          setLoggedIn(true);
          setUser(user);

          const storedPermission = localStorage.getItem('permission');
          const storedRole = localStorage.getItem('role');

          if (storedPermission) setPermission(JSON.parse(storedPermission));
          if (storedRole) setRole(JSON.parse(storedRole));

          await delay(1000); // Garante pelo menos 1 segundo de loading
         setLoading(false);
          console.log('DEU CERTOOOO')
        } else {
        await handleLogout();
       setLoading(false);
          console.error("Erro ao buscar dados do usuário:");
        }
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err);
      await handleLogout();
       setLoading(false);
      }
    };

    if (token) {
      console.log('[LoadingWrapper] token ok');
      try {
        const decoded = jwtDecode<JwtPayload & { exp?: number }>(token);
        console.log('[LoadingWrapper] decoded', decoded);
        const now = Date.now() / 1000;
        if (!decoded.exp || decoded.exp > now) {
          console.log('[LoadingWrapper] token válido, chamando fetchUser');
          fetchUser(token);
        } else {
          console.warn('[LoadingWrapper] token expirado');
          handleLogout();
         setLoading(false);
        }
      } catch (err) {
        console.error('[LoadingWrapper] decode falhou', err);
      handleLogout();
      setLoading(false);
      }
    } else {
      console.warn('[LoadingWrapper] token ausente');
     handleLogout();
     setLoading(false);
    }
  }, [token]);

  return loading ? (
    <main className="h-screen w-full flex items-center justify-center">
      <div className=" animate-pulse">
         {theme == 'dark' ? (
           <div className="flex items-center gap-2">
           <div className=" h-16 flex items-center gap-2"><SymbolEEWhite/></div>
           <div className="h-10 flex items-center gap-2"><LogoVitrineWhite /></div>
           </div>
         ):(
          <div className="flex items-center gap-2">
          <div className="h-16 flex items-center gap-2"><SymbolEE/></div>
          <div className=" h-10 flex items-center gap-2"><LogoVitrine /></div>
          </div>
         )}
     
      </div>
    </main>
  ) : (
    <>{children}</>
  );
};

export default LoadingWrapper;
