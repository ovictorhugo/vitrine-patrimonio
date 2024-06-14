import { useContext, useState } from "react";
import { useModalHomepage } from "../hooks/use-modal-homepage";

import { UserContext } from "../../context/context";
import fump_bg from '../../assets/fump_bg.png';
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowRight, MagnifyingGlass } from "phosphor-react";

import { TicketCount } from "./donation/ticket-count";
import { Step1 } from "./donation/step-1";
import { Link } from "react-router-dom";
import { ContentFumpistas } from "./content-fumpistas";
import { Info, User } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

export function HomeInicial() {
    const { isOpen, type, onOpen } = useModalHomepage();

    const [input, setInput] = useState("");
    const isModalOpen = isOpen && type === "initial-home";
    const {loggedIn} = useContext(UserContext)
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

  <ScrollArea>
  <div className="flex gap-4  w-max">
  <div className="flex border-b-2 border-b-transparent hover:border-b-neutral-300 cursor-pointer flex-col  py-4 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 justify-center items-center gap-1">
                      <User size={24} className=" whitespace-nowrap mb-2" />
                      <div className="flex  text-xs font-medium"> pesquisadores</div>
                      </div>
  </div>
  </ScrollArea>

  </div>
)}
</>
    )
}