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
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { CoinVertical, Coins, Envelope, User, Users } from "phosphor-react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Alert } from "../ui/alert";

type UserEmail = {
  id: string;
  email: string;
  name:string
  state:string
};

export function GerenciarUsuarios() {
    const { isOpen, type, onOpen } = useModalDashboard();
    const {user} = useContext(UserContext)


    const isModalOpen = isOpen && type === 'gerenciar-usuarios';
    const db = getFirestore();

    const [emails, setEmails] = useState<UserEmail[]>([]);

    useEffect(() => {
      const fetchEmails = async () => {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const emailsData = querySnapshot.docs.map(doc => ({
          id: doc.data().uid,
          email: doc.data().email,
          name:doc.data().displayName,
          state:doc.data().state
  
        }));
             // Filtrar os emails com state 'fumpista' ou 'doador'
      const filteredEmails = emailsData.filter(
        email => email.state === 'fumpista' || email.state === 'doador'
      );
      
      setEmails(filteredEmails);

      };
  
      fetchEmails();
    }, []);

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
         
            <div className=" relative mx-16 flex min-h-screen">
                <Navbar/>
                <div className="h-full w-full pt-20">
                    <div className=" relative">
                    <Breadcrumb className="mb-4">
  <BreadcrumbList>
    <Link to={'/'}>
    <BreadcrumbItem>
      <BreadcrumbLink>Página Inicial</BreadcrumbLink>
    </BreadcrumbItem></Link>

    

    {user.state == 'fumpista' && (
    
    <BreadcrumbSeparator />
 
    )}

    {user.state == 'fumpista' && (
    
    <BreadcrumbItem>
      <BreadcrumbLink >Fumpista</BreadcrumbLink>
    </BreadcrumbItem>
 
    )}

<BreadcrumbSeparator />

    <Link to={'/admin'}>
    <BreadcrumbItem>
      <BreadcrumbLink >Administrativo</BreadcrumbLink>
    </BreadcrumbItem></Link>
    
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Gerenciar usuários</BreadcrumbPage>
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

                    <div className="mb-4 flex gap-3">
                      <Alert className="flex flex-1"></Alert>
                    <Alert className="h-full ml-auto  transition-all flex flex-col justify-between w-fit">
          <h3 className="text-7xl font-bold ml-auto">{emails.length}</h3>
          <div className="flex justify-between gap-8 items-center">
            <div className="flex p-2 bg-gray-200 dark:bg-neutral-600 items-center h-8 w-8 rounded-lg">
              <Users size={16}/>
            </div>
            <p className="text-right">Total de usuários</p>
          </div>
        </Alert>

                    </div>

                    <h2 className="font-medium text-2xl mb-6 mt-6">Gerenciar usuários</h2>

                    <div>
                    <DataTable columns={columns} data={emails} />
                    </div>
                    
                </div>
               
            </div>
            </div>
            </div>
        )}
       </>
    )
}