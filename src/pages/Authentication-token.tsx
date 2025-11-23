import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useContext, useEffect } from "react";
import { UserContext } from "../context/context";
import { useQuery } from "../components/modal/search-modal-patrimonio";

import { SymbolEEWhite } from "../components/svg/SymbolEEWhite";
import { LogoVitrineWhite } from "../components/svg/LogoVitrineWhite";
import { SymbolEE } from "../components/svg/SymbolEE";
import { LogoVitrine } from "../components/svg/LogoVitrine";

export function AuthenticationToken() {
  const { theme } = useTheme();
  const queryUrl = useQuery();
  const token = queryUrl.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    // 1) salva token
    localStorage.setItem("jwt_token", token);

    // 2) dispara evento custom (A) pra mesma aba reagir
    window.dispatchEvent(new Event("token-change"));

    // 3) remove o param correto da URL (opcional)
    // dependendo do seu useQuery, isso só mexe no objeto.
    // então fazemos um replace real:
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url.toString());

    // 4) navega sem reload
    navigate("/", { replace: true });
  }, [token, navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Link to={"/"} className="mb-24 absolute top-16">
        {theme === "dark" ? (
          <div className="flex items-center gap-2">
            <div className="h-12 flex items-center gap-2">
              <SymbolEEWhite />
            </div>
            <div className="h-8 flex items-center gap-2">
              <LogoVitrineWhite />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-12 flex items-center gap-2">
              <SymbolEE />
            </div>
            <div className="h-8 flex items-center gap-2">
              <LogoVitrine />
            </div>
          </div>
        )}
      </Link>

      <div className="w-full flex flex-col items-center justify-center">
        <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
          {`U_U`}
        </p>
        <h1 className="text-2xl text-neutral-400 font-medium leading-tight text-center px-8 tracking-tighter lg:leading-[1.1]">
          Carregando autenticação...
        </h1>
      </div>
    </div>
  );
}
