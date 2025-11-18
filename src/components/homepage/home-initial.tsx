import { useContext, useEffect, useRef, useState } from "react";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { motion } from "motion/react";
import { UserContext } from "../../context/context";
import fump_bg from '../../assets/fump_bg.png';
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Armchair, ArrowRight, Camera, ChalkboardSimple, ComputerTower, Desktop, DotsThree, Folder, Ladder, Laptop, MagnifyingGlass, Phone, Printer, ProjectorScreen, Scales, Television, Timer, Wrench } from "phosphor-react";

import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Fan, Heart, Info, Package, RefreshCcw, Trash, User, WalletCards } from "lucide-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { ItemPatrimonio } from "./components/item-patrimonio";
import { Search } from "../search/search";

import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { AuroraBackground } from "../ui/aurora-background";
import { toast } from "sonner";
import { BlockItemsVitrine } from "./components/block-items-vitrine";

import { useTheme } from "next-themes";
import { useModal } from "../hooks/use-modal-store";
import { BackgroundAvatarGrid } from "../ui/background-ripple-effect";
import { BackgroundLines } from "../ui/background-lines";
import { useQuery } from "../authentication/signIn";

type Material = {
  material_code: string;
  material_name: string;
  id: string;
};

type MaterialsResponse = {
  materials: Material[];
};

export function HomeInicial() {
 const [words, setWords] = useState<MaterialsResponse | null>(null);
const { urlGeral } = useContext(UserContext);

let urlPalavrasChaves = `${urlGeral}catalog/search/materials?workflow_status=VITRINE`;


useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(urlPalavrasChaves, {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: MaterialsResponse = await response.json();
      console.log("URL:", urlPalavrasChaves);
      console.log("DATA:", data);

      // agora salva o objeto inteiro
      if (data && Array.isArray(data.materials)) {
        setWords(data);
      }
    } catch (err) {
      console.error("Erro ao buscar palavras-chave:", err);
    }
  };

  fetchData();
}, []);



const setParamOrDelete = (sp: URLSearchParams, key: string, val?: string) => {
  if (val && val.trim().length > 0) sp.set(key, val);
  else sp.delete(key);
};

const location = useLocation();
const navigate = useNavigate();
const queryUrl = useQuery();

function handlePesquisaChange(material: Material) {
  // Clona os params atuais da URL
  const params = new URLSearchParams(queryUrl.toString());

  // Atualiza ou remove o parâmetro usando seu helper
  setParamOrDelete(params, "material_ids", material.id);

  // Navega para a mesma rota com os novos parâmetros
  navigate({
    pathname: location.pathname,
    search: `?${params.toString()}`,
  });


}
const {onOpen} = useModal()
const {theme} = useTheme()

    return( 
      <div className="    ">
      <Helmet>
      <title>{`Página Inicial | Sistema Patrimônio`}</title>
      <meta name="description" content={`Página Inicial | Sistema Patrimônio`} />
      <meta name="robots" content="index, follow" />
    </Helmet>
     <div className="absolute top-0 left-0 flex min-h-screen w-full z-[0] ">
    {/* ocupa 100% da largura do pai, altura 320px, quadrados de 48px */}

     
    </div>
    <div className="bg-cover   bg-no-repeat bg-center w-full" >

        <div className="justify-center  px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20" >
          <Link to={'/informacoes'} className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"><Info size={12} /><div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>Saiba o que é e como utilizar a plataforma<ArrowRight size={12} /></Link>

          <h1 className="z-[2] text-center max-w-[900px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
  Encontre, disponibilize e contribua para a reutilização de <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">bens patrimoniais</strong>
</h1>  
          <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>

          <div className="lg:max-w-[60vw] lg:w-[60vw] w-full">
            <Search />
          </div>

         <div className="hidden md:flex flex-wrap gap-3 z-[2] w-full lg:w-[60vw]">
  {(words?.materials ?? []).slice(0, 10).map((material, index) => (
    <div
      key={material.id ?? index}
      className={`flex gap-2 capitalize h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs`}
      onClick={() => {
        handlePesquisaChange(material);
      }}
    >
      {material.material_name}
    </div>
  ))}
</div>

          <div className="flex md:hiddeen justify-center md:hidden flex-wrap gap-3 z-[3] w-full lg:hidden">
            {(words?.materials ?? []).slice(0, 10).map((material, index) => (
    <div
      key={material.id ?? index}
      className={`flex gap-2 capitalize h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs`}
      onClick={() => {
        handlePesquisaChange(material);
      }}
    >
      {material.material_name}
    </div>
  ))}
          </div>
        </div>

        
      </div>

      <div className=" w-full md:px-8 gap-8 flex flex-col px-4 mb-4 md:mb-8">
<BlockItemsVitrine workflow="VITRINE"/>
      </div>
</div>

    )
}