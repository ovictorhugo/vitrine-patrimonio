import { Link } from "react-router-dom";
import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { LogoUfmg } from "../svg/logo-ufmg";
import { Logo } from "../svg/logo";
import { Navbar } from "./navbar";
import bg2 from '../../assets/bg_atualizar_dados.png';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "../../components/ui/breadcrumb"
import { useContext, useState } from "react";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { CoinVertical, Coins, Envelope, User } from "phosphor-react";
import { Alert } from "../ui/alert";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

function formatarCPF(cpf:any) {
    // Remove caracteres não numéricos e limita a 11 caracteres
    cpf = cpf.replace(/\D/g, '').slice(0, 11);
  
    // Formata o CPF conforme os padrões brasileiros
    return cpf
      .replace(/(\d{3})(\d)/, '$1.$2') // Insere ponto após os 3 primeiros dígitos
      .replace(/(\d{3})(\d)/, '$1.$2') // Insere ponto após os próximos 3 dígitos
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Insere traço após os últimos 3 dígitos
  }
  
  interface Props {
    route:string
  }

export function AtualizarDados() {
    const { isOpen, type, onOpen } = useModalDashboard();
    const {user} = useContext(UserContext)


    const isModalOpen = isOpen && type === "atualizar-dados";

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [matricula, setMatricula] = useState('');
    const [telCel, setTelCel] = useState('');
        const [namePai, setNamePai] = useState('');
        const [nameMaw, setNameMae] = useState('');
        const [dataPai, setDataPai] = useState('');
        const [dataMae, setDataMae] = useState('');
        const [data, setData] = useState('');

        const handleDateChange = (e:any) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
            if (value.length > 8) value = value.slice(0, 8); // Limit to 8 digits
        
            const day = value.slice(0, 2);
            const month = value.slice(2, 4);
            const year = value.slice(4, 8);
        
            let formattedValue = day;
            if (month) formattedValue += '/' + month;
            if (year) formattedValue += '/' + year;
        
            setData(formattedValue);
          };
  
          const handleCpfChange = (event:any) => {
            const inputCpf = event.target.value;
            setCpf(formatarCPF(inputCpf));
          };


    return(
        <>
        {isModalOpen && (
            < div className="w-full">
            <div className="flex-col min-h-screen">
             
         
            <div className=" relative mx-16 flex min-h-screen">
                <Navbar/>
                <div className="h-full w-full pt-20 pb-16">
                    <div className=" relative">
                    <Breadcrumb className="mb-4">
  <BreadcrumbList>
    <BreadcrumbItem>
    <Link to={'/'}><BreadcrumbLink >Página inicial</BreadcrumbLink></Link>
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
      <Link to={'/dashboard'}><BreadcrumbLink >Dashboard</BreadcrumbLink></Link>
    </BreadcrumbItem>

    <BreadcrumbSeparator />

    <BreadcrumbItem>
      <BreadcrumbPage>Atualizar cadastro</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
                   <div className="flex justify-between gap-3 items-center ">
                   <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Atualizar dados do cadastro</h2>

                   <div className="flex items-center gap-3">
                  
                  
                    <Button variant={'outline'} className="capitalize"><User/>{user.state}</Button>
                    <div className="w-10 h-10 rounded-md border border-neutral-200 whitespace-nowrap bg-cover bg-center bg-no-repeat " style={{ backgroundImage: `url(${user.photoURL || ''})` }} />
                    <div className="h-6 w-[0.5px] bg-gray-500"></div>
                    <Link to={'/'}><Button><Coins/>Fazer doação</Button></Link>
                   </div>
                   </div>
                   
                    </div>

                    <div className="">
                    <div className="w-full mb-3 p-6 bg-gray-100 border-neutral-200 border rounded-md h-64 mt-8 bg-cover bg-center bg-no-repeat flex  flex-col justify-center" style={{ backgroundImage: `url(${bg2})` }}>
                    <h2 className="  text-2xl font-medium mb-1 max-w-[450px]">Atualizar dados do cadastro</h2>
                    <p className="text-gray-500 text-sm max-w-[550px]">Esta listagem inclui os estudantes que tiveram vínculo com a Fump até 2012 e possuem valores pendentes.</p>
                    </div>

                    <div className="w-full flex mb-3">
                        <div className=" dark:border-neutral-800 border border-r-0 border-neutral-200 w-2 rounded-l-md bg-[#00A19B] whitespace-nowrap"></div>

                        <Alert  className="rounded-l-none ">
                        <div className="flex items-center gap-3 mb-4">
                        <User size={20} />
                            <p className="text-sm font-bold">Informações pessoais</p>
                            </div>

                            <div className="space-y-1 w-full mb-3">
                                <Label htmlFor="username">Nome completo</Label>
                                <Input   value={cpf} onChange={(e) => setName(e.target.value)}  id="username" placeholder="Nome completo" />
                                </div>

                            <div className="flex gap-3 mb-3">
                            <div className="space-y-1 w-full">
                                <Label htmlFor="username">Data de nascimento</Label>
                                <Input  disabled={true}  value={data} onChange={handleDateChange}  id="username" placeholder="00/00/0000" />
                                </div>

                            <div className="space-y-1 w-full">
                                <Label htmlFor="username">Matrícula</Label>
                                <Input  disabled={true} value={matricula} onChange={(e) => setMatricula(e.target.value)}   id="username" placeholder="000.000.000-00" />
                                </div>

                                

                                <div className="space-y-1 w-full">
                                    <Label htmlFor="username">CPF</Label>
                                    <Input  disabled={true} value={cpf} onChange={handleCpfChange}  id="username" placeholder="000.000.000-00" />
                                    </div>
                            </div>

                            <div className="flex gap-3 mb-3">
                            <div className="space-y-1 w-full">
                                    <Label htmlFor="username">Email</Label>
                                    <Input   value={email} onChange={(e) => setEmail(e.target.value)}   id="username" placeholder="Email" />
                                    </div>

                                    <div className="space-y-1 w-full">
                                    <Label htmlFor="username">Telefone</Label>
                                    <Input   value={telCel} onChange={(e) => setTelCel(e.target.value)}   id="username" placeholder="(00) 0 0000-0000" />
                                    </div>
                            </div>
                        </Alert>
                    </div>

                    <div className="w-full flex mb-3">
                        <div className=" dark:border-neutral-800 border border-r-0 border-neutral-200 w-2 rounded-l-md bg-[#00A19B] whitespace-nowrap"></div>

                        <Alert  className="rounded-l-none ">
                        <div className="flex items-center gap-3 mb-4">
                        <User size={20} />
                            <p className="text-sm font-bold">Informações pessoais</p>
                            </div>

                            <div className="space-y-1 w-full mb-3">
                                <Label htmlFor="username">Nome completo</Label>
                                <Input   value={cpf} onChange={(e) => setName(e.target.value)}  id="username" placeholder="Nome completo" />
                                </div>

                            <div className="flex gap-3 mb-3">
                            <div className="space-y-1 w-full">
                                <Label htmlFor="username">Data de nascimento</Label>
                                <Input  disabled={true}  value={data} onChange={handleDateChange}  id="username" placeholder="00/00/0000" />
                                </div>

                            <div className="space-y-1 w-full">
                                <Label htmlFor="username">Matrícula</Label>
                                <Input  disabled={true} value={matricula} onChange={(e) => setMatricula(e.target.value)}   id="username" placeholder="000.000.000-00" />
                                </div>

                                

                                <div className="space-y-1 w-full">
                                    <Label htmlFor="username">CPF</Label>
                                    <Input  disabled={true} value={cpf} onChange={handleCpfChange}  id="username" placeholder="000.000.000-00" />
                                    </div>
                            </div>

                            <div className="flex gap-3 mb-3">
                            <div className="space-y-1 w-full">
                                    <Label htmlFor="username">Email</Label>
                                    <Input   value={email} onChange={(e) => setEmail(e.target.value)}   id="username" placeholder="Email" />
                                    </div>

                                    <div className="space-y-1 w-full">
                                    <Label htmlFor="username">Telefone</Label>
                                    <Input   value={telCel} onChange={(e) => setTelCel(e.target.value)}   id="username" placeholder="(00) 0 0000-0000" />
                                    </div>
                            </div>
                        </Alert>
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