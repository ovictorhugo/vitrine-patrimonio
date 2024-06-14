import { Link } from "react-router-dom";
import { useModalDashboard } from "../hooks/use-modal-dashboard";

import { LogoUfmg } from "../svg/logo-ufmg";
import { Logo } from "../svg/logo";
import { Navbar } from "./navbar";
import { getAuth, signInWithEmailAndPassword,  updateProfile, GoogleAuthProvider, signInWithPopup, updateEmail, updatePassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
  } from "../ui/dialog";

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
import { ArrowUUpLeft, Check, CoinVertical, Coins, Envelope, Trash, User } from "phosphor-react";

import { useNavigate } from "react-router-dom";

import { useModal } from "../hooks/use-modal-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export function ConfiguracoesDashboard() {
    const { isOpen, type,  } = useModalDashboard();
    const {onOpen, onClose} = useModal()
    const { type: typeModal } = useModal();
    const isModalOpenAtualizarSenha = isOpen && typeModal === 'atualizar-senha';

    const {user, setUser, setLoggedIn} = useContext(UserContext)
    const history = useNavigate();

    const isModalOpen = isOpen && type === "configuracoes";

   const [senha, setSenha] = useState('')
   const [confirmarSenha, setConfirmarSenha] = useState('')
const [passwordAtual, setPasswordAtual] = useState('')

console.log(user)

const handleAtualizarSenha = async () => {
    const auth = getAuth();
  
    // Access the currently signed-in user
    const user = auth.currentUser;
  
    setPersistence(auth, browserLocalPersistence);
  
    if (user) {
      if (senha.length < 8) {
        toast("A senha precisa ter pelo menos 8 caracteres", {
          description: "verifique os campos e tente novamente",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
      } else if (senha !== confirmarSenha) {
        toast("As senhas estão diferentes", {
          description: "verifique os campos e tente novamente",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
      } else {
        try {
          // Reauthenticate the user
          const credential = await signInWithEmailAndPassword(auth, user.email || '', passwordAtual);
  
          // Update the user's password
          await updatePassword(credential.user, senha);
  
          onClose();
  
          toast("Senha alterada", {
            description: "Operação realizada com sucesso",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
        } catch (error) {
          console.error("Erro ao atualizar a senha:", error);
          toast("Erro ao atualizar a senha", {
            description: "Não foi possível atualizar a senha. Verifique suas credenciais e tente novamente.",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
        }
      }
    }
  };

    return(
        <>
        {isModalOpen && (
            < div className="w-full">
            <div className="flex-col min-h-screen">
   
         
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

   <Link to={'/dashboard'}>
   <BreadcrumbItem>
      <BreadcrumbLink >Dashboard</BreadcrumbLink>
    </BreadcrumbItem></Link>

    <BreadcrumbSeparator />
    
    <BreadcrumbItem>
      <BreadcrumbPage>Configurações</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
                   <div className="flex justify-between gap-3 items-center ">
                   <h2 className=" text-3xl font-bold mb-1 max-w-[450px]">Configurações da conta</h2>

                   <div className="flex items-center gap-3">
                  
                  
                    <Button variant={'outline'} className="capitalize"><User/>{user.state}</Button>
                    <div className="w-10 h-10 rounded-md border border-neutral-200 whitespace-nowrap bg-cover bg-center bg-no-repeat " style={{ backgroundImage: `url(${user.photoURL || ''})` }} />
                    <div className="h-6 w-[0.5px] bg-gray-500"></div>
                    <Link to={'/'}><Button><Coins size={16}/>Fazer doação</Button></Link>
                   </div>
                   </div>
                   
                    </div>

                    <div className="">
                    <div className="w-full h-full mt-8 flex relative  flex-1 gap-3">
                        <div className="grid flex-1 grid-rows-2 w-full"></div>
                        <div className="w-[300px] rounded-md bg-zinc-600"></div>
                    </div>
                    </div>

                   {!(user.emailVerified) && (
                    <div>
                         <h2 className="font-medium text-2xl mb-2 mt-6">Alterar senha</h2>

                    <div className="flex gap-3 items-end">

                    <div className="space-y-1 w-full ">
                                <Label htmlFor="username">Nova senha</Label>
                                <Input   value={senha} onChange={(e) => setSenha(e.target.value)}  id="username" placeholder="Nova senha" />
                                </div>

                                <div className="space-y-1 w-full ">
                                <Label htmlFor="username">Confirmar nova senha</Label>
                                <Input   value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)}  id="username" placeholder="Confirmar nova senha" />
                                </div>

                                <Button onClick={() => onOpen('atualizar-senha')} ><Check size={16}/>Atualizar senha</Button>

                    </div>

                    
                    </div>
                   )}

                <p>Provedor: {user.providerData[0].providerId}</p>

                    <Dialog open={isModalOpenAtualizarSenha} onOpenChange={onClose}> 
        <DialogContent className="min-w-[40vw] ">
        <DialogHeader className="pt-8 px-6 ">
                 <DialogTitle className="text-2xl text-center font-medium">
                 Tem certeza que deseja deletar?
                 </DialogTitle>
                 <DialogDescription className="text-center text-zinc-500">
                 Adicione as informações básicas do programa de pós-graduação como o nome, classificação e modalidade.
                 </DialogDescription>
               </DialogHeader>

               <div className="space-y-1 w-full ">
                                <Label htmlFor="username">Senha atual</Label>
                                <Input   value={passwordAtual} onChange={(e) => setPasswordAtual(e.target.value)}  id="username" placeholder="Senha atual" />
                                </div>

               <DialogFooter>
                <Button onClick={() => onClose()} variant={'ghost'}><ArrowUUpLeft size={16} className="" />Cancelar</Button>
                <Button  onClick={() => handleAtualizarSenha()}><Check size={16} className="" />Atualizar senha</Button>
                </DialogFooter>

               </DialogContent>
               
               </Dialog>


                        <div className="flex justify-between items-center w-full">
                            <div>
                            <h2 className="font-medium text-2xl mb-2 mt-6">Deletar conta</h2>
                    <p className="text-gray-500 text-sm mb-6 max-w-[550px]">Esta listagem inclui os estudantes que tiveram vínculo com a Fump até 2012 e possuem valores pendentes.</p>
                            </div>

                            <Button onClick={() => onOpen('delete-account')} variant={'destructive'}><Trash size={16}/>Deletar conta</Button>
                            
                        </div>

                        
                </div>

               

               
            </div>
            </div>
            </div>
        )}
       </>
    )
}