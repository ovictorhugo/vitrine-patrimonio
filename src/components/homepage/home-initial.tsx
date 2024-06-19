import { useContext, useState } from "react";
import { useModalHomepage } from "../hooks/use-modal-homepage";

import { UserContext } from "../../context/context";
import fump_bg from '../../assets/fump_bg.png';
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Armchair, ArrowRight, Camera, ChalkboardSimple, ComputerTower, Desktop, DotsThree, Folder, Ladder, Laptop, MagnifyingGlass, Phone, Printer, ProjectorScreen, Scales, Television, Timer, Wrench } from "phosphor-react";

import { TicketCount } from "./donation/ticket-count";
import { Step1 } from "./donation/step-1";
import { Link } from "react-router-dom";
import { ContentFumpistas } from "./content-fumpistas";
import { Fan, Info, User } from "lucide-react";
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
    return(
<>
{isModalOpen && (

<div className=" items-center w-full flex flex-col   max-sm:ml-4">


<div className="bg-cover bg-no-repeat bg-center w-full" >
<div className="justify-center w-full mx-auto flex max-w-[980px] flex-col items-center gap-2 pt-8 md:pt-12  lg:pt-24 pb-4" >
<Link to={''}  className="inline-flex items-center rounded-lg  bg-gray-200 dark:bg-neutral-800  gap-2 mb-3 px-3 py-1 text-sm font-medium"><Info size={12}/><div className="h-full w-[1px] bg-black dark:bg-neutral-300"></div>Saiba como utilizar a plataforma<ArrowRight size={12}/></Link>

  <h1 className="z-[2] text-center max-w-[850px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]  md:block mb-4 ">
    Procure, anuncie e facilite a reutilização de{" "}
    <strong className="bg-[#709CB6]  rounded-md px-3 pb-2 text-white font-medium">
      {" "}
       equipamentos patrimoniais
    </strong>{" "}
  
  </h1>
  <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>


  <Alert  className="h-14 p-2 flex items-center justify-between max-w-[60vw]">
  <div className="flex items-center gap-2 w-full flex-1">
  <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
  </div>
  </Alert>

  </div>
  </div>

  <ScrollArea className="w-[90vw]" >
  <div className="flex gap-8  w-max ">
  {categorias.map((props) => {
    const IconComponent = props.icon;
    return(
      <div className="flex border-b-2 border-b-transparent hover:border-b-neutral-300 cursor-pointer flex-col  py-3 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 justify-center items-center gap-1">
                      <IconComponent size={24} className=" whitespace-nowrap mb-2" />
                      <div className="flex  text-xs font-medium"> {props.name}</div>
                      </div>
    )
  })}
  </div>
  <ScrollBar/>
  </ScrollArea>

  </div>
)}
</>
    )
}