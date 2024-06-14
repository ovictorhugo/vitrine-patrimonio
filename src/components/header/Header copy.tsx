import { Link, useLocation } from "react-router-dom";
import { LogoSimcc } from "../svg/LogoSimcc";
import { Separator } from "../ui/separator";
import { useContext} from "react";

import { cn } from "../../lib"
import * as React from "react"



import logo_4 from '../../assets/logo_4.png';
import logo_4_white from '../../assets/logo_4_white.png';

import logo_1 from '../../assets/logo_1.png';
import logo_1_white from '../../assets/logo_1_white.png';

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
  } from "../../components/ui/navigation-menu"

  
import { ChartLine, Gear, GraduationCap, GridFour, ListDashes, SignIn, Textbox, UserPlus } from "phosphor-react";
import { GitBranch } from "lucide-react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { UserConfigHeader } from "./user-config-header";

import { useTheme } from "next-themes"
import { LogoWhite } from "../svg/LogoWhite";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { LogoConecteeWhite } from "../svg/LogoConecteeWhite";
import { LogoConectee } from "../svg/LogoConectee";

export function Header() {
  const {loggedIn, user, setItensSelecionados} = useContext(UserContext)

  const { theme } = useTheme()
  const { onOpen } = useModalHomepage();
  const location = useLocation();
  const [versao, setVersao] = React.useState(true)
  
  const posGraduation = location.pathname == '/pos-graduacao'

  const handleClick = () => {
    onOpen('initial-home')
    setItensSelecionados([])
  }

    return(
        <header className={`h-20 z-[3] flex justify-between  items-center mr-[72px] sticky top-0  ${posGraduation == true ? ('bg-transparent'):('dark:bg-neutral-900 bg-gray-100')}`}>
            <div className="  flex items-center h-12 gap-4">
            <div className="flex gap-3 items-center h-full justify-center ">
            {versao ? (
              <Link to={"/"} className="h-[24px]  " onClick={() => handleClick()} >{(theme ==  'dark' ) ? (<LogoConecteeWhite />):(<LogoConectee />)}</Link>
            ): (
              <Link to={"/"} className="h-[24px]  " onClick={() => handleClick()} >{(theme ==  'dark' ) ? (<LogoWhite />):(<LogoSimcc />)}</Link>
            )}

            <div className="h-6 w-[1px] bg-gray-500"></div>

            {versao ? (
              <Link to={""} target="_blank" className=" whitespace-nowrap "><img src={(theme ==  'dark' ) ? (logo_4_white):(logo_4)} alt="" className="whitespace-nowrap flex flex-1 h-[24px]" /></Link>
            ): (
              <Link to={""} target="_blank" className=" whitespace-nowrap "><img src={(theme ==  'dark' ) ? (logo_4_white):(logo_4)} alt="" className="whitespace-nowrap flex flex-1 h-[24px]" /></Link>
            )}

            
            </div>

            <NavigationMenu className="xl:flex hidden">
                <NavigationMenuList>
                <NavigationMenuItem>
                <Link to="/indicadores" >
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    <ChartLine size={16} className="" /> Indicadores
                    </NavigationMenuLink>
                </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
          <NavigationMenuTrigger><ListDashes size={16} />Explorar</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <div
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                 
                  >
                  <ListDashes size={24} />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Explorar
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Conheça a plataforma e tudo que ela tem a oferecer
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
              <ListItem href="/dicionario" title="Dicionário">
                Veja todos os termos disponíveis na plataforma
              </ListItem>
              <ListItem href="/docs/installation" title="Revistas">
               Listagem das revistas com o Qualis e JCR
              </ListItem>
              <ListItem href="/novas-publicacoes" title="O que há de novo?">
                Veja os artigos mais recentes nas publicações dos pesquisdores
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger><GraduationCap size={16} /> Pós-graduação</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <div
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  
                  >
                  <GraduationCap size={24} />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Pós-graduação
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Selecione um programa de pós e tenha uma visão dos docentes e produções
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
             <Link to={'/pos-graduacao'}>
             <ListItem title="Explorar">
                Veja todos os programas 
              </ListItem>
             </Link>
              <ListItem href="indicadores-pos-graduacao" title="Indicadores">
                Painel de indicadores das pós-graduações
              </ListItem>
              
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

                <NavigationMenuItem>
          <NavigationMenuTrigger> <Textbox size={16} className="" /> Baremas</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <div
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  
                  >
                  <GraduationCap size={24} />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Baremas de avaliação
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Selecione um programa de pós e tenha uma visão dos docentes e produções
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
              <Link to="/meus-baremas" >
             <ListItem title="Meus baremas">
                Veja todos as consultas salvas
              </ListItem>
             </Link>
             <Link to="/barema" >
             <ListItem title="Criar barema">
                Crie ou avalie pesquisadores para editais e ranqueamento 
              </ListItem>
             </Link>

             <Link to="/procurar-barema" >
             <ListItem title="Procurar barema">
                Tem um código para acesso dos resultados? Veja o resultado final aqui
              </ListItem>
             </Link>
              
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

                
                </NavigationMenuList>
            </NavigationMenu>
            </div>

            <div className="flex gap-2 items-center justify-center">
              {!loggedIn && (
                <Link to={'/signUp'}><Button variant={'outline'}><UserPlus size={16} className="" />Criar conta</Button></Link>
              )}

            {!loggedIn && (
                <Link to={'/signIn'}><Button variant={'default'} className="text-white h-10 dark:text-white"><SignIn size={16} className="" />Fazer login</Button></Link>
            )}

{(user.state === 'master') && (
                <Link to={'/config'}><Button variant={'outline'} size={'icon'} className="text-gray-500 border-0 dark:text-white"><Gear size={16} className="" /></Button></Link>
              )}

{(user.state === "admin" || user.state === 'colaborator' || user.state === 'master') && (
                <Link to={'/admin'}><Button variant={'outline'} className="text-gray-500 border-0 dark:text-white"><GridFour size={16} className="" />Módulo administrativo</Button></Link>
              )}

         

            </div>

        </header>
    )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"