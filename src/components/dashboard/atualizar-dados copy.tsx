import { Link } from "react-router-dom";
import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { LogoUfmg } from "../svg/logo-ufmg";
import { Logo } from "../svg/logo";
import { Navbar } from "./navbar";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "../../components/ui/breadcrumb"
import { useContext } from "react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { CoinVertical, Coins, Envelope, User } from "phosphor-react";

export function AtualizarDados() {
    const { isOpen, type, onOpen } = useModalDashboard();
    const {user} = useContext(UserContext)


    const isModalOpen = isOpen && type === "atualizar-dados";


    return(
        <>
        {isModalOpen && (
            < div className="w-full">
            <div className="flex-col min-h-screen">
             <div className="h-20 flex items-center absolute px-16 gap-4 z-[2] w-fit top-0 left-0">
             <Link to={'/'} className="h-6">
                 <Logo/>
             </Link>

             <div className="h-6 w-[1px] bg-gray-500"></div>
             <div className="h-6">
                 <LogoUfmg/>
             </div>
         </div>
         
            <div className=" relative mx-16 flex h-screen">
                <Navbar/>
                <div className="h-full w-full pt-20">
                    <div className=" relative">
                    <Breadcrumb className="mb-4">
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Página Inicial</BreadcrumbLink>
    </BreadcrumbItem>

    

    {user.state == 'fumpista' && (
    
    <BreadcrumbSeparator />
 
    )}
    {user.state == 'fumpista' && (
    
    <BreadcrumbItem>
      <BreadcrumbLink >Fumpista</BreadcrumbLink>
    </BreadcrumbItem>
 
    )}
    
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Dashboard</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
                   <div className="flex justify-between gap-3 items-center ">
                   <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Bem vindo(a) ao seu dashboard</h2>

                   <div className="flex items-center gap-3">
                  
                  
                    <Button variant={'outline'} className="capitalize"><User/>{user.state}</Button>
                    <div className="w-10 h-10 rounded-md border border-neutral-200 whitespace-nowrap bg-cover bg-center bg-no-repeat " style={{ backgroundImage: `url(${user.photoURL || ''})` }} />
                    <div className="h-6 w-[0.5px] bg-gray-500"></div>
                    <Link to={'/'}><Button><Coins/>Fazer doação</Button></Link>
                   </div>
                   </div>
                   
                    </div>

                    <div className="">
                    <div className="w-full h-full mt-8 flex relative  flex-1 gap-3">
                        <div className="grid flex-1 grid-rows-2 w-full"></div>
                        <div className="w-[300px] rounded-md bg-zinc-600"></div>
                    </div>
                    </div>
                    
                </div>
               
            </div>
            </div>
            </div>
        )}
       </>
    )
}