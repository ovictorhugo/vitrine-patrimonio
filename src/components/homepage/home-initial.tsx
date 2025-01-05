import { useContext, useEffect, useRef, useState } from "react";
import { useModalHomepage } from "../hooks/use-modal-homepage";

import { UserContext } from "../../context/context";
import fump_bg from '../../assets/fump_bg.png';
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Armchair, ArrowRight, Camera, ChalkboardSimple, ComputerTower, Desktop, DotsThree, Folder, Ladder, Laptop, MagnifyingGlass, Phone, Printer, ProjectorScreen, Scales, Television, Timer, Wrench } from "phosphor-react";
interface Item {
  codigo_atm: string
  condicao: string
  desfazimento: boolean
  email: string
  imagens: string[]
  loc: string
  material: string
  matricula: string
  num_patrimonio:number
  num_verificacao:number
  observacao: string
  patrimonio_id: string
  phone: string
  situacao: string
  u_matricula: string
  user_id: string
  verificado: boolean,
  vitrine:boolean
  mat_nom:string
}

import { Link } from "react-router-dom";

import { Fan, Heart, Info, User } from "lucide-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { ItemPatrimonio } from "./components/item-patrimonio";

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

 ///////////////////////
 const {user, urlGeral, defaultLayout} = useContext(UserContext)
          const [bens, setBens] = useState<Item[]>([]); 
          const [loading, isLoading] = useState(false)
         
          let urlBens = urlGeral +`formulario?user_id=&loc=&verificado=true`

          useEffect(() => {
            const fetchData = async () => {
                try {
                  isLoading(true)
                  const response = await fetch(urlBens, {
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
                    setBens(data);
                    isLoading(false)
                  } 
                  
              } catch (err) {
                console.log(err);
              }
            }

              fetchData();
            }, [urlBens])

    return(


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



<div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
    {bens.map((item) => {
  return (
    <ItemPatrimonio
      codigo_atm={item.codigo_atm}
      condicao={item.condicao}
      desfazimento={item.desfazimento}
      email={item.email}
      imagens={item.imagens}
      loc={item.loc}
      material={item.material}
      matricula={item.matricula}
      num_patrimonio={item.num_patrimonio}
      num_verificacao={item.num_verificacao}
      observacao={item.observacao}
      patrimonio_id={item.patrimonio_id}
      phone={item.phone}
      situacao={item.situacao}
      u_matricula={item.u_matricula}
      user_id={item.user_id}
      verificado={item.verificado}
      vitrine={item.vitrine}
      mat_nom={item.mat_nom}
    />
  );
})}
    </div>
</div>

    )
}