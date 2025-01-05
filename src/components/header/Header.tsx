import { Link, useLocation } from "react-router-dom";


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


  
import { CaretLeft, ChartLine, Funnel, Gear, GraduationCap, GridFour, ListDashes, MagnifyingGlass, SignIn, Textbox, UserPlus } from "phosphor-react";
import { DotSquare, GitBranch, Grip, Laptop, LayoutDashboard, LogIn, Moon, Search, Sun, User } from "lucide-react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { UserConfigHeader } from "./user-config-header";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

import { useTheme } from "next-themes"

import { useModalHomepage } from "../hooks/use-modal-homepage";
import { LogoVitrineWhite } from "../svg/LogoVitrineWhite";
import { LogoVitrine } from "../svg/LogoVitrine";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";
import { SymbolEE } from "../svg/SymbolEE";
import { useModal } from "../hooks/use-modal-store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function Header() {
  const {loggedIn, user, permission} = useContext(UserContext)

  const { theme, setTheme } = useTheme()
  const { onOpen } = useModalHomepage();
  const { onOpen:onOpenModal } = useModal();
  const location = useLocation();
  const [versao, setVersao] = React.useState(true)
  
  const posGraduation = location.pathname == '/pos-graduacao'

  const handleClick = () => {
    onOpen('initial-home')
   
  }
  const [isVisible, setIsVisible] = React.useState(false);
  const SCROLL_THRESHOLD = 10; // Altura em pixels em que o elemento deve aparecer

  React.useEffect(() => {
   
      if (window.scrollY > SCROLL_THRESHOLD) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

    
  }, []);
  

    return(
        <header className={`h-[50px]  z-[3] flex justify-between border-b border-neutral-200 dark:border-neutral-800 px-4   items-center sticky top-0 `}>
            <div className="  flex items-center h-12 gap-4">
            <div className="flex gap-3 items-center h-full justify-center ">
            <Link to={"/"} className="h-[14px]  " onClick={() => handleClick()} >{(theme ==  'dark' ) ? (<LogoVitrineWhite />):(<LogoVitrine />)}</Link>

            <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>

            <Link to={""} target="_blank" className=" whitespace-nowrap "><img src={(theme ==  'dark' ) ? (logo_4_white):(logo_4)} alt="" className="whitespace-nowrap flex flex-1 h-[26px]" /></Link>

            
            </div>

            

          
            </div>
            
            <div>
            

            </div>


            <div className="flex gap-2 items-center justify-center">

         


        <div onClick={() => onOpenModal('search')} className="flex  h-8 border border-neutral-200 dark:border-neutral-800 px-1 bg-white dark:bg-neutral-950 rounded-md items-center">
          <MagnifyingGlass size={16} className="w-8" />
          <Input className="border-0 h-full flex flex-1 dark:bg-transparent" placeholder="Buscar patrimônio..." />
<p className="bg-neutral-100 rounded-md text-[10px] mr-1  dark:bg-neutral-800 h-6 flex items-center justify-center px-2">Ctrl + Q</p>
          <Button  className={` h-6 w-6  text-white border-0 `} size={'icon'}>
       <Funnel size={10} className="" /> 
       
        </Button>
        </div>
  

{!loggedIn && (
  <Link to={'/signIn'}>
  <Button variant="ghost" size="sm" >
                  <LogIn className="h-4 w-4" />
                  Fazer login
                </Button></Link>
)}


{!loggedIn && (
 <Link to={'/signUp'}>
 <Button  size="sm" >
                 <UserPlus className="h-4 w-4" />
                 Criar conta
               </Button></Link>
)}  

{(loggedIn && permission.length > 0) && (
  <Link to={'/dashboard'}>
  <Button variant="ghost" size="sm" className="h-10" >
                  <LayoutDashboard className="h-4 w-4" />
                  Console
                </Button></Link>
)}
             


                <DropdownMenu>
      <DropdownMenuTrigger asChild>

      <Button variant="ghost" size="icon" >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Menu de ações rápidas</span>
              </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="flex items-center gap-3" onClick={() => setTheme("light")}>
        <Sun className="h-4 w-4" /> Modo Claro
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-3" onClick={() => setTheme("dark")}>
        <Moon className="h-4 w-4" />   Modo Escuro
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-3" onClick={() => setTheme("system")}>
        <Laptop className="h-4 w-4" />  Padrão do sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" >
                <Grip className="h-4 w-4" />
                <span className="sr-only">Menu de ações rápidas</span>
              </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" >
        <div className="grid gap-3 grid-cols-3">
        <Link to={'/'}>
        <DropdownMenuItem className="flex flex-col justify-center px-2 py-4 cursor-pointer">
                      <div className="h-8 mb-4"><SymbolEE/></div>
                      <div className="flex  text-xs font-medium max-w-[70px] truncate  text-center"> Vitrine Patrimônio</div>
                      </DropdownMenuItem></Link>

                      <Link to={'/'}>
        <DropdownMenuItem className="flex flex-col justify-center px-2 py-4 cursor-pointer">
                      <div className="h-8 mb-4"><SymbolEE/></div>
                      <div className="flex  text-xs font-medium max-w-[70px]  truncate text-center"> ConectEE</div>
                      </DropdownMenuItem></Link>

                      <Link to={'/'}>
        <DropdownMenuItem className="flex flex-col justify-center px-2 py-4 cursor-pointer">
                      <div className="h-8 mb-4"><SymbolEE/></div>
                      <div className="flex  text-xs font-medium max-w-[70px]  truncate text-center"> CEGRADEE</div>
                      </DropdownMenuItem></Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
    

    {loggedIn && (
  
  <TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
    <Button  onClick={() => onOpenModal('minha-area')}  variant={'ghost'} className="px-2" >
    <CaretLeft size={16}/>
    <Avatar className="cursor-pointer rounded-md  h-6 w-6">
      <AvatarImage  className={'rounded-md h-6 w-6'} src={`${user?.photo_url}`} />
      <AvatarFallback className="flex items-center justify-center"><User size={16}/></AvatarFallback>
  </Avatar>
      </Button>
    </TooltipTrigger>
    <TooltipContent> Minha área</TooltipContent>
  </Tooltip>
  </TooltipProvider>
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