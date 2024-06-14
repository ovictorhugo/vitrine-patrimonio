import { useContext, useState } from "react";
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "../ui/card"
import { Button } from "../ui/button";
import { signInWithEmailAndPassword} from 'firebase/auth';
import "firebase/auth";
import { auth } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs"
import { toast } from "sonner"

import { User as FirebaseAuthUser} from 'firebase/auth'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { UserContext } from "../../context/context";
interface User extends FirebaseAuthUser {
  photoURL:string
  cpf_aluno: string
  datnsc_aluno:string
  state: string
  }

  interface Props {
    route:string
  }
  


  import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { GoogleLogo, LinkedinLogo, SignIn } from "phosphor-react";

export function SignInModal(props:Props) {

    const backgroundImages = [
     'ewe'
      ];
    
      //background
      const [backgroundImage] = useState<string>(() => {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        return backgroundImages[randomIndex];
      });


      //firebase
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const {setLoggedIn} = useContext(UserContext);
      const history = useNavigate();
      const { setUser, user } = useContext(UserContext);

      const handleLogin = async () => {
        try {
         if(email.length != 0 && password.length != 0 && password.length >= 7 ) {
          const result = await signInWithEmailAndPassword(auth, email, password);
          
      
         

           // Recupere dados personalizados do usuário no Firestore
            const db = getFirestore();
            const userDocRef = doc(db, 'users', String(result.user.uid));
            const snapshot = await getDoc(userDocRef);
            

            // Verifique se os dados personalizados existem antes de adicionar ao objeto result.user
            if (snapshot.exists()) {
              
              setLoggedIn(true);
              const userData = snapshot.data();

              const userDataFinal: User = {
                ...result.user,
                photoURL:userData.photoURL || user.photoURL,
                cpf_aluno: userData.cpf_aluno || '',
                datnsc_aluno:userData.datnsc_aluno || '',
                state: userData.state || '',
              };
             
              // Adicione os dados personalizados diretamente ao objeto result.user

              // Atualize o estado com o objeto modificado
              setUser(userDataFinal)
              localStorage.setItem('user', JSON.stringify(userDataFinal));
            }

             // Save user information to local storage
          
    
      
          setTimeout(() => {
            if(user.state =='admin') {
              history('/admin');
            } else {
              history('/');
            }
          }, 0);
         }
        } catch (error) {
          console.error('Authentication error:', error);
          toast("Erro ao fazer login", {
            description: "Revise os dados e tente novamente",
            action: {
              label: "Fechar",
              onClick: () => console.log("Undo"),
            },
          })
        }
      };

      function handleGoogleSignIn() {
        const provider = new GoogleAuthProvider();
    
        signInWithPopup(auth, provider)
          .then(async(result) => {
            const db = getFirestore();
            const userDataUpdate = {

              photoURL: result.user.photoURL

            };

            await updateDoc(doc(db, 'users', result.user.uid), userDataUpdate);
            
            
            const userDocRef = doc(db, 'users', String(result.user.uid));
            const snapshot = await getDoc(userDocRef);
            const userData: User = {
              ...result.user,
              photoURL:'',
              cpf_aluno: '',
              datnsc_aluno:'',
              state:'',
            };

            // Verifique se os dados personalizados existem antes de adicionar ao objeto result.user
            if (snapshot.exists()) {
              
             
              const userData = snapshot.data();

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
          } else {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setLoggedIn(true);
            setTimeout(() => {
              history(props.route);
            }, 0);
          }

          
           
          })
          .catch((error) => {
            console.log(error)
            toast("Erro ao fazer login", {
              description: "Revise os dados e tente novamente",
              action: {
                label: "Fechar",
                onClick: () => console.log("Undo"),
              },
            })
          })
      }

      const [value, setValue] = useState('account')

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

        <div className="space-y-1">
              <Label htmlFor="username">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} id="username" placeholder="Email" />
            </div>

            <div className="space-y-1 w-full">
              <Label htmlFor="current">Senha</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} id="current" type="password" placeholder="Senha" />
            </div>

            <Button onClick={handleLogin} className="w-full mt-2"><SignIn size={16} className="" />Fazer login</Button>
         
        </div>
        
    )
}