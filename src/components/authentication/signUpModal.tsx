import { useContext, useState } from "react";
import { Input } from "../ui/input"
import { Label } from "../ui/label"

import { Button } from "../ui/button";
import { toast } from "sonner"
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import "firebase/auth";
import { auth } from "../../lib/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs"


import { UserContext } from "../../context/context";
import { User as FirebaseAuthUser} from 'firebase/auth'
import { ArrowRight, GoogleLogo, LinkedinLogo, UserPlus } from "phosphor-react";

interface User extends FirebaseAuthUser {
  photoURL:string
  cpf_aluno: string
  datnsc_aluno:string
  state: string
}

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


export function SignUpModal(props:Props) {
    const backgroundImages = [
     'ewe'
      ];
    
      //background
      const [backgroundImage] = useState<string>(() => {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        return backgroundImages[randomIndex];
      });


      //firebase
      const [name, setName] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const {cpf, setCpf, data, setData} = useContext(UserContext)

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

        const [confPassword, setConfPassword] = useState('');
      const {setLoggedIn} = useContext(UserContext);
      const history = useNavigate();
      const { setUser } = useContext(UserContext);

      const [value, setValue] = useState('account')
      const db = getFirestore();
      const location = useLocation();
      const isDisabled = location.pathname === '/fumpista/signUp';


      const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);

      const handleSignOut = async () => {
   
        try {
          if (password !== confPassword) {
            toast.error("Senhas diferentes", {
              description: "Revise os dados e tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            });
          } else if (password.length == 0) {
            toast.error("Preencha o campo senha", {
              description: "Revise os dados e tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            });
          } else if (confPassword.length == 0) {
            toast.error("Preencha o campo confirmar senha", {
              description: "Revise os dados e tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            });
          } else if (password.length <= 7) {
            toast.error("A senha precisa ter pelo menos 8 caracteres", {
              description: "Revise os dados e tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            });
          } else if (email.length == 0) {
            toast.error("Preencha o campo email", {
              description: "Revise os dados e tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            });
          } else if (name.length == 0) {
            toast.error("Preencha o campo nome", {
              description: "Revise os dados e tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            });
          } else if (data.length == 0) {
            toast.error("Preencha o campo data", {
              description: "Revise os dados e tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            });
          } else if (cpf.length == 0) {
            toast.error("Preencha o campo CPF", {
              description: "Revise os dados e tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            });
          }
          else {
            
            createUserWithEmailAndPassword(email, password)
              .then(async (userCredential) => {
                if (userCredential?.user) {
                  await updateProfile(userCredential.user, { displayName: name });
                  const userData = {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: name,
                    photoURL: userCredential.user.photoURL,
                    cpf_aluno: cpf,
                    datnsc_aluno:data,
                    state: isDisabled ? ('fumpista') : ('doador')// Define o estado padrão como doador
                  };
                  await setDoc(doc(db, 'users', userCredential.user.uid), userData);
                }
              });


              setEmail('')
              setPassword('')
              setConfPassword('')
              setCpf('')
              setData('')
              setName('')
      
              setTimeout(() => {
                history(props.route);
              }, 0);




          }
        } catch (error) {
          console.error('Authentication error:', error);
          toast.error("Erro ao criar conta", {
            description: "Revise os dados e tente novamente",
            action: {
              label: "Fechar",
              onClick: () => console.log("Undo"),
            },
          });
        }
      }
      

      async function handleGoogleSignIn() {
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const db = getFirestore();
          const user = result.user;
          const userDocRef = doc(db, 'users', user.uid);
          const snapshot = await getDoc(userDocRef);
          
          // Estrutura de dados do usuário a ser salvo
          const userData2 = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            cpf_aluno: cpf,
            datnsc_aluno: data,
            state: isDisabled ? 'fumpista' : 'doador', // Estado padrão
          };

          await setDoc(doc(db, 'users', user.uid), userData2);
      
          const userDocRef2 = doc(db, 'users', user.uid);
          const snapshot2 = await getDoc(userDocRef2);

        
          // Verifique se os dados personalizados existem antes de adicionar ao objeto result.user
          if (snapshot2.exists()) {
              
             
            const userData = snapshot2.data();

            const userDataFinal: User = {
              ...result.user,
              photoURL:userData.photoURL || user.photoURL,
              cpf_aluno: userData.cpf_aluno || '',
              datnsc_aluno:userData.datnsc_aluno || '',
              state: userData.state || '',
            };
           
            // Adicione os dados personalizados diretamente ao objeto result.user

            // Atualize o estado com o objeto modificado
            setLoggedIn(true);
            setUser(userDataFinal)
            localStorage.setItem('user', JSON.stringify(userDataFinal));
            
    
          setUser(userDataFinal);
          setLoggedIn(true);
          setTimeout(() => {
            history(props.route);
          }, 0);
        }
      
        } catch (error) {
          console.error('Erro ao fazer login:', error);
          toast("Erro ao fazer login", {
            description: "Revise os dados e tente novamente",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
        }
      }


    return(
       <div className="flex flex-col gap-3">
        <div className="flex gap-3">
        <Button className=" w-full" variant={'outline'} onClick={handleGoogleSignIn} ><GoogleLogo size={16} className="" /> Login com Google</Button>
        <Button className=" w-full" variant={'outline'} ><LinkedinLogo size={16} className="" /> Login com LinkedIn</Button>
        </div>

        <div className="flex items-center gap-3 text-gray-500 my-2">
          <div className="w-full h-[0.5px] bg-gray-500"></div>
          ou
          <div className="w-full h-[0.5px] bg-gray-500"></div>
        </div>

        <Tabs defaultValue="account" value={value} className="">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account" onClick={() => setValue('account')}>Dados do usuário</TabsTrigger>
        <TabsTrigger value="password" onClick={() => setValue('password')}>Informações de acesso</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="flex flex-col gap-3 ">
      <div className="space-y-1 ">
              <Label htmlFor="name">Nome Completo</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} id="name" placeholder="Nome completo" />
            </div>

            <div className="flex gap-3 w-full">
            <div className="space-y-1 w-full">
              <Label htmlFor="username">CPF</Label>
              <Input  disabled={isDisabled} value={cpf} onChange={handleCpfChange}  id="username" placeholder="000.000.000-00" />
            </div>

            <div className="space-y-1 w-full">
              <Label htmlFor="username">Data de nascimento</Label>
              <Input disabled={isDisabled}  value={data} onChange={handleDateChange}  id="username" placeholder="00/00/0000" />
            </div>
            </div>

            <Button className="my-2" onClick={() => setValue('password')}><ArrowRight size={16} /> Continuar</Button>
        </TabsContent>

        <TabsContent value="password" className="flex flex-col gap-3">
        <div className="space-y-1">
              <Label htmlFor="username">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} id="username" placeholder="Email" />
            </div>

           

            <div className="flex gap-3 w-full">
            <div className="space-y-1 w-full">
              <Label htmlFor="current">Senha</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} id="current" type="password" placeholder="Senha" />
            </div>

            <div className="space-y-1 w-full">
              <Label htmlFor="new">Confirmar senha</Label>
              <Input value={confPassword}  onChange={(e) => setConfPassword(e.target.value)} id="new" type="password" placeholder="Confirmar senha" />
            </div>
            
            </div>

            <Button onClick={() => handleSignOut()} className="mt-4 w-full"><UserPlus size={16} className="" />Criar conta</Button>
        </TabsContent>

      </Tabs>
        

           
           
       </div>
    )
}