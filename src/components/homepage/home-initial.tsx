import { useContext, useEffect, useRef, useState } from "react";
import { useModalHomepage } from "../hooks/use-modal-homepage";

import { UserContext } from "../../context/context";
import fump_bg from '../../assets/fump_bg.png';
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Armchair, ArrowRight, Camera, ChalkboardSimple, ComputerTower, Desktop, DotsThree, Folder, Ladder, Laptop, MagnifyingGlass, Phone, Printer, ProjectorScreen, Scales, Television, Timer, Wrench } from "phosphor-react";


import { Link } from "react-router-dom";

import { Fan, Heart, Info, User } from "lucide-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export function HomeInicial() {
    const { isOpen, type, onOpen } = useModalHomepage();

    const [input, setInput] = useState("");
    const isModalOpen = isOpen && type === "initial-home";
    const {loggedIn} = useContext(UserContext)

    const categorias = [
      {
        icon: Desktop,
        value:'monitor-de-video',
        name:'Monitor de Vídeo'
      },
      {
        icon: ComputerTower,
        value:'computador',
        name:'Computador'
      },
      {
        icon: Fan,
        value:'ventilador',
        name:'Ventilador'
      },
      {
        icon: Television,
        value:'televisor',
        name:'Televisor'
      },
      {
        icon: Laptop,
        value:'notebook',
        name:'Notebook'
      },
      {
        icon: Printer,
        value:'impressora',
        name:'Impressora'
      },
      {
        icon: Camera,
        value:'camera',
        name:'Câmera'
      },
      {
        icon: Folder,
        value:'arquivo',
        name:'Arquivo'
      },
      {
        icon: Armchair,
        value:'poltrona',
        name:'Poltrona'
      },
      {
        icon: ProjectorScreen,
        value:'tela-de-projecao',
        name:'Tela de projeção'
      },
      {
        icon: Timer,
        value:'cronometro',
        name:'Cronômetro'
      },
      {
        icon: ChalkboardSimple,
        value:'quadro',
        name:'Quadro'
      },
      {
        icon: Phone,
        value:'telefone',
        name:'Telefone'
      },
      {
        icon: Wrench,
        value:'ferramenta',
        name:'Ferramenta'
      },
      {
        icon: Ladder,
        value:'escada',
        name:'Escada'
      },
      {
        icon: Scales,
        value:'balanca',
        name:'Balança'
      },
      {
        icon: DotsThree,
        value:'outros',
        name:'Outros'
      }
    ]

   
  //stick search
  const [isSticky, setIsSticky] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function handleScrollSearch() {
    const element = ref.current!;
    const { top } = element.getBoundingClientRect();
    if (top <= 70) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScrollSearch);
    return () => {
      window.removeEventListener('scroll', handleScrollSearch);
    };
  }, []);


    return(
<>
{isModalOpen && (

<div className="items-center w-full flex flex-col h-[200vh] max-sm:ml-4">
<div ref={ref} className="bg-cover bg-no-repeat bg-center w-full">
  <div className="justify-center w-full mx-auto flex max-w-[980px] flex-col items-center gap-2 pt-8 md:pt-12 lg:pt-24 pb-4">
    {!isSticky && (
      <>
         <Link to={'/informacoes'}  className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"><Info size={12}/><div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>Saiba como utilizar a plataforma<ArrowRight size={12}/></Link>

        <h1 className="z-[2] text-center max-w-[850px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
          Procure, anuncie e facilite a reutilização de{' '}
          <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
            {' '}
            bens patrimoniais
          </strong>{' '}
        </h1>
        <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>
      </>
    )}

    <Alert className="h-14 p-2 flex items-center justify-between max-w-[60vw]">
      <div className="flex items-center gap-2 w-full flex-1">
        <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />
      </div>
    </Alert>
  </div>
</div>



<div className="w-full grid grid-cols-4 md:px-8 px-4 gap-6">

  <div className="group">
    <div className="w-full object-contain bg-gray-100 aspect-square rounded-md">
      <Button size={'icon'} variant={'ghost'} className="group-hover:flex hidden bg-white/50"><Heart size={16}/></Button>
    </div>
    <div className="mt-2">
      <p className="font-medium">Teste</p>
      <p className="text-sm">Teste</p>
    </div>
  </div>
</div>
</div>
)}
</>
    )
}