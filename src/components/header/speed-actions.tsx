import { Grip } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Link } from "react-router-dom";

import { SymbolEEWhite } from "../svg/SymbolEEWhite";
import { SymbolEE } from "../svg/SymbolEE";
import { useTheme } from "next-themes";
import { LogoEngWhite } from "../svg/LogoEngWhite";
import { LogoEng } from "../svg/LogoEng";
import { LogoConecteeWhite } from "../svg/LogoConecteeWhite";
import { LogoConectee } from "../svg/LogoConectee";

export function SpeedActions() {
  const { theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="h-full w-full flex items-center justify-center">
                <Grip className="h-4 w-4" />
                <span className="sr-only">Ações rápidas</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ações rápidas</p>
            </TooltipContent>
          </Tooltip>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="grid gap-3 grid-cols-3">
          <Link to="https://eng.ufmg.br/" target="_blank">
            <DropdownMenuItem className="flex flex-col justify-center px-2 py-4 cursor-pointer">
              <div className="h-8 mb-4">
                {theme === "dark" ? <LogoEngWhite /> : <LogoEng />}
              </div>
              <div className="flex text-xs font-medium max-w-[70px] truncate text-center">
                Escola de Engenharia
              </div>
            </DropdownMenuItem>
          </Link>

          <Link to="https://patrimonio.eng.ufmg.br/" target="_blank">
            <DropdownMenuItem className="flex flex-col justify-center px-2 py-4 cursor-pointer">
              <div className="h-8 mb-4">
                {theme === "dark" ? <SymbolEEWhite /> : <SymbolEE />}
              </div>
              <div className="flex text-xs font-medium max-w-[70px] truncate text-center">
                Sistema Patrimônio
              </div>
            </DropdownMenuItem>
          </Link>

          <Link to="https://conectee.eng.ufmg.br/" target="_blank">
            <DropdownMenuItem className="flex flex-col justify-center px-2 py-4 cursor-pointer">
              <div className="h-8 mb-4">
                {theme === "dark" ? <LogoConecteeWhite /> : <LogoConectee />}
              </div>
              <div className="flex text-xs font-medium max-w-[70px] truncate text-center">
                Conectee
              </div>
            </DropdownMenuItem>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
